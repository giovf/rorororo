import { Hono } from 'hono';
import { requireApiKey } from '../auth/middleware';
import { stripeClient, webhookCryptoProvider } from '../billing/client';
import { isPaidPlan, PAID_PLANS } from '../billing/plans';
import { handleStripeEvent } from '../billing/webhook';
import { API_BASE_URL } from '../lib/constants';
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
    // Object.hasOwn (via isPaidPlan) so a value like 'toString' can't resolve an
    // inherited Object.prototype member and slip past the unknown-plan guard.
    if (!isPaidPlan(plan)) {
      return c.json(
        failure('bad_request', `Unknown plan; choose one of: ${Object.keys(PAID_PLANS).join(', ')}`),
        400,
      );
    }
    const planDef = PAID_PLANS[plan]!;

    const keyCtx = c.get('keyCtx')!;
    const prices = await stripe.prices.list({ lookup_keys: [planDef.lookupKey], limit: 1 });
    const price = prices.data[0];
    if (!price) {
      return c.json(
        failure('unavailable', 'Plan price missing in Stripe — run scripts/stripe-setup.mjs'),
        503,
      );
    }

    const metadata = { keyId: keyCtx.keyId, plan };
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: price.id, quantity: 1 }],
      client_reference_id: keyCtx.keyId,
      metadata,
      subscription_data: { metadata },
      success_url: `${API_BASE_URL}/?checkout=success`,
      cancel_url: `${API_BASE_URL}/?checkout=cancelled`,
    });
    return c.json(success({ url: session.url, plan }));
  })
  .get('/portal', requireApiKey(), async (c) => {
    const stripe = stripeClient(c.env);
    if (!stripe) return c.json(NOT_CONFIGURED, 503);

    const keyCtx = c.get('keyCtx')!;
    const row = await c.env.DB.prepare(
      'SELECT stripe_customer_id FROM stripe_customers WHERE key_id = ?1',
    )
      .bind(keyCtx.keyId)
      .first<{ stripe_customer_id: string }>();
    if (!row) {
      return c.json(failure('not_found', 'No billing account for this key — purchase a plan first'), 404);
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer: row.stripe_customer_id,
      return_url: API_BASE_URL,
    });
    return c.json(success({ url: portal.url }));
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
