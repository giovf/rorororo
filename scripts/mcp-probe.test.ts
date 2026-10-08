import { describe, expect, it } from 'vitest';
import {
  PER_PAGE,
  pickTool,
  probe,
  probeError,
  probeNote,
  probeOnce,
  rpcBody,
  USER_AGENT,
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
      'mcp probe: init 200, tools 200 (4 tools), call 200; authed: n/a (no GANKDAT_PROBE_KEY)',
    );
    expect(probeError(result)).toBeNull();
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
