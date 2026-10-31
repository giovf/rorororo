# Spike: Leanpub as the shelf for the Claude Code operations kit

Queue item `new-ventures/spike-leanpub-claude-code-kit` (burn-down, 2026-10-31 17:10–17:50 UTC; seeded by the same
morning's new-ventures research, exchange idea `ai-setup-course`, parked 2026-10-29 for want of a channel). Sources: three
fetch-relay rounds (`docs/relay/responses/new-ventures-research-2026-10-31` lines 12–17 — the terms, the royalty, author,
AI-slop and AI-disclosure help articles and the *No AI Slop!* blog post; `leanpub-kit-2026-10-31` — *How and when do you
pay royalties*, *Free, Standard and Pro author memberships*, the help-centre searches for payout countries and the Shelf,
and `/authors` with the live membership prices; `leanpub-kit-b-2026-10-31` — the bookstore searches at the real route
`/store?search=…`, the API docs, the supported-countries, Shelf and marketing-package articles; all pruned after 7 days).
The 10-19 spike (`ai-setup-course-rivals.md`) supplies the Gumroad and Udemy rival table; the 10-24 spike
(`gumroad-shelf-uk-seller.md`) the reason the kit was parked (Gumroad's Discover lists a product only after US$100 of
direct sales, so the shelf gave no first buyers).

The question: does Leanpub's catalogue hold buyers for a Claude Code operations book, at what reader counts and prices,
what does a sale net, what is the product's honest shape there, and does a text drafted by this operation and curated by
the owner pass Leanpub's human-curated rule?

## 1. The shelf's terms (primary pages, read 2026-10-31)

| Page | What it says |
| --- | --- |
| Terms (`/terms`, Ruboss Technology Corporation, BC, Canada) | **Royalty 80 % on purchases of US$7.99 and up; 80 % minus a 50¢ flat fee between $0.99 and $7.98.** Minimum paid price for a book $0.99 (a bundle, course or track $7.99); the author sets a minimum and a suggested price and the reader chooses between them (or above). Payouts in USD by **Wise (default, minimum $100) or PayPal (minimum $20)**; Wise's sending cost is deducted from the royalty, PayPal fees are usually covered by Leanpub. **60-day reader refund ("Happiness Guarantee") → a 60-day royalty hold**; the royalty is paid on the 7th of the month after the hold ends (a May 16 sale pays August 7). No exclusivity, no price-matching: "publish your book on as many platforms as you like, and charge whatever you like". **"AI agents are not permitted to accept these Terms."** Partner Program (default opt-in): partners such as Learnerbly resell at the ordinary royalty via coupons. Abandoned accounts with unpaid royalties lose $10 a year. |
| Extras and Packages (terms, definitions) | **Extras** are "supplementary digital files offered alongside a principal Product … source files, code samples, apps, templates, worksheets or similar content"; they **may not include services or software licences**. A **Package** is the book plus one or more Extras and/or N copies, sold as one purchase at its own price — so a book-only tier and a book-plus-kit tier are native. |
| The Shelf and newsletters (terms; `/authors`) | A paid **Placement** on the homepage bookshelf ("Shelf Spot") for a week or a month, currently including the weekly and monthly sale newsletters; non-refundable; a month is "a $179 value" (the Max membership prices it so). Leanpub may also show other books' adverts on our pages. Unpaid royalties can be spent on a Shelf spot (help 5022608, 7338022). |
| *How and when do you pay royalties* (help 110527, updated 2026-06-27) | "Up to 80 %"; paid on the 7th of each month (earlier if a weekend/holiday); new authors are held in "layaway" until a payout method is chosen; the 60-day hold explained with the May→August example; minimums $20 PayPal / $100 Wise, author may set a higher one. |
| *Royalty rate and restrictions* (help 5468013) | 80 % on most sales; no exclusivity or price-parity rule; the generated PDF/EPUB can be sold anywhere. |
| *AI Slop is Not Permitted* (help 11853585, 2025-07-26) and *No AI Slop!* (blog, 2025-07-31) | Leanpub "very much encourage[s] the use of AI by authors"; the published work must be **"human-curated and of good quality"**; AI slop — judged by eye, "you know it when you see it" — and "AI-automated processes for the production of large numbers of books" are banned, the usual action is **permanent suspension of every associated account**, and the rule covers profiles, forum posts and author messages too. "We don't permit AI agents to use Leanpub. Leanpub books and courses should all be human-created and human-curated, and enhanced or transformed by AI tools with human guidance." |
| *AI usage disclosure* (help 9363893, 2024-05-22) | Each book has an **AI Usage page** (`/BOOK/settings/ai`); today it feeds Leanpub's Publish-on-Amazon service and **is not shown to readers** — "we do plan to add a feature… to display information in the book". A reader-facing disclosure has to be written into the book itself. |
| *Author memberships* (help 3691778, 2026-01-16; `/authors`, live prices) | Writing and selling need **no membership**: a free user gets three books and one course, PDF/EPUB upload or the in-browser editors, coupons, bundles and packages, and the same 80 % royalty, with **5 previews or publishes a month** (the January help article still says 20). Paid plans: Mini $8.99/mo (100 books, 20 publishes), Light $13.99 (unlimited publishes, custom themes, print PDF), Pro $18.99 (GitHub/Dropbox sync, Google Analytics, the API), Max $32.99 (two Shelf months a year), Ultra $89.67. Quarterly billing, lifetime plans exist. |
| *Supported countries for royalty payments* (help 6029922) | No list of its own: "we pay author royalties via either Wise or PayPal" and the author checks those two services' own country pages; the method is chosen on the royalties settings page after the first book exists, Wise by default. The UK is served by both (the owner already holds the PayPal that pays the PayPal sandbox credit packs), so the UK question the item asked is answered by the payout rails, not by a Leanpub list. |
| *What's the Shelf* and *How many users does Leanpub get* (help 1615745, 5196744) | The Shelf is the bookshelf near the top of the homepage, also shown on every post-purchase thank-you page; spots are bought at `/shelf/buy` once a published book exists. Leanpub's own audience figures (2025-02-07): **about 165,000 monthly active users, but most traffic lands on book pages directly — the homepage with the Shelf gets about 40,000 page views a month**; the Weekly Sale newsletter has over 100,000 subscribers and the Monthly Sale over 150,000. Since 2021-04-30 every Shelf spot is bundled with a newsletter spot because the newsletter's coupon makes its sales measurable and the Shelf's are not. |
| *Marketing packages for authors* (help 10339186) | Two packages (2025-02-19): **1 week on the Shelf + 1 Weekly Sale newsletter US$129; 1 month on the Shelf + 1 Weekly + 1 Monthly Sale newsletter US$199**, payable from unpaid royalties. Over the £100 cap as cash, and only worth it once organic sales exist to compare against. |
| API docs (`/help/api`) | Every call carries `api_key` (create, preview, publish, unpublish, job status, book summary, interested readers); the key comes with the Pro membership ($18.99/mo). No keyless bookstore or sales endpoint. Irrelevant for us anyway: the terms bar AI agents from the service, so this operation never calls it — the owner publishes by hand. |

Nothing here asks the owner for an identity check or a card: an email sign-up, the existing PayPal (or a Wise account at the
first payout) and the book's AI Usage page. What it does ask is that the owner, not this operation, holds and operates the
account — every publish, price change and sales read is a human session (the API is a Pro feature and the terms bar agents).

## 2. The comparable books on Leanpub's own shelf (bookstore search, rendered 2026-10-31)

Leanpub's bookstore search (`/store?search=…`, server-rendered; the `/bookstore/book?search=` route the morning
tried answers 404 raw and rendered) shows six books, six bundles and five courses per query behind a *Show more* button;
the Books tab (`/store/books?search=claude%20code`) lists 15 Claude Code books on its first page and 15 more on the
second (translations of the same guides into nine languages, a cheat sheet, a Spanish edition of the De Vos book). Every
book landing page carries `totalCopiesSold` in its page data even though every author here has `showNumReaders` off, so
the "reader count" the item asked for is the shelf's own sales count, read from 31 pages (the figure counts free
downloads too — relevant for the pay-what-you-want books).

### "claude code" — paid books (31 pages read, 2026-10-31)

| Book (slug — title) | Author | Min / suggested price | **Copies sold** | Pages | Words | Created | Last published |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `claude-code-building-production-agents-that-actually-work` — Claude Code: Building Production Agents That Actually Scale | Thomas De Vos | $14.97 / $32.99 | **530** | 538 | 138628 | 2026-04-21 | 2026-10-13 |
| `claude-code-modernization` — Claude Code for Legacy Modernization | Thomas De Vos | $18.99 / $40 | **111** | 830 | 181940 | 2026-08-17 | 2026-10-01 |
| `masteringclaudecode` — Claude Code: From Basics to Mastery | Steve Publications | $25.00 / $35 | **116** | 210 | 49766 | 2026-06-19 | 2026-10-13 |
| `claude-code` — Claude Code Masterclass | Luca Berton | $14.99 / $19.99 | **81** | 107 | 19095 | 2026-05-29 | 2026-07-04 |
| `claude-code-safety` — Claude Code Safety: Stop Your AI Agent from Destroying Your Work | yurukusa |  / $9.99 | **39** | 68 | 20251 | 2026-06-18 | 2026-09-15 |
| `claude-code-for-net-developers-the-definitive-guide` — Claude Code for .NET Developers | Michel Banagouro | $19.00 / $29 | **21** | 238 | 44970 | 2026-05-08 | 2026-06-15 |
| `claudecodehandbookforsoftwareengineers` — Claude Code Handbook for Software Engineers | Steve Publications | $25.00 / $35 | **20** | 180 | 30324 | 2026-09-28 | 2026-10-28 |
| `claude-code-agents-md-interop` — Claude Code AGENTS.md Interop Handbook | yurukusa | $9.99 / $12.99 | **13** | 49 | 0 | 2026-06-04 | 2026-09-20 |
| `claude-code-migration-playbook` — Claude Code Migration Playbook | yurukusa | $11.99 / $12.99 | **11** | 251 | 0 | 2026-06-03 | 2026-08-28 |
| `claude-code-safety-mastery` — Claude Code Safety Mastery | yurukusa | $9.99 / $12.99 | **11** | 73 | 160 | 2026-06-03 | 2026-09-24 |
| `claude-code-token-savings` — Cut Your Claude Code Token Usage in Half | yurukusa | $9.99 / $12.99 | **11** | 89 | 0 | 2026-04-17 | 2026-09-19 |
| `claudecodepocketguide` — Claude Code Pocket Guide | Steve Publications | $19.00 / $29 | **1** | 125 | 24196 | 2026-10-30 | 2026-10-30 |
| `claude-code-web-developers-field-guide` — Claude Code for Web Developers | Gianluca Raponi | $29.00 / $29 | **1** | 34 | 0 | 2026-10-12 | 2026-10-12 |
| `claude-code-for-beginners` — Claude Code for Beginners | SouthStone Publications | $19.00 / $29 | **0** | 71 | 0 | 2026-08-17 | 2026-08-17 |
| `claudecodeaicodingagentspracticalworkbook` — Claude Code & AI Coding Agents Practical Workbook | Dr. Mapesho Chibata | $14.99 / $19.99 | **0** | 61 | 0 | 2026-09-19 | 2026-09-19 |

Free or pay-what-you-want:

| Book (slug — title) | Author | Min / suggested price | **Copies sold** | Pages | Words | Created | Last published |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `claude_for_dx` — Claude Code for Developer Experience | Artem Mukhin | Free! / $15 | **327** | 93 | 0 | 2026-03-09 | 2026-03-09 |
| `claude-code-guide-en` — Claude Code | Maurizio Pelizzone | Free! / $6 | **194** | 190 | 2490 | 2026-05-06 | 2026-05-06 |
| `claudecode-guia-no-oficial` — Claude Code - Guía no oficial | Óscar Bustos | Free! / $13 | **98** | 38 | 9771 | 2026-07-23 | 2026-07-27 |
| `claude-code-guide-it` — Claude Code | Maurizio Pelizzone | Free! / $6 | **46** | 189 | 0 | 2026-05-03 | 2026-05-05 |

Bundles (yurukusa's operations handbooks, the shape closest to our kit — what Claude Code costs, the guards to install,
what to do when a release changes the rules, AGENTS.md interop; a bundle page carries no sales count):

| Book (slug — title) | Author | Min / suggested price | **Copies sold** | Pages | Words | Created | Last published |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `b/cc-operators-library` — Claude Code Operator's Library | yurukusa | $29.00 / $39 | **—** | 89 | 0 |  |  |
| `b/cc-operators-complete` — Claude Code Operator's Library: Complete Edition | yurukusa | $39.00 / $49 | **—** | 251 | 0 |  |  |

### "ai agents" (six books the search surfaces)

| Book (slug — title) | Author | Min / suggested price | **Copies sold** | Pages | Words | Created | Last published |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `aiagentsandsystemsengineering` — AI Agents and Systems Engineering | Steve Publications | $25.00 / $39 | **8** | 233 | 52975 | 2026-09-05 | 2026-10-05 |
| `ai-agents-engineered` — AI Agents, Engineered | Enrique Gutiérrez | $24.99 / $39 | **2** | 500 | 0 | 2026-10-04 | 2026-10-09 |
| `aiagentsforscientistsandengineersapracticalguide` — AI Agents for Scientists and Engineers: A Practical Guide | Kompri Kompri | $15.00 / $29 | **2** | 110 | 0 | 2026-10-08 | 2026-10-08 |
| `ai-agents-with-langchain-and-langgraph` — AI Agents with LangChain and LangGraph | Muhammad Saud | $5.99 / $5.99 | **1** | 286 | 0 | 2026-10-29 | 2026-10-29 |
| `ai-agents-in-a-cage` — AI Agents in a Cage | Cleiton Augusto Correa Bezerra | $19.00 / $29 | **0** | 170 | 0 | 2026-10-20 | 2026-10-21 |
| `ai-agents-agentic-work-flows-in-production` — AI Agents & Agentic Workflows in Production | Mohammad Kamrul Hassan | $10.99 / $26 | **0** | 664 | 0 | 2026-09-17 | 2026-09-23 |

### "cursor" (four of the six)

| Book (slug — title) | Author | Min / suggested price | **Copies sold** | Pages | Words | Created | Last published |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `masteringcursor` — Mastering Cursor | CAIO INCAU | $10.00 / $15 | **10** | 97 | 0 | 2026-05-25 | 2026-05-25 |
| `the10xdeveloperscursorplaybook` — The 10x Developer's Cursor Playbook | Steve Publications | $19.00 / $29 | **2** | 179 | 40558 | 2026-06-19 | 2026-07-30 |
| `buildingaiagentswiththecursoragentsdk` — Building AI Agents with the Cursor Agent SDK | Steve Publications | $25.00 / $35 | **0** | 189 | 30539 | 2026-10-29 | 2026-10-29 |
| `cursor_app_guidebook` — cursorアプリ開発 すみからすみまで完全ガイドブック | reodesuxz | $19.00 / $29 | **0** | 19 | 1404 | 2026-05-02 | 2026-05-02 |

What the shelf says, in numbers: the two Thomas De Vos books have sold **530 and 111 copies** at US$15–40 (≈ 85 and 45 a
month since April and August), Steve Publications' *From Basics to Mastery* **116** at $25–35 since June (≈ 26 a month),
Luca Berton's Masterclass **81** at $15–20, and the free guides 98–327 downloads each. The books with our kit's shape —
yurukusa's four operations handbooks at $9.99–12.99 — have sold **11–13 copies each in about five months** (≈ 2–3 a
month), plus **39** of the pay-what-you-want *Claude Code Safety*; the two bundles that collect them list at $29–49. The
rest of the shelf is single digits: *Pocket Guide* 1 (published yesterday), *Web Developers* 1, *for Beginners* 0 in ten
weeks, *Practical Workbook* 0 in six, and the six "ai agents" books 0–8 (the 8 is Steve Publications' catalogue again).
Prices cluster at **$19–25 minimum / $29–39 suggested** for a 150–250-page guide; readers pick the price, so the realised
average sits nearer the minimum. A Claude Code book on Leanpub is a real paying line for an author with a catalogue or a
538-page flagship; a single operations handbook from an unknown author is a US$100–300 line over six months.

## 3. Net per sale

Leanpub is the seller of record (Ruboss, Canada); the royalty is 80 % of what the reader pays at or above US$7.99, nothing
else is deducted per sale, and the only per-payout costs are Wise's transfer fee (deducted) and PayPal's conversion
spread. GBP at 0.77 (the 10-29 ledger rate).

| Reader pays | Royalty | **Net per sale** | ≈ GBP | Gumroad direct (10-24 read: 10 % + 50¢ + 2.9 % + 30¢) | Gumroad Discover (30 %) |
| --- | --- | --- | --- | --- | --- |
| US$19 | 80 % | **US$15.20** | £11.70 | US$15.75 | US$13.30 |
| US$29 | 80 % | **US$23.20** | £17.86 | US$24.56 | US$20.30 |
| US$39 | 80 % | **US$31.20** | £24.02 | US$33.37 | US$27.30 |

Per sale Leanpub pays slightly less than a Gumroad *direct* sale and more than a Discover sale; the difference that matters
is not the rate but the channel: Leanpub lists a published book in its bookstore and its topic pages from day one, Gumroad's
Discover only after US$100 of sales we would have had to bring ourselves. The costs on top: the 60-day hold (first money
no earlier than ~70 days after the first sale), the $100 Wise / $20 PayPal payout floor, and VAT/sales tax handled by
Ruboss as seller (not read on these pages; nothing on the terms puts it on the author).

## 4. The product on Leanpub

The item's proposed shape — a short book plus Extras — is native to Leanpub and the shelf prices it for us:

| Element | Shape | Why |
| --- | --- | --- |
| The book | *Running Claude Code unattended: the operations handbook of a self-running software business* — 20–30k words (150–200 pages at Leanpub's technical theme), built as EPUB + PDF from a content module the way the Kindle guide is (`ventures/tax-workbook/src/kindle/`), uploaded finished | The shelf's $19–35 books are 125–250 pages; yurukusa's 49–89-page handbooks sit at $9.99–12.99. Leanpub's "publish early, publish often" loop is closed to us (each publish is an owner session), so the book ships complete. |
| The Extras (one Package tier) | a zip: `CLAUDE.md`, the routine prompts (`docs/routines/*.md`), the pipeline and claim scripts, the slot and watchdog scripts, the fetch-relay workflow and script, the pre-push hook, a `docs/ops` starter — MIT-licensed, scrubbed of anything venture-specific | Extras "may include … source files, code samples, apps, templates, worksheets", not services or licences; a Package lets the book sell alone at the minimum and with the kit at the suggested price. The files already exist and are the one thing no rival on the shelf has: six weeks of a real unattended operation. |
| Pricing | minimum **US$19** (book alone), suggested **US$29** (book + kit Package) | the shelf's cluster; both over the $7.99 line, so 80 % with no flat fee: net $15.20 / $23.20 |
| Disclosure | a preface page *How this book was written* (drafted by the operation it describes from its own logs and documents; edited, cut and verified by the author) and the book's AI Usage page filled in | the AI Usage page is not shown to readers today, so the reader-facing disclosure lives in the book; Pelizzone's guide says "written with Claude Code" on its card and has 240 downloads |
| Account and operation | the owner signs up (email), uploads, prices, fills the AI Usage page, publishes, and chooses PayPal (the existing account; the $20 floor beats Wise's $100 for a line this size); every later version is an owner session of ~10 min | "AI agents are not permitted to accept these Terms" / "we don't permit AI agents to use Leanpub": this operation never touches the account, the API, the forums or author messages |
| Promotion | none paid; opt the book into the weekly and monthly sale newsletters (free, coupon-tracked) | a Shelf month is $199 — over the £100 cap and only measurable against organic sales that do not exist yet |

**Does an operation-drafted, owner-curated book pass the human-curated rule?** The rule's words are "human-curated and of
good quality", "human-created and human-curated, and enhanced or transformed by AI tools with human guidance", judged by
eye, with permanent suspension as the usual penalty and "AI-automated processes for the production of large numbers of
books" the named target. One book, whose substance (the files, the decisions, the incidents) was produced by the
operation under the owner's direction and whose prose the owner edits and signs, with the method stated in the preface
and on the AI Usage page, is a single AI-assisted book — the thing the blog says Leanpub is "fine with". It is not what
the rule was written against (mass production) and the shelf already carries a guide that advertises being written with
Claude Code. The risk that Leanpub's eye still reads it as slop is real and bounded: a new account holding one book,
nothing else of the owner's on the platform, and the files remain sellable elsewhere (no exclusivity). It is a pass with
disclosure, not a pass by default — the owner's edit has to be a real one, and the preface must say so.

## 5. Call

**Promote — as a venture queue the 2026-11-04 exchange opens (`claude-code-kit`), one build item at score 3, not as
a spike.** The channel question the idea was parked on is answered: Leanpub lists a published book in its bookstore and
topic pages from day one at no cost, pays 80 % with no exclusivity, and its catalogue has carried 11–13 paying readers to
each of four operations handbooks of exactly our kit's shape, and 81–530 to the broader guides — the "first four buyers"
the 10-24 re-open condition asked for arrived at those books without any channel of the authors' own. Net per sale is
US$15.20–23.20, five to seven times the Kindle guide's, and the owner's part is one ~20-minute session (sign-up, upload,
price, AI page, publish) with no identity check and no card. The honest expectation, from the shelf's own numbers: a
single operations handbook from an unknown author sells **10–40 copies in six months → US$150–900 net, most likely the
low end** (yurukusa's four did 11–13 each at $9.99–12.99); the 20–30k-word book plus the Extras zip is ~1.5 build days, so
evidence 2 × reach 2 ÷ (1.5 d + 0.3 owner-day-equivalent) ≈ 2.2, rounded to **3** with the exact-shape evidence — below
every gankdat and foundry item in the queue, which is the right place for it: an idle slot builds it, a Wednesday does not
have to decide it again. Park it instead if the exchange reads the AI-policy risk as unbounded; the numbers do not say
park. Kill rule for the queue: fewer than 5 copies in the 60 days after the listing is live → retire the book, keep the
files for the Gumroad route if a channel of ours ever appears.

What the exchange needs to carry over: the product table above as the build item's spec; the disclosure preface as a
hard requirement; the owner request written as one ≤ 15-minute step plus a 5-minute follow-up only if the upload needs it
(owner-time rule 2026-10-29); a `docs/ops/SELF-CAUSED.md` row for Leanpub's sign-up and sale mails; the Kindle guide's
EPUB builder as the starting point. Not carried: Gumroad (parked 10-24 for the Discover gate, still true), the
"non-technical buyer" framing (0–1 buyers across six listings on 10-19; Leanpub's buyers are developers and the book says
so).
