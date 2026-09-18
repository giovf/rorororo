/** Free-tier rules, kept pure so the threshold is testable and easy to tune. */
export const FREE_LINKS_PER_RUN = 25;

export interface TierState {
  paid: boolean;
  /** Links already applied in this run/session while unpaid. */
  usedThisRun: number;
}

export function allowedLinks(state: TierState, requested: number): number {
  if (state.paid) return requested;
  return Math.max(0, Math.min(requested, FREE_LINKS_PER_RUN - state.usedThisRun));
}
