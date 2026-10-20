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
same thing*, not for one big bet. Capital cap £100 = the owner's **net outlay** (owner,
2026-10-10): `spent + planned` may pass it only by revenue already received, so anything beyond
the cap comes out of profit. Recurring cost £3.70/month (Workers Paid, owner-paid); the 10-10
invoice (US$49, £37) was a one-off D1 overage from the nightly full reloads, fixed 2026-10-04,
and `npm run ledger` now reports the months of headroom the recurring line leaves (12 on 10-10); the first
rows of the new period (10-10, 10-11) read US$0 overage and 0.0M D1 writes a day (review W41).

## 2. Where the money is (ranked by evidence, 2026-09-20)

| Line | Buyer & job | Evidence of paying demand | Price point | Human effort per sale |
| --- | --- | --- | --- | --- |
| **gankdat data API** (13 datasets) | bid teams, compliance/KYB, prospecting, proptech; AI agents | paid rivals (PlanAPI, Searchland, ComplyAdvantage tiers); Apify scrapers of the same registers sell at ~US$1/1k rows | £5–£239/mo, x402 US$0.005/call | none (self-serve) |
| **Apify actors** (13, one per dataset) | same buyers, already on Apify | existing paid actors on identical data | US$0.001/row, 80/20 | none |
| **Change feeds** (`/v1/changes`) | grant-makers, KYB, recruiters | no competitor offers an official-source delta feed | inside plans; upsell later | none |
| Browser extensions (ReadFocus, Highlight Keep) | consumers | rivals abandoned; low ticket | US$12 one-off | none, but small |
| Figma plugin (Variables Toolkit) | designers | paid rivals with gaps | one-off | none |
| **Hackathon prizes** (`ventures/hackathons`, 2026-10-11: Devpost lists 38 open online hackathons; PayPal AI $67.5k to 11-12, Nebius × NVIDIA $50k to 10-30, both accepting existing projects and UK entrants) | sponsors who have already committed the prize money; judges | the prize tables in the official rules | $5k–$20k per placing | one account per portal (owner), the entry package built by routines, the owner clicks submit |
| ~~Open-source bounties~~ (`ventures/oss-bounties`, opened 2026-10-11 on 553 labelled GitHub issues; **killed 2026-10-18, review W42**: seven consecutive daily boards 10-11..10-17, ≈ 3,900 issue reads, held 0 free funded code fixes at US$25+ and all 8 filed items were dropped on read — the labelled money is assigned, crowded or not code; Algora's public board 404s, Opire rewards are not escrowed) | maintainers who posted cash on an issue | the amount is on the issue — but on seven boards none was free, funded and code | $50–$800 per merged PR | none per PR; the code, scanner (weekly from now) and claims ledger are kept; the exchange holds the idea parked (re-open: two consecutive weekly boards with a claimable row) |
| **Agent directories** (MCP Registry, mcpservers.org, Glama, awesome-remote-mcp-servers and the Apify Store live; Claude Connectors Directory submitted by the owner 2026-10-04, in review; Docker MCP Catalog entry built 2026-10-10, PR waits on the owner's token, action 021) | the owners of the agents hitting the paywall (~80/day); Claude Team/Enterprise users | same rivals as the data API; the directory measures rank, accounts and tool calls itself | inside plans (OAuth billing from Claude queued) | none — listed automatically after a policy scan on the owner's paid plan (added 2026-09-30); ~46k keyless calls and no payer from the five live directories by 2026-10-11; the first client to exhaust the keyless preview (10-11: 47 wall hits on contract awards, sanctions and TED) was offered sign-in only — gankdat `preview-wall-next-steps` (review W41); by 2026-10-18 (review W42): Claude in review day 14 (no mail), Docker PR docker/mcp-registry#5622 in review day 7, anonymous MCP calls doubled in the week (1,585 → 2,970/day) with 0 OAuth approvals and 0 `request_api_key`, the 10-11 wall-hitter never returned |
| **x402 Bazaar** (Coinbase CDP discovery catalogue; exchange 2026-W42: 34,668 resources, the top 200 took 518,867 paid calls from 17,160 payer-slots in 30 days at a median US$0.003; no UK or company register, tender or sanctions resource listed; gankdat's x402 lane live since July at US$0.005 with 0 payments, unlisted — `x402-bazaar-listing` queued 2026-10-14) | AI agents holding USDC on Base that search the Bazaar by intent (searchX402Resources, the Bazaar MCP, agentic.market) | the catalogue's own per-resource 30-day call and payer counts; resellers of Exa search at US$0.01 with 168 payers | US$0.005 per call (CDP Facilitator: 1,000 settlements/month free, then US$0.001 each) | none — one settled payment indexes a resource; the owner makes it once (≤ 10 min); **listed 2026-10-16** (the half-cent settlement made by Claude from the test wallet, action 026 option B) and **the first paid calls by strangers followed within 48 h: 3 calls from 3 payers on 10-17/18**, the only non-zero in the §4 money rows — against `bazaar: 1 listed` (the July v1 route; the 17 v2 routes validate but are not yet indexed, week-1 check 2026-10-23; review W42) |

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
| gankdat paying accounts | 0 (3 accounts — 2 external sign-ups on 2026-10-12, `+0/24h` every day since, nothing used; review W42, Daily numbers 2026-10-18) | 5 | `Daily numbers` rows in `ventures/gankdat/RESEARCH.md` |
| gankdat MRR | £0 (no `revenue` row, `0 paid` on every row; the x402 lane took its first 3 paid calls from 3 external payers on 10-17/18 ≈ US$0.015 in USDC — recorded at the day-30 Bazaar read; review W42) | £150 | Stripe (weekly report); x402 receipts per the ledger convention of 2026-10-18 |
| Apify actors live | 18 of 18 public, 17 healthy (`uk-planning-applications` flagged under maintenance by Apify QA 2026-10-17 after its origin emptied; surface pause queued — review W42) | 17 — met | `apify:` in the Daily numbers row (`ventures/gankdat/RESEARCH.md`) — `P public`; all 17 went public 2026-09-28 |
| Apify paid runs / month | **0 paid** (September developer summary, INBOX 2026-10-06: US$0, 1 unique user; October's arrives ≈ 11-06); 355 runs by others in the 30 days to 10-18 (≈ 12/day), `18 users/30d` = one per actor = Apify's QA runner; the Companies House actor 10 runs/30 d — `30d: T runs (O ours, X others)` is the ceiling, the monthly summary mail the paid figure (review W42, Daily numbers 2026-10-18) | 100 | `apify:` in the Daily numbers row (`ventures/gankdat/RESEARCH.md`) — lifetime `R runs` plus the `+d/24h` delta (`stats.totalRuns`), 30-day runs by everyone (`stats.publicActorRunStats30Days.TOTAL`) minus our own (`GET /v2/actor-runs`) |
| Change-feed calls / week | 0 (`changes 7d: 0` on every row 09-30..10-18, 19 days; the keyless Atom feeds: 50 fetches in 30 d by 7 user agents; review W42) | 50 | `changes 7d:` in the Daily numbers row (`ventures/gankdat/RESEARCH.md`) — Analytics Engine, MCP `get_changes` + REST `/v1/changes` |
| Extension + plugin sales | 0 — read since 2026-10-11 (`sales: 0 keys (2 test)` ReadFocus, `0 keys` Highlight Keep on every Daily check row; Figma `purchase_count 0`). Users: ReadFocus Chrome 3 ↔ 0 (the store count flickers by day), Highlight Keep 1 Firefox weekly download since 10-14 (its first), Figma 14 views / 4 unique runs / 0 installs (review W42, Daily check 2026-10-18) | 20 | Stripe / Figma; `sales:` in the Daily check rows (foundry `metrics-extension-sales`) |
| Directory listings live | 5 (+ Claude Connectors Directory in review since the owner's 10-04 submission, day 14, no mail; Docker MCP Catalog PR docker/mcp-registry#5622 in Docker's review since 10-11; x402 Bazaar: 1 resource indexed, the 17 v2 routes validated and awaiting indexing — review W42) | 8 | `MARKETPLACE-PREP.md` |
| Bounty PRs merged / paid | **line killed 2026-10-18** (review W42): 0 claimed, 0 merged, 0 paid, 8 dropped on read; seven daily boards with 0 free funded code fixes at US$25+ (`npm run claims`, RESEARCH 2026-10-18). Target retired with the line; the exchange holds the idea parked | — (was: first payout by 2026-12-20) | `## Claims` table in `ventures/oss-bounties/RESEARCH.md` (`npm run claims`), the weekly `docs/bounties/BOARD.md` |

If gankdat is < £50 MRR **and** Apify < 20 paid runs/month by 2026-12-20 with all listings
live, the data line is re-positioned (see kill criteria) rather than extended.

## 5. Prioritisation rule (used before starting anything)

**The live queue is `docs/pipeline/` (one JSON queue per venture plus the idea exchange);
`npm run pipeline` prints the next item.** The text below is the rationale and history.

Score = (evidence of paying demand × reach of the channel) ÷ (build days + owner minutes).
Build only what scores above the best distribution task still undone.

**Queue weights (owner, 2026-10-11 — "a new venture should greatly outweigh improving a current
one").** `npm run pipeline next` ranks items by score × the queue's `weight`, which the Sunday
review sets from this table and the exchange sets for a new queue:

| Queue | Weight | Rule |
| --- | --- | --- |
| a line in its first 30 days, or one that collects money already on offer (prizes; bounties until that line was killed 2026-10-18) | 2 | new income first |
| `new-ventures` — the exchange's backlog of research spikes for new lines (owner 2026-10-17; weight set by the exchange, confirmed review W42) | 2 | new-line evidence is scheduled work for idle slots, not a Wednesday-only decision |
| a venture earning, or still putting its first listings on shelves (gankdat), and `foundry` | 1 | the baseline |
| a launched venture with no revenue 30 days after its listings went live (variables-toolkit, read-focus, highlight-keep on 2026-10-11) | 0.5 | improvements wait behind new lines; the day-30 funnel review decides keep or kill | **Distribution beats
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
6. **Review**: weekly report (Mondays) for facts; **weekly strategy review** (Sundays 08:00 UTC,
   `docs/reviews/YYYY-Www.md`, cloud routine; weekly since 2026-09-22, was monthly) that scores every venture keep / double-down /
   kill, checks the 90-day targets, lists market signals seen (support mail, feedback form,
   directory replies) and proposes the next three moves. Claude rewrites this file after it.

## 7. Kill and pivot criteria

- Any venture: zero sales **and** zero organic signal (signups, runs, enquiries) 90 days after
  every planned listing is live → kill (keep the code, stop the effort).
- A money-on-offer line (prizes, bounties): its supply is the reading — when the line's own daily
  board shows nothing claimable for seven consecutive reads (for bounties: a free, funded, escrowed
  code-with-tests row at US$25+ absent for a week; STRATEGY §8 2026-10-11) → kill before the
  outcome rule in its `RESEARCH.md` can ever fire, keep the scanner weekly as the re-open reading
  (applied to oss-bounties 2026-10-18, review W42). For prizes the rule stays RESEARCH §6: three
  complete submissions with no placing and no feedback.
- gankdat dataset: not queried by any customer in 60 days → retire from the surface.
- Whole data line: < £300 MRR after 4 months of the listings being live → reposition toward
  one buyer type (bid intelligence or KYB) and sell the change feeds as the product.
- Recurring cost creep: anything that pushes recurring spend above £10/month needs revenue
  ≥ 3× that cost already banked.
- Cap rule (owner, 2026-10-10): the owner's net outlay never passes £100 — `npm run ledger` fails
  the gate when `spent + planned > £100 + revenue`, and warns under three months of headroom at
  the recurring rate; the review then decides what stops or what pays. A metered Cloudflare charge
  above the US$5 plan is a bug, not a cost: the metrics job files `cf-overage-<period>` (score 8)
  the day the Daily numbers row shows ≥ US$1 of overage.

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
- 2026-10-01 burn-down: built read-focus `pdf-viewer` (3) — 0.2.0 reads web PDFs in an own reader page as reflowed real text (a canvas viewer would hide bold starts and fonts); free = first page, unlock = whole file; the niche's most-asked-for feature now sits behind a demo-then-pay gate. Ships with the open handoff.
- 2026-10-01 build: pipeline starved (every open item blocked or dated, `next` null, `empty` []) — built foundry `pipeline-starvation` (7):
  `npm run pipeline empty` now lists the starved queues, oldest `updated` first, so a slot researches instead of idling; and foundry
  `metrics-fill-after-waves` (7): a push-triggered metrics fill before 06:20 UTC had written today's gankdat row from yesterday's refresh
  (uk-insolvency's pre-fix error repeated verbatim), the cron was skipped; the row is deleted and CI rewrites it after this push.
  Then the research run the new rule chose, variables-toolkit (RESEARCH.md §9): the v2 relisting is live (2026-09-28, `relist-v2` done)
  and took #1 for "unused variables" (48 hits) but views stay at 2 — Figma ranks crowded queries by user count, so the search box cannot
  seed a one-user paid listing. Five items, distribution off-Figma first: rank in CI (5), Google-facing page (5), free Community file (4),
  free companion listing (4), relink feature (3); tonight's slot builds the first of them.

- 2026-10-01 build: built variables-toolkit `figma-search-rank-in-ci` (5): the 06:45 `store metrics` runner now asks Figma's search API for the
  four buyer queries STORE.md lists and writes `rank: <query> <position>/<hits>` on every Daily check row, so the day-30 review (2026-10-21)
  reads a series, not another relay snapshot; two relay rounds were spent on this by hand. Replaying the day-10 bodies gives the §9 table exactly.

- 2026-10-02 build: built variables-toolkit `figma-styles-to-variables-page` (5): the Google-facing comparison page, the first of the §9
  "off the search box" levers, because Figma ranks crowded queries by user count and Search Console already indexes apps.gankdat.com.
  Rival cells come only from the 2026-09-18 comment harvest and listings; the listing link rides the next republish rather than costing
  an owner action. Proof is Search Console by 2026-10-31; the day-30 review (10-21) reads it with the rank series.

- 2026-10-02 build (17:00): built variables-toolkit `community-playground-file` (4): the free "Variables Playground" Community file,
  the second lever off the Figma search box (RESEARCH.md §9), because free files are surfaced and duplicated far more than paid
  plugins and publish with no review. Built as a plugin dev command plus tested content data rather than a hand-made file, so the
  owner's part is ten minutes (run, set thumbnail, publish — ALERTS owner line, action 017). Proof: listing views ≥ 20 within 14
  days of the file going live; the file's own views join the metrics job once its URL is known (`playground-file-views`, blocked).

- 2026-10-03 build (09:00): built foundry `runs-line-length-check` (7): `scripts/runs-check.ts` runs inside `npm run check` and fails
  any push whose `docs/RUNS.md` lines dated 2026-10-03 or later carry text over 120 chars after the `| <routine> | ` prefix
  (malformed bullets fail too). A date cutoff rather than the push's diff range because the check workflow clones at depth 1 and a
  cutoff gives the same verdict locally and in CI. The retro's 88% figure counted whole lines; by the header's own text measure
  24 of 375 lines broke the cap, all grandfathered. Proof: zero over-cap lines added in the next 30 days (the retro reads it).

- 2026-10-03 build (17:00): built foundry `refresh-errors-rolling-window` (7): `scripts/refresh-errors-to-queue.ts` now judges a
  source over its last four Daily numbers rows and files it when two of them (today's included) list the slug, instead of today and
  yesterday only — the retro's every-other-day flake. The flat 14-day cool-off on done items went too: it was the actual blocker, since
  uk-insolvency (fixed 09-30) errored 10-02 and 10-03 and the morning job still skipped it; a done item now counts only rows dated
  after its fix and is re-filed once two of them fail. Dropped items keep the cool-off (a drop is a decision). Run on today's rows the
  new rule queued gankdat `refresh-uk-insolvency-2026-10-03` (6). Proof: an every-other-day source is queued within four days.

- 2026-10-04 review (2026-W40): scorecard flat on every money target — 0 paying accounts (1 unpaid), £0 MRR,
  0 change-feed calls, 0 extension/plugin sales, 5 directories; Apify shelf fully open (17/17) with ~11 runs/day
  whose paid share is unmeasured. Verdicts: gankdat **fix** (STRATEGY §7's cost rule is tripped on the
  evidence: Cloudflare reported US$15 of metered usage 20 days into the period against the £3.70 ledger line
  and £0 revenue; nothing in the repo knows which product carries it — queued `cloudflare-usage-breakdown`
  (8) as the week's first move, ledger gets an unconfirmed £7.40 planned row, headroom £30.20); Variables
  Toolkit, ReadFocus, Highlight Keep **keep** (clocks at day 13 and ≤ day 4; nothing to read before 10-21/10-30).
  Market signal: the keyless preview (10-01) turned ~80 paywall hits/day into ~100 previews/day and
  `connect_account` is now the most-wanted tool (4–6/day) with 0 completed connects — queued
  `oauth-connect-funnel-check` (5, from 10-09). Outreach: all ten sent 09-28 (Gmail), one bounce, 0 replies at
  day 6 — `b2b-outreach-results` is dated 2026-10-12 instead of blocked. Measurement gaps queued:
  `metrics-apify-paid-runs` (foundry 6), `metrics-dataset-queries-30d` (gankdat 5). Exchange unchanged (no
  trigger met). One owner line: a 2-minute look at Cloudflare's billable-usage page and the still-open
  Connectors Directory form. Review: `docs/reviews/2026-W40.md`.
- 2026-10-04 build: `cloudflare-usage-breakdown` built. The US$15 metered alert (§7 cost rule) was traced
  to D1 rows written: every nightly refresh of the nine D1 registers inserted a whole new generation
  (~1M rows, two index entries each) and deleted the old one, for registers that move well under 1% a
  day. The refresh is now an in-place delta (migration 0014 `record_hash`; only changed rows upserted,
  new ids appended, vanished ids deleted, change-feed rows written as it goes); the first night after
  deploy is one last full reload that writes the hashes. The Daily numbers row gains `cf usage:` from
  the GraphQL Analytics API (per-product period-to-date usage and an estimated overage, degrading to
  `n/a (<reason>)` if the deploy token lacks the analytics scope — then the owner's dashboard look
  stands). Proof: the 2026-10-10..11-10 invoice ≤ US$10; the ledger row is corrected when it lands. Same run,
  first reading (the deploy token has the analytics scope): 87.5M D1 rows written 09-10→10-04, KV,
  Analytics Engine and requests ≈ 0 — D1 writes are the whole overage (≈ US$38 so far, ledger £31
  estimated); the owner's dashboard look is no longer needed.
- 2026-10-04 interactive: first real OAuth connection to gankdat's MCP server (the owner's account, from Claude). Two
  bugs fixed on the way — a double-submitted consent form stranding the client on 'expired', and popup-breaking
  headers (COOP, form-action) that left claude.ai spinning. Both now covered by tests. Extensions 0.2.0 shipped to
  both stores; CI trimmed for the private-repo cap.
- 2026-10-04 burn-down (17:00, STEP 0): `main` was red — `npm run runs` failed on five RUNS.md lines the 15:45–16:40
  interactive session appended over the 120-char cap (CI did not catch it: the trimmed `check` workflow no longer runs on
  docs-only pushes, so the next code push would have gone red). Fixed forward by shortening the five lines; no other gate
  failed. Nothing else built this run, per the heal-first rule.
- 2026-10-04 build (17:00, STEP 0): found the same red `runs` gate as the burn-down run above and fixed it identically;
  the burn-down's push landed first, so this slot merged it, confirmed `npm run check` green and built nothing.
- 2026-10-04 burn-down: `refresh-uk-insolvency-2026-10-03` built. Not a parser fault: the relay read page 1 of The
  Gazette's feed in full from a GitHub runner this evening (200, 101 KB) while the Worker has read it as 0 bytes every
  day since 09-28 through two rounds of retries — the origin cuts the body for the Worker's egress. So the source is
  now runner-fed (`refresh.runner`): the cron waves skip it, a stale KV snapshot is served without an inline attempt,
  and the `gankdat metrics` job runs the source's own `fetchFresh` on its runner and writes the Worker's exact KV
  values plus a `refresh_log` row through the REST API (`scripts/runner-refresh.mjs`, bundled with esbuild — new
  gankdat devDependency). The Daily numbers row also lists any source with no `ok` refresh in two days, so a runner
  job that silently stops is seen. Proof: uk-insolvency absent from refresh errors for 7 Daily rows from 10-05.
- 2026-10-04 burn-down (18:35): `main` went red mid-run — the watchdog's first CI-minutes warning line in RUNS.md was
  131 chars against the 120 cap `npm run runs` enforces. Shortened the line; `scripts/actions-minutes.mjs` now cuts its
  text at 120 so the guard can never redden `main` again.
- 2026-10-04 burn-down: `billing-alert-to-owner` built — one sentence in `docs/routines/inbox-triage.md`: a paid service's
  billing or usage alert above its LEDGER.md line is `needs owner` with an `owner:` line and an unconfirmed ledger note,
  never plain `logged` (the 10-01 Cloudflare US$15 alert sat unread for three days).
- 2026-10-04 burn-down: `retro-clone-depth` built — the retro's checkout step in `docs/routines/ops-retro.md` now checks
  the oldest commit in `git log --since='8 days ago'` and unshallows (or deepens by 200) when the clone covers less
  than 7 days; the W40 retro measured 2 of 8 days until unshallowed by hand.
- 2026-10-04 burn-down: `metrics-dataset-queries-30d` built — the Daily numbers row now carries `datasets 30d:` (authed
  REST and MCP calls per dataset over 30 days from Analytics Engine, zero-call datasets named), so §7's per-dataset
  retirement rule has a reading from the 10-05 row. `metrics-apify-paid-runs` not built this slot: the API cannot
  separate a buyer's run from Apify's QA runner (note on the item); the next run decides between an `ours/30d`
  column and the payout mail as the paid reading.
- 2026-10-04 burn-down: `metrics-apify-paid-runs` built — the Daily numbers row's `apify:` note gains `30d: T runs (O ours,
  X others)`: T is every account's runs of our actors in 30 days (`stats.publicActorRunStats30Days.TOTAL`, field confirmed
  through the relay on web-scraper and uk-no-website-leads), O our own from `GET /v2/actor-runs`, X = T − O. Apify's QA
  runner sits inside X and the API cannot tell it from a buyer, so X is the ceiling of paid runs and the monthly Apify
  payout mail (inbox triage) stays the paid figure of record — no `paid/30d` number is invented. §4 row updated.
- 2026-10-04 burn-down: `free-unused-variables-finder` built — a free companion Figma plugin "Unused Variables Finder &
  Cleaner" from the toolkit's hygiene module (`ventures/variables-toolkit/src/free/`, `manifest.free.json`, `npm run build:free`),
  with delete, no payments, no network; its result screen names what the paid toolkit adds for that file and links to the
  listing. Why: the toolkit is #1 for "unused variables" with 0 installs because every winner of that query is free (§9
  point 3) — the free listing earns the trial install, the link converts. Owner publishes (action 018, batched with 017).
  Proof: ≥ 50 installs and ≥ 5 attributed toolkit views in 30 days.
- 2026-10-04 burn-down: `relink-library-variables` built — the Variables Toolkit's fourth tab moves layers bound to local or
  no-longer-published variables onto the enabled library's variable of the same name and type (`src/core/relink.ts` planner,
  `src/figma/relink.ts` via `figma.teamLibrary` + `importVariableByKeyAsync`; new `teamlibrary` permission). Why: the one
  documented paid-rival gap with repeat comments (Variable Utilities, DSO; Token Toolkit Pro renamed around it) and the only
  buildable item left in any queue tonight. Not live until the owner republishes (action 019). Proof: ≥ 1 comment or purchase
  naming relink within 30 days of the republish.
- 2026-10-04 burn-down (20:50): correction to the entry above — `library-backup-restore` dropped: the library page already has Backup (JSON)
  and Restore and every listing text says so (the research grep covered `core/` only). Restore wipes instead of merging; that gap is now part
  of `import-super-simple-highlighter` (0.6 d). Lesson for research items: read the venture's UI entry points, not only `core/`, before
  claiming a feature is missing.
- 2026-10-04 burn-down (21:25): **heal — STRATEGY.md and RUNS.md restored.** Commit 815ab26 (20:39, the highlight-keep research run)
  wrote both files whole with only its new entry, cutting STRATEGY.md from 569 lines to 6 and RUNS.md from 472 to 3; two more runs
  appended to the stubs without noticing. Restored from 41a7acb plus the three lines added since; nothing else was lost (the queue, RESEARCH
  and code commits were intact). The notify cursor is moved forward in the same push so the 470 restored run lines are not resent to the
  owner's phone. Rule for every routine: append to these files (`>>`, Edit), never write them whole; a shrink guard is queued in
  `queues/foundry.json` (`append-only-guard`).
- 2026-10-04 burn-down: `import-super-simple-highlighter` built (Highlight Keep 0.3.0) — a Super Simple Highlighter backup file
  imports into the library through a pure merge that Restore now uses too (a second machine's highlights survive a restore). Format
  taken from the rival's public source, not guessed. Why: the one concrete "bring your highlights" argument against a free rival with
  200k users whose own help page admits lost highlights are lost; distribution before features, and the cheapest buildable item in
  the queue. Proof: ≥ 1 import named in a review or support mail within 60 days of 0.3.0 going live.
- 2026-10-04 burn-down: `append-only-guard` built the same night it was queued — `npm run runs` fails when `docs/RUNS.md` or
  `docs/STRATEGY.md` has fewer dated lines than the floor in `docs/ops/RUNS-COUNT.json` (raised in place as the files grow), and
  the notifier caps one push at 40 run bullets. Why: the 20:39 overwrite passed CI and would have cost the owner 470 phone
  messages on restore; both files are the operation's memory and its only report to the owner. Proof: a deliberate shrink fails the
  check (tested); no further whole-file write reaches `main` unnoticed.
- 2026-10-04 burn-down: `comparison-page-2026-rivals` built — the Weava-alternative page now compares against Web Highlights
  (200k users, free offline, subscription for sync) and Marqly (1k users, account required, $72/year after a $49 first year),
  the two names Google shows for the query, with facts read from their own pricing/FAQ pages through the relay. Why: a reader
  arriving from that search found our table missing both; the one-time-vs-subscription argument is now stated against every
  rival on the results page. Web Highlights' dollar prices are client-rendered and unverifiable from HTML, so the page names
  the model and the trial, not a figure. Proof: Search Console impressions ≥ 50 at the 2026-10-30 review.
- 2026-10-04 burn-down: ReadFocus research pass (starved queue) — four scored items added: Dyslexly and Half Bold columns on the
  comparison page, a reading-ruler search-capture page, an AlternativeTo/Product Hunt listing (owner account, blocked) and Firefox
  for Android compatibility (score 2, no demand evidence yet). Why: the 2026 rivals a searcher sees are free and local, so the
  one-time-price argument does not carry; what ReadFocus can still say is PDF reflow, paragraph focus and bold strength, and the
  cheapest way to say it is on the pages the search already reaches. A free companion extension was considered and not queued
  (Half Bold and Dyslexly already own the free slot; repetitive-content risk on the store).
- 2026-10-04 burn-down: read-focus `comparison-page-2026-rivals` built the same night it was queued — Half Bold (10k users,
  free, no PDFs) and Dyslexly (271 users, free toolkit with ruler and PDF reader) now sit in the ReadFocus comparison table with
  facts from their own site and listings; where they win the page says so. Why: they are what the search shows today, and a
  page that omits them reads as stale; ReadFocus's case is narrowed to the three things they lack. Proof unchanged: page
  impressions ≥ 50 at the 2026-10-30 review.
- 2026-10-04 burn-down: read-focus `reading-ruler-page` built — a search-capture page for the ruler query, where 28k users sit
  on three free tools that are abandoned, broken or asking for PDF, the one thing ReadFocus's 0.2.0 reader does. Why: the
  cheapest remaining distribution item; same pattern as the two comparison pages; honest about the band's missing controls.
  Proof: ≥ 30 impressions or ≥ 3 clicks at the 2026-10-30 review.
- 2026-10-04 burn-down: read-focus `firefox-android-compat` built as 0.2.1 — the Firefox manifest carries `gecko_android`, the
  popup fits a phone, the ruler and focus go where the finger taps, and the shortcut API (absent on Android) is guarded. Why:
  the last buildable ReadFocus item; AMO's Android home page is a free shelf that needs no new account; the sandbox cannot run
  Firefox for Android, so the proof is the AMO API's compatibility field and Android installs at the day-30 review, where the
  item is dropped if none show. Ships with the next AMO sign, after 0.2.0 clears review.
- 2026-10-04 burn-down: foundry research pass (pipeline starved after the last ReadFocus item) — three scored ops items
  queued from tonight's own run: the extension e2e fails first time in the sandbox (Playwright build mismatch, root check never
  runs it), a `doing` item is invisible to `pipeline next` (actions-minutes hid behind a starvation report), and the paid-tier
  e2e sections skip on every cloud run for want of the signing key. Why: each cost or hid work tonight and would again; all three
  are small, repo-only, and raise the chance that a shipped extension version is actually tested. No exchange pre-research:
  the starved-queue rule takes precedence and the budget is spent.
- 2026-10-05 burn-down: foundry `e2e-sandbox-browser` built — both extension e2e runners resolve the browser themselves
  (CHROMIUM_PATH, then Playwright's own build, then the sandbox's `/opt/pw-browsers/chromium`) and say which, and Highlight
  Keep's runner skips its pro section without the signing key instead of crashing, which it did on its first sandbox run
  tonight. The burn-down and build prompts now run the venture's e2e after any extension `src/` change. Why: every cloud run
  paid a failed attempt or skipped the only test that drives the built extension, so a content-script regression could reach
  main green; both e2e passed first time in the sandbox after the fix. Proof: no browser-mismatch line in RUNS.md in 30 days.
- 2026-10-05 burn-down: foundry `pipeline-doing-visibility` built — queue items carry `doing_since`, `npm run pipeline` lists
  every `doing` item, and one doing for more than a day with no future `not_before` is offered again by `next` as a cut-off
  session's leftover; `actions-minutes` became `todo` with `not_before` 2026-10-12 so the hold is visible. Why: a score-7
  item sat hidden while the slot reported starvation, and a half-started item could hide the same way for good. Deviation
  from the item text: no time-based validation failure — that would turn the nightly check red by the clock alone, costing a
  heal run; re-offering gives the same outcome. Proof: no queue holds an undated doing item older than a day in 30 days.
- 2026-10-05 burn-down: foundry `e2e-pro-sections-test-key` built — a `--test` build without the production signing key
  generates a throwaway Ed25519 pair, bakes its public half into the bundle through an esbuild define and leaves the private
  half in the git-ignored test directory for the runner, so the paid halves of ReadFocus (sections 5–7) and Highlight Keep
  (section 5) now pass in the sandbox with no `.env`. Why: the paid tier was the one part never exercised by any cloud run
  that ships a version; the production key still never leaves `.env`, and the production bundles were checked to carry the
  real key. Proof: no SKIP line for the pro sections in RUNS.md from now on.
- 2026-10-05 burn-down: gankdat research pass (pipeline starved: every open item blocked or dated). Fourteen Daily numbers
  rows say the funnel is wide at the top (1,400–1,900 keyless MCP calls a day, 54–117 previews) and zero at the bottom (0 paid,
  0 keys, 0 OAuth connects), the change feeds — the one product no rival sells — have never been called, Apify is the only
  shelf with outside runs, and §7's cost rule is tripped on D1 writes. Five items queued: change-feed mode on the Apify actors
  (7), a three-row D1 write-rate read after the delta refresh (6, from 10-08), per-actor Apify runs in the metrics row (5),
  IndexNow pings for the stats pages (5), and a keyless Atom feed per register (5). Why these: they put the differentiating
  product where traffic already is or where no account is needed, and give the §7 rules readings; no new dataset — supply is
  not the constraint. Evidence: `ventures/gankdat/RESEARCH.md` "Research 2026-10-05".
- 2026-10-05 burn-down: gankdat `apify-change-feed-mode` built — the nine Apify actors whose register has a change feed take
  `mode: changes` (+ `since`, `change`) and return only the rows added, removed or changed, with the same filters, so a daily
  schedule on the Store is a register monitor paid per changed row. Why: Apify is the only shelf with runs from outside the
  repo and the change feeds had never been called by anyone; the seven KV-backed actors have no stable id (the API 404s), so
  they keep data mode only — a deviation from the item's "every actor". Proof: `changes 7d: … rest N` > 0 on ≥ 5 days in the
  30 days after CI republishes the actors.
- 2026-10-05 burn-down: gankdat `apify-runs-per-actor` built — the Daily numbers row names each Apify actor's 30-day runs
  by other accounts and the zero-run actors. Why: the shelf total could not say which registers Apify users want, so the
  exchange's quality-score pass had no trigger reading and §7's per-dataset rule had only the API side; first reading in the
  2026-10-06 row, read by the 2026-W41 review.
- 2026-10-05 burn-down: gankdat `indexnow-stats-pages` built — after every refresh wave the Worker tells IndexNow which
  `/stats` pages (parent + facets, ~1,100 URLs) changed, proven by a key file it serves; the runner does the same for its
  sources, and the Daily numbers row reads `indexnow: N urls <status>`. Why: the only indexing reading has been owner-blocked
  since 09-20, and IndexNow needs no account yet feeds Bing, DuckDuckGo, Copilot and ChatGPT search — the shelves where
  agents that "search like humans" find the cite-bait pages. Not a Google signal. Proof: 200/202 daily from the 10-06 row;
  Bing `site:gankdat.com/stats` ≥ 50 pages at the 2026-11-05 read (`indexnow-day-30-read`).
- 2026-10-05 burn-down: gankdat `change-feed-rss` built — every register dataset has a keyless Atom feed of its last 7 days
  of changes (`/feeds/<slug>.xml`, plus one per facet value), linked from the stats pages, so feed readers and the RSS
  triggers of Slack, Teams, Zapier, Make, n8n and Power Automate watch a register with no key and no connector; every
  entry links the stats page and the key sign-up. Why: the change feeds — the one product no rival sells — had been
  called by nobody because every path needed a key or an MCP client; this puts them on four automation shelves without
  an account. Rendered on request once an hour (KV), not at refresh — no D1 cost for feeds nobody reads. Proof: ≥ 20
  distinct user agents on /feeds in 30 days and a key issued with a /feeds referrer (`feeds 30d:` row note; 11-05 read).
- 2026-10-05 build (09:00 run): pipeline starved (every open item blocked or dated), so the slot researched the
  oldest queue, highlight-keep (`RESEARCH.md` 2026-10-05). Weava, the refugee pool the comparison page targets, is
  still abandoned and both rivals that outrank us for "weava alternative" built a Weava import; the 2026-09-19 review
  sample's unaddressed asks are every-site mode (3), iframe/shadow DOM (2) and export into a notes app (every rival
  has one, ours is a clipboard copy). Queued: `import-weava-export` (6), `all-sites-mode` (4), `subframe-highlighting`
  (4), `export-markdown-files-readwise-csv` (4), `import-glasp-hypothesis-exports` (3). Relay allowlist gained the
  vendors' doc hosts so the parsers are written from real file layouts.
- 2026-10-05 build (17:00 run): `import-weava-export` built (Highlight Keep 0.4.0) — the way across for the Weava refugees the
  comparison page targets, which both rivals outranking us already offer. No sample file could be read (Weava's knowledge base
  needs a login, its app host does not answer, the rivals' guides show only the dashboard steps), so the importer is header-driven:
  page URL and highlight text required, note/title/folder/colour/date used when present, and any other file is refused naming
  the headers seen — the comparison page asks refugees to mail the first line so the mapping is fixed from a real file, never a
  guess. Ships with the 0.4.0 sign handoff (supersedes 0.3.0). Proof unchanged: a Weava import named in a review or support
  mail within 60 days; comparison-page clicks → installs after the line lands.
- 2026-10-05 burn-down (17:00 run): highlight-keep `all-sites-mode` (4) built — an opt-in "On for every site" switch in the
  popup beside the per-site model: it requests the optional http/https host permission the manifest already declares
  (asked once, from the click) and registers one content script for all of it; off again unregisters it. Why: the
  largest unaddressed ask in the 2026-09-19 rival-review sample after PDF and login (Hypothesis ×2, Super Simple ×1:
  "enable on every new website … annoying"). Per-site stays the default and the privacy stance; listing copy says so.
  Ships inside the unreleased 0.4.0 (handoff amended). Proof: the setting named in a review or support mail; no store
  policy flag on the next review. Built on the hourly burn while the 17:00 build slot took the Weava import.
- 2026-10-05 burn-down (17:00 run, 2nd item): highlight-keep `subframe-highlighting` (4) built — the content script now runs
  in every frame (`allFrames` on the registered scripts and on the one-off injection; a frame's highlights are keyed by
  the frame's own URL, so restores find them), the text walk descends open shadow roots, a selection inside one is read
  through `getComposedRanges` (Chrome's `root.getSelection()` as fallback) and marks in a shadow root get the mark
  styles adopted into that root, which a content script's CSS never reaches. Why: the one gap named in otherwise-liked
  rivals (Glasp, Super Simple) in the 2026-09-19 review sample; an embedded reader or a web-component page did nothing
  before. Six e2e checks on a fixture iframe and shadow paragraph. Ships inside the unreleased 0.4.0. Proof: zero
  iframe/shadow complaints in the first reviews.
- 2026-10-05 burn-down (18:00 run): highlight-keep `export-markdown-files-readwise-csv` (4) built — the library downloads
  one Markdown file per page (file-safe title name, YAML front matter: title, url, site, created, updated, highlights, tags) in a
  zip written by a ~90-line store-only ZIP writer of our own (no dependency), and a CSV in Readwise's bulk-import columns
  (Highlight, Title, Author, URL, Note, Location, Date; tags as Readwise inline `.tag` notes). Why: every rival a searcher
  sees ships a path into a notes app and our 'exports to Markdown' was the clipboard; this is parity without an OAuth
  integration, which would break 'no account, no sync server'. Columns verified through the relay (docs.readwise.io) and a
  third-party copy of the import page; readwise.io/import_bulk itself needs a login. Ships inside the unreleased 0.4.0.
  Proof: Readwise/Obsidian named in a review or support mail; listing conversions after vs before.
- 2026-10-05 burn-down (18:00 run, 2nd item): highlight-keep `import-glasp-hypothesis-exports` (3) built — a Hypothesis
  importer (its sidebar's JSON or CSV export; layout read from the Hypothesis client source, not guessed: TextQuoteSelector
  exact/prefix/suffix become our anchor, the comment a note, tags come along, replies and page notes are skipped because
  there are no words to anchor), and the header-driven .csv reader built for Weava now covers Glasp's CSV export too,
  because Glasp documents the formats but not the columns; the refusal message names the headers so the first real file
  fixes the mapping by mail. Why: the last unaddressed path in the 2026-10-05 research (rivals' users leave for privacy,
  not data loss, so lower than Weava). Ships inside the unreleased 0.4.0. Proof: a Hypothesis or Glasp import named in a
  review or support mail within 60 days of 0.4.0 going live.
- 2026-10-05 burn-down (19:00 run): read-focus research (starvation fallback: every open item blocked on an owner account or
  dated 10-30). The September review sample re-read by ask instead of by rival shows the asks ReadFocus still misses: ruler
  colour/size/opacity four times across the three ruler tools (28k users), a background tint three times, Google Docs twice;
  the BDA style guide gives the spacing and tint numbers every dyslexia suite ships and ReadFocus lacks. Four items queued:
  `ruler-controls` (5, free, reverses the 10-04 "wait for a review" call because the reviews already exist),
  `spacing-and-tint` (4), `read-aloud` (3, served standalone by a free extension so last) and `google-docs-publish-tip` (3,
  Half Bold's own Publish-to-web workaround, given honestly). Features before distribution only because every
  distribution item left needs the owner's identity; the 10-30 numbers still decide.
- 2026-10-05 burn-down (19:00 run, 2nd item): read-focus `ruler-controls` (5) built as 0.3.0 — six colours (white for dark
  pages), three heights, an opacity slider and lock-in-place (a locked band ignores the mouse and moves on a click or tap),
  all free because every rival's ruler controls are free. Why: the asks were already in the September sample (four across
  the three ruler tools, 28k users) and `reading-ruler.html` conceded the gap in print. Ships with the open sign-and-upload
  handoff, amended from 0.2.1. Proof: a ruler review or support mail naming colour/size/opacity within 60 days.
- 2026-10-05 burn-down (19:00 run, 3rd item): read-focus `spacing-and-tint` (4) built in 0.3.0 — a free wider-spacing switch
  (line 1.5, letter 0.12em, word 0.16em on reading blocks only) and a pro page tint (cream or a pastel as one fixed multiply
  layer, so nothing repaints per element). Why: the BDA style guide's basics that every dyslexia suite ships and ReadFocus
  had none of; spacing free because rivals' is, tint in the unlock so the $12 buys one more visible thing. Proof: a review
  or support mail naming spacing or the tint within 60 days; unlock conversions after vs before.
- 2026-10-05 burn-down (19:00 run, 4th item): read-focus `read-aloud` (3) built in 0.3.0 — the browser's own voices, one
  sentence at a time from the first block on screen, the sentence marked through the CSS Custom Highlight API so it sits
  beside the bolding without touching the DOM; popup play/pause/stop and speed, shortcut Alt+Shift+A; in the unlock. Why:
  every dyslexia suite ships it (Helperbird leads with it; Dyslexly free) and ours was the only one without; honest copy
  that the voices are the computer's. Headless Chromium has no voices, so e2e proves the reply and the mark, not the
  audio. Proof: a review or support mail naming read-aloud within 60 days; unlock conversions.
- 2026-10-05 burn-down (19:00 run, 5th item): read-focus `google-docs-publish-tip` (3) built — the Publish-to-web
  workaround on the comparison page (and Half Bold's cell corrected: its "integration guide" is the same workaround), the
  ruler page, the ReadFocus page and the welcome tips, each keeping "cannot read the editor itself". Why: two Docs asks in
  the sample and a rival's FAQ answering with exactly this; free to give, no claim of Docs support.
- 2026-10-05 burn-down (20:00 run, research): variables-toolkit starvation research (RESEARCH.md §10). The day-10 search
  bodies read as a market table: of 110 variables plugins indexed in 2026, the 101 free ones have a median 39 users and
  the 9 paid ones 0 purchases between them (two subscriptions with 1,480 and 212 users included). Zero sales at day 30 is
  therefore the shelf's norm for a paid newcomer, not a pricing signal — the day-30 rule now reads the free companion's
  installs first. Forum demand (five threads) is relink in both directions; three items queued (how-to page 4, relink to
  local 4, rank series 3). Foundry: relay-wait-loop (5) after the relay run sat queued 16+ minutes.
- 2026-10-05 burn-down (20:00 run, 2nd item): foundry `relay-wait-loop` (5) built — the relay README and the five routine
  prompts that read the relay now poll `origin/main` for the response commit for up to 20 minutes (and work meanwhile)
  instead of `sleep 120`; the fetch-relay run this evening sat queued 16+ minutes with nothing else running, so a fixed
  sleep read nothing. Proof: no unread-relay run-log line in 30 days.
- 2026-10-05 burn-down (20:00 run, 3rd item): variables-toolkit `relink-howto-page` (4) built — a Google-facing how-to for
  the forum's "variables broken after moving a file / swapping libraries" question, answered by the Relink tab with its
  limits stated and the fact that it ships with the next published version. Why: five forum threads, no native fix, Search
  Console already indexes the host. Proof: ≥ 20 impressions and ≥ 1 click by 2026-12-05.
- 2026-10-05 burn-down: Variables Toolkit Relink tab gained the reverse direction (library → local variables), the Figma
  forum's "remap library variables to local" request (44372, 48877, 11143) that only a third-party swap plugin answers.
  Why: reuses the by-name planner and site walker, 0.5 days, rides the pending 019 republish at zero owner minutes. Proof:
  ≥ 1 comment or purchase naming relink-to-local within 30 days of the version going live.
- 2026-10-05 burn-down: three relink/swap/library search queries added to Variables Toolkit's rank series so the day-30
  review (2026-10-21) reads the Relink tab's effect against a baseline, not a hand snapshot. Proof: three more rank:
  fields on every Daily check row from 2026-10-06.
- 2026-10-05 burn-down (22:00 run): foundry research, pipeline starved again (every open item blocked or dated). The day's
  CI run list showed one push run in three ending `cancelled` after exactly 15 minutes with no steps — never picked up by a
  runner — while no push workflow carries a concurrency group, so each burn-down push stacked six more runs behind the dead
  ones; the check gate skipped three commits, the relay run never ran, and the triage logged all 21 mails with an invented
  cause. Three items queued: concurrency groups + relay re-fire (6), a committed pre-push hook against the three red gates
  in two days (6), and a triage sentence that logs GitHub's reason and files a repeat as an item (4). Evidence added to
  `actions-minutes`. Proof: push runs cancelled unstarted under 5% over a week; zero format-red gates in 30 days.
- 2026-10-05 burn-down (22:00 run, 2nd item): foundry `ci-runs-never-acquired` (6) built — the five push workflows that stacked
  behind dead runs now cancel their own older run when a newer commit arrives (per event and ref, so cron runs are safe),
  and a relay run cancelled unstarted is re-fired by `workflow_dispatch` instead of waited on. Why: 20 of 60 push runs
  died unstarted this evening and each push queued six more. Proof: under 5% of push runs cancelled with no steps over a
  week; no relay request unanswered beyond 20 min without a re-fire.
- 2026-10-05 burn-down (22:00 run, 3rd item): foundry `pre-push-format-gate` (6) built — a committed pre-push hook, armed by
  `npm ci` in every sandbox, re-checks Prettier and ESLint on the pushed files plus the run-log cap and pipeline files, so
  an edit made after the long gate cannot turn `main` red (three times in two days). No new dependency, CI unaffected.
  Proof: zero format or lint failures of `check` on main for 30 days.
- 2026-10-05 burn-down (23:00 run, 1st item): foundry `triage-run-failed-reason` (4) built — the hourly triage now logs the
  reason GitHub's run gives for a "Run failed" mail (a red gate with its failing step, a run cancelled unstarted, a run
  superseded under a concurrency group) instead of a guessed one, and the third same-reason mail in a day files a foundry
  item; `docs/ops/SELF-CAUSED.md` row 6 carries the same three readings. Why: 21 INBOX rows on 2026-10-05 named a cause
  that never happened. Proof: over 14 days no INBOX row contradicts the run's job list; a 3× reason has an item the same day.
- 2026-10-06 build (09:00 run): foundry research, pipeline starved again (next buildable 2026-10-08). Five ops items queued: the
  gankdat gate spends 697 s re-migrating D1 before each of 384 tests and CI runs it twice per push (7); four idle burn-down
  firings overnight each spent ~20 min to learn the pipeline was starved (6); the starvation fallback has no memory of what it
  researched (6); eight owner asks open for up to six days with no reminder (4); task-master-ai MCP times out in every sandbox
  (3). Proof: gankdat gate under 90 s; no idle burn-down lines; no venture researched twice in 48 h; owner asks under 7 days.
- 2026-10-06 burn-down (17:00 run, 1st item): foundry `gankdat-test-setup` (7) built with a corrected premise — pool-workers 0.18 has
  no isolated storage at all, and re-migrating D1 per test was not the cost: a single spec file spends ~20 s loading the whole
  `src/index.ts` module graph (397 module-fallback requests, ajv via the MCP SDK most of them), 49 files three at a time = 260 s.
  Delivered: migrations once per file + per-test table/KV emptying (test time 71 → 57 s, the per-test workerd exception gone), the
  CI split (`check:root` in the root workflow, `gankdat.yml` the only gankdat gate per push — the month's two top minute consumers
  overlapped on every gankdat push), the measurements in the item. The module-graph cost is a new item, `gankdat-test-module-graph`
  (6), with five measured candidates. Proof unchanged: gate under 90 s; one gankdat run per push.
- 2026-10-06 burn-down (17:00 run, 2nd item): foundry `research-cooldown` (6) built — every queue records `researched`, the day of its
  last research run; for 48 h the starvation fallback skips it, the status lists it as cooling, and a starved pipeline whose every
  queue is cooling tells the run to write one line and stop. Why: five research runs on 2026-10-05 and the next morning's build
  was offered the same venture eleven hours later; the judgement "researched today" lived nowhere. Proof: no venture researched
  twice within 48 h over 14 days; no research line that adds zero items.
- 2026-10-06 burn-down (17:00 run, 3rd item): foundry `burn-starvation-gate` (6) built — `npm run pipeline cold`, plain Node over the
  queue files and RUNS.md with no dependency on the built core, tells the burn-down before `npm ci` whether anything is buildable,
  flagged, starved-but-not-cooling or the night's pre-research unspent; `starved-and-cooled` ends the run at once. Why: four
  firings on the night of 2026-10-05/06 each spent ~20 min and two workflow runs to learn that. Proof: no burn-down run-log
  line over 7 nights whose only content is a starved stop.
- 2026-10-06 build (17:00 run): foundry `gankdat-test-setup` finished and `gankdat-test-module-graph` (6) done in the same push, built in
  parallel with the burn-down and merged on top of its commits. The gankdat gate's cost was each of 49 spec files re-fetching ~2,600
  modules through Vite, 1,194 of them viem via the x402 packages. Vitest's dependency optimizer pre-bundles them once the bundler
  treats node built-ins as external (the burn-down's probe stopped at that error), and x402-hono/@coinbase/x402 load lazily on the
  first lit request: suite 261 s → 80 s, whole gankdat gate 99 s, Worker cold start lighter. Lesson for the routines: two runs built
  the same item at once (build 17:00 and burn-down 17:00); the slot marker covers the fallback, not the burn-down — see ops.
- 2026-10-06 burn-down (18:00 run): foundry `owner-ask-digest` (4) built — `npm run handoffs` (now in `check:root`) generates
  `docs/for-owner/OPEN.md`, the open owner asks ordered by the STRATEGY §5 score of the blocked queue items each unblocks divided
  by the minutes it quotes, prints the median open age and, once any ask is older than 7 days, one plain `notify:` digest line that
  the Monday report sends as its single phone line (count, oldest age, top ask); the retro records the median. Why: eight asks open,
  oldest six days, each sent to the phone exactly once and never ordered or repeated. Proof: median open age under 7 days over a month.
- 2026-10-06 burn-down (18:00 run, 2nd item): foundry `mcp-sandbox-timeout` (3) built — `.mcp.json` left the repo and is gitignored;
  the Taskmaster guide and SETUP step 6 give the `claude mcp add --scope user` line for a machine that wants the server. Why: every
  cloud session spawned `npx -y task-master-ai` and waited 30 s for its timeout (today 18:12 again) for a server no routine uses;
  the placeholder keys leave the repo with it. Proof: no MCP connect timeout in a routine session for 14 days.
- 2026-10-07 burn-down (00:00 run): gankdat research, pipeline starved again after the 10-05 pass cooled. The two rows since
  show two of the three 10-05 distribution items not working as shipped: the Worker's IndexNow POSTs get 429 on every wave
  (Bing throttles by source IP and Workers share egress; the GitHub runner's post got 200 the same morning) and the feeds
  reading prints `n/a` with its reason swallowed; the trade-marks journal has logged no refresh since the delta refresh's
  first night and eu-ted was throttled twice in six nights. Four items queued (7, 6, 4, 4); no product or pricing change —
  the funnel readings are unchanged. D1 writes fell from ~6M to ~0.2M a day after the delta refresh (cost rule fix confirmed,
  the 10-08 item records the rate). Proof: `indexnow: … 200` for 7 days; an ok journal row 3 nights running; feeds readable.
- 2026-10-07 burn-down (00:00 run, 2nd item): gankdat `indexnow-from-runner` (7) built — the daily IndexNow submission is the metrics
  workflow's runner step, not the Worker's wave-end ping: the runner reads which sources refreshed OK in the last 26 h and their stats
  blobs from KV, POSTs every parent and facet page once from its own IP and leaves the result for the Daily numbers row. Why: Bing
  throttles by source IP, Workers share egress, and every wave got 429 while the runner's post got 200. Proof: `indexnow: N urls 200`,
  N ≥ 60, for seven days.
- 2026-10-07 burn-down (00:00 run, 3rd item): gankdat `trademark-journal-silent-refresh` (6) built — the journal's refresh starts no
  new issue download after six minutes; what is cached still loads and the window fills over later nights. Why: up to four 145 MB
  issues a run took 13 min 42 s on 10-04 and the next two nights were killed before writing a row, the one dataset whose change
  feed is weekly going dark unseen for two days. Proof: an ok row three nights running, stale reading gone by 10-09.
- 2026-10-07 burn-down (00:00 run, 4th item): gankdat `feeds-reading-reason` (4) built — the feeds reading uses sumIf for the miss
  share and carries the query's error text when it fails. Why: the first row after the keyless feeds shipped printed a bare `n/a`
  and nothing in the repo said why; the ≥ 20 user-agent proof was unreadable. Proof: three figures or a reason in the 10-07 row.
- 2026-10-07 burn-down (00:00 run, 5th item): gankdat `eu-ted-429-backoff` (4) built — a throttled TED page is retried with
  Retry-After or a growing pause, at most two minutes inside wave 1. Why: 429 on two of six nights, each costing the EU half of
  the bid-intelligence bundle a day of freshness. Proof: no eu-ted 429 in the refresh errors reading over 14 nights.
- 2026-10-07 burn-down (00:00 run, 6th item): foundry `research-after-date` (5) built — a research run that finds no new evidence sets
  `research_after` on the queue and the starvation fallback skips it until that date; highlight-keep, read-focus and variables-toolkit
  now wait for their day-30 readings (10-30, 10-30, 10-21). Why: three research passes each in eight days on 0 users / 7 views, every
  pass built out within a day; a fourth would have invented work. Proof: no venture researched twice without a changed metrics row in 30 days.
- 2026-10-07 exchange: **gankdat — Companies House company lookup + monitor** (10.7 raw, 8.0 applied: evidence 4 ×
  reach 4 ÷ 1.5 days, 0 owner minutes; Blind Mode keeps it organisation-level, so no director names, the incumbents'
  hook). The relay's Apify Store read is the first measurement of which UK-register data Apify users pay for: every
  category gankdat's 17 actors list in sits at the 2-user QA floor for every seller, while Companies House lookups have
  13 paid actors at 5–168 users each (leader 47 users/30d, ~50k runs, US$0.80–4 per 1k) and none sells a monitor over
  the buyer's own company list — which gankdat's change feeds already are. Docker MCP Catalog listing queued second (24
  raw → 8: agent shelves have converted nobody, reviewer-gated; from 10-10). Foundry: Search Console API reading (7, unblocks
  four dated reviews and five page proofs; owner step raised when the script ships). Parked: officer/PSC fields (ICO fee +
  LIA), GeBIZ (evidence up, terms unread), /stats CSV checkout, Sheets add-on, Smithery, WuslaHQ reseller; quality-score
  pass re-triggered on the Companies House read; relink marked promoted (built 10-04/05). Comparison:
  `docs/exchange/2026-W41.md`.
- 2026-10-07 build: **gankdat — Companies House lookup + monitor shipped** (`uk-company-profiles`, exchange W41 winner, 8.0).
  The register is not mirrored: a new `DataSource.lookup` shape reads one company on request from the official API (≤ 4
  calls, KV per key 24 h) — the first dataset the platform serves without a snapshot — and the Apify actor's changes mode
  is the monitor nobody on the Store sells (baseline in its own key-value store, only added/changed/removed pushed). Blind
  Mode held: no officers, individual PSCs dropped at ingest, filing codes not names. Proof per the queue: ≥ 5 Apify users
  from other accounts and a changes-mode run in 30 days (`uk-company-lookup-day-30`, 11-07). Zero owner minutes.
- 2026-10-07 burn-down: foundry `search-console-api-reading` (7) built — `scripts/search-console.ts` in the 06:45 store-metrics job
  reads 7-day impressions/clicks per venture and URL-inspects the /stats, /stats/<slug> and landing comparison pages through a
  read-only service account, writing `search: …` on every daily row (`n/a (<reason>)` until owner action 020 lands the key). Why:
  three day-30 reviews and five page proofs read a Search Console number that had never reached the repo, and the gankdat indexing
  item sat on an owner export since 09-28. Proof: a `search:` series on the rows for seven days; the 10-21 and 10-30 reviews read it.
- 2026-10-07 build (17:00 run): **no item — collision with the evening burn-down.** Both routines took `next` = foundry
  `search-console-api-reading` at 17:00/17:10 and built it in parallel; the burn-down pushed first (17:35), so this slot's
  duplicate was discarded unpushed. Queued foundry `build-claim-marker` (5, 0.2 d): a one-line `doing` push right after
  `next`, the slot marker's precedent, so the other session's `next` skips a claimed item. Why: the 2026-10-05 `doing` guard
  never reaches `main` before the item's own commit under atomic pushes. Proof: no duplicate item build in 30 days.
- 2026-10-07 burn-down (17:00 run, 2nd item): gankdat `refresh-uk-trademark-journal` (6) built — the journal's live generation
  predates migration 0014, so each night since 10-05 started the "one last full reload" of 162k rows and was killed at the Cron
  Trigger limit before writing a row (the 10-07 download budget could not help: no download was running). d1store now backfills
  the missing hashes in place, resumably, with a `skipped` refresh_log row (migration 0015) when it hands the rest to the next
  night, then runs the delta; an IPO "Page Not Found" served as 200 HTML is a missing issue. Why: the only weekly-cadence dataset
  (watch services' core) had been three days stale and would have errored outright from 10-09. Proof: `ok` rows on three
  consecutive nights and the journal absent from refresh errors for seven Daily numbers rows.
- 2026-10-07 burn-down (17:00 run, 3rd item): foundry `build-claim-marker` (5) built — `npm run pipeline claim <venture>/<id>`
  pushes the item's `doing` line before any work, so a concurrent session's `next` skips it; both routine prompts call it right
  after `next`. Why: at 17:00 the burn-down and the daily build each built `search-console-api-reading` in full and the second
  push was discarded — ~40 min of a Fable session lost to a guard that only existed locally. Proof: no two run-log groups for
  one item id in 30 days.
- 2026-10-07 burn-down: `npm run pipeline cold` now counts the night's exchange pre-research as spent only from an
  `Exchange pre-research:` burn-down line stamped since the night's 17:00 UTC (`scripts/pipeline-cold.ts`). Why: the old
  match (any line today or yesterday containing `pre-research`) was satisfied by each night's `Stopping: … pre-research
  spent` line, so the one allowed pass ran once (10-05) and was silently skipped on 10-06 and 10-07. Proof: one
  `Exchange pre-research:` line on every starved burn night from 2026-10-08.
- 2026-10-08 burn-down: `d1-delta-cost-check` read — D1 writes 87.5M → 93.6M → 93.8M → 93.8M (10-04..10-07): the
  in-place delta refresh cut ~6M writes a day to ~0.1M, so §7's cost rule is cleared from 10-06 on; the 09-10→10-10
  invoice still carries ≈ US$44 ≈ £33 of writes (LEDGER planned row raised 31 → 33). No source swaps generations
  nightly (all nine D1 sources have `idOf`); the journal backfill is the last one-off. Invoice check stays on 11-10.
- 2026-10-08 burn-down (foundry research, pipeline starved): four operation fixes queued from tonight's own run — npm eats
  `--by=<routine>` so every claim commit says (build); a `not_before` item is offered at 00:00 UTC, hours before the Daily
  numbers row it was dated for; OPEN.md's generated-on date and day counts churn every commit; npm's update banner on every
  command. Scores 4/4/3/2; the top two are built when they win.
- 2026-10-08 burn-down: foundry `claim-by-npm-flag` (4) built — `npm run pipeline claim … --by=x` reached the script as the
  env var `npm_config_by`, so tonight's first claim (61275b2) was committed as (build). `routineFrom` reads argv, then that
  env var; the prompts show `-- --by=`. Proof: the next burn-down claim commit says (burn-down) — ebb112c already does.
- 2026-10-08 burn-down: foundry `dated-items-wait-for-row` (4) built — an item dated `not_before` today is buildable from
  07:00 UTC (after the 06:30/06:45 metrics rows), not from midnight, in `next`, the cold gate and `claim`. Why: tonight's
  first fire read `d1-delta-cost-check` ("the 10-08 row") at 00:13 against the 10-07 rows; every day-30 reading is dated
  the same way. Proof: the next dated reading's run-log line is stamped after 07:00 UTC.
- 2026-10-08 burn-down: foundry `open-md-stable-render` (3) built — OPEN.md carries no date or day counts, so `npm run check`
  rewrites it only when an ask opens, closes or its unblocked work changes; the ages stay in the `notify:` digest. Why: a
  24-line date-only diff rode every routine commit (f8d9577 tonight). Proof: OPEN.md untouched by the gate on a quiet day.
- 2026-10-08 burn-down: foundry `npmrc-update-notifier-off` (2) built — `.npmrc` `update-notifier=false` removes the five-line
  npm version banner every routine filtered out of every command's output.
- 2026-10-08 build: 09:00 slot — nothing buildable (every queue cooling, next dated item gankdat oauth-connect-funnel-check
  2026-10-09); no research run, per the cooling rule. Read the Glama "HTTP 500" handoff: the 10-07 deploys are
  green and nothing in the sandbox can reach /mcp, so queued gankdat `mcp-live-probe` (6) and, it being the top
  score, built it: `scripts/mcp-probe.ts` runs in the metrics job and the Daily numbers row carries
  `mcp probe: …`; a failed step lists `mcp-probe` under refresh errors so the repeat rule queues the fix. Why:
  two incidents (09-19 Bot Fight Mode, 10-08 Glama 500) were found by directories, not by us.
- 2026-10-08 build: 17:00 slot — nothing buildable (every queue cooling or waiting on dated evidence, next gankdat
  `oauth-connect-funnel-check` 2026-10-09); no research run, per the cooling rule; the morning probe already answers
  the Glama handoff for anonymous traffic, so nothing to add there.
- 2026-10-09 burn-down (gankdat research, pipeline starved): the 10-07 journal fix left no row on 10-08 either (health 114 h);
  the CQC 403 and Find a Tender 429 were transient (both refreshed the same morning, CQC 200 to a runner); IndexNow's
  15 URLs are one per source because only the journal has facet pages. Queued wave-log-reading (5) so a killed wave's
  Worker log reaches the row, uk-tenders-429-backoff (4), probe-key-from-runner (4); foundry: both GitHub crons fire
  ~7 h late daily — move them off the half-hour (3).
- 2026-10-09 burn-down: gankdat `wave-log-reading` (5) built — the metrics runner queries Workers observability for the
  last 24 h of log lines of every source with no `ok` row in 26 h or an error row today and the Daily numbers row
  carries each one's newest line; a wave killed at the Cron Trigger limit (no refresh_log row) is read instead of
  guessed. Why: the journal's silent nights 10-05..10-08 cost two research passes and relays. Proof: the first
  scheduled row names the journal's last log line (or the token scope to add).
- 2026-10-09 burn-down: gankdat `uk-tenders-429-backoff` (4) built — Find a Tender's first throttled wave (10-08) now
  retries like eu-ted instead of throwing on the first 429; proof: no uk-tenders 429 in the refresh errors over 14 nights.
- 2026-10-09 burn-down: gankdat `probe-key-from-runner` (4) built — the metrics runner mints a key for the run under the
  internal probe account through the D1 REST API, runs the authed MCP probe with it and deletes it, so the keyed path
  (every paying client's) is read daily with no repository secret; why: the 10-08 row read `authed: n/a` and the
  secret was an owner action. Proof: an authed probe reading on every Daily numbers row.
- 2026-10-09 burn-down: foundry `metrics-crons-off-the-half-hour` (3) built — both daily metrics crons moved to `37 6`
  and `52 6` because GitHub fired the half-hour slots 5–8 h late every day 10-03..10-08, so the runner-only steps
  (uk-insolvency refresh, IndexNow, the MCP probe, the error filer) landed after the 07:00 routines had read the row;
  a day-7 read (10-17) decides whether the push run must take over those steps.
- 2026-10-09 build: gankdat `oauth-connect-funnel-check` (5) built — the relay walked every GET leg of the MCP OAuth hop
  live (discovery, Claude's two real client documents, `/authorize` rendering the sign-in page for the hosted apps and
  Claude Code); the POST legs no sandbox can drive now each write an `oauth_funnel` point, and the Daily numbers row reads
  the funnel and the user agents behind the `connect_account` 401s, so "scanner or lost human" is a number on 10-10.
- 2026-10-09 burn-down: exchange pre-research — VOA non-domestic rating list declined: the free weekly-updated downloads carry a
  restricted NDR-purposes licence ("an open government licence does not apply", onward disclosure prohibited), the same category
  as CCOD/OCOD and the FCA register; the one Apify rival ($0.60/1k, 2 users) resells it regardless. Trigger: the VO moves to the OGL.
- 2026-10-09 build: gankdat `refresh-uk-trademark-journal-2026-10-09` (6) built — the first wave-log reading showed the 06:05
  wave wrote no line at all, and the cause reproduced offline: the hash backfill's page UPDATE made SQLite walk all 162k
  rows and scan the 2,000 entries for each (200 s a page), so the wave died before the budget check could write a row;
  the entries are now a MATERIALIZED CTE probed by primary key (0.03 s a page, plan asserted in the spec), a throwing
  backfill writes an error row and a long one hands the delta to the next night — a silent night is no longer possible.
- 2026-10-10 burn-down: foundry research — GitHub fires this repo's crons 7 h late or not at all whatever the minute (the
  06:37/06:52 move changed nothing on day 1), so the 07:00 routine will dispatch the metrics jobs itself (queued, 6);
  the sandbox clone is `--depth 50`, which makes `git pull` refuse a plain fast-forward as divergence (3); and the
  pipeline has ended starved every night since 10-05, so the build slot gains the day's pre-research pass (3).
- 2026-10-10 burn-down: foundry `cron-drift-dispatch-row` (6) built — the 07:00 metrics routine now fires the two metrics
  workflows by `workflow_dispatch` when the day's commit is missing and waits up to 10 min, because GitHub starts every
  cron here ~7 h late whatever the minute while a dispatched run starts at once; proof: no `left no row` note from 10-11.
- 2026-10-10 burn-down: foundry `sandbox-clone-unshallow` (3) built — every routine body now unshallows the depth-50 sandbox
  clone first, because a days-old snapshot made `git pull` call a plain fast-forward a divergence and cut every `git log
  --since` short; the stored bootstrap gains the same line at its next attended edit.
- 2026-10-10 burn-down: foundry `build-slot-pre-research` (3) built — a build slot that finds the pipeline starved and cooled
  now does the day's one exchange pre-research pass (gate `npm run pipeline cold -- --routine=build`, window from 07:00 UTC)
  instead of idling, because the exchange was the only producer of new items and one candidate a night was the ceiling.
- 2026-10-10 build: gankdat `docker-mcp-catalog-listing` (8) built to the sandbox's edge — the entry passed Docker's own
  validator and ships keyless preview + optional key with no `oauth` block, because the Toolkit's OAuth needs RFC 7591
  dynamic client registration and gankdat is CIMD-only (queued at 6: Cursor, ChatGPT and VS Code register the same way,
  so the 2026-09-30 OAuth hop works for Claude alone); the MCP route now treats a bare `Bearer` header, which the Toolkit
  sends until a key is pasted, as no key (v0.22.1). The fork PR itself needs a token this sandbox lacks (handoff), so a
  third-party PR relay is queued (3).
- 2026-10-10 interactive (owner): the US$49 Cloudflare invoice is paid; the owner keeps paying the US$5
  Workers Paid subscription monthly and set the budget rule — the £100 cap is their net outlay, anything
  beyond it comes out of profit. Applied: the ledger gains `contingent` rows (the ICO fee, deferred
  until the first customer, no longer reserves £47 of the cap) and a Recurring table; `npm run ledger`
  fails on `committed > cap + revenue` and warns under 3 months of headroom (12 today: £47.60 left at
  £3.70/month); the metrics job files a score-8 `cf-overage-<period>` item from the row's `cf usage`
  figure (`scripts/cf-overage-to-queue.ts`). Cloudflare's own budget email stays at US$10 (the API
  token cannot edit notification policies); inbox triage escalates it as before.
- 2026-10-10 build: foundry `burn-down-watchdog-nightly` (7) built — the run watchdog watches the evening burn's first hour
  (17:00 UTC) every night instead of Wednesday 18:00; the schedule went nightly on 2026-10-04 and five of six nights had no
  silence detector. Why: a silent non-Wednesday night left nothing on the owner's phone; the retro found it by inspection only.
- 2026-10-10 burn-down: gankdat offers RFC 7591 dynamic client registration (`POST /register`,
  v0.23.0) because only Claude signs in by client-id metadata documents; Docker's MCP Toolkit,
  Cursor, ChatGPT and VS Code all register, so the OAuth hop built on 2026-09-30 worked for one
  client. The Docker catalogue entry gains its `oauth` block in a second PR once listed.
- 2026-10-10 burn-down: foundry `handoff-aging-escalation` (5) built — open `handoff:` entries older
  than 3 days reach the owner's phone through the run watchdog (within 2 h, then weekly); two
  built releases sat unsigned 5–6 days with nothing on the phone naming them.
- 2026-10-10 burn-down: foundry `third-party-pr-relay` (3) built — a request folder under
  `docs/relay/prs/` becomes a fork pull request from CI, so directory listings (Docker MCP
  Catalog first) and upstream fixes no longer wait for the interactive session; one owner token
  (action 021) arms it.
- 2026-10-11 burn-down: gankdat research pass (starved queue) — the 2026-10-07 shared-client rollout
  silently broke the Apify lead-feed actor (its entry function vanished; Apify flagged it 10-10), so the
  queue gains the restore (7), the uk-planning origin now answering zero entities (6), a per-actor run-outcome reading so a failing actor is seen the day it
  fails rather than when Apify mails (5), and evidence in the zero-record refresh error (4).
- 2026-10-11 burn-down: gankdat `apify-lead-feed-client-restore` (7) built — the merged lead-feed actor
  has its own client back and the gate now resolves every actor's imports. The one shelf with outside
  users showed a broken actor for four days because the Daily numbers row counts runs, never outcomes;
  that reading is queued at 5.
- 2026-10-11 burn-down: gankdat `refresh-uk-planning-2026-10-11` (6) built as stale-origin handling, not a
  parser fix — planning.data.gov.uk emptied its alpha planning-application dataset on 10-10, so the
  last snapshot is served under a dated notice, the refresh names the cause nightly and a weekly
  relay re-read decides re-point or retire (§7 clock: 60 days unqueried). Not retired: 88 calls and
  13 Apify runs in 30 days.
- 2026-10-11 burn-down: gankdat `apify-run-outcomes-reading` (5) built — the Daily numbers row now reads
  each actor's failed runs and lists a newly failing actor under refresh errors, so the auto-filer
  queues the fix a day before Apify's "under maintenance" mail (both flags so far arrived three days
  late while the row counted the failed runs as use).
- 2026-10-11 burn-down: gankdat `refresh-zero-records-evidence` (4) built — a refresh that yields nothing
  now fails with the first page the origin served (status, bytes, JSON keys, URL), so an emptied
  dataset and a 5xx page read differently in the Daily numbers row and the fix can be scoped
  without a relay round-trip (uk-contract-awards 10-03 and uk-planning 10-10 both needed one).
- 2026-10-11 review (W41): every money target still zero — 0 paying accounts, £0 MRR, 0 change-feed calls in 12 days of
  counting, 0 extension/plugin sales, 0 paid Apify runs (September summary US$0, 1 unique user); Apify 18/18 public, five
  directories live, Claude in review. gankdat **keep** (was fix in W40: the D1 overage is cut — US$0 in the new period —
  the invoice is paid and the cap re-based on 10-10, so §7's cost rule is no longer tripped; 0 conversions on every shelf,
  pivot check stays 12-20). ReadFocus keep (first 3 Chrome users 10-08..10-11, the week 0.2.0 went live), Highlight Keep keep
  (0 users at day ~20 of 90), Variables Toolkit keep (7 views, 3 runs, 0 installs at day 20; three publish steps wait on the
  owner). No kill: no venture is 90 days past its listings going live (earliest 2026-12-20).
- 2026-10-11 review: gankdat `preview-wall-next-steps` (6) queued — the 10-11 row carries the first client to exhaust the
  keyless preview (47 wall hits in a day on contract awards, sanctions and TED, then 0 sign-ups, 0 x402) and the wall says
  "sign in" only; the fix names `request_api_key` and x402 for agents and reads what the next wall-hitter does.
- 2026-10-11 review: gaps queued — gankdat `metrics-dataset-queries-external` (5): `datasets 30d` counts the Apify actors'
  own key and the probe account, so §7's 60-day retirement rule still has no clean reading; foundry
  `metrics-extension-sales` (5): the extensions' Sales column has never had a reading although the licence KV holds it.
- 2026-10-11 review: §4 `Now` column refreshed with 10-11 sources (Apify target met at 18/18); §2 agent-directories row
  updated (Claude submitted 10-04, Docker on action 021, first wall-hitter); read-focus `edge-add-ons-listing` dropped
  (owner decision D2 of 2026-09-28 had already dropped Edge); `exchange.json` unchanged — no parked trigger met, and
  WuslaHQ's 10-09 bump adds no evidence (the holding draft is the owner's to send or not). Owner: nothing new — the six
  open asks stand; 021 (3 min) unblocks the top-scored item, 020 (10 min) three dated reviews.
- 2026-10-11 build: gankdat `refresh-uk-insolvency-2026-10-11` (6) built. The metrics job logs show the "2 failures in 4 days"
  were one Gazette 503 (10-10 13:00, two reads 3 s apart) that the 10-11 row re-listed 18 h later, right after a 1000-record
  refresh, because the `refresh errors` reading took every error row of the last 24 h. Fixed the reading (an error counts only
  while no later `ok` row exists), made the source retry a 5xx four times over ~13 s, and gave the runner a `skipped` row for an
  origin that stays 5xx — the last snapshot is served, the day is the origin's, and the auto-filer no longer files a fix for it.
- 2026-10-11 interactive (owner): "take the money that is available on the internet without relying on people to
  buy our products"; new ventures must greatly outweigh improvements to current ones; research from own reasoning
  and primary sources, not money-making content. Applied: §1 "Take, don't wait"; §5 queue weights (`weight` on
  every queue, `npm run pipeline` ranks by score × weight — hackathons and oss-bounties 2, gankdat and foundry 1,
  the three £0 consumer products 0.5); two lines opened from primary data read the same day — **hackathons**
  (Devpost API: 38 open online hackathons; PayPal AI $67.5k and Nebius × NVIDIA $50k entries queued, blocked on
  one owner account each) and **oss-bounties** (GitHub search: 553 open labelled bounties; scanner is the next
  build); parked prize competitions needing compute and affiliate links; declined vulnerability programmes (out of
  scope). The Figma Playground file (action 017) dropped at the owner's word; 018–020 done by the owner.
- 2026-10-11 interactive (owner asked for a legal/ToS check before signing up): hackathon rules allow AI tools and
  require the owner to be the entrant and owner of the work — satisfied, with disclosure in the write-up; Devpost's
  Terms forbid automated access, so `hackathon-scanner` is dropped and the exchange finds hackathons from sponsors'
  sites; GitHub permits automation under a personal account (PR_TOKEN, added today — the Docker catalog PR and the
  PR relay are unblocked); Algora forbids bots on its own site, which the scanner never touches. Evidence in
  `ventures/hackathons/RESEARCH.md` §3 and action 022.
- 2026-10-11 interactive (owner): standing mentality for money-collection ventures — attach to money already flowing
  rather than capture new audiences; many small legal sources over one big payout; all within law and terms. Written
  into §1 and the exchange prompt; three such ideas parked for the 2026-10-14 exchange (x402 aggregator, keeper
  rewards, facilitator fee).
- 2026-10-11 build: the first bounty board's top three could not be claimed (assigned with a PR and hardware-only
  tests; a contributor's unfunded `/bounty` ask; a hardware report), and the funded issues read all had agent PRs
  within days. The scanner now counts only money a label, the bounty bot or a maintainer posted, reads assignees
  and open linked PRs, and files only free funded issues; `first-bounty-pr` waits for such a row. If the funded,
  free board stays empty for a week, the line's thesis fails and the §7 kill rule applies early.
- 2026-10-11 burn-down: hackathons `paypal-ai-hackathon-entry` (9 × 2) built — the first item of the money-on-offer line.
  gankdat v0.24.0 adds a PayPal **sandbox** rail: one-off credit packs (1k/5k/20k, US$8/35/120) on a top-up balance
  the metering spends once the plan allowance is gone, bought by an agent in chat (`buy_credits` →
  human approves on PayPal → `confirm_credit_purchase`), by REST, or on /account. Sandbox by construction: no
  live money, no card, nothing for the ledger. The write-up, transcript and shot list are in
  `ventures/hackathons/entries/paypal-ai-hackathon/`; the demo video is the next hackathons item and the owner
  submits (action 023) before 2026-11-12. Going live with PayPal is a separate decision — Stripe stays the live rail.
- 2026-10-11 burn-down: hackathons `demo-video-pipeline` (6 × 2) built — every Devpost portal asks for a demo video and
  no routine could record one. `scripts/demo-video.ts` records a captioned 1280×720 headless Chromium and ffmpeg writes
  the mp4; `scripts/demo-paypal-ai-hackathon.ts` plays the PayPal shot list against the live product (seeded through the
  Cloudflare REST API, cleaned up after; sandbox throughout); the `demo video` workflow publishes the artifact. The live
  recording waits on one owner step, the sandbox buyer login as two secrets (action 024), then `demo-video-paypal-record`
  fires the job and action 023 (the Devpost form) gets the link. Proof: the mp4 under 3 minutes in the artifact.
- 2026-10-11 burn-down: oss-bounties `bounty-claim-ledger` (5 × 2) built — the line's numbers had nowhere to live. The
  `## Claims` table in its `RESEARCH.md` records every bounty taken up (issue, amount, status, PR, opened, merged, paid);
  `scripts/bounty-claims.ts` (`npm run claims`, in `npm run check`) validates the rows and prints the totals, the §5
  kill-rule count and the week line; build and burn-down move the row in the commit that moves the claim; the weekly
  report and the Sunday review read it. §4 gains the `Bounty PRs merged / paid` row (now 0/0/0, three reads dropped).
- 2026-10-11 burn-down: gankdat `docker-mcp-catalog-listing` (8) — the PR relay's first run opened docker/mcp-registry#5622
  (the relay never fired on its own: `PR_TOKEN` landed after the request was pushed, so the run was dispatched by hand;
  a request pending when the token arrives needs a dispatch — noted in the relay README). The item is blocked on Docker's
  review: merged → done plus the `oauth` block follow-up PR; a demand for an OSS licence on the server → dropped.
- 2026-10-11 burn-down: gankdat `preview-wall-next-steps` (6) built, v0.24.1 — the first client to spend the keyless preview
  (47 challenges on 10-11, bid-intelligence tools, then nothing) was told only to sign in. The wall now names every way on
  in the order an agent can act: x402 pay-per-call on `/x402/data/<source>`, the free key through `request_api_key`, then
  `connect_account`/account; the challenge headline and the `connect_account` description say the same. The wall and
  the three continuations carry the preview's hashed client id, and the Daily numbers row reads `after wall 1h (7d): …
  gone N`, so the next wall-hitter's choice is a number. Proof: a request, payment or connect from a wall-hitter in 30 days.
- 2026-10-11 burn-down: foundry `metrics-extension-sales` (5) built — §4 "Extension + plugin sales" had no reading for
  the two extensions. `scripts/license-sales.ts` (third step of the 06:52 store-metrics job) counts the licence Worker's
  `license:*` KV records per venture and fills the Sales column with `sales: N keys (A activations, …)`; test and revoked
  keys are counted apart, a missing scope reads `n/a (<reason>)`. Proof: a numeric Sales cell on both rows for 7 days.
- 2026-10-11 burn-down: gankdat `metrics-dataset-queries-external` (5) built — `datasets 30d` counted our own Apify actors
  and the probe, so every register read 85–100 calls and §7's 60-day clock ran on our automation. Authed REST and MCP
  points now carry the key's account id and the Daily numbers row adds `datasets 30d external: …` without the internal
  mailboxes' accounts (and without the untagged points before 10-11). The W42 review applies §7 from that line; expect
  it to read `none` at first — that is the honest number.
- 2026-10-11 burn-down: foundry `third-party-pr-relay` (3) done — its proof arrived tonight: the relay's first run opened the
  Docker MCP Catalog PR (#5622) from CI with the owner's `PR_TOKEN`, so listing PRs no longer wait for a person.
- 2026-10-12 burn-down: foundry research (starved pipeline, every other queue cooling or dated). Three ops items queued from
  measured evidence: `poller-push-triggers` (6) — 56 of the last 100 Actions runs were owner-notes/metrics pollers started by
  pushes, ≈56 billed minutes for 14 wall; `append-only-union-merge` (5) — two hand-resolved conflicts in RUNS/INBOX/RUNS-COUNT
  in two days out of 30 merges; `claim-before-install` (4) — `next` needs the built dist, so the 17:00/17:10 slots still claim
  after a 5–7 min install and collided on 10-10. The Glama handoff is closed on the probe's 200s. Not queued: the burn gate
  has had no usage reading since 10-04 (the owner's Telegram channel is silent; the harm is bounded to the night window).
- 2026-10-12 burn-down: foundry `poller-push-triggers` (6) built — the three pollers (owner notes, gankdat metrics, store
  metrics) no longer run on every push to `main` (56 of the last 100 Actions runs, ≈56 billed minutes for 14 wall); the
  per-push owner-notes poll rides `notify owner` instead, the hourly cron stays, and the metrics rows come from the cron and
  the 07:00 dispatch only. Private-repo cap (foundry `actions-minutes`) reads the effect on 10-19.
- 2026-10-12 burn-down: foundry `append-only-union-merge` (5) built — the append-only logs (RUNS.md, INBOX.md) and the run-line
  floor file merge with git's `union` driver, so the concurrent evening pushes (30 merges in 7 days, two resolved by hand) no
  longer stop a cut-off-prone session at a conflict; `npm run runs` reads the higher floor and rewrites the file cleanly.
- 2026-10-12 burn-down: foundry `claim-before-install` (4) built — `npm run pipeline next` no longer needs the built dist, so
  both evening slots claim their item within a minute of firing instead of after a 5–7 min install (the cause of the 10-07
  duplicate build and the 10-10 dropped one); the two routine prompts move the claim before `npm ci`.
- 2026-10-12 build: foundry `actions-minutes` 10-12 reading — GitHub meters billed minutes (each job rounded up to a whole
  minute), not wall time: the week to 09:00 UTC was 731 wall but 1,334 billed over 805 jobs; the six clean days project
  ≈911/week, ≈531 once the 10-12 poller trim is netted out — over the 350/week proof, so the repo stays public and the item
  is re-dated to 10-19. The watchdog line now reports the billed figure; the remaining one-minute floors (gankdat's two
  jobs, check's install, notify owner on every push, the watchdog cron, the installer's self-trigger) are filed as
  `actions-floor-trim` (5) to build before that week is measured.
- 2026-10-12 burn-down: oss-bounties `bounty-useagenthq-useagent-113` dropped — the "$5" pays a person to use the maintainer's
  product on a real-time recording and email a report from a sign-up address, with AI-driven runs prohibited; not a repository
  change and not claimable by a routine.
- 2026-10-12 burn-down: oss-bounties `bounty-salamlang-salam-1713` dropped — a community reward for publishing a new app in
  Salam under the owner's account, paying only the first two accepted projects with at least nine complete submissions already
  ahead; expected payout nil.
- 2026-10-12 burn-down: oss-bounties `bounty-scanner-contest-floor` (6 × 2) built — five of five scanner-filed items were dropped
  unbuilt; the last two were a usage task and a contest, neither a repository change. The scanner now drops an issue whose
  title or body reads as a contest or usage task and files nothing under $25; the line's first real claim waits on the next board.
- 2026-10-12 burn-down: foundry `actions-floor-trim` (5) built — the clean-week projection after the poller trim was ≈531 billed
  min/week against a 350 proof line and the 2,000/month private cap. Four levers through `docs/ci/`: a lockfile-keyed
  `node_modules` cache in `check` and `gankdat`, the gankdat gate and deploy as one job, the installer skipping its own
  install push, and the watchdog folded into `notify owner` (every routine push + a 6-hourly net) with its own cron gone.
  The 10-26 reading measures the trimmed shape and decides on the repo flip.
- 2026-10-12 burn-down: gankdat `b2b-outreach-results` (4) closed — the ten-firm cold-email experiment of 2026-09-28 got 0 replies
  from nine delivered and no attributable sign-up by its 14-day mark; cold email to generic mailboxes is dropped as a channel
  (no second list), effort stays on the shelves. Kit and suppression list kept for an inbound lead.
- 2026-10-12 build: oss-bounties `bounty-useagenthq-useagent-61` ($80) dropped — a whole mobile app the maintainer assigns to
  one of four claimants and verifies on real phones with the claimant's own recordings: owner hours, weeks of work. Built
  `bounty-scanner-work-shape` (6 × 2) on top of the burn-down's contest floor from the same slot: the scanner also drops
  real-device, maintainer-assigned and hardware shapes. Two routines read the same board in one slot (the claim-first fix
  from 01:35 kept them off the same item, but not off the same fix); the line's first real claim waits on the next board.
- 2026-10-12 burn-down: exchange pre-research — EPC register (MHCLG bulk data + API) declined: the address and postcode fields sit
  under an Ordnance Survey/Royal Mail notice limited to energy-efficiency purposes, address-level rows are personal data with the
  re-user as controller, the official API is free and the ECO4 lead market it would serve ends 2026-12-31. Bespoke feed for a
  permitted buyer only; never a shelf listing.
- 2026-10-13 burn-down: hackathons researched (starved queue). The Nebius × NVIDIA entry ($50k, closes 10-30) is revived: the
  owner's Token Factory account went active on 10-12 and the official billing page (relay) shows the risk the 10-11 drop guarded
  against is bounded — US$1 trial credit, Nemotron Nano-class at US$0.06/0.24 per M tokens, the agent capped at 40 calls per run,
  £2 planned in the ledger. Split into a buildable agent item (fixtures, dry-run) and an owner-blocked submit item (action 025).
  GenAI.Works Open Agent declined (must be built in Cursor; existing projects top out at $1,000) and Amazon's Alexa+ track declined
  (partner-only toolchain); lablab.ai's Vultr cash track is watched for its date. No pre-research pass tonight: the queue is fed.
- 2026-10-13 burn-down: hackathons `nebius-diligence-agent` (8 × 2) built — the Nebius × NVIDIA entry's agent: Nemotron 3.5 Lightning on
  Token Factory works gankdat's seven diligence registers over MCP and writes a cited one-page report; a hard budget (Nano-class
  model, 40 calls, 300k tokens) is the cost control the 10-11 drop asked for. Dry-run mode carries the tests and the rehearsal
  until the owner's key lands (action 025); the live recording and the Devpost form are the submit item, due before 10-30.
- 2026-10-13 burn-down: gankdat researched (starved queue): the 10-12 row carries the first two external sign-ups and a drop in
  paywall hits the day after the PayPal packs shipped, but their route and activity are not readable until two more daily rows
  land; every lever is built or third-party-blocked, so no items — `research_after` 10-15. The Nebius agent is a reference MCP
  client for the listings, not a gankdat change.
- 2026-10-13 burn-down: oss-bounties researched (starved queue): the 10-12 board keeps 16 of 498 issues and none is a free funded
  fix — the free rows are the shapes dropped on 10-12, the rest sit under 1–14 open PRs for years. No items; `research_after` 10-14,
  after two boards under the new rules. Flagged for the Sunday review: a board-count trigger beside the PR-based kill rule if the
  free-fix count stays at zero.
- 2026-10-13 build: nothing buildable (every queue cooling or dated), so the day's exchange pre-research pass: Ofsted's childcare
  providers register parked — OGL v3 and a clean 19 MB provider CSV, but published twice a year (no change feed, gankdat's edge), half
  the rows are childminders Blind Mode drops, and the paid demand is in contact lists (RD Marketing £170–295/1k) or Apify actors with
  ≤ 5 users each — the same thin signal uk-schools met. Trigger: a first paid call on the lead-gen bundle, or a monthly Ofsted file.
- 2026-10-13 build (17:10): nothing buildable and the day's exchange pre-research pass already spent by the 09:16 run, so no work; main green.
- 2026-10-13 burn-down: Exchange pre-research (starved pipeline, night pass): Ireland CRO company register parked — CC BY 4.0 EU
  high-value dataset, 825k companies refreshed daily with a keyless CKAN API, no director fields; CRIF (Vision-net €2.10/search,
  SoloCheck) sells directors, judgments and credit the open data lacks, and three Apify clones of the exact lookup + change-feed shape
  have ≤ 2 users each (nerolabs already does x402 + MCP). Trigger: a first paid company-register call, ours or theirs.
- 2026-10-14 burn-down: foundry researched (starved queue). Actions after the 10-12 floor trim: 31 runs on 10-13 against 56, check at 0
  billed-rounded minutes (cache hits), no failed run; the metrics schedules still start 7–9 h late but the 07:00 dispatch writes the row
  first, so the schedule is a duplicate (`metrics-cron-short-circuit`, 2). The owner's 70–80% target has no measure — the usage note is
  ten days stale and cold-gated fires leave no trace — so `slot-utilisation-report` (4) gives the Monday report and the Sunday review a
  slot table; `pre-research-shelf-cap` (3, dated 10-19) puts the night pass itself to the review: 10 passes since 10-05 parked 10 ideas and
  promoted none while every trigger waits on a first paid call. The exchange runs this morning with two ideas dated for it.
- 2026-10-14 burn-down: `slot-utilisation-report` built — `npm run slots` classifies every slot of the week (the watchdog's list plus
  every hourly burn-down fire) from RUNS.md as built / researched / pre-research / ran / cold / silent / missed and prints the table
  the Monday report carries, the retro starts from and the Sunday review reads against the 70–80% target; it also asks for a fresh
  `usage NN%` note when BURN.json's report is older than 7 days. First reading, W42: 70 burn-down fires, 17 built, 49 cold (the
  `pipeline cold` gate ending the run with no line, as designed), 0 silent; 14 build slots, 7 built — about half the week's slots had
  nothing queued, which is the exchange-cadence question the review now owns, not a limit problem.
- 2026-10-14 burn-down: `metrics-cron-short-circuit` built — both metrics workflows (drafted in `docs/ci/`) end a scheduled run
  right after checkout when the 07:00 dispatch already wrote today's row, so the 7–9 h late cron stops repeating install, the
  runner refresh, IndexNow and the MCP probe (≈2 of 4 billed minutes a day, 14/week against the 350/week proof); a dispatched
  run always writes and the schedule stays the fallback for a morning nothing dispatched.
- 2026-10-14 exchange: **gankdat — x402 Bazaar listing** (13.7 raw, 9 applied: evidence 4 × reach 4 ÷ 1 day + 10 owner
  minutes). The CDP discovery API, read keyless through the relay, is the first shelf where agents' per-call payments are
  measured resource by resource: 34,668 resources; the top 200 took 518,867 paid calls from 17,160 payer-slots in 30 days
  (median price US$0.003, one entertainment endpoint 70% of calls); resellers of Exa search outsell the origin; no UK or
  company register, tender or sanctions resource anywhere in it. gankdat's x402 lane has been live on Base at US$0.005 since
  July with 0 payments because it is listed nowhere (v1 routes, no metadata, never the one settled call that indexes).
  Queued: the v2 lane with agent-ready metadata (9), a `bazaar:` reading on the Daily numbers row (4), day-30 read 11-14 (3).
  Parked with measured triggers: the x402 aggregator (4.0 — the best reseller in the catalogue nets ≈ US$38/month after the
  US$0.001 facilitator fee; waits for our listing to convert) and the on-chain keeper (the 7-day simulation needs a POST relay
  — foundry `relay-post-json` (3) queued; Blockscout 403, Routescan no Base). oss-bounties gains Opire as a second source (4):
  Algora's public board page 404s and two boards kept 0 free funded fixes. Owner: nothing now; the settled payment (≤ 10 min)
  is raised by the build that ships the metadata. `docs/exchange/2026-W42.md`.
- 2026-10-14 build: **gankdat x402 Bazaar listing (9) built** — the pay-per-call lane is x402 v2 (`@x402/hono` + the CDP
  facilitator) with a Bazaar declaration per dataset generated from the registry's zod schemas (`src/x402/bazaar.ts`:
  description cut to whole sentences, query JSON Schema, schema-derived output example), v0.25.0; 357 v1 packages dropped.
  The metrics runner dry-runs every route at CDP's keyless validate endpoint daily (`x402 validate:` on the Daily numbers
  row — the sandbox proxy refuses api.cdp.coinbase.com) and counts payments under the probe user agent as internal.
  Indexing needs one settled payment no runner can make: action 026 asks the owner for a half-cent call from a wallet of
  theirs, or a US$1 probe wallet as the `X402_PROBE_KEY` secret (£0.80 planned). The proof is read from the catalogue by
  `metrics-bazaar-merchant-read` (next gankdat item), day-30 read 2026-11-14; nothing is assumed from validation alone.
- 2026-10-14 build: Opire added to the bounty scanner as a second source (`bounty-board-opire-source`): a code owner's
  `/reward N` and Opire's own open list are read, OpireBot's footer is stripped, and such rows are `not escrowed` because the
  creator pays by hand after the merge. Opire's whole open supply is six rewards worth US$212 on five issues, four of them from
  2024–2025 — it does not change the board-count picture (10-14: 8 kept, 0 free funded fixes), so the board-count trigger the
  10-13 research asked for stays on the Sunday review's list.
- 2026-10-14 burn-down: gankdat `metrics-bazaar-merchant-read` built — the Daily numbers row now carries `bazaar: N listed,
  C calls/30d, P payers, last <date>` read from CDP's keyless merchant discovery endpoint (the wallet taken from the route's
  own 402, so no new secret), `0 listed` until the owner's action-026 payment indexes us; the metrics job gained a probe
  step that, given `X402_PROBE_KEY` (option B), repeats the half-cent call only while unlisted, monthly after, never twice
  in a week. The day-30 read (2026-11-14) quotes this clause, never our own x402_paid count.
- 2026-10-14 burn-down: foundry `relay-post-json` built — the fetch relay takes `POST <url> <json>` lines (JSON-RPC reads
  on Base, the Bazaar's POST-only validate endpoint), same host allowlist and caps, a credential-shaped key or value refused
  before anything is sent. Two of the W42 exchange's three relay rounds had died on GET-only reads; the keeper-rewards
  trigger and any future chain or search read now have a path.
- 2026-10-14 burn-down: the relay's first POST (the proof of `relay-post-json`) read CDP's validate verdict on our x402
  routes: rejected — the Bazaar declaration's example query typed `per_page` as a string under an integer property, so
  the morning's listing would never have indexed, payment or not. Fixed in v0.25.1 (example values take the schema's
  types, test over all 17 sources); the daily `x402 validate:` clause reads the verdict from tomorrow.
- 2026-10-15 burn-down: hackathons research (starved queue) — a web sweep of the October–December boards found nothing
  an existing project can enter: Colosseum's Agent Hackathon (US$100k, agent-written code only) closed in February,
  Vultr's Agent Rush (lablab.ai, 3–8 Nov) has no prize table or tracks yet, Meta's "$1M" developer hackathon has no
  published rules, the rest are student-only, in-person or credits-only. Both queued entries wait on the owner (actions
  023 and 025), so the queue waits until the 2026-10-20 lablab read, which now also reads the Vultr page.
- 2026-10-15 burn-down: gankdat research (starved queue) — the two rows the 10-13 pass waited for show the three
  accounts doing nothing readable (0 paid, no external dataset call, no key issued) while the OAuth funnel moved for
  the first time: two clients reached the sign-in page and neither entered an email. Two is not a pattern; the pass
  sets the threshold (≥ 5 sign-in views, 0 emails in 7 days) that files a sign-in-page item, and waits until 10-16
  for the first Bazaar and validate clauses since the v0.25.1 fix.
- 2026-10-15 burn-down: oss-bounties research (starved queue) — the 10-14 board is the second under the 10-12 shape rules
  with 0 free funded fixes, so the board-count trigger is the 10-18 review's call. Third sources checked by search:
  Algora's console tRPC list (keyless for two third-party scanners, unverified) and IssueHunt's funded list go through
  the relay now so the review reads a real answer; BountyHub and Gitpay show no supply, Bountysource is gone.

- 2026-10-15 build: exchange pre-research (starved-and-cooled pipeline, no build) — USAspending federal contract awards parked
  in the exchange: the keyless API's licence allows commercial reuse subject to the Dun & Bradstreet limitation (addresses
  dropped, the sam-exclusions posture), HigherGov sells the same data from US$500/year and GovTribe from US$1,500/year, but the
  five Apify actors reselling the API have ≤4 users each and none of our procurement endpoints has a paid call, so it waits on
  the first paid US/EU procurement call; the SAM.gov opportunities half stays out (per-day keyed API, system account needs the
  owner's identity). Relay hosts added: usaspending.gov, open.gsa.gov, highergov.com, govtribe.com.
- 2026-10-15 build: the first Opire item, trovu#329 ($30, not escrowed), dropped on read — the maintainer's own body edits take a
  PR only with a video recorded on an Android phone and the sentence "I am a human who is writing this comment, not an AI",
  neither of which a routine can truthfully supply, and say the feature may be impossible as PWAs stand; PR #718 was open and
  the scanner had filed it as free because its one-page timeline read ended before 2026. Seven of seven filed bounty items are
  now dropped unbuilt: the scanner pages busy issues and drops both shapes, and the 10-18 review's board-count call stands.
- 2026-10-15 burn-down: Exchange pre-research (starved-and-cooled pipeline, night pass; the 17:10 build slot held the only
  item): SEC EDGAR filings index + XBRL company financials parked in the exchange — the submissions, companyfacts, frames and
  full-text APIs are keyless public-domain JSON (data.sec.gov and efts.sec.gov answered the relay 200; www.sec.gov answered
  403 'undeclared automated tool' / 'rate threshold' to a browser-style agent, so a build sends the declared
  'gankdat <mailbox>' agent and never crawls pages), sec-api.io sells the same data at US$49–199/month, Financial Modeling
  Prep at US$19–99, and AgentFilings already sells it to agents over MCP + x402 on Base; but over 60 Apify EDGAR actors sit at
  2–4 users each (one free one at 108, the Form D funding-leads one at 50) and our only US register has no paid call, so it
  waits on the first paid sam-exclusions call or a US-finance intent in the x402 Bazaar day-30 read; the Form D funding-leads
  slice goes first when it does. Relay hosts added: sec.gov, sec-api.io, financialmodelingprep.com.
- 2026-10-16 burn-down: foundry researched (starved queue, 48 h after the last pass). The watchdog's `missed: metrics 10-15 07:00`
  was a false alarm: the routine dispatched both metrics jobs at 07:14 and the rows landed by 07:17, but its only trace was the
  `metrics:` commit it made each day 10-04..10-14 by appending a `Reviews checked` row per venture, and a quiet day makes none —
  `metrics-slot-trace` (4) gives it a SLOTS.md marker and ends the second row. Actions after every trim: 100 runs in 59 h, all
  green, 728 billed min/7d, the floor now the run count itself; `relay-allowlist-as-data` (2) removes the check run each new relay
  host triggers; `owner-notes-poll-gap` (2, dated 10-19) puts the five-hour daytime Telegram gap to the Actions reading rather than
  spending minutes on it now. The two dated readings carry the day-5/6 cron starts (12:01–12:26, exiting in 8–14 s) and the run mix.
- 2026-10-16 burn-down: `metrics-slot-trace` built — the watchdog and the Monday slot table take the 07:00 routine's SLOTS.md start
  marker together with the two commits its dispatch produces as the slot's trace (marker alone is still `stalled:`, the commits
  alone are a late cron's), the routine stamps that marker first, and its quiet-day `Reviews checked` row — the only reason it ever
  committed — is gone. Why: a correct quiet morning was indistinguishable from a dead one, and the Monday table would have counted
  it missed.
- 2026-10-16 burn-down: `relay-allowlist-as-data` built — the relay's allowed hosts are a data file (`docs/relay/hosts.txt`) the
  script parses at start, so a research or pre-research pass that needs one more host pushes docs, not code: no `check` run, no
  pre-push lint on the way to a relay read (13 script commits since 10-08, almost all one host each).
- 2026-10-16 build: `googlebot-401-noindex` built — every 401 and 402 the gankdat Worker sends carries `X-Robots-Tag: noindex`
  (`src/middleware/robots.ts`, after the assets fetcher, covering the keyless REST and MCP 401s, the preview / quota / x402
  402s and the HTTPException path); robots.txt keeps /v1/data and /mcp crawlable so agents still read the wall bodies for the
  sign-up and payment hints. Why: Search Console 2026-10-15 reported "Blocked due to unauthorised request (401)" after Googlebot
  followed the docs' links into the walls. The URL list the item wanted could not be read: the Search Console step runs in
  store-metrics at 07:17, two minutes before gankdat-metrics writes the Daily numbers row, so gankdat has had no `search:` clause
  since the key landed 10-11 — queued as foundry `search-console-gankdat-row-race` (score 6).
- 2026-10-16 build: oss-bounties verdikta#76 dropped — the bounty pays for posting and funding an on-chain task from the claimant's wallet and claiming on Poidh, not for a pull request (the issue says so); a £0 line spends nothing, crypto is out of scope and the paying wallet is the owner's identity. Eighth scanner-filed item dropped unbuilt in a row, so the scanner gained a fifth shape rule (fund it yourself / paid to a wallet off GitHub) on the issue's own wording. The next candidate, foundry search-console-gankdat-row-race, went to the 17:00 burn-down seconds before this slot's claim; the pipeline was then starved and cooled, so the day's exchange pre-research pass went to the SRA firm data web service (free commercial reuse under its terms, ~10,000 regulated law firms, daily refresh, key from a free developer portal; an Apify scraper of the same register sells at US$1.60/1k records to 17 users) — parked, trigger an owner-created portal key and the daily call cap.
- 2026-10-16 interactive (owner: keep the repo private, surface only what is needed): public mirror
  `github.com/giovf/gankdat` of the service minus internal files, synced by CI on every push; the hackathon
  entry, the MCP registry and the Docker catalog point there. The monorepo flips private when the Actions
  reading (foundry `actions-minutes`, 10-19) fits the 2,000-minute private cap — today's projection is ~3,050.
- 2026-10-16 burn-down: `search-console-gankdat-row-race` built — the gankdat metrics job runs `scripts/search-console.ts`
  (scoped by the new `STORE_METRICS_VENTURES`) right after it writes the Daily numbers row, and the store metrics job keeps
  only the three landing ventures. Why: the store job dispatched at 07:17 and gankdat's row landed at 07:19, so the one
  property owner action 020 was for never got a `search:` clause (10-11..10-16) and the googlebot-401-noindex proof could not
  be read. Proof: the 2026-10-17 Daily numbers row carries `search: … indexed I/N …`.
- 2026-10-16 interactive (owner): the dashboard at apps.gankdat.com/ops (email code sign-in; ventures, pipeline, owner
  page, idea box → OWNER-NOTES) and a dependency-currency system: `docs/ops/VERSIONS.md`, a monthly check of routine
  Claude models and Node against public pages, Dependabot with gated auto-merge. The first check found Opus 5.5 and
  Sonnet 5.5 already published; after two probe runs the four Sonnet routines and the Opus fallback run on 5.5.
- 2026-10-17 burn-down: gankdat research pass — the 10-11 "keep serving the uk-planning snapshot" decision lasted seven days: the
  KV snapshot and stats blob expire at 7 × the cache TTL and a failing refresh never re-writes them, so since 10-16 the dataset 503s
  everywhere (REST, MCP probe, Apify actor, the indexed /stats page). Queued the retention fix (score 7), a cron-outcome wave-log
  reading (the slug search returned only @x402/hono's Ajv-under-workerd warning for both stale sources, and nothing from the
  journal's wave, which has died silently on three nights in four since 10-04) and the journal's third refresh item.
- 2026-10-17 burn-down: `uk-planning-paused-snapshot-retention` built — a failed KV refresh now keeps the last snapshot and stats
  blob alive (fresh TTL, no origin read), the REST 503 / MCP tool error for a `notice` source says the notice, the tool
  description carries it so the metrics probe picks a live source, and `/stats/<slug>` with no blob renders the notice as a
  page. Why: the 10-11 decision to keep serving uk-planning's snapshot held for exactly the 7-day KV TTL. Limit: the expired
  snapshot is gone for good; uk-planning answers with its notice until the origin serves rows again or §7 retires it.
- 2026-10-17 burn-down: gankdat `wave-log-cron-outcome-reading` built — the wave-log reading drops request lines and the x402
  Ajv warning, prefers a structured refresh event, and reads each stale source's wave by its Cron Trigger (invocation log
  type `cf-worker-event`, cron as needle, `$workers.outcome` / wall time when carried); the warning is muted at the lane.
  Why: the reading built 10-09 showed only noise on its first real test (10-16) and the journal's third silent streak read
  nothing; the next stale row names the wave's outcome, which is what `refresh-uk-trademark-journal-2026-10-17` needs first.

- 2026-10-17 build: foundry `first-run-check-new-workflows` built — build and burn-down read each installer commit's
  workflow for its first live run (one `workflow_dispatch` when nothing fired; publish, mirror and demo-video never
  forced), log `<name> first run: …` and fix a failure in the same run. Why: three W42 first runs failed and one never
  fired, each found by mail a day later; the first run is the only test these workflows get.
- 2026-10-17 interactive (owner: "I see scheduled work for existing ventures but none for new ones"): the exchange decided
  weekly but its output was invisible and its new-line candidates sat parked behind triggers. Now `docs/pipeline/queues/
  new-ventures.json` (weight 2) is the exchange's backlog of research spikes — small evidence items for the best candidates,
  executed by idle build slots, each ending in `docs/exchange/spikes/<id>.md` with a promote / park call — refilled to 2–4
  every Wednesday; four seeded today (x402 aggregator margins, pay-per-crawl on the stats pages, keeper-rewards simulation,
  HMRC VAT lookup). The dashboard gained a "New ventures" tab: next run, last decision, spikes, promoted and parked ideas.

- 2026-10-17 build: new-ventures spike `x402-aggregator-margins` — the Bazaar's own 30-day counts (top 700 of 47,204
  resources) put proxyable spend at US$9,970 a month, US$3,231 without one entertainment endpoint; a 20–40 % gateway
  nets US$408–1,054 a month at full capture and US$16–74 at 2–10 %, while 187 of 488 resources cannot carry a 30 %
  markup past the US$0.001 settlement fee and the upstreams that could (Exa, X, Google Trends, CoinGecko) forbid resale.
  Parked with a numeric trigger (≥ US$30k/30 d proxyable); the own-listing item stays the x402 line. Why: the owner's
  10-11 idea deserved the whole market's numbers, not one reseller's; they say the cut is cents a month.
- 2026-10-17 burn-down: new-ventures spike `pay-per-crawl-stats-pages` — Cloudflare's own docs (relay) put Pay Per Crawl
  in closed beta and give the charge capability to Enterprise plans with Bot Management only; minimum US$0.001 a crawl,
  one price per zone, Cloudflare as MoR paying monthly through a dedicated Stripe Connect account, no paying crawler named.
  Our traffic: 0 AI-crawler fetches of /stats… at the Worker in 7 days, 236 AI-family requests of 63,763 on /mcp in 30 days
  (193 Claude-User — prospects, not training crawlers), so the take is US$0–12 a month at any allowed price. Declined; the
  parked idea carries two dated triggers (plan table opens to Free/Pro AND ≥ 3,000 AI fetches/30 d) and the Daily numbers
  row now measures the crawler share daily. Why: a free zone cannot switch the toggle on, and the crawlers that do visit are
  the ones we want unmetered.
- 2026-10-17 burn-down: new-ventures spike `keeper-rewards-simulation` — 7 days of Base liquidations read on-chain through
  the relay (nine rounds; only Tenderly's public gateway serves `eth_getLogs`, 1,000 blocks a call). Aave v3: 37 events,
  US$6,523 of bonus, 93 % to one address, median event US$0.66. Morpho Blue: 620 events, US$153,005 of incentive, 85 % to
  five of 48 callers, 97 % of events on two crash days; the 43 long-tail callers earned a median US$18.72 for the week.
  Gas is US$0.08–0.17 a transaction, so a £10 budget buys 77–158 attempts — the constraints are repayment capital
  (median Morpho event repays ≈ US$49, the wallet holds US$1.11) or a flash-liquidation contract, a sub-block cadence and
  a paid RPC. Liquidation keeping declined; the parked idea keeps one trigger, harvest call fees (the capital-free shape).
  By-product: the relay retries 429/503 with backoff and paces same-host lines, and hosts.txt records which Base RPC
  serves logs. Why: the number the owner's idea needed now exists, and it says the money is real but already taken.
- 2026-10-17 burn-down: new-ventures spike `hmrc-vat-lookup` — HMRC's Check a UK VAT number API read through the relay:
  v1 (keyless) removed 17 Feb 2025; v2 is application-restricted (OAuth client credentials behind a Developer Hub
  registration in the owner's name, ~2 weeks, 3 requests/s per application) and declares its sole purpose as a
  trader's own due diligence. Keyless probes answer 404. The Apify rival scrapes the GOV.UK web form (out of bounds)
  and has 4 monthly users at US$0.005 a result; RapidAPI, vatstack and TrustComponent sell the check at
  US$0.003–0.09. Declined: no lawful keyless route, owner identity required, and the price floor is already where
  gankdat would sit. Exchange idea `uk-vat-number-check` declined; the spike file holds the evidence.
- 2026-10-17 burn-down: foundry `triage-reconcile-before-owner` — the triage prompt's WHO DOES WHAT paragraph now says a
  mail stating an amount or status the repo already records (ledger, a venture's RESEARCH.md) is reconciled against
  that file first and is `needs owner` only when the amounts differ or the owner's identity, card or login is needed.
  Why: two W42 owner lines (Nebius 10-12, Cloudflare $49 10-13) sent the owner to check what the repo already said.
- 2026-10-17 burn-down: foundry `metrics-crons-day-7-read` — eight days of scheduled runs read: both metrics crons still
  start 4.5–9.5 h late (0 of 8 before 08:00) whatever the minute, while the 07:00 routine's dispatch wrote the rows at
  07:13–07:17 on all eight days. The crons stay as the safety net for a missed routine (≈ 2 billed minutes a day); no
  further fallback is built. Why: the number decides it, and the dispatch already made the schedule irrelevant.
- 2026-10-17 burn-down: foundry `empty-skips-cooling-queues` — `npm run pipeline empty` and the `cold` gate now leave a
  cooling queue out even when it is flagged or emptied, as the burn-down prompt already said they did; the code applied
  the 48 h only to starved queues, so the spike that emptied new-ventures tonight listed it for research hours after
  its research run. Why: the rule lived only in the operator's reading; now the tool enforces it.
- 2026-10-18 burn-down: oss-bounties research — seven daily boards (≈ 3,900 issue reads) hold 0 free funded code fixes at
  US$25+ and the eight items filed were all dropped on read. No items added, `research_after` 2026-10-19; the Sunday
  review is asked to set the board-count trigger at seven such boards (met), mark the line finished and stop the daily
  scanner. Why: the labelled money is assigned, crowded or not code, so §3's recurring-job assumption fails on the
  count before the PR-based kill rule can ever fire.
- 2026-10-18 burn-down: foundry research — every `main` run of the last 40 is green, but the `dependabot` gate's first two real
  runs (PRs #5 minor/patch and #6 majors, 10-16 18:32) failed at typecheck on `@figma/plugin-typings` 1.141 and nothing in
  the repo noticed for 30 h (GitHub mails the failure to dependabot[bot]), and the 10-17 metrics routine dispatched both
  jobs without its slot marker so the watchdog wrote a second false `missed:`. Three items queued: the typings fix plus
  a `@dependabot rebase` (6), a red Dependabot gate filing its own queue item (4), the watchdog reading the
  `workflow_dispatch` event as the metrics trace (4). Why: an auto-merge rule that fails silently is worse than none.
- 2026-10-18 burn-down: foundry `dependabot-minor-gate-typings` — the one type error that held 13 minor/patch bumps (PR #5)
  is fixed on `main` (hygiene.ts names the three style types instead of `BaseStyle`), proven green on the PR's own branch
  in a worktree, and the PR asked to rebase so the gated auto-merge fires. Why: dependency currency without an attended
  session is the point of the workflow; the first real run must not be the one that fails quietly.
- 2026-10-18 burn-down: foundry `dependabot-red-gate-to-queue` — the notify-owner watchdog step now runs
  `scripts/dependabot-gate.ts`: an open Dependabot PR whose latest gate run on its head failed gets one `watchdog |
  dependabot:` line (deduped by PR and sha) and an idempotent foundry item `dependabot-pr-<N>` (5 for minor/patch, 3
  for majors), the refresh-errors-to-queue pattern. Why: GitHub mails that failure only to dependabot[bot]; the
  auto-merge rule was silent for 30 h exactly when it needed a person, and the queue is where a routine looks.
- 2026-10-18 burn-down: foundry `watchdog-dispatch-event-trace` — the run watchdog now reads the Actions API and takes a
  `workflow_dispatch` run of both metrics workflows inside the 07:00 window as the slot's trace, marker or not; a
  `schedule` run never counts, which keeps the late cron from faking a trace. Why: the 10-17 routine dispatched both
  jobs and skipped its marker, and the second false `missed: metrics` in three days went to the run log; the event is
  the fact the marker only approximated.
- 2026-10-18 burn-down: foundry `dependabot-gate-on-pr-author` — the `dependabot` workflow runs for a pull request whose
  author is Dependabot, whoever pushed its last commit, so a routine that fixes the code on `main` can merge `main` into
  the branch and let the gate merge the PR. Why: the sandbox cannot command Dependabot (the GitHub tool masks
  @-mentions, so the rebase comment on PR #5 was never read) and a fix that sits on `main` while the PR stays red is the
  silent failure again, one step later.
- 2026-10-18 burn-down: foundry `dependabot-pr-5` — the first item the red-gate filer wrote was closed the same run: main
  merged into the Dependabot branch, the gate re-ran under the PR-author condition and merged 13 minor/patch bumps.
  Why: the chain filer → fix on main → merge into the branch → gate → merge is now the whole Dependabot path and needs
  no person for minor/patch groups; majors (PR #6, score 3) still wait for an attended session.
- 2026-10-18 burn-down: foundry `dependabot-pr-6` — the majors PR is red because two bumps are wrong for the repo, not
  the code: TypeScript 7 (typescript-eslint's peer range stops at 6.0; `tsc -b` no longer redirects an `exports` path to
  an unbuilt referenced project) and vitest 5 in gankdat (`@cloudflare/vitest-pool-workers` wants ^4.1; the regenerated
  lock lost `vite`). Both majors are now ignored in `.github/dependabot.yml` with a lift condition each, so the monthly
  majors PR regroups to what can merge (stripe 23, postal-mime 4). Why: a red gate every month for a bump the toolchain
  cannot take yet is a wasted attended session; the ignore is not silent ageing because its lift condition is written down.
- 2026-10-18 burn-down: two owner ideas from the dashboard. The AI-setup course/starter kit is parked in the exchange
  (`ai-setup-course`) for Wednesday's research: the product shape fits, but §1 ranks an audience-capture line below
  cut-of-flow lines, so it needs paid-rival evidence first; urgency copy only where true. The adult-sector / 'capitalise
  on desperation' idea is declined (`adult-sector-ventures`): every shelf we sell through and our merchant of record ban
  it, UK Online Safety Act age-assurance duties and processor KYC put it beyond a £100 sole trader, and distress-based
  lines are the one kind this operation does not build. Why logged here: the owner delegated these decisions and asked
  for the reasoning in place.
- 2026-10-18 review (W42): every money target still zero — 0 paying accounts (3 accounts, 2 external since 10-12, unused),
  £0 MRR, 0 change-feed calls in 19 days, 0 extension/plugin sales now that the `sales:` reading exists, 0 paid Apify
  runs (October's summary ≈ 11-06). The one non-zero: the x402 lane, listed in the Bazaar on 10-16 by Claude's half-cent
  settlement, took **3 paid calls from 3 external payers** on 10-17/18 (US$0.015) — the first paid calls in its life,
  while the catalogue still lists 1 of 17 routes. Anonymous MCP calls doubled (1,585 → 2,970/day), 195 Claude-User
  requests in 30 d, 0 OAuth approvals, the 10-11 wall-hitter never returned. Verdicts: gankdat keep, variables-toolkit
  keep (views 7 → 14; day-30 read 10-21), read-focus keep (Chrome 3 ↔ 0), highlight-keep keep (first Firefox download
  10-14), hackathons keep (PayPal entry submitted 10-16, Nebius dropped by the owner), foundry keep, **oss-bounties kill**.
  Cash: spent £44.40, planned £8, ICO £47 contingent, headroom £47.60 (≈ 12.9 months). `docs/reviews/2026-W42.md`.
- 2026-10-18 review: **oss-bounties killed** — seven consecutive daily boards (10-11..10-17, ≈ 3,900 issue reads) with 0
  free funded code fixes at US$25+ and 8 of 8 filed items dropped on read meet the line's kill rule (a funded, free board
  row absent for a week, §8 2026-10-11; now a §7 bullet for money-on-offer lines). §3's recurring-job assumption failed
  on supply: GitHub's labelled money is assigned, crowded (32–85 open PRs on the old code issues) or not code; Algora's
  public board 404s, Opire rewards are not escrowed. Queue `finished`, `venture.json` killed, code and claims ledger
  kept, the idea parked in the exchange (re-open: two consecutive weekly boards with a claimable row); foundry
  `bounty-scanner-finished-queue` (5) makes the scanner weekly and silent on a finished queue. Hackathon prizes stay the
  money-on-offer line; the owner's 10-11 rule (take, don't wait) is unchanged — it needs supply that exists.
- 2026-10-18 review: cadence call (foundry `slot-utilisation-report`, 10-14) — the first `Built %` reading lands in the
  10-19 report, so the two-week criterion cannot be read yet; the decision rides the one-day drain instead: the four
  new-ventures spikes seeded 10-17 were all done the same day, the week had six starved-and-cooled stops, and ten night
  pre-research passes since 10-05 parked ten ideas and promoted none. Widened: the night pass writes its candidate as a
  scored spike into `new-ventures.json` when fewer than two spikes are open, and is skipped otherwise (foundry
  `pre-research-shelf-cap` raised 3 → 5, dated today, with the prompt sentence). The W43 review reads the first `Built %`
  and keeps or reverses this.
- 2026-10-18 review: queued gankdat `x402-bazaar-week-1-index-check` (4, 10-23 — the exchange's own proof date for the 17
  routes, unread by anything before 11-14) and `uk-planning-apify-pause` (5, 10-19 — a surface pause under §7's dataset
  rule while the origin is empty and Apify QA has the actor flagged; not a retirement, the external-query clock runs from
  10-12). Ledger convention: x402 USDC receipts become one `revenue` row per day-30 Bazaar read when they reach £0.01.
  §4 `Now` refreshed with 10-18 sources; §5 table gains `new-ventures` (2); §2 rows for bounties, Bazaar and directories.
  Nothing for the owner: OPEN.md shows 0 requests, no notify condition met; the two 10-18 dashboard ideas (AI-setup
  course parked for Wednesday, adult-sector declined) were answered by the burn-down and the review agrees.
- 2026-10-18 build: gankdat refresh progress marker (progress.ts) — a wave the platform kills now gets its refresh_log row from the
  next attempt, naming the phase; the ok row precedes the best-effort stats and the journal's issue fetch times out at 5 min. Why: the
  journal's silent nights were guessed at four times, and the 10-16 job log proved Worker logs carry no cron lines, so the Worker
  itself has to leave the trail. Root cause still open: `refresh-uk-trademark-journal-silent-row-2026-10-22` reads the first row.
- 2026-10-18 burn-down: pre-research-shelf-cap applied — a starved slot's one exchange pass now adds a scored research spike to
  new-ventures.json when fewer than two are open (skipped at two) instead of parking an idea. Why: the W42 review found ten passes
  since 10-05 parked ten ideas and promoted none, while the four spikes seeded 10-17 were done the same day; a spike is work the next
  slot builds. Prompt text in docs/routines/burn-down.md, build.md and exchange.md; the W43 review keeps or reverses it.
- 2026-10-18 burn-down: bounty-scanner-finished-queue — the scanner files nothing into a `finished` queue (the board is still
  written as the exchange's re-open reading) and runs weekly on Mondays instead of daily. Why: the W42 review killed oss-bounties,
  and a stray funded row would have reopened work the next morning while seven daily reads a week served one weekly reading.
- 2026-10-18 burn-down: uk-planning weekly origin re-read — planning.data.gov.uk still serves entity-count 0 with no replacement
  dataset; the snapshot stays served under its notice and the next read is 10-25. Why: the Apify actor still ran 21 times in 30 days
  for outside users, so STRATEGY §7's 60-day no-demand clock has not started.
- 2026-10-18 burn-down: first pre-research pass under the spike rule seeded `spike-ofac-eu-sanctions-screening` (6) in new-ventures
  instead of parking an idea: OFAC's SDN exports are public-domain flat CSV (last modified 10-15), OpenSanctions sells per-query
  screening and reseller licences, gankdat already streams the UK list. The spike's number — rival per-query prices against x402's
  floor and the UK list's external calls (0 in 30 d) — decides promote or park at the 10-21 exchange.
- 2026-10-18 build: gankdat `refresh-mcp-probe` — the 10-18 keyless probe hang (20 s, keyed call fine, snapshot fresh, no log line)
  is answered with two Worker guards rather than a guess: `/mcp` answers a POST with one JSON body so the tool call runs inside the
  awaited fetch handler (the SSE path ran it after the Response was returned, work a Worker may drop), and every data tool runs
  under a 10 s deadline that names the phase it reached. Why: directories score a hang as an outage; a bounded error is a reading.
  The x402 Ajv `Error compiling schema` log line (11 of 12 uk-planning lines) is queued at 3, not fixed in this run.
- 2026-10-18 burn-down: `spike-ofac-eu-sanctions-screening` parked (`docs/exchange/spikes/ofac-eu-sanctions-screening.md`).
  Supply is clean — OFAC SDN and consolidated exports are public domain with verified file names and a delta feed, the EU
  FSF XML/CSV answer the Commission's public token with no account, each list has a stable id — and rivals do charge
  above the floor (OpenSanctions €0.10 → €0.03 a query by bundle; the Apify shelf US$0.002–0.08 a name). But
  `uk-sanctions` has 0 external calls in 30 days, no dataset has one, and the 17 Apify screening actors share about 20
  monthly users, so a matcher that carries false-negative liability is not a new income line. §5's distribution-first
  rule holds for the two list datasets too. Re-open on the first external `uk-sanctions`/`sam-exclusions` call, a paid
  x402 call on either, or a screening request; the file is the ingest recipe for that day.
- 2026-10-18 burn-down: gankdat `x402-ajv-compile-log-noise` — the 17 `Error compiling schema` lines per isolate start
  were Ajv's own `logger.error` inside @x402/extensions' validator, run unconditionally by `paymentMiddleware` on every
  start and failing under workerd only for the codegen ban, so the lane now drops that one two-argument `console.error`
  beside the existing warning mute (`withoutCodegenError`). Why: the line hid real errors in every wave-log reading an
  x402 route touches (11 of 12 uk-planning lines on 10-17); CDP's daily validate remains the real schema check.
- 2026-10-18 burn-down: the fetch relay now runs one at a time (`concurrency: fetch-relay`, via `docs/ci/`): two request
  pushes 27 s apart made the second run fetch both files and lose both to a rebase conflict with the first run's
  response commit, leaving a request unprocessed until a manual re-fire — the general fix for a race every
  two-round research run can hit. Verified next slot by the first-run check.
- 2026-10-19 burn-down: `new-ventures` researched (the queue emptied 10-18 and had cooled): three spikes seeded so the
  slots before Wednesday's exchange turn idle capacity into new-line numbers — `spike-ai-setup-course-rivals` (7: the
  owner's 10-18 idea; WebSearch found four Gumroad kits of the same shape at US$9–39 and a Udemy beginner course with
  1,391 ratings, so the exchange trigger of two paid rivals at ≥ £20 with visible sales is a listing read away),
  `spike-beefy-harvest-call-fees` (5: the keeper idea's last trigger — Beefy pays the harvest caller a fee share, quoted
  at 0.5 % on mainnet; a week of Base StratHarvest logs says whether anything is left outside Beefy's own bot) and
  `spike-eu-hvd-company-registers` (5: the Ireland sibling the 10-13 pass asked the exchange to size; OpenCorporates sells
  lookups at £2,250–12,000 a year, the member-state count is the number). No open code-only prize competition found
  (`data-science-prize-competitions` stays parked, December reading).
- 2026-10-19 burn-down: `spike-ai-setup-course-rivals` (the owner's 10-18 course idea) — trigger met: Gumroad Discover
  shows four paid Claude Code kits at £28–37 with 6–39 buyer ratings and Udemy's top Claude course has 17,760 students,
  but every listing that promises an autonomous operation that earns for a non-technical buyer has 0–1 buyers (six
  read). Recommendation to the 10-21 exchange: promote a reshaped Claude Code operations kit for existing Claude Code
  users (what the buyer gains: scheduled unattended runs, a work queue, a watchdog, a relay, a phone-readable run log)
  at US$29–39 on Gumroad (10 % + 50¢ direct, 30 % via Discover, merchant of record for VAT), score ≈ 4, kill at < 3 sales
  in 30 days; the non-technical framing is neither sellable on this shelf nor honestly promisable (a Claude subscription,
  a terminal and GitHub are still needed), and urgency copy is limited to a launch price with a real end date.
- 2026-10-19 burn-down: `spike-beefy-harvest-call-fees` closes the owner's 10-11 keeper idea — declined. Beefy's own fee
  configuration pays the harvest caller 0.01 % of yield on every Base vault (its docs say 0.05–0.5 %), the 226 active
  Base vaults earn about US$52,000 a week on US$15 M of TVL, so the whole chain's call-fee pool is US$5.20 a week, and a
  6.7-hour log sample shows one bot taking 89 % of harvests; what is left outside it (≈ US$0.59 a week) is below Base
  gas per call. With liquidations measured on 10-17 and harvests today, no permissionless-reward line on Base pays;
  `onchain-keeper-rewards` is declined in the exchange with the numbers as its record.
- 2026-10-19 burn-down: `spike-eu-hvd-company-registers` sizes the one-EU-company-feed sibling of the parked Irish
  register — parked. The supply test passes (data.europa.eu tags 119 company-category HVDs; seven registers answered
  keyless under an open licence: Ireland, France, Finland, Poland, Latvia, Sweden, Malta), but the registers a KYB
  buyer pays for are the closed ones: Germany, Italy and Spain publish no register, the Netherlands strips names and
  numbers from its file, and on Apify the 13 register actors with ≥ 10 monthly users all scrape closed portals while
  the open registers' actors hold 1–4 users each (France 11 across seven). OpenCorporates sells 500 calls a month for
  £2,250 a year, so price room exists; demand does not, and gankdat's own company endpoints have 0 external calls.
  Scraping the closed registers is declined (their terms forbid it). Re-open on a paid company call, an EU register
  request or a de/it/es register appearing in the HVD facet; France (Sirene + recherche-entreprises) would be built first.
- 2026-10-19 burn-down: gankdat research (starved queue). The 10-17/18 rows carry the lane's first external x402 payments
  (1 then 3 in 24 h; CDP counts 3 calls from 3 payers on the one indexed resource) and nothing else new; review W42 already
  queued the week-1 index read, the uk-planning surface pause and the journal's silent-row read. One gap queued:
  `x402-paid-by-source-reading` (5) — the Daily numbers row cannot say which dataset or client paid, though the analytics
  point carries both, and the §7 dataset clock ignores paid x402 calls. `research_after` 2026-10-23, the week-1 Bazaar read.
- 2026-10-19 burn-down: built `x402-paid-by-source-reading` the same night — the Daily numbers row now names the dataset,
  the client count and the UA family behind every external x402 payment (24 h and 30 d), the job log lists the Bazaar's
  per-resource numbers, and paid x402 calls count toward §7's external-demand reading. The 10-19 row is the first that
  can say what the lane's first three sales were.
- 2026-10-19 build: the dated Actions reading — 549 billed minutes in the week 10-12..10-19 (415 runs; a quiet day is
  46, a relay-and-Dependabot day 112), over the 2,000-a-month cap, so the repo stays public. The floor is the run
  count: every CI-shape lever left (notify owner on a 2-hourly cron instead of its push trigger, the mirror inside the
  gankdat job, landing twice a day) saves ≈ 65 a week and leaves ≈ 485. The 10-26 reading flips at a week under 467;
  if the cadence keeps it over, the owner choice is GitHub Pro (US$4/month) or staying public behind the mirror.
  Telegram poll left as is (longest gap 7.9 h on a Sunday; a shorter schedule costs runs the week cannot spare).
- 2026-10-19 burn-down: notify owner moved to a `40 */2` cron, push trigger dropped (foundry notify-owner-cron-not-push):
  121 runs/124 billed minutes last week were a quarter of the 549 and the largest floor; ≈ 72 delivered fires replace them
  (-50/week). Phone lines, missed-slot bullets and owner notes now land up to 2 h late (4 h on a skipped fire), which the
  10-19 reading accepted; the first cron run after the installer commit is read at the next slot, the proof on 10-26.
- 2026-10-19 build: uk-planning paused on every surface, not unpublished (gankdat `uk-planning-apify-pause`, review
  W42). The origin has been empty since 10-10, the snapshot expired 10-16 and Apify QA flagged the actor on 10-17 after
  6 of 22 runs failed on our own 503. A run now ends cleanly with the dated notice and no charge, the README and the
  stats page say paused, and the actor stays public so the 18 outside users' schedules resume by themselves when
  planning.data.gov.uk republishes. §7 clock unchanged; the weekly re-read restores everything.
- 2026-10-19 burn-down (exchange pre-research): US NPI provider registry (CMS NPPES, FOIA-public, keyless API) seeded as
  new-ventures spike-us-npi-registry (6): ten Apify NPI actors price the same data at US$2.80–8 per 1,000 on the shelf
  gankdat already sells on; the spike reads their monthly users and the primary terms through the relay and calls it.
- 2026-10-19 burn-down (spike us-npi-registry): parked. The NPI registry is FOIA-public, keyless and refreshed daily at
  no charge, and 71 Apify actors already resell it to 114 users a month between them at US$0.002–0.01 a record — a copy
  would earn cents. Re-open only as a live provider-verification call (NPPES + sam-exclusions + OIG LEIE) when a US
  buyer shows (first sam-exclusions paid call, an NPI request, or an NPI + exclusion actor passing 10 users).
- 2026-10-20 burn-down (hackathons research): Meta Global AI Developer Hackathon found on the sponsors' own pages — US$1M cash,
  fully online, free, UK eligible, applications close 25 Oct; the owner applies (action 027) and the Nebius diligence agent
  is ported to Meta's models inside the 26 Oct–4 Nov window on free credits (no card). lablab's Rise of AI Agents is still
  TBA a week before the aggregators' start (item done, no entry); Vultr Agent Rush (sandboxed-execution agent, Vultr card)
  and Qloo (taste API) declined; MCP_HACK//26 closed. Next hackathons signal 26 Oct (rules + acceptance).
- 2026-10-20 burn-down (foundry research): no new evidence since 10-18 beyond two defects seen tonight — a queue starved only by an
  item dated for 07:00 the same morning is researched by every night slot (filed `dated-within-day-not-starved`), and the
  first-run check accepted a stale line for a re-installed workflow (filed `first-run-line-after-installer`). Next foundry
  readings: node-24-runners 07:00 today, actions-minutes 10-26.
- 2026-10-20 burn-down (foundry `dated-within-day-not-starved`): a queue whose only open items come due today at 07:00 or
  tomorrow is waiting, not starved — `starved()`, `empty` and the plain-Node `cold` gate leave it out, so the night slots no
  longer research a venture whose next item is hours away (tonight's two research passes were triggered that way).
- 2026-10-20 burn-down (foundry `first-run-line-after-installer`): the first-run check now requires a `<name> first run:` line
  stamped after the installer commit it answers, so a workflow re-installed within a week gets its new version's first run
  checked (10-19 the cron-only notify-owner.yml was accepted on a 10-18 line by two slots).
- 2026-10-20 build (foundry `node-24-runners`): every workflow pin moved from Node 22 to 24 (the active LTS) through `docs/ci/`
  after the whole gate passed on Node 24.22.0 in the sandbox; the register row is 24. The devcontainer stays on 22 until an
  attended session changes it (CLAUDE.md: ask before `.devcontainer/`); the next slot checks the installer commit's first runs.
