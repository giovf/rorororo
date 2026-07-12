# Niche research: next datasets (2026-07-12)

> Deep-research pass (106 agents, 24 sources fetched, 114 claims extracted,
> 25 adversarially verified: 24 confirmed / 1 refuted). Goal: new datasets
> ranked by revenue per operational hour, under the hard constraints (official
> open-licence source, no scraping, cron-pullable HTTP, single-DataSource
> pattern, prefer non-personal data, freshness-dependent). Companion docs:
> `.taskmaster/docs/niche-analysis.md` (original 2026-07 scoring),
> `NICHE-NEXT-SANCTIONS.md`, `NICHE-LAUNCH-CHECKLIST.md`.

## Verdict — build order

Two coherent bundles, not orphans:
- **Bid-intelligence**: uk-tenders + **eu-ted**
- **Counterparty risk**: uk-sanctions + **sam-exclusions** + **uk-insolvency**
  (+ uk-companies later)

| # | Dataset | Source & licence | WTP evidence (verified 2026-07-12) | Risk/cost |
| --- | --- | --- | --- | --- |
| 1 | **eu-ted** — EU TED procurement notices | TED Search API v3 (`POST api.ted.europa.eu/v3/notices/search`, **no key**) + free bulk XML `ted.europa.eu/packages/daily/{yyyynnnnn}` (no auth, weekdays by 09:00 CET). Commission Decision 2011/833/EU — free commercial reuse | tedapi.pro $9.99–49.99/mo; Stotles £75–475/mo; Tussell sales-led ~£11.4k/yr (G-Cloud), 250+ customers claimed | No personal data. eForms UBL XML parsing effort; anonymous rate limits undocumented |
| 2 | **sam-exclusions** — US SAM.gov debarment | GSA Exclusions API v4 (`api.sam.gov/entity-information/v4/exclusions`, free key; JSON paginated 10k-cap + async CSV/JSON extract ≤1M records → full daily sync = ~2 req/day, fits 10/day tier) | Same supplier-due-diligence buyers as uk-sanctions; US federal contractors must screen | Personal data (individuals) → task-38 terms path (paved). **Strip D&B-sourced fields at ingest** (bulk dissemination barred) |
| 3 | **uk-insolvency** — Gazette corporate notices | Linked-data API (`thegazette.co.uk/all-notices/notice/data.json`, pagination; per-notice JSON-LD — plain .json 500s) + SPARQL. OGL v3, Crown copyright | Endole £25–39/mo (CH+Gazette bundle); Gazette's own paid feed £8,539/yr (daily London insolvency); Red Flag Alert £2+VAT/search | OGL **excludes personal data** → corporate-only slice, person fields (incl. insolvency practitioners) dropped at ingest. Fair use: 5 req/10s, crawling 21:00–07:00 UK, identifiable UA |
| 4 | **uk-companies** — Companies House profiles | Streaming API covers companies/filings/insolvency-cases/charges but is push-model (doesn't fit Workers cron); build path = on-demand REST or timepoint-replay drain. **Rate limits + redistribution licence unverified — spike first** | Endole £39/mo; Creditsafe median ~$25.8k/yr contracts (Vendr) | Officer/PSC data personal → company-level fields only or task-38 |
| 5 | **uk-price-paid** — HM Land Registry PPD (**deferred**) | `landregistry.data.gov.uk` linked-data JSON + SPARQL (verified live). OGL v3 — but addresses carry Royal Mail PAF / OS third-party rights OGL can't license | SearchLand/LandInsight price property-data seats | **Blocked** for full-address commercial redistribution; needs compliant shape (aggregation / address-free / display carve-out) before any build |

## Refuted / corrections
- Bulk-package URL template `packages/notice/daily/{yyyynnnnn}` is WRONG
  (refuted 1-2); the verified pattern is `packages/daily/{yyyynnnnn}`.

## Open questions (carry into tasks)
1. TED anonymous rate limits; does eForms UBL parsing fit one DataSource or
   need a shared helper?
2. Can a corporate-only Gazette slice be genuinely personal-data-free, or does
   it land on the task-38 terms path anyway?
3. Companies House REST rate limits + commercial redistribution terms;
   Streaming timepoint retention window.
4. A compliant PPD shape that still serves the uk-planning audience.

## Not covered (no surviving claims — neither endorsed nor eliminated)
FCA register, FSA food hygiene, CQC, IP registries (UKIPO/USPTO/EUIPO),
openFDA, DVSA MOT (registration+approval friction noted), NHTSA, FMCSA,
charity register/360Giving, FX rates. Re-probe only if the two bundles above
stall.

## Caveats
WTP evidence is public list prices + vendor self-reported counts, not audited
revenue. Stotles/Tussell price the tender-tracking *job* (SaaS), not raw API
access — ceilings, not comparables. All liveness/pricing checks dated
2026-07-12. tedapi.pro is a small RapidAPI product; could vanish.
