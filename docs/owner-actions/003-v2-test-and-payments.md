# Owner action request #3 — ReadFocus test round + payments plumbing

- **Date:** 2026-09-18
- **Status:** READY (parts 1–2). Part 3 only once Stripe onboarding is complete.
- **Your time:** ~15 min (1), ~10 min (2), ~15 min (3)
- **Cost:** £0.00
- **Blocks:** task 14.6–14.8 (V2 launch), V2/V3 checkout

## 1. Load ReadFocus unpacked and run the checklist
`ventures/read-focus/TESTING.md`. Same drill as the Figma round: tell me what broke.

## 2. Stripe Managed Payments — finish onboarding, then create one Payment Link
- **Where:** dashboard.stripe.com → Managed Payments (the flow Lemon Squeezy sent you to).
- **Steps:**
  1. Complete identity/payout onboarding (UK sole trader; your name; bank account).
  2. Products → **+ Add product**: name "ReadFocus — lifetime unlock", one-time, **$12 USD**
     (let Stripe present local currency), tax category *Digital goods / software (electronic
     delivery)*.
  3. **Payment links → + New**: that product, quantity fixed at 1, collect email (required),
     **Metadata**: `venture` = `read-focus`, `tier` = `pro`. After-payment: "Don't show
     confirmation page" → redirect to `https://giovf.github.io/rorororo/thanks.html`.
  4. Developers → **Webhooks → + Add endpoint**: URL will be the licence worker (part 3) —
     leave this until part 3 is done, or create it now with a placeholder and edit later.
  5. Developers → API keys → **Create restricted key** named "foundry-licences": only
     *Checkout Sessions: Read*. Put it in `.env` as `STRIPE_SECRET_KEY`.
- **Give back:** the Payment Link URL (public, fine in chat) and "Stripe done".

## 3. Cloudflare (free) — for the licence worker
- **Where:** https://dash.cloudflare.com → sign up (free plan).
- **Steps:**
  1. Profile → API Tokens → Create token → template **Edit Cloudflare Workers** →
     put it in `.env` as `CLOUDFLARE_API_TOKEN`; Account ID (right sidebar of the
     Workers page) as `CLOUDFLARE_ACCOUNT_ID`.
  2. That's it — I deploy the worker, create the KV namespace and set secrets from here
     (`RESEND_API_KEY` needed too: resend.com → API Keys → add to `.env`).
- **Give back:** "Cloudflare done", "Resend key in .env".

Not needed yet: a custom domain (the Pages URL works for Stripe and the stores).
