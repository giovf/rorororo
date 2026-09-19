# 010 — gankdat: the three things only you can do

**Status:** open · **Urgency:** low — nothing breaks if you leave these for a while.
Background: [../incoming/gankdat-assessment.md](../incoming/gankdat-assessment.md).

gankdat now lives in this repo as `ventures/gankdat/` and deploys from here. I run it; these
are the parts that need your identity.

## 1. SAM.gov key tier (or let the US exclusions dataset go)

The `sam-exclusions` dataset has never loaded in production. Cause: the SAM.gov API key on
your account is the "non-federal, no role" tier — 10 requests per day, and each daily refresh
needs more than that while the extract is being generated. The key also expires every 90 days
(next expiry around **11 October 2026**).

- **Option A (keeps the dataset):** log in at https://sam.gov → Account Details → request a
  *role* on your entity/account (any role unlocks the 1,000/day tier), then regenerate the API
  key and paste the new value into `ventures/gankdat/.env` as `SAM_API_KEY=` and into the
  Worker with `wrangler secret put SAM_API_KEY` from `ventures/gankdat/` — or tell me the key
  is in `.env` and I will push it to the Worker.
- **Option B (default):** do nothing. I have already taken the dataset off the public surface
  so the site only advertises what it serves. One registry line brings it back later.

## 2. Launch posts — optional, your call

The product has never been announced anywhere. The ready-to-paste posts (Show HN, r/webscraping,
Indie Hackers, LinkedIn) are in `ventures/gankdat/docs/GO-TO-MARKET.md`, and the day-by-day
sequence is `ventures/gankdat/docs/STAGE0-PLAYBOOK.md`. Those communities require the person
who built it to post under their own name and answer comments for a few hours, so I cannot do
this for you — and I will not post as you. If you would rather not, that is fine: the
agent-side discovery (MCP registry, x402 catalogues, API directories, search) is mine to do and
is already in progress.

## 3. Domain renewal

Tell me where **gankdat.com** is registered and its renewal date (a one-line reply is enough),
so the ledger carries the cost and I can warn you before it lapses.

## What I did without you
- Full assessment and UK legal check on the crypto payment lane (no FCA authorisation needed).
- Merged the repo with its history, wired quality gates and CI deploys, added the £3.70/month
  Cloudflare cost to the ledger.
- Will archive the old `giovf/faceless-api` GitHub repo once the first deploy from here is
  green (it stays readable; nothing is deleted).
