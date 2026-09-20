# gankdat — candidate dataset research, September 2026

Researched 2026-09-20 from official documentation, licence pages and public
pricing pages only. No accounts were created. Gate applied to every candidate:

1. Official source, open licence allowing commercial reuse, no scraping
2. Buyers with money doing a recurring job
3. A paid competitor / paid adjacent product with a documented gap
4. Loadable into a Worker daily (bulk file or API within free limits; ≤ a few hundred MB)
5. Personal data avoidable or minimisable

Existing gankdat datasets for context: UK tenders, EU tenders (TED), UK planning,
UK sanctions, SAM.gov exclusions, Gazette insolvency, Companies House incorporations.

---

## 1. FCA Financial Services Register

**Source:** https://register.fca.org.uk/ (FCA). Developer portal
https://register.fca.org.uk/Developer/s/ (Salesforce SPA; docs only visible after login).

**Access model**
- Free "FS Register API" (still labelled BETA). Anyone can self-register with an
  email + basic details; the email becomes `X-Auth-Email`, key goes in
  `X-Auth-Key`. No approval step, no SLA. Source: FCA Register page
  https://www.fca.org.uk/firms/financial-services-register and the RES handbook
  https://www.fca.org.uk/publication/documents/register-extract-handbook.pdf
  (§1.13–1.19).
- The FCA states explicitly: *"The Register API is designed for individual
  look-ups rather than bulk data access. It currently supports queries for one
  entity at a time and is subject to rate limits. The current rate limit is 50
  requests per 10 seconds. We do not offer any 'premium' versions of the API,
  nor the ability to raise the limits"* (handbook §1.16–1.18).
- Endpoints: search by name/FRN/IRN/PRN, firm details, addresses, permissions,
  individuals, controlled functions, disciplinary history, passports, funds
  (community docs: https://financial-services-register-api.readthedocs.io/).

**Bulk download:** Only via the paid **Register Extract Service (RES)**, delivered
by Spectrum Data Management (SDM) weekly/monthly/one-off. Files cover firms,
individuals, permissions, appointed reps, etc.
https://www.fca.org.uk/firms/financial-services-register/data-extract

**Licence — this is the blocker**
- The Register is **not** under OGL. FCA's RPSI page: *"If you want to re-use
  extracts from the Financial Services Register … you will need to apply for a
  licence and a fee may apply."*
  https://www.fca.org.uk/legal/re-use-public-sector-information-regulations
- RES licence bands (handbook §2.9–2.17, fees §2.26–2.28, ex-VAT, as of 1 Apr 2026):
  - *Compliance use* (regulated firms only): £2,599/yr weekly firms-only; £8,663 firms+individuals. *"You are not permitted to share or re-sell the data."*
  - *Other: own business*: £9,445/yr weekly firms-only; £17,840 firms+individuals. Same no-share/no-resell clause.
  - *Re-sale use*: same price as above, plus obligations; derivative products only *"under a strict licence of use"* and only where the product's function is exclusively to establish whether entities are FCA-regulated / fulfil statutory obligations.
  - SDM adds £1,868.83/yr (weekly) or £1,162.18/yr (monthly) plus £233.60 for individuals; £250 for a one-off.
- API terms of use are behind the portal login and were not read; but the FCA's
  public position (single-entity look-ups, no bulk) makes crawling the API to
  build a mirror an obvious licence/ToS risk.

**Size / cadence:** ~60k+ authorised firms plus individuals; register updated
continuously; RES weekly. Personal data: individuals' names, IRNs, controlled
functions and disciplinary records — inherently personal data (FCA privacy notice:
https://www.fca.org.uk/privacy/personal-data-financial-services-register-services).

**Buyers & competitors**
- Buyers: KYB/AML onboarding at fintechs and payment firms, compliance teams,
  sales-intelligence vendors targeting IFAs/brokers.
- ComplyAdvantage: Starter from US$99.99/mo for 100 entities (third-party
  listings; https://beverified.org/providers/complyadvantage/). SmartSearch:
  quote-only (https://www.smartsearch.com/resources/faqs/how-much-does-smartsearch/cost).
  Encompass: no public pricing. Apify "FCA Register Scraper"
  (https://apify.com/danielainsworth/fca-register) shows demand for programmatic
  access — and shows the market is being served by scraping, which we won't do.
- Gap: nobody sells a cheap, licensed, bulk "who is FCA-regulated + change feed";
  the reason is the £9–18k/yr FCA licence, not lack of demand.

**Verdict: FAIL** — no open licence (OGL explicitly not applicable; commercial
re-use requires an FCA licence at £9,445–£17,840/yr + SDM fees), and the free API
is documented as single-entity look-up only. Revisit only if the FCA moves the
register to OGL (a 2023 TechSprint discussed this; nothing has shipped).

---

## 2. Energy Performance Certificates (England & Wales)

**Source:** MHCLG "Get energy performance of buildings data"
https://get-energy-performance-data.communities.gov.uk/ (replaced
epc.opendatacommunities.org on 30 May 2026; old URLs 301 to the new site).

**Access model**
- API and bulk download both require **GOV.UK One Login** (free, individual
  account, bearer token). Guidance:
  https://get-energy-performance-data.communities.gov.uk/guidance/energy-certificate-data-apis
- Rate limit: **6,000 requests per 5 minutes per IP**, 429 on breach
  (https://get-energy-performance-data.communities.gov.uk/api-technical-documentation).
- Old 5,000-page / 10,000-record caps were removed in Jan 2024; full-load
  download endpoints exist for domestic, non-domestic and DEC in CSV and JSON,
  plus monthly files for the last 12 months and yearly files back to 2008
  (https://mhclgdigital.blog.gov.uk/2024/01/29/changes-to-the-energy-performance-certificates-open-data-service).

**Size / cadence:** ~30 million certificates (blog, above). Full domestic
extract was ~5.6 GB on the old service; monthly "new certificates" files are
the Worker-sized unit (a month is roughly 150–200k certificates, tens of MB).
Published monthly (e.g. 30 Apr 2026 release covered certificates to 31 Mar 2026).

**Licence — mixed, with a purpose restriction on addresses**
https://get-energy-performance-data.communities.gov.uk/guidance/licensing-restrictions
- Non-address fields (ratings, energy figures, UPRN, dates, property attributes): **OGL v3**.
- Address fields (address 1–3, postcode) carry Ordnance Survey AddressBase / Royal
  Mail PAF rights. They may be used only for listed purposes: managing
  properties to promote energy efficiency, energy-efficiency research, evaluating
  improvement programmes, marketing government energy-efficiency programmes,
  supporting building transactions and occupier decisions, enforcement, local
  authority building control, crime prevention. Redistribution must carry the
  full copyright notice; anything else needs an OS/Royal Mail licence.
- Data-protection page states address-level EPC data **is personal data** under
  UK GDPR; every downloader becomes a data controller and MHCLG retains the
  email of everyone who accesses it
  (https://get-energy-performance-data.communities.gov.uk/guidance/data-protection-requirements).

**Buyers & competitors**
- Buyers: proptech (valuation, listings), retrofit/heat-pump installers (lead
  qualification: D–G rated homes), lenders (green mortgages, EPC-C rules for
  landlords), estate/letting agents.
- PropertyData API: £28/mo (2k credits) to £1,300/mo (500k), EPC included, rate
  12–72 requests/30s (https://propertydata.co.uk/api/pricing). Searchland:
  £195/seat/mo, 12-month minimum (https://searchland.co.uk/pricing). LandInsight
  Pro £150/mo (https://land.tech/pricing/landinsight/pro). Homedata: £1 per 100
  tokens PAYG (https://homedata.co.uk/guides/best-uk-property-data-api).
- Gap: none of them sells a **cheap change feed** ("new/updated EPCs this week
  by postcode district / rating band") for agents; they sell per-property
  look-ups or seat licences.

**Verdict: PASS WITH CONDITION** — build only the OGL fields plus UPRN and
postcode-sector/outward-code aggregation (drop address lines 1–3 and full
postcode), which sidesteps the Royal Mail purpose restriction and reduces the
personal-data surface; ingest the monthly files, not the 5 GB full load. Note
One Login is an individual account (owner action) — the token is used
server-side only.

---

## 3. FSA Food Hygiene Rating Scheme (FHRS)

**Source:** https://ratings.food.gov.uk/ and API https://api.ratings.food.gov.uk/
(Food Standards Agency; covers England, Wales, NI; Scotland's FHIS is included).

**Access model**
- API: **no registration, no key** (header `x-api-version: 2` required). Help:
  https://api.ratings.food.gov.uk/help and
  https://www.food.gov.uk/food-hygiene-rating-scheme-api-version-2.
  No rate limit documented.
- Bulk: XML per local authority (all ~380), refreshed daily, plus a single
  all-UK CSV `https://ratings.food.gov.uk/api/open-data-files/FHRS_All_en-GB.csv`
  — **612,609 establishments, 145 MB** (HEAD request 2026-09-20; page
  https://ratings.food.gov.uk/open-data). Well inside the Worker/R2 budget.

**Licence:** **OGL v3** for ratings data
(https://ratings.food.gov.uk/terms-and-conditions). Rating *imagery* (the
sticker artwork) has separate rules — don't reproduce the badges. Terms
require that displayed ratings be current; a daily refresh satisfies that.

**Personal data:** Business name and address only; FSA already withholds
address/geocode when a business trades from a private address. Some sole-trader
business names are personal names — same profile as Companies House data we
already serve. Minimal.

**Buyers & competitors**
- Buyers: food-delivery platforms (onboarding checks), hospitality wholesalers
  and EPOS/booking vendors (new-opening leads), commercial insurers (risk
  signal), pest-control/cleaning/consultancy (lead-gen on 0–2 ratings),
  franchisors (estate monitoring).
- Paid adjacent products are all **Apify scrapers** of this same API, e.g.
  "UK Food Business Leads — New Openings & Hygiene Fails" at US$1 per 1,000
  records, explicitly pitched at wholesalers, EPOS, insurers, pest control
  (https://apify.com/wellbuilt_zythem/uk-food-business-leads), plus several
  others (https://apify.com/spookyweb/uk-food-hygiene-ratings). Their own copy
  admits the product is *"assembling it across 363 councils"* — i.e. the
  normalisation and change detection, not the data.
- Gap: no maintained, official-source **event feed** (new registrations awaiting
  inspection, rating drops, rating recoveries, deregistrations) with stable
  identifiers (FHRSID) and a clear licence. That is exactly gankdat's pattern.

**Verdict: PASS** — OGL, keyless, 145 MB daily file, event-shaped, existing
paid demand on Apify with a documented gap (no official-source diff feed).

---

## 4. Charity Commission for England & Wales register

**Source:** https://register-of-charities.charitycommission.gov.uk/ ; API portal
https://api-portal.charitycommission.gov.uk/ ; daily extract
https://register-of-charities.charitycommission.gov.uk/en/register/full-register-download

**Access model**
- API: free, but needs a Developer Hub account and product subscription to get
  an `Ocp-Apim-Subscription-Key` (Azure API Management). Rate/quota limits are
  "specified in the Developer Hub" — not visible without login; third-party
  clients confirm 429s occur
  (https://api-portal.charitycommission.gov.uk/terms).
- **Bulk extract needs no account**: daily zips on public Azure blob storage in
  JSON and tab-delimited forms — `charity.zip` 57 MB, `charity_trustee.zip`
  25 MB, `charity_annual_return_parta.zip` 28 MB, plus classification, area of
  operation, governing document, event history, other names, other regulators,
  policy, published report, annual return history/part B. All `Last-Modified`
  2026-09-20 01:08 UTC (HEAD requests) — genuinely daily.

**Licence:** **OGL v3** on both the API and extract; API terms add: acknowledge
the source, don't misrepresent it, comply with UK GDPR as controller, consent
required before marketing use of personal data, delete on Commission notice.

**Size:** ~170k registered charities (extract ~100 MB uncompressed per the NCVO
guide https://github.com/ncvo/charity-commission-extract/blob/master/beginners-guide.md).

**Personal data:** `charity_trustee` is trustee names (personal data, but the
Commission publishes it under OGL by statute). Charity contact fields may
include personal emails for tiny charities. Both are separable files — we can
ship charity-level data and financials and leave trustees out, or ship trustee
names only as a distinct, clearly-labelled endpoint.

**Buyers & competitors**
- Buyers: grant-makers and foundations (due diligence before award), fundraising
  and CRM SaaS (Beacon £30–£230/mo, https://www.beaconcrm.org/pricing), corporate
  giving/payroll-giving platforms, AML/KYB vendors (charities as counterparties),
  prospect-research tools.
- Free competitors are strong: CharityBase (free GraphQL, https://charitybase.uk/),
  Find that Charity (free, https://findthatcharity.uk/about), Charity Excellence
  Data Finder (free). Paid: ukcharityapi.co.uk (pricing not public), GiveRadar and
  an Apify "Nonprofit Due Diligence" MCP at US$0.10/call.
- Gap: the free tools are snapshots/search; nobody sells a **daily register
  change feed** (new registrations, removals, income-band changes, late filers,
  new trustees) which is the recurring job for grant-makers and KYB.

**Verdict: PASS WITH CONDITION** — use the keyless daily extract (not the
account-gated API); ship charity + financial + classification tables first;
trustee names only as a separate opt-in endpoint with the OGL/GDPR notice.
Expect pricing pressure from CharityBase/Find that Charity — the sellable
unit is the diff feed and freshness, not the lookup.

---

## 5. DVSA MOT history API / DVLA Vehicle Enquiry Service

**DVSA MOT History API** (https://documentation.history.mot.api.gov.uk/)
- Registration open to organisations *or individuals*; name, email, postal
  address; manual review up to 5 working days
  (https://documentation.history.mot.api.gov.uk/mot-history-api/register).
- Auth: OAuth2 client-credentials via Microsoft Entra ID (60-min tokens) plus
  `X-API-Key`; secrets expire every 2 years; keys revoked after 90 days idle.
- Rate limits: 500,000 requests/day, 15 rps average, burst 10
  (https://documentation.history.mot.api.gov.uk/mot-history-api/rate-limits/).
- Licence: OGL v3 stated on every page; privacy notice classes vehicle/test data
  as non-personal, with the usual caveat that combining it with a keeper makes
  you a controller.
- **Bulk exists**: weekly full bulk (gzip JSON, ~500k records per file; example
  `fileSize` 19,778,478,487 bytes ≈ 18.4 GB) plus daily 24-hour deltas
  (https://documentation.history.mot.api.gov.uk/mot-history-api/download-vehicle-mot-history-data/files/).
  The bulk file is two orders of magnitude over gankdat's load budget; the
  daily delta (all vehicles created/updated in 24 h, full test history each)
  is plausibly a few hundred MB but is keyed by VRM, i.e. per-vehicle lookups.

**DVLA Vehicle Enquiry Service** (https://developer-portal.driver-vehicle-licensing.api.gov.uk/)
- **"Registration closed. We are currently not accepting new VES API
  registrations"** while DVLA upgrades systems (portal and
  https://register-for-ves.driver-vehicle-licensing.api.gov.uk/). One key per
  company. Per-VRM lookup only; VRMs must be posted in the body because the ICO
  deems them sensitive. OGL stated, but there is no bulk product at all.

**Buyers & competitors:** motor trade, insurers, fleet, used-car marketplaces.
Resellers price per lookup: CheckCarDetails MOT history £0.02, UK vehicle data
£0.10, car history check £1.82, £20/mo minimum
(https://api.checkcardetails.co.uk/); Vehicle Data Global / UKVehicleData and
HPI are quote-only. The market is a per-VRM lookup market served by many
resellers at pennies — no gap gankdat can occupy with a dataset product.

**Verdict: FAIL** — DVLA VES is closed to new registrations and per-VRM only;
DVSA MOT is open and OGL but the product shape is per-vehicle lookup on an
18 GB weekly bulk, which fails the load budget and offers no differentiation
against £0.02/lookup resellers. (The only bulk-shaped angle — the DfT
anonymised annual MOT results on data.gov.uk — is a research file, not a
recurring B2B job.)

---

## 6. Other official datasets encountered that fit the gate better

**6a. Home Office Register of Licensed Sponsors (Workers)** —
https://www.gov.uk/government/publications/register-of-licensed-sponsors-workers.
Single CSV, **10.4 MB**, republished almost every working day (latest 18 Sep 2026);
organisation name, town, county, licence type/route, rating (A/B). Standard
GOV.UK publication → OGL v3. No personal data (organisations only). Buyers:
immigration law firms, recruiters and job boards ("does this employer sponsor?"),
HR/onboarding SaaS, international-student services. Paid/adjacent products:
sponsorlist.co.uk, licensed-sponsors-uk.com, MyVisaJobs — all re-serve this CSV
as search sites; none offers a licensed **daily diff API** (new licences, rating
downgrades, revocations), which is the recurring job for recruiters and lawyers.
Trivial to load. **PASS** — the cheapest build on this list.

**6b. HM Land Registry Price Paid Data (monthly update file)** —
https://www.gov.uk/guidance/about-the-price-paid-data. OGL v3 for the transaction
data; monthly change-only file ≈ 18 MB (yearly files 115–230 MB); published on
the 20th working day each month, with add/change/delete status flags. Address
fields carry a Royal Mail/OS condition: use is permitted for *"personal and/or
non-commercial use"* and *"to display for the purpose of providing residential
property price information services"* — a property-price API is inside that
purpose. Buyers: proptech, lenders, agents, surveyors. Competitors: PropertyData,
Searchland, Homedata (above). Gap is thin (everyone has PPD), but pairing PPD
with EPC by UPRN/postcode is the combination the £150–£195/mo tools charge for.
**PASS WITH CONDITION** (address use only for property-price display).

**6c. CQC care directory (England)** — https://www.cqc.org.uk/about-us/transparency/using-cqc-data.
Weekly CSV of every regulated location (hospitals, care homes, GPs, dentists,
homecare), monthly variants with ratings and bed counts; OGL v3 with attribution.
Syndication API needs a free portal subscription key; a "partner code" lifts the
limit to 2,000 req/min. Personal data limited to registered-manager names in the
filtered file (droppable). Buyers: care-sector recruiters, medical suppliers,
insurers, healthtech vendors, care-home brokers. Adjacent paid products are again
Apify scrapers; no official-source **rating-change/new-registration feed**.
**PASS** — same shape as FHRS but a smaller, richer-margin buyer set.

---

## Ranked shortlist

1. **FSA Food Hygiene Ratings (FHRS)** — PASS. OGL, keyless, 145 MB daily CSV,
   612k establishments, event-shaped (new openings, rating drops), existing paid
   demand on Apify at US$1/1k records with no official-source diff feed.
2. **Home Office Register of Licensed Sponsors** — PASS. 10 MB daily CSV, OGL,
   zero personal data, a dozen search sites monetising it with no diff API.
   Half-day build.
3. **Charity Commission register (daily extract)** — PASS WITH CONDITION.
   Keyless daily OGL extract; ship the diff feed; keep trustee names separate.
4. **CQC care directory** — PASS. Weekly OGL CSV, clear buyer set, no feed product.
5. **EPC England & Wales** — PASS WITH CONDITION. Strong buyers, but One Login,
   Royal Mail address restriction and "address-level = personal data" mean an
   OGL-fields-only, monthly-file build. Best paired with PPD later.
6. **HM Land Registry PPD** — PASS WITH CONDITION. Commodity data; only worth it
   as the EPC pairing.
7. **DVSA MOT / DVLA VES** — FAIL (per-VRM lookups, 18 GB bulk, VES closed).
8. **FCA Register** — FAIL (no open licence; £9–18k/yr re-use licence).

## Build first: FSA Food Hygiene Ratings

Reasons: it is the only candidate that passes every gate clause with no
condition; ingestion is one 145 MB CSV a day with no account or key; the buyer
set (delivery platforms, wholesalers, EPOS, insurers, pest control) already pays
for this exact data on Apify and is served today by scrapers of an API we can
use officially; the sellable unit — "what changed since yesterday, by local
authority and rating band, keyed by FHRSID" — is the same diff-feed pattern as
gankdat's tenders and insolvency datasets, so it reuses the existing Worker/KV/D1
ingestion and pricing without new infrastructure. The Sponsor Register should
follow immediately as a near-zero-cost second dataset.
