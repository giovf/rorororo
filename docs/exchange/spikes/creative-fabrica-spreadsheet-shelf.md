# Spike: Creative Fabrica as a second marketplace shelf for the UK Sole Trader Tax Workbook

Queue item `new-ventures/spike-creative-fabrica-spreadsheet-shelf` (burn-down, 2026-11-01 17:11–17:40 UTC; seeded by the
same run's exchange pre-research). Sources: two fetch-relay rounds this run (`docs/relay/responses/creative-fabrica-2026-11-01`,
17 plain GETs, and `creative-fabrica-r-2026-11-01`, 7 rendered pages) and four WebSearch reads restricted to
creativefabrica.com / help.creativefabrica.com. **Every runner request to www.creativefabrica.com and
help.creativefabrica.com answered 403 with Cloudflare's "Just a moment..." challenge page** (17 bytes of text, 5.8 kB of
markup, 188 ms) — the open-store page, six help articles, the help-centre home, four tag pages, the designer page, two
product pages and two blog posts alike; the rendered round passed the challenge ("Verification successful. Waiting for www.creativefabrica.com") but the five www pages never loaded within the window (403, 503 bytes of challenge text), while **the two help.creativefabrica.com articles rendered in full** (store guidelines, how to open a store) and are quoted as primary below. The sandbox's own fetcher cannot resolve the host at all. So,
as with payhip.com on 2026-10-24, the shelf is read only as the search index holds it, marked below.

The exchange's questions: does the shelf list spreadsheets at all (Creative Market did not), what gates a store, what the
designer keeps, and what the owner would have to do.

## 1. The shelf's terms (search index only — the pages are behind the challenge)

| Source | What the index holds |
| --- | --- |
| Open-store page (`/open-store/`, every locale) | "up to 75 %" on sales the designer refers, "50 %" on sales Creative Fabrica refers; no exclusivity; payouts can be requested at any time and arrive within 7 days. |
| Store guidelines (help 360014596379, rendered in full: it is the storefront set-up article — logo ≥ 500 px jpg, banner 1220 × 250, no third-party links or contact details in the banner; the "another online store" sentence sits in the index snippet, not in this page) | "We will only accept Designer Requests from designers who have another online store" — a Behance or Dribbble portfolio link is not enough; reviewers look for "high quality designs that are suitable for our marketplace and audience". |
| **How can I open a store (help 360015099500, rendered in full, updated 8 months ago)** | A free account first; the form asks full name, store name, links to existing stores, portfolio links and the reason for selling; **Etsy is on the list of store examples** (with Behance, Creative Market, Instagram, Design Bundles, Adobe Stock, Dribbble, Cults3d); "we highly recommend that your portfolio showcases your designs, their popularity and portfolio history"; the request "is automatically reviewed" for "high quality designs that are suitable for our marketplace and audience" and ownership evidence; **"if your store is rejected due to quality reasons or an insufficient number of designs, you will only be able to reapply in 2 months"**; an ownership rejection can be re-filed at once. |
| Adding your email or account ID to your portfolio (help 4411193014674) | The account email, or the last two digits of the account ID, must be visible on the linked store or portfolio page, or the request "will likely be rejected". |
| When will my uploaded products be approved (help 360030260091) | Each product is reviewed separately, published within 1 working day, longer in a queue. |
| **Designers Terms & Conditions V1.3** (`/designers-terms-conditions-v1-3`) | Creative Fabrica "may require identity and payment verification, including phone and identity documents", may ask for a signed self-certification of legal compliance, and may impose additional verification and temporary payment restrictions; verification runs through Sumsub (help 4404347323410 "How do I verify my account?" — staff cannot see it). The current percentage is not in the index; the 1.0 terms (≈ 2017) said "always 50 % of whatever the customer pays". |
| How do I make a payout (help 360029930872) + affiliate payout article | Payout from the designer dashboard once there is a balance; PayPal, Payoneer or bank; **minimum payout US$100; bank transfer carries a US$20 handling fee**; payouts can be withheld until verification is complete. |
| VAT (help 360029714532) | The company is Dutch and charges VAT to every European customer on top; the designer's share is of the ex-VAT price (not stated for UK sales specifically). |

## 2. Rivals on the shelf (search index only)

| Listing (creativefabrica.com/product/…) | Designer | Price | Rating / reviews |
| --- | --- | --- | --- |
| Budget Planner Excel — Rainbow Theme (Excel + Google Sheets, one tab, commercial licence, updated 2026) | SpreadsheetsHub | US$13.99 | 4.7 from 6 |
| Budget Planner Excel & Google Sheets | SpreadsheetsHub | not in the index | 5.0 from 3 |
| Monthly Budget Spreadsheet Excel | SpreadsheetsHub | not in the index | 5.0 from 3 |
| 60/20/20 Monthly Budget Spreadsheet | SpreadsheetsHub | not in the index | none |
| Debt Payoff Tracker Excel & Google Sheet | SpreadsheetsHub | not in the index | 1.0 from 1 (wrong formulas) |
| Monthly Budget Spreadsheet Planner | b5creations | not in the index | not in the index |
| Premium Templates for Etsy Seller; ADHD Planner; Rental Property Management; Sinking Funds Tracker | SpreadsheetsHub | not in the index | not in the index |

Tag pages in the index: `budget-spreadsheet` 115 items, `excel-template` 96, `google-sheets-budget` 53, `budget-tracker`
998, `budget-planner` 2,315 (the last two are mostly printable planners). **No tax, self-employed, sole-trader or HMRC
spreadsheet appears in any search of the domain**, and the only spreadsheet designer with several listings shows 1–6
reviews per product — the shelf takes spreadsheets, but the index shows no evidence that anyone buys a tax one there.
Download counts, which the All Access subscription pays on, are not exposed in the index.

## 3. Economics for the same file

- **Net per sale** on a marketplace-referred sale at a rival-matching US$9.99 ex-VAT: 50 % = **US$5.00 ≈ £3.85**; at
  US$13.99, US$7.00 ≈ £5.40; on a sale the owner refers (75 %), US$7.49 / US$10.49 — but the owner refers nobody, and
  a referred buyer would be sent to Payhip (≈ 91 % kept) instead. Against Etsy's ≈ £5.80 of £7.19 and Payhip's ≈ £6.34.
- **Payout floor**: US$100 before a penny arrives — 20 marketplace sales at US$9.99, 15 at US$13.99 — and a US$20 fee on a
  bank transfer (PayPal is free). The All Access per-download share is unknown and unreadable.
- **Owner steps**: an account (email), the Etsy shop's About page carrying the account email, the Designer Request
  (~10 min), then possibly Sumsub identity verification on a new service (the terms reserve it; no reading says whether a
  new designer always gets it) and a self-certification. The owner-time rule (STRATEGY §3, 2026-10-29) allows no new
  identity verification unless the unblocked work scores ≥ 10; this line scores ≈ 6 on the pre-research numbers and
  less on the review counts above.
- **Risk**: the automatic review rejects for "an insufficient number of designs" and locks the request for 2 months; the
  catalogue to show is one workbook (two files) on a three-day-old Etsy shop with 0 sales, and the reviewers judge
  "designs" and "popularity" — a tax workbook's previews are tables.
- **Reading the funnel**: nothing from a runner — the host challenges every request — so sales would be read from the
  owner's dashboard or payout mail only, like Etsy.

## 4. Call: park, dated

**Park.** The primary read adds a fourth reason: the automatic review wants a catalogue ("an insufficient number of
designs" is a 2-month lockout) and the shop to show has one listing and no sales history yet. Three of the four park conditions in the item are met or unresolvable from here: the designer terms reserve an
identity-document check (Sumsub) on a line scoring well under the ≥ 10 the owner-time rule asks for; no UK tax or
self-employed spreadsheet on the shelf shows a rating (none exists in the index); and the net per sale at the rival's
price is £3.85–5.40, above the £3 line but behind a US$100 payout floor that needs 15–20 sales on a shelf whose
spreadsheet designer shows 1–6 reviews a listing. The fourth (is .xlsx an uploader product type) is answered yes by the
listings themselves. The shelf cannot be read from a runner at all, so nothing here can be re-checked without the owner.

**Trigger:** the Etsy day-60 read (2026-12-28) shows ≥ 10 workbook sales — proof the file sells on a marketplace that
supplies its buyers — *and* the owner accepts an identity check on a new service in the same batched request; then a
tax-workbook item writes the listing copy and the Designer Request text (≤ 0.2 day) and the owner files it with the Etsy
shop as the "other online store". Re-read sooner only if Creative Fabrica publishes download or sales counts, or a
readable mirror of the designer terms states that verification is not applied to new stores.
