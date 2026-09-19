# Stripe setup (test mode)

Billing ships dark: every `/v1/billing/*` endpoint returns a clean 503 until
`STRIPE_SECRET_KEY` is configured. Nothing else in the platform depends on it.

## One-time bootstrap

1. Create a Stripe account (or use the existing one) and grab the **test**
   secret key (`sk_test_...`).
2. Create the products/prices (idempotent; placeholder pricing lives in
   `src/billing/plans.json` — the single source the app and this script both
   read, so Stripe can't drift from what the app grants):

   ```bash
   STRIPE_SECRET_KEY=sk_test_... node scripts/stripe-setup.mjs
   ```

3. Local secrets go in `.dev.vars` (never `.env`, never committed):

   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...   # from `stripe listen`, see below
   ```

   Production (ask first per CLAUDE.md): `wrangler secret put STRIPE_SECRET_KEY`
   and `wrangler secret put STRIPE_WEBHOOK_SECRET`.

## Webhook flow

- Endpoint: `POST /v1/billing/webhook` (signature-verified, public).
- Events that matter:
  - `checkout.session.completed` → links customer ↔ key ↔ plan (no credits).
  - `invoice.paid` → grants the plan's credits (first payment AND renewals);
    idempotent via a unique index on `credit_ledger.stripe_ref`.
  - `customer.subscription.updated` → plan change (credits adjust at next invoice).
  - `customer.subscription.deleted` → downgrade to `free`.
- Everything else is logged and acknowledged.

## Manual end-to-end test (test mode)

```bash
npm run dev
stripe listen --forward-to localhost:8787/v1/billing/webhook   # prints whsec_... → .dev.vars, restart dev
# issue a key, then:
curl -X POST localhost:8787/v1/billing/checkout \
  -H "Authorization: Bearer fapi_..." -H 'content-type: application/json' \
  -d '{"plan":"starter"}'
# open the returned URL, pay with card 4242 4242 4242 4242
curl -H "Authorization: Bearer fapi_..." localhost:8787/v1/usage   # granted should jump
curl -H "Authorization: Bearer fapi_..." localhost:8787/v1/billing/portal  # manage/cancel
```

Dunning, retries, receipts, and cancellation UX are Stripe-native (portal) —
no code here handles them, by design.
