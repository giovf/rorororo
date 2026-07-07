// Paid plans as data, never logic (PRD: pricing is launch-time config). The
// single source of truth is plans.json — imported here for the runtime and by
// scripts/stripe-setup.mjs so the Stripe products can never drift from what the
// app validates and grants (see docs/STRIPE-SETUP.md).
import paidPlansData from './plans.json';
import { FREE_TIER_CREDITS } from '../lib/constants';

export interface PaidPlan {
  /** Stripe price lookup_key (test + live mode use the same keys). */
  lookupKey: string;
  /** Monthly credit allowance for this plan (resets each period). */
  credits: number;
  usdPerMonth: number;
}

export const FREE_PLAN = 'free';

export const PAID_PLANS: Record<string, PaidPlan> = paidPlansData;

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
