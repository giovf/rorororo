// Paid plans as data, never logic (PRD: pricing is launch-time config).
// Amounts/credits are blueprint placeholders; the Stripe objects are created
// by scripts/stripe-setup.mjs with matching lookup_keys (see docs/STRIPE-SETUP.md).
export interface PaidPlan {
  /** Stripe price lookup_key (test + live mode use the same keys). */
  lookupKey: string;
  /** Credits granted per paid invoice (monthly). */
  credits: number;
  usdPerMonth: number;
}

export const PAID_PLANS: Record<string, PaidPlan> = {
  starter: { lookupKey: 'starter_monthly', credits: 5_000, usdPerMonth: 29 },
  growth: { lookupKey: 'growth_monthly', credits: 20_000, usdPerMonth: 99 },
  scale: { lookupKey: 'scale_monthly', credits: 100_000, usdPerMonth: 299 },
};

export function planByLookupKey(lookupKey: string): string | undefined {
  return Object.keys(PAID_PLANS).find((plan) => PAID_PLANS[plan]!.lookupKey === lookupKey);
}
