// Live MCP probe from CI: what an agent directory's health checker sees when it connects to
// gankdat's MCP endpoint, written into the Daily numbers row.
//
// Why (gankdat `mcp-live-probe`, 2026-10-08): Glama's hourly health check got "HTTP 500 – Error
// connecting to MCP" on 2026-10-08 06:09 and ranked gankdat unhealthy in its directory; the
// 2026-09-19 Bot Fight Mode challenges were also found by Glama and CI, not by us. No sandbox can
// reach gankdat.com (proxy 403; the relay is GET/HEAD only) and Worker logs are read nowhere, so
// a routine could not tell whether /mcp errors for real traffic or only for one checker's
// profile. The metrics job's runner reaches the edge like any client, so it does the three calls
// a directory does — `initialize`, `tools/list`, one `tools/call` on the first data tool (the
// keyless preview, ≤ 5 rows) — and leaves the HTTP status of each in dist/mcp-probe.json;
// `ventures/gankdat/scripts/metrics.mjs` renders it as `mcp probe: …` and lists a non-200 under
// `refresh errors` as `mcp-probe`, so the two-rows-in-four rule
// (scripts/refresh-errors-to-queue.ts) queues a fix the way it does for a dying source.
// The same three calls also run with a bearer key — the path a checker with a test-profile key
// takes (Glama's is a free-tier key) and the one every paying client uses. The key is minted
// for this one run (gankdat `probe-key-from-runner`, 2026-10-09): `api_keys` stores only the
// SHA-256 of a key (migration 0002) and the runner already writes D1 through the REST API with
// `CLOUDFLARE_API_TOKEN`, so `mintProbeKey` inserts a fresh key's hash under the internal
// `probe@gankdat.com` account (an `@gankdat.com` address — excluded from the accounts, sign-up
// and OAuth readings like the other internal mailboxes; the traffic readings exclude the probe
// by its user agent), the probe runs, and `deleteProbeKey` removes the row and the Worker's
// 60-second KV copy of it. A row left by a killed run is deleted by the next mint. The raw key
// lives in this process only — never in a log, the result file or a repository secret. The
// 10-08 row read `authed: n/a (no GANKDAT_PROBE_KEY)` because that secret is an owner action;
// `GANKDAT_PROBE_KEY`, when set, still wins and nothing is minted. Without either the note says
// why and the keyless run stands alone.
//
// Run: node --disable-warning=ExperimentalWarning scripts/mcp-probe.ts   (metrics job, before
//      metrics.mjs; on push runs too — only node builtins, no npm ci). Never exits non-zero: a
//      dead probe is a reading, not a failed job.
import { createHash, randomBytes } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const DEFAULT_URL = 'https://gankdat.com/mcp';
export const RESULT_FILE = path.join('ventures', 'gankdat', 'dist', 'mcp-probe.json');
/** The slug the row lists a failed probe under, in `refresh errors`. */
export const PROBE_SLUG = 'mcp-probe';
export const USER_AGENT = 'gankdat-mcp-probe/1 (metrics job)';
export const PROTOCOL_VERSION = '2025-06-18';
/** Rows a probe call asks for: the smallest page, so the keyless preview budget barely moves. */
export const PER_PAGE = 1;
/** One call's budget; a hung edge is a reading too. */
export const TIMEOUT_MS = 20_000;

export type StepName = 'initialize' | 'tools/list' | 'tools/call';

export interface ProbeStep {
  name: StepName;
  /** HTTP status, or null when no response arrived (network error, timeout). */
  status: number | null;
  /** What the response said when it was not a clean 200 result; '' otherwise. */
  note: string;
  /** tools/call only: the tool asked. */
  tool?: string;
}

export interface ProbeRun {
  authed: boolean;
  steps: ProbeStep[];
  /** tools/list only: how many tools the server listed. */
  tools: number | null;
}

export interface ProbeResult {
  date: string;
  url: string;
  runs: ProbeRun[];
  /** Why no authed run happened (no key and none could be minted); absent when one ran. */
  authed_skipped?: string;
}

// --- one-run probe key -------------------------------------------------------------------------

/** The internal account the probe key hangs off; `@gankdat.com` keeps it out of every reading. */
export const PROBE_EMAIL = 'probe@gankdat.com';
export const PROBE_KEY_NAME = 'metrics probe (one run)';
/** Same shape as the Worker's `generateKey` (src/auth/keys.ts): `fapi_` + 32 base62 chars. */
const KEY_PREFIX = 'fapi_';
const KEY_LENGTH = 32;
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const FREE_TIER_CREDITS = 250;
// Cloudflare ids, copied from ventures/gankdat/wrangler.jsonc and scripts/runner-refresh.mjs —
// not secrets. The CACHE namespace holds the Worker's `key:<hash>` hot-path copy of a key.
const CF_ACCOUNT_ID = '37e56f3ce4dfe49919e85d4380467f44';
const D1_DATABASE_ID = 'ac051277-5f69-46ba-965b-50da2f1ec524';
const CACHE_NAMESPACE_ID = 'eacc87d970e94b9b87ce944985af0b52';
const CF_API = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}`;

export type SqlFn = (query: string, params?: unknown[]) => Promise<Record<string, unknown>[]>;
export type KvDeleteFn = (key: string) => Promise<void>;

export interface ProbeKey {
  key: string;
  keyId: string;
  hash: string;
}

/** `fapi_` + 32 uniform base62 chars (rejection sampling, like the Worker's generator). */
export function generateProbeKey(
  random: (n: number) => Uint8Array = (n) => randomBytes(n),
): string {
  const chars: string[] = [];
  const limit = 256 - (256 % ALPHABET.length);
  while (chars.length < KEY_LENGTH) {
    for (const byte of random(KEY_LENGTH * 2)) {
      if (byte < limit && chars.length < KEY_LENGTH) chars.push(ALPHABET[byte % ALPHABET.length]!);
    }
  }
  return `${KEY_PREFIX}${chars.join('')}`;
}

/** Hex SHA-256 — the only form of a key `api_keys` holds (src/auth/keys.ts `hashKey`). */
export function sha256Hex(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

/**
 * Insert a fresh key for the probe account and return the raw key for this process only. The
 * account is created once (`ON CONFLICT DO NOTHING`, like the Worker's `getOrCreateAccount`);
 * any key still on it is a killed run's leftover and goes first, so at most one exists.
 */
export async function mintProbeKey(sql: SqlFn, key = generateProbeKey()): Promise<ProbeKey> {
  await sql('INSERT INTO accounts (id, email) VALUES (?1, ?2) ON CONFLICT (email) DO NOTHING', [
    crypto.randomUUID(),
    PROBE_EMAIL,
  ]);
  const [account] = await sql('SELECT id FROM accounts WHERE email = ?1', [PROBE_EMAIL]);
  const accountId = account?.id;
  if (typeof accountId !== 'string' || !accountId) throw new Error('probe account not found');
  await sql('DELETE FROM api_keys WHERE account_id = ?1', [accountId]);
  const keyId = crypto.randomUUID();
  const hash = sha256Hex(key);
  await sql(
    'INSERT INTO api_keys (id, key_hash, email, name, plan, credits_granted, account_id) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)',
    [keyId, hash, PROBE_EMAIL, PROBE_KEY_NAME, 'free', FREE_TIER_CREDITS, accountId],
  );
  return { key, keyId, hash };
}

/**
 * Remove the key: the D1 row, then the Worker's 60-second KV copy (`key:<hash>`, src/auth/
 * middleware.ts) so the key stops authenticating now rather than at the TTL. Best effort on
 * the KV side — the row is what matters, and the next mint sweeps the account anyway.
 */
export async function deleteProbeKey(
  sql: SqlFn,
  kvDelete: KvDeleteFn,
  probeKey: Pick<ProbeKey, 'keyId' | 'hash'>,
): Promise<void> {
  await sql('DELETE FROM api_keys WHERE id = ?1', [probeKey.keyId]);
  try {
    await kvDelete(`key:${probeKey.hash}`);
  } catch {
    // KV copy expires within a minute on its own.
  }
}

/** The two REST calls the mint needs, bound to a Cloudflare API token. */
export function cloudflare(token: string): { sql: SqlFn; kvDelete: KvDeleteFn } {
  const auth = { Authorization: `Bearer ${token}` };
  return {
    sql: async (query, params = []) => {
      const res = await fetch(`${CF_API}/d1/database/${D1_DATABASE_ID}/query`, {
        method: 'POST',
        headers: { ...auth, 'content-type': 'application/json' },
        body: JSON.stringify({ sql: query, params }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      const body = (await res.json()) as {
        success?: boolean;
        errors?: unknown;
        result?: { results?: Record<string, unknown>[] }[];
      };
      if (!body.success) throw new Error(`D1: ${JSON.stringify(body.errors).slice(0, 200)}`);
      return body.result?.[0]?.results ?? [];
    },
    kvDelete: async (key) => {
      const res = await fetch(
        `${CF_API}/storage/kv/namespaces/${CACHE_NAMESPACE_ID}/values/${encodeURIComponent(key)}`,
        { method: 'DELETE', headers: auth, signal: AbortSignal.timeout(TIMEOUT_MS) },
      );
      if (!res.ok) throw new Error(`KV delete: ${res.status}`);
    },
  };
}

interface RpcMessage {
  result?: Record<string, unknown>;
  error?: { code?: number; message?: string };
}

type FetchLike = (url: string, init: RequestInit) => Promise<Response>;

/** The one JSON-RPC message in a Streamable HTTP response: JSON, or the first SSE `data:` line. */
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

/** One line of what a non-OK response said, table-safe and short. */
export function excerpt(text: string): string {
  return text.replace(/\s+/g, ' ').replace(/\|/g, '/').trim().slice(0, 80);
}

/**
 * The first data tool a directory would call: a `query_*` tool that lists rows. Lookup tools
 * (one record per named key — the server's wording for `DataSource.lookup`) answer a keyless call
 * with a tool error naming the keys, which would read as a failure that is not one.
 */
export function pickTool(tools: { name?: unknown; description?: unknown }[]): string | null {
  for (const t of tools) {
    if (typeof t.name !== 'string' || !t.name.startsWith('query_')) continue;
    if (typeof t.description === 'string' && t.description.includes('One record per call'))
      continue;
    return t.name;
  }
  return null;
}

async function call(
  fetchFn: FetchLike,
  url: string,
  key: string | undefined,
  body: Record<string, unknown>,
  timeoutMs: number,
): Promise<{ status: number | null; message: RpcMessage | null; raw: string }> {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    accept: 'application/json, text/event-stream',
    'user-agent': USER_AGENT,
  };
  if (key) headers.authorization = `Bearer ${key}`;
  try {
    const res = await fetchFn(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
    const clone = res.clone();
    const message = await rpcBody(res);
    return { status: res.status, message, raw: message ? '' : await clone.text() };
  } catch (e) {
    return { status: null, message: null, raw: e instanceof Error ? e.message : String(e) };
  }
}

function stepOf(
  name: StepName,
  r: { status: number | null; message: RpcMessage | null; raw: string },
  tool?: string,
): ProbeStep {
  let note = '';
  if (r.status === null) note = excerpt(r.raw || 'no response');
  else if (r.status !== 200) note = excerpt(r.message?.error?.message ?? r.raw ?? '');
  else if (r.message?.error) note = excerpt(`rpc error: ${r.message.error.message ?? ''}`);
  else if (!r.message?.result) note = excerpt(r.raw ? `unreadable body: ${r.raw}` : 'no result');
  const step: ProbeStep = { name, status: r.status, note };
  if (tool !== undefined) step.tool = tool;
  return step;
}

const stepOk = (s: ProbeStep): boolean => s.status === 200 && s.note === '';

/** The three calls, stopping at the first that is not a clean 200 result. */
export async function probeOnce(
  url: string,
  fetchFn: FetchLike,
  key: string | undefined,
  timeoutMs = TIMEOUT_MS,
): Promise<ProbeRun> {
  const run: ProbeRun = { authed: Boolean(key), steps: [], tools: null };
  const init = stepOf(
    'initialize',
    await call(
      fetchFn,
      url,
      key,
      {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: PROTOCOL_VERSION,
          capabilities: {},
          clientInfo: { name: 'gankdat-mcp-probe', version: '1' },
        },
      },
      timeoutMs,
    ),
  );
  run.steps.push(init);
  if (!stepOk(init)) return run;

  const listed = await call(
    fetchFn,
    url,
    key,
    { jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} },
    timeoutMs,
  );
  const list = stepOf('tools/list', listed);
  const tools = Array.isArray(listed.message?.result?.tools)
    ? (listed.message.result.tools as { name?: unknown; description?: unknown }[])
    : [];
  if (stepOk(list)) run.tools = tools.length;
  run.steps.push(list);
  if (!stepOk(list)) return run;

  const tool = pickTool(tools);
  if (!tool) {
    run.steps.push({ name: 'tools/call', status: null, note: 'no query_ tool listed', tool: '' });
    return run;
  }
  const called = await call(
    fetchFn,
    url,
    key,
    {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: { name: tool, arguments: { per_page: PER_PAGE } },
    },
    timeoutMs,
  );
  const step = stepOf('tools/call', called, tool);
  if (stepOk(step) && called.message?.result?.isError === true) {
    const content: unknown = called.message.result.content;
    const first: unknown = Array.isArray(content) ? content[0] : undefined;
    const text =
      typeof first === 'object' &&
      first !== null &&
      'text' in first &&
      typeof first.text === 'string'
        ? first.text
        : '';
    step.note = excerpt(`tool error: ${text}`);
  }
  run.steps.push(step);
  return run;
}

export async function probe(
  url: string,
  fetchFn: FetchLike,
  key: string | undefined,
  today = new Date().toISOString().slice(0, 10),
  timeoutMs = TIMEOUT_MS,
): Promise<ProbeResult> {
  const runs = [await probeOnce(url, fetchFn, undefined, timeoutMs)];
  if (key) runs.push(await probeOnce(url, fetchFn, key, timeoutMs));
  return { date: today, url, runs };
}

const SHORT: Record<StepName, string> = {
  initialize: 'init',
  'tools/list': 'tools',
  'tools/call': 'call',
};

function stepText(s: ProbeStep, run: ProbeRun): string {
  const status = s.status === null ? 'n/a' : String(s.status);
  if (stepOk(s)) {
    if (s.name === 'tools/list' && run.tools !== null)
      return `tools ${status} (${run.tools} tools)`;
    return `${SHORT[s.name]} ${status}`;
  }
  return `${SHORT[s.name]} ${status} (${s.note || 'failed'})`;
}

export function runFailed(run: ProbeRun): boolean {
  return run.steps.length < 3 || run.steps.some((s) => !stepOk(s));
}

/** The row's `mcp probe:` note — `init 200, tools 200 (31 tools), call 200[; authed: …]`. */
export function probeNote(result: ProbeResult): string {
  const parts = result.runs.map((run) => {
    const text = run.steps.map((s) => stepText(s, run)).join(', ');
    return run.authed ? `authed: ${text}` : text;
  });
  if (!result.runs.some((r) => r.authed))
    parts.push(`authed: n/a (${result.authed_skipped ?? 'no key'})`);
  return `mcp probe: ${parts.join('; ')}`;
}

/** The `refresh errors` entry for a failed probe, or null when every run was clean. */
export function probeError(result: ProbeResult): { slug: string; message: string } | null {
  const failed = result.runs.filter(runFailed);
  const parts = failed.map((run) => {
    const bad = run.steps.find((s) => !stepOk(s)) ?? run.steps[run.steps.length - 1];
    const text = bad ? stepText(bad, run) : 'no step ran';
    return run.authed ? `authed ${text}` : text;
  });
  // A mint that failed is the authed reading missing for a reason this side can fix.
  if (result.authed_skipped?.startsWith('mint failed'))
    parts.push(`authed ${result.authed_skipped}`);
  if (parts.length === 0) return null;
  return { slug: PROBE_SLUG, message: parts.join('; ').replace(/,/g, ';') };
}

/**
 * The key for the authed run: `GANKDAT_PROBE_KEY` when set, else one minted for this run with
 * `CLOUDFLARE_API_TOKEN` and deleted after `run`, whatever `run` does. A mint that fails is a
 * reading (`authed_skipped`, listed under `refresh errors` like a failed step so a repeat files
 * a fix), never a crash: the keyless run still stands.
 */
export async function withProbeKey(
  env: { GANKDAT_PROBE_KEY?: string; CLOUDFLARE_API_TOKEN?: string },
  cf: (token: string) => { sql: SqlFn; kvDelete: KvDeleteFn },
  run: (key: string | undefined) => Promise<ProbeResult>,
): Promise<ProbeResult> {
  if (env.GANKDAT_PROBE_KEY) return run(env.GANKDAT_PROBE_KEY);
  if (!env.CLOUDFLARE_API_TOKEN) {
    const result = await run(undefined);
    result.authed_skipped = 'no CLOUDFLARE_API_TOKEN to mint a probe key';
    return result;
  }
  const { sql, kvDelete } = cf(env.CLOUDFLARE_API_TOKEN);
  let minted: ProbeKey;
  try {
    minted = await mintProbeKey(sql);
  } catch (e) {
    const result = await run(undefined);
    result.authed_skipped = excerpt(`mint failed: ${e instanceof Error ? e.message : String(e)}`);
    return result;
  }
  try {
    return await run(minted.key);
  } finally {
    await deleteProbeKey(sql, kvDelete, minted).catch((e: unknown) => {
      console.log(`probe key delete failed: ${e instanceof Error ? e.message : String(e)}`);
    });
  }
}

async function main(): Promise<void> {
  const url = process.env.GANKDAT_MCP_URL || DEFAULT_URL;
  const result = await withProbeKey(process.env, cloudflare, (key) =>
    probe(url, (u, init) => fetch(u, init), key),
  );
  const file = path.resolve(RESULT_FILE);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(result, null, 2)}\n`);
  console.log(probeNote(result));
  const err = probeError(result);
  if (err) console.log(`refresh errors will list ${err.slug} (${err.message})`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
