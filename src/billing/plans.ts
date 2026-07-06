// Paid plans as data, never logic (PRD: pricing is launch-time config).
// Amounts/credits are blueprint placeholders; the Stripe objects are created
// by scripts/stripe-setup.mjs with matching lookup_keys (see docs/STRIPE-SETUP.md).
import { FREE_TIER_CREDITS } from '../lib/constants';

export interface PaidPlan {
  /** Stripe price lookup_key (test + live mode use the same keys). */
  lookupKey: string;
  /** Monthly credit allowance for this plan (resets each period). */
  credits: number;
  usdPerMonth: number;
}

export const FREE_PLAN = 'free';

export const PAID_PLANS: Record<string, PaidPlan> = {
  starter: { lookupKey: 'starter_monthly', credits: 5_000, usdPerMonth: 29 },
  growth: { lookupKey: 'growth_monthly', credits: 20_000, usdPerMonth: 99 },
  scale: { lookupKey: 'scale_monthly', credits: 100_000, usdPerMonth: 299 },
};

export function isPaidPlan(plan: string): boolean {
  return Object.hasOwn(PAID_PLANS, plan);
}

/**
 * Monthly credit allowance for a plan — the single source of truth for the
 * quota cap. Usage resets each calendar month (metering/counters.ts); the
 * credit_ledger is an audit trail of grants/payments, NOT the live quota, so
 * renewals never inflate the cap and cancellation (plan → free) drops back to
 * the free allowance automatically. Unknown plans fall back to free.
 */
export function planAllowance(plan: string): number {
  return isPaidPlan(plan) ? PAID_PLANS[plan]!.credits : FREE_TIER_CREDITS;
}

export function planByLookupKey(lookupKey: string): string | undefined {
  return Object.keys(PAID_PLANS).find((plan) => PAID_PLANS[plan]!.lookupKey === lookupKey);
}
