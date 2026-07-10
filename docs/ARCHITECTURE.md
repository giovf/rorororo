# gankdat — Architecture

> Derived from `.taskmaster/docs/prd.md`. This file holds the *stable*
> architectural decisions and is loaded into every Claude session via
> CLAUDE.md. When the PRD changes, update **this** file — not `CLAUDE.md`.
> Volatile detail (full data model, phasing, open questions) stays in the PRD;
> this is the always-loaded summary.

## What we're building
A single-purpose niche data API sold on usage/credit pricing to human
developers (Stripe self-serve) and AI agents (MCP server + x402 USDC
micropayments). v1 seeds it with UK public-sector open data — planning
applications (`uk-planning`, planning.data.gov.uk) and procurement notices
(`uk-tenders`, Find a Tender OCDS) — behind a swappable `DataSource`
abstraction, so a market-validation pivot swaps source files, not the
platform. Solo-operator product: everything self-serve, <2 hrs/week ops.
Customer-facing brand: **gankdat** (gankdat.com, live Stripe billing);
"faceless" survives only as the internal infra codename (Worker, D1, repo
names — never rename those; see memory/git history for why).

## Repo layout
- `src/index.ts` — Hono app assembly; exports `fetch` + `scheduled` handlers
- `src/sources/` — `DataSource` interface, registry, one file per dataset
- `src/routes/` — `/v1/*` REST routes + `/openapi.json`
- `src/auth/` — email accounts (identity), magic-link sign-in, KV sessions,
  API-key verify/revoke (SHA-256 at rest, KV hot path)
- `src/email/` — transactional email via Resend REST (dark until configured)
- `src/metering/` — credit costs, KV monthly counters, quota headers
- `src/billing/` — Stripe checkout/portal, webhooks → account plan + ledger
- `src/mcp/` — MCP server at `/mcp`, tools generated from the registry
- `src/x402/` — x402-gated pay-per-request routes (dark until configured)
- `public/` — landing page, docs (Scalar embed), `llms.txt` (Workers Assets)
- `docs/` — architecture, runbook, setup docs; `.taskmaster/` — PRD + backlog

## Stack
TypeScript (strict) · Hono on Cloudflare Workers · zod (→ OpenAPI 3.1 → MCP
tools; one schema source of truth) · Workers KV + D1 + Cron Triggers ·
stripe-node (fetch client) · official MCP TS SDK · x402-hono · vitest with
@cloudflare/vitest-pool-workers · ESLint + Prettier · npm · wrangler.

## Backend & data
- **D1**: `accounts` (email = identity, holds plan), `api_keys` (belong to
  accounts, inherit plan), `credit_ledger` (append-only audit; NOT the live
  quota), `stripe_customers` (one per account), `waitlist`, `refresh_log`.
  Migrations via `wrangler d1 migrations`.
- **KV**: response cache per source, monthly usage counters per account email
  (`usage:<email>:<yyyymm>`), key-hash → key-record hot-path lookup, magic
  tokens (15 min), sessions (30 d).
- **Auth**: bearer API key per request for data; passwordless magic-link
  (Resend) + session cookie for the /account dashboard. Key creation requires
  a signed-in session (public issuance retired — keys inherit the account's
  plan, so unverified-email issuance was a privilege leak). Quota = plan
  monthly allowance per account (free 250/mo); KV-based best-effort (DO
  upgrade path documented, not built). MCP: anonymous `initialize`/`tools/list`
  so registries/directories can index tools (per-IP rate-limited);
  `tools/call` needs a key; bearer 401s carry `WWW-Authenticate`.
- **Refresh**: Cron Triggers pull sources on schedule, write `refresh_log`;
  responses expose `last_refreshed_at`.

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
- **Data origins** — official Open-Government-Licence APIs only in v1
  (planning.data.gov.uk, Find a Tender OCDS). No scraping.
- **CI/CD** — GitHub Actions: lint/typecheck/test; deploy on main gated on
  `CLOUDFLARE_API_TOKEN` secret existing.

## Compliance & accessibility
- UK GDPR: Blind Mode — personal fields in planning data are dropped at
  ingest, never stored; waitlist stores email only. No purchased lists, no
  cold email in v1.
- Landing/docs: plain fast HTML, core content works without JS.

## Out of scope for v1 (do not scope-creep without re-baselining)
- Council-portal long-tail scraping (Idox/Northgate) and any managed-scraping
  integration
- Regulatory-change/recall feed vertical; spatial search; webhooks
- RapidAPI/Apify/MCP-directory listings (prep doc only)
- Durable-Objects rate limiting; annual-plan automation; programmatic SEO
  pages
- Real niche commitment before Stage 0 validation (build stays pivotable)
