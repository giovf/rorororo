# Spike: cross-list sanctions screening (OFAC + EU next to gankdat's UK list) — access, cadence, rival prices, demand

Research spike `spike-ofac-eu-sanctions-screening` (new-ventures queue, burn-down routine, 2026-10-18 18:11–18:40 UTC).
Seeded by the 2026-10-18 17:40 pre-research pass, the first under the spike rule. The question it was asked: do
rivals charge enough per query for a three-list `screen_name` tool to clear x402's floor (US$0.005 a call), and does
any external caller use gankdat's UK list at all? Park rule written into the item: park if no rival sells
cross-list screening above US$0.01 a query, or if the EU list needs an account.

## How it was read (primary sources through the relay, no credential)

Two relay rounds: `docs/relay/responses/sanctions-lists-2026-10-18/` (17:24 UTC: SDN.CSV HEAD + first 4 kB, the
Sanctions List Service page, OpenSanctions licensing, sanctions.io/pricing, a guessed data.europa.eu slug) and
`docs/relay/responses/ofac-eu-spike-2026-10-18/` (18:14 UTC: OpenSanctions API and commercial FAQ pages, four OFAC
export HEADs, CONS_PRIM.CSV first 4 kB, `changes/latest`, the data.europa.eu dataset page, the EU FSF XML HEAD and
CSV body, sanctions.io home, sanctionscanner.com/pricing, the Apify store API for `sanctions screening`). A third
round (`ofac-eu-spike-b-2026-10-18`, 18:29 UTC after a re-fire: sanctions.io's knowledge-base pricing page,
verifex.dev and its pricing page) refined the rival table below without changing the call. Relay bodies are pruned after 7 days;
every number used is copied here. gankdat's own numbers come from the Daily numbers rows in
`ventures/gankdat/RESEARCH.md` (10-11 → 10-18) and the Apify store rows the same job writes.

## The three lists: access terms, real file names, update cadence

| List | Access route verified | Licence | Layout | Cadence (last-modified read 10-18) |
| --- | --- | --- | --- | --- |
| OFAC SDN (US Treasury) | `sanctionslistservice.ofac.treas.gov/api/PublicationPreview/exports/SDN.CSV` HEAD 200, GET 206 redirects to a signed S3 URL (1 h expiry); `SDN.XML` and `SDN_ADVANCED.XML` HEAD 200 | US government work, public domain (17 U.S.C. §105); the SLS page states no terms | `SDN.CSV`: no header row, `ent_num,name,type,program,title,call_sign,vess_type,tonnage,grt,vess_flag,vess_owner,remarks`, `-0-` for empty (the legacy flat file; the tutorial on the SLS page documents it); `SDN_ADVANCED.XML` is the Advanced Sanctions Data Model (full XSD) | SDN.CSV and SDN.XML last-modified **2026-10-15 16:34 UTC**; `changes/latest` is a DeltaFile 1.0 XML (`datePublished 2026-10-15`, 27 `action="add"` entities, IRAN-EO13902) — one delta per OFAC action, several a week |
| OFAC consolidated non-SDN | `CONSOLIDATED.XML` HEAD 200 (last-modified 2026-09-14); `CONS_PRIM.CSV` HEAD answers 400 but GET 206 serves it (same 12-column layout, `NS-PLC` program rows); `CONS_ADVANCED.XML` HEAD 400 — read with GET before any parser | public domain, as above | as SDN | last change **2026-09-14** |
| EU consolidated financial sanctions (FSF) | `webgate.ec.europa.eu/fsd/fsf/public/files/xmlFullSanctionsList_1_1/content?token=dG9rZW4tMjAxNw` HEAD 200 `application/xml` 25,767,041 bytes; `csvFullSanctionsList_1_1` GET 200 `text/plain` 25,166,754 bytes (RANGE ignored; the relay kept 8 MB). The `token` is the Commission's published public one (base64 of `token-2017`, the value every open-source crawler and the LEXolution guide use); **no account was needed**. The `fsd/fsf` landing page itself does not answer a runner (`fetch failed`), and data.europa.eu's dataset page is a JS shell to a runner | Commission reuse decision 2011/833/EU (commercial reuse with attribution; verified 2026-07-11 in `NICHE-NEXT-SANCTIONS.md`, not re-read today because the portal page is JS-only) | semicolon CSV, UTF-8 BOM, one row per name alias × address × identification (`fileGenerationDate;Entity_LogicalId;Entity_EU_ReferenceNumber;Entity_UnitedNationId;Entity_DesignationDate;…;NameAlias_WholeName;…;Address_CountryIso2Code;…`), `Entity_EU_ReferenceNumber` (e.g. `EU.27.28`) is the stable id; the 8 MB slice held 14,258 rows | `fileGenerationDate 15/10/2026`, last-modified **2026-10-15 10:20 UTC** — regenerated on each Official Journal publication, in practice most weekdays |
| UK Sanctions List (already served: `uk-sanctions`) | FCDO static CSV, OGL v3 | OGL v3 | one row per name, ~58 columns | daily cron at 05:00 |

So the supply side is clean: three primary lists, two public domain and one attribution-only, all static URLs a
Worker can stream, all with a stable per-entity id for `idOf`, no account anywhere. Build cost of the list half
is the `uk-sanctions` pattern twice (≈ 1 day for `us-sanctions` SDN + consolidated, ≈ 1 day for `eu-sanctions`
with a 25 MB semicolon stream grouped by reference number), Blind Mode dropping dates of birth, documents and
addresses at ingest as today.

## Rivals: what a screening query sells for

| Rival (source, date read) | Price per query | Terms that matter | Demand signal |
| --- | --- | --- | --- |
| OpenSanctions Screening API (`opensanctions.org/api/`, relay 10-18) | credit bundles, one credit per metered operation: 500 for €50 (**€0.10**), 5,000 for €400 (€0.08), 30,000 for €2,000 (€0.067), 100,000 for €5,000 (€0.05), 500,000 for €15,000 (**€0.03**), 1M+ talk to sales; 2,000 free credits on sign-up; credits valid one year; prices ex-VAT | commercial FAQ: screening on behalf of your customers inside a product you sell is allowed on the same bundles with no reseller licence; redistributing the data collection or giving customers their own API access is not; a reseller licence is needed to load the bulk data into your own matching engine. The data itself is CC-BY-NC 4.0 — gankdat does not build on it | "650+ clients", 470+ sources, 2.0M+ entities, updates 4× a day |
| sanctions.io (home page and `help.sanctions.io/knowledge-base/pricing-plans`, relay 10-18; `/pricing` 404 since a site move dated 10-18 14:21) | no public figure: "calculate your costs instantly based on your annual screening volume or the number of entities, and receive a custom proposal" | SOC 2, 99.995 % uptime, batch of 10,000 per request, continuous monitoring, Salesforce and HubSpot integrations | mid-market, sales-led; the July 2026 reading of ≈ US$0.16 a screen is no longer published |
| Sanction Scanner (`/pricing` relay 10-18) | 404 — no public price | — | — |
| Apify store, search `sanctions screening` (store API, relay 10-18): 377 actors match, the top 17 all pay-per-event | per name screened: `reclarative_kernel` **US$0.08**, `george.the.developer` US$0.015, `scrapemint` US$0.01, `nightwave-owner` US$0.01, `frenchdatalab/sanctions-screening-eu-uk-ofac` US$0.005 (+US$0.001 per entry), `factline` US$0.005, `wsystem` US$0.005 (+US$0.005 per run), `inexhaustible_glass` US$0.005 per item (+US$0.02 per run), `ryanclinton/opensanctions-search` US$0.003 per entity, `haketa` US$0.003, `pink_comic` US$0.002; six more have unpriced events | most wrap OpenSanctions' free data or yente; the three "EU + UK + OFAC" actors were published 2026-06-01, 2026-10-02 and 2026-10-14 | **users in the last 30 days: 0–3 per actor**; lifetime users 2–9 for sixteen of the seventeen, 53 for the oldest (`ryanclinton`, live since 2026-03-13, 3 in 30 days). Seventeen actors share roughly twenty monthly users between them |
| Verifex (`verifex.dev` and `/pricing`, relay round b 10-18) | plans, no pay-as-you-go any more: Free US$0 for 50 screens a month (OFAC + UN only, no card), Starter US$49 for 2,500 (**≈ US$0.02** a screen, its own figure), Growth US$99 for 10,000 (≈ US$0.01), Pro US$249 for 50,000 (**≈ US$0.005**), Enterprise custom; KYB dossiers US$500 a month for five | 46 sources from 24 publisher cities, audit evidence per check, billing through Lemon Squeezy (a merchant of record, as gankdat's Stripe Managed Payments) | self-serve, startup-targeted; no user numbers published |

Answer to the first question: yes, rivals sell cross-list screening above US$0.01 — OpenSanctions never below
€0.03 (≈ US$0.035) and at €0.10 for small buyers, Verifex at US$0.02 a screen on its entry plan falling to
US$0.005 at 50,000 a month, and the Apify shelf runs from US$0.002 to US$0.08 with a median at US$0.005. A gankdat
`screen_name` at US$0.01 would undercut every hosted vendor's entry tier and sit in the middle of the Apify field;
at volume the self-serve rivals already reach x402's US$0.005 floor.

## Demand: nobody calls the UK list, and the shelf that already sells screening is starved

| Reading (Daily numbers, 2026-10-18) | Value |
| --- | --- |
| `uk-sanctions` calls, 30 days | 162 — **external: none** (every call is the metrics job, the MCP probe or an internal key) |
| Any gankdat dataset with an external call, 30 days | none of 17 |
| `query_uk_sanctions` wanted by anonymous MCP clients (10-11 row, the last day the field was shown) | 16 in 24 h — tool listings walked by crawlers, 0 paywall conversions since |
| Apify `uk-sanctions-list-fcdo` runs, 30 days | 21, in step with every other actor (18–23 each, 18 users across 18 actors): a sweep of the whole catalogue, not a screening user |
| `sam-exclusions` (the counterparty-risk sibling) external calls, 30 days | none |
| `/feedback` or inbox requests for screening | none on file |
| Apify screening actors, users in 30 days (17 actors) | ≈ 20 in total, 0–3 each |

Answer to the second question: no external caller uses the UK list. The Phase B gate written on 2026-07-11
(Phase A usage plus explicit requests) is unmet on every count. The Apify store settles the per-query argument
too: seventeen sellers already offer OFAC + EU + UK screening at US$0.002–0.08 and together draw about twenty
users a month, so at US$0.005–0.01 a name the whole shelf's screening revenue is pennies; the buyers who pay real
money (OpenSanctions' 650 clients, sanctions.io's mid-market) buy matching quality, PEP coverage, audit trails
and a vendor who carries the false-negative liability — the product `NICHE-NEXT-SANCTIONS.md` called "weeks, only
on demand signal".

STRATEGY §5 score for the screening tool: evidence 1 (price clears the floor, zero callers here, a starved
shelf) × reach 2 (MCP, x402, Apify) ÷ effort 3 days (three-list ingest + fuzzy matcher + test corpus) ≈ **0.7**,
below every open gankdat item. For the two list datasets alone (≈ 2 days, no matcher) the same evidence gives
≈ 1, and STRATEGY §5's standing rule — distribution before the next dataset until a shelf converts — applies to
them exactly as it did to USAspending (exchange, 2026-10-15).

## Recommendation: park (lists and screening), with a measurable re-open trigger

- **Park the screening tool.** The number asked for is in hand and it is not the blocker: rivals charge
  US$0.03–0.10 a query at the hosted end, but demand on our side is zero external calls and the one shelf where
  per-query screening is already sold shows seventeen rivals splitting twenty users a month. Building the matcher
  (the part that carries liability) for that is not a new income line.
- **Do not add `us-sanctions` / `eu-sanctions` as datasets yet.** They are a day each and licence-clean (this file
  is the verified recipe: export names, the public EU token, the layouts), but they would be datasets 18 and 19
  in a catalogue with no external call; §5 says distribution first.
- **Re-open trigger (checked by the Daily numbers row, no polling needed):** the first external call on
  `uk-sanctions` or `sam-exclusions`, a paid x402 call on either, or a `/feedback` or inbox message asking for
  screening or for the EU/OFAC lists — then the exchange scores `us-sanctions` + `eu-sanctions` first (2 days,
  this recipe) and the `screen_name` tool only after those draw calls. Secondary trigger: OpenSanctions' lowest
  tier moving above €0.10 or the free credits disappearing, which would push the small buyers the Apify shelf now
  serves toward a cheaper primary-source call.
- **By-product kept:** the OFAC export names that answer (`SDN.CSV`, `SDN.XML`, `SDN_ADVANCED.XML`,
  `CONSOLIDATED.XML`, `CONS_PRIM.CSV` via GET), the delta feed (`/changes/latest`, DeltaFile 1.0), and the EU FSF
  public-token URLs are the whole ingest spec for the day a trigger fires.
