// The `ci-minutes:` run-log line of scripts/actions-minutes.mjs, built so it always fits the
// 120-char text cap of docs/RUNS.md (`npm run runs`) without cutting the top-3 list mid-number.
// 2026-10-24 (foundry `ci-minutes-line-fits-cap`): every line since 10-17 was `.slice(0, 120)`d
// inside the list — "owner notes 8" for 84 minutes, "fe" for fetch relay — and the list is the
// only part that names a lever. The wall figure and the warn threshold stay in the job log.
// 2026-11-07 (foundry `ci-minutes-line-public-repo`): the 2,000-minute cap binds private repositories on
// the free plan only; the owner kept the repository public on 2026-11-02 (action 036, A), so the line
// read `cap 2000` as a false warning for five days. The caller passes `isPublic` from the runs' own
// `repository.private`, and a public repository prints `public, no cap` while the measurement and the
// top-3 list stay (cost awareness for a later private switch); the cap clause returns the day it is private.

export const RUN_LINE_CAP = 120;
export const PRIVATE_CAP_MINUTES = 2000;

export interface CiMinutesFigures {
  /** Billed minutes over the last 7 days (per run, rounded up to whole minutes). */
  billed: number;
  /** 30-day projection of `billed`. */
  projection: number;
  /** Workflows by billed minutes, highest first; only the first three are printed. */
  top: ReadonlyArray<readonly [name: string, minutes: number]>;
  cap?: number;
  /** `repository.private === false` on the runs read; the cap clause is printed only when it is not true. */
  isPublic?: boolean;
}

/** One line, ≤ `RUN_LINE_CAP` chars, listing as many of the top three workflows as fit whole. */
export function ciMinutesLine(f: CiMinutesFigures): string {
  const cap = f.isPublic ? 'public, no cap' : `cap ${f.cap ?? PRIVATE_CAP_MINUTES}`;
  const head = `ci-minutes: ${f.billed} billed min/7d (~${f.projection}/mo; ${cap})`;
  const entries = f.top
    .slice(0, 3)
    .map(([name, m]) => [name.trim(), String(Math.round(m))] as const);
  const first = entries[0];
  if (!first) return head.slice(0, RUN_LINE_CAP);
  const parts: string[] = [];
  for (const [name, m] of entries) {
    const candidate = `${head} top: ${[...parts, `${name} ${m}`].join(', ')}`;
    if (candidate.length > RUN_LINE_CAP) break;
    parts.push(`${name} ${m}`);
  }
  if (parts.length === 0) {
    // Not even the first workflow fits whole: shorten its name, never its number.
    const [name, m] = first;
    const room = RUN_LINE_CAP - `${head} top:  ${m}`.length;
    if (room < 2) return head.slice(0, RUN_LINE_CAP);
    return `${head} top: ${name.slice(0, room)} ${m}`;
  }
  return `${head} top: ${parts.join(', ')}`;
}

/**
 * True when `runsMd` already carries a `| watchdog | ci-minutes:` line dated `today` (YYYY-MM-DD).
 * The guard writes at most one line a day, so a run that finds it has nothing to measure: it exits
 * before the run pages and the per-run jobs calls (≈ 170 a run in the week to 2026-11-02, on every
 * one of notify owner's 71 runs; foundry `ci-minutes-guard-once-a-day`).
 */
export function warnedToday(runsMd: string, today: string): boolean {
  return runsMd
    .split('\n')
    .some((l) => l.startsWith(`- ${today}`) && l.includes('| watchdog | ci-minutes:'));
}
