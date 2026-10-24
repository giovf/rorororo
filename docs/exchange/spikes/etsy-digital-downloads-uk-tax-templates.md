# Spike: Etsy digital downloads as a shelf for UK sole-trader tax and bookkeeping spreadsheets

Queue item `new-ventures/spike-etsy-digital-downloads-uk-tax-templates` (burn-down, 2026-10-23 17:11–17:20 UTC; seeded
by the same run's pre-research pass). Sources: WebSearch only — 20 searches over etsy.com, help.etsy.com and gov.uk pages
as the search index holds them. **No relay round and no fetch of etsy.com from the sandbox**: etsy.com and help.etsy.com do
not resolve here, and Etsy's API Terms of Use (`/legal/api/`) forbid "automated systems or browser extensions to analyze
or scrape the Etsy Site, the API, or Etsy data" (listings, shops and user profiles named) without written authorisation,
while the general Terms of Use forbid crawling, scraping or spidering "any page of the Services" without express
permission. So every number below is the search index's snapshot of a page, dated where the snapshot said so, and the
shelf can never be read by this operation's automation — a constraint on the day-30 funnel, recorded in §5.

The question the pre-research left open: can a UK individual sell a seller-designed spreadsheet through Etsy's own checkout,
what does the shelf take, and are there visible buyers for UK tax templates at a price a half-day build can earn back?

## 1. Eligibility and the owner's path (Etsy's own pages)

| Source | What it says |
| --- | --- |
| Etsy Payments Policy, "Countries Eligible for Etsy Payments" | The United Kingdom is on the current list; UK deposits go to a UK bank account in GBP (a UK account is not treated as Eurozone). |
| "How to Open an Etsy Shop", "Identity Verification with Persona" | Sellers must be 18+. Identity is checked by Persona during onboarding: a photo of a government ID and a selfie; for UK sellers the controller is Etsy Ireland UC. Express review (biometric) or manual review. The ID name must match the Etsy account and the bank account name. |
| "How to Verify Your Seller Information" | A bank account in the seller's legal name (a sole trader's personal account qualifies — "the name on your bank account must match the name or business entity you have entered on your Legal and tax information page"); a card for fees; the bank account is verified by a small test deposit before the first payout. Business verification documents (HMRC registration proof or a Self Assessment return) apply only to accounts set up as a business. |
| Fees & Payments Policy, "Strengthening New-Shop Onboarding" (Feb 2024) | A one-time, non-refundable **set-up fee** charged to the card before the shop opens: US$15 at its 2024 introduction, "varies by location", "may be waived in certain circumstances or promotional periods"; the amount is shown in the "Total due now" step before payment. Third-party guides read in 2026 put it at US$15–29. |
| Creativity Standards (`/legal/creativity/`), "What Can I Sell on Etsy?" | "Items designed by a seller" include "digital downloads of sellers' original designs" (a text document, a graphic-design file are the examples); a digital item must be made and/or designed by the seller; a resold file (a PDF the seller did not create) does not qualify. Seller-prompted AI work qualifies; AI prompt bundles do not. |
| "How to Manage Your Digital Listings" | An instant-download listing carries up to five files of 20 MB each; the file is delivered automatically on purchase. |
| "What Information Does Etsy Report for Sellers in the EU, UK and Canada" + GOV.UK platform-reporting guidance | Etsy reports a UK seller to HMRC under the UK platform rules once they pass 30 transactions in a calendar year (GOV.UK: fewer than 30 sales **and** under €2,000 ≈ £1,700 is exempt) — and for any sale of a made-to-order digital item. A premade download sits under the 30/€2,000 exemption; reporting is a data share, not a tax bill, and the ledger already records every sale. |

Reading: the path is the same shape as Figma Community's — the owner's identity on the shelf, Etsy as the biller — plus a
set-up fee under £25 and a selfie check. That is three owner actions (Persona check, bank account + card, the fee) in one
sitting of about 30 minutes, batched into the exchange's decision; none is raised today.

## 2. The shelf's terms

- **Fees on a sale** (Fees & Payments Policy, UK sell page, "What is a Regulatory Operating Fee?"): listing fee US$0.20 per
  listing, charged again as an automatic renewal **after each sale** of a multi-quantity (digital) listing and at the end
  of each 4-month period; transaction fee 6.5 % of the displayed price; UK payment processing 4 % + £0.20; UK regulatory
  operating fee 0.48 % of the order; 20 % VAT on Etsy's fees for a seller without a VAT number; Offsite Ads 15 % only on
  sales Etsy's ads bring (optional below US$10,000 a year). On a £7.19 digital sale: 6.5 % £0.47 + processing £0.49 +
  regulatory £0.03 + renewal £0.16 + VAT on those £0.23 ≈ **£1.38, 19 %; the seller keeps ≈ £5.80**.
- **VAT on the buyer side**: Etsy collects and remits VAT on automatically delivered digital items where the law requires
  it (Fees & Payments Policy) — the seller never invoices.
- **Payout** ("How to Receive Your Etsy Payments Deposit", UK deposit-schedule post): weekly on Mondays by default (daily,
  fortnightly or monthly selectable), by Bacs, ~3 business days to land; a new seller's funds become eligible 14 days after
  the sale; a payment reserve "may" be applied to a new shop but holds "a percentage of funds from each new sale of a
  **physical** item" — not a digital download. No payout floor.
- **Refunds**: the seller's own policy per listing; digital-download sellers commonly state "no refunds on digital
  products"; UK consumer rules still require a clear policy on the listing (ARCHITECTURE: refund policy on every listing).
- **Support duty**: Etsy expects sellers to answer buyer messages (the shop's "message response" shows in Star Seller
  stats); messages arrive by email, which the inbox-triage routine reads and drafts answers to; the owner sends them.

## 3. Demand: UK tax and bookkeeping spreadsheets (search-index snapshots, 2026-10-23)

Counts are visible on listing pages but only where the index kept the "sales / reviews / years on Etsy" line.

| Listing (shop) | Price seen | Sales / reviews | Age | Note |
| --- | --- | --- | --- | --- |
| UK Self-employed Bookkeeping Spreadsheet: HMRC Sole Trader Accounts Tracker (TheFinanceToolkitCo, UK) | £7.19 / US$8.80 | **172 sales, 18 reviews at 5.0** (an earlier snapshot: 11) | 1 year | non-VAT sole traders; totals by SA103 line; 42 favourites; the shop's bank-reconciliation sheet: 30 reviews at 4.5, US$14.38 |
| Etsy Automated Bookkeeping for UK VAT Registered Sellers (MadeontheCommon) | not in the index | **≈ 1.5k reviews**, all 5★ in the snippet | listed May 2025 | 149 favourites; a second Etsy + Shopify UK VAT template listed Feb 2026 |
| UK Self Employed Tax Spreadsheet 2026-27 SA103S (a new shop) | **£69** | 0 sales, no reviews | 4 months | "a qualified UK accountant verifies everything" — the top of the price band does not sell |
| UK Freelancer / Self-employed Tax Spreadsheet 2026/27 (LedgerlySpreadsheets) | US$5.19–6.92 | 2 reviews at 5.0 | — | the shop's cash-flow tracker: 7 ratings at 4.8, 193 days |
| UK Self Assessment Tax Tracker 2026/27 for Etsy, eBay & Vinted sellers (MTD quarterly) | US$14.00 | not shown | — | |
| Self Assessment Spreadsheet UK 2026-27 with HMRC mileage log | £3.00 | 5 reviews | — | |
| Self-employed reporting bundle | £6.99 (was £9.97) | not shown | — | |
| Sole-trader finance bundle | £14.39 | not shown | — | |
| Reseller Spreadsheet UK — inventory, P&L, Trading Allowance check | £3.99 sale | 35 reviews at 5.0 (page metadata) | 293 days | eBay / Vinted / Depop fees |
| 2026-27 tax and NI estimator (launch price to 30 Nov 2026) | US$5.28 | not shown | — | excludes Scottish bands |
| CIS Tracker Excel Template (AffordableforeverGB) | ≈ US$8.39 | not shown | ~2 years | CIS deductions; a sibling niche with 10+ listings at £0.90–US$49 |
| UK VAT Tracker Spreadsheet (nine VAT boxes, Flat Rate comparison) | not shown | no reviews in the index | — | |
| Landlord Rental Income Tracker (MARCHBORNS, US) | — | shop: **6.2k sales, 314 reviews at 4.8** | 3 years | generic landlord sheets; a UK-specific rental sheet from a US shop: 0 sales |
| Landlord multi-property / rent ledger shops (UK category pages) | £2–10 | shops showing 3.3k and 11.2k sales | — | the listing's own figures |
| Payhip rivals: Sole Trader Bookkeeping Spreadsheet; 11-tab 2026/27 workbook; SA103-mapped tracker | £6.95 / £9.99 / £6.99 | no counts | — | the same product off-Etsy |

What the band says: the UK sole-trader tax-sheet niche has **one shop with 172 sales in its first year at £7** and a
VAT-registered-seller sheet with ~1,500 reviews (reviews run well below sales on Etsy, so that is thousands of sales); most
2026/27 listings are weeks old with 0–7 reviews, priced £3–14 with permanent "sale" discounts; the £69 "accountant-verified"
sheet sold nothing in four months. Buyers pay £5–9 for a sheet that maps expenses to the SA103 boxes, estimates tax and
Class 4 NI, logs mileage at the HMRC rates and now carries an MTD-for-Income-Tax quarterly view. Category-page search
returns ~30 UK tax-sheet listings for each query, so the shelf is crowded but shallow: most sellers are single-listing shops
with no reviews, and the index found no listing combining SA103 mapping, the MTD quarterly totals and a Trading Allowance
check at under £10 with visible sales.

## 4. Build and economics

- **Build**: one `.xlsx` (and a Google Sheets copy, which the owner makes by uploading the file to Drive) — Setup tab (tax
  year, bands, NI thresholds, mileage rates as named cells), Income log, Expense log with SA103S category drop-downs, Mileage
  log, Quarterly (MTD) totals, SA103 year-end pack, Tax and Class 4 NI estimate with payments on account, Trading Allowance
  check, a filled example tab and a README tab; a cover image and five listing images. The sandbox's xlsx tooling builds
  formulas and validation; the file needs no code at run time. Half a day, plus a day-of-tax-year refresh each April (a new
  listing or a free update to the same listing).
- **Price**: £6.99 launch (true launch price with a stated end date, per the DMCC fake-urgency rule) then £8.99; ≈ £5.80
  net per sale at £7.19. 20 sales a month (the one-year-old rival's run rate is ~14) is ≈ £115/month, more than every launched
  product has earned together; the first sale is the day-30 proof.
- **Owner's cost**: the set-up fee (US$15–29 + VAT, ≤ £25, inside the £100 cap, a `docs/LEDGER.md` row the day it is paid) and
  ~30 minutes of identity and bank steps, then one upload of the file and images per listing (the sandbox cannot log in),
  and sending the replies triage drafts.

## 5. Call: promote (reshaped) — the 2026-10-28 exchange ranks it against the other shelf promotes

Promote because every gate holds: buyers with money (172 sales at £7 in a year from a one-listing shop; ~1.5k reviews on the
VAT sibling), a recurring job (every tax year, MTD from April 2026 adding a reason to buy a fresh sheet), paid competitors with
a documented gap (no sub-£10 sheet with SA103 mapping + MTD quarters + Trading Allowance check and visible sales), ≤ 1 week to
build (half a day), and no policy risk in selling (Creativity Standards admit a seller-designed file; Etsy bills and remits
VAT). The reshaping: the product is the workbook itself, not a service or software — the listing states it is record-keeping,
not MTD-recognised filing software, and names the tax year and the excluded cases (Scottish bands, partnerships, VAT-registered).

Three things the exchange must weigh before opening the venture:

1. **The owner's identity goes on Etsy** (Persona ID + selfie, a bank account in their name) and the set-up fee is money —
   CLAUDE.md "ask before doing" on both; one batched request (`docs/for-owner/actions/`) if the exchange promotes.
2. **The operation cannot read the shelf**: Etsy's terms forbid automated reads, the Open API v3 needs an Etsy-approved app
   and the owner's OAuth grant (possible later, for the shop's own stats only, never for other listings), so the day-30 funnel
   comes from Etsy's seller emails (sale notifications land in the inbox triage reads — a `docs/ops/SELF-CAUSED.md` row on
   launch) and the owner's Shop Manager stats, not from a metrics job. Rival prices and counts are re-read only through the
   search index.
3. **Human minutes per month are not zero**: buyer messages and the April refresh upload need the owner's hands, ~15
   minutes a month at the rival's volume. Smaller than any other shelf read this month (no W-8BEN, no US$200–500 floor, no
   review queue), but not nothing.

Park would be right only if the exchange judges the owner's identity step not worth £115/month at the rival's run rate; the
numbers say promote. Not raised to the owner today; the exchange's decision carries it.
