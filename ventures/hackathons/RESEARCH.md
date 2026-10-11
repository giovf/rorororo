# Hackathon prizes — research

Owner direction 2026-10-11: take money that is already on offer on the internet instead of only
building products and waiting for buyers; research from primary sources (the boards' own APIs and
official rules), never from articles about making money. This file is the evidence.

## 1. The job

Online hackathons publish cash prize tables, accept individuals and existing projects, and judge on
merit. The portfolio already has entrants: gankdat (MCP server, x402 agent payments, 16 datasets),
the Foundry operation (an autonomous Claude-run portfolio with routines, queues and self-heal) and
the extensions. An entry costs a write-up, a repo link, a working demo and a short video.

## 2. Evidence (primary sources, read 2026-10-11)

Devpost's public API (`GET devpost.com/api/hackathons?status[]=open&challenge_type[]=online`):
**38 open online hackathons**. The largest with their official rules read the same day:

| Hackathon | Pool | Submissions close | What it requires | Fit |
| --- | --- | --- | --- | --- |
| PayPal AI Hackathon | $67,500 (1st $12k, 2nd $8k, 3rd $5k + category prizes) | 2026-11-12 | integrate the PayPal developer platform (free sandbox) + AI; new or existing projects with meaningful progress during the period; functional demo | **high** — gankdat sells data to agents; a PayPal sandbox checkout for credits + the MCP server is "agentic commerce" end to end |
| Nebius × NVIDIA Global AI Hackathon | $50,000 (grand $20k, 2nd $10k, 3rd $6k + track awards) | 2026-10-30 | run on Nebius Token Factory / AI Cloud with at least one NVIDIA open model | **dropped 2026-10-11** — Nebius sign-up asked the owner for a credit card; no card on a £0 line |
| GitLab "Life After Code" | $45,000 | 2026-10-27 | GitLab Duo Agent Platform features; Path B needs an MIT-licensed project (this repo is GPL-3) | low — Duo access and a licence mismatch |
| Amazon Developer Hackathon | $138,000 | 2026-10-23 | Fire TV / Alexa tracks | none |
| Meta VR Start | $1,000,000 | 2026-11-18 | AR/VR | none |

Eligibility (identical Devpost rules text across the three): open to individuals of the age of
majority; the UK is not on any exclusion list. Entries are submitted by the owner's Devpost account
(one-off, action 022); everything else is built by routines.

## 3. Validation gate

- Buyers with money: the prize money is already committed by the sponsor — the only "buyer" is a judge.
- Recurring job: Devpost lists tens of open online hackathons at any time; a scanner keeps the board fresh.
- Competitor gap: entries are judged on working software and a clear story; the portfolio's entrants are live products with real data, which most hackathon entries are not.
- ≤ 1 week to build: each entry reuses a live product; the new part is the sponsor-specific integration and the submission package.
- Policy (checked 2026-10-11 at the owner's request, from the official rules and Devpost's Terms of Service):
  - Neither hackathon's rules restrict AI tools; PayPal's say "Any AI tool works, as long as PayPal integration is central". Judging weighs "genuine effort and a working, non-trivial implementation", which is what the entry must show.
  - The Submission must be the Entrant's original work, solely owned by the Entrant. Code produced by Claude Code at the owner's direction is the owner's to own under Anthropic's terms, so this holds; the write-up states plainly that the project was built with Claude Code under the owner's direction — judges may discount that, but nothing forbids it.
  - The Entrant is a human individual (the owner), who registers, submits and would receive the prize; routines prepare the package only. Existing projects qualify if "significantly updated" during the submission period, and the entrant must explain how.
  - **Devpost's Terms of Service §4 forbid automated software to access, scrape or crawl the site.** The 2026-10-11 API read was a one-off and is not repeated: the `hackathon-scanner` item is dropped, and hackathons are found from sponsors' own sites.
  - Prizes are income of the owner's sole trade (the ledger records them; the £1,000 trading allowance and Self Assessment rules apply as for any revenue).
  - Nebius's terms page could not be read from here (404); the Nebius entry item re-reads the sign-up terms before any build and stops if they exclude the use.

## 4. Costs

£0. PayPal's sandbox and Devpost are free; Nebius sign-up may offer hackathon credits — if it asks
for a card the entry is dropped (ledger rule: net outlay ≤ £100, overspend only from profit).

## 5. Risks

Prizes are a lottery weighted by merit: a placing is likely only when the entry is unusually
complete. A video is required by most portals — `demo-video-pipeline` records it with Playwright.
Judges may discount AI-built entries; the submission says plainly how it was built.

## 6. Proof and kill

Proof: a prize (any placing) credited within 60 days of the first submission. Kill: three complete
submissions with no placing and no judge feedback → `finished`.

## Metrics

| Date | Event | Users | Rating | Sales | Notes |
| --- | --- | --- | --- | --- | --- |
| 2026-10-11 | Validated | — | — | — | 38 open online hackathons on Devpost; two high-fit entries queued; owner action 022 (accounts) |
| 2026-10-11 | Accounts | — | — | — | owner on Devpost + joined PayPal AI; PayPal sandbox keys set; Nebius dropped (card required) |
