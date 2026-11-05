// Part 3: chapters 8–11 — the gates and CI workflows, the usage week, the owner's part, money.
import { c, h3, p, pre, table, tip, ul, type Chapter } from './helpers.ts';

const ch8: Chapter = {
  id: 'ch08-gates-and-ci',
  title: '8. Gates: the check, the pre-push hook and workflows written by a routine',
  body: [
    p(
      'An unattended operation cannot review its own pull requests, so it has gates instead: a full check that must pass before an item is marked done, a pre-push hook that re-checks the cheap things in under a minute, a CI job that runs the full check on every push to main, and a stop-the-line rule that makes a red main the only job of the next run. This chapter is about those four and the two days that produced the second.',
    ),
    h3('The check'),
    p(
      `${c('npm run check')} at the repository root runs, in order: the TypeScript build over the project references and the per-venture typechecks; the portfolio loader (every manifest valid); the ledger check (the cap, chapter 11); the pipeline validator; the handoffs check; the run-log cap; the bounty-claims ledger; the workflow YAML gate; ESLint; Prettier in check mode; and the tests. Then it runs the data API’s own check in its workspace, which has its own gate (lint, typecheck, format, tests under the Workers test pool, a dry-run deploy, and the entry-import walk). Six to sixteen minutes. The instruction file says it must pass before a task is marked done, and every working routine runs it as STEP 0 before building anything and again before committing.`,
    ),
    h3('Three red mains in two days'),
    p(
      'On 2026-10-04 and 05 the <code>check</code> workflow went red on main three times. Each time the cause was the same: an edit made after <code>npm run check</code> had already passed — a run-log line added at the end, a queue file touched, a formatting change — and pushed without re-running a gate that takes ten minutes. The fix, built on 2026-10-05 and queued from the operation’s own queue, is a committed pre-push hook that <code>npm ci</code> arms in every clone (<code>git config core.hooksPath .githooks</code> in the package’s prepare script). It runs in well under a minute and re-checks only what such an edit breaks:',
    ),
    ul([
      'Prettier on the files about to be pushed (the most common cause).',
      'ESLint on any pushed code file.',
      'The Node entry-point import walk on any pushed code file — added 2026-10-29 after two metrics runs died in three days on an extensionless relative import that Node’s type stripping on the runner rejects, which the data API’s own gate never ran.',
      'The run-log cap when the run log or the decision log is pushed.',
      'The pipeline validator when a queue file is pushed.',
      'The workflow YAML gate when a workflow file is pushed.',
    ]),
    p(
      'CI never runs the hook (GitHub sets <code>CI</code>) and <code>SKIP_HOOKS=1</code> bypasses it for a deliberate push. Typecheck and tests stay with the full check. Since the hook landed, a push after a late edit has been refused at the keyboard — or rather, in the sandbox — rather than discovered in a red run twenty minutes later and healed by the next slot.',
    ),
    h3('Heal before building'),
    p(
      'STEP 0 of every working routine: install, run the check, and if it fails, make main green and stop. Fix forward if the cause is obvious, revert the offending commit if it is not; commit, push, log it in the decision log. The routine releases any claim it made in the same heal commit, so the item is not held for a day by a run that built nothing. The rule is strict because a red main compounds: every later push inherits the failure, every later routine’s STEP 0 stops, and the fallback cannot tell a refused build from a healing one.',
    ),
    h3('Workflows written by a routine'),
    p(
      'A routine’s token cannot write under <code>.github/workflows/</code>. The drop zone is <code>docs/ci/</code>: write the workflow there, commit and push; the installer job, which runs with the owner’s token, moves it into place and pushes with a commit subject <code>ci: install workflow(s) &lt;name&gt;</code>. Files without a <code>name:</code> or <code>on:</code> line are left untouched. Edits to an existing workflow work the same way. One instruction in the README is written in bold because it bit: never put the literal skip-ci marker in a commit message you write — GitHub honours it anywhere in the message and runs no workflow at all; a commit that <em>described</em> a job using the marker ran neither the check nor the installer.',
    ),
    h3('The first-run check'),
    p(
      'A workflow’s first live run is the operation’s only test of it, and in week 42 three first runs failed (a demo-video job twice — a missing binary, then an approval step — and a deploy thirteen seconds in) and one never fired, each found by mail and fixed by hand a day later. Since 2026-10-17 every build and burn-down slot checks the first runs: <code>npm run first-runs</code> prints one line per workflow whose first run after its latest installer commit is still unrecorded, or <code>nothing owed</code>. For each line the routine reads the latest run through the GitHub tools; if none started after the installer commit and the file has a manual trigger, it dispatches it once and polls; then it appends <code>&lt;name&gt; first run: success</code> or <code>failure, &lt;failing step&gt;</code> to the run log. A failure is fixed in the same run by dropping the corrected file in the drop zone again. Workflows that spend money, publish or submit to a store are never dispatched for this; they are recorded from their own runs.',
      'Two refinements came from use. A first-run line counts only when it is stamped after the installer commit it answers — a cron-only workflow was reinstalled at 17:17 and two slots accepted its line from the day before. And the check became a script on 2026-10-28 after two slots stamped the same line on 10-24 and 10-26, each re-deriving the rule by hand with the other’s line already in the file; a workflow the script does not print is never read again.',
    ),
    h3('The YAML gate and formatting'),
    p(
      'On 2026-10-29 a step name with an unquoted colon reached main through the installer. GitHub refused the file with “No jobs were run” on all seven pushes until it was quoted, and an unparsable workflow has no path filters, so every push paid. <code>npm run ci-yaml</code> now parses every file in the drop zone and in the workflows folder and checks the shape GitHub needs — <code>on</code>, <code>jobs</code>, each job with <code>runs-on</code> or <code>uses</code>, a non-empty <code>steps</code> list whose steps carry <code>run</code> or <code>uses</code> and string names — and the pre-push hook runs it on any pushed workflow file. Quote any value that holds a colon-space or a space-hash.',
      'A second gap closed on 2026-11-02: Prettier ignores <code>docs/</code>, so a workflow dropped there with a double-quoted step name passed every local check and failed the format check the moment the installer moved it. The ignore file now exempts the drop zone, so a workflow there is formatted and checked exactly as it will be in place, and the README says to run <code>npm run format</code> after writing one.',
    ),
    h3('Dependency bumps'),
    p(
      'Dependabot opens grouped minor-and-patch pull requests and separate major ones. A gate-and-merge workflow merges a green minor group on its own. A major is reviewed by the burn-down within seven days: read each package’s breaking-change list against the calls the code makes, merge today’s main into the branch locally, regenerate the lockfile with <code>npm install</code> if it conflicts (never by hand), run the check, push the branch so the gate re-runs under Dependabot’s authorship, wait for green, merge with a squash. If a breaking change touches a call of ours and the fix is not a one-liner, the lift condition is recorded as an ignore entry in the Dependabot configuration and the PR is closed. Either way the versions log and the queue are updated. Never merge a red gate; never merge the Workers CLI’s majors without reading the compatibility-date note. The owner asked for this on 2026-10-16 — dependency currency without an attended session per bump.',
    ),
    table(
      ['Gate', 'When', 'Takes', 'Catches'],
      [
        [c('npm run check'), 'before done; STEP 0 of every working run', '6–16 min', 'types, lint, format, tests, pipeline, ledger, run log, YAML'],
        ['pre-push hook', 'every push from a clone', 'under 1 min', 'the late edit: format, lint, imports, run-log cap, queue files, workflow shape'],
        [c('check') + ' workflow', 'every push to main', '6–16 min', 'the same as the root check, in CI'],
        ['STEP 0 heal', 'the next working run', 'one run', 'a red main, before anything else is built'],
        ['first-runs', 'every build and burn-down slot', 'seconds plus a dispatch', 'a workflow that fails or never fires on its first run'],
      ],
      'The gates and what each is for.',
    ),
    tip('Make the cheap gate run where the mistake is made. The full check protects the product; the pre-push hook protects the full check from the edit you make after it passes — and in an unattended operation that edit is the run-log line every run writes last.'),
  ].join('\n'),
};

const ch9: Chapter = {
  id: 'ch09-the-usage-week',
  title: '9. The usage week: budgets, pacing and one commit per item',
  body: [
    p(
      'The scarce resource in this operation is not money or compute but the Claude allowance: a budget per five-hour window and per week, shared between the owner’s daytime use and the routines, reset on Thursday at 03:00 UTC. The owner’s instruction on 2026-10-04 was precise: spend seventy to eighty per cent of the week on queued work, keep the daytime light because the owner uses Claude at work before 17:00 UK time, and run each evening’s session to its limit when there is work. Everything in this chapter follows from trying to do that without going dark on the day that matters.',
    ),
    h3('The burn gate'),
    p('The evening burn-down fires every hour from 17:00 to 02:00 UTC and is gated by a JSON file:'),
    pre(`{
  "enabled": true,
  "nights": ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
  "window_utc": "17:00-02:59",
  "stop_if_weekly_pct_at_least": 80,
  "report": { "date": "2026-10-04", "total_pct": 14, "fable_pct": null },
  "week_slots": 33,
  "week_reserve": 3
}`),
    p(
      'Before installing anything the routine reads it: if the gate is off, or tonight is not a burn night, or the owner’s last usage report is within seven days and at or above the stop line, it prints which gate stopped it and ends. The owner reports usage with a Telegram note (<code>usage 62% fable 71%</code>); the first routine that reads the note copies the numbers and the date into <code>report</code> and answers the note in place. The percentage gate is the intended control. The rest of the file exists because the owner did not always send the note.',
    ),
    h3('Going dark on a Wednesday'),
    p(
      'On Tuesday night 2026-10-20/21 the burn-down ran to the limit as instructed, and every slot of Wednesday 10-21 was refused: the exchange, both builds, both fallbacks. The week’s exchange never happened, the watchdog wrote a line, and the operation learned that “run to the limit” and “the week resets Thursday” together mean “Wednesday is the day you cannot afford to spend”. The same thing happened again in week 44 with the first fix in place, which is why there are two.',
    ),
    h3('Pacing when the report is stale'),
    p(
      'The first fix (2026-10-24): while the usage report is older than seven days — so the allowance is unknown — the gate prints <code>paced: &lt;why&gt;</code> and the run ends when either a Monday or Tuesday night has already run three hourly slots that found work (distinct hours with a burn-down line since 17:00), or a usage-limit signal was seen in the last twenty-four hours since the Thursday reset. A usage-limit signal is a watchdog <code>missed:</code> or <code>stalled:</code> line asking “usage limit?”, or a build slot with no start marker and no build line. A fresh usage note hands the decision back to the percentage gate.',
      'The second fix (2026-10-29), after week 44 went dark on Wednesday again: the stale report paces the whole week. The week’s spendable slots are the capacity the previous week showed before its first usage-limit signal — thirty-three working slots in week 44, a build or burn-down hour each, between the Thursday reset and the stalled Monday 17:00 build — or the file’s <code>week_slots</code> when no reading exists, less a <code>week_reserve</code> of three kept for Wednesday’s exchange and two builds. The gate prints <code>paced: … week budget: N of M working slots used since the &lt;reset&gt;</code> when they are spent, and <code>paced: … night cap: &lt;night&gt; used N of K burn-down slots</code> when a Thursday-to-Tuesday night has run its share of what the two daily build slots leave (thirty-three slots a week less fourteen build slots, over six nights, is three burn-down slots a night). Wednesday night keeps no cap. Build slots count toward the budget but are not paced: the burn-down absorbs the cut so the reserve is always the exchange and its builds.',
    ),
    h3('The missed exchange'),
    p(
      'The exchange is the one weekly decision that cannot be skipped without the pipeline starving, so it has a fallback of its own (2026-10-24): from Thursday to Saturday the build’s gate prints <code>exchange missed: &lt;Wednesday&gt;</code> as its first reason when no exchange trace exists since that Wednesday 08:00, and the build routine runs the week’s exchange instead of claiming an item. The commit subjects come from history and the run log also counts, so a shallow clone cannot hide a trace. From Sunday the next exchange is nearer than the missed one and the gate is silent.',
    ),
    h3('Why one commit per item is the usage rule, not a git rule'),
    p(
      'Every working prompt says: being cut off by a session or weekly limit mid-run is expected and fine; the rules make it harmless. The rule that makes it harmless is one commit per finished item, pushed immediately, never partial work. A session cut off mid-item leaves nothing on main; the claim it pushed expires in a day; the next run redoes the item from scratch. That costs a slot when it happens, but it never costs a half-built product on main, a migration without its code, or a queue that says done for a thing that is not. The pre-push hook (chapter 8) is the other half: the one commit must also be green.',
      'The corollary for long items is honest and uncomfortable: an item that takes longer than a window is likely to be cut off and redone, so items are sized to fit — the fallback takes nothing over 0.3 days, the exchange’s spikes are at most half a day, and a one-day item like this manuscript is built in a slot that has just started and accepts the risk.',
    ),
    h3('What a week looks like'),
    p('The weekly report carries a slot table. Week 44’s, in prose: of the fourteen build slots, eleven ran and built; of the hourly burn-down fires, about forty per cent found work and the rest ended at the gate within seconds; one stalled build at 17:00 on Monday was the usage-limit signal; Wednesday was dark. Week 45, with the week budget in place, kept its Wednesday: the exchange ran at 08:06, and the night this chapter was written, a Thursday, the gate read <code>work:</code> and three items were built.'),
    table(
      ['Control', 'Since', 'Stops a run when'],
      [
        ['enabled / nights / window', '2026-10-04', 'the gate is off, or not a burn night, or outside 17:00–02:59'],
        ['percentage gate', '2026-10-04', 'the owner’s report is fresh and at or above the stop line'],
        ['night cap (Mon/Tue)', '2026-10-24', 'report stale and the night has run three working slots'],
        ['usage-limit signal', '2026-10-24', 'report stale and a missed/stalled slot asked “usage limit?” in 24 h'],
        ['week budget', '2026-10-29', 'report stale and the week’s slots less the Wednesday reserve are spent'],
        ['night cap (Thu–Tue)', '2026-10-29', 'report stale and the night has run its share of the week'],
        ['starved-and-cooled', '2026-10-06', 'nothing buildable, nothing to research, the night’s pre-research spent'],
      ],
      'The burn-down’s gates, oldest first.',
    ),
    tip('Decide which day of your week must never go dark and reserve for it first. Spend the rest to the limit, from the far end of the week, so a cut-off costs a Saturday night and not the planning meeting.'),
  ].join('\n'),
};

const ch10: Chapter = {
  id: 'ch10-the-owners-part',
  title: '10. The owner’s part: notes, actions, alerts and self-caused mail',
  body: [
    p(
      'The owner does administration. In practice that means four channels, each a file, and a set of rules that keep what reaches the owner small, batched and plain. This chapter is about those channels, the fifteen-minute rule that reshaped them, and the register that stopped the operation paging the owner about its own mail.',
    ),
    h3('Owner notes: Telegram and the dashboard'),
    p(
      'The owner leaves notes by messaging the operation’s Telegram bot or by typing into an idea box on the owner’s dashboard page; an hourly job appends them to <code>docs/OWNER-NOTES.md</code>. Every routine reads the file at the start of a run and answers each new note in place with an indented <code>Claude:</code> line, dated with the routine that answered. A note that asks for something becomes a queue item or an exchange entry. The answer shows on the dashboard, so the owner sees it without opening the repository.',
      'The file is a conversation log and a small record of judgement. Two notes from 2026-10-18 are instructive. One proposed a course for non-technical buyers on setting up an autonomous AI operation; the burn-down parked it in the exchange, the exchange researched it a week later and found the non-technical promise had no buyers and could not be made honestly, and a fortnight after that reshaped it into this book. The other proposed ventures in a sector the operation’s own gates and every shelf it sells through rule out; the answer declined, with the policy, the law and the reason, in four sentences, and the exchange recorded it as declined. The owner has delegated decisions, which includes the decision to say no.',
    ),
    h3('Actions: one batched request per channel'),
    p(
      'Anything that needs the owner’s identity or wallet — opening a store account, verifying identity, creating a payment link, pasting a submission — is written as a numbered file in <code>docs/for-owner/actions/</code> from a template: what it unblocks, the steps with the minutes each takes, what to send back. Thirty-seven existed by November. The instruction file’s rule is to batch the rare owner-only actions into one request per channel, and never to send them piecemeal in chat.',
      'The rule got teeth on 2026-10-29, when the owner set a cap: a request asks at most fifteen minutes in one sitting and no new identity or business verification, unless the work it unblocks scores at least ten on paying-buyer evidence; never append steps to an open request. The cap retired two finished products the same week — an Excel add-in and a Power Platform connector for the data API, both built, both needing a forty-five-minute partner-centre sign-up with a business verification — and their request was withdrawn and marked “re-raised only at three paying accounts”. It also shaped every request since: the tax workbook’s own checkout was built so its one owner step was a three-minute payment link; this book’s request will be a sign-up, an upload and a price, and will say that the owner’s own read of the book is the shelf’s condition for publishing, not the operation’s ask.',
    ),
    h3('Alerts: owner lines and handoff lines'),
    p(
      '<code>docs/ALERTS.md</code> holds dated lines of two kinds. An <code>owner:</code> line is one plain sentence saying what and where, at most 120 characters, and is sent to the owner’s phone; it is written only when a person is needed and always names the action file. A <code>handoff:</code> line is for the interactive session — work the repository and a Claude session with the owner’s keys can finish — and is never sent. Since 2026-10-24 the distinction is strict: a step that edits an account, a token scope, a dashboard setting or a path the instruction file says to ask about is an owner line batched into the next action file, never a handoff, because a handoff waits for a session that may not come for a week.',
      'A line is closed in place with what happened and when (“Done 2026-11-02 (interactive): …”, “Superseded 2026-10-29: withdrawn under the owner-time rule”), so the file is also the history of what the owner was asked and what came of it.',
    ),
    h3('The inbox: triage, not forwarding'),
    p(
      'The hourly triage routine reads unread mail through a Gmail connector — unread is the queue, so a missed slot only delays mail — and classifies each thread as store, customer, notification or suspicious. Each is logged in <code>docs/INBOX.md</code> as one line: time, class, sender domain, subject, a sentence, and the outcome. The rules that follow are the ones that keep the owner out of it:',
    ),
    ul([
      '<strong>Who does what.</strong> <code>needs owner</code> is reserved for things only the owner can do: clicking in an account under their identity, paying, verifying identity, answering a refund or data-deletion request. Everything else is agent work and is logged.',
      '<strong>Reconcile before escalating.</strong> An amount or status the repository already records is checked against the ledger or the research file before a <code>needs owner</code>; the operation once paged the owner about an invoice its own ledger explained.',
      '<strong>Billing above baseline.</strong> A billing alert from a service the operation pays that names a figure above the ledger’s line for that service is never logged alone, whatever the self-caused register says about that sender: it becomes an owner line and an <code>unconfirmed</code> note on the ledger row. A US$15 alert was once logged as noise for three days.',
      '<strong>Sales are rows.</strong> A store’s order mail becomes a <code>Sale</code> row in the venture’s metrics table — date, listing, price, quantity, never the buyer’s name, address, email or order number — and a deposit mail a <code>revenue</code> row in the ledger. The weekly report counts them.',
      '<strong>Defects are items.</strong> A marketplace flagging an actor, a search-console mail naming a server error, a run-failed mail with a named step: each files a dated, scored queue item in the same commit, so the next build repairs it. Five search-console mails were once logged as noise while every page of one dataset had been a 503 for days.',
      '<strong>Customers get drafts.</strong> A person asking about a product gets a reply drafted by the routine and, for a refund, a <code>needs owner</code>.',
    ]),
    h3('Self-caused mail'),
    p(
      'In one week in September three false alarms reached the owner, every one caused by a script of the operation’s own: a marketplace mailing “pricing change” when the publish script set the sale price, a registry confirming a publish, a reminder to rotate a key nothing used. The register <code>docs/ops/SELF-CAUSED.md</code> is a table of sender, subject fragment, the script or file that causes the mail, what it really is, and how to log it. The triage reads it before classifying any store, vendor or platform mail; a match is logged as <code>self-caused: &lt;cause&gt;</code> and never becomes an alert, a <code>needs owner</code>, a ledger entry or a “next step”. A second table holds mail that is caused by the operation but is real work (an actor QA failure, a run failed on our push), logged with the cause and routed to a queue item.',
      'The rule that keeps the register true is in the instruction file: whenever you automate something that makes a third party email the owner — publishing, pricing, key rotation, DNS, a registry submission, a new sending domain — add its row in the same commit. The register had twenty-odd rows by November and the owner’s phone had not buzzed about a confirmation mail since.',
    ),
    h3('The phone'),
    p(
      'A GitHub job turns the run log’s <code>| notify |</code> lines, the alerts file’s <code>owner:</code> lines and the watchdog’s lines into Telegram messages, every two hours. Nothing else reaches the phone. The weekly report is a file, read when the owner chooses. The result over six weeks: about three messages a week, each either “a product went live”, “a version was submitted”, or “please do this, ten minutes, file 034”.',
    ),
    table(
      ['Channel', 'Direction', 'File', 'Rule'],
      [
        ['Owner notes', 'owner → routines', 'docs/OWNER-NOTES.md', 'answered in place by the next routine; a request becomes an item'],
        ['Actions', 'routines → owner', 'docs/for-owner/actions/NNN-*.md', '≤ 15 min, no new verification unless the work scores ≥ 10; never append'],
        ['Alerts', 'routines → owner / interactive session', 'docs/ALERTS.md', 'owner: lines to the phone; handoff: lines for the keyed session'],
        ['Inbox', 'world → routines', 'docs/INBOX.md', 'classified, logged, reconciled; self-caused never escalated'],
        ['Phone', 'routines → owner', 'Telegram via CI', 'notify and owner lines only, plain, short'],
      ],
      'The owner’s channels.',
    ),
    tip('Write the owner’s request as a file with minutes next to each step before you write the thing it unblocks. If the minutes exceed what the owner agreed to give, redesign the thing; the operation did, twice, and both redesigns were better products.'),
  ].join('\n'),
};

const ch11: Chapter = {
  id: 'ch11-money',
  title: '11. Money: the ledger, the cap and what six weeks earned',
  body: [
    p(
      'The capital cap is £100 of the owner’s net outlay, and the rule that enforces it is a script, not a sentence. <code>npm run ledger</code> validates <code>docs/LEDGER.md</code> and fails the gate if cost plus planned exceeds £100 plus revenue received; it also reports how many months of headroom the recurring costs leave and warns under three. Every pound in or out is a row in that file, recorded the day it happens. This chapter reproduces the ledger as it stood and says what it means.',
    ),
    h3('The ledger'),
    table(
      ['Date', 'Venture', 'Kind', 'GBP', 'Note'],
      [
        ['2026-09-10', 'data API', 'cost', '3.70', 'Cloudflare Workers Paid, US$5 a month, recurring; owner-paid before adoption, counted from September'],
        ['2026-09-17', 'portfolio', 'cost', '3.70', 'Chrome Web Store developer registration, US$5 once'],
        ['2026-09-27', 'data API', 'contingent', '47.00', 'ICO data-protection fee, tier 1 — deferred by the owner until the first real customer; paid from that revenue'],
        ['2026-10-10', 'data API', 'cost', '37.00', 'Cloudflare invoice US$49: the plan plus a D1 row-write overage of about US$44 (94 million rows written against a 50 million allowance by nightly full reloads of nine registers; fixed 2026-10-04 with delta refreshes)'],
        ['2026-10-16', 'data API', 'cost', '0.00', 'x402 Bazaar indexing: US$0.005 from a test wallet funded in September before the ledger counted the venture'],
        ['2026-10-23', 'data API', 'cost', '0.00', 'eighteen half-cent indexing calls (US$0.09) from the same wallet; the monthly probe pays each route at most once'],
        ['2026-10-29', 'tax workbook', 'cost', '14.00', 'Etsy one-time shop set-up fee, as charged'],
        ['2026-10-29', 'tax workbook', 'cost', '0.20', 'Etsy listing fee, first listing'],
        ['2026-11-03', 'tax workbook', 'planned', '0.16', 'Etsy listing fee, second listing, charged when the owner publishes it'],
        ['2027-07-08', 'data API', 'planned', '8.00', 'domain renewal, auto-renew on'],
      ],
      'The ledger’s entries as of 2026-11-05. Recurring: £3.70 a month, the Workers plan.',
    ),
    p(
      'Total spent: about £58.60. Planned: £8.16. Revenue received: £0. Headroom under the cap: about £33, or roughly nine months of the recurring line. One row is a mistake and is labelled as one: the US$49 invoice was a bug in the refresh design, not a cost of doing business, and the kill-criteria section of the plan now says so in general — a metered charge above the plan is a bug, and the metrics job files a scored item the day the daily row shows a dollar of overage.',
    ),
    h3('Conventions that keep the ledger honest'),
    ul([
      '<code>cost</code> is money spent, the day it leaves the account, at the card’s GBP amount. <code>planned</code> is committed but not yet spent — an owner-action request goes here first. <code>contingent</code> is spent only when a stated condition is met and sits outside the cap until it becomes planned. <code>revenue</code> is money received, net of platform fees, in GBP at the payout rate.',
      'Revenue is recorded at the payout, when the money reaches the owner’s account, never at the sale. The sale is a row in the venture’s metrics table (a count); the ledger carries the pounds. A shelf that keeps fifteen or twenty per cent and remits VAT is recorded by what it pays out.',
      'A refund is a <code>cost</code> row with the note <code>refund:</code>; the ledger is negative-free.',
      'A billing alert that names a figure above the ledger’s line for that service gets an <code>unconfirmed:</code> note on the row so the next reconciliation sees it.',
      'The cap rule since 2026-10-10: <code>spent + planned</code> may exceed £100 only by revenue already received, so anything beyond the cap comes out of profit. Recurring cost creep: anything that pushes recurring spend above £10 a month needs revenue of three times that cost already banked.',
    ]),
    h3('What six weeks earned'),
    p(
      'Honestly: nothing in pounds. The weekly review’s scorecard on 2026-11-01 read the targets to 2026-12-20 against the numbers:',
    ),
    table(
      ['Metric', 'Target', 'Reading on 2026-11-01'],
      [
        ['data API paying accounts', '5', '0 (4 accounts, 0 paid, 0 keys in 30 days)'],
        ['data API monthly revenue', '£150', '£0 in Stripe; about US$0.055 of USDC micropayments from 5 buyer clients on the pay-per-call lane, plus prober calls that never count'],
        ['marketplace actors live', '17', '18 of 18 public — met'],
        ['marketplace paid runs a month', '100', '0 paid; 487 runs by others in 30 days, mostly a QA runner’s cadence'],
        ['change-feed calls a week', '50', '0 as an API; 127 fetches of the keyless Atom feeds by 13 user agents in 30 days'],
        ['extension and plugin sales', '20', '0; two Chrome users of one extension, nineteen views of the plugin'],
        ['directory listings live', '8', '6, with two in review'],
        ['hackathon entries / placings', '3 / 1', '2 submitted, 0 placed, judging pending'],
        ['Etsy workbook sales', '≥ 10 within 60 days of listing', '0 on day 3 of Etsy and day 1 of Kindle'],
      ],
      'The 90-day scorecard as the week-44 review read it.',
    ),
    p(
      'Three readings in that table matter more than the zeros. The pay-per-call lane is the one shelf where strangers have paid: eleven buyer calls from five clients in thirty days, one repeat, at half a cent each — tiny, but real money from people the operation never contacted, found through a catalogue it listed itself in. The marketplace actors are run hundreds of times a month by other people without paying, which says the data is wanted and the price point is wrong or the free tier too generous. And the tax workbook, the newest line, had its first listing three days old; its sixty-day clock is the next real test.',
      'The plan’s pivot rule is written for exactly this picture: if the data API is under £50 a month and the marketplace under twenty paid runs a month by 2026-12-20 with all listings live, the data line is repositioned toward one buyer type and the change feeds sold as the product, rather than extended. The exchange had already begun moving that way the week this was written, pricing the change feed on the paid lane. Whether any of it pays is not known. The ledger will say.',
    ),
    tip('Enforce the cap with a script that fails the build. A number in a document is a wish; a number in a gate is a budget. And record the mistake rows as mistakes, with the fix dated — the reader of the ledger in six months will be you, and you will want to know which costs can recur.'),
  ].join('\n'),
};

export const part3: Chapter[] = [ch8, ch9, ch10, ch11];
