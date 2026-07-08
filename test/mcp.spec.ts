import { env, SELF } from 'cloudflare:test';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { currentPeriod } from '../src/metering/counters';
import { bearer, issueKey } from './helpers/auth';
import { stubOrigins } from './helpers/origin-mock';

const MCP_URL = 'https://example.com/mcp';

const PLANNING_ENTITIES = [
  {
    entity: 1,
    reference: 'A/1',
    'organisation-entity': 109,
    description: 'Rear extension',
    'decision-date': '2023-05-09',
    'entry-date': '2025-05-30',
    'start-date': '',
    'end-date': '',
    point: '',
  },
  {
    entity: 2,
    reference: 'B/2',
    'organisation-entity': 222,
    description: 'Solar installation',
    'decision-date': '2024-06-30',
    'entry-date': '2025-06-14',
    'start-date': '',
    'end-date': '',
    point: '',
  },
];

function stubPlanning(): void {
  stubOrigins({
    planning: () =>
      Response.json({ entities: PLANNING_ENTITIES, links: {}, count: PLANNING_ENTITIES.length }),
  });
}

interface RpcResponse {
  jsonrpc: string;
  id?: number;
  result?: Record<string, never> & {
    tools?: { name: string; inputSchema: { properties?: Record<string, unknown> } }[];
    serverInfo?: { name: string };
    content?: { type: string; text: string }[];
    structuredContent?: Record<string, unknown>;
    isError?: boolean;
  };
  error?: { code: number; message: string };
}

async function rpc(
  key: string,
  method: string,
  params: Record<string, unknown> = {},
  id = 1,
): Promise<{ status: number; body: RpcResponse | null }> {
  const res = await SELF.fetch(MCP_URL, {
    method: 'POST',
    headers: {
      ...bearer(key),
      'content-type': 'application/json',
      accept: 'application/json, text/event-stream',
    },
    body: JSON.stringify({ jsonrpc: '2.0', id, method, params }),
  });
  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.includes('text/event-stream')) {
    const text = await res.text();
    const dataLine = text.split('\n').find((line) => line.startsWith('data:'));
    return { status: res.status, body: dataLine ? (JSON.parse(dataLine.slice(5)) as RpcResponse) : null };
  }
  if (contentType.includes('application/json')) {
    return { status: res.status, body: (await res.json()) as RpcResponse };
  }
  return { status: res.status, body: null };
}

const INIT_PARAMS = {
  protocolVersion: '2025-06-18',
  capabilities: {},
  clientInfo: { name: 'test-client', version: '0.0.1' },
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('/mcp', () => {
  it('requires an API key', async () => {
    const res = await SELF.fetch(MCP_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: INIT_PARAMS }),
    });
    expect(res.status).toBe(401);
  });

  it('answers initialize with server info', async () => {
    const { key } = await issueKey();
    const { status, body } = await rpc(key, 'initialize', INIT_PARAMS);
    expect(status).toBe(200);
    expect(body?.result?.serverInfo?.name).toBe('gankdat');
  });

  it('lists registry-generated tools with schemas from the zod queryParams', async () => {
    const { key } = await issueKey();
    const { body } = await rpc(key, 'tools/list');
    const tools = body?.result?.tools ?? [];
    const names = tools.map((t) => t.name);
    expect(names).toEqual(
      expect.arrayContaining(['list_sources', 'get_usage', 'query_uk_planning', 'query_uk_tenders']),
    );
    const planning = tools.find((t) => t.name === 'query_uk_planning');
    const props = Object.keys(planning?.inputSchema.properties ?? {});
    expect(props).toEqual(
      expect.arrayContaining(['authority', 'decision_date_after', 'page', 'per_page', 'q']),
    );
  });

  it('executes query tools with filters, returning structured JSON and charging credits', async () => {
    stubPlanning();
    const { key } = await issueKey();
    const { body } = await rpc(key, 'tools/call', {
      name: 'query_uk_planning',
      arguments: { authority: 109 },
    });
    expect(body?.result?.isError).toBeUndefined();
    const structured = body?.result?.structuredContent as {
      data: { reference: string }[];
      meta: { total: number; credits_remaining: number };
    };
    expect(structured.data.map((r) => r.reference)).toEqual(['A/1']);
    expect(structured.meta.credits_remaining).toBe(249);

    // Metering parity: the same counter REST uses.
    const usage = (await (
      await SELF.fetch('https://example.com/v1/usage', { headers: bearer(key) })
    ).json()) as { data: { used: number } };
    expect(usage.data.used).toBe(1);
  });

  it('keeps list_sources and get_usage free', async () => {
    const { key } = await issueKey();
    await rpc(key, 'tools/call', { name: 'list_sources', arguments: {} });
    const { body } = await rpc(key, 'tools/call', { name: 'get_usage', arguments: {} });
    const structured = body?.result?.structuredContent as { data: { used: number } };
    expect(structured.data.used).toBe(0);
  });

  it('surfaces quota exhaustion as an isError tool result, not a protocol crash', async () => {
    const { key, email } = await issueKey();
    // Free plan = 250/mo; exhaust the monthly usage counter (keyed by email).
    await env.CACHE.put(`usage:${email.toLowerCase()}:${currentPeriod()}`, '250');

    const { status, body } = await rpc(key, 'tools/call', {
      name: 'query_uk_planning',
      arguments: {},
    });
    expect(status).toBe(200);
    expect(body?.result?.isError).toBe(true);
    expect(body?.result?.content?.[0]?.text).toContain('quota');
  });
});
