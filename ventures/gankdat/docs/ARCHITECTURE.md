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
Live datasets: UK planning applications (`uk-planning`; **origin paused since 2026-10-10** — planning.data.gov.uk
emptied its alpha planning-application dataset (entity-count 0, no replacement named), so the 10-09
snapshot is served under a dated `notice` and the refresh fails loudly with that evidence; §7 clock in
RESEARCH.md, weekly re-read queued), procurement
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
- `src/metering/` — credit costs, KV monthly counters, top-up balance, one budget decision
  (plan first, then top-up) for REST and MCP, quota headers
- `src/billing/` — Stripe checkout/portal, webhooks → account plan + ledger; PayPal (sandbox)
  credit packs → top-up balance + ledger (`paypal.ts`, `packs.json`)
- `src/mcp/` — MCP server at `/mcp`, tools generated from the registry
- `src/x402/` — x402 v2 pay-per-request routes (dark until configured); `bazaar.ts`
  generates each route's Bazaar discovery declaration from the registry
- `public/` — landing page, docs (Scalar embed), robots/sitemap (Workers
  Assets); `llms.txt` is Worker-generated from the source registry
- `src/middleware/canonical.ts` — one URL per page: `www.` and `http://` and
  trailing-slash variants 301 to `PUBLIC_BASE_URL` (308 for non-GET; API paths keep
  their bytes), and the static files are served through `env.ASSETS` with
  `run_worker_first` so the redirect covers them too (Search Console duplicate
  fix, 2026-09-27)
- `src/middleware/robots.ts` — every 401/402 the Worker sends carries `X-Robots-Tag:
  noindex` (Search Console 2026-10-15 "Blocked due to unauthorised request (401)":
  Googlebot followed the docs' /v1/data and /mcp links into the keyless walls). The
  paths stay crawlable in robots.txt because agents read the wall bodies for the
  sign-up and payment hints; only indexing is declined (2026-10-16)
- `docs/` — architecture, runbook, setup docs; `.taskmaster/` — PRD + backlog

## Stack
TypeScript (strict) · Hono on Cloudflare Workers (Paid plan since 2026-07-10)
· zod (→ OpenAPI 3.1 → MCP tools; one schema source of truth) · Workers KV +
D1 + Cron Triggers + Analytics Engine (`gankdat_traffic`: /mcp and /x402 adoption,
and since 2026-09-29 the REST surface too — `src/middleware/traffic.ts` writes
`rest_data`/`rest_changes` for every served `/v1/data/:source` and `/v1/changes/:source`,
UA and source slug only, never an IP, denials excluded, so STRATEGY §4's weekly
change-feed target is readable from the daily metrics row) ·
stripe-node (fetch client) · official MCP TS SDK · @x402/hono (x402 v2, since
2026-10-14; x402-hono 1.2 before) · vitest with
@cloudflare/vitest-pool-workers · ESLint + Prettier · npm · wrangler.
The x402 packages (@x402/hono, @x402/core, @x402/evm, @x402/extensions,
@coinbase/x402 — and viem beneath them, most of the bundle) are imported lazily
on the first lit `/x402` request, so cold starts skip them while the lane ships
dark; the resource server is then kept per configuration for the isolate's life.

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
  writing no row). The page update MATERIALIZES its 2,000 (seq, id, hash) entries so SQLite loops
  over them and probes each row by primary key: written as `UPDATE … FROM` a `json_each` subquery
  (10-07) the planner walked the whole generation and scanned the entries per row — 200 s a page
  at 162k rows, so the budget check between pages never ran and 10-08/10-09 died silent too
  (2026-10-09; plan asserted in `d1store.spec`). A backfill that took over three minutes
  (`BACKFILL_HANDOVER_MS`) hands the delta to the next night even when complete, and a backfill
  that throws writes an `error` row — a night is never silent again. The generation swap is what the 2026-10-01
  Cloudflare budget alert (US$15 metered vs the US$5 plan) was traced to — D1 bills rows
  written (measured 2026-10-08: ~6M writes a day before the delta refresh, 0.0–0.2M a day after). The trade: during a delta refresh a request sees today's version of some rows and
  yesterday's of the rest (every row present, nothing partially loaded; `last_refreshed_at`
  flips at the end, and a crash mid-way self-heals against the stored hashes). `refresh_log`
  carries `delta +a ~c -r` per source. Migrations via `wrangler d1 migrations`.
- **KV**: response cache per source (+ precomputed `/stats` blob and a
  best-effort refresh single-flight lock), monthly usage counters per account
  email (`usage:<email>:<yyyymm>`), the top-up balance (`topup:<email>`, no period, no TTL —
  credit packs bought through PayPal, spent once the month's allowance is gone), key-hash → key-record hot-path lookup
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
  directory. A bare `Authorization: Bearer` with no token counts as no key (2026-10-10,
  `presentsCredential` in `routes/mcp.ts`): Docker's MCP gateway templates the header for every
  Toolkit user and sends it empty until a key is pasted; a token after the scheme is still
  validated. The Docker MCP Catalog entry (`docs/docker-mcp-catalog/`) ships keyless + optional key;
  its `oauth` block is a second PR once the Worker's dynamic registration (below) is live and the
  entry listed. KV rate limiters fail open on KV errors.
  **One JSON body per POST, calls under a deadline** (2026-10-18, gankdat `refresh-mcp-probe`): the
  keyless metrics probe of 10-18 07:10 timed out at 20 s on one `tools/call` (fresh 1,000-row
  uk-tenders snapshot, no CPU limit in reach) while the keyed call a moment later answered at once,
  and `/mcp` left no line to read. Two Worker-side guards: `routes/mcp.ts` builds the transport
  with `enableJsonResponse: true` — an SSE stream returned the Response at once and ran the tool
  call after the fetch handler had returned, the one shape of work a Worker may drop (a dropped
  call leaves the stream open until the client gives up); in JSON mode the call runs inside the
  awaited handler and a death mid-call is an HTTP error a checker can read (the spec allows a
  JSON answer to a POST; every client sends `Accept: application/json, text/event-stream`). And
  every data tool (`query_*`, `get_changes`) runs under `TOOL_CALL_BUDGET_MS` (10 s,
  `src/lib/deadline.ts`): a call that misses it answers a tool error naming the phase (gate /
  query / settle) and logs `slow_tool_call`, a late keyed result is not charged and the late work
  runs on under `ctx.waitUntil` so a cold-cache refresh it started still lands in KV. The probe
  (`scripts/mcp-probe.ts`) now tells `body unread (headers arrived)` from no response and bounds
  the body read itself. Cause of the 10-18 hang not proven; the next one is readable.
  `test/mcp-deadline.spec.ts` is the probe's three calls, keyless then keyed, plus the hang.
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
  **Connect funnel** (2026-10-09, queue `oauth-connect-funnel-check`): `connect_account` was the
  most-wanted tool for a week (4–6 keyless calls a day) with `oauth: 0 connects`, and nothing between
  the 401 and the code row said where a person stopped — no sandbox can POST to the live hop, and
  the only end-to-end walk was the owner's (10-04). So every leg of `routes/oauth.ts` writes an
  `oauth_funnel` analytics point (blob3 step: `authorize`, `authorize_rejected`, `signin_shown`,
  `consent_shown`, `email_sent`, `approved`, `denied`, `expired`, `token`, `token_rejected`; blob4
  the client host; blob5 the detail — a rejection cause, the email outcome, the grant type, the
  token error) and the Daily numbers row carries `oauth funnel 7d: N challenges (…), N authorize,
  … N token errors` plus `connect_account 7d by UA: …` (the user agents behind the 401s, read from
  the existing `mcp_denied` points — a scanner's UA ends the question; `src/lib/oauth-funnel.ts`).
  Claude's real client documents are `https://claude.ai/oauth/mcp-oauth-client-metadata` (hosted
  apps, redirect `https://claude.ai/api/mcp/auth_callback`) and
  `https://claude.ai/oauth/claude-code-client-metadata` (Claude Code, port-less loopbacks), both
  verified through the relay on 2026-10-09; `/authorize` with either rendered the sign-in page live.
  **Resource indicator variants** (2026-10-23, `oauth-resource-indicator-variants`, v0.25.5): the 10-20..10-23 rows read
  `0 authorize, 2 rejected (invalid_target …)` — the only two /authorize calls in the window refused on a strict string
  compare of RFC 8707 `resource`, and nothing recorded what they sent. The MCP authorization spec lists
  `https://mcp.example.com/mcp`, `https://mcp.example.com` and the port form as valid canonical URIs for one server,
  asks that an upper-case scheme and host be accepted and only discourages the trailing slash, so `resourceMatches`
  (`auth/oauth.ts`) parses the value and accepts https, this host (`:443` and case folded by the URL parser), no
  query or fragment, and a path of ``, `/` or `/mcp` with or without the slash — any other host, port or path is
  still `invalid_target`. The grant stores the canonical form whatever spelling arrived, and the `authorize_rejected`
  funnel detail reads `invalid_target: <value sent>` (parentheses and pipes replaced, 120 chars) so the row's
  `rejected (…)` reading names the client's value instead of our own description.
  **Preview wall next steps** (2026-10-11, queue `preview-wall-next-steps`, v0.24.1): the first client to
  spend the preview budget (47 `preview_exhausted` challenges on 10-11, bid-intelligence tools) was told
  only to sign in — a person's path — while the two agent paths went unnamed. The wall now names every
  way on in the order an agent can act (`previewNextStep` in `src/mcp/preview.ts`, also the `preview.next`
  meta and the `connect_account` description): pay per call at `/x402/data/<source>` (x402, from
  `X402_DEFAULT_PRICE_USD`), the free key through `request_api_key` → `claim_api_key`, then `connect_account`
  or /account; the 401's `WWW-Authenticate` headline says the same in 120 chars. The wall, the keyless `/mcp`
  points, the `protected_tool` challenge and `x402_paid` carry the preview's hashed client id in blob6
  (never an IP), and the Daily numbers row reads `after wall 1h (7d): N clients — request_api_key N, x402 N,
  connect N, gone N` (`afterWallNote` in `src/lib/oauth-funnel.ts`) so the next row says what a wall-hitter
  did next. Proof: a request, a payment or a connect from a wall-hitter within 30 days, or `gone` naming it.
  **Dynamic client registration** (2026-10-10, queue `oauth-dynamic-client-registration`, migration
  0016 `oauth_clients`, v0.23.0): only Claude carries a client-id metadata document — Docker's MCP
  gateway (`PerformDCR`: "no registration endpoint found"), Cursor, ChatGPT and VS Code register
  by RFC 7591 — so `POST /register` (JSON in, 201 out, 10 a minute per IP) stores a public
  client's name and 1–10 redirect URIs (https with a dotted host, or http loopback; auth method
  `none`, code + PKCE, no secret issued) under a random `gkcl_<label>_<hex>` client_id and the
  RFC 8414 document names `registration_endpoint`. The label is the host of the first https
  redirect_uri, else the client_name slugified without dots (a loopback-only client cannot call
  itself `claude.ai`), and it is what `clientHost` returns, so the consent page, the
  `oauth:<label>` key and the funnel points work unchanged; the consent page adds that the client
  registered itself and nobody verified who runs it. `/authorize` resolves a registered id first,
  then CIMD (`resolveClient`); `/token` is untouched (the code row carries the client_id). Funnel
  steps `registered` (detail loopback/https) and `register_rejected`. Registered clients with no
  grant row are swept after 90 days with the expired grants. Proof: a `token` step for a client
  host other than claude.ai within 30 days; the Docker entry's oauth block merged.
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
  still shows. KV sources only. **Origin unavailable** (2026-10-11): a source whose origin
  answers 5xx on every read it allows throws `origin.ts OriginUnavailableError` (uk-insolvency:
  four reads over ~13 s of growing fair-use pauses, up from two 2 s apart); the runner logs that
  as a `skipped` refresh_log row, not `error` — the day is the origin's, the last snapshot stays
  served, and a second such day surfaces through the stale `no successful refresh since …; last
  run skipped: …` reading. The `refresh errors` reading itself (`metrics.mjs`) counts an error row
  only while no later `ok` row of the same source exists: The Gazette's one 503 of 2026-10-10
  13:00 was still listed in the 10-11 row written 18 h later, right after a 1000-record refresh,
  and the auto-filer read the two rows as two failures.
  **Zero-record evidence** (2026-10-11): sources fetch their origin through `origin.ts
  originFetch` and both stores run a refresh inside `traceOrigin`, so a refresh that yields
  nothing fails with the first page the origin served — `refresh returned 0 records: GET 200
  36 B keys entities,links,count from <url>` (status, Content-Length or bytes seen, top-level
  JSON keys / array length / first 80 chars, plus a page count and the last page when there were
  several) — and the Daily numbers row tells an emptied dataset from a 5xx page without a relay
  round-trip. The body is peeked from a cancelled clone (4 kB), never consumed; no parentheses
  or pipes in the text because `refresh-errors-to-queue` splits the row on them.
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
- **Origin notice** (`DataSource.notice`, 2026-10-11): a dated plain sentence on a source whose origin is
  paused or emptied, shown on `/stats/<slug>`, in `/v1/data` and `list_sources` (`notice`, null
  otherwise). The refresh keeps failing with the evidence (`origin dataset empty: …`) so the Daily
  numbers row and the auto-filer see the state every night, and the last snapshot stays served; the
  source file owns the text (isolation rule). First use: uk-planning.
  **Retention** (2026-10-17, queue `uk-planning-paused-snapshot-retention`): the KV snapshot and stats blob
  expire at 7 × the cache TTL and a failing refresh wrote nothing, so uk-planning's 10-09 snapshot was gone on
  10-16 and every REST, MCP, x402 and Apify call 503'd "retry later" while /stats/uk-planning was a JSON 503.
  Now `cache.ts retainSnapshot` re-puts both keys with a fresh TTL after every failed refresh (no origin read),
  the 503 / tool error for a `notice` source carries the notice (`store.ts unavailableMessage`), the tool
  description ends with `Origin notice: …` so the metrics probe picks a live source, and `/stats/<slug>` with no
  blob renders the notice as a page. The data itself returns only with the origin: a snapshot already expired
  cannot be re-created, which is why uk-planning stays unavailable (with the notice) until planning.data.gov.uk
  serves rows again or the §7 clock retires it.
  **Surface pause** (2026-10-19, queue `uk-planning-apify-pause`): a `notice` source is paused on every
  surface, and says so — `/stats/<slug>` carries a `state: paused` headline row (the index a `· paused`
  mark) and names REST, MCP, x402 and the Apify actor as answering the notice with no records; the
  actor's `main.mjs` ends a run that meets the API's 503 `Origin paused` answer cleanly (status message
  = the dated notice, no items, no charge) instead of failing, which is what Apify's QA had flagged
  as "under maintenance" on 10-17 (6 of 22 runs failed in 30 days, 18 outside users), and its README
  opens with a dated `Paused` line. The actor stays public: unpublishing would drop the 18 users'
  schedules and spend one of the 5 publications a day on the restore. Everything resumes by itself
  with the first refresh after the origin republishes (the weekly re-read item); the notice text and
  the catch stay dataset-owned (isolation rule).
- **Wave log reading** (`lib/wave-logs.ts`, 2026-10-09): a wave killed at the 15-minute Cron
  Trigger limit writes no `refresh_log` row, and no sandbox or relay can read Worker logs (the
  journal's silent nights 10-05..10-08 were guessed at twice). So the metrics workflow's
  `runner-refresh.mjs` step, which holds the deploy token, POSTs the Workers observability
  Query Builder (`/workers/observability/telemetry/query`, service `faceless-api`, needle = the
  slug, last 24 h, 20 lines) for every source with no `ok` row in 26 h or an error row today,
  prints the lines in the job log and leaves `dist/wave-logs.json`; `metrics.mjs` reads it as
  `wave log: <slug> [level] <newest line> <age> (N lines)` — `n/a (HTTP 403 …)` names the
  missing token scope, `no stale source` a clean night. Pure parse + reading in the lib, tests
  in `test/wave-logs.spec.ts`; never fails the job. **Cron outcome** (2026-10-17, `wave-log-cron-outcome-reading`):
  the slug search's first real test (10-16) returned only the invocation request lines and @x402/hono's
  per-isolate Ajv warning (workerd forbids code generation; the Bazaar extension is valid), and the
  journal's 06:05 wave left no line at all. So `dropNoise` leaves those lines out (the row counts them,
  `2 of 6 lines`), `pickReading` prefers a structured `event=` line over a newer bare one, and a second
  query per Cron Trigger (`store.ts CRON_BY_WAVE`, `cronOfSource`; none for a runner-fed or lookup source)
  reads the wave's own invocation log — the documented shape: `$metadata.type = cf-worker-event`, the
  cron as the message, `$workers.outcome` / `wallTimeMs` when carried (relay cf-workers-logs-fields-2026-10-17)
  — rendered `wave 06:05: exceededCpu 900.1s 18 h ago` or `no invocation in 26 h` ahead of the slug
  reading. The runner prints the first invocation row when none parsed, so the next job log shows the
  live shape. The warning itself is muted at the lane (`x402/routes.ts withoutCodegenWarning`, that one
  message only), and so is the ERROR line the same compile writes (2026-10-18, `x402-ajv-compile-log-noise`):
  Ajv's `compileSchema` logs `Error compiling schema, function code:` with the generated validator source
  before rethrowing, 17 lines per isolate start, 11 of the 12 uk-planning lines in the 10-17 reading;
  `withoutCodegenError` drops that one two-argument call (the compile cannot be skipped — `paymentMiddleware`
  validates every route on start — and under workerd it fails only this way; CDP's daily validate is the
  real schema check). **What the invocation query reads** (2026-10-22, `wave-log-cron-query-blind`; the 10-16 job
  log, its first real read, carried no line from any wave though wave 1 refreshed 14 sources that
  morning): the query is not blind — the 10-21 run returned two `ok` rows (wall 79.8 s and 79.0 s) and
  10-22 one (104.0 s), a row's timestamp being the invocation's end (05:02:15.7 − 79.8 s = 05:00:56, the
  second uk-planning's first error line was written), so `wave 05:00: ok 79.0s 1.9 h ago` is a real
  reading. It is not complete: 10-18, 10-19 and 10-20 answered 200 with no row for a wave whose D1 rows
  exist, and on 10-22 the 05:15 wave left no row where 10-21's did; the docs name no cause (sampling
  default 1, 5 billion logs a day, 256 KB a log) and the cached 10-17 page says nothing about an
  invocation the platform cut off. So the clause keeps `no invocation logged`, never "did not fire", and
  the progress marker stays the reading of a silent wave. The live rows named no cron, and the needle is
  a substring (`0 5 * * *` sits inside `30 5 * * *` and `50 5 * * *`) — the 10-21 reading was in fact the
  05:15 wave's row — so `parseWaveInvocations` ranks a row whose cron matches ahead of a cron-less one, a
  cron-less reading says `(cron unread)`, and the runner prints the first raw row whenever a parsed row
  lacks its cron (where the live shape keeps it is the one open question; `test/wave-logs.spec.ts`). **Refresh progress marker** (`sources/progress.ts`,
  2026-10-18, `refresh-uk-trademark-journal-2026-10-17`): the in-band reading of a silent wave. Every
  attempt puts `refresh:progress:<slug>` in KV at start and at each phase (`backfill`, `index`,
  `stream N records` every 25k, `written`, `stats`; one write a second per key, closer marks skipped)
  and deletes it after its own `refresh_log` row; `store.ts recordSilentRefresh` turns a marker the
  previous attempt left into that night's missing `error` row — `silent refresh started <when> died
  after <phase> <detail> at <s> s, no row written` — before the new attempt starts, so every night
  has a row by the next wave and the Daily numbers row names the phase (`silent nights: <slug> started
  <when> died after <phase> …`, `metrics.mjs`, the day the row is written, even when the new attempt
  then succeeded). With it, the `ok` row is
  written before the best-effort stats in all three refresh paths (a kill inside the journal's
  45-page facet aggregation no longer costs the row), and the journal's issue fetch aborts after
  5 minutes (`ISSUE_FETCH_TIMEOUT_MS`) so a request the IPO never answers errors out instead of
  holding the wave to the kill. **Stale marker** (2026-10-23, `refresh-marker-false-positive-2026-10-23`, v0.25.4): the lane's first
  `silent nights:` reading (uk-sanctions, 10-22) was a phantom — the attempt wrote its ok row three seconds in and
  only the marker's delete was lost (KV's one-write-a-second gap or a dropped delete) — so `recordSilentRefresh`
  first reads the slug's newest `refresh_log` row (`refreshLogRowSince`): a row created at or after the marker's
  `started_at` (floored to the second, `datetime('now')` precision) means the marker is stale — it is deleted and
  logged `refresh_progress_stale`, no row written; a marker with no later row is still the silent night. And
  `clearRefreshProgress` retries a failed delete once after the same-key gap. The reading can no longer send the
  auto-filer after a healthy source.
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
- **Apify run outcomes** (`lib/apify-outcomes.ts`, 2026-10-11): each actor's public 30-day run stats
  are by status, so the Daily numbers row's `apify 30d by actor` carries `(F failed)` (failed +
  timed-out, every account, Apify's QA runner included) and an actor whose F rose since the previous
  row is listed under `refresh errors` as `apify-<name>`, which the auto-filer turns into
  `refresh-apify-<name>` by its two-rows-in-four rule. Why rising, not non-zero: both maintenance
  flags so far (09-25, 10-10) were learned from Apify's mail three days in, and a fixed actor must
  drop out the next day rather than be re-filed for the 30 days its old failures stay in the window.
- **Live MCP probe** (`scripts/mcp-probe.ts`, 2026-10-08, queue `mcp-live-probe`): the metrics job's
  runner does what an agent directory's health checker does — `initialize`, `tools/list`, one keyless
  preview `tools/call` on the first listing data tool — against the live `/mcp` and the same with a
  bearer key; `metrics.mjs` renders `mcp probe: …` in the Daily numbers row and lists a failed step
  under `refresh errors` as `mcp-probe`, so the repeat rule files a fix item. Why: Glama's hourly
  check mailed "HTTP 500 – Error connecting to MCP" on 2026-10-08 (and found the 2026-09-19 Bot
  Fight Mode challenges) while no sandbox can reach gankdat.com and Worker logs are read nowhere —
  the probe is the only reading of the edge as directories see it. Push runs probe too (node
  builtins only); a dead probe is a reading, never a failed job. **One-run probe key** (2026-10-09,
  queue `probe-key-from-runner`): the authed pass needs no repository secret — `api_keys` holds
  only a key's SHA-256 and the job already holds `CLOUDFLARE_API_TOKEN`, so the probe inserts a fresh
  key's hash under the internal `probe@gankdat.com` account through the D1 REST API, runs the three
  calls with it, then deletes the row and the Worker's 60 s KV copy (`key:<hash>`); a row left by a
  killed run is swept by the next mint, the raw key never leaves the process, and a failed mint is
  itself a `refresh errors` entry. The account is an `@gankdat.com` address, so the accounts,
  sign-up and OAuth readings skip it like the other internal mailboxes, and the traffic counts
  (`MCP 24h`, change feed, `datasets 30d`) skip the probe's user agent. `GANKDAT_PROBE_KEY`, if ever
  set, still takes precedence and nothing is minted. **External dataset demand** (2026-10-11, queue
  `metrics-dataset-queries-external`): `datasets 30d` counted every authed call, and the Apify actors
  (the repo's own key) plus the probe were every call on every register — §7's 60-day retirement clock
  read our own automation. Authed `rest_data` (blob4) and `mcp_authed` (blob6) points now carry the
  key's account id (an opaque D1 id, never an email), and the row adds `datasets 30d external: …`,
  which leaves out every account with an internal mailbox (`INTERNAL_EMAIL_SQL` in `metrics.mjs`) and
  the untagged points from before 10-11; the W42 review applies §7 from that line.
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
  facilitator; enabled only when `X402_WALLET_ADDRESS` is set. **x402 v2 since
  2026-10-14** (v0.25.0, gankdat `x402-bazaar-listing`, exchange 2026-W42): the
  402 carries the payment-required document in the `PAYMENT-REQUIRED` header
  (base64 JSON: `accepts[]` with CAIP-2 networks `eip155:8453`/`84532`, the
  resource, and an `extensions.bazaar` declaration per route — description,
  query-parameter JSON Schema from the source's zod params, a schema-shaped
  output example — generated in `src/x402/bazaar.ts` from the registry so a new
  dataset is discoverable the day it ships); payment arrives in
  `PAYMENT-SIGNATURE`, the receipt in `PAYMENT-RESPONSE`; the unpaid body is the
  platform's `payment_required` error envelope. v1 clients (`X-PAYMENT`) are no
  longer served (0 payments in three months). The CDP Bazaar indexes a resource
  only after one settled payment: the owner's half-cent call (action 026) is the
  onboarding step; the metrics runner dry-runs every route against CDP's keyless
  validate endpoint daily (`x402 validate:` clause — v0.25.1, 2026-10-14 evening: the first
  validate read rejected every route because the example query typed `per_page` as a string
  under an integer property; example values now carry the schema's types) and counts payments under the
  `gankdat-x402-probe/…` user agent as internal, never as sales. **Bazaar reading
  (`metrics-bazaar-merchant-read`, 2026-10-14):** the same runner reads the receiving
  wallet from the first route's 402 (`PAYMENT-REQUIRED`, keyless), asks CDP's keyless
  `GET /platform/v2/x402/discovery/merchant?payTo=…` for every active resource under it
  and writes `bazaar: N listed, C calls/30d, P payers, last <date>` from the catalogue's
  own `quality` numbers (`bazaar: 0 listed` until indexed; parsing in
  `scripts/x402-bazaar-read.ts`; the keyless reads in `scripts/x402-catalogue.mjs`).
  **Per-route indexing (2026-10-23, `x402-bazaar-week-1-index-check`):** CDP indexes one
  resource per settled payment and drops a resource 30 days after its last settlement
  (seller docs, read 2026-10-23); a week after the first half-cent call only uk-tenders,
  the route it paid, was listed of 17. With the `X402_PROBE_KEY` secret (action 026
  option B) the metrics job's probe step (`scripts/x402-probe.mjs`) reads the catalogue
  when no probe payment landed in 7 days and pays, through the test client, every route
  it does not list and every listed route settled 23 days ago (`probeTargets`); the
  `x402_probe` dispatch input pays every route (a re-screen is per resource); at most 20
  half-cents in any 30 days (`PROBE_MONTHLY_CAP`, US$0.10). The client prints the
  facilitator's Bazaar verdict (`EXTENSION-RESPONSES`: success, processing, rejected) and
  the facilitator's reason when a signed payment gets a 402. **Description cap (v0.25.3,
  2026-10-23):** the CDP facilitator rejects verify and settle when the route description
  exceeds 500 characters, so `bazaarDescription` never exceeds `DESCRIPTION_MAX = 500`
  (the summary budget is what the title and shape sentence leave) — from v0.25.0 to
  v0.25.2 thirteen routes were over it and could not take any payment, which validation
  (`x402 validate: 17/17 valid`) never shows; the declaration test asserts the cap. The
  probe calls each route with the query its declaration carries (the indexer's own call).
  **What sold** (2026-10-19, `x402-paid-by-source-reading`): the `x402_paid`
  point carries the UA, path, slug and hashed client id, so the row's sales cell reads
  `3 x402 paid (uk-sanctions 2, eu-ted 1; 3 clients; python-requests 2, x402-fetch 1)`, a
  `x402 30d:` clause follows the `bazaar:` one, the job log prints `bazaar resource: <url>
  calls C payers P last <date>` per resource, and paid x402 calls count in `datasets 30d
  external` as `<slug> N (x402 N)` — a settled payment is external demand §7's clock must
  see (`src/lib/x402-sales.ts`; the probe's user agent excluded in SQL). The lane's first
  three external payments (10-17/18) reached the row as a bare count.
- **PayPal** (credit packs, **sandbox only**) — built 2026-10-11 as the PayPal AI Hackathon entry
  (v0.24.0, migration 0017 `paypal_orders`, `docs/PAYPAL-SETUP.md`): Orders API v2 against
  `api-m.sandbox.paypal.com` by construction, no live switch. One-off packs (`src/billing/packs.json`,
  1k/5k/20k credits for US$8/35/120) add to the account's top-up balance (KV `topup:<email>`), which
  `metering/budget.ts` spends only once the plan allowance is gone — `X-Credits-Source: plan|topup`,
  no upgrade nudge on a top-up call; `/v1/usage`, `get_usage` and /account show `topup`. Surfaces:
  `POST /v1/billing/paypal/orders` + `…/<id>/capture` (key), the MCP tools `buy_credits` /
  `confirm_credit_purchase` (protected: the keyless 401 starts sign-in — the agent hands the human
  PayPal's approval link and never sees a card), the /account "credit packs" buttons (session) with
  PayPal returning the browser to `GET /v1/billing/paypal/return`, which captures. The
  `paypal_orders` row's `created → completed` UPDATE is the capture guard (replays, a second return
  hit and PayPal's `ORDER_ALREADY_CAPTURED` grant nothing); `credit_ledger` gets `paypal:<pack>`.
  Dark (503 / tool error) until `PAYPAL_SANDBOX_CLIENT_ID` + `PAYPAL_SANDBOX_SECRET` are set.
  `scripts/paypal-walkthrough.mjs` runs the five-call agent path from a terminal.
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
