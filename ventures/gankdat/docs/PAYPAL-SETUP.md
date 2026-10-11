# PayPal credit packs — setup and design

Built 2026-10-11 as the PayPal AI Hackathon entry (`ventures/hackathons/entries/paypal-ai-hackathon/`).
**Sandbox only**: `src/billing/paypal.ts` talks to `api-m.sandbox.paypal.com` by construction; there is
no live switch. Going live is a strategy decision (Stripe is the live rail) and would need the owner's
live PayPal business account, the terms rewritten (`public/terms.html` §6) and a ledger row.

## What it sells

One-off **credit packs** (`src/billing/packs.json`: 1,000 / 5,000 / 20,000 credits for US$8 / 35 / 120)
that add to an account's **top-up balance**. The balance is spent only once the month's plan allowance
is gone and never resets, so a pack is a buffer on top of any plan, free included (`metering/budget.ts`:
plan first, then top-up; `X-Credits-Source: plan|topup` on every metered response; no upgrade nudge on
a top-up call). `/v1/usage`, `get_usage` and the account page show `topup`, and `remaining` is plan
remaining plus top-up.

## Surfaces

| Who | Buy | Capture |
| --- | --- | --- |
| Agent with a key (REST) | `POST /v1/billing/paypal/orders {pack}` → `approve_url` | `POST /v1/billing/paypal/orders/<id>/capture` (idempotent) |
| Agent over MCP | `buy_credits {pack}` (protected: keyless callers get the OAuth 401) | `confirm_credit_purchase {order_id}` |
| Human on /account | "credit packs" buttons → `POST /v1/account/paypal/orders` (session) | PayPal returns the browser to `GET /v1/billing/paypal/return?token=<id>`, which captures and lands on `/account?paypal=success` |

`GET /v1/billing/paypal/packs` lists the packs keyless. The human always approves the payment on
PayPal's page; the agent never sees a card or a PayPal password.

## Storage

- D1 `paypal_orders` (migration 0017): one row per order, `created` → `completed`; the
  `UPDATE … WHERE status = 'created'` is the capture guard, so a replayed capture, a second
  return-URL hit and an `ORDER_ALREADY_CAPTURED` from PayPal all grant nothing more.
- D1 `credit_ledger` row `paypal:<pack>` per grant (audit, not the live quota — same as Stripe).
- KV `topup:<email>`: the live balance (no TTL), beside `usage:<email>:<yyyymm>`.
- KV `paypal:sandbox:token`: the client-credentials token for its lifetime minus a minute.

## Secrets

`PAYPAL_SANDBOX_CLIENT_ID` and `PAYPAL_SANDBOX_SECRET` from a sandbox app in the PayPal developer
dashboard (owner action 022, app `gankdat-hackathon`): `wrangler secret put` in production
(set 2026-10-11), `.dev.vars` locally. Unset, every `/v1/billing/paypal/*` route answers 503 and the
two MCP tools a tool error — the rest of the Worker is untouched.

## Trying it

```
GANKDAT_API_KEY=gk_… node scripts/paypal-walkthrough.mjs pack_1k
```
walks the five calls (usage → order → approve in a browser with a sandbox buyer → capture → usage →
one metered query) and prints which balance paid. Sandbox buyer accounts: developer dashboard →
Testing Tools → Sandbox Accounts.

## PayPal API shape relied on (Orders v2)

- `POST /v1/oauth2/token` with Basic `client_id:secret`, `grant_type=client_credentials`.
- `POST /v2/checkout/orders` `{intent:'CAPTURE', purchase_units:[{reference_id, custom_id, amount}], payment_source:{paypal:{experience_context:{return_url, cancel_url, user_action:'PAY_NOW'}}}}`
  → `links[rel='payer-action']` (legacy `application_context` gives `rel='approve'`; both accepted).
- `POST /v2/checkout/orders/{id}/capture` → `status:'COMPLETED'`, `purchase_units[0].payments.captures[0].id`;
  422 `ORDER_NOT_APPROVED` while the buyer has not approved → our 409 `payment_required`.
- PayPal appends `?token=<order id>&PayerID=…` to `return_url`.

Tests: `test/paypal.spec.ts` (stubs the sandbox host at the fetch layer).
