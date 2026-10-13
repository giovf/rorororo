import { describe, expect, it } from 'vitest';
import {
  Budget,
  BudgetExceeded,
  DEFAULT_MODEL,
  MAX_CALLS,
  SOURCES,
  dryRunChat,
  dryRunTools,
  gankdatTools,
  nebiusChat,
  parseCli,
  runAgent,
  toolName,
  type ChatFn,
  type ChatMessage,
  type FetchLike,
} from './nebius-diligence-agent.ts';

function bodyText(init: RequestInit | undefined): string {
  return typeof init?.body === 'string' ? init.body : '{}';
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('Budget', () => {
  it('stops at the call cap and the token cap', () => {
    const b = new Budget(2, 1000);
    b.reserve();
    b.reserve();
    expect(() => b.reserve()).toThrow(BudgetExceeded);
    const c = new Budget(10, 1000);
    c.charge({ total_tokens: 600 }, []);
    expect(() => c.charge({ total_tokens: 600 }, [])).toThrow(/tokens exceeded/);
  });

  it('estimates tokens from the transcript when usage is missing', () => {
    const b = new Budget(10, 100);
    const messages: ChatMessage[] = [{ role: 'user', content: 'x'.repeat(800) }];
    expect(() => b.charge(undefined, messages)).toThrow(BudgetExceeded);
    expect(b.tokens).toBe(200);
  });

  it('defaults to the documented caps', () => {
    expect(new Budget().maxCalls).toBe(MAX_CALLS);
  });
});

describe('runAgent (dry run)', () => {
  it('reads five registers and writes the report with a verdict and sources', async () => {
    const company = 'Acme Widgets Ltd';
    const r = await runAgent({ company, chat: dryRunChat(company), ...dryRunTools() });
    expect(r.steps.map((s) => s.tool)).toEqual([
      'query_uk_companies',
      'query_uk_sanctions',
      'query_uk_insolvency',
      'query_uk_sponsors',
      'query_uk_contract_awards',
    ]);
    expect(r.report).toContain('# Due diligence: Acme Widgets Ltd');
    expect(r.report).toContain('MEDIUM risk');
    expect(r.report).toContain('- query_uk_sanctions {"q":"Acme Widgets Ltd"}');
    expect(r.budget.calls).toBe(2);
    expect(r.budget.tokens).toBe(2040);
  });

  it('aborts a model that never stops calling tools', async () => {
    const looping: ChatFn = () =>
      Promise.resolve({
        choices: [
          {
            message: {
              role: 'assistant',
              content: null,
              tool_calls: [
                {
                  id: 'c1',
                  type: 'function',
                  function: { name: 'query_uk_companies', arguments: '{"q":"x"}' },
                },
              ],
            },
          },
        ],
      });
    await expect(
      runAgent({ company: 'x', chat: looping, ...dryRunTools(), budget: new Budget(3) }),
    ).rejects.toThrow(/3 model calls reached/);
  });
});

describe('nebiusChat', () => {
  it('posts to Token Factory with the key and a Nano-class model only', async () => {
    const seen: { url: string; init: RequestInit | undefined }[] = [];
    const fetchFn: FetchLike = (url, init) => {
      seen.push({ url, init });
      return Promise.resolve(
        jsonResponse({ choices: [{ message: { role: 'assistant', content: 'hi' } }] }),
      );
    };
    const chat = nebiusChat('k', DEFAULT_MODEL, 'https://api.tokenfactory.nebius.com/v1/', fetchFn);
    await chat([{ role: 'user', content: 'x' }], []);
    expect(seen[0]?.url).toBe('https://api.tokenfactory.nebius.com/v1/chat/completions');
    const headers = seen[0]?.init?.headers as Record<string, string>;
    expect(headers['authorization']).toBe('Bearer k');
    const sent = JSON.parse(bodyText(seen[0]?.init)) as { model: string };
    expect(sent.model).toBe(DEFAULT_MODEL);
    expect(() => nebiusChat('k', 'nvidia/Nemotron-3-Ultra-550b-a55b')).toThrow(BudgetExceeded);
  });
});

describe('gankdatTools', () => {
  it('keeps only the diligence registers and relays tool text', async () => {
    const bodies: Record<string, unknown>[] = [];
    const fetchFn: FetchLike = (_url, init) => {
      const body = JSON.parse(bodyText(init)) as Record<string, unknown>;
      bodies.push(body);
      if (body['method'] === 'initialize') return Promise.resolve(jsonResponse({ result: {} }));
      if (body['method'] === 'tools/list')
        return Promise.resolve(
          jsonResponse({
            result: {
              tools: [
                { name: 'query_uk_sanctions', description: 'S', inputSchema: { type: 'object' } },
                { name: 'query_uk_planning', description: 'P', inputSchema: { type: 'object' } },
                { name: 'buy_credits', description: 'B' },
              ],
            },
          }),
        );
      return Promise.resolve(
        jsonResponse({ result: { content: [{ type: 'text', text: '{"total":0}' }] } }),
      );
    };
    const { tools, callTool } = await gankdatTools('https://gankdat.com/mcp', 'key', fetchFn);
    expect(tools.map((t) => t.function.name)).toEqual(['query_uk_sanctions']);
    expect(await callTool('query_uk_sanctions', { q: 'x' })).toBe('{"total":0}');
    expect(await callTool('buy_credits', {})).toMatch(/not one of the diligence registers/);
    expect(bodies.at(-1)?.['params']).toEqual({
      name: 'query_uk_sanctions',
      arguments: { q: 'x' },
    });
  });
});

describe('cli', () => {
  it('maps every source to a query tool and parses the flags', () => {
    expect(SOURCES.map(toolName)).toContain('query_uk_company_profiles');
    expect(parseCli(['--dry-run', 'Acme', 'Widgets', '--out', 'r.md'])).toEqual({
      company: 'Acme Widgets',
      dryRun: true,
      out: 'r.md',
    });
  });
});
