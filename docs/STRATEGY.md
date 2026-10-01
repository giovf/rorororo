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
| **Agent directories** (Claude Connectors Directory; MCP Registry, mcpservers.org, Glama already) | the owners of the agents hitting the paywall (~80/day); Claude Team/Enterprise users | same rivals as the data API; the directory measures rank, accounts and tool calls itself | inside plans (OAuth billing from Claude queued) | none — listed automatically after a policy scan on the owner's paid plan (added 2026-09-30) |

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
| Apify actors live | 17 of 17 | 17 | `apify:` in the Daily numbers row (`ventures/gankdat/RESEARCH.md`) — `P public`; all 17 went public 2026-09-28 |
| Apify paid runs / month | 0 | 100 | `apify:` in the Daily numbers row (`ventures/gankdat/RESEARCH.md`) — lifetime `R runs` plus the `+d/24h` delta, Apify API `stats.totalRuns` |
| Change-feed calls / week | 0 | 50 | `changes 7d:` in the Daily numbers row (`ventures/gankdat/RESEARCH.md`) — Analytics Engine, MCP `get_changes` + REST `/v1/changes` |
| Extension + plugin sales | 0 | 20 | Stripe / Figma |
| Directory listings live | 4 | 8 | `MARKETPLACE-PREP.md` |

If gankdat is < £50 MRR **and** Apify < 20 paid runs/month by 2026-12-20 with all listings
live, the data line is re-positioned (see kill criteria) rather than extended.

## 5. Prioritisation rule (used before starting anything)

**The live queue is `docs/pipeline/` (one JSON queue per venture plus the idea exchange);
`npm run pipeline` prints the next item.** The text below is the rationale and history.

Score = (evidence of paying demand × reach of the channel) ÷ (build days + owner minutes).
Build only what scores above the best distribution task still undone. **Distribution beats
new datasets** until the funnel shows conversion: as of today the queue is (1) publish the
remaining Apify actors, (2) Datarade approval, (3) directory PRs merged, (4) Search Console
indexing of the stats pages, (5) then the next dataset. Research done 2026-09-20 (`ventures/gankdat/docs/NICHE-RESEARCH-2026-09-B.md`):
**Contracts Finder awarded contracts + supplier index** first (open OCDS API, OGL, strongest paid
demand: Stotles £50–475/mo, Tussell, 8+ Apify actors), then GIAS + Ofsted outcomes, then NHS ODS.
Contracts Finder shipped 2026-09-21 (`uk-contract-awards`) and GIAS + Ofsted shipped 2026-09-21
(`uk-schools`); NHS ODS shipped 2026-09-22 (`nhs-ods`) — the research-B queue is built out, so the
next dataset comes from the exchange or new research, behind the distribution queue above.
Rejected: Land Registry CCOD/OCOD (licence forbids standalone products), HMRC VAT check, SIA.
Shipped 2026-09-21 (owner idea, reshaped): **"businesses without a website" lead feed** —
`website_present=false` on uk-care-locations, uk-charities and uk-schools (generic
`<field>_present` filter) plus the merged Apify actor `uk-no-website-leads` for web agencies.
B2B, organisation-level, no outreach by us (cold email/AI calls to UK small businesses breach
PECR; a website-building service is human-in-the-loop). Proof: paid runs + filter calls in 30 days.

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
- 2026-09-21 interactive session: shipped the no-website lead feed (generic `_present` filter,
  `website_present` on three registers, Apify actor `uk-no-website-leads`, v0.13.0) and fixed the
  red root check + the TED actor's missing tagged build (publish script now self-heals that).

- 2026-09-22 daily build: **Variables Toolkit launched** — Figma approved the listing 2026-09-21
  20:29 UTC (verified against Figma's own notification email, not just the handoff line). Recorded
  the launch end to end: `venture.json` → `launched`, STORE.md → live with the listing URL, the
  apps.gankdat.com product card now links Figma Community instead of saying "in review soon",
  ARCHITECTURE and the ledger's fee convention updated, owner action 004 closed, and day-1/7/30
  measurement plus the 90-day kill date (2026-12-20) written into the venture's RESEARCH.md §7.
  Chosen over the next dataset (NHS ODS) because §5 puts distribution first until the funnel shows
  conversion, and this is the portfolio's first listing live on a shelf that takes payment — the
  metrics routine reads STORE.md, so leaving it stale meant no purchase data at all. Remaining
  Figma work needs network the build container does not have (figma.com 403): the resource uuid is
  a handoff, and the creator payout is the one owner-only step.
- 2026-09-22 owner: build twice a day (09:30, 21:30), strategy review weekly (Sundays), and a
  hierarchy of work queues — an idea exchange feeding one queue per venture, a weekly exchange
  routine (Wednesdays) that opens a new venture queue or reopens/extends a live one, research
  triggered whenever a venture queue empties unless the venture is finished. Credit use is the
  only cost; interruption handling already covers cut-off runs. Implemented as `docs/pipeline/`
  + `npm run pipeline` (validated in `npm run check`) and rewired routines (SCHEDULERS.md).
- 2026-09-22 owner: build, venture exchange and strategy review routines run on Claude Fable 5.1
  (`claude-fable-5-1`); metrics, triage and the weekly report stay on Sonnet (read-and-summarise).

- 2026-09-22 build (17:00 run): shipped `nhs-ods` — the NHS Organisation Data Service register
  (GP practices, trusts and sites, pharmacies, dental practices, independent providers; #3 and last
  of the research-B queue, score 6, the top buildable item in `docs/pipeline/`; the two higher
  distribution items stay blocked on Apify support and a Search Console click). Six nightly ODS
  ZIPs through one positional parser, own refresh wave 6 (05:55), v0.14.0, Apify actor. Written
  without live-file access again (no egress to files.digital.nhs.uk) — verification is a handoff.
  Next buildable item: the change-feed upsell (score 5).
- 2026-09-23 exchange: **gankdat enhancement — UK Trade Marks Journal dataset + change feed** (score
  8: evidence 4 × reach 3 ÷ 1.5 days, 0 owner minutes; watch services charge £180–320/mark/yr to
  scan the same weekly OGL XML). Gambling Commission register queued second (6), a per-class
  trade-mark watch surface third (4). Parked: Variables Toolkit v0.2 relink (7.2 — wait for the
  day-7 read), a second Figma plugin. Declined: Shopify app, Stripe Apps, extension #3, FCA
  register (licence). Comparison: `docs/exchange/2026-W39.md`.
- 2026-09-23 build (09:00 run): shipped `uk-trademark-journal` — the IPO's weekly Trade Marks
  Journal as a rolling 52-issue dataset with a weekly change feed (exchange 2026-W39 winner, score
  8, the top buildable item in `docs/pipeline/`). Per-issue KV cache + D1 window, own wave 7
  (06:05), v0.15.0, Apify actor. The journal XML schema is undocumented and ipo.gov.uk is
  unreachable from the build container, so the reader is layout-tolerant and fails loudly with the
  element names it saw; verification is a handoff. Also: `nhs-ods` errored on its first live run
  (today's metrics row) — cause unreadable from here, queued as blocked. Next buildable item:
  uk-gambling-operators (6).
- 2026-09-24 build (09:00 run): `uk-gambling-operators` (6) marked blocked — the exchange rule
  required the OGL statement on the data.gov.uk record and every host that carries it is blocked
  from the routine container (handoff in ALERTS.md; file names recovered from the search index).
  Built the next item, `change-feed-upsell` (5): the delta feeds — the one thing no competitor
  sells — are now visible before sign-up: 30-day added/removed/changed per day on every register's
  /stats page with the poll command, `change_feed` on the sources listing and MCP `list_sources`,
  a "Change feeds" section in llms.txt, landing card + pricing line, docs quickstart step
  (v0.16.0). Proof: get_changes / /v1/changes calls per week ≥ 50. Next buildable item:
  variables-toolkit day-7-review (4, older than trademark-watch-surface at the same score).
- 2026-09-24 build (17:00 run): shipped `uk-gambling-operators` — the Gambling Commission licence
  register (exchange 2026-W39 runner-up, score 6, the top buildable item in `docs/pipeline/` once
  the interactive session confirmed OGL v3 and recorded the five CSV headers). Operating licences,
  registered domains and licensed premises as three record kinds in one D1 table with a daily change
  feed (new licences, surrenders/revocations, new domains), `is_active` boolean, wave 2, v0.17.0,
  Apify actor. Written blind again (origin unreachable from the build container) — the first live
  run is 05:15 tomorrow and the metrics row will say if it errored. Next buildable item:
  variables-toolkit day-7-review (4), then trademark-watch-surface (4).
- 2026-09-25 build (09:00 run): shipped `agent-paywall-signup` (score 8, the top buildable item in
  `docs/pipeline/`): 20–160 keyless MCP tools/call a day were agents that could not become
  customers because sign-up was a browser magic-link flow. Now the agent starts it — keyless
  tools `request_api_key` (user's email → approval email with a short cross-check code) and
  `claim_api_key` (poll → key, once), REST twins under `/v1/auth/agent-signup`, the human only
  clicks one approval link (same GET-then-POST anti-prefetch shape as magic links, key inherits
  the account's plan so the human is the gate). Every keyless 401, llms.txt, the docs and the
  landing MCP card point at it; v0.18.0 republishes the registry entry with the two tools. Proof:
  ≥ 5 keys via the agent path in 30 days — the daily metrics row now carries the count. Yesterday's
  `uk-gambling-operators` first live run had no refresh error. Next buildable item: launch-post-kit
  (6), then b2b-outreach-experiment (6), trademark-watch-surface (4).
- 2026-09-25 build (17:00 run): built `run-watchdog` (foundry queue, score 7, the top buildable item in
  `docs/pipeline/`): `scripts/run-watchdog.ts` checks each routine slot in SCHEDULERS.md for its
  trace — a tagged RUNS.md line or a known commit subject within 2 h — and appends one `watchdog |
  missed:` line per silent slot to `docs/RUNS.md`, which `notify owner` sends to the owner's phone.
  Replayed against history it flags exactly the refused Wednesday 2026-09-23 17:00 build. The item
  is **blocked** on one file move: neither the routine's git token nor the GitHub API token carries
  the `workflow` scope, so the workflow is drafted at `docs/ci/run-watchdog.yml` for the interactive
  session (handoff in ALERTS.md); the general fix (`workflow-scope`) is queued, blocked on an owner
  PAT. `metrics-via-relay` (7) marked done on evidence: the metrics routine adopted the relay itself
  today and the Variables Toolkit row now carries Figma install/like/view counts. Next buildable
  item: gankdat launch-post-kit (6) / foundry ops-retro (6).
- 2026-09-26 build (09:00 run): built `ops-retro` (foundry queue, score 6, the top item in
  `docs/pipeline/`): a Saturday 07:59 UTC routine that audits the operation itself — slot
  reliability against SCHEDULERS.md, throughput, blockers grouped by cause (a repeat cause → a
  general fix), routine defects, owner load — into `docs/retros/<year>-W<week>.md`, with proposals
  scoring ≥ 4 queued in the foundry queue (prompt mirrored at `docs/routines/ops-retro.md`,
  watchdog slot added). The trigger exists (`trig_015Uvn63XZUVqx1TAiWZrZL6`, resolved to Sonnet) but
  the `create_trigger` tool sets no repository source, so its validation firing stalled with 0 tokens;
  left **disabled and blocked** on the interactive session attaching the repo (handoff in ALERTS.md;
  the limitation is now written into SCHEDULERS.md: routines draft routines, people enable them). Took
  the next candidate as the rules say: `launch-post-kit` (gankdat, 6) — paste-ready Show HN, Product
  Hunt, r/datasets and Indie Hackers posts against the v0.18.0 facts, images, timing and the numbers to
  refresh, superseding the July drafts; one `owner:` line since only the owner can post. Yesterday's
  `uk-gambling-operators` wave and every other refresh ran clean (2026-09-26 row: refresh ok). Next
  buildable item: b2b-outreach-experiment (6), then trademark-watch-surface (4) / day-7-review (4).
- 2026-09-26 build (17:00 run): built `b2b-outreach-experiment` (gankdat queue, score 6, the top buildable
  item; the three items above it stay blocked on Apify, Search Console and the owner). Ten targeted emails,
  drafts for owner approval: five bid consultancies (Contracts Finder awards with winning supplier + Find a
  Tender + TED as one daily feed) and five charity/care web agencies (`website_present=false` and the change
  feed on the CQC, Charity Commission and GIAS registers as a prospect list). Every target is a UK limited
  company confirmed on Companies House through the relay, every address a generic company mailbox from the
  firm's own site — PECR reg. 22 covers individual subscribers only, so no consent is needed and no personal
  data is sent to; a reply is handled under LIA C (GDPR.md). Kit at `ventures/gankdat/docs/OUTREACH-2026-09.md`
  (claims table, sending rules, suppression list, send log); the ten drafts sit in the owner's Gmail via the
  connector, nothing sent. Sandbox egress blocks every commercial site (WebFetch and curl alike), so mailboxes
  were taken from search-result reproductions of the contact pages and the owner checks each one before
  sending. `b2b-outreach-results` (4) queued, blocked on the sends. Next buildable: day-7-review (4), then trademark-watch-surface (4).
- 2026-09-27 build (09:00 run): built `stats-canonical-fix` (gankdat queue, score 7, top buildable item from
  today's W39 review). The relay showed the real cause of both Search Console reasons: `www.gankdat.com` is a
  second custom domain on the Worker and served every page as an un-redirected 200 copy, and `/privacy` and
  `/terms` had no canonical tag — not the trailing-slash or query variants the item guessed (those were a JSON
  404 and a canonical-tagged 200). Fix: `canonicalHost` middleware (www → apex, http → https, trailing slash
  → 301; 308 for non-GET; API paths keep their bytes), static files now served through `env.ASSETS` with
  `run_worker_first` so the redirect covers them, canonical tags on the two static pages, five tests. Proof
  stays the item's: ≥ 10 /stats pages indexed by 2026-10-27 once the owner re-submits the sitemap. Next
  buildable: apify-planning-actor-repair (7), then day-7-review (4, due tomorrow).
- 2026-09-27 build (17:00 run): built `apify-planning-actor-repair` (gankdat queue, score 7, the top buildable
  item). The relay fetched the failed QA run's log without a token: Apify rejected the very first record of every
  run because the actor's dataset schema declared `authority` a string while the API serves the planning
  authority's organisation id as a number (3 failed runs, 0 succeeded, 2 users had tried it). Fixed the dataset
  and input schema, the same latent integer/number drift in `uk-trademark-journal`, and added
  `test/apify-schemas.spec.ts`, which checks every actor's dataset and input schema against the source's zod
  schemas — the general fix for actors written blind. CI re-pushes both actors; Apify's QA re-runs on the new
  build and lifts the flag by itself. Next buildable: variables-toolkit day-7-review (4, due 2026-09-28), then
  trademark-watch-surface (4).
- 2026-09-28 build (09:00 run): built `day-7-review` (variables-toolkit queue, score 4, the top buildable item and due
  today). Day-7 read: 0 installs (the single user is our own run), 0 likes, 0 purchases, 2 views, 0 comments. The relay
  read Figma's search API for seven buyer queries: rank 8 for "variables toolkit" behind a 2,784-user namesake, 79 for
  "styles to variables", 41 of 48 for "unused variables", absent from the top 100 for "variables", "design tokens" and
  "convert styles to variables"; rivals published this year get 16–69 users in their first weeks from search alone, and
  Figma ranks on the name first. Decision: relist v2 — name leads with the searched terms ("Styles to Variables, Link &
  Clean Up Unused Variables — Variables Toolkit"), tagline/first paragraph/tags carry the same phrases, description pasted
  without markdown asterisks (the live one shows them). No product change. `relist-v2` (6) blocked on the owner's
  republish; `day-30-review` (4) queued for 2026-10-21 with the playground-file lever if views stay under 20. Also built
  the foundry item `refresh-error-text` (8): the Daily numbers row now carries each refresh error's message (redacted,
  90 chars) — the third time a routine saw only a slug (nhs-ods 09-23; uk-charities, uk-insolvency, uk-trademark-journal
  today) and could not fix it blind. Next buildable: trademark-watch-surface (4).
- 2026-09-28 build (17:00 run): built `trademark-watch-surface` (gankdat queue, score 4, the top buildable item; no queue
  needed research). Two generic platform pieces rather than trademark-only code: every register change feed now takes the
  dataset's own filters (`/v1/changes/<slug>?classes=09&q=<mark>`, `get_changes` `filter`) with `/v1/data` semantics, so
  the watch the £180–320/mark/year services sell is one metered call; and `StatsSpec.facets` gives bounded per-value
  stats sub-pages, first used for 45 Nice-class pages under `/stats/uk-trademark-journal/class/<nn>` (weekly issue
  table, month trend, top organisations/representatives, the poll command; sitemap + parent index). Also fixed today's
  refresh errors generally (`refresh-transient-d1-retry`, done): one retry on transient D1 faults, and the recurring
  Gazette JSON truncation now fails with bytes/content-length/tail evidence. v0.19.0. Next buildable: none in gankdat
  besides blocked items (Apify limit, Search Console, outreach sends) — `npm run pipeline next` decides.
- 2026-09-28 owner answers to the outstanding list: Opus fallback for low-complexity items only
  (routine built), Edge dropped, no company before £300 MRR, launch posts declined. Apify support:
  the publish block is a 5-publications-per-24h limit, not a ban — publish job batched + daily.
  SAM key alert was a false alarm (keyless source). Figma payout is implied by the paid listing.
- 2026-09-28 owner asked whether to adapt ARE (private repo, drug-licensing BD tool). Declined as a
  product (human review, server stack, no buyer); its verified inventory of free pharma registers
  became two parked exchange ideas (pharma-registers-line, region-delta-feed); notes in
  `ventures/gankdat/docs/ARE-REUSE-NOTES.md`.
- 2026-09-29 build (09:00 run): research run — `npm run pipeline empty` listed the foundry queue (all eight items done). Audited
  the week's operation (RUNS, ALERTS, INBOX, review W39, report W40, the metrics and publish scripts): slots reliable since
  09-24, relay 15–25 s, but three false alarms were caused by our own automation (the Apify "pricing change" mails are the
  PAY_PER_EVENT price `publish-actors.mjs` sets — closed both handoffs; the SAM key reminder for a keyless source), triage's
  `newer_than:3h` window lost nine threads for a week, two STRATEGY §4 targets (change-feed calls, Apify runs) have no
  measurement anywhere (REST routes write no traffic point), and AMO approvals never reached STORE.md. Queued five scored
  foundry items (self-caused-alerts 8, metrics-change-feed-count 8, triage-backlog-window 7, metrics-apify-runs 7,
  store-approval-to-store-md 5); evidence in `docs/OPERATIONS.md` § Ops research log. Also fixed today's refresh error:
  uk-insolvency now retries a momentary Gazette 5xx once (gankdat `gazette-5xx-retry`, done). Next buildable:
  self-caused-alerts (8).

- 2026-09-29 fallback: with every open queue blocked, `pipeline next` offered variables-toolkit's
  day-30 review — a 2026-10-21 checkpoint — as today's work. Queue items now take `not_before`, so
  dated reviews stay queued but out of `pipeline next` until their day. (The 09:00 Fable build ran
  28 min late, during this run; its ops research and this fix were merged, nothing duplicated. The
  fallback's "did Fable run?" check cannot see a slot that has not committed yet — noted for the
  ops retro: a late slot means two runs can overlap.)

- 2026-09-29 build (17:00 run): built foundry `self-caused-alerts` (8, the top item): `docs/ops/SELF-CAUSED.md`
  maps mail our own automation triggers (Apify PAY_PER_EVENT pricing and publish confirmations, the retired SAM
  key reminder, MCP registry publishes, DMARC reports, CI failures on our pushes) to its cause and the log
  line, plus three "caused by us but real work" rows and what is NOT self-caused; the triage and weekly-report
  prompts are mirrored under `docs/routines/` with the one added sentence each. `update_trigger` refuses
  routines created via the HTTP API, so applying the two live prompts is an ALERTS handoff. Rule added to
  CLAUDE.md: anything automated that emails us gets a row in the same commit. Next buildable:
  metrics-change-feed-count (8).

- 2026-09-29 fallback (17:00 slot): the slot race fired a second time — the Fable build committed at
  17:29:57, nine minutes after this run's STEP 0 check had found no trace, and both runs built
  `self-caused-alerts`. Fable's version is the richer one (prompt mirrors, a CLAUDE.md rule, a
  "real work" section), so the fallback's duplicate was discarded rather than merged; the evidence
  and a raised score went to `fallback-slot-race` instead of a new item. Two things Fable's commit
  left undone were kept: the three false-alarm `docs/INBOX.md` dispositions are corrected (the SAM
  row no longer reads `needs owner`), and — since its own SELF-CAUSED row claims "both handoffs
  closed" while the lines are still open — their deletion is filed as a handoff, the sandbox's
  auto-mode classifier having refused it. The slot then took the next small item,
  `metrics-change-feed-count` (8): `/v1/data` and `/v1/changes` write an Analytics Engine data
  point (`rest_data`/`rest_changes`, UA and slug, never an IP, denials excluded), `metrics.mjs`
  prints `changes 7d: N (mcp M, rest R)`, and the §4 target above now names that column as its
  source. It had read "unknown, likely 0" since launch because nothing counted it.
- 2026-09-30 exchange: **gankdat distribution — Claude Connectors Directory listing** (score 11: evidence 3 × reach 4 ÷ 0.75 days + 20 owner min; the shelf lists automatically after a policy scan, no third-party gate, and the server today fails three of its checks: no readOnlyHint on 22 tools, no Origin 403, no keyless answer). Lazy OAuth (CIMD + PKCE) queued second (8) so plans bill from Claude/ChatGPT/Cursor; day-30 read 2026-10-30. Parked: Apify quality-score pass (copy lever already spent, needs run data), n8n node (5.1), Snowflake (needs account + provider agreement), pharma registers (3.0, supply). Declined: ChatGPT App Directory (business/tax verification). Comparison: `docs/exchange/2026-W40.md`.
- 2026-09-30 build: built gankdat `claude-directory-listing` (11, the exchange winner; distribution beats
  supply and this shelf lists without a third-party gate). v0.20.0: `title` + `readOnlyHint`/`destructiveHint`
  on all 22 tools (the two sign-up tools are the only writes), a 403 for a present non-allowlisted `Origin`
  on `/mcp` (CORS mirrors it), and a **keyless preview** — every data tool answers without a key (page 1,
  ≤ 5 rows, 20 calls/day per IP+UA client) before a tool error names the free plan and the £5 one — because an
  authless listing cannot carry a key and review requires every tool to succeed; `get_usage` reports the
  budget keyless. `docs#claude` section, landing card, `docs/CLAUDE-DIRECTORY.md` with every portal field
  pre-written, `test/mcp-directory.spec.ts` (the conformance test any agent directory needs), `mcp_preview`
  analytics kind so the Daily numbers row separates preview calls from paywall hits. Owner: one portal form
  (ALERTS). Next buildable: `mcp-oauth-lazy-auth` (8) so plans bill from inside Claude; foundry items at 7.
- 2026-09-30 fallback: at the 09:21 slot check Fable's 09:00 build had left no trace, so this run filled the slot
  with the highest-scoring small item, `triage-backlog-window` (7); Fable's build then committed at 09:27, six
  minutes later — the same race as 2026-09-29, now at both slots and logged a third time on `fallback-slot-race`.
  Nothing was wasted: Fable took gankdat's `claude-directory-listing`, this run a foundry item, and both are
  kept. The hourly triage searched `in:inbox is:unread newer_than:3h`, which made the clock the queue: nine
  threads dated 2026-09-18..21 stayed unread for a week across the GitHub cron gaps of 09-21/22 and cost
  the owner a re-trigger of the expired Gmail Send-as confirmation and seven late days on Chrome Web
  Store verification. Step 1 of `docs/routines/inbox-triage.md` now searches `in:inbox is:unread`
  with no age filter, oldest first, at most 30 threads a run, and step 2
  marks anything older than 3 h `(backlog)` — unread state is the queue, so a missed slot can only delay mail.
  The live prompt edit rides the open 2026-09-29 handoff rather than adding a second one.
- 2026-09-30 fallback: Fable's 17:00 build left no trace by 17:20 (no `(build)` commit since 12:51, no `| build |`
  row for the slot), so this run filled it with the highest-scoring small item, `metrics-apify-runs` (7). The
  §4 target "Apify paid runs / month: 100" had no reading anywhere in the repo — review 2026-W39 §4 wrote "no
  run count reaches the repo" — while all 17 actors have been public since 2026-09-28, so the shelf's only
  revenue signal was invisible. The Daily numbers row now carries `apify: R runs (+d/24h), U users/30d,
  P public`; the 24 h delta comes from the previous row, since the Apify API reports lifetime totals only, and
  a re-run cannot use its own row as the baseline. Field names were confirmed against a live
  `GET /v2/acts/apify~web-scraper` through the relay rather than from memory (`stats.totalRuns`,
  `stats.totalUsers30Days`, `isPublic`). The `?my=1` list was then read in CI: it carries `stats` but not
  `isPublic`, so all 17 actors fall through to their own endpoint for the public count — that fallback is load-
  bearing, not belt-and-braces, and dropping it would read `P public` as 0. `APIFY_TOKEN` is
  optional by design: without it the row still lands as `apify: n/a` rather than losing the D1 and Analytics
  Engine numbers with it. Two §4 rows now name where they are measured, and "Apify actors live" is corrected
  from the stale "1 of 13" to 17 of 17.
- 2026-09-30 build: built gankdat `mcp-oauth-lazy-auth` (8, the pipeline's top item — distribution: the directory listing
  can discover but not convert until Claude can sign a buyer in). v0.21.0 makes the Worker its own authorization server:
  RFC 9728/8414 discovery, `/authorize` with CIMD (the client_id URL is fetched and must name itself and the
  redirect_uri; loopback port-agnostic for Claude Code) and consent on the magic-link session (the emailed link carries
  `next` back to the request, so the hop may finish in another tab — deterministic, no script; a popup poller is the
  follow-up if the numbers show the hop losing people), `/token` with S256 PKCE, 1 h access + 30 d rotating refresh
  tokens and family revocation on replay. The 401 challenge fires for the one protected tool `connect_account` ("sign
  in to gankdat") and for a data tool once the preview budget is spent — so the paywall now ends in Claude's Connect
  card instead of a dead-end tool error. Tokens map to an `oauth:<client host>` key on the account (plan, credits,
  metering, revocation all the key's). Listing stays auth type `none` + lazy auth per Anthropic's docs. Proof: the daily
  numbers row now prints `oauth: N connects/24h` and the client hosts. Next gankdat item is the day-30 read
  (2026-10-30); the build queue falls back to foundry items (7) until the exchange adds more.
- 2026-09-30 burn-down: built foundry `fallback-slot-race` (7, the pipeline's top item after the OAuth build). Three
  build/fallback collisions in two days, all inside a 6-9 min window after the fallback's :20 check, because the
  check could only see a build that had already committed and builds commit 26-45 min after the slot. Fix: the
  build's very first push is a start marker (`npm run slot -- start build` → one line in `docs/ops/SLOTS.md`, commit
  `build: slot … UTC started (build)`), which the fallback's existing `(build)`-commit check stops on — so the window
  closes with a repo-side rule (CLAUDE.md) and no prompt change is required, though the exact sentence is filed as a
  handoff for the build prompt. `npm run slot -- check build` answers `running` / `done` / `missed`. The watchdog was
  extended so the marker is never the trace: a slot that stamps and then dies is reported as `stalled:` within 2 h
  instead of disappearing behind its own marker. Trade-off accepted: such a slot is then not filled by the fallback —
  rarer than the collisions, and visible on the phone. Proof stays the item's: no collision in 30 days.
- 2026-09-30 burn-down: built foundry `store-approval-to-store-md` (5). Store state reached ALERTS but not the
  files the routines read: AMO tentatively approved ReadFocus and Highlight Keep on 2026-09-22 and both STORE.md files
  still said "awaiting review" eight days later, so the metrics routine wrote "not live yet" daily. The triage prompt
  mirror's step 3 now updates the venture's STORE.md channel line (state, mail date, URL) and flips venture.json to
  `launched` on a first listing, in the triage commit; the live prompt change rides the open 2026-09-29 handoff. The
  two listings were verified through the relay (HEAD 200, AMO API `status: public`, v0.1.0 — ReadFocus already has 2
  weekly downloads with no promotion) and recorded, with the AMO JSON endpoint named as the Firefox metrics source so
  tomorrow's Daily check reads numbers. Both ventures are `launched` as of 2026-09-22 (Chrome still in review).
- 2026-09-30 burn-down: research run for the emptied foundry queue (`docs/OPERATIONS.md` ops research log). The
  headline finding is not an ops defect but a product fact nobody in the repo knew: ReadFocus and Highlight Keep are
  live on the Chrome Web Store as well as on Firefox (relay probes: page 200, slug redirect, "Add to Chrome"), no
  approval mail reached the inbox log, and the metrics routine has written "not live yet" for ten days because its
  sandbox cannot reach the stores. Three items queued: `store-metrics-in-ci` (9 — the store numbers come from a GitHub
  runner, as gankdat's do), `taskmaster-offline-add` (8 — seven timeouts, a deterministic JSON script), and
  `prompts-from-repo` (8 — five prompt handoffs in two days; the stored prompt becomes a bootstrap that reads its mirror,
  the mechanism CLAUDE.md already proves). Both extension queues' `post-approval-links` items are unblocked; the next
  build takes `store-metrics-in-ci`.
- 2026-09-30 burn-down: built `store-metrics-in-ci` (9) — `scripts/store-metrics.ts` + `docs/ci/store-metrics.yml` write each
  venture's `Daily check` row from a GitHub runner at 06:45 (CWS page, AMO API, Figma API; STORE.md `not live yet` flipped when
  a page answers), because the 07:00 routine's sandbox cannot reach the stores and wrote `not live yet` for ten days of live
  listings. The routine now only reads the row (prompt sentence handed off). Next foundry items: `taskmaster-offline-add`,
  `prompts-from-repo` (both 8).
- 2026-09-30 burn-down: built `taskmaster-offline-add` (8) — `scripts/taskmaster-add.ts` (`npm run task -- add|done|list`) appends
  Taskmaster rows deterministically because the MCP timed out in every sandbox (seven times) and the CLI is absent; the three
  rows waiting on the 2026-09-29 handoff (17–19) are filed and the handoff closed. Next foundry item: `prompts-from-repo` (8).
- 2026-09-30 burn-down: store-metrics live run showed Figma 403 to a script agent from a runner — job now uses the relay's
  browser-shaped agent and writes `unread` (not `not live yet`) when a page cannot be read; gankdat vitest `testTimeout` 20 s after
  check run 118 went red on runner timing alone.
- 2026-09-30 burn-down: heal — `notify owner` run 63 died on a two-commit push (`fetch-depth: 2` cannot see `github.event.before`), losing four
  run bullets; both range-diffing jobs (`notify-owner.yml`, `gankdat-publish.yml`) now check out full depth via `docs/ci/` and their scripts fall
  back to `HEAD~1..HEAD` on an unresolvable range. Foundry item `push-diff-range-depth` (7), done in the same commit.
- 2026-09-30 burn-down: built `prompts-from-repo` (8) — `docs/routines/<name>.md` is now the prompt of record for all nine routines and
  each stored prompt becomes a three-line bootstrap that reads its file (README there), because five prompt fixes queued behind one
  person in two days while CLAUDE.md already proved the repo steers every run. Four files are verbatim, five are written from the repo
  record and get reconciled against the stored text at swap time; one handoff replaces three. Foundry queue empty → research next.
- 2026-09-30 burn-down: ops research (second of the day) — queued `refresh-errors-to-queue` (8), `notify-owner-cursor` (6),
  `handoff-ledger` (5) in foundry and `insolvency-truncated-body` (6) in gankdat; closed the 09-28 and 09-29 handoffs a routine could
  close itself (three false-alarm ALERTS entries deleted, CWS verification recorded). Evidence in `docs/OPERATIONS.md` §Ops research log.
- 2026-09-30 burn-down: built `refresh-errors-to-queue` (8) — the 06:30 metrics job now files `refresh-<slug>` items for sources that
  error two days running (`scripts/refresh-errors-to-queue.ts`, `docs/ci/gankdat-metrics.yml`), because uk-insolvency errored four
  days with nobody queuing it; the instance item is `refresh-uk-insolvency` (6) in the gankdat queue.
- 2026-09-30 burn-down: built `notify-owner-cursor` (6) — the `notify owner` job now sends everything since a committed cursor
  (`docs/ops/NOTIFIED.md`) and advances it only after the phone accepted, because run 63 lost four bullets for good and every
  earlier failed run did the same; `scripts/notify-owner.ts` replaces the untested .mjs, workflow via `docs/ci/`.
- 2026-09-30 burn-down: built gankdat `refresh-uk-insolvency` (6) — page size 50, a cut body retried four times, a missing later page
  keeps the pages read; the relay proved the Gazette serves the full body to a runner, so the Worker-side 0-byte reads are momentary.
  Kept the honest `error` row instead of a `skipped` status: the 06:30 job that files refresh items keys on it. Stale KV lasts 7 days.
- 2026-09-30 burn-down: built highlight-keep `post-approval-links` (5) — all repo-side links on apps.gankdat.com (relay-verified), version
  0.1.1 ready to sign; the live listings switch via one handoff (sign/upload) and one owner dashboard edit, then the repo goes private (013).
- 2026-09-30 burn-down: research (highlight-keep) — nobody can find it yet (0 users, AMO listing with no screenshots in 'other'); four
  scored items, distribution first (AMO previews 6, Weava-alternative page 6, Chrome dashboard keywords 4, PDF 3); foundry
  `extension-publish-in-ci` (5) because every release is a handoff while the store keys live only in `.env`.
- 2026-09-30 burn-down: built highlight-keep `amo-listing-previews` (6) — `scripts/amo-listing.ts` fixes the empty AMO listing (previews,
  category, tags, homepage) for both extensions; one handoff run, then the metrics rows show whether Firefox downloads start.
- 2026-09-30 burn-down: built highlight-keep `weava-alternative-page` (6) — the page a burned Weava / Super Simple user finds when they
  search, on the host Search Console already indexes; honest table (PDF and sync marked "not yet"), live install buttons, both listing
  texts link to it. Distribution before features (§5); proof is Search Console at day 30.
- 2026-09-30 burn-down: built read-focus `post-approval-links` (5) — both extensions' repo-side links now on apps.gankdat.com; the
  live listings switch with the one open handoff (AMO) and one owner dashboard visit (Chrome, both extensions), then the repo goes
  private (013). Queue emptied → research next.
- 2026-09-30 burn-down: research (read-focus) — same picture as Highlight Keep (0 users, listings being fixed by the open handoff);
  five scored items, distribution first (comparison page 6, day-30 funnel review 5, PDF viewer 3, Chrome promo tile 3 and
  Edge listing 3, the last two blocked on the owner). Kill date if nothing moves: 2026-12-21.
- 2026-10-01 burn-down: built read-focus `reader-mode-alternative-page` (6) — the page a burned Reader Mode / bolding / ADHD-reading
  user finds when they search, on the host Search Console indexes; honest 12-row table (PDF "not yet", Docs "no", Helperbird named
  for suites), live install buttons, both listing texts link to it. Distribution before features (§5); proof is Search Console at day 30.
- 2026-10-01 burn-down: built foundry `handoff-ledger` (5) — `scripts/handoffs.ts` lists open ALERTS handoffs by age and closes one by
  appending the Done/Superseded suffix to the original entry (no more separate done: lines, no deletions); the report and retro read it.
  First run: 23 of 34 open entries were already executed; 11 live remain. Proof: no handoff > 7 days without a suffix over 30 days.
- 2026-10-01 burn-down: foundry `extension-publish-in-ci` (5) built (workflow + script + 7 tests, dry run ok) but the unattended sandbox
  refused to push a workflow that publishes to the stores (and CLAUDE.md lists store publishing as ask-first). Blocked on an attended
  session with the design in the queue item; nothing of it reached main.
- 2026-10-01 burn-down: built highlight-keep `pdf-highlighting` (3, 0.2.0) — the last todo in the queue and the most-asked rival gap. Own
  PDF.js viewer page (legacy build, Chrome 116+), popup button for web PDFs, storage keyed by the PDF's URL so nothing else changed;
  e2e-proven in Chromium. Local-file PDFs stay out and are said so. Ships with the open 0.1.1 handoff (now 0.2.0). Nothing todo is left in
  the queue; `cws-listing-keywords` stays blocked on the owner's dashboard pass, so the queue is not empty yet.
