# Portfolio ledger

Source of truth for every pound in and out. `npm run ledger` validates this file and
fails the build if `cost + planned` exceeds the **£100** capital cap **plus revenue received**:
the owner's net outlay never passes £100, and any expense beyond that comes out of profit
(owner, 2026-10-10). The check also says how many months of headroom the recurring costs leave
and warns under three.

- `cost` — money already spent (record the day it happens)
- `planned` — committed but not yet spent (owner-action requests go here first)
- `contingent` — spent only when a stated condition is met (shown, outside the cap until it
  becomes `planned`)
- `revenue` — money received, **net** of platform fees, in GBP at the payout rate

## Entries

| Date       | Venture   | Kind    | GBP  | Note                                              |
| ---------- | --------- | ------- | ---- | ------------------------------------------------- |
| 2026-09-10 | gankdat   | cost    | 3.70 | Cloudflare Workers Paid — US$5/month recurring since 2026-07-10 (owner-paid before adoption; counted from Sep 2026); ≈£3.70 at ~1.35 |
| 2026-09-27 | gankdat   | contingent | 47.00 | ICO data protection fee, tier 1, direct debit (legal requirement; action 012) — owner deferred it until the first real customer (2026-09-20); under the 2026-10-10 rule it is paid from that revenue, so it moves to `planned` when the first paid account lands |
| 2027-07-08 | gankdat   | planned | 8.00 | gankdat.com renewal — Cloudflare Registrar, auto-renew on, expires 2027-07-08; ≈US$10.50 at cost |
| 2026-10-10 | gankdat   | cost    | 37.00 | Cloudflare invoice #IN-83063702, US$49.00 (≈ £37): Workers Paid US$5 + D1 row-write overage ≈ US$44 — 93.9M rows written 2026-09-10→10-10 against the 50M allowance, caused by nightly full reloads of nine D1 registers (5–6M rows/day 09-20→10-05). Fixed 2026-10-04 (delta refresh): 0.02–0.14M rows/day since 10-06, so next period stays inside the allowance. The card charge failed on 10 Oct; paid by the owner 2026-10-10 |
| 2026-09-17 | portfolio | cost    | 3.70 | Chrome Web Store developer registration — US$5.00 incl. VAT on Mastercard 17 Sep (order CWS.5162-7768-2586-70036); £3.70 at ~1.35, exact GBP per card statement |

## Recurring

Standing monthly costs the owner has agreed to keep paying; the check divides the headroom by
their sum. Add a row the day a subscription starts, remove it the day it stops.

| Venture | GBP/month | Note                                                                 |
| ------- | --------- | -------------------------------------------------------------------- |
| gankdat | 3.70      | Cloudflare Workers Paid, US$5/month on the 10th; owner-paid, confirmed 2026-10-10. Metered overage on top of it is a bug, not a cost: the metrics job files a queue item the day one shows |

## Conventions

- Venture is the slug from `ventures/<slug>/venture.json`, or `portfolio` for shared costs.
- Move a `planned` row to `cost` (same note) once the money has left the account; a `contingent`
  row to `planned` the day its condition is met.
- The monthly Cloudflare invoice (10th) is one `cost` row per invoice, the day it is paid, at the
  card's GBP amount; the Recurring table carries the standing US$5 so it is not double-counted
  as `planned`.
- Refunds: a negative-free ledger — record a refund as a `cost` row with note `refund: …`.
- Figma Community sales (Variables Toolkit, live since 2026-09-21): Figma keeps **15%** and pays
  out the rest, so a $12 sale nets ≈$10.20. Record the **payout** amount in GBP as a `revenue`
  row on the day it lands, not the list price.
