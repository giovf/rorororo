# Leanpub listing — Running Claude Code Unattended

Paste-ready copy for the owner's Leanpub upload (action 038), in the order of Leanpub's book
settings (Book Info → Content → Pricing & Packages → AI Usage → Publish). The files to upload are
built by `npm run build -w @foundry/claude-code-kit` into `release/`:

| File | What it is |
| --- | --- |
| `release/Running-Claude-Code-Unattended.epub` | the book, EPUB 3 (checked by the `epubcheck` CI job on every push that changes it) |
| `release/Running-Claude-Code-Unattended.pdf` | the book, PDF, 7 × 10 in, 75 pages |
| `release/cover.jpg` | the cover, 1600 × 2400 |
| `release/claude-code-kit-extras.zip` | the Extras for the Package: 44 of the operation's files, MIT, scrubbed (its README lists them) |

Leanpub's form may name a field differently from the headings below; the text goes in the closest
box. Nothing here promises income, urgency or a result (RESEARCH.md §5): the book says what one
operation does and what it earned.

## 1. Book info

**Title:** Running Claude Code Unattended

**Subtitle:** The operations handbook of a self-running software business — its instruction file,
routine prompts, work queue, gates, watchdog and relay, with the incidents that wrote each rule

**Author:** your name as you want it on the cover page (the book's cover carries the title only).

**Language:** English

**Categories** (pick the closest two the form offers): *Computers & Programming → Artificial
Intelligence*; *Computers & Programming → Software Engineering* (or *DevOps* if listed).

**Short description / tagline (≤ 150 characters):** How a small software business runs Claude
Code on a schedule, unattended, with the files it runs on — written from its own logs.

**About the book** (the long description; Leanpub takes Markdown):

> This is the operations handbook of a real, small, unattended software business: a portfolio of
> digital products built and run by Claude Code on scheduled routines, for an owner whose only
> brief was to make money legally with £100 of capital. It was drafted by that operation from its
> own repository — the instruction file, the routine prompts, the work queue, the run log, the
> decision log and six weekly reviews — and it says so in the preface.
>
> It covers what the instruction file does and why each rule is there (with the incident that wrote
> it); how a routine prompt is written, versioned and changed; the work pipeline — queues, scores,
> weights, claims, research claims, cooling and starvation; slot markers and the watchdog; the fetch
> relay for hosts a sandbox cannot reach; the pre-push gate and the three times the main branch
> went red; the usage-week budget; the owner's part (notes, requests, alerts, self-caused mail); the
> ledger, the £100 cap and what the first six weeks earned, honestly: £0 of revenue recorded by
> 4 November 2026; and the exchange that chose each week's bet.
>
> The Package adds the Extras: 44 of the operation's files under the MIT licence — the instruction
> file, ten routine prompts, the pipeline scripts, the slot and watchdog scripts, the fetch-relay
> workflow and script, the pre-push hook, the CI workflows and a starter for the operations folder —
> rewritten to placeholders and assembled by a script with a scrub test. Chapter 15 is the order in
> which to adopt them and what to change.
>
> You still need a Claude subscription, a terminal and your own judgement: this book shows how one
> operation runs, not a button that runs one for you. About 21,000 words; 75 pages in the PDF.

## 2. Content

Upload the EPUB and the PDF from `release/` ("Upload your own files", not the Leanpub Markdown
flow). Cover: `release/cover.jpg`. Leave the sample (preview) as Leanpub's default — the preface
and chapter 1 are the honest preview.

## 3. Pricing and packages

| Tier | Minimum | Suggested | Contains | Net to you at the minimum (80 %) |
| --- | --- | --- | --- | --- |
| **Book** | US$19 | US$19 | EPUB + PDF | US$15.20 |
| **Book + the Extras** (a Package) | US$29 | US$29 | EPUB + PDF + `claude-code-kit-extras.zip` | US$23.20 |

Package name: **Book + the operation's files (Extras)**. Package description: "The book plus the
44 files the operation runs on — instruction file, routine prompts, pipeline, watchdog, relay, hooks
and workflows — under the MIT licence, scrubbed and rewritten to placeholders, with a README that
says what each is for." Royalties: **PayPal** (US$20 floor; your existing account). No coupons at
launch. Opt in to the **Weekly Sale** and **Monthly Sale** newsletters when the form offers them
(free; coupon-tracked).

## 4. AI Usage page

Leanpub's AI Usage page is not shown to readers (it feeds its Amazon publishing); the reader-facing
disclosure is the preface. Paste this, true as it stands:

> The manuscript was drafted by Claude Code, running as a scheduled routine of the software
> business the book describes, from that business's own repository: its instruction file, routine
> prompts, work queues, run log, decision log, reviews and exchange documents. The preface, "How this
> book was written", states this to the reader. I own and run the business, delegated its product
> and strategy decisions to the routines, and read the manuscript against a chapter-by-chapter review
> checklist before publishing it; what I chose to change is in the text, and nothing was altered after
> my read. The Extras are the operation's real files, released under the MIT licence after a scripted
> scrub. No AI agent operates this Leanpub account.

## 5. Publish

Publish the book (not a preview). Then send the note `leanpub done <book URL>`: the
`leanpub-listing-live` item records the URL and the date, writes the owner's line, and queues the
day-60 read.

## What the listing never says

No income claim beyond the ledger ("£0 of revenue recorded"), no urgency ("limited", "act now"), no
"passive income", no promise that the reader's operation will earn; no rival author named.
