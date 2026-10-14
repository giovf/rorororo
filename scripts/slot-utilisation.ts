// Slot utilisation: how much of the week's routine slots built queued work.
//
// The owner's target is 70–80% of the week's Claude allowance on queued work (docs/ops/BURN.json,
// 2026-10-04), but nothing measured it: the only usage figure is the owner's `usage NN%` note (last
// 2026-10-04 at 14%) and a burn-down fire that ends at the cold gate leaves no line and no commit, so
// the W41 retro counted slots by hand from docs/RUNS.md (foundry `slot-utilisation-report`, 2026-10-14).
//
// This script enumerates every routine slot of the window — the watchdog's ROUTINES list in
// scripts/run-watchdog.ts, with the burn-down widened from its watched 17:00 hour to every hourly fire
// of the night (17:00–23:00 and 00:00–02:00 UTC, docs/SCHEDULERS.md) — attributes each docs/RUNS.md
// line and each routine commit to the slot it belongs to, and classifies the slot:
//   built        a `Queue: … done` line (an item shipped)
//   researched   a research pass (`research` / `research_after` / `Queue: <venture> +N`)
//   pre-research the night's or day's one `Exchange pre-research:` pass
//   ran          a trace with none of the above (fixed routines: metrics, report, review …; or a
//                `Nothing buildable … stopping` line)
//   cold         a burn-down hour with no line after a `Stopping:` (starved) / `Nothing buildable` /
//                pre-research line earlier the same night — `npm run pipeline cold` would have
//                said `starved-and-cooled`, which ends the run before any line is written (a
//                `Stopping for time` line is the opposite: the next fire takes the named item)
//   silent       a burn-down hour after 17:00 with no line and no such signal — the usage limit
//                or a refused session, which the watchdog does not watch on purpose
//   missed       a watchdog `missed:` / `stalled:` line, or no trace on a watched slot
// and prints a Markdown table the Monday report pastes under its `Slots` heading and the Saturday
// retro's section 2 starts from. The `Built %` column is built slots over the slots that had queued
// work to do (every class but cold); `Idle %` is cold + silent + missed over all slots.
//
// When docs/ops/BURN.json `report.date` is older than 7 days it also prints one `usage-ask:` line for
// the report's digest (one sentence; no second ask while a `| notify |` line with the same phrase sits
// in RUNS.md from the last 7 days) — the 80% gate reads that note and is blind without it.
//
// Usage (plain Node, no install — the report routine runs it without `npm ci`):
//   npm run slots                       the 7 complete UTC days before today
//   npm run slots -- --days=14          a longer window
//   npm run slots -- --to=2026-10-12    the 7 days ending on that date (the Monday report: yesterday)
// Node 22 runs .ts directly — keep syntax erasable, import only node builtins.
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { claimMarkerRoutine } from './pipeline-claim.ts';
import { PRE_RESEARCH_PREFIX, nightStart } from './pipeline-cold.ts';
import {
  BURN_DOWN_NIGHTLY_SINCE,
  ROUTINES,
  type RoutineSlot,
  SINCE,
  type Trace,
  parseCommits,
  parseRuns,
  reportedSlots,
  slotKey,
  stamp,
} from './run-watchdog.ts';
import { startMarkerRoutine } from './slot.ts';

/** The burn-down's hourly fires (docs/SCHEDULERS.md: 17:00–23:00 and 00:00–02:00 UTC, nightly). */
export const BURN_DOWN_HOURS: readonly number[] = [17, 18, 19, 20, 21, 22, 23, 0, 1, 2];

/** A `| burn-down |` or `| build |` line that means the pipeline was starved for the night's rest. */
export const COLD_SIGNAL_RE = /^(Exchange pre-research:|Stopping:|Nothing buildable\b)/;
const COLD_SIGNAL_TAGS: readonly string[] = ['burn-down', 'build'];

export type SlotClass =
  'built' | 'researched' | 'pre-research' | 'ran' | 'cold' | 'silent' | 'missed';

export const CLASSES: readonly SlotClass[] = [
  'built',
  'researched',
  'pre-research',
  'ran',
  'cold',
  'silent',
  'missed',
];

const MINUTE = 60_000;
const DAY = 86_400_000;

/**
 * The watchdog's ROUTINES with the burn-down widened to every hourly fire of the night. The watchdog
 * watches only 17:00 (later hours are expected usage-limit cutoffs); utilisation counts them all.
 */
export function utilisationRoutines(defs: readonly RoutineSlot[] = ROUTINES): RoutineSlot[] {
  const out: RoutineSlot[] = [];
  for (const def of defs) {
    if (def.routine !== 'burn-down') {
      out.push(def);
      continue;
    }
    for (const hour of BURN_DOWN_HOURS) {
      out.push({
        ...def,
        hour,
        minute: 0,
        since: def.since ?? BURN_DOWN_NIGHTLY_SINCE,
        // One fire per hour: a line belongs to the latest fire at or before it.
        graceMinutes: 60,
      });
    }
  }
  return out;
}

export interface Slot {
  routine: string;
  at: Date;
  deadline: Date;
  def: RoutineSlot;
}

/** Every slot of `defs` whose fire time is inside [from, to] and whose deadline has passed `now`. */
export function slotsIn(
  defs: readonly RoutineSlot[],
  from: Date,
  to: Date,
  now: Date,
  since = SINCE,
): Slot[] {
  const out: Slot[] = [];
  const day = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()));
  for (; day.getTime() <= to.getTime(); day.setUTCDate(day.getUTCDate() + 1)) {
    for (const def of defs) {
      if (def.days && !def.days.includes(day.getUTCDay())) continue;
      const at = new Date(
        Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), def.hour, def.minute),
      );
      const deadline = new Date(at.getTime() + def.graceMinutes * MINUTE);
      if (at.getTime() < from.getTime() || at.getTime() > to.getTime()) continue;
      if (at.getTime() < since || deadline.getTime() > now.getTime()) continue;
      if (def.since !== undefined && at.getTime() < def.since) continue;
      out.push({ routine: def.routine, at, deadline, def });
    }
  }
  return out.sort((a, b) => a.at.getTime() - b.at.getTime());
}

/** True when `trace` is this routine's work: its RUNS.md tag, or a commit with its subject (markers excluded). */
export function isRoutineTrace(def: RoutineSlot, trace: Trace): boolean {
  if (trace.kind === 'commit') {
    return (
      startMarkerRoutine(trace.text) === undefined &&
      claimMarkerRoutine(trace.text) === undefined &&
      def.commit.test(trace.text)
    );
  }
  return def.tags.includes(trace.kind);
}

/**
 * The traces of each slot: a trace belongs to the latest slot of its routine whose window
 * (5 min before the fire to its deadline) contains it — so an hourly burn-down line goes to the
 * fire that wrote it, not to every fire whose grace it also falls in.
 */
export function tracesBySlot(slots: readonly Slot[], traces: readonly Trace[]): Map<Slot, Trace[]> {
  const out = new Map<Slot, Trace[]>(slots.map((s) => [s, []]));
  for (const trace of traces) {
    const ms = trace.at.getTime();
    let owner: Slot | undefined;
    for (const slot of slots) {
      if (ms < slot.at.getTime() - 5 * MINUTE || ms > slot.deadline.getTime()) continue;
      if (!isRoutineTrace(slot.def, trace)) continue;
      if (!owner || slot.at.getTime() > owner.at.getTime()) owner = slot;
    }
    if (owner) out.get(owner)?.push(trace);
  }
  return out;
}

/** `Queue: <venture> <id> done …` — an item shipped (dropped / blocked / filed lines do not count). */
const BUILT_RE = /^Queue: .*\bdone\b/;
/** A research pass: `<venture> research: …`, `Queue: … research_after <date>`, `Queue: <venture> +N (…)`. Not `pre-research`. */
const RESEARCH_RE = /(?<![\w-])research(?:ed)?\b|research_after|^Queue: \S+ \+\d/;

/** The class a traced slot earns from its lines (built > researched > pre-research > ran). */
export function classOfTraces(traces: readonly Trace[]): SlotClass {
  const texts = traces.filter((t) => t.kind !== 'commit').map((t) => t.text);
  if (texts.some((t) => BUILT_RE.test(t))) return 'built';
  if (texts.some((t) => t.startsWith(PRE_RESEARCH_PREFIX))) {
    // A pass night: research of a venture queue beats the pass (it is the rarer, bigger step).
    if (texts.some((t) => RESEARCH_RE.test(t) && !t.startsWith(PRE_RESEARCH_PREFIX)))
      return 'researched';
    return 'pre-research';
  }
  if (texts.some((t) => RESEARCH_RE.test(t))) return 'researched';
  return 'ran';
}

/**
 * True when a `| burn-down |` or `| build |` line stamped in the slot's night (since its 17:00) and
 * before the slot starts with a cold signal: the hourly fire would have ended at the cold gate.
 */
export function nightWasCold(slot: Slot, runs: readonly Trace[]): boolean {
  if (slot.routine !== 'burn-down') return false;
  const from = Date.parse(`${nightStart(slot.at).replace(' ', 'T')}:00Z`);
  const to = slot.at.getTime();
  return runs.some(
    (t) =>
      COLD_SIGNAL_TAGS.includes(t.kind) &&
      t.at.getTime() >= from &&
      t.at.getTime() < to &&
      COLD_SIGNAL_RE.test(t.text),
  );
}

export interface ClassifiedSlot extends Slot {
  class: SlotClass;
  traces: Trace[];
}

export interface ClassifyInput {
  runsText: string;
  commitsText?: string;
  slots: readonly Slot[];
}

/** Every slot with its class. */
export function classifySlots(input: ClassifyInput): ClassifiedSlot[] {
  const runs = parseRuns(input.runsText);
  const traces = [...runs, ...parseCommits(input.commitsText ?? '')];
  const reported = reportedSlots(input.runsText);
  const bySlot = tracesBySlot(input.slots, traces);
  return input.slots.map((slot) => {
    const own = bySlot.get(slot) ?? [];
    if (own.length > 0) return { ...slot, class: classOfTraces(own), traces: own };
    if (reported.has(slotKey(slot.routine, slot.at)))
      return { ...slot, class: 'missed', traces: own };
    if (slot.routine === 'burn-down' && slot.at.getUTCHours() !== 17) {
      return { ...slot, class: nightWasCold(slot, runs) ? 'cold' : 'silent', traces: own };
    }
    return { ...slot, class: 'missed', traces: own };
  });
}

export interface RoutineRow {
  routine: string;
  slots: number;
  counts: Record<SlotClass, number>;
}

/** Counts per routine, in ROUTINES order, plus a `total` row last. */
export function rows(classified: readonly ClassifiedSlot[]): RoutineRow[] {
  const byRoutine = new Map<string, RoutineRow>();
  const blank = (): Record<SlotClass, number> =>
    Object.fromEntries(CLASSES.map((c) => [c, 0])) as Record<SlotClass, number>;
  for (const slot of classified) {
    let row = byRoutine.get(slot.routine);
    if (!row) {
      row = { routine: slot.routine, slots: 0, counts: blank() };
      byRoutine.set(slot.routine, row);
    }
    row.slots += 1;
    row.counts[slot.class] += 1;
  }
  const total: RoutineRow = { routine: 'total', slots: 0, counts: blank() };
  for (const row of byRoutine.values()) {
    total.slots += row.slots;
    for (const c of CLASSES) total.counts[c] += row.counts[c];
  }
  return [...byRoutine.values(), total];
}

/** Built slots over the slots that had queued work (all but cold), as a whole percentage; `—` for none. */
export function builtPct(row: RoutineRow): string {
  const withWork = row.slots - row.counts.cold;
  if (withWork === 0) return '—';
  return `${Math.round((row.counts.built / withWork) * 100)}%`;
}

/** Cold + silent + missed over all slots. */
export function idlePct(row: RoutineRow): string {
  if (row.slots === 0) return '—';
  const idle = row.counts.cold + row.counts.silent + row.counts.missed;
  return `${Math.round((idle / row.slots) * 100)}%`;
}

const dateOf = (d: Date): string => stamp(d).slice(0, 10);

/** The Markdown table (header, one row per routine, a total row). */
export function table(classified: readonly ClassifiedSlot[], from: Date, to: Date): string {
  const head = `| Routine | Slots | Built | Researched | Pre-research | Ran | Cold | Silent | Missed | Built % | Idle % |`;
  const rule = `| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |`;
  const lines = rows(classified).map((row) => {
    const c = row.counts;
    const name = row.routine === 'total' ? '**total**' : row.routine;
    return `| ${name} | ${row.slots} | ${c.built} | ${c.researched} | ${c['pre-research']} | ${c.ran} | ${c.cold} | ${c.silent} | ${c.missed} | ${builtPct(row)} | ${idlePct(row)} |`;
  });
  return [
    `Slots ${dateOf(from)}..${dateOf(to)} UTC (burn-down counts every hourly fire 17:00–02:00; built % = built ÷ slots that had work, idle % = cold + silent + missed ÷ all):`,
    '',
    head,
    rule,
    ...lines,
  ].join('\n');
}

/** One line per idle slot (cold, silent, missed) so the retro can name them without a hand count. */
export function idleLines(classified: readonly ClassifiedSlot[]): string[] {
  return classified
    .filter((s) => s.class === 'cold' || s.class === 'silent' || s.class === 'missed')
    .map((s) => `${s.class}: ${s.routine} ${stamp(s.at)}`);
}

/** Phrase every usage ask carries — the dedupe record in RUNS.md, like the watchdog's lines. */
export const USAGE_ASK_MARK = 'usage note';
export const USAGE_ASK_AFTER_DAYS = 7;

export interface BurnReport {
  date?: string;
  total_pct?: number | null;
}

/**
 * The one-sentence ask for a fresh `usage NN%` note when BURN.json's report is older than 7 days
 * and RUNS.md carries no `| notify |` ask from the last 7 days; otherwise undefined.
 */
export function usageAsk(
  report: BurnReport | undefined,
  runsText: string,
  now: Date,
): string | undefined {
  const date = report?.date;
  const age = date
    ? Math.floor((now.getTime() - Date.parse(`${date}T00:00:00Z`)) / DAY)
    : undefined;
  if (age !== undefined && age < USAGE_ASK_AFTER_DAYS) return undefined;
  const floor = now.getTime() - USAGE_ASK_AFTER_DAYS * DAY;
  const asked = parseRuns(runsText).some(
    (t) => t.kind === 'notify' && t.text.includes(USAGE_ASK_MARK) && t.at.getTime() >= floor,
  );
  if (asked) return undefined;
  const last = date ? `the last one was ${date}` : 'none received yet';
  // ≤ 90 chars: it rides the Monday report's `| notify |` digest line.
  return `Please send a usage note like "usage 62% fable 71%"; ${last}`;
}

export interface Options {
  days: number;
  to?: string;
  from?: string;
}

export function parseArgs(argv: readonly string[]): Options {
  const opts: Options = { days: 7 };
  for (const arg of argv) {
    const m = /^--(days|to|from)=(.+)$/.exec(arg);
    const value = m?.[2];
    if (!m || value === undefined) continue;
    if (m[1] === 'days') opts.days = Math.max(1, Number.parseInt(value, 10) || 7);
    else if (m[1] === 'to') opts.to = value;
    else opts.from = value;
  }
  return opts;
}

/** The window [from 00:00, to 23:59:59] UTC: by default the `days` complete days before today. */
export function windowOf(opts: Options, now: Date): { from: Date; to: Date } {
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const toDay = opts.to ? Date.parse(`${opts.to}T00:00:00Z`) : today - DAY;
  const fromDay = opts.from ? Date.parse(`${opts.from}T00:00:00Z`) : toDay - (opts.days - 1) * DAY;
  return { from: new Date(fromDay), to: new Date(toDay + DAY - 1000) };
}

function main(argv: string[]): void {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const now = new Date();
  const opts = parseArgs(argv);
  const { from, to } = windowOf(opts, now);
  const runsText = readFileSync(path.join(root, 'docs', 'RUNS.md'), 'utf8');
  let commitsText = '';
  try {
    commitsText = execSync(
      `git log --since=${new Date(from.getTime() - DAY).toISOString()} --format=%cI%x09%s`,
      { cwd: root, encoding: 'utf8' },
    );
  } catch {
    // A clone without history still gets the RUNS.md reading.
  }
  const slots = slotsIn(utilisationRoutines(), from, to, now);
  const classified = classifySlots({ runsText, commitsText, slots });
  console.log(table(classified, from, to));
  const idle = idleLines(classified);
  if (idle.length > 0) console.log(['', 'idle slots:', ...idle.map((l) => `- ${l}`)].join('\n'));
  const burnPath = path.join(root, 'docs', 'ops', 'BURN.json');
  const burn = existsSync(burnPath)
    ? (JSON.parse(readFileSync(burnPath, 'utf8')) as { report?: BurnReport })
    : {};
  const ask = usageAsk(burn.report, runsText, now);
  if (ask) console.log(`\nusage-ask: ${ask}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2));
}
