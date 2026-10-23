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
**Verdict 2026-10-12 (burn-down, `b2b-outreach-results`): failed and closed.** Nine delivered on 2026-09-28 (one bounce),
0 replies and no attributable sign-up by 2026-10-12 (`docs/OUTREACH-2026-09.md` §6). Cold email to generic agency and
bid-consultancy mailboxes is dropped as a channel: no second list. What the result says about the thesis: the
no-website lead feed and the contract-awards feed have not yet found a buyer who answers unsolicited mail; the
distribution that does move numbers is the shelves (MCP directories, Apify, the comparison pages), so the budget of
effort stays there (STRATEGY §5: distribution before new features). Revisit only on an inbound lead or a paid
customer naming its firm type.

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
| 2026-10-10 | Daily numbers | 1 accts (0 paid, +0/24h) | — | 0 x402 paid | MCP 24h: 163 authed, 1609 anon, 119 preview, 5 paywall hits; wanted: connect_account 5; changes 7d: 0 (mcp 0, rest 0); indexnow: 41 urls 200; mcp probe: init 200, tools 200 (23 tools), call 200; authed: init 200, tools 200 (23 tools), call 200; wave log: uk-insolvency [info] GET http://gankdat.com/stats/uk-insolvency 3.2 h ago (3 lines); uk-planning [info] GET https://gankdat.com/v1/data/uk-planning?page=10&per_page=100 5.4 h ago (2 lines); feeds 30d: 10 fetches, 3 user agents, 10 renders; apify: 231 runs (+18/24h), 30d: 227 runs (1 ours, 226 others), 18 users/30d, 18 public; apify 30d by actor: uk-food-hygiene-ratings 16, uk-care-locations-cqc 15, uk-charities-register 15, uk-new-companies-incorporations 15, uk-public-tenders-find-a-tender 15, uk-visa-sponsors-register 15, uk-corporate-insolvency-notices-gazette 14, uk-sanctions-list-fcdo 14, eu-public-tenders-ted 13, uk-planning-applications 13, us-federal-exclusions-sam-gov 13, nhs-organisations-ods 11, uk-contract-awards-contracts-finder 11, uk-no-website-leads 11, uk-schools-gias-ofsted 11, uk-trademark-journal-watch 11, uk-gambling-commission-licence-register 10, uk-companies-house-lookup-monitor 3; agent sign-up: 0 req/24h, 0 keys/24h, 0 keys/30d; oauth: 0 connects/24h, 0/30d (7d by client: claude.ai 1); connect_account 7d by UA: python-requests/2.34.2 24, Claude-User 6, BrickBlueBot/0.1 (+https://brick.blue/bot?h=gank 4; oauth funnel 7d: 36 challenges (protected_tool 36), 0 authorize, 0 rejected, 0 sign-in, 0 email, 0 consent, 0 approved, 0 denied, 0 expired, 1 token (refresh_token 1), 0 token errors; cf usage (10-10→10-10): d1 0.0M writes / 49.7M reads, 3.5 GB, kv 0.0M reads / 0.0M writes, workers 0.0M req, ae 0.0M pts ≈ US$0 overage; datasets 30d: uk-care-locations 159, uk-food-hygiene 99, eu-ted 92, nhs-ods 92, uk-companies 91, uk-tenders 91, sam-exclusions 90, uk-charities 90, uk-gambling-operators 90, uk-insolvency 90, uk-sanctions 90, uk-schools 90, uk-sponsors 89, uk-trademark-journal 89, uk-planning 88, uk-contract-awards 77, uk-company-profiles 3; refresh errors: uk-insolvency (runner: thegazette.co.uk responded 503 after 2 reads), uk-planning (refresh returned 0 records); search: n/a (no SEARCH_CONSOLE_KEY secret; owner action 020) |


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

## Research 2026-10-11 (pipeline starved — burn-down)

Every open gankdat item was blocked (owner actions 020, 021) or dated (10-17 … 11-05), `npm run
pipeline next` → null and the 48 h cooling from the 10-09 pass lapsed at midnight, so this is the
research pass. Evidence: the 10-09 and 10-10 Daily numbers rows, the INBOX entry of 2026-10-10 08:09
(Apify QA), the git history of the actor folders and the relay request `gankdat-research-2026-10-11`
(planning origin, `/v1/health`, the flagged actor and its failed run — answered 00:30 UTC) and a second,
`planning-origin-2026-10-11` (the dataset's own page, its bulk file and the dataset list).

| Signal (2026-10-09 → 10-10) | Reading |
| --- | --- |
| Paying accounts / x402 paid | 0 / 0; still 1 real account |
| MCP keyless traffic | 1,402–1,609 anon, 118–119 preview calls a day; `connect_account` wanted 5 a day; funnel 7d: 35–36 challenges, 0 authorize, 1 token (`refresh_token`, claude.ai — the owner's existing connection renewing, not a new connect) |
| uk-trademark-journal | the 10-10 row is the first since 10-05 that does not list it under refresh errors, and `indexnow` went 15 → 41 URLs (facet pages re-enter the submission only after an `ok` journal refresh), so the 10-09 materialised-CTE backfill went through; `/v1/health` through the relay confirms it: `last_refreshed_at 2026-10-10 06:10:56`, 5 min 56 s into wave 7 — the first good night since 10-04 |
| Refresh | 10-10: uk-insolvency (runner) `thegazette.co.uk responded 503 after 2 reads` — first 503, the source already retries a 5xx once; uk-planning `refresh returned 0 records` — first time for this source (uk-contract-awards read the same on 10-03) **and not transient**: at 00:28 UTC the origin still answers `entity.json?dataset=planning-application&limit=5` with 200 `{"entities":[],"count":0}` and `/v1/health` has uk-planning last refreshed 10-09 05:01, so the surface serves a stale snapshot until the origin or the source changes; the insolvency 503 is a single row the repeat rule owns |
| Cost | new billing period from 10-10: ≈ US$0 overage, D1 0.0M writes / 49.7M reads a day |
| Apify | 226 runs by others in 30 days, 18 users; `uk-no-website-leads` 11 runs/30d — **and flagged "under maintenance" on 10-10 after three days of failed QA runs** (run 0aYfr2UQ7cElJsLj0) |
| Change feeds | `changes 7d: 0`; feeds 30d: 10 fetches, 3 user agents |
| Search Console | `n/a (no SEARCH_CONSOLE_KEY secret; owner action 020)` |

**The flagged actor, from git alone.** 34d73aa (2026-09-21) gave `uk-no-website-leads` its own client:
`src/gankdat.mjs` exported `runLeadFeed` (three registers, `website_present=false`, one merged row
shape). 3ede4af (2026-10-07, the company-lookup build) "rolled the shared client out to every actor
folder" — this one included — so that file is now the single-source client (`runDatasetActor`,
`runLookupActor`) and `main.mjs`'s `import { runLeadFeed } from './gankdat.mjs'` has no export to
bind: every run since 10-07 dies at module load, before `Actor.init()`, which is exactly "three days
of failed test runs" on 10-10. Nothing in the gate saw it — the byte-identical test excludes the folder
because of its row shape, and no test resolves an actor's imports — and nothing in the row saw it
either: `apify 30d by actor` counts runs without their outcome, so three days of failures (QA's and
any buyer's) read as use. Apify's mail is the only detector, three days late, for the second time
(uk-planning-applications 09-25, the lead feed 10-10). The fix is small (restore the feed's own
client, add the import check) and the reading lever is the general one.

**The relay's reading of the actor.** Apify's run 0aYfr2UQ7cElJsLj0 (`origin: TEST`, 10-09 20:20 UTC, 1.4 s,
exit 1) logs `SyntaxError: The requested module './gankdat.mjs' does not provide an export named
'runLeadFeed'` at `src/main.mjs:2` — the cause above, verbatim. The actor's public stats: 11 runs by 2
users in 30 days, 9 succeeded (all before build 0.1.2 of 10-07 09:40), 2 failed since; `isDeprecated
false`, still public, so a green build lifts the flag.

Queued in `docs/pipeline/queues/gankdat.json`:

| Item | Score | Why now |
| --- | --- | --- |
| `apify-lead-feed-client-restore` | 7 | the one shelf with outside users shows a broken actor again; cause known from git, fix ≤ 0.1 day, CI republishes on push |
| `apify-run-outcomes-reading` | 5 | the metrics job already pages `/v2/actor-runs` (which carries `status`); print failed counts per actor and list an actor failing twice in a day under `refresh errors` so the repeat rule files the fix the day it starts, not when Apify writes |
| `refresh-uk-planning-2026-10-11` | 6 | the origin's planning-application dataset is empty, not moved (relay `planning-origin-2026-10-11`, 00:40): `/dataset/planning-application.json` reports `entity-count 0`, `phase alpha`, `replacement-dataset ""`, every entity query (2026 entry dates, offset 1000, geometry) answers `count 0` and the bulk CSV is 403; the surface serves the 10-09 snapshot — decide stale-origin handling (notice on /stats and health, keep the snapshot, §7 timer) rather than a parser fix; filed under the auto-filer's id so tomorrow's row extends it |
| `refresh-zero-records-evidence` | 4 | `refresh returned 0 records` (uk-contract-awards 10-03, uk-planning 10-10) says nothing about what the origin served — status, bytes, shape — so an outage and a renamed dataset read the same and neither night could be diagnosed from the row |
| 2026-10-11 | Daily numbers | 1 accts (0 paid, +0/24h) | — | 0 x402 paid | MCP 24h: 119 authed, 1585 anon, 169 preview, 55 paywall hits; wanted: query_uk_contract_awards 16, query_uk_sanctions 16, query_eu_ted 10; changes 7d: 0 (mcp 0, rest 0); indexnow: 14 urls 200; mcp probe: init 200, tools 200 (23 tools), call 200; authed: init 200, tools 200 (23 tools), call 200; wave log: uk-planning [info] GET https://gankdat.com/v1/data/uk-planning 7.4 h ago (1 lines); uk-trademark-journal [error] GET https://gankdat.com/stats/uk-trademark-journal/class/30 4.3 h ago (5 lines); feeds 30d: 17 fetches, 4 user agents, 17 renders; apify: 244 runs (+13/24h), 30d: 242 runs (1 ours, 241 others), 18 users/30d, 18 public; apify 30d by actor: uk-food-hygiene-ratings 17, uk-care-locations-cqc 16, uk-charities-register 16, uk-new-companies-incorporations 16, uk-public-tenders-find-a-tender 16, uk-visa-sponsors-register 16, eu-public-tenders-ted 14, uk-corporate-insolvency-notices-gazette 14, uk-planning-applications 14 (3 failed), uk-sanctions-list-fcdo 14, us-federal-exclusions-sam-gov 13, nhs-organisations-ods 12, uk-contract-awards-contracts-finder 12, uk-no-website-leads 12 (2 failed), uk-schools-gias-ofsted 12, uk-trademark-journal-watch 12, uk-gambling-commission-licence-register 11, uk-companies-house-lookup-monitor 4; agent sign-up: 0 req/24h, 0 keys/24h, 0 keys/30d; oauth: 0 connects/24h, 0/30d (7d by client: claude.ai 1); connect_account 7d by UA: python-requests/2.34.2 26, Claude-User 6, BrickBlueBot/0.1 (+https://brick.blue/bot?h=gank 5; oauth funnel 7d: 88 challenges (preview_exhausted 47, protected_tool 41), 0 authorize, 0 rejected, 0 sign-in, 0 email, 0 consent, 0 approved, 0 denied, 0 expired, 2 token (refresh_token 2), 0 token errors; cf usage (10-10→10-11): d1 0.0M writes / 107.6M reads, 3.5 GB, kv 0.0M reads / 0.0M writes, workers 0.0M req, ae 0.0M pts ≈ US$0 overage; datasets 30d: uk-care-locations 179, uk-food-hygiene 109, nhs-ods 102, uk-companies 101, uk-tenders 101, uk-charities 100, uk-gambling-operators 100, uk-schools 100, uk-sponsors 99, uk-trademark-journal 99, eu-ted 92, sam-exclusions 90, uk-insolvency 90, uk-sanctions 90, uk-planning 88, uk-contract-awards 85, uk-company-profiles 4; refresh errors: uk-planning (refresh returned 0 records), apify-uk-no-website-leads (2 new failed run(s) since the last row, 2 of 12 in 30 d), apify-uk-planning-applications (3 new failed run(s) since the last row, 3 of 14 in 30 d); search 7d to 10-10: 11 impressions, 0 clicks, avg pos 8.2, top /stats/nhs-ods 7, indexed 7/19, not: Discovered - currently not indexed ×7, URL is unknown to Google ×5 |
| 2026-10-12 | Daily numbers | 3 accts (0 paid, +2/24h) | — | 0 x402 paid | MCP 24h: 107 authed, 1558 anon, 115 preview, 5 paywall hits; wanted: connect_account 5; changes 7d: 0 (mcp 0, rest 0); indexnow: 14 urls 200; mcp probe: init 200, tools 200 (25 tools), call 200; authed: init 200, tools 200 (25 tools), call 200; wave log: uk-planning [info] GET https://gankdat.com/v1/data/uk-planning?page=10&per_page=100 2.5 h ago (1 lines); uk-trademark-journal [info] GET https://gankdat.com/v1/data/uk-trademark-journal?page=8&per_page=100 7.6 h ago (4 lines); feeds 30d: 28 fetches, 5 user agents, 28 renders; apify: 267 runs (+23/24h), 30d: 265 runs (1 ours, 264 others), 18 users/30d, 18 public; apify 30d by actor: uk-food-hygiene-ratings 18, uk-care-locations-cqc 17, uk-charities-register 17, uk-new-companies-incorporations 17, uk-public-tenders-find-a-tender 17, uk-visa-sponsors-register 17, eu-public-tenders-ted 16, uk-corporate-insolvency-notices-gazette 16, uk-planning-applications 16 (3 failed), uk-sanctions-list-fcdo 16, us-federal-exclusions-sam-gov 15, nhs-organisations-ods 13, uk-contract-awards-contracts-finder 13, uk-no-website-leads 13 (2 failed), uk-schools-gias-ofsted 13, uk-trademark-journal-watch 13, uk-gambling-commission-licence-register 12, uk-companies-house-lookup-monitor 5; agent sign-up: 0 req/24h, 0 keys/24h, 0 keys/30d; oauth: 0 connects/24h, 0/30d; connect_account 7d by UA: python-requests/2.34.2 26, BrickBlueBot/0.1 (+https://brick.blue/bot?h=gank 5, node 2; oauth funnel 7d: 83 challenges (preview_exhausted 47, protected_tool 36), 0 authorize, 0 rejected, 0 sign-in, 0 email, 0 consent, 0 approved, 0 denied, 0 expired, 4 token (refresh_token 4), 0 token errors; after wall 1h (7d): 0 clients — request_api_key 0, x402 0, connect 0, gone 0; cf usage (10-10→10-12): d1 0.0M writes / 166.9M reads, 3.5 GB, kv 0.0M reads / 0.0M writes, workers 0.0M req, ae 0.0M pts ≈ US$0 overage; datasets 30d: uk-care-locations 199, uk-food-hygiene 119, eu-ted 112, nhs-ods 112, uk-sanctions 112, uk-companies 111, uk-tenders 111, sam-exclusions 110, uk-charities 110, uk-gambling-operators 110, uk-insolvency 110, uk-schools 110, uk-sponsors 109, uk-trademark-journal 109, uk-planning 108, uk-contract-awards 93, uk-company-profiles 5; datasets 30d external: none; 0: eu-ted, nhs-ods, sam-exclusions, uk-care-locations, uk-charities, uk-companies, uk-company-profiles, uk-contract-awards, uk-food-hygiene, uk-gambling-operators, uk-insolvency, uk-planning, uk-sanctions, uk-schools, uk-sponsors, uk-tenders, uk-trademark-journal; refresh errors: uk-planning (origin dataset empty: planning-application answered count 0 (emptied on planning.data.gov.), uk-trademark-journal (no successful refresh since 2026-10-10); search 7d to 10-11: 22 impressions, 0 clicks, avg pos 6.7, top /stats/nhs-ods 7, indexed 7/19, not: URL is unknown to Google ×6, Discovered - currently not indexed ×6 |
| 2026-10-13 | Daily numbers | 3 accts (0 paid, +0/24h) | — | 0 x402 paid | MCP 24h: 139 authed, 1775 anon, 111 preview, 6 paywall hits; wanted: connect_account 6; changes 7d: 0 (mcp 0, rest 0); indexnow: 14 urls 200; mcp probe: init 200, tools 200 (25 tools), call 200; authed: init 200, tools 200 (25 tools), call 200; wave log: uk-planning [info] GET https://gankdat.com/v1/data/uk-planning?page=4&per_page=100 58 min ago (2 lines); uk-trademark-journal [info] GET https://gankdat.com/v1/data/uk-trademark-journal?page=10&per_page=100 6.1 h ago (9 lines); feeds 30d: 34 fetches, 6 user agents, 34 renders; apify: 285 runs (+18/24h), 30d: 280 runs (1 ours, 279 others), 18 users/30d, 18 public; apify 30d by actor: uk-food-hygiene-ratings 19, uk-care-locations-cqc 18, uk-charities-register 18, uk-new-companies-incorporations 18, uk-public-tenders-find-a-tender 18, uk-corporate-insolvency-notices-gazette 17, uk-sanctions-list-fcdo 17, uk-visa-sponsors-register 17, eu-public-tenders-ted 16, uk-planning-applications 16 (3 failed), us-federal-exclusions-sam-gov 16, nhs-organisations-ods 14, uk-contract-awards-contracts-finder 14, uk-no-website-leads 14 (2 failed), uk-schools-gias-ofsted 14, uk-trademark-journal-watch 14, uk-gambling-commission-licence-register 13, uk-companies-house-lookup-monitor 6; agent sign-up: 0 req/24h, 0 keys/24h, 0 keys/30d; oauth: 0 connects/24h, 0/30d; connect_account 7d by UA: python-requests/2.34.2 26, BrickBlueBot/0.1 (+https://brick.blue/bot?h=gank 6, node 2; oauth funnel 7d: 84 challenges (preview_exhausted 47, protected_tool 37), 2 authorize, 0 rejected, 2 sign-in, 0 email, 0 consent, 0 approved, 0 denied, 0 expired, 6 token (refresh_token 6), 0 token errors; after wall 1h (7d): 0 clients — request_api_key 0, x402 0, connect 0, gone 0; cf usage (10-10→10-13): d1 0.1M writes / 241.1M reads, 3.5 GB, kv 0.0M reads / 0.0M writes, workers 0.0M req, ae 0.0M pts ≈ US$0 overage; datasets 30d: uk-care-locations 220, uk-food-hygiene 129, eu-ted 122, nhs-ods 122, uk-sanctions 122, uk-tenders 122, uk-companies 121, uk-schools 121, sam-exclusions 120, uk-charities 120, uk-gambling-operators 120, uk-insolvency 120, uk-sponsors 120, uk-planning 118, uk-trademark-journal 118, uk-contract-awards 102, uk-company-profiles 6; datasets 30d external: none; 0: eu-ted, nhs-ods, sam-exclusions, uk-care-locations, uk-charities, uk-companies, uk-company-profiles, uk-contract-awards, uk-food-hygiene, uk-gambling-operators, uk-insolvency, uk-planning, uk-sanctions, uk-schools, uk-sponsors, uk-tenders, uk-trademark-journal; refresh errors: uk-planning (origin dataset empty: planning-application answered count 0 (emptied on planning.data.gov.), uk-trademark-journal (no successful refresh since 2026-10-10); search 7d to 10-12: 23 impressions, 0 clicks, avg pos 6.4, top /stats/nhs-ods 7, indexed 7/19, not: Discovered - currently not indexed ×9, URL is unknown to Google ×3 |
| 2026-10-14 | Daily numbers | 3 accts (0 paid, +0/24h) | — | 0 x402 paid | MCP 24h: 160 authed, 2572 anon, 139 preview, 6 paywall hits; wanted: connect_account 6; changes 7d: 0 (mcp 0, rest 0); indexnow: 15 urls 200; mcp probe: init 200, tools 200 (25 tools), call 200; authed: init 200, tools 200 (25 tools), call 200; wave log: uk-planning [info] GET https://gankdat.com/v1/data/uk-planning?page=4&per_page=100 17.7 h ago (2 lines); feeds 30d: 37 fetches, 7 user agents, 37 renders; apify: 286 runs (+1/24h), 30d: 283 runs (1 ours, 282 others), 18 users/30d, 18 public; apify 30d by actor: uk-food-hygiene-ratings 19, uk-care-locations-cqc 18, uk-charities-register 18, uk-new-companies-incorporations 18, uk-public-tenders-find-a-tender 18, uk-visa-sponsors-register 18, eu-public-tenders-ted 17, uk-corporate-insolvency-notices-gazette 17, uk-planning-applications 17 (3 failed), uk-sanctions-list-fcdo 17, us-federal-exclusions-sam-gov 16, nhs-organisations-ods 14, uk-contract-awards-contracts-finder 14, uk-no-website-leads 14 (2 failed), uk-schools-gias-ofsted 14, uk-trademark-journal-watch 14, uk-gambling-commission-licence-register 13, uk-companies-house-lookup-monitor 6; agent sign-up: 0 req/24h, 0 keys/24h, 0 keys/30d; oauth: 0 connects/24h, 0/30d; connect_account 7d by UA: python-requests/2.34.2 27, BrickBlueBot/0.1 (+https://brick.blue/bot?h=gank 6, node 2; oauth funnel 7d: 85 challenges (preview_exhausted 47, protected_tool 38), 2 authorize, 0 rejected, 2 sign-in, 0 email, 0 consent, 0 approved, 0 denied, 0 expired, 6 token (refresh_token 6), 0 token errors; after wall 1h (7d): 0 clients — request_api_key 0, x402 0, connect 0, gone 0; cf usage (10-10→10-14): d1 0.1M writes / 283.8M reads, 3.5 GB, kv 0.0M reads / 0.0M writes, workers 0.0M req, ae 0.0M pts ≈ US$0 overage; datasets 30d: uk-care-locations 220, uk-gambling-operators 130, eu-ted 122, nhs-ods 122, uk-sanctions 122, uk-tenders 122, uk-companies 121, uk-schools 121, sam-exclusions 120, uk-charities 120, uk-food-hygiene 120, uk-insolvency 120, uk-sponsors 120, uk-planning 118, uk-trademark-journal 118, uk-contract-awards 102, uk-company-profiles 6; datasets 30d external: none; 0: eu-ted, nhs-ods, sam-exclusions, uk-care-locations, uk-charities, uk-companies, uk-company-profiles, uk-contract-awards, uk-food-hygiene, uk-gambling-operators, uk-insolvency, uk-planning, uk-sanctions, uk-schools, uk-sponsors, uk-tenders, uk-trademark-journal; refresh errors: uk-planning (origin dataset empty: planning-application answered count 0 (emptied on planning.data.gov.) |
| 2026-10-15 | Daily numbers | 3 accts (0 paid, +0/24h) | — | 0 x402 paid | MCP 24h: 168 authed, 2896 anon, 117 preview, 4 paywall hits; wanted: connect_account 4; changes 7d: 0 (mcp 0, rest 0); indexnow: 15 urls 200; x402 validate: 17/17 valid; bazaar: 1 listed, 0 calls/30d, 0 payers, last 2026-07-10; mcp probe: init 200, tools 200 (25 tools), call 200; authed: init 200, tools 200 (25 tools), call 200; wave log: uk-planning [warn] x402: Route "GET /x402/data/uk-planning" has an invalid bazaar extension: Schema 53 min ago (4 lines); feeds 30d: 39 fetches, 7 user agents, 39 renders; apify: 304 runs (+18/24h), 30d: 301 runs (1 ours, 300 others), 18 users/30d, 18 public; apify 30d by actor: uk-food-hygiene-ratings 20, uk-care-locations-cqc 19, uk-charities-register 19, uk-new-companies-incorporations 19, uk-public-tenders-find-a-tender 19, uk-visa-sponsors-register 19, eu-public-tenders-ted 18, uk-corporate-insolvency-notices-gazette 18, uk-planning-applications 18 (3 failed), uk-sanctions-list-fcdo 18, us-federal-exclusions-sam-gov 17, nhs-organisations-ods 15, uk-contract-awards-contracts-finder 15, uk-no-website-leads 15 (2 failed), uk-schools-gias-ofsted 15, uk-trademark-journal-watch 15, uk-gambling-commission-licence-register 14, uk-companies-house-lookup-monitor 7; agent sign-up: 0 req/24h, 0 keys/24h, 0 keys/30d; oauth: 0 connects/24h, 0/30d; connect_account 7d by UA: python-requests/2.34.2 28, BrickBlueBot/0.1 (+https://brick.blue/bot?h=gank 5, node 2; oauth funnel 7d: 85 challenges (preview_exhausted 47, protected_tool 38), 2 authorize, 0 rejected, 2 sign-in, 0 email, 0 consent, 0 approved, 0 denied, 0 expired, 7 token (refresh_token 7), 0 token errors; after wall 1h (7d): 0 clients — request_api_key 0, x402 0, connect 0, gone 0; cf usage (10-10→10-15): d1 0.1M writes / 335.8M reads, 3.6 GB, kv 0.0M reads / 0.0M writes, workers 0.0M req, ae 0.0M pts ≈ US$0 overage; datasets 30d: uk-care-locations 239, uk-gambling-operators 140, uk-food-hygiene 139, eu-ted 132, nhs-ods 132, uk-sanctions 132, uk-tenders 132, uk-charities 131, uk-companies 131, uk-schools 131, sam-exclusions 130, uk-insolvency 130, uk-sponsors 130, uk-planning 128, uk-trademark-journal 128, uk-contract-awards 112, uk-company-profiles 7; datasets 30d external: none; 0: eu-ted, nhs-ods, sam-exclusions, uk-care-locations, uk-charities, uk-companies, uk-company-profiles, uk-contract-awards, uk-food-hygiene, uk-gambling-operators, uk-insolvency, uk-planning, uk-sanctions, uk-schools, uk-sponsors, uk-tenders, uk-trademark-journal; refresh errors: uk-planning (origin dataset empty: planning-application answered count 0 (emptied on planning.data.gov.) |
| 2026-10-16 | Daily numbers | 3 accts (0 paid, +0/24h) | — | 0 x402 paid | MCP 24h: 170 authed, 2519 anon, 84 preview, 4 paywall hits; wanted: connect_account 4; changes 7d: 0 (mcp 0, rest 0); indexnow: 14 urls 200; x402 validate: 17/17 valid; bazaar: 1 listed, 0 calls/30d, 0 payers, last 2026-07-10; mcp probe: init 200, tools 200 (25 tools), call 200 (tool error: Source 'uk-planning' is temporarily unavailable, retry later); authed: init 200, tools 200 (25 tools), call 200 (tool error: Source 'uk-planning' is temporarily unavailable, retry later); wave log: uk-planning [warn] x402: Route "GET /x402/data/uk-planning" has an invalid bazaar extension: Schema 59 min ago (7 lines); uk-trademark-journal [warn] x402: Route "GET /x402/data/uk-trademark-journal" has an invalid bazaar extensio 2.4 h ago (6 lines); feeds 30d: 41 fetches, 7 user agents, 41 renders; apify: 322 runs (+18/24h), 30d: 319 runs (1 ours, 318 others), 18 users/30d, 18 public; apify 30d by actor: uk-food-hygiene-ratings 21, uk-care-locations-cqc 20, uk-charities-register 20, uk-new-companies-incorporations 20, uk-public-tenders-find-a-tender 20, uk-visa-sponsors-register 20, eu-public-tenders-ted 19, uk-corporate-insolvency-notices-gazette 19, uk-planning-applications 19 (3 failed), uk-sanctions-list-fcdo 19, us-federal-exclusions-sam-gov 18, nhs-organisations-ods 16, uk-contract-awards-contracts-finder 16, uk-no-website-leads 16 (2 failed), uk-schools-gias-ofsted 16, uk-trademark-journal-watch 16, uk-gambling-commission-licence-register 15, uk-companies-house-lookup-monitor 8; agent sign-up: 0 req/24h, 0 keys/24h, 0 keys/30d; oauth: 0 connects/24h, 0/30d; connect_account 7d by UA: python-requests/2.34.2 27, BrickBlueBot/0.1 (+https://brick.blue/bot?h=gank 5, node 2; oauth funnel 7d: 84 challenges (preview_exhausted 47, protected_tool 37), 2 authorize, 0 rejected, 2 sign-in, 0 email, 0 consent, 0 approved, 0 denied, 0 expired, 9 token (refresh_token 9), 0 token errors; after wall 1h (7d): 0 clients — request_api_key 0, x402 0, connect 0, gone 0; cf usage (10-10→10-16): d1 0.2M writes / 386.7M reads, 3.6 GB, kv 0.0M reads / 0.0M writes, workers 0.0M req, ae 0.0M pts ≈ US$0 overage; datasets 30d: uk-care-locations 259, uk-gambling-operators 150, uk-food-hygiene 149, eu-ted 142, nhs-ods 142, uk-sanctions 142, uk-tenders 142, uk-charities 141, uk-companies 141, uk-schools 141, sam-exclusions 140, uk-insolvency 140, uk-sponsors 140, uk-planning 138, uk-trademark-journal 138, uk-contract-awards 122, uk-company-profiles 8; datasets 30d external: none; 0: eu-ted, nhs-ods, sam-exclusions, uk-care-locations, uk-charities, uk-companies, uk-company-profiles, uk-contract-awards, uk-food-hygiene, uk-gambling-operators, uk-insolvency, uk-planning, uk-sanctions, uk-schools, uk-sponsors, uk-tenders, uk-trademark-journal; refresh errors: mcp-probe (call 200 (tool error: Source 'uk-planning' is temporarily unavailable; retry later); authe), uk-planning (origin dataset empty: planning-application answered count 0 (emptied on planning.data.gov.), uk-trademark-journal (no successful refresh since 2026-10-14) |







Not queued: the uk-insolvency 503 (retried once already, a single row — the repeat rule owns it);
more datasets, a pricing change, further listings (triggers unchanged since 10-05); the funnel (the
bottom is still zero, the 10-09 instrumentation is the walk and the next signal is the 10-30 day-30
directory read).

## Decision 2026-10-11 — uk-planning origin paused (burn-down)

planning.data.gov.uk emptied its planning-application dataset on 2026-10-10 (relay
`planning-origin-2026-10-11`: `/dataset/planning-application.json` reports `entity-count 0`, `phase
alpha`, `replacement-dataset ""`; every entity query answers `count 0`; the bulk CSV is 403). The
dataset is still queried — 88 REST calls and 13 Apify runs in the 30 days to 10-10 — so STRATEGY §7's
60-day rule does not retire it. What ships: the 10-09 snapshot stays served; `DataSource.notice` (a
dated sentence, generic field, text owned by the source file) shows the state on `/stats/uk-planning`,
in `/v1/data` and `list_sources`; the refresh throws `origin dataset empty: … count 0` on a count-0
first page so the Daily numbers row carries the cause every night and the auto-filer extends the open
re-read item (`refresh-uk-planning-reread-2026-10-18`, weekly through the relay) rather than filing a
new fix item every two days. **Clock:** retire per §7 when the dataset goes 60 days without a customer
query (the `datasets 30d` reading), or re-point when the platform names a `replacement-dataset`;
either way the row says so.

Re-read 2026-10-18 (burn-down, relay `planning-origin-2026-10-18`): unchanged — `entity-count 0`,
`phase alpha`, `replacement-dataset ""`, `entity.json?limit=5` answers `count 0`; the page now carries
`consideration: planning-applications-decisions` and `github-discussion 25` (the platform's own
design thread for the dataset — the re-point candidate when it republishes). Demand holds: the Apify
actor ran 21 times in 30 days for 18 outside users (5 failed on the empty origin), so the §7 clock does
not start. Next read 2026-10-25 (`refresh-uk-planning-reread-2026-10-18`, `not_before` moved a week).

Surface pause 2026-10-19 (build, `uk-planning-apify-pause`, review W42): the re-read found the origin still
empty, the 10-09 snapshot expired on 10-16 and cannot be re-created, Apify QA flagged the actor "under
maintenance" on 10-17 (INBOX 14:08) and the 10-19 row counts 6 failed of 22 runs in 30 days — every one a
buyer's or QA's run failing on the API's 503 notice. Chosen: pause, not unpublish. The actor stays public
(unpublishing drops the 18 outside users' schedules and spends one of the day's 5 publications on the
restore); its README opens with a dated `Paused` line and `main.mjs` ends a run that meets the `Origin paused`
503 cleanly — status message = the notice, no items pushed, nothing charged — so the failed count stops rising
and a scheduled run resumes by itself when the origin republishes. `/stats/uk-planning` carries a `state:
paused` row and names every paused surface (REST, MCP, x402, Apify); the notice text now says the surfaces
are paused rather than that a snapshot is served. Proof reads from the row: `apify 30d by actor:
uk-planning-applications N (6 failed)` with the 6 not rising, and the actor page without the maintenance
flag at the next `apify` reading. §7 clock unchanged (external-query clock from 10-12; demand is the actor's
18 users, not an external key).

## Research 2026-10-13 (pipeline starved — burn-down)

Read: the 10-10 → 10-12 Daily numbers rows, `docs/INBOX.md` to 10-12 23:12, `docs/ALERTS.md`, the
queue. **What changed since the 10-11 pass:** the 10-12 row shows **3 accounts, +2 in 24 h** — the
first external sign-ups since launch (the counter excludes @gankdat.com and the other internal
domains) — the day after gankdat v0.24.0 shipped the PayPal credit packs and the tool count went
from 23 to 25; the same row has paywall hits down from 55 to 5 and preview calls from 169 to 115,
`connect_account` back among the wanted tools (5). Nothing in the inbox names the two accounts (no
sign-up mail reaches us — the account page and OAuth connect are silent by design), so their route
and whether they call tools are not readable yet: the 10-13 and 10-14 rows (authed MCP calls,
paywall hits, `x402 paid`, `0 paid` or not) are the reading. **Levers:** unchanged — every
distribution lever is built or waiting on a third party (Docker MCP Catalog PR #5622 under review,
Search Console indexing on action 020's data now flowing, the Claude directory read dated 10-30),
the uk-planning origin is on its weekly re-read (10-18), cold B2B outreach was closed on 10-12, and
the marketplace pitch (WuslaHQ, 21 %) is a Sunday-review decision, not a build. The Nebius hackathon
agent built tonight (`scripts/nebius-diligence-agent.ts`) is a new reference client for the MCP
server and goes in the directory listings' "used by" lines when the entry is submitted — no gankdat
change needed. **No items added:** `research_after: 2026-10-15`, when two more rows say what the
two accounts did; if either converts or hits the paywall, the next pass files the follow-up (the
`buy_credits` path is live for them already).

## Research 2026-10-15 (pipeline starved — burn-down)

Read: the 10-13 and 10-14 Daily numbers rows (the two the 10-13 pass waited for), `docs/INBOX.md` to
10-14 08:00, `docs/ALERTS.md`, the queue. **What the two accounts did:** nothing readable — still 3
accounts, 0 paid, +0 in 24 h on both rows, `datasets 30d external: none`, `after wall 1h: 0 clients`,
0 x402 paid, 0 keys issued by the agent path; authed MCP calls rose 139 → 160 a day and anonymous
1775 → 2572, paywall hits 6 a day. **One new number:** the OAuth funnel moved for the first time —
`2 authorize, 2 sign-in, 0 email` on 10-13 and 10-14 (0 on every earlier row): two real OAuth clients
reached the sign-in page from a 401 and neither entered an email address (`signin_shown` 2,
`email_sent` 0, nothing rejected or expired). Two is not a pattern; if the 7-day window reaches
≥ 5 sign-in views with 0 emails, the next pass files a sign-in-page item (copy, what the page promises,
whether the form is reachable from the client's embedded browser) — the 10-09 funnel walk saw the page
work from a desktop client. **Levers:** unchanged since 10-13 (Docker PR #5622 under review, Search
Console 7/19 indexed with 0 clicks, uk-planning on its 10-18 re-read, the Bazaar listing waiting on
action 026, the Claude directory read on 10-30); the 10-14 builds (Bazaar clause, validate verdict,
v0.25.1 typed examples) write their first readings on the 10-15 row, after this pass. **No items
added:** `research_after: 2026-10-16` — the 10-15 and 10-16 rows carry the first `bazaar:` and
`x402 validate:` clauses since the v0.25.1 fix and show whether the sign-in drop repeats.


## Research 2026-10-17 (pipeline starved — burn-down)

Read: the 10-15 and 10-16 Daily numbers rows (the two the 10-15 pass waited for), `docs/INBOX.md` to
10-16 21:03, `docs/ALERTS.md`, the queue, the 10-16 metrics job log (run 38866226604) and the relay
request `gankdat-research-2026-10-17` (`/v1/health`, `/stats/uk-planning`, three x402 402s, CDP validate
for the two flagged routes — answered 00:17 UTC). **Unchanged:** 3 accounts, 0 paid, 0 x402 paid, `datasets
30d external: none`, `after wall 1h: 0 clients`, the OAuth sign-in reading still the same two 10-13 events
(`2 authorize, 2 sign-in, 0 email`, below the ≥ 5 threshold), `bazaar: 1 listed, 0 calls` (the 10-16 row
was written at 07:19, eight hours before the first settled half-cent call — the 10-17 row is the first that
can show the listing grow), `x402 validate: 17/17 valid`. **Three new readings, two of them defects:**

| Signal | Reading |
| --- | --- |
| uk-planning | `/v1/health`: last refreshed 2026-10-09 05:01, 187 h; `GET /stats/uk-planning` → **503** `Statistics are being prepared`; the 10-16 MCP probe's keyless and authed `tools/call` both got `tool error: Source 'uk-planning' is temporarily unavailable`. Cause: `cache.ts` keeps a KV snapshot for `cacheTtlSeconds × 7` = 7 days and the failing refresh (by design since 10-11) writes nothing, so the 10-09 snapshot and its stats blob expired 10-16 ~05:00 — the "last snapshot stays served" of the 10-11 decision held for exactly seven days. Every REST/MCP/x402/Apify call on the dataset now fails; the indexed stats page is a JSON 503 |
| Worker log noise | both stale slugs' wave-log lines were `x402: Route "GET /x402/data/<slug>" has an invalid bazaar extension: Schema validation failed: Code generation from strings disallowed for this context` — @x402/hono's `validateBazaarRouteExtensions` runs Ajv (`new Function`) on each isolate's first lit request and workerd forbids code generation; it logs for all 17 routes (the slug search sees only the two stale ones). Reproduced locally: Node has codegen, so the same call only prints Ajv's "unknown format date" notices. No effect on the lane — the 402 bodies and `PAYMENT-REQUIRED` are intact and CDP's validate answers `valid: true` for both routes — but the reading's one newest line is this noise |
| uk-trademark-journal | `no successful refresh since 2026-10-14` with no error and no skipped row; the 24-h slug log has no wave line at all (6 lines: three requests, two `[error] GET /stats/…/class/NN`, the warning above). Third silent streak since 10-04: ok 10-10, silent 10-11..13, ok 10-14 (06:10:42), silent 10-15..16 — success every fourth night, both ok nights under 6 min |

Queued in `docs/pipeline/queues/gankdat.json`:

| Item | Score | Why now |
| --- | --- | --- |
| `uk-planning-paused-snapshot-retention` | 7 | a failed refresh with a snapshot re-puts data + stats with a fresh TTL (a touch, no origin read); `/stats/<slug>` renders the notice when the blob is gone; the 503 / tool error for a `notice` source says the notice. Live 503 on an indexed page, the probe red on both passes, an Apify actor with 19 outside runs/30d failing |
| `wave-log-cron-outcome-reading` | 6 | drop request lines and the x402 warning from the slug search and read the wave's own cron invocation (`$workers.event.cron`, `$workers.outcome`, wall time) — the reading the 10-09 build notes asked for when a night is silent; built 10-09, its first real test showed noise |
| `refresh-uk-trademark-journal-2026-10-17` | 6 | why wave 7 dies three nights in four (hypotheses ordered: a new-issue night exceeding the CPU/wall limit; memory on the 162k-row index + XML parse; the trigger), fix so every night writes a row; filed under the auto-filer's id so the 10-17 row extends it |
| 2026-10-17 | Daily numbers | 3 accts (0 paid, +0/24h) | — | 1 x402 paid (+1 own probe) | MCP 24h: 148 authed, 2736 anon, 88 preview, 4 paywall hits; wanted: connect_account 4; changes 7d: 0 (mcp 0, rest 0); indexnow: 15 urls 200; x402 validate: 17/17 valid; bazaar: 1 listed, 1 calls/30d, 1 payers, last 2026-10-16; mcp probe: init 200, tools 200 (25 tools), call 200; authed: init 200, tools 200 (25 tools), call 200; wave log: uk-planning wave 05:00: no invocation in 26 h, [error] Error compiling schema, function code: const schema1 = scope.schema[1]; const sch 5 min ago (16 of 20 lines); feeds 30d: 45 fetches, 7 user agents, 45 renders; apify: 357 runs (+35/24h), 30d: 355 runs (1 ours, 354 others), 18 users/30d, 18 public; apify 30d by actor: uk-food-hygiene-ratings 23, uk-care-locations-cqc 22, uk-charities-register 22, uk-new-companies-incorporations 22, uk-public-tenders-find-a-tender 22, uk-visa-sponsors-register 22, eu-public-tenders-ted 21, uk-corporate-insolvency-notices-gazette 21, uk-planning-applications 21 (5 failed), uk-sanctions-list-fcdo 21, us-federal-exclusions-sam-gov 20, nhs-organisations-ods 18, uk-contract-awards-contracts-finder 18, uk-no-website-leads 18 (2 failed), uk-schools-gias-ofsted 18, uk-trademark-journal-watch 18, uk-gambling-commission-licence-register 17, uk-companies-house-lookup-monitor 10; agent sign-up: 0 req/24h, 0 keys/24h, 0 keys/30d; oauth: 0 connects/24h, 0/30d; connect_account 7d by UA: python-requests/2.34.2 26, BrickBlueBot/0.1 (+https://brick.blue/bot?h=gank 5, node 2; oauth funnel 7d: 83 challenges (preview_exhausted 47, protected_tool 36), 2 authorize, 0 rejected, 2 sign-in, 0 email, 0 consent, 0 approved, 0 denied, 0 expired, 12 token (refresh_token 12), 0 token errors; after wall 1h (7d): 0 clients — request_api_key 0, x402 0, connect 0, gone 0; cf usage (10-10→10-17): d1 0.2M writes / 472.6M reads, 3.6 GB, kv 0.0M reads / 0.0M writes, workers 0.0M req, ae 0.0M pts ≈ US$0 overage; stats crawlers: logs 0 fetches/7d, AI 0 (none); zone n/a (zone: Actor 'com.cloudflare.api.token.c42d0370c6783e3a270770a3a775243c' does not have ); /mcp 63763 req/30d, AI 236 (Claude-User 193, PetalBot 24, Amazonbot 12, ClaudeBot 2, Applebot 1, Google-Extended 1); datasets 30d: uk-care-locations 299, uk-food-hygiene 169, eu-ted 162, nhs-ods 162, uk-sanctions 162, uk-tenders 162, uk-charities 161, uk-companies 161, uk-schools 161, sam-exclusions 160, uk-gambling-operators 160, uk-sponsors 160, uk-insolvency 159, uk-trademark-journal 158, uk-contract-awards 142, uk-planning 138, uk-company-profiles 10; datasets 30d external: none; 0: eu-ted, nhs-ods, sam-exclusions, uk-care-locations, uk-charities, uk-companies, uk-company-profiles, uk-contract-awards, uk-food-hygiene, uk-gambling-operators, uk-insolvency, uk-planning, uk-sanctions, uk-schools, uk-sponsors, uk-tenders, uk-trademark-journal; refresh errors: uk-planning (origin dataset empty: planning-application answered count 0 (emptied on planning.data.gov.), apify-uk-planning-applications (2 new failed run(s) since the last row, 5 of 21 in 30 d); search 7d to 10-16: 22 impressions, 0 clicks, avg pos 6.6, top /stats/uk-trademark-journal/class/24 5, indexed 7/19, not: Discovered - currently not indexed ×9, URL is unknown to Google ×3 |
| 2026-10-18 | Daily numbers | 3 accts (0 paid, +0/24h) | — | 3 x402 paid | MCP 24h: 143 authed, 2970 anon, 88 preview, 4 paywall hits; wanted: connect_account 4; changes 7d: 0 (mcp 0, rest 0); indexnow: 15 urls 200; x402 validate: 17/17 valid; bazaar: 1 listed, 3 calls/30d, 3 payers, last 2026-10-18; mcp probe: init 200, tools 200 (25 tools), call n/a (The operation was aborted due to timeout); authed: init 200, tools 200 (25 tools), call 200; wave log: uk-planning wave 05:00: no invocation in 26 h, [error] Error compiling schema, function code: const schema1 = scope.schema[1]; const sch 13.7 h ago (11 of 12 lines); feeds 30d: 50 fetches, 7 user agents, 50 renders; apify: 358 runs (+1/24h), 30d: 356 runs (1 ours, 355 others), 18 users/30d, 18 public; apify 30d by actor: uk-food-hygiene-ratings 23, uk-care-locations-cqc 22, uk-charities-register 22, uk-new-companies-incorporations 22, uk-public-tenders-find-a-tender 22, uk-visa-sponsors-register 22, eu-public-tenders-ted 21, uk-corporate-insolvency-notices-gazette 21, uk-planning-applications 21 (5 failed), uk-sanctions-list-fcdo 21, us-federal-exclusions-sam-gov 20, nhs-organisations-ods 18, uk-contract-awards-contracts-finder 18, uk-gambling-commission-licence-register 18, uk-no-website-leads 18 (2 failed), uk-schools-gias-ofsted 18, uk-trademark-journal-watch 18, uk-companies-house-lookup-monitor 10; agent sign-up: 0 req/24h, 0 keys/24h, 0 keys/30d; oauth: 0 connects/24h, 0/30d; connect_account 7d by UA: python-requests/2.34.2 26, BrickBlueBot/0.1 (+https://brick.blue/bot?h=gank 5, agent-collector/0.1 (+capability survey/ no paym 1; oauth funnel 7d: 33 challenges (protected_tool 33), 2 authorize, 0 rejected, 2 sign-in, 0 email, 0 consent, 0 approved, 0 denied, 0 expired, 12 token (refresh_token 12), 0 token errors; after wall 1h (7d): 0 clients — request_api_key 0, x402 0, connect 0, gone 0; cf usage (10-10→10-18): d1 0.2M writes / 511.2M reads, 3.6 GB, kv 0.0M reads / 0.0M writes, workers 0.1M req, ae 0.0M pts ≈ US$0 overage; stats crawlers: logs 0 fetches/7d, AI 0 (none) — 23 lines matched, none a request line; zone n/a (zone: Actor 'com.cloudflare.api.token.c42d0370c6783e3a270770a3a775243c' does not have ); /mcp 65179 req/30d, AI 243 (Claude-User 195, PetalBot 29, Amazonbot 12, ClaudeBot 2, Applebot 1, Google-Extended 1); datasets 30d: uk-care-locations 299, sam-exclusions 169, uk-gambling-operators 169, eu-ted 162, nhs-ods 162, uk-sanctions 162, uk-tenders 162, uk-charities 161, uk-companies 161, uk-schools 161, uk-food-hygiene 160, uk-insolvency 160, uk-sponsors 160, uk-trademark-journal 158, uk-contract-awards 142, uk-planning 138, uk-company-profiles 10; datasets 30d external: none; 0: eu-ted, nhs-ods, sam-exclusions, uk-care-locations, uk-charities, uk-companies, uk-company-profiles, uk-contract-awards, uk-food-hygiene, uk-gambling-operators, uk-insolvency, uk-planning, uk-sanctions, uk-schools, uk-sponsors, uk-tenders, uk-trademark-journal; refresh errors: mcp-probe (call n/a (The operation was aborted due to timeout)), uk-planning (origin dataset empty: planning-application answered count 0 (emptied on planning.data.gov.); search 7d to 10-17: 19 impressions, 0 clicks, avg pos 6.8, top /stats/uk-trademark-journal/class/24 5, indexed 7/18, not: Discovered - currently not indexed ×8, URL is unknown to Google ×3, 1 inspection failed |



Not queued: the x402 warning at source (only if cheap inside the reading item — the lane is unaffected);
more datasets, pricing, listings (triggers unchanged since 10-05); the Bazaar reading (dated 11-14, the
10-17 row shows whether the 10-16 payment indexed the routes); the sign-in drop (two events, no repeat).
`researched: 2026-10-17`; the first item is buildable now and `next` names it.

## Build 2026-10-17 — cron outcome reading (burn-down)

Built `wave-log-cron-outcome-reading` (score 6). What changed: the wave-log reading drops the invocation
request lines and @x402/hono's Ajv warning before it picks a line, prefers a structured refresh event, and
reads each stale source's wave by its Cron Trigger as a second observability query. Evidence read this
run: the Workers Logs docs through the relay (`docs/relay/responses/cf-workers-logs-fields-2026-10-17`,
page 1 of 3 — the query-builder and fields pages 404 at the guessed paths; a second request,
`cf-query-builder-2026-10-17`, asks for the sidebar's `/workers/observability/query-builder/` and the
real-time-logs page for the outcome shape): an invocation log is `$metadata.type = "cf-worker-event"`,
and a cron invocation's message is the schedule itself (`5 6 * * *`), so the query filters on that type
and uses the cron as the needle; `$workers.outcome`, `$workers.wallTimeMs` and `$workers.event.cron` are
read when present (the docs page does not list them; the runner prints the first raw invocation row when
nothing parsed, so the 10-17 metrics log confirms or corrects the field names). The x402 warning is muted
at the lane for that exact message only (`withoutCodegenWarning`), because 17 warn lines per isolate
start were the newest line of every stale source's reading. What the next row should say: for
uk-trademark-journal, `wave 06:05: <outcome> <wall>s <age>` — `exceededCpu` or `exceededMemory` confirms
hypothesis (a)/(b) of `refresh-uk-trademark-journal-2026-10-17`, `ok` with no refresh line means the wave
ran and wrote nothing (a code path, not the platform), `no invocation in 26 h` means the trigger never
fired (c). If the row reads `wave 06:05: unknown`, the invocation rows carry no `$workers.outcome` in the
API's shape — read the printed first row in the job log and rename the fields.
Relay `cf-query-builder-2026-10-17` (read the same run): the Query Builder page names `$workers.cpuTimeMs`,
`$workers.event.request.path` and `$metadata.message` as filter keys, so the `$workers.*` reads follow the
documented naming; `wrangler tail`'s object (`outcome: "ok"`, `event`, `eventTimestamp`) is the same record.
`refresh-uk-trademark-journal-2026-10-17` waits for the 10-17 row (`not_before` 2026-10-18).

## Build 2026-10-18 — refresh progress marker (build)

Built `refresh-uk-trademark-journal-2026-10-17` (score 6). Evidence first: the 10-17 and 10-18 Daily
numbers rows list no stale journal, so wave 7 wrote `ok` rows on both nights (ok 10-10, silent
10-11..13, ok 10-14, silent 10-15/16, ok 10-17, ok 10-18 — two in a row, not "every fourth night")
and the cron-outcome reading built on 10-17 never ran for it. And the 10-16 metrics job log (run
38866226604), the first real read of the slug query, returned not one line from any cron wave in
24 h: uk-planning's 7 lines were request lines and the x402 warning, though wave 1 refreshed 14
sources that morning and logs `refresh_wave` with its slugs, and uk-planning's nightly failure
logs `refresh_failed`. Workers Logs, as the runner queries them, see HTTP invocations only; the
clause now says `no invocation logged in 26 h` and `wave-log-cron-query-blind` (4) is queued to find
the filter or retire the clause. So the diagnosis cannot come from logs — it has to come from the
Worker itself.

What changed: `src/sources/progress.ts`. Every attempt puts `refresh:progress:<slug>` in KV at
start and at each phase — `backfill`, `index N rows`, `stream N records` (every 25k), `written`,
`stats` — and deletes it once its own `refresh_log` row is written (one KV write a second per key:
closer marks are skipped, the delete waits the gap). A marker still there when the next attempt
starts means the previous one was killed with no `catch`: `recordSilentRefresh` writes the row that
night owed — `error`, `silent refresh started 2026-10-15 06:05:03Z died after stream 120000 records
at 612 s, no row written` (no parentheses or pipes, the row parser splits on them). So a silent night
has its row by the next 06:05, before the 07:13 metrics job; a second silent night in a row shows
under `refresh errors` with the phase. Two defensive changes with it: the `ok` row is written before
the best-effort stats in all three paths (`refreshD1Delta`, `refreshD1Full`, `refreshSource`) — the
45-class facet aggregation is the longest phase of the journal's wave and a kill inside it took the
night's row with it; and the journal's issue fetch carries `AbortSignal.timeout(5 min)` so a request
the IPO never answers becomes an error row, not a silent death (its missing-issue probes re-run
every 5 days for 11 unpublished ids). The Daily numbers row carries `silent nights: <slug> started <when> died after <phase> …` on
the day such a row is written, whatever followed it (a later `ok` row rightly hides it from `refresh
errors`), so the follow-up item reads the phase from the repo. Tests: `test/refresh-progress.spec.ts` (5),
`refresh-retry` adjusted to ignore the marker's KV writes. Taskmaster row 38. No version bump (refresh internals,
no surface change). Root cause still open by design: `refresh-uk-trademark-journal-silent-row-2026-10-22`
(5) reads the first silent-refresh row and fixes the phase it names, or drops on 10-25 with four
clean rows.

## Research 2026-10-19 (pipeline starved — burn-down)

Read: the 10-17 and 10-18 Daily numbers rows (the two written since the 10-17 pass), the 10-18 metrics
job log (run 39106552120), `docs/INBOX.md` to 10-18 23:04, `docs/ALERTS.md`, the queue, review W42's
three gankdat items (10-18) and `src/x402/routes.ts` / `scripts/metrics.mjs` for what the `x402 paid`
clause can and cannot say. **What changed:** the first external x402 payments in the lane's life —
`1 x402 paid (+1 own probe)` on 10-17 and `3 x402 paid` on 10-18 (24-h counts excluding the
`gankdat-x402-probe/` user agent), `bazaar: 1 listed, 3 calls/30d, 3 payers, last 2026-10-18` (CDP's own
numbers for the one indexed resource; the probe skipped itself on 10-18 because its 10-17 payment was
under the 7-day spacing). Everything else is the 10-17 reading: 3 accounts, 0 paid, `datasets 30d external:
none`, `after wall 1h: 0 clients`, the OAuth sign-in reading still the two 10-13 events, `x402 validate:
17/17 valid`, search 7/18 indexed with 0 clicks, Apify 18 users/30d, uk-planning still empty at the 10-18
re-read, the journal's two clean nights after the progress marker. **Already acted on:** review W42
(10-18) queued `x402-bazaar-week-1-index-check` (10-23: why 1 of 17 routes is listed), `uk-planning-apify-pause`
(opens 10-19 07:00) and `refresh-uk-trademark-journal-silent-row-2026-10-22`, and set the ledger
convention for USDC receipts (carry the running total in RESEARCH.md until it reaches £0.01; US$0.015 so far).

**The one gap the rows leave:** nothing the routines read says *what sold*. The `x402_paid` analytics
point carries the user agent (blob2), the path (blob3), the slug (blob5) and the hashed client id (blob6),
but `metrics.mjs` reads it only as a count in `kinds` and as a `moveRows` kind for the after-wall clause;
the `bazaar:` clause sums CDP's per-resource numbers over every resource (`bazaarSummary`) and the job log
prints no resource list. So the row says `3 x402 paid` and neither the dataset, the number of distinct
payers by our own count, nor whether the payers are the Bazaar's discovery clients, a script, or one
agent retrying is readable without `npm run traffic` and a Cloudflare token no routine holds. Both dated
reads that follow (10-23 week-1, 11-14 day-30) and the "extend: more routes, curation tier" decision are
by resource, and the §7 dataset clock (`datasets 30d external`) does not count x402 calls at all — a paid
x402 call on a register is external demand it should see.

Queued in `docs/pipeline/queues/gankdat.json`:

| Item | Score | Why now |
| --- | --- | --- |
| `x402-paid-by-source-reading` | 5 | the `x402 paid` clause names the source, the UA family and the distinct client count for the 24-h and 30-day external payments (`3 x402 paid (uk-sanctions 2, eu-ted 1; 3 clients; python-requests 2, x402-fetch 1)`; `x402 30d: …`), the runner prints CDP's per-resource list under the `bazaar:` read, and paid x402 calls count toward `datasets 30d external`. Pure SQL on blobs already written, a clause and its test — 0.05 day; the first three sales are two days old and unnamed |
| 2026-10-19 | Daily numbers | 3 accts (0 paid, +0/24h) | — | 0 x402 paid | MCP 24h: 139 authed, 3138 anon, 112 preview, 6 paywall hits; wanted: connect_account 6; changes 7d: 0 (mcp 0, rest 0); indexnow: 15 urls 200; x402 validate: 17/17 valid; bazaar: 1 listed, 3 calls/30d, 3 payers, last 2026-10-18; x402 30d: 3 paid, 3 clients — uk-tenders 3; SettledScout 1, lumiere-paycheck-prober 1, vet402-observatory-l1 1; mcp probe: init 200, tools 200 (25 tools), call 200; authed: init 200, tools 200 (25 tools), call 200; wave log: uk-planning wave 05:00: no invocation logged in 26 h, no log line in 24 h (2 noise lines); feeds 30d: 51 fetches, 8 user agents, 51 renders; apify: 376 runs (+18/24h), 30d: 374 runs (1 ours, 373 others), 18 users/30d, 18 public; apify 30d by actor: uk-food-hygiene-ratings 24, uk-care-locations-cqc 23, uk-charities-register 23, uk-new-companies-incorporations 23, uk-public-tenders-find-a-tender 23, uk-visa-sponsors-register 23, eu-public-tenders-ted 22, uk-corporate-insolvency-notices-gazette 22, uk-planning-applications 22 (6 failed), uk-sanctions-list-fcdo 22, us-federal-exclusions-sam-gov 21, nhs-organisations-ods 19, uk-contract-awards-contracts-finder 19, uk-gambling-commission-licence-register 19, uk-no-website-leads 19 (2 failed), uk-schools-gias-ofsted 19, uk-trademark-journal-watch 19, uk-companies-house-lookup-monitor 11; agent sign-up: 0 req/24h, 0 keys/24h, 0 keys/30d; oauth: 0 connects/24h, 0/30d; connect_account 7d by UA: python-requests/2.34.2 26, BrickBlueBot/0.1 (+https://brick.blue/bot?h=gank 5, agent-collector/0.1 (+capability survey/ no paym 1; oauth funnel 7d: 33 challenges (protected_tool 33), 2 authorize, 0 rejected, 2 sign-in, 0 email, 0 consent, 0 approved, 0 denied, 0 expired, 14 token (refresh_token 14), 0 token errors; after wall 1h (7d): 0 clients — request_api_key 0, x402 0, connect 0, gone 0; cf usage (10-10→10-19): d1 0.2M writes / 570.4M reads, 3.6 GB, kv 0.0M reads / 0.0M writes, workers 0.1M req, ae 0.0M pts ≈ US$0 overage; stats crawlers: logs 0 fetches/7d, AI 0 (none) — 21 lines matched, none a request line; zone n/a (zone: Actor 'com.cloudflare.api.token.c42d0370c6783e3a270770a3a775243c' does not have ); /mcp 67601 req/30d, AI 252 (Claude-User 203, PetalBot 29, Amazonbot 12, ClaudeBot 2, Applebot 1, Google-Extended 1); datasets 30d: uk-care-locations 319, uk-gambling-operators 180, uk-food-hygiene 179, eu-ted 172, uk-sanctions 172, uk-tenders 172, nhs-ods 171, uk-charities 171, uk-companies 171, uk-schools 171, sam-exclusions 170, uk-sponsors 170, uk-insolvency 169, uk-trademark-journal 168, uk-contract-awards 152, uk-planning 138, uk-company-profiles 11; datasets 30d external: uk-tenders 3 (x402 3); 0: eu-ted, nhs-ods, sam-exclusions, uk-care-locations, uk-charities, uk-companies, uk-company-profiles, uk-contract-awards, uk-food-hygiene, uk-gambling-operators, uk-insolvency, uk-planning, uk-sanctions, uk-schools, uk-sponsors, uk-trademark-journal; refresh errors: uk-planning (origin dataset empty: planning-application answered count 0 (emptied on planning.data.gov.), apify-uk-planning-applications (1 new failed run(s) since the last row, 6 of 22 in 30 d); search 7d to 10-18: 18 impressions, 0 clicks, avg pos 10.3, top /terms 4, indexed 8/19, not: Discovered - currently not indexed ×9, URL is unknown to Google ×2 |
| 2026-10-20 | Daily numbers | 4 accts (0 paid, +1/24h) | — | 0 x402 paid | MCP 24h: 155 authed, 3126 anon, 84 preview, 3 paywall hits; wanted: connect_account 3; changes 7d: 1 (mcp 0, rest 1); indexnow: 15 urls 200; x402 validate: 17/17 valid; bazaar: 1 listed, 3 calls/30d, 3 payers, last 2026-10-18; x402 30d: 3 paid, 3 clients — uk-tenders 3; SettledScout 1, lumiere-paycheck-prober 1, vet402-observatory-l1 1; mcp probe: init 200, tools 200 (25 tools), call 200; authed: init 200, tools 200 (25 tools), call 200; wave log: uk-planning wave 05:00: no invocation logged in 26 h, no log line in 24 h (10 noise lines); feeds 30d: 54 fetches, 8 user agents, 54 renders; apify: 395 runs (+19/24h), 30d: 392 runs (1 ours, 391 others), 19 users/30d, 18 public; apify 30d by actor: uk-visa-sponsors-register 25, uk-care-locations-cqc 24, uk-charities-register 24, uk-food-hygiene-ratings 24, uk-new-companies-incorporations 24, uk-public-tenders-find-a-tender 24, eu-public-tenders-ted 23, uk-corporate-insolvency-notices-gazette 23, uk-planning-applications 23 (7 failed), uk-sanctions-list-fcdo 23, us-federal-exclusions-sam-gov 22, nhs-organisations-ods 20, uk-contract-awards-contracts-finder 20, uk-gambling-commission-licence-register 20, uk-no-website-leads 20 (2 failed), uk-schools-gias-ofsted 20, uk-trademark-journal-watch 20, uk-companies-house-lookup-monitor 12; agent sign-up: 0 req/24h, 0 keys/24h, 0 keys/30d; oauth: 0 connects/24h, 0/30d; connect_account 7d by UA: python-requests/2.34.2 25, BrickBlueBot/0.1 (+https://brick.blue/bot?h=gank 4, SentinelOracle/0.1 (+https://glimind.com/opt-out 1; oauth funnel 7d: 30 challenges (protected_tool 30), 0 authorize, 2 rejected (invalid_target: resource must be https://gankdat.com/mcp 2), 0 sign-in, 0 email, 0 consent, 0 approved, 0 denied, 0 expired, 14 token (refresh_token 14), 0 token errors; after wall 1h (7d): 0 clients — request_api_key 0, x402 0, connect 0, gone 0; cf usage (10-10→10-20): d1 0.3M writes / 634.0M reads, 3.6 GB, kv 0.0M reads / 0.0M writes, workers 0.1M req, ae 0.0M pts ≈ US$0 overage; stats crawlers: logs 0 fetches/7d, AI 0 (none) — 14 lines matched, none a request line; zone n/a (zone: Actor 'com.cloudflare.api.token.c42d0370c6783e3a270770a3a775243c' does not have ); /mcp 70015 req/30d, AI 271 (Claude-User 219, PetalBot 32, Amazonbot 12, ClaudeBot 2, Applebot 1, Google-Extended 1); datasets 30d: uk-care-locations 339, uk-gambling-operators 190, uk-food-hygiene 189, eu-ted 182, uk-sanctions 182, uk-tenders 182, nhs-ods 181, uk-charities 181, uk-companies 181, uk-schools 181, sam-exclusions 180, uk-sponsors 180, uk-trademark-journal 180, uk-insolvency 179, uk-contract-awards 162, uk-planning 138, uk-company-profiles 12; datasets 30d external: uk-tenders 3 (x402 3), uk-trademark-journal 2; 0: eu-ted, nhs-ods, sam-exclusions, uk-care-locations, uk-charities, uk-companies, uk-company-profiles, uk-contract-awards, uk-food-hygiene, uk-gambling-operators, uk-insolvency, uk-planning, uk-sanctions, uk-schools, uk-sponsors; refresh errors: uk-planning (origin dataset empty: planning-application answered count 0 (emptied on planning.data.gov.), apify-uk-planning-applications (1 new failed run(s) since the last row, 7 of 23 in 30 d); search 7d to 10-19: 16 impressions, 0 clicks, avg pos 9.3, top /terms 4, indexed 8/19, not: URL is unknown to Google ×6, Discovered - currently not indexed ×5 |
| 2026-10-21 | Daily numbers | 4 accts (0 paid, +0/24h) | — | 0 x402 paid | MCP 24h: 167 authed, 3121 anon, 103 preview, 5 paywall hits; wanted: connect_account 5; changes 7d: 4 (mcp 0, rest 4); indexnow: 15 urls 200; x402 validate: 17/17 valid; bazaar: 1 listed, 3 calls/30d, 3 payers, last 2026-10-18; x402 30d: 3 paid, 3 clients — uk-tenders 3; SettledScout 1, lumiere-paycheck-prober 1, vet402-observatory-l1 1; mcp probe: init 200, tools 200 (25 tools), call 200; authed: init 200, tools 200 (25 tools), call 200; wave log: uk-planning wave 05:00: ok 79.0s 1.9 h ago, [error] origin dataset empty: planning-application answered count 0 (emptied on planning 2.0 h ago (2 of 10 lines); feeds 30d: 54 fetches, 8 user agents, 54 renders; apify: 416 runs (+21/24h), 30d: 412 runs (0 ours, 412 others), 19 users/30d, 18 public; apify 30d by actor: uk-visa-sponsors-register 28, uk-food-hygiene-ratings 26, uk-care-locations-cqc 25, uk-charities-register 25, uk-new-companies-incorporations 25, uk-public-tenders-find-a-tender 25, eu-public-tenders-ted 24, uk-corporate-insolvency-notices-gazette 24, uk-planning-applications 24 (7 failed), uk-sanctions-list-fcdo 24, us-federal-exclusions-sam-gov 23, nhs-organisations-ods 21, uk-contract-awards-contracts-finder 21, uk-gambling-commission-licence-register 21, uk-no-website-leads 21 (2 failed), uk-schools-gias-ofsted 21, uk-trademark-journal-watch 21, uk-companies-house-lookup-monitor 13; agent sign-up: 0 req/24h, 0 keys/24h, 0 keys/30d; oauth: 0 connects/24h, 0/30d; connect_account 7d by UA: python-requests/2.34.2 24, BrickBlueBot/0.1 (+https://brick.blue/bot?h=gank 4, SentinelOracle/0.1 (+https://glimind.com/opt-out 1; oauth funnel 7d: 29 challenges (protected_tool 29), 0 authorize, 2 rejected (invalid_target: resource must be https://gankdat.com/mcp 2), 0 sign-in, 0 email, 0 consent, 0 approved, 0 denied, 0 expired, 15 token (refresh_token 15), 0 token errors; after wall 1h (7d): 0 clients — request_api_key 0, x402 0, connect 0, gone 0; cf usage (10-10→10-21): d1 0.3M writes / 694.6M reads, 3.7 GB, kv 0.0M reads / 0.0M writes, workers 0.1M req, ae 0.0M pts ≈ US$0 overage; stats crawlers: logs 0 fetches/7d, AI 0 (none) — 134 lines matched, none a request line; zone n/a (zone: Actor 'com.cloudflare.api.token.c42d0370c6783e3a270770a3a775243c' does not have ); /mcp 71308 req/30d, AI 277 (Claude-User 225, PetalBot 32, Amazonbot 12, ClaudeBot 2, Applebot 1, Google-Extended 1); datasets 30d: uk-care-locations 359, uk-gambling-operators 200, uk-food-hygiene 199, eu-ted 192, uk-sanctions 192, uk-tenders 192, uk-charities 191, uk-companies 191, uk-schools 191, nhs-ods 190, sam-exclusions 190, uk-sponsors 190, uk-trademark-journal 190, uk-insolvency 189, uk-contract-awards 171, uk-planning 138, uk-company-profiles 13; datasets 30d external: uk-tenders 3 (x402 3), uk-trademark-journal 2; 0: eu-ted, nhs-ods, sam-exclusions, uk-care-locations, uk-charities, uk-companies, uk-company-profiles, uk-contract-awards, uk-food-hygiene, uk-gambling-operators, uk-insolvency, uk-planning, uk-sanctions, uk-schools, uk-sponsors; refresh errors: uk-planning (origin dataset empty: planning-application answered count 0 (emptied on planning.data.gov.); search 7d to 10-20: 14 impressions, 0 clicks, avg pos 10.2, top /terms 3, indexed 8/19, not: Discovered - currently not indexed ×9, URL is unknown to Google ×2 |
| 2026-10-22 | Daily numbers | 4 accts (0 paid, +0/24h) | — | 0 x402 paid | MCP 24h: 272 authed, 1728 anon, 107 preview, 4 paywall hits; wanted: connect_account 4; changes 7d: 4 (mcp 0, rest 4); indexnow: 15 urls 200; x402 validate: 17/17 valid; bazaar: 1 listed, 3 calls/30d, 3 payers, last 2026-10-18; x402 30d: 3 paid, 3 clients — uk-tenders 3; SettledScout 1, lumiere-paycheck-prober 1, vet402-observatory-l1 1; mcp probe: init 200, tools 200 (25 tools), call 200; authed: init 200, tools 200 (25 tools), call 200; wave log: uk-planning wave 05:00: ok 104.0s 15.2 h ago, no log line in 24 h (11 noise lines); feeds 30d: 59 fetches, 9 user agents, 59 renders; apify: 451 runs (+35/24h), 30d: 447 runs (0 ours, 447 others), 19 users/30d, 18 public; apify 30d by actor: uk-visa-sponsors-register 31, uk-care-locations-cqc 27, uk-charities-register 27, uk-food-hygiene-ratings 27, uk-new-companies-incorporations 27, uk-public-tenders-find-a-tender 27, eu-public-tenders-ted 26, uk-corporate-insolvency-notices-gazette 26, uk-planning-applications 26 (7 failed), uk-sanctions-list-fcdo 26, us-federal-exclusions-sam-gov 25, nhs-organisations-ods 23, uk-contract-awards-contracts-finder 23, uk-no-website-leads 23 (2 failed), uk-schools-gias-ofsted 23, uk-trademark-journal-watch 23, uk-gambling-commission-licence-register 22, uk-companies-house-lookup-monitor 15; agent sign-up: 0 req/24h, 0 keys/24h, 0 keys/30d; oauth: 0 connects/24h, 0/30d; connect_account 7d by UA: python-requests/2.34.2 23, BrickBlueBot/0.1 (+https://brick.blue/bot?h=gank 3, SentinelOracle/0.1 (+https://glimind.com/opt-out 1; oauth funnel 7d: 27 challenges (protected_tool 27), 0 authorize, 2 rejected (invalid_target: resource must be https://gankdat.com/mcp 2), 0 sign-in, 0 email, 0 consent, 0 approved, 0 denied, 0 expired, 14 token (refresh_token 14), 0 token errors; after wall 1h (7d): 0 clients — request_api_key 0, x402 0, connect 0, gone 0; cf usage (10-10→10-22): d1 0.4M writes / 764.8M reads, 3.7 GB, kv 0.0M reads / 0.0M writes, workers 0.1M req, ae 0.0M pts ≈ US$0 overage; stats crawlers: logs 0 fetches/7d, AI 0 (none) — 146 lines matched, none a request line; zone n/a (zone: Actor 'com.cloudflare.api.token.c42d0370c6783e3a270770a3a775243c' does not have ); /mcp 73421 req/30d, AI 385 (Claude-User 332, PetalBot 34, Amazonbot 11, ClaudeBot 2, Applebot 1, Google-Extended 1); datasets 30d: uk-care-locations 399, uk-food-hygiene 219, uk-companies 213, eu-ted 212, uk-sanctions 212, uk-schools 211, uk-tenders 211, nhs-ods 210, sam-exclusions 210, uk-charities 210, uk-gambling-operators 210, uk-sponsors 210, uk-trademark-journal 210, uk-insolvency 209, uk-contract-awards 191, uk-planning 138, uk-company-profiles 15; datasets 30d external: uk-tenders 3 (x402 3), uk-trademark-journal 2; 0: eu-ted, nhs-ods, sam-exclusions, uk-care-locations, uk-charities, uk-companies, uk-company-profiles, uk-contract-awards, uk-food-hygiene, uk-gambling-operators, uk-insolvency, uk-planning, uk-sanctions, uk-schools, uk-sponsors; refresh errors: uk-planning (origin dataset empty: planning-application answered count 0 (emptied on planning.data.gov.); search 7d to 10-21: 14 impressions, 0 clicks, avg pos 12.1, top /stats/nhs-ods 9, indexed 8/19, not: Discovered - currently not indexed ×10, URL is unknown to Google ×1 |
| 2026-10-23 | Daily numbers | 4 accts (0 paid, +0/24h) | — | 0 x402 paid (+10 own probe) | MCP 24h: 167 authed, 1674 anon, 108 preview, 5 paywall hits; wanted: connect_account 5; changes 7d: 4 (mcp 0, rest 4); indexnow: 15 urls 200; x402 validate: 17/17 valid; bazaar: 2 listed, 3 calls/30d, 3 payers, last 2026-10-23; x402 30d: 3 paid, 3 clients — uk-tenders 3; SettledScout 1, lumiere-paycheck-prober 1, vet402-observatory-l1 1; mcp probe: init 200, tools 200 (25 tools), call 200; authed: init 200, tools 200 (25 tools), call 200; wave log: uk-planning wave 05:00: ok 108.1s 4.7 h ago, [log] [x402] extension responses: {"bazaar":{"status":"processing"}} 20 min ago (1 of 11 lines); uk-sanctions wave 05:00: ok 108.1s 4.7 h ago, no log line in 24 h (10 noise lines); feeds 30d: 60 fetches, 9 user agents, 60 renders; apify: 458 runs (+7/24h), 30d: 442 runs (0 ours, 442 others), 19 users/30d, 18 public; apify 30d by actor: uk-visa-sponsors-register 30, eu-public-tenders-ted 26, uk-care-locations-cqc 26, uk-charities-register 26, uk-corporate-insolvency-notices-gazette 26, uk-food-hygiene-ratings 26, uk-new-companies-incorporations 26, uk-planning-applications 26 (7 failed), uk-public-tenders-find-a-tender 26, uk-sanctions-list-fcdo 26, us-federal-exclusions-sam-gov 25, nhs-organisations-ods 23, uk-contract-awards-contracts-finder 23, uk-gambling-commission-licence-register 23, uk-no-website-leads 23 (2 failed), uk-schools-gias-ofsted 23, uk-trademark-journal-watch 23, uk-companies-house-lookup-monitor 15; agent sign-up: 0 req/24h, 0 keys/24h, 0 keys/30d; oauth: 0 connects/24h, 0/30d; connect_account 7d by UA: python-requests/2.34.2 24, BrickBlueBot/0.1 (+https://brick.blue/bot?h=gank 4, SentinelOracle/0.1 (+https://glimind.com/opt-out 1; oauth funnel 7d: 29 challenges (protected_tool 29), 0 authorize, 2 rejected (invalid_target: resource must be https://gankdat.com/mcp 2), 0 sign-in, 0 email, 0 consent, 0 approved, 0 denied, 0 expired, 14 token (refresh_token 14), 0 token errors; after wall 1h (7d): 0 clients — request_api_key 0, x402 0, connect 0, gone 0; cf usage (10-10→10-23): d1 0.4M writes / 819.7M reads, 3.7 GB, kv 0.0M reads / 0.0M writes, workers 0.1M req, ae 0.0M pts ≈ US$0 overage; stats crawlers: logs 0 fetches/7d, AI 0 (none) — 150 lines matched, none a request line; zone n/a (zone: Actor 'com.cloudflare.api.token.c42d0370c6783e3a270770a3a775243c' does not have ); /mcp 74036 req/30d, AI 384 (Claude-User 336, PetalBot 35, Amazonbot 10, OAI-SearchBot 1, ClaudeBot 1, Meta-ExternalAgent 1); datasets 30d: uk-care-locations 409, uk-food-hygiene 229, uk-schools 221, nhs-ods 220, uk-gambling-operators 220, uk-trademark-journal 220, uk-companies 213, eu-ted 212, uk-sanctions 212, uk-tenders 211, sam-exclusions 210, uk-charities 210, uk-sponsors 210, uk-insolvency 209, uk-contract-awards 201, uk-planning 138, uk-company-profiles 15; datasets 30d external: uk-tenders 3 (x402 3), uk-trademark-journal 2; 0: eu-ted, nhs-ods, sam-exclusions, uk-care-locations, uk-charities, uk-companies, uk-company-profiles, uk-contract-awards, uk-food-hygiene, uk-gambling-operators, uk-insolvency, uk-planning, uk-sanctions, uk-schools, uk-sponsors; silent nights: uk-sanctions started 2026-10-22 05:01:43Z died after written 6408 records at 3 s, no row written; refresh errors: uk-planning (origin dataset empty: planning-application answered count 0 (emptied on planning.data.gov.); search 7d to 10-22: 12 impressions, 0 clicks, avg pos 13.3, top /stats/nhs-ods 10, indexed 8/19, not: Discovered - currently not indexed ×9, URL is unknown to Google ×2 |






Not queued: a first-call nudge email for the three accounts with no call in a week (a product lever on a
line that has not earned; STRATEGY §5 ranks it behind the dated reads, and the agent-side sign-ups the wall
is built for would never see it); more routes or a price change before the week-1 index read says why 16
routes are unlisted; the zone-analytics token scope (10-17 handoff, attended session). `researched:
2026-10-19`, `research_after: 2026-10-23` — the week-1 Bazaar read is the next dated signal; the item above
is buildable now and `next` names it alongside `uk-planning-apify-pause` from 07:00.

## Build 2026-10-19 — what sold on x402 (burn-down)

Built `x402-paid-by-source-reading` (score 5), the gap this night's research pass found. What changed:
`src/lib/x402-sales.ts` (pure, tested in `test/x402-sales.spec.ts`) renders the row's sales cell from a
grouped read of the `x402_paid` points — `3 x402 paid (uk-sanctions 2, eu-ted 1; 3 clients;
python-requests 2, x402-fetch 1)`, the bare count kept when nothing sold, the grouped read failed, or
the two reads disagree — and a `x402 30d: N paid, C clients — <slug> N, …; <family> N, …` clause after
the `bazaar:` one; `metrics.mjs` runs the two grouped queries (24 h and 30 d, slug × UA × client, the
probe's user agent excluded in SQL); paid x402 calls count in `datasets 30d external` as `<slug> N (x402
N)`; and the Bazaar read prints `bazaar resource: <url> calls C payers P last <date>` per resource of ours
in the job log (`bazaarResourceLines`, tested). The UA family is the first token up to `/`, a space or `(`,
with pipes, semicolons and parentheses dropped so the row parsers hold. No Worker change, no version bump.
What the 10-19 row should say: the sales cell names the dataset and client count of any payment since
07:10 on 10-18, the `x402 30d:` clause names the three 10-17/18 payments' source and UA family, and the
job log lists the one indexed resource with its 3 calls / 3 payers. Limits: the owner's own non-probe
payments cannot be told from a buyer's (only the probe UA is excluded), and points from before 10-11
carry no client id, so `clients` can read below `paid`.

## Build 2026-10-23 — x402 Bazaar week-1 index read (build)

**Read:** the 07:14 metrics job log (`bazaar resource:` lines), the Daily numbers rows 10-17 → 10-23,
CDP's seller guide *Get discovered (Bazaar)* (docs.cdp.coinbase.com/x402/seller/get-discovered, through
the relay, `docs/relay/responses/x402-bazaar-index-2026-10-23/`), and cdp-sdk issues #806 and #759.
**What the catalogue holds:** one resource of ours — `https://gankdat.com/x402/data/uk-tenders`, 3
calls / 3 payers / last 2026-10-18 — while `x402 validate: 17/17 valid` every day. uk-tenders is the
test client's default target: the 10-16 onboarding call, the 10-17 probe and all three external
payments (10-17/18) hit it, and no other route has ever settled a payment. **Why (documented):** CDP
indexes per resource — "every validated endpoint is eligible for indexing in the CDP Bazaar after a
successful settled payment"; "on the settlement call that triggers indexing, set both
`paymentPayload.extensions.bazaar` and `paymentPayload.resource`" (the x402 v2 client does; #806 was a
client that did not); "indexing runs after a settled payment and takes up to 15 minutes"; and
"resources that go 30 days without a settlement are removed from both the catalog and search results,
so a listed route needs ongoing traffic to stay listed". The facilitator reports the verdict per call in
an `EXTENSION-RESPONSES` header (`bazaar.status`: success / processing / rejected + rejectedReason).
#759 (open, 100+ services) confirms per-resource behaviour, a 12–14 h typical lag and silent drop-outs.
So the week-1 proof (`≥ 17 resources within a week of the settled call`) was never reachable with one
call: it needed 17. **Built:** `scripts/x402-probe.mjs` pays per route — when no probe payment landed
in 7 days it reads the catalogue (keyless, `scripts/x402-catalogue.mjs`, shared with the `bazaar:`
clause) and pays every route it does not list and every listed route settled ≥ 23 days ago
(`probeTargets`, tested); the `x402_probe` dispatch input pays every route (a re-screen after a
metadata change is per resource too); `ownProbePayments` counts the `(+N own probe)` cells of the last
30 days and `PROBE_MONTHLY_CAP = 20` stops the step at US$0.10 a month whatever the catalogue does; the
test client prints the Bazaar verdict from the settle response. The old `0 listed` and 1st-of-month
rules are gone (both are cases of "unlisted or stale"). **Cost:** 16 half-cents today (US$0.08) and
≈ 17 a month to stay listed (US$0.085; the wallet's ≈ US$1.09 lasts about a year — LEDGER row).
**Proof:** the 10-24 row's `bazaar:` clause reads `17 listed`; the forced dispatch's job log shows the
16 receipts and verdicts. The 11-14 day-30 read then reads calls and payers per resource.

**Live round 09:25 (forced dispatch, run 260):** 2 of 17 settled — uk-tenders and eu-ted, receipts on
Base — and 13 routes answered **402 to the signed payment**; uk-planning 503 (origin paused since
10-10, so it serves no 402 and cannot be indexed until it resumes) and uk-company-profiles 400 (a
lookup: the probe sent `?per_page=1` without a company number). **Why the 13 (found):** the two that
settled are the only non-paused list routes whose Bazaar description is ≤ 500 characters (348 and
476); every rejected route's runs 512–697 (`bazaarDescription` = title + up to 420 chars of the source
text + a 170-char shape sentence), and CDP's seller guide says "the CDP Facilitator rejects verify and
settle requests whose description exceeds that limit" (#759 saw the same as `400 'paymentPayload' is
invalid`). Validation never catches it (the row reads 17/17 valid). So since v0.25.0 (10-14) **13 of
the 17 x402 routes could not take any payment** — the lane's three external payers all paid uk-tenders,
which was the only route an agent could pay besides eu-ted, uk-planning and the lookup. **Fix
(v0.25.3):** `DESCRIPTION_MAX = 500` in `src/x402/bazaar.ts` — the summary budget is what the title and
shape leave, a first sentence that still does not fit is dropped — and the declaration test asserts ≤ 500
for every source; the probe calls each route with the query its Bazaar declaration declares (the
indexer's own call; `readExampleQuery` → `routeUrl`, so the lookup gets `company_number=00000006`) and
the test client prints the facilitator's reason from the 402's `PAYMENT-REQUIRED` `error`. A second forced
round after the deploy pays the 15 routes that can settle; uk-planning stays unlisted until its origin
republishes (it answers 503, not 402). **Cost today:** 2 + up to 16 half-cents (≤ US$0.09).
**Second round 09:44 (run 261, v0.25.3 live at 09:42):** 16 of 17 settled — every list route and the
lookup (its declared `company_number=00000006` query) — with receipts on Base; only uk-planning
failed (503, paused). The 09:45 row already reads `bazaar: 2 listed` (eu-ted indexed within 20 min
of its 09:25 settlement, `last 2026-10-23`), so the catalogue does index per settled resource at
the documented pace; the 10-24 row should read `16 listed`. No `EXTENSION-RESPONSES` header reached
the client on any settle (the Worker does not forward it), so the verdict line reads "no header" —
the catalogue count is the reading. Spent today: 18 half-cents (US$0.09).


## Research 2026-10-23 (pipeline starved — build, 17:10)

Read: the 10-20 → 10-23 Daily numbers rows, the 09:44 metrics job log (run 261: the 16 settlements and the
09:46 `bazaar resource:` lines), `/v1/health` through the relay (`gankdat-research-2026-10-23-17`, 17:30 UTC)
against the 10-22 19:29 read, the Docker PR #5622 state and comments (same request), the queue, review W42,
`docs/INBOX.md` to 10-22 21:25, `docs/ALERTS.md`, `src/sources/progress.ts`, `cache.ts` and `store.ts`
(the marker), `src/auth/oauth.ts` (the resource check) and the MCP authorization spec (raw GitHub).
**Unchanged:** 4 accounts, 0 paid, `0 x402 paid` since the three 10-17/18 payments (`x402 30d: 3 paid, 3
clients — uk-tenders 3`), `after wall 1h: 0 clients`, `oauth: 0 connects`, Apify 19 users/30d (one per actor
plus the Companies House lookup at 15 runs), `search … 0 clicks`, uk-planning still empty (re-read 10-25).
**New since the 10-19 pass:** `datasets 30d external: uk-trademark-journal 2` from 10-20 — the first external
keyed calls on a register (the 10-20 `+1/24h` account; two calls, nothing since); the Bazaar's second route
(eu-ted) 20 minutes after its settlement and the 16-route round at 09:44 (the 10-24 row is the proof); and
three readings the rows carry that nothing in the queue would act on:

| Signal | Reading | Verdict |
| --- | --- | --- |
| `silent nights: uk-sanctions started 2026-10-22 05:01:43Z died after written 6408 records at 3 s, no row written` (10-23 row) | `/v1/health` on 10-22 19:29 showed uk-sanctions `last_refreshed_at 2026-10-22 05:01:46` and on 10-23 17:30 `2026-10-23 05:02:30`; the 10-23 wave-1 invocation read `ok 108.1s`; `refresh errors` lists no uk-sanctions row on any day | a **stale marker, not a death**: `cache.ts refreshSource` writes the `written` mark, the ok row and the (skipped, same second) `stats` mark inside one second, `refreshOne` then deletes the marker after a ≤ 1 s local wait — KV's one-write-a-second-per-key limit or a dropped delete leaves it, and the next night writes an `error` row for a refresh that completed. The first silent-night reading in the lane's life is a phantom; the auto-filer would file `refresh-uk-sanctions-<date>` on a repeat |
| `oauth funnel 7d: 0 authorize, 2 rejected (invalid_target: resource must be https://gankdat.com/mcp 2)` (10-20 → 10-23 rows) | the only two `/authorize` calls by anyone in the window, refused by the strict compare `q.resource !== resourceUrl(env)`; the value sent is not recorded | the spec lists `https://mcp.example.com` and the port form as valid canonical URIs beside `/mcp`, says uppercase scheme and host "SHOULD" be accepted and only discourages the trailing slash — a client inside the spec was turned away, on a lane with 0 external OAuth connects since 09-30 |
| `bazaar: 2 listed` at 09:45, 16 settled at 09:44 with `no EXTENSION-RESPONSES header` on every settle | the catalogue indexed eu-ted 20 min after its 09:25 settlement, so 16 should show on the 10-24 row; the facilitator's per-resource verdict never reaches the client because the Worker does not forward the header | a dated read for 10-24; if short, forward the header so a rejected resource says why |
| Docker PR #5622 (`docker-mcp-catalog-listing`, blocked since 10-11) | open at head 7b5f2a5, updated 10-11 19:18, **no review and no check run after 12 days** (combined status `pending` — a fork's workflows wait for a maintainer's approval), one bot comment (Codex review failed to run) | nothing to do from this side; reading added to the item, re-read with the 10-30 Claude directory read |
| `search 7d to 10-22: 12 impressions, 0 clicks, indexed 8/19, Discovered - currently not indexed ×9` | the clause `search-console-stats-indexing` waited for has run daily since 10-11; the sitemap went in 09-28 | item closed `done` with the reading; the proof (≥ 10) is not met and no lever is queued — eight indexed pages bring no clicks, so more indexing changes nothing until a page ranks |

Queued in `docs/pipeline/queues/gankdat.json`:

| Item | Score | Why now |
| --- | --- | --- |
| `refresh-marker-false-positive-2026-10-23` | 6 | `recordSilentRefresh` writes the `error` row only when no `refresh_log` row of the slug was created at or after the marker's `started_at`, else deletes the stale marker and logs it; the delete retries once after the KV gap; a test for the stale case. The reading built on 10-18 to tell a silent wave is worth keeping only if it cannot lie |
| `oauth-resource-indicator-variants` | 5 | normalised comparison against `resourceUrl` (case, :443, trailing slash, the bare origin), any other host or path still rejected; the funnel detail names the value the client sent |
| `x402-bazaar-16-listed-read` | 4 (10-24) | read the 10-24 row and the job log's `bazaar resource:` lines; fewer than 16 → relay the catalogue, re-screen with the dispatch input, forward `EXTENSION-RESPONSES` so the reason is readable |

Also queued, from the inbox: hackathons `paypal-hackathon-demo-access` (8 × weight 2 — `next` names it) — the
organiser's 10-21 Devpost message says the entry has no demo the judges can run (due 11-12 12:00 PT); the
demo exists but the form names only `/account` behind a magic link and a sandbox buyer, and the public mirror's
README has no run steps. The item writes the paste-ready text, the README section and owner action 028.
**Not queued:** a first-call nudge to the trademark-journal account (the 10-19 call stands); more routes or
prices before the 16-route reading and the 11-14 day-30 read; a nudge comment on the Docker PR (the item says
do not argue; a reviewer's silence is not a question). **Sandbox note:** `npm ci` here left out the optional
`@cloudflare/workerd-linux-64` package, so the gankdat tests could not start until it was installed `--no-save`;
CI (`check` run 361, `gankdat` run 148) was green on the same head. `researched: 2026-10-23`; `research_after`
cleared — the first item is buildable now.
