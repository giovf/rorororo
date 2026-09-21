# Foundry — portfolio strategy and business plan

> Owner-approved direction (2026-09-20): build a **catalogue of self-running digital
> products**, B2B data first, and use that revenue to fund higher-upside ventures later
> (e.g. trading). Owner does admin only. This file is the plan; `docs/OPERATIONS.md` is the
> loop; each venture's `RESEARCH.md` is its evidence. Reviewed monthly by the strategy
> routine (see §6) and rewritten by Claude when the facts change.

## 1. Thesis

Cheap-to-run products sold through channels that bring their own buyers. Every product has
near-zero marginal cost, so **any sale is net profit**; the only real risk is silence. The
portfolio therefore optimises for *many independent shots where buyers already pay for the
same thing*, not for one big bet. Capital cap £100; recurring cost today ≈ £4/month.

## 2. Where the money is (ranked by evidence, 2026-09-20)

| Line | Buyer & job | Evidence of paying demand | Price point | Human effort per sale |
| --- | --- | --- | --- | --- |
| **gankdat data API** (13 datasets) | bid teams, compliance/KYB, prospecting, proptech; AI agents | paid rivals (PlanAPI, Searchland, ComplyAdvantage tiers); Apify scrapers of the same registers sell at ~US$1/1k rows | £5–£239/mo, x402 US$0.005/call | none (self-serve) |
| **Apify actors** (13, one per dataset) | same buyers, already on Apify | existing paid actors on identical data | US$0.001/row, 80/20 | none |
| **Change feeds** (`/v1/changes`) | grant-makers, KYB, recruiters | no competitor offers an official-source delta feed | inside plans; upsell later | none |
| Browser extensions (ReadFocus, Highlight Keep) | consumers | rivals abandoned; low ticket | US$12 one-off | none, but small |
| Figma plugin (Variables Toolkit) | designers | paid rivals with gaps | one-off | none |

## 3. Unit economics (what has to be true)

- gankdat break-even on cash: 1 × £5/mo customer covers Workers Paid. Meaningful: **£300 MRR**
  (runbook pivot line) ≈ 13 × £23 or 4 × £79. Gross margin ≈ 95% (Stripe fees only).
- Apify: at US$0.001/row, a typical lead pull (2,000 rows) earns US$1.60 net. Needs volume;
  the value is discovery inside a marketplace that already has the buyers.
- Extensions/plugin: each sale ≈ £9 net; 10 sales/month = pocket money, but £0 to keep alive.
- Owner time: target < 30 min/week of admin. Anything needing more is redesigned or dropped.

## 4. 90-day targets (to 2026-12-20)

| Metric | Now | Target | Where measured |
| --- | --- | --- | --- |
| gankdat paying accounts | 0 | 5 | `Daily numbers` rows in `ventures/gankdat/RESEARCH.md` |
| gankdat MRR | £0 | £150 | Stripe (weekly report) |
| Apify actors live | 1 of 13 | 13 | Apify console / `apify/README.md` |
| Apify paid runs / month | 0 | 100 | Apify stats |
| Change-feed calls / week | 0 | 50 | Analytics Engine (`get_changes`, `/v1/changes`) |
| Extension + plugin sales | 0 | 20 | Stripe / Figma |
| Directory listings live | 4 | 8 | `MARKETPLACE-PREP.md` |

If gankdat is < £50 MRR **and** Apify < 20 paid runs/month by 2026-12-20 with all listings
live, the data line is re-positioned (see kill criteria) rather than extended.

## 5. Prioritisation rule (used before starting anything)

Score = (evidence of paying demand × reach of the channel) ÷ (build days + owner minutes).
Build only what scores above the best distribution task still undone. **Distribution beats
new datasets** until the funnel shows conversion: as of today the queue is (1) publish the
remaining Apify actors, (2) Datarade approval, (3) directory PRs merged, (4) Search Console
indexing of the stats pages, (5) then the next dataset. Research done 2026-09-20 (`ventures/gankdat/docs/NICHE-RESEARCH-2026-09-B.md`):
**Contracts Finder awarded contracts + supplier index** first (open OCDS API, OGL, strongest paid
demand: Stotles £50–475/mo, Tussell, 8+ Apify actors), then GIAS + Ofsted outcomes, then NHS ODS.
Contracts Finder shipped 2026-09-21 (`uk-contract-awards`) and GIAS + Ofsted shipped 2026-09-21
(`uk-schools`); **NHS ODS is the next dataset**, behind the distribution queue above.
Rejected: Land Registry CCOD/OCOD (licence forbids standalone products), HMRC VAT check, SIA.
Queued 2026-09-21 (owner idea, reshaped): **"businesses without a website" lead feed** — derived
view over uk-care-locations, uk-charities (website null) and, where a web field exists, other
registers; by sector and area; API preset + Apify actor for web agencies. B2B, organisation-level,
no outreach by us (cold email/AI calls to UK small businesses breach PECR; a website-building
service is human-in-the-loop). Build ≤ 1 day.

## 6. Workflow (research → plan → build → distribute → measure → review)

1. **Research before build**: `RESEARCH.md`-style evidence — buyers, recurring job, paid rival
   with a documented gap, licence, effort. No evidence, no build.
2. **Plan**: a line in this file (§2/§4) with the price, channel and the number that would
   prove it. Taskmaster task filed.
3. **Build** with the gates (`npm run check`), Blind Mode for personal data, ledger for money.
4. **Distribute** through channels with their own buyers; owner clicks batched into one action.
5. **Measure**: daily metrics job + routines; funnel = visits → keys → paywall hits → payments.
6. **Review**: weekly report (Mondays) for facts; **monthly strategy review** (first Monday,
   `docs/reviews/YYYY-MM.md`, cloud routine) that scores every venture keep / double-down /
   kill, checks the 90-day targets, lists market signals seen (support mail, feedback form,
   directory replies) and proposes the next three moves. Claude rewrites this file after it.

## 7. Kill and pivot criteria

- Any venture: zero sales **and** zero organic signal (signups, runs, enquiries) 90 days after
  every planned listing is live → kill (keep the code, stop the effort).
- gankdat dataset: not queried by any customer in 60 days → retire from the surface.
- Whole data line: < £300 MRR after 4 months of the listings being live → reposition toward
  one buyer type (bid intelligence or KYB) and sell the change feeds as the product.
- Recurring cost creep: anything that pushes recurring spend above £10/month needs revenue
  ≥ 3× that cost already banked.

## 8. Decision log

- 2026-09-19 adopt gankdat; 2026-09-20 data-first, no more consumer apps, no ad revenue.
- 2026-09-20 Apify Store chosen as the next shelf (existing paid demand) over more datasets.
- 2026-09-20 ICO fee deferred by owner until the first real customer (risk noted in action 012).
- 2026-09-20 owner asks for business planning and market research to be explicit in the loop
  → this file + the monthly strategy routine.
- 2026-09-20 next-dataset queue set from research B: Contracts Finder awards → GIAS/Ofsted → NHS ODS.
- 2026-09-21 owner proposed an outreach venture (find businesses lacking a website, contact them
  by email/AI phone, sell sites). Declined as a service: automated calls need prior consent under
  PECR, cold email to sole traders needs consent, delivery is per-customer human work. Kept the
  data angle as a lead feed for agencies (queued above).
- 2026-09-21 owner floated a digital-services marketplace on top of the APIs. Declined for now:
  two-sided cold start with no marketing budget, human ops (vetting, disputes, Connect payouts),
  and it would not use our data edge. Staged path instead: no-website lead feed → a paid-lead
  request form on the stats pages if the feed sells → revisit a marketplace only at ≈1,000
  monthly API/stats users. The monthly review re-asks this when that number is reached.
- 2026-09-21 Datarade rejected the listing (registered businesses only). AWS Data Exchange also
  needs VAT registration. Decision: no limited company yet — formation is ~£50 plus annual
  filing burden on the owner; revisit when the data line passes £300 MRR (then a company also
  fixes the ICO/address privacy questions). Marketplace route for now: Apify + own site + agents.
- 2026-09-21 daily build: shipped `uk-schools` (DfE GIAS + Ofsted outcomes), the #2 dataset in the
  research-B queue. Distribution items 1–4 all need an account, a secret or a third party
  (Apify's new-publisher limit, Datarade rejected, directory PRs with their maintainers, Search
  Console submission), so none was buildable from the routine — the next dataset was the
  highest-scoring item this run could actually finish. Live ingest is unverified: the container
  has no egress to the GIAS/GOV.UK hosts (handoff in ALERTS.md).
