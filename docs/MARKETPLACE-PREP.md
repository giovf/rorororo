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
| Pricing tiers            | Free 250/mo; saver £5/1k, starter £23/5k, growth £79/20k, scale £239/100k — mirrors `src/billing/plans.json` |
| Base URL                 | `https://gankdat.com`                                          |
| Description/assets       | reuse landing copy + `llms.txt` summary                        |

Caveat: RapidAPI proxies requests and takes ~20–25% — per the blueprint, use
it for discovery and steer volume users to direct billing.

## Apify Store

Apify wants an Actor, not an API. Thinnest viable wrapper: an Actor whose
input schema mirrors a source's `queryParams` and calls `/v1/data/:source`,
charging per-result ("pay per event"). Defer building until validation says
this channel matters.

## MCP directories (PulseMCP, Glama, Smithery, etc.)

- Endpoint: `https://<domain>/mcp` (Streamable HTTP), auth = bearer key.
- Server name `gankdat`; tools: `list_sources`, `get_usage`,
  `query_uk_planning`, `query_uk_tenders`.
- Most directories want a GitHub repo link + README — the repo is private
  until the operator publishes it (their call).

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
