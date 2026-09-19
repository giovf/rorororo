# PRD — Phase 2: Production hardening & platformization

> Appends to the v1 backlog. Goal: take faceless-api from "feature-complete v1,
> live" to a genuinely **production-ready, multi-niche platform** before any
> outreach. Two product decisions are LOCKED (do not re-litigate):
> 1. **Identity = email account + passwordless magic-link login.** API keys are
>    credentials that inherit the account's plan. Adds an email provider (Resend,
>    called via REST/`fetch` — no npm dependency).
> 2. **Billing = shared credits now, per-niche-ready schema.** One subscription
>    spans the whole dataset catalog; schema is keyed by account so we can split
>    into per-niche products later without a rewrite.
>
> Grounding: a read-only audit found the core is already registry-driven and the
> security fundamentals are solid (parameterized SQL, zod everywhere, idempotent
> signed Stripe webhooks, resilient caching, tested revocation). The gaps below
> are specific. File:line references are from that audit.

## Problem statement

Identity is incoherent: usage is metered per-**email**
(`src/metering/counters.ts`, subject set at `src/auth/middleware.ts:66`) but
plan, quota cap, and Stripe billing are attached per-**API-key**
(`src/billing/webhook.ts:54`, `src/routes/billing.ts:42`,
`stripe_customers.key_id` in `migrations/0002_accounts.sql`). Consequences:
losing a key loses the paid plan and stranding the subscription with no
self-serve cancel; a paying customer with two keys gets 402'd on the key they
didn't check out with. There is no login, no account page, and the Stripe
customer portal exists (`src/routes/billing.ts:54`) but is unsurfaced.

## Task 1 — Accounts data model & identity refactor (KEYSTONE)

Introduce an `accounts` table keyed by normalized email as the single identity.
- Migration: `accounts (id, email UNIQUE normalized-lowercase, plan DEFAULT
  'free', created_at)`. Add `account_id` to `api_keys`; re-key `stripe_customers`
  and `credit_ledger` to `account_id`. Backfill accounts from existing
  `api_keys.email` (one account per distinct lowercased email; keys adopt it;
  carry the highest existing plan).
- `requireApiKey` resolves the key → account, and `keyCtx.plan` +
  `usageSubject` both come from the **account** (id), not the key row.
- Metering quota cap (`src/metering/middleware.ts:26`) and the usage counter key
  off the same account id.
- Billing webhook writes plan to the **account**; checkout links the account.
- Local-test with `wrangler d1 migrations apply DB --local`. MUST ask before
  applying `--remote` to production D1.

Acceptance: two keys under one email share one plan + one quota; upgrading via
either applies to the account; revoking one key doesn't touch the other.

## Task 2 — Email layer + magic-link auth + sessions

- `src/email/` sender using Resend REST API via `fetch` (no npm dep). From
  address + domain are env vars (`RESEND_API_KEY`, `EMAIL_FROM`). Dark/no-op
  with a logged warning when `RESEND_API_KEY` is unset (mirrors Turnstile/x402
  "dark until configured").
- Magic-link: `POST /v1/auth/login` (email → short-lived single-use token stored
  in KV, emailed as a link) → `GET /v1/auth/verify?token` → sets a signed,
  httpOnly session cookie. Session lookup middleware for account routes.
- Rate-limit login requests; tokens expire ~15 min, single-use.

Acceptance: entering an email sends a link; clicking it authenticates a session
bound to the account; no password stored anywhere.

## Task 3 — Account page (self-serve dashboard)

- `public/account.html`: passwordless login form; once authed shows usage this
  month (from counters), the account's API keys with create / rotate / revoke,
  current plan, Upgrade buttons, and a "Manage billing" action.
- Replace the "paste your API key to buy" checkout with a **logged-in** upgrade
  (session identifies the account — no key paste).
- Progressive enhancement; account routes are session-gated.

Acceptance: a user can log in, see usage, manage keys, upgrade, and cancel —
entirely self-serve, no support email.

## Task 4 — Billing coherence & portal

- Checkout keyed to the account (`customer_email` / stored `customer`);
  `stripe_customers` unique per account (`migrations` + on-conflict) so
  re-subscribing doesn't mint duplicate customers.
- "Manage billing" → `POST /v1/billing/portal` by account, redirect to Stripe.
- Webhook + portal all resolve by account, not key.

Acceptance: one Stripe customer per account; cancel/downgrade flows through to
the account plan and is reachable from the account page.

## Task 5 — Pluggability polish (true source-file-only niches)

- Derive OpenAPI `info.description` from the registry, not the hardcoded niche
  list (`src/lib/openapi.ts:250`).
- Resolve cron drift: `wrangler.jsonc` cron array vs per-source
  `RefreshPolicy.cron` — standardize or document so a new source always refreshes.
- Move per-niche economics into the `DataSource` contract: `creditCost` (exists,
  unused), x402 price (`src/x402/routes.ts:16` is global), rate limit
  (`src/index.ts:34` is global) — resolved per source.
- Registry-derive the landing dataset cards, `public/llms.txt`, and
  `public/docs.html` examples (or template them) so a new niche appears without
  hand-editing and a rename can't break live examples.

Acceptance: adding a niche is a new `src/sources/<slug>.ts` + registry line, with
no edits to routes, OpenAPI, MCP, landing, or docs to make it fully live.

## Task 6 — Reliability & ops hardening

- `/v1/health` reflects data freshness (newest `refresh_log` / `last_refreshed_at`),
  not just liveness; add an error-rate/5xx alert path.
- Harden `lookupKey` (`src/auth/middleware.ts:23`) against a D1 blip on cache
  miss (guarded fallback / short in-isolate cache) so cold-key auth doesn't 500.
- Constant-time admin token compare (`src/routes/keys.ts:95`); normalize email
  at storage so casing variants don't split identity.

Acceptance: a silently-failing refresh is visible via health/alert; a brief D1
hiccup doesn't 500 the whole API.

## Task 7 — Money-path & identity test coverage

Add tests for the currently-untested critical paths: x402 verify+settle happy
path (mocked facilitator), metering month-rollover reset, entitlement coherence
(paid plan applies to a second key under the same email), magic-link issue/verify
+ session, and portal-by-account.

## Task 8 — Custom domain & platform/niche branding

- Make `API_BASE_URL` (`src/lib/constants.ts:8`) env-driven; wire a custom domain
  (needs operator to provide one) across OpenAPI server URL, Stripe redirect
  URLs, and error `docs_url`.
- Separate "faceless" (platform) branding from per-niche presentation so the
  catalog can grow.

## Non-goals (this phase)

Durable-Objects rate limiting (KV best-effort stays; documented), per-niche
separate Stripe products (schema-ready only), programmatic SEO, marketplace
listings, and any second niche's actual data source (platform readiness only).
