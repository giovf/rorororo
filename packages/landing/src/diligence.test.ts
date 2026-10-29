import { describe, expect, it } from 'vitest';
import {
  PER_DAY,
  PER_VISITOR_HOUR,
  TOTAL_TOKENS,
  addSpent,
  diligence,
  modelOf,
  tokensSpent,
  underCap,
  type DiligenceBindings,
} from './diligence';

/** A KV namespace in memory: enough for the caps and the page. */
function fakeKv(): KVNamespace {
  const store = new Map<string, string>();
  const kv = {
    get: (key: string) => Promise.resolve(store.get(key) ?? null),
    put: (key: string, value: string) => {
      store.set(key, value);
      return Promise.resolve();
    },
  };
  return kv as unknown as KVNamespace;
}

async function events(res: Response): Promise<Record<string, unknown>[]> {
  const text = await res.text();
  return text
    .split('\n')
    .filter((l) => l.startsWith('data:'))
    .map((l) => JSON.parse(l.slice(5)) as Record<string, unknown>);
}

describe('/diligence', () => {
  it('renders the page with the form disabled until the model key exists', async () => {
    const env: DiligenceBindings = { OPS_KV: fakeKv() };
    const res = await diligence.request('/', {}, env);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('Counterparty check');
    expect(html).toContain('muse-spark-1.3');
    expect(html).toContain('not configured');
    expect(html).toMatch(/<button id="run" type="submit" disabled>/);
    const live = await diligence.request('/', {}, { ...env, DILIGENCE_API_KEY: 'LLM_1_x' });
    expect(await live.text()).toMatch(/<button id="run" type="submit">/);
  });

  it('streams an error event for a bad name and for a missing key, before any model call', async () => {
    const env: DiligenceBindings = { OPS_KV: fakeKv() };
    const post = (company: unknown, e = env): Promise<Response> =>
      Promise.resolve(
        diligence.request(
        '/run',
        { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ company }) },
        e,
      ),
      );
    const bad = await post('x');
    expect(bad.headers.get('content-type')).toContain('text/event-stream');
    expect(await events(bad)).toEqual([{ type: 'error', message: expect.stringMatching(/2 to 80/) as string }]);
    const noKey = await events(await post('Acme Widgets Ltd'));
    expect(noKey[0]?.['message']).toMatch(/not configured/);
  });

  it('caps a visitor per hour and the page per day', async () => {
    const kv = fakeKv();
    for (let i = 0; i < PER_VISITOR_HOUR; i += 1) expect(await underCap(kv, 'v', PER_VISITOR_HOUR, 60)).toBe(true);
    expect(await underCap(kv, 'v', PER_VISITOR_HOUR, 60)).toBe(false);
    expect(await underCap(kv, 'd', PER_DAY, 60)).toBe(true);
  });

  it('stops starting runs once the lifetime token total leaves no room for a full run', async () => {
    const kv = fakeKv();
    await addSpent(kv, 1000);
    await addSpent(kv, 0);
    expect(await tokensSpent(kv)).toBe(1000);
    await addSpent(kv, TOTAL_TOKENS - 1000 - 100_000);
    const env: DiligenceBindings = { OPS_KV: kv, DILIGENCE_API_KEY: 'LLM_1_x' };
    const res = await diligence.request(
      '/run',
      { method: 'POST', body: JSON.stringify({ company: 'Acme Widgets Ltd' }), headers: { 'content-type': 'application/json' } },
      env,
    );
    const evs = await events(res);
    expect(evs).toHaveLength(1);
    expect(String(evs[0]?.message)).toContain('credit set aside for this demo is used up');
  });

  it('names the model from the vars, Muse Spark on Meta Model API by default', () => {
    expect(modelOf({ OPS_KV: fakeKv() })).toEqual({
      baseUrl: 'https://api.meta.ai/v1',
      model: 'muse-spark-1.3',
      provider: 'Meta Model API',
    });
    expect(
      modelOf({ OPS_KV: fakeKv(), DILIGENCE_BASE_URL: 'https://api.fireworks.ai/inference/v1', DILIGENCE_MODEL: 'm' }),
    ).toEqual({ baseUrl: 'https://api.fireworks.ai/inference/v1', model: 'm', provider: 'api.fireworks.ai' });
  });
});
