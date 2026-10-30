# Spike: a KDP paperback of "UK Sole Trader Tax 2026/27"

Queue item `new-ventures/spike-kdp-paperback-tax-guide` (burn-down, 2026-10-30 18:31–18:50 UTC; seeded by the same
night's exchange pre-research, idea `kdp-paperback-tax-guide` in `docs/pipeline/exchange.json`). Sources: three
fetch-relay rounds this run (`docs/relay/responses/kdp-paperback-2026-10-30`, `-b`, `-c`, pruned after 7 days): KDP's
help pages *Paperback Printing Cost*, *Paperback Royalty*, *Print Options*, *Set Trim Size, Bleed, and Margins*, *Create a
Paperback Cover*, *Paperback Submission Guidelines* and *How EU and the UK Taxes Affect Print Books List Price* (all 200,
server-rendered); Taxcafe's home, business-guides, annual-guide and sole-trader-guide pages; amazon.co.uk's paperback
search raw (an Akamai interstitial, 2.4 kB) and rendered (503 — the bot wall holds against Playwright too). The page count
is computed from the Kindle edition's own content module (`ventures/tax-workbook/src/kindle/content.ts`, 9,102 words in
17 chapters). The 10-26 Kindle spike (`kdp-sole-trader-tax-guide.md`) supplies the e-book economics and the amazon.co.uk
Kindle rival table (rendered 2026-10-26, when the wall let a render through).

The question the pre-research left open: at KDP's real print cost and royalty bands, what does a 6×9 paperback of the
guide net per copy at £7.99 / £9.99 / £12.99, does the print side need anything the owner has not already done, and is
there a paying print shelf for an annual UK sole-trader tax guide?

## 1. KDP's print terms (primary pages, read 2026-10-30)

| Page | What it says |
| --- | --- |
| Paperback Printing Cost | `fixed cost + (page count × per-page cost)`. Black ink, regular trim (≤ 6.12" wide, ≤ 9" tall), **24–110 pages: fixed cost only — amazon.co.uk £1.93 a book** (£2.15 large trim); 110–828 pages £0.85 + £0.010 a page. White, cream and groundwood paper cost the same; bleed and cover finish do not change the cost. |
| Paperback Royalty | **50 % of list price at or below £7.98, 60 % at or above £7.99 (amazon.co.uk)**, less the printing cost. Minimum list price = printing cost ÷ royalty rate (KDP refuses a lower price); maximum £250. A promotional discount Amazon gives does not change the royalty. |
| How EU and the UK Taxes Affect Print Books List Price | VAT is charged on amazon.co.uk at the rate local law sets for the type of book: standard rate for notebooks, planners, children's books, books with bonus content; a prose book takes the book rate (zero in the UK), so the list price is what the buyer pays. |
| Print Options | 6" × 9" is the default regular trim; black ink on white or cream 74–90 gsm paper; **minimum 24 pages**; paper type can be switched later. |
| Set Trim Size, Bleed, and Margins | 24–150 pages: inside (gutter) margin 0.375", outside at least 0.25" (0.375" with bleed); page size with bleed 6.125" × 9.25". |
| Create a Paperback Cover | one PDF wrap: width = 0.125" + 6" + spine + 6" + 0.125", height 9.25"; spine = pages × 0.002252" (white) or 0.0025" (cream); **spine text only above 79 pages**; fonts embedded, 300 dpi. |
| Paperback Submission Guidelines | interior as PDF (or DOC/HTML, converted) with every font embedded, minimum 7 pt, images ≥ 300 dpi; cover as PDF; the free KDP ISBN or our own. |

Nothing on these pages asks for a new account, a new identity check or a card: the paperback is a second format added
to the same KDP title (the Kindle edition submitted 2026-10-29 under action 029 step 5), on the account whose tax
interview and bank details the owner completed the same day.

## 2. Our book in print

| Reading | Value |
| --- | --- |
| Words | 9,102 in 17 chapters (the longest, Expenses, 1,033; the shortest, the colophon, 221) |
| Body pages at 6×9 | 36 (340 words/page) – 38 (300 words/page) with each chapter opening on a new page, from the content module |
| Page count | **≈ 42–56** with a title page, copyright, contents and the chapter-2 and chapter-13 tables set as tables; well inside the 24–110 fixed-cost band (even 110 keeps £1.93) |
| Printing cost (amazon.co.uk) | **£1.93** |
| Minimum list price | £3.86 (£1.93 ÷ 50 %) |
| Spine | 48 pages × 0.002252" ≈ 0.11" (2.7 mm) — no spine text (under 80 pages); cover PDF ≈ 12.36" × 9.25" |

### Net per copy, amazon.co.uk (list price is the buyer's price — zero-rated book)

| List price | Royalty band | Royalty | less print £1.93 | **Net per copy** | vs the Kindle at £4.99 (70 %, 10-26 reading: £2.70; £3.47 if the UK zero rate on e-books applies) |
| --- | --- | --- | --- | --- | --- |
| £6.99 | 50 % | £3.50 | | **£1.57** | below the Kindle |
| £7.99 | 60 % | £4.79 | | **£2.86** | about the Kindle |
| **£9.99** | 60 % | £5.99 | | **£4.06** | +£1.36 … +£0.59 a copy |
| £12.99 | 60 % | £7.79 | | **£5.86** | +£3.16 … +£2.39 a copy |

The pre-research's "≈ £4 a copy at £9.99" holds exactly (£4.06); its "3–5× the Kindle price" does not — a 48-page
paperback cannot carry £14.99+ beside Kindle rivals at £3.99–9.99, and the print premium over the e-book is £0.59–1.36 a
copy at £9.99, not a multiple. The case for the format is the second buyer, not a fatter margin: a print reader does not
buy the Kindle edition.

## 3. The print shelf (rivals)

| Title | Format / shelf | Price | Pages | Evidence |
| --- | --- | --- | --- | --- |
| Taxcafe, *How to Save Tax 2026/27* (33rd edition, Nick Braun) | paperback, taxcafe.co.uk | free with any Taxcafe purchase | 150 | annualtaxguide.html, published February 2026 |
| Taxcafe, *Small Business Tax Saving Tactics* — tax planning for sole traders & partnerships (Bayley & Braun, 13th edition, ISBN 9781911020981) | paperback + PDF, taxcafe.co.uk (P&P £2.99) | not printed on the product page (order form) | 299 | small-business-tax-tactics.html, published October 2025 — a new edition every year |
| Taxcafe, *The Big Budget Tax Changes* (2nd edition, January 2026, ISBN 9781917392075) | paperback + PDF, taxcafe.co.uk | not printed on the page | 159 | budgettaxchanges.html, "brand new" after the November 2025 Budget |
| *Making Tax Digital 2026 for Sole Traders from Registration to Final Tax Return* | Kindle (paperback not readable through the wall) | £9.99 | — | amazon.co.uk render of 2026-10-26, 4.1 (34) |
| *How to prepare your UK Self Assessment Tax Return: 05 April 2026 Tax Year Edition* and the eight earlier annual editions | Kindle + paperback series since 2017 | £3.00–6.50 (Kindle) | — | the same render: 1–36 ratings an edition, every April |
| amazon.co.uk "sole trader tax 2026/27" paperback search | — | — | — | raw 2.4 kB Akamai interstitial; rendered 503 — not readable from a runner; the Kindle-side render of 10-26 is the only shelf read |

What the shelf says: an annual UK tax guide in print is a real product line — Taxcafe has sold a new edition every year
since 1999 (its prices sit in the order form, not the readable page; the 10-26 index put the sole-trader guide at £25–35) and gives a 150-page guide away to sell the others — and the
self-assessment annual series on Amazon has reached buyers every April for nine years at Kindle prices below ours. No
rival paperback under £15 for *sole-trader* tax in 2026/27 could be confirmed, because the one page that would show it
(amazon.co.uk's search) is behind a bot wall for both a plain fetch and a rendered one; the 10-26 Kindle render is the
nearest reading and it lists paperback-and-Kindle series, not paperback-only titles.

## 4. Call: promote — a second format of the same title, built after the Kindle listing is live

**Promote (`tax-workbook/kdp-paperback-edition`, ≤ 0.5 day, blocked on `kdp-listing-live`).** Net per copy at a
rival-matching price is over the £3 park line (£4.06 at £9.99, the price the MTD rival asks for its Kindle edition), the
print side needs nothing new from the owner (same KDP title and account, free KDP ISBN, ~10 minutes to upload two PDFs
and set the price), and the format reaches a buyer the e-book does not. Build shape, as the item says: the interior PDF
printed with Chromium from the Kindle content module at 6" × 9" (0.375" gutter, 0.5" outside, 11 pt serif, chapters on
a new page, running heads, page numbers, the two tables kept as tables), the wrap cover PDF from the existing cover SVG at
12.36" × 9.25" with the spine computed from the final page count, no spine text, both with fonts embedded; a build
check that asserts 24 ≤ pages ≤ 110 (the fixed-cost band and the spine formula) and the cover's width against the page
count. List at £9.99, 60 % band, white paper, no bleed; the owner adds the paperback to the live Kindle title (action
029 step 5's follow-up, no new request).

**Why not now:** KDP reviews the two formats of one title together and a title flagged on the Kindle side (the
submitted title differs from the cover's — the `kdp-listing-live` item carries the fix) would hold the paperback too;
and the proof clock on the Kindle (first sale ≤ 30 days) is the reading that says whether anyone finds the title at
all. The paperback item is dated to the Kindle's live mail, not to its sales — the earlier gate ("only if the Kindle
sells") would waste the buyers who search for a paperback first.

**Park would be right** if KDP's review declined the Kindle edition outright (then the title has a content problem to
fix before any format), or if the owner says no to a second upload. Score as a tax-workbook item: evidence 2 (a shelf
that sells annual UK tax guides in print every year, no readable count for our price point) × reach 2 (every
amazon.co.uk paperback buyer of the same title) ÷ (0.5 d + 10 owner min) ≈ **7** at weight 2.

Nothing to read again until the Kindle is live: the printing-cost and royalty pages are quoted above, the amazon.co.uk
paperback shelf is unreadable from a runner (two tries, raw and rendered), and the Kindle's own sales row is the next
signal.
