import { describe, expect, it } from 'vitest';
import { apply, dayOf, emptyDay, parseEvent, payhip, sha256, summarise, verified, type PayhipBindings } from './payhip';

/** A KV namespace in memory: get, put and a prefix list are all the receiver uses. */
function fakeKv(): KVNamespace & { store: Map<string, string> } {
  const store = new Map<string, string>();
  const kv = {
    store,
    get: (key: string) => Promise.resolve(store.get(key) ?? null),
    put: (key: string, value: string) => {
      store.set(key, value);
      return Promise.resolve();
    },
    list: (opts: { prefix?: string }) =>
      Promise.resolve({
        keys: [...store.keys()].filter((k) => k.startsWith(opts.prefix ?? '')).map((name) => ({ name })),
        list_complete: true,
        cacheStatus: null,
      }),
  };
  return kv as unknown as KVNamespace & { store: Map<string, string> };
}

const API_KEY = 'test-api-key';

async function paid(id: string, extra: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
  return {
    id,
    email: 'buyer@example.com',
    currency: 'GBP',
    price: 699,
    vat_applied: true,
    ip_address: '203.0.113.9',
    items: [{ product_id: '1', product_name: 'UK Sole Trader Tax Workbook 2026/27', product_key: 'AbCd', quantity: '1' }],
    payment_type: 'card',
    stripe_fee: 30,
    payhip_fee: 35,
    date: 1_793_300_000, // 2026-10-29 UTC
    type: 'paid',
    signature: await sha256(API_KEY),
    ...extra,
  };
}

async function post(env: PayhipBindings, body: unknown): Promise<Response> {
  return await payhip.request('/', { method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json' } }, env);
}

async function summary(env: PayhipBindings, to = '2026-10-30'): Promise<Record<string, unknown>> {
  const res = await payhip.request(`/summary?to=${to}`, {}, env);
  expect(res.status).toBe(200);
  return await res.json<Record<string, unknown>>();
}

describe('payhip webhook', () => {
  it('answers 503 and stores nothing while the API key is not configured', async () => {
    const env: PayhipBindings = { OPS_KV: fakeKv() };
    const res = await post(env, await paid('a1'));
    expect(res.status).toBe(503);
    expect((env.OPS_KV as ReturnType<typeof fakeKv>).store.size).toBe(0);
  });

  it('rejects a body whose signature is not sha256 of the API key', async () => {
    const env: PayhipBindings = { OPS_KV: fakeKv(), PAYHIP_API_KEY: API_KEY };
    const res = await post(env, await paid('a1', { signature: 'nope' }));
    expect(res.status).toBe(401);
    expect(await verified(await paid('x'), 'another-key')).toBe(false);
    expect(await verified(await paid('x'), API_KEY)).toBe(true);
  });

  it('counts a paid event once, by day, without keeping the buyer', async () => {
    const kv = fakeKv();
    const env: PayhipBindings = { OPS_KV: kv, PAYHIP_API_KEY: API_KEY };
    expect((await post(env, await paid('a1'))).status).toBe(200);
    const dup = await (await post(env, await paid('a1'))).json();
    expect(dup).toMatchObject({ ok: true, duplicate: true });
    const day = JSON.parse(kv.store.get('payhip:day:2026-10-29') ?? '{}') as Record<string, unknown>;
    expect(day).toMatchObject({ paid: 1, gross_pence: 699, fees_pence: 65, currency: 'GBP', products: { AbCd: 1 } });
    for (const v of kv.store.values()) {
      expect(v).not.toContain('buyer@example.com');
      expect(v).not.toContain('203.0.113.9');
    }
  });

  it('adds a refund to the refunded day and nets it off in the summary', async () => {
    const env: PayhipBindings = { OPS_KV: fakeKv(), PAYHIP_API_KEY: API_KEY };
    await post(env, await paid('a1'));
    await post(env, await paid('a2', { date: 1_793_386_400 })); // 2026-10-30
    const refund = await paid('a1', { type: 'refunded', amount_refunded: 699, date_created: 1_793_300_000, date_refunded: 1_793_386_400 });
    expect((await post(env, refund)).status).toBe(200);
    const s = await summary(env);
    expect(s).toMatchObject({ sales: 2, refunds: 1, gross_pence: 1398, fees_pence: 130, refunded_pence: 699, net_pence: 569, currency: 'GBP' });
    expect((s.days as { date: string }[]).map((d) => d.date)).toEqual(['2026-10-29', '2026-10-30']);
  });

  it('ignores subscription events and rejects a body that is not an event', async () => {
    const env: PayhipBindings = { OPS_KV: fakeKv(), PAYHIP_API_KEY: API_KEY };
    const sub = await paid('s1', { type: 'subscription.created' });
    expect(await (await post(env, sub)).json()).toMatchObject({ ok: true, ignored: 'subscription.created' });
    const res = await post(env, { signature: await sha256(API_KEY), hello: 'world' });
    expect(res.status).toBe(400);
    expect(parseEvent({ id: 1, type: 'paid' })).toBeNull();
    expect(parseEvent({ id: 'x', type: 'paid', price: '900', currency: 'eur' })).toMatchObject({ price: 900, currency: 'EUR' });
  });

  it('summarises only the window, oldest day first', () => {
    const d = apply(emptyDay(), parseEvent({ id: 'x', type: 'paid', price: 699, stripe_fee: 30, payhip_fee: 35 })!);
    const s = summarise({ '2026-09-01': d, '2026-10-05': d, '2026-10-29': d }, '2026-10-29');
    expect(s.from).toBe('2026-09-30');
    expect(s.sales).toBe(2);
    expect(s.days.map((x) => x.date)).toEqual(['2026-10-05', '2026-10-29']);
    expect(dayOf(1_793_300_000)).toBe('2026-10-29');
    expect(dayOf(null, Date.UTC(2026, 10, 2, 3))).toBe('2026-11-02');
  });
});
