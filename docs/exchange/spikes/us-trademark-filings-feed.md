# Spike: USPTO daily trademark applications as a gankdat register (the UK journal's US twin)

Queue item `new-ventures/spike-us-trademark-filings-feed` (build, 2026-11-11 09:09–09:25 UTC). Sources: two fetch-relay
rounds this run — `docs/relay/responses/us-trademark-spike-2026-11-11` (18 lines: the Open Data Portal's dataset list and
the `trtdxfap` product page rendered, the API getting-started page rendered, the USPTO website terms of use, the
data-and-statistics page, the retired `bulkdata.uspto.gov` directory and two daily-file HEADs, two keyless calls of the
bulk-data API, three pages of the x402 Bazaar discovery list, the three watch-shaped rival actors' Store pages) and
`…-b` (9 lines: the ODP registration page, its FAQ, the bulk download API page and the rate-limit page rendered, the
legacy bulk-products page, the rivals' schema pages) — plus the Apify Store API reads already in
`exchange-w46-2026-11-11` (19–21.json). The question: can the USPTO's daily trademark-application XML be served as the
same register shape as `uk-trademark-journal` (a rolling window of daily files, `idOf(serial)`, the x402 data and
changes routes, the MCP tool, an actor) with no key and no owner minutes?

## 1. The source (relay 11-11)

| Fact | What the page says | Consequence |
| --- | --- | --- |
| Licence | USPTO website terms of use, "Copyright information": "Pursuant to federal law, most government-produced materials appearing on this website are not subject to copyright restrictions within the United States and are therefore in the public domain. Public domain information may be freely distributed and copied, but it is requested that in any subsequent use the United States Patent and Trademark Office (USPTO) be given appropriate acknowledgement … The USPTO reserves the right to assert copyright protection internationally." Trademark images: "If you wish to use a trademark obtained from our records, you must do so in accordance with the individual licensing policies of the marks' owners." | the data is public domain in the US with attribution asked (the one promote-side fact); mark images never stored, as for the UK journal |
| Access to the portal | `data.uspto.gov/support/universal-registration`: "**Starting June 18, 2026 all use of the Open Data Portal (ODP) website will require a USPTO.gov account.** … Multi-factor authentication (MFA) required … Run bulk downloads of up to 3,000 records at a time. **ID.me verified USPTO.gov accounts get access to our API through a personalized API key**." Every ODP page the relay rendered (the dataset list, the `trtdxfap` product page, getting-started, FAQ) redirected to `/universal-dialog`, the registration wall, so the product page's file list, sizes and record counts could not be read. | nothing on the portal is readable without a signed-in, MFA-enrolled account; a Worker cron cannot hold such a session |
| Bulk file download | `/apis/bulk-data/download`: `GET https://api.uspto.gov/api/v1/datasets/products/files/{productIdentifier}/{fileName}` — "**Note: API Key is required.** … You are currently limited to 20 downloads of the same file per year for each API Key." FAQ: "In order to get access to an API you must get your USPTO.gov account verified with **ID.me** to receive an API key"; keys of accounts that had not filled four profile fields (job title, organisation name, organisation type, intended use) by 2026-10-08 were deactivated. The two keyless calls (`/datasets/products/TRTDXFAP?fileDataFromDate=…`, `/datasets/products/search?q=trademark+daily`) answered **401 `{"message":"Unauthorized"}`**. | the only automatable path is a key bound to the owner's identity-verified account — a new identity verification on a US-government service |
| Legacy host | `bulkdata.uspto.gov/data/trademark/dailyxml/applications/` and two daily-file HEADs (`apc261110.zip`, `apc261109.zip`): `fetch failed` on the runner (the host no longer resolves); `www.uspto.gov/learning-and-resources/bulk-data-products` 301s to `data.uspto.gov/home`, the 153-byte shell the exchange saw. | the keyless path the rivals' READMEs still name is gone |
| Automated reads of the web apps | Terms of use: "USPTO's online databases are not designed or intended to be a source for bulk downloads of USPTO data when accessed through the website's interfaces. Individuals, companies, IP addresses … who, in effect, deny or decrease service by generating unusually high numbers of database accesses … whether generated manually or in an automated fashion, may be denied access to USPTO servers without notice. Bulk data products may be separately obtained from the USPTO, either for free or at the cost of dissemination." | the rivals' route (tmsearch / TSDR scraping) is the route CLAUDE.md rules out; also the clearance-search spike's answer for the USPTO half |
| File shape | unread — the product page is behind the wall; the TDXF application schema's element names, one day's size and record count stay unknown | the parse cannot be counted |
| Rate limits | "Bulk Datasets' Downloads API" has its own class; metadata retrievals 5 million calls a week across the APIs | moot without a key |

## 2. The watch-shaped rivals (Store API 11-11, pages 11-11)

| Actor | Users 30 d / total | Runs 30 d | Price | What a row carries | Source, as the listing says |
| --- | --- | --- | --- | --- | --- |
| foxlabs/uspto-trademark-leads (Berkan Kaplan, since 2026-07-30) | **7 / 20** | 425 | US$0.006 a result (from $6 / 1,000) + $0.00005 start | new filings 1–2 days after filing, or search by mark text / owner name; owner name and address, attorney, correspondent email and phone, pro-se flag, classes, goods — "for IP law firms and brand protection" | "No key required" |
| thoob/uspto-trademark-feed (Pono Data, since 2026-08-03) | 3 / 3 | 140 | US$0.004 a delivered record ($4 / 1,000) | word mark, serial and registration number, owner, goods and services, class, status, dates; a what-changed-since-last-run mode | "Pulls official USPTO daily data … No API key needed" |
| accountable_eel/trademark-filing-watch (Adriana Voss) | 1 / 2 | 36 | from US$5 / 1,000 matched filings (tiered; the page's meta says $10 / 1,000) + $0.002 start | new USPTO and EUIPO applications containing or resembling a watched term, by Nice class; owner, classes, record link; Slack / Discord / Telegram / Sheets alerts | "No API key and no proxy. EUIPO is searched through TMview … If USPTO later requires a token, the fallback is the official bulk daily XML on bulkdata.uspto.gov; that path is not built yet" |

Three watch-shaped actors, **11 users/30 d between them**, one above the item's five-user floor; every one reads the
USPTO web applications (a two-days-after-filing lag is TSDR's, not the daily file's), and the one that names the bulk
XML names a host that no longer exists. The category's users (12–40/30 d) sit on the search actors, as the exchange
read. The rows the paid actors sell carry correspondent emails and phones — the personal data Blind Mode drops — so a
gankdat register would also be the thinner row.

## 3. The x402 Bazaar (relay 11-11)

`/platform/v2/x402/discovery/resources` lists **33,492 resources** (pagination `total`), newest first, with no keyword
filter; the newest 300 (three pages, 1.06 MB) hold no trademark, USPTO, EUIPO or TMview route and none of gankdat's 25
(older) routes. A full read is ~335 pages, not spent on a parked spike: the Store is the shelf where trademark buyers
are counted, and gankdat's own journal route is the lane's one trademark listing until a reading says otherwise.

## 4. The gankdat shape, counted (not built)

`/v1/data/us-trademark-applications`: a rolling 90-day window of the daily application files cached per day in KV like
the journal's issues (`tdxf:day:<yyyymmdd>`), D1 by `idOf(serial)` so `/v1/changes` is each day's new filings, the
journal's streaming XML scanner with its own `LAYOUT` table, Blind Mode on individual applicants (names kept only with a
corporate designator, correspondent addresses reduced to country, images never stored), filters `classes`, `q`,
`owner`, `filed_after`; the x402 data (US$0.005) and changes (US$0.01) routes, the MCP tool, the 45 Nice-class facet
pages, an actor cloned from the journal's with a `since` mode; its own refresh wave. **≈ 1 day** if the file were a
keyless HTTPS GET — plus a `USPTO_API_KEY` Worker secret, the owner's account and the key's profile upkeep as it stands.

## 5. Call

**Park.** The first park condition holds outright and a second cannot be tested:

- the files need a key: since 2026-06-18 every ODP page is behind a USPTO.gov account with MFA, the download API is
  keyed, and a key is issued only to an **ID.me identity-verified** account — a new identity verification of the owner
  on a US-government service, which CLAUDE.md asks before and the owner-time rule (2026-10-29, STRATEGY §3) allows
  only for work scoring ≥ 10; the register itself scores 2 × 2 ÷ 1 = 4 in gankdat's queue (weight 1), and its key
  would be bound to the owner's profile fields (deactivated for others on 2026-10-08);
- one day's file within the Worker's limits: unreadable — the product page, sizes and schema sit behind the wall, and the
  keyless host that served `apc<yymmdd>.zip` is gone;
- the terms are on the promote side (US public domain, attribution asked) and the rivals are above the five-user floor
  (7, 3, 1) — neither moves the call while the file cannot be fetched.

What the Store's users show is unchanged: buyers are on search, and the US watch rivals (11 users/30 d together) scrape
the web apps the USPTO's own terms tell automated clients to stay off. gankdat's trademark revenue stays on the UK
journal, whose actor retitle (`trademark-actor-store-keywords`) is the queued move on this shelf.

**Trigger to revisit:** the ODP's registration rule is withdrawn or a keyless public mirror of the Trademark Daily XML
files appears under an open licence (data.gov, a cloud-provider open-data bucket, a USPTO announcement) — one relay
HEAD proves it; or the owner, unprompted, says they hold or will take a USPTO.gov account with ID.me for this — then
the §4 shape is a ≈ 1-day gankdat item (`us-trademark-applications`, with the `USPTO_API_KEY` secret) and its actor.
No owner request is filed: the ask fails the owner-time rule on score.

**Lesson for the exchange and the pre-research pass:** a source page that answers a plain GET as a 153-byte shell is as
often a sign-in wall as a JavaScript app — RENDER it in the exchange's own round before scoring the spike. This one
(5 × 2 = 10, the top of the pipeline) would have parked at 08:17 for the cost of one rendered line, as the HMRC spike
would have for one npm search; two spikes in two days parked on a fact one read could have found.

**For `spike-trademark-clearance-search-sources` (open, 4 × 2):** the USPTO half is answered here — bulk data behind an
identity-verified key, the web databases off limits to automated bulk access by the terms quoted in §1 — so that spike's
remaining questions are the UK IPO and EUIPO open data only.
