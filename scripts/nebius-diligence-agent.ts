// UK counterparty due-diligence agent for the Nebius × NVIDIA Global AI Hackathon entry
// (hackathons `nebius-diligence-agent`, 2026-10-13): an NVIDIA Nemotron model served by Nebius
// Token Factory (OpenAI-compatible chat API, function calling) works through gankdat's MCP tools —
// the same `query_<source>` tools Claude and Cursor get from https://gankdat.com/mcp — and writes a
// one-page risk report for a named UK company.
//
//   NEBIUS_API_KEY=… node --disable-warning=ExperimentalWarning scripts/nebius-diligence-agent.ts "Acme Widgets Ltd"
//   node … scripts/nebius-diligence-agent.ts --dry-run "Acme Widgets Ltd"     (no network: scripted model + fixtures)
//
// Spend guard (ventures/hackathons/RESEARCH.md §2b): only a Nano-class Nemotron model, at most
// MAX_CALLS model calls and MAX_TOKENS tokens per run — the run aborts past either, so a looping
// model can never cost more than a few cents. GANKDAT_API_KEY is optional: without it the tools
// answer in preview mode (a few rows, a daily call cap), which the demo needs no more than.
import { writeFile } from 'node:fs/promises';
import process from 'node:process';
import { PROTOCOL_VERSION, rpcBody } from './mcp-probe.ts';

export const NEBIUS_BASE_URL = 'https://api.tokenfactory.nebius.com/v1';
export const DEFAULT_MODEL = 'nvidia/Nemotron-3_5-Lightning';
/** The only models the guard lets a live run use (US$0.06 in / US$0.24 out per million tokens). */
export const NANO_MODELS: readonly string[] = [
  DEFAULT_MODEL,
  'nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B',
];
export const MAX_CALLS = 40;
export const MAX_TOKENS = 300_000;
export const MAX_TURNS = 12;
export const GANKDAT_MCP_URL = 'https://gankdat.com/mcp';
export const USER_AGENT = 'foundry-nebius-diligence-agent/1';
/** The registers the agent may read, as gankdat source slugs (tool `query_<slug with _>`). */
export const SOURCES: readonly string[] = [
  'uk-companies',
  'uk-company-profiles',
  'uk-insolvency',
  'uk-sanctions',
  'uk-sponsors',
  'uk-charities',
  'uk-contract-awards',
];

export interface ToolCall {
  id: string;
  type: 'function';
  function: { name: string; arguments: string };
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
}

export interface ToolDef {
  type: 'function';
  function: { name: string; description: string; parameters: Record<string, unknown> };
}

export interface Usage {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
}

export interface ChatResponse {
  choices: { message: ChatMessage; finish_reason?: string }[];
  usage?: Usage;
}

export type ChatFn = (messages: ChatMessage[], tools: ToolDef[]) => Promise<ChatResponse>;
export type ToolCallFn = (name: string, args: Record<string, unknown>) => Promise<string>;
export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export interface Step {
  tool: string;
  args: Record<string, unknown>;
  result: string;
}

export class BudgetExceeded extends Error {
  constructor(what: string) {
    super(`spend guard: ${what}`);
    this.name = 'BudgetExceeded';
  }
}

/** Counts model calls and tokens; throws before the run can cost more than its cap. */
export class Budget {
  calls = 0;
  tokens = 0;
  readonly maxCalls: number;
  readonly maxTokens: number;
  constructor(maxCalls = MAX_CALLS, maxTokens = MAX_TOKENS) {
    this.maxCalls = maxCalls;
    this.maxTokens = maxTokens;
  }

  /** Call before a model request. */
  reserve(): void {
    if (this.calls >= this.maxCalls)
      throw new BudgetExceeded(`${this.maxCalls} model calls reached`);
    this.calls += 1;
  }

  /** Call after a model response; falls back to a character estimate when usage is absent. */
  charge(usage: Usage | undefined, messages: ChatMessage[]): void {
    const used =
      (usage?.total_tokens ?? (usage?.prompt_tokens ?? 0) + (usage?.completion_tokens ?? 0)) ||
      Math.ceil(messages.reduce((n, m) => n + (m.content?.length ?? 0), 0) / 4);
    this.tokens += used;
    if (this.tokens > this.maxTokens)
      throw new BudgetExceeded(`${this.maxTokens} tokens exceeded (${this.tokens})`);
  }
}

export function systemPrompt(): string {
  return [
    'You are a UK counterparty due-diligence analyst. You check a named company against official',
    'registers through the tools provided (Companies House, insolvency notices, the UK sanctions list,',
    'licensed sponsors, the charity register, public contract awards). Call the tools you need, one',
    'register at a time, with the company name as `q`. Never invent a record: every statement in the',
    'report cites the tool that returned it, and a register with no match says so.',
    'When the evidence is in, answer with a one-page Markdown report titled',
    '"Due diligence: <company>" with sections Identity, Red flags, Public money, Verdict (one of',
    'LOW / MEDIUM / HIGH risk with one sentence why) and Sources (one line per tool called).',
  ].join(' ');
}

export function toolName(slug: string): string {
  return `query_${slug.replace(/-/g, '_')}`;
}

function parseArgs(text: string): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(text || '{}');
    return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

export interface RunOptions {
  company: string;
  chat: ChatFn;
  tools: ToolDef[];
  callTool: ToolCallFn;
  budget?: Budget;
  maxTurns?: number;
}

export interface RunResult {
  report: string;
  steps: Step[];
  budget: Budget;
}

/** The tool loop: ask the model, run every tool it asks for, repeat until it answers in prose. */
export async function runAgent(o: RunOptions): Promise<RunResult> {
  const budget = o.budget ?? new Budget();
  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt() },
    { role: 'user', content: `Run due diligence on: ${o.company}` },
  ];
  const steps: Step[] = [];
  for (let turn = 0; turn < (o.maxTurns ?? MAX_TURNS); turn += 1) {
    budget.reserve();
    const res = await o.chat(messages, o.tools);
    budget.charge(res.usage, messages);
    const msg = res.choices[0]?.message;
    if (!msg) throw new Error('model returned no choices');
    messages.push(msg);
    const calls = msg.tool_calls ?? [];
    if (calls.length === 0) return { report: msg.content ?? '', steps, budget };
    for (const c of calls) {
      const args = parseArgs(c.function.arguments);
      const result = await o.callTool(c.function.name, args);
      steps.push({ tool: c.function.name, args, result });
      messages.push({ role: 'tool', tool_call_id: c.id, content: result });
    }
  }
  throw new BudgetExceeded(`${o.maxTurns ?? MAX_TURNS} turns without a report`);
}

/** Nebius Token Factory chat completions (OpenAI-compatible), tool calling on. */
export function nebiusChat(
  apiKey: string,
  model = DEFAULT_MODEL,
  baseUrl = NEBIUS_BASE_URL,
  fetchFn: FetchLike = fetch,
): ChatFn {
  if (!NANO_MODELS.includes(model))
    throw new BudgetExceeded(`model ${model} is not Nano-class (${NANO_MODELS.join(', ')})`);
  return async (messages, tools) => {
    const res = await fetchFn(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
        'user-agent': USER_AGENT,
      },
      body: JSON.stringify({ model, messages, tools, tool_choice: 'auto', temperature: 0.1 }),
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) throw new Error(`Nebius ${res.status}: ${(await res.text()).slice(0, 200)}`);
    return (await res.json()) as ChatResponse;
  };
}

interface RpcTool {
  name?: unknown;
  description?: unknown;
  inputSchema?: unknown;
}

async function rpc(
  url: string,
  key: string | undefined,
  fetchFn: FetchLike,
  id: number,
  method: string,
  params: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    accept: 'application/json, text/event-stream',
    'user-agent': USER_AGENT,
  };
  if (key) headers.authorization = `Bearer ${key}`;
  const res = await fetchFn(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ jsonrpc: '2.0', id, method, params }),
    signal: AbortSignal.timeout(30_000),
  });
  const message = await rpcBody(res);
  if (res.status !== 200 || !message?.result)
    throw new Error(`gankdat ${method} ${res.status}: ${message?.error?.message ?? 'no result'}`);
  return message.result;
}

/** Discover gankdat's `query_*` tools over MCP and return a caller for them. */
export async function gankdatTools(
  url = GANKDAT_MCP_URL,
  key = process.env['GANKDAT_API_KEY'],
  fetchFn: FetchLike = fetch,
): Promise<{ tools: ToolDef[]; callTool: ToolCallFn }> {
  await rpc(url, key, fetchFn, 1, 'initialize', {
    protocolVersion: PROTOCOL_VERSION,
    capabilities: {},
    clientInfo: { name: 'foundry-nebius-diligence-agent', version: '1' },
  });
  const listed = await rpc(url, key, fetchFn, 2, 'tools/list', {});
  const wanted = new Set(SOURCES.map(toolName));
  const raw = Array.isArray(listed['tools']) ? (listed['tools'] as RpcTool[]) : [];
  const tools: ToolDef[] = raw
    .filter(
      (t): t is RpcTool & { name: string } => typeof t.name === 'string' && wanted.has(t.name),
    )
    .map((t) => ({
      type: 'function',
      function: {
        name: t.name,
        description: typeof t.description === 'string' ? t.description : '',
        parameters:
          typeof t.inputSchema === 'object' && t.inputSchema !== null
            ? (t.inputSchema as Record<string, unknown>)
            : { type: 'object', properties: {} },
      },
    }));
  let id = 2;
  const callTool: ToolCallFn = async (name, args) => {
    if (!wanted.has(name)) return `error: ${name} is not one of the diligence registers`;
    id += 1;
    const result = await rpc(url, key, fetchFn, id, 'tools/call', { name, arguments: args });
    const content = Array.isArray(result['content']) ? (result['content'] as unknown[]) : [];
    return content
      .map((c) =>
        typeof c === 'object' && c !== null && 'text' in c && typeof c.text === 'string'
          ? c.text
          : '',
      )
      .join('\n')
      .slice(0, 6000);
  };
  return { tools, callTool };
}

// --- dry run: a scripted model and canned registers, so tests and the demo need no key ---

export const FIXTURES: Record<string, (q: string) => string> = {
  query_uk_companies: (q) =>
    JSON.stringify({
      total: 1,
      items: [
        {
          company_number: '01234567',
          company_name: q.toUpperCase(),
          company_status: 'active',
          incorporation_date: '2009-03-04',
          sic_codes: ['62012'],
          registered_office: 'Manchester',
        },
      ],
    }),
  query_uk_sanctions: () => JSON.stringify({ total: 0, items: [] }),
  query_uk_insolvency: (q) =>
    JSON.stringify({
      total: 1,
      items: [
        {
          notice_type: 'Notices of Intended Dividends',
          company: q.toUpperCase(),
          published: '2025-11-02',
          gazette: 'https://www.thegazette.co.uk/notice/4567890',
        },
      ],
    }),
  query_uk_sponsors: () => JSON.stringify({ total: 0, items: [] }),
  query_uk_contract_awards: (q) =>
    JSON.stringify({
      total: 1,
      items: [
        {
          buyer: 'Manchester City Council',
          supplier: q.toUpperCase(),
          value_gbp: 48000,
          awarded: '2024-06-18',
        },
      ],
    }),
};

export function dryRunTools(): { tools: ToolDef[]; callTool: ToolCallFn } {
  const tools: ToolDef[] = SOURCES.map((slug) => ({
    type: 'function',
    function: {
      name: toolName(slug),
      description: `Search the ${slug} register (dry run).`,
      parameters: { type: 'object', properties: { q: { type: 'string' } } },
    },
  }));
  const callTool: ToolCallFn = (name, args) => {
    const q = typeof args['q'] === 'string' ? args['q'] : '';
    const f = FIXTURES[name];
    return Promise.resolve(f ? f(q) : JSON.stringify({ total: 0, items: [] }));
  };
  return { tools, callTool };
}

/** The report shape the live model is asked for, filled from the dry-run fixtures. */
export function renderReport(company: string, steps: Step[]): string {
  const by = new Map(steps.map((s) => [s.tool, s.result]));
  const count = (tool: string): number => {
    try {
      const parsed: unknown = JSON.parse(by.get(tool) ?? '{}');
      return typeof parsed === 'object' && parsed !== null && 'total' in parsed
        ? Number(parsed.total)
        : 0;
    } catch {
      return 0;
    }
  };
  const insolvency = count('query_uk_insolvency');
  const sanctions = count('query_uk_sanctions');
  const verdict = sanctions > 0 ? 'HIGH' : insolvency > 0 ? 'MEDIUM' : 'LOW';
  return [
    `# Due diligence: ${company}`,
    '',
    '## Identity',
    `- Companies House: ${count('query_uk_companies')} match (query_uk_companies) — active since 2009, SIC 62012, Manchester.`,
    '',
    '## Red flags',
    `- Sanctions: ${sanctions} match (query_uk_sanctions).`,
    `- Insolvency notices: ${insolvency} (query_uk_insolvency) — Notices of Intended Dividends, Gazette 2025-11-02.`,
    '',
    '## Public money',
    `- Contract awards: ${count('query_uk_contract_awards')} (query_uk_contract_awards) — Manchester City Council, £48,000, 2024-06.`,
    `- Sponsor licence: ${count('query_uk_sponsors')} (query_uk_sponsors).`,
    '',
    '## Verdict',
    `${verdict} risk — ${verdict === 'LOW' ? 'no sanctions or insolvency record' : verdict === 'MEDIUM' ? 'an insolvency notice is on the Gazette; no sanctions match' : 'a sanctions match'}.`,
    '',
    '## Sources',
    ...steps.map((s) => `- ${s.tool} ${JSON.stringify(s.args)}`),
  ].join('\n');
}

/** A scripted "model": turn 1 asks five registers, turn 2 writes the report. */
export function dryRunChat(company: string): ChatFn {
  const order = [
    'query_uk_companies',
    'query_uk_sanctions',
    'query_uk_insolvency',
    'query_uk_sponsors',
    'query_uk_contract_awards',
  ];
  return (messages) => {
    const toolMessages = messages.filter((m) => m.role === 'tool');
    const usage: Usage = { prompt_tokens: 900, completion_tokens: 120, total_tokens: 1020 };
    if (toolMessages.length === 0) {
      return Promise.resolve({
        usage,
        choices: [
          {
            message: {
              role: 'assistant',
              content: null,
              tool_calls: order.map((name, i) => ({
                id: `call_${i + 1}`,
                type: 'function',
                function: { name, arguments: JSON.stringify({ q: company }) },
              })),
            },
            finish_reason: 'tool_calls',
          },
        ],
      });
    }
    const steps: Step[] = toolMessages.map((m, i) => ({
      tool: order[i] ?? 'unknown',
      args: { q: company },
      result: m.content ?? '',
    }));
    return Promise.resolve({
      usage,
      choices: [
        {
          message: { role: 'assistant', content: renderReport(company, steps) },
          finish_reason: 'stop',
        },
      ],
    });
  };
}

export interface Cli {
  company: string;
  dryRun: boolean;
  out?: string;
}

export function parseCli(argv: string[]): Cli {
  const cli: Cli = { company: '', dryRun: false };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i] ?? '';
    if (a === '--dry-run') cli.dryRun = true;
    else if (a === '--out') {
      const v = argv[++i];
      if (v !== undefined) cli.out = v;
    } else cli.company = cli.company ? `${cli.company} ${a}` : a;
  }
  return cli;
}

async function main(): Promise<void> {
  const cli = parseCli(process.argv.slice(2));
  if (!cli.company) {
    console.error(
      'usage: nebius-diligence-agent.ts [--dry-run] [--out report.md] "<company name>"',
    );
    process.exitCode = 2;
    return;
  }
  let chat: ChatFn;
  let tools: { tools: ToolDef[]; callTool: ToolCallFn };
  if (cli.dryRun) {
    chat = dryRunChat(cli.company);
    tools = dryRunTools();
  } else {
    const key = process.env['NEBIUS_API_KEY'];
    if (!key) {
      console.error(
        'NEBIUS_API_KEY is not set (docs/for-owner/actions/025-nebius-token-factory-key.md); use --dry-run',
      );
      process.exitCode = 2;
      return;
    }
    chat = nebiusChat(
      key,
      process.env['NEBIUS_MODEL'] ?? DEFAULT_MODEL,
      process.env['NEBIUS_BASE_URL'] ?? NEBIUS_BASE_URL,
    );
    tools = await gankdatTools(process.env['GANKDAT_MCP_URL'] ?? GANKDAT_MCP_URL);
  }
  const result = await runAgent({ company: cli.company, chat, ...tools });
  for (const s of result.steps)
    console.error(`→ ${s.tool} ${JSON.stringify(s.args)} (${s.result.length} chars)`);
  console.error(
    `model calls ${result.budget.calls}/${result.budget.maxCalls}, tokens ${result.budget.tokens}/${result.budget.maxTokens}${cli.dryRun ? ' (dry run)' : ''}`,
  );
  if (cli.out) await writeFile(cli.out, `${result.report}\n`);
  else console.log(result.report);
}

if (process.argv[1]?.endsWith('nebius-diligence-agent.ts')) {
  main().catch((e: unknown) => {
    console.error(e instanceof Error ? e.message : String(e));
    process.exitCode = 1;
  });
}
