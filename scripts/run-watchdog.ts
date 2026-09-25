// Run watchdog: makes a silent routine slot visible on the owner's phone.
//
// Every scheduled cloud routine leaves a trace on `main` when it runs — a tagged line in
// docs/RUNS.md and/or a commit with a known subject. A run refused by the usage limit (the
// Wednesday 2026-09-23 17:09 build) leaves nothing, and nobody knew until the owner asked.
// This script enumerates each routine's slots, checks for that trace within the grace window,
// and appends ONE `| watchdog | missed: …` line per silent slot to docs/RUNS.md. The
// `notify owner` CI job turns that line into a Telegram bullet; the line itself is the
// dedupe record, so re-runs (hourly cron + every push) never report a slot twice.
//
// Run in CI: node --disable-warning=ExperimentalWarning scripts/run-watchdog.ts
// Workflow: docs/ci/run-watchdog.yml (drafted 2026-09-25; routine tokens lack the `workflow` scope,
// so the interactive session moves it to .github/workflows/ — until then the script is dormant).
// Node 22 runs .ts directly — keep syntax erasable, import only node builtins.
import { execSync } from 'node:child_process';
import { appendFileSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export interface RoutineSlot {
  /** Tag the routine writes in docs/RUNS.md (`| build |`) and the name used in the missed line. */
  routine: string;
  /** Slot time, UTC. */
  hour: number;
  minute: number;
  /** Days of week (0 = Sunday); omitted = every day. */
  days?: number[];
  /** Minutes after the slot by which a trace must exist. */
  graceMinutes: number;
  /** RUNS.md tags that count as this routine's trace. */
  tags: string[];
  /** Commit subjects on main that count as this routine's trace. */
  commit: RegExp;
}

/** Slots before this instant are never reported (the watchdog did not exist). */
export const SINCE = Date.parse('2026-09-25T17:00:00Z');
/** How far back a late-firing GitHub cron may still report a miss (GitHub's cron is best-effort). */
export const LOOKBACK_HOURS = 48;
export const GRACE_MINUTES = 120;

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
    // Only the first burn-down hour is watched: later hours are expected to be cut off by
    // the usage limit; a silent 18:00 slot is exactly the "allowance already gone" case.
    routine: 'burn-down',
    hour: 18,
    minute: 0,
    days: [3],
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

const MISSED_RE = /\|\s*watchdog\s*\|\s*missed: (\S+) slot (\d{4}-\d{2}-\d{2} \d{2}:\d{2}) UTC/;

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
    return t.kind === 'commit' ? slot.def.commit.test(t.text) : slot.def.tags.includes(t.kind);
  });
}

export interface WatchInput {
  now: Date;
  runsText: string;
  commitsText: string;
  defs?: RoutineSlot[];
  since?: number;
  lookbackHours?: number;
}

/** Slots that have passed their deadline without a trace and are not yet in RUNS.md. */
export function missedSlots(input: WatchInput): DueSlot[] {
  const traces = [...parseRuns(input.runsText), ...parseCommits(input.commitsText)];
  const reported = reportedSlots(input.runsText);
  return slotsDue(input.defs ?? ROUTINES, input.now, input.since, input.lookbackHours).filter(
    (slot) => !reported.has(slotKey(slot.routine, slot.at)) && !hasTrace(slot, traces),
  );
}

/** The RUNS.md line for one missed slot (≤ 120 chars of text after the routine column). */
export function missedLine(slot: DueSlot, now: Date): string {
  const hhmm = stamp(slot.deadline).slice(11);
  return `- ${stamp(now)} | watchdog | missed: ${slot.routine} slot ${stamp(slot.at)} UTC left no commit or run line by ${hhmm}; usage limit? see claude.ai/code/routines`;
}

function main(): void {
  const root = path.resolve(import.meta.dirname, '..');
  const runsPath = path.join(root, 'docs', 'RUNS.md');
  const now = new Date();
  const sinceIso = new Date(now.getTime() - (LOOKBACK_HOURS + 24) * 3_600_000).toISOString();
  const commitsText = execSync(`git log --since=${sinceIso} --format=%cI%x09%s`, {
    cwd: root,
    encoding: 'utf8',
  });
  const runsText = readFileSync(runsPath, 'utf8');
  const missed = missedSlots({ now, runsText, commitsText });
  if (missed.length === 0) {
    console.log(`watchdog: every slot due before ${now.toISOString()} left a trace`);
    return;
  }
  const lines = missed.map((slot) => missedLine(slot, now));
  appendFileSync(runsPath, `${runsText.endsWith('\n') ? '' : '\n'}${lines.join('\n')}\n`);
  for (const line of lines) console.log(line);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
