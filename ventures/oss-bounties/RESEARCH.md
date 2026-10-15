# Open-source bounties — research

Owner direction 2026-10-11: collect money already on offer. This line takes paid feature and
bug-fix issues on open-source projects. It does **not** take security-testing or vulnerability
programmes of any kind — those are out of scope for this operation (STRATEGY §1).

## 1. The job

A maintainer or sponsor attaches cash to a GitHub issue through a bounty board (Algora is the
largest: the issue gets a `💎 Bounty` label and a `/bounty $N` comment; Opire is the second, read
since 2026-10-14 — a code owner's `/reward N`, paid by hand after the merge, not escrowed); whoever opens the pull
request that closes it writes `/claim #<issue>` and is paid when the maintainer merges and
releases the reward. The work is ordinary software engineering with tests, in the project's
language and conventions.

## 2. Evidence (primary source: GitHub's search API, 2026-10-11)

- `is:issue is:open label:"💎 Bounty"` → **553 open issues**.
- `is:issue is:open "/bounty $" in:comments` → 19,262 open issues that have carried a bounty comment.
- Amounts on the first page of results: $50 to $800 per issue.
- The first page is dominated by one repository that is a security-testing sandbox; the scanner
  excludes such repositories and anything whose issue is a vulnerability report.
- Corrected the same day by the scanner's first run: the label alone is thin and stale (287 of the
  522 sit outside three fixture repositories, 182 of those in one more), while the bounty bot's
  `/bounty $N` command appears on 1,496 issues created since 2026-09-01. The board therefore reads
  `"/bounty $" in:comments` over the last 90 days plus the label. First board (`docs/bounties/BOARD.md`,
  2026-10-11): 498 issues read, 56 kept with an amount after dropping sandboxes and security
  repositories (103), repositories under 20 stars (262), forks, archived and stale ones; top amounts
  $3,000 (tenstorrent/tt-metal, Python), $1,219 (Arrow-air, a hardware report — poor fit), $650
  (tursodatabase/turso, Rust).

### 2a. What the first board taught (2026-10-11, build run, read on github.com)

The board's amounts were not all money on offer, and the money on offer was not all free to claim:

- tenstorrent/tt-metal#59732 ($3,000, a real Tenstorrent bounty): assigned on 10-08, a PR submitted by
  10-11, and the acceptance criteria require runs on Wormhole and Blackhole hardware. Dropped.
- tursodatabase/turso#8749 ("$650"): a contributor wrote `/bounty $650` on 09-18 asking to be paid; no
  maintainer or bot funded it. One `/attempt`, two more offers. Dropped — nothing is posted.
- Arrow-air/project-quiver#256 ($1,219): a platform-engineering report for a hardware project — not code
  with tests. Dropped.
- SUSU-LABS/susu-indexer#37 ($80, posted by the maintainer): two PRs open within two days, payout terms
  unstated, wallet addresses in the comments. Not taken.
- BasedHardware/omi "$250"/"$50" rows: the issue authors' own "bounty proposals", each with the author's
  PR already open.

Every funded issue read had at least one agent-written PR or comment within days (one account posted
near-identical "verified patch" comments with payout details on four of the threads read). So the
scanner now (a) counts a `$N` as funded only when a label, the bounty bot or a maintainer (OWNER,
MEMBER or COLLABORATOR) posted it and the text is not a proposal — contributor proposals are dropped
as `proposed, not funded`; (b) reads assignees and the timeline's open linked PRs, shows them in a
`Taken` column, divides the rank by (1 + open PRs + assigned) and files only free issues. Expect the
next board to be much shorter than 56 rows; if it is empty for a week, the line's thesis (speed and
tests win) is wrong and the kill rule applies early. Algora's own site is unreachable from the sandbox
(DNS), so GitHub stays the only source.

The second board (2026-10-12, 498 read, 16 kept) filed three free funded items and both 17:00 routines
dropped them after a read: useagent#61 ($80) is a whole Expo app the maintainer assigns to one of four
claimants and verifies on a real iPhone and Android with the claimant's own recordings; useagent#113 ($5 per
task) pays a person to run recorded sessions by hand and forbids runs by other AIs; Salam#1713 (AUD $5) is a
community reward for a showcase repo. Six of six filed items dropped in two days, each read costing a slot,
so the scanner now reads the title and body for those shapes: `CONTEST_ISSUE` (contests, showcases, usage
tasks) with a $25 floor from the burn-down, and `SHAPE_RULES` (real-device recordings, claims the maintainer
hands out first, hardware) from the build, each with its reason in the board's dropped counts. The thesis is
still untested — no code bounty free of competition has reached the queue; a board empty of code work for a
week triggers the §5 kill rule as much as an empty board does.

## 3. Validation gate

- Buyers with money: the amount is posted on the issue before any work starts.
- Recurring job: hundreds of open bounties at any time; new ones daily.
- Competitor gap: most bounties sit open for weeks (the dates on the first page run back to May); speed and test coverage win.
- ≤ 1 week: one issue at a time, 0.5–2 days each.
- Policy: respect each repository's contribution rules — a project that forbids AI-assisted contributions is skipped; the PR says how it was built; the licence is left as found. No security testing.

## 4. What it needs

- `PR_TOKEN` (action 021, still not in the repository secrets on 2026-10-11) so CI can fork and push.
- A one-off sign-in to the board with the owner's GitHub account (action 022); payout details only when the first bounty is awarded.

## 5. Proof and kill

Proof: the first bounty paid out, recorded as a `revenue` row. Kill: five merged-quality PRs with no
payout in 60 days → `finished`.

## Claims

Every bounty the routines took up, one row each — the line's record for STRATEGY §4 and the §5 kill
rule, kept by the build and burn-down routines in the same commit as the step (oss-bounties
`bounty-claim-ledger`, 2026-10-11). Status runs `reading` (item taken, issue being read) → `claimed`
(PR open with `/claim`) → `merged` → `paid` (a `revenue` row in `docs/LEDGER.md` the same day), or ends
`rejected` (PR closed unmerged) or `dropped` (not taken; Notes start with the date and say why).
`npm run claims` (part of `npm run check`) validates the table and prints the totals, the kill-rule
count and the `week:` line the weekly report copies.

| Issue | Amount | Status | PR | Opened | Merged | Paid | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [tenstorrent/tt-metal#59732](https://github.com/tenstorrent/tt-metal/issues/59732) | $3000 | dropped | — | — | — | — | 2026-10-11: assigned 10-08 with PR #60225 submitted; acceptance needs Wormhole and Blackhole hardware |
| [tursodatabase/turso#8749](https://github.com/tursodatabase/turso/issues/8749) | $650 | dropped | — | — | — | — | 2026-10-11: a contributor's own `/bounty` ask on 09-18, no maintainer or bot funded it; one attempt, two offers |
| [Arrow-air/project-quiver#256](https://github.com/Arrow-air/project-quiver/issues/256) | $1219 | dropped | — | — | — | — | 2026-10-11: a platform-engineering report for a hardware project, not code with tests |
| [useagenthq/useagent#61](https://github.com/useagenthq/useagent/issues/61) | $80 | dropped | — | — | — | — | 2026-10-12: maintainer assigns one of four claimants (none picked since 10-05); real iPhone and Android builds with the claimant's own recordings; weeks of app work for $80 |
| [useagenthq/useagent#113](https://github.com/useagenthq/useagent/issues/113) | $5 | dropped | — | — | — | — | 2026-10-12: a usage task, not a fix — record yourself using their product and email a report from a sign-up address; AI-driven runs banned; all 3 tasks claimed 10-11 |
| [SalamLang/Salam#1713](https://github.com/SalamLang/Salam/issues/1713) | $5 | dropped | — | — | — | — | 2026-10-12: a community reward for publishing a new app in Salam, not a fix; only the first two accepted projects are paid and nine complete submissions were ahead |

## Research 2026-10-13 (pipeline starved — burn-down)

Read: `docs/bounties/BOARD.md` of 2026-10-12 (written 13:12 UTC, before the 17:18 shape rules), the
`## Claims` table, the queue. **The board:** 498 read, 16 kept, and not one free funded fix among them —
the three free rows are useagent#61 (device recordings, maintainer-assigned), useagent#113 (a usage
task) and Salam#1713 (a contest), all dropped on 10-12 and all shapes the scanner now drops by rule;
every other row carries 1–14 open PRs and is 2–5 years old (gyroflow #45/#150/#742, onyx #2281,
EdgeChains, highlight), where a fifteenth PR is a lottery, not work. **What changes next:** the
05:17 board of 10-13 is the first run with the contest, usage-task, device and assignment drops and
the US$25 floor, and the 10-14 board the second; the scanner files the queue item itself when a free
funded fix appears, so a research pass before then has nothing to read. **No items added:**
`research_after: 2026-10-14`. **For the Sunday review (STRATEGY §7):** if two boards under the new
rules keep 0 free funded fixes, the line's recurring-job assumption (§3) is weaker than the 10-11
count of 553 labelled issues suggested — most of that money is assigned, crowded or not a fix — and
the review should set a board-count trigger beside the PR-based kill rule.

## Research 2026-10-14 (build, `bounty-board-opire-source`): Opire as a second source

Read through the relay: `docs.opire.dev` (overview/commands, rewards/pricing, rewards/lifecycle, faq,
install-bot — a Docusaurus site, pre-rendered), Opire's app page (`app.opire.dev`, server-rendered), five
GitHub searches and six issue threads (`docs/relay/responses/opire-*-2026-10-14/`).

**How Opire works.** Only a code owner creates a bounty, from US$20, with `/reward N` (USD, no `$`) in an
issue or comment of a repository where OpireBot is installed, or from the app dashboard. Developers post
`/try`, then `/claim #N` on the pull request. "Creating or claiming a bounty does not create an automatic
payment … each creator reviews whether it meets the requirements described in the issue. If it does, that
creator arranges payment for their own bounty" — Opire publishes and tracks; nobody holds the money. So an
Opire row is `not escrowed` on the board and in the filed item.

**What it leaves on GitHub.** OpireBot appends the same footer to every issue of a repository it is on
("This repo is using Opire … commenting `/reward 100`"), funded or not — 525 open issues created since
07-16 carry it, 89 of them in three agent-farm repositories the repository rules drop. A reward created
from the app leaves nothing a search finds (oxc#611, Opire's own showcase: the funder's manual comment and
a link to app.opire.dev; 1 open issue on all of GitHub links an Opire issue page). OpireBot's reply to a
`/try` on an unfunded issue is "😅 Ups... this issue does not have any reward yet!" (probe-rs#4355). No
funded `/reward` by a code owner turned up in the 300 footer issues read.

**How big it is (Opire's own page, 2026-10-14).** 44 bounties paid ever, US$4,975.87 in total; **6 open
rewards worth US$212** on five issues: rodrigompy/bugb#1 ($100, a 2026-05 repository with one issue and
no language — sandbox-shaped, under 20 stars), radumarias/rencfs#3 ($42, Rust, 2024-07, "research
implementation for Windows" — research, not a fix), trovu/trovu#329 ($30, TypeScript, 2024-04, 38 trying
and 23 claimants), flowese/UdioWrapper#7 ($20, Python, 2024-04, "auto solve hCaptcha" — CAPTCHA
circumvention, out by policy), buape/kiai-bounties#1 ($20, 2025-06, a Discord-bot feature, nobody trying).
Nothing here is a free funded fix the routines would take.

**What the scanner now does.** Strips the footer before any text is read (its `/reward 100` and
`/tip 20` are examples); searches the footer issues (one page, most recently updated) and reads the comments of up to 40
of them for a code owner's `/reward N` or OpireBot's reward comment; reads Opire's app page for the open
rewards and adds each listed open issue to the pool at the listed amount; marks such money
`escrowed: false` (escrowed money wins over an Opire reward of the same size); drops a `/reward` from
anyone but a code owner as `reward not from a code owner`; the Taken column reads `free, not escrowed`
and the filed item's title says `(Opire, not escrowed)`. The board header counts the Opire list.

**Verdict for the Sunday review.** Opire adds at most a handful of rows a year: its whole open supply is
five issues and US$212, four of them from 2024–2025, and the money is a promise, not an escrow. It does
not change the board-count picture — the 10-14 board had 8 kept, 0 free funded fixes — and it is not a
reason to keep the line open on its own. The board-count trigger asked for on 10-13 stands.

## Research 2026-10-15 (pipeline starved — burn-down)

Read: the 10-14 board (498 read, 8 kept, 0 free funded fixes — the second board under the 10-12 shape
rules, so the board-count trigger the 10-13 pass asked for is now the Sunday review's decision on
10-18), the 10-14 Opire verdict, the `## Claims` table, the queue. **Third sources, by web search
(the sandbox resolves none of the boards' hosts):** Algora's documented API is org-scoped behind a
bearer token (`docs.algora.io/refs/bounty`), but its console's tRPC endpoint (`bounty.list` with
`status: "active"` and no org, the call its own SDK makes) is what two keyless third-party scanners
read — unverified; IssueHunt (`oss.issuehunt.io`) still lists funded issues; BountyHub and Gitpay
are directory entries with no visible supply; Bountysource is discontinued. A relay request
(`algora-issuehunt-2026-10-15`) reads the Algora endpoint and IssueHunt's funded list so the review
has the answer on `main`; a keyless cross-org list would make Algora a third scanner source only
if it shows free funded fixes GitHub's search misses (bounties posted from the console without a
`/bounty` comment, or older than 90 days). **No items added:** `research_after: 2026-10-18`, the
Sunday review that sets the board-count trigger; if it keeps the line open, the exchange files the
Algora-API source item from the relay reading.

**Relay reading, the same night (`docs/relay/responses/algora-issuehunt-2026-10-15/`).** Algora's
console tRPC `bounty.list` with `status: "active"` and no org answers 200 with `items: []` (both
call shapes), and `/api/bounties` redirects to an HTML page reading "Open 0, Completed 0, No open
bounties": there is no keyless cross-org list — Algora's money is only readable per org with that
org's token, so the `/bounty` comments GitHub's search already finds stay the Algora source.
IssueHunt's browse page lists repositories by cumulative funds raised (Boostnote US$7,060, remotion
US$6,909, ant-design US$6,188 …) under a 2019 BoostIO footer; the amounts are lifetime totals on
mostly dormant projects, not open issues, and a supply read would need every repository's own
issue page. Neither becomes a scanner source; the Sunday review decides the line on the board
count alone.

## Metrics

| Date | Event | Users | Rating | Sales | Notes |
| --- | --- | --- | --- | --- | --- |
| 2026-10-11 | Validated | — | — | — | 553 open labelled bounties; scanner queued; PR_TOKEN and sign-in pending |
| 2026-10-11 | Board | — | — | — | first board: 498 read, 56 kept; three items filed (blocked on actions 021/022) |
| 2026-10-11 | Unblocked | — | — | — | PR_TOKEN present, owner signed in to the board; first bounty PR is buildable |
| 2026-10-11 | No claim | — | — | — | top three unbuildable (assigned + hardware, unfunded request, report); scanner now marks funding and taken; first-bounty-pr blocked on a free funded row |
| 2026-10-11 | Claim ledger | — | — | — | `## Claims` table + `npm run claims`: 0 claimed, 0 merged, 0 paid, 3 dropped; weekly report reads it |
| 2026-10-12 | Scanner fix | — | — | — | 5 of 5 filed items dropped unbuilt (assigned, unfunded, report, usage task, contest); scanner now drops contests and usage tasks and files nothing under $25 |
| 2026-10-12 | No claim | — | — | — | useagent#61 ($80) dropped on read: maintainer-assigned, real-phone recordings, weeks of app work; 6 of 6 filed items dropped; scanner also drops device, assigned and hardware shapes |
| 2026-10-13 | Research | — | — | — | 10-12 board: 16 kept, 0 free funded fixes (free rows are dropped shapes, the rest 1–14 PRs deep); research_after 10-14 after two boards under the new rules |
| 2026-10-14 | Second source | — | — | — | Opire read: 6 open rewards worth $212 on 5 issues, none a free funded fix; scanner reads Opire's list and `/reward`, marks rows `not escrowed`; 10-14 board 8 kept, 0 free |
| 2026-10-15 | Research | — | — | — | 10-14 board 8 kept, 0 free (second board under the new rules); Algora tRPC list + IssueHunt sent to the relay; waiting until the 10-18 review |
