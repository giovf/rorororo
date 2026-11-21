# Spike: a printed UK business mileage log book on the owner's KDP account

Queue item `new-ventures/spike-kdp-uk-mileage-logbook` (build fallback, 2026-11-21; seeded by the 11-20 09:17 build).
Sources: relay rounds `new-ventures-2026-11-20` (line 10, the search 'mileage log book hmrc self employed', 16 results),
`mileage-logbook-2026-11-21` (22 lines: 18 product pages, two searches, KDP help topics GGE5T76TWKA85DJM and G200672390)
and `mileage-logbook-2026-11-21-b` (4 lines: a slugged product URL, a plain and a rendered search, a rendered product
page). Relay bodies are pruned after 7 days; every fact used is copied here.

**Call: park.** The review rule of 11-15 ("tax-workbook — nothing new is built before a first sale") holds today: the
tax line's three open shelves show 0 sales (gankdat Daily numbers 11-21: "payhip 30d: 0 sales"; no Sale row in
`docs/LEDGER.md`; no Kindle or own-checkout sale logged in `docs/RUNS.md`). That is the item's second park condition on
its own. The first — Best Sellers Rank of the 2026 HMRC-specific titles — **could not be read**: amazon.co.uk answered all
20 product-page requests from the relay runner with its "Click the button below to continue shopping" interstitial
(357 bytes of text, plain GET, slugged URL and rendered page alike), while search pages still answered (a plain GET once,
a rendered GET on 11-21). The shelf data that could be read (search cards: date, rating count, price) points the same way
as the park: of the nine HMRC/UK-specific titles published in 2026, six show no rating and three show one or two.

## 1. The shelf, from search cards (27 distinct titles)

Search A = 'mileage log book hmrc self employed' (11-20, plain GET); search B = 'vehicle mileage log book' (11-21,
rendered). Prices are shown in USD because the runner sits in the US ("Deliver to United States"); £ ≈ USD ÷ 1.317 (the
ratio of the same KDP list prices at USD 7.89 = £5.99 and USD 6.58 = £4.99). BSR, pages and trim live on the walled
product pages and are not in this table. "UK" marks a title that names HMRC or the UK.

| # | Title (truncated) | Search | Published | Ratings | Price | UK |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | HMRC Mileage and Expenses Log: UK Self-Assessment Record Book … | A1 | 2026-05-08 | 0 | USD 7.89 (£5.99) | yes |
| 2 | HMRC Mileage Log Book: Vehicle Mileage Tracker for UK Tax Claims … | A2, B | 2026-06-25 | 1–2 | USD 6.58 (£4.99) | yes |
| 3 | Mileage Log Book UK: HMRC Business Mileage Tracker for the Self-Employed & Sole Traders | A3 | 2026-11-10 | 1 | USD 9.87 (£7.49) | yes |
| 4 | mileage log book for taxes / mileage tracker … | A4, B | 2023-01-11 | 50 | USD 4.18 (£3.17) | no |
| 5 | VEHICLE MILEAGE LOG BOOK: Business, Self-Employed, Personal: IRS/HMRC/CRA | A5 | 2023-10-04 | 7 | USD 16.46 (£12.50) | partly |
| 6 | Vehicle Mileage Log Book: HMRC Compliant Business Mileage Tracker … | A6 | 2026-10-08 | 0 | USD 6.58 (£4.99) | yes |
| 7 | Business Mileage Log Book for Tax Records: Designed for HMRC … | A7 | 2026-06-04 | 0 | USD 7.89 (£5.99) | yes |
| 8 | Mileage Log Book: Daily Mileage Tracker for Car, Truck Drivers & Self-Employed | A8 | 2026-05-03 | 0 | USD 7.76 (£5.89) | no |
| 9 | Business Mileage Log Book UK: HMRC … Postcode Journey Log, Running 10,000-Mile Total … 6 April Tax Year (Foxy Press) | A9 | 2026-11-08 | 0 | USD 8.78 (£6.67) | yes — this exact shape |
| 10 | VEHICLE MILEAGE log book for taxes … Self-Employed / Business | A10, B | 2021-01-09 | 526 | USD 7.89 (£5.99) | no |
| 11 | Mileage Log Book for Self Employed – UK Tax Use: A5 … Sole Traders | A11 | 2026-02-02 | 2 | USD 10.53 (£8.00) | yes |
| 12 | Mileage Log Book: Car Tracker for Business Auto Driving Record Books … | A12, B | 2021-11-16 | 2 | USD 3.91 (£2.97) | no |
| 13 | Mileage Log Book: Vehicle Mileage Journal / For Taxes for Self Employed | A13, B | 2024-07-04 | 16 | USD 6.58 (£4.99) | no |
| 14 | Mileage & Tax Log Book: The Ultimate Small Business, Self-Employed & Tax Deduction Tracker | A14 | 2026-10-24 | 0 | USD 7.89 (£5.99) | no |
| 15 | UK Mileage Log Book: Business Mileage Record for Self Assessment with Trip Log, Monthly Totals … | A15 | 2026-11-02 | 0 | USD 8.78 (£6.67) | yes |
| 16 | Mileage Log Book: Compact 5 x 8 … for UK Business Journeys: Glove Box … | A16 | 2026-10-21 | 0 | USD 8.78 (£6.67) | yes |
| 17 | Mileage Log Book: Vehicle Mileage Tracker To Record And Track Your Daily Mileage … | B | 2024-03-19 | 16 | USD 6.57 | no |
| 18 | Work Vehicle Mileage Log Book: Odometer Record and Car Fuel Costs Tracker | B | 2022-05-05 | 18 | USD 6.55 | no |
| 19 | Vehicle Mileage Log Book: Car Tracker for Business Auto Driving Record Books for Taxes | B | 2022-03-15 | 6 | USD 6.55 | no |
| 20 | Mileage Log Book With Extra Space: Wide Ruled For Easy Recording | B | 2026-06-18 | 5 | USD 5.91 | no |
| 21 | Mileage Log Book: Vehicle Mileage Journal for Business or Personal Taxes / Automotive Daily | B | 2020-06-16 | 939 | USD 9.13 | no |
| 22 | Mileage Log Book (A5): Vehicle Mileage log book for taxes / Auto Mileage Tracker | B | 2023-05-14 | 2 | USD 3.93 | no |
| 23 | Mileage Log Book A5: Keep Track of Your Vehicle Mileage & Gas Expense … | B | 2022-03-21 | 3 | USD 6.55 | no |
| 24 | Mileage Record Book: Auto Mileage Tracker To Record / Mileage Log Book For Taxes | B | 2022-05-10 | 2 | USD 5.33 | no |
| 25 | Mileage Log Book: For Business & Personal Mileage | B | 2026-08-14 | 0 | USD 11.16 | no |
| 26 | Vehicle Mileage Log Book for Taxes / 6" x 9" / 100 Pages | B | 2023-02-05 | 13 | USD 6.55 | no |
| 27 | Mileage Log Book: Auto Mileage Tracker To Record And Track Your Daily Mileage For Taxes | B | 2021-03-04 | 2 | USD 4.16 | no |

Reading: the ratings sit with titles from 2020–2023 (939, 526, 50, 18, 16, 16, 13). The nine 2026 titles that name HMRC
or the UK hold 0–2 ratings each (median 0), four of them published in the last six weeks, one (row 9, 11-08) already the
shape this spike proposed — postcode journey log, running 10,000-mile total, 6 April year. Ratings are a weak proxy for
sales (perhaps one in 50–100 buyers rates a log book), so this shows a crowded, recently flooded shelf rather than proving
no sales; BSR would have, and could not be read.

## 2. KDP, in its own words (read 2026-11-21)

**Low-Content Books (GGE5T76TWKA85DJM):**
- "A low-content book has minimal or no content on the interior pages. Low-content books are generally repetitive, and
  designed to be filled in by the user." Examples listed as low-content include "Log books (i.e., tracking habits,
  activity, thankfulness)".
- "Low-content books do not require an ISBN … Low-content books are not eligible for the free KDP ISBN."
- "Under Categories you need to check the Low-content box. Please note that if you do not select this box, or select a
  different box, your book will be rejected."
- Switched off: "we don't currently offer Release Date for low-content books"; "Expanded Distribution is not supported
  for low-content books"; "The sample and the back cover thumbnail are currently not supported for low-content books
  published without ISBN" (A+ Content images are the suggested substitute); "Low-content books are not eligible for
  creating a series"; the ISBN choice "cannot [be changed] after you've published".
- No limit on the number of titles is stated on the page.

Our book is not clearly low-content: a rates page, a how-to-claim page and year-end worksheets are content, but ~100 of
110 pages are repeated journey rows, so it would be published as low-content, without an ISBN, with no Look Inside —
which matters on a shelf where buyers compare interiors.

**Content Guidelines (G200672390):** "We require you to inform us of AI-generated content (text, images, or
translations) … You are not required to disclose AI-assisted content." "If you used an AI-based tool to create the actual
content … it is considered 'AI-generated', even if you applied substantial edits afterwards." Decision for any upload:
the rates page, the instructions and the listing copy are written by Claude, so **Text: AI-generated**; the interior and
cover are drawn by code Claude wrote, declared the same way as the Kindle guide (`ventures/tax-workbook/KINDLE.md`:
"Images: none AI-generated" for a code-drawn cover) — the owner's answer should match that book's.

## 3. The sum (110 pages, black ink, regular trim, amazon.co.uk)

From the paperback spike (`kdp-paperback-tax-guide.md` §1): print cost £1.93 fixed for 24–110 pages; royalty 50 % of list
at or below £7.98, 60 % at £7.99 and above; a notebook carries standard-rate VAT, so the royalty is taken on the list
price less 20 % VAT.

| List (incl. VAT) | Ex VAT | Band | Royalty | less £1.93 | **Net per copy** |
| --- | --- | --- | --- | --- | --- |
| £5.99 | £4.99 | 50 % | £2.50 | | **£0.57** |
| £6.99 | £5.83 | 50 % | £2.91 | | **£0.98** |
| £7.99 | £6.66 | 60 % | £4.00 | | **£2.07** |
| £8.99 | £7.49 | 60 % | £4.50 | | **£2.57** |

The shelf prices at £4.99–6.67 for the UK titles, so the realistic band nets £0.57–0.98 a copy; at £7.99 (above all
but two UK rivals) £2.07. Twenty copies a year at £6.99 is about £20.

## 4. Call and trigger

**Park** (exchange `kdp-uk-mileage-logbook`). Reasons, in order: the 11-15 review rule holds (0 sales on the tax line's
shelves); nine 2026 UK/HMRC titles hold a median of 0 ratings, including one of this exact shape two weeks old; the
realistic price band nets under £1 a copy; and the BSR gate could not be read from the sandbox. No owner request.

Trigger: the first tax-line sale on any shelf (a Sale row in `docs/LEDGER.md` for tax-workbook) lifts the review rule;
then one relay round reads BSR for rows 1–3, 6, 7, 9, 11, 15 and 16 — product pages need a fetch that passes
amazon.co.uk's interstitial (it did not on 2026-11-21 by GET, slugged URL or RENDER), or an owner glance at three
product pages riding the next KDP sitting. Promote only if the median of those is better than 300,000 in Books.
