# Spike: a Zapier integration as the no-code shelf for gankdat's change feeds

Queue item `new-ventures/spike-zapier-integration-shelf` (burn-down, 2026-11-02 00:36–00:45 UTC; seeded by the same run's
new-ventures research). Sources: one fetch-relay round (`docs/relay/responses/new-ventures-research-2026-11-02`, lines
17–27 — every docs.zapier.com and zapier.com page answered 200 and was read in full) and two WebSearch reads restricted to
zapier.com. No index-only claims below.

The question: does Zapier give the change feeds (new incorporations, insolvency notices, tenders, licence changes) and the
lookups (company, charity, sanctions) a delivery path into tools small firms already pay for, without Partner Center, a
new identity step or a fee — and what gates the directory listing?

## 1. The platform's terms (primary, read in full)

- **Cost**: "Building a private or public integration on the Zapier Developer Platform is free. Users of your integration
  are responsible for their own Zapier plans and billing." "Partners do not incur fees as a result of the usage of their
  integration." Zapier bills nobody on our behalf: a user pays Zapier for Zapier and gankdat for the key.
- **Private integration** (the state every integration starts in): "You control who has access"; it "won't appear within
  Zapier's app directory"; shareable by a **public invite link with no user limit** ("You can't view a list of users that
  have accessed the public link. You can't revoke a link invite, once shared") or by **email to up to 100 users** (the
  sharing page says 200 — the docs disagree); **rate limits are the owner's plan's** — "Free and Professional plans: 100
  calls every 60 seconds" pooled across every user, Zap runs held above it; up to 100 admins and collaborators.
- **Public integration**: "access to all Zapier customers", "exposure from Zapier's 3 million+ users", Zap templates,
  Zapier MCP for its users; "You can't restrict who uses your public integration." The gate (checks reference): **S001 "at
  least 3 users who have a live Zap using this integration"** ("switched on with at least one successful Zap run in recent
  history"), **S002 one live Zap per visible trigger/search/action** (a second Zapier account of our own is allowed for
  this), **M003** the submitter "employed or hired by the company who makes the app", **M005** one admin's email on the
  app's homepage domain (gankdat.com mail exists), M006 a homepage URL, M004 a 256-px square PNG logo, **M007** one public
  integration per app; HTTPS, English, production endpoints, a non-expiring test account. After review the app is listed
  **with a Beta tag; "After 90 days in public beta, your integration will become public"** (earlier on one sign-up from an
  embed on our site). The publishing requirements also bar apps "we deem to be competing with Zapier" and duplicates of a
  listed app, and put scraping compliance on the developer.
- **Partner Program** (Bronze → Platinum): directory page, leads from the directory, co-marketing — benefits, no fees.

## 2. The shelf (primary — the directory pages themselves)

| Directory page (zapier.com/apps/…/integrations) | Result |
| --- | --- |
| companies-house | **404** — no Companies House integration |
| opencorporates | **404** |
| charity-commission | **404** |
| clearbit | 200 — a listed data-enrichment app (company and person lookups as searches) |
| hunter | 200 — a listed email-finder app (domain search, email verifier as searches) |

No UK register, company-data or sanctions app is in the directory; the nearest listed data apps are US enrichment tools
whose users pay the app's own plans (Clearbit and Hunter publish no price on the Zapier page). The 9,000+-app directory
has the slot open; whether it is unmet demand or none, the directory cannot say — Zapier shows no usage counts.

## 3. What the build would be

API-key auth against the existing REST keys; **polling triggers** on the change-feed cursors (`/changes` per register:
new company, new insolvency notice, new tender, licence change) and **searches** for company, charity, sanctions and
tender lookups; Platform CLI (Node), one integration, ~8 triggers/searches each needing a live Zap for S002: **≈ 1.5
days** plus a logo and a help article. Serving cost: polling Zaps call every 1–15 min per user, pooled under the
owner's Free-plan limit of 100 calls a minute while private — ~30 polling Zaps saturate it — so the private phase
caps itself; the public phase lifts the cap to Zapier's. Net per user: whatever the key's plan earns (US$0 today — no
gankdat shelf has a paying account).

## 4. Call

**Park.** The shelf is free, needs no Partner Center and no identity step, and the slot is empty — but a Zapier
integration sells nothing by itself: it delivers a key's data to a user who already pays gankdat, and no gankdat shelf
has a paying account 10 weeks in (x402: 5 buyer calls in 30 days). Built now it would be a private integration with a
public link on a docs page and a 100-calls-a-minute pool, waiting for three strangers to run live Zaps before the Beta
listing, 90 more days before the directory shows it without the tag. ≈ 2 × 2 ÷ 1.5 ≈ 2.7 as a venture line, below every
open gankdat item. Reopen when (a) a gankdat shelf converts (a first paying account or ≥ 20 paid Apify runs a month) — the
first paying customer's own tools decide whether Zapier or Make comes first — or (b) an inbound request names Zapier or
Make; then build the private integration (≈ 1.5 days), share the public link from the docs, and submit for Beta at the
third live user. Make.com's app review is the twin and is read then.
