#!/usr/bin/env node
// One-time Stripe bootstrap (TEST MODE unless you explicitly pass a live key —
// live-mode object creation is an ask-first operation per CLAUDE.md).
//
//   STRIPE_SECRET_KEY=sk_test_... node scripts/stripe-setup.mjs
//
// Creates one product per paid plan with a monthly price carrying a stable
// lookup_key (the Worker resolves prices by lookup_key, so ids never need to
// be configured) and the credit amount in metadata for human reference.
// Amounts are blueprint placeholders — adjust here + src/billing/plans.ts
// together. Re-running is safe: existing lookup_keys are skipped.

import Stripe from 'stripe';

const PLANS = [
  { name: 'Starter', lookupKey: 'starter_monthly', usd: 29, credits: 5000 },
  { name: 'Growth', lookupKey: 'growth_monthly', usd: 99, credits: 20000 },
  { name: 'Scale', lookupKey: 'scale_monthly', usd: 299, credits: 100000 },
];

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error('Set STRIPE_SECRET_KEY (test mode: sk_test_...) and re-run.');
  process.exit(1);
}
if (!key.startsWith('sk_test_')) {
  console.error('Refusing non-test key: live-mode object creation is ask-first (CLAUDE.md).');
  process.exit(1);
}

const stripe = new Stripe(key);

const existing = await stripe.prices.list({
  lookup_keys: PLANS.map((p) => p.lookupKey),
  limit: 100,
});
const existingKeys = new Set(existing.data.map((p) => p.lookup_key));

for (const plan of PLANS) {
  if (existingKeys.has(plan.lookupKey)) {
    console.log(`= ${plan.lookupKey} already exists, skipping`);
    continue;
  }
  const product = await stripe.products.create({
    name: `faceless-api ${plan.name}`,
    metadata: { credits: String(plan.credits) },
  });
  await stripe.prices.create({
    product: product.id,
    unit_amount: plan.usd * 100,
    currency: 'usd',
    recurring: { interval: 'month' },
    lookup_key: plan.lookupKey,
    metadata: { credits: String(plan.credits) },
  });
  console.log(`+ created ${plan.name} ($${plan.usd}/mo, ${plan.credits} credits)`);
}
console.log('Done. Point STRIPE_WEBHOOK_SECRET at a webhook for /v1/billing/webhook.');
