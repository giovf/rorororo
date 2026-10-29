# Spike: Apify's public actor-ideas board as a source of paid data requests

Queue item `new-ventures/spike-apify-actor-ideas-board` (burn-down, 2026-10-29 17:11–17:25 UTC; seeded by the
2026-W44 exchange). Sources: four fetch-relay rounds this run (`docs/relay/responses/apify-ideas-2026-10-29`, `-b`,
`-c`, `-d`, pruned after 7 days): the board page raw and rendered (`apify.com/ideas`, plain and `?sortBy=votes`), the
seven JS chunks behind its list component (which name the board's own endpoints), the board's JSON export of every
open idea, its CSV export of every completed idea, the votes-sorted data pages 0 and 1, three idea pages, Apify's
academy page "Find ideas for new Actors", and six keyless Store searches (`api.apify.com/v2/store`). apify.com answers
403 from the sandbox; `.apify.com` was already on `docs/relay/hosts.txt`.

The question the exchange left open: does the board hold requests for public registers, open data or official-source
feeds — with votes as the demand number — that an in-policy gankdat Apify actor (pay-per-event, like the 18 live ones)
could serve?

## 1. How the board is read (one relay line from now on)

| Reading | What it says |
| --- | --- |
| Rendered board | Six "featured" cards on a client-rendered shell; the raw page carries no idea at all. The list is fetched from `GET /api/ideas/data?page=N&sort=votes&status=toDevelop` (24 per page, `ideasCount`), the "Export ideas" menu from `GET /api/ideas/download?format=json|csv&status=toDevelop|completed`; `/api/ideas/categories` answers 404. |
| Export (open ideas) | 148 ideas "Open to develop": title, description, categories, URL — no votes, no dates. |
| Export (completed) | 605 ideas marked completed (an actor exists; the idea page redirects to it). |
| Votes endpoint | Sorted by votes: page 0 holds every voted idea (14 of 148 have ≥ 1 vote), page 1 is all zeros — so 134 of 148 open ideas have 0 votes. |
| Idea page | Shows votes, status, categories, submission date, the text, and an "Actors in Store" block that already lists the Store actors matching the idea's name — the "existing actors" column comes free with the page. |
| Academy page | Apify's own guidance on what to build: website scrapers, SaaS API wrappers, open-source library wrappers; it points builders at RapidAPI Hub, Google Cloud APIs and n8n/Make template galleries, not at the ideas board. |

## 2. Every voted open idea (page 0 of the votes endpoint, 2026-10-29 17:19 UTC)

| Idea | Votes | Submitted | Source it asks for | Licence / policy | Actors already in Store | Build days |
| --- | --- | --- | --- | --- | --- | --- |
| Zalo Scraper | 19 | 2023-08-29 | profiles and conversations on a Vietnamese messaging app | out of policy: personal data from a logged-in app, no automated-access terms | 4+ (kazkn/zalo-member-profile-exporter 27 users, 114 runs/30 d) | — |
| Integration for n8n | 12 | 2023-07-24 | an n8n connector, not a dataset | n/a | 1,131 Store hits for "n8n" (muhammetakkurtt/n8n-scraper 369 users) | — |
| Internet Archive Scraper | 10 | 2026-07-08 | archive.org search, metadata and Wayback APIs | open APIs; archive.org's terms not read this run | 5 listed on the idea page (87–392 users each) + 8 pay-per-event actors in Store search (maged120/archive-org-advanced-search 40 users, 594 runs/30 d) | served |
| Twitter Ads Scraper | 8 | 2022-12-13 | ads on X | out of policy: X developer agreement bars scraping (read 2026-10-17) | — | — |
| Naver Scraper | 7 | — | Naver search results | out of policy: scraping a search engine's results pages | — | — |
| Currency Rates Scraper | 6 | — | exchangeratesapi.io, fixer.io, openexchangerates.org, currencylayer.com | out of policy: paid FX API vendors whose plans forbid redistribution; the free official source (ECB reference rates) is already an actor | 5,171 Store hits; ryanclinton/exchange-rate-tracker free, 29 users, 1,805 runs/30 d; chrisp1211 ECB; maged120 Central Bank of Egypt 22 users, 4,905 runs/30 d | served |
| ChatGPT Deepfake Identifier | 4 | 2023-01-31 | an AI tool, not data | n/a | — | — |
| Poweradspy Scraper | 4 | — | a paid ad-spy SaaS | out of policy: scraping a paid SaaS behind login | — | — |
| Google Sheets Integration | 3 | 2022-12-08 | integration | n/a (Apify ships one) | — | — |
| BuzzSumo Scraper | 3 | — | a paid SaaS | out of policy | — | — |
| Google Business Listings scraper | 2 | — | Google Maps/Business | out of policy (Google ToS) | hundreds | — |
| Homesnap Scraper | 2 | — | a US real-estate app | out of policy (listing portal terms) | — | — |
| AI Content Changes Detector | 1 | 2023-10-02 | a tool | n/a | — | — |
| KingsCrowd Scraper | 1 | 2022-12-13 | a paid analytics SaaS | out of policy | — | — |

The remaining 134 open ideas have 0 votes. 57 of the 148 are templated "<Name> API" stubs with the same generated
description shape ("The X API Actor offers a comprehensive solution…": Dogs API, Cats API, Planets API, Astrology
API, Warframe API, NovelAI API …), and the 2026 submissions include test posts ("Sam", "VNTAMARKA6E2818C Test Actor",
"Can I Ask You a Question Please?" twice, "Pefumes"). The three ideas at ≥ 10 votes are two to three years old.

## 3. Public registers, open data and official feeds on the board

Open ideas that name a public or official source, all at **0 votes** and each already served by at least one Store
actor:

| Idea | Source | Existing actor (Store search 2026-10-29) |
| --- | --- | --- |
| Euromillions API | official lottery results pages | automation-lab/euromillions-results-scraper — 3 users, 101 runs/30 d, pay-per-event |
| Regulatory Compliance Search API | unnamed regulators | aimojo/regulatory-compliance-search — 2 users, 12 runs/30 d; pink_comic/federal-register-search — 9 users, 986 runs/30 d |
| Sun position API, Planets API | computed astronomy, no register | — |

No open idea mentions any register gankdat serves or could serve under its licences (Companies House, charities,
tenders, sanctions, schools, NHS, planning, food hygiene, insolvency, sponsors, gambling, trade marks, TED, SAM,
Contracts Finder) — the word "register" appears in none of the 148 titles or descriptions. The public-data ideas the
board did hold are in the **completed** export, built by others: Sunbiz scraper (Florida corporations), USPTO Trademark
Status Checker, Trademark search API, VAT API, Income Tax API, Routing number API, Powerball / Mega Millions / Lottery
results APIs, Population API, Inflation API, Air Quality API, Water quality API, Federal Register.

## 4. Call: park (no in-policy idea has ≥ 10 votes)

The item's own park rule applies: the only ideas at ≥ 10 votes are a messaging-app scraper (personal data), an n8n
connector (not data) and the Internet Archive (13 actors already, the largest at 40 users). Below 10 votes there is
no public-data idea at all; the ones that exist sit at 0 votes with a Store actor each. The board is not a demand
signal for registers: 134 of 148 open ideas have 0 votes, the newest entries are Apify-seeded "X API" stubs and test
posts, and Apify's own builder guidance points elsewhere. Nothing is promoted; no actor item is queued.

What the spike leaves behind: the board is now a one-line read (the JSON export plus page 0 of the votes endpoint
through the relay), so the exchange can re-check it cheaply. Re-read 2026-12-01, or earlier only if the Daily numbers
row shows a first paid Apify run (the shelf's demand signal that matters, 0 paid at 482 runs/30 d today). Score at
the park: evidence 0.5 (no voted in-policy idea) × reach 3 ÷ 0.3 d — moot without a candidate.
