import { describe, expect, it } from 'vitest';
import {
  Budget,
  BudgetExceeded,
  MAX_CALLS,
  META_BASE_URL,
  META_DEFAULT_MODEL,
  SOURCES,
  UNCONFIRMED_LABEL,
  cleanCompany,
  confirmVerdict,
  dryRunChat,
  dryRunTools,
  gankdatTools,
  identityOf,
  modelAllowed,
  openAiChat,
  parseRegisterResult,
  registerResult,
  rpcBody,
  runAgent,
  stepSummary,
  toolName,
  type ChatFn,
  type ChatMessage,
  type FetchLike,
  type Step,
} from './diligence-core';

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
  it('reads five registers, reports each step as it lands and writes the report', async () => {
    const company = 'Acme Widgets Ltd';
    const seen: string[] = [];
    const r = await runAgent({
      company,
      chat: dryRunChat(company),
      ...dryRunTools(),
      onStep: (s) => {
        seen.push(s.tool);
      },
    });
    expect(r.steps.map((s) => s.tool)).toEqual([
      'query_uk_companies',
      'query_uk_sanctions',
      'query_uk_insolvency',
      'query_uk_sponsors',
      'query_uk_contract_awards',
    ]);
    expect(seen).toEqual(r.steps.map((s) => s.tool));
    expect(r.report).toContain('# Due diligence: Acme Widgets Ltd');
    expect(r.report).toContain('MEDIUM risk');
    expect(r.report).toContain('- query_uk_sanctions {"q":"Acme Widgets Ltd"}');
    expect(r.budget.calls).toBe(2);
    expect(r.budget.tokens).toBe(2040);
    expect(r.identity).toEqual({
      confirmed: true,
      companyNumber: '01234567',
      nameMatches: 1,
      reason: 'Companies House company 01234567',
    });
    expect(r.report).not.toContain(UNCONFIRMED_LABEL);
  });

  it('relabels a HIGH verdict unconfirmed when the name matched several companies', async () => {
    const twoCompanies = (q: string): string =>
      registerResult('uk-companies', [
        { company_number: '01111111', company_name: `${q.toUpperCase()} LIMITED` },
        { company_number: '02222222', company_name: `${q.toUpperCase()} (UK) LIMITED` },
      ]);
    const { tools } = dryRunTools();
    const callTool = (name: string, args: Record<string, unknown>): Promise<string> =>
      Promise.resolve(
        name === 'query_uk_companies'
          ? twoCompanies(String(args['q']))
          : name === 'query_uk_sanctions'
            ? registerResult('uk-sanctions', [{ name: 'ACME WIDGETS', regime: 'Russia' }])
            : registerResult(name.slice(6).replace(/_/g, '-'), []),
      );
    const chat: ChatFn = (messages) => {
      if (!messages.some((m) => m.role === 'tool'))
        return Promise.resolve({
          choices: [
            {
              message: {
                role: 'assistant',
                content: null,
                tool_calls: ['query_uk_companies', 'query_uk_sanctions'].map((name, i) => ({
                  id: `c${i}`,
                  type: 'function',
                  function: { name, arguments: '{"q":"Acme Widgets"}' },
                })),
              },
            },
          ],
        });
      return Promise.resolve({
        choices: [
          {
            message: {
              role: 'assistant',
              content: [
                '# Due diligence: Acme Widgets',
                '',
                '## Identity',
                '- Companies House: 2 matches (query_uk_companies).',
                '',
                '## Red flags',
                '- Sanctions: 1 match (query_uk_sanctions).',
                '',
                '## Verdict',
                'HIGH risk — a sanctions match. HIGH.',
                '',
                '## Sources',
                '- query_uk_companies {"q":"Acme Widgets"}',
              ].join('\n'),
            },
          },
        ],
      });
    };
    const r = await runAgent({ company: 'Acme Widgets', chat, tools, callTool });
    expect(r.identity.confirmed).toBe(false);
    expect(r.identity.nameMatches).toBe(2);
    expect(r.report).not.toMatch(/\bHIGH\b/);
    expect(r.report).toContain(`## Verdict\n${UNCONFIRMED_LABEL} — a sanctions match. unconfirmed.`);
    expect(r.report).toContain('Companies House returned 2 companies for this name and none was pinned by number');
    expect(r.report).toContain('Confirm the company number on Companies House');
    expect(r.report).toMatch(/\n\n## Sources\n- query_uk_companies/);
    expect(r.report).toContain('- Sanctions: 1 match (query_uk_sanctions).');
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

describe('openAiChat', () => {
  it('posts the documented Meta Model API request with the key and the reasoning effort', async () => {
    const seen: { url: string; init: RequestInit | undefined }[] = [];
    const fetchFn: FetchLike = (url, init) => {
      seen.push({ url, init });
      return Promise.resolve(
        jsonResponse({ choices: [{ message: { role: 'assistant', content: 'hi' } }] }),
      );
    };
    const chat = openAiChat(
      { baseUrl: `${META_BASE_URL}/`, model: META_DEFAULT_MODEL, apiKey: 'LLM_1_x', reasoningEffort: 'low' },
      fetchFn,
    );
    await chat([{ role: 'user', content: 'x' }], []);
    expect(seen[0]?.url).toBe('https://api.meta.ai/v1/chat/completions');
    const headers = seen[0]?.init?.headers as Record<string, string>;
    expect(headers['authorization']).toBe('Bearer LLM_1_x');
    const sent = JSON.parse(bodyText(seen[0]?.init)) as Record<string, unknown>;
    expect(sent['model']).toBe('muse-spark-1.3');
    expect(sent['reasoning_effort']).toBe('low');
    expect(sent['tool_choice']).toBe('auto');
    expect(sent['max_completion_tokens']).toBe(4000);
    expect(sent['temperature']).toBeUndefined();
  });

  it('sends max_tokens to a partner endpoint', async () => {
    let sent: Record<string, unknown> = {};
    const fetchFn: FetchLike = (_url, init) => {
      sent = JSON.parse(bodyText(init)) as Record<string, unknown>;
      return Promise.resolve(
        jsonResponse({ choices: [{ message: { role: 'assistant', content: 'hi' } }] }),
      );
    };
    const chat = openAiChat(
      { baseUrl: 'https://api.fireworks.ai/inference/v1', model: 'accounts/x/models/y', apiKey: 'k' },
      fetchFn,
    );
    await chat([], []);
    expect(sent['max_tokens']).toBe(4000);
    expect(sent['max_completion_tokens']).toBeUndefined();
    expect(sent['reasoning_effort']).toBeUndefined();
  });

  it('admits only Muse Spark on Meta Model API and any named model elsewhere', () => {
    expect(modelAllowed(META_BASE_URL, 'muse-spark-1.3')).toBe(true);
    expect(modelAllowed(META_BASE_URL, 'muse-spark-1.3-contributor')).toBe(true);
    expect(modelAllowed(META_BASE_URL, 'muse-wonder-1.0')).toBe(false);
    expect(modelAllowed('https://api.fireworks.ai/inference/v1', 'accounts/x/models/y')).toBe(true);
    expect(modelAllowed('https://api.fireworks.ai/inference/v1', '')).toBe(false);
    expect(() =>
      openAiChat({ baseUrl: META_BASE_URL, model: 'muse-wonder-1.0', apiKey: 'k' }),
    ).toThrow(BudgetExceeded);
  });

  it('surfaces a non-OK status with the body excerpt', async () => {
    const fetchFn: FetchLike = () => Promise.resolve(jsonResponse({ error: 'nope' }, 429));
    const chat = openAiChat({ baseUrl: META_BASE_URL, model: 'muse-spark-1.3', apiKey: 'k' }, fetchFn);
    await expect(chat([], [])).rejects.toThrow(/model 429: .*nope/);
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

  it('reads a JSON-RPC message from JSON and from an SSE body', async () => {
    const json = await rpcBody(jsonResponse({ result: { ok: 1 } }));
    expect(json?.result).toEqual({ ok: 1 });
    const sse = await rpcBody(
      new Response('event: message\ndata: {"result":{"ok":2}}\n\n', {
        headers: { 'content-type': 'text/event-stream' },
      }),
    );
    expect(sse?.result).toEqual({ ok: 2 });
    expect(await rpcBody(new Response('not json'))).toBeNull();
  });
});

describe('identity', () => {
  const name = (result: string, q = 'Acme'): Step => ({ tool: 'query_uk_companies', args: { q }, result });

  it('is confirmed by one Companies House hit with a number, or a profile looked up by number', () => {
    expect(identityOf([name(registerResult('uk-companies', [{ company_number: '09876543' }]))]).confirmed).toBe(true);
    const many = name(registerResult('uk-companies', [{ company_number: '1' }, { company_number: '2' }]));
    expect(identityOf([many])).toMatchObject({ confirmed: false, nameMatches: 2 });
    const profile: Step = {
      tool: 'query_uk_company_profiles',
      args: { company_number: '00000002' },
      result: registerResult('uk-company-profiles', [{ company_number: '00000002', company_name: 'ACME (UK) LIMITED' }]),
    };
    expect(identityOf([many, profile])).toEqual({
      confirmed: true,
      companyNumber: '00000002',
      nameMatches: 2,
      reason: 'Companies House company 00000002',
    });
  });

  it('is unconfirmed with no hit, no number or no Companies House read; a profile by name pins its one number', () => {
    expect(identityOf([name(registerResult('uk-companies', []))]).reason).toMatch(/returned no company/);
    expect(identityOf([name(registerResult('uk-companies', [{ company_name: 'ACME' }]))]).reason).toMatch(/carried no company number/);
    expect(identityOf([{ tool: 'query_uk_sanctions', args: { q: 'Acme' }, result: '{"total":0}' }]).reason).toMatch(/no Companies House record was read/);
    // A profile lookup by name returns the search's top hit: one record, one company number the
    // report can name — pinned, and the reader can check that number.
    const byName: Step = {
      tool: 'query_uk_company_profiles',
      args: { company: 'Acme' },
      result: registerResult('uk-company-profiles', [{ company_number: '00000003' }]),
    };
    expect(identityOf([byName]).confirmed).toBe(true);
    const twoThenName = identityOf([name(registerResult('uk-companies', [{ company_number: '1' }, { company_number: '2' }])), byName]);
    expect(twoThenName.confirmed).toBe(true);
  });

  it('relabels every risk grade and adds a Verdict section when the model wrote none', () => {
    const identity = identityOf([name(registerResult('uk-companies', []))]);
    const report = '# Due diligence: X\n\n## Red flags\n- Sanctions: 1 match.\n\n## Verdict\nMEDIUM risk — flags.\n';
    const out = confirmVerdict(report, identity);
    expect(out).not.toMatch(/MEDIUM risk|HIGH risk|LOW risk/);
    expect(out).toContain(`## Verdict\n${UNCONFIRMED_LABEL} — flags.\n\nCompanies House returned no company`);
    const noSection = confirmVerdict('Just prose, high-risk counterparty.', identity);
    expect(noSection).toContain(`## Verdict\n${UNCONFIRMED_LABEL} — `);
    expect(noSection).toContain(`Just prose, ${UNCONFIRMED_LABEL} counterparty.`);
    expect(confirmVerdict('HIGH risk', { confirmed: true, companyNumber: '1', nameMatches: 1, reason: '' })).toBe('HIGH risk');
  });
});

describe('helpers', () => {
  it('maps every source to a query tool', () => {
    expect(SOURCES.map(toolName)).toContain('query_uk_company_profiles');
  });

  it('reads a register result in the live MCP shape and in the old one', () => {
    expect(parseRegisterResult(registerResult('uk-sanctions', [{ a: 1 }, { a: 2 }]))).toEqual({
      total: 2,
      records: [{ a: 1 }, { a: 2 }],
    });
    expect(parseRegisterResult('{"ok":true,"data":[],"meta":{"total":1234}}').total).toBe(1234);
    expect(parseRegisterResult('{"total":3,"items":[{"b":1}]}')).toEqual({ total: 3, records: [{ b: 1 }] });
    expect(parseRegisterResult('error: slow')).toEqual({ total: null, records: [] });
    expect(parseRegisterResult('[1,2]')).toEqual({ total: null, records: [] });
  });

  it('cleans a typed company name and rejects the rest', () => {
    expect(cleanCompany('  Acme\tWidgets  Ltd ')).toBe('Acme Widgets Ltd');
    expect(cleanCompany('A')).toBeNull();
    expect(cleanCompany('x'.repeat(81))).toBeNull();
    expect(cleanCompany(42)).toBeNull();
  });

  it('summarises a step by its match count or its length', () => {
    const step: Step = { tool: 'query_uk_sanctions', args: { q: 'Acme' }, result: '{"total":0}' };
    expect(stepSummary(step)).toBe('query_uk_sanctions "Acme" → 0 matches');
    expect(stepSummary({ ...step, result: registerResult('uk-sanctions', [{ a: 1 }]) })).toBe('query_uk_sanctions "Acme" → 1 match');
    expect(stepSummary({ ...step, result: 'plain text' })).toBe('query_uk_sanctions "Acme" → 10 chars');
  });
});
