import { Hono } from 'hono';
import { requireApiKey } from '../auth/middleware';
import { createCheckoutUrl, createPortalUrl } from '../billing/checkout';
import { stripeClient, webhookCryptoProvider } from '../billing/client';
import { handleStripeEvent } from '../billing/webhook';
import { failure, success } from '../lib/envelope';
import type { AppEnv } from '../types';

const NOT_CONFIGURED = failure(
  'unavailable',
  'Billing is not configured yet (Stripe keys missing)',
);

export const billingRoutes = new Hono<AppEnv>()
  .post('/checkout', requireApiKey(), async (c) => {
    const stripe = stripeClient(c.env);
    if (!stripe) return c.json(NOT_CONFIGURED, 503);

    const body = (await c.req.json().catch(() => ({}))) as { plan?: unknown };
    const plan = typeof body.plan === 'string' ? body.plan : '';
    const keyCtx = c.get('keyCtx')!;
    const result = await createCheckoutUrl(stripe, {
      accountId: keyCtx.accountId,
      email: keyCtx.usageSubject,
      plan,
    });
    if (!result.ok) return c.json(failure(result.code, result.message), result.status);
    return c.json(success({ url: result.url, plan }));
  })
  .get('/portal', requireApiKey(), async (c) => {
    const stripe = stripeClient(c.env);
    if (!stripe) return c.json(NOT_CONFIGURED, 503);

    const keyCtx = c.get('keyCtx')!;
    const result = await createPortalUrl(stripe, c.env, keyCtx.accountId);
    if (!result.ok) return c.json(failure(result.code, result.message), result.status);
    return c.json(success({ url: result.url }));
  })
  // Called by Stripe, not users: signature is the auth. Raw body must be read
  // before any parsing or verification fails.
  .post('/webhook', async (c) => {
    const stripe = stripeClient(c.env);
    if (!stripe || !c.env.STRIPE_WEBHOOK_SECRET) return c.json(NOT_CONFIGURED, 503);

    const signature = c.req.header('stripe-signature');
    if (!signature) return c.json(failure('bad_request', 'Missing stripe-signature header'), 400);

    const rawBody = await c.req.text();
    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        rawBody,
        signature,
        c.env.STRIPE_WEBHOOK_SECRET,
        undefined,
        webhookCryptoProvider,
      );
    } catch {
      return c.json(failure('bad_request', 'Invalid webhook signature'), 400);
    }

    // Processing errors bubble to a 500 so Stripe retries; the ledger's
    // unique stripe_ref makes those retries safe.
    await handleStripeEvent(c.env, event);
    return c.json(success({ received: true }));
  });
