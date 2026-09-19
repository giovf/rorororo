# Go-to-market: Stage 0 validation posts

Ready-to-use drafts for the blueprint's **Stage 0**: get **20+ signups or 5
"I'd pay for this"** before pouring in more build effort. If you can't, the
blueprint says change the dataset — cheap here, since the platform is
niche-agnostic (swap `src/sources/`).

**Positioning (post-competitor-scan):** the UK *planning* API space is already
crowded with mature self-serve players (PlanAPI, PlanWire, Searchland), so we
**lead with procurement / bid-intelligence** (Find a Tender — far less
contested, bigger budgets) and the **agent-native angle** (MCP + x402, which
none of the planning incumbents offer). Planning ships as a bundled second
dataset — the cross-vertical edge — not the headline.

## Before you post

- **Landing page + waitlist are live** at
  `https://gankdat.com` (used throughout below).
- **Scope honesty.** v1 serves the **official government feeds** (Find a Tender
  OCDS + planning.data.gov.uk), normalized to one schema. For planning that's
  *not* the 400+ council portals yet — don't claim "all councils." Turn the gap
  into a question: ask which authorities/fields people need.
- **Don't spam.** These communities are allergic to it. Post genuine build
  logs, answer questions, mention the product only where relevant. One post per
  community, then engage in the comments.

---

## Show HN / Hacker News

> **Title:** Show HN: Clean JSON + MCP API for UK public procurement (and planning) data

Hi HN. UK public-sector tenders live on Find a Tender as OCDS release packages —
deeply nested JSON, one release per event, extensions everywhere. Getting a
usable "one row per notice" view (with buyer, value, CPV codes, deadlines) means
writing and maintaining a fair bit of glue. Planning data is worse: scattered
across planning.data.gov.uk and 400+ council portals with subtly different
schemas.

I built an API that normalizes both into one flat, filterable JSON schema,
refreshed daily:

    curl -H "Authorization: Bearer $KEY" \
      "https://gankdat.com/v1/data/uk-tenders?value_amount_min=1000000&status=active"

Notes for this crowd:
- Single Cloudflare Worker (Hono + TypeScript). Same `{ok, data, meta}` envelope
  everywhere; whole surface at `/openapi.json`.
- **Native MCP server** at `/mcp` and an **x402** pay-per-request endpoint — so
  AI agents (bid-scouting, market research) can call it directly. That's the bit
  the existing planning-data vendors don't do.
- Sources are Open Government Licence — no scraping. Planning uses **Blind Mode**
  (applicant personal data dropped at ingest).
- Free tier: 250 requests/month, no card.

It's early — v1 is the official feeds; deeper council coverage is next, driven by
demand. I'd love feedback on the tender schema and which filters/fields would
make this genuinely useful to you.

Docs: https://gankdat.com/docs

---

## r/webscraping

> **Title:** UK procurement + planning data as one normalized JSON API (official OCDS feeds, no scraping)

Build log. UK tender data is a normalization-is-the-hard-part problem: Find a
Tender publishes OCDS release *packages* — nested, multi-stage, extension-heavy
— and turning that into a clean "one notice per row" feed with buyer/value/CPV/
deadline took longer than the API itself. Planning data (planning.data.gov.uk +
council portals) is the same story.

v1 sticks to the **official Open Government Licence feeds** (no scraping, no
anti-bot arms race) and flattens them to one schema:

- `/v1/data/uk-tenders` — filter by buyer, CPV code, value, status, date
- `/v1/data/uk-planning` — filter by authority, reference, decision date, text

Things this crowd might care about:
- Cursor pagination handled server-side; daily cron refresh; `last_refreshed_at`
  in every response.
- Serves stale-but-good data if an origin wobbles, rather than erroring.
- **Blind Mode** drops personal fields at ingest (GDPR).
- MCP + x402 endpoints so agents can call it without an API key.

Free tier (250 req/mo, no card): https://gankdat.com.
Curious which procurement filters or authorities people here would want first.

---

## Indie Hackers

> **Title:** Validating a "boring" niche data API — UK procurement + planning, agent-native. Before I build deeper.

Following the solo-operator data-API playbook: one narrow, valuable, frequently-
changing dataset that's a pain to get, sold as clean JSON by the request.

I started aimed at UK planning, then a competitor scan showed that space is
already well-served (PlanAPI, PlanWire, Searchland). So I've repositioned around
**public procurement / bid intelligence** (Find a Tender) — less contested,
bigger budgets — with planning bundled in, and leaned into an angle none of them
have: it's **MCP-native and x402-payable**, so AI agents can call it directly.

I'm validating, not victory-lapping. Before building deeper coverage I want to
know there's willingness to pay. So — if you work in **bid intelligence,
procurement, construction/solar lead-gen, or proptech** (or you build agents
that need public-sector data): **would a clean API for this be worth paying
for?** What would you filter on? Free key / waitlist:
https://gankdat.com.

Happy to share the stack (Cloudflare Workers + Hono + TS, one file per dataset
behind a swappable source interface).

---

## LinkedIn (for bid-intelligence / procurement / proptech teams)

> If your team tracks UK public-sector tenders — pulling Find a Tender by hand,
> or wrangling its OCDS JSON — this might save you the trouble.
>
> I've built an API that turns Find a Tender (and UK planning applications) into
> one clean, queryable JSON feed, refreshed daily. Filter tenders by buyer,
> value, CPV code, status, or deadline; filter planning by authority, status, or
> keyword. No personal data stored.
>
> There's a free tier to try it, and it's callable directly by AI agents (MCP).
> I'm shaping the roadmap around what teams actually need — if this would help
> your bid pipeline or market research, I'd genuinely like to hear which data and
> filters matter most. Link in comments.

---

## UK-legal B2B cold email (use with care)

**Legal guardrails — read before sending:**
- UK PECR Regulation 22 permits unsolicited B2B email to **corporate addresses**
  (`name@company.com`) without prior consent, *if* content is relevant to their
  role and every message has an easy opt-out.
- **Do not** email sole traders or personal addresses (gmail/outlook/etc.) —
  that needs consent.
- UK GDPR still applies: you need a documented Legitimate Interest Assessment.
  Keep it tightly targeted and role-relevant. No purchased lists. ICO fines are
  steep.
- This is a template, not a mandate to blast. A handful of well-researched,
  personalized sends beats volume.

> **Subject:** UK tender data for {{company}} — as an API?
>
> Hi {{first_name}},
>
> I saw {{company}} works on {{their relevant area — e.g. bid writing /
> construction lead-gen / market intelligence}}. Teams doing that usually spend
> real time pulling UK public-sector tenders from Find a Tender by hand.
>
> I've built an API that serves that data (plus UK planning applications) as one
> clean, filterable JSON feed, refreshed daily — e.g. "active tenders over £1m
> with CPV 45 (construction)" is one request. Free tier if it's useful to try.
>
> If it's not relevant, no problem — just reply "no thanks" and I won't follow
> up. Otherwise happy to send a couple of example queries for your use case.
>
> {{your name}}
> {{one-line opt-out / unsubscribe link}}

---

## LLM-citation (the new SEO — free, compounding)

Per the blueprint, LLM-referred traffic converts much higher than organic. The
repo already ships the raw material:
- `/llms.txt` — machine-readable summary for models to cite.
- `/openapi.json` + `/docs` — answer-first, structured.

Reinforce it with 1–2 genuinely useful, data-backed pages (e.g. "How to get UK
tender data from Find a Tender as clean JSON", "OCDS release packages
explained") that a model would cite. Get listed in "there's an API for that"
directories and — since we're agent-native — MCP directories
(PulseMCP/Glama/Smithery); see `docs/MARKETPLACE-PREP.md`.

---

## After Stage 0

- **≥20 signups / 5 pre-commits** → proceed: wire real billing, deepen the
  procurement/bid-intelligence data, list on RapidAPI/Apify + MCP directories.
- **<20 after genuine effort** → change the dataset again. The next candidate
  from the analysis is **sanctions/compliance screening** (non-discretionary
  spend, strongest agent demand). Swap `src/sources/`, keep everything else.
