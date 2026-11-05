// Part 1: the preface (front matter) and chapters 1–3 — what the operation is, how it is shaped,
// and what CLAUDE.md does and why each rule is there.
import { NEEDS_LINE, OWNER_PROCESS_LINE } from './constants.ts';
import { h3, p, pre, table, tip, ul, type Chapter } from './helpers.ts';

const preface: Chapter = {
  id: 'preface',
  title: 'Preface: how this book was written',
  frontMatter: true,
  body: [
    p(
      'This book was drafted by the operation it describes. The text was written by Claude Code, running as one of the scheduled routines of a small software business, from that business’s own repository: its instruction file, its routine prompts, its work queues, its run log, its decision log, its weekly reviews and the exchange documents in which each week’s bet was chosen. No chapter was written from memory of how such operations are supposed to work; every rule in these pages is quoted or paraphrased from a file the operation runs on, and every incident is taken from the log line, the commit or the decision entry that recorded it on the day.',
      'That is an unusual provenance for a technical book, and it is the honest one. The routine that drafted the manuscript is the same routine that, an hour earlier, had built a sales-reading for a tax spreadsheet and, an hour before that, a paid change-feed route for a data API — both of which appear in later chapters as examples. The book is therefore a primary source about one operation, with the limits that implies: it knows what the files say and what the logs recorded, and it says so when a reading was uncertain or a number was small.',
      OWNER_PROCESS_LINE,
      'Two things the reader should know before paying for the rest.',
    ),
    h3('What you need'),
    p(
      `${NEEDS_LINE} Everything in the Extras — the instruction file, the routine prompts, the queue scripts, the slot and watchdog scripts, the fetch-relay workflow, the pre-push hook — runs on an ordinary GitHub repository with GitHub Actions, and on Claude Code’s scheduled cloud routines. A Claude subscription that includes those routines is the recurring cost; the operation described here pays about £3.70 a month for its one piece of hosted infrastructure and nothing for the rest.`,
      'The operation’s products are not the subject of this book. They appear as examples because the rules were shaped around them — a data API, a Figma plugin, two browser extensions, a tax workbook on Etsy, a book on Leanpub — but what the book teaches is the machinery that builds, sells and watches them without a person at the keyboard. If you run Claude Code and have ever wished it would carry on with the backlog while you were at work, this is a worked example of what that takes, with the bruises.',
    ),
    h3('What this book is not'),
    p(
      'It is not a promise of income. The operation’s ledger is reproduced in chapter 11 and it shows, as of the week this edition was drafted, about £59 spent and £0 of revenue recorded, with a handful of dollars’ worth of USDC micropayments from strangers that the ledger convention has not yet booked. Six weeks is not long enough to know whether the thesis — many cheap products on shelves that bring their own buyers — pays. The book reports what happened, and the kill criteria the operation set for itself, so the reader can judge.',
      'It is not a tutorial for Claude Code itself. The reader is assumed to run it already, to know what a system prompt and a tool call are, and to be comfortable in a terminal and a git repository. Where the book explains a Claude Code feature (routines, the sandbox, connectors) it does so only as far as the operation depends on it.',
      'And it is not neutral. The rules here were written by the thing they govern, under the pressure of its own failures, and some of them are workarounds for limits that may not exist by the time you read this. Every rule is dated for that reason. Where a date is old, check whether the limit still holds before copying the workaround.',
    ),
    h3('How to read it'),
    p(
      'Chapters 1 to 3 describe the shape of the operation and the instruction file that steers every session. Chapters 4 to 9 are the machinery: routine prompts, the work pipeline, slots and the watchdog, the sandbox and the fetch relay, the gates, and the weekly usage budget. Chapters 10 to 13 are the human and the money: what the owner does, the ledger, research before build, and how the operation expands itself. Chapter 14 is the incident catalogue in date order; chapter 15 is how to start your own from the Extras; the appendix is a glossary and a file map.',
      'Code and file excerpts are set in monospace. Dates are given in full (2026-10-07) because the operation’s own documents are dated that way, and the date is often the point: it tells you which incident a rule answers.',
    ),
  ].join('\n'),
};

const ch1: Chapter = {
  id: 'ch01-what-unattended-means',
  title: '1. What “unattended” means here',
  body: [
    p(
      'Foundry is a portfolio of small digital products run for a single owner in the United Kingdom. The owner’s brief, given in September 2026, was two sentences long: make money, legally, with at most £100 of capital, and do not ask me to do anything a routine could do. The owner does administration — opens accounts, verifies identity, pays the odd fee, answers a refund — and nothing else. Everything between “here is an idea” and “here is a product on a shelf with a price on it” is done by Claude Code sessions that nobody watches.',
      'That is the sense of “unattended” used in this book. It does not mean that no person is ever needed; identity checks, payment accounts and store submissions all need a person, and chapter 10 is about keeping that person’s part small and batched. It means that the default state of the operation is <em>running</em>: at 09:00 and 17:00 UTC a build routine fires and builds the next queued item; every evening from 17:00 an hourly burn-down routine does the same until the allowance runs out; every morning a metrics routine writes the day’s numbers; every hour a triage routine reads the inbox; on Wednesday the exchange chooses the week’s bet; on Saturday the retro reviews how the routines themselves performed; on Sunday the strategy review holds every venture against the plan and may kill one. The owner’s phone receives perhaps three short messages a week.',
    ),
    h3('The operation in one page'),
    p('In the week this edition was drafted the operation looked like this:'),
    table(
      ['Part', 'What it is', 'Runs'],
      [
        ['The repository', 'one GitHub repository: products, documents, queues, logs, the routine prompts, the CI workflows', 'the single source of truth; every session clones it fresh'],
        ['Cloud routines', 'nine scheduled Claude Code sessions, each a fresh sandbox that clones the repository, works, pushes and is discarded', 'Anthropic’s cloud; no secrets; a Gmail connector on one'],
        ['GitHub Actions', 'about twenty workflows: the gate (typecheck, lint, format, tests), deploys, publishing, the fetch relay, the watchdog, the owner’s phone line', 'GitHub-hosted runners with the repository secrets'],
        ['Worker crons', 'the data API’s own scheduled refreshes of its public-register datasets', 'Cloudflare’s edge'],
        ['The owner', 'accounts, identity, money, store clicks; reads the phone', 'perhaps thirty minutes a week'],
      ],
      'The parts of the operation and where each runs.',
    ),
    p(
      'Seven ventures existed: a Figma plugin (live since 2026-09-21), a data API of UK and EU public registers with seventeen datasets, an MCP server and a pay-per-call lane for AI agents (adopted 2026-09-19), two browser extensions, a line of hackathon entries, a line of open-source bounties that was opened on 2026-10-11 and killed a week later when seven daily board reads found nothing claimable, a UK sole-trader tax workbook sold on Etsy, Payhip and the operation’s own page with a Kindle sibling, and this book.',
    ),
    h3('What the routines actually do in a day'),
    p(
      'The simplest way to see the operation is to read one day of its run log. The log is a file in the repository, <code>docs/RUNS.md</code>, to which every routine appends one line per piece of work it finished. Here is an abridged day — the one on which this book was begun — with the routine tag in the second column:',
    ),
    pre(`- 2026-11-05 01:07 | watchdog | ci-minutes: 517 billed min/7d (~2216/mo; cap 2000) top: notify owner 120, gankdat metrics 66
- 2026-11-05 05:08 | triage | notify owner dispatched: last run started 02:42 UTC, 2 h ago
- 2026-11-05 09:19 | build | Claimed tax-workbook cross-sell-links-guide-and-workbook (4 × 2) before npm ci; main green
- 2026-11-05 09:19 | build | Built tax-workbook cross-sell-links-guide-and-workbook: the guide and the workbook now name each other
- 2026-11-05 09:19 | build | Gap found: own-checkout sales reach no §7 row, so the referrer is unread — queued own-checkout-sale-reading (4)
- 2026-11-05 09:19 | build | Inbox 08:17: Apify flagged uk-food-hygiene-ratings; queued gankdat refresh-uk-food-hygiene-2026-11-05 (8)
- 2026-11-05 17:12 | burn-down | Claimed tax-workbook own-checkout-sale-reading (4) before npm ci; main green
- 2026-11-05 17:17 | burn-down | Built tax-workbook own-checkout-sale-reading: own-checkout sales now read like Payhip's
- 2026-11-05 17:23 | burn-down | Claimed gankdat x402-change-feed-route (6); second item of the slot
- 2026-11-05 17:45 | burn-down | gankdat x402-change-feed-route done (v0.28.0): /x402/changes/<slug> sold on the lane at $0.01`),
    p(
      'Read that and most of the book is already visible. Work comes from a queue with scores. A routine <em>claims</em> an item before it does anything else, so the other routine does not take the same one. It checks that the main branch is green before building. It builds one item, runs the gates, makes one commit, pushes, and logs. When it finds a gap — here, that a sale on the operation’s own checkout page would reach no metrics row — it queues the fix with a score and moves on rather than building it unasked. When the inbox reports a problem (a marketplace flagged an actor as broken), the triage routine files the repair as a queue item for the next build. A watchdog counts CI minutes and reports when the month’s cap is in danger.',
    ),
    h3('Why this shape'),
    p(
      'Three constraints drove it. The first is the capital cap: £100 of net outlay, which rules out paid infrastructure, paid marketing and anything that needs a card on file for a service that might bill. The operation therefore sells through shelves that bring their own buyers — Figma Community, the Chrome Web Store, the Apify Store, Etsy, Amazon KDP, Leanpub, the x402 Bazaar — and hosts almost nothing itself. The second is the owner’s time: the target is under thirty minutes a week, which rules out any workflow in which a person is in the loop per sale, per customer or per release. The third is the nature of the worker: a Claude Code session has a budget per five-hour window and per week, and can be cut off mid-sentence by it; it starts every time from a fresh clone with no memory but the repository; it cannot reach most of the web from its sandbox; and it is, in the end, a probabilistic thing that will sometimes misread a file. The machinery of this book — claims, slot markers, one commit per item, pre-push gates, the fetch relay, the watchdog — exists to make an operation of such workers safe to leave alone.',
      'The owner delegated product and strategy decisions on 2026-09-20 and has not taken them back. The routines decide what to build, log the decision with its evidence, and keep going; the owner reads the weekly report and leaves notes. That delegation is what makes the operation unattended rather than merely automated. It is also what makes the rules matter: an operation that decides for itself needs rules that keep it honest about money, policy and risk, and chapter 3 is about those.',
    ),
    tip('The run log quoted above is the operation’s memory. A fresh session has nothing else, so every routine reads what the earlier runs of the day did before it starts, and never redoes it. If you take one habit from this book, take that one: write one plain line per piece of work, in a file in the repository, and read it first.'),
  ].join('\n'),
};

const ch2: Chapter = {
  id: 'ch02-the-shape',
  title: '2. The shape of the operation',
  body: [
    p(
      'Everything that runs on its own is listed in one document, <code>docs/SCHEDULERS.md</code>, with its time, its kind, what it invokes and what it writes. That document is updated in the same commit as any change to a scheduler, which is a rule in the instruction file (chapter 3) rather than a hope. The three kinds of scheduled work are worth separating because they have different powers and different failure modes.',
    ),
    h3('Cloud routines: the workers'),
    p(
      'A cloud routine is a scheduled Claude Code session. Each firing gets a fresh sandbox that clones the repository, has no <code>.env</code>, no secrets and no memory of earlier runs, and is discarded when the session ends. It can push to GitHub. It can reach a few web hosts through the sandbox’s proxy and cannot reach most. It may have a connector attached — the inbox-triage routine has Gmail — and nothing else. Its budget is the owner’s Claude allowance, which is shared with the owner’s own daytime use.',
      'Nine routines existed in November 2026. Four run on the most capable model: the daily build (09:00 and 17:00 UTC, one item per run), the evening burn-down (hourly from 17:00 to 02:00 UTC, as many items as the allowance allows), the Wednesday venture exchange and the Sunday strategy review. A build fallback on a different model fires twenty minutes after each build slot and only acts when the build left no trace. Four run on a smaller model: the daily metrics routine, the hourly inbox triage, the Monday weekly report and the Saturday ops retro.',
      'The stored prompt of every routine is a three-line bootstrap: clone main, read <code>docs/routines/&lt;name&gt;.md</code>, do what the text below its divider says. The real prompt lives in the repository, which means a prompt change is a commit. Chapter 4 explains why that matters and what it cost to learn.',
    ),
    h3('GitHub Actions: the hands with keys'),
    p(
      'The routines have no secrets, so anything that needs one is a GitHub Actions workflow triggered by a push or a schedule: the deploys of the data API and the licence service, the publishing of marketplace actors and registry entries, the fetch relay that reads hosts the sandbox cannot, the watchdog, the metrics jobs that query analytics, and the “notify owner” job that turns particular run-log lines into Telegram messages. A routine that needs a runner to do something writes a file and pushes it; the runner does the thing and commits the result; the routine pulls. That handshake — request file, response commit — is the operation’s general answer to “the sandbox cannot”, and it appears in several places.',
      'Actions minutes are a real budget (2,000 a month on the free plan for a private repository; the repository was later kept public, which removed the cap, but the watchdog still counts). A routine cannot write workflow files directly either — its token lacks the workflow scope — so new or changed workflows are dropped in <code>docs/ci/</code> and an installer job moves them into place. Chapter 8 covers the gate those files pass through after one unquoted colon cost seven failed runs.',
    ),
    h3('Worker crons: the product refreshing itself'),
    p(
      'The data API is a Cloudflare Worker with its own cron triggers: seven waves between 05:00 and 06:05 UTC that refresh the public-register datasets into KV and D1. This is the only infrastructure the operation pays for (about £3.70 a month) and the only place with persistent state the operation controls. It is also where the one expensive mistake happened: nightly full reloads of nine registers wrote 94 million rows against a 50-million allowance and produced a US$49 invoice in October. Chapter 11 has the ledger row; the fix (delta refreshes) was built on 2026-10-04 and the row-write count fell from millions a day to tens of thousands.',
    ),
    h3('The repository as the operating system'),
    p(
      'With no shared memory between sessions, the repository carries everything: the instruction file every session loads; the routine prompts; the work queues; the run log; the alerts file; the owner’s notes; the ledger; the plan of record with its decision log; the self-caused-mail register; the relay requests and responses; the slot markers. The folder layout matters less than the principle that every piece of state a routine needs is a file, every change to it is a commit, and every commit is pushed at once or not at all. Here is the part of the layout the book refers to:',
    ),
    pre(`CLAUDE.md                     the instruction file (chapter 3), loaded into every session
docs/ARCHITECTURE.md          the stable architecture, imported by CLAUDE.md
docs/STRATEGY.md              the plan of record: thesis, targets, scoring rule, kill criteria, decision log (§8)
docs/routines/<name>.md       the routine prompts of record (chapter 4)
docs/pipeline/                exchange.json and one scored queue per venture (chapter 5)
docs/RUNS.md                  the run log: one line per piece of work (chapters 1, 6)
docs/ops/SLOTS.md             slot start markers (chapter 6)
docs/ops/BURN.json            the evening burn-down's gate and the usage report (chapter 9)
docs/ops/SELF-CAUSED.md       mail our own automation triggers (chapter 10)
docs/OWNER-NOTES.md           the owner's notes, answered in place (chapter 10)
docs/ALERTS.md                owner: and handoff: lines (chapter 10)
docs/for-owner/actions/       batched requests that need the owner's identity or wallet
docs/LEDGER.md                every pound in and out (chapter 11)
docs/relay/                   fetch-relay requests, responses and the host allowlist (chapter 7)
docs/ci/                      drop zone for workflows a routine writes (chapter 8)
docs/exchange/, docs/reviews/ the Wednesday exchange and the Sunday review (chapter 12)
.githooks/pre-push            the pre-push gate (chapter 8)
scripts/                      the plain-Node scripts the routines call: pipeline, slot, watchdog, relay …
packages/*, ventures/*        the products`),
    h3('The day and the week'),
    p('The timetable, in UTC, as the schedulers document lists it:'),
    table(
      ['When', 'What', 'Writes'],
      [
        ['05:00–06:05 daily', 'seven Worker cron waves refresh the datasets', 'KV, D1, a refresh log'],
        ['06:37 and 06:52 daily', 'GitHub jobs: API metrics and store metrics', 'the Daily numbers rows'],
        ['07:00 daily', 'metrics routine: makes sure every venture has today’s row; dispatches the jobs when GitHub fired them late', 'metrics rows, alerts'],
        ['every hour at :05', 'inbox triage (Gmail): classifies unread mail, logs it, files repairs, writes sale rows', 'INBOX.md, ALERTS.md, queue items'],
        ['09:00 and 17:00 daily', 'build routine: one queued item', 'the item, its docs, the queue, the run log'],
        ['09:20 and 17:20 daily', 'build fallback: only when the build left no trace', 'same'],
        ['17:00–02:00 hourly', 'evening burn-down: items until starved or cut off', 'same'],
        ['every two hours at :40', 'notify owner job: the watchdog, then the phone line', 'watchdog lines, Telegram'],
        ['Monday', 'weekly report', 'docs/reports/'],
        ['Wednesday 08:00', 'venture exchange: the week’s bet', 'docs/exchange/, a queue'],
        ['Saturday 07:59', 'ops retro: how the routines performed', 'foundry queue items'],
        ['Sunday 08:00', 'strategy review: keep, fix, double-down, kill', 'docs/reviews/, STRATEGY.md'],
      ],
      'The timetable in November 2026.',
    ),
    p(
      'Two things about this timetable are not obvious from the table. GitHub delivers scheduled workflows late and sometimes not at all — the 06:30 metrics job started between 11:51 and 15:04 every day for a week until it was moved off the half-hour, and an hourly cron delivered three of eighteen fires one day — so every routine that depends on a job checks whether the job ran and dispatches it when it did not. And the Claude allowance resets on Thursday at 03:00 UTC, which makes Wednesday the most dangerous day: a burn-down that runs Tuesday night to the limit leaves nothing for Wednesday’s exchange, and that happened twice before the budget rules of chapter 9 were written.',
    ),
    h3('What a product looks like in this shape'),
    p(
      'A venture is a folder with a manifest (<code>venture.json</code>, validated by the core package), a research file with the evidence that justified it, a scored queue, and its code. The lifecycle is idea → validated → building → launched → earning or killed, and the validation gate is written down: buyers with money, a recurring job, a paid competitor with a documented gap, at most a week to build, no policy risk, and (since the cap rule) under £10 to launch. A venture that cannot show the evidence is not built; a venture that shows zero sales and zero organic signal ninety days after every planned listing is live is killed, code kept. Chapter 12 is about how those gates are applied in practice and chapter 11 about what they have cost.',
    ),
  ].join('\n'),
};

const ch3: Chapter = {
  id: 'ch03-claude-md',
  title: '3. The instruction file: what each rule does and why it exists',
  body: [
    p(
      'Claude Code loads <code>CLAUDE.md</code> from the repository root into every session, interactive or scheduled. In this operation that file is the constitution: everything a session must do at the start, the conventions code must follow, the workflow rules, the things to ask before doing, and an import of the architecture overview. It is kept short on purpose — it is part of every prompt, so each sentence costs tokens on every run — and almost every sentence in it is dated, because almost every sentence answers an incident.',
      'This chapter walks the file in order, rule by rule, and says what the rule does and what happened before it existed. The file itself is in the Extras; the aim here is to make its sentences legible rather than to reproduce them.',
    ),
    h3('The header: keep it small, keep the volatile parts elsewhere'),
    p(
      'The first paragraph says what the file is and tells the reader that product architecture lives in a separate file imported below, and that the PRD-specific detail stays out. The reason is cost and drift. An earlier draft had the architecture inline; every time a dataset shipped the instruction file changed, and the instruction file is the one document every routine must agree on. Splitting it means the stable conventions change rarely and the architecture summary changes with the product.',
    ),
    h3('Stack and commands'),
    p(
      'The stack section names the package manager (npm workspaces, with an explicit “don’t switch without asking”), the language settings (TypeScript, strict, NodeNext ESM, Node 22), the tooling (ESLint with typed rules, Prettier, Vitest), and the per-venture frameworks. The commands paragraph is the one routines use most: <code>npm run check</code> — typecheck, lint, format check, tests — must pass before a task is marked done, and the individual commands are listed. A legacy section marks three folders of prior-art Python as reference only, excluded from lint and never extended; a routine that did not know that would eventually try to “fix” them.',
    ),
    h3('Conventions'),
    ul([
      '<strong>Explicit return types on exported functions, no <code>any</code>, no <code>@ts-ignore</code> without a comment.</strong> Typed ESLint enforces these; the rule in the file is there so a routine writes code the gate will accept the first time rather than discovering the gate.',
      '<strong>Named exports over default exports</strong>, enforced by ESLint in the product folders with config files exempt. A convention, but a convention a probabilistic worker needs stated.',
      '<strong>Each package has two tsconfigs</strong> — one for the editor and lint that includes tests, one for the build that excludes them — referenced from the root. Project references are how <code>tsc -b</code> builds the whole workspace; a package that forgets the reference typechecks locally and fails in CI.',
      '<strong>Tests live next to the code as <code>*.test.ts</code>; test the core logic, not the UI shell.</strong> The second half is the important half for a worker that would otherwise write a hundred lines of DOM assertions.',
      '<strong>Every venture has <code>venture.json</code> and <code>RESEARCH.md</code>; no venture reaches <code>validated</code> without it.</strong> The validation gate as a file requirement.',
      '<strong>Money in or out is recorded in the ledger the day it happens.</strong> The cap in chapter 11 is enforced by a script that reads this file; the rule makes the file true.',
      '<strong>UI copy: upgrade prompts state what the user gains, never what is blocked; permissions and data use are disclosed on every listing.</strong> Store policy and consumer law, written as a copy rule so it is applied in the moment of writing the copy.',
    ]),
    h3('Workflow: session start'),
    p(
      'The session-start rule is a list, and each clause has a story. <code>git status</code> first, because a cut-off session leaves uncommitted work in the sandbox and the next interactive session must finish or discard it, never leave it. Unshallow the clone when it is shallow, because the sandbox clones at depth fifty and a days-old depth-fifty snapshot makes a plain fast-forward look like divergence (2026-10-10, chapter 7). Pull without rebase. Read the owner’s notes and answer new ones in place; read the alerts file, where <code>handoff:</code> lines are the interactive session’s to execute; read the inbox log. Check CI is green and fix main first if it is not. Run the schedules check of the data API to confirm no temporary cron trigger was left armed — because a routine once changed a Worker schedule for a test and died before restoring it.',
    ),
    h3('Workflow: slot start, claims and atomic pushes'),
    p(
      'Three rules here are the heart of the safety story and each has its own chapter: the slot marker (the first action of a build run pushes a one-line “started” marker so the fallback and the watchdog can tell an in-flight slot from a missed one — chapter 6); the claim (every build and burn-down run claims its item right after reading the queue with one “doing” push, so two sessions never build the same item — chapter 5, after 2026-10-07, when both did); and atomic pushes: build fully, run the gates, then one commit and push, never partial work “to save progress”, because a session can be cut off by usage limits at any moment and the sandbox is discarded, which is safe only if nothing half-done reached main.',
      'The atomic-push rule has a corollary the file states plainly: the pre-push hook, armed by <code>npm ci</code>, re-checks Prettier, ESLint, the entry-point import walk, the run-log cap and the pipeline files on the pushed range, “because the edit made after <code>npm run check</code> is what turned main red three times in two days”. That sentence is the whole of chapter 8 in miniature.',
    ),
    h3('Workflow: interruptible side effects and schedulers'),
    p(
      'Anything that changes live state and must be undone later — a temporary cron trigger, a schedule edit — is restored by CI’s daily self-heal if the session dies. The rule exists because the session <em>will</em> die, eventually, with the side effect in place. D1 migrations are applied before the code that needs them is pushed, never after, because a deploy that runs against an unmigrated database fails in a way that looks like a code bug.',
      'Every scheduled job of every kind is listed in the schedulers document, updated in the same commit as the change. Routine prompts live in the routines folder and the stored prompt only reads that file: change the file, never file a prompt handoff (chapter 4).',
    ),
    h3('Workflow: self-expansion and self-caused mail'),
    p(
      'On 2026-09-24 the owner put the operation’s own improvement in scope: when a blocker repeats, build the general fix — a routine, a relay, a watchdog — and queue it in the operation’s own queue; do not wait to be asked. Hosts the sandbox cannot reach go through the relay. New or changed CI workflows from a routine go to the drop zone. Chapter 13 is about what that rule produced.',
      'The self-caused-mail rule is smaller and surprisingly important: anything you automate that makes a third party email the owner — publishing, pricing, key rotation, DNS, registry submissions — gets a row in a register in the same commit, and the triage and the weekly report read that register and never escalate a match. In one week in September three false alarms had reached the owner’s phone, every one caused by a script of the operation’s own. Chapter 10 has the register.',
    ),
    h3('Workflow: the queue of record and the owner’s rules'),
    p(
      'The queue of record is the pipeline folder; the next item is whatever the script prints; the item is built and marked done in the same commit; an emptied queue is flagged for research; items rank by score times the queue’s weight and are never re-ranked by hand. The “take, don’t wait” rule from 2026-10-11 says that money already on offer — prize pools, posted bounties — is collected by doing the work well and researched from primary sources, never from money-making content; it then lists the terms read that day that constrain the operation: never scan or scrape Devpost (its terms forbid automated access), every pull request on another project says it was built with Claude Code and respects that project’s contribution rules, hackathon entries are submitted by the owner, no security testing or vulnerability programmes, no card on a £0 line. Those are not platitudes; each one is a line the operation found and chose not to cross.',
      'The owner-overview rule says what reaches the owner: routines append one line per piece of work to the run log, and the phone gets only <code>| notify |</code> lines (a new version in a store, a new product live, an owner action needed) and <code>owner:</code> alert lines — all short, plain, non-technical. The delegation rule says the owner has delegated all product and strategy decisions: decide, log the decision, keep going; batch the rare owner-only actions into one request per channel; and, from 2026-10-29, a request asks at most fifteen minutes and no new identity or business verification unless the work it unblocks scores at least ten, and never appends steps to an open request. The fifteen-minute rule retired two finished products (an Excel add-in and a Power Platform connector) whose marketplace needed a forty-five-minute partner-centre sign-up; chapter 10 tells that story.',
    ),
    h3('Things to ask before doing'),
    p(
      'The short list at the end is the operation’s hard boundary, and it is the one part of the file a routine must never reinterpret: changing the package manager; modifying the devcontainer; deploying, publishing or submitting to any store or registry (CI does those on push, so a routine never does them by hand); spending any money; anything that puts the owner’s identity on a service; and anything that could breach a platform’s terms — scraping, restricted OAuth scopes, ad injection — which is not asked about but simply not done.',
      'Two observations about the list. First, it is short because most of what it rules out is also ruled out by the sandbox: a routine has no card, no keys and no identity to put anywhere. The list matters most for the interactive session, which has <code>.env</code>. Second, “ask” in an unattended operation means “write an owner line and stop that item”, not “wait”; chapter 10 shows the form.',
    ),
    h3('What the file does not say'),
    p(
      'It does not describe the products, the scoring formula or the plan; those are imported or linked. It does not tell a routine how to write code beyond the conventions; the gates do that. And it does not contain a single instruction that needs a secret, an account or money — a rule stated for the routine prompts (chapter 4) that the instruction file keeps too. The file’s job is to make every session start the same way and respect the same boundaries, and to be short enough that it is actually read.',
    ),
    tip('If you write your own instruction file, date the rules. A rule without a date is a rule the next reader cannot judge; a rule with a date and the incident it answers is one they can retire when the incident can no longer happen.'),
  ].join('\n'),
};

export const part1: Chapter[] = [preface, ch1, ch2, ch3];
