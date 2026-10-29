# Kindle listing — UK Sole Trader Tax 2026/27

Paste-ready copy for the owner's KDP upload (action 029 step 5). Built 2026-10-26 by `ventures/tax-workbook/src/kindle/`
(`npm run kindle -w @foundry/tax-workbook`): the EPUB `kindle/UK-Sole-Trader-Tax-2026-27.epub` (17 sections, 9,102 words,
267 kB, epubcheck 5.2.1: 0 errors, 0 warnings) and the cover `kindle/cover.jpg` (1600 × 2560 JPEG, KDP's recommended size).
The text's figures are computed from `src/rates.ts` and `src/tax.ts`, so the book and the workbook agree; the tests in
`src/kindle/kindle.test.ts` check the figures, the form limits and the content-quality rules below. The values here mirror
`src/kindle/kdp.ts`.

## Why these choices (KDP's own pages, spike 2026-10-26)

- **Standalone guide, not a companion.** KDP's Guide to Kindle Content Quality bars books that redirect readers elsewhere
  for the full content, exist to advertise, or are companions to other books. The guide is complete on its own; the
  workbook is named once, in the back matter, as a separate product (`npm test` checks exactly one mention, back matter only).
- **AI disclosure.** KDP requires AI-generated text to be declared at publication and allows it. The text is AI-generated
  under KDP's definition (drafted with AI tools, then edited); say so on the form. The book's own copyright page and
  colophon also say it. No buyer-facing label is shown on the product page.
- **Price.** £4.99 at the 70 % option (band £1.77–£12.99); Amazon adds UK VAT and pays 70 % × (£4.99 − VAT − £0.03
  delivery for a 0.27 MB file) ≈ £2.70 a sale. A Kindle Countdown Deal at £2.99 for the first 7 days is a real launch
  price with a stated end date (DMCC-safe); no invented scarcity anywhere.

## Paste into KDP Bookshelf → "Create" → Kindle eBook

### Kindle eBook Details

- **Language:** English
- **Book title:** UK Sole Trader Tax 2026/27
- **Subtitle:** Self Assessment, Making Tax Digital and the numbers — a plain guide for the self-employed
- **Series:** none (an annual edition; next year's book is a new title "2027/28", not a series volume)
- **Edition number:** 1
- **Author:** your own name, or the pen name **Foundry Tax Guides** (the one in the file's metadata; either is allowed —
  KDP asks for an author name, not a legal identity)
- **Description** (plain text, 2,157 characters, limit 4,000):

```
Know what you will owe before January — and what to send HMRC every quarter.

This is a plain-language guide to the tax a UK sole trader pays for the 2026/27 tax year (6 April 2026 to 5 April 2027), written for freelancers, tradespeople, consultants, drivers, makers and side-hustlers who are not VAT-registered and do their own books. Every rate is the 2026/27 figure published by HMRC, and every calculation is worked in full so you can follow it with your own numbers.

What it covers
• Registering as self-employed, the UTR, the 5 October deadline and the cash basis
• Records: the three logs to keep and how long to keep them
• Income: what counts, gross not net, grants and other business income
• Expenses: the nine SA103S categories, the costs people miss, the costs you cannot claim, working from home, equipment under the cash basis
• Mileage: the 45p/25p rates and the 10,000-mile step, with a worked year
• The £1,000 trading allowance: when it beats your real costs
• Income Tax: the Personal Allowance, the bands, the taper above £100,000, Scotland and Wales
• National Insurance: Class 4 at 6% and 2%, and what the 2024 abolition of compulsory Class 2 means for your State Pension
• Paying: the 31 January bill, payments on account, reducing them, budget payment plans
• Making Tax Digital for Income Tax: who is in from April 2026, 2027 and 2028, the quarterly deadlines, the calendar-quarter election, the final declaration, software, penalty points
• The self-employment pages box by box
• A complete year start to finish, and a January checklist

Four worked examples run through the book: Sam, a plumber with a van; Priya, a consultant in the higher-rate band; Leo, who sells prints alongside a job; and Amy, whose first year made a small profit and who buys a State Pension year for £189.80.

What it is not: tax advice, or a substitute for HMRC's own calculation. It uses the Income Tax bands for England, Wales and Northern Ireland and leaves out student loans, savings and dividend income, pension relief, the Child Benefit charge and losses, saying where each would come in.

2026/27 edition. Rates read from gov.uk in October 2026.
```

- **Publishing rights:** I own the copyright and I hold the necessary publishing rights.
- **Primary audience:** no sexually explicit content; reading age: leave blank.
- **Primary marketplace:** Amazon.co.uk
- **Categories** (2): Business, Finance & Law → Accounting → Taxation → Personal Taxation · Business, Finance & Law →
  Small Business & Entrepreneurship → Self-Employment (KDP's category tree moves; pick the nearest "Taxation" and
  "Self-Employment / Small Business" leaves it shows)
- **Keywords** (7, each ≤ 50 characters):
  1. self assessment tax return 2026 27
  2. sole trader tax guide uk
  3. making tax digital income tax
  4. self employed expenses allowable hmrc
  5. class 4 national insurance
  6. payments on account self assessment
  7. side hustle tax uk trading allowance
- **Pre-order:** no — release now.

### Kindle eBook Content

- **AI-generated content** (the "Did you use AI tools in creating texts, images, and/or translations?" question): **Yes.**
  Text: *AI-generated* (drafted with AI tools, then edited). Images: *none AI-generated* (the cover is drawn from a
  hand-written SVG template). Translations: none. Extent: "entire work", "minimal or no editing" is not right — choose
  "extensive editing" if asked, as the examples and rates were checked against gov.uk pages.
- **Digital Rights Management:** No.
- **Manuscript:** upload `ventures/tax-workbook/kindle/UK-Sole-Trader-Tax-2026-27.epub`.
- **Cover:** upload `ventures/tax-workbook/kindle/cover.jpg` ("Upload a cover you already have").
- **Previewer:** open it once; the contents page, tables and the cover should render. If a table looks cramped on the
  phone preview that is normal for Kindle tables; nothing to change.
- **ISBN:** none (not required for Kindle).

### Kindle eBook Pricing

- **KDP Select:** enrol (a Countdown Deal needs it; the guide is not sold as an ebook anywhere else, which Select requires).
- **Territories:** all territories (worldwide rights).
- **Primary marketplace:** Amazon.co.uk. **Royalty:** 70 %. **List price:** £4.99 (other marketplaces: let KDP convert).
- **After it is live:** KDP Bookshelf → Promote and Advertise → **Kindle Countdown Deal**: £2.99 for 7 days starting the
  day the book goes live. Then it returns to £4.99 by itself. Do not run a second one straight after — a rolling deal
  stops being a launch price.
- **Book Lending:** on (default).

## Reading the result

- The listing is live when KDP mails "Your book is live" (`docs/ops/SELF-CAUSED.md` carries the row; the inbox triage
  logs it and nobody is paged).
- Sales: KDP Reports → Dashboard. Once a month, send a note like `kindle: 7 sold` (Telegram or the dashboard idea box) —
  the burn-down writes the Metrics row from it. The proof is a first sale within 30 days of going live and ten within 60
  (RESEARCH.md §6); the kill is the workbook's day-60 read.
- Royalties are paid by EFT in GBP about 60 days after the month's end, no minimum; each payment is a `revenue` row in
  `docs/LEDGER.md` from the "payment" mail.

## Status

| Date | Event |
| --- | --- |
| 2026-10-26 | Guide v1 built: EPUB (17 sections, 9,102 words) and cover; listing pack written; KDP step added to action 029 |
| 2026-10-26 | Google Play Books read as the third shelf (70 % to UK sellers, no AI rule); listing queued for after the first KDP Select term (`google-play-listing`) |
| 2026-10-29 | Submitted on KDP by the owner (action 029 step 5), in review. The owner entered the title **"The UK Sole Trader - A guide for the self employed & side hustlers"** instead of the pack's "UK Sole Trader Tax 2026/27"; the cover and title page still carry the pack's title, which KDP's review may flag as a metadata mismatch — if it does, set the KDP title back to the cover's (no rebuild needed). |
| — | Live on amazon.co.uk: ASIN, URL and date to be filled by `kdp-listing-live`. |
