// The burn-down's `npm run pipeline cold` gate: is the night's one exchange pre-research pass
// already spent? (2026-10-07, foundry cold-gate-night-window.) Plain node, no dist, like `cold`.
//
// A burn night runs 17:00–02:59 UTC, so "this night" is every run-log line stamped at or after the
// most recent 17:00 UTC — never yesterday's whole day. And only the pass itself counts: its line
// starts with `Exchange pre-research:`; a `Stopping: … pre-research spent` line is a report of an
// earlier pass, and matching it kept the gate shut for two nights (10-06, 10-07) after the single
// real pass on 2026-10-05.
// 2026-10-10 (foundry `build-slot-pre-research`): the 09:00/17:00 build slot has the same one pass
// per DAY window — since the most recent 07:00 UTC — asked with `--routine=build`; a pass by either
// routine inside the window spends it, so the 17:00 burn-down and the 17:10 build do not both take one.
// (Node 22 runs .ts directly — keep syntax erasable)

export const NIGHT_START_HOUR_UTC = 17;
/** The build slot's pre-research window opens at 07:00 UTC (after the metrics rows, like dated items). */
export const DAY_START_HOUR_UTC = 7;
/** The routines that take an exchange pre-research pass, each in its own window. */
export type PassRoutine = 'burn-down' | 'build';
const PASS_ROUTINES: readonly string[] = ['burn-down', 'build'];
export const PRE_RESEARCH_PREFIX = 'Exchange pre-research:';
/** Same as @foundry/core's DATED_READY_HOUR_UTC (the gate runs before any dist exists). */
export const DATED_READY_HOUR_UTC = 7;

/** A `not_before` date has arrived at `now`: an earlier day, or today from 07:00 UTC (foundry `dated-items-wait-for-row`). */
export function datedArrived(not_before: string | undefined, now: Date): boolean {
  if (not_before === undefined) return true;
  const today = now.toISOString().slice(0, 10);
  return not_before < today || (not_before === today && now.getUTCHours() >= DATED_READY_HOUR_UTC);
}

/**
 * A `todo` item dated for today (before 07:00 UTC) or tomorrow: its queue is waiting, not starved
 * (2026-10-20, foundry `dated-within-day-not-starved`; same rule as @foundry/core's `awaitsDatedItem`).
 */
export function datedWithinDay(not_before: string | undefined, now: Date): boolean {
  if (not_before === undefined || datedArrived(not_before, now)) return false;
  const today = now.toISOString().slice(0, 10);
  return Date.parse(not_before) - Date.parse(today) <= 86_400_000;
}

const pad = (n: number): string => String(n).padStart(2, '0');

/** `YYYY-MM-DD HH:MM` (UTC) of the 17:00 that began the burn night containing `now`. */
export function nightStart(now: Date): string {
  const start = new Date(now.getTime());
  start.setUTCMinutes(0, 0, 0);
  start.setUTCHours(NIGHT_START_HOUR_UTC);
  if (now.getUTCHours() < NIGHT_START_HOUR_UTC) start.setUTCDate(start.getUTCDate() - 1);
  return `${start.toISOString().slice(0, 10)} ${pad(start.getUTCHours())}:00`;
}

/** `YYYY-MM-DD HH:MM` (UTC) of the 07:00 that began the build day containing `now`. */
export function dayStart(now: Date): string {
  const start = new Date(now.getTime());
  start.setUTCMinutes(0, 0, 0);
  start.setUTCHours(DAY_START_HOUR_UTC);
  if (now.getUTCHours() < DAY_START_HOUR_UTC) start.setUTCDate(start.getUTCDate() - 1);
  return `${start.toISOString().slice(0, 10)} ${pad(start.getUTCHours())}:00`;
}

/** The window a routine's pass belongs to: the burn-down's night (17:00), the build's day (07:00). */
export function passWindowStart(routine: PassRoutine, now: Date): string {
  return routine === 'build' ? dayStart(now) : nightStart(now);
}

/** The `YYYY-MM-DD HH:MM` stamp of a `docs/RUNS.md` line, or undefined for any other line. */
export function lineStamp(line: string): string | undefined {
  const m = /^- (\d{4}-\d{2}-\d{2} \d{2}:\d{2}) \|/.exec(line);
  return m?.[1];
}

/**
 * True when a `| burn-down |` or `| build |` line stamped inside `routine`'s window (the night from
 * 17:00 for the burn-down, the day from 07:00 for the build) starts its sentence with the pass prefix.
 */
export function preResearchSpent(
  runs: string,
  now: Date,
  routine: PassRoutine = 'burn-down',
): boolean {
  const since = passWindowStart(routine, now);
  return runs.split('\n').some((line) => {
    const stamp = lineStamp(line);
    if (stamp === undefined || stamp < since) return false;
    const cells = line.split(' | ');
    return (
      PASS_ROUTINES.includes(cells[1] ?? '') && (cells[2] ?? '').startsWith(PRE_RESEARCH_PREFIX)
    );
  });
}

/** How long a build slot's start marker counts as "in flight" for the burn-down's research deferral. */
export const BUILD_IN_FLIGHT_MINUTES = 60;

/**
 * The stamp (`YYYY-MM-DD HH:MM`) of a build slot that is researching right now, or undefined
 * (2026-10-23, foundry `research-defers-to-build-slot`). The 17:00 build and the 17:00 burn-down
 * read the same `empty` list, and research has no claim marker, so both researched the same venture
 * unless one of them reasoned it out by hand (2026-10-23: the burn-down read the 17:10 marker and
 * stepped back). In flight = a `| build | started` line of docs/ops/SLOTS.md within the last hour
 * (up to 5 min of clock skew ahead) with no `| build |` run-log line stamped at or after it — a build
 * that already logged is done, and its research is on main for `cold` to see as cooling. Burn-down
 * only: the build routine never defers to itself.
 */
export function buildSlotInFlight(
  slots: string,
  runs: string,
  now: Date,
  routine: PassRoutine = 'burn-down',
): string | undefined {
  if (routine !== 'burn-down') return undefined;
  const from = now.getTime() - BUILD_IN_FLIGHT_MINUTES * 60_000;
  const until = now.getTime() + 5 * 60_000;
  let marker: string | undefined;
  for (const line of slots.split('\n')) {
    const m = /^- (\d{4}-\d{2}-\d{2} \d{2}:\d{2}) \| build \| started\s*$/.exec(line);
    if (!m) continue;
    const at = Date.parse(`${m[1]!.replace(' ', 'T')}:00Z`);
    if (Number.isNaN(at) || at < from || at > until) continue;
    if (marker === undefined || m[1]! > marker) marker = m[1]!;
  }
  if (marker === undefined) return undefined;
  const logged = runs.split('\n').some((line) => {
    const stamp = lineStamp(line);
    return stamp !== undefined && stamp >= marker && line.split(' | ')[1] === 'build';
  });
  return logged ? undefined : marker;
}

/** The weekly venture exchange fires Wednesdays (UTC day 3) at this hour (docs/SCHEDULERS.md). */
export const EXCHANGE_DAY_UTC = 3;
export const EXCHANGE_HOUR_UTC = 8;
/** Only a run that writes `| exchange |` lines or a `(venture exchange)` commit is the exchange's trace. */
export const EXCHANGE_COMMIT_SUFFIX = '(venture exchange)';

/** `YYYY-MM-DD HH:MM` (UTC) of the most recent Wednesday 08:00 at or before `now`. */
export function lastExchangeSlot(now: Date): string {
  const start = new Date(now.getTime());
  start.setUTCMinutes(0, 0, 0);
  start.setUTCHours(EXCHANGE_HOUR_UTC);
  let back = (start.getUTCDay() - EXCHANGE_DAY_UTC + 7) % 7;
  if (back === 0 && now.getTime() < start.getTime()) back = 7;
  start.setUTCDate(start.getUTCDate() - back);
  return `${start.toISOString().slice(0, 10)} ${pad(start.getUTCHours())}:00`;
}

/**
 * The reason the build slot runs the venture exchange instead of its item, or undefined
 * (2026-10-24, foundry `exchange-missed-slot-fallback`): Wednesday 10-21 every Fable slot of the day
 * missed (the allowance week ends Thursday 03:00 UTC and the burn runs Tuesday night to the limit),
 * the W43 exchange never happened and nothing re-runs it, so the week's promote calls waited for
 * the next Wednesday. From Thursday to Saturday (UTC), when no `| exchange |` run-log line and no
 * commit subject ending `(venture exchange)` is stamped since that Wednesday 08:00, the gate prints
 * `exchange missed: <Wednesday> — run docs/routines/exchange.md` and the build prompt takes that
 * reason before research or build. `subjects` is `git log --since=<Wednesday 08:00> --format=%s`
 * (one per line); the run log alone also counts, so a shallow clone never hides a trace that is on
 * main. Sunday to Wednesday the next exchange is nearer than the missed one: undefined.
 */
export function missedExchange(now: Date, runs: string, subjects: string): string | undefined {
  const day = now.getUTCDay();
  if (day < 4 || day > 6) return undefined;
  const since = lastExchangeSlot(now);
  const logged = runs.split('\n').some((line) => {
    const stamp = lineStamp(line);
    return stamp !== undefined && stamp >= since && line.split(' | ')[1] === 'exchange';
  });
  if (logged) return undefined;
  if (subjects.split('\n').some((s) => s.trimEnd().endsWith(EXCHANGE_COMMIT_SUFFIX)))
    return undefined;
  return `exchange missed: ${since.slice(0, 10)} — run docs/routines/exchange.md`;
}

/** The owner's weekly allowance resets Thursday 03:00 UTC (docs/ops/BURN.json notes). */
export const RESET_DAY_UTC = 4;
export const RESET_HOUR_UTC = 3;
/** A usage report older than this many days says nothing about the week being burned. */
export const REPORT_FRESH_DAYS = 7;
/** On a Monday or Tuesday night with no fresh report, the burn runs at most this many slots that find work. */
export const PACED_SLOT_CAP = 3;
/** The hours of the Fable build slots whose start marker (docs/ops/SLOTS.md) is the day's earliest trace. */
export const BUILD_SLOT_HOURS_UTC: readonly number[] = [9, 17];
/** Grace for the build marker (lands 09:09–09:11, 17:10–17:11); a watchdog grace is two hours, this is first word. */
export const BUILD_MARKER_GRACE_MINUTES = 30;
/** The watchdog's `missed:` and `stalled:` lines end with this question. */
export const USAGE_LIMIT_HINT = 'usage limit?';

/** `YYYY-MM-DD HH:MM` (UTC) of a date, the run-log stamp form. */
const stampOf = (d: Date): string =>
  `${d.toISOString().slice(0, 10)} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;

/** The most recent Thursday 03:00 UTC at or before `now`, when the week's allowance was reset. */
export function lastWeeklyReset(now: Date): Date {
  const reset = new Date(now.getTime());
  reset.setUTCMinutes(0, 0, 0);
  reset.setUTCHours(RESET_HOUR_UTC);
  let back = (reset.getUTCDay() - RESET_DAY_UTC + 7) % 7;
  if (back === 0 && now.getTime() < reset.getTime()) back = 7;
  reset.setUTCDate(reset.getUTCDate() - back);
  return reset;
}

/** True when `report.date` (YYYY-MM-DD) is missing, unreadable or more than REPORT_FRESH_DAYS before `now`. */
export function reportStale(reportDate: string | undefined, now: Date): boolean {
  if (reportDate === undefined) return true;
  const at = Date.parse(`${reportDate}T00:00:00Z`);
  if (Number.isNaN(at)) return true;
  return now.getTime() - at > REPORT_FRESH_DAYS * 86_400_000;
}

/** The slots of this burn night that found work: the distinct clock hours of `| burn-down |` lines since 17:00. */
export function burnSlotsUsed(runs: string, now: Date): number {
  const since = nightStart(now);
  const hours = new Set<string>();
  for (const line of runs.split('\n')) {
    const stamp = lineStamp(line);
    if (stamp === undefined || stamp < since) continue;
    if (line.split(' | ')[1] === 'burn-down') hours.add(stamp.slice(0, 13));
  }
  return hours.size;
}

/**
 * A usage-limit cutoff seen in the last 24 h and since the last Thursday 03:00 reset, or undefined:
 * a `| watchdog |` line asking `usage limit?` (`missed:` or `stalled:`), or a build slot (09:00 /
 * 17:00 UTC, Fable) whose start marker — the build routine's very first push — is missing from
 * docs/ops/SLOTS.md half an hour on and that left no `| build |` run-log line either. The marker
 * is read before the watchdog's 2–4 h grace: on 2026-10-21 the 09:00 build was rejected at start
 * and the burn-down could have known by 09:30 what the watchdog wrote at 12:16.
 */
export function cutoffSeen(runs: string, slots: string, now: Date): string | undefined {
  const floor = Math.max(now.getTime() - 86_400_000, lastWeeklyReset(now).getTime());
  const floorStamp = stampOf(new Date(floor));
  const lines = runs.split('\n');
  for (const line of lines) {
    const stamp = lineStamp(line);
    if (stamp === undefined || stamp < floorStamp) continue;
    const cells = line.split(' | ');
    if (cells[1] === 'watchdog' && (cells[2] ?? '').includes(USAGE_LIMIT_HINT))
      return `watchdog ${stamp}: ${(cells[2] ?? '').split(';')[0]!.trim()}`;
  }
  // Build slots since the floor whose grace has passed, newest first.
  for (let back = 0; back <= 1; back += 1) {
    for (const hour of [...BUILD_SLOT_HOURS_UTC].sort((a, b) => b - a)) {
      const slot = new Date(now.getTime());
      slot.setUTCMinutes(0, 0, 0);
      slot.setUTCHours(hour);
      slot.setUTCDate(slot.getUTCDate() - back);
      const at = slot.getTime();
      if (at < floor || at + BUILD_MARKER_GRACE_MINUTES * 60_000 > now.getTime()) continue;
      const slotStamp = stampOf(slot);
      const graceEnd = at + BUILD_MARKER_GRACE_MINUTES * 60_000;
      const marked = slots.split('\n').some((line) => {
        const m = /^- (\d{4}-\d{2}-\d{2} \d{2}:\d{2}) \| build \| started\s*$/.exec(line);
        if (!m) return false;
        const t = Date.parse(`${m[1]!.replace(' ', 'T')}:00Z`);
        return t >= at && t < graceEnd;
      });
      if (marked) continue;
      const logged = lines.some((line) => {
        const stamp = lineStamp(line);
        return (
          stamp !== undefined &&
          stamp >= slotStamp &&
          Date.parse(`${stamp.replace(' ', 'T')}:00Z`) < at + 2 * 3_600_000 &&
          line.split(' | ')[1] === 'build'
        );
      });
      if (!logged) return `build slot ${slotStamp} UTC left no start marker or run line`;
    }
  }
  return undefined;
}

/**
 * Why the burn-down ends this slot before `npm ci` while the owner's usage report is stale, or
 * undefined (2026-10-24, foundry `burn-pace-stale-usage-report`). docs/ops/BURN.json's `report` was
 * dated 2026-10-04 for 20 days, so `stop_if_weekly_pct_at_least` had no input and the burn drained
 * the Fable allowance on Tuesday night 10-20/21: every Fable slot of Wednesday 10-21 (exchange 08:00,
 * builds 09:00 and 17:00, burn-down 17:00) was rejected and nine night slots were silent until the
 * Thursday 03:00 reset. With the allowance unknown: a Monday or Tuesday night (UTC, the night that
 * starts 17:00) runs at most PACED_SLOT_CAP hourly slots that find work; any night ends at once when
 * `cutoffSeen` names a signal. Wednesday night (the reset is hours away) and Thursday to Sunday are
 * unchanged, and a fresh report hands the decision back to the percentage gate.
 */
export function pacedStop(
  reportDate: string | undefined,
  runs: string,
  slots: string,
  now: Date,
): string | undefined {
  if (!reportStale(reportDate, now)) return undefined;
  const stale =
    reportDate === undefined ? 'no usage report' : `usage report ${reportDate} is stale`;
  const cutoff = cutoffSeen(runs, slots, now);
  if (cutoff !== undefined) return `${stale}; cutoff seen — ${cutoff}`;
  const night = nightStart(now);
  const weekday = new Date(`${night.replace(' ', 'T')}:00Z`).getUTCDay();
  if (weekday !== 1 && weekday !== 2) return undefined;
  const used = burnSlotsUsed(runs, now);
  if (used < PACED_SLOT_CAP) return undefined;
  const name = weekday === 1 ? 'Monday' : 'Tuesday';
  return `${stale}; ${name} night ${night.slice(0, 10)} used ${used} of ${PACED_SLOT_CAP} slots`;
}
