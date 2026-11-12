# Spike: UK large-company payment practices reports as a gankdat lookup

Queue item `new-ventures/spike-uk-payment-practices-lookup` (burn-down, 2026-11-12 01:32–01:40 UTC; seeded by the
01:33 exchange pre-research of the same slot, the night's second pass under the one-seeded-spike rule). Sources: three
fetch-relay rounds — `docs/relay/responses/pre-research-payment-practices-2026-11-12` (the GOV.UK start page, the
service's /export and /search pages, four HEADs for a terms page, the 2017 Regulations, the Apify Store shell),
`…-b` (the first 2 MB of the full CSV export, the privacy notice, one report page, the Apify Store API for three
phrases, 193market's api.market listing with its plan JSON, the 2025 statistics commentary) and
`payment-practices-spike-2026-11-12` (two Range reads deep into the export, two company pages, Experian's Business
Express FAQ and report page, Companywatch's announcement, Capterra's Company Watch listing, the 2025 statistics
landing page) — plus the GitHub search API, the npm registry and three WebSearch reads from the sandbox, and a read
of `ventures/gankdat/src/sources/` for the ingest budget.

The question: is `pays in N days, M % late` — the twice-yearly statutory report every large UK company files — worth
≤ 0.6 day as a gankdat lookup by company number, a field on `uk-company-profiles` and an eighth register for the
/diligence counterparty agent, given that three sellers price the series and four Apify actors and one API already
wrap it at one user each?

## 1. The source (relay 11-12)

| Fact | What the page says | Consequence |
| --- | --- | --- |
| Licence | Footer of `/search/`, `/export/` and `/privacy-notice/`: "All content is available under the **Open Government Licence v3.0**, except where otherwise stated. © Crown copyright". No other licence statement on any page or in the CSV. The GOV.UK start page carries the standard OGL footer. | re-use, including resale, is allowed with attribution |
| Terms of access | No terms page exists on the service (`/terms`, `/terms-and-conditions`, `/privacy`, `/accessibility` answer 404; the footer links `/privacy-notice`, `/accessibility-statement`, `/cookies`). The privacy notice is about the people who file, not readers. Nothing forbids automated reads. | the terms-first rule (2026-11-11) is met |
| Export | `/export/`: "Download all reports. By clicking the button, users will be able to review all statistical and yes/no answers published by businesses. For further detail on narrative answers users will need to click on the individual URL address within the CSV file. Get CSV File (/export/csv/)". `GET /export/csv/` answers 200 `text/csv`, `content-disposition: attachment; filename="2026-11-12-0126-prompt-payments.csv"` (the filename is the request minute, so the file is generated per request), no `content-length`; HEAD answers 405. | one streamed file, read with `csvRows()` like the sanctions and SAM extracts |
| Layout | 52 columns: Report Id, Policy Regime, Financial period start date, Start date, End date, Filing date, Company, Company number, Qualifying contracts in reporting period, Payments made in reporting period, Qualifying construction contracts in reporting period, Construction contracts have retention clauses, Average time to pay, Total value invoices paid within 30 days / between 31 and 60 days / later than 60 days, % Invoices paid within 30 days / between 31 and 60 days / later than 60 days, Total value invoices paid later than agreed terms, % Invoices not paid within agreed terms, % Invoices not paid due to dispute, Shortest (or only) standard payment period, Longest standard payment period, Standard payment terms, Payment terms have changed, Suppliers notified of changes, Maximum contractual payment period (+ information), Other information payment terms, eleven retention-clause columns, then policy yes/no answers and the report URL. | a 30-line parser; the narrative columns are dropped (Blind Mode keeps the numbers and the yes/no answers) |
| Size | ≈ 863 bytes a row; the first 2 MB held 2,420 rows (Report Id 2 → 2,499, filings 2017-11-07 → 2018-07-17). Range is **not honoured**: `Range: bytes=52428800-` and `bytes=104857600-` both returned the first 2 MB again (the file is generated per request, filename stamped with the request minute, and streamed from byte 0). The count therefore comes from the ids: the latest report page is `/report/118366/` (SUPPLY CHAIN COORDINATION LIMITED, 1 April–30 September 2026, published 2026-10-30) and ids are sequential with ≈ 3 % gaps (2,420 rows in ids 2–2,500) → **≈ 115,000 reports, ≈ 100 MB**; Tesco Stores' page lists 16 reports since 2018. | the Worker must stream the whole file in one pass (no chunked resume); the charity extract's 160 MB / 400k rows already does that in wave 3 |
| Keys | Report Id is a stable integer; Company number is the Companies House number (`01070807`, `10881715`). A company's page is `/company/<number>/reports`, a report's `/report/<id>/`. | `idOf(report_id)`; the lookup key is the company number gankdat's other registers use |
| Who reports | GOV.UK: a company or LLP with at least two of £54 million turnover, £27 million balance sheet, 250 employees; "must publish its reports at least twice a year". The 2017 Regulations (SI 2017/395) list the schedule of answers. | ≈ 9,000 reporters; 193market counts 9,149 companies, Chadhauser's aggregate 114,758 reports to 2026 |

## 2. Who sells the series (relay 11-12 and WebSearch)

| Seller | Product | Price | Uptake |
| --- | --- | --- | --- |
| **193market** (api.market, launched 2026-09-17; RapidAPI twin answers `API not found`) | "UK Supplier Payment Practices API — days to pay & late": latest figures, history, benchmark and signals by Companies House number, 9,149 companies | Free trial 30 units / 7 days; **Pro US$49/month 1,000 calls**, Ultra US$149 5,000, Mega US$399 25,000 (the listing's plan JSON) | **1 user, 16 runs** in eight weeks |
| **Experian Business Express** | pay-as-you-go company credit report; the FAQ lists "Days Beyond Terms (DBT) for the last 12 months, average DBT, payment performance by size of account" | **£24.99 ex VAT per one-off report** ("Pay-per-check option … Key company data & payment insights"); subscriptions £375 / £600 / £925 a year on 3-year billing | a credit bureau's own trade data, not this register |
| **Companywatch** | "Payment Practices Data" add-on (Average Days to Payment from the statutory reports) | no price on the announcement; Capterra lists Company Watch from £354 a month (WebSearch; the Capterra page answered 403 to the relay, the Companywatch announcement 404 — its support site still describes the add-on) | inside a risk platform, not sold alone |
| Apify Store | four UK actors: tabulary/uk-payment-practices-reports, battles_2026/uk-late-payer-signals, robert-white/uk-construction-payment-league, wooden_scanner_c1n/uk-supplier-transparency-pack (73 hits for "payment practices", 1,039 for "late payment") | pay-per-event / rental | **1 user/30 d each** |
| npm / PyPI | no package wraps the export (npm search "uk payment practices", "payment practices reporting": 0 relevant; PyPI `payment-practices` 404) | — | — |
| GitHub | 9 repositories for "payment practices" uk; two are data products (193market's API, Chadhauser's 2017–2026 aggregate of 114,758 reports), the rest student analyses; 25 code hits name the service host (PayShield ingests it, arc-kit's supplier-profile command reads it) | — | 0 stars each |

So the price is set — US$49 a month at the entry tier, and the bureaus bundle payment behaviour into every paid company
report — but nobody who put the register on a shelf has found a buyer in eight weeks. That is the same signal that parked
the ABN extract (14 actors at 1–2 users) and the HMRC rates (a free rival): as a standalone dataset this parks.

## 3. The narrower shape: a field of the calls gankdat's buyers already make

gankdat's registers are keyed on the Companies House number: `uk-company-profiles` (the lookup), `uk-companies`,
`uk-insolvency`, `uk-sanctions`, `uk-sponsors`, `uk-charities` and `uk-contract-awards` are the seven registers the
/diligence agent reads for one counterparty, and the trademark-journal buyer's calls (30 of 37 on 11-11) name
companies. Payment behaviour is a diligence field — "will this customer pay me on time" is the question a supplier
asks about a large buyer — and it is the one field no free register page gives in one read: the official service
needs a search by name, a company page and a report page.

| Shape | Build | Notes |
| --- | --- | --- |
| `/v1/data/uk-payment-practices` — latest report and history by company number: average days to pay, % within 30 / 31–60 / 60+ days, % not paid within agreed terms, % disputed, shortest and longest standard terms, period and filing date, the report URL | 0.35 day: source file (parser over `csvRows`, Blind Mode drops the narrative and approver columns), registry entry, fixture, spec, landing card, terms row, sitemap, version bump | weekly wave (reports land twice a year per company; the export regenerates per request) — ≈ 115k rows at 863 bytes is 100 MB, under the charity extract's 160 MB / 400k rows in wave 3 and the SAM extract's 78 MB / 168k rows; `idOf(report_id)`, paced with `d1Pace` |
| `payment_practices` on `uk-company-profiles` | 0.1 day | the latest report's five numbers and filing date joined on the number at lookup time (one D1 read), null when the company is not a reporter |
| eighth register for /diligence | 0.05 day | add the slug to `REGISTERS` in `packages/landing/src/diligence-core.ts`; the agent's `query_uk_payment_practices` tool |
| Apify actor `uk-payment-practices` | 0.1 day | copied from an existing register actor |

**Total ≈ 0.6 day**, no key, no owner minutes, no new wave (wave 2 or 3 weekly).

## 4. Call

**Promote — as the narrow shape only.** None of the park conditions holds: every page carries OGL v3 and nothing
restricts automated reads; the export is one streamed file a wave already handles at this size; and the series' buyers
reach it through calls that exist — the company lookup and the diligence agent — so no new audience is needed. The
standalone-shelf numbers (1 user on the API, 1 user per actor) are a warning the item carries into its proof: this is
0.6 day of idle-slot work that makes every company read answer "pays in N days, M % late", not a new income line. Added
to `docs/pipeline/queues/gankdat.json` as `uk-payment-practices` (score 3, 0.6 day): the dataset route, the
`payment_practices` field on `uk-company-profiles`, the eighth /diligence register and the actor, weekly wave. Proof:
the field appears on a live `/v1/data/uk-company-profiles` read for a reporter (10881715) and null for a non-reporter;
at day 30 the Daily numbers show the route or the field read on at least one paid or keyed call, else the exchange notes
it as a field that costs nothing and the actor is left to the Store. Park trigger if the build slips: Experian's
per-report price or 193market's uptake changes nothing — the number that would park it is a wave that cannot finish
the 100 MB stream, which the charity extract says will not happen.
