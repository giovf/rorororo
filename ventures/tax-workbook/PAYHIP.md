# Payhip listing — UK Sole Trader Tax Workbook 2026/27 (the twin of the Etsy listing)

Paste-ready copy for the owner's Payhip upload (action 033), in the order of Payhip's "Add a product → Digital
product" form (read from the help centre, 2026-10-24 and 2026-10-29; payhip.com itself cannot be opened from the
sandbox, so a box that is not where this file says it is still takes the same text). The store is
https://payhip.com/gankdat (action 029 step 4, done 2026-10-29). The file to upload is
`release/UK-Sole-Trader-Tax-Workbook-2026-27.xlsx`; the cover is `listing/1-hero.png` and the four other images
`listing/2-tabs.png` … `listing/5-fit-and-refund.png` (2000 × 1500) go in the product's image gallery in that order.

Same price, same copy, same refund promise as Etsy (`LISTING.md`), so a buyer who sees both finds one product. The
differences are Payhip's: it emails the download link itself, acts as reseller for UK/EU VAT (Settings → Taxes stays
at its default, "handle digital UK & EU VAT", which adds the buyer's VAT on top of £6.99 for a UK/EU buyer), and pays
the owner's Stripe or PayPal daily. Rival Payhip listings of the same kind sit at £6.95–14 (RESEARCH.md §2).

## 1. Product

**Product name** (Payhip has no title limit; the Etsy title fits):

```
UK Sole Trader Tax Workbook 2026/27 – Self Assessment & MTD Spreadsheet, SA103 Expenses, Mileage Log
```

**Price:** £6.99 (GBP). No "pay what you want", no minimum. Change it to £8.99 on 1 December 2026 (the description
names the launch date; the Etsy price changes the same day, `etsy-launch-price-end`).

**Digital file:** `release/UK-Sole-Trader-Tax-Workbook-2026-27.xlsx`.

**Cover image:** `listing/1-hero.png`. Gallery: `2-tabs.png`, `3-tax-estimate.png`, `4-mtd-sa103.png`,
`5-fit-and-refund.png`.

**Description.** Payhip's editor keeps paragraphs and bullet lines; paste the block below as it is (it is the Etsy
block with the delivery sentence changed to Payhip's download mail).

```
Keep your sole-trader records for the 2026/27 tax year in one spreadsheet, and know what you will owe before January.

This workbook gives you three simple logs (income, expenses and business mileage) and turns them into everything you need at year end: the SA103S self-employment boxes, the quarterly totals Making Tax Digital asks for, a Trading Allowance check, and an estimate of your Income Tax, Class 4 National Insurance and payments on account.

Launch price until 30 November 2026.

AT A GLANCE
• File format: one .xlsx spreadsheet (about 0.3 MB), instant digital download. Nothing physical is sent.
• Works in: Microsoft Excel 2010 or later, Google Sheets (File → Import), LibreOffice Calc and Apple Numbers. No account or subscription needed.
• Editable: every blue cell is yours to type in; everything else is calculated. Formulas only: no macros, nothing to enable.
• Region and year: UK, tax year 6 April 2026 to 5 April 2027. Income Tax bands for England, Wales and Northern Ireland.
• For: sole traders, freelancers and the self-employed with one business, not VAT-registered.
• Licence: for your own business records.

WHAT YOU GET (10 TABS)
• Setup: every 2026/27 rate and threshold (Personal Allowance, tax bands, Class 4 limits, HMRC mileage rates, Trading Allowance, the MTD threshold), each with its gov.uk source. Change a figure once and every formula follows.
• Income log: date, customer, type (sales or other business income), amount.
• Expense log: a drop-down of the SA103S expense categories (boxes 11–19), a business-use share for mixed costs, and the allowable amount worked out for you.
• Mileage log at HMRC approved rates, including the 10,000-mile step-down for cars and vans.
• Quarterly: the four MTD quarters (standard or calendar) with income, expenses, profit and each update deadline.
• Allowance: whether the £1,000 Trading Allowance or your actual expenses leaves you the lower profit.
• SA103: your year-end figures box by box, ready to copy into the self-employment pages or your filing software.
• Tax: Income Tax, Class 4 NI, the balancing payment due 31 January and the two payments on account, with room for a salary or pension and tax already deducted so the bands are right.
• Example: a filled, hand-checked year so you can see what a finished workbook looks like.
• README: how to use it, what it covers and what it does not.

PLEASE READ BEFORE BUYING
• It is a record-keeping and estimating spreadsheet, not MTD-recognised filing software and not tax advice. Quarterly updates and the tax return are still sent through HMRC's online service or MTD-compatible software; this workbook gives you the numbers to send.
• Scottish Income Tax bands differ and are not included.
• Not for partnerships or limited companies.
• Not covered: student loan repayments, savings and dividend income, Marriage Allowance, pension and Gift Aid relief, losses brought forward, the High Income Child Benefit Charge. Check the final figures against HMRC's own calculation.
• Rates are the 2026/27 figures published on gov.uk, read in October 2026.
• Made by me with the help of AI tools. Every formula is tested, and the example year is checked by hand.

DELIVERY AND REFUNDS
Payhip emails your download link the moment the payment goes through, and the file stays in your Payhip library. If the file does not open on your device, reply to that email or message me within 14 days for a replacement file or a full refund. One purchase is one licence for your own business records; please do not share or resell the file.
```

## 2. Category & Tags (the tab the marketplace reads)

- **Category:** Business → Finance / Accounting (whichever of the two Payhip offers; "Templates" if neither).
- **Tags:** sole trader tax, self assessment uk, tax spreadsheet, bookkeeping excel, self employed uk, sa103 expenses,
  making tax digital, mtd quarterly, mileage log hmrc, tax return 2026 27, google sheets tax, freelancer finance,
  income expense log (the Etsy tags; Payhip has no 20-character limit).
- **Marketplace:** do **not** submit yet. Payhip admits a store to its marketplace only after US$10 of its own sales
  (self-purchases excluded) and a review of the store; the "Submit to marketplace" button on this tab is pressed once
  the Daily numbers show that (queue item `payhip-marketplace-submission`, blocked on it). Submitting earlier is refused.

## 3. Other product settings

- **Licence keys:** off (a spreadsheet, not software).
- **Variants, pay-what-you-want, subscriptions, upsells, affiliates:** off.
- **Customer email collection:** Payhip's default (the buyer's email is theirs; we never see it — the webhook below keeps
  counts only).
- **Settings → Taxes:** leave "handle digital UK & EU VAT" ticked (default). VAT is added on top of £6.99 for UK/EU
  buyers and Payhip remits it as the reseller.
- **Settings → Checkout:** the default checkout text; refund policy as in the description.

## 4. Webhook — the sale reading (Settings → Developer)

Payhip posts every sale and refund to a URL, so the funnel is read without parsing mail (unlike Etsy):

- **Webhook URL:** `https://apps.gankdat.com/hooks/payhip`
- **Events:** `paid` and `refunded` (the two subscription events can stay unticked).
- **API key:** the key shown on the same Developer page goes into the GitHub repository secret `PAYHIP_API_KEY`
  (action 033 step 2); the landing deploy stores it as the Worker secret the receiver checks the webhook's signature
  against (Payhip signs each post with sha256 of the key). Until the secret exists the endpoint answers 503 and Payhip
  retries hourly for three hours — so set the secret before the first sale, or the first posts are lost.
- **What is kept:** per-day counts and pence (paid, refunded, gross, fees, refunded amount, product key) in the landing
  Worker's KV; never the buyer's email, name or IP. `https://apps.gankdat.com/hooks/payhip/summary` serves the last
  30 days keyless; the gankdat Daily numbers row carries it as `payhip 30d: N sales, N refunds, net £x`.

## 5. After the upload

Give back the product's permalink (`https://payhip.com/b/XXXX`): the product page at
https://apps.gankdat.com/tax-workbook.html links the store (`payhip.com/gankdat`) until then and is switched to the
product link by the item that records the listing live (`payhip-listing-live`).
