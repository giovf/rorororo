// The `ci-minutes:` run-log line of scripts/actions-minutes.mjs, built so it always fits the
// 120-char text cap of docs/RUNS.md (`npm run runs`) without cutting the top-3 list mid-number.
// 2026-10-24 (foundry `ci-minutes-line-fits-cap`): every line since 10-17 was `.slice(0, 120)`d
// inside the list — "owner notes 8" for 84 minutes, "fe" for fetch relay — and the list is the
// only part that names a lever. The wall figure and the warn threshold stay in the job log.

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
}

/** One line, ≤ `RUN_LINE_CAP` chars, listing as many of the top three workflows as fit whole. */
export function ciMinutesLine(f: CiMinutesFigures): string {
  const head = `ci-minutes: ${f.billed} billed min/7d (~${f.projection}/mo; cap ${f.cap ?? PRIVATE_CAP_MINUTES})`;
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
