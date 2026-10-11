# Open-source bounties — research

Owner direction 2026-10-11: collect money already on offer. This line takes paid feature and
bug-fix issues on open-source projects. It does **not** take security-testing or vulnerability
programmes of any kind — those are out of scope for this operation (STRATEGY §1).

## 1. The job

A maintainer or sponsor attaches cash to a GitHub issue through a bounty board (Algora is the
largest: the issue gets a `💎 Bounty` label and a `/bounty $N` comment); whoever opens the pull
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

## Metrics

| Date | Event | Users | Rating | Sales | Notes |
| --- | --- | --- | --- | --- | --- |
| 2026-10-11 | Validated | — | — | — | 553 open labelled bounties; scanner queued; PR_TOKEN and sign-in pending |
| 2026-10-11 | Board | — | — | — | first board: 498 read, 56 kept; three items filed (blocked on actions 021/022) |
| 2026-10-11 | Unblocked | — | — | — | PR_TOKEN present, owner signed in to the board; first bounty PR is buildable |
| 2026-10-11 | No claim | — | — | — | top three unbuildable (assigned + hardware, unfunded request, report); scanner now marks funding and taken; first-bounty-pr blocked on a free funded row |
