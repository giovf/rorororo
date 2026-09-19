<context>
# Overview

**faceless-api** is a single-purpose niche data API business: one narrow, valuable dataset
exposed as clean JSON endpoints, sold on usage/credit-based pricing with near-zero marginal
cost and near-zero-touch operations (<2 hrs/week at maturity). It sells through two channels:

1. **Human developers** — self-serve signup on our own site (Stripe usage billing), plus
   marketplace listings (RapidAPI/Apify) later for discovery.
2. **AI agents** — a remote MCP server so agents can discover and call the API natively, and
   an x402 endpoint accepting per-request USDC micropayments with zero platform commission.

**Niche strategy:** the strategic analysis (`.taskmaster/docs/niche-analysis.md`) ranks
**UK public-sector & regulatory data normalization** as the #1 niche — planning applications
as the wedge, procurement second, regulatory feeds later. v1 therefore seeds the platform
with that wedge's **official, Open-Government-Licence JSON feeds** (no scraping). But Stage 0
market validation is still pending, so the architecture stays **niche-agnostic**: every
dataset-specific concern sits behind a swappable `DataSource` interface. If validation forces
a pivot (e.g. to procurement-only or sanctions), only the `DataSource` implementations and
copy change — auth, metering, billing, MCP, x402, docs, and ops carry over unchanged.

Operator profile: solo UK founder, <£500 startup budget, UK GDPR/PECR-aware, sterling cost
base selling in USD. Dev/test must be free (local `wrangler dev`, Cloudflare free tiers);
production must scale without re-architecture (Cloudflare edge).

# Core Features

1. **API core (Hono on Cloudflare Workers)**
   - Versioned REST routes under `/v1/`, JSON-only, consistent success/error envelope.
   - Schema-first request/response validation (zod) with an auto-generated OpenAPI 3.1 spec
     served at `/openapi.json` — the spec is the single source of truth that also feeds the
     docs page and the MCP tool definitions.
   - `/v1/health` liveness endpoint; structured request logging (key id, route, latency,
     credits charged) for observability.

2. **Swappable data-source layer** (the niche-agnostic heart)
   - A `DataSource` TypeScript interface: identity/slug, zod schema of records, `fetchFresh()`
     (pull from origin), refresh policy (cron cadence + cache TTL), and query capabilities
     (filter/paginate parameters it supports).
   - A registry mapping slugs → sources; generic `/v1/data/:source` query endpoints generated
     from the registry so new sources appear in API + OpenAPI + MCP automatically.
   - Caching in Workers KV; scheduled refresh via Cloudflare Cron Triggers; per-source
     freshness metadata (`last_refreshed_at`) exposed in responses.
   - **Two seed sources** proving the abstraction AND forming the strategic wedge (both
     official government APIs, Open Government Licence, zero scraping risk):
     - `uk-planning` — planning applications from the official planning.data.gov.uk feed,
       daily refresh. **Blind Mode by default**: personal-data fields (applicant names,
       contact details) are excluded at the schema level for GDPR safety; the normalized
       schema covers reference, authority, status, dates, location (site-level), description.
     - `uk-tenders` — UK procurement notices from Find a Tender's official OCDS JSON API,
       daily refresh, normalized from OCDS releases to a flat, queryable schema.
     Sources remain swappable: a Stage-0-driven pivot means new `DataSource` files, not
     platform rework. Council-portal coverage (Idox/Northgate long tail) is explicitly post-v1.

3. **API keys, free tier, and metering**
   - Self-serve key issuance: email → API key (shown once, stored hashed). KV-backed key
     lookup on the hot path.
   - Free tier: 250 requests/month, no card (funnel + LLM-discoverability asset).
   - Credit metering: every request debits per-endpoint credit cost; monthly counters in KV;
     `GET /v1/usage` self-service endpoint; usage-alert thresholds (80%/100%) recorded and
     surfaced in responses via headers (e.g. `X-Credits-Remaining`).
   - Coarse abuse protection: per-key and per-IP rate limits (KV-based, best-effort;
     Durable Objects upgrade path documented, not built).

4. **Stripe usage billing (human channel)**
   - Credit bundles as Stripe products — placeholder pricing: Starter $29 / Growth $99 /
     Scale $299 monthly credit bundles + pay-as-you-go overage; annual = 2 months free.
     (Exact numbers are launch-time configuration, not code.)
   - Stripe Checkout for purchase/upgrade; Stripe customer portal for self-service; webhooks
     (`checkout.session.completed`, subscription lifecycle) provision/deprovision keys and
     credit balances automatically. Dunning is Stripe-native — no code.
   - stripe-node on Workers (fetch HTTP client + SubtleCrypto webhook verification).

5. **MCP server (agent channel #1)**
   - Remote MCP endpoint at `/mcp` (Streamable HTTP transport, official TypeScript SDK)
     exposing tools generated from the data-source registry: `list_sources`,
     `query_<source>` per source, plus a `get_usage` tool.
   - Auth via API key header; free-tier and credit metering apply identically to MCP calls.

6. **x402 paid endpoint (agent channel #2)**
   - x402 middleware (`x402-hono`) gating pay-per-request routes: agents with no account pay
     per call in USDC (placeholder price ~$0.005/request) direct to our wallet.
   - Receiving wallet address + facilitator URL are environment configuration; the feature is
     dark-launchable (enabled only when env vars are present).

7. **Landing page, docs, waitlist (marketing surface)**
   - Static site served by the same Worker (Workers Static Assets): answer-first landing copy
     optimised for LLM citation, interactive API reference rendered from `/openapi.json`
     (Scalar or similar embed), quickstart with copy-paste curl examples, `llms.txt`.
   - Waitlist/free-key signup form → `POST /v1/waitlist` → D1 table (email, source, timestamp).
     No email-sending provider in v1 (export list manually); GDPR-minimal data collection.

8. **Ops & automation (the <2 hrs/week engine)**
   - GitHub Actions CI: lint, typecheck, test on every push; deploy to Cloudflare on main.
   - Tests with vitest + @cloudflare/vitest-pool-workers (unit + Worker-level integration).
   - Cron-driven data refresh with failure logging; `/v1/health` suitable for UptimeRobot.
   - Runbook doc: what alerts exist, what to check weekly, how to rotate keys/secrets.

# User Experience

**Personas**
- *Dev Dana* — indie/startup developer who needs the dataset in production. Finds the API via
  community posts, LLM citation, or marketplace. Wants: instant free key, clear docs, copy-paste
  quickstart, predictable pricing, an SLA-ish status signal.
- *Agent Astra* — an autonomous AI agent (or its operator). Discovers the MCP server or the
  x402 endpoint programmatically. Wants: machine-readable tool definitions, no-signup
  pay-per-call, deterministic JSON.
- *Operator Gio* — the solo founder. Wants: everything self-serve, alerts only on breakage,
  one dashboard-free weekly review via logs/usage queries.

**Key flows**
1. Dana: landing page → free key via email form → curl quickstart works in <5 minutes →
   hits 80% of free tier → sees upgrade nudge header + docs link → Stripe Checkout → webhook
   tops up credits, no human involved.
2. Astra (MCP): agent adds `https://<domain>/mcp` with an API key → `list_sources` →
   `query_uk_planning` (e.g. "solar applications decided this month in authority X") →
   metered like any request.
3. Astra (x402): agent calls a paid route → HTTP 402 with payment requirements → pays USDC →
   retries with payment proof → gets data. No account anywhere.
4. Gio: weekly — glance at cron/refresh logs, usage anomalies, Stripe dashboard. Monthly —
   merge Dependabot PRs.

**UX considerations**
- Docs are the product's face: answer-first, one page, fast, no JS-required for core content.
- Error responses must be self-explanatory (machine-parsable code + human hint + docs URL).
- Everything a customer needs must be self-serve; support is email-only, low volume by design.
</context>
<PRD>
# Technical Architecture

**Stack (decided):** TypeScript (strict) · Hono on Cloudflare Workers · npm · wrangler ·
zod (+ zod-to-OpenAPI integration) · Workers KV (cache, counters, key lookup) · D1 (relational
records) · Cron Triggers · stripe-node · official MCP TS SDK · x402-hono · vitest with
@cloudflare/vitest-pool-workers · ESLint + Prettier (already wired).

**System components**
- `src/index.ts` — Hono app assembly: middleware chain (request id, logging, CORS, auth,
  metering) → routes; exports `fetch` and `scheduled` handlers.
- `src/sources/` — `DataSource` interface, registry, `uk-planning.ts`, `uk-tenders.ts`.
  Each source: slug, zod record schema, `fetchFresh()`, refresh policy, supported query
  params. Adding a file + registry entry must be the whole cost of a new source.
- `src/routes/` — `/v1/data/:source` (list/query with pagination + source-declared filters),
  `/v1/health`, `/v1/usage`, `/v1/keys` (issue), `/v1/waitlist`, `/openapi.json`.
- `src/auth/` — key generation (prefix + random, SHA-256 hashed at rest in D1, KV cache of
  hash→key-record for hot-path lookup), middleware attaching key context, revocation.
- `src/metering/` — credit costs per route, KV monthly counters (`usage:<keyId>:<yyyymm>`),
  quota enforcement, `X-Credits-Remaining` / upgrade-nudge headers.
- `src/billing/` — Stripe client, checkout-session creation endpoint, webhook handler
  (idempotent, signature-verified) mapping Stripe events → key/credit mutations in D1+KV.
- `src/mcp/` — MCP server bound at `/mcp`: tools generated from the registry; per-tool JSON
  schemas derived from the same zod schemas as REST.
- `src/x402/` — payment-gated route group using x402-hono middleware; enabled iff
  `X402_WALLET_ADDRESS` is configured.
- `public/` — landing page, docs page (Scalar embed of `/openapi.json`), `llms.txt`,
  quickstart; served via Workers Static Assets from the same Worker.
- `.github/workflows/ci.yml` — lint + typecheck + test; deploy job on main (needs
  `CLOUDFLARE_API_TOKEN` secret; deploy job is skippable until the account exists).

**Data model (D1)**
- `api_keys(id, key_hash, email, name, plan, credits_granted, created_at, revoked_at)`
- `credit_ledger(id, key_id, delta, reason, stripe_ref, created_at)` — append-only; balance =
  grants − usage rollups; KV holds the fast monthly counter, D1 the durable ledger.
- `stripe_customers(stripe_customer_id, key_id, plan, status, updated_at)`
- `waitlist(id, email, source, created_at)`
- `refresh_log(id, source_slug, status, records, duration_ms, created_at)`

**Bindings (wrangler.jsonc)**: `DB` (D1), `CACHE` (KV), `RATE` (KV), static assets; cron
triggers (daily + per-source cadence). Secrets via `.dev.vars` locally / `wrangler secret` in
prod: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `X402_WALLET_ADDRESS` (optional),
`ADMIN_TOKEN` (for manual ops endpoints).

**Environments**: local (`wrangler dev`, free, offline-capable — demo sources fall back to
fixture data when origin unreachable), production (Workers free tier → paid as volume grows).
No staging in v1.

# Development Roadmap

**Phase 1 — API core + data-source layer (foundation, demo-able)**
- Project structure, middleware chain, error envelope, request logging, `/v1/health`.
- `DataSource` interface + registry; `uk-planning` source (planning.data.gov.uk, Blind Mode
  schema); KV caching; cron-triggered refresh writing `refresh_log`; `/v1/data/:source` with
  pagination; freshness metadata.
- zod schemas → OpenAPI 3.1 at `/openapi.json`.
- Second source `uk-tenders` (Find a Tender OCDS) to prove the abstraction (added late in
  the phase, after the interface stabilises).
- Vitest + pool-workers harness; tests for envelope, sources, cache, cron path.

**Phase 2 — Keys, free tier, metering**
- D1 schema + migrations workflow (`wrangler d1 migrations`).
- `POST /v1/keys` (email → key, shown once), auth middleware, revocation, KV hot-path lookup.
- Credit metering + monthly KV counters + quota enforcement + usage headers; `GET /v1/usage`.
- Free-tier plan (250 req/mo) as the default plan; per-key/per-IP rate limits.

**Phase 3 — Stripe billing**
- Stripe products/prices setup script or documented manual setup (placeholder price points).
- Checkout-session endpoint; webhook handler (idempotent) → credit grants in ledger + KV;
  customer-portal link endpoint; plan upgrades/downgrades/cancellation paths.
- Usage-alert nudges (headers + response metadata at 80%/100% of quota).

**Phase 4 — Agent channels**
- MCP server at `/mcp`: `list_sources`, per-source query tools, `get_usage`; API-key auth;
  metering parity with REST.
- x402 payment-gated routes via x402-hono (dark-launched behind env config); per-request
  USDC pricing config; document the facilitator/wallet setup.

**Phase 5 — Marketing surface**
- Landing page (answer-first copy, free-key form), docs page (Scalar embed + quickstart),
  `llms.txt`, waitlist endpoint + D1 table; served as static assets from the Worker.

**Phase 6 — Ops hardening & launch prep**
- GitHub Actions CI (lint/typecheck/test) + main-branch deploy job (gated on account secrets).
- Runbook (`docs/RUNBOOK.md`): weekly checks, alert setup (UptimeRobot on `/v1/health`,
  Sentry optional), secret rotation, D1 backup/export.
- Marketplace-listing prep doc (RapidAPI/Apify requirements mapped to our endpoints) —
  documentation only; actual listings happen post-niche-validation.

**Post-v1 (explicitly future)**: council-portal long-tail coverage (Idox/Northgate portal
normalization — the fragile slice, added per customer demand), regulatory-change/recall feed
vertical, spatial search + webhooks (PlanWire-style), managed scraping integration
(ScraperAPI/Scrape.do) if a scraped niche is ever added, Durable-Objects rate limiting,
annual plans automation, marketplace listings (RapidAPI/Apify/MCP directories), programmatic
SEO pages, email provider.

# Logical Dependency Chain

1. Phase 1 first — everything else consumes the envelope, registry, and OpenAPI spec.
2. Phase 2 depends on Phase 1 (routes to meter) and unlocks every monetisation feature.
3. Phase 3 depends on Phase 2 (keys/credits to top up). Stripe test mode only until launch.
4. Phase 4 depends on Phase 2 (MCP reuses auth+metering); x402 is independent of Stripe.
5. Phase 5 depends on Phase 1's OpenAPI (docs) and Phase 2's key issuance (signup form);
   ship a minimal landing early if useful, but the docs embed needs the spec stable.
6. Phase 6 (CI) can start any time after Phase 1; runbook last, once behaviours exist.
   Atomicity rule: each phase leaves `main` deployable and demo-able via `wrangler dev`.

# Risks and Mitigations

- **Wedge not yet market-validated** (Stage 0 pending) → risk of polishing the wrong niche.
  Mitigation: the seed feeds are official and cheap to keep regardless; the `DataSource`
  contract is validated by two real, differently-shaped sources; anything dataset-specific
  outside `src/sources/` is a design bug to fix during review. Pivot triggers from the niche
  analysis: 3+ mature self-serve planning APIs found → procurement-only; <£300 MRR after 4
  months of marketing → reposition to bid-intelligence or sanctions.
- **Personal data in planning applications** (applicant names/contacts). Mitigation: Blind
  Mode is the default and only mode in v1 — personal fields are dropped at ingest, never
  stored; site-level location data only. No individual-level profiling features, ever.
- **Workers runtime limits** (CPU ms, no long-running scrapes). Mitigation: v1 sources are
  fetch+cache; heavy scraping (post-validation) goes through managed scraping APIs called
  from cron handlers, or a queue/worker split later — documented, not built.
- **Stripe/webhook correctness** (double-crediting, replay). Mitigation: idempotency keys on
  webhook processing, append-only credit ledger, integration tests with Stripe fixtures.
- **x402/MCP ecosystem volatility** (young protocols, SDK churn). Mitigation: both channels
  are thin adapters over the same core API; pin versions; dark-launch x402 behind env config.
- **KV eventual consistency** for counters/limits → slight over-serve risk. Accepted for v1
  (best-effort limits); Durable Objects upgrade path documented.
- **Single-source dependency** (blueprint's #1 killer). Mitigation baked in: registry designed
  for multiple sources; per-source freshness/failure logging; >40% single-source exposure is
  a tracked launch-time metric, not a code concern yet.
- **UK GDPR/PECR**: only emails collected, minimal retention, no purchased lists, cold email
  out of scope for v1. Privacy note on the landing page.
- **Solo-founder bandwidth**: phases are small and independently shippable; CI + tests keep
  regressions cheap; everything self-serve by design.

# Open Questions

1. **Stage 0 validation of the wedge** — confirm demand for UK planning/procurement
   normalization (20+ signups or 5 pre-commits per the blueprint; community posts +
   competitor scan per the niche analysis) *outside* this codebase. The platform build
   proceeds in parallel; a pivot swaps `DataSource` files, not the platform.
2. **Accounts**: do Cloudflare / Stripe / GitHub-Actions-deploy accounts exist yet? Deploy
   and live-billing tasks stay blocked-by-config (not by code) until they do.
3. **Domain name** — needed for landing/docs/MCP URLs; placeholder `faceless-api.example`
   until purchased (~£10/yr per blueprint budget).
4. **x402 wallet + facilitator** — which USDC wallet (Base) and facilitator service; feature
   ships dark until configured.
5. **Final pricing** — $29/$99/$299 bundles, 250 free req/mo, ~$0.005/req x402 are blueprint
   placeholders; the niche analysis suggests £15–£49/mo self-serve tiers for this market.
   Confirm at launch (config-level change only).
6. **Email provider** — v1 stores emails only; pick a transactional provider (or none) when
   key-recovery/receipts beyond Stripe's are needed.

# Appendix

- Business rationale, market evidence, channel strategy, maintenance blueprint, and risk
  base-rates: `.taskmaster/docs/scope.md` (extracted from the source PDF in `docs/`).
- Niche ranking, wedge definition, comparables (PlanAPI, PlanWire), legal analysis, and
  pivot thresholds: `.taskmaster/docs/niche-analysis.md` (extracted from the second PDF).
- Blueprint stage mapping: this PRD implements "Stage 1 — Ship MVP" for a to-be-named niche,
  with Stage 0 (validation) running in parallel outside the repo; Stages 2–3 (acquisition,
  compounding) are operational, not code.
- House conventions: TypeScript strict, explicit return types on exported functions, no
  `any`, named exports, npm — see `CLAUDE.md`.
</PRD>
