#!/usr/bin/env node
// One-time Stripe bootstrap (TEST MODE unless you explicitly pass a live key —
// live-mode object creation is an ask-first operation per CLAUDE.md).
//
//   STRIPE_SECRET_KEY=sk_test_... node scripts/stripe-setup.mjs
//
// Creates one product per paid plan with a monthly price carrying a stable
// lookup_key (the Worker resolves prices by lookup_key, so ids never need to
// be configured) and the credit amount in metadata for human reference.
// Plan data comes from the SAME src/billing/plans.json the app uses, so Stripe
// prices/credits can't drift from what the app validates and grants. Change
// prices there. Re-running is safe: existing lookup_keys are skipped.

import Stripe from 'stripe';
import paidPlans from '../src/billing/plans.json' with { type: 'json' };

// key → display name for the Stripe product (e.g. "starter" → "Starter").
const displayName = (key) => key.charAt(0).toUpperCase() + key.slice(1);
const PLANS = Object.entries(paidPlans).map(([key, p]) => ({
  name: displayName(key),
  lookupKey: p.lookupKey,
  usd: p.usdPerMonth,
  credits: p.credits,
}));

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
    name: `gankdat ${plan.name}`,
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
