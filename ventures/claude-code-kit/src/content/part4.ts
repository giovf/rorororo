// Part 4: chapters 12–15 and the appendix — research before build, self-expansion, the incident
// catalogue, starting your own, glossary and file map.
import { c, h3, ol, p, pre, table, tip, ul, type Chapter } from './helpers.ts';

const ch12: Chapter = {
  id: 'ch12-research-before-build',
  title: '12. Research before build: the exchange, the review and the kill criteria',
  body: [
    p(
      'The operation builds nothing without evidence and keeps nothing without a number. Three routines hold that line: the Wednesday exchange decides where the next unit of effort goes, the Sunday review holds every venture against the plan, and the research passes inside the build routines refill a starved queue with scored items or declare it finished. This chapter is about how those decisions are made and what six weeks of them decided.',
    ),
    h3('The scoring rule'),
    p(
      'Score equals evidence of paying demand times reach of the channel, divided by build days plus owner minutes. Build only what scores above the best distribution task still undone. The plan states it in one line and then qualifies it with the weights of chapter 5 and a standing preference: distribution beats new features until the funnel shows conversion. Evidence means a primary source — a shelf’s own sales counts, a rival’s price page, a register’s licence, a catalogue’s per-resource call counts — read through the relay or a search, never a money-making article. Reach means buyers the channel already brings.',
    ),
    h3('The validation gate'),
    p('A venture is built only after it passes a table the research file must carry:'),
    ul([
      '<strong>Buyers with money</strong> — paid rivals, or a shelf’s own counts.',
      '<strong>A recurring job</strong> — something the buyer does again (every tax year, every release, every tender).',
      '<strong>A paid competitor with a documented gap</strong> — what the rival charges for and does not do.',
      '<strong>At most a week to build</strong>, and under £10 to launch.',
      '<strong>No policy or terms risk</strong> — read from the platform’s own terms, with the sentences quoted.',
    ]),
    p(
      'The same file records, in a numbered section, the proof (the number that would show the venture worked, with a date) and the kill rule (the number and date that retire it). The book you are reading has both: a first sale within thirty days of listing and five copies in sixty, or the book leaves the queue.',
    ),
    h3('The exchange: one bet a week'),
    p(
      'Every Wednesday at 08:00 the exchange reads the state of play — what changed since last week in every venture’s metrics, the inbox signals, the owner’s notes — then scores the parked ideas and fresh candidates in a table and chooses: a new venture (a folder, a manifest, a research file, a queue with scored items) or a bigger bet on a live one (a queue extended or reopened). It writes <code>docs/exchange/2026-Www.md</code> and a decision-log entry, and names runners-up and what would promote them. It never builds.',
      'Its decisions, in order, are the operation’s short history:',
    ),
    table(
      ['Week', 'Winner', 'Why', 'What came of it'],
      [
        ['W40 (09-30)', 'list the data API’s MCP server in Claude’s connectors directory', 'the agents hitting the paywall were the only demand signal; the directory brings its own users', 'built in a week; submitted by the owner 10-04; still in review on 11-02, the owner’s three-minute read filed'],
        ['W41 (10-07)', 'a Companies House company lookup and monitor on the data API', 'supply on the shelf: bid teams and KYB buyers; paid rivals; a watch-mode actor', 'public 10-07; 6 runs in 30 days by 10-21'],
        ['W42 (10-14)', 'list the pay-per-call lane in the x402 Bazaar', 'the catalogue’s own counts: 518,867 paid calls to the top 200 resources in 30 days, no UK register listed', 'listed 10-16 after one half-cent settlement; 16 of 17 routes indexed by 10-23; first strangers’ payments 10-17/18'],
        ['W43 (10-24)', 'a UK sole-trader tax workbook on Etsy', 'a rival’s one-listing shop shows 172 sales at £7.19; the job recurs every tax year; Etsy brings the buyers', 'built and validated the same day; shop opened by the owner 10-29; a Kindle sibling live 10-31'],
        ['W44 (10-29, run Thursday by the build slot after Wednesday went dark)', 'sell the workbook from the operation’s own page too', 'every listing of the line had waited on one owner sitting; the own page needs no new account', 'built that night; the owner’s one step a three-minute payment link, done 11-02'],
        ['W45 (11-04)', 'this book, on Leanpub; and price the change feed on the paid lane', 'the shelf’s own counts (11–13 copies on each of four operations handbooks, 81–530 on general guides); the lane widened all week and agents asked the paywall for the change feed fourteen times in a day', 'the manuscript drafted the next day; the change-feed route built the same evening'],
      ],
      'Six exchanges.',
    ),
    h3('Spikes: research that fits a slot'),
    p(
      'Between exchanges, idle slots do not idle. When the pipeline is starved and cooled, a routine takes one pre-research pass per window: if the new-ventures queue holds fewer than two open spikes, it picks a shelf or dataset not yet in the exchange, verifies its licence and a paid rival through the relay or a search, and adds it as a scored spike — at most half a day, with a proof document that ends in a number and a promote-or-park call. The review of week 42 made this rule after ten passes had parked ten ideas and promoted none while the four spikes seeded on 10-17 were all done the same day. Twenty-five spikes had been written by 10-25, two of which became lines.',
      'A spike is honest about parking. The one that read the Leanpub shelf for this book parked a Gumroad route (no shelf traffic before US$100 of sales), an Etsy route (its terms bar AI-generated instructional content), a Kobo route (rejects AI-written books) and a Udemy route (an identity check and thirty minutes of video), each with the sentence from the platform’s own page.',
    ),
    h3('The review: keep, fix, double-down, kill'),
    p(
      'Every Sunday the review reads the plan, the previous review, the newest report, exchange and retro, the ledger and the run log, and writes <code>docs/reviews/2026-Www.md</code>: a scorecard of the targets, a per-venture verdict applying the kill criteria literally, the market signals seen, the research gaps, and the next three moves. It may mark a queue finished, re-park or promote an exchange idea, and change a queue’s weight; then the plan is rewritten and the decision logged.',
      'The kill criteria are few and dated. Any venture: zero sales and zero organic signal ninety days after every planned listing is live — kill, keep the code. A money-on-offer line: when its own daily board shows nothing claimable for seven consecutive reads — kill before the outcome rule can fire, keep the scanner weekly as the re-open reading. A dataset not queried by any customer in sixty days — retire from the surface. The whole data line under £300 a month after four months of listings — reposition, sell the change feeds. Recurring cost creep above £10 a month — needs three times that in banked revenue.',
      'The one kill so far was the open-source-bounties line, opened on 2026-10-11 and killed on 10-18: seven consecutive daily boards, about 3,900 issue reads, zero free, funded, escrowed code fixes at US$25 or more; every filed item dropped on read. The review wrote the rule that killed it on the day it killed it, so the next money-on-offer line has one.',
    ),
    h3('Research passes'),
    p(
      'A starved queue is researched by the build routines: read the venture’s research file, its metrics rows, its alerts and inbox signals, the documents under its folder and the market, then add at least three scored items with evidence in the <code>why</code>, or set the queue finished with a reason; write the evidence to the research file; set the flags. A pass with no new evidence sets a date instead (chapter 5). The research files therefore carry a dated log of every pass, and reading one tells you what the operation knew about a venture on any day.',
    ),
    tip('Write the kill rule the day you open the line, with the number and the date. A line without one is killed by exhaustion, late; a line with one is killed by its own reading, on time, and the reading is reused for the next line.'),
  ].join('\n'),
};

const ch13: Chapter = {
  id: 'ch13-self-expansion',
  title: '13. Self-expansion: the retro, the operation’s own queue and the fixes it built',
  body: [
    p(
      'On 2026-09-24 the owner said that improving the operation itself was in scope: when a blocker repeats, build the general fix — a routine, a relay, a watchdog — and queue it; do not wait to be asked. The sentence changed what the routines did when something went wrong. Before it, a routine that hit a limit filed a handoff and moved on. After it, the routine filed a scored item in the operation’s own queue with the evidence, and the next slot that found it winning built it. This chapter reads that queue as the record of the operation learning.',
    ),
    h3('The ops retro'),
    p(
      'Every Saturday at 07:59 a routine on the smaller model reviews how the operation performed over the week — slots missed, repeat blockers, defects, owner load — and writes proposals scoring four or more into the operation’s queue as items with the evidence and, for prompt changes, the exact wording. It adds evidence to an existing item rather than duplicating it. Its proof of worth is written down: at least two retro-originated items built per month. It does not run the build, change code, workflows or any prompt; it proposes, and the build routine or the interactive session applies.',
    ),
    h3('What the queue built'),
    p('A selection of the items the operation’s queue has built, each the general fix for a repeated blocker, with the incident that filed it:'),
    table(
      ['Item', 'Filed by', 'The incident', 'The fix'],
      [
        ['prompts-from-repo', 'interactive, 09-30', 'five prompt fixes queued behind one person in two days', 'the bootstrap; prompts in the repository (chapter 4)'],
        ['fallback-slot-race', '09-30', 'three build/fallback collisions in two days', 'the slot marker (chapter 6)'],
        ['self-caused-alerts', '09-29', 'three false alarms to the owner in a week, all from our scripts', 'the self-caused register (chapter 10)'],
        ['pre-push-format-gate', 'burn-down, 10-05', 'three red mains in two days from late edits', 'the committed pre-push hook (chapter 8)'],
        ['relay-wait-loop', '10-05', 'a relay request queued 16 minutes against a fixed two-minute sleep', 'poll for the response commit up to 20 min'],
        ['burn-starvation-gate', '10-06', 'four firings spent ~20 min each installing to learn there was nothing to do', 'the plain-Node cold gate before install'],
        ['research-cooldown', '10-06', 'five research runs on one venture in a day', '48-hour cooling after a research pass'],
        ['build-claim-marker', '10-07', 'two slots built the same item in full', 'the claim push (chapter 5)'],
        ['research-after-date', '10-07', 'three ventures researched three times in eight days on an unchanged zero', 'research_after: a date instead of items'],
        ['sandbox-clone-unshallow', '10-10', 'a stale depth-50 clone refused a plain pull; history reads under-counted', 'unshallow first, everywhere'],
        ['claim-before-install', '10-12', 'the 17:00 and 17:10 slots collided twice because the first next came after a 5–7 min install', 'next and claim on plain Node, before npm ci'],
        ['relay-allowlist-as-data', '10-16', 'thirteen script commits in a week, one per new host, each a full gate run', 'the hosts file'],
        ['first-run-check-new-workflows', '10-17', 'three first runs failed and one never fired in a week, each found by mail a day later', 'every slot checks and fixes first runs'],
        ['notify-owner-cron-not-push', '10-19', 'the phone-line job ran on every push and ate the Actions budget', 'a two-hourly cron, a stale check by the triage'],
        ['burn-pace-stale-usage-report', '10-24', 'Tuesday night burned the week; Wednesday went dark', 'pacing while the report is stale (chapter 9)'],
        ['exchange-missed-slot-fallback', '10-24', 'the W43 exchange never happened and nobody ran it', 'the build runs a missed exchange Thursday–Saturday'],
        ['first-run-check-script', '10-28', 'two slots stamped the same first-run line', 'npm run first-runs'],
        ['burn-weekly-slot-budget', '10-29', 'W44 went dark on Wednesday with the night cap in place', 'the week budget and the Wednesday reserve'],
        ['ci-workflow-yaml-gate', '10-29', 'one unquoted colon, seven failed runs', 'npm run ci-yaml in the check and the hook'],
        ['relay-bodies-cap-in-history', '10-31', '469 MB of relay bodies in the history, 200 MB a week, downloaded by every unshallow', 'HTML as extracted text, 2 MB cap'],
        ['ci-check-failing', '11-02', 'a workflow in the drop zone passed every local check and failed the format check once installed', 'Prettier covers the drop zone'],
        ['research-claim-marker', '11-03', 'both evening slots researched the same venture, twice', 'claim-research and research-landed (chapter 5)'],
      ],
      'Items built from the operation’s own queue, September to November 2026.',
    ),
    h3('The shape of a good fix'),
    p('Reading the table, the fixes share a shape worth stating:'),
    ol([
      '<strong>It is general.</strong> The claim marker guards every item, not the one that collided; the hosts file takes any host; the first-run check covers every workflow.',
      '<strong>It is a file or a script, not a sentence.</strong> A rule that lives only in a prompt is followed most of the time; a gate that fails a push is followed every time. Where a prompt change is needed it ships with the script that makes it checkable.',
      '<strong>It is cheap at the point of use.</strong> The cold gate runs in seconds before the twenty-minute install; the hook runs in under a minute before the ten-minute check; the slot marker is one push.',
      '<strong>It is dated and cited.</strong> Every <code>Changes:</code> line, every README paragraph and every script header names the item and the incident, so a reader can retire the fix when the cause is gone.',
      '<strong>It is logged where it will be read.</strong> The run log gets the line; the decision log gets the entry; the pipeline README gets the paragraph; the routine header gets the change.',
    ]),
    h3('What self-expansion does not mean'),
    p(
      'It does not mean the routines may change their own boundaries. The instruction file’s ask-before list, the bootstrap’s never-sentences and the routines README’s rule — never add a step that needs a secret, an account or money, never weaken a <code>Never …</code> sentence — are outside the queue’s reach. An item that would cross them is dropped with the reason. It also does not mean building tools for their own sake: the retro’s proposals must score, and a proposal without a repeated incident behind it scores poorly against product work. The queue’s weight is one; it competes.',
    ),
    tip('Give the operation one queue for itself, at the same weight as product work, and a weekly routine whose only job is to fill it from the week’s failures. The compounding is slow for a fortnight and then it is the reason the rest of the operation stays up.'),
  ].join('\n'),
};

const ch14: Chapter = {
  id: 'ch14-incidents',
  title: '14. The incident catalogue, in date order',
  body: [
    p(
      'This chapter is the operation’s failures in date order, each in a few lines: what happened, what it cost, what changed. The sources are the decision log, the run log and the routine headers. It is the chapter most worth rereading before you copy a rule, because the rule is only as good as the incident still being possible.',
    ),
    h3('September'),
    ul([
      '<strong>2026-09-23, Wednesday 17:09.</strong> The build was refused by the usage limit; nothing recorded it; the owner asked the next day. Cost: a slot and a day’s uncertainty. Change: the run watchdog, which reports a silent slot from the repository alone.',
      '<strong>2026-09-27 to 09-29.</strong> Three false alarms reached the owner in a week — a marketplace’s pricing-change mail, a registry’s publish confirmation, a key-rotation reminder for a key nothing used — all caused by the operation’s own scripts. Change: the self-caused register, read by the triage before any store mail is classified.',
      '<strong>2026-09-29 and 30.</strong> Three collisions between the 09:00 build and the 09:20 fallback: two merge conflicts, one slot spent on a duplicate. The fallback could only see a run that had finished. Change: the slot marker, pushed first.',
      '<strong>2026-09-30.</strong> Five prompt fixes queued behind the owner in two days; routines cannot edit their stored prompts and sandboxes cannot read them. Change: every stored prompt is a bootstrap; the prompt is a file.',
      '<strong>2026-09-30, 21:30.</strong> A commit message described a job that uses the skip-ci marker, and GitHub ran no workflow on that push. Change: a bold sentence in the drop-zone README; the marker is referred to by description.',
    ]),
    h3('October, first half'),
    ul([
      '<strong>2026-10-01, morning.</strong> Both build slots did nothing: the next item was null and there was no command to say which queue to research. Change: <code>pipeline empty</code>; the starvation fallback.',
      '<strong>2026-10-04.</strong> The data API’s nightly full reloads had written 94 million D1 rows against a 50 million allowance; the October invoice carried a US$44 overage. Change: delta refreshes (rows a day fell from millions to tens of thousands); the rule that a metered charge above the plan is a bug filed as an item.',
      '<strong>2026-10-04 and 05.</strong> Three red mains in two days, each an edit after the check had passed. Change: the committed pre-push hook.',
      '<strong>2026-10-05.</strong> A relay request sat queued for sixteen minutes; the routine’s fixed two-minute sleep had given up. Change: poll for the response commit for up to twenty minutes; a cancelled-unstarted run is re-fired.',
      '<strong>2026-10-05 and 06.</strong> Four burn-down firings on one night spent about twenty minutes each installing to learn the pipeline was starved. Change: the plain-Node cold gate before install.',
      '<strong>2026-10-05.</strong> One venture researched five times in a day; the next morning’s build offered it again. Change: 48-hour cooling.',
      '<strong>2026-10-06.</strong> Every sandbox spent thirty seconds timing out on a task-manager MCP server at session start that no routine used. Change: the MCP configuration is no longer checked in; the routines edit the task file offline.',
      '<strong>2026-10-07.</strong> The 17:00 burn-down and the 17:10 build each built the same item in full; the second push was discarded. Change: the claim push. A day later: npm ate the bare <code>--by=</code> flag; the script reads the npm config variable too.',
      '<strong>2026-10-08.</strong> A midnight run read a dated item against the previous day’s rows. Change: dated items are offered from 07:00 UTC, after the metrics jobs.',
      '<strong>2026-10-10.</strong> A stale depth-50 clone refused a plain fast-forward as divergence; the routine was 139 commits behind a plain descendant. Change: unshallow before any history read or push; the <code>work</code> branch fallback explained.',
      '<strong>2026-10-12.</strong> The 17:00 and 17:10 slots collided twice because the first working <code>next</code> came after a five-to-seven-minute install. Change: <code>next</code> and <code>claim</code> on plain Node before <code>npm ci</code>; the claim lands within a minute.',
      '<strong>2026-10-11.</strong> Thirteen routes of the pay-per-call lane were rejecting payment because their catalogue descriptions exceeded 500 characters, a limit the facilitator enforces on verify and settle, not on listing. Found by the first indexing round on 10-23. Change: the description budget; a test that every route stays under it.',
    ]),
    h3('October, second half'),
    ul([
      '<strong>2026-10-16.</strong> Thirteen commits to the relay script in a week, one per new host, each a full gate run. Change: the allowlist as a data file; a docs-only push starts only the relay job.',
      '<strong>Week 42.</strong> Three workflows failed on their first run and one never fired, each found by mail a day later. Change: the first-run check in every slot.',
      '<strong>2026-10-17 and 18.</strong> Each isolate start of the Worker wrote seventeen warning lines and seventeen error lines from a schema compiler that cannot generate code under the Workers runtime, hiding every real error. Change: the two exact lines are muted at the console; anything else passes through.',
      '<strong>2026-10-19.</strong> The phone-line job ran on every routine push — dozens a day — and its own two-hourly cron delivered about half the time. Change: cron only; the triage dispatches it when stale.',
      '<strong>2026-10-20 and 21.</strong> Tuesday night burned the week’s allowance; every slot of Wednesday was refused, including the exchange. Change: pacing while the usage report is stale; the missed-exchange fallback.',
      '<strong>2026-10-22.</strong> The 17:00 build and the 17:00 burn-down both researched the same venture; research had no claim. First change: the burn-down defers research when a build marker is in flight. (Not enough — see 11-03.)',
      '<strong>2026-10-24 and 26.</strong> Two slots stamped the same first-run line, each re-deriving the rule by hand. Change: <code>npm run first-runs</code>.',
      '<strong>2026-10-25.</strong> The pay-per-call clause read “19 paid, 4 clients” and fifteen of the nineteen were one catalogue prober paying each route once. Change: buyers and probers are split; the day-30 reads and the exchange triggers read buyers only.',
      '<strong>2026-10-26.</strong> The daily metrics job died on an extensionless relative import that Node on the runner rejects; the venture’s own gate had never run the root test that catches it. Change: the entry-import walk in the pre-push hook.',
      '<strong>Week 44.</strong> Wednesday went dark again with the Monday/Tuesday cap in place. Change: the week budget and the Wednesday reserve.',
      '<strong>2026-10-29.</strong> An unquoted colon in a step name; seven failed runs. Change: the YAML gate.',
      '<strong>2026-10-29.</strong> The owner’s fifteen-minute rule retired two finished products whose marketplace needed a forty-five-minute verified sign-up. Change: the rule is in the instruction file; requests are designed to fit it.',
      '<strong>2026-10-31.</strong> 469 MB of relay bodies in the history. Change: HTML as text, two-megabyte cap.',
    ]),
    h3('November'),
    ul([
      '<strong>2026-11-02.</strong> A workflow in the drop zone passed every local check and failed the format check once installed. Change: Prettier covers the drop zone.',
      '<strong>2026-11-03.</strong> Both evening slots researched the same venture again, two minutes apart. Change: research claims and the landed check.',
      '<strong>2026-11-05.</strong> A marketplace flagged an actor after three days of failed runs caused by the data store’s throttle; the triage filed the repair as an item and the build slot fixed it the same day (paged reads, a retry-after on a refused read). The second build of the evening found that a sale on the operation’s own checkout page reached no metrics row and queued the reading rather than building it unasked; the burn-down built it an hour later. No rule changed; the machinery worked as designed, which is the point of recording it.',
    ]),
    tip('Keep the catalogue in the order things happened, not in the order of the rules. The rules make sense only as answers, and a reader deciding whether to adopt one needs to see the question.'),
  ].join('\n'),
};

const ch15: Chapter = {
  id: 'ch15-starting-your-own',
  title: '15. Starting your own from the Extras',
  body: [
    p(
      'The Extras that accompany this book are the files the operation runs on, released under the MIT licence and scrubbed of anything specific to its products or its owner: the instruction file, the routine prompts, the pipeline scripts, the slot and watchdog scripts, the fetch-relay workflow and script, the pre-push hook, and a starter for the operations folder. This chapter is the order in which to adopt them, and what to change.',
    ),
    h3('Before you begin'),
    p(
      `You need a GitHub repository with Actions enabled, a Claude subscription that includes Claude Code’s scheduled cloud routines, a terminal, and a decision about what the operation is for. The last is not optional: every rule in the Extras assumes a queue of scored work and a plan with kill criteria, and an operation with neither will run its routines against an empty pipeline and stop at the gate every hour, correctly. ${c('npm run pipeline')} will tell you so.`,
    ),
    h3('Ten steps'),
    ol([
      '<strong>Copy the instruction file and cut it down.</strong> Keep the session-start rule, the atomic-push rule, the ask-before list and the owner-overview rule. Remove the stack details that are not yours and the dated incidents that cannot happen to you yet. Date the rules you keep.',
      '<strong>Create the operations folder.</strong> <code>docs/RUNS.md</code> (empty, with the line shape in a comment), <code>docs/ops/SLOTS.md</code>, <code>docs/ops/BURN.json</code> with your nights and stop line, <code>docs/ops/SELF-CAUSED.md</code> with its two empty tables, <code>docs/OWNER-NOTES.md</code>, <code>docs/ALERTS.md</code>, <code>docs/LEDGER.md</code> with your cap.',
      '<strong>Create the pipeline.</strong> One queue file with three scored items whose <code>why</code> carries the evidence and the arithmetic, and a weight. Run the validator. Make it part of your check.',
      '<strong>Install the pre-push hook.</strong> Put the hooks folder in the repository and the <code>prepare</code> script in the package file so <code>npm ci</code> arms it. Run it once by pushing a badly formatted file.',
      '<strong>Add the check workflow.</strong> The one that runs your full check on every push to main. Make the first routine’s STEP 0 read it.',
      '<strong>Write the first routine prompt.</strong> The build routine, from the Extras, with your venture names. Keep the order of chapter 4. Create the scheduled routine with the three-line bootstrap pointing at the file. Run it once by hand and read what it logged.',
      '<strong>Add the slot marker and the watchdog.</strong> The marker script and its line in the build prompt; the watchdog script and the workflow that runs it on a cron. Then the phone line, if you want one: a bot token in the repository secrets and the notify job.',
      '<strong>Add the fetch relay</strong> when the first routine reports a host it cannot reach: the workflow, the script, the hosts file with that one host, and the RELAY paragraph in the prompt.',
      '<strong>Add the evening burn-down</strong> when the build slots are reliably used, with the burn gate file and the pacing rules you need — probably only the percentage gate at first.',
      '<strong>Add the reading routines</strong> last: the metrics routine when you have a metrics table to fill, the inbox triage when there is an inbox, the weekly report when there is a week to report, the retro when there are failures to review, the exchange and the review when there is a plan to hold ventures against.',
    ]),
    h3('What to change'),
    ul([
      '<strong>The models and the schedule.</strong> The operation runs its deciding and building routines on the most capable model and its reading routines on a smaller one; the split is in the routines README. Your allowance and your daytime use set the hours; the operation’s owner wanted the day light and the evenings full, and the gates follow that.',
      '<strong>The gates’ contents.</strong> The pre-push hook re-checks what a late edit breaks <em>in this repository</em>: Prettier, ESLint, the entry-import walk, the run-log cap, the queue files, the workflow shape. Yours will differ. Keep the principle — under a minute, at the point of the mistake.',
      '<strong>The never-sentences.</strong> Keep every one that applies and add your own. The operation’s are about secrets, accounts, money, identity and platform terms; a different operation might add customer data or production databases.',
      '<strong>The notify conditions.</strong> Three, written down, and nothing else reaches the phone. Decide yours before the first routine runs, or the phone will decide for you.',
    ]),
    h3('What not to copy'),
    ul([
      'Workarounds for limits that may be gone: the shallow-clone unshallow, the plain-Node-before-install commands, the stale-report pacing. Each is dated; check the limit first.',
      'The product-specific paragraphs of the build prompt (how a dataset is built). They are examples of the level of detail a prompt needs, not instructions for you.',
      'The owner’s delegation. It is the owner’s to give. The Extras assume it; a reader whose owner — perhaps themselves — wants to approve each build should put that approval in the pipeline as a status, not remove the rules that make the unattended path safe.',
      'The thesis. The book shows one operation’s machinery; its bets (public-register data, small shelf products) are its own, and six weeks have not proven them. The machinery is the transferable part.',
    ]),
    h3('A first week'),
    p(
      'Expect the first week to be about the operation and not the products: the routine will find a host it cannot reach, an edit that turns the check red, a slot that was refused, a prompt sentence it misread. Each of those is an item in the operation’s queue, built by the next slot, and after a fortnight the queue turns back to product work on its own. The operation described here took about three weeks from its first scheduled routine to a week in which every slot that fired did product work, and most of the machinery in this book was built in those three weeks by the routines themselves.',
    ),
    tip('Start with one routine, one queue and one gate, and let the failures write the rest. The Extras are the answers; your repository will ask the questions in its own order.'),
  ].join('\n'),
};

const appendix: Chapter = {
  id: 'appendix',
  title: 'Appendix: glossary, line shapes and the file map of the Extras',
  backMatter: true,
  body: [
    h3('Glossary'),
    table(
      ['Term', 'Meaning here'],
      [
        ['routine', 'a scheduled Claude Code session: a fresh sandbox that clones the repository, works, pushes and is discarded'],
        ['bootstrap', 'the three-line stored prompt that clones main and reads the routine’s file'],
        ['slot', 'one scheduled firing of a routine; a build slot is 09:00 or 17:00 UTC'],
        ['trace', 'what a run leaves on main: a tagged run-log line and/or a suffixed commit subject'],
        ['marker', 'the one-line “started” push a build slot makes first, in the slots file'],
        ['claim', 'the one-commit “doing” push that reserves an item for a session; a research claim reserves a queue'],
        ['gate', 'a check that must pass: the full check, the pre-push hook, the burn gate, STEP 0'],
        ['cold / starved / cooling / waiting', 'the burn-down gate’s readings of the pipeline (chapter 5)'],
        ['paced', 'the burn-down gate’s reading when the usage report is stale and a cap is reached (chapter 9)'],
        ['relay', 'the request-file / response-commit handshake with a GitHub runner for hosts the sandbox cannot reach'],
        ['self-caused', 'mail a third party sends because of the operation’s own automation; registered, never escalated'],
        ['owner line / handoff line', 'an alert sent to the owner’s phone / an alert for the keyed interactive session'],
        ['action', 'a numbered batched request file for the owner, at most fifteen minutes'],
        ['exchange', 'the Wednesday routine that chooses the week’s bet'],
        ['spike', 'a research item of at most half a day with a numbered proof and a promote-or-park call'],
        ['review', 'the Sunday routine that holds every venture against the plan'],
        ['retro', 'the Saturday routine that reviews the operation itself and files items'],
        ['Blind Mode', 'the operation’s rule that no person-level data is stored or shown: organisations, counts, prices; never names, emails or addresses'],
      ],
    ),
    h3('Line shapes'),
    pre(`run log:        - YYYY-MM-DD HH:MM | <tag> | <one plain sentence, ≤ 120 chars>
built lines:    Built <venture> <id>: …   |   <venture> <id> done: …   |   Spike <id> done: …
notify line:    - YYYY-MM-DD HH:MM | notify | <one plain sentence, ≤ 90 chars, no jargon or file names>
owner line:     - YYYY-MM-DD owner: <what and where, ≤ 120 chars>
handoff line:   - YYYY-MM-DD handoff: <text>
slot marker:    - YYYY-MM-DD HH:MM | build | started
watchdog:       - YYYY-MM-DD HH:MM | watchdog | missed: … | stalled: … | ci-minutes: …
claim subject:  pipeline: claim <venture>/<id> (<routine>)
item subject:   <area>: <what> (<routine>)
relay subject:  relay: <name>
installer:      ci: install workflow(s) <name> …
decision log:   - YYYY-MM-DD <routine>: <what and why>`),
    h3('File map of the Extras'),
    pre(`README.md                          what each file is for, how to adopt them, what to change
LICENSE                            MIT
CLAUDE.md                          the instruction file (scrubbed)
package.json                       the npm scripts the routines call
docs/routines/README.md            the bootstrap and the editing rules
docs/routines/build.md             the daily build routine
docs/routines/burn-down.md         the evening burn-down
docs/routines/fallback.md          the build fallback
docs/routines/metrics.md           the daily metrics routine
docs/routines/inbox-triage.md      the hourly inbox triage
docs/routines/weekly-report.md     the Monday report
docs/routines/ops-retro.md         the Saturday retro
docs/routines/exchange.md          the Wednesday exchange
docs/routines/review.md            the Sunday review
docs/pipeline/README.md            the pipeline rules
docs/pipeline/queues/example.json  a queue with three scored items
docs/ops/BURN.json                 the burn gate
docs/ops/SELF-CAUSED.md            the register, empty
docs/ops/SLOTS.md, docs/RUNS.md    the slots file and the run log, empty
docs/relay/README.md, hosts.txt    the relay rules and an empty allowlist
docs/ci/README.md                  the drop zone rules
packages/core/src/pipeline.ts      the queue model the pipeline command imports
scripts/pipeline.ts, pipeline-cold.ts, pipeline-claim.ts   the queue commands
scripts/slot.ts, run-watchdog.ts, slot-utilisation.ts, handoffs.ts   slots and the watchdog
scripts/fetch-relay.mjs, fetch-relay-lines.ts              the relay
scripts/first-runs.ts, ci-workflow-yaml.ts, runs-check.ts, decisions-roll.ts   the gates
scripts/notify-owner.ts                                    the phone line
.githooks/pre-push                 the pre-push gate
workflows/check.yml, fetch-relay.yml, notify-owner.yml, run-watchdog.yml, workflow-installer.yml
LICENSE                            MIT`),
    p(
      'The Extras are assembled by a script from the operation’s repository and pass a scrub test — no secrets, no venture-specific names, no owner identity — before they are zipped. The versions of the files match this edition; later versions live in the operation and may differ.',
    ),
  ].join('\n'),
};

export const part4: Chapter[] = [ch12, ch13, ch14, ch15, appendix];
