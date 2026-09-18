/** Free-tier rules, kept pure so the threshold is testable and easy to tune. */
export const FREE_LINKS_PER_DAY = 25;

export interface TierState {
  paid: boolean;
  /** YYYY-MM-DD the counter belongs to; a new day resets it. */
  day: string;
  /** Links applied while unpaid on `day`. */
  used: number;
}

export function today(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/** Returns the state with the counter reset if the day has changed. */
export function rollover(state: TierState, now = new Date()): TierState {
  const d = today(now);
  return state.day === d ? state : { ...state, day: d, used: 0 };
}

export function allowedLinks(state: TierState, requested: number): number {
  if (state.paid) return requested;
  return Math.max(0, Math.min(requested, FREE_LINKS_PER_DAY - state.used));
}
