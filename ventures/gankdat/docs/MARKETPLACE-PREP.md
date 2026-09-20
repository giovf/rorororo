# Marketplace & directory listings

**Status (2026-09-20):** listing is ON. The Stage 0 gate that used to block this was
retired on 2026-07-11; Foundry adopted the venture on 2026-09-19 and the owner approved
directory sign-ins on 2026-09-20 (Foundry action 010 item 4). This file is the single
place for what is listed where, what each channel needs, and the copy-paste blurbs.

> Wider landscape (how agents find tools, registry/x402/Connectors mechanics):
> `AGENT-DISCOVERY.md` (2026-07-09).

## Listings log

| Channel | Status | Where |
| --- | --- | --- |
| Official MCP Registry | **live, v0.6.2** (re-published 2026-09-20; was 0.1.0 with a two-dataset description) | `com.gankdat/gankdat` — registry.modelcontextprotocol.io |
| PulseMCP | submissions paused on their side; they index the official registry automatically | — |
| public-apis/public-apis | PR open (Government section), 2026-09-20 | https://github.com/public-apis/public-apis/pull/7436 |
| APIs.guru OpenAPI directory | issue open (their documented add-API flow), 2026-09-20 | https://github.com/APIs-guru/openapi-directory/issues/3384 |
| punkpeye/awesome-remote-mcp-servers | PR open (Search & Data Extraction), 2026-09-20 | https://github.com/punkpeye/awesome-remote-mcp-servers/pull/460 |
| punkpeye/awesome-mcp-servers | not eligible — self-hosted open-source servers only | — |
| wong2/awesome-mcp-servers | no PRs accepted; web form at mcpservers.org/submit (needs the owner's browser) | Foundry action 010 §4 |
| Glama | claim challenges served 2026-09-20 (`/.well-known/glama.json` + `_glama-claim` TXT); claimed by the owner 2026-09-20; health check uses a free-tier test key (`glama-health-check`, account info@gankdat.com, key id 1472c087…, emailed to the owner for Glama's test profile) | https://glama.ai/mcp/connectors/com.gankdat/gankdat |
| Smithery | not listed; CLI publish needs a Smithery account (owner) | — |
| Google Search Console | domain verified 2026-09-20 (owner, DNS TXT); sitemap `https://gankdat.com/sitemap.xml` to submit once | search.google.com/search-console |
| x402 Bazaar (CDP discovery) | 402 bodies already carry `discoverable: true`; the catalogue lists services once real settlements occur (only 2 test payments so far) | https://api.cdp.coinbase.com/platform/v2/x402/discovery/resources |
| RapidAPI, Apify | parked (see below) | — |

## Official MCP Registry

- `server.json` at the venture root — `com.gankdat/gankdat`, remote streamable-http
  `https://gankdat.com/mcp`, Authorization header `isRequired`+`isSecret`. Bump its
  `version` together with `APP_VERSION` (`src/lib/constants.ts`) on every release,
  then re-publish.
- Domain proof: `https://gankdat.com/.well-known/mcp-registry-auth` (Ed25519, Workers
  Assets). Private key: `mcp-registry-key.pem` at the venture root, gitignored — if it
  is lost, regenerate the pair and redeploy the proof file before publishing.
- Publish (no browser, no account — domain-key auth; ~10 s):

```bash
cd ventures/gankdat
PRIVATE_KEY="$(openssl pkey -in mcp-registry-key.pem -noout -text | awk '/priv:/{f=1;next} f&&/pub:/{exit} f{gsub(/[: ]/,"");printf "%s",$0}')"
mcp-publisher login http --domain gankdat.com --private-key "${PRIVATE_KEY}"
mcp-publisher publish   # reads ./server.json
```

`mcp-publisher` is a release binary from github.com/modelcontextprotocol/registry
(linux_amd64 tarball; not in the repo).

## Copy-paste blurbs for any directory form (current, 2026-09-20)

- **Name**: gankdat
- **Tagline**: UK & EU tenders, UK planning, UK sanctions, US exclusions, UK insolvency
  and company data as clean JSON — REST + MCP + x402.
- **Description**: gankdat serves seven official government open-data feeds as one clean,
  filterable JSON schema: UK procurement notices (Find a Tender), EU procurement notices
  (TED), UK planning applications (planning.data.gov.uk), the UK Sanctions List (FCDO),
  US federal exclusions (SAM.gov), UK corporate insolvency notices (The Gazette) and new UK
  company incorporations (Companies House). Native MCP server for AI agents, plus x402
  USDC pay-per-request on Base for agents with no account. Free tier: 250 requests/month.
  Licence and personal-data posture stated per dataset in the terms; personal fields are
  dropped at ingest. Source code is not open source.
- **Endpoint**: `https://gankdat.com/mcp` (Streamable HTTP). `initialize` and
  `tools/list` are anonymous; `tools/call` needs `Authorization: Bearer <api key>`
  (free key at https://gankdat.com/account).
- **Tools** (9): `list_sources`, `get_usage` (free); `query_uk_tenders`, `query_eu_ted`,
  `query_uk_planning`, `query_uk_sanctions`, `query_sam_exclusions`,
  `query_uk_insolvency`, `query_uk_companies` (1 credit each; filters per dataset, plus
  full-text `q`).
- **Official registry name**: `com.gankdat/gankdat`
- **Links**: site https://gankdat.com · docs https://gankdat.com/docs · OpenAPI 3.1
  https://gankdat.com/openapi.json · llms.txt https://gankdat.com/llms.txt · icon
  https://gankdat.com/icon-raccoon.svg (SVG) / https://gankdat.com/favicon.png
- **Pricing**: free 250/mo; grep £5/1k · cron £23/5k · daemon £79/20k · kernel £239/100k
  (slugs saver/starter/growth/scale, `src/billing/plans.json`); x402 US$0.005/request.
- **Contact**: info@gankdat.com
- **Categories/tags**: data · government · open-data · uk · eu · procurement · tenders ·
  planning · sanctions · compliance · kyb

## Parked channels

- **RapidAPI** — imports `/openapi.json` (may want 3.0; downconvert then); proxies with
  its own keys and takes ~20–25%. Use only for discovery if ever; steer volume users to
  direct billing. Needs an owner account.
- **Apify Store** — wants an Actor, not an API: a thin wrapper whose input mirrors a
  source's `queryParams` and calls `/v1/data/:source`, charged per result. Build only if a
  signal says this channel matters.

## Pre-listing checklist

- [x] Domain and Worker routed — gankdat.com (2026-07-08)
- [x] Stripe live mode + real prices (2026-07-09)
- [x] `FIXTURE_FALLBACK=false` in production (`wrangler.jsonc` vars)
- [x] All seven datasets refreshing daily (sam-exclusions fixed 2026-09-20)
- [ ] External uptime monitor (runbook suggests UptimeRobot; not confirmed set up — the
      Foundry daily routine checks `/v1/health` instead)
- [x] Stage 0 gate — retired 2026-07-11 (signal comes from shipped-product metrics)
