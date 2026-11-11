# Spike: the clearance-search half of the trademark category — where the paid actors read, and whether any open bulk register lets gankdat answer "is this mark taken" lawfully

Queue item `new-ventures/spike-trademark-clearance-search-sources` (build, 2026-11-11 17:09–17:25 UTC). Sources: four
fetch-relay rounds this run — `docs/relay/responses/trademark-clearance-spike-2026-11-11` (43 lines: the six rivals'
Store pages and input schemas, TMview rendered and its search API, the UK IPO's data-release pages on GOV.UK, the
old database-access FOI page, data.gov.uk's journal listing, the IPO's register web app, the EUIPO open-data URLs,
the EU open data portal's search API, the EUIPO API portal's getting-started, FAQ and product list, five USPTO
developer-portal URLs), `…-b` (14: the EUIPN legal notices, the EUTM Download privacy statement and licence agreement
PDFs, the EUIPO home rendered, the data.europa.eu dataset record, the IPO's research page, a seventh rival),
`…-c` (8: the 2025 FOI on whatdotheyknow — 403 to the runner, so quoted through the rival that cites it —
Trademark Dashboard's UK database and "UK IPO guide" pages, the UK rival actor and its schema, Signa's UKIPO and
EUIPO office pages and pricing) and `…-d` (11: HEADs of the EU portal's CSVs and the UK 2018 zips, two Store API
searches, a second TMview API call, the legal notices rendered, the EUIPO API Conditions of Use PDF) — plus the Store
API records already in `exchange-w46-2026-11-11` (19–21.json). WebSearch found the URLs; every quote below is from a
relay body. The question: where do the Store's 10–40-user trademark search actors get their answers, and does any
UK, EU or US register exist as a bulk file under an open licence from which gankdat could serve a clearance search
(`is this mark name taken in the UK / EU`) without reading a web application whose terms forbid automated access?

## 1. The rivals: inputs, prices, sources (Store API 11-11 08:xx and 18:xx; pages 11-11)

| Actor | Users 30 d / total (today) | Inputs | Price (pay-per-event) | Source, in the listing's own words |
| --- | --- | --- | --- | --- |
| dltik/euipo-trademarks-scraper | **42 / 173** (08:17: 40/167) | `query` (mark name), Nice class, status, office, dates, mark type; `enrichDetails`, `analyzeClearance` | US$0.01 a result + $0.01 detail + $0.02 AI clearance + $0.00005 start | "This scraper hits the same public JSON endpoint the TMview web UI calls — no HTML parsing, no anti-bot circumvention." "Datacenter proxy is enabled by default." |
| automation-lab/euipo-tmview-trademarks-scraper | **31 / 88** (26/83) | `query` / `queries`, offices, Nice class, status, filing date, `maxResults` | from US$0.02 / 1,000 records ($0.000035 a record) + $0.005 start | "Search public TMview trademark records … TMview receives your search terms and filters, and Apify Proxy routes requests when enabled." "Leave offices empty to search all public TMview offices." |
| dev00/uspto-trademark-api | 23 / 111 | a list of words or phrases (required) | US$0.003 a batch check (FREE plan $0.10) | "Bulk verify keywords and phrases against the USPTO database" — the source is not named beyond "USPTO database" |
| scrapers_lat/tmview-global-trademarks-scraper | 18 / 36 | `markTexts`, owner, offices, classes, status, `maxTrademarks` (≤ 5,000,000) | US$0.012–0.015 a result | "Search 145M+ trademarks from 77 national and regional registers" (TMview's 143.9 M, §2); "Residential proxies are used by default because the registers throttle bulk traffic" |
| khadinakbar/uspto-trademark-batch-search | 14 / 30 | phrases, serial, owner | US$0.004–0.005 a result ("$5 per 1,000") | "from live official USPTO data … without a USPTO.gov login or API key"; "Source: United States Patent and Trademark Office" |
| memo23/uspto-trademark-scraper | 12 / 54 | wordmark / owner / goods / serial, live-dead, class | US$0.007 a record + $0.005 start | "Queries the USPTO's own trademark search index … The API is open, so the actor runs direct by default; set a proxy only for very large runs." "Full document history lives behind USPTO's separate TSDR document API, which now requires a USPTO API key." |
| the UK half: nexgendata/uk-trademark-search 2 / 6; starshaped_bullsnake/uk-ipo-trade-mark-journal-change-signals 1 / 2; scrapersdelight/uk-trademark-scraper 1 / 1; everyotherfriday/trademark-search (USPTO + EUIPO + UK IPO) 0 / 1 | | mark, owner, number, class, status, date | scrapersdelight US$0.0009 a mark | scrapersdelight: "Search the UK trade mark register (UK IPO) … Plus the IPO's weekly Trade Marks Journal" — the register web app and the journal XML gankdat already serves |

Every actor with users reads a web application: the two EU leaders (73 users/30 d between them) call TMview's JSON
endpoint through proxies, the three US ones query the USPTO's search index, and the one global one rotates
residential proxies "because the registers throttle bulk traffic". None names a bulk file. **The UK clearance half
has 0–2 users/30 d per actor** (four actors, 4 users/30 d together) — the Store's trademark buyers want EU and US
answers; a UK-only search would address the thinnest slice of the category even if it were lawful.

Two commercial APIs sit above the Store: Signa (signa.so, "Global trademark API platform", US$99/month Starter,
10,000 free credits) and Trademark Dashboard (a UK clearance report from £9.99 over "2,950,119 UK IPO register
records, July 2026"). Both say how they get UK data: Trademark Dashboard "uses a licensed FTP data feed updated
daily"; Signa lists the routes as "Apply for UKIPO data access, build an HTML scraper against trademarks.ipo.gov.uk,
parse weekly journal PDFs" and reads the journal daily.

## 2. The sources: licence × access × size (relay 11-11)

| Source | What the page says (quoted) | Licence | Bulk file? | Size | Automated read allowed? |
| --- | --- | --- | --- | --- | --- |
| **TMview** (tmdn.org; EUIPO's cross-office search, "Search 143,893,367 trade marks" across 76 offices incl. GB, EM, US, WO) | EUIPN legal notices (the tmdn.org legal-notices URL redirects there): "Access to the Website's Information and Services is granted for **consultation** within the scope and objectives pursued by the EUIPO"; "the EUIPO expressly **reserves and opts out of any copyright exception for text or data mining, web scraping, or similar reproductions, extractions, or uses for whatever purpose other than scientific research** (TDM) of any Information. This reservation applies to any purposes, including the training … by any means, including bots, scrapers, or other automated processes"; "**The extraction of substantial parts of the EUIPO's databases or of the content therein – howsoever performed – is forbidden**." | consultation only; TDM reserved | no | — | **no.** The search API itself answered the runner `Request Rejected … Please consult with your administrator` (an F5-style wall) on both calls; the rivals route it through proxies. |
| **EUIPO EUTM Download** (the bulk XML service the open-data page used to point at) | Privacy statement: "EUTM Download is a service … by which the particulars of EUTM applications or registrations … can be downloaded in bulk by **authorised users** … in XML format (conforming to the TM-XML standard) … By default, the information that can be downloaded is from EUTM data files that do not contain any personal data … after registration and proper validation of the requester, a more complete EUTM dataset can be accessed". Licence agreement (3 pages, EX-14-3 Art. 8(2)): "royalty-free, non-transferable licence to bulk download"; signed "for and on behalf of … Licensee: Name and Title, Organisation. **Attach proof of identity of signatory**"; no marketing to proprietors, no renewals, Spanish law, EUIPO may withdraw access at any time. | a bilateral licence (royalty-free) — not an open licence | yes, TM-XML, EUTMs only (not national marks) | unread (behind the login) | yes, for a licensee — but the licence is signed by an organisation with proof of the signatory's identity: an identity step for the owner, which the owner-time rule reserves for work scoring ≥ 10 (this spike is 4 × 2 = 8). |
| **EUIPO API portal** (dev.euipo.europa.eu, "Trademark search 1.1.0 — Perform searches within EUIPO's database") | FAQ: "Access to Production and Sandbox APIs is free of charge"; production needs "Proof of identity of the subscribing person: **copy of national ID card or passport, and proof of address**" (natural persons) or company documents, sent to a docs mailbox; "The average response time … up to one week for Production"; one subscription per organisation; a 302 to `error/revise.html` "is usually related to a reputation issue with your public IP". Conditions of Use (EX-22-05 annex I, PDF): the Office "may … limit the frequency of API transactions … and may … add, change or remove rate limits at any time". | free API under its Conditions of Use; EUTMs only | no (per-query API) | — | with a key — same identity step as above; and the exchange's rule stands (W46 §6: not pursued). |
| **EUIPO open data on data.europa.eu** ("IP rights in EU: EU Trade mark applications", CC BY 4.0) | record: "basic information for all EU trade marks and registered Community designs from the beginning of the registry **to 2020-01-21**"; three CSV distributions (`tm.csv.gz`, `TM_GANDS.zip.gz`, `euipo.csv.gz`) | **CC BY 4.0** — the one open licence found | a frozen 2020 snapshot | the three HEADs and a RANGE read all **301 to data.europa.eu's home page** (text/html): the files are gone | moot: six years stale and no longer served. The old `ohimportal/en/open-data` URL and `/en/the-office/open-data` both land on the EUIPO home / 404. |
| **UK IPO — "IPO: Trade mark data release"** (GOV.UK, the only register dump) | "This dataset is a snapshot of trade mark applications received by the Intellectual Property Office … saved in a tab separated text file … compiled into a single snapshot to make it easier for statistical research"; published 2015-02-23, **dateModified 2018-02-13**; columns: trade mark number, hyperlink, mark text, owner name, postcode area, region, country, status, filing/registration dates, classes. | OGL v3 (GOV.UK) | yes — `opendatadomestic.zip` **63,238,846 bytes**, `opendataIR.zip` 6,155,443 bytes, both Last-Modified 13 Feb 2018 | ~2.6 M rows in 2018 (Trademark Dashboard counts 2,950,119 today) | the file is open but **eight years and ~600,000 applications stale**; a clearance answer from it would be wrong for every mark filed since 2018. Trademark Dashboard (11-11): "The only publicly downloadable bulk dataset was last updated in February 2018"; the 2016 FOI it quotes: "does not at present provide an API for bulk data retrieval"; the 2025 FOI (whatdotheyknow, 403 to the runner) as it reports it: bulk trade mark data "cannot be provided at present", the IPO "stopped publishing bulk downloads in 2018 due to the RPSI". |
| **UK IPO register web app** (trademarks.ipo.gov.uk `ipo-tmtext` / `ipo-tmcase` / `ipo-tmowner`; the new One IPO search host did not resolve) | both runner reads answered **403** with the IPO's captcha page: "When we notice a high number of visits from a single user, we perform a security check … to keep our services safe from **automated systems which are attempting to extract copies of our data (also known as 'data mining')**." | OGL on the page chrome; the data itself is behind an anti-mining wall | no | — | **no** — the service names data mining as what it blocks. The `/t-tmj.htm` journal host also answered 403 to the runner today (the journal XML gankdat serves is on a different path and keeps loading at the waves). |
| **UK IPO licensed daily feed** (what Trademark Dashboard and Signa read) | not on any page the relay could read — the 2016 FOI (GOV.UK page now 410) offered "a paid for download, plus updates" from the IPO IT helpdesk; Signa: "Apply for UKIPO data access"; "UKIPO has publicly committed to a bulk-data API as part of the 2026 digital transformation programme, but that it is not yet broadly available". | a bilateral licence; terms and fee unread | yes (FTP) | — | yes, for a licensee — an application in the owner's name with an unread fee: fails the £0-line and owner-time rules. |
| **USPTO** (TSDR API, annual XML backfile) | all five developer-portal URLs (TSDR API catalogue, key-manager guide, "bulk downloads via TSDR APIs", the annual applications product page) **301 to data.uspto.gov/home**, the 153-byte shell behind the USPTO.gov + MFA wall the morning spike read (`us-trademark-filings-feed.md` §1: bulk downloads need an ID.me-verified API key; the terms of use tell automated bulk clients to stay off the web databases). memo23: the TSDR document API "now requires a USPTO API key". | US public domain | yes, behind the key | the 2012 archive figure (3.5 GB compressed, whole product) is the last public size | **no** without the identity-verified key — the park of 09:20 stands. |

## 3. What a gankdat clearance search would need, counted (not built)

A UK answer needs the current register (status of every live mark by text and class): the only open file is 2018;
the live register is a web app that names data mining as what its captcha blocks; the current feed is a paid
bilateral licence. An EU answer needs EUTMs plus the national marks TMview merges: EUTMs come only through a signed
licence or an ID-verified API key, and TMview is consultation-only with TDM reserved. A US answer needs the walled
ODP. So there is **no source today from which the search half can be served lawfully at £0 with no identity step**;
the 73 users/30 d on the two TMview actors are buying a read the EUIPO's notices forbid. If the EUTM Download
licence were signed, the shape would be ≈ 1 week (TM-XML parser, D1 by `idOf(application number)`, `q`, `classes`,
`owner`, `status` filters, the x402 and MCP routes, an actor) for EUTMs only — not the national marks the buyers
also get from TMview — and it needs the owner's organisation and identity on a Spanish-law licence for a line whose
visible buyers pay US$0.01 a row.

## 4. Call

**Park.** Both park conditions in the item hold: every rival with users reads a web application whose terms forbid
automated access (TMview: consultation only, TDM reserved, extraction forbidden; the UK IPO: a captcha against data
mining; the USPTO: the terms read on 11-11 09:20), and the only open bulk file is not too large but too old (the UK
IPO's 2018 OGL snapshot) or gone (the EUIPO's 2020 CC BY CSVs now redirect to the portal home). The lawful routes —
EUTM Download's signed licence, the EUIPO API's ID-and-address check, the IPO's licensed feed — each put the owner's
identity or organisation on an application, which the owner-time rule reserves for work scoring ≥ 10 (this spike:
4 × 2 = 8). The journal stays gankdat's honest trademark offer, and `trademark-actor-store-keywords` (queued) is the
distribution move that remains.

Triggers to reopen (one relay line each): (a) the UK IPO's One IPO bulk-data API or an OGL register dump goes live
(Signa and Trademark Dashboard both say it is committed for 2026 — the exchange's quarterly re-read checks
`gov.uk/government/publications/ipo-trade-mark-data-release` and the data.gov.uk IPO publisher list for a file dated
after 2018); (b) the EUIPO publishes the EUTM register under an open licence without a signed agreement; or (c) the
owner, unprompted, says they will sign the EUTM Download licence or apply for the IPO feed — then gankdat's queue gets
`eu-trademark-register` (≈ 1 week, §3's shape) scored as a 4-point register with weight 1.

**Lesson (second of the day):** both W46 trademark spikes parked within the day on walls the exchange could have read
in its own round — a rendered source page this morning, the source's legal notice this evening. The exchange round
should carry, for every scored source, its terms or legal-notice page and a RENDER of any shell-answering page, and
score the spike only after both are read; queued as foundry `exchange-source-terms-before-scoring`.
