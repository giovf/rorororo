// UK counterparty due-diligence agent — the model-agnostic core (hackathons
// `meta-global-ai-hackathon-entry`, 2026-10-26). A model with tool calling works through gankdat's
// MCP tools — the same `query_<register>` tools Claude, Cursor and ChatGPT get from
// https://gankdat.com/mcp — and writes a one-page risk report for a named UK company. This file
// is pure (fetch and JSON, no Node modules) so one copy runs in two places: the landing Worker's
// /diligence page (packages/landing/src/index.ts streams it to the browser) and the CLI
// (scripts/meta-diligence-agent.ts). It supersedes the loop in scripts/nebius-diligence-agent.ts,
// which stays as the record of the dropped Nebius entry.
//
// Model side: any OpenAI-compatible chat-completions endpoint with `tools`. The entry runs Meta's
// Muse Spark on Meta Model API (https://api.meta.ai/v1, docs read 2026-10-26 through the relay:
// `muse-spark-1.3`, bearer key, `reasoning_effort`, US$1.25 in / US$4.25 out per million tokens);
// the open-weight Muse Spark Open on Baseten, Modal or Fireworks is the same request with another
// base URL and model id. Spend guard: at most MAX_CALLS model calls and MAX_TOKENS tokens per run,
// abort beyond — a looping model can never cost more than a couple of dollars, and a normal run is
// three calls and a few cents. On Meta Model API only Muse Spark models pass the guard (Muse Wonder
// is 16× the price per token and buys nothing for a tool loop over seven registers).

export const GANKDAT_MCP_URL = 'https://gankdat.com/mcp';
export const PROTOCOL_VERSION = '2025-06-18';
export const USER_AGENT = 'foundry-diligence-agent/2 (meta-global-ai-hackathon)';
export const META_BASE_URL = 'https://api.meta.ai/v1';
export const META_DEFAULT_MODEL = 'muse-spark-1.3';
export const MAX_CALLS = 40;
export const MAX_TOKENS = 300_000;
export const MAX_TURNS = 12;
/** How much the model thinks before each answer; `none` is rejected by Muse Spark, `low` is plenty here. */
export const REASONING_EFFORT = 'low';
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
    'register at a time, with the company name as `q`; you may call several tools in one turn. Never',
    'invent a record: every statement in the report cites the tool that returned it, and a register',
    'with no match says so. Keep each tool result as the only evidence for what it covers.',
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
  /** Called after each tool result lands, so a UI can show the registers being read. */
  onStep?: (step: Step) => void | Promise<void>;
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
      const step: Step = { tool: c.function.name, args, result };
      steps.push(step);
      messages.push({ role: 'tool', tool_call_id: c.id, content: result });
      if (o.onStep) await o.onStep(step);
    }
  }
  throw new BudgetExceeded(`${o.maxTurns ?? MAX_TURNS} turns without a report`);
}

// --- the model: any OpenAI-compatible chat-completions endpoint ---

export interface ModelConfig {
  /** `https://api.meta.ai/v1`, or a partner endpoint serving Muse Spark Open. */
  baseUrl: string;
  model: string;
  apiKey: string;
  /** Sent only when set; Meta Model API accepts minimal…xhigh (`none` is a 400 on Muse Spark). */
  reasoningEffort?: string;
}

/** True when the base URL is Meta Model API: there the guard admits only Muse Spark models. */
export function isMetaModelApi(baseUrl: string): boolean {
  try {
    return new URL(baseUrl).hostname === 'api.meta.ai';
  } catch {
    return false;
  }
}

export function modelAllowed(baseUrl: string, model: string): boolean {
  return model.length > 0 && (!isMetaModelApi(baseUrl) || model.startsWith('muse-spark'));
}

/** Chat completions with tool calling on, the request shape Meta Model API documents. */
export function openAiChat(cfg: ModelConfig, fetchFn: FetchLike = fetch): ChatFn {
  if (!modelAllowed(cfg.baseUrl, cfg.model))
    throw new BudgetExceeded(
      `model ${cfg.model || '(unset)'} is not allowed on ${cfg.baseUrl} (Muse Spark only on Meta Model API)`,
    );
  const url = `${cfg.baseUrl.replace(/\/$/, '')}/chat/completions`;
  // Meta Model API names the output cap max_completion_tokens (max_tokens is a deprecated alias
  // there); partner endpoints serving the open weights mostly know only max_tokens.
  const capField = isMetaModelApi(cfg.baseUrl) ? 'max_completion_tokens' : 'max_tokens';
  return async (messages, tools) => {
    const body: Record<string, unknown> = {
      model: cfg.model,
      messages,
      tools,
      tool_choice: 'auto',
      [capField]: 4000,
    };
    if (cfg.reasoningEffort) body['reasoning_effort'] = cfg.reasoningEffort;
    const res = await fetchFn(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${cfg.apiKey}`,
        'user-agent': USER_AGENT,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(90_000),
    });
    if (!res.ok) throw new Error(`model ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const data: unknown = await res.json();
    return data as ChatResponse;
  };
}

// --- the tools: gankdat's MCP server, discovered at run time ---

interface RpcMessage {
  result?: Record<string, unknown>;
  error?: { code?: number; message?: string };
}

interface RpcTool {
  name?: unknown;
  description?: unknown;
  inputSchema?: unknown;
}

/** The JSON-RPC message in a plain JSON or an SSE (`data:` line) response body. */
export async function rpcBody(res: Response): Promise<RpcMessage | null> {
  const contentType = res.headers.get('content-type') ?? '';
  const text = await res.text();
  try {
    if (contentType.includes('text/event-stream')) {
      const line = text.split('\n').find((l) => l.startsWith('data:'));
      return line ? (JSON.parse(line.slice(5)) as RpcMessage) : null;
    }
    return text ? (JSON.parse(text) as RpcMessage) : null;
  } catch {
    return null;
  }
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
  if (key) headers['authorization'] = `Bearer ${key}`;
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

/** Discover gankdat's `query_*` tools over MCP and return a caller limited to the seven registers. */
export async function gankdatTools(
  url = GANKDAT_MCP_URL,
  key?: string,
  fetchFn: FetchLike = fetch,
): Promise<{ tools: ToolDef[]; callTool: ToolCallFn }> {
  await rpc(url, key, fetchFn, 1, 'initialize', {
    protocolVersion: PROTOCOL_VERSION,
    capabilities: {},
    clientInfo: { name: 'foundry-diligence-agent', version: '2' },
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

// --- dry run: a scripted model and canned registers, so tests and rehearsals need no key ---

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
  const why =
    verdict === 'LOW'
      ? 'no sanctions or insolvency record'
      : verdict === 'MEDIUM'
        ? 'an insolvency notice is on the Gazette; no sanctions match'
        : 'a sanctions match';
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
    `${verdict} risk — ${why}.`,
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

// --- shared by the page and the CLI ---

/** A company name as typed by a user: trimmed, control characters out, 2–80 characters or null. */
export function cleanCompany(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  const name = [...input]
    .map((ch) => {
      const code = ch.codePointAt(0) ?? 0;
      return code < 32 || code === 127 ? ' ' : ch;
    })
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
  return name.length >= 2 && name.length <= 80 ? name : null;
}

/** One line of what a tool returned, for a transcript or a progress list. */
export function stepSummary(step: Step): string {
  let total: number | null = null;
  try {
    const parsed: unknown = JSON.parse(step.result);
    if (typeof parsed === 'object' && parsed !== null && 'total' in parsed)
      total = Number(parsed.total);
  } catch {
    total = null;
  }
  const q = typeof step.args['q'] === 'string' ? step.args['q'] : JSON.stringify(step.args);
  const matches = total === null ? `${step.result.length} chars` : `${total} match${total === 1 ? '' : 'es'}`;
  return `${step.tool} "${q}" → ${matches}`;
}
