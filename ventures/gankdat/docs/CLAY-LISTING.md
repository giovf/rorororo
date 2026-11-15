# Clay — HTTP API listing and community Skill (queue `clay-http-api-listing`, 2026-11-09)

What was built, what the owner submits, and the paste-ready copy for both forms. Evidence and the
decision: `docs/exchange/spikes/clay-data-provider-marketplace.md` (spike 2026-11-08, two relay
rounds) and the relay round `docs/relay/responses/clay-skill-format` (2026-11-09: a marketplace
Skill page, which showed the Skill format and the install command).

## What exists

| Piece                                                       | Where                                                                                         |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Docs page: five HTTP API column configs + CRM walkthrough   | https://gankdat.com/clay (`public/clay.html`; sitemap row; strict CSP in `public/_headers`)   |
| Landing card                                                | https://gankdat.com/ → "built for ai agents" → _clay (http api)_                              |
| The Skill (Agent Skills format)                             | `skills/uk-company-register-check/SKILL.md`, public at https://github.com/giovf/gankdat/tree/main/skills/uk-company-register-check after the next mirror sync |
| Intro video for Clay's partner team (83 s, captions, no voice) | https://apps.gankdat.com/demo/clay-intro.mp4 (`scripts/demo-clay-intro.ts`; §3) |
| Test pinning the page and the Skill to the registry         | `test/clay.spec.ts` (every documented source, parameter, field path and rate limit is real)  |

No Worker change: the columns call the live `/v1/data/<source>` routes with the user's bearer key,
so there is nothing new to bill, deploy or version. A Clay user pays us one credit a row on their
own key (free 250 a month, then from £5 per 1,000); Clay bills its own action and no Data Credit.

## What the owner does (action 039, ≤ 15 min, no verification)

1. **Integrations Partner intake form** — https://clayhq.typeform.com/to/jex58rxk (the "Apply now"
   link on https://www.clay.com/partners/integrations). A form with contact details; no contract,
   no verification stated. Clay's own page: "Fit review — we assess routing: native integration,
   marketplace listing, HTTP API, or future review", 30–60 days. We ask for the **HTTP API** tier
   (a listing on clay.com/integrations and the docs pointing at our page). Copy in §1.
2. **Community Skill** — https://marketplace.clay.com/ → _Submit GTM skill_ (sign-in is a Clay
   account; a free workspace is an email sign-up, no card). Paste §2 and the `SKILL.md`. This step
   is the owner's call: it opens a Clay account in their name. If they would rather not, step 1
   alone is the listing; the Skill stays installable from the public repository.
3. Reply `039 done` (or `039 step 1 only`) and, when Clay answers, forward nothing — the inbox
   triage reads the mail (`docs/ops/SELF-CAUSED.md` row).

## §1 — Integrations Partner intake (Typeform), paste-ready

The form's fields are not readable from the sandbox (Typeform renders client-side); the answers
below cover the three things the page says it asks for — use case, data coverage, technical setup —
plus contact and links. Shorten to the field's limit where one applies.

- **Company / product:** gankdat — official UK and EU public registers as one API (gankdat.com).
- **Contact:** the owner's name and email (the gankdat.com support mailbox).
- **Website:** https://gankdat.com · **Docs for Clay users:** https://gankdat.com/clay ·
  **API reference:** https://gankdat.com/docs · **OpenAPI:** https://gankdat.com/openapi.json
- **Integration type requested:** HTTP API template / listing (bring-your-own-key).
- **Use case (what Clay users do with it):** Qualify and screen UK company lists before outbound
  or onboarding: Companies House status, incorporation date, SIC codes, overdue accounts and
  confirmation statements, charges and insolvency history; Gazette insolvency notices; UK Sanctions
  List designations; Charity Commission registration; licensed visa sponsor status. Route, review
  or disqualify accounts from official registers, by company number, in one GET per check — no
  per-company lookups across three or four Companies House endpoints.
- **Data coverage:** England & Wales, Scotland and Northern Ireland company register (5.4M
  companies, read live from the Companies House public-data API and cached 24 h); the Charity
  Commission register (~185k charities, daily); corporate insolvency notices from The Gazette
  (daily); the UK Sanctions List (FCDO/OFSI, daily); the Home Office register of licensed sponsors
  (~143k rows, daily). Plus 12 further registers (Find a Tender and Contracts Finder, EU TED, CQC,
  schools, NHS organisations, food hygiene, trade marks, gambling licences, US exclusions) with the
  same API shape. Open-licence official sources only; personal data dropped at ingest (no officers,
  no contact details) — a qualification and compliance dataset, not a contact source.
- **Technical setup:** REST, `GET https://gankdat.com/v1/data/<source>?<param>=<value>`, bearer
  API key (`Authorization: Bearer <key>`, stored as a Clay HTTP API (Headers) account), JSON
  envelope `{ ok, data[], meta.total }`, OpenAPI 3.1 at /openapi.json, per-source rate limits
  (30/min for the company record, 60/min otherwise, `Retry-After` on 429), field paths and
  conditional-run guidance on https://gankdat.com/clay. Also an MCP server (/mcp) and x402
  pay-per-call for agents. Pricing: free 250 calls a month; £5 per 1,000; plans to 100k.
- **Which Endpoint(s) do you want to turn into Clay actions?** (form field, seen by the owner 2026-11-12)
  Five GET endpoints, one per UK register check. Each takes one query parameter mapped from a Clay
  column and returns JSON { ok, data[], meta.total }: 1. Companies House company record — GET
  https://gankdat.com/v1/data/uk-company-profiles?company_number={number} (or ?company={name}); status,
  incorporation date, SIC codes, overdue accounts/confirmation statement, charges, insolvency history.
  2. Charity Commission register — GET https://gankdat.com/v1/data/uk-charities?company_number={number}.
  3. Gazette corporate insolvency notices — GET https://gankdat.com/v1/data/uk-insolvency?company={name}.
  4. UK Sanctions List (FCDO/OFSI) — GET https://gankdat.com/v1/data/uk-sanctions?name={name}.
  5. Home Office licensed visa sponsors — GET https://gankdat.com/v1/data/uk-sponsors?organisation={name}.
  Auth: Authorization: Bearer <user's gankdat API key>. Field paths and Clay column configs:
  https://gankdat.com/clay
- **Rate Limit of the endpoint(s)** (form field): Per API key: 30 requests/minute for
  uk-company-profiles (it reads the Companies House API live), 60 requests/minute for the other four.
  Over the limit the API answers HTTP 429 with a Retry-After header; a briefly busy register answers 503
  with Retry-After. Monthly volume follows the user's plan: free 250 calls a month, paid plans from £5
  per 1,000 up to 100,000 a month.
- **Do you want to sell data to Clay customers in our Marketplace?** (form field, 2026-11-12): **Yes** — it
  asks to be considered for the paid credit-marketplace tier (Clay buys our calls on an annual API agreement); the fit
  review still routes us, so the HTTP API listing remains the fallback. Any contract Clay offers comes back to the owner
  as its own decision before signing.
- **How much do you charge for this data (per endpoint)?** (form field, 2026-11-12): Same price for all five
  endpoints: one credit per call. Retail today (self-serve, user's own key): free 250 calls/month; then US$6 per 1,000
  (US$0.006/call), down to US$299 per 100,000 (US$0.003/call). GBP: £5/1k to £239/100k. For Clay's marketplace
  (wholesale, Clay billing its users): US$0.004 per call that returns a record, no charge for empty results; US$0.0025
  per call above 1M calls/month. Monthly invoice in arrears, no minimum commitment. Why: Clay resells at ~US$0.045–0.05
  a Data Credit (≥ 10× margin at one credit); between our two top plan rates; marginal cost ≈ 0 — the one ceiling is
  uk-company-profiles' shared Companies House quota (600 req / 5 min ≈ 170k a day), raised only if a contract comes.
- **Customers today:** self-serve developers and AI agents (MCP + x402), the Excel add-in on
  AppSource; UK data buyers on the Apify Store.
- **Why Clay:** 220 providers on the marketplace and none native to the UK registers — Beauhurst
  returns a company number from a domain; nothing covers charities, insolvency, sanctions or
  sponsor licences. Clay's community already builds this by hand with three or four HTTP API
  columns per company against the Companies House API.
- **What we are asking for:** the HTTP API tier — a template/listing that points Clay users at the
  page above, with the user's own gankdat key. No revenue share expected (the FAQ says there is
  none for data partners); an annual API agreement is a later conversation if usage warrants it.

## §2 — Community Skill submission, paste-ready

Fields mirror what a listing shows on marketplace.clay.com (read 2026-11-09).

- **Name:** UK Company Register Check
- **Slug:** uk-company-register-check
- **Category:** Score & qualify (secondary: Verify & clean)
- **Persona:** RevOps · Sales development
- **Format:** Skill (requires a coding agent) · Version 1 · Free
- **Tagline:** Qualify UK accounts against five official registers before anyone emails them
- **About:** Checks each UK company on your list against the official registers through the
  gankdat API — Companies House status, overdue filings, charges and insolvency history; Gazette
  insolvency notices; the UK Sanctions List; Charity Commission registration; visa sponsor licence
  — and returns a verdict per account (qualified, review, disqualify) with the evidence and a
  coverage-and-spend line. One gankdat credit per check on your own key (free 250 a month). No
  officers or personal data: this qualifies companies, it does not find contacts.
- **When to use it:** Before an outbound push or at onboarding, when a list of UK companies
  (names or Companies House numbers) needs a status, risk and compliance pass from primary
  sources rather than a firmographic vendor's copy. Avoid it for contact finding or for formal
  sanctions screening where your obligations need a screening provider.
- **What it delivers:** A digest table — company, number, status, age, overdue flags, insolvency
  notices, sanctions hits, charity, sponsor licence, verdict, Companies House URL — plus one line
  with companies checked, placed, not found, unreadable, calls made and credits spent; a CSV or
  rows pushed to a Clay table on request.
- **How someone would prompt this:** "Here are 300 UK accounts from HubSpot with company numbers.
  Tell me which are active and clean, which have overdue filings or an insolvency notice, and
  which are on the sanctions list — and tag the charities and visa sponsors. Budget 1,500 gankdat
  credits."
- **Inputs:** 01 Companies (CSV, list or Clay export: company_number and/or company_name) ·
  02 Rules (which outcomes disqualify, review, qualify; which tags matter) · 03 Budget (maximum
  gankdat credits) · 04 Delivery (table, CSV path or Clay table).
- **Outputs:** 01 Register digest (one row per company with verdict and evidence) · 02 Coverage
  and spend line.
- **Steps (as the listing's table):** 01 Confirm scope and cost · 02 Resolve numbers from names ·
  03 Company record · 04 Insolvency notices · 05 Sanctions · 06 Charity and sponsor licence ·
  07 Place every company · 08 Deliver.
- **Requirements:** a gankdat API key in `GANKDAT_API_KEY` (free at gankdat.com/account).
- **Links:** https://gankdat.com/clay · https://gankdat.com/docs ·
  https://github.com/giovf/gankdat/tree/main/skills/uk-company-register-check
- **Creator:** the owner's name; company gankdat.

## §3 — Intro video (queue `clay-intro-video`, 2026-11-15)

The intake form's Loom field was left empty on 2026-11-12; this is what it asked for — the product,
its key specs and why an integration helps — as an 83-second captioned recording with no voice:
**https://apps.gankdat.com/demo/clay-intro.mp4** (1280×720, 2.2 MB).

| Shot | Seconds | What is on screen                                                                                   |
| ---- | ------- | --------------------------------------------------------------------------------------------------- |
| 1    | 8       | gankdat.com: official UK public registers as one API                                                |
| 2    | 10      | gankdat.com/clay: five register checks as HTTP API columns                                          |
| 3    | 12      | The column configs, then "What a row costs": the user's own key, 250 calls a month free, £5 per 1,000 |
| 4    | 14      | Oxfam by its company number 00612172: the Companies House record's field paths and values           |
| 5    | 14      | The same company on the charity, insolvency, sanctions and sponsor registers: `meta.total` and fields |
| 6    | 11      | Why Clay: 220 providers, none native to the UK registers; rate limits; no personal data             |
| 7    | 7       | Links: gankdat.com/clay, /docs, /openapi.json, info@gankdat.com                                     |

How it is made: `node --disable-warning=ExperimentalWarning scripts/demo-clay-intro.ts` (the hackathon
recorder, `scripts/demo-video.ts`), no network and no secret. The pages are `public/` served on a
local port; the register answers are real ones read from gankdat.com on 2026-11-15 by a GitHub runner
(relay rounds `clay-intro-video-2026-11-15`, `-b`, `-c`: one keyless MCP preview call per register),
printed under the REST request a Clay column sends for the same record. The terminal's title bar
says the day read and the route. To re-record after the page or the registers change: a new relay
round, its folder in `DEMO_LOOKUP_DIR`, then copy `dist/demo/clay-intro.mp4` to
`packages/landing/site/demo/` (the landing workflow deploys it).

**For a reply to Clay** (one sentence, paste-ready): "A short captioned walkthrough of the five
endpoints, with one real company read across the registers, is at
https://apps.gankdat.com/demo/clay-intro.mp4 (83 seconds, no sound)." The reply drafted on 2026-11-13
is the owner's to send as it stands; the inbox triage adds the sentence to the next draft on a
clay.com thread. Nothing new is asked of the owner.

## Proof and kill (from the spike)

- **Proof:** the listing live on clay.com/integrations or the Skill live on marketplace.clay.com;
  then Clay's traffic in the Daily numbers `rest 7d by UA:` clause (Clay's HTTP API user agent
  family, whatever string it sends) and keys named `clay` in `api_keys` (the page asks users to
  name the key so; the metrics runner can count them with its D1 token when the first appears).
  gankdat records no sign-up referrer, so "keys with a clay referrer" is read this way.
- **Kill:** no listing and no Skill approval 90 days after the application → park in the exchange
  with "reapply at the first paying UK account" (queue `clay-listing-day-90-read`).
