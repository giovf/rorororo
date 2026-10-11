# Agent walkthrough — Claude buys and spends gankdat credits with PayPal (sandbox)

The flow as an MCP client sees it. Tool names and shapes are gankdat v0.24.0 (`src/mcp/server.ts`);
the REST twins are in `ventures/gankdat/docs/PAYPAL-SETUP.md`, and
`ventures/gankdat/scripts/paypal-walkthrough.mjs` runs the same five steps from a terminal.

## Setting

A user has connected gankdat to Claude (OAuth `connect_account`) on the free plan and asks for a
counterparty check across several registers. Part-way through, the monthly allowance runs out.

## Transcript

**User:** Check Acme Widgets Ltd — sanctions, insolvency notices and recent filings.

**Claude** → `query_uk_sanctions {q: "Acme Widgets"}` … → `query_uk_insolvency {q: "Acme Widgets"}` …

**Claude** → `query_uk_company_profiles {company: "Acme Widgets Ltd"}`

```
tool error: Monthly credit quota exhausted (250) and no top-up credits left; buy a credit pack
(POST https://gankdat.com/v1/billing/paypal/orders or the buy_credits tool) or upgrade via
POST https://gankdat.com/v1/billing/checkout — see https://gankdat.com/docs#quota_exceeded
```

**Claude:** Your gankdat allowance for this month is used up. I can buy a credit pack with PayPal —
1,000 credits is US$8. Shall I?

**User:** Yes.

**Claude** → `buy_credits {pack: "pack_1k"}`

```json
{
  "ok": true,
  "data": {
    "order_id": "5O190127TN364715T",
    "approve_url": "https://www.sandbox.paypal.com/checkoutnow?token=5O190127TN364715T",
    "pack": "pack_1k",
    "credits": 1000,
    "amount_usd": "8.00",
    "next": "Tell the user: \"Approve US$8.00 for 1,000 gankdat credits at https://www.sandbox.paypal.com/checkoutnow?token=5O190127TN364715T.\" When they say it is approved, call confirm_credit_purchase with order_id 5O190127TN364715T."
  }
}
```

**Claude:** Please approve US$8.00 for 1,000 credits here: https://www.sandbox.paypal.com/checkoutnow?token=5O190127TN364715T — tell me when it's done.

*(The user approves on PayPal's page. The agent never sees a card or a PayPal login.)*

**User:** Done.

**Claude** → `confirm_credit_purchase {order_id: "5O190127TN364715T"}`

```json
{
  "ok": true,
  "data": {
    "order_id": "5O190127TN364715T",
    "status": "completed",
    "credits_added": 1000,
    "topup": 1000,
    "message": "Added 1,000 credits; 1,000 top-up credits now wait behind the monthly allowance."
  }
}
```

**Claude** → `query_uk_company_profiles {company: "Acme Widgets Ltd"}`

```json
{ "ok": true, "data": [ { "company_number": "01234567", "...": "..." } ],
  "meta": { "source": "uk-company-profiles", "credits_remaining": 999, "credits_source": "topup" } }
```

**Claude:** Here is the picture for Acme Widgets Ltd … (continues the task). You have 999 top-up
credits left; they are used after your monthly allowance and never expire.

## What happened underneath

| Step | Call | Effect |
| --- | --- | --- |
| 1 | `buy_credits` | `POST api-m.sandbox.paypal.com/v2/checkout/orders` (intent CAPTURE, US$8.00, custom_id = account) → D1 `paypal_orders` row `created` |
| 2 | human approval | on PayPal's page; PayPal would also redirect a browser to `/v1/billing/paypal/return?token=<order>` which captures the same way |
| 3 | `confirm_credit_purchase` | `POST …/orders/<id>/capture` → row `created → completed` (the idempotency guard) → `credit_ledger` `paypal:pack_1k` +1000 → KV `topup:<email>` = 1000 |
| 4 | any data tool | `metering/budget.ts`: plan allowance exhausted → pays from the top-up; `credits_source: "topup"` |

A replayed `confirm_credit_purchase` answers `already_completed` with `credits_added: 0`. Another
account's order id is "No such order on this account". A keyless `buy_credits` is answered with the
OAuth 401 that makes Claude show its Connect card.
