# Spike: Google Play Books as the third shelf for the UK sole-trader tax guide EPUB

Queue item `new-ventures/spike-google-play-books-tax-guide-shelf` (burn-down, 2026-10-26 17:15–18:00 UTC). Sources: the
fetch relay this run — `docs/relay/responses/ebook-shelves-2026-10-26` (the Partner Centre overview and help landing, the
Partner Centre sign-in page, the GB Play Books search for "sole trader tax 2026", the Draft2Digital FAQ and Terms, six
kobo.com pages) and `ebook-shelves-b-2026-10-26` (the Supported-countries table, the Publisher content policies, the
Revenue split FAQ, the Sales territories article, the GB search for "self assessment tax return uk"); WebSearch for the
Kobo and Draft2Digital AI rules reported second-hand. kobo.com does not answer the relay (a Cloudflare challenge, 403
plain and rendered); support.google.com, play.google.com and draft2digital.com do. The product is the finished EPUB 3
`UK Sole Trader Tax 2026/27` (tax-workbook `kdp-tax-guide-ebook`, 2026-10-26 01:30; epubcheck clean, 1600×2560 cover,
KDP metadata in `src/kindle/kdp.ts`), which waits on the owner's KDP upload (action 029 step 5).

## 1. The shelf's terms (Google's own pages, read 2026-10-26)

| Source | What it says |
| --- | --- |
| Supported countries for selling books on Google Play (`table/6052428`) | The United Kingdom row: `GB`, `GBP`, a tick in every column — seller sign-ups, promo codes, audiobook creation, purchases "(eBook and audiobook)", payments. A UK individual can open the seller account and be paid to a UK bank account in GBP. |
| Revenue split FAQs (`answer/9331459`) | "Google Play Books offers a 70% revenue split on eBook sales in most Google Play Books supported countries for partners who accepted our updated Terms of Service (TOS), introduced in 2019"; "You'll earn 70% of the list price on eBooks sold to customers in 60+ Google Play Books supported countries"; "Google doesn't charge fees related to this 70% revenue split"; the old price bands are gone; "The 70% eBook revenue split doesn't have a planned end date". Partners who have not accepted the TOS stay on the 52 % default. |
| Partner Centre overview (`answer/3244021`) | "Sign in with your existing Google Account, or create a new one"; "you must be at least 18 years of age and of legal age in your country to form a binding contract with Google". No company, ISBN or publisher registration is asked for on the page. |
| Sales territories (`answer/3157463`) | A book needs an active sales territory and a local price; territories choose which payment profile collects the revenue; a book can be listed for countries the Play Store does not yet serve. |
| Publisher content policies (`answer/1067634`) | Bars content that is "spammy, misleading, provides a poor user experience or contains malware", "gibberish, nonsensical or repetitive text that provides no narrative or educational value", metadata "confusingly similar to existing Books", and "low-quality, unclear machine-read audio". **No rule on AI-written text** — KDP asks for a disclosure at publication; Google asks for nothing beyond quality and honest metadata. |
| Partner Centre sign-in (`play.google.com/books/publish/`) | A 73 kB sign-in shell; no "not accepting new publishers" notice (the 2015–2018 pause is over). The payments-profile and tax-form steps sit behind the login and are the owner's to read (section 4). |

## 2. Demand on the GB shelf (rendered 17:25 UTC, two searches)

Search cards show title, star average and price; no rating counts or publishers on the card.

| Title (as listed) | Price | Stars |
| --- | --- | --- |
| THE 2026 TAX REVOLUTION: A GUIDE TO MAKING TAX DIGITAL | £7.99 | 5.0 |
| HMRC Tax Guide 2026: A Practical Handbook for UK Self Assessment, PAYE, VAT, and Small Business Compliance | £2.39 | — |
| The Accountant's Handbook to Making Tax Digital for Income Tax: Tax Rules, Practice Workflows, and Pricing Strategies | £9.99 | — |
| Making Tax Digital for Small Landlords: A Practical 2026–27 Guide … Landlords With 1–3 Properties | £7.99 (also £5.49) | — |
| a sole trader's guide to irregular income — tax, savings, invoicing, "without an accountant's price tag" | £5.49 | — |
| … 2026: The Complete Practical Blueprint for HMRC, DTAA, Self Assessment & Cross-Border Wealth Planning | £2.29 | 5.0 |
| The Telegraph Tax Guide 2026: Your Complete Guide to the Tax Return for 2025/26, Edition 50 (Kogan Page) | £19.99 | — |
| Tax 2010/2011 For Dummies, UK Edition | £11.99 | 4.0 |

Seven current UK tax guides are priced between £2.29 and £19.99, the self-published MTD titles at £2.39–9.99 — the
same band the KDP spike read on amazon.co.uk (£3.99–9.99), so a £4.99 list price sits inside the shelf's norm. What the
cards do not show is volume: no review counts, no sales rank. The one proxy is that the self-published 2026 MTD guides
exist on this shelf at all — their authors found it worth a Play listing beside Kindle.

## 3. The two alternatives read in the same pass

| Shelf | Read | Call |
| --- | --- | --- |
| Kobo Writing Life | kobo.com answers the relay with a Cloudflare "Just a moment…" page (403 on `/writinglife`, `/writinglife/faq`, `/writinglife/terms`, `/writinglife/pricing` and both GB searches, plain and rendered); help.kobo.com only says KWL is "the free self-publishing portal". Second-hand (The Next Web, 2026-06-26, quoting the CEO): KWL rejected 45 % of its 2025 submissions, more than 80 % of them judged AI-generated; a third-party compliance guide quotes Kobo's help page listing "wholly or partly AI-generated content" as a rejection ground, with no disclosure route. | **Declined** (`kobo-writing-life-shelf`): the guide is AI-written and says so; a shelf that rejects the fact rather than asking for the disclosure is not a shelf for it. Re-open on a KWL policy read from kobo.com that accepts disclosed AI-written nonfiction. |
| Draft2Digital (Apple Books, B&N, Kobo, OverDrive, Hoopla …) | FAQ: "approximately 10% of the retail price of every book sale"; "a non-refundable, one-time activation fee of $20 (USD) for new accounts and an annual maintenance fee of $12 (USD) for accounts that earn less than one-hundred dollars a year"; "Draft2Digital is required to withhold 30% income tax for all international publishers" (a treaty form reduces it); payouts monthly at US$10–20 thresholds by PayPal or international deposit; and "**Draft2Digital does not accept noncredentialled nonfiction content produced by AI** and may require further documentation of subject matter expertise". | **Declined** (`draft2digital-wide-distribution`): the AI-nonfiction rule bars the guide outright and the fee shape fails the £0 rule for a line with no sales yet. Re-open on a credentialled co-author or a dropped rule. |

## 4. Fit, economics and what stays unread

Zero build: the EPUB, the cover and the description, keywords and categories in `kdp.ts` are the listing; a
`src/kindle/google-play.ts` export (title, description, categories, £4.99 GBP for territory GB, the AI authorship stated
in the description as on KDP) is ~0.2 day and keeps the two shelves' copy in one place. At 70 % of £4.99 the shelf nets
£3.49 a copy before VAT (the "Effective prices" table in each book's Pricing section shows the VAT treatment after
sign-in). Reach: Play Books is preinstalled on Android and the GB storefront sells in GBP, but Amazon holds roughly 88 %
of UK ebook sales, so this shelf is a second door, not a second market.

**The constraint the KDP spike created:** `kdp.ts` enrols the guide in KDP Select ("Countdown Deals require it; the book
is not sold as an ebook anywhere else"). Select is a 90-day digital exclusivity term — while the book is enrolled, the
ebook may not be sold on any other shelf, Google Play included. So the Play listing cannot go up on the owner's first
KDP sitting without giving up the Countdown Deal launch price; it goes up after the first 90-day term ends (the owner
can decline to renew), or at once if the owner declines Select. On Amazon's ~88 % UK share, the launch price on the big
shelf is worth more than an early listing on the small one.

Unread behind the login: whether the payments profile accepts an individual without a business registration (the
countries table says sign-ups and payments are open to GB; the form's fields are not public), and the tax-form step (a
UK individual on Google's Irish entity is normally a self-certification, no US withholding). Both are ten minutes of the
owner's time when the item unblocks.

## 5. Call

**Promote, dated after the KDP Select term — not a step of the owner's sitting now.** Google's own pages answer the
questions that parked Kobo and D2D: the United Kingdom is ticked for seller sign-ups and GBP payments, the split is
70 % of list with no fees, and the content policies ask for honest metadata and quality rather than banning AI-written
text. Seven priced UK tax guides for 2026 already sell on the GB shelf in the £2.29–9.99 band. Score ≈ evidence 1.5 ×
reach 2 ÷ 0.3 days ≈ 10, recorded as 6 because the shelf shows no review counts and Amazon holds the UK market. Queued:
tax-workbook `google-play-listing` (6 × 2) — the `google-play.ts` export, a Play section in KINDLE.md and action 029
step 6 (~10 min, £0) when it unblocks — **blocked on the KDP Select exclusivity**: `kdp-listing-live` dates it live + 90
days when it records the ASIN, or the owner declining Select unblocks it at once. Park trigger: the KDP day-60 read
shows zero sales (then no second shelf until the first one reads), or the payments profile demands a business
registration.
