# 010 — gankdat: what only you can do

**Status:** open · **Urgency:** low — nothing breaks if you leave these for a while.
Background: [../incoming/gankdat-assessment.md](../incoming/gankdat-assessment.md).

gankdat now lives in this repo as `ventures/gankdat/` and deploys from here. I run it; these
are the parts that need your identity.

## 1. SAM.gov — resolved, nothing to do

You do not need a SAM.gov role, and the "Request Role" form is for employees of an organisation
already registered in SAM (it asks for an entity, which you don't have). Cancel it. On 20 Sep I
found that SAM.gov publishes the full exclusions list as a daily public file with no account
and no key, and rebuilt the dataset on that. The old API key can simply expire.

## 2. Launch posts — optional, your call

The product has never been announced anywhere. The ready-to-paste posts (Show HN, r/webscraping,
Indie Hackers, LinkedIn) are in `ventures/gankdat/docs/GO-TO-MARKET.md`, and the day-by-day
sequence is `ventures/gankdat/docs/STAGE0-PLAYBOOK.md`. Those communities require the person
who built it to post under their own name and answer comments for a few hours, so I cannot do
this for you — and I will not post as you. If you would rather not, that is fine: the
agent-side discovery (MCP registry, x402 catalogues, API directories, search) is mine to do and
is already in progress.

## 3. Domain renewal — resolved, nothing to do

gankdat.com is on Cloudflare Registrar: it is an annual registration, not a one-off. It expires
2027-07-08, auto-renew is on, and Cloudflare charges the wholesale price (about US$10.50, roughly
£8). I've put it in the ledger as a planned cost for July 2027.

## 4. Directory listings — you said yes on 20 Sep; here is where it stands

Done from here, no sign-in needed: official MCP registry updated to v0.6.2; pull requests /
issues opened from your GitHub account at public-apis, the APIs.guru directory and
awesome-remote-mcp-servers (links in `ventures/gankdat/docs/MARKETPLACE-PREP.md`).

The rest need a browser session signed in as you, which I don't have. Each is a few minutes,
none is urgent, and I'll do the follow-through once you've done the click:
- **mcpservers.org/submit** — free form (2-week review). Fields: name gankdat, category
  Data/Search, description and links as in MARKETPLACE-PREP.md, contact info@gankdat.com,
  registry name `com.gankdat/gankdat`, tick "remote".
- **Glama** — https://glama.ai/mcp/connectors/com.gankdat/gankdat → "Claim" with GitHub.
- **Google Search Console** — add property `gankdat.com` (Domain type) with your Google
  account; it shows a TXT record. Paste that TXT value to me (not secret) and I'll add it to
  DNS; then press Verify and submit `https://gankdat.com/sitemap.xml`.
## What I did without you
- Full assessment and UK legal check on the crypto payment lane (no FCA authorisation needed).
- Merged the repo with its history, wired quality gates and CI deploys, added the £3.70/month
  Cloudflare cost to the ledger.
- Will archive the old `giovf/faceless-api` GitHub repo once the first deploy from here is
  green (it stays readable; nothing is deleted).
