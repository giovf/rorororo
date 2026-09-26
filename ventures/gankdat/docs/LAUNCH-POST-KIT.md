# Launch-post kit — Product Hunt, Show HN, r/datasets, Indie Hackers

Written 2026-09-26 (build routine, gankdat queue item `launch-post-kit`, owner action 010 §2).
gankdat has never been announced by a person anywhere; the only distribution so far is
agent-side (MCP registry, mcpservers.org, awesome-remote-mcp-servers, Glama, the Apify Store).
These four venues need a human to post under their own name and answer comments for a few
hours, so the copy is written for **you** to paste. Everything below is true as of v0.18.0;
before each post, refresh the numbers in §7 (five minutes) so nothing in the post is stale.

Supersedes the per-venue drafts in `GO-TO-MARKET.md` (July 2026: two datasets, a waitlist).
The rules of engagement in `STAGE0-PLAYBOOK.md` still apply: disclose, never argue, one venue
per day, lead with the reader's pain or a number, never post the same copy twice.

## 1. The facts every post draws on

| Fact | Value (2026-09-26) | Where to re-check |
| --- | --- | --- |
| Datasets | 16 official registers, one JSON schema, plus the "no-website leads" preset | https://gankdat.com/v1/data (public listing) |
| Registers | Find a Tender tenders; Contracts Finder awards; TED (EU); planning.data.gov.uk; UK Sanctions List; SAM.gov exclusions; Gazette insolvency; Companies House incorporations; FSA food hygiene; Home Office visa sponsors; Charity Commission; CQC care locations; DfE schools + Ofsted; NHS ODS; IPO Trade Marks Journal; Gambling Commission licences | landing cards |
| Change feeds | `/v1/changes/<dataset>?since=YYYY-MM-DD` — added / removed / changed rows between daily refreshes, 90-day history, nine registers; MCP tool `get_changes`. No other source publishes official-register deltas. | https://gankdat.com/stats/uk-charities (activity per day) |
| Agents | Native MCP server at `/mcp` (Streamable HTTP, 21 tools: one per dataset plus list_sources, get_usage, get_changes, request_api_key, claim_api_key); x402 pay-per-request in USDC on Base (US$0.005/call, no account); an agent can sign its user up itself (`request_api_key` → one approval email → `claim_api_key`) | https://gankdat.com/llms.txt |
| Pricing | Free 250 requests/month, no card; £5 / 1k, £23 / 5k, £79 / 20k, £239 / 100k per month; 60 req/min | https://gankdat.com/#pricing |
| Privacy | Blind Mode: personal fields dropped at ingest (applicants, officers, trustees, phone numbers); organisation-level data only | https://gankdat.com/terms |
| Licence | Every source is Open Government Licence or an official public file; no scraping | terms page, per-dataset rows |
| Stack | One Cloudflare Worker (Hono + TypeScript), KV snapshots + D1 registers, daily cron waves; OpenAPI 3.1 at `/openapi.json` | `docs/ARCHITECTURE.md` |
| Also on | Apify Store (`faceless-api/uk-food-hygiene-ratings` live, US$0.001/row; 16 more actors priced, waiting on Apify's new-publisher limit) | `docs/MARKETPLACE-PREP.md` |

Do not claim: "all councils" (planning is the official planning.data.gov.uk feed, not 400
portals), "real-time" (daily refresh), "every EU tender" (TED notices, not every member-state
portal), or any customer count (there are none yet — say so if asked; it is a strength on
Show HN and Indie Hackers, not a weakness).

## 2. Show HN (post first — the other venues quote it)

Rules that matter: title starts with "Show HN:", ≤ 80 characters, no marketing adjectives; the
text is plain (no markdown), first person, concrete; you must answer comments for the first
four hours. Tuesday or Wednesday, 13:00–15:00 UK (morning on the US East Coast). New or
dormant accounts get buried — comment helpfully for a few days first.

**Title (72 chars):**

```
Show HN: 16 UK/EU government registers as one JSON API, with daily diffs
```

**Text:**

```
I'm a solo builder in the UK. Over the summer I turned the official open-data
files behind sixteen government registers into one API with one schema:
Find a Tender and Contracts Finder (tenders and who won them), TED for the EU,
planning applications, the UK Sanctions List and SAM.gov exclusions, Gazette
insolvency notices, new Companies House incorporations, food hygiene ratings,
licensed visa sponsors, the charity register, CQC care locations, schools with
Ofsted outcomes, NHS organisations, the weekly Trade Marks Journal and
Gambling Commission licences.

The part I have not seen elsewhere: every register diffs itself each morning.
GET /v1/changes/uk-charities?since=2026-09-19 returns what was added, removed
or changed since that date, with 90 days of history. The registers themselves
only publish the current state, so "which care homes lost their registration
this week" or "which trade marks in class 25 were published for opposition"
is normally a download-and-compare job. Here it is one request.

Technical notes:
- One Cloudflare Worker (Hono, TypeScript). The big registers (food hygiene is
  ~600k rows) live in D1; the rolling feeds in KV. Refreshes run as staggered
  cron waves so each stays under the 15-minute limit.
- Personal data is dropped at ingest (applicants, officers, trustees, phone
  numbers). The API only ever holds organisation-level rows.
- It is built for agents as much as people: an MCP server at /mcp with a tool
  per dataset, an x402 endpoint so an agent with a wallet can pay US$0.005 per
  request with no account, and an agent-driven sign-up (the agent asks for a
  key, the human clicks one approval email).
- Everything is OpenAPI 3.1 at /openapi.json, generated from the schemas that
  validate requests.

Free tier is 250 requests a month with no card, paid plans from £5/month.
Nobody is paying yet; I'd rather hear which register, filter or diff would
make this useful to you than guess. Docs: https://gankdat.com/docs
```

**Comment prep** (answers ready to paste, adjusted to the question):

- *Why not just download the files?* "You can, and for one register once that's the right
  call. The value is the same schema across sixteen of them, the daily diff, and not owning
  sixteen parsers that break when a department moves a file (NHS ODS moved its extracts
  this month; the old path now 403s)."
- *Licence?* "Every source is Open Government Licence v3 or an official public file; the
  terms page lists the source, licence and personal-data posture per dataset. No scraping,
  no council portals."
- *GDPR?* "Blind Mode: personal fields never reach storage. Companies House officer and PSC
  data is never ingested; planning applicant names are dropped; the sanctions list keeps the
  designation but drops DOBs, IDs and addresses."
- *Why Cloudflare / why not Postgres?* "Cost. The whole thing runs on Workers Paid at about
  US$5 a month; D1 handles the 600k-row register fine with byte-bounded batches."
- *x402?* "HTTP 402 with a payment-required body; the client pays USDC on Base and retries.
  There have been two test settlements and no real ones, which is exactly why it's here."

## 3. Product Hunt

Needs a maker account under your name; launch on a Tuesday, Wednesday or Thursday at
00:01 Pacific (08:01 UK) so the listing has the full day; reply to every comment; do not
ask friends to upvote (PH detects rings). Topics: Developer Tools, APIs, Data, Artificial
Intelligence, Open Data.

- **Name:** gankdat
- **Tagline (56 chars):** `UK & EU government registers as one JSON API, with diffs`
- **Description (≤ 260 chars, 247):**
  `Sixteen official UK/EU registers (tenders, awards, sanctions, insolvency, companies, charities, care, schools, NHS, trade marks, gambling licences) as one JSON schema, refreshed daily, with a change feed per register. REST, MCP and x402. Free tier, no card.`
- **Links:** https://gankdat.com · https://gankdat.com/docs
- **Pricing tag:** Free options
- **First comment (as maker):**

```
Hi Product Hunt — I built gankdat because every UK data project I did started
the same way: find the official file, write a parser, discover a week later
that the department changed the columns. So I did that once, for sixteen
registers, and put them behind one schema.

What's different from the registers themselves: each one diffs itself every
morning. Ask /v1/changes/uk-sponsors?since=<date> and you get the sponsors
added or removed since then — the register only ever shows the current list.

It's built for AI agents as much as for people: an MCP server with a tool per
dataset, and an x402 endpoint where an agent pays per request in USDC with no
account at all. If you're building agents that need UK public-sector data, I'd
love to know which register you'd hit first.

Free tier is 250 requests/month, no card. Nothing is behind a demo call — the
docs and every stats page are public. Ask me anything about the data.
```

## 4. r/datasets

Read the sidebar the day you post: `[Dataset]` posts must be about a dataset people can
get, self-promotion is tolerated when the data is genuinely accessible, API-only offers get
downvoted. Lead with the free data, name the licence, and say you built it. Wednesday
morning UK (US East is waking up). Flair: `dataset`.

**Title:**

```
[Dataset] 16 UK/EU government registers (tenders, sanctions, charities, care homes, schools, trade marks…) normalised to one JSON schema, with daily diffs — free tier, OGL sources
```

**Body:**

```
I maintain an API that ingests sixteen official UK/EU open-data registers every
morning and serves them as one JSON schema (built it, so: self-promo, but the data
below is free to pull).

Registers: Find a Tender (UK tenders), Contracts Finder (awards + winning
supplier + company number), TED (EU notices), planning.data.gov.uk, UK
Sanctions List, SAM.gov exclusions, Gazette insolvency notices, Companies House
incorporations, FSA food hygiene ratings (~600k businesses), Home Office visa
sponsors, Charity Commission register, CQC care locations, DfE schools joined to
Ofsted, NHS ODS organisations, the weekly Trade Marks Journal, Gambling
Commission licences/domains/premises.

Licence: every source is Open Government Licence v3 or an official public file;
the per-dataset licence and what was dropped at ingest (all personal fields) are
listed at https://gankdat.com/terms.

Why it might be useful here rather than the raw files:
- same field names and pagination across all sixteen (a filter like
  `outward_code=SW1A` or `local_authority=Leeds` works everywhere it makes sense);
- a change feed per register: GET /v1/changes/uk-care-locations?since=2026-09-01
  returns rows added/removed/changed since that date (90-day history). The
  registers don't publish deltas, so this is the bit you can't get elsewhere;
- a free key is 250 requests/month (each request returns up to 100 rows), no
  card; there's an MCP server if you query from an LLM.

Docs and OpenAPI: https://gankdat.com/docs — and if there's a UK register you
wish were in there, tell me; the parser is one file per source.
```

## 5. Indie Hackers

IH rewards honest numbers and a specific question. Post in the main feed as a build story,
not a launch. Any weekday, morning UK. Title ≤ 100 characters.

**Title:**

```
16 government registers, 0 paying customers: what I learned selling boring data to AI agents
```

**Body:**

```
Two months ago I set out to sell one "boring" dataset (UK planning applications) as
an API. A competitor scan killed that plan — PlanAPI, Searchland and friends already
serve planning well — so I repositioned twice and ended up somewhere odder:

1. Sixteen official UK/EU registers (tenders, contract awards, sanctions,
   insolvency, incorporations, charities, care homes, schools, NHS organisations,
   visa sponsors, food hygiene, trade marks, gambling licences) behind one schema.
2. A change feed per register: what was added, removed or changed since a date.
   The registers only publish the current state, so the diff is the product.
3. Built for agents first: MCP server with a tool per dataset, x402 so an agent
   pays US$0.005 a request in USDC without an account, and an agent-side sign-up
   (the agent requests a key, the human clicks one approval email).

Numbers, honestly: ~1,800 anonymous MCP calls a day (agents listing the tools
and hitting the paywall), ~190 authenticated calls a day, 0 paying accounts,
2 test x402 payments. Costs about US$5 a month to run. The whole thing is
operated by scheduled Claude routines — I only handle accounts and money.

The question I'm here for: if you sell to bid teams, compliance/KYB, recruiters
or web agencies, what would make you pay £23/month for register diffs rather
than pulling the files yourself? Free tier at https://gankdat.com if you want
to poke it first.
```

## 6. Images and assets (one set, reused everywhere)

Take these as PNG at 1270×760 (PH gallery) and crop for HN/Reddit if needed. All pages are
public; no login needed for any of them.

1. **Hero:** https://gankdat.com — the dataset grid, scrolled so the sixteen cards fill the
   frame. PH thumbnail: `https://gankdat.com/icon-raccoon.svg` on a plain background (240×240).
2. **The diff:** a terminal running
   `curl -s "https://gankdat.com/v1/changes/uk-charities?since=2026-09-19" -H "Authorization: Bearer $KEY" | jq '.meta, .data[0]'`
   showing `added/removed/changed` counts and one changed row.
3. **Stats page:** https://gankdat.com/stats/uk-sponsors — the 30-day added/removed chart.
4. **Agent view:** Claude Desktop (or any MCP client) with gankdat's tool list open and one
   `query_uk_contract_awards` call returning rows (keys hidden).
5. **x402:** the raw `HTTP/1.1 402 Payment Required` body from
   `curl -si https://gankdat.com/x402/data/uk-sanctions?limit=1` — the price and network are
   in the JSON; a screenshot of an honest 402 is a talking point on HN.
6. **Pricing:** https://gankdat.com/#pricing, cropped to the five plans.

## 7. Numbers to refresh on the day (5 minutes)

| Number | Where | Used in |
| --- | --- | --- |
| Dataset count | `curl -s https://gankdat.com/v1/data \| jq '.data \| length'` | every title |
| Rows per register | each `/stats/<dataset>` page header | HN comments, r/datasets |
| MCP calls / day, paying accounts | latest `Daily numbers` row in `RESEARCH.md` | Indie Hackers post |
| Latest change-feed day | `/stats/uk-charities` activity table | screenshot 2 and 3 |
| Version and tool count | https://gankdat.com/llms.txt | HN comments ("21 tools") |
| Apify status | `docs/MARKETPLACE-PREP.md` listings log | only if asked |

## 8. Timing (four venues, two weeks)

| Day | Venue | Why then |
| --- | --- | --- |
| Week 1 Tue 13:00 UK | Show HN | HN's best window; you have the afternoon and evening for comments |
| Week 1 Wed | keep answering HN; screenshot the best questions for IH | day-2 comments are the buyers |
| Week 1 Thu 08:01 UK | Product Hunt (scheduled the night before) | full PH day; quote the HN thread in the maker comment if it went well |
| Week 2 Wed 10:00 UK | r/datasets | mid-week, US East awake; avoids posting while PH is live |
| Week 2 Fri | Indie Hackers | the story now includes what HN and PH said; update the numbers |
| Week 3 | reply to everything once more, then stop | two touches max, ever |

After each post: paste every "I'd use this if …" comment into the pre-commit table at the
bottom of `STAGE0-PLAYBOOK.md`; the Sunday strategy review reads it. The proof number for this
kit is new keys and authenticated MCP calls in the `Daily numbers` row the morning after each
post (the traffic dataset does not record referrers; Search Console shows the referring pages
a few days later).

## 9. What I will do after you post (no action from you)

- The daily metrics row picks up new keys and the jump in calls the next morning.
- The inbox triage routine logs and drafts replies for any email the posts generate.
- If a comment asks for a register we don't have, tell me in a Telegram note; it becomes a
  scored queue item.
