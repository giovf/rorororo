# Niche research 2026-09 (B): next candidate datasets

Date: 2026-09-20. Desk research on official pages only; nothing signed up for.

Gate (from the brief): official source · open licence allowing commercial reuse (OGL v3 or
equivalent) · no scraping · no account/key to fetch (or one any business gets instantly) ·
bulk file or API a Cloudflare Worker can load daily (≤ ~300 MB) · personal data avoidable ·
buyers with money doing a recurring job, with paid competitors or paid adjacent products.

Existing gankdat sources for overlap checks: `uk-tenders` pulls **Find a Tender** only
(`src/sources/uk-tenders.ts`, above-threshold notices); CQC directory covers regulated care
providers (not community pharmacies, not schools).

---

## 1. DfE GIAS + Ofsted inspection outcomes (England) — **PASS — SHIPPED 2026-09-21 as `uk-schools`**

- **GIAS bulk download** — https://get-information-schools.service.gov.uk/Downloads
  Daily CSV, no login. "All establishment data" 61.7 MB; state-funded schools 8.9 MB;
  academies/free schools 5.0 MB; MAT/SAT membership history 8.5 MB; trust/sponsor links
  4.5 MB. Footer: "All content is available under the Open Government Licence v3.0".
  Fields: 250+ per establishment (URN, name, type, phase, status, LA, address, postcode,
  phone, website, capacity, pupil numbers, trust, open/close dates).
- **Ofsted management information** — https://www.gov.uk/government/statistical-data-sets/monthly-management-information-ofsteds-school-inspections-outcomes
  Monthly (~2nd week after month end), CSV ~16 MB "latest inspections" + smaller
  year-to-date file. GOV.UK publication, OGL v3. Keyed by URN so it joins to GIAS.
- **Personal data:** GIAS carries `HeadTitle/HeadFirstName/HeadLastName` and the
  Governors files (32 MB) are entirely personal data. Drop the Head* columns, skip the
  governors files. Ofsted MI is organisation-level (no names).
- **Buyers:** edtech and school suppliers, tutoring companies, teacher recruiters, MAT
  analysts. Paid list vendors exist for exactly this (UK Schools Data "30k records",
  Oscar Research, RD Marketing, More Than Words — all sell GIAS-derived lists with
  contacts bolted on). Apify has ≥5 Ofsted actors (parseforge $0.021/result, 3 users;
  solidcode "22,000+ schools… official GOV.UK data updated monthly"; automation-lab
  "from official GOV.UK CSV").
- **Fit:** two-file join, daily/monthly cadence, well under 300 MB, OGL, no account.
  Competitor evidence is real but thin on Apify (single-digit users per actor).

## 2. NHS ODS (GP practices, pharmacies, trusts, dentists) — **PASS**

- **ORD API** — https://digital.nhs.uk/developer/api-catalogue/organisation-data-service-ord
  Base `https://directory.spineservices.nhs.uk/ORD/2-0-0/`. "Open-access… no
  authentication, authorization, or onboarding required." Fair use "below 5 requests per
  second". `organisations?LastChangeDate=YYYY-MM-DD` gives incremental changes
  (https://digital.nhs.uk/services/organisation-data-service/organisation-data-service-apis/technical-guidance-ord/search-parameters).
  JSON by default.
- **CSV downloads** — https://digital.nhs.uk/services/organisation-data-service/export-data-files/csv-downloads
  Nightly-refreshed full files by type (epraccur GP practices, edispensary, etrust,
  egdpprac dental, epharmacyhq / pharmacy, non-NHS providers); each file is single-digit MB.
- **Licence:** OGL v3 (data.gov.uk listing
  https://www.data.gov.uk/dataset/e31e746e-2c0d-428d-9e8e-6edd0713e16e/…; Apify actor
  also cites OGL v3). Personal data: **avoid `egpcur`/practitioner files** (named GPs) and
  the FHIR practitioner endpoints; the organisation files are org-level only.
- **Buyers:** medical/device suppliers, pharma field teams, healthtech (GP-integration
  vendors), locum/recruitment agencies, pharmacy wholesalers. Apify: nomad-agent
  "NHS Providers Scraper" ($1/1,000, 2 users, 0 monthly), dromb "NHS UK GP, Dentist &
  Pharmacy scraper". Commercial GP/pharmacy lists sold by the usual list brokers.
- **Fit:** cleanest technical fit of all candidates (open API + delta by date). Demand
  evidence weaker than schools/contracts; partial overlap with CQC directory for GP
  practices and dentists — the new value is pharmacies, trusts, and ODS codes/hierarchy.

## 3. HMRC "Check a UK VAT number" API — **FAIL**

https://developer.service.hmrc.gov.uk/api-documentation/docs/api/service/vat-registered-companies-api/2.0
Per-VAT-number lookup only; v2 is application-restricted (Developer Hub registration
"around 2 weeks", sandbox test, Terms of Use 2.0); no bulk file. Cannot be turned into a
dataset; at most a pass-through lookup, which is not gankdat's model.

## 4. HM Land Registry CCOD / OCOD — **FAIL (licence)**

- Access: account + licence acceptance required
  (https://use-land-property-data.service.gov.uk/datasets/ccod). Monthly on the 2nd
  working day; full + change-only CSV. CCOD "more than 3.2 million records", OCOD
  "approximately 100,000 records" (tech specs …/datasets/ccod/tech-spec, …/ocod/tech-spec).
  No private individuals — personal data is avoidable.
- Licence (https://use-land-property-data.service.gov.uk/datasets/ccod/licence/view), clause 3:
  - "HMLR Information Restrictions: You must not … publish, commercially exploit, sell,
    license or distribute the whole or any part of the Information as a Standalone
    Licensed Product Or Service" — this is exactly what a data API is.
  - "… use the Information for the purposes of direct marketing" — kills the lead-gen buyer.
  - Addresses are OS AddressBase/PAF-derived: without a PSGA licence, use of addresses
    must be "personal and/or non-commercial", land management, or crime prevention;
    anything else needs Royal Mail permission.
  - Audit and End-User Record obligations.
- Paid competitors exist (landregistry.company £1/search, £9/mo; Homedata OCOD tokens
  £50–500/mo; OC Corporate trial → subscription), so demand is proven, but they must hold
  bespoke HMLR/Royal Mail terms. Not doable under the open licence; park.

## 5. Contracts Finder awarded contracts — **PASS — SHIPPED 2026-09-21 as `uk-contract-awards`**

- **API** — `GET https://www.contractsfinder.service.gov.uk/Published/Notices/OCDS/Search`
  (https://www.contractsfinder.service.gov.uk/apidocumentation/Notices/1/GET-Published-Notice-OCDS-Search).
  No authentication; params `publishedFrom`, `publishedTo`, `stages=award`, `limit` (≤100),
  `cursor`. Response is an OCDS release package whose `license` field is the OGL v3 URL.
  Rate limit: 403 → wait 5 minutes. A daily `publishedFrom=yesterday` sweep is a few
  hundred releases — trivially inside Worker limits. (The authenticated Sid4Gov/OAuth part
  of the API is only for publishing notices, not needed.)
- **Content:** award releases carry `awards[].suppliers[]` (name, Companies House id when
  supplied), value, dates, buyer, CPV codes, contract period → supplier index and
  contract-expiry pipeline. Personal data: buyer contact name/email in `parties[].contactPoint`
  — drop at ingest (same Blind Mode as `eu-ted`).
- **Coverage:** below-threshold and all-values notices from non-devolved authorities
  (£12k central / £30k wider public sector), i.e. a different, larger population than
  Find a Tender, which `uk-tenders` already serves.
- **Buyers / competitors:** sales-intelligence is a paid category — Stotles Basic
  £50/user/mo, Growth from £475/mo (https://www.stotles.com/data); Tussell, Tracker, PSIP
  sell the same awards + expiries. Apify has the deepest bench of any candidate:
  ciel_labs (14 users / 9 monthly, $0.008/record), civicrows "Official OCDS API",
  parseforge, benthepythondev, publicdata, nexgensignal, datadeltas, conceivable_extension.
- **Fit:** open API, OGL declared in-band, incremental by date, reuses the OCDS parser
  from `uk-tenders`/`eu-ted`, cross-sells to existing tender buyers.

## 6. Other candidates (one paragraph each)

- **Environment Agency EPR Waste Sites / Industrial Sites — PASS WITH CONDITION.**
  Daily ZIP from https://environment.data.gov.uk (data.gov.uk listing
  https://www.data.gov.uk/dataset/e2cc8101-d8b7-434d-a26a-9115061bb57c/…) with permit
  number, operator, site, activity. Published under the *Environment Agency Conditional
  Licence*, not OGL: one-year term with auto-termination, attribution, and an explicit
  "contains personal data" warning (sole-trader operators). Buyers: waste brokers,
  environmental consultants, insurers, ESG due diligence. No paid competitor found on
  Apify. Condition: read the Conditional Licence in full for commercial-redistribution
  wording before building; drop individual-name operators.
- **DVSA active MOT test stations — PASS (low value).** 2.29 MB CSV, OGL v3
  (https://www.data.gov.uk/dataset/87de9bf8-b936-44ff-89c4-f69f8f9bb9c1/mot-test-centres;
  file https://www.gov.uk/csv-preview/676437ba3229e84d9bbde8f5/active-mot-stations.csv).
  Name, address, phone, vehicle classes; org-level. Refreshed irregularly. Buyers: garage
  equipment and parts suppliers, automotive SaaS. Cheap one-afternoon add-on, but no
  paid competitor and a static list — bundle, don't lead with it.
- **Gambling Commission registers — PASS WITH CONDITION.** Businesses register (2,639
  operators), premises and regulatory-action datasets downloadable as CSV/Excel/ZIP,
  updated daily, no login (https://www.gamblingcommission.gov.uk/public-register/businesses;
  data.gov.uk lists the operator register under OGL). Skip the personal-licence register
  (individuals). Buyers: payments/KYB risk teams, affiliate compliance, gambling-sector
  suppliers. Small but genuinely compliance-shaped; condition: confirm OGL statement on
  the Commission's own site or data.gov.uk record before publishing.
- **SIA register of licence holders — FAIL.** Individual-by-individual checks only, no
  bulk file or API ("does not currently provide a public API… improvements… under
  consideration", https://www.gov.uk/government/publications/if-the-sia-does-or-will-provide-apis-for-licence-checks/…);
  entirely personal data.
- **Electoral Commission donations — PASS WITH CONDITION.** CSV endpoint
  `https://search.electoralcommission.org.uk/api/csv/Donations?…` (no key), fields include
  ECRef, RegulatedEntityName, DonorName, Value, AcceptedDate. API terms are OGL-based and
  allow commercial exploitation (https://api.electoralcommission.org.uk/terms/) but are
  written for the separate Election Information API. Individual donor names are public
  register data but still personal data; buyers (PEP/AML screening, journalists) are
  narrow. Condition: restrict to company/unincorporated-association donors.
- **Ofcom Wireless Telegraphy Register — PASS WITH CONDITION.** WTR CSV still offered
  from the Spectrum Information Portal
  (https://www.ofcom.org.uk/spectrum/frequencies/spectrum-information-portal); data.gov.uk
  record is OGL v3 but its snapshot dates from 2017 and cadence is unstated. Licensee
  names include individuals for some products. Buyers (RF equipment vendors, telecom
  site acquisition) are niche and no paid competitor was found. Park.

---

## Ranked shortlist

| # | Dataset | Verdict | Why |
|---|---------|---------|-----|
| 1 | Contracts Finder awards + supplier index | PASS | Open OCDS API, OGL in-band, incremental daily, strongest paid demand (Stotles £50–475+/mo, Tussell, 8+ Apify actors), reuses OCDS code, cross-sells to tender buyers |
| 2 | GIAS + Ofsted outcomes | PASS | OGL, daily 62 MB + monthly 16 MB, URN join; paid list vendors and 5+ Apify actors; drop Head*/governors |
| 3 | NHS ODS organisations | PASS | Open API with delta-by-date, OGL, tiny files; buyer evidence thinner, partial CQC overlap |
| 4 | Gambling Commission registers | PASS w/ condition | Daily CSV, compliance buyer, confirm licence |
| 5 | EA EPR permits | PASS w/ condition | Daily ZIP but Conditional Licence + personal data |
| 6 | DVSA MOT stations | PASS (low) | Trivial, static, bundle only |
| — | Electoral Commission, Ofcom WTR | PASS w/ condition | Narrow buyers; park |
| — | CCOD/OCOD, HMRC VAT, SIA | FAIL | Licence forbids standalone product / per-lookup only / no bulk |

## Build first: Contracts Finder awards

Reasons: (1) zero-friction official API with the OGL declared in every response — the
cleanest licence position of any candidate; (2) the only candidate where paid buyers are
already paying subscription prices for exactly this data (Stotles, Tussell, Tracker) and
where Apify actors show real monthly users; (3) daily incremental fetch is a few hundred
releases, far under Worker limits; (4) ~1 day of work because the OCDS parser, Blind Mode
contact stripping, and actor scaffold already exist for `uk-tenders`/`eu-ted`; (5) it
extends the existing tender buyer's job (who won, when does it expire) rather than opening
a new market. Second build: GIAS + Ofsted, which is the best standalone lead-gen dataset
and needs only two file downloads and a URN join.
