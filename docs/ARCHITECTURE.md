# Foundry — Architecture

> Derived from `.taskmaster/docs/prd.md`. This file holds the *stable*
> architectural decisions and is loaded into every Claude session via
> CLAUDE.md. When the PRD changes, update **this** file — not `CLAUDE.md`.
> Volatile detail (full data model, phasing, open questions) stays in the PRD;
> this is the always-loaded summary.

## What we're building
A portfolio of small, self-funding digital products ("ventures") built and operated
by Claude Code for a single UK-based owner whose only brief is *make money, legally*
with at most £100 of capital. Ventures sell through channels that supply their own
distribution — Figma Community, Chrome Web Store, merchant-of-record storefronts —
so no marketing budget or human sales effort is needed. Each venture: < £10 to
launch, ~zero infrastructure cost, cheap to kill. Several small shots on goal.

Venture lifecycle: `idea → validated → building → launched → earning | killed`.
A venture is only built after a **validation gate**: buyers with money, recurring
job, a paid competitor with a documented gap, ≤ 1 week to build, no policy/ToS risk.

## Repo layout
```
packages/core        venture manifest types + defineVenture() validation
packages/licensing   license-key verification shared by paid products (planned)
packages/telemetry   opt-in funnel event counting (planned)
packages/landing     Astro landing-page template (planned)
ventures/<slug>/     one workspace per product: venture.json, RESEARCH.md, src/
docs/LEDGER.md       every pound in and out, per venture (planned)
docs/launch/         per-channel launch checklists (planned)
scripts/             portfolio listing, ledger checks (planned)
src/ environment/ data/   legacy Python prior art — reference only
```

## Stack
TypeScript 6 strict / NodeNext ESM, Node 22, npm workspaces, ESLint 10 + Prettier
+ Vitest. Per venture: WXT (extensions), Figma plugin API (plugins), Astro
(landing), Hono (small APIs). Static hosting only (Cloudflare Pages / GitHub Pages).

## Backend & data
No servers in v1. The only backend is a free-tier Cloudflare Worker collecting
anonymous telemetry counts `{venture, event, day}`. Persistent data: venture
manifests (in repo), the ledger (in repo), license keys (issued and stored by the
merchant of record). No user PII is stored anywhere we control.

## External services
- **Figma Community payments** — V1 plugin sales; Figma handles tax (15% fee).
- **Merchant of record** for Chrome/web products — Lemon Squeezy (waitlist as of
  Sept 2026), fallback Paddle or Dodo Payments; handles VAT. ExtensionPay only as a
  last resort (leaves VAT on the seller).
- **Chrome Web Store** developer account ($5 one-off, 20 extensions).
- **Cloudflare** free tier (Pages + Workers). One domain (≤ £10).
Owner performs account creation; keys go in `.env` (see `.env.example`).

## Compliance & accessibility
- UK sole-trader rules: £1,000 trading allowance; owner registers for Self
  Assessment once gross income exceeds the threshold. Ledger makes this visible.
- Consumer digital-content rules: clear refund policy on every listing.
- Store policies: minimal permissions, disclosed data use, no scraping of sites
  that forbid it, no restricted OAuth scopes, no ad injection.
- Accessibility: products follow the frontend-design plugin's conventions;
  keyboard-operable UIs; contrast-checked palettes.

## Out of scope for v1 (do not scope-creep without re-baselining)
- Crypto/algorithmic trading (rejected: fees exceed edge at £100 capital).
- Google Play / App Store apps (tester and fee hurdles).
- Paid infrastructure, paid ads, paid marketing of any kind.
- RapidAPI / VS Code paid extensions (parked — weak economics).
- Bug-bounty income line (parked until the product pipeline runs).
