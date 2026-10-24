// Every failed GitHub Actions run becomes one watchdog line in docs/RUNS.md; a workflow failing
// twice in a week becomes a foundry queue item.
//
// Why (foundry `watchdog-ci-failed-runs`, 2026-10-24): three `Run failed` mails in 36 h (fetch relay
// 10-22 18:39 and 21:25, gankdat publish 10-23 17:35) were each triaged "failing step not named in
// the mail", and the publish failure (run 54: registry-publish.sh exited 1) was read by nobody for
// 8.5 h — the routine prompts check only a new workflow's first run, triage reads mail, and the run
// watchdog reads `workflow_dispatch` runs for the slot trace only. The watchdog step of `notify
// owner` (2-hourly, GITHUB_TOKEN with actions:read) now runs this: for every run of the last 26 h
// that concluded `failure`, one `| watchdog | ci-failed: <workflow> run N HH:MM — step <name>;
// <later run M ok | later run M <conclusion> | no later run>` line (the line on main is the dedupe
// record, by workflow and run number) and, for a workflow with two or more failed runs in 7 days
// (the lines of the week plus tonight's), an idempotent foundry item `ci-<workflow>-failing`
// (score 5) — the refresh-errors-to-queue / dependabot-gate pattern. Without a token or on an API
// error it writes nothing, like the dispatch read: it never blocks the notifications.
//
// Run: node --disable-warning=ExperimentalWarning scripts/ci-failed-runs.ts   (repo root, CI)
// Node 22 runs .ts directly — keep syntax erasable, import only node builtins (types alone are erased).
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Queue, QueueItem } from './refresh-errors-to-queue.js';

export const QUEUE_FILE = path.join('docs', 'pipeline', 'queues', 'foundry.json');
export const RUNS_FILE = path.join('docs', 'RUNS.md');
/** Failed runs created within this many hours are read (the 2-hourly cron plus a day of skipped fires). */
export const LOOKBACK_HOURS = 26;
/** A workflow with this many failed runs inside REPEAT_DAYS gets a queue item. */
export const REPEAT_RUNS = 2;
export const REPEAT_DAYS = 7;
export const SCORE = 5;
export const EFFORT_DAYS = 0.2;
export const LINE_PREFIX = 'ci-failed: ';
const STEP_MAX = 40;
const RUNS_CAP = 120;

export interface FailedRun {
  /** The workflow file name, e.g. `fetch-relay.yml`. */
  workflow: string;
  /** The workflow's display name (`name:`), used in the item title. */
  name: string;
  runNumber: number;
  /** ISO instant the run was created. */
  createdAt: string;
  url: string;
  /** Name of the first failed step, when the jobs were read. */
  failingStep?: string;
  /** The workflow's next run after this one, when any. */
  later?: { runNumber: number; conclusion: string | null };
}
export interface FailedInput {
  runs: FailedRun[];
  runsText: string;
  queue: Queue;
  now: Date;
}
export interface FailedOutput {
  lines: string[];
  /** The same object when nothing changed, a copy otherwise. */
  queue: Queue;
  /** Workflows that reached REPEAT_RUNS failures inside REPEAT_DAYS (item filed or refreshed). */
  repeating: string[];
}

const pad = (n: number): string => String(n).padStart(2, '0');
/** `YYYY-MM-DD HH:MM` in UTC, the run-log stamp (same as scripts/run-watchdog.ts). */
export function stamp(d: Date): string {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

export function serialize(queue: Queue): string {
  return `${JSON.stringify(queue, null, 2)}\n`;
}

/** `fetch-relay.yml` → `ci-fetch-relay-failing`. */
export function itemId(workflow: string): string {
  return `ci-${workflow.replace(/\.ya?ml$/, '')}-failing`;
}

/** The dedupe key every line of a run carries. */
export function lineKey(run: FailedRun): string {
  return `${LINE_PREFIX}${run.workflow} run ${run.runNumber} `;
}

/** True when docs/RUNS.md already carries this run's line. */
export function alreadyReported(runsText: string, run: FailedRun): boolean {
  const key = `| watchdog | ${lineKey(run)}`;
  return runsText.split('\n').some((l) => l.includes(key));
}

function stepName(run: FailedRun, max: number): string {
  const step = run.failingStep ?? 'an unnamed step';
  return step.length > max ? `${step.slice(0, max - 1)}…` : step;
}

function repair(run: FailedRun): string {
  if (!run.later) return 'no later run';
  if (run.later.conclusion === 'success') return `later run ${run.later.runNumber} ok`;
  return `later run ${run.later.runNumber} ${run.later.conclusion ?? 'running'}`;
}

/** The run-log line; the step name is cut until the text fits the 120-char cap. */
export function failedLine(run: FailedRun, now: Date): string {
  const hhmm = stamp(new Date(run.createdAt)).slice(11);
  for (let max = STEP_MAX; ; max -= 4) {
    const text = `${lineKey(run)}${hhmm} — step ${stepName(run, max)}; ${repair(run)}`;
    if (text.length <= RUNS_CAP || max <= 8) return `- ${stamp(now)} | watchdog | ${text}`;
  }
}

/** Failed runs per workflow reported in docs/RUNS.md inside the last REPEAT_DAYS (by run number). */
export function reportedWeek(runsText: string, now: Date): Map<string, Set<number>> {
  const floor = stamp(new Date(now.getTime() - REPEAT_DAYS * 86_400_000));
  const out = new Map<string, Set<number>>();
  for (const line of runsText.split('\n')) {
    const m = /^- (\d{4}-\d{2}-\d{2} \d{2}:\d{2}) \| watchdog \| ci-failed: (\S+) run (\d+) /.exec(
      line,
    );
    if (!m || m[1]! < floor) continue;
    const set = out.get(m[2]!) ?? new Set<number>();
    set.add(Number(m[3]));
    out.set(m[2]!, set);
  }
  return out;
}

export function newItem(workflow: string, runs: FailedRun[], today: string): QueueItem {
  const name = runs[0]?.name ?? workflow;
  return {
    id: itemId(workflow),
    title: `The ${name} workflow (${workflow}) failed ${runs.length} times this week: root-cause and fix it`,
    why: whySentence(workflow, runs, today),
    effort_days: EFFORT_DAYS,
    proof: `seven days of ${workflow} runs with no ci-failed line in docs/RUNS.md`,
    score: SCORE,
    status: 'todo',
    added: today,
    updated: today,
  };
}

function whySentence(workflow: string, runs: FailedRun[], today: string): string {
  const list = runs
    .map(
      (r) =>
        `run ${r.runNumber} (${stamp(new Date(r.createdAt))} UTC, step "${r.failingStep ?? 'unnamed'}", ${repair(r)}) — ${r.url}`,
    )
    .join('; ');
  return `Filed by scripts/ci-failed-runs.ts (${today}): ${workflow} failed ${runs.length} times in ${REPEAT_DAYS} days — ${list}. Read the first error of each job log; a fix in code the workflow runs lands on main, a fix in the workflow itself is dropped as the full file in docs/ci/${workflow} (the installer moves it); a failure a later run repaired on its own still needs its cause named here before the item is done.`;
}

/**
 * Lines to append and the queue to write. A run already reported files nothing again. A workflow
 * whose failed runs of the week (reported lines plus tonight's) reach REPEAT_RUNS gets an item:
 * an open one is refreshed with the new runs' sentence, a done or dropped one reopened.
 */
export function ciFailedRuns(input: FailedInput): FailedOutput {
  const today = stamp(input.now).slice(0, 10);
  const floor = input.now.getTime() - LOOKBACK_HOURS * 3_600_000;
  const fresh = input.runs
    .filter((r) => Date.parse(r.createdAt) >= floor && !alreadyReported(input.runsText, r))
    .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
  const lines = fresh.map((r) => failedLine(r, input.now));
  const week = reportedWeek(input.runsText, input.now);
  const byWorkflow = new Map<string, FailedRun[]>();
  for (const r of fresh) byWorkflow.set(r.workflow, [...(byWorkflow.get(r.workflow) ?? []), r]);
  const repeating: string[] = [];
  let queue = input.queue;
  let items = queue.items;
  for (const [workflow, runs] of byWorkflow) {
    const earlier = week.get(workflow) ?? new Set<number>();
    for (const r of runs) earlier.add(r.runNumber);
    if (earlier.size < REPEAT_RUNS) continue;
    repeating.push(workflow);
    const id = itemId(workflow);
    const existing = items.find((i) => i.id === id);
    if (!existing) {
      items = [...items, newItem(workflow, runs, today)];
      continue;
    }
    const open =
      existing.status === 'todo' || existing.status === 'doing' || existing.status === 'blocked';
    const refreshed: QueueItem = {
      ...existing,
      status: open ? existing.status : 'todo',
      why: `${existing.why} ${whySentence(workflow, runs, today)}`,
      updated: today,
    };
    if (!open) delete refreshed.done_at;
    items = items.map((i) => (i.id === id ? refreshed : i));
  }
  if (repeating.length > 0) queue = { ...queue, items, updated: today };
  return { lines, queue, repeating };
}

interface GhRun {
  id: number;
  name?: string;
  path?: string;
  run_number: number;
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
    console.log(`ci-failed-runs: GitHub API ${res.status} for ${url}; skipping`);
    return undefined;
  }
  return (await res.json()) as T;
}

/** Reads the failed runs of the lookback window, each failing step and each workflow's next run. */
export async function readGitHub(
  repo: string,
  token: string,
  now: Date,
): Promise<FailedRun[] | undefined> {
  const api = `https://api.github.com/repos/${repo}`;
  const since = new Date(now.getTime() - LOOKBACK_HOURS * 3_600_000).toISOString().slice(0, 10);
  const body = await gh<{ workflow_runs?: GhRun[] }>(
    `${api}/actions/runs?status=failure&per_page=100&created=>=${since}`,
    token,
  );
  if (!body) return undefined;
  const out: FailedRun[] = [];
  const laterRuns = new Map<string, GhRun[]>();
  for (const r of body.workflow_runs ?? []) {
    if (!r.path || r.conclusion !== 'failure') continue;
    const workflow = path.basename(r.path);
    const run: FailedRun = {
      workflow,
      name: r.name ?? workflow,
      runNumber: r.run_number,
      createdAt: r.created_at,
      url: r.html_url,
    };
    const jobs = await gh<{ jobs?: GhJob[] }>(`${api}/actions/runs/${r.id}/jobs`, token);
    const failed = jobs?.jobs?.find((j) => j.conclusion === 'failure');
    const step = failed?.steps?.find((s) => s.conclusion === 'failure')?.name;
    if (step) run.failingStep = step;
    if (!laterRuns.has(workflow)) {
      const wf = await gh<{ workflow_runs?: GhRun[] }>(
        `${api}/actions/workflows/${workflow}/runs?per_page=20`,
        token,
      );
      laterRuns.set(workflow, wf?.workflow_runs ?? []);
    }
    const later = (laterRuns.get(workflow) ?? [])
      .filter((w) => w.run_number > r.run_number)
      .sort((a, b) => a.run_number - b.run_number)[0];
    if (later) run.later = { runNumber: later.run_number, conclusion: later.conclusion };
    out.push(run);
  }
  return out;
}

async function main(): Promise<void> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.log('ci-failed-runs: no GITHUB_TOKEN; skipping');
    return;
  }
  const now = new Date();
  const runs = await readGitHub(process.env.GITHUB_REPOSITORY ?? 'giovf/rorororo', token, now);
  if (!runs) return;
  const root = path.resolve(import.meta.dirname, '..');
  const runsPath = path.join(root, RUNS_FILE);
  const queuePath = path.join(root, QUEUE_FILE);
  const runsText = readFileSync(runsPath, 'utf8');
  const queue = JSON.parse(readFileSync(queuePath, 'utf8')) as Queue;
  const out = ciFailedRuns({ runs, runsText, queue, now });
  if (out.lines.length === 0) {
    console.log(
      `ci-failed-runs: ${runs.length} failed run(s) in ${LOOKBACK_HOURS} h, all reported`,
    );
    return;
  }
  appendFileSync(runsPath, `${runsText.endsWith('\n') ? '' : '\n'}${out.lines.join('\n')}\n`);
  if (out.queue !== queue) writeFileSync(queuePath, serialize(out.queue));
  for (const line of out.lines) console.log(line);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  await main();
