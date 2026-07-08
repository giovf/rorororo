# Marketplace listing prep (documentation only — do not list yet)

Listings happen **after** Stage 0 niche validation (out of v1 scope, per the
PRD). This maps what each channel needs to what already exists, so listing day
is copy-paste, not engineering.

## RapidAPI

| They need                | We have                                                        |
| ------------------------ | -------------------------------------------------------------- |
| OpenAPI import           | `/openapi.json` (3.1; RapidAPI may want 3.0 — downconvert then) |
| Auth model               | Header `Authorization: Bearer <key>` (they proxy their own keys → create one `rapidapi@` key per plan, or keep direct keys and use their "external" billing mode) |
| Pricing tiers            | Free 250/mo, $29/$99/$299 — mirrors `src/billing/plans.ts`     |
| Base URL                 | production Workers URL (domain pending, open question #3)      |
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

- [ ] Domain purchased and Worker routed (open question #3)
- [ ] Stripe live mode + real prices (ask-first)
- [ ] `FIXTURE_FALLBACK=false` in production
- [ ] UptimeRobot monitor green for 2+ weeks (runbook)
- [ ] Stage 0 validation threshold met (20+ signups or 5 pre-commits)
