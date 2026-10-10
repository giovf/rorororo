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
| 2026-09-22 | Daily numbers | 0 accts (0 paid, +0/24h) | — | 0 x402 paid | MCP 24h: 222 authed, 1635 anon, 46 paywall hits; wanted: query_uk_sanctions 5, list_sources 5, query_uk_tenders 4; refresh errors: uk-insolvency |
| 2026-09-23 | Daily numbers | 0 accts (0 paid, +0/24h) | — | 0 x402 paid | MCP 24h: 180 authed, 1595 anon, 18 paywall hits; wanted: sandbox.execute_shell 13, __verifymcp_auth_probe_068d3465e6aaddc4__ 1, __verifymcp_auth_probe_d51cd2b4d8b27c7c__ 1; refresh errors: nhs-ods, sam-exclusions, uk-charities |
| 2026-09-24 | Daily numbers | 0 accts (0 paid, +0/24h) | — | 0 x402 paid | MCP 24h: 156 authed, 1706 anon, 21 paywall hits; wanted: list_sources 3, query_uk_sponsors 1, query_uk_contract_awards 1; refresh errors: eu-ted, nhs-ods |
| 2026-09-25 | Daily numbers | 0 accts (0 paid, +0/24h) | — | 0 x402 paid | MCP 24h: 192 authed, 1863 anon, 24 paywall hits; wanted: get_usage 2, query_eu_ted 2, list_sources 2; agent sign-up: 0 req/24h, 0 keys/24h, 0 keys/30d; refresh errors: uk-insolvency |
| 2026-09-26 | Daily numbers | 0 accts (0 paid, +0/24h) | — | 0 x402 paid | MCP 24h: 186 authed, 1749 anon, 22 paywall hits; wanted: list_sources 4, query_uk_sponsors 1, query_uk_contract_awards 1; agent sign-up: 0 req/24h, 0 keys/24h, 0 keys/30d; refresh ok |
| 2026-09-27 | Daily numbers | 0 accts (0 paid, +0/24h) | — | 0 x402 paid | MCP 24h: 189 authed, 1771 anon, 27 paywall hits; wanted: list_sources 3, query_uk_sanctions 3, query_uk_contract_awards 2; agent sign-up: 0 req/24h, 0 keys/24h, 0 keys/30d; refresh ok |
| 2026-09-28 | Daily numbers | 1 accts (0 paid, +1/24h) | — | 0 x402 paid | MCP 24h: 204 authed, 1717 anon, 48 paywall hits; wanted: list_sources 7, get_usage 6, query_uk_planning 3; agent sign-up: 0 req/24h, 0 keys/24h, 0 keys/30d; refresh errors: uk-charities (D1_ERROR: Network connection lost.), uk-insolvency (Unexpected end of JSON input), uk-trademark-journal (D1_ERROR: internal error; reference = pvpjl6o7idm7cdijf25nr275) |
| 2026-09-29 | Daily numbers | 1 accts (0 paid, +0/24h) | — | 0 x402 paid | MCP 24h: 198 authed, 1600 anon, 81 paywall hits; wanted: list_sources 8, query_uk_tenders 5, query_uk_sponsors 4; agent sign-up: 0 req/24h, 0 keys/24h, 0 keys/30d; refresh errors: uk-insolvency (thegazette.co.uk responded 500) |
| 2026-09-30 | Daily numbers | 1 accts (0 paid, +0/24h) | — | 0 x402 paid | MCP 24h: 138 authed, 1393 anon, 1 preview, 83 paywall hits; wanted: list_sources 8, query_uk_companies 5, query_uk_food_hygiene 5; changes 7d: 0 (mcp 0, rest 0); agent sign-up: 0 req/24h, 0 keys/24h, 0 keys/30d; refresh errors: uk-insolvency (thegazette.co.uk page results-page=1: Unexpected end of JSON input after 3 reads (0 bytes,) |
| 2026-10-01 | Daily numbers | 1 accts (0 paid, +0/24h) | — | 0 x402 paid | MCP 24h: 177 authed, 1395 anon, 114 preview, 6 paywall hits; wanted: connect_account 6; changes 7d: 0 (mcp 0, rest 0); apify: 104 runs (baseline), 17 users/30d, 17 public; agent sign-up: 0 req/24h, 0 keys/24h, 0 keys/30d; oauth: 0 connects/24h, 0/30d; refresh errors: eu-ted (api.ted.europa.eu responded 429) |
| 2026-10-02 | Daily numbers | 1 accts (0 paid, +0/24h) | — | 0 x402 paid | MCP 24h: 177 authed, 1541 anon, 117 preview, 18 paywall hits; wanted: connect_account 6, query_eu_ted 2, query_uk_sanctions 1; changes 7d: 0 (mcp 0, rest 0); apify: 116 runs (+12/24h), 17 users/30d, 17 public; agent sign-up: 0 req/24h, 0 keys/24h, 0 keys/30d; oauth: 0 connects/24h, 0/30d; refresh errors: uk-food-hygiene (D1_ERROR: Network connection lost.), uk-insolvency (thegazette.co.uk page results-page=1: body cut by the origin after 4 reads (0 bytes, conte) |
| 2026-10-03 | Daily numbers | 1 accts (0 paid, +0/24h) | — | 0 x402 paid | MCP 24h: 138 authed, 1450 anon, 95 preview, 16 paywall hits; wanted: connect_account 4, query_eu_ted 2, query_uk_sanctions 1; changes 7d: 0 (mcp 0, rest 0); apify: 127 runs (+11/24h), 17 users/30d, 17 public; agent sign-up: 0 req/24h, 0 keys/24h, 0 keys/30d; oauth: 0 connects/24h, 0/30d; refresh errors: uk-contract-awards (refresh returned 0 records), uk-insolvency (thegazette.co.uk page results-page=1: body cut by the origin after 4 reads (0 bytes, conte) |
| 2026-10-04 | Daily numbers | 1 accts (0 paid, +0/24h) | — | 0 x402 paid | MCP 24h: 123 authed, 1377 anon, 54 preview, 3 paywall hits; wanted: connect_account 3; changes 7d: 0 (mcp 0, rest 0); apify: 143 runs (+16/24h), 17 users/30d, 17 public; agent sign-up: 0 req/24h, 0 keys/24h, 0 keys/30d; oauth: 0 connects/24h, 0/30d; cf usage (09-10→10-04): d1 87.5M writes / 723.4M reads, 3.3 GB, kv 0.0M reads / 0.0M writes, workers 0.1M req, ae 0.0M pts ≈ US$38 overage (d1 writes US$38); refresh errors: uk-insolvency (thegazette.co.uk page results-page=1: body cut by the origin after 4 reads (0 bytes, conte) |
| 2026-10-05 | Daily numbers | 1 accts (0 paid, +0/24h) | — | 0 x402 paid | MCP 24h: 199 authed, 1385 anon, 78 preview, 6 paywall hits; wanted: connect_account 6; changes 7d: 0 (mcp 0, rest 0); indexnow: 41 urls 429; feeds 30d: n/a; apify: 160 runs (+17/24h), 30d: 158 runs (1 ours, 157 others), 17 users/30d, 17 public; apify 30d by actor: uk-food-hygiene-ratings 12, uk-care-locations-cqc 11, uk-charities-register 11, uk-new-companies-incorporations 11, uk-public-tenders-find-a-tender 11, uk-visa-sponsors-register 11, eu-public-tenders-ted 10, uk-corporate-insolvency-notices-gazette 10, uk-planning-applications 10, uk-sanctions-list-fcdo 10, us-federal-exclusions-sam-gov 9, nhs-organisations-ods 7, uk-contract-awards-contracts-finder 7, uk-no-website-leads 7, uk-schools-gias-ofsted 7, uk-trademark-journal-watch 7, uk-gambling-commission-licence-register 6; agent sign-up: 0 req/24h, 0 keys/24h, 0 keys/30d; oauth: 0 connects/24h, 0/30d (7d by client: claude.ai 1); cf usage (09-10→10-05): d1 93.6M writes / 794.4M reads, 3.6 GB, kv 0.0M reads / 0.0M writes, workers 0.1M req, ae 0.0M pts ≈ US$44 overage (d1 writes US$44); datasets 30d: uk-care-locations 99, nhs-ods 52, eu-ted 51, uk-companies 51, uk-tenders 51, sam-exclusions 50, uk-charities 50, uk-contract-awards 50, uk-food-hygiene 50, uk-gambling-operators 50, uk-planning 50, uk-sanctions 50, uk-schools 50, uk-insolvency 49, uk-sponsors 49, uk-trademark-journal 49; refresh ok |
| 2026-10-06 | Daily numbers | 1 accts (0 paid, +0/24h) | — | 0 x402 paid | MCP 24h: 93 authed, 1411 anon, 111 preview, 5 paywall hits; wanted: connect_account 5; changes 7d: 0 (mcp 0, rest 0); indexnow: 40 urls 429; feeds 30d: n/a; apify: 177 runs (+17/24h), 30d: 170 runs (1 ours, 169 others), 17 users/30d, 17 public; apify 30d by actor: uk-food-hygiene-ratings 13, uk-care-locations-cqc 12, uk-charities-register 12, uk-new-companies-incorporations 12, uk-public-tenders-find-a-tender 12, uk-visa-sponsors-register 12, eu-public-tenders-ted 10, uk-corporate-insolvency-notices-gazette 10, uk-planning-applications 10, uk-sanctions-list-fcdo 10, us-federal-exclusions-sam-gov 9, nhs-organisations-ods 8, uk-contract-awards-contracts-finder 8, uk-no-website-leads 8, uk-schools-gias-ofsted 8, uk-trademark-journal-watch 8, uk-gambling-commission-licence-register 7; agent sign-up: 0 req/24h, 0 keys/24h, 0 keys/30d; oauth: 0 connects/24h, 0/30d (7d by client: claude.ai 1); cf usage (09-10→10-06): d1 93.8M writes / 848.3M reads, 3.4 GB, kv 0.0M reads / 0.0M writes, workers 0.1M req, ae 0.0M pts ≈ US$44 overage (d1 writes US$44); datasets 30d: uk-care-locations 119, uk-food-hygiene 69, nhs-ods 62, eu-ted 61, uk-companies 61, uk-tenders 61, sam-exclusions 60, uk-charities 60, uk-contract-awards 60, uk-gambling-operators 60, uk-planning 60, uk-sanctions 60, uk-schools 60, uk-insolvency 59, uk-sponsors 59, uk-trademark-journal 59; refresh errors: eu-ted (api.ted.europa.eu responded 429), uk-trademark-journal (no successful refresh since 2026-10-04) |
| 2026-10-07 | Daily numbers | 1 accts (0 paid, +0/24h) | — | 0 x402 paid | MCP 24h: 149 authed, 1369 anon, 90 preview, 4 paywall hits; wanted: connect_account 4; changes 7d: 0 (mcp 0, rest 0); indexnow: 15 urls 200; feeds 30d: 4 fetches, 3 user agents, 4 renders; apify: 185 runs (+8/24h), 30d: 183 runs (1 ours, 182 others), 18 users/30d, 18 public; apify 30d by actor: uk-food-hygiene-ratings 14, uk-care-locations-cqc 12, uk-charities-register 12, uk-new-companies-incorporations 12, uk-public-tenders-find-a-tender 12, uk-visa-sponsors-register 12, eu-public-tenders-ted 11, uk-corporate-insolvency-notices-gazette 11, uk-planning-applications 11, uk-sanctions-list-fcdo 11, us-federal-exclusions-sam-gov 10, nhs-organisations-ods 9, uk-contract-awards-contracts-finder 9, uk-no-website-leads 9, uk-schools-gias-ofsted 9, uk-trademark-journal-watch 9, uk-gambling-commission-licence-register 8, uk-companies-house-lookup-monitor 1; agent sign-up: 0 req/24h, 0 keys/24h, 0 keys/30d; oauth: 0 connects/24h, 0/30d (7d by client: claude.ai 1); cf usage (09-10→10-07): d1 93.8M writes / 893.3M reads, 3.5 GB, kv 0.0M reads / 0.0M writes, workers 0.1M req, ae 0.0M pts ≈ US$44 overage (d1 writes US$44); datasets 30d: uk-care-locations 129, uk-food-hygiene 79, nhs-ods 72, uk-gambling-operators 70, uk-schools 70, uk-trademark-journal 69, uk-contract-awards 64, eu-ted 61, uk-companies 61, uk-tenders 61, sam-exclusions 60, uk-charities 60, uk-planning 60, uk-sanctions 60, uk-insolvency 59, uk-sponsors 59, uk-company-profiles 1; refresh errors: uk-trademark-journal (no successful refresh since 2026-10-04); search: n/a (no SEARCH_CONSOLE_KEY secret; owner action 020) |
| 2026-10-08 | Daily numbers | 1 accts (0 paid, +0/24h) | — | 0 x402 paid | MCP 24h: 134 authed, 1451 anon, 115 preview, 5 paywall hits; wanted: connect_account 5; changes 7d: 0 (mcp 0, rest 0); indexnow: 15 urls 200; mcp probe: init 200, tools 200 (23 tools), call 200; authed: n/a (no GANKDAT_PROBE_KEY); feeds 30d: 6 fetches, 3 user agents, 6 renders; apify: 197 runs (+12/24h), 30d: 194 runs (1 ours, 193 others), 18 users/30d, 18 public; apify 30d by actor: uk-food-hygiene-ratings 14, uk-care-locations-cqc 13, uk-charities-register 13, uk-new-companies-incorporations 13, uk-public-tenders-find-a-tender 13, uk-visa-sponsors-register 13, eu-public-tenders-ted 12, uk-corporate-insolvency-notices-gazette 12, uk-planning-applications 12, uk-sanctions-list-fcdo 12, us-federal-exclusions-sam-gov 11, nhs-organisations-ods 9, uk-contract-awards-contracts-finder 9, uk-gambling-commission-licence-register 9, uk-no-website-leads 9, uk-schools-gias-ofsted 9, uk-trademark-journal-watch 9, uk-companies-house-lookup-monitor 1; agent sign-up: 0 req/24h, 0 keys/24h, 0 keys/30d; oauth: 0 connects/24h, 0/30d (7d by client: claude.ai 1); cf usage (09-10→10-08): d1 93.9M writes / 963.4M reads, 3.5 GB, kv 0.0M reads / 0.0M writes, workers 0.1M req, ae 0.0M pts ≈ US$44 overage (d1 writes US$44); datasets 30d: uk-care-locations 139, uk-food-hygiene 80, uk-gambling-operators 80, nhs-ods 72, eu-ted 71, uk-companies 71, uk-tenders 71, sam-exclusions 70, uk-charities 70, uk-planning 70, uk-sanctions 70, uk-schools 70, uk-insolvency 69, uk-sponsors 69, uk-trademark-journal 69, uk-contract-awards 64, uk-company-profiles 1; refresh errors: uk-care-locations (CQC directory download failed: 403), uk-tenders (find-tender.service.gov.uk responded 429), uk-trademark-journal (no successful refresh since 2026-10-04); search: n/a (no SEARCH_CONSOLE_KEY secret; owner action 020) |
| 2026-10-09 | Daily numbers | 1 accts (0 paid, +0/24h) | — | 0 x402 paid | MCP 24h: 160 authed, 1402 anon, 118 preview, 5 paywall hits; wanted: connect_account 5; changes 7d: 0 (mcp 0, rest 0); indexnow: 15 urls 200; mcp probe: init 200, tools 200 (23 tools), call 200; authed: init 200, tools 200 (23 tools), call 200; wave log: uk-trademark-journal [info] GET https://gankdat.com/v1/data/uk-trademark-journal 12 min ago (8 lines); feeds 30d: 8 fetches, 3 user agents, 8 renders; apify: 213 runs (+16/24h), 30d: 211 runs (1 ours, 210 others), 18 users/30d, 18 public; apify 30d by actor: uk-food-hygiene-ratings 15, uk-care-locations-cqc 14, uk-charities-register 14, uk-new-companies-incorporations 14, uk-public-tenders-find-a-tender 14, uk-visa-sponsors-register 14, eu-public-tenders-ted 13, uk-corporate-insolvency-notices-gazette 13, uk-planning-applications 13, uk-sanctions-list-fcdo 13, us-federal-exclusions-sam-gov 12, nhs-organisations-ods 10, uk-contract-awards-contracts-finder 10, uk-no-website-leads 10, uk-schools-gias-ofsted 10, uk-trademark-journal-watch 10, uk-gambling-commission-licence-register 9, uk-companies-house-lookup-monitor 2; agent sign-up: 0 req/24h, 0 keys/24h, 0 keys/30d; oauth: 0 connects/24h, 0/30d (7d by client: claude.ai 1); connect_account 7d by UA: python-requests/2.34.2 24, Claude-User 6, BrickBlueBot/0.1 (+https://brick.blue/bot?h=gank 3; oauth funnel 7d: 35 challenges (protected_tool 35), 0 authorize, 0 rejected, 0 sign-in, 0 email, 0 consent, 0 approved, 0 denied, 0 expired, 0 token, 0 token errors; cf usage (09-10→10-09): d1 93.9M writes / 1.0B reads, 3.5 GB, kv 0.0M reads / 0.0M writes, workers 0.1M req, ae 0.1M pts ≈ US$44 overage (d1 writes US$44); datasets 30d: uk-care-locations 149, uk-food-hygiene 89, eu-ted 82, nhs-ods 82, uk-companies 81, uk-tenders 81, sam-exclusions 80, uk-charities 80, uk-gambling-operators 80, uk-insolvency 80, uk-schools 80, uk-planning 79, uk-sanctions 79, uk-sponsors 79, uk-trademark-journal 79, uk-contract-awards 70, uk-company-profiles 2; refresh errors: uk-trademark-journal (no successful refresh since 2026-10-04); search: n/a (no SEARCH_CONSOLE_KEY secret; owner action 020) |












## No-website lead feed (2026-09-21)

Owner idea (outreach venture) reshaped into data: a `<field>_present` filter on every dataset and
`website_present` exposed on uk-care-locations, uk-charities and uk-schools, plus the Apify actor
`uk-no-website-leads` (one merged row shape, sector + area filters, charities defaulted to income
≥ £25k). Buyers: web agencies / freelancers / site-builder SaaS prospecting (Apify already sells
"businesses without websites" scrapers built on Google Maps at US$1–5 per 1k; ours is
register-complete and organisation-level, no scraping). Proof number: paid runs of this actor
and `website_present=false` calls in Analytics Engine (30 days). Kill if zero after 60 days live.
Live counts at launch (2026-09-21, `website_present=false`): care locations 27,614 of 57,127;
charities with income ≥ £25k 17,508 of 75,574; open schools 2,572 of 27,233 — ≈ 47,700 leads.
2026-09-26: first (and only, until it proves out) B2B outreach — ten UK limited companies, generic mailboxes,
Companies House checked, drafts for the owner in Gmail; kit and lawful basis in `docs/OUTREACH-2026-09.md`,
LIA C in `docs/GDPR.md`. Proof: ≥ 2 replies or 1 sign-up from 10; verdict due 14 days after the last send.

## Claude Connectors Directory (2026-09-30)

Exchange 2026-W40 winner (score 11). The directory lists a remote MCP server to every Claude
surface after an automatic policy scan, on the owner's paid plan — the first shelf since Apify
with no third-party gate, and the buyers are the agent owners already producing ~80 paywall hits
a day. Server changes in v0.20.0 (`src/mcp/preview.ts`, `routes/mcp.ts`, conformance test
`test/mcp-directory.spec.ts`): annotations on every tool, Origin 403, keyless preview (5 rows,
20 calls/day per client). Listing pack: `docs/CLAUDE-DIRECTORY.md`; owner submits the form.
Proof (day-30 read 2026-10-30, queue `claude-directory-day-30`): ≥ 20 distinct Claude accounts
used a tool in 30 days and ≥ 1 key issued from a claude.ai referrer; `/mcp` calls from
`160.79.104.0/21` in the Daily numbers row, whose MCP column now reads
`authed, anon, preview, paywall hits`. Risk accepted: a Community listing without OAuth cannot
bill inside Claude — `mcp-oauth-lazy-auth` (8) is next.


## Research 2026-10-05 (pipeline starved — burn-down)

Every open gankdat item was blocked or dated (`npm run pipeline next` → null), so this is the
research pass the pipeline rule asks for. Evidence is the last 14 Daily numbers rows above.

| Signal (2026-09-21 → 10-04) | Reading |
| --- | --- |
| Paying accounts / x402 paid | 0 / 0 on every row; 1 real account (09-28) |
| MCP keyless traffic | ~1,400–1,900 anon calls a day; since the keyless preview (09-30) 54–117 preview calls a day and paywall hits fell from ~80 to 3–18 |
| Conversion | agent sign-up 0 keys/30d; `connect_account` is the most-wanted tool (3–6/day) with `oauth: 0 connects` — queued as `oauth-connect-funnel-check` (10-09) |
| Change feeds | `changes 7d: 0 (mcp 0, rest 0)` on every row since the counter exists (09-30) — the one product no rival sells has never been called by anyone |
| Apify | +11/+12/+16 runs a day, 17 users/30d, 17 public actors — the only shelf with activity from outside the repo; the `ours/others` split starts in the 10-05 row, so Apify's QA runner may be part of it |
| Cost | `cf usage` 09-10→10-04: 87.5M D1 writes ≈ US$38 overage vs the US$5 plan — STRATEGY §7 tripped; the delta refresh (10-04) had its first night on 10-05 |
| Refresh | uk-insolvency errors daily until the runner path (10-04); eu-ted 429 (10-01) and uk-contract-awards 0 records (10-03) were one-offs |

Reading: the funnel's top (agents hitting the tools keyless) is wide and the bottom is zero, and
the differentiating product (the change feeds) sits behind a key on a surface with no buyers yet.
So the items below put the change feed on the shelves that already have traffic or need no account
(Apify schedules, RSS/automation triggers, Bing's index via IndexNow), make the Apify reading
per actor so the retirement and quality-score rules can be applied, and read the cost fix before
the invoice. Queued in `docs/pipeline/queues/gankdat.json`:

| Item | Score | Why now |
| --- | --- | --- |
| `apify-change-feed-mode` | 7 | change feeds on the only shelf with runs; a scheduled run becomes a monitor (Apify's recurring-revenue mechanic) |
| `d1-delta-cost-check` (from 10-08) | 6 | §7 tripped; three rows needed to see the per-day write rate after the delta refresh |
| `apify-runs-per-actor` | 5 | which registers Apify users run; unlocks `apify-quality-score-pass` and §7 per dataset |
| `indexnow-stats-pages` | 5 | the indexing reading is owner-blocked; IndexNow needs no account and feeds Bing/DuckDuckGo/Copilot/ChatGPT search |
| `change-feed-rss` | 5 | keyless Atom per register/facet = the feed on Feedly, Slack, Zapier, Make, n8n, Power Automate without a connector |

**Built 2026-10-05 — `indexnow-stats-pages`** (burn-down): the Worker now submits the changed
`/stats` pages (parent + facets, ~1,100 URLs across the waves) to IndexNow after every refresh
wave, proven by the key file at `/<key>.txt`; the runner does the same for uk-insolvency. Readings:
`indexnow: N urls 202` in the Daily numbers row from 2026-10-06 (422 = Bing could not read the
key file, 429 = throttled, `none/24h` = no wave sent anything); the day-30 read on 2026-11-05
(`indexnow-day-30-read`) counts Bing `site:gankdat.com/stats` through the relay or WebSearch and
reads the `bing`/`duckduckgo` referrer share — proof is ≥ 50 pages. Not a Google signal: Google
does not read IndexNow, so `search-console-stats-indexing` stays blocked on the owner.

**Built 2026-10-05 — `change-feed-rss`** (burn-down): every register dataset now has a keyless
Atom feed (`/feeds/<slug>.xml`, plus one per facet value such as
`/feeds/uk-trademark-journal/class/09.xml`) of its last 7 days of changes, linked from the stats
pages with `rel=alternate`, so feed readers and the RSS triggers of Slack, Teams, Zapier, Make,
n8n and Power Automate can watch a register with no key and no connector. Readings: `feeds 30d:
N fetches, U user agents, R renders` in the Daily numbers row from 2026-10-06; proof is ≥ 20
distinct user agents in 30 days and a key issued with a /feeds referrer (the sign-up link in
every entry carries no tracking — the referrer is the reading). Day-30 read on 2026-11-05 with
`indexnow-day-30-read`.

Not queued: more datasets (supply is not the constraint — exchange parked items keep their
triggers), Smithery / n8n node / Snowflake (owner account or £300 MRR triggers unchanged), a
pricing change (no conversion data to act on). Scores use STRATEGY §5 (evidence × reach ÷ effort)
and are discounted where demand is inferred rather than measured, as the W40 exchange did.

## Research 2026-10-07 (pipeline starved — burn-down)

Every open gankdat item was blocked or dated again (`npm run pipeline next` → null; the queue's
48 h cooling from the 10-05 pass had lapsed), so this is the research pass. Evidence is the
10-05 and 10-06 Daily numbers rows, the 2026-10-06 scheduled `gankdat metrics` run log (37471105451)
and the relay request `gankdat-research-2026-10-07` (sitemap, health).

| Signal (2026-10-05 → 10-06) | Reading |
| --- | --- |
| Paying accounts / x402 paid | 0 / 0; still 1 real account |
| MCP keyless traffic | 1,385–1,411 anon, 78–111 preview calls a day; `connect_account` the most-wanted tool, `oauth: 0 connects` (funnel check dated 10-09) |
| Change feeds | `changes 7d: 0` on both rows; the Atom feeds shipped 10-05 but their reading prints `feeds 30d: n/a` |
| IndexNow | `41 urls 429` (10-05), `40 urls 429` (10-06): every wave throttled, and ~40 URLs a day instead of ~1,100 |
| Refresh | eu-ted 429 (10-01, 10-06); uk-trademark-journal `no successful refresh since 2026-10-04` with no error row |
| Cost | D1 writes 87.5M (10-04) → 93.6M (10-05) → 93.8M (10-06): ~6M a day before the delta refresh, ~0.2M a day after; reads +54M a day. The period's invoice (10-10) will still carry ≈ US$44 of writes |
| Apify | 169 runs by others in 30 days across 17 actors, 17 users, US$0 in the September developer summary |

Reading: the funnel is unchanged (wide keyless top, zero bottom), so no product or pricing item
is justified by new evidence; what the two rows do show is that two of the three distribution
items built on 10-05 are not working as shipped, and two refreshes die on the origin side.
The cost fix is confirmed working (the 10-08 item reads three rows and writes the daily rate
into the ledger). Queued in `docs/pipeline/queues/gankdat.json`:

| Item | Score | Why now |
| --- | --- | --- |
| `indexnow-from-runner` | 7 | the Worker's api.indexnow.org POSTs get 429 from Cloudflare's shared egress IPs (rankmath.com, asteroad.com confirm: IP-based, no Worker-side fix); the runner's own post for uk-insolvency got `status 200` the same morning, so the submission moves to the metrics workflow's runner step |
| `trademark-journal-silent-refresh` | 6 | wave 7 (the journal alone) has logged nothing since the night before the delta refresh's first run, and that last run took 13 min 42 s of the 15-minute budget; a refresh killed by the limit writes no row — bound the per-night work and make a killed wave visible |
| `feeds-reading-reason` | 4 | the feeds query fails and `.catch(() => null)` hides why; `sumIf` per Cloudflare's SQL reference and an `n/a (<reason>)` reading like `cf usage` |
| `eu-ted-429-backoff` | 4 | two throttled nights in six; copy uk-contract-awards' 429/403 retry so a throttled page does not cost the day |

Not queued: more datasets, a pricing change, Smithery / n8n / Snowflake listings (triggers
unchanged from 10-05); nothing in the two rows moves them. Relay readings: `/v1/health` (00:20) gives uk-trademark-journal `last_refreshed_at 2026-10-04 06:18:42`
— 13 min 42 s after wave 7 fired, a minute and a half under the Cron Trigger's 15-minute wall-clock
before the delta path added per-row hashing — while every other source refreshed on 10-06 (eu-ted at
10:56, a request-path refresh after the 05:00 429); `sitemap.xml` lists 61 `/stats` URLs, the set the
runner can submit; `/health` is 404 and `/v1/data` 401 without a key.

**Built 2026-10-07 — `indexnow-from-runner`** (burn-down): the IndexNow submission moved from the
Worker's wave-end ping to the metrics workflow's runner step (`runner-refresh.mjs`, daily 06:30
after wave 7): every source with an `ok` refresh in the last 26 h, parent page plus the facet pages
from its stats blob in KV, one POST from the runner's IP; the result is left in `dist/indexnow.json`
and the Daily numbers row reads it as `indexnow: N urls S` (`n/a (<reason>)` on a push run). The
Worker's ping and its Analytics Engine point are gone — the endpoint answered 429 to Workers egress
on every wave, and no Worker-side change can fix an IP throttle. Readings: `indexnow: N urls 200`
with N ≥ 60 for seven days is the proof; the 11-05 day-30 read is unchanged.

**Built 2026-10-07 — `trademark-journal-silent-refresh`** (burn-down): the journal's refresh starts
no new issue download once six minutes have elapsed (`DOWNLOAD_BUDGET_MS`; up to four 145 MB
issues a run was the whole of the 13 min 42 s the 10-04 run took); the issues already cached
stream into D1 as before and the window keeps filling on later nights, so a run always ends
inside the 15-minute Cron Trigger budget with a `refresh_log` row. The `tmj_window` log line now
carries `elapsed_ms` and `download_budget_spent`. Not built: a "started" refresh_log row — the
two-day stale reading in the Daily numbers row is the detector for a killed wave, and a row per
start would double the table's writes for one source. Proof: an `ok` row on three consecutive
nights; the stale reading gone from the row by 2026-10-09.

**Built 2026-10-07 — `feeds-reading-reason`** (burn-down): the feeds query's miss share is a `sumIf`
(the SUM of a value times a comparison is what the first row after the feeds shipped choked on)
and a failed query now prints `feeds 30d: n/a (<reason>)` instead of a bare `n/a`, as the `cf usage`
readings do. The sandbox cannot run Analytics Engine queries, so the 2026-10-07 06:30 row is the
check: either the three figures or the reason to act on.

**Built 2026-10-07 — `eu-ted-429-backoff`** (burn-down): a throttled TED page is retried up to
three times, pausing for `Retry-After` when it is under two minutes and otherwise 20 s × attempt,
so a burst-limited morning no longer costs eu-ted its refresh (10-01 and 10-06 each waited for a
request-path retry hours later). Worst case adds two minutes to wave 1; a page still throttled after
the retries fails as before. Proof: no eu-ted 429 in the refresh errors reading over 14 nights.

## Read 2026-10-08 — `d1-delta-cost-check` (burn-down)

Three Daily numbers rows after the delta refresh's first night (10-05), `cf usage` cumulative for the
09-10→10-10 billing period:

| Row | D1 writes | Δ day | D1 reads | Δ day |
| --- | --- | --- | --- | --- |
| 10-04 (last swap night ahead) | 87.5M | — | 723.4M | — |
| 10-05 | 93.6M | +6.1M (every D1 source's "one last full reload" after migration 0014) | 794.4M | +71M |
| 10-06 | 93.8M | +0.2M | 848.3M | +54M |
| 10-07 | 93.8M | +0.0M (under the 0.1M rounding) | 893.3M | +45M |

Verdict: daily D1 writes are ~0.1M, well under the ~1M line and ~30× below the ~6M a day the nightly
generation swap cost; STRATEGY §7's cost rule is no longer tripped going forward (the period's invoice
on 10-10 still carries ≈ 44M billable writes ≈ US$44 ≈ £33, LEDGER planned row updated; the invoice
check stays with `cloudflare-usage-breakdown` on 11-10). Which sources still swap generations: none
nightly — all nine D1 sources (nhs-ods, sam-exclusions, uk-care-locations, uk-charities,
uk-food-hygiene, uk-gambling-operators, uk-schools, uk-sponsors, uk-trademark-journal) define `idOf`,
so the swap is left for a first load only. uk-trademark-journal's pre-0014 rows (162k) are hashed in
place by the 10-07 backfill (≤ 162k writes over one or two nights, visible as a small bump in the 10-08
or 10-09 row) and then go delta. The `refresh_log` read through the REST API was the branch for a day
above 1M and was not needed. Reads (+45–71M a day, 25B included, US$0.001/M beyond) cost nothing.

## Research 2026-10-09 (pipeline starved — burn-down)

Every open gankdat item was blocked or dated (`npm run pipeline next` → null; the 48 h cooling from the
10-07 pass had lapsed at midnight), so this is the research pass. Evidence: the 10-07 and 10-08 Daily
numbers rows, the 2026-10-08 scheduled `gankdat metrics` run log (37787292017) and the relay request
`gankdat-research-2026-10-09` (`/v1/health`, `sitemap.xml`, the CQC directory page and the Find a
Tender API from a runner IP, 00:16 UTC).

| Signal (2026-10-07 → 10-08) | Reading |
| --- | --- |
| Paying accounts / x402 paid | 0 / 0; still 1 real account |
| MCP keyless traffic | 1,369–1,451 anon, 90–115 preview calls a day; `connect_account` wanted 4–5 a day, `oauth: 0 connects` — the funnel check is dated today from 07:00 UTC |
| MCP probe (new 10-08) | keyless init/tools/call all 200, 23 tools; `authed: n/a (no GANKDAT_PROBE_KEY)` |
| Change feeds | `changes 7d: 0`; feeds 30d: 4 → 6 fetches, 3 user agents (the sumIf fix reads) |
| IndexNow | `15 urls 200` both days, `15 sources refreshed in 26 h` in the log — one URL per source: facet pages exist only for uk-trademark-journal (45 Nice classes; the sitemap lists 62 `/stats` URLs = 17 parents + 45 classes), so the runner comment's "~1,100 facet URLs" was wrong and N ≥ 60 needs the journal refreshed |
| Refresh | 10-08: uk-care-locations `CQC directory download failed: 403`, uk-tenders `429`, uk-trademark-journal `no successful refresh since 2026-10-04` |
| Cost | D1 writes 93.8M → 93.9M (+0.1M a day, delta refresh holding); reads +70M a day |
| Apify | 193 runs by others in 30 days, 18 users, uk-companies-house-lookup-monitor 1 run (ours) |
| Search Console | `n/a (no SEARCH_CONSOLE_KEY secret; owner action 020)` |

Relay readings (10-09 00:16): `/v1/health` shows every source refreshed on 10-08 between 05:01 and 05:56
(uk-insolvency 13:50 from the runner) **except uk-trademark-journal, still 2026-10-04 06:18:42 (114 h)**
and uk-company-profiles (lookup, never refreshed by design); so the CQC 403 and the Find a Tender 429 were
transient — uk-care-locations refreshed at 05:31:59 and uk-tenders at 05:02:01 the same morning, and
the CQC page answers 200 (`last-modified 2026-10-08 12:46`) to a runner. The journal is the one real
failure: the 10-07 resumable backfill (deployed 17:36, run 37660375524 green) should have left an `ok`
or a `skipped` row on 10-08 and left neither — the wave died silently again, and nothing in a sandbox or
the relay can read why. The auto-filer refiles `refresh-uk-trademark-journal-<date>` once the 10-09 row
lists it again (two rows after the 10-07 fix); the lever that makes the cause readable is queued below.

Scheduling: both GitHub crons fire ~7 h late every day (`gankdat metrics` 06:30 → 13:48 on 10-08, 13:40,
13:28, 15:04, 12:38, 11:51 on the days before; `store metrics` 06:45 → 14:03, 13:57, 13:38, 15:17, 12:52).
The push fallback fills the rows by ~07:16, but the runner-fed refresh, IndexNow, the probe and the
error filer run only on the scheduled run. Queued in `docs/pipeline/queues/foundry.json` (score 3).

Queued in `docs/pipeline/queues/gankdat.json`:

| Item | Score | Why now |
| --- | --- | --- |
| `wave-log-reading` | 5 | two silent wave deaths in five days; the metrics runner can query Workers observability and print the last log lines of any stale source into the row |
| `uk-tenders-429-backoff` | 4 | first throttled night for Find a Tender, no retry in the source; eu-ted's loop from 10-07 |
| `probe-key-from-runner` | 4 | the authed MCP path is never probed; the runner can mint a one-run key in D1 (hash only is stored) with no owner secret |

Not queued: more datasets, a pricing change, listings (triggers unchanged since 10-05); the funnel's
bottom is still zero and the next signal is today's `oauth-connect-funnel-check`.

## Walk 2026-10-09 — `oauth-connect-funnel-check` (build)

Question (review 2026-W40): `connect_account` is the most-wanted MCP tool every day (6, 6, 4, 3, 6, 5, 4, 5 keyless
calls 10-01..10-08) and `oauth: 0 connects/24h, 0/30d` every day. Scanners, or a hop that loses the person?

**What the relay could walk (GET legs, live, 09:15–09:25 UTC; `docs/relay/responses/oauth-funnel-2026-10-09*`):**

| Leg | Request | Status | Reading |
|---|---|---|---|
| RFC 9728 | `/.well-known/oauth-protected-resource` and `…/mcp` | 200 JSON | resource `https://gankdat.com/mcp`, issuer gankdat.com, scope `data:read` |
| RFC 8414 | `/.well-known/oauth-authorization-server` | 200 JSON | `token_endpoint_auth_methods_supported: ["none"]` + `client_id_metadata_document_supported: true` — both present, so Claude picks CIMD (its documented condition) |
| Claude's client document (hosted apps) | `https://claude.ai/oauth/mcp-oauth-client-metadata` | 200 | `redirect_uris: ["https://claude.ai/api/mcp/auth_callback"]`, `token_endpoint_auth_method: none` |
| Claude Code's client document | `https://claude.ai/oauth/claude-code-client-metadata` | 200 | `http://localhost/callback`, `http://127.0.0.1/callback` — port-less, matched port-agnostically by `redirectUriAllowed` |
| `/authorize`, hosted-apps client_id + Claude callback | full PKCE query | **200** | "Connect gankdat to claude.ai" sign-in page, request id minted — the Worker fetched Claude's document and verified the redirect |
| `/authorize`, Claude Code client_id + `http://localhost:3118/callback` | full PKCE query | **200** | same page, loopback on an ephemeral port accepted |
| `/authorize` with the test suite's old guess `https://claude.ai/.well-known/oauth-client.json` | — | 400 "Unknown client" | that URL is a 404 on claude.ai; the fixture is now the real document (`test/oauth.spec.ts`) |
| `/authorize?request=<unknown>` | — | 410 | "Request expired" page, as designed |
| `/consent.js` | HEAD | 200 | the single-submit guard from the 10-04 double-submit fix is served |
| `GET /mcp` | — | 404 JSON | POST-only route; a browser opening the URL gets a JSON not_found, not a page (directories POST) |

**What no sandbox can walk:** `POST /authorize/login` (sends the magic-link mail), the emailed `/v1/auth/verify` hop,
`POST /authorize/decision` and `POST /token`. The one full human walk is the owner's on 2026-10-04 (claude.ai): it found
the double-submit bug, fixed the same day, and a token was issued (`7d by client: claude.ai 1` from the 10-05 row) on an
internal account, so `connects` stayed 0 by definition. Claude's own reports of the same hop
([anthropics/claude-ai-mcp#313](https://github.com/anthropics/claude-ai-mcp/issues/313): a 307 from the consent POST
makes the browser POST the callback — ours is a 302; [#1110](https://github.com/anthropics/claude-ai-mcp/issues/1110):
tokens issued, tools listed, connector still "Connect" in Settings — open, no cause) say the Claude side can also drop a
finished hop silently.

**What the server could not tell us, and now does:** nothing between the 401 and the code row was counted. From this
deploy every leg of `routes/oauth.ts` writes an `oauth_funnel` analytics point (step, client host, detail) and the Daily
numbers row reads, over 7 days: `connect_account 7d by UA: …` (the user agents behind the 401s — this one reads from a
week of *existing* `mcp_denied` points, so the 10-10 row already answers "scanner or Claude"), then
`oauth funnel 7d: N challenges (protected_tool …, preview_exhausted …), N authorize, N rejected (…), N sign-in, N email
(…), N consent, N approved, N denied, N expired (…), N token (…), N token errors (…)`.

**How to read the 10-10 row:** a `python-requests`/`Go-http-client`/directory UA with 0 authorize = scanners calling
every listed tool (drop the worry, keep the gate); `Claude-User` with 0 authorize = Claude shows the Connect card and
nobody clicks (the card copy / tool description is the lever); authorize > 0 with sign-in > 0 and email 0 = people reach
the page and do not type an email (the page is the lever); email > 0 and consent 0 = the mail hop loses them (deliverability
or the other-tab finish); approved > 0 and token 0 = Claude's callback leg. The item's proof (≥ 1 connect by 10-18, or
the row names the stopping step) is now readable from the row alone; the day-30 directory read (10-30) carries it.

## Build 2026-10-09 — `refresh-uk-trademark-journal-2026-10-09` (build, 17:00)

**Reading.** The 10-09 Daily numbers row still says `uk-trademark-journal (no successful refresh since
2026-10-04)` with neither an error nor a `skipped` row, two nights after the 10-07 backfill fix deployed
(gankdat run 105, green, migration 0015 applied). The first wave-log reading (metrics run 37938660892, 13:43 UTC)
returned 8 lines in 24 h for the slug — every one a `GET /v1/data/…` or `/stats/…/class/NN` request line, none
from the 06:05 wave (`refresh_wave`, `hash_backfill`, `tmj_window`, `refresh_failed` all absent). So the wave
wrote nothing a slug search could find and died before any row; the IPO origin was not even reached.

**Cause (reproduced offline).** `BACKFILL_UPDATE_SQL` was `UPDATE source_records AS r … FROM (SELECT … FROM
json_each(?3)) AS j WHERE r.source_slug = ?1 AND r.generation = ?2 AND r.seq = j.q`. SQLite's plan:
`SEARCH r USING COVERING INDEX (source_slug=? AND generation=?)` as the outer loop, `SCAN j` as the inner — every
one of the generation's 162k rows scans the 2,000-entry JSON array, 324M `json_extract` evaluations a page. On a
162k-row table of 1.5 KB records in this sandbox's SQLite one page took **198–203 s**; D1 is slower, so the
first page or two ate the 15-minute wave and the budget check *between* pages never ran — no `skipped` row, no
`hash_backfill` line, nothing. The 10-07 test (2,100 rows, one page) could not see it: the cost is rows × entries.

| Form of the page update | Plan | One 2,000-row page at 162k rows |
| --- | --- | --- |
| `UPDATE … FROM (json_each subquery) AS j` (10-07) | SEARCH r (slug, gen) → SCAN j | 203 s |
| `seq IN (json_each)` + correlated subqueries | SEARCH r by PK → 2 × SCAN json_each per row | 3.1 s |
| `WITH j AS MATERIALIZED (…) UPDATE … FROM j` (shipped) | MATERIALIZE j → SCAN j → SEARCH r by PK | **0.03 s** |
| CTE + `seq IN` + correlated subqueries | SEARCH r by PK → SCAN j per row | 0.17 s |
| 2026-10-10 | Daily numbers | 1 accts (0 paid, +0/24h) | — | 0 x402 paid | MCP 24h: 160 authed, 1578 anon, 117 preview, 5 paywall hits; wanted: connect_account 5; changes 7d: 0 (mcp 0, rest 0); indexnow: 41 urls 200; mcp probe: init 200, tools 200 (23 tools), call 200; authed: init 200, tools 200 (23 tools), call 200; wave log: uk-planning no log line in 24 h; feeds 30d: 10 fetches, 3 user agents, 10 renders; apify: 226 runs (+13/24h), 30d: 224 runs (1 ours, 223 others), 18 users/30d, 18 public; apify 30d by actor: uk-food-hygiene-ratings 16, uk-care-locations-cqc 15, uk-charities-register 15, uk-new-companies-incorporations 15, uk-public-tenders-find-a-tender 15, uk-visa-sponsors-register 15, eu-public-tenders-ted 13, uk-corporate-insolvency-notices-gazette 13, uk-planning-applications 13, uk-sanctions-list-fcdo 13, us-federal-exclusions-sam-gov 12, nhs-organisations-ods 11, uk-contract-awards-contracts-finder 11, uk-no-website-leads 11, uk-schools-gias-ofsted 11, uk-trademark-journal-watch 11, uk-gambling-commission-licence-register 10, uk-companies-house-lookup-monitor 3; agent sign-up: 0 req/24h, 0 keys/24h, 0 keys/30d; oauth: 0 connects/24h, 0/30d (7d by client: claude.ai 1); connect_account 7d by UA: python-requests/2.34.2 23, Claude-User 6, BrickBlueBot/0.1 (+https://brick.blue/bot?h=gank 4; oauth funnel 7d: 35 challenges (protected_tool 35), 0 authorize, 0 rejected, 0 sign-in, 0 email, 0 consent, 0 approved, 0 denied, 0 expired, 0 token, 0 token errors; cf usage (10-10→10-10): d1 0.0M writes / 46.5M reads, 3.5 GB, kv 0.0M reads / 0.0M writes, workers 0.0M req, ae 0.0M pts ≈ US$0 overage; datasets 30d: uk-care-locations 159, uk-food-hygiene 99, nhs-ods 92, uk-companies 91, uk-tenders 91, uk-charities 90, uk-gambling-operators 90, uk-schools 90, uk-sponsors 89, uk-trademark-journal 89, eu-ted 82, sam-exclusions 80, uk-insolvency 80, uk-planning 79, uk-sanctions 79, uk-contract-awards 77, uk-company-profiles 3; refresh errors: uk-planning (refresh returned 0 records); search: n/a (no SEARCH_CONSOLE_KEY secret; owner action 020) |


**Built.** (1) The materialized-CTE form, with the plan asserted on D1 in `d1store.spec` (`SCAN j` before
`SEARCH r … seq=?`, never `SCAN r`). (2) A backfill that throws now writes an `error` row (`hash backfill
failed: …`) — it sat outside the two paths that write rows, so a throw also left a silent night. (3)
`BACKFILL_HANDOVER_MS` (3 min): a backfill that used that much of the wave hands the delta to the next night
even when it finished, so the journal's first good night is a `skipped` row (`… 0 left in N s; delta refresh
runs next night`) and the delta gets a wave of its own — the 10-04 full reload took 13 min 42 s, and a
backfill plus a delta must never share one 15-minute wave. The other delta statements (`UPSERT_SQL`,
`CHANGES_FROM_ROWS_SQL`, `DELETE_ROWS_SQL`) use `seq IN (SELECT value FROM json_each(…))`, which probes the
primary key — checked, left alone.

**What tomorrow's row should say.** 10-10: `last run skipped: hash backfill: 162370 rows hashed, 0 left in N s`
(81 pages; expected N ≪ 180 on D1, in which case the delta runs the same night and the row is `ok` with
`delta +a ~c -r`). 10-11 at the latest: `ok`. If the row is still silent on 10-10 the wave never reached the
backfill at all — then read the cron invocation itself (`$workers.outcome`, `$workers.event.cron`) rather than
the slug: the needle reading only proves request lines are searchable, not that a structured
`console.log(JSON.stringify({…}))` line without a `message` key is.
