# gankdat — demand evidence

Adopted into Foundry on 2026-09-19 from the owner's `giovf/faceless-api` repo (built 5–13 July
2026, live at https://gankdat.com since 9 July with Stripe billing and x402 on Base mainnet).
The owner's assessment is `docs/for-owner/incoming/gankdat-assessment.md`.

## Evidence gathered before the build (July 2026)
- Niche ranking, comparables (PlanAPI, PlanWire, Searchland), legal analysis and pivot
  thresholds: `.taskmaster/docs/niche-analysis.md`, `.taskmaster/docs/scope.md`, and the two
  source PDFs in `docs/`.
- Dataset pipeline and per-niche rationale: `docs/NICHE-RESEARCH-2026-07.md`,
  `docs/NICHE-NEXT-SANCTIONS.md`.
- Positioning: lead with procurement / bid intelligence and the agent-native angle (MCP +
  x402); planning is a bundled second dataset (`docs/GO-TO-MARKET.md`).

## Signal since launch (measured 2026-09-19)
| Metric | Value |
| --- | --- |
| Accounts | 4 (all 8 Jul — test accounts), 0 paid, waitlist 0 |
| Stripe | 1 × £10 test subscription (9 Jul), cancelled |
| x402 | 2 paid requests, both the owner's live verification (10 Jul) |
| MCP traffic (30 d) | ~34.5k anonymous, ~1.7k blocked `tools/call` — crawlers, liveness bots, security researchers; no identifiable buyer |
| Marketing | `docs/STAGE0-PLAYBOOK.md` never executed; pre-commit log empty |

Reading: unvalidated, not failed — no distribution was attempted. Validation gate under
Foundry rules: the paid competitors exist (PlanAPI, PlanWire, Searchland, OpenOpps for
tenders), the job recurs (weekly bid pipelines, KYB checks), build is done, no ToS risk
(official open-licence feeds only). Missing: buyers with money, to be proven by
distribution rather than more build.

## Kill / pivot criteria (from `docs/RUNBOOK.md`)
- <£300 MRR after 4 months of real marketing → reposition or merge into a compliance feed.
- Per-dataset: retire anything that never loads or never gets queried (dataset isolation
  rule keeps this to one file + a registry entry).

## Costs
Cloudflare Workers Paid ≈ US$5/month (only recurring cost in the portfolio), domain renewal
(date TBC by owner). Everything else is free tier.
