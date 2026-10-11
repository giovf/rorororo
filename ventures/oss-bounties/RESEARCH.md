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
