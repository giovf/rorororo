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
