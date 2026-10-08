// The burn-down's `npm run pipeline cold` gate: is the night's one exchange pre-research pass
// already spent? (2026-10-07, foundry cold-gate-night-window.) Plain node, no dist, like `cold`.
//
// A burn night runs 17:00–02:59 UTC, so "this night" is every run-log line stamped at or after the
// most recent 17:00 UTC — never yesterday's whole day. And only the pass itself counts: its line
// starts with `Exchange pre-research:`; a `Stopping: … pre-research spent` line is a report of an
// earlier pass, and matching it kept the gate shut for two nights (10-06, 10-07) after the single
// real pass on 2026-10-05.
// (Node 22 runs .ts directly — keep syntax erasable)

export const NIGHT_START_HOUR_UTC = 17;
export const PRE_RESEARCH_PREFIX = 'Exchange pre-research:';
/** Same as @foundry/core's DATED_READY_HOUR_UTC (the gate runs before any dist exists). */
export const DATED_READY_HOUR_UTC = 7;

/** A `not_before` date has arrived at `now`: an earlier day, or today from 07:00 UTC (foundry `dated-items-wait-for-row`). */
export function datedArrived(not_before: string | undefined, now: Date): boolean {
  if (not_before === undefined) return true;
  const today = now.toISOString().slice(0, 10);
  return not_before < today || (not_before === today && now.getUTCHours() >= DATED_READY_HOUR_UTC);
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

/** The `YYYY-MM-DD HH:MM` stamp of a `docs/RUNS.md` line, or undefined for any other line. */
export function lineStamp(line: string): string | undefined {
  const m = /^- (\d{4}-\d{2}-\d{2} \d{2}:\d{2}) \|/.exec(line);
  return m?.[1];
}

/** True when a `| burn-down |` line stamped this night starts its sentence with the pass prefix. */
export function preResearchSpent(runs: string, now: Date): boolean {
  const since = nightStart(now);
  return runs.split('\n').some((line) => {
    const stamp = lineStamp(line);
    if (stamp === undefined || stamp < since) return false;
    const cells = line.split(' | ');
    return cells[1] === 'burn-down' && (cells[2] ?? '').startsWith(PRE_RESEARCH_PREFIX);
  });
}
