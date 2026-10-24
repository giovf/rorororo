# UK Sole Trader Tax Workbook — research

Opened by the venture exchange 2026-W43 (run 2026-10-24 by the 17:00 build slot, the Wednesday slot having
missed). Evidence from `docs/exchange/spikes/etsy-digital-downloads-uk-tax-templates.md` (burn-down 2026-10-23,
20 searches over the search index's snapshots of etsy.com, help.etsy.com and gov.uk pages; **no fetch of etsy.com
from any sandbox or runner** — Etsy's API Terms and Terms of Use forbid automated reads, so this shelf is never
scanned, relayed or metered by this operation). Status `idea` until the first workbook is built and the owner has
opened the shop; the build routine moves it to `validated` on the gate table below, `launched` on the first listing.

## 1. The job

A UK sole trader (non-VAT, no partnership, English/Welsh bands) keeps income and expenses through the tax year, maps
them to the SA103S boxes at year end, estimates income tax and Class 4 NI (with payments on account), logs mileage at
HMRC rates, checks the £1,000 Trading Allowance against actual expenses, and from April 2026 (MTD for Income Tax at
£50,000+ turnover, £30,000+ from April 2027) wants quarterly totals. The job recurs every tax year, which is why the
niche's listings are dated by year and why a fresh file sells each spring.

## 2. Evidence of paying demand (search-index snapshots, 2026-10-23)

| Listing (shop) | Price | Sales / reviews | Age |
| --- | --- | --- | --- |
| UK Self-employed Bookkeeping Spreadsheet: HMRC Sole Trader Accounts Tracker (one-listing UK shop) | £7.19 | **172 sales, 18 reviews at 5.0** | 1 year |
| Etsy Automated Bookkeeping for UK VAT Registered Sellers | not in the index | **≈ 1,500 reviews**, all 5★ in the snippet | since May 2025 |
| UK Self Employed Tax Spreadsheet 2026-27 SA103S, "accountant-verified" | **£69** | 0 sales | 4 months |
| UK Freelancer / Self-employed Tax Spreadsheet 2026/27 | US$5.19–6.92 | 2 reviews at 5.0 | — |
| Self Assessment Spreadsheet UK 2026-27 with HMRC mileage log | £3.00 | 5 reviews | — |
| Reseller Spreadsheet UK (inventory, P&L, Trading Allowance check) | £3.99 | 35 reviews at 5.0 | 293 days |
| Payhip rivals: Sole Trader Bookkeeping Spreadsheet; 11-tab 2026/27 workbook; SA103-mapped tracker | £6.95 / £9.99 / £6.99 | no counts | — |

Reading: one shop sells ~14 copies a month at £7 from a single listing; reviews run well below sales on Etsy, so the
VAT-seller sheet is thousands of sales; the £69 top of the band sold nothing. Each query returns ~30 UK tax-sheet
listings, most from single-listing shops with 0–7 reviews — crowded but shallow. **Gap**: no listing under £10 that
combines SA103 mapping, MTD quarterly totals and a Trading Allowance check with visible sales.

## 3. The shelf (Etsy's own pages)

- **Who may sell**: 18+, the UK on the Etsy Payments list; identity by Persona (government ID + selfie, controller Etsy
  Ireland UC); a bank account in the seller's legal name (a sole trader's personal account qualifies) verified by a
  test deposit; a card for fees; business-verification documents only for accounts set up as a business.
- **Set-up fee**: one-time, non-refundable, charged before the shop opens — US$15 at its 2024 introduction, "varies by
  location", waived in some promotional periods; 2026 guides put it at US$15–29. **This is over ARCHITECTURE's £10
  launch ceiling** (≈ £11–22 plus VAT), so opening the shop is the owner's decision, asked once, with the amount from
  the "Total due now" step.
- **What Etsy takes** on a £7.19 download: 6.5 % transaction + UK processing 4 % + £0.20 + 0.48 % regulatory fee +
  US$0.20 listing renewal after each sale + 20 % VAT on those fees ≈ **£1.38 (19 %); the seller keeps ≈ £5.80**.
  Etsy collects and remits the buyer's VAT on automatically delivered digital items. Offsite Ads 15 % only on sales
  Etsy's ads bring (optional under US$10,000 a year).
- **Payout**: weekly by Bacs (no floor); a new seller's funds eligible 14 days after the sale; the new-shop reserve
  applies to physical items only.
- **What may be sold**: Creativity Standards admit "digital downloads of sellers' original designs"; an instant-download
  listing carries up to five files of 20 MB.
- **Platform reporting**: Etsy reports a UK seller to HMRC past 30 sales or €2,000 in a calendar year (data share,
  not a tax bill); the ledger records every payout anyway.
- **Refunds**: the seller's own policy per listing — ours states it plainly (digital file, delivered instantly; a
  replacement file or a refund within 14 days if it does not open, per UK digital-content rules).
- **Support**: buyer messages arrive by email; the inbox triage drafts replies, the owner sends them (~15 min a month
  at the rival's volume). A `docs/ops/SELF-CAUSED.md` row on launch covers Etsy's own mail.

## 4. Validation gate (ARCHITECTURE)

| Gate | Reading |
| --- | --- |
| Buyers with money | 172 sales at £7 from a one-listing shop in a year; ~1.5k reviews on the VAT sibling |
| Recurring job | every tax year; MTD quarters from April 2026 add a reason to buy a fresh sheet |
| Paid competitor with a documented gap | £3–14 sheets with 0–35 reviews; none under £10 combines SA103 + MTD quarters + Trading Allowance check with visible sales |
| ≤ 1 week to build | half a day with the xlsx tooling (formulas, validation, a filled example); a day each April to refresh |
| No policy / ToS risk | a seller-designed file is allowed; Etsy bills and remits VAT; **no automated reads of etsy.com, ever** |
| Launch cost | £0 to build; the shop's set-up fee (≤ £25) is the owner's call — the one line item over the £10 ceiling |

## 5. Product

**Built 2026-10-24 (v1.0)** by `ventures/tax-workbook/src` — `npm run build` writes `release/UK-Sole-Trader-Tax-Workbook-2026-27.xlsx`,
`npm run recalc` proves it in LibreOffice (0 formula errors, the Example tab equal to `src/tax.ts`), `npm run images` renders the
five listing PNGs from SVG. Rates: gov.uk 2026/27 (Class 4 LPL £12,570 / UPL £50,270 at 6 % / 2 %; Class 2 SPT £7,105,
voluntary £3.65 a week; personal allowance £12,570, basic band £37,700, additional rate from £125,140; mileage 45p/25p/24p/20p;
Trading Allowance £1,000; MTD £50,000 from April 2026). SA103S box numbers follow the 2025 form (9, 10, 10.1, 11–19, 20–23, 31).
Listing copy in `LISTING.md`; the owner's steps in `docs/for-owner/actions/029-etsy-shop-and-zoho.md`.

`UK Sole Trader Tax Workbook 2026/27` — one `.xlsx` (Google Sheets-compatible formulas; the owner uploads a copy to
Drive for the Sheets link): Setup (tax year, bands, NI thresholds, mileage rates as named cells) · Income log · Expense
log with SA103S category drop-downs · Mileage log · Quarterly (MTD) totals · SA103 year-end pack · Tax and Class 4 NI
estimate with payments on account · Trading Allowance check · a filled example tab · a README tab. The listing says
what the buyer gains and what it is not: record-keeping, not MTD-recognised filing software; English/Welsh bands;
excludes partnerships and VAT-registered traders. Price £6.99 launch with a stated end date (a true launch price, per
the DMCC fake-urgency rule), then £8.99. No invented scarcity.

## 6. Numbers that decide

- **Proof**: a first sale within 30 days of listing; ≥ 10 sales in the first 60 days (the rival's rate is ~14 a month).
- **Kill**: 0 sales 60 days after listing with ≥ 5 listing views a day in Shop Manager → delist, keep the file for the
  Payhip twin or our own Stripe link (£0 shelves, weaker reach).
- **Reading**: Etsy's seller emails (sale notifications through inbox triage) and the owner's Shop Manager stats, sent
  as a usage-style note; the Open API v3 only later and only for this shop's own stats with the owner's OAuth grant.
  No metrics job reads the shelf.

## 7. Metrics

| Date | Event | Users | Rating | Sales | Notes |
| --- | --- | --- | --- | --- | --- |
| 2026-10-24 | Opened | — | — | 0 | venture opened by exchange 2026-W43; workbook queued; shop opening waits on the owner's one batched request |
| 2026-10-24 | Built | — | — | 0 | workbook v1.0 built and recalculated (2,122 formulas, 0 errors, Example = hand-worked £5,025.80); LISTING.md + 5 images; action 029 raised; status `validated` |

## 8. Owner steps (batched, raised by the build that finishes the workbook, never before)

One sitting of ~30 minutes: open the Etsy shop (Persona ID + selfie, a personal bank account in the owner's name, a
card for fees), pay the set-up fee (≤ £25, a `docs/LEDGER.md` `cost` row the day it is charged), upload the file and
five listing images with the listing copy from `LISTING.md`, and set the payout schedule to weekly. Later: forward or
answer buyer messages the triage drafts; each April, upload the refreshed file.
