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

### 3b. The £0 twin: Payhip (spike 2026-10-24, `docs/exchange/spikes/payhip-digital-downloads-shelf.md`)

Free plan 5 % + Stripe UK ≈ 9 % of a £6.99 sale (≈ £6.34 kept), Payhip acts as reseller for UK/EU VAT by default, payouts
daily through the owner's Stripe, a buyer-facing marketplace that admits a store after US$10 of its own sales, sale webhooks
for the funnel. No counts are visible and payhip.com blocks automated reads (Cloudflare 403 to the runner), so demand there is
unmeasurable: the twin lists the same file at the same price (`payhip-twin-listing`, action 029 step 4) and is the fallback
shelf if the owner declines Etsy's set-up fee.

**A Kindle sibling, not a twin — Amazon KDP (new-ventures research 2026-10-26, spike `spike-kdp-sole-trader-tax-guide`).** The rendered amazon.co.uk Kindle search for "self assessment tax return 2026 27 sole trader" (relay `billed-shelves-2026-10-26`, 16 results) shows buyers counted on the shelf: a £3.99 Making Tax Digital playbook with 245 ratings since 26 Aug 2026, a £9.99 MTD guide (34), the £6.50 "How to prepare your UK Self Assessment Tax Return" sold as a new edition every April since 2017 (11–36 ratings an edition), and a direct rival to this workbook — "UK Sole Trader & Side Hustle Tax Workbook 2026/27: Self Assessment and Making Tax Digital", £4.99, published 21 Oct 2026, no ratings yet. KDP requires AI-generated text to be disclosed and allows it; 70 % of the ex-VAT price less delivery. The spike (same night) promoted it: KDP's content-quality rules bar companion books and books that redirect readers for the full content, so the shape is a complete standalone guide — built 2026-10-26, §5b.

**Not a twin — Creative Market (pre-research 2026-10-24, exchange `creative-market-templates-shelf`).** Shops open by application against a design portfolio of 10–20 works, the split is ≈ 50 % (official: 'varies per shop/per product'), and five search-index passes found no spreadsheet or Google Sheets listing on the shelf at all; parked, no relay read.

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

### 5b. The Kindle sibling — `UK Sole Trader Tax 2026/27` (built 2026-10-26, burn-down, `kdp-tax-guide-ebook`)

`ventures/tax-workbook/src/kindle/` — `npm run kindle` writes `kindle/UK-Sole-Trader-Tax-2026-27.epub` (EPUB 3, JSZip; 17 sections,
9,102 words, 267 kB; epubcheck 5.2.1 0 errors / 0 warnings) and `kindle/cover.jpg` (1600 × 2560, SVG → resvg → sharp). Every figure in
the prose and the tables is computed from `src/rates.ts` and `src/tax.ts` (Sam's year is the workbook's Example tab: £31,900 profit,
£5,025.80 due, £2,512.90 payments on account; Priya £58,000 profit into the higher rate; Leo's £3,400 side income on the trading
allowance; Amy's £6,200 first year and voluntary Class 2 at £189.80; 12,400 miles over the step-down), so the book and the workbook
cannot disagree. Outline: about · 1 basics (tax year, tax-year basis, registering by 5 Oct, cash basis) · 2 the 2026/27 numbers and
dates · 3 records · 4 income · 5 expenses (SA103S boxes 11–19, home working flat rates, equipment under cash basis / AIA box 23) ·
6 mileage · 7 trading allowance · 8 Income Tax (bands, taper, Scotland/Wales) · 9 NI (Class 4; Class 2 abolished 2024, voluntary
£3.65) · 10 paying (31 Jan, payments on account, SA303, budget plan) · 11 MTD (timetable £50k/£30k/£20k, quarters and the 7 Aug /
Nov / Feb / May deadlines, calendar election, final declaration, points) · 12 SA103S box by box · 13 a complete year · 14 deadlines,
penalties, checklist · sources · colophon. **KDP content-quality shape**: standalone, no redirect for "the full content", not a
companion — the workbook is named once, in the colophon, as a separate product (`kindle.test.ts` enforces exactly one mention, back
matter only, no URLs). **Disclosure**: the text is AI-generated under KDP's definition and is declared so on the KDP form; the
copyright page and colophon say the same. Listing pack (title, subtitle, description ≤ 4,000 chars, 7 keywords, 2 categories,
£4.99 at 70 % ≈ £2.70 net, a 7-day Countdown Deal at £2.99, KDP Select) in `KINDLE.md`, mirrored by `src/kindle/kdp.ts` with tests
on the form limits. New dependencies: `jszip` (already in the tree through ExcelJS) and `sharp` (JPEG encoding). The owner's KDP
account, tax interview (W-8BEN) and bank, and the upload, are action 029 step 5 (~15 min, £0); `kdp-listing-live` records the ASIN.
**Third shelf (spike 2026-10-26, `docs/exchange/spikes/google-play-books-tax-guide-shelf.md`)**: Google Play Books takes UK sellers in GBP,
pays 70 % of list with no fees and has no AI rule (seven priced UK tax guides on the GB shelf, £2.29–19.99); `google-play-listing` is
queued but blocked on the KDP Select 90-day exclusivity the Countdown Deal needs — `kdp-listing-live` dates it live + 90 d. Kobo Writing
Life and Draft2Digital were declined: both reject AI-written nonfiction, and D2D charges US$20 + US$12/yr plus ~10 % of retail.

## 6. Numbers that decide

- **Proof**: a first sale within 30 days of listing; ≥ 10 sales in the first 60 days (the rival's rate is ~14 a month).
- **Kill**: 0 sales 60 days after listing with ≥ 5 listing views a day in Shop Manager → delist, keep the file for the
  Payhip twin or our own Stripe link (£0 shelves, weaker reach).
- **Kindle reading** (2026-10-26): KDP Reports → Dashboard, pasted by the owner as a monthly `kindle: N sold` note; the same proof and kill clock as Etsy, counted from the day the book goes live. No mail parsing, no reads of amazon.co.uk.
- **Reading**: Etsy's seller emails — the hourly inbox triage writes each order mail as a `Sale` row below and each
  deposit mail as a `revenue` row in `docs/LEDGER.md` (`docs/routines/inbox-triage.md` ETSY SALES, 2026-10-25) — and the
  owner's Shop Manager stats, sent as a usage-style note; the Open API v3 only later and only for this shop's own stats with the owner's OAuth grant.
  No metrics job reads the shelf.

## 7. Metrics

Row kinds (2026-10-25, `etsy-sale-mail-reading`): `Sale` and `Refund` rows are written by the inbox triage from Etsy's
order and refund mail — the Sales column is the running total after the row, the Notes cell the listing, item price,
quantity and the mail's time, never the buyer's name, address, email, username, order number or message (Blind Mode).
The weekly report reads them (net sales for the week, running total); the pounds live in `docs/LEDGER.md` `revenue`
rows written from Etsy's deposit mail. The day-60 kill clock (§6) starts at the `Listed` row.

| Date | Event | Users | Rating | Sales | Notes |
| --- | --- | --- | --- | --- | --- |
| 2026-10-24 | Opened | — | — | 0 | venture opened by exchange 2026-W43; workbook queued; shop opening waits on the owner's one batched request |
| 2026-10-24 | Built | — | — | 0 | workbook v1.0 built and recalculated (2,122 formulas, 0 errors, Example = hand-worked £5,025.80); LISTING.md + 5 images; action 029 raised; status `validated` |
| 2026-10-25 | Reading wired | — | — | 0 | inbox triage writes `Sale`/`Refund` rows from Etsy order mail and deposits to the ledger; the weekly report counts them; shop still waits on action 029 |
| 2026-10-26 | Kindle built | — | — | 0 | `UK Sole Trader Tax 2026/27` EPUB (9,102 words, epubcheck clean) and cover built; KINDLE.md listing pack; action 029 step 5 raised (KDP account + upload, ~15 min, £0) |

## 8. Owner steps (batched, raised by the build that finishes the workbook, never before)

One sitting of ~30 minutes: open the Etsy shop (Persona ID + selfie, a personal bank account in the owner's name, a
card for fees), pay the set-up fee (≤ £25, a `docs/LEDGER.md` `cost` row the day it is charged), upload the file and
five listing images with the listing copy from `LISTING.md`, and set the payout schedule to weekly. Later: forward or
answer buyer messages the triage drafts; each April, upload the refreshed file. **Added 2026-10-26 (step 5, ~15 min, £0):** open a KDP
account, complete the tax interview (W-8BEN, UK resident) and bank details, upload the EPUB and cover with the copy in `KINDLE.md`,
tick the AI-content disclosure, set £4.99 at 70 %, enrol in Select and start the 7-day £2.99 Countdown Deal once live.

## 9. Research log

- **2026-10-26 01:33 (burn-down, queue starved):** no new build item; `research_after: 2026-11-03`. Three products of this line are
  built and none is live — the Etsy workbook (`etsy-listing-live`), its Payhip twin (`payhip-twin-listing`) and the Kindle guide
  (`kdp-listing-live`) all wait on the owner's one sitting (action 029, raised 2026-10-24, step 5 added tonight) — so every lever is
  owner-blocked, the metrics rows carry 0 sales because nothing is on a shelf yet, and STRATEGY §6 (distribution before new features)
  says a fourth unlisted product would not change that. The next dated signal is the reseller workbook's `not_before` (2026-11-03) and
  the owner's "029 done" note, whichever comes first. Candidates read tonight and **not** queued until the first listing is live (the
  next research pass scores them against the first shelf's reading): (a) a second Kindle title shaped like the shelf's best seller —
  "Making Tax Digital for Sole Traders: quarter by quarter" (the £3.99 playbook with 245 ratings in two months, spike §2), ~0.5 day
  from chapter 11's material, dated after the first book's day-30 read; (b) a KDP paperback of the guide (£0 to list, print cost
  deducted from the royalty), only if the Kindle edition sells; (c) a UK landlord / SA105 property workbook — the same recurring job
  on the same Etsy shop (the £1,000 property allowance, finance-cost credit, MTD from the same £50k/£30k/£20k thresholds on
  property income), ~0.5 day, listed as a third item in the shop once the first two sell; (d) a Scottish-bands variant of the workbook
  (one Setup table swap), only on a buyer message asking for it. Nothing here needs a relay read; nothing was fetched.
- **2026-10-26 17:50 (burn-down, exchange spike):** Google Play Books read through the relay (Supported-countries table, Revenue split FAQ,
  content policies, Partner Centre overview, two rendered GB searches) — UK ticked for seller sign-ups and GBP payments, 70 % of list, no
  AI rule, seven priced 2026 UK tax guides at £2.29–19.99. Promoted as `google-play-listing` (6), blocked on the KDP Select term the Kindle
  listing takes for its Countdown Deal; `kdp-listing-live` dates it live + 90 d. Kobo Writing Life (kobo.com behind a Cloudflare wall;
  rejects AI-written books) and Draft2Digital (no non-credentialled AI nonfiction; US$20 + US$12/yr, ~10 % of retail) declined.
