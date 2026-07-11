# Marketplace listing prep (documentation only — do not list yet)

Listings happen **after** Stage 0 niche validation (out of v1 scope, per the
PRD). This maps what each channel needs to what already exists, so listing day
is copy-paste, not engineering.

> See `AGENT-DISCOVERY.md` (2026-07-09) for the wider agent-discovery
> landscape: official MCP Registry publish flow, x402 Bazaar auto-cataloging,
> Claude Connectors Directory requirements, and the code-side gaps
> (Taskmaster 26–28).

## RapidAPI

| They need                | We have                                                        |
| ------------------------ | -------------------------------------------------------------- |
| OpenAPI import           | `/openapi.json` (3.1; RapidAPI may want 3.0 — downconvert then) |
| Auth model               | Header `Authorization: Bearer <key>` (they proxy their own keys → create one `rapidapi@` key per plan, or keep direct keys and use their "external" billing mode) |
| Pricing tiers            | Free 250/mo; grep £5/1k, cron £23/5k, daemon £79/20k, kernel £239/100k (slugs: saver/starter/growth/scale) — mirrors `src/billing/plans.json` |
| Base URL                 | `https://gankdat.com`                                          |
| Description/assets       | reuse landing copy + `llms.txt` summary                        |

Caveat: RapidAPI proxies requests and takes ~20–25% — per the blueprint, use
it for discovery and steer volume users to direct billing.

## Apify Store

Apify wants an Actor, not an API. Thinnest viable wrapper: an Actor whose
input schema mirrors a source's `queryParams` and calls `/v1/data/:source`,
charging per-result ("pay per event"). Defer building until validation says
this channel matters.

## Official MCP Registry (registry.modelcontextprotocol.io)

**PUBLISHED 2026-07-09**: `com.gankdat/gankdat` v0.1.0, status `active`
(operator-executed via `mcp-publisher login http` + `publish`; binary at
`~/.local/bin/mcp-publisher`). Re-publish after any preview-period data
reset, and bump `server.json` `version` alongside APP_VERSION.

Prep artifacts (task 28, 2026-07-09):

- `server.json` at the repo root — name `com.gankdat/gankdat`, remote
  streamable-http `https://gankdat.com/mcp`, Authorization header declared
  `isRequired`+`isSecret`. Validates against the 2025-12-11 schema.
- Domain proof served at `https://gankdat.com/.well-known/mcp-registry-auth`
  (Ed25519, verified served by Workers Assets).
- **Private signing key**: `mcp-registry-key.pem` at the repo root,
  gitignored. Copy it to the password manager — if this devcontainer is
  wiped, regenerate the pair and redeploy the proof file before publishing.

Publish day (operator executes — external submission, ask-first):

```bash
# install: brew install mcp-publisher, or a release binary from
# github.com/modelcontextprotocol/registry
PRIVATE_KEY="$(openssl pkey -in mcp-registry-key.pem -noout -text | grep -A3 'priv:' | tail -n +2 | tr -d ' :\n')"
mcp-publisher login http --domain gankdat.com --private-key "${PRIVATE_KEY}"
mcp-publisher publish   # reads ./server.json
```

Notes: registry is in preview (data resets possible — just re-publish); bump
`server.json` `version` alongside APP_VERSION; aggregators syndicate from
this registry, so publish here first.

## MCP directories (PulseMCP, Glama, Smithery, etc.)

- Endpoint: `https://gankdat.com/mcp` (Streamable HTTP), bearer key for
  tools/call; `initialize`/`tools/list` are anonymous since task 26, so
  directory crawlers can index the tools without a key.
- Server name `gankdat`; tools: `list_sources`, `get_usage`,
  `query_uk_planning`, `query_uk_tenders`.
- Most directories syndicate from the official registry (publish there
  first, then claim the listing); Glama also takes a GitHub repo link — the
  repo is private until the operator publishes it (their call).

### Submission form contents (copy-paste, prepped 2026-07-10)

Reusable blurbs for any directory form:

- **Name**: gankdat
- **Tagline** (short): UK tenders & planning applications as clean JSON —
  REST + MCP + x402.
- **Description** (long): gankdat serves UK public-sector data from official
  government feeds (Find a Tender OCDS procurement notices;
  planning.data.gov.uk planning applications), normalized to one clean JSON
  schema. Native MCP server for AI agents, plus x402 USDC pay-per-request on
  Base — no signup needed for agents that can pay per call. Free tier: 250
  requests/month. Licence and personal-data posture stated per dataset in the
  terms (current datasets: OGL v3, Blind Mode — personal data dropped at ingest).
- **Endpoint**: `https://gankdat.com/mcp` (Streamable HTTP, MCP 2025-06-18)
- **Auth**: `Authorization: Bearer <api key>` for tools/call (free key at
  https://gankdat.com/account); `initialize`/`tools/list` need no key.
- **Tools**:
  - `list_sources` — datasets with filter params + credit cost (free)
  - `get_usage` — plan, credits used/remaining (free)
  - `query_uk_tenders` — Find a Tender OCDS notices; filter by buyer, CPV,
    status, value, dates, full-text `q` (1 credit)
  - `query_uk_planning` — planning applications; filter by authority,
    reference, decision dates, full-text `q` (1 credit)
- **Official registry**: `com.gankdat/gankdat` (published 2026-07-09)
- **Links**: site https://gankdat.com · docs https://gankdat.com/docs ·
  OpenAPI https://gankdat.com/openapi.json · llms.txt
  https://gankdat.com/llms.txt · icon https://gankdat.com/icon-raccoon.svg
- **Pricing**: free 250/mo; grep £5/1k · cron £23/5k · daemon £79/20k ·
  kernel £239/100k; x402 ~$0.005/request.
- **Categories/tags**: data · government · open-data · uk · procurement ·
  tenders · planning · property

Channel-specific notes:

- **PulseMCP** (https://www.pulsemcp.com/submit): form takes name, endpoint,
  description, links — everything above; no repo needed. Classification:
  "official provider", remote.
- **Glama** (https://glama.ai): richest listings come from a public GitHub
  repo, which is still the operator's call; without it, submit the remote
  endpoint + blurbs and claim the listing when registry syndication lands.
- **Smithery** (`smithery mcp publish https://gankdat.com/mcp -n gankdat/gankdat`):
  CLI publish under an operator Smithery account.

## x402 discovery

- The 402 payment-requirements body already marks the resource
  `discoverable: true`; x402 index sites (e.g. x402scan) pick services up from
  on-chain settlement activity once real payments flow.

## Pre-listing checklist (all blocked on launch config, none on code)

- [x] Domain purchased and Worker routed — gankdat.com (2026-07-08)
- [x] Stripe live mode + real prices (2026-07-09)
- [ ] `FIXTURE_FALLBACK=false` in production
- [ ] UptimeRobot monitor green for 2+ weeks (runbook)
- [ ] Stage 0 validation threshold met (20+ signups or 5 pre-commits)
