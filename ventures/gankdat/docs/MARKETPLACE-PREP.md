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
| Official MCP Registry | **live, v0.10.0** (re-published 2026-09-20 with uk-food-hygiene, uk-sponsors, uk-charities and uk-care-locations; was 0.1.0 with a two-dataset description) | `com.gankdat/gankdat` — registry.modelcontextprotocol.io |
| PulseMCP | submissions paused on their side; they index the official registry automatically | — |
| public-apis/public-apis | PR open (Government section), 2026-09-20 | https://github.com/public-apis/public-apis/pull/7436 |
| APIs.guru OpenAPI directory | issue open (their documented add-API flow), 2026-09-20 | https://github.com/APIs-guru/openapi-directory/issues/3384 |
| punkpeye/awesome-remote-mcp-servers | **merged and live 2026-09-23** (Search & Data Extraction; PR #460 merged 02:21 UTC) | https://github.com/punkpeye/awesome-remote-mcp-servers |
| punkpeye/awesome-mcp-servers | not eligible — self-hosted open-source servers only | — |
| mcpservers.org (wong2) | **approved and live 2026-09-21** (owner submitted the form) | https://mcpservers.org |
| Glama | claim challenges served 2026-09-20 (`/.well-known/glama.json` + `_glama-claim` TXT); claimed by the owner 2026-09-20; health check uses a free-tier test key (`glama-health-check`, account info@gankdat.com, key id 1472c087…, emailed to the owner for Glama's test profile) | https://glama.ai/mcp/connectors/com.gankdat/gankdat |
| Smithery | not listed; CLI publish needs a Smithery account (owner) | — |
| Google Search Console | domain verified 2026-09-20 (owner, DNS TXT); sitemap `https://gankdat.com/sitemap.xml` to submit once | search.google.com/search-console |
| x402 Bazaar (CDP discovery) | **v2 lane with Bazaar metadata built 2026-10-14** (v0.25.0: `@x402/hono`, an `extensions.bazaar` declaration per route from the registry's zod schemas, `src/x402/bazaar.ts`); the v1 lane's `discoverable: true` was never enough — the catalogue indexes v2 resources after one settled payment through the CDP facilitator. First settled call 2026-10-16 (action 026 option B); **week-1 read 2026-10-23: 1 of 17 listed (uk-tenders, the only route ever paid)** — CDP indexes one resource per settled payment and drops it 30 days after the last one (seller docs), so the metrics job's probe now pays every unlisted or 23-day-stale route (≤ 20 half-cents / 30 d); the 10-23 forced round found 13 routes rejecting every payment (description > 500 chars, CDP's facilitator limit) — fixed in v0.25.3, the calls re-sent after the deploy; uk-planning stays unlisted while paused (503, no 402); the metrics runner validates every route daily (`x402 validate:`), the indexed count is read by `metrics-bazaar-merchant-read` (`bazaar:` clause), day-30 read 2026-11-14 | https://api.cdp.coinbase.com/platform/v2/x402/discovery/resources **10-24: `bazaar: 16 listed, 22 calls/30d, 19 payers` — every route but the paused uk-planning; the week-1 proof is closed (RESEARCH.md, Build 2026-10-24).** |
| Apify Store | **all 17 actors public since 2026-09-28** (pay-per-result, 80/20; the block was a 5-publications-per-24h limit, now respected by the daily publish job). First run reading 2026-10-01: ~11 runs/day across the 17, paid share not yet separated (`metrics-apify-paid-runs`). **uk-planning-applications paused 2026-10-19** (origin empty since 10-10; QA flagged it under maintenance 10-17): still public, README opens with a dated Paused line, a run ends cleanly with the notice and no charge; resumes by itself when planning.data.gov.uk republishes | https://apify.com/faceless-api |
| Claude Connectors Directory | **built 2026-09-30** (v0.20.0 annotations, Origin 403, keyless preview, `test/mcp-directory.spec.ts`), **submitted by the owner 2026-10-04** (OUTSTANDING E1 closed; OAuth connect verified end to end the same day, `oauth 7d by client: claude.ai 1`), **in review** — no directory mail by 2026-10-11 (review W41); day-30 read queued for 2026-10-30 | https://claude.ai/directory/manage |
| Docker MCP Catalog | **entry built and validated 2026-10-10** (`docs/docker-mcp-catalog/`: `type: remote`, keyless preview + optional `gankdat.api_key` secret, no OAuth block yet — the Toolkit signs in by RFC 7591 dynamic client registration, which the Worker offers since v0.23.0 (2026-10-10 burn-down, `POST /register`); once this entry is listed, a second PR adds `oauth: [{provider: gankdat, secret: gankdat.personal_access_token, env: GANKDAT_PERSONAL_ACCESS_TOKEN}]` so the Toolkit signs users in through the browser), **PR opened 2026-10-11** by the pr relay from CI with `PR_TOKEN` (action 021 done 10-11): https://github.com/docker/mcp-registry/pull/5622 (fork `giovf/mcp-registry`, branch `add-gankdat`; first relay run ever, dispatched by the 19:00 burn-down) — in Docker's review; review mail is a `docs/ops/SELF-CAUSED.md` row Listed servers appear in Docker Desktop's MCP Toolkit within 24 h of approval | https://hub.docker.com/mcp |
| Microsoft AppSource (Excel add-in) | **built 2026-10-24** (v0.26.0: `public/addin/` manifest + six `GANKDAT.*` custom functions + task pane with keyless preview and key form, help page `/addin`, `test/addin.spec.ts`; `docs/APPSOURCE-ADDIN.md` holds the listing copy and certification notes); **waits on the owner** (action 031: Partner Center Company account — a sole trader is a Company account, verified by manual review on a tax document — then the offer upload and submission; validation 3–5 working days); listed free with "Additional purchase may be required", the key and credit packs are sold on gankdat.com | https://appsource.microsoft.com (search *gankdat*) once validated; sideload meanwhile from https://gankdat.com/addin/manifest.xml |
| RapidAPI | parked (see below) | — |

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

## Copy-paste blurbs for any directory form (current, 2026-09-21, v0.12.0)

- **Name**: gankdat
- **Tagline**: UK & EU tenders and awards, UK planning, UK sanctions, US exclusions, UK insolvency,
  company, charity, care-provider, school, visa-sponsor and food-hygiene data as clean JSON — REST + MCP + x402.
- **Description**: gankdat serves thirteen official government open-data feeds as one clean,
  filterable JSON schema: UK procurement notices (Find a Tender), EU procurement notices
  (TED), UK planning applications (planning.data.gov.uk), the UK Sanctions List (FCDO),
  US federal exclusions (SAM.gov), UK corporate insolvency notices (The Gazette) and new UK
  company incorporations (Companies House) UK food hygiene ratings (Food Standards
  Agency) the Home Office register of licensed visa sponsors the Charity Commission register for England and Wales, the CQC care directory of
  regulated health and care locations, and the DfE register of schools and colleges in England
  with Ofsted inspection outcomes. Native MCP server for AI agents, plus x402
  USDC pay-per-request on Base for agents with no account. Free tier: 250 requests/month.
  Licence and personal-data posture stated per dataset in the terms; personal fields are
  dropped at ingest. Source code is not open source.
- **Change feeds** (2026-09-20): `GET /v1/changes/<dataset>?since=YYYY-MM-DD` → rows added, removed
  or changed between daily refreshes (90-day history) for food hygiene, charities, care
  locations, sponsors and US exclusions; MCP tool `get_changes`. The gap vs every competitor.
- **Endpoint**: `https://gankdat.com/mcp` (Streamable HTTP). `initialize` and
  `tools/list` are anonymous; `tools/call` needs `Authorization: Bearer <api key>`
  (free key at https://gankdat.com/account).
- **Tools** (15): `list_sources`, `get_usage` (free); `query_uk_tenders`, `query_uk_contract_awards`, `query_eu_ted`,
  `query_uk_planning`, `query_uk_sanctions`, `query_sam_exclusions`,
  `query_uk_insolvency`, `query_uk_companies`, `query_uk_food_hygiene`, `query_uk_sponsors`, `query_uk_charities`, `query_uk_care_locations`, `query_uk_schools` (1 credit each; filters per dataset, plus
  full-text `q`).
- **Official registry name**: `com.gankdat/gankdat`
- **Links**: site https://gankdat.com · docs https://gankdat.com/docs · OpenAPI 3.1
  https://gankdat.com/openapi.json · llms.txt https://gankdat.com/llms.txt · icon
  https://gankdat.com/icon-raccoon.svg (SVG) / https://gankdat.com/favicon.png
- **Pricing**: free 250/mo; grep £5/1k · cron £23/5k · daemon £79/20k · kernel £239/100k
  (slugs saver/starter/growth/scale, `src/billing/plans.json`); x402 US$0.005/request.
- **Contact**: info@gankdat.com
- **Categories/tags**: data · government · open-data · uk · eu · procurement · tenders ·
  planning · sanctions · compliance · kyb · food-hygiene · hospitality · immigration · sponsors · recruitment · charities · grant-making · healthcare · care-homes

## Parked channels

- **RapidAPI** — imports `/openapi.json` (may want 3.0; downconvert then); proxies with
  its own keys and takes ~20–25%. Use only for discovery if ever; steer volume users to
  direct billing. Needs an owner account.
- **Apify Store** — built 2026-09-20 (see the row above and `apify/README.md`): thin actors
  over `/v1/data/:source`, pay-per-event `result`. Existing paid demand there (scrapers of the
  same registers at ~US$1/1k records) is why it is first in line.

## Pre-listing checklist

- [x] Domain and Worker routed — gankdat.com (2026-07-08)
- [x] Stripe live mode + real prices (2026-07-09)
- [x] `FIXTURE_FALLBACK=false` in production (`wrangler.jsonc` vars)
- [x] All seven datasets refreshing daily (sam-exclusions fixed 2026-09-20)
- [ ] External uptime monitor (runbook suggests UptimeRobot; not confirmed set up — the
      Foundry daily routine checks `/v1/health` instead)
- [x] Stage 0 gate — retired 2026-07-11 (signal comes from shipped-product metrics)
