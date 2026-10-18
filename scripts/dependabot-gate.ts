// A red Dependabot gate becomes one watchdog line in docs/RUNS.md and a foundry queue item.
//
// Why (foundry `dependabot-red-gate-to-queue`, 2026-10-18): the `dependabot` workflow runs the
// full gate on every Dependabot pull request and merges minor/patch groups when green. Its first
// two real runs (PRs #5 and #6, 2026-10-16 18:32) failed at typecheck and nothing in the repo knew
// for 30 hours — GitHub mails a run failure to its actor, here dependabot[bot], so no `Run failed`
// reached triage, no RUNS line was written and no queue item existed; the burn-down found it by
// listing the workflow's runs by hand. An auto-merge rule that fails silently is worse than none,
// so the watchdog step of `notify owner` (every routine push and a 6-hourly cron, GITHUB_TOKEN with
// actions:read and pull-requests:read) runs this: for every open Dependabot PR whose latest gate
// run on its head commit concluded `failure`, one `| watchdog | dependabot: PR #N …` line (the line
// on main is the dedupe record, by PR number and head sha) and an idempotent foundry item
// `dependabot-pr-<N>` — score 5 for a minor/patch group the routine fixes forward on main and
// rebases, 3 for a majors group that stays for an attended session — the refresh-errors-to-queue
// pattern. A PR whose gate is green, running or absent (no run on its head yet) files nothing.
//
// Run: node --disable-warning=ExperimentalWarning scripts/dependabot-gate.ts   (repo root, CI)
// Node 22 runs .ts directly — keep syntax erasable, import only node builtins (a sibling's `.js`
// import does not resolve outside vitest/tsc; types alone are erased, so they may be imported).
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Queue, QueueItem } from './refresh-errors-to-queue.js';

export const QUEUE_FILE = path.join('docs', 'pipeline', 'queues', 'foundry.json');
export const RUNS_FILE = path.join('docs', 'RUNS.md');
export const GATE_WORKFLOW = 'dependabot.yml';
export const DEPENDABOT = 'dependabot[bot]';
export const SCORE_MINOR = 5;
export const SCORE_MAJOR = 3;
export const EFFORT_DAYS = 0.2;
/** docs/RUNS.md lines are capped at 120 chars of text (scripts/runs-check.ts); the step name is cut to fit. */
const STEP_MAX = 40;
const RUNS_CAP = 120;

export interface PullRequest {
  number: number;
  title: string;
  headSha: string;
  author: string;
  url: string;
}
export interface GateRun {
  headSha: string;
  /** `success`, `failure`, … or null while the run is still going. */
  conclusion: string | null;
  createdAt: string;
  url: string;
  /** Name of the first failed step, when the run failed and the jobs were read. */
  failingStep?: string;
}
export interface GateInput {
  prs: PullRequest[];
  runs: GateRun[];
  runsText: string;
  queue: Queue;
  now: Date;
}
export interface RedGate {
  pr: PullRequest;
  run: GateRun;
  group: string;
}
export interface GateOutput {
  lines: string[];
  /** The same object when nothing changed, a copy otherwise. */
  queue: Queue;
  red: RedGate[];
}

const pad = (n: number): string => String(n).padStart(2, '0');
/** `YYYY-MM-DD HH:MM` in UTC, the run-log stamp (same as scripts/run-watchdog.ts). */
export function stamp(d: Date): string {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

export function serialize(queue: Queue): string {
  return `${JSON.stringify(queue, null, 2)}\n`;
}

/** `build(deps): bump the minor-and-patch group with 13 updates` → `minor-and-patch`; `deps` when the title has no group. */
export function groupOf(title: string): string {
  return /bump the (\S+) group/.exec(title)?.[1] ?? 'deps';
}

export function itemId(pr: PullRequest): string {
  return `dependabot-pr-${pr.number}`;
}

/** The latest gate run on the PR's head commit, if any. */
export function latestRun(pr: PullRequest, runs: GateRun[]): GateRun | undefined {
  return runs
    .filter((r) => r.headSha === pr.headSha)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))[0];
}

/** Open Dependabot PRs whose latest gate run on the head commit failed. */
export function redGates(prs: PullRequest[], runs: GateRun[]): RedGate[] {
  const red: RedGate[] = [];
  for (const pr of prs) {
    if (pr.author !== DEPENDABOT) continue;
    const run = latestRun(pr, runs);
    if (run?.conclusion !== 'failure') continue;
    red.push({ pr, run, group: groupOf(pr.title) });
  }
  return red;
}

/** True when a line for this PR on this head sha is already in docs/RUNS.md (the dedupe record). */
export function alreadyReported(runsText: string, gate: RedGate): boolean {
  const pr = `| watchdog | dependabot: PR #${gate.pr.number} `;
  const sha = `(${gate.pr.headSha.slice(0, 7)})`;
  return runsText.split('\n').some((l) => l.includes(pr) && l.includes(sha));
}

function stepName(run: GateRun, max: number): string {
  const step = run.failingStep ?? 'an unnamed step';
  return step.length > max ? `${step.slice(0, max - 1)}…` : step;
}

/** The run-log line; the step name is cut until the text fits the 120-char cap. */
export function gateLine(gate: RedGate, now: Date): string {
  for (let max = STEP_MAX; ; max -= 4) {
    const text = `dependabot: PR #${gate.pr.number} ${gate.group} gate red at ${stepName(gate.run, max)} (${gate.pr.headSha.slice(0, 7)}); foundry ${itemId(gate.pr)} filed`;
    if (text.length <= RUNS_CAP || max <= 8) return `- ${stamp(now)} | watchdog | ${text}`;
  }
}

function isMajors(group: string): boolean {
  return /major/.test(group);
}

export function newItem(gate: RedGate, today: string): QueueItem {
  const majors = isMajors(gate.group);
  return {
    id: itemId(gate.pr),
    title: `Dependabot PR #${gate.pr.number} (${gate.group}) is red at ${stepName(gate.run, STEP_MAX)}: ${majors ? 'root-cause it for the attended session' : 'fix forward on main and comment @dependabot rebase'}`,
    why: whySentence(gate, today),
    effort_days: EFFORT_DAYS,
    proof: majors
      ? `the failure is root-caused in this item's why and the attended session can merge or close PR #${gate.pr.number} from it`
      : `PR #${gate.pr.number} merged by the dependabot workflow's gate-and-merge job`,
    score: majors ? SCORE_MAJOR : SCORE_MINOR,
    status: 'todo',
    added: today,
    updated: today,
  };
}

function whySentence(gate: RedGate, today: string): string {
  const kind = isMajors(gate.group)
    ? 'a majors group, which the dependabot workflow leaves open for an attended session'
    : 'a minor/patch group the workflow merges itself once the gate is green';
  return `Filed by scripts/dependabot-gate.ts (${today}): the gate on ${gate.pr.url} (${gate.pr.title}) failed at "${gate.run.failingStep ?? 'an unnamed step'}" on ${gate.pr.headSha.slice(0, 7)} — ${gate.run.url}. This is ${kind}. Read the job log for the first error, fix the code on main when the bump is right and the code is wrong (the usual case: a widened type, a renamed export), then comment \`@dependabot rebase\` on the PR so the gate re-runs; when the bump itself is wrong, say so here and leave the PR to the attended session.`;
}

/**
 * Lines to append and the queue to write. A gate already reported (its line key is in docs/RUNS.md)
 * files nothing again; an open item for the PR is refreshed with the new sha's sentence instead of
 * duplicated; a done or dropped item is reopened when the PR goes red on a newer head commit.
 */
export function dependabotGate(input: GateInput): GateOutput {
  const today = stamp(input.now).slice(0, 10);
  const red = redGates(input.prs, input.runs);
  const lines: string[] = [];
  let queue = input.queue;
  let items = queue.items;
  for (const gate of red) {
    if (alreadyReported(input.runsText, gate)) continue;
    lines.push(gateLine(gate, input.now));
    const id = itemId(gate.pr);
    const existing = items.find((i) => i.id === id);
    if (!existing) {
      items = [...items, newItem(gate, today)];
    } else {
      const open =
        existing.status === 'todo' || existing.status === 'doing' || existing.status === 'blocked';
      const reopened: QueueItem = {
        ...existing,
        status: open ? existing.status : 'todo',
        why: `${existing.why} ${whySentence(gate, today)}`,
        updated: today,
      };
      if (!open) delete reopened.done_at;
      items = items.map((i) => (i.id === id ? reopened : i));
    }
  }
  if (lines.length > 0) queue = { ...queue, items, updated: today };
  return { lines, queue, red };
}

interface GhPull {
  number: number;
  title: string;
  html_url: string;
  head: { sha: string };
  user: { login: string } | null;
}
interface GhRun {
  id: number;
  head_sha: string;
  conclusion: string | null;
  created_at: string;
  html_url: string;
}
interface GhJob {
  conclusion: string | null;
  steps?: { name: string; conclusion: string | null }[];
}

async function gh<T>(url: string, token: string): Promise<T | undefined> {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, accept: 'application/vnd.github+json' },
  });
  if (!res.ok) {
    console.log(`dependabot-gate: GitHub API ${res.status} for ${url}; skipping`);
    return undefined;
  }
  return (await res.json()) as T;
}

/** Reads open PRs, the gate workflow's runs and the failing step of each red run from the GitHub API. */
export async function readGitHub(
  repo: string,
  token: string,
): Promise<{ prs: PullRequest[]; runs: GateRun[] } | undefined> {
  const api = `https://api.github.com/repos/${repo}`;
  const pulls = await gh<GhPull[]>(`${api}/pulls?state=open&per_page=50`, token);
  if (!pulls) return undefined;
  const prs: PullRequest[] = pulls.map((p) => ({
    number: p.number,
    title: p.title,
    headSha: p.head.sha,
    author: p.user?.login ?? '',
    url: p.html_url,
  }));
  if (!prs.some((p) => p.author === DEPENDABOT)) return { prs, runs: [] };
  const body = await gh<{ workflow_runs?: GhRun[] }>(
    `${api}/actions/workflows/${GATE_WORKFLOW}/runs?per_page=50`,
    token,
  );
  if (!body) return undefined;
  const runs: GateRun[] = [];
  for (const r of body.workflow_runs ?? []) {
    const run: GateRun = {
      headSha: r.head_sha,
      conclusion: r.conclusion,
      createdAt: r.created_at,
      url: r.html_url,
    };
    if (r.conclusion === 'failure' && prs.some((p) => p.headSha === r.head_sha)) {
      const jobs = await gh<{ jobs?: GhJob[] }>(`${api}/actions/runs/${r.id}/jobs`, token);
      const failed = jobs?.jobs?.find((j) => j.conclusion === 'failure');
      const step = failed?.steps?.find((s) => s.conclusion === 'failure')?.name;
      if (step) run.failingStep = step;
    }
    runs.push(run);
  }
  return { prs, runs };
}

async function main(): Promise<void> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.log('dependabot-gate: no GITHUB_TOKEN; skipping');
    return;
  }
  const repo = process.env.GITHUB_REPOSITORY ?? 'giovf/rorororo';
  const read = await readGitHub(repo, token);
  if (!read) return;
  const root = path.resolve(import.meta.dirname, '..');
  const runsPath = path.join(root, RUNS_FILE);
  const queuePath = path.join(root, QUEUE_FILE);
  const runsText = readFileSync(runsPath, 'utf8');
  const queue = JSON.parse(readFileSync(queuePath, 'utf8')) as Queue;
  const out = dependabotGate({ ...read, runsText, queue, now: new Date() });
  if (out.red.length === 0) {
    console.log(
      `dependabot-gate: ${read.prs.filter((p) => p.author === DEPENDABOT).length} open Dependabot PR(s), none red`,
    );
    return;
  }
  if (out.lines.length === 0) {
    console.log(`dependabot-gate: ${out.red.length} red gate(s), all already reported`);
    return;
  }
  appendFileSync(runsPath, `${runsText.endsWith('\n') ? '' : '\n'}${out.lines.join('\n')}\n`);
  writeFileSync(queuePath, serialize(out.queue));
  for (const line of out.lines) console.log(line);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  await main();
