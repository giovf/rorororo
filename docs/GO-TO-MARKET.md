# Go-to-market: Stage 0 validation posts

Ready-to-use drafts for the blueprint's **Stage 0**: get **20+ signups or 5
"I'd pay for this"** before pouring in more build effort. If you can't, the
blueprint says change the dataset — cheap here, since the platform is
niche-agnostic (swap `src/sources/`).

## Before you post

- **Landing page + waitlist must be live first.** Every post drives to a real
  URL where people can grab a free key or join the waitlist. Replace
  `https://<your-domain>` throughout once the domain is set.
- **Do the competitor scan first** (also Stage 0): search RapidAPI / Apify /
  Google for "UK planning API", "Find a Tender API". If you find 3+
  well-reviewed, actively-maintained, self-serve planning APIs already at
  scale, the niche analysis says pivot to procurement-only or sanctions before
  marketing.
- **Be honest about scope.** v1 serves the **official government feeds**
  (planning.data.gov.uk + Find a Tender OCDS), normalized to one schema — *not*
  the 400+ council portals yet. Don't claim "all councils." The gap is a
  validation hook: ask which councils/fields people actually need.
- **Don't spam.** These communities are allergic to it. Post genuine build
  logs, answer questions, and only mention the product where it's relevant.
  One post per community, then engage in the comments.

---

## Show HN / Hacker News

> **Title:** Show HN: A clean JSON API for UK planning and procurement data

Hi HN. UK planning applications and public-sector tenders are technically open
data, but in practice they're scattered across the official
planning.data.gov.uk feed, the Find a Tender OCDS API, and 400+ council portals
— each with a slightly different schema. Getting a usable dataset out means
writing and maintaining a lot of glue.

I built a small API that normalizes the two official government feeds into one
consistent JSON schema, refreshed daily, with filtering and pagination:

    curl -H "Authorization: Bearer $KEY" \
      "https://<your-domain>/v1/data/uk-planning?q=solar&decision_date_after=2026-01-01"

Notes for this crowd:
- It's a single Cloudflare Worker (Hono + TypeScript). Every response is the
  same `{ok, data, meta}` envelope; the whole surface is at `/openapi.json`.
- **Blind Mode**: applicant personal data is dropped at ingest, never stored
  (UK GDPR). Sources are Open Government Licence — no scraping.
- There's an MCP server at `/mcp` and an x402 pay-per-request endpoint, so AI
  agents can call it directly.
- Free tier is 250 requests/month, no card.

It's early — v1 covers the official feeds; council-portal long-tail coverage is
next, driven by what people ask for. I'd love feedback on the schema and on
which fields/authorities would make this actually useful to you.

Docs: https://<your-domain>/docs

---

## r/webscraping

> **Title:** Normalized UK planning + procurement data as one JSON API (no scraping — official feeds)

Sharing a build log. UK planning and tender data is a classic
normalization-is-the-hard-part problem: the data's public, but it's spread over
planning.data.gov.uk, Find a Tender's OCDS releases, and hundreds of council
portals with subtly different schemas. Cleaning it up took far longer than the
API itself.

v1 sticks to the **official Open Government Licence feeds** (no scraping, no
anti-bot arms race) and normalizes them into one schema:

- `/v1/data/uk-planning` — filter by authority, reference, decision date, free-text
- `/v1/data/uk-tenders` — filter by buyer, CPV code, value, status, date

Design choices that might interest you:
- **Blind Mode** — personal fields are dropped at ingest for GDPR safety.
- Cache + daily cron refresh; responses expose `last_refreshed_at`.
- Serves stale-but-good data if an origin has a wobble, rather than erroring.

Free tier (250 req/mo, no card): https://<your-domain>. Council-portal coverage
is the obvious next step — curious which councils people here would want first.

---

## Indie Hackers

> **Title:** Building a "boring" niche data API — UK planning + procurement. Validating before I go deeper.

Following the faceless-data-API playbook: pick one narrow, valuable, frequently-
changing dataset that's a pain to get, and sell clean JSON by the request.

Mine is UK public-sector data — planning applications and procurement notices —
normalized from the official government feeds into one schema, with a free tier,
Stripe usage billing, and (because it's 2026) an MCP server + x402 endpoint so
AI agents can call it too.

I'm at the validation stage, not the victory-lap stage. Before I build out the
harder council-portal coverage, I want to know there's real willingness to pay.
So: if you work in proptech, planning, construction lead-gen, or bid
intelligence — **would a clean API for this save you enough to pay for it?**
What would you filter on? Grab a free key or the waitlist:
https://<your-domain>.

Happy to share the stack (Cloudflare Workers + Hono + TypeScript, ~1 file per
dataset behind a swappable source interface) if useful.

---

## LinkedIn (for the actual buyers: planning consultants, proptech, lead-gen)

> If your team pulls UK planning applications or public-sector tenders by hand —
> or maintains scrapers for them — this might save you the trouble.
>
> I've built an API that turns the official government feeds
> (planning.data.gov.uk and Find a Tender) into one clean, queryable JSON
> schema, refreshed daily. Filter planning applications by authority, status,
> decision date, or keyword; filter tenders by buyer, value, CPV code, or
> deadline. No personal data is stored.
>
> There's a free tier to try it. I'm actively shaping the roadmap around what
> teams actually need — if you'd find this useful, I'd genuinely like to hear
> which data and filters matter most to you. Link in comments.

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

> **Subject:** UK planning data for {{company}} — as an API?
>
> Hi {{first_name}},
>
> I saw {{company}} works on {{their relevant area — e.g. solar lead-gen /
> planning consultancy}}. Teams doing that usually spend real time pulling UK
> planning applications from planning.data.gov.uk or council sites by hand.
>
> I've built an API that serves that data (plus public-sector tenders) as one
> clean, filterable JSON feed, refreshed daily — e.g. "solar applications
> approved in {{authority}} this month" is one request. There's a free tier if
> it's useful to try.
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

To reinforce it, write 1–2 genuinely useful, data-backed pages (e.g. "How to get
UK planning application data as JSON", "Find a Tender OCDS explained") that a
model would cite when asked. Get listed in "there's an API for that"-style
directories and, once agents matter, MCP directories (PulseMCP/Glama/Smithery)
— see `docs/MARKETPLACE-PREP.md`.

---

## After Stage 0

- **≥20 signups / 5 pre-commits** → proceed: wire real billing, add council-portal
  coverage where demand points, list on RapidAPI/Apify.
- **<20 after genuine effort** → change the dataset (procurement-only, or the
  sanctions/compliance niche from the analysis). Swap `src/sources/`, keep
  everything else.
