# Spike: US NPI provider registry (CMS NPPES) — free origin, 71 resellers, 114 users a month between them

Queue item `new-ventures/spike-us-npi-registry` (burn-down, 2026-10-19 17:20–17:40 UTC). The question the 17:19 pre-research
left open: *do the Apify actors that resell the NPI registry show enough paying users for a gankdat lookup to earn a
cut, and do CMS's terms allow redistribution?* Sources: the fetch relay (`docs/relay/responses/us-npi-registry-2026-10-19`,
pruned after 7 days) — the NPPES API 2.1 itself, CMS's Data Dissemination page, the NPI Files download index and the
Apify Store API (`/v2/store?search=npi|nppes|healthcare provider`, 40 results each, keyless) — plus the WebSearch reads
of 17:19 (the 2007 Data Dissemination Notice, 72 FR 30011).

## 1. Supply: public, keyless, daily, and free from the origin

- **Terms** (cms.gov Data Dissemination page, verbatim): "In September 2007, CMS began disclosing NPPES health care
  provider data that are disclosable under the Freedom of Information Act (FOIA) to the public. In accordance with the
  e-FOIA Amendments, CMS has disclosed these data via the Internet in two forms": the NPI Registry, "a query-only
  database which is updated daily … There is no charge to view the data", and the NPI Downloadable File — "There is no
  charge to download the data." FOIA-disclosed federal data: public domain, no attribution or redistribution clause.
- **API**: `https://npiregistry.cms.hhs.gov/api/?version=2.1&…` answered the runner in under a second with no key —
  `number=1234567893` → `{"result_count":0,"results":[]}` (a valid-checksum test NPI, not issued), `state=CA&
  taxonomy_description=Dentist&limit=5` → 5 full records (NPI, names, taxonomies, practice and mailing addresses,
  phone, enumeration and update dates). The api-page itself is an Angular shell (406 bytes); the documented caps
  (secondhand, R package `npi`) are 200 records a call and 1,200 a query. No rate limit is published.
- **Bulk** (download.cms.gov/nppes/NPI_Files.html, 2026-10-19): the monthly full replacement V.2 of 12 October 2026 is a
  **1,106 MB zip**, the monthly deactivation file 2.6 MB, and weekly incremental files of ≈ 6.4 MB (05–11 and
  12–18 October) — V.1 retired on 3 March 2026. A D1 copy would need the monthly load plus weekly deltas; the origin
  itself is refreshed daily and answers any lookup free.

## 2. Rivals: 71 actors on the one shelf that shows numbers

The three Apify Store searches returned 224 / 138 / 482 matches; de-duplicated, **71 actors name NPI or NPPES** in
their slug or title (every one pay-per-event, no rentals). Their 30-day user counts, from the store's own `stats`:

| Reading | Value |
| --- | --- |
| NPI / NPPES actors | 71 |
| Users in the last 30 days, all 71 together | **114** |
| Actors with ≥ 5 users in 30 days | 6 |
| Actors with exactly 1 user in 30 days | 45 |
| All-time users, all 71 together | 780 |
| Busiest: `sourabhbgp/npi-registry-scraper` | 9 users, 82 all-time, 5.0 from 2 reviews, US$0.002 a result |
| Next: `pink_comic/nppes-npi-registry` 8, `haketa/nppes-npi-registry-scraper` 5 (5.0 from 1), `scrapesage` 3, `labrat011` 3 | |

Prices cluster at **US$0.002–0.01 a record** (US$1.90–10 per 1,000: `ahmed_jasarevic` "$1.9/1K", `sourabhbgp` 0.002,
`zentrafoundry` 0.01 "per NPI"; `retrainmap` US$0.10 a run) — the same band the EU-register spike found for company
lookups on Apify. `crawlergang/npi-registry-scraper` (the "5.0 from 11 reviews" listing of the 17:19 search) did not
appear in any of the three 40-result searches, and its page came back as a client-rendered shell without stats.
Off-Apify rivals from the 17:19 search: a "health provider api" with a free tier of 100 lookups a month; PayerPrice
meters `/api/v1/npis` in credits. Nobody charges a meaningful per-lookup price for data the origin serves free.

The one shape with a product in it: five actors **combine** the NPI lookup with the OIG exclusion list
(`overlookdata/npimcp-oig-exclusion-check`, `kdhan/npi-provider-check`) or watch the register for changes
(`luminar/nppes-provider-change-monitor`, `theleadforge/…-change-monitor`, `jaybeckham/nppes-new-npi-providers`) —
each at 1–2 users a month today.

## 3. Demand: 1.6 users per actor

114 users a month across 71 listings is 1.6 each; the busiest listing has 9. A 72nd listing on the same shelf, with
gankdat's usual week-one ranking, can expect one or two users a month at US$0.002–0.01 a record — cents. The EU
register spike's bar ("≥ 10 users each" for an actor to count as demand) is met by nobody here, and the pre-research's
own promote line ("the ten actors sum to ≥ 100 monthly users") is met only by summing all 71. The paying demand for
provider data on Apify sits with the **scrapers of closed directories** — Healthgrades (`memo23` 39 all-time, 8 in 30
days; `jaybird` 78 all-time), Vitals, Zocdoc — the same pattern as EU company registers: buyers pay for what is closed,
not for a free federal file.

## Recommendation: park

- **Park** `us-npi-registry` (exchange idea added tonight): the data is free, keyless and refreshed daily at the
  origin, the resale shelf is saturated (71 actors) and thin (114 users a month between them), and a cached copy
  would be a worse product than the origin.
- **Do not build** the plain lookup as a gankdat dataset or actor; `sam-exclusions` already covers the US screening
  need gankdat sells on.
- **Re-open triggers** (dated, checkable at the Wednesday exchange without a build): (a) `sam-exclusions` records its
  first external paid call or paid Apify run (a US buyer exists); (b) a request for NPI arrives through `/feedback`,
  the inbox or an MCP `wanted:` count; (c) one of the five NPI + exclusion / change-monitor actors passes 10 users in
  30 days (today 1–2) — the re-read is the same three store searches.
- If (a) or (c) fires, the shape is a **provider-verification tool**, not a register copy: one MCP call / x402 endpoint
  that reads the live NPPES API, joins `sam-exclusions` and the OIG LEIE (public CSV, `oig.hhs.gov`, not yet on the
  relay allowlist) and answers "active NPI, not excluded" with the dates — ≈ 1 day, no D1 table.
