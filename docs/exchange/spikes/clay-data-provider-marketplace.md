# Spike: Clay's integrations marketplace as a buyer channel for gankdat's registers

Queue item `new-ventures/spike-clay-data-provider-marketplace` (build, 2026-11-08 17:10–17:55 UTC). Sources: two fetch-relay
rounds this run — `docs/relay/responses/clay-spike-2026-11-08` (20 lines: the partner-programme post, the FAQ, pricing, the
2026 Data Partner Awards post, the Lusha + Beauhurst post, the Beauhurst changelog, provider and action pages, the
Beauhurst docs, the HTTP API docs, the enrichments and credit-conservation guides, the Beauhurst Claybook, three community
threads, the integrations marketplace rendered) and `…-b` (the Integrations Partner page, the credit-refunds doc, the use-case
template library, the community skills marketplace, HitHorizons, the corporate-structure action). WebSearch snippets of 11-07
are marked *index*. The question: can gankdat's register lookups (Companies House profiles, charities, insolvency, sanctions,
sponsor licences) be sold to Clay's users without a contract or an identity step for the owner, and what does a row earn.

## 1. The partner programme's terms (relay 11-08)

| Source | What it says | Consequence |
| --- | --- | --- |
| clay.com/blog/announcing-the-clay-partner-program (Aug 19, 2025) | "The Clay Integrations Partner Program is designed for the data providers, platforms, and APIs powering the workflows our customers run every day." Benefits: "Aggregate Demand into ARR: Clay turns thousands of monthly contracts into **a single annual API agreement** that can be recognized as ARR"; "Customers can test your data with Clay Credits"; "Clay users embed your API keys into recurring workflows". Apply: a Typeform (`clayhq.typeform.com/to/jex58rxk`). | the paid-by-Clay route is a wholesale API contract: Clay buys our calls and resells them as Clay Credits |
| clay.com/partners/integrations | "Sell data on our marketplace, instantly accessing 500K+ GTM teams"; "Convert Clay users into direct customers through our in-product credit marketplace". Four steps: **Submit** the intake form; **Fit review** — "We assess routing: native integration, marketplace listing, **HTTP API**, or future review"; **Build** — "Publish your API template or build your native integration"; **Grow** — "Get your branded integration live, listed on our website and docs". "Integration typically … 30-60 days." Templates and waterfalls: "We will make the additions by our own discretion." | a third tier exists below the contract: an **HTTP API template** Clay lists on its website and docs, where the user's own key pays us directly — the no-contract route the spike was to find |
| clay.com/faq | "revenue share is only given to Solutions Partners" (the 20 % affiliate programme for agencies, paid through Rewardful after 30 days) | there is no revenue share for data partners: a data partner is paid by the API agreement or by its own keys, nothing else |
| 2026 Data Partner Awards post | first Partner Day; the ten winners are HG Insights, LeadMagic ("first … to cross 1 billion enrichment runs"), People Data Labs, G2, Crunchbase, Adyntel, Intentsify, Pubrio, Openmart, Pursuit ("public sector data, a category no other Clay partner currently covers") | the credit marketplace is for established vendors; a £0-revenue register API applies to the HTTP API tier, not the credit tier |
| Who qualifies | no eligibility, company-size or verification text on either page: a form, a fit review, a shared Slack channel | no identity or business verification is stated for the listing; the "annual API agreement" is a contract the owner would sign only if Clay later routes us to the credit marketplace |

The 11-07 figures (10k+ customers, US$50M to partners in 2025) are not on the pages read today; the partner page says
"500K+ GTM teams" and the Series D post (Nov 2026, *index*) says "more than 17k customers". Neither is a UK figure.

## 2. The UK register slot in the marketplace (rendered 11-08)

The marketplace lists **220 providers** (data-provider links on the rendered page), with filters for "Government Data",
"Public Sector" data points and a "UK" data-strength tag. UK register coverage among them:

| Provider | What it returns | Price shown |
| --- | --- | --- |
| **Beauhurst** (UK & Germany; joined via the Lusha + Beauhurst post) | Enrich Company from a **domain**: legal name, incorporation date, **Companies House number**, status, employee band, addresses, phone, emails, LinkedIn; Find Company Funding; Find Company Corporate Structure. "Clay Credits or Bring Your Own Account", "All Plans"; the docs say actions "return no data for companies outside these markets. Credits are refunded when no data is returned"; the Claybook says "You'll need to bring your own Beauhurst API key" | **per-row credit price not published** on the provider page, the action page, the docs, the changelog or the Claybook — Clay shows it in the enrichment modal only |
| HitHorizons | "80 million companies from 50 countries in Europe and the UK … commercial and government sources" | provider page: "Actions — No items found" (no live action) |
| Lusha, Vainu, Dealroom, PitchBook, Crunchbase, Companies-People-and-Jobs | EMEA contacts, Nordic and startup data | none reads a UK register |
| Companies House, Charity Commission, Insolvency Service, OFSI sanctions, Home Office sponsors | — | **absent**: no native integration, no HTTP API template on the page |

So the register-native slot is open: Beauhurst is the only action that returns a Companies House number, and only from a
domain. gankdat's lookups answer by company number or name and add the registers Beauhurst does not touch (charities,
insolvency notices, sanctions, sponsor licences).

**Demand evidence from Clay's community (relay 11-08):** a tutorial post "Using the Companies House API for UK Company
Prospecting" (Aug 27, 2025: a video that finds newly registered companies, "find their directors" and prospects to them,
"enrichment by enrichment" — 2 reactions); a Discussion thread "Integrating Companies House API with Clay" (Sep 2024,
21 comments, stuck on the filing-PDF document API); plus *index* posts on discovering new UK companies and finding
restaurant directors. Thin but real, and it points at a fit problem: these users want **directors** (people to email),
which gankdat drops at ingest (Blind Mode, 2026-09-20). Our row is for qualification and compliance — status, insolvency,
sanctions, sponsor licence — not for contact finding.

## 3. What a row costs the Clay user, and what it pays us

Clay bills two meters (credit-refunds doc, Nov 2026): **Actions** (one per record run) and **Data Credits** (the provider
call behind it). An HTTP API enrichment with the user's own key spends an Action only. From the pricing page:

| Meter | Cheapest list price (relay 11-08) | Per unit |
| --- | --- | --- |
| Actions | Launch 180K/yr at US$54/mo; 15K/mo at US$60/mo | **US$0.0036–0.004** |
| Data Credits | Launch 30K/yr at US$113/mo; 2.5K/mo at US$125/mo | **US$0.045–0.05** |
| Free plan | 500 actions/mo, 100 data credits/mo, 200 rows a table, "Bring your own API key" listed as included (the Sep 2026 credit guide still calls own keys a "Paid Feature" — the pricing page is newer) | a free Clay user can run our template on 200 rows |

| Our side | Per row |
| --- | --- |
| gankdat company profile, keyed (1 credit; saver £5 for 1,000) | **£0.005 ≈ US$0.006** |
| gankdat company profile on x402 (`x402PriceUsd` '$0.01') | US$0.01 |
| a Beauhurst row | ≥ 1 Data Credit ≈ US$0.045–0.05 if it is priced at one credit (the multiplier is unpublished) |

A Clay user paying us US$0.006 a row plus Clay's US$0.004 action is still some 5× under one Data Credit. The DIY route
the tutorial teaches costs the user three or four Actions per company (profile, PSC, filings as separate HTTP calls) and
their own Companies House key; our lookup is one call.

## 4. Distribution without a contract

- **HTTP API tier of the partner programme** (section 1): listing on clay.com/integrations and the docs after a fit review;
  the user's own gankdat key pays us. The marketplace already shows this type (filter "HTTP API"; Directus is listed as
  "via HTTP"). Discretionary (30–60 days), but the application is a form, not a contract.
- **marketplace.clay.com** — "GTM Skills built by the community … reviewed by Clay, and ready for the coding agents teams
  already use": **49 skills**, a "Submit GTM skill" button, install counts of 0–34 on the first page. A "UK company
  register check" skill (Claude Code/Cursor skill that drives our REST API) is a second shelf, free to list.
- **Shared-table templates**: every Claybook's "Download the template" is an `app.clay.com/shared-table/share_…` link any
  workspace can produce; the public template library (91 Claybooks) and the HTTP API "Browse templates" list are Clay's own
  with no public submission — so our template link lives on our docs page and in the application, and Clay adds it to its
  lists "by our own discretion" once the integration is live.

## 5. Call

**Promote — the no-contract route, as one gankdat distribution item (`clay-http-api-listing`, score 5, 0.3 day).** The
register slot is open on a 220-provider marketplace, the partner page itself offers an HTTP API listing tier with no
contract and no stated verification, the user's own key pays us at our list price, and the build is a docs page plus a
template. Scored honestly at 5: evidence is a confirmed gap with thin asks (two community threads, people-focused) ×
Clay's own listing and a community skills shelf ÷ 0.3 day, discounted because the listing is at Clay's discretion and
Blind Mode makes our row a qualification tool, not the director finder those threads want.

- **Build (sandbox, 0.3 day):** `ventures/gankdat/public/clay.html` — "Use gankdat in Clay": the HTTP API enrichment
  config for each register lookup (GET `https://gankdat.com/v1/data/<source>?company_number={{Company Number}}`,
  `Authorization: Bearer <key>` saved as an HTTP API (Headers) account, the output fields to map, a conditional-run formula
  so blank rows spend nothing), a Claybook-shaped walkthrough (CRM accounts → status + insolvency + sanctions + sponsor
  flags → route or disqualify), the skill folder for marketplace.clay.com, the sitemap row and the ARCHITECTURE note.
- **Owner (≤ 15 min, no verification):** submit the Integrations Partner Typeform with the docs URL, and the skill on
  marketplace.clay.com; both are a form with contact details. The free Clay workspace that produces the shared-table link
  is an email sign-up — the owner's call whether to open it in the same step or let the docs page carry the manual config.
- **Proof:** the listing live on clay.com/integrations or the skill live on marketplace.clay.com; then keys created with a
  `clay` referrer and their paid rows in the Daily numbers. **Kill:** no listing and no skill approval 90 days after the
  application → park in the exchange with "reapply at the first paying UK account".
- **Not promoted:** the credit-marketplace listing (the annual API agreement). It is the route the awards show pays, but it
  is a contract and Clay picks vendors with volume; the HTTP API listing is the foot in the door, and a Clay user base on
  our keys is the evidence a later application needs.
