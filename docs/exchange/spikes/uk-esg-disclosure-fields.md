# Spike: the modern slavery statement registry and the gender pay gap service as ESG fields on the gankdat company lookup

Queue item `new-ventures/spike-uk-esg-disclosure-fields` (burn-down, 2026-11-12 17:24–17:30 UTC; seeded at 17:17 by the
same slot's exchange pre-research, the night's one pass under the three-spikes shelf cap). Sources: four fetch-relay
rounds — `docs/relay/responses/pre-research-esg-registers-2026-11-12` (both services' home and download pages, the
first 2 MB of the 2024/25 pay gap file, the registry's data page), `…-b` (the Apify Store API for three phrases,
Beauhurst's post, the registry's privacy notice, the GOV.UK start page), `…-c` (HEAD and the first 16 KB of the 2027
statement summaries file, HEAD of 2026, the registry's search page) and `esg-spike-2026-11-12` (three 2 MB Range
reads of the 2026 statement summaries file — head, middle, tail — HEADs of the 2025, 2024 and 2020 files, the first
2 MB of the 2025/26 pay gap file) — plus the GitHub search API, the npm registry and five WebSearch reads from the
sandbox. Analysis script: a quoted-newline CSV parse over the sampled chunks (addresses span lines).

## 1. The sources (relay 11-12)

**Licence.** Every page of both services ends `All content is available under the Open Government Licence v3.0,
except where otherwise stated. © Crown copyright` (gender pay gap home and download pages; registry home, data,
download and search pages). Neither service has an access-terms page; the registry's privacy notice says only that
the name and job title of the director who signed each statement are published — a column Blind Mode drops.
Nothing on either file says otherwise than OGL.

**Modern slavery statement registry** (Home Office; section 54 of the Modern Slavery Act 2015 makes the statement a
statutory duty at £36m turnover; the registry itself is voluntary, so absence is never non-compliance). Home page
counts: 34,379 organisations registered, 24,026 unique statements; by registry year 2019: 80, 2020: 8,486, 2021:
15,404, 2022: 10,241, 2023: 11,027, 2024: 13,063, 2025: 13,606, 2026: 11,861, 2027: 163. One CSV a registry year at
`downloads.modern-slavery-statement-registry.service.gov.uk/publicdownloads/StatementSummaries<year>.csv`
(octet-stream, Range honoured — 206 on every chunk — no Content-Disposition): 2020 8,503,687 bytes, 2024 17,830,777,
2025 18,980,536, 2026 16,875,091, 2027 263,925. The files are regenerated: the 2026 file's Last-Modified read
17:00:04 at 17:16 and 17:16:41 at 17:24, the 2025 and 2024 files 17:16:03 and 17:15:24 — so a wave can refresh a
registry year by re-reading its file, and the data page's "updated daily" holds. 75 columns: StatementYear,
OrganisationName, Address, SectorType, **CompanyNumber**, LastUpdated, GroupSubmission, ParentName, StatementURL,
EmailAddressNoURL, StatementSummaryURL, StatementStartDate, StatementEndDate, ApprovingPerson, DateApproved, six
`StatementIncludes…` yes/no answers with their `No…Reason` texts, OrganisationSectors, PublicSectorAuthorities,
Turnover (band), YearsProducingStatements, Policies, Training, WorkingConditionsEngagement, SocialAudits,
GrievanceMechanisms, three Risk blocks (area, tier, group, location, mitigation), ILO indicators, DemonstrateProgress,
PDFDate, PDFURL. Sampled 4,241 complete statements of the 2026 file (three 2 MB chunks, 36 %): SectorType Private
4,181 / Public 60; **3,857 of the 4,181 private statements carry a Companies House number (92 %)**, 3,846 distinct;
GroupSubmission Yes 3,604 (85 % — the parent's statement covers the group, ParentName filled); Turnover bands: over
£500m 1,594, £100–500m 1,555, £60–100m 493, £36–60m 452, under £36m 147 (voluntary filers); YearsProducingStatements
more than 5 years 3,154, 1–5 years 1,013, first time 74; StatementIncludesDueDiligence Yes 4,175 (98 %),
RisksAssessment Yes 4,129; a PDF on the registry for every statement and a StatementURL on 4,181; LastUpdated
2025-08-05 → 2026-11-10. ≈ 1,471 bytes a statement → the 2026 file holds ≈ 11,470 statements (the data page says
11,861 — the rest are the public-sector rows' longer address blocks and rounding).

**Gender pay gap service** (Government Equalities Office; every employer of 250+ must report by 4 April, public
sector by 30 March). One CSV a reporting year at `gender-pay-gap.service.gov.uk/viewing/download-data/<year>`
(HEAD 405, Range ignored, `Content-Disposition: attachment; filename="UK Gender Pay Gap Data - 2025 to 2026.csv"`):
2017 4.27 MB, 2018 4.33, 2019 2.8, 2020 4.08, 2021 4.01, 2022 4.11, 2023 4.21, 2024 4.26, 2025 4.21, 2026 215 KB
(open). 27 columns: EmployerName, EmployerId, Address, PostCode, **CompanyNumber** (the glossary: "Company number of
the employer as listed on Companies House. Private and voluntary sectors only"), SicCodes, DiffMeanHourlyPercent,
DiffMedianHourlyPercent, DiffMeanBonusPercent, DiffMedianBonusPercent, Male/FemaleBonusPercent, the eight quartile
columns, CompanyLinkToGPGInfo, ResponsiblePerson, EmployerSize (six bands), CurrentName, SubmittedAfterTheDeadline,
DueDate, DateSubmitted. First 2 MB of the 2025/26 file: 5,327 rows, **4,707 with an 8-character CompanyNumber
(88 %)**, 345 submitted after the deadline; of the 2024/25 file: 5,311 rows, 4,719 with a number; 4,984 of the 5,327
2025/26 employers (94 %) appear in the 2024/25 head — the series is a stable yearly panel keyed on EmployerId.
≈ 393 bytes a row → the 4.21 MB file holds ≈ 10,700 rows (secondary sources: 10,163–10,700 employers for 2024/25).

## 2. Who sells the series (relay 11-12, registries, WebSearch)

| Seller | Shape | Price | Uptake |
| --- | --- | --- | --- |
| Beauhurst | pay gap data as a field of its company platform ("Beauhurst subscribers now have access to the Government Equalities Office gender pay gap data for all qualifying UK companies", 2022-08-17) | demo-priced platform | n/a |
| Sedex | ethical-trade membership whose first line is the modern slavery statement | £195 a site a year supplier-side; buyers from £2,900 a year (set-up £2,402) | n/a |
| EcoVadis | supplier sustainability ratings | quoted US$15–40k a year for a buyer assessing 50–100 suppliers; supplier Basic ≈ €430 | n/a |
| Apify Store, gender pay gap (16 hits) | five UK actors — siteverdict, accountable_eel, tabulary, nexgensignal, noahadler — all pay-per-event | per event | 1 user/30 d each |
| Apify Store, modern slavery (5 hits) | siteverdict and tabulary registry actors; stefano_seggio's compliance feed | per event | 1 user/30 d each |
| wooden_scanner_c1n `uk-supplier-transparency-pack` | "Payment, Pay Gap, Slavery" — the three statutory disclosures bundled | per event | 1 user/30 d |
| GitHub | 67 gender pay gap repos (analysis, top 7 stars); 1 registry repo (stefanoseggio's delta monitor, "from $0.01/event", pushed 11-09, 0 stars) | — | — |
| npm | no package for either series | — | — |

Buyers pay for both series inside platforms (ESG screening, supplier onboarding, public-tender checks — PPN 02/23
asks for the statement); every shelf copy of the raw files sits at 1 user. The same picture the payment practices
spike found: a standalone dataset parks, the join is the product.

## 3. The narrower shape: two fields of the calls gankdat's buyers already make

- `esg` on `uk-company-profiles`: `modern_slavery` { statement_year, period_end, group_submission, parent_name,
  turnover_band, sectors, includes (org structure, policies, risk assessment, due diligence, training, goals),
  years_producing, statement_url, registry_pdf_url } and `gender_pay_gap` { reporting_year, mean_hourly_pct,
  median_hourly_pct, mean_bonus_pct, median_bonus_pct, employer_size, submitted_late } — null when the company is in
  neither file; the latest year of each, exact-number join like `payment_practices`.
- `/v1/data/uk-modern-slavery-statements` and `/v1/data/uk-gender-pay-gap` by company number (history across years),
  the x402 and MCP lanes, Blind Mode (drops ApprovingPerson, EmailAddressNoURL, ResponsiblePerson, the free-text
  reasons and the three risk narratives — organisation level only).
- Two D1 registers: `idOf(company_number|statement_year)` (a public-sector row with no number keys on the
  organisation name) and `idOf(employer_id|reporting_year)`.
- One wave: the two open registry-year statement files (≈ 17 MB each, read in 2 MB Range chunks across paced
  waves by byte offset — the zip.ts/csv.ts offset pattern) and the two latest pay gap files (4 MB, one pass each);
  the backfill of 2020–2025 statements (≈ 90 MB) and 2017–2023 pay gap (≈ 28 MB) as a second dated item.
- A tenth /diligence register: "modern slavery statement on the registry for 2026 (group statement under <parent>)"
  or "no statement on the registry (voluntary registry; section 54 applies at £36m turnover)" plus "gender pay gap
  2025/26: mean X %, median Y %" — facts, never a compliance verdict.
- An Apify actor `uk-esg-disclosures`. Build: 0.8 day (payment practices was 0.6 for one register; two files, two
  routes, the field, the diligence register).

## 4. Call

**Promote** as gankdat `uk-esg-disclosures` (3, 0.8 day). No park condition holds: CompanyNumber coverage is 92 %
and 88 % of private-sector rows (the bar was half), every page and file is OGL v3, the 17 MB files are read by Range
and regenerate hourly so a wave refreshes by registry year, and the buyer path is the one the payment practices field
already uses — the diligence page, the company lookup and the trademark-journal buyers. Day-30 proof as for payment
practices: the routes or the field on ≥ 1 paid or keyed external call, else they stay free fields and the actor is
left to the Store. The honest ceiling: every shelf copy has one user; the field's value is that a counterparty
check answers "pays in 31 days, 39 % late; modern slavery statement 2026 filed; pay gap 11 %" from one call.
