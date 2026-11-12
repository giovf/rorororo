# gankdat — Architecture

> Derived from `.taskmaster/docs/prd.md`. This file holds the *stable*
> architectural decisions and is loaded into every Claude session via
> CLAUDE.md. When the PRD changes, update **this** file — not `CLAUDE.md`.
> Volatile detail (full data model, phasing, open questions) stays in the PRD;
> this is the always-loaded summary.
>
> **Detail lives in `docs/ARCHITECTURE-DETAIL.md`** (not auto-loaded; read it when working on the
> subsystem): every dated incident, fix and proof note behind the summaries below — refresh waves and
> D1 throttling, stats facets, wave/error log reading, MCP protocol eras, OAuth, x402/Bazaar probing,
> per-dataset ingest gotchas. Split 2026-11-12 (/doctor): the single file had reached 90k characters,
> ~22k tokens in every gankdat session. Keep this summary short — one to three lines per item; a new
> incident narrative goes into the detail file under its subsystem, with a one-line pointer here only
> if it changes a contract.

## What we're building
A multi-niche data-API platform sold on usage/credit pricing to human
developers (Stripe self-serve) and AI agents (MCP server + x402 USDC
micropayments). Strategy (operator decision 2026-07-11): ship MANY datasets
across niches in parallel — validation comes from shipped-product signal
(signups, traffic analytics, the /feedback form) rather than a pre-launch
gate; weak datasets are cheap to retire because everything dataset-specific
sits behind the swappable `DataSource` abstraction (one file + registry
entry; the exposure surface regenerates itself — see NICHE-LAUNCH-CHECKLIST).

Live datasets (slug — origin — storage/wave; detail per dataset in ARCHITECTURE-DETAIL.md):
- `uk-planning` — planning.data.gov.uk — **origin paused since 2026-10-10** (dataset emptied upstream);
  the last snapshot is served under a dated `notice`, refresh fails loudly; weekly re-read queued.
- `uk-tenders` — Find a Tender OCDS — KV. `eu-ted` — TED Search API — KV (bid-intelligence bundle).
- `uk-sanctions` — FCDO UK Sanctions List — KV, per-dataset terms (personal-data dataset).
- `sam-exclusions` — SAM.gov keyless daily public extract ZIP — D1 (first `storage:'d1'` source).
- `uk-insolvency` — The Gazette linked-data API, corporate notices only — KV, **runner-fed** (refreshed
  from the metrics job's GitHub runner; the Gazette serves the Worker empty bodies).
- `uk-companies` — Companies House advanced search, new incorporations — KV, whole 7-day window (cap 15k).
- `uk-food-hygiene` (FSA FHRS, D1, ~610k), `uk-sponsors` (Home Office register, D1, ~143k),
  `uk-charities` (Charity Commission extract ZIP, D1, ~185k, contacts dropped), `uk-care-locations`
  (CQC weekly CSV, D1, ~57k, phones dropped), `uk-contract-awards` (Contracts Finder OCDS awards, KV).
- `uk-schools` — DfE GIAS joined to Ofsted outcomes — D1, ~50k, **wave 5** (05:50); head-teacher names dropped.
- `nhs-ods` — NHS ODS nightly files (six organisation types) — D1, ~45k, **wave 6** (05:55); every file required.
- `uk-trademark-journal` — IPO weekly XML journal, rolling 52 issues — D1, **wave 7** (06:05);
  layout-tolerant reader, 6-minute download budget, an HTML 200 body counts as a missing issue.
- `uk-gambling-operators` — Gambling Commission five daily CSVs joined to one table by `record_type`
  (licence / domain / premises) — D1, **wave 6** since 2026-11-11 (the Commission rewrites at ~05:30).
- `uk-company-profiles` — Companies House public-data API **on demand** (`DataSource.lookup`): one company
  per request (≤ 4 resources), 24 h KV cache, 30/min per account, no snapshot/wave/change feed;
  officers never called, individual PSCs dropped.
- `uk-payment-practices` — statutory payment practices CSV export (~115k reports) — D1, **wave 5**;
  narrative columns dropped; joined into `uk-company-profiles` as `payment_practices`.

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
- `src/x402/` — x402 v2 pay-per-request routes (dark until configured); `bazaar.ts` generates each
  route's Bazaar discovery declaration from the registry; also sells each register's change feed at
  `GET /x402/changes/<slug>` (US$0.01 a call)
- `public/` — landing page, docs (Scalar embed), robots/sitemap (Workers
  Assets); `llms.txt` is Worker-generated from the source registry
- `src/middleware/canonical.ts` — one URL per page (`www.`, `http://`, trailing-slash variants 301);
  static files served through `env.ASSETS` with `run_worker_first`
- `src/middleware/robots.ts` — every 401/402 carries `X-Robots-Tag: noindex` (paths stay crawlable)
- `public/addin/` + `public/addin.html` — **gankdat for Excel** (custom functions in the `GANKDAT`
  namespace, keyless preview task pane); `docs/APPSOURCE-ADDIN.md`, `test/addin.spec.ts`
- `connector/` + `src/connector/render.ts` — **Power Platform certified connector** rendered from the
  registry (`npm run connector`); `test/connector.spec.ts` pins Microsoft's rules
- `public/clay.html` + `skills/uk-company-register-check/` — **gankdat in Clay**: five register checks
  as Clay HTTP API columns on the user's own key, plus an Agent Skill; `test/clay.spec.ts`,
  `docs/CLAY-LISTING.md`
- `docs/` — architecture (this summary + ARCHITECTURE-DETAIL.md), runbook, setup docs;
  `.taskmaster/` — PRD + backlog

The add-in, the connector and the Clay page are distribution surfaces over the live `/v1/data` and
`/v1/changes` routes: no Worker change, nothing new to bill, and all dataset-agnostic (isolation rule holds).

## Stack
TypeScript (strict) · Hono on Cloudflare Workers (Paid plan since 2026-07-10)
· zod (→ OpenAPI 3.1 → MCP tools; one schema source of truth) · Workers KV +
D1 + Cron Triggers + Analytics Engine (`gankdat_traffic`: /mcp, /x402 and REST usage — UA and
source slug only, never an IP) · stripe-node (fetch client) · official MCP TS SDK v2
(`@modelcontextprotocol/server`, since 2026-10-30) · @x402/hono (x402 v2, since 2026-10-14) ·
vitest with @cloudflare/vitest-pool-workers · ESLint + Prettier · npm · wrangler.
The x402 packages (and viem beneath them) are imported lazily on the first lit `/x402` request.

Tests: pool-workers has no isolated per-test storage — `test/apply-migrations.ts` migrates once per
file and empties every table and both KV namespaces before each test; `vitest.config.ts` pre-bundles
heavy deps. On CI the gate runs once per push, in `gankdat.yml` only.

## Backend & data
- **D1**: `accounts` (email = identity, holds plan), `api_keys` (inherit plan), `credit_ledger`
  (append-only audit; NOT the live quota), `stripe_customers`, `waitlist`, `refresh_log`,
  `magic_tokens` (atomic single-use consume), `agent_signups`, `oauth_grants`, `oauth_clients`,
  `paypal_orders`, `source_records`/`source_meta` (rows for `storage:'d1'` datasets),
  `source_changes` (90 d change feed). Migrations via `wrangler d1 migrations`.
  **Delta refresh**: a source with `idOf` is refreshed in place (hash compare, upsert/append/delete
  per chunk with its change-feed rows); the generation swap remains for first loads and sources
  without ids. D1 bills rows written — the swap was the 2026-10 budget overrun.
  **D1's 10-second throttle** ("D1 DB is overloaded"): index reads are paced (`src/sources/d1pace.ts`),
  throttled statements wait the window out once (`withOverloadRetry`), a throttled data read answers
  503 `Retry-After: 11`; filtered totals are cached per generation. Never retry a throttle into the
  same window with a full reload.
- **KV**: response cache per source (+ precomputed `/stats` blob, refresh single-flight lock),
  monthly usage counters per account email (`usage:<email>:<yyyymm>`), top-up balance
  (`topup:<email>`), key-hash → key-record hot path (with negative + revocation-tombstone entries),
  sessions (7 d idle, 30 d absolute cap).
- **Auth**: bearer API key per request for data; passwordless magic-link (Resend, Turnstile-gated)
  + session cookie for /account. Key creation requires a signed-in session. Quota = plan monthly
  allowance per account (free 250/mo); KV-based best-effort. A cold key's D1 read is retried once on a
  transient error.
  **MCP**: anonymous `initialize`/`tools/list`; a presented key is always validated (bad → 401 with
  `WWW-Authenticate`); a bare `Bearer` with no token counts as no key. **Keyless preview**: a data tool
  without a key returns ≤ 5 rows, 20 calls/day per client (hashed IP+UA), then a wall naming x402, the
  agent sign-up tools and `connect_account`. `/mcp` validates a present `Origin`. One JSON body per
  POST; data tools run under a 10 s deadline (`src/lib/deadline.ts`), late keyed results not charged.
  Both protocol eras are served: 2025 (`initialize`) through a stateless JSON-mode transport, and
  **2026-07-28** (no sessions, `server/discover`, `Mcp-Method`/`Mcp-Name` headers) through
  `createMcpHandler`; `tools.listChanged: false` so a listen closes at once.
  **OAuth** (lazy): the Worker is its own authorization server (RFC 9728/8414, S256 PKCE, CIMD client
  documents, RFC 7591 dynamic registration, rotating refresh tokens); a token resolves to an API key
  named `oauth:<client host>`, so plans and metering are the key's. Resource indicators accept the
  spec's canonical variants of this host. The funnel writes `oauth_funnel` analytics points per leg.
  **Agent-side sign-up**: `request_api_key` → emailed approval code → `claim_api_key` (REST twins under
  `/v1/auth/agent-signup`); keys named `agent:<client>`; per-IP and per-email caps.
  `test/mcp-directory.spec.ts` is the conformance test for any agent directory; `test/oauth.spec.ts`.
- **Refresh**: staggered Cron Triggers, one budget each under the 15-minute limit (`store.ts
  waveForCron`): 05:00 KV sources, 05:15 exclusions + sponsors, 05:30 charities + care locations,
  05:45 food hygiene, 05:50 schools + payment practices, 05:55 nhs-ods + gambling operators, 06:05
  trade mark journal. Responses expose `last_refreshed_at`. An origin answering 5xx on every allowed
  read throws `OriginUnavailableError` → a `skipped` refresh_log row (last generation keeps serving);
  a zero-record refresh fails with the first page the origin served (`origin.ts traceOrigin`). A
  refresh progress marker in KV (`sources/progress.ts`) turns a wave killed mid-way into the next
  night's `silent refresh … died after <phase>` error row. The `ok` row is written before the
  best-effort stats. Runner-fed sources (`RefreshPolicy.runner`) are skipped by the waves.
  **Change feeds**: `/v1/changes/:source` and MCP `get_changes`, taking the source's own filters;
  `registry.hasChangeFeed` is the one predicate; sold on x402 too.
- **Stats pages and facets**: `/stats/<slug>` and bounded facet sub-pages
  `/stats/<slug>/<segment>/<value>` (values the source lists, never derived), precomputed at refresh;
  the parent blob is written first, facet values run in batches of 9 with one scan per statement
  (D1 CPU and SQLITE_NOMEM limits), pages past the budget are carried with `as_of`. Prose summaries
  per page from `lib/narrative.ts` (dataset-agnostic).
- **Keyless Atom feeds** (`routes/feeds.ts`): `/feeds/<slug>.xml` and facet feeds, last 7 days of
  changes, ≤ 50 entries, rendered ≤ hourly; `/feeds` page and `/feeds/opml`.
- **Origin notice** (`DataSource.notice`): a dated sentence on a paused/emptied origin, shown on
  stats, `/v1/data`, `list_sources`, tool descriptions and 503s; the snapshot is retained
  (`cache.ts retainSnapshot`) and every surface (REST, MCP, x402, Apify actor) answers paused.
- **Observability read by the metrics job** (GitHub runner with the deploy token; nothing a sandbox
  can reach): wave invocation logs and per-source lines (`lib/wave-logs.ts`), Worker error lines
  folded by message and by route family (`lib/error-lines.ts`), the on-demand `worker logs` dispatch
  workflow, the metrics job's `probe` dispatch (MCP probe + error lines only), IndexNow submission
  from the runner (`lib/indexnow.ts`), Apify run outcomes and maintenance flags
  (`lib/apify-outcomes.ts`), a live MCP probe of both protocol eras with a one-run minted key
  (`scripts/mcp-probe.ts`), external-vs-internal dataset demand (`datasets 30d external`).
  Workers Logs keeps a JSON `console.log` as the parsed object under `source`, never as `message`.
- **Query language** (generic, never per-dataset; `query.ts` + `d1store.ts` in parity): string
  params are case-insensitive substrings, numbers/booleans strict, `<field>_after/_before`
  date ranges, `<field>_min/_max` numeric ranges, `<field>_present=true|false` has-a-value,
  `q` across all string fields.

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
- **x402** (agent payments) — LIVE on Base mainnet via Coinbase CDP facilitator; enabled only when
  `X402_WALLET_ADDRESS` is set. v2 since 2026-10-14 (`PAYMENT-REQUIRED` / `PAYMENT-SIGNATURE` /
  `PAYMENT-RESPONSE` headers; v1 `X-PAYMENT` no longer served). Each route carries a Bazaar declaration
  generated from the registry; descriptions are capped at 500 characters (CDP rejects longer). The CDP
  Bazaar indexes a resource only after one settled payment and drops it 30 days after the last, so the
  metrics job's probe (`scripts/x402-probe.mjs`, `X402_PROBE_KEY`) pays unlisted/expiring routes within
  a 30-day cap sized from the route count. Payments under the probe's user agent are internal; probers
  and buyers are split in the Daily numbers (`src/lib/x402-sales.ts`).
- **PayPal** (credit packs, **sandbox only**, Orders API v2, no live switch): packs add to the top-up
  balance, spent once the plan allowance is gone; REST, MCP `buy_credits`/`confirm_credit_purchase`,
  /account buttons; the `created → completed` UPDATE is the capture guard. `docs/PAYPAL-SETUP.md`.
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
