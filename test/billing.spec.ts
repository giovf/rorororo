import { env, SELF } from 'cloudflare:test';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ErrorEnvelope, SuccessEnvelope } from '../src/lib/envelope';
import { bearer, issueKey } from './helpers/auth';

const WEBHOOK_URL = 'https://example.com/v1/billing/webhook';
const WEBHOOK_SECRET = 'whsec_testsecret'; // must match vitest.config bindings

async function signedHeaders(payload: string): Promise<HeadersInit> {
  const timestamp = Math.floor(Date.now() / 1000);
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(WEBHOOK_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const mac = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(`${timestamp}.${payload}`),
  );
  const v1 = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, '0')).join('');
  return { 'stripe-signature': `t=${timestamp},v1=${v1}`, 'content-type': 'application/json' };
}

async function postWebhook(event: Record<string, unknown>): Promise<Response> {
  const payload = JSON.stringify(event);
  return SELF.fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: await signedHeaders(payload),
    body: payload,
  });
}

function checkoutCompletedEvent(keyId: string): Record<string, unknown> {
  return {
    id: 'evt_checkout_1',
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_1',
        customer: 'cus_1',
        client_reference_id: keyId,
        metadata: { keyId, plan: 'starter' },
      },
    },
  };
}

function invoicePaidEvent(keyId: string, eventId = 'evt_invoice_1'): Record<string, unknown> {
  return {
    id: eventId,
    type: 'invoice.paid',
    data: {
      object: {
        id: 'in_1',
        customer: 'cus_1',
        parent: { subscription_details: { metadata: { keyId, plan: 'starter' } } },
      },
    },
  };
}

/** Stub Stripe's REST API (prices.list + checkout.sessions.create). */
function stubStripeApi(): ReturnType<typeof vi.fn> {
  const mock = vi.fn((input: RequestInfo | URL) => {
    const url = String(input instanceof Request ? input.url : input);
    if (!url.startsWith('https://api.stripe.com/')) {
      throw new Error(`unexpected outbound fetch in test: ${url}`);
    }
    if (url.includes('/v1/prices')) {
      return Promise.resolve(
        Response.json({ object: 'list', data: [{ id: 'price_starter', object: 'price' }] }),
      );
    }
    if (url.includes('/v1/checkout/sessions')) {
      return Promise.resolve(
        Response.json({
          id: 'cs_test_1',
          object: 'checkout.session',
          url: 'https://checkout.stripe.com/c/pay/cs_test_1',
        }),
      );
    }
    throw new Error(`unstubbed stripe endpoint: ${url}`);
  });
  vi.stubGlobal('fetch', mock);
  return mock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('POST /v1/billing/webhook', () => {
  it('rejects bad signatures without touching the database', async () => {
    const payload = JSON.stringify(checkoutCompletedEvent('key-x'));
    const res = await SELF.fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'stripe-signature': 't=1,v1=deadbeef', 'content-type': 'application/json' },
      body: payload,
    });
    expect(res.status).toBe(400);
    const customers = await env.DB.prepare('SELECT COUNT(*) AS n FROM stripe_customers').first<{
      n: number;
    }>();
    expect(customers?.n).toBe(0);
  });

  it('links customer and plan on checkout.session.completed', async () => {
    const { id, key } = await issueKey();
    const res = await postWebhook(checkoutCompletedEvent(id));
    expect(res.status).toBe(200);

    const link = await env.DB.prepare(
      'SELECT key_id, plan, status FROM stripe_customers WHERE stripe_customer_id = ?1',
    )
      .bind('cus_1')
      .first();
    expect(link).toMatchObject({ key_id: id, plan: 'starter', status: 'active' });

    // KV key record was invalidated → next authed call sees the new plan.
    const usage = (await (
      await SELF.fetch('https://example.com/v1/usage', { headers: bearer(key) })
    ).json()) as SuccessEnvelope<{ plan: string }>;
    expect(usage.data.plan).toBe('starter');
  });

  it('grants credits exactly once per invoice event (idempotent replays)', async () => {
    const { id, key } = await issueKey();
    await postWebhook(checkoutCompletedEvent(id));

    expect((await postWebhook(invoicePaidEvent(id))).status).toBe(200);
    expect((await postWebhook(invoicePaidEvent(id))).status).toBe(200); // replay

    const grants = await env.DB.prepare(
      "SELECT COUNT(*) AS n, SUM(delta) AS total FROM credit_ledger WHERE stripe_ref = 'evt_invoice_1'",
    ).first<{ n: number; total: number }>();
    expect(grants).toMatchObject({ n: 1, total: 5000 });

    const usage = (await (
      await SELF.fetch('https://example.com/v1/usage', { headers: bearer(key) })
    ).json()) as SuccessEnvelope<{ granted: number }>;
    expect(usage.data.granted).toBe(5250); // 250 free + 5000 starter

    // A different invoice id (renewal) grants again.
    await postWebhook(invoicePaidEvent(id, 'evt_invoice_2'));
    const usage2 = (await (
      await SELF.fetch('https://example.com/v1/usage', { headers: bearer(key) })
    ).json()) as SuccessEnvelope<{ granted: number }>;
    expect(usage2.data.granted).toBe(10250);
  });

  it('downgrades to free on customer.subscription.deleted', async () => {
    const { id, key } = await issueKey();
    await postWebhook(checkoutCompletedEvent(id));

    const res = await postWebhook({
      id: 'evt_sub_del_1',
      type: 'customer.subscription.deleted',
      data: { object: { id: 'sub_1', customer: 'cus_1', status: 'canceled', items: { data: [] } } },
    });
    expect(res.status).toBe(200);

    const usage = (await (
      await SELF.fetch('https://example.com/v1/usage', { headers: bearer(key) })
    ).json()) as SuccessEnvelope<{ plan: string }>;
    expect(usage.data.plan).toBe('free');
  });

  it('acknowledges unhandled event types', async () => {
    const res = await postWebhook({ id: 'evt_x', type: 'charge.refunded', data: { object: {} } });
    expect(res.status).toBe(200);
  });
});

describe('POST /v1/billing/checkout', () => {
  it('creates a checkout session for a known plan', async () => {
    const { key } = await issueKey();
    stubStripeApi();
    const res = await SELF.fetch('https://example.com/v1/billing/checkout', {
      method: 'POST',
      headers: { ...bearer(key), 'content-type': 'application/json' },
      body: JSON.stringify({ plan: 'starter' }),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as SuccessEnvelope<{ url: string; plan: string }>;
    expect(body.data.url).toContain('checkout.stripe.com');
  });

  it('rejects unknown plans', async () => {
    const { key } = await issueKey();
    const res = await SELF.fetch('https://example.com/v1/billing/checkout', {
      method: 'POST',
      headers: { ...bearer(key), 'content-type': 'application/json' },
      body: JSON.stringify({ plan: 'platinum' }),
    });
    expect(res.status).toBe(400);
  });

  it('requires auth', async () => {
    const res = await SELF.fetch('https://example.com/v1/billing/checkout', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ plan: 'starter' }),
    });
    expect(res.status).toBe(401);
  });
});

describe('GET /v1/billing/portal', () => {
  it('404s when the key has no billing account', async () => {
    const { key } = await issueKey();
    const res = await SELF.fetch('https://example.com/v1/billing/portal', {
      headers: bearer(key),
    });
    expect(res.status).toBe(404);
    const body = (await res.json()) as ErrorEnvelope;
    expect(body.error.message).toContain('purchase a plan first');
  });
});
