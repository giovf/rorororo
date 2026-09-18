# Owner action request #3 — ReadFocus test (done) + API access for payments & hosting

- **Date:** 2026-09-18 (rewritten after round 2 passed)
- **Status:** **DONE 2026-09-18** — keys received; Stripe product/price/Payment Link, licence worker, KV, secrets and webhook all provisioned by Claude. One follow-up: the Stripe key needs **Coupons: Write** for a £0 test purchase (see chat).
- **Your time:** ~10 minutes
- **Cost:** £0.00
- **Blocks:** ReadFocus store submission (task 14.6–14.8)

You already have Stripe, Cloudflare and Resend accounts from another project — reuse them.
Give Claude scoped keys and it does everything else (products, prices, payment link,
webhook, worker deploy, KV, secrets). Keys go into `/workspaces/rorororo/.env` (gitignored);
never paste them into chat. You can revoke each key at any time.

## 1. Stripe — restricted key + one dashboard toggle
- **Where:** dashboard.stripe.com → Developers → **API keys** → *Create restricted key*.
- **Name:** `foundry-agent`. **Permissions** (Write unless noted):
  Products, Prices (under *Product catalogue*), Payment Links, Checkout Sessions (**Read**),
  Webhook Endpoints, Customers (**Read**), Refunds (Write — for the one-refund policy).
  Everything else: None.
- Put it in `.env`: `STRIPE_SECRET_KEY="rk_live_…"` (use the **live** mode key; there is no
  test phase worth having for a $12 product — the first real sale is the test).
- **Dashboard toggle (only you can do this):** Managed Payments must be enabled on the
  account so Stripe is the merchant of record (VAT/invoices/refunds handled). Dashboard →
  **Managed Payments** (or Settings → Product settings) → *Get started* and complete the
  short onboarding. If it's already on from the other project, nothing to do. Tell me
  which.
- **Give back:** "Stripe key in .env", and "Managed Payments on/off".

## 2. Cloudflare — API token + account id
- **Where:** dash.cloudflare.com → profile (top right) → **API Tokens** → *Create Token* →
  template **Edit Cloudflare Workers**. Add the permission **Account → Workers KV Storage →
  Edit** to the template's list (it isn't included by default). Scope to your account.
- `.env`: `CLOUDFLARE_API_TOKEN="…"` and `CLOUDFLARE_ACCOUNT_ID="…"` (Account ID is on the
  right of the Workers & Pages overview page).
- **Give back:** "Cloudflare in .env".

## 3. Resend — API key
- **Where:** resend.com → **API Keys** → *Create* → sending access, domain `gankdat.com`.
- `.env`: `RESEND_API_KEY="re_…"`.
- **Give back:** "Resend in .env".

## Then Claude does (no action from you)
Creates the ReadFocus product + $12 price + Payment Link (metadata `venture=read-focus`,
`tier=pro`, email collected, redirect to the thanks page); deploys the licence worker;
creates the KV namespace; sets its secrets; registers the Stripe webhook for
`checkout.session.completed`; wires the real worker URL into the extension; makes one
£0 test purchase flow with a 100%-off coupon to prove the key email arrives; reports back
with the Payment Link URL and the ledger row.
