# Portfolio ledger

Source of truth for every pound in and out. `npm run ledger` validates this file and
fails the build if `cost + planned` exceeds the **£100** capital cap.

- `cost` — money already spent (record the day it happens)
- `planned` — committed but not yet spent (owner-action requests go here first)
- `revenue` — money received, **net** of platform fees, in GBP at the payout rate

## Entries

| Date       | Venture   | Kind    | GBP  | Note                                              |
| ---------- | --------- | ------- | ---- | ------------------------------------------------- |
| 2026-09-17 | portfolio | planned | 3.70 | Chrome Web Store developer registration ($5 once) |

## Conventions

- Venture is the slug from `ventures/<slug>/venture.json`, or `portfolio` for shared costs.
- Move a `planned` row to `cost` (same note) once the money has left the account.
- Refunds: a negative-free ledger — record a refund as a `cost` row with note `refund: …`.
