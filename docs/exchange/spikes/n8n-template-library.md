# Spike: n8n's template library as a shelf for gankdat

Queue item `new-ventures/spike-n8n-template-library` (build, 2026-11-18 17:09 UTC slot; queued by exchange 2026-W47 §2).
Sources: the exchange's rounds (`docs/relay/responses/exchange-w47-2026-11-18` 7–10, `-b` 9–13 — the creator pages and
five searches) and three rounds of this spike: `spike-n8n-2026-11-18` (26 lines: sticky-note and template-ideas pages,
n8n's legal index, the licence page, the CLI page, the creators directory, one template record, 16 search pages),
`-b` (21 lines: 12 searches newest-first, six pages of the whole library newest-first, three checkout pages) and `-c`
(12 template records). 38 search pages parsed, 585 distinct templates. Every number below was fetched today.

The question: do templates built around one vendor's paid data API get seen in their first 90 days, do paid templates
show sales, do the terms allow a vendor's template, and can the required end-to-end test run on a hosted runner?

**Call: park.** The item's own park test is met. Of 104 templates published in the last 90 days whose title names the
vendor API they are built on, 102 show 0 views in the library's listing and the highest shows 19; on the template's own
page (a fresher counter) the register templates closest to gankdat read 0–8 views. The library publishes about 31
templates a day and its own newest-first pages are the same: 134 of 140 sampled at 0 views, none above 15. The traffic
the exchange saw belongs to templates more than a year old. Terms and the runner are not the obstacle. Nothing was
created, nothing is asked of the owner.

## 1. Terms for creators (primary, quoted)

- **Account.** The Creator portal's registration page: "By creating an account, you're agreeing to our Terms and
  Conditions" — the link goes to `n8n.io/legal/#terms`, an index of n8n's customer documents (Self-Serve Terms, Master
  Enterprise Terms, EULA, AI Terms, Acceptable Use Policy). **No creator-specific terms document is published there**;
  `n8n.io/legal/terms/` answers 404. The rules a creator meets are the three docs pages below.
- **AI-assisted work** (submission guidelines): "AI-generated workflows, code, expressions, and setup instructions are
  welcome when you've reviewed and tested them. You must understand how the workflow works and verify its claims before
  submitting it." And: "Don't submit unreviewed AI output, batches of near-identical workflows, or generic examples with
  only names, prompts, or app choices changed."
- **Substance**: "A trigger connected to a single action, a default chatbot, or an isolated API request needs more context
  or reusable logic to qualify." A template that only calls one gankdat endpoint would not pass; the promote shape's
  three workflows (check, route, write, alert) would.
- **Paid third-party accounts.** Nothing bars them. The guidelines ask only that they are declared: "Document required
  credentials, permissions, external resources, and dependencies"; the overview sticky note's `### Setup` heading is
  to "List required accounts, credentials, resources, and values to configure."
- **Vendor self-promotion and links.** No page read mentions vendors, promotion, affiliate links or links to a paid
  service, for or against. Practice is permissive: Apify publishes under its own verified account (`apify`), and 17 of
  the 104 recent vendor templates below come from accounts named after the vendor product in the title. The one line on links:
  "You can link to detailed setup guides or add a walkthrough video as a supplement."
- **Paid templates** (create-templates page): "You must become a verified creator before you can offer paid templates."
  "You're responsible for tracking payments, delivering the template after someone buys it, and keeping it accessible to
  the buyer. Failure to deliver a paid template may result in account suspension or a ban." Verified = three approved
  templates, submitted one at a time.
- **Sticky notes** (required): "Every template needs one main overview note. Workflows with four or more nodes also need
  section notes"; the overview is "one yellow note in the top-left corner", "from 100 to 300 words", headings
  `### How it works`, `### Setup`, optional `### Customization`; section notes "under 50 words".
- **Originality**: "Don't copy, repost, or resell someone else's workflow. Plagiarism will result in an account ban."

So the terms pass the item's test: a template that needs a paid third-party account is allowed when it says so.

## 2. Views: what a new template gets

The search API (`api.n8n.io/api/templates/search`) accepts `sort=createdAt:desc` (found this run), so the newest
templates can be read directly. Two counters exist: `totalViews` in the listing and `views` on the template's own record
(`/api/templates/workflows/<id>`, which also carries `recentViews`). **The listing counter lags** — 12 records read both
ways: 0 → 0 (five), 0 → 2, 0 → 3, 0 → 4, 0 → 8, 0 → 103, 2 → 127, 119 → 119. The record is the truer number; the
listing under-reads recent templates, so both are shown.

**The whole library, newest first** (seven pages of 20, 2 to 84 days old): 134 of 140 templates show 0 views, the other
six 1, 1, 4, 8, 13 and 15. Page 130 is dated 25–26 August, so about 2,600 templates were published in 84 days — **31 a
day**. All 585 templates read, by age (listing counter):

| Age | Templates | At 0 views | Median | 90th percentile | Highest | At ≥ 100 |
|---|---|---|---|---|---|---|
| 0–30 days | 169 | 164 | 0 | 0 | 42 | 0 |
| 30–60 days | 79 | 68 | 0 | 13 | 124 | 1 |
| 60–90 days | 60 | 57 | 0 | 0 | 119 | 1 |
| 90–180 days | 41 | 18 | 1 | 32 | 98 | 0 |
| 180–365 days | 63 | 21 | 6 | 91 | 519 | 5 |
| over a year | 173 | 18 | 153 | 20,561 | 214,907 | 97 |

The views the exchange saw (132–2,462 on the default listing's first ten) sit on templates published between June 2025
and July 2026; the default listing is not ordered by date, and none of its first 100 rows is paid.

**Vendor-API templates, last 90 days.** Eleven searches, ten of them also newest-first (`enrichment`, `lookup`,
`verify`, `monitor`, `registry`, `compliance`, `lead`, `scrape`, `API`, `data API`, `company data`), plus the exchange's
four, gave 176 distinct templates
published since 20 August; 104 name the vendor API they are built on in the title (Apify 71, then Decodo, Bright Data,
Precleared, CoreSignal, Apollo, Firecrawl, PDF Vector, iBlueText, Scrapewise, GLEIF and others; 50 by verified creators).
**102 of the 104 show 0 views; the other two show 13 and 19; median 0.** The library's median for the same age is also
0, so a vendor template does no worse than any other — nothing new gets seen. The 42 rows at 19 days or older, or
checked on their own record:

| Template (id) | Creator | Age, days | Views (listing) | Views (template page) | Views/day |
|---|---|---|---|---|---|
| Serve a company enrichment API with Bright Data and OpenAI GPT-5.6 (18628) | tomax ✓ | 86 | 0 | 8 | 0.09 |
| Sync Facebook events to Google Calendar using Apify’s Facebook Events Scraper (19379) | alfalfa | 71 | 0 | — | 0.00 |
| Verify contract extraction and flag hallucinated fields with Judgment API (19722) | greg ✓ | 61 | 0 | — | 0.00 |
| Enrich and verify partnership leads from Google Sheets with Apollo and Instantly (19778) | athash007 ✓ | 58 | 0 | — | 0.00 |
| Scrape blog posts with Firecrawl and save cleaned content to Google Docs (19819) | mssporto ✓ | 57 | 0 | — | 0.00 |
| Scrape Google Maps leads by keyword to Google Sheets with GMaps Lead Finder (19832) | jasonchuh | 57 | 0 | — | 0.00 |
| Verify phone and email leads with Zelnum via HTTP request (20137) | yaho | 50 | 0 | — | 0.00 |
| Generate and verify B2B leads with CoreSignal, Apify, Google Sheets, and GPT-4o  (20263) | mudaibuilder ✓ | 48 | 0 | — | 0.00 |
| Scrape Google Maps places to Google Sheets with Apify (20292) | apify ✓ | 48 | 0 | 103 | 2.14 |
| Enrich company websites in Google Sheets with contact data via Weio (20374) | weio | 46 | 0 | — | 0.00 |
| Triage AliExpress product review complaints with Apify reviews scraper (20603) | falcon-scrape ✓ | 42 | 0 | — | 0.00 |
| Monitor and verify signed crypto prices with MCP and Pulse Verity Index (20786) | pulseverity | 37 | 0 | — | 0.00 |
| Verify phone numbers via SMS Vert Pro OTP and log verified numbers to Google She (20862) | beesonline ✓ | 36 | 0 | — | 0.00 |
| Upsert Lection scrape results into Google Sheets with webhook deduplication (20923) | lection | 36 | 0 | — | 0.00 |
| Monitor AI citation changes for your domain with TriRank and SMTP email (20942) | trirankai ✓ | 35 | 0 | — | 0.00 |
| Check cold email compliance and draft Gmail messages with Precleared (20949) | gabeao ✓ | 35 | 0 | — | 0.00 |
| Monitor hotel competitor rates on Booking.com and tiket.com with MrScraper, Gemi (20971) | ghazyachmed | 35 | 0 | — | 0.00 |
| Send new subreddit posts to Slack with Apify Reddit scraper (20980) | harshmaur ✓ | 35 | 0 | — | 0.00 |
| Monitor RSS feeds and send new items to Slack and Google Sheets with Apify (21085) | quillrow ✓ | 33 | 0 | — | 0.00 |
| Screen Google Sheets leads for cold email compliance with Precleared (21093) | gabeao ✓ | 33 | 0 | — | 0.00 |
| Extract 1688.com product data to CSV with UnitBytes and Apify (21097) | unitbytes ✓ | 33 | 0 | — | 0.00 |
| Log and verify Qersh wallet transfers via webhooks to Google Sheets (21102) | shark-dev | 33 | 13 | — | 0.39 |
| Verify Google Sheets lead emails with Apify Email Verifier (21192) | sumitrmardy | 31 | 0 | — | 0.00 |
| Monitor Amazon MAP violations in offer listings with Google Sheets and ScrapeHer (21451) | yenvitty | 28 | 0 | — | 0.00 |
| Monitor weekly domain health with Apify, Google Sheets, and Slack (21453) | quillrow ✓ | 28 | 0 | — | 0.00 |
| Monitor Google reviews with Scrapewise, Google Sheets, and Slack alerts (21466) | scrapewise ✓ | 28 | 0 | — | 0.00 |
| Check new HubSpot contacts for GDPR cold email compliance with Precleared (21478) | gabeao ✓ | 28 | 0 | — | 0.00 |
| Monitor Amazon deals and strong sellers with Apify, OpenAI and Slack (21608) | mattmichels ✓ | 26 | 0 | — | 0.00 |
| Monitor urgent App Store reviews with Apify, OpenAI, Google Sheets and Slack (21619) | mattmichels ✓ | 25 | 0 | — | 0.00 |
| Review and monitor KYB ownership chains with GLEIF, OpenAI and Gmail (21628) | aiflowpacks ✓ | 25 | 0 | 3 | 0.12 |
| Monitor SSL certificates and security headers with Apify, Slack, and Gmail alert (21655) | edenworks ✓ | 25 | 0 | — | 0.00 |
| Track new ATS job postings in Google Sheets with Apify ATS Jobs Scraper (21906) | fecklesspleb | 21 | 0 | — | 0.00 |
| Create and approve WordPress articles and social videos with Airtable, OpenAI, T (22046) | matilda ✓ | 20 | 0 | — | 0.00 |
| Monitor Google Maps listing changes with Apify, OpenAI, Sheets, Slack, and Gmail (22055) | mattmichels ✓ | 20 | 0 | — | 0.00 |
| Verify lead emails from websites with Apify and Google Sheets (22104) | echoempire | 19 | 0 | — | 0.00 |
| Monitor SPF, DKIM and DMARC across multiple domains with Apify, Gmail and Slack (22128) | edenworks ✓ | 19 | 0 | — | 0.00 |
| Log trade show exhibitor leads to Google Sheets with Apify and Gmail (22131) | devanshtiwari ✓ | 19 | 0 | — | 0.00 |
| Monitor Reddit and score leads with Apify, OpenAI, OpenRouter and Slack (22140) | headply | 19 | 0 | — | 0.00 |
| Find new Swiss B2B leads from SHAB using Apify, Google Sheets and Gmail (22156) | swissalpinedata | 18 | 0 | 0 | 0.00 |
| Fetch daily German construction tenders with GAEB data using Apify (22267) | brsksr | 16 | 0 | 0 | 0.00 |
| Monitor new USPTO trademarks with Apify and send alerts to Sheets and Slack (22800) | magnova | 6 | 0 | 0 | 0.00 |
| Track EU tender deadline changes and send briefs with Apify and Slack (22835) | kizukidata | 5 | 0 | 0 | 0.00 |

The rows closest to gankdat are other data vendors doing exactly the promote shape, several by Apify actor authors: a USPTO
trade mark monitor (0 views at 5 days), an EU tender deadline tracker (0 at 5), Companies House filing reminders (0 at
2), German construction tenders (0 at 16), Swiss commercial-register leads (0 at 18), a KYB ownership check on GLEIF (3
at 25), a Polish VAT white-list check (2 at 31), a UK government tenders tracker priced US$99 (4 at 63). The best
recent vendor result read is Apify's own official Google Maps template, from the verified `apify` account: **103 views
in 48 days** (`recentViews` 1). One older record for scale: the Implisense company-data template (December 2025,
verified, in the default listing's first ten) has 608 views in 11 months, 24 of them recent.

## 3. Paid templates

- **Share.** 31 of the 585 distinct templates across 38 search pages carry `price > 0` (5 %); every one is by a verified
  creator, as the rule requires. Among the 140 newest-first library rows, 3 are paid; among the default listing's first
  100, none.
- **Prices.** US$5–99, median US$30: 5, 7, 9, 15, 15, 19 (×4), 20, 24, 25, 29 (×3), 30, 39, 39, 49 (×6), 59, 79 (×4),
  99, 99.
- **Views.** Median 14; 11 of 31 at 0; five above 400 (496, 1,022, 1,066, 1,986, 2,767), all published before November
  2025. Of the 11 paid templates published in the last 90 days, ten show 0 views and one 119.
- **Where `purchaseUrl` points.** Gumroad 10, Payhip 4, Stripe payment links 4, the creator's own shop 8 (khaisa.studio
  4, spagreen.net 2, two others), Fiverr 2, and one each on PayPal, Dodo Payments and Polar. n8n takes no cut and
  handles no payment — a paid template is a link out.
- **Sales signal.** None published by n8n. Two Gumroad pages read: the best-viewed paid template found (a lead
  enrichment workflow, 1,986 views since April 2025, €39) shows **one rating**; the UK government tenders template
  (US$99, 4 views in 63 days) shows none. A Payhip page answered the runner 403. Gumroad shows a rating only from a
  buyer, so 1,986 views produced at least one sale and no evidence of more.

## 4. The end-to-end test on a hosted runner (sketch, nothing dispatched)

The guideline: "Test the exact JSON file you plan to submit … Export the workflow and import it into a fresh workflow …
Run the complete workflow with representative input. Check the final result in the destination service, not just the
execution status."

- **Licence.** n8n's Sustainable Use License: "You may use or modify the software only for your own internal business
  purposes or for non-commercial or personal use." Running the community edition on a runner to test our own template is
  inside that; no paid n8n plan is needed.
- **CLI** (docs, "Use the command line"): `n8n import:workflow --input=<file.json>` then `n8n execute --id <ID>`; the
  page notes "import:workflow deactivates every imported workflow", which suits a one-shot test.
- **Sketch** — one line in `run-script.yml`'s allow-list (workspace `@foundry/gankdat`, script `n8n-template-test`,
  `npm ci` not needed), the script doing: `npx n8n@<pinned> import:workflow --input=templates/<name>.json`, then
  `npx n8n@<pinned> execute --id <ID>` with the HTTP nodes pointed at gankdat's keyless MCP preview (5 rows a call, 20
  calls a day for the runner), asserting on the execution's JSON output.
- **What it cannot do.** The destination nodes (Google Sheets, Slack) need OAuth credentials that live in an n8n
  instance; a runner without them can prove the import and the gankdat half, not "the final result in the destination
  service". A full pass needs either a webhook-style destination we own in place of Sheets and Slack for the test, or
  the owner's accounts. **This sketch was not run**: the install time of n8n from npm on a runner and the exact
  `execute` output shape are unread, and would be the first thing a promote checks.

The runner is therefore not the park reason: the test is free and mostly automatable.

## 5. Score and call

STRATEGY §5: evidence **1** (paid templates exist, but one rating on the best-viewed and no vendor template seen within
90 days) × reach **1** (0–8 views for the register templates most like ours) ÷ (0.5 build day + 15 owner minutes) ≈
**1.3**, down from the exchange's raw 5.3. The item's park test — "vendor-API templates in data categories published in
the last 90 days sit under 100 views" — is met by 103 of 104 (listing counter, record where read); the one exception, at 103 views, is the shelf's largest
vendor publishing under its own name.

**Park** — `n8n-template-library` in `docs/pipeline/exchange.json`. What this spike settled: the terms allow a vendor's
template and AI-assisted work, the test is free, and the shelf does not show a new template to anyone — it is the
seventh shelf where a listing alone brings no reader (the pattern of the six before it), and the one buyer type not yet
tried, workflow builders, cannot be reached this way.

**Re-open when** (any one):

- a gankdat user asks for an n8n workflow (an inbox or /feedback line), or the Daily numbers show an n8n user agent on
  the API or the MCP endpoint on three separate days — then the template is support for a user we have, at 0.5 day;
- a re-read finds a data-register template (company, tender, trade mark or sanctions data) published within the
  previous 90 days at 100 or more views on its own record — the eight named above are the ones to re-read first;
- n8n publishes sales or install counts for templates, or starts taking payment itself;
- the parked `n8n-community-node` trigger fires (20 or more Claude tool callers) — a node and its templates go together.

No dated re-read is set: nothing here changes by a date.
