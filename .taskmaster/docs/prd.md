<context>
# Overview

**Foundry** is a portfolio of small, self-funding digital products ("ventures") built,
launched and operated by Claude Code on behalf of a single owner. The owner's brief is one
line: *make money, legally*. The owner is UK tax-resident, will fund **at most £100** in
total, and has delegated every product and strategy decision. The owner is only asked to act
when an action needs their legal identity or wallet (creating store/payment accounts, paying a
registration fee, buying a domain).

The chosen route is products sold through **channels that supply their own distribution**
— the Chrome Web Store, the Figma Community, and merchant-of-record storefronts — because
that is the only way to reach paying users with no marketing budget and no human sales
effort. Each venture must be launchable for under £10, run with near-zero infrastructure
cost, and be cheap to kill. Several small shots on goal beat one big bet.

Crypto trading (the repo's prior-art code in `src/` and `environment/`) was evaluated and
rejected: at £100, exchange fees exceed any plausible edge. That code stays as reference only.

# Core Features

## 1. The Engine (shared infrastructure)

- **Monorepo** — npm workspaces, TypeScript strict, ESLint + Prettier + Vitest, one
  `npm run check` gate. `packages/*` hold shared code; `ventures/<slug>/` hold products.
- **Venture manifest** — every venture ships a `venture.json` validated by
  `@foundry/core`'s `defineVenture()` (slug, channel, status, pricing, thesis). A single
  script lists the portfolio and its status.
- **Licensing** — `@foundry/licensing`: verify a license key offline-first (signed key
  format) with an online check against the merchant-of-record's license API; shared by
  extensions, plugins and web tools so paywalls are one implementation.
- **Telemetry** — `@foundry/telemetry`: privacy-safe, opt-in event counting (installs,
  activations, paywall views, upgrades) posted to a free-tier endpoint, so every venture
  reports the same funnel. No PII, no third-party trackers, honest privacy policy.
- **Landing page kit** — an Astro template (static, free hosting on Cloudflare Pages or
  GitHub Pages) with a product page, pricing, privacy policy and terms generated from the
  manifest. Required for merchant-of-record approval and store listings.
- **Launch checklist** — a markdown checklist per channel (store assets, listing copy,
  screenshots, privacy disclosures, permissions justification) executed before every
  submission.
- **Portfolio ledger** — `docs/LEDGER.md`: every pound spent, every pound earned, per
  venture, with dates. This is the source of truth for "are we making money".

## 2. The Venture Pipeline (how products get chosen)

A venture moves `idea → validated → building → launched → earning | killed`.

- **Discovery** — for a channel, gather evidence of paid demand: existing paid products
  with many users, their ratings, their review complaints (a gap), and search volume for the
  job-to-be-done. Sources: store listings, community posts, competitor changelogs.
- **Validation gate** — a venture is `validated` only when its `RESEARCH.md` shows: (a)
  buyers are professionals or sellers with money; (b) the job recurs; (c) at least one paid
  competitor exists (proof of willingness to pay) with a documented gap; (d) buildable in
  ≤ 1 week; (e) no store-policy or third-party-ToS risk (no scraping sites that forbid it,
  no restricted OAuth scopes, no ad injection).
- **Build** — smallest version that delivers the paid outcome, with a free tier whose limit
  sits just below a power user's session (the documented conversion lever).
- **Launch** — checklist, submission, listing. Owner performs the identity-bound steps once
  per channel.
- **Measure & decide** — 30 and 60 days after launch, review funnel and revenue; iterate,
  hold, or kill. Killed ventures keep their record in the ledger.

## 3. Ventures (initial slots)

Slots are ordered by expected time-to-first-sale and legal simplicity. The exact product in
each slot is decided by the Discovery task for that slot — provisional ideas below are
starting points, not commitments.

- **V1 — Figma Community plugin (paid, one-time or subscription).** Figma handles payments
  and tax natively (15% fee), designers routinely pay for plugins, the audience is
  professional, plugins are TypeScript, and there is no hosting. Provisional directions:
  accessibility/contrast audits, localisation or copy tooling, data population, export
  automation.
- **V2 — Chrome extension (freemium).** $5 one-off developer fee covers 20 extensions.
  Provisional directions from the research: e-commerce seller utilities, information
  extraction/export for platforms **with official APIs**, BYO-API-key AI helpers (zero
  serving cost). Paywall via a merchant-of-record license key.
- **V3 — Web micro-tool with merchant-of-record checkout.** A single-purpose web tool
  (Astro/Hono on a free tier) sold via Lemon Squeezy / Paddle / Dodo Payments so VAT is
  handled for us. Candidate: the same core as V1 or V2 repackaged for non-Figma / non-Chrome
  users, which reuses the build.
- **V4+ — Repeat the pipeline** into the best-performing channel.

# User Experience

**Personas**
- *Buyer* — a professional (designer, online seller, marketer, developer) who hits a
  repetitive task inside a tool they already use and will pay a few pounds to remove it.
- *Operator* — Claude Code, running the pipeline session by session from the Taskmaster
  backlog.
- *Owner* — the human; performs identity-bound actions, reads the ledger, may stop anything.

**Key flows**
- Buyer: finds the product by searching the store → installs free tier → hits the limit
  while doing real work → sees a value-framed upgrade prompt → pays inside the store (Figma)
  or via a merchant-of-record checkout and pastes a license key (Chrome/web) → unlocked.
- Operator: `task-master next` → implement → `npm run check` → update ledger/manifest →
  mark done. Owner-action items are batched into one request per channel.
- Owner: receives a short list (create account X, pay £Y) → does it → shares the resulting
  keys via `.env` → nothing else.

**UI/UX** — every product uses the frontend-design plugin's conventions; upgrade prompts
say what the user gains, never what is blocked; all copy is plain English; privacy and
permission use are disclosed on the listing.
</context>
<PRD>
# Technical Architecture

**Repo layout**
```
packages/core         venture manifest types + validation (exists)
packages/licensing    license-key verification shared by all paid products
packages/telemetry    opt-in funnel events
packages/landing      Astro landing-page template
ventures/<slug>/      one workspace per product (venture.json, RESEARCH.md, src/)
docs/LEDGER.md        money in / money out
docs/launch/          per-channel launch checklists
scripts/              portfolio listing, ledger checks
```

**Stack** — Node 22, TypeScript strict (NodeNext), npm workspaces, ESLint (typed rules) +
Prettier, Vitest. Per-venture frameworks: WXT for browser extensions; Figma plugin API
(`@figma/plugin-typings`, esbuild) for V1; Astro for landing pages; Hono for any small API.
No runtime dependency is added without a note in the venture's `RESEARCH.md`.

**Payments & licensing** — Figma Community payments for Figma plugins (native, tax handled).
For everything else a merchant of record: **Stripe Managed Payments** (decided 2026-09-18
after Lemon Squeezy's sign-up redirected the UK owner to it; ≈ 3.5% MoR fee on top of
Stripe processing; handles VAT, invoicing, refunds). License keys are ours: signed Ed25519
keys issued on `checkout.session.completed` and verified by `@foundry/licensing` with a
cached grace period so products keep working offline.
ExtensionPay is a fallback only, because it leaves VAT on the seller.

**Telemetry** — Cloudflare Workers free tier (or equivalent) receiving `{venture, event,
day}` counts; no user identifiers. Dashboards are a script over the stored counts.

**Hosting** — static only (Cloudflare Pages / GitHub Pages). No paid infrastructure in v1.

**Secrets** — `.env` (gitignored) holds merchant-of-record API keys, telemetry write key,
store publishing tokens. `.env.example` documents each.

**Data model** — `VentureManifest` (see `packages/core`), `LicenseKey { venture, keyHash,
validUntil, tier }`, `TelemetryEvent { venture, event, day, count }`, ledger rows
`{ date, venture, kind: 'cost' | 'revenue', gbp, note }`.

# Development Roadmap

## Phase 0 — Engine
- Scaffold complete (done): monorepo, strict TS, lint/format/test, `@foundry/core`.
- `scripts/portfolio.ts`: prints every venture's manifest and status; fails on invalid
  manifests. Wired into `npm run check`.
- `docs/LEDGER.md` with schema + `scripts/ledger-check.ts` validating it.
- `packages/licensing`: key format, offline verification, online verification adapter
  interface with a Lemon Squeezy implementation and an in-memory fake for tests.
- `packages/telemetry`: client (batched, opt-in) + Cloudflare Worker collector.
- `packages/landing`: Astro template rendering product/pricing/privacy/terms from a
  manifest; deploy script to Cloudflare Pages.
- `docs/launch/figma.md`, `docs/launch/chrome.md`, `docs/launch/web.md` checklists.
- Owner-action request #1 (batched): Figma account + Community payments setup; Chrome Web
  Store developer registration ($5); merchant-of-record application; one domain (≤ £10).

## Phase 1 — V1 Figma plugin
- Discovery: survey paid Figma plugins (installs, ratings, price, review complaints), write
  `ventures/variables-toolkit/RESEARCH.md` (done 2026-09-18: product = Variables Toolkit),
  pick the product against the validation gate.
- Build: plugin UI + core logic, free tier limit, paid unlock via Figma payments API,
  unit tests on the core logic.
- Listing: icon, cover, copy, screenshots; submit for Figma review.
- Measure: telemetry funnel; 30-day review.

## Phase 2 — V2 Chrome extension
- Discovery as above for the Chrome Web Store; product chosen against the gate, with an
  explicit policy/ToS check.
- Build with WXT; paywall via `@foundry/licensing`; landing page from the kit.
- Listing + submission; measure.

## Phase 3 — V3 web micro-tool
- Repackage the strongest core from V1/V2 (or a new validated idea) as a standalone web
  tool with merchant-of-record checkout.

## Phase 4 — Operate
- 30/60-day reviews per venture; kill or iterate; pick the next slot's channel from ledger
  data. Add a scheduled routine so reviews happen without the owner.

# Logical Dependency Chain
1. Engine basics (portfolio script, ledger) — everything reports through them.
2. Owner-action request #1 — accounts take days to approve; request early, build meanwhile.
3. V1 discovery → V1 build (Figma needs no licensing package; it can ship first).
4. `packages/licensing` + `packages/landing` — needed by V2/V3, built while V1 is in review.
5. V2 discovery → V2 build → launch.
6. Telemetry collector before V2 launch (V1 can use Figma's own install stats initially).
7. V3, then Phase 4 operations.

# Risks and Mitigations
- **Nothing sells.** Documented base rate: portfolios of thin extensions earn ~$30/month;
  focused products with a real gap earn $100–$3,000/month. Mitigation: the validation gate
  is mandatory; no venture is built on a hunch.
- **Store rejection / policy change.** Mitigation: checklists, minimal permissions,
  no ToS-violating scraping, no restricted OAuth scopes.
- **Merchant-of-record onboarding delays** (Lemon Squeezy waitlist). Mitigation: V1 uses
  Figma's native payments; Paddle/Dodo as fallbacks; request accounts in Phase 0.
- **Capital cap (£100).** Budget: Chrome $5, domain ≤ £10, everything else free tiers.
  Ledger check fails the build if planned spend exceeds £100.
- **Tax/legal (UK).** £1,000 trading allowance; owner must register for Self Assessment once
  gross income exceeds it (threshold rises to £3,000 from 2027/28, allowance unchanged).
  Consumer digital-content rules apply; refund policy on every listing. VAT handled by the
  merchant of record / Figma.
- **Operator continuity.** Sessions end. All state lives in Taskmaster, manifests and the
  ledger; a scheduled routine runs periodic reviews.

# Open questions
- Which merchant of record accepts the owner fastest (Lemon Squeezy waitlist vs Paddle vs
  Dodo)? Decided when accounts are requested.
- Whether Google Play is worth the personal-account 12-tester/14-day hurdle — parked.
- Bug-bounty programs as a zero-capital income line — legal and plausible but skill- and
  time-intensive; parked until the product pipeline is running.

# Appendix — research (Sept 2026)
- Chrome Web Store: $5 one-off, 20 extensions per account; Google has no native payments;
  ExtensionPay 5% flat (Stripe-based, seller handles VAT). Benchmarks: $100–$500/mo at
  1–5k active users with a paywall; freemium conversion 0.8–5%; one dev's 38-extension
  portfolio: $31 MRR — breadth without a niche does not pay.
- Figma Community: native payments, 15% fee, one-time or subscription, UK supported.
- Merchant of record: Lemon Squeezy / Paddle 5% + $0.50 (LS +1.5% international, 1%
  non-US payout); Gumroad 10% + $0.50 and no longer handles EU VAT for most creators.
- RapidAPI: 25% fee; AI-augmented APIs the growing category — parked, needs serving cost.
- VS Code Marketplace: no native paid extensions; license-key model; most earn < $100/mo —
  parked.
- Google Play: $25 one-off; personal accounts need 12 testers for 14 days per app — parked.
- UK trading allowance £1,000 (2026/27); SA registration threshold £3,000 from 2027/28.
</PRD>
