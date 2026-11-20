import { describe, expect, it } from 'vitest';
import { emptyDoc, parseDoc, ROUTINES, schedulesApi, schedulesView, toggle } from './schedules';

function fakeKv(): KVNamespace & { store: Map<string, string> } {
  const store = new Map<string, string>();
  const kv = {
    store,
    get: (key: string) => Promise.resolve(store.get(key) ?? null),
    put: (key: string, value: string) => {
      store.set(key, value);
      return Promise.resolve();
    },
  };
  return kv as unknown as KVNamespace & { store: Map<string, string> };
}

const t0 = new Date('2026-11-20T19:00:00Z');
const t1 = new Date('2026-11-20T21:00:00Z');

describe('toggle', () => {
  it('pauses, keeps the first stamp, and resumes into history', () => {
    const a = toggle(emptyDoc(), ['build'], true, t0);
    expect(a.paused).toEqual({ build: t0.toISOString() });
    expect(toggle(a, ['build'], true, t1)).toBe(a);
    const b = toggle(a, ['build'], false, t1);
    expect(b.paused).toEqual({});
    expect(b.history).toEqual([{ routine: 'build', from: t0.toISOString(), to: t1.toISOString() }]);
    expect(b.updated).toBe(t1.toISOString());
  });

  it('pauses everything and ignores unknown keys', () => {
    const all = toggle(emptyDoc(), [...ROUTINES.map((r) => r.key), 'nope'], true, t0);
    expect(Object.keys(all.paused).sort()).toEqual(ROUTINES.map((r) => r.key).sort());
  });

  it('drops history older than 14 days', () => {
    const old = { paused: { inbox: '2026-11-01T00:00:00.000Z' }, history: [{ routine: 'x', from: '2026-10-01T00:00:00.000Z', to: '2026-10-02T00:00:00.000Z' }], updated: null };
    expect(toggle(old, ['inbox'], false, t0).history).toEqual([{ routine: 'inbox', from: '2026-11-01T00:00:00.000Z', to: t0.toISOString() }]);
  });

  it('reads a broken record as empty', () => {
    expect(parseDoc('{')).toEqual(emptyDoc());
  });
});

describe('routes', () => {
  const env = (kv: KVNamespace) => ({ OPS_KV: kv, OPS_INTERNAL_TOKEN: 'tok' });

  it('refuses a toggle without a session and accepts one with it', async () => {
    const kv = fakeKv();
    const app = schedulesApi();
    const body = new URLSearchParams({ routine: 'build', action: 'pause' });
    const headers = { 'content-type': 'application/x-www-form-urlencoded' };
    await app.request('/schedules', { method: 'POST', body, headers }, env(kv));
    expect(kv.store.has('paused')).toBe(false);
    kv.store.set('sess:abc', 'owner@example.com');
    const res = await app.request('/schedules', { method: 'POST', body, headers: { ...headers, cookie: 'ops_s=abc' } }, env(kv));
    expect(res.status).toBe(302);
    expect(parseDoc(kv.store.get('paused') ?? null).paused['build']).toBeDefined();
  });

  it('serves the state and takes the ack only with the internal token', async () => {
    const kv = fakeKv();
    const app = schedulesApi();
    expect((await app.request('/api/paused', {}, env(kv))).status).toBe(401);
    const ok = await app.request('/api/paused', { headers: { authorization: 'Bearer tok' } }, env(kv));
    expect(await ok.json()).toEqual(emptyDoc());
    await app.request('/api/paused/ack', { method: 'POST', body: JSON.stringify({ updated: 'x' }), headers: { authorization: 'Bearer tok', 'content-type': 'application/json' } }, env(kv));
    expect(kv.store.get('paused:synced')).toBe('x');
  });
});

describe('view', () => {
  it('says a change is on its way until the poll acknowledges it', () => {
    const doc = toggle(emptyDoc(), ['build'], true, t0);
    expect(schedulesView(doc, null, false)).toContain('on its way');
    const synced = schedulesView(doc, doc.updated, false);
    expect(synced).not.toContain('on its way');
    expect(synced).toContain('paused with the build');
  });
});
