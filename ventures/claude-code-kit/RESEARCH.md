# Claude Code operations kit — research

Opened by the venture exchange 2026-W45 (run 2026-11-04 08:06 UTC on its own slot). Evidence from
`docs/exchange/spikes/leanpub-claude-code-kit.md` (burn-down 2026-10-31: three fetch-relay rounds over Leanpub's terms,
royalty, author, AI-slop and AI-disclosure help articles, the live membership prices, the bookstore search and 31 book
pages' own `totalCopiesSold`), `docs/exchange/spikes/ai-setup-course-rivals.md` (2026-10-19: the Gumroad and Udemy rival
table), `docs/exchange/spikes/gumroad-shelf-uk-seller.md` (2026-10-24: why Gumroad gave no first buyers) and
`docs/exchange/spikes/etsy-claude-code-kit-listing.md` (2026-11-02: why Etsy is closed to it). The owner's idea
(`docs/OWNER-NOTES.md` 2026-10-18 00:45) reshaped three times: the "autonomous AI for non-technical buyers" framing had
0–1 buyers across six listings, so the product is for people who already run Claude Code. Status `idea` until the
manuscript and the Extras zip are built; `validated` is this file's gate table; `launched` when the owner's listing is live.

## 1. The job

A developer running Claude Code wants to run it unattended — scheduled routines that build, research, triage mail,
watch themselves and ask a person only when a person is needed — and has no worked example to copy: what goes in
`CLAUDE.md`, how routine prompts are written and changed, how two sessions avoid building the same thing, what a
pre-push gate must re-check, how a sandbox that cannot reach most hosts still reads them, what breaks (usage limits,
shallow clones, missed slots, duplicate research) and what the fix looked like. The job recurs with every Claude Code
release and every new routine the reader adds.

## 2. Evidence of paying demand (Leanpub's own shelf, `totalCopiesSold` read 2026-10-31)

| Book (author) | Min / suggested | Copies sold | Since |
| --- | --- | --- | --- |
| Claude Code: Building Production Agents That Actually Scale (De Vos) | US$14.97 / 32.99 | **530** | 2026-04 |
| Claude Code: From Basics to Mastery (Steve Publications) | US$25 / 35 | **116** | 2026-06 |
| Claude Code for Legacy Modernization (De Vos) | US$18.99 / 40 | **111** | 2026-08 |
| Claude Code Masterclass (Berton) | US$14.99 / 19.99 | **81** | 2026-05 |
| Claude Code Safety (yurukusa, pay-what-you-want) | — / 9.99 | **39** | 2026-06 |
| **Four operations handbooks of this kit's shape** (yurukusa: AGENTS.md interop, migration playbook, safety mastery, token savings) | US$9.99–11.99 / 12.99 | **11–13 each** | 2026-04..06 |
| Free guides (Mukhin, Pelizzone, Bustos) | free / US$6–15 | 46–327 downloads | 2026-03..07 |
| New or unsold (Pocket Guide, Web Developers, for Beginners, Practical Workbook; six "ai agents" books) | US$15–29 / 19.99–39 | 0–8 | 2026-08..10 |

Reading: a Claude Code book on Leanpub is a real paying line for an author with a catalogue or a 538-page flagship; a
single operations handbook from an unknown author is a **US$100–300 line over six months** at the shelf's own rate
(2–3 copies a month at US$9.99–12.99), with 81–530 the upside if the book reads as a general guide. Prices cluster at
US$19–25 minimum / US$29–39 suggested for 150–250 pages; readers choose the price, so the realised average sits near
the minimum. **Gap**: no book on the shelf is written from a running unattended operation — every rival is a usage
guide; the files (prompts, scripts, hooks, incident fixes) are what none of them ships.

Rivals elsewhere (10-19): four Gumroad kits at US$9–39 with 6–39 ratings; a Udemy beginner course with 17,760 students;
Anthropic's free official course. Gumroad gives no shelf traffic before US$100 of sales (10-24); Etsy bars AI-generated
instructional content (11-02); Udemy needs a Persona identity check and 30 minutes of video (parked, `udemy-claude-code-course`).

## 3. The shelf (Leanpub's own pages, 2026-10-31)

- **Terms**: Ruboss Technology Corporation (BC, Canada) is the seller of record. **Royalty 80 %** on purchases of
  US$7.99 and up (80 % minus 50¢ below). Author sets a minimum and a suggested price; the reader chooses. Payouts in USD
  by Wise (US$100 floor) or **PayPal (US$20 floor — the owner's existing account)** on the 7th of the month after a
  **60-day refund hold**. No exclusivity, no price parity. "AI agents are not permitted to accept these Terms."
- **Package**: the book plus Extras ("source files, code samples, apps, templates, worksheets"; never services or
  licences) sold as one purchase at its own price — a book-only tier at the minimum, book + kit at the suggested price.
- **AI policy** (*AI Slop is Not Permitted*, 2025-07; *No AI Slop!* blog): Leanpub "very much encourage[s] the use of
  AI by authors"; the work must be "human-created and human-curated, and enhanced or transformed by AI tools with human
  guidance"; AI slop and "AI-automated processes for the production of large numbers of books" are banned, the usual
  action permanent suspension of every associated account; "we don't permit AI agents to use Leanpub". Each book has an
  AI Usage page not shown to readers (it feeds Publish-on-Amazon), so the reader-facing disclosure is written into the
  book. Pelizzone's guide advertises "written with Claude Code" on its card and has 240 downloads.
- **Memberships**: none needed — a free author gets three books, PDF/EPUB upload, coupons, bundles and packages at the
  same 80 %, with 5 previews or publishes a month. The API is a Pro (US$18.99/mo) feature and barred to agents anyway.
- **Promotion**: the weekly and monthly sale newsletters are free opt-ins (coupon-tracked); a Shelf week/month costs
  US$129–199 — over the cap and only measurable against organic sales that do not exist yet.
- **Audience** (Leanpub's own figures, 2025-02): ≈ 165,000 monthly active users, most landing on book pages directly;
  the Weekly Sale newsletter > 100,000 subscribers.

## 4. The product

| Element | Shape |
| --- | --- |
| The book | *Running Claude Code unattended: the operations handbook of a self-running software business* — 20–30k words (150–200 pages at Leanpub's technical theme), built as EPUB + PDF from a content module (the Kindle guide's builder under `ventures/tax-workbook/src/kindle/` is the starting point), uploaded finished — each publish is an owner session, so no "publish early, publish often" |
| The Extras (one Package tier) | a zip: `CLAUDE.md`, the routine prompts, the pipeline and claim scripts, the slot and watchdog scripts, the fetch-relay workflow and script, the pre-push hook, a `docs/ops` starter — MIT-licensed, assembled by a script with a scrub test (no secrets, no venture-specific names, no owner identity) |
| Pricing | minimum **US$19** (book alone), suggested **US$29** (book + kit Package); both over the US$7.99 line → net US$15.20 / 23.20 |
| Disclosure | a preface *How this book was written* that states the real process — drafted by the operation it describes from its own logs and documents, then whatever the owner actually did (edited, cut, verified; or read and published as drafted) — and the AI Usage page filled in |
| Account and operation | the owner signs up (email), uploads, prices, fills the AI Usage page, publishes, chooses PayPal; this operation never touches the account, the API, the forums or author messages |
| Promotion | none paid; opt into the sale newsletters |

## 5. Gate (validation) and the rules that apply

| Gate | Reading |
| --- | --- |
| Buyers with money | 11–13 paid copies on each of four handbooks of this shape; 81–530 on the general guides (§2) |
| Recurring job | every Claude Code release and every new routine; the book is dated by its version |
| Paid competitor with a documented gap | the whole shelf is usage guides; none ships a running operation's files |
| ≤ 1 week to build | 1.5 days (manuscript 1, Extras 0.3, listing pack 0.2) |
| No policy / ToS risk | one disclosed, owner-published, owner-curated book is the thing Leanpub says it is "fine with"; the owner's own read before publishing is Leanpub's condition and is stated in the request as theirs to choose, never asked for under the 15-minute rule; a new account holding one book, the files sellable elsewhere |
| Launch cost | £0 |

Owner-time rule (STRATEGY §3): the request asks ≤ 15 minutes and no identity check. Rules from the Gumroad spike that
apply to any listing of the kit: files only, no access or set-up service, no get-rich-quick or urgency copy; the book
says plainly that the reader needs a Claude subscription, a terminal and judgement.

## 6. Numbers that decide

- **Proof**: a first sale within 30 days of the listing going live; ≥ 5 copies in 60 days.
- **Kill**: < 5 copies in the 60 days after the listing is live → retire the book from the queue, keep the files for the
  Gumroad route if a channel of ours appears (public mirror ≥ 500 stars, measurable developer traffic on a gankdat page).
- **Reading**: Leanpub's sale and royalty mails to the owner's inbox (the triage writes each as a `Sale` row below and
  each payout as a `revenue` row in `docs/LEDGER.md`, net of nothing — the royalty is the net); the book page's own
  `totalCopiesSold` is public and can be relay-read at each dated read without logging in.

## 7. Metrics

| Date | Event | Users | Rating | Sales | Notes |
| --- | --- | --- | --- | --- | --- |
| 2026-11-04 | Opened | — | — | 0 | venture opened by exchange 2026-W45 (3 × 2 = 6); four items queued; the owner's ≤ 15-min Leanpub step is raised by the listing-pack build |
| 2026-11-05 | Manuscript built | — | — | 0 | `kit-handbook-manuscript` (burn-down): 21,030 words — a preface 'How this book was written' (the real process; the owner's sentence is a marked placeholder the listing item replaces), 15 chapters and an appendix, as a content module (`src/content/`) → EPUB 3 (302 kB, JSZip; structure, well-formedness, mimetype-first and scrub tested — epubcheck not run: the sandbox refused the external jar, the listing item runs it) + PDF (7 × 10 in, 75 pages, Chromium print) + cover (1600 × 2400); `MANUSCRIPT-REVIEW.md` for the owner; status `validated` (gate table §5 met) |
| 2026-11-05 | Extras built | — | — | 0 | `kit-extras-zip` (burn-down): 44 files, 172 kB, MIT; scrub test passes on the repo and fails on a planted secret |
| 2026-11-05 | Listing pack ready | — | — | 0 | `leanpub-listing-pack-and-owner-step` (burn-down): LISTING.md, action 038 raised; waits on the owner's `leanpub done <url>` |

## 8. Build log

- **2026-11-05 17:55 (burn-down, `kit-handbook-manuscript`):** the handbook drafted from the repository's own documents (CLAUDE.md, the routine files and their `Changes:` headers, the pipeline README, STRATEGY §1–§8, the ledger, RUNS.md, SLOTS.md, the relay and ci READMEs, the pre-push hook, the six exchanges and the reviews) in `ventures/claude-code-kit/src/content/part1–4.ts`: preface, 15 chapters, appendix; 21,030 words (the item asked 20–30k). Hard requirements: the preface states the real process and carries `OWNER_PROCESS_PLACEHOLDER` for the owner's sentence (the test fails while it is absent; the listing item's test will fail while it is present); the needs-line (`NEEDS_LINE`) is in the preface. Scrub test: no email, no owner handle or mailbox domains, no trigger ids, no secret shapes, no rival author names, no urgency copy, and the honest '£0 of revenue recorded'. Builds: EPUB 3 (JSZip, 302 kB), PDF (Playwright Chromium, 7 × 10 in, 75 pages — fewer than the item's 150–200 estimate: Leanpub takes the finished PDF as is), cover SVG → PNG → JPEG. Not done: epubcheck (the sandbox's auto-mode refused downloading the jar; the Kindle guide's packager this one mirrors passed 5.2.1 with 0 errors on 10-26) — `leanpub-listing-pack-and-owner-step` runs it before the owner step is raised. Nothing fetched from the web.
- **2026-11-05 18:19 (burn-down, `kit-extras-zip`):** `src/extras.ts` assembles the Extras from the repository (manifest of 44 entries: `CLAUDE.md`, the ten routine files, the pipeline/relay/ci READMEs, `packages/core/src/pipeline.ts`, 14 scripts, the pre-push hook, five workflows under `workflows/`, plus generated README, MIT LICENSE, `package.json` with the npm scripts, an example queue of three scored items and empty `docs/ops` starters), rewrites the owner, the repository, our domains, mailboxes, trigger ids and the seven venture slugs to placeholders, and throws `ScrubError` — the zip is not written — when any file still carries a secret-shaped string, an email address, a trigger id, a domain of ours, the owner's handle or a venture slug. `release/claude-code-kit-extras.zip`: 44 files, 172 kB, every entry dated 2026-11-05 so two builds are byte-identical (test). The appendix file map in chapter 15 now lists exactly the manifest (test parses the map and compares sets); the handbook rebuilt at 21,063 words. Leanpub terms re-read from §3: files only, no service or licence inside — the README says the reader adapts them and that nothing in the zip contacts a service. Nothing fetched from the web.
- **2026-11-05 18:25 (burn-down, `leanpub-listing-pack-and-owner-step`):** `LISTING.md` (title, subtitle, tagline, About-the-book, categories, Book US$19 / Package US$29 with the Extras zip, PayPal, newsletters, the AI Usage page text), `docs/for-owner/actions/038-leanpub-kit.md` (five steps, ~15 min, £0; the ~2 h read stated as Leanpub's condition and the owner's choice, with `038 changes:` / `038 not now` as the two other answers), a `docs/ops/SELF-CAUSED.md` row for Leanpub's sign-up, sale, royalty and newsletter mail, the `owner:` ALERTS line and the `notify` run-log line. The preface's placeholder is replaced by `OWNER_PROCESS_LINE` — the publication rule the request makes binding (publish only after the read; nothing altered after it) — and `kit.test.ts` now fails while the placeholder is anywhere in the text; EPUB + PDF rebuilt. epubcheck: the sandbox downloaded 5.2.1 but its auto-mode classifier refused to run the jar (second time), so `docs/ci/epubcheck.yml` runs it on every push that changes `ventures/*/release/*.epub` and on dispatch; the next slot records its first run. `venture.json` stays `validated`; `launched` on the owner's note.

## 9. Second shelves (research log)

- **2026-11-07 21:35 (burn-down, new-ventures research):** two shelves the finished handbook can take beside Leanpub, read by
  WebSearch restricted to each shelf's own host (the spikes read the pages through the relay; hosts added). **Kindle (KDP),
  the owner's live account:** the Kindle Store lists at least ten self-published Claude Code guides on 11-07 (48 to 1,141
  pages; a 733-page 'Handbook' with 14 chapters, a 666-page 'Mastering', several marked unofficial), so the shelf already
  sells this shape and supplies the buyers; KDP's Content Guidelines (10-26 read) take AI-generated text with the disclosure
  at publish; the twin must stay out of KDP Select (90-day digital exclusivity — the tax guide is in it, a different book)
  and Leanpub imposes no exclusivity or price parity (§3), so both shelves can carry it. Open: the rivals' ranks (sales), and
  whether 70 % of ≤ US$9.99 beats 80 % of US$19 per copy. Queued `new-ventures/spike-kdp-kindle-claude-code-handbook` (6).
  **Whop:** a marketplace with its own Claude Code category — a US$97 'Playbook', a US$47 Claude Code folder, a US$4.96
  skill, a 30-day 'Ship With Claude' course, a 'Blueprints' store and a US$104-a-week membership on 11-07, plus Whop's own
  Claude Code seller plugin; fees 2.7 % + US$0.30 a transaction, no monthly fee, payouts to the United Kingdom, Whop collects
  and remits UK VAT. Open: whether set-up needs identity verification on a new account (owner-time rule), whether rival pages
  show sales, any marketplace-attributed fee. Queued `new-ventures/spike-whop-claude-code-kit-shelf` (4). This queue is
  unchanged: its one open item is the Leanpub listing, blocked on the owner's step (action 038).
- **2026-11-07 21:40 (burn-down, `spike-kdp-kindle-claude-code-handbook`):** parked — `docs/exchange/spikes/kdp-kindle-claude-code-handbook.md`.
  Two relay rounds: the Kindle search pages answered 503 on both stores, nine of ten product pages read on amazon.com (the
  .co.uk ones are the "Continue shopping" wall). Eight independent Claude Code titles rank #1.3M–4.9M in the Kindle Store
  four to six months after publication, one is delisted, the Packt guide is a June 2027 pre-order, and the one seller
  (#46,774, top-10 in two sub-categories) is a 190-page trade-published book — against 11–13 copies per handbook of this
  shape on Leanpub (§2). KDP Select's exclusivity sentence is quoted in the spike; the twin would never enrol. Trigger:
  the Leanpub day-60 read at ≥ 10 copies adds `kindle-edition` (0.3 day, one more 10-minute step on action 038).
