import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  deleteProbeKey,
  generateProbeKey,
  mintProbeKey,
  PER_PAGE,
  pickTool,
  probe,
  PROBE_EMAIL,
  probeError,
  probeNote,
  probeOnce,
  rpcBody,
  sha256Hex,
  USER_AGENT,
  withProbeKey,
  type ProbeResult,
  type SqlFn,
} from './mcp-probe.ts';

const TOOLS = [
  { name: 'list_sources', description: 'Every dataset.' },
  { name: 'query_uk_company_profiles', description: 'Lookup. One record per call, named by…' },
  { name: 'query_uk_sanctions', description: 'Designations. Filters combine with AND.' },
  { name: 'query_uk_tenders', description: 'Notices.' },
];

type Handler = (body: { method: string; params?: Record<string, unknown> }) => Response;

function server(handler: Handler): {
  fetch: (url: string, init: RequestInit) => Promise<Response>;
  calls: { url: string; headers: Record<string, string>; body: Record<string, unknown> }[];
} {
  const calls: { url: string; headers: Record<string, string>; body: Record<string, unknown> }[] =
    [];
  return {
    calls,
    fetch: (url, init) => {
      const body = JSON.parse(init.body as string) as {
        method: string;
        params?: Record<string, unknown>;
      };
      calls.push({ url, headers: init.headers as Record<string, string>, body });
      return Promise.resolve(handler(body));
    },
  };
}

const json = (payload: unknown, status = 200): Response =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json' },
  });
const sse = (payload: unknown): Response =>
  new Response(`event: message\ndata: ${JSON.stringify(payload)}\n\n`, {
    status: 200,
    headers: { 'content-type': 'text/event-stream' },
  });

const healthy: Handler = ({ method, params }) => {
  if (method === 'initialize') return sse({ jsonrpc: '2.0', id: 1, result: { serverInfo: {} } });
  if (method === 'tools/list') return json({ jsonrpc: '2.0', id: 2, result: { tools: TOOLS } });
  if (method === 'tools/call' && params?.name === 'query_uk_sanctions') {
    return sse({ jsonrpc: '2.0', id: 3, result: { content: [{ type: 'text', text: '{}' }] } });
  }
  return json({ error: 'unexpected' }, 500);
};

describe('rpcBody', () => {
  it('reads JSON and the first SSE data line', async () => {
    expect(await rpcBody(json({ result: { a: 1 } }))).toEqual({ result: { a: 1 } });
    expect(await rpcBody(sse({ result: { b: 2 } }))).toEqual({ result: { b: 2 } });
    expect(await rpcBody(new Response('Internal Server Error', { status: 500 }))).toBeNull();
  });
});

describe('pickTool', () => {
  it('takes the first query_ tool that lists rows, skipping lookups', () => {
    expect(pickTool(TOOLS)).toBe('query_uk_sanctions');
    expect(pickTool([{ name: 'list_sources' }])).toBeNull();
  });
});

describe('probeOnce', () => {
  it('runs initialize, tools/list and one preview tools/call with the smallest page', async () => {
    const s = server(healthy);
    const run = await probeOnce('https://x/mcp', s.fetch, undefined);
    expect(run.steps.map((st) => [st.name, st.status, st.note])).toEqual([
      ['initialize', 200, ''],
      ['tools/list', 200, ''],
      ['tools/call', 200, ''],
    ]);
    expect(run.tools).toBe(4);
    expect(run.steps[2]?.tool).toBe('query_uk_sanctions');
    expect(s.calls[2]?.body.params).toEqual({
      name: 'query_uk_sanctions',
      arguments: { per_page: PER_PAGE },
    });
    expect(s.calls[0]?.headers['user-agent']).toBe(USER_AGENT);
    expect(s.calls[0]?.headers.authorization).toBeUndefined();
    expect(s.calls[0]?.headers.accept).toContain('text/event-stream');
  });

  it('stops at a 500 and keeps what the body said', async () => {
    const s = server(() => new Response('Internal Server Error', { status: 500 }));
    const run = await probeOnce('https://x/mcp', s.fetch, 'k');
    expect(run.authed).toBe(true);
    expect(run.steps).toEqual([{ name: 'initialize', status: 500, note: 'Internal Server Error' }]);
    expect(s.calls).toHaveLength(1);
    expect(s.calls[0]?.headers.authorization).toBe('Bearer k');
  });

  it('records a network failure as status null', async () => {
    const run = await probeOnce(
      'https://x/mcp',
      () => Promise.reject(new Error('fetch failed: ECONNRESET')),
      undefined,
    );
    expect(run.steps).toEqual([
      { name: 'initialize', status: null, note: 'fetch failed: ECONNRESET' },
    ]);
  });

  it('reads a 200 with an RPC error or a tool error as a failed step', async () => {
    const rpcErr = server(({ method }) =>
      method === 'initialize'
        ? json({ jsonrpc: '2.0', id: 1, error: { code: -32600, message: 'Bad Request' } })
        : json({}),
    );
    const a = await probeOnce('https://x/mcp', rpcErr.fetch, undefined);
    expect(a.steps[0]?.note).toBe('rpc error: Bad Request');
    const toolErr = server((body) =>
      body.method === 'tools/call'
        ? json({
            jsonrpc: '2.0',
            id: 3,
            result: { isError: true, content: [{ type: 'text', text: 'Preview limit reached' }] },
          })
        : healthy(body),
    );
    const b = await probeOnce('https://x/mcp', toolErr.fetch, undefined);
    expect(b.steps[2]).toMatchObject({ status: 200, note: 'tool error: Preview limit reached' });
  });
});

describe('probe, probeNote and probeError', () => {
  it('renders a clean keyless run and says the authed run is optional', async () => {
    const s = server(healthy);
    const result = await probe('https://x/mcp', s.fetch, undefined, '2026-10-08');
    expect(result.date).toBe('2026-10-08');
    expect(result.runs).toHaveLength(1);
    expect(probeNote(result)).toBe(
      'mcp probe: init 200, tools 200 (4 tools), call 200; authed: n/a (no key)',
    );
    expect(probeError(result)).toBeNull();
  });

  it('names why the authed run was skipped and lists a failed mint under refresh errors', async () => {
    const s = server(healthy);
    const result = await probe('https://x/mcp', s.fetch, undefined, '2026-10-09');
    result.authed_skipped = 'no CLOUDFLARE_API_TOKEN to mint a probe key';
    expect(probeNote(result)).toContain(
      'authed: n/a (no CLOUDFLARE_API_TOKEN to mint a probe key)',
    );
    expect(probeError(result)).toBeNull();
    result.authed_skipped = 'mint failed: D1: [{"code":7403,"message":"not, authorized"}]';
    expect(probeError(result)).toEqual({
      slug: 'mcp-probe',
      message: 'authed mint failed: D1: [{"code":7403;"message":"not; authorized"}]',
    });
  });

  it('runs the authed pass too and lists a failed one under refresh errors', async () => {
    const s = server((body) =>
      body.method === 'tools/list' ? json({ e: 1 }, 503) : healthy(body),
    );
    const result = await probe('https://x/mcp', s.fetch, 'secret', '2026-10-08');
    expect(result.runs.map((r) => r.authed)).toEqual([false, true]);
    expect(probeNote(result)).toBe(
      'mcp probe: init 200, tools 503 (failed); authed: init 200, tools 503 (failed)',
    );
    expect(probeError(result)).toEqual({
      slug: 'mcp-probe',
      message: 'tools 503 (failed); authed tools 503 (failed)',
    });
    expect(JSON.stringify(result)).not.toContain('secret');
  });

  it('a failed probe message carries no commas, so the row field splits per source', async () => {
    const s = server(() => json({ error: 'a, b, c' }, 500));
    const result = await probe('https://x/mcp', s.fetch, undefined);
    expect(probeError(result)?.message).not.toContain(',');
  });
});

/** A D1 stand-in: records every statement, answers the account lookup, holds `api_keys` rows. */
function d1(): {
  sql: SqlFn;
  statements: { query: string; params: unknown[] }[];
  keys: Map<string, Record<string, unknown>>;
} {
  const statements: { query: string; params: unknown[] }[] = [];
  const keys = new Map<string, Record<string, unknown>>();
  const sql: SqlFn = (query, params = []) => {
    statements.push({ query, params });
    if (query.startsWith('SELECT id FROM accounts')) return Promise.resolve([{ id: 'acct-1' }]);
    if (query.startsWith('INSERT INTO api_keys')) {
      const [id, key_hash, email, name, plan, credits, account_id] = params;
      keys.set(String(id), { id, key_hash, email, name, plan, credits, account_id });
    }
    if (query.startsWith('DELETE FROM api_keys WHERE account_id')) keys.clear();
    if (query.startsWith('DELETE FROM api_keys WHERE id')) keys.delete(String(params[0]));
    return Promise.resolve([]);
  };
  return { sql, statements, keys };
}

describe('one-run probe key', () => {
  it('generateProbeKey has the Worker key shape and sha256Hex matches the stored form', () => {
    const key = generateProbeKey();
    expect(key).toMatch(/^fapi_[A-Za-z0-9]{32}$/);
    expect(generateProbeKey()).not.toBe(key);
    // Rejection sampling: bytes at or above 248 are skipped, never folded (255 % 62 would be 'H').
    const skewed = generateProbeKey((n) => new Uint8Array(n).map((_, i) => (i % 2 ? 255 : 0)));
    expect(skewed).toBe(`fapi_${'A'.repeat(32)}`);
    expect(sha256Hex('abc')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
  });

  it('mintProbeKey creates the account once, sweeps a leftover key and inserts only the hash', async () => {
    const db = d1();
    db.keys.set('old', { id: 'old', account_id: 'acct-1' });
    const minted = await mintProbeKey(db.sql, 'fapi_' + 'x'.repeat(32));
    expect(minted.hash).toBe(sha256Hex(minted.key));
    expect(db.statements.map((s) => s.query.split(' ').slice(0, 3).join(' '))).toEqual([
      'INSERT INTO accounts',
      'SELECT id FROM',
      'DELETE FROM api_keys',
      'INSERT INTO api_keys',
    ]);
    expect(db.statements[0]?.params[1]).toBe(PROBE_EMAIL);
    expect(db.keys.has('old')).toBe(false);
    expect([...db.keys.values()]).toEqual([
      expect.objectContaining({
        id: minted.keyId,
        key_hash: minted.hash,
        email: PROBE_EMAIL,
        plan: 'free',
        account_id: 'acct-1',
      }),
    ]);
    expect(JSON.stringify(db.statements)).not.toContain(minted.key);
  });

  it('deleteProbeKey removes the row and the KV hot-path copy, tolerating a KV failure', async () => {
    const db = d1();
    const minted = await mintProbeKey(db.sql);
    const deleted: string[] = [];
    await deleteProbeKey(
      db.sql,
      (k) => {
        deleted.push(k);
        return Promise.reject(new Error('KV delete: 404'));
      },
      minted,
    );
    expect(db.keys.size).toBe(0);
    expect(deleted).toEqual([`key:${minted.hash}`]);
  });

  it('withProbeKey prefers GANKDAT_PROBE_KEY, else mints, probes and deletes even on a throw', async () => {
    const seen: (string | undefined)[] = [];
    const empty: ProbeResult = { date: 'd', url: 'u', runs: [] };
    const run = (key: string | undefined): Promise<ProbeResult> => {
      seen.push(key);
      return Promise.resolve({ ...empty });
    };
    const db = d1();
    const kv: string[] = [];
    const cf = (): { sql: SqlFn; kvDelete: (k: string) => Promise<void> } => ({
      sql: db.sql,
      kvDelete: (k) => {
        kv.push(k);
        return Promise.resolve();
      },
    });

    await withProbeKey({ GANKDAT_PROBE_KEY: 'owner-key', CLOUDFLARE_API_TOKEN: 't' }, cf, run);
    expect(seen).toEqual(['owner-key']);
    expect(db.statements).toHaveLength(0);

    const skipped = await withProbeKey({}, cf, run);
    expect(seen[1]).toBeUndefined();
    expect(skipped.authed_skipped).toBe('no CLOUDFLARE_API_TOKEN to mint a probe key');

    const minted = await withProbeKey({ CLOUDFLARE_API_TOKEN: 't' }, cf, run);
    expect(seen[2]).toMatch(/^fapi_[A-Za-z0-9]{32}$/);
    expect(minted.authed_skipped).toBeUndefined();
    expect(db.keys.size).toBe(0);
    expect(kv).toHaveLength(1);

    await expect(
      withProbeKey({ CLOUDFLARE_API_TOKEN: 't' }, cf, () => Promise.reject(new Error('boom'))),
    ).rejects.toThrow('boom');
    expect(db.keys.size).toBe(0);
    expect(kv).toHaveLength(2);

    const failing: SqlFn = () => Promise.reject(new Error('D1: [{"code":7403}]'));
    const unminted = await withProbeKey(
      { CLOUDFLARE_API_TOKEN: 't' },
      () => ({ sql: failing, kvDelete: () => Promise.resolve() }),
      run,
    );
    expect(seen[3]).toBeUndefined();
    expect(unminted.authed_skipped).toBe('mint failed: D1: [{"code":7403}]');
  });

  it('the probe account and user agent are excluded from every metrics reading', () => {
    const metrics = readFileSync('ventures/gankdat/scripts/metrics.mjs', 'utf8');
    // Every account-level query carries the internal-mailbox filter; the probe's domain is in it.
    const patterns = [...metrics.matchAll(/NOT LIKE '([^']+)'/g)].map((m) => m[1]!);
    const domain = `%@${PROBE_EMAIL.split('@')[1]}`;
    expect(patterns).toContain(domain);
    for (const query of metrics.match(/"SELECT [^"]*\bFROM (accounts|agent_signups)\b[^"]*"/g) ??
      [])
      expect(query).toContain(`NOT LIKE '${domain}'`);
    // The traffic counts the probe would inflate (MCP 24h authed, per-dataset 30d) skip its UA.
    const ua = USER_AGENT.split('/')[0]!;
    for (const query of metrics.match(/"SELECT [^"]*gankdat_traffic[^"]*GROUP BY (kind|tools)"/g) ??
      [])
      expect(query).toContain(`blob2 NOT LIKE '${ua}/%'`);
  });
});
