# Portfolio ledger

Source of truth for every pound in and out. `npm run ledger` validates this file and
fails the build if `cost + planned` exceeds the **£100** capital cap.

- `cost` — money already spent (record the day it happens)
- `planned` — committed but not yet spent (owner-action requests go here first)
- `revenue` — money received, **net** of platform fees, in GBP at the payout rate

## Entries

| Date       | Venture   | Kind    | GBP  | Note                                              |
| ---------- | --------- | ------- | ---- | ------------------------------------------------- |
| 2026-09-10 | gankdat   | cost    | 3.70 | Cloudflare Workers Paid — US$5/month recurring since 2026-07-10 (owner-paid before adoption; counted from Sep 2026); ≈£3.70 at ~1.35 |
| 2026-09-17 | portfolio | cost    | 3.70 | Chrome Web Store developer registration — US$5.00 incl. VAT on Mastercard 17 Sep (order CWS.5162-7768-2586-70036); £3.70 at ~1.35, exact GBP per card statement |

## Conventions

- Venture is the slug from `ventures/<slug>/venture.json`, or `portfolio` for shared costs.
- Move a `planned` row to `cost` (same note) once the money has left the account.
- Refunds: a negative-free ledger — record a refund as a `cost` row with note `refund: …`.
