# gankdat — Architecture

> Derived from `.taskmaster/docs/prd.md`. This file holds the *stable*
> architectural decisions and is loaded into every Claude session via
> CLAUDE.md. When the PRD changes, update **this** file — not `CLAUDE.md`.
> Volatile detail (full data model, phasing, open questions) stays in the PRD;
> this is the always-loaded summary.

## What we're building
A multi-niche data-API platform sold on usage/credit pricing to human
developers (Stripe self-serve) and AI agents (MCP server + x402 USDC
micropayments). Strategy (operator decision 2026-07-11): ship MANY datasets
across niches in parallel — validation comes from shipped-product signal
(signups, traffic analytics, the /feedback form) rather than a pre-launch
gate; weak datasets are cheap to retire because everything dataset-specific
sits behind the swappable `DataSource` abstraction (one file + registry
entry; the exposure surface regenerates itself — see NICHE-LAUNCH-CHECKLIST).
Live datasets: UK planning applications (`uk-planning`), procurement
notices (`uk-tenders`), UK sanctions designations (`uk-sanctions`,
shipped 2026-07-11 with per-dataset terms; debarment list monitored —
still empty upstream, see NICHE-NEXT-SANCTIONS.md), EU procurement
notices (`eu-ted`, shipped 2026-07-12 — pairs with uk-tenders as the
bid-intelligence bundle; niche pipeline in NICHE-RESEARCH-2026-07.md),
US federal exclusions (`sam-exclusions`, shipped 2026-07-13, first
`storage:'d1'` dataset; re-based 2026-09-20 on the keyless daily public extract ZIP —
no SAM_API_KEY needed — counterparty-risk bundle with uk-sanctions),
UK corporate insolvency notices (`uk-insolvency`, shipped 2026-07-13 —
Gazette corporate-only slice, Blind Mode; same bundle), and UK new
incorporations (`uk-companies`, shipped 2026-07-13 — Companies House
advanced search; KYB/lead-gen, completes the counterparty bundle), and UK food
hygiene ratings (`uk-food-hygiene`, shipped 2026-09-20 — FSA FHRS national file, D1, ~610k
establishments; risk + lead-gen bundle; NICHE-RESEARCH-2026-09 §3), and UK licensed visa sponsors
(`uk-sponsors`, shipped 2026-09-20 — Home Office register via the GOV.UK Content API, D1,
~143k rows, no personal data; company-data bundle), and the Charity Commission register
(`uk-charities`, shipped 2026-09-20 — keyless daily extract ZIP via the shared unwrapper in
`src/sources/zip.ts`, D1, ~185k registered charities (removed ones surface via the change feed), contact details
dropped), and the CQC care directory
(`uk-care-locations`, shipped 2026-09-20 — weekly CSV resolved from CQC's data page, D1,
~57k regulated locations, phone numbers dropped), and UK contract awards
(`uk-contract-awards`, shipped 2026-09-21 — Contracts Finder OCDS awards, one row per award ×
supplier with company numbers, KV window; bid-intelligence bundle; NICHE-RESEARCH-2026-09-B),
and schools in England (`uk-schools`, shipped 2026-09-21 — DfE GIAS daily establishment extract
joined by URN to Ofsted's monthly inspection outcomes, D1, ~50k establishments; the Ofsted join
is best-effort enrichment over the Ofsted columns GIAS itself carries, so a moved Ofsted file
costs a field, not the dataset; head-teacher names and telephone dropped, governors extract never
ingested; lead-gen bundle; NICHE-RESEARCH-2026-09-B §1). Its size (~62 MB daily) added refresh
**wave 5** (05:50) — waves stay one-trigger-one-budget under the 15-minute Cron Trigger limit.
And the NHS organisation register (`nhs-ods`, shipped 2026-09-22 — NHS England Organisation Data
Service nightly ZIPs, six organisation files (trusts, trust sites, GP practices, pharmacies, dental
practices, independent providers) through one positional parser for ODS's standard 27-column
layout, D1, ~45k organisations keyed by ODS code; every file is required so a moved file fails the
load loudly instead of dropping a type into the change feed; telephone dropped, practitioner files
never ingested; healthcare lead-gen + KYB bundle with uk-care-locations; NICHE-RESEARCH-2026-09-B
§2). Own refresh **wave 6** (05:55), so an ingest written without live-file access (build container
has no egress to NHS hosts; the current files come from odsdatasearchandexport.nhs.uk `getReport?report=<file>` as plain CSV since 2026-09-24, the old files.digital.nhs.uk ZIP path 403s) cannot take another dataset down with it.
And the UK Trade Marks Journal (`uk-trademark-journal`, shipped 2026-09-23 — the IPO's weekly
XML edition of applications accepted and published for opposition, UK filings and international
registrations designating the UK; exchange 2026-W39 winner: watch services charge £180–320 per
mark per year to scan the same journal). Rolling window of the newest 52 weekly issues in D1
keyed by application number, so `/v1/changes` is each week's new publications; each issue is
parsed once into a KV cache (`tmj:issue:<yyyy-nnn>`) and a refresh downloads at most four new
issues, the window filling over the first runs. The journal schema is undocumented and the origin
unreachable from the build container, so the reader is layout-tolerant (every assumption in one
`LAYOUT` table; an issue with no recognisable application fails the refresh loudly, naming the
element names it saw). Organisation-level only: applicant and representative names kept only with
a corporate designator, addresses reduced to country, mark images never stored. Own refresh
**wave 7** (06:05). A refresh starts no new issue download after six minutes
(`DOWNLOAD_BUDGET_MS`, 2026-10-07): the 10-04 run took 13 min 42 s of the 15-minute Cron Trigger
budget and the next two nights were killed before writing a `refresh_log` row; the issues cached
before the cut-off still load and the window fills over the following runs. What actually kept
dying (found 2026-10-07 through `/v1/health` and the relay) was the post-0014 full reload of the
162k-row window, now replaced by the in-place hash backfill above. The IPO serves an unpublished
issue's `jnl.xml` as its "Page Not Found" HTML with status 200 (and every `jnl.zip` as 403 HTML),
so a `text/html` body counts as a missing issue, never as a journal to parse.
And the Gambling Commission licence register (`uk-gambling-operators`, shipped 2026-09-24 —
exchange 2026-W39 runner-up, OGL v3 confirmed on the data.gov.uk record; KYB/payments risk,
affiliate compliance, sector suppliers; rival Apify actors price it from $8 per 1k rows). Five daily
CSVs (businesses, licences, trading names, domain names, premises) joined into one D1 table with
three record kinds told apart by `record_type`: one row per operating licence (the licences file is
licence × activity, folded to one row with activities joined "|" and the operator's active trading
names), one per registered website domain, one per licensed premises; ids `licence:<number>`,
`domain:<account>:<domain>`, `premises:<account>:<activity>:<address>:<postcode>`, so the change
feed is new licences, surrenders/revocations, new domains and premises. `is_active` is the boolean
filter because "Inactive" contains "active". Every file is required (a moved file fails loudly).
Organisation level: the personal licence registers are never fetched. Written without live-file
access (gamblingcommission.gov.uk is unreachable from the build container; headers recorded by the
interactive session), with a 90 s per-file timeout; runs in **wave 2** (05:15) after the two
sources there, ~15k rows.
And the **Companies House company lookup** (`uk-company-profiles`, shipped 2026-10-07 — exchange
2026-W41 winner: the one Apify category where UK-register buyers measurably pay has thirteen
lookup actors and no monitor). The first **on-demand dataset** (`DataSource.lookup`,
`src/sources/lookup.ts`): the 5.4M-company register is never mirrored; a request names one
company by `company_number` (zero-padded like the register) or `company` (the search
endpoint's top hit) and the Worker reads ≤ 4 resources of the official public-data API —
profile, charges, filing history, persons with significant control — into one record, cached
in KV per key for 24 h (a confirmed miss for 1 h), metered as one credit, rate-limited at
30/min per account so a full-speed client stays inside the 600 req / 5 min key quota shared
with `uk-companies`. No snapshot, no cron wave, no change feed; `/stats/<slug>` is a lookup
page, not counts; `/v1/data` and `list_sources` carry `lookup: [keys]` and a keyless query
answers 400 naming them. Blind Mode: officer resources never called, individual PSCs dropped
whole at ingest (corporate/legal-person entries and counts kept), filing events keep the
form type and description code (not `description_values`, where the officer's name is),
charge holders and address lines dropped. The monitor is the Apify actor's `changes` mode
(`runLookupActor`): the previous run's records in the actor's named key-value store are the
baseline; a run pushes only `added` / `changed` (+ `changed_fields`) / `removed` companies.
Layouts verified through the relay (`docs/relay/responses/ch-lookup-specs`, 2026-10-07).
Solo-operator product: everything self-serve, <2 hrs/week ops.
Customer-facing brand: **gankdat** (gankdat.com, live Stripe billing);
"faceless" survives only as the internal infra codename (Worker, D1, repo
names — never rename those; see memory/git history for why).

## Repo layout
- `src/index.ts` — Hono app assembly; exports `fetch` + `scheduled` handlers
- `src/sources/` — `DataSource` interface, registry, one file per dataset
- `src/routes/` — `/v1/*` REST routes + `/openapi.json` + registry-generated
  `/llms.txt` and `/stats/*` cite-bait pages
- `src/auth/` — email accounts (identity), magic-link sign-in, KV sessions,
  API-key verify/revoke (SHA-256 at rest, KV hot path)
- `src/email/` — transactional email via Resend REST (dark until configured)
- `src/metering/` — credit costs, KV monthly counters, quota headers
- `src/billing/` — Stripe checkout/portal, webhooks → account plan + ledger
- `src/mcp/` — MCP server at `/mcp`, tools generated from the registry
- `src/x402/` — x402-gated pay-per-request routes (dark until configured)
- `public/` — landing page, docs (Scalar embed), robots/sitemap (Workers
  Assets); `llms.txt` is Worker-generated from the source registry
- `src/middleware/canonical.ts` — one URL per page: `www.` and `http://` and
  trailing-slash variants 301 to `PUBLIC_BASE_URL` (308 for non-GET; API paths keep
  their bytes), and the static files are served through `env.ASSETS` with
  `run_worker_first` so the redirect covers them too (Search Console duplicate
  fix, 2026-09-27)
- `docs/` — architecture, runbook, setup docs; `.taskmaster/` — PRD + backlog

## Stack
TypeScript (strict) · Hono on Cloudflare Workers (Paid plan since 2026-07-10)
· zod (→ OpenAPI 3.1 → MCP tools; one schema source of truth) · Workers KV +
D1 + Cron Triggers + Analytics Engine (`gankdat_traffic`: /mcp and /x402 adoption,
and since 2026-09-29 the REST surface too — `src/middleware/traffic.ts` writes
`rest_data`/`rest_changes` for every served `/v1/data/:source` and `/v1/changes/:source`,
UA and source slug only, never an IP, denials excluded, so STRATEGY §4's weekly
change-feed target is readable from the daily metrics row) ·
stripe-node (fetch client) · official MCP TS SDK · x402-hono · vitest with
@cloudflare/vitest-pool-workers · ESLint + Prettier · npm · wrangler.
x402-hono and @coinbase/x402 (and viem beneath them, most of the bundle) are
imported lazily on the first lit `/x402` request, so cold starts skip them
while the lane ships dark.

Tests (2026-10-06): pool-workers 0.18 has no isolated per-test storage — one runtime
and one D1/KV store serve every spec file in turn — so `test/apply-migrations.ts`
migrates once per file and empties every table and both KV namespaces before each
test (the earlier `reset()` + full re-migration per test also logged a workerd
"deleteAllDurableObjects" exception per test). The gate's cost was elsewhere: each of
the 49 spec files loads the whole `src/index.ts` module graph afresh — ~2,600 modules
a file before 2026-10-06, 1,194 of them viem via the x402 packages, 17 s a file. Now
`vitest.config.ts` pre-bundles the heavy dependencies (deps.optimizer, node built-ins
external) and the x402 packages load lazily, so a file loads ~250 modules and the
suite runs in 80 s (was 261 s) on four cores; the whole gate in ~100 s.
On CI the gate runs once per push, in `gankdat.yml` only; the root `check` workflow
runs `check:root`.

## Backend & data
- **D1**: `accounts` (email = identity, holds plan), `api_keys` (belong to
  accounts, inherit plan), `credit_ledger` (append-only audit; NOT the live
  quota), `stripe_customers` (one per account), `waitlist`, `refresh_log`,
  `magic_tokens` (single-use sign-in tokens — atomic consume via
  `UPDATE … WHERE used_at IS NULL`), `agent_signups` (agent-side sign-up requests:
  hashed claim secret, emailed approval token, human-check code; same atomic single-use),
  `source_records`/`source_meta` (rows for `storage:'d1'` datasets too large
  for a KV snapshot — SQL filters with applyQuery-parity semantics; task 44).
  **Delta refresh** (2026-10-04, migration 0014 `record_hash`): a source with `idOf` is
  refreshed in place — the live generation's (seq, id, hash) index is read into typed arrays,
  the stream is compared row by row, and only changed rows are upserted, new ids appended and
  vanished ids deleted, each chunk with its change-feed rows in one transactional batch. The
  generation swap (a whole new generation inserted and the old one deleted every night, ~1M
  rows written and ~1M deleted a day for registers that move < 1%) remains for first loads,
  sources without ids — not any more for rows written before the migration: those are hashed in
  place by a resumable **backfill** (`backfillHashes`, migration 0015, 2026-10-07) that pages the
  live generation's unhashed rows, writes `record_id` and `record_hash` from the stored record
  text, hands the rest to the next night with a `skipped` refresh_log row when its 8-minute budget
  runs out, and lets the delta pass follow once complete (uk-trademark-journal's 162k-row "one last
  full reload" never finished: wave 7 was killed at the Cron Trigger limit three nights running,
  writing no row). The generation swap is what the 2026-10-01
  Cloudflare budget alert (US$15 metered vs the US$5 plan) was traced to — D1 bills rows
  written (measured 2026-10-08: ~6M writes a day before the delta refresh, 0.0–0.2M a day after). The trade: during a delta refresh a request sees today's version of some rows and
  yesterday's of the rest (every row present, nothing partially loaded; `last_refreshed_at`
  flips at the end, and a crash mid-way self-heals against the stored hashes). `refresh_log`
  carries `delta +a ~c -r` per source. Migrations via `wrangler d1 migrations`.
- **KV**: response cache per source (+ precomputed `/stats` blob and a
  best-effort refresh single-flight lock), monthly usage counters per account
  email (`usage:<email>:<yyyymm>`), key-hash → key-record hot-path lookup
  (with short negative + revocation-tombstone entries), sessions (7 d idle,
  30 d absolute cap).
- **Auth**: bearer API key per request for data; passwordless magic-link
  (Resend, Turnstile-gated when configured) + session cookie for the /account
  dashboard. Key creation requires a signed-in session (public issuance
  retired — keys inherit the account's plan, so unverified-email issuance was
  a privilege leak). Quota = plan
  monthly allowance per account (free 250/mo); KV-based best-effort (DO
  upgrade path documented, not built). MCP: anonymous `initialize`/`tools/list`
  so registries/directories can index tools (per-IP, in-isolate limiter —
  zero KV ops); a presented key is always validated and bad ones 401 with
  `WWW-Authenticate`. **Keyless preview** (2026-09-30, `src/mcp/preview.ts`, for the
  Claude Connectors Directory whose review requires every tool to answer without
  credentials): a data tool called without a key returns page 1 with ≤ 5 rows, 20 calls
  per UTC day per client (sha-256 of IP + UA, KV `preview:<id>:<day>`), then a tool error
  naming the free plan and the cheapest paid one; `get_usage` reports the budget. Every
  tool carries `title` + `readOnlyHint`/`destructiveHint` (the two sign-up tools are the
  only writes, neither destructive). `/mcp` validates a present `Origin` (own host,
  claude.ai/claude.com, loopback; else 403, CORS mirrors the list) — non-browser clients
  send none. `test/mcp-directory.spec.ts` is the conformance test for any agent
  directory. KV rate limiters fail open on KV errors.
  **Lazy OAuth** (2026-09-30, `src/auth/oauth.ts` + `src/routes/oauth.ts`, migration 0013
  `oauth_grants`): Claude, Cursor and ChatGPT start sign-in only on an HTTP 401 with
  `WWW-Authenticate: Bearer resource_metadata=…` (a 200 tool error never does), so the Worker
  is its own authorization server — RFC 9728 `/.well-known/oauth-protected-resource[/mcp]`,
  RFC 8414 `/.well-known/oauth-authorization-server` (S256 PKCE, `token_endpoint_auth_methods
  none`, `client_id_metadata_document_supported`), `/authorize` (CIMD: the client_id is an
  https URL whose document is fetched and must name itself and the redirect_uri, loopback
  matched port-agnostically for Claude Code; consent rendered on the magic-link session, the
  emailed link carrying `next` back to the request so the hop can finish in another tab) and
  `/token` (form-urlencoded, 1 h access + 30 d rotating refresh tokens, `invalid_grant` on
  replay with the whole family revoked). The gate in `routes/mcp.ts` sends the 401 for the one
  protected tool `connect_account` and for a data tool once the preview budget is spent; free
  tools (`list_sources`, `get_usage`) are never gated. An access token resolves to an API key on
  the account named `oauth:<client host>` (created at consent, never shown, visible and
  revocable at /account), so plan, credits, rate limits and metering are the key's — one
  `KeyContext` for both credentials. Only hashes are stored; the daily numbers carry
  `oauth: … connects` (D1 codes for real accounts) and the `oauth_token` analytics point per
  client host. `test/oauth.spec.ts`.
  **Agent-side sign-up** (2026-09-25, `src/auth/signup.ts`): the paywall's audience is
  agents that cannot click a magic link, so the two keyless tools `request_api_key`
  (user's email → approval email with a short code, RFC 8628-style) and `claim_api_key`
  (poll with the claim secret → the key, once) — REST twins `POST /v1/auth/agent-signup`
  and `/agent-signup/claim` — let the agent start sign-up and the human only approve
  (`GET`-then-same-origin-`POST /v1/auth/approve`, like `/verify`). The approval token
  goes only into the email, the raw key is minted at claim and never stored, keys are
  named `agent:<client>` and inherit the account's plan (hence the human gate). Abuse
  valves: login-sized per-IP budget (KV scope `signup`, shared by REST and MCP) and the
  per-email hourly cap shared with browser login (`src/auth/emailcap.ts`). Every keyless
  401 names the path. Proof number in the daily metrics row (`agent sign-up: …`).
- **Refresh**: seven staggered Cron Triggers (05:00 KV sources, 05:15 exclusions + sponsors + gambling operators,
  05:30 charities + care locations, 05:45 uk-food-hygiene, 05:50 uk-schools, 05:55 nhs-ods,
  06:05 uk-trademark-journal;
  `store.ts waveForCron`) pull sources, write `refresh_log`; responses
  expose `last_refreshed_at`. D1 refreshes record what `DataSource.idOf` says was added,
  removed or changed into `source_changes` (90 d; the delta refresh writes them as it goes,
  the full reload diffs generations) — served at `/v1/changes/:source` and the MCP
  `get_changes` tool. **Runner-fed sources** (`RefreshPolicy.runner`, 2026-10-04; uk-insolvency):
  an origin that serves the Worker an empty body while a GitHub runner reads it in full (The
  Gazette, every day from 09-28) is refreshed by `scripts/runner-refresh.mjs` in the `gankdat
  metrics` job instead — the source's own `fetchFresh`, then the Worker's exact KV writes
  (`cache.ts snapshotWrites`) and a `refresh_log` row via the REST API; the waves skip it
  (`store.ts cronSources`) and a stale snapshot is served without an inline attempt. The Daily
  numbers row lists any source with no `ok` refresh for two days, so a runner that never ran
  still shows. KV sources only.
  The feed is sold, not just served (2026-09-24): `registry.hasChangeFeed` is the one
  predicate; the refresh precomputes 30 days of added/removed/changed per day into the
  `/stats` blob (`SourceStats.changes`) so the public page shows the activity and the poll
  command without touching D1; `/v1/data` and `list_sources` carry `change_feed`; llms.txt
  has a "Change feeds" section. **The feed takes the source's own filters** (2026-09-28,
  migration 0012: `search` + `record_lc` ride along from `source_records` at diff time):
  `/v1/changes/<slug>?classes=09&q=<mark>` and `get_changes` `filter` apply the same
  predicates as `/v1/data` to the changed record, so a watch is one call; unknown params 400.
  A transient D1 failure ("internal error; reference", "Network connection lost") retries the
  source once while the wave is under 6 minutes old (`store.ts refreshOne`); the insolvency
  reader reports bytes/content-length/tail when the Gazette truncates a JSON page.
- **Stats facets**: a `StatsSpec.facets` entry declares bounded sub-pages
  `/stats/<slug>/<segment>/<value>` — one per value the source lists, never derived from the
  data — each with its own headline, trend, breakdowns (a `groupBy` may `sort: 'value'` for
  chronological issue/week tables) and the filtered query + change-feed poll; precomputed at
  refresh with the parent (`aggregateFacets`, a 4-minute budget per source, the rest 503
  "being prepared" until tomorrow) and indexed from the parent page and `sitemap.xml`.
  First use: 45 Nice-class pages for `uk-trademark-journal` (`NICE_CLASSES` in the source).
- **Keyless Atom feeds** (`routes/feeds.ts`, 2026-10-05): `/feeds/<slug>.xml` and
  `/feeds/<slug>/<segment>/<value>.xml` (facet values the source lists, same filter as the
  facet stats page) carry the register's last 7 days of added / removed / changed rows, ≤ 50
  entries, newest first, each entry linking the stats page and the key sign-up — the change
  feed on every RSS shelf (Feedly, Inoreader, Slack/Teams RSS, the Zapier/Make/n8n/Power
  Automate triggers) with the key as the upgrade. Rendered from `source_changes` at most once
  an hour per feed (KV `feed:*`), rate limited per IP like `/stats`, advertised by
  `<link rel="alternate">` on the stats pages; `rest_feed` Analytics Engine point (UA, path,
  hit/miss, slug) → `feeds 30d:` in the Daily numbers row. Entry titles are dataset-agnostic
  (first two short string fields) — the isolation rule holds.
- **Wave log reading** (`lib/wave-logs.ts`, 2026-10-09): a wave killed at the 15-minute Cron
  Trigger limit writes no `refresh_log` row, and no sandbox or relay can read Worker logs (the
  journal's silent nights 10-05..10-08 were guessed at twice). So the metrics workflow's
  `runner-refresh.mjs` step, which holds the deploy token, POSTs the Workers observability
  Query Builder (`/workers/observability/telemetry/query`, service `faceless-api`, needle = the
  slug, last 24 h, 20 lines) for every source with no `ok` row in 26 h or an error row today,
  prints the lines in the job log and leaves `dist/wave-logs.json`; `metrics.mjs` reads it as
  `wave log: <slug> [level] <newest line> <age> (N lines)` — `n/a (HTTP 403 …)` names the
  missing token scope, `no stale source` a clean night. Pure parse + reading in the lib, tests
  in `test/wave-logs.spec.ts`; never fails the job.
- **IndexNow** (`lib/indexnow.ts`, 2026-10-05; from the runner since 2026-10-07): once a day,
  after the waves, the metrics workflow's `runner-refresh.mjs` step POSTs the parent and facet
  stats URLs of every source with an `ok` refresh in the last 26 h (facets from the stats blob in
  KV — only the journal has them, 45 Nice classes, so a day it is stale submits one URL per source) to `api.indexnow.org` (≤ 10,000 a call, de-duplicated, never throws), proven by the key
  file the Worker serves at `/<INDEXNOW_KEY>.txt` (a plain var — public by design, not a
  secret). Never from the Worker: the endpoint rate-limits by source IP and answered 429 to
  every wave-end ping from Workers' shared egress (10-05/06) while the runner's post got 200.
  Bing's index feeds DuckDuckGo, Copilot and ChatGPT search, so this is the one indexing signal
  that needs no account while the Search Console reading is owner-blocked. The runner leaves
  `dist/indexnow.json`; `metrics.mjs` reads it → `indexnow: N urls S` in the Daily numbers row
  (`n/a (<reason>)` on a push run).
- **Live MCP probe** (`scripts/mcp-probe.ts`, 2026-10-08, queue `mcp-live-probe`): the metrics job's
  runner does what an agent directory's health checker does — `initialize`, `tools/list`, one keyless
  preview `tools/call` on the first listing data tool — against the live `/mcp` and, with the optional
  `GANKDAT_PROBE_KEY` secret, the same with a bearer key; `metrics.mjs` renders `mcp probe: …` in the
  Daily numbers row and lists a failed step under `refresh errors` as `mcp-probe`, so the repeat rule
  files a fix item. Why: Glama's hourly check mailed "HTTP 500 – Error connecting to MCP" on
  2026-10-08 (and found the 2026-09-19 Bot Fight Mode challenges) while no sandbox can reach
  gankdat.com and Worker logs are read nowhere — the probe is the only reading of the edge as
  directories see it. Push runs probe too (node builtins only); a dead probe is a reading, never a
  failed job.
- **Query language** (generic, never per-dataset; `query.ts` + `d1store.ts` in parity): string
  params are case-insensitive substrings, numbers/booleans strict, `<field>_after/_before`
  date ranges, `<field>_min/_max` numeric ranges, `<field>_present=true|false` has-a-value
  (null, '' and [] are absent; added 2026-09-21 for the "no website" lead feed — sources opt in
  by declaring `website_present` in `queryParams`), `q` across all string fields.

## External services
- **Stripe** — **LIVE** since 2026-07-09: checkout, customer portal,
  idempotent webhooks → account plan + ledger. Prices are GBP-default
  multi-currency (USD/EUR auto-selected by location), resolved by
  `lookup_key`; plan data lives in `src/billing/plans.json`. Plan KEYS are
  stable slugs (saver £5/1k, starter £23/5k, growth £79/20k, scale £239/100k)
  stored in D1/Stripe; customer-facing names are a display layer
  (`displayName`: grep/cron/daemon/kernel). Secrets:
  `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.
- **Resend** — magic-link email from `no-reply@mail.gankdat.com` (verified
  domain); dark (503 on login) until `RESEND_API_KEY` is set.
- **x402** (agent payments) — LIVE on Base mainnet via Coinbase CDP
  facilitator; enabled only when `X402_WALLET_ADDRESS` is set.
- **Data origins** — official open-licence government APIs only
  (planning.data.gov.uk, Find a Tender OCDS, FCDO UKSL — all OGL v3;
  TED Search API — Commission Decision 2011/833/EU; SAM.gov Exclusions —
  US public domain, D&B address fields stripped at ingest, read from the
  keyless daily public extract (no API key since 2026-09-20); The Gazette
  linked-data API — OGL v3, fair-use paced, corporate notices only;
  Companies House advanced search and public-data API (company profile, charges,
  filing history, PSC list, search — Crown copyright, public register,
  needs `COMPANIES_HOUSE_API_KEY`, 600 req/5 min shared by both sources). No scraping.
- **CI/CD** — GitHub Actions: lint/typecheck/test; deploy on main gated on
  `CLOUDFLARE_API_TOKEN` secret existing.

## Compliance & accessibility
- UK GDPR: per-dataset data posture, stated in the terms licence table.
  Current datasets run Blind Mode — personal fields dropped at ingest, never
  stored. Personal-data datasets (e.g. sanctions lists) require their terms +
  privacy entries BEFORE going live (task-38 framework). Waitlist/feedback
  store email only. No purchased lists, no cold email in v1.
- Landing/docs: plain fast HTML, core content works without JS.

## Out of scope for v1 (do not scope-creep without re-baselining)
- Council-portal long-tail scraping (Idox/Northgate) and any managed-scraping
  integration
- Regulatory-change/recall feed vertical; spatial search; webhooks
- RapidAPI/Apify/MCP-directory listings (prep doc only)
- Durable-Objects rate limiting; annual-plan automation; programmatic SEO at
  scale (per-council/per-buyer pages — the per-SOURCE `/stats` pages shipped
  with task 34 and the explicitly listed facet sub-pages are the bounded version)
- Fuzzy-match sanctions *screening* (`/v1/screen`) before list-serving proves
  demand and per-dataset legal terms exist (NICHE-NEXT-SANCTIONS Phase B)
