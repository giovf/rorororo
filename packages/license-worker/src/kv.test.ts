import { describe, expect, it } from 'vitest';
import { adaptKV, type KVNamespaceBinding } from './kv.js';
import { createHandler, type Env } from './worker.js';

/** Cloudflare's `list` shape: an options object in, `{ keys: [{ name }], list_complete, cursor }` out, paged. */
function fakeBinding(entries: Record<string, string>, pageSize = 2): KVNamespaceBinding & { calls: unknown[] } {
  const map = new Map(Object.entries(entries));
  const calls: unknown[] = [];
  const get = ((key: string, type?: 'arrayBuffer') => Promise.resolve(type === 'arrayBuffer' ? null : (map.get(key) ?? null))) as KVNamespaceBinding['get'];
  return {
    calls,
    get,
    put: (key, value) => {
      map.set(key, value);
      return Promise.resolve();
    },
    list: (options) => {
      calls.push(options);
      const all = [...map.keys()].filter((k) => k.startsWith(options.prefix ?? '')).sort();
      const start = options.cursor ? Number(options.cursor) : 0;
      const keys = all.slice(start, start + pageSize).map((name) => ({ name }));
      const next = start + pageSize;
      return Promise.resolve(next < all.length ? { keys, list_complete: false, cursor: String(next) } : { keys, list_complete: true });
    },
  };
}

describe('adaptKV (foundry live-read-for-worker-summaries): the live binding behind the handler KV surface', () => {
  it('lists every key name under a prefix across pages, passing the prefix as an options object', async () => {
    const binding = fakeBinding({ 'sales:day:tax-workbook:2026-11-01': '{}', 'sales:day:tax-workbook:2026-11-02': '{}', 'sales:day:tax-workbook:2026-11-03': '{}', 'mail:1': '{}' });
    const kv = adaptKV(binding);
    await expect(kv.list('sales:day:tax-workbook:')).resolves.toEqual(['sales:day:tax-workbook:2026-11-01', 'sales:day:tax-workbook:2026-11-02', 'sales:day:tax-workbook:2026-11-03']);
    expect(binding.calls).toEqual([{ prefix: 'sales:day:tax-workbook:' }, { prefix: 'sales:day:tax-workbook:', cursor: '2' }]);
    await expect(kv.list('nothing:')).resolves.toEqual([]);
  });

  it('passes get and put through', async () => {
    const kv = adaptKV(fakeBinding({}));
    await kv.put('k', 'v');
    await expect(kv.get('k')).resolves.toBe('v');
    await expect(kv.get('k', 'arrayBuffer')).resolves.toBeNull();
  });

  it('serves /v1/downloads/summary from a binding-shaped namespace: a zero-count body when no day is stored', async () => {
    const env = { LICENSES: adaptKV(fakeBinding({})), STRIPE_WEBHOOK_SECRET: 'x', LICENSE_SIGNING_KEY: 'x', RESEND_API_KEY: 'x', ADMIN_TOKEN: 'x', FROM_EMAIL: 'x' } satisfies Env;
    const handle = createHandler({ fetch, now: () => new Date('2026-11-07T17:00:00Z') });
    const res = await handle(new Request('https://w.test/v1/downloads/summary?venture=tax-workbook'), env);
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ venture: 'tax-workbook', window_days: 30, from: '2026-10-09', to: '2026-11-07', sales: 0, test_orders: 0, refunds: 0, net_pence: 0, refs: {}, days: [] });
  });

  it('is what the raw binding lacked: iterating a raw list answer throws', async () => {
    const raw = fakeBinding({ 'sales:day:tax-workbook:2026-11-01': '{}' });
    const answer = await raw.list({ prefix: 'sales:day:' });
    expect(() => {
      for (const _k of answer as unknown as string[]) void _k;
    }).toThrow(/not iterable/);
  });
});
