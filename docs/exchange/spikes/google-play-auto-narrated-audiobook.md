# Spike: an auto-narrated audiobook of "UK Sole Trader Tax 2026/27" on Google Play Books

Queue item `new-ventures/spike-google-play-auto-narrated-audiobook` (build, 2026-10-31 17:09–17:30 UTC; seeded by the same
morning's new-ventures research, which read the programme page, the policies and KDP's Virtual Voice terms — relay
`new-ventures-research-2026-10-31`). Sources this run: two fetch-relay rounds (`docs/relay/responses/play-audiobook-spike-2026-10-31`
and `-b`, pruned after 7 days) — the Partner Center *Auto-narrated audiobook narrator library* (table/10957334, 200, the full
table in the raw body), the *Auto-Narrated Audiobooks Learning Center* (answer/14160094 and answer/9955361 both resolve to it),
four GB store searches with `c=books&gl=GB` (the `c=audiobooks` form answers 404 raw, with or without `hl=en-GB`; the books
search mixes audiobook cards in, ids starting `AQAAAE`), the GB audiobooks front page, two rival audiobook listings and their
ebook siblings (price, pages, duration, narrator, publisher, dates are all in the raw body). The count of what a voice would
read badly is computed from the Kindle edition's content module (`ventures/tax-workbook/src/kindle/content.ts`, 9,102 words in
17 sections) with a throw-away script, not estimated. The live date comes from today's KDP mail (14:32 UTC, INBOX): the Kindle
guide is live and enrolled in KDP Select.

The question the morning left open: which en-GB voices exist, what rival UK tax titles the GB audiobook shelf sells and at
what price, how the guide's tables sound read aloud, the net per copy at 52 %, and the date.

## 1. Google's terms (primary pages, read 2026-10-31)

| Page | What it says |
| --- | --- |
| Narrator library (table/10957334) | "over 50 narrators"; **four British English voices: Alistair (male, 46–60), Anya (female, 46–60), Archie (male, 60+), Ava (female, 31–45)**; twelve American, three Australian, five Indian English voices; samples are audio only (not readable). "From time to time, narrators may be removed." |
| Learning Center (answer/14160094) | create auto-narration if you own the audio rights, the ebook is an English .epub and **"your account offers the ebook on Google Play"**; publishers based in the United Kingdom are in the country list; the editor can find text, add or remove a section from narration, edit the table of contents, check and adjust pronunciation, change voice and speed, add pauses; then "generate and review", fix errors, cover, distribute. |
| Programme policies (answer/10013009, read 10-31 am) | no programme fee during the beta; the files can be downloaded and sold elsewhere if also for sale on Play in every such country and never cheaper elsewhere; previews: 10 % of runtime for a book between 10 and 300 minutes; refunds within 7 days reverse the sale; reports show list price at sale, revenue share and ISBN; no list-price floor is stated except US$1 for mature content. |
| Programme page (play.google.com/books/publish/autonarrated, 10-31 am) | **52 % revenue share**; "for a limited time, there's no charge"; "titles that rely heavily on images, **tables**, or data graphics are also not ideal targets"; conversion "in under 2 hours". |
| Upload & sell audiobooks (answer/14164701, 10-31 am) | the direct audiobook programme is "limited to select publishers in" twelve countries including the United Kingdom; no price floor on the page (the spike's pre-read guessed one). |

Nothing on these pages asks for anything beyond the Partner Center account that `google-play-listing` already needs: the
same sign-in, the same payments profile, the ebook already on Play.

## 2. The GB shelf (rival titles, read 2026-10-31)

Four searches and the audiobooks front page: 35 audiobook cards in the tax searches, **two of them UK tax guides** — both
AI-narrated through this programme by small publishers in the last six weeks, both with an American voice:

| Title | Author / publisher | Ebook (Play, GB) | Audiobook (Play, GB) | Narration | Rating |
| --- | --- | --- | --- | --- | --- |
| *Self-Assessment Deadline and No Records Anywhere: Rebuilding a paper trail from bank statements, receipts and memory before the filing date* | Vera Jankowski / Fastchapters | £3.79, 162 pages, published 17 Oct 2026 | **£4.49**, 4 h 8 min, published 20 Oct 2026 | "AI-narrated by Martin (from Google)" — an American voice | 5.0 shown, count not in the body |
| *Making Tax Digital for Small Landlords: A Practical 2026–27 Guide …* | Daniel Mercer / Wish Publications | £7.99, 78 pages, published 16 Sep 2026 | **£5.49**, 1 h 39 min | "AI-narrated by Maxwell (from Google)" — American | 4.9 shown, count not in the body |
| *HMRC Tax Guide 2026: A Practical Handbook for UK Self Assessment, PAYE, VAT …* (the 10-26 rival) | Raj Kumar | £2.39 → £0.79 sale, 87 pages | **no audiobook** | — | 4.1 |
| other "tax" audiobook cards on the GB shelf | *Legal Tax Avoidance for Beginners* £16.49, *Mastering Legal Tax Avoidance* £13.49 (5.0), *Small Business* £13.58 (5.0), *Tax Strategy for the AI Age* £13.49, *Geographic Arbitrage* £14.99, *Companies House Identity Verification* £6.49, *Budgeting for Beginners UK* £1.79 | | US-law or generic titles; the UK ones are £1.79–6.49 | | |

What the shelf says: the move this spike describes is already being made on this shelf by two publishers whose names
(Fastchapters, Wish Publications) and six-week-old dates look like the same pipeline — an AI-written UK tax ebook plus its
Google-narrated audiobook. Their audiobook prices sit at **£4.49–5.49, 0.7–1.2 × the ebook price**, for 1 h 39 min to 4 h
8 min of audio. Rating counts are not in the raw body, so whether either has sold is unknown; no UK tax audiobook on this shelf
uses a British voice.

## 3. What a voice would read badly (counted from the content module)

| Reading | Count | Where it bites |
| --- | --- | --- |
| Words | 9,102 in 17 sections | ≈ **55–65 minutes** of narration at 140–165 words a minute — shorter than both rivals (99 and 248 min), so the preview is ≈ 6 min (10 %) |
| Tables | **11 tables, 88 body rows, 198 cells** | ch. 2 "the numbers on one page" (2 tables, 21 rows), ch. 12 box-by-box (17 rows), ch. 13 the complete year (15 rows), ch. 5 expense boxes (9), ch. 11 MTD timetable and quarters (7), ch. 8/10 bands and payments (6 each), ch. 6 mileage (4), ch. 9 NI (3) — a voice reads a row as "Item, pipe, 2026/27, pipe …" or drops it |
| Pound amounts | 222 (ch. 8: 46, ch. 13: 36, ch. 9: 24, ch. 2: 22, ch. 7: 21) | fine in prose ("twelve thousand five hundred and seventy pounds"); unreadable as table cells |
| Tax-year forms "2026/27" | 50 | read as "twenty twenty-six slash twenty-seven" unless the pronunciation editor is told "2026 to 27" once |
| Pence forms "45p" | 20 | usually read "forty-five p" — acceptable, better as "pence" |
| Abbreviations | HMRC 42, MTD 15, UK 7, gov.uk 7, SA103S 6, VAT 5, NI 5, PAYE 4, UTR 3 | HMRC/UK/VAT spell themselves; **SA103S, MTD, UTR, NI, PAYE** need a pronunciation each (the editor supports this); gov.uk ×7 is a URL list |
| Form-box references "Box 20" | 31 (ch. 5: 16, ch. 13: 5, ch. 4 and ch. 12: 3 each) | meaningless without the form in front of the listener; ch. 12 is a box-by-box walk |
| Symbols × − ≈ | 9 | words in a spoken edition |
| "the table below/above" | 5 | must become "the figures that follow" |
| Chapter cross-references | 25 | fine ("chapter ten") |
| Em dashes | 106 in 385 sentences | pauses — fine |
| Long parentheticals (25+ chars) | 28 | fine at this density |
| Sources section | 49 numbers, 7 gov.uk URLs, 13 pound amounts | a read-aloud reference list; drop to one sentence |

So the morning's "a shelf without a build" is wrong by one small build: **a spoken edition of the EPUB** — the `table()` helper
rendering each row as a sentence under a `spoken` flag ("The Personal Allowance is £12,570, frozen until April 2031"), the
ch. 12 box walk condensed to the five boxes that carry a figure, the Sources section cut to a sentence, "2026/27" written
"2026 to 27", symbols spelled — ≈ 0.3 day with a test that the spoken build has no `<table>` and no URL, built from the same
content module so the two editions cannot disagree. The Learning Center says the narration source may be "a new epub" as
long as the account offers the ebook, so the spoken EPUB is uploaded for narration beside the listed one. The Partner Center
work (choose Ava or Alistair, fix the five pronunciations, listen to the 6-minute preview, price, publish) is ≈ 10 owner minutes
after the ebook is live there.

## 4. Net per copy at 52 %

Google pays 52 % of the list price. UK VAT on an audiobook is the standard 20 % (the zero rate for e-publications covers the
ebook, not audio), so the list a GB buyer sees carries VAT and the share is read on the price net of it; the gross-of-VAT
figure is the ceiling if the Partner Center's "Effective prices" table turns out to apply the share before tax.

| Buyer price (GB) | List net of 20 % VAT | **52 % net per copy** | if paid on the gross price | Beside |
| --- | --- | --- | --- | --- |
| £4.49 | £3.74 | **£1.95** | £2.33 | the rival at 4 h 8 min |
| £5.49 | £4.58 | **£2.38** | £2.85 | the rival at 1 h 39 min |
| £5.99 | £4.99 | **£2.60** | £3.11 | a round price between the rivals |
| £6.99 | £5.83 | **£3.03** | £3.63 | the item's first price |
| £7.99 | £6.66 | **£3.46** | £4.15 | |
| £9.99 | £8.33 | **£4.33** | £5.19 | |
| Kindle at £4.99, 70 % (10-26 reading) | | £2.70 | £3.47 | the ebook itself |
| Paperback at £9.99 (10-30 reading) | | £4.06 | | |

The £3 line the paperback spike used is reached only at £6.99 and above — for about an hour of narration beside a four-hour
rival at £4.49 and a 100-minute one at £5.49. At a price the shelf supports (£4.99–5.99) the audiobook nets £2.20–2.60 a
copy, under the Kindle's £2.70 and the paperback's £4.06.

## 5. The date

- Kindle live and **enrolled in KDP Select 2026-10-31** (KDP mail 14:32 UTC): the first 90-day term ends **2027-01-29**, and
  renews unless auto-renew is turned off before then (`kdp-listing-live` records both).
- `google-play-listing` (the EPUB on Play, 0.3 day + ~10 owner minutes) is blocked on that date; Google's own rule for
  auto-narration is "your account offers the ebook on Google Play", so the audiobook follows the Play ebook listing, not the
  Kindle. Earliest audiobook: **February 2027**, after the Play ebook is live and reviewed.
- KDP's Virtual Voice terms (read 10-31 am) bar audio distribution during Select only for books narrated *through Virtual
  Voice*; they do not bind a Google narration. The binding date is Google's ebook-on-Play rule, which Select forbids until
  2027-01-29 either way — same date.

## 6. Call: park, dated — re-read at the Play ebook's day-30

**Park (`google-play-auto-narrated-audiobook` in `docs/pipeline/exchange.json`, trigger: the Play ebook listing's day-30
read, ≈ March 2027).** The shelf confirms the move is possible and being made (two AI-narrated UK tax titles in six weeks,
British voices available, nothing to pay, nothing new from the owner), but the per-copy net at a price the shelf supports is
£2.20–2.60 — under the £3 line the paperback was promoted on and under the ebook it would be narrated from — and the only
evidence of audiobook *sales* on this shelf is two ratings with no counts. Three months of forced wait sit in front of it
regardless, and the reading that decides it arrives for free in that time: if the Play ebook listing sells at all in its first
30 days (the Play shelf is Amazon's 12 %), a £5.99 audiobook costing 0.3 day plus 10 owner minutes is worth adding as a
second format; if the Play ebook sells nothing, no spoken edition of it will. Promote then as a tax-workbook item (effort
0.3 day, proof = the audiobook live at £5.99 with a British voice, score ≈ evidence 1.5 × reach 1.5 ÷ (0.3 + 0.17) ≈ 5 at
weight 2), built from §3's rewrite list.

**Promote now would be right** if the rating counts on the two rivals could be read and showed sales (they are not in the raw
body; a rendered fetch of the two listings at the day-30 read may show them), or if Google published a 70 % audiobook share.
**Decline would be right** if the beta's "no charge" ended with a per-title fee above £10, or if the narrator library lost its
British voices (the page warns narrators are removed from time to time).

Nothing to read again until the Play ebook is live: the narrator table, the policies, the Learning Center and the two rival
listings are quoted above; the day-30 read re-fetches the two listings rendered for their rating counts and the GB search for
any new UK tax audiobook.
