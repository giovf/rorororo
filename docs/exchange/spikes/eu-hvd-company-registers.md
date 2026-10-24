# Spike: EU high-value-dataset company registers beyond Ireland — who publishes keyless, who sells lookups, who buys

Research spike `spike-eu-hvd-company-registers` (new-ventures queue, burn-down routine, 2026-10-19 01:07–01:50 UTC).
Seeded by the 2026-10-19 00:15 research run from the Ireland CRO pre-research of 2026-10-13, which parked the Irish
register on demand and asked for the sibling to be sized: one EU company feed built from every register that
Implementing Regulation (EU) 2023/138 obliges member states to publish free of charge, in bulk and through an API
(category "Companies and company ownership", in force since 2024). The question written into the item: how many
member states actually publish such a register keyless under an open licence (promote at ≥ 3, park if the registers
sit behind national accounts or share-alike terms, or if the EU company actors on Apify show < 10 users each).

## How it was read (primary sources through the relay, no credential)

Three relay rounds, 57 lines, all public pages: `docs/relay/responses/eu-hvd-registers-2026-10-19/` (01:12 UTC:
data.europa.eu search API, KvK, api.gouv.fr and recherche-entreprises, data.gouv.fr, Handelsregister, GovData,
Registradores, BOE, Registro Imprese, Bolagsverket, CVR, cvrapi.dk, PRH, KRS, RIK, KBO, OpenCorporates, Didit,
CompanyData, Know Your Customer, seven Apify store searches), `…-b-…` (01:30: the 119 datasets of the HVD company
category with country, licence, format and URL; Danish Business Authority; BOE) and `…-c-…` (01:45: HEAD/RANGE on the
Swedish, Latvian, Lithuanian, Maltese and Irish files). WebSearch filled in what the runner could not reach (bolagsverket.se
and datacvr.virk.dk answer a CAPTCHA / 403 to a runner; data.europa.eu's HTML is a JS shell). Relay bodies are pruned
after 7 days; every number used is copied here. gankdat's own numbers come from the Daily numbers row of 2026-10-18
in `ventures/gankdat/RESEARCH.md`.

## 1. The EU portal's own count: 119 "company" HVDs, 8 national registers, 0 in Germany, Italy or Spain

data.europa.eu's search API (facet `hvdCategory = c_a9135398`, the Publications Office code for *Companies and company
ownership*) lists **119 datasets** tagged in the category on 2026-10-19, out of 28,650 HVDs in all. By country:
Greece 33, Lithuania 28, Spain 23, Luxembourg 15, Germany 5, Ireland 3, Serbia 3, Denmark 2, France 2, Latvia 2,
Belgium 1, Malta 1, Sweden 1 — **13 countries tag anything; 14 member states tag nothing** (Austria, Bulgaria,
Croatia, Cyprus, Czechia, Estonia, Finland, Hungary, Italy, Netherlands, Poland, Portugal, Romania, Slovakia,
Slovenia). Reading the 119 titles: Greece's 33 are building permits, bakery and lift-workshop licences and two GEMI
entries with no distribution; Spain's 23 are Navarre's regional tourism, industrial and cooperative registers plus a
Barcelona contractor list — **the national Registro Mercantil is not among them**; Germany's 5 are truck-parking
feeds, an INSPIRE industrial-plants layer, a VR aircraft model and Oldenburg's municipal trade register — **not the
Handelsregister**; Luxembourg's 15 are annual-accounts deposit files by year under **CC BY-SA 4.0** (share-alike).
What is left as a national company register with company-level rows:

| Member state | Register dataset (catalogue entry) | Access route verified | Licence | Cadence | Verdict |
| --- | --- | --- | --- | --- | --- |
| Ireland | CRO Company Records + Financial Statements (data.gov.ie) | `companies.csv.zip` keyless; CKAN datastore API keyless (10-13 read: 825,798 rows) — round c HEAD: **403** to the runner (as on 10-13; the datastore API is the keyless route) | CC BY 4.0 | daily (modified 2026-10-18) | **open, keyless, named** |
| France | Sirene base (SIREN/SIRET) + Company documents and accounts (data.gouv.fr) | bulk CSV/Parquet keyless; `recherche-entreprises.api.gouv.fr` keyless search API answered 200 (SIREN, name, NAF, address, geo, creation date), api.gouv.fr page: "Accès Ouvert", 7 calls/s | Licence Ouverte 2.0 (attribution) | Sirene monthly bulk; API daily | **open, keyless, named** |
| Denmark | Central Business Register (CVR), Datavejviser | "system-til-system adgang": apply by e-mail to the Business Authority, Elasticsearch endpoint; the public portal answered **403** to the runner; data.virk.dk catalogue page: `fetch failed` from a runner (host unreachable) | CC BY 4.0 | continuous | open licence, **account needed** |
| Sweden | Bolagsverket "Värdefulla datamängder" (öppnadata.se) | `vardefulla-datamangder.bolagsverket.se/bolagsverket/bolagsverket_bulkfil.zip` HEAD: **200, application/zip, 251,010,183 bytes, last-modified 2026-10-12** — keyless; API docs on bolagsverket.se (CAPTCHA to a runner); vendor pages: weekly files, no contract, no board members | none stated in the catalogue (free of charge under the Regulation) | weekly | open, **keyless bulk** (licence text unread) |
| Lithuania | Register of Legal Entities (JAR) + JADIS participants, management bodies, addresses, capital | `get.data.gov.lt/datasets/gov/rc/jar/iregistruoti` HEAD: **500 "Web Page Blocked"** (a WAF blocks the runner IP, Attack ID 20000018) — keyless on paper, unverified from a runner | CC BY 4.0 | catalogue modified 2026-01-05 | **open, keyless, named** |
| Latvia | Register of Enterprises + annual-accounts financials | `data.gov.lv/…/register.csv` HEAD: **200, text/csv, 128,838,528 bytes, last-modified 2026-10-18 20:25 UTC**; RANGE read: semicolon CSV `regcode;sepa;name;…;regtype;type;registered;terminated;closed;address;…` with named rows down to sole traders — keyless | none stated (data.gov.lv publishes CC0 by default) | file re-generated 2026-10-18 (catalogue says 2024-07-01) | **open, keyless, named** |
| Malta | Basic Company Information (Malta Business Registry) | `openapi.baros.mbr.mt/swaggerui` HEAD: **200** (Swagger UI) — keyless docs, endpoints not exercised | CC BY 4.0 | API | **open API** |
| Luxembourg | Annual deposits 2012–2026 (hvdapi.data.public.lu) | ATOM/JSON keyless | **CC BY-SA 4.0** | yearly files | share-alike — excluded by the item's own rule |

Registers read directly because the portal does not tag them (the catalogue is incomplete, not the obligation):

| Member state | What the register publishes | Verified | Verdict |
| --- | --- | --- | --- |
| Netherlands | KvK "Business Register Open Dataset Basic Company Information" (HVDS), CC BY 4.0, bulk + API, updated every working day | kvk.nl page (relay): "The HVDS does not contain any personal data. As a result, the available dataset does not contain all data fields described in Implementing Regulation 2023/138. This applies to the **name of the company and the KVK number**. Only the first two digits of the postcode … sole proprietorships excluded" | open, keyless — **but anonymised: no name, no number, no lookup possible** |
| Finland | PRH open data API v3 (`avoindata.prh.fi/opendata-ytj-api/v3/companies`) | GET `?name=nokia` answered 200 keyless: 991 results, business id, names with history, registration dates; PRH: CC BY 4.0, daily | **open, keyless, named** (not tagged HVD) |
| Poland | KRS open API (`api-krs.ms.gov.pl/api/krs/OdpisAktualny/<krs>?rejestr=P&format=json`) | GET for KRS 0000028860 answered 200 keyless: a 43 kB current extract (legal form, REGON, NIP, name, court, last entry 2026-10-09); Ministry of Justice; **no bulk file** (vendor guides agree) | **open, keyless, named** — per-entity only, no search by name |
| Estonia | e-Business Register open data (avaandmed.ariregister.rik.ee): eight daily datasets (basic data, general data, registry cards, persons, shareholders, beneficial owners, pledges) in XML/JSON/CSV | page: "Downloading open data requires acceptance of the license terms"; since 2024-11-01 no personal identification numbers; the REST API needs a contract and API key | **open download after a click-through licence**; API is contract-only |
| Belgium | KBO open data (`kbopub.economie.fgov.be/kbo-open-data/`) | HEAD 200 = a login page; e-Justice: reusable "provided they register", no direct-marketing reuse of personal data; monthly full file + daily updates | **account needed** |
| Germany | Handelsregister (Registerportal der Länder) | HEAD 200; no bulk, no API, free search since 2022-08 with a 60-queries-per-hour term; GovData's five "company" HVDs are not the register; Bundesanzeiger Verlag sells the bulk feed | **not published as open data** — scraping it would breach its terms |
| Spain | Registradores "Datos Abiertos": "Directorio de sociedades … datos abiertos de las sociedades previstos en el artículo 17.5 del Código de Comercio (Ley 11/2023). Se trata de una **aproximación inicial** … completado de forma paulatina"; the rest is statistical microdata; BORME summary API answered 400 to a plain GET (Accept header) | quarterly extracts of name/NIF/registry per vendor guides; no API | **partial, no API, no cadence** |
| Italy | Registro Imprese (InfoCamere) | HEAD 200; identification fields free on the web, everything else via paid Telemaco; **no open dataset** on dati.gov.it or data.europa.eu | **not published** |

Answer to the item's first question: **≥ 3 registers are keyless under an open licence — seven or eight are**
(Ireland, France, Finland, Poland, Latvia, Malta and Sweden verified keyless from a runner tonight — Sweden's 251 MB
weekly bulk file and Latvia's 129 MB daily CSV answered 200 with no credential; Lithuania is CC BY on paper but its
host blocked the runner; Estonia is a click-through away). The promote condition on supply is met. But the five largest economies split 1–4: France yes;
Germany, Italy and Spain publish nothing usable; the Netherlands publishes a file with the names removed. The feed that
could be built covers France plus small and mid-sized states, not the registers a European KYB buyer pays for.

## 2. Rivals: what a company lookup sells for

| Rival (relay 10-19) | Price | What is in it |
| --- | --- | --- |
| OpenCorporates `/pricing/` | Essentials **£2,250/year** (£225/month) for 500 API calls a month and 200 a day; Starter £6,600/year for 2,500 a month; Basic £12,000/year for 5,000 a month; Enterprise = bulk, bespoke | ≈ **£0.20–0.38 a call** at the caps; 200+ jurisdictions normalised, officers, provenance; no free self-serve tier on the page |
| Know Your Customer "Company Records" `/pricing` | one price per record, no subscription: Low **US$19**, Medium US$49, High US$89, Premium US$119 (155 jurisdictions; "the price depends only on what the register itself charges us"); company search free up to a daily limit | the KYB report plus the official filings — a document product, not a lookup |
| Didit `/pricing` | pay as you go: full KYC US$0.33, AML screening from US$0.07, transaction monitoring US$0.02; **"Business registry pricing by country and data tier"** (no flat figure on the page; its blog quotes US$2 per company for the full KYB bundle) | identity + KYB bundle |
| CompanyData.com `/kyb-api/` | usage credits "from US$34/month", 1 credit per Companies House sample check, 150 free calls in week one, "200+ registers, one schema", 374 M entities | register-sourced lookup + officers + group parent — the closest shape to a gankdat `lookup_company` |
| Apify multi-register actors (store API) | `pvalyou/company-registry-lookup` (Companies House + 40 registers) 6 users/30 d; `pavel.tashev/european-company-registry-lookup` US$2 per 1,000 records, 1 user/30 d; `studio-amba/european-company-search` (14 registers) 4 users/30 d; `enisbodlli/eu-company-registry-search` (8 registers) 2 | per-record resale of the keyless registers at **US$0.002–0.01** |

So a per-call x402/MCP lookup at US$0.005–0.01 would sit two orders of magnitude under OpenCorporates and in the
middle of the Apify field — the room the item asked about exists on price. Price was never the blocker.

## 3. Demand: the shelf pays for the registers that are closed, not the ones the Regulation opened

Apify store API, seven searches (`company register`, `handelsregister`, `kvk`, `european company`, `registro
mercantil`, `bolagsverket`, `kyb`; 174 distinct actors, 114 of them European-register actors after dropping US
Secretary-of-State, NZ, Swiss, Norwegian and UK ones):

| Register (country) | Open under HVD? | Actors | Users in 30 days (all actors) | Top actor |
| --- | --- | --- | --- | --- |
| Handelsregister / German company data | **no** (portal, 60 queries/h) | 30 | **219** (77 of them an Impressum scraper) | `memo23/handelsregister-scraper` 23/30 d, 13,494 runs |
| North Data and multi-country EU lookups | wraps the closed ones | 29 | 125 | `northdata-scraper` 45/30 d |
| Registro Mercantil / BORME (Spain) | **no** (statistics only) | 17 | 44 | `regdata/spain-company-directory-scraper` 20/30 d |
| KvK (Netherlands) | anonymised file only | 14 | 36 (19 of them a bol.com seller scraper) | `nocodeventure/kvk-handelsregister-scraper` 21/30 d, 47,903 runs |
| Bolagsverket / Allabolag (Sweden) | yes, keyless bulk | 7 | 19 | `allabolag-scraper` 12/30 d (the paid portal, not the open file) |
| Registro Imprese (Italy) | **no** | 3 | 18 | `italy-registroimprese-bilanci-scraper` 14/30 d |
| Sirene / recherche-entreprises (France) | **yes**, keyless API | 7 | **11** | `corent1robert/recherche-entreprises-scraper` 4/30 d |
| Estonia | yes (click-through) | 3 | 5 | 2/30 d |
| Poland KRS | yes, keyless API | 3 | 3 | 1/30 d |
| Ireland CRO (10-13 read) | yes, CC BY | 3 | 1 | `nerolabs/ireland-cro-monitor` 1/30 d |
| Finland PRH | yes, keyless API | 2 | ≤ 2 | — |

114 European-register actors share **483 monthly users**; 13 pass 10 users a month and every one of those scrapes a
closed or paid front end (Handelsregister, North Data, Registro Mercantil, KvK, Allabolag, Registro Imprese). The
open registers — France, Poland, Finland, Ireland, Estonia, the Baltics — draw 1–4 users per actor: where the source
is keyless and free, nobody pays a reseller for it, which is exactly what the Regulation intends. The margin the
one-EU-feed idea wanted therefore lives only in the registers that are not open, and the only way to serve those is
to scrape portals whose terms forbid it (Handelsregister's 60-queries-an-hour term; Registro Imprese's paid Telemaco;
KvK's paid API) — the kind of ToS risk CLAUDE.md rules out entirely.

gankdat's own company endpoints over the same 30 days (Daily numbers 2026-10-18): `uk-companies` 161 calls,
`uk-company-profiles` 10, **external: none**; the Apify actor `uk-companies-house-lookup-monitor` 10 runs in the
catalogue-wide sweep (every actor 17–23), 18 users across all 18 actors. No `/feedback` or inbox request for any EU
register since the venture opened.

STRATEGY §5 score for the feed (France + Ireland + Finland + Poland + Baltics + Malta; six parsers with different
layouts, D1 `idOf` on the national number, daily diff): evidence 1 (supply clean, price room real, zero callers here,
open-register actors at 1–4 users) × reach 2 (MCP, x402, Apify) ÷ effort ≈ 3 days ≈ **0.7**, below every open gankdat
item. A France-only `fr-companies` (Sirene bulk + the keyless search API, ≈ 1 day) scores ≈ 2 on effort but its
shelf evidence is the weakest of all: 11 users a month across seven French actors. §5's standing rule — distribution
before the next dataset until a shelf converts — applies as it did to Ireland and USAspending.

## Recommendation: park the EU feed; decline the Germany / Italy / Spain route outright

- **Park the one-EU-feed idea** with the Ireland register (exchange `ireland-cro-company-register`), on demand not
  supply: seven open registers exist, but the buyers on the only shelf that shows numbers pay for the closed ones.
- **Decline** any version that covers Germany, Italy or Spain by scraping: their registers are not open data and
  their terms forbid automated access.
- **Re-open triggers** (dated, checkable at the Wednesday exchange without a build): (a) `uk-companies` or
  `uk-company-profiles` records its first external paid call or paid Apify run; (b) a request for an EU register
  arrives through `/feedback`, the inbox or an MCP `wanted:` count; (c) data.europa.eu's company-category facet for
  `de`, `it` or `es` gains a national register entry (today 5 / 0 / 23, none of them the register — the one line to
  re-read: `search?filter=dataset&limit=0&facets={"is_hvd":["true"],"hvdCategory":["c_a9135398"]}`); or (d) one open-register
  Apify actor (France, Finland, Poland, Ireland, Estonia) passes 10 users in 30 days.
- If (a) or (b) fires, build **France first** (Sirene + recherche-entreprises, Licence Ouverte attribution line, ≈ 1
  day) as a sibling of `uk-companies`, then Ireland and Finland, each ≈ 1 day, under one `eu-companies` MCP tool.
