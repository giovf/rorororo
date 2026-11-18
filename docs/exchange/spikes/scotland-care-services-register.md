# Spike: Scotland's care services register as a second nation of gankdat's care register

Queue item `new-ventures/spike-scotland-care-services-register` (burn-down, 2026-11-18 18:39–18:46 UTC; seeded at
18:39 by the same slot's exchange pre-research with no spike open). Sources: two fetch-relay rounds —
`docs/relay/responses/spike-scot-care-2026-11-18` (the Care Inspectorate's datastore page, two library pages, its home
page, the two CQC actors' Apify pages, one Apify Store search) and `spike-scot-care-b-2026-11-18` (HEAD and the first
8 kB of the January 2026 CSV, one more library page) — plus five WebSearch reads from the sandbox and gankdat's Daily
numbers row of 2026-11-18. Relay bodies are pruned after 7 days; every number used is copied here.

**Call: park.** The source is as good as an open register gets; the demand it would extend is not there.

## 1. Licence — open, in the source's own words

- Datastore page: "Unless otherwise stated, all content is available under the Open Government Licence."
- Each monthly library page (31 October 2025, 31 January 2026): "All content is available under the Open Government
  License (https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/) , unless otherwise stated."
- The CSV carries no terms of its own in its first 8 kB (a header row, then data). OGL v3 allows commercial re-supply
  with attribution; nothing bars it.

## 2. The file

| Fact            | Reading                                                                                                  |
| --------------- | -------------------------------------------------------------------------------------------------------- |
| URL shape       | `ci-web-media-production-bucket.s3.eu-west-2.amazonaws.com/assets/resources/datastore/260131datastoreexternal.csv` (`YYMMDD`), linked from a library page per month |
| Size            | 12,049,170 bytes, `text/csv`, plain GET, no key                                                          |
| Rows            | not counted — only 8 kB was read; at the 1.0–1.5 kB a row of the first five rows, roughly 8,000–12,000   |
| Columns         | 117                                                                                                      |
| Stable id       | `CSNumber` (e.g. `CS2003000133`); provider `SP_number` + `ServiceProvider` (a company name where it is one) |
| What it says    | `CareService`, `Subtype`, `ServiceType` (Private / …), name, address, postcode, council and health board, `DateReg`, `ServiceStatus`, beds and registered places, staff count |
| Quality         | `MinGrade` / `MaxGrade`, six `KQ_*` grades and their change, complaints upheld and enforcements by year, `Last_inspection_Date`, up to six inspections a year with requirement counts |
| Cadence         | monthly; the datastore page lists a file for every month to 30 September 2026. Page-name shape changed in April 2026 (`datastore-31-03-2026` → `datastore-30-april-2026`), so the month's link is read from the datastore page, never built |
| Personal fields | `Manager_Name`, `Service_Phone_Number`, `Eforms_email_address` (the sample row's is a named person's address) — dropped under Blind Mode, as the CQC file's phones are |

Not read: the share of childminders (individuals working from home, whose service name and address are a person's) —
the 8 kB sample held five day-care and care-home rows and no childminder. A build would drop that service type whole
or prove it is absent from the public file (`PublicList`), and that read is the first step of any promote.

Not read: Wales (Care Inspectorate Wales) and Northern Ireland (RQIA). The slot's time went to the Scottish file;
the park below does not depend on them.

## 3. Rivals and what they earn

| Rival                                         | Price                         | Sign of buyers                              |
| --------------------------------------------- | ----------------------------- | ------------------------------------------- |
| LaingBuisson CareSearch (UK-wide, ~17,000 homes, group structures, contacts) | £3,150 + VAT a year; £3,399 with benchmarks | long-standing trade product (web search, vendor page) |
| Oscar Research care homes file (Datarade, ~21k records) | from £2,500 a year | listed price only                           |
| HSJ Information database (20,405 records)     | unlisted                      | sells named senior contacts                 |
| Apify `yappman/cqc-register` (England)        | from US$4 / 1,000 locations   | 1 total user, 1 monthly active, 36 runs     |
| Apify `danielainsworth/cqc-register` (England) | pay per result               | 2 total users, 0 monthly active, 172 runs   |
| Apify Store search "care inspectorate"        | —                             | no actor for the Scottish file              |

The paid products sell what the open files do not hold: named decision-makers, group ownership, bed-level market
analysis. What the open files do hold — the register itself — has one monthly user across both England actors.

## 4. gankdat's own measure

Daily numbers 2026-11-18: `datasets 30d external: … uk-care-locations 1 (x402 1)`. One external call in thirty days,
on the x402 lane, where uptime probers call every route. The 580 total calls on the register are our own monitors. Its
Apify actor ran 28 times in 30 days, the same count as every other actor here — the daily health run, not a user.

## 5. Call

Park. Two of the three park conditions the item set are met in substance: the England register has had one external
call in 30 days (a second nation of a register nobody queries is not a new line), and the buyers in this market pay
for contacts and ownership, which Blind Mode drops and the file's own licence would not stop but our posture does.
The licence condition is not met — the file is OGL v3 and clean — so this is cheap to pick up: a 12 MB CSV, a stable
id, one parser, about half a day.

**Trigger to reopen:** a second external caller on `uk-care-locations` in any 30-day Daily numbers row, a user on
its Apify actor beyond the health run, or a /feedback or inbox line asking for Scottish, Welsh or UK-wide care
services. Then read the childminder share first.
