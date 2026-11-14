// Apify token gate for `gankdat publish` (2026-11-14, foundry `apify-publish-token-gate`).
//
// Why: Apify rotated every API token after its 9–10 Nov breach, and run 95 (2026-11-12 11:58) failed at
// "Apify actors — push changed, price, publish" 17 s in. Nothing in the repo was wrong and no routine can
// mint an Apify token, yet every later actor push would have turned the job red again — a `Run failed`
// mail and a watchdog `ci-failed` line a day — until the owner replaced the secret. A third party's
// rotated token is a wait, not a failure.
//
// What it does, before the actor step:
//   GET /v2/users/me with the token
//     200            → `state=ok`; the actor step runs as before.
//     401            → `state=wait`: one `| watchdog | wait: apify token …` line a day in docs/RUNS.md, a
//                      `::warning::` on the run, the actor step is skipped and the job stays green. The
//                      registry step does not use the token and still runs.
//     anything else  → exit 1 (a 5xx, a 403, no network, no token configured: those are real failures).
//   A push that changes an actor while the token waits is not pushed, and its diff range is gone by the
//   time the token works. So the first `ok` after an unanswered wait line sets `catchup=1` (the workflow
//   then pushes every actor, not just the changed ones) and writes one `apify token back` line, which
//   answers the wait.
//
// Run: node scripts/apify-token-gate.ts          (CI; needs APIFY_TOKEN, writes $GITHUB_OUTPUT)
// Node runs .ts directly — keep syntax erasable, import only node builtins.
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const PROBE_URL = 'https://api.apify.com/v2/users/me';
export const WAIT_TEXT =
  'wait: apify token — Apify answers 401; actor publishing paused until a new token is in CI';
export const BACK_TEXT =
  'apify token back: publishing resumed; every actor pushed again in case one changed meanwhile';
const WAIT_MARK = '| watchdog | wait: apify token';
const BACK_MARK = '| watchdog | apify token back';

export type TokenState = 'ok' | 'wait';

/** 200 is a working token, 401 a rotated or revoked one; every other status is a failure to raise. */
export function tokenState(status: number): TokenState {
  if (status >= 200 && status < 300) return 'ok';
  if (status === 401) return 'wait';
  throw new Error(`Apify token probe: unexpected HTTP ${status} from ${PROBE_URL}`);
}

/** One call of the probe; the token never reaches a log line. */
export async function probe(
  token: string,
  fetcher: (url: string, init: { headers: Record<string, string> }) => Promise<{ status: number }>,
): Promise<TokenState> {
  const res = await fetcher(PROBE_URL, { headers: { Authorization: `Bearer ${token}` } });
  return tokenState(res.status);
}

/** `YYYY-MM-DD HH:MM` in UTC, the stamp of a run-log line. */
export function stamp(now: Date): string {
  return now.toISOString().slice(0, 16).replace('T', ' ');
}

/** True while the newest gate line in the run log is a wait line (no `apify token back` after it). */
export function waiting(runsMd: string): boolean {
  let open = false;
  for (const line of runsMd.split('\n')) {
    if (line.includes(WAIT_MARK)) open = true;
    else if (line.includes(BACK_MARK)) open = false;
  }
  return open;
}

/** True when the run log already carries a wait line dated `day` (YYYY-MM-DD). */
export function waitedOn(runsMd: string, day: string): boolean {
  return runsMd.split('\n').some((l) => l.startsWith(`- ${day} `) && l.includes(WAIT_MARK));
}

export interface GateResult {
  state: TokenState;
  /** The first `ok` after an unanswered wait: push every actor, not just the changed ones. */
  catchup: boolean;
  /** The run log to write back; the same text when no line is due. */
  runsMd: string;
  /** The line appended, if any (without the leading newline). */
  line?: string;
}

/** The run-log change and step outputs for one probe result. Pure: no clock, no file. */
export function gate(state: TokenState, runsMd: string, now: Date): GateResult {
  const append = (text: string): { runsMd: string; line: string } => {
    const line = `- ${stamp(now)} | watchdog | ${text}`;
    return { runsMd: `${runsMd.replace(/\n*$/, '')}\n${line}\n`, line };
  };
  if (state === 'wait') {
    if (waitedOn(runsMd, stamp(now).slice(0, 10))) return { state, catchup: false, runsMd };
    return { state, catchup: false, ...append(WAIT_TEXT) };
  }
  if (waiting(runsMd)) return { state, catchup: true, ...append(BACK_TEXT) };
  return { state, catchup: false, runsMd };
}

async function main(): Promise<void> {
  const token = process.env.APIFY_TOKEN;
  if (!token) {
    console.error('APIFY_TOKEN missing: the secret is not configured for this workflow');
    process.exit(1);
  }
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const runsFile = path.join(root, 'docs', 'RUNS.md');
  const state = await probe(token, (url, init) => fetch(url, init));
  const result = gate(state, readFileSync(runsFile, 'utf8'), new Date());
  if (result.line) {
    writeFileSync(runsFile, result.runsMd);
    console.log(result.line);
  }
  if (state === 'wait') {
    console.log(
      '::warning title=Apify token::Apify answers 401 for the CI token (rotated or revoked). The actor step is skipped and the job stays green; replace the APIFY_TOKEN secret to resume.',
    );
  } else {
    console.log(
      `Apify token ok${result.catchup ? '; first run after a wait — every actor is pushed' : ''}`,
    );
  }
  const out = process.env.GITHUB_OUTPUT;
  if (out) appendFileSync(out, `state=${state}\ncatchup=${result.catchup ? '1' : ''}\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  await main();
