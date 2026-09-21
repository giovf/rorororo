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
- `docs/` — architecture, runbook, setup docs; `.taskmaster/` — PRD + backlog

## Stack
TypeScript (strict) · Hono on Cloudflare Workers (Paid plan since 2026-07-10)
· zod (→ OpenAPI 3.1 → MCP tools; one schema source of truth) · Workers KV +
D1 + Cron Triggers + Analytics Engine (`gankdat_traffic`: /mcp adoption) ·
stripe-node (fetch client) · official MCP TS SDK · x402-hono · vitest with
@cloudflare/vitest-pool-workers · ESLint + Prettier · npm · wrangler.

## Backend & data
- **D1**: `accounts` (email = identity, holds plan), `api_keys` (belong to
  accounts, inherit plan), `credit_ledger` (append-only audit; NOT the live
  quota), `stripe_customers` (one per account), `waitlist`, `refresh_log`,
  `magic_tokens` (single-use sign-in tokens — atomic consume via
  `UPDATE … WHERE used_at IS NULL`),
  `source_records`/`source_meta` (rows for `storage:'d1'` datasets too large
  for a KV snapshot — SQL filters with applyQuery-parity semantics,
  generation-swap refresh; task 44). Migrations via `wrangler d1 migrations`.
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
  zero KV ops); `tools/call` needs a key; bearer 401s carry
  `WWW-Authenticate`. KV rate limiters fail open on KV errors.
- **Refresh**: four staggered Cron Triggers (05:00 KV sources, 05:15 exclusions + sponsors,
  05:30 charities + care locations, 05:45 uk-food-hygiene; `store.ts waveForCron`) pull sources, write `refresh_log`; responses
  expose `last_refreshed_at`. D1 refreshes diff generations by `DataSource.idOf` into
  `source_changes` (90 d) — served at `/v1/changes/:source` and the MCP `get_changes` tool.
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
  Companies House advanced search — Crown copyright, public register,
  needs `COMPANIES_HOUSE_API_KEY`, 600 req/5 min). No scraping.
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
  with task 34 are the bounded version)
- Fuzzy-match sanctions *screening* (`/v1/screen`) before list-serving proves
  demand and per-dataset legal terms exist (NICHE-NEXT-SANCTIONS Phase B)
