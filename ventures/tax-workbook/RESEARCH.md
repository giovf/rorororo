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
- **The monthly ask** (2026-11-01, `shelf-stats-owner-note`): both readings only the owner can see arrive as one Telegram note, `etsy views 4/day kindle 2 sold`, asked by the Monday report's digest line in the week of each month's last Monday (first 2026-11-30, then 2026-12-28 — the day-60 read's own date; `npm run handoffs` prints the `shelf-ask:` sentence, `scripts/handoffs.ts`). The owner-notes poll (`scripts/owner-notes.mjs` → `scripts/shelf-note.ts`) writes each figure as a §7 row — `Etsy views` (views a day in Shop Manager) and `Kindle sold` (copies sold in KDP Reports, all time) — in the run the note lands, so `etsy-day-60-read` applies the kill on a number and the Kindle proof clock has its count. A note naming only one reading writes one row; the Sales cell carries the running total.
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
| 2026-10-29 | Listed | — | — | 0 | Etsy listing live (shop taxelicious.etsy.com, listing 4605571079, £6.99 launch price to 30 Nov); set-up fee £14 + £0.20 listing fee; the day-60 clock (§6) runs to 2026-12-28. Same sitting: Payhip store open (payhip.com/gankdat, twin listing next), Kindle guide submitted to KDP and in review |
| 2026-10-29 | Payhip twin built | — | — | 0 | PAYHIP.md copy, product page apps.gankdat.com/tax-workbook.html, webhook receiver /hooks/payhip live on the landing Worker (counts only, no buyer data), Daily numbers reads `payhip 30d:`; the upload and the webhook switch are action 033 |
| 2026-10-29 | Own checkout built | — | — | 0 | the Buy block on tax-workbook.html (hidden until the link exists), thanks-tax-workbook.html, the licence Worker's download branch (signed 30-day link, file served from private KV, refund revokes it, re-send mints a fresh link; 7 tests) and its CI deploy; `Listed` for this shelf is written by `own-checkout-live` when action 034 (one Payment Link, ~3 min) is done |
| 2026-10-31 | Kindle live | — | — | 0 | `UK Sole Trader Tax 2026/27` live in the Kindle Store (KDP mail 14:32 UTC; owner action 029 step 5), enrolled in KDP Select to 2027-01-29; £4.99 at 70 %; page link pending the owner's 2026-11-30 note; the §6 Kindle clock: first sale by 2026-11-30, ten by 2026-12-30 (`kindle-day-60-read`). Recorded 2026-11-03 by `kdp-listing-live` |
| 2026-11-02 | Payhip live | — | — | 0 | twin listing live at https://payhip.com/b/4stMN (£6.99, owner action 033 step 1); product page and index card link it; same day-60 read as Etsy (2026-12-28). sale webhook set and `PAYHIP_API_KEY` saved the same day; the landing deploy stores it on the Worker |
| 2026-11-02 | Listed (own checkout) | — | — | 0 | Buy button live on apps.gankdat.com/tax-workbook.html (Stripe Payment Link, £6.99, owner action 034); £0 end-to-end test (API session with the 100 %-off coupon) delivered the download mail and the file; same day-60 read as Etsy (2026-12-28) |
| 2026-11-03 | Reseller built | — | — | 0 | second listing for the same shop: UK Reseller Profit & Tax Workbook 2026/27 (11 tabs, 10,159 formulas, 0 errors, Example = £945.00); LISTING.md second-listing pack (£5.99) + 4 images; owner action 037 (~10 min, £0.16); `reseller-listing-live` records the listing when it is live |
| 2026-11-03 | Paperback built | — | — | 0 | KDP paperback of the Kindle guide as a second format: 6 × 9 in interior PDF (49 pages, Chromium print, fonts embedded) and the wrap cover sized from the count (12.3603 × 9.25 in, spine 0.1103 in); £9.99 nets ≈ £4.06; the owner's ~10-min add-a-format step is action 029 follow-up 6; `kdp-paperback-live` records it |

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
- **2026-10-29 09:20 (exchange 2026-W44, run by the build slot for the missed Wednesday):** `own-checkout-listing` (5 × 2 = 10) queued — the
  workbook sold from a product page on apps.gankdat.com through the Stripe Managed Payments checkout ReadFocus already uses, the licence
  Worker mailing a signed download link; the W43 exchange's named fallback, taken now because every listing of the line has waited on
  action 029 since 10-24 with no reply and this is the one shelf that needs no new account, identity check or fee. Its only owner step
  (one Payment Link, ~3 min, live-mode Stripe objects being ask-first) is raised by the build as action 029 step 6. The Kindle EPUB is
  not sold there: KDP Select's exclusivity would be breached. Nothing fetched; `research_after` 2026-11-03 unchanged.
- **2026-10-29 17:52 (burn-down, `payhip-twin-listing`):** Payhip's webhooks article read through the relay (`help.payhip.com/article/115-webhooks`, updated 2026-09-29): four events (`paid`, `refunded`, two subscription ones), a JSON POST with prices in pence and a `signature` equal to sha256 of the store's API key, a retry once an hour for three hours unless the endpoint answers 200; the marketplace article unchanged (US$10 of own sales, then review). Built: the receiver at `apps.gankdat.com/hooks/payhip` keeping per-day counts and pence in KV (never the buyer's email or IP) with a keyless 30-day summary the gankdat Daily numbers row reads as `payhip 30d:`; the store copy `PAYHIP.md`; the product page. The owner's part is action 033 (~13 min). Nothing else fetched; `research_after` unchanged.
- **2026-10-29 18:25 (burn-down, `own-checkout-listing`):** built the own-checkout shelf without a new account: the licence Worker (which already takes Stripe's `checkout.session.completed` for ReadFocus) gained a download-product branch — `venture=tax-workbook` sessions still store a revocable order record, but the buyer's mail carries a signed, time-limited download link (HMAC over `{venture, order id, expiry}` with a key derived from the Worker's signing secret, 30 days) that `GET /v1/downloads/<token>` answers with the .xlsx read from the LICENSES namespace (`asset:tax-workbook`, written by the deploy from `release/`; never a public URL), 403 after expiry or a refund's revocation, 503 until the file is loaded; `/admin/resend` mints a fresh link for support. The Worker now deploys from CI (`docs/ci/license-worker.yml`: build, KV put of the file, deploy, health + 403 smoke check) — it was hand-deployed since 2026-09-18. The product page carries the Buy block hidden behind a placeholder and a test that ties `hidden` to the placeholder; the owner's one step is action 034 (Stripe Payment Link with metadata `venture=tax-workbook`, redirect to thanks-tax-workbook.html). Nothing fetched; `research_after` unchanged.
- **2026-10-31 09:25 (build, new-ventures research):** spoken editions of the Kindle guide read from the shelves' own pages
  (relay `new-ventures-research-2026-10-31`). **Google Play Books** is the route: the Partner Center country table marks the UK ✔
  for auto-narrated audiobook creation, the programme page needs an English EPUB live on Play, charges nothing "for a limited
  time", lets the publisher download the files to sell elsewhere as long as the title stays on Play, and pays a 52 % revenue
  share (the 70 % split is for ebooks under the 2019 TOS, not audiobooks). **KDP's "Audiobooks with virtual voice"** is parked:
  an invite-only beta "only available for books to be distributed in the US marketplace at this time", list price US$3.99–14.99,
  a 40 % royalty, sold on Amazon.com and Audible only — a UK buyer never sees it — and its terms bar selling the book in audio
  form anywhere during the ebook's 90-day KDP Select exclusivity, which also dates the Google audiobook behind
  `google-play-listing`. Spike queued in `new-ventures`: `spike-google-play-auto-narrated-audiobook` (5) — en-GB voices, the GB
  audiobook shelf's rival UK tax titles (the 10-31 store-search URL answered 404), what the tables sound like read aloud, net per
  copy at 52 %. `research_after` 2026-11-03 unchanged.
- **2026-10-31 17:25 (build, spike `google-play-auto-narrated-audiobook`):** read through the relay (`play-audiobook-spike-2026-10-31`, `-b`):
  the narrator library has four British English voices (Alistair, Anya, Archie, Ava); the Learning Center's conditions are audio
  rights, an English EPUB and an ebook the account offers on Play; no programme fee, 52 % of list, no stated price floor. The GB
  shelf sells two AI-narrated UK tax audiobooks made the same way in the last six weeks — Fastchapters' *Self-Assessment Deadline
  and No Records Anywhere* (£4.49, 4 h 8 min, ebook £3.79) and Wish Publications' *Making Tax Digital for Small Landlords* (£5.49,
  1 h 39 min, ebook £7.99), both American voices, ratings shown without counts; the 10-26 HMRC Tax Guide rival has no audiobook.
  Counted from the content module: 9,102 words ≈ 55–65 min; 11 tables / 88 rows, 222 pound amounts, 50 "2026/27", 31 box
  references, 7 gov.uk URLs — a spoken edition (≈ 0.3 day) is needed, not a straight narration. Net at 52 % of the VAT-net list:
  £2.20–2.60 a copy at £4.99–5.99, £3.03 at £6.99. **Parked, dated** (`docs/exchange/spikes/google-play-auto-narrated-audiobook.md`):
  the Kindle enrolled in KDP Select today, the Play ebook cannot go up before 2027-01-29, and the Play ebook's day-30 sales decide
  whether a £5.99 spoken edition follows. `research_after` 2026-11-03 unchanged.
- 2026-11-01 (build, `shelf-stats-owner-note`): the §6 kill rule and the Kindle proof had no source for listing views a day or copies sold (Etsy forbids automated reads, the sandbox never opens KDP, sale mail counts sales). Built the monthly ask — `npm run handoffs` prints a `shelf-ask:` sentence in the week of each month's last Monday from 2026-11-30, deduped on the words `shelf note` in RUNS.md for 21 days, the Monday report appends it to its digest line like the usage ask — and the reader: `scripts/shelf-note.ts` (12 tests across its own and the handoffs suite) parses `etsy views N/day` / `kindle N sold` (also `kindle: N sold`, `N views a day`) from each new owner note and appends §7 rows; the notes poll calls it and both workflows that commit the notes (`notify owner`, `owner notes`) now add RESEARCH.md to the commit (full files dropped in `docs/ci/`, installed by CI; first run checked at the next slot). First ask 2026-11-30, second 2026-12-28.
- **2026-11-02 00:20 (burn-down, new-ventures research):** two shelves the open Etsy shop and the Kindle guide's rates can feed,
  read by WebSearch restricted to each shelf's own host (neither resolves from the sandbox; the spikes read them through the
  relay, hosts added). **Etsy for the Claude Code kit** (exchange idea `ai-setup-course`, Leanpub promoted 10-31): Etsy's index
  holds category pages 'claude prompts', 'claude prompts packs', 'ai agent template' and 'claude guide' and listings such as
  'Agentic Coding with Claude Code PDF', 'Claude Code Advanced Guide' (10 chapters, CLAUDE.md examples), a 72-commands ebook,
  a US$24.99 agent bundle and prompt PDFs at US$1.51–4.99 — buyers already pay here for Claude Code guides, and the shop
  needs no new account or identity step. Etsy's Creativity Standards: 'designed by a seller' is 'original content created by
  the seller, such as a … text document', AI tools are allowed with the seller's own creative input and a disclosure in the
  listing, and prompt packs / bundles of others' work are named as excluded — so the kit is sold as the guide plus our own
  files. Queued `new-ventures/spike-etsy-claude-code-kit-listing` (6). **Poe creator monetisation** for a 'UK Sole Trader Tax
  2026/27' prompt bot built from the Kindle guide's rates: Poe's FAQ marks the United Kingdom 'Yes' for price per message
  (added with 16 other countries on 2023-12-20), earnings are set per message from the bot and the launch-era referral paid
  up to US$20 a new subscriber; unknown whether any tax bot there has users and whether the payout is a Stripe identity check
  on a new account. Queued `new-ventures/spike-poe-creator-bot-uk-tax` (5). **Udemy** read and parked in the exchange
  (`udemy-claude-code-course`): 37 % on organic sales, 30 minutes of video and a Persona identity check before the first
  course. This queue is unchanged (`research_after` 2026-11-03).
- **2026-11-02 00:40 (burn-down, new-ventures spike `etsy-claude-code-kit-listing` → decline):** help.etsy.com "What Can I
  Sell on Etsy?", read in full through the relay (www.etsy.com answers 403 raw and rendered), now lists among the content
  not allowed "Bot-generated content", "AI-generated functional instructions, such as craft patterns, recipes, and
  instructions" and "AI prompt bundles"; the Seller Handbook's October 2026 update (index) names "instruction or assembly
  manuals, and instructional e-books" and warns that failing listings "will be removed and may also result in your shop
  being removed". The Claude Code kit cannot be listed here. **For this line:** the workbook is a disclosed spreadsheet tool
  ("designed by a seller", allowed), but its README sheet reads as instructions — queued
  `etsy-ai-instructions-rule-review` (3) to settle it before the day-60 read; the Kindle guide is never listed on Etsy.
  `research_after` 2026-11-03 unchanged. Details: `docs/exchange/spikes/etsy-claude-code-kit-listing.md`.
- **2026-11-02 00:40 (burn-down, new-ventures spike `poe-creator-bot-uk-tax` → park):** Poe's Earnings Terms (2026-08-21,
  read in full through the relay) pay a creator-set price per message in USD through Stripe as Payment Agent — an account
  created for Poe's programme within 90 days, tax forms, a US$10 floor, 30–45 days after month end; the FAQ (walled to the
  runner, index) marks the UK eligible and prices per 1,000 messages. The shelf shows no UK tax bot, the one tax bot with a
  visible count has 2 followers, and 1,000 messages a month nets US$5–20, so a new Stripe identity step is not asked
  (owner-time rule). The rates in `src/kindle` serve whichever shelf comes first. Details:
  `docs/exchange/spikes/poe-creator-bot-uk-tax.md`. `research_after` 2026-11-03 unchanged.
- **2026-11-02 00:50 (burn-down, `etsy-ai-instructions-rule-review` done):** the listing stays. Etsy's not-allowed list (help
  centre, read in full) targets functional guides — patterns, recipes, instructions, manuals, instructional e-books — and the
  handbook asks such guides to show "an actual result made using your instructions"; the workbook is a disclosed spreadsheet
  tool with real preview screenshots and a hand-checked Example tab, typed into Etsy by the owner. The README tab is the one
  part a strict reading could call instructions: no change now, and if Etsy flags the listing the tab's text is replaced with
  the owner's own words (~10 min, a rebuild, a re-upload). The Kindle guide is never listed on Etsy. LISTING.md §Status row.
- **2026-11-03 09:24 (build, `reseller-workbook-second-listing`):** built the second listing (`src/reseller.ts`), dated today by the W43 exchange behind the
  first workbook. Fee rates read from each platform's own help pages through WebSearch restricted to the host (none of gov.uk, ebay.co.uk,
  vinted.co.uk, depop.com resolves from the sandbox; nothing fetched): **eBay** business final value fee by category (Clothes 11.9 %, Books 9.9 %,
  Business & Office 12.5 %, Crafts 12.9 %; help 4809, updated 2026-09-30) on the total including postage, plus 30p an order up to £10 and 40p
  over (from 2026-02-12); private accounts pay no final value fee but a trader needs a business account; **Vinted** no seller fee, Pro included,
  the buyer pays the Vinted fee (3–8 % + £0.30–0.80; help 373 / 908); **Depop** no selling fee for UK sellers, Depop Payments 2.9 % + £0.30 on
  price plus postage, Boosted Listings 8 % on sale (12 % before 2026-03-23); **Etsy** from §3 (6.5 % + 4 % + 0.48 % + £0.20 + US$0.20 renewal).
  **HMRC** (gov.uk "Selling goods or services on a digital platform", via the index): a platform reports a seller unless fewer than 30 sales of
  goods AND no more than €2,000 (≈ £1,700) in the calendar year; HMRC's own line that selling unwanted possessions is not trading is in the
  README and the listing. Design choices: stock deducted when paid (cash basis, HMRC's default since 2024/25) or when sold (Setup switch), since
  the per-item profit resellers want to see and the tax deduction differ; fees to box 19, postage paid to box 16, mileage to box 12, as the
  SA103S notes group them; the reporting check per calendar year inside the tax year with a note to add January–April sales from last year's
  records. Not built: a Payhip twin of the reseller file (the first twin has no sale yet to justify a second), MTD quarterly totals (the
  companion workbook has them; a reseller over £50,000 is rare). Follow-ups queued: `reseller-listing-live` (blocked on action 037). The §6
  proof and kill clocks for this listing start at its `Listed` row.
- **2026-11-03 17:30 (burn-down, queue starved — research pass):** the first pass with every shelf live: Etsy 10-29, Kindle 10-31, Payhip and
  the own checkout 11-02, the reseller file built 11-03 (action 037 open), 0 sales on all of them (§7), so STRATEGY §6 says distribution, not a
  fifth product. Three levers we control without the owner, each queued (STRATEGY §5 score): **`free-tax-estimate-calculator-page` (7)** — the
  buyer's query is "sole trader tax calculator 2026/27" and the shelf for it is Google: a WebSearch for `sole trader tax calculator 2026/27 UK
  free` (2026-11-03) returned Bytestart, SparkReceipt, UK Net Pay, itcontracting and smallbusinessguide, three hobby Cloudflare Pages sites
  (calks-uk, uk-tax, poundlogic `.pages.dev`), three Payhip product pages and an Etsy listing — a new domain can rank, and product pages rank
  beside the calculators. The maths exists and is tested (`src/tax.ts`, `src/rates.ts`), so the page is a client bundle and copy on the landing
  Worker, with the workbook as the next step under the result. **`product-page-structured-data-faq` (6)** — `tax-workbook.html` has no JSON-LD
  and no question-shaped headings (checked: 0 `ld+json`, h2s "Where to buy", "What you get", "At a glance", "Please read before buying",
  "Refunds"); Product + Offer markup and a FAQ block aimed at the long-tail queries. **`cross-sell-links-guide-and-workbook` (4)** —
  `src/kindle/content.ts` carries no link to the workbook and `src/workbook.ts` never names the guide; a back-matter "Also by" page (our own
  site, KDP-allowed) and a README row, rebuilt into `release/` for the own checkout now and riding the next owner upload later. **Unblocked**
  `kdp-listing-live` (8): its trigger, the "available in the Kindle Store" mail, landed 2026-10-31 14:32 (KINDLE.md Status) and no slot had
  moved the item; the ASIN is not in the mail and amazon.co.uk is never read (Conditions of Use forbid automated access; two WebSearches did
  not surface the title), so the record carries the live date and takes the URL from the owner's 2026-11-30 shelf note; `kdp-paperback-edition`
  (7) follows it and `google-play-listing` dates to 2027-01-29. Not queued: a Payhip twin or own checkout for the reseller file (the first twin
  has no sale; the 09:24 build's rule stands), the landlord workbook and the MTD Kindle title (10-26 list: after the first shelf sells), a KDP
  free-promotion week (owner clicks; action 037 is open and never gains steps). Nothing fetched; `research_after` removed, `researched` today.
- **2026-11-03 17:17 (build, same slot):** the 17:00 build slot ran the same starved-queue pass in parallel (its marker landed 17:13, after the
  burn-down's pull) and reached the same reading — the 10-31 KDP mail frees `kdp-listing-live`; the index has no amazon.co.uk page for the title
  (one WebSearch on the host); three shelves live 1–5 days with 0 sales. The burn-down's entry above is the record; the build's two dated product
  items (a landlord SA105 workbook as the shop's third listing — Etsy's index shows a 2026/27 landlord-tracker niche with Section 24 and MTD
  quarters, no sales counts; an MTD quarter-by-quarter Kindle title) were discarded in the merge, the 10-26 rule standing: after the first shelf
  sells. Kept: `etsy-bill-ledger-row` (3), the ledger row for Etsy's unexplained £2.98 bill of 11-01, written from the payment mail once the
  owner pays. The collision is queued as foundry `research-claim-marker`.
- **2026-11-03 17:25 (burn-down, `kdp-listing-live` done):** the Kindle guide recorded live from 2026-10-31 (§7 `Kindle live` row,
  KINDLE.md Status): the live mail names no ASIN and the sandbox never reads amazon.co.uk (its Conditions of Use forbid automated access;
  two WebSearches did not surface the title), so the page link comes from the owner's 2026-11-30 shelf note — `scripts/shelf-note.ts` now
  reads an Amazon `/dp/` link or `ASIN B0…` from any owner note and appends a KINDLE.md Status row, and the monthly ask sentence says
  "+ the Kindle book's Amazon link" until that row exists (`kindleLinkKnown` in `scripts/handoffs.ts`; 4 new tests). Queued
  `kindle-day-60-read` (8, 2026-12-30) with §6's proof and kill; `google-play-listing` dated 2027-01-29 (the Select term's end);
  `kdp-paperback-edition` (7) is buildable. The SELF-CAUSED kdp row already covers the live mail and the royalty mail. Nothing fetched.
- **2026-11-03 17:40 (burn-down, `kdp-paperback-edition` done):** `src/kindle/paperback.ts` prints the EPUB's chapters as a 6 × 9 in
  interior with Chromium (Playwright, the sandbox's browser; 11 pt DejaVu Serif embedded, 0.5 in side margins — KDP's ≥ 0.375 in inside and
  ≥ 0.25 in outside up to 150 pages without mirrored margins — running head and page numbers from the print templates, each chapter on a new
  page, tables kept as tables) and reads the page count from the PDF (49) to size the wrap cover (spine 49 × 0.002252 in white paper, no spine
  text under 79 pages, the barcode corner left white); the build refuses a count outside 24–110 so the fixed £1.93 print cost and the cover
  always hold. `copyrightParagraphs()` moved out of `epub.ts` so both editions print the same copyright page. Four tests (cover maths, the
  page-count parser, the interior's structure, the wrap SVG); the PDFs are committed under `kindle/paperback/`. The owner's add-a-format step
  (~10 min, £0, £9.99 list) is KINDLE.md "Paperback" and action 029 follow-up 6; `kdp-paperback-live` (5) records the page link. Nothing fetched.
