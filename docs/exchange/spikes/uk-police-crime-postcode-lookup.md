# Spike: UK street-level crime by postcode (data.police.uk) as a gankdat lookup

Queue item `new-ventures/spike-uk-police-crime-postcode-lookup` (burn-down, 2026-11-02 19:11–19:30 UTC; seeded by the
18:28 exchange pre-research of the same evening). Sources: three fetch-relay rounds
(`docs/relay/responses/police-spike-2026-11-02`, `police-spike-2-2026-11-02`, `police-spike-3-2026-11-02` — every
data.police.uk page and API call answered 200 and was read in full; the UKCrimeStats sign-up page needed a rendered fetch;
the Apify store was read through its keyless `/v2/store` search) plus a grep of `ventures/gankdat/src`. Index-only claims
are marked as such; there are two.

The question: is a `/v1/data/uk-crime` lookup (counts by category for the last 12 months around a postcode, plus a rate
per 1,000 residents) a dataset worth half a day beside the registers, given that UKCrimeStats and PropertyData already
sell the same feed by subscription and an Apify actor sits on the shelf gankdat's actors are on?

## 1. The source (primary, read in full)

- **Licence** (`/about/`, dataset metadata block): "licence: Open Government Licence v3.0"; publisher "Single Online Home
  National Digital Team"; "Time Period Covered: September 2023 to August 2026"; "Geographic Coverage: England, Wales,
  Northern Ireland"; frequency monthly. OGL v3 permits commercial re-use with attribution — a proxied paid lookup is
  allowed. No caching or redistribution clause anywhere on the page; the API is keyless and has no terms page of its own.
- **Rate limit** (`/docs/api-call-limits/`): "The current rate limit is 15 requests per second with a burst of 30 …
  the API will return a HTTP 429". Leaky bucket, no daily cap, no key.
- **What a call returns** (`/docs/method/crime-street/`): "Crimes at street-level; either within a 1 mile radius of a
  single point, or within a custom area"; `lat`, `lng`, optional `date=YYYY-MM` ("The latest month will be shown by
  default"); a `poly` area with more than 10,000 crimes answers 503. Each crime: `category`, `month`, `location`
  (anonymised lat/lng, `street.id`, `street.name` "On or near …"), `outcome_status`, `persistent_id`. 14 categories
  (`/api/crime-categories`: anti-social-behaviour, bicycle-theft, burglary, criminal-damage-arson, drugs, other-theft,
  possession-of-weapons, public-order, robbery, shoplifting, theft-from-the-person, vehicle-crime, violent-crime,
  other-crime). `/outcomes-at-location` gives the same by outcome; "Outcomes are not available for the Police Service of
  Northern Ireland".
- **Lag**: `/api/crime-last-updated` answered `{"date":"2026-08-01"}` on 2026-11-02 — the newest month is three months
  old (the about page's own wording: data is released "typically just over a month after" the month closes, per
  UKCrimeStats; police.uk's changelog lists forces still missing August 2026).
- **Anonymisation** (`/about/#location-anonymisation`): "The latitude and longitude locations … always represent the
  approximate location of a crime — not the exact place"; every crime is snapped to a master map point whose "catchment
  area … contains at least eight postal addresses or no postal addresses at all"; points more than 20 km away are
  zeroed. So a postcode-level count is really a 1-mile-radius count around the postcode centroid — the same thing every
  rival sells.
- **Gaps** (`/changelog/`, Known Issues): "Greater Manchester Police: Currently no crime, outcome or stop and search data
  is available" (2.9 M residents absent); court outcomes unavailable since June 2019; Devon and Cornwall outcomes
  "unreliable"; British Transport Police and Gloucestershire have not provided August 2026. Scotland is covered only by
  BTP ("crime levels may appear much lower than they really are").
- **Measured call sizes** (the sample calls in round one): Leicester city centre, August 2026, all-crime within 1 mile
  = 1,772 crimes / 686 kB; London WC2 (lat 51.5074, lng −0.1278), latest month = 4,160 crimes / 1.6 MB; Leicester
  outcomes = 1,551 / 713 kB. A 12-month lookup therefore pulls **12 calls and 8–20 MB of JSON** through the Worker for
  every cold postcode, to return ~14 numbers.

## 2. The premise that was wrong

The seed item said the rate per 1,000 residents would use "the ONS postcode population already used by other sources"
and the postcode → lat/lng step "the ONS postcode directory". A grep of `ventures/gankdat/src` finds **no geocoder, no
postcode directory and no population figure in any source** — the registers carry postcodes as strings, nothing resolves
one. Both steps would be new:

| Step | Source read | Licence | Shape |
| --- | --- | --- | --- |
| postcode → lat/lng | postcodes.io (`/docs/licences`, `/docs/self-host`; `api.postcodes.io/postcodes/SW1A1AA` answered lat 51.50101, lng −0.141563, LSOA "Westminster 018C") | "source code … MIT Licence"; "Great Britain postcode data may be used under the terms of the OS OpenData licence"; "Northern Ireland postcode data … Commercial use requires a licence from NI Land & Property Services"; attribution to OS, Royal Mail, National Statistics and NRS | a keyless third-party API in our request path (no published rate limit or SLA; self-hostable as two Docker images, which is a server we do not run), or an ONSPD/NSPL ingest of ~1.8 M rows into D1 |
| residents within 1 mile | Nomis "Postcode resident and household estimates, England and Wales: Census 2021" — P001 "All postcodes … 2.75m records, size: 51MB" (usual residents by postcode by sex), England and Wales only; ONS geography licences page: OGL with the OS/Royal Mail attribution lines | Crown copyright, OGL v3 | a second D1 ingest (≈ 1.4 M postcode rows after dropping the sex split) joined to the ONSPD centroids, summed over the postcodes inside the 1-mile circle at lookup time, NI and Scotland without a denominator |

Honest count: the proxied lookup with a 24 h KV cache on the existing `DataSource.lookup` engine is 0.5 day; the two
ingests, a bounding-box query and the fixtures are another 0.5–1 day; the Apify actor and listing a further 0.25.
**≈ 1.25–1.75 days, not 0.5.**

## 3. Who already sells it (primary unless marked)

| Seller | Product | Price | Customers shown |
| --- | --- | --- | --- |
| UKCrimeStats (`/api/signup.php`, rendered) | API: "an individual postcode level ranking of 1-100 … over the latest 12 months across 1.6 million postcodes in England, Wales and Northern Ireland"; "a free account … with a limit of 500 calls" | API 2k £10/mo (0.5p a call), 5k £16, 15k £32, 50k £64, 100k £96, 150k £128 (0.09p a call) | none published; the site is "ad supported" with "1.7 million pages covering all postcodes" free to view, membership "from £7.49 per month", postcode PDF reports and a "Crime Postcode Datasets" CSV shop (blog 2025-01-28) |
| PropertyData (`/api/documentation/crime`, `/api/pricing`) | `/crime` — "analytics on local crime" for a full, district or sector postcode, lat/lng, what3words or town, radius 0.1–3 miles, a `crime_rating` of Very high … Very low and the 14 `types`; "1 request = 1" credit | API 2k £30/mo (12 calls per 30 s) … API 100k £300, 300k £800; "Prices exclude VAT"; web plans from £15/mo | 324 reviews at 4.6 on the platform's JSON-LD (a property-analytics subscription: sold prices, yields, EPC, planning — crime is one of ~40 endpoints) |
| Apify Store (`/v2/store?search=uk crime`, 180 results) | 13 actors wrap data.police.uk street crime | from $1.00 per 1,000 crimes (devon_gtme), $1.86/1k (velvety_bedbug), pay-per-event elsewhere, one free | **devon_gtme/police-uk-crime: 2 users, 104 runs, 1 user in 30 days**; the best, ryanclinton/uk-police-crime-data: 12 users, 744 runs, 1 user in 30 days; the other eleven: 1–2 users each, 7–188 runs. ≈ 33 users across 13 actors, none with more than one active user this month |

The two subscription sellers earn from a bundle (a property-research platform; a members' site with reports, CSVs and
ads), and neither publishes a count of API customers. The one shelf where gankdat's actors already stand shows the
standalone product saturated: thirteen free-to-build wrappers of a keyless API sharing roughly thirty users.

## 4. The park conditions, one by one

1. *Licence or API terms forbid a proxied commercial service* — **no**: OGL v3, keyless, no terms page.
2. *The rate limit cannot carry a cached lookup* — **no**: 15 r/s with a 24 h cache is ~70 cold postcodes a minute; the
   cost is bandwidth (8–20 MB per cold postcode), not calls.
3. *The Apify actor shows fewer than 10 users and no rival shows paying customers* — **half met**: the named actor has 2
   users (the best of thirteen, 12); the rivals that show customers sell bundles, not a crime API on its own.
4. *The property cluster it belongs with stays parked* — **yes**: EPC (declined 2026-10-12 on the OS/Royal Mail address
   licence and personal data) and Land Registry CCOD (rejected) are both parked; PropertyData's crime endpoint is one
   field of a property report, which is the product buyers pay for.

Plus the finding in §2: the geocoding and population steps the seed assumed do not exist, so the build is 2–3× the
estimate and either leans on a third-party API in the request path or adds ~3 M rows of ingest for a dataset whose
newest month is three months old and omits Greater Manchester.

## 5. Call

**Park.** Score as a line: evidence 1 (money flows, but to bundled property platforms; the standalone shelf shows 13
actors sharing ~33 users) × reach 2 ÷ (1.5 build days + 0 owner) ≈ **1.3** — below every open item. Reopen when a
property-cluster item is promoted (then crime is one field of a UK property lookup alongside sold prices and EPC, and
the postcode directory ingest is shared), when an inbound request names crime data, or when any Apify crime actor
passes 50 users. The postcodes.io licence read (OS OpenData for GB, NI commercial use needs an LPS licence) and the
Nomis postcode-population file are recorded here for that day.

Lesson for the pre-research pass (one run-log line, no queue item): a claim about what gankdat "already" has is
grep-checked before it goes into a seed — this seed's build count rested on a population table that does not exist.
