// Run watchdog: makes a silent routine slot visible on the owner's phone.
//
// Every scheduled cloud routine leaves a trace on `main` when it runs — a tagged line in
// docs/RUNS.md and/or a commit with a known subject. A run refused by the usage limit (the
// Wednesday 2026-09-23 17:09 build) leaves nothing, and nobody knew until the owner asked.
// This script enumerates each routine's slots, checks for that trace within the grace window,
// and appends ONE `| watchdog | missed: …` line per silent slot to docs/RUNS.md. The
// `notify owner` CI job turns that line into a Telegram bullet; the line itself is the
// dedupe record, so re-runs (every routine push + a 6-hourly cron) never report a slot twice.
//
// A slot that STARTED (`npm run slot -- start <routine>` stamped docs/ops/SLOTS.md, 2026-09-30) but
// never finished is reported as `stalled:` — the start marker is never mistaken for the work.
//
// Run in CI: node --disable-warning=ExperimentalWarning scripts/run-watchdog.ts
// Workflow: a step of .github/workflows/notify-owner.yml since 2026-10-12 (foundry actions-floor-trim:
// every routine push already starts that job and GitHub delivered this script's own 2-hourly cron
// about half the time); run-watchdog.yml keeps a workflow_dispatch for a by-hand run.
// Node 22 runs .ts directly — keep syntax erasable, import only node builtins.
import { execSync } from 'node:child_process';
import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ALERTS_FILE, HANDOFF_DIGEST_MARK, handoffDigestLine, ledger } from './handoffs.ts';
import { claimMarkerRoutine } from './pipeline-claim.ts';
import { SLOTS_FILE, parseStarted, startMarkerRoutine } from './slot.ts';

export interface RoutineSlot {
  /** Tag the routine writes in docs/RUNS.md (`| build |`) and the name used in the missed line. */
  routine: string;
  /** Slot time, UTC. */
  hour: number;
  minute: number;
  /** Days of week (0 = Sunday); omitted = every day. */
  days?: number[];
  /** Slot exists from this instant (UTC ms): earlier days are never reported (a schedule change). */
  since?: number;
  /** Minutes after the slot by which a trace must exist. */
  graceMinutes: number;
  /** RUNS.md tags that count as this routine's trace. */
  tags: string[];
  /** Commit subjects on main that count as this routine's trace. */
  commit: RegExp;
  /**
   * Commit subjects written by jobs the routine dispatches. When every one of them landed in the
   * window and docs/ops/SLOTS.md carries the routine's start marker, the slot is traced: the
   * dispatch was the run's work (foundry `metrics-slot-trace`, 2026-10-16 — the 07:00 metrics
   * routine dispatched both metrics jobs on 10-15 and was reported missed because its only
   * commit used to be a daily `Reviews checked` row). The marker alone stays `stalled:`, the
   * commits alone stay missed (a late cron writes the same subjects).
   */
  dispatched?: RegExp[];
  /**
   * Workflow files the routine dispatches. A `workflow_dispatch` run of every one of them started
   * inside the window is the slot's trace on its own (foundry `watchdog-dispatch-event-trace`,
   * 2026-10-18 — on 10-17 the routine dispatched both jobs at 07:13 and skipped its marker, and the
   * 09:13 watchdog wrote `missed:`): the event tells the routine's dispatch from a late cron
   * (`schedule`), which was the reason commits alone could not count.
   */
  dispatchedWorkflows?: string[];
}

/** One Actions run as the watchdog reads it (`event: workflow_dispatch` is the routine's hand). */
export interface DispatchRun {
  /** Workflow file name, e.g. `gankdat-metrics.yml`. */
  workflow: string;
  event: string;
  startedAt: Date;
}

/** Slots before this instant are never reported (the watchdog did not exist). */
export const SINCE = Date.parse('2026-09-25T17:00:00Z');
/** How far back a late-firing GitHub cron may still report a miss (GitHub's cron is best-effort). */
export const LOOKBACK_HOURS = 48;
export const GRACE_MINUTES = 120;
/** The evening burn went nightly at this slot (docs/SCHEDULERS.md); it was Wednesday 18:00 before. */
export const BURN_DOWN_NIGHTLY_SINCE = Date.parse('2026-10-04T17:00:00Z');

// Mirrors docs/SCHEDULERS.md — update both in the same commit when a routine's slot changes.
// Hourly inbox triage is not watched: it commits only when there is new mail.
export const ROUTINES: RoutineSlot[] = [
  {
    routine: 'metrics',
    hour: 7,
    minute: 0,
    graceMinutes: GRACE_MINUTES,
    tags: [],
    commit: /^metrics: /,
    dispatched: [/^store-metrics: /, /^metrics\(gankdat\): /],
    dispatchedWorkflows: ['store-metrics.yml', 'gankdat-metrics.yml'],
  },
  {
    routine: 'report',
    hour: 7,
    minute: 30,
    days: [1],
    graceMinutes: GRACE_MINUTES,
    tags: ['report'],
    commit: /^report(s)?[:(]|\(weekly report\)/,
  },
  {
    routine: 'exchange',
    hour: 8,
    minute: 0,
    days: [3],
    graceMinutes: GRACE_MINUTES,
    tags: ['exchange'],
    commit: /^exchange[:(]|\(venture exchange\)/,
  },
  {
    routine: 'review',
    hour: 8,
    minute: 0,
    days: [0],
    graceMinutes: GRACE_MINUTES,
    tags: ['review'],
    commit: /^review[:(]|\(strategy review\)/,
  },
  {
    routine: 'build',
    hour: 9,
    minute: 0,
    graceMinutes: GRACE_MINUTES,
    tags: ['build'],
    commit: /\((daily )?build\)$/,
  },
  {
    routine: 'build',
    hour: 17,
    minute: 0,
    graceMinutes: GRACE_MINUTES,
    tags: ['build'],
    commit: /\((daily )?build\)$/,
  },
  {
    routine: 'retro',
    hour: 7,
    minute: 59,
    days: [6],
    graceMinutes: GRACE_MINUTES,
    tags: ['retro'],
    commit: /^retro[:(]|\(ops retro\)/,
  },
  {
    // Only the first burn-down hour is watched: later hours are expected to be cut off by
    // the usage limit; a silent 17:00 slot is exactly the "allowance already gone" case.
    // Nightly since 2026-10-04 (was Wednesday 18:00; the watchdog followed on 2026-10-10 —
    // foundry `burn-down-watchdog-nightly`, after five of six nights ran unwatched).
    routine: 'burn-down',
    hour: 17,
    minute: 0,
    since: BURN_DOWN_NIGHTLY_SINCE,
    graceMinutes: GRACE_MINUTES,
    tags: ['burn-down'],
    commit: /\(burn-down\)$/,
  },
];

export interface DueSlot {
  routine: string;
  at: Date;
  deadline: Date;
  def: RoutineSlot;
}

export interface Trace {
  at: Date;
  /** RUNS.md tag, or `commit` for a commit subject. */
  kind: string;
  text: string;
}

const MINUTE = 60_000;
const pad = (n: number): string => String(n).padStart(2, '0');

/** `YYYY-MM-DD HH:MM` in UTC — the RUNS.md timestamp format. */
export function stamp(d: Date): string {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

/** Stable identity of one slot, used to dedupe against lines already in RUNS.md. */
export function slotKey(routine: string, at: Date): string {
  return `${routine}@${stamp(at)}`;
}

/** Every slot whose deadline has passed, newer than `since` and within the lookback window. */
export function slotsDue(
  defs: RoutineSlot[],
  now: Date,
  since = SINCE,
  lookbackHours = LOOKBACK_HOURS,
): DueSlot[] {
  const out: DueSlot[] = [];
  const floor = Math.max(since, now.getTime() - lookbackHours * 3_600_000);
  const day = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() - Math.ceil(lookbackHours / 24) - 1,
    ),
  );
  for (; day.getTime() <= now.getTime(); day.setUTCDate(day.getUTCDate() + 1)) {
    for (const def of defs) {
      if (def.days && !def.days.includes(day.getUTCDay())) continue;
      const at = new Date(
        Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), def.hour, def.minute),
      );
      const deadline = new Date(at.getTime() + def.graceMinutes * MINUTE);
      if (at.getTime() < floor || deadline.getTime() > now.getTime()) continue;
      if (def.since !== undefined && at.getTime() < def.since) continue;
      out.push({ routine: def.routine, at, deadline, def });
    }
  }
  return out.sort((a, b) => a.at.getTime() - b.at.getTime());
}

/** RUNS.md lines `- YYYY-MM-DD HH:MM | <tag> | <text>` as traces. */
export function parseRuns(text: string): Trace[] {
  const out: Trace[] = [];
  for (const line of text.split('\n')) {
    const m = /^-\s*(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2})\s*\|\s*([^|]+?)\s*\|\s*(.*)$/.exec(line);
    if (!m) continue;
    const at = new Date(`${m[1]}T${m[2]}:00Z`);
    if (Number.isNaN(at.getTime())) continue;
    out.push({ at, kind: m[3] ?? '', text: m[4] ?? '' });
  }
  return out;
}

/** `git log --format=%cI%x09%s` output as traces. */
export function parseCommits(text: string): Trace[] {
  const out: Trace[] = [];
  for (const line of text.split('\n')) {
    const [iso, ...rest] = line.split('\t');
    if (!iso) continue;
    const at = new Date(iso);
    if (Number.isNaN(at.getTime())) continue;
    out.push({ at, kind: 'commit', text: rest.join('\t') });
  }
  return out;
}

const MISSED_RE =
  /\|\s*watchdog\s*\|\s*(?:missed|stalled): (\S+) slot (\d{4}-\d{2}-\d{2} \d{2}:\d{2}) UTC/;

/** Slot keys already reported in RUNS.md (the file is the dedupe record). */
export function reportedSlots(runsText: string): Set<string> {
  const out = new Set<string>();
  for (const line of runsText.split('\n')) {
    const m = MISSED_RE.exec(line);
    if (m) out.add(`${m[1]}@${m[2]}`);
  }
  return out;
}

/** True when a trace of this routine exists between 5 min before the slot and its deadline. */
export function hasTrace(slot: DueSlot, traces: Trace[]): boolean {
  const from = slot.at.getTime() - 5 * MINUTE;
  const to = slot.deadline.getTime();
  return traces.some((t) => {
    const ms = t.at.getTime();
    if (ms < from || ms > to) return false;
    // Neither marker is a trace: a slot that stamped SLOTS.md or claimed its item and then died
    // must still read as stalled (start marker 2026-09-30, claim marker 2026-10-07).
    if (t.kind === 'commit')
      return (
        startMarkerRoutine(t.text) === undefined &&
        claimMarkerRoutine(t.text) === undefined &&
        slot.def.commit.test(t.text)
      );
    return slot.def.tags.includes(t.kind);
  });
}

/** The slot's start marker (docs/ops/SLOTS.md) inside the same window, if the run stamped one. */
export function startedAt(slot: DueSlot, slotsText: string): Date | undefined {
  const from = slot.at.getTime() - 5 * MINUTE;
  const to = slot.deadline.getTime();
  return parseStarted(slotsText).find(
    (s) => s.routine === slot.routine && s.at.getTime() >= from && s.at.getTime() <= to,
  )?.at;
}

/** The dispatched jobs' commits inside the slot's window, when the routine also stamped its start marker. */
export function dispatchedTraces(slot: DueSlot, traces: Trace[], slotsText: string): Trace[] {
  const patterns = slot.def.dispatched ?? [];
  if (patterns.length === 0 || startedAt(slot, slotsText) === undefined) return [];
  const from = slot.at.getTime() - 5 * MINUTE;
  const to = slot.deadline.getTime();
  const commits = traces.filter(
    (t) => t.kind === 'commit' && t.at.getTime() >= from && t.at.getTime() <= to,
  );
  const found = patterns.map((re) => commits.find((t) => re.test(t.text)));
  return found.every((t) => t !== undefined) ? found : [];
}

/** True when the start marker plus every dispatched job's commit stand in for the routine's own commit. */
export function hasDispatchedTrace(slot: DueSlot, traces: Trace[], slotsText: string): boolean {
  return dispatchedTraces(slot, traces, slotsText).length > 0;
}

/** A `workflow_dispatch` run of every dispatched workflow started inside the slot's window; [] when one is missing. */
export function dispatchRunTraces(slot: DueSlot, runs: DispatchRun[]): DispatchRun[] {
  const workflows = slot.def.dispatchedWorkflows ?? [];
  if (workflows.length === 0) return [];
  const from = slot.at.getTime() - 5 * MINUTE;
  const to = slot.deadline.getTime();
  const found = workflows.map((w) =>
    runs.find(
      (r) =>
        r.workflow === w &&
        r.event === 'workflow_dispatch' &&
        r.startedAt.getTime() >= from &&
        r.startedAt.getTime() <= to,
    ),
  );
  return found.every((r) => r !== undefined) ? found : [];
}

/** Runs as GitHub's `GET /repos/{repo}/actions/runs` lists them → DispatchRun[] (runs not yet started are left out). */
export function dispatchRunsFrom(
  runs: { path?: string; event?: string; run_started_at?: string | null }[],
): DispatchRun[] {
  const out: DispatchRun[] = [];
  for (const r of runs) {
    if (!r.path || !r.event || !r.run_started_at) continue;
    out.push({
      workflow: path.basename(r.path),
      event: r.event,
      startedAt: new Date(r.run_started_at),
    });
  }
  return out;
}

/** The last LOOKBACK_HOURS + 24 h of `workflow_dispatch` runs, or [] without a token or on an API error (never blocks). */
export async function readDispatchRuns(
  repo: string,
  token: string | undefined,
  since: Date,
): Promise<DispatchRun[]> {
  if (!token) return [];
  const url = `https://api.github.com/repos/${repo}/actions/runs?event=workflow_dispatch&per_page=100&created=>=${since.toISOString().slice(0, 10)}`;
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, accept: 'application/vnd.github+json' },
    });
    if (!res.ok) {
      console.log(
        `watchdog: GitHub API ${res.status} listing dispatched runs; commits and markers only`,
      );
      return [];
    }
    const body = (await res.json()) as {
      workflow_runs?: { path?: string; event?: string; run_started_at?: string | null }[];
    };
    return dispatchRunsFrom(body.workflow_runs ?? []);
  } catch (e) {
    console.log(`watchdog: dispatched runs unreadable (${String(e)}); commits and markers only`);
    return [];
  }
}

export interface WatchInput {
  now: Date;
  runsText: string;
  commitsText: string;
  /** docs/ops/SLOTS.md — start markers; absent before 2026-09-30. */
  slotsText?: string;
  /** `workflow_dispatch` runs from the Actions API; absent when the token or the API is not there. */
  dispatchRuns?: DispatchRun[];
  defs?: RoutineSlot[];
  since?: number;
  lookbackHours?: number;
}

export interface MissedSlot extends DueSlot {
  /** Set when the run stamped a start marker and then never committed: stalled, not missed. */
  startedAt?: Date;
}

/** Slots that have passed their deadline without a trace and are not yet in RUNS.md. */
export function missedSlots(input: WatchInput): MissedSlot[] {
  const traces = [...parseRuns(input.runsText), ...parseCommits(input.commitsText)];
  const reported = reportedSlots(input.runsText);
  const slotsText = input.slotsText ?? '';
  return slotsDue(input.defs ?? ROUTINES, input.now, input.since, input.lookbackHours)
    .filter(
      (slot) =>
        !reported.has(slotKey(slot.routine, slot.at)) &&
        !hasTrace(slot, traces) &&
        !hasDispatchedTrace(slot, traces, slotsText) &&
        dispatchRunTraces(slot, input.dispatchRuns ?? []).length === 0,
    )
    .map((slot) => {
      const started = startedAt(slot, slotsText);
      return started ? { ...slot, startedAt: started } : slot;
    });
}

/** The RUNS.md line for one missed or stalled slot (≤ 120 chars of text after the routine column). */
export function missedLine(slot: MissedSlot, now: Date): string {
  const hhmm = stamp(slot.deadline).slice(11);
  if (slot.startedAt) {
    const started = stamp(slot.startedAt).slice(11);
    return `- ${stamp(now)} | watchdog | stalled: ${slot.routine} slot ${stamp(slot.at)} UTC started ${started} but pushed nothing by ${hhmm}; usage limit? see claude.ai/code/routines`;
  }
  return `- ${stamp(now)} | watchdog | missed: ${slot.routine} slot ${stamp(slot.at)} UTC left no commit or run line by ${hhmm}; usage limit? see claude.ai/code/routines`;
}

/** A handoff digest sent this many days ago is not repeated: one phone line a week while it holds. */
export const HANDOFF_NOTIFY_EVERY_DAYS = 7;

/**
 * The `| notify |` line for aging `handoff:` entries (foundry handoff-aging-escalation,
 * 2026-10-10), or undefined when none is older than HANDOFF_AFTER_DAYS or RUNS.md already
 * carries one from the last HANDOFF_NOTIFY_EVERY_DAYS days (the dedupe record, like a missed
 * line; matched on the phrase every digest carries, since the count and age change daily).
 */
export function handoffNotifyLine(
  alertsText: string,
  runsText: string,
  now: Date,
): string | undefined {
  const digest = handoffDigestLine(ledger(alertsText, now).open, now);
  if (!digest) return undefined;
  const floor = now.getTime() - HANDOFF_NOTIFY_EVERY_DAYS * 86_400_000;
  const sent = parseRuns(runsText).some(
    (t) => t.kind === 'notify' && t.text.includes(HANDOFF_DIGEST_MARK) && t.at.getTime() >= floor,
  );
  if (sent) return undefined;
  return `- ${stamp(now)} | notify | ${digest}`;
}

async function main(): Promise<void> {
  const root = path.resolve(import.meta.dirname, '..');
  const runsPath = path.join(root, 'docs', 'RUNS.md');
  const now = new Date();
  const since = new Date(now.getTime() - (LOOKBACK_HOURS + 24) * 3_600_000);
  const sinceIso = since.toISOString();
  const commitsText = execSync(`git log --since=${sinceIso} --format=%cI%x09%s`, {
    cwd: root,
    encoding: 'utf8',
  });
  const runsText = readFileSync(runsPath, 'utf8');
  const slotsPath = path.join(root, SLOTS_FILE);
  const slotsText = existsSync(slotsPath) ? readFileSync(slotsPath, 'utf8') : '';
  const dispatchRuns = await readDispatchRuns(
    process.env.GITHUB_REPOSITORY ?? 'giovf/rorororo',
    process.env.GITHUB_TOKEN,
    since,
  );
  const missed = missedSlots({ now, runsText, commitsText, slotsText, dispatchRuns });
  if (missed.length === 0) {
    console.log(`watchdog: every slot due before ${now.toISOString()} left a trace`);
  }
  const lines = missed.map((slot) => missedLine(slot, now));
  const alertsPath = path.join(root, ALERTS_FILE);
  const handoffs = existsSync(alertsPath)
    ? handoffNotifyLine(readFileSync(alertsPath, 'utf8'), runsText, now)
    : undefined;
  if (handoffs) lines.push(handoffs);
  if (lines.length === 0) return;
  appendFileSync(runsPath, `${runsText.endsWith('\n') ? '' : '\n'}${lines.join('\n')}\n`);
  for (const line of lines) console.log(line);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  await main();
