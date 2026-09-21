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

## Metrics

| Date | Event | Users | Likes | Purchases | Notes |
|---|---|---|---|---|---|
| 2026-09-20 | Daily check | — | — | — | no store listing to check (channel: web/API + MCP + x402); see "Signal since launch" above for real usage/revenue signal |
| 2026-09-20 | Daily numbers | 5 accts (0 paid, +1/24h) | — | 0 x402 paid | MCP 24h: 4 authed, 1286 anon, 57 paywall hits; refresh errors: sam-exclusions |
| 2026-09-21 | Daily numbers | 0 accts (0 paid, +0/24h) | — | 0 x402 paid | MCP 24h: 180 authed, 1973 anon, 160 paywall hits; wanted: list_sources 6, query_uk_sponsors 3, query_uk_care_locations 3; refresh errors: uk-care-locations, uk-charities, uk-contract-awards, uk-food-hygiene |

## No-website lead feed (2026-09-21)

Owner idea (outreach venture) reshaped into data: a `<field>_present` filter on every dataset and
`website_present` exposed on uk-care-locations, uk-charities and uk-schools, plus the Apify actor
`uk-no-website-leads` (one merged row shape, sector + area filters, charities defaulted to income
≥ £25k). Buyers: web agencies / freelancers / site-builder SaaS prospecting (Apify already sells
"businesses without websites" scrapers built on Google Maps at US$1–5 per 1k; ours is
register-complete and organisation-level, no scraping). Proof number: paid runs of this actor
and `website_present=false` calls in Analytics Engine (30 days). Kill if zero after 60 days live.

