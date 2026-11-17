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
| **Hackathon prizes** (`ventures/hackathons`, 2026-10-11: Devpost lists 38 open online hackathons; PayPal AI $67.5k to 11-12, Nebius × NVIDIA $50k to 10-30, both accepting existing projects and UK entrants) | sponsors who have already committed the prize money; judges | the prize tables in the official rules | $5k–$20k per placing | one account per portal (owner), the entry package built by routines, the owner clicks submit; by 2026-11-15 (review W46): two complete entries, **Meta not placed** (5,367 submissions for ten cash prizes, no feedback), PayPal judged 1–15 Dec; two sweeps found no open cash event for an existing project — a large open event's field is far wider than the 10-11 research assumed, so a sweep counts an event as claimable only when its field is small enough for an existing product to place |
| ~~Open-source bounties~~ (`ventures/oss-bounties`, opened 2026-10-11 on 553 labelled GitHub issues; **killed 2026-10-18, review W42**: seven consecutive daily boards 10-11..10-17, ≈ 3,900 issue reads, held 0 free funded code fixes at US$25+ and all 8 filed items were dropped on read — the labelled money is assigned, crowded or not code; Algora's public board 404s, Opire rewards are not escrowed) | maintainers who posted cash on an issue | the amount is on the issue — but on seven boards none was free, funded and code | $50–$800 per merged PR | none per PR; the code, scanner (weekly from now) and claims ledger are kept; the exchange holds the idea parked (re-open: two consecutive weekly boards with a claimable row) |
| **Agent directories** (MCP Registry, mcpservers.org, Glama, awesome-remote-mcp-servers and the Apify Store live; Claude Connectors Directory submitted by the owner 2026-10-04, in review; Docker MCP Catalog entry built 2026-10-10, PR waits on the owner's token, action 021) | the owners of the agents hitting the paywall (~80/day); Claude Team/Enterprise users | same rivals as the data API; the directory measures rank, accounts and tool calls itself | inside plans (OAuth billing from Claude queued) | none — listed automatically after a policy scan on the owner's paid plan (added 2026-09-30); ~46k keyless calls and no payer from the five live directories by 2026-10-11; the first client to exhaust the keyless preview (10-11: 47 wall hits on contract awards, sanctions and TED) was offered sign-in only — gankdat `preview-wall-next-steps` (review W41); by 2026-10-18 (review W42): Claude in review day 14 (no mail), Docker PR docker/mcp-registry#5622 in review day 7, anonymous MCP calls doubled in the week (1,585 → 2,970/day) with 0 OAuth approvals and 0 `request_api_key`, the 10-11 wall-hitter never returned; by 2026-10-25 (review W43): Claude in review day 21 (no mail), Docker PR day 14, anonymous MCP 3,372/day, Claude-User requests on /mcp 195 → 344 in 30 d, still 0 OAuth approvals and `0 keys/30d`; two more billed shelves built for the owner to open (AppSource Excel add-in, action 031; Zoho CRM widget, action 029); by 2026-11-01 (review W44): Claude in review day 27 (portal owner-only at the day-30 read, the owner's 3-minute read asked, action 035), Docker PR day 21, Claude-User requests on /mcp 344 → 492 in 30 d, anonymous MCP 3,993/day, still 0 OAuth approvals and `0 keys/30d`; the AppSource and Power Platform shelves withdrawn and Zoho blocked under the owner-request cap (10-29); by 2026-11-08 (review W45): Claude in review day 35 (the owner's 11-02 read: "in review", no numbers), Docker PR day 28, `claude tool callers 0` all week (Cowork never listed tools — v0.28.3 closes the listen at once), Claude-User requests on /mcp 492 → 424 in 30 d, the funnel's first `authorize` + `sign-in` abandoned before the email step, still 0 OAuth approvals and `0 keys/30d`; by 2026-11-15 (review W46): Claude in review day 42, Docker PR day 35 (its CI ran "No jobs" on 11-10), `claude tool callers 0`, Claude-User requests on /mcp 424 → 465 in 30 d, 0 authorize in the week, still 0 OAuth approvals and `0 keys/30d`; **Clay** joined the reviews — the no-contract HTTP API route (docs page `/clay` 11-09, the owner's intake 11-12) drew a reply with questions on 11-13, the first directory to ask one back; the answer waits as a draft for the owner's send |
| **x402 Bazaar** (Coinbase CDP discovery catalogue; exchange 2026-W42: 34,668 resources, the top 200 took 518,867 paid calls from 17,160 payer-slots in 30 days at a median US$0.003; no UK or company register, tender or sanctions resource listed; gankdat's x402 lane live since July at US$0.005 with 0 payments, unlisted — `x402-bazaar-listing` queued 2026-10-14) | AI agents holding USDC on Base that search the Bazaar by intent (searchX402Resources, the Bazaar MCP, agentic.market) | the catalogue's own per-resource 30-day call and payer counts; resellers of Exa search at US$0.01 with 168 payers | US$0.005 per call (CDP Facilitator: 1,000 settlements/month free, then US$0.001 each) | none — one settled payment indexes a resource; the owner makes it once (≤ 10 min); **listed 2026-10-16** (the half-cent settlement made by Claude from the test wallet, action 026 option B) and **the first paid calls by strangers followed within 48 h: 3 calls from 3 payers on 10-17/18**, the only non-zero in the §4 money rows — against `bazaar: 1 listed` (the July v1 route; the 17 v2 routes validate but are not yet indexed, week-1 check 2026-10-23; review W42); **by 2026-10-25 (review W43): 16 of 17 routes indexed** after the 10-23 per-route half-cents and v0.25.3's 500-char description fix, `x402 30d: 19 paid, 4 clients` — 15 of them one catalogue prober paying every route once on 10-24/25, so the buyer count is still the 3 uk-tenders clients of 10-17..10-24; **by 2026-11-01 (review W44): buyers 11 paid, 5 clients, repeat 0** (uk-trademark-journal 5, eu-ted 3, three routes 1 each), probers 19 paid / 4 clients — the buyer set widened in the week and nobody paid twice; **by 2026-11-08 (review W45): buyers 17 paid, 7 clients, repeat 1** — the first repeat payer (a `node` client on uk-trademark-journal, 11-03..11-05) then three days with no buyer call; probers 24 paid / 7 clients; the change feed priced on the lane 11-05 (US$0.01, 9 routes) is not yet indexed — `x402-change-routes-bazaar-index` queued; **by 2026-11-15 (review W46): buyers 39 paid, 10 clients, repeat 2** — 32 of 39 on uk-trademark-journal, a second repeat client paying ten times on 11-10, then no buyer call after 11-11; the nine change routes indexed 11-08/09 (25 listed) took 0 paid calls in seven days; both attempts to widen the trademark offer parked on source terms (USPTO behind an ID.me-verified key; TMview and the UK IPO register reserve data mining), so the journal itself is the lawful supply |
| **Etsy digital downloads** (`ventures/tax-workbook`, opened by exchange 2026-W43 on 2026-10-24: a UK Sole Trader Tax Workbook 2026/27 — SA103S mapping, MTD quarterly totals, tax + Class 4 NI estimate, Trading Allowance check — at £6.99 launch then £8.99) | UK sole traders keeping their own books; the job recurs every tax year | a one-listing UK shop at £7.19 shows 172 sales and 18 five-star reviews after a year, a VAT-seller sheet ~1,500 reviews, the £69 sheet 0 sales (search-index snapshots 2026-10-23; Etsy forbids automated reads, so the shelf is never scanned) | £6.99–8.99 one-off; Etsy takes ≈ 19 % and remits VAT; ≈ £5.80 net | the owner opens the shop once (Persona ID, bank account, the set-up fee ≤ £25 — over the £10 launch ceiling, so their call) and uploads each file; ~15 min a month of buyer messages at the rival's volume; **listed 2026-10-29** (the owner's one sitting: Etsy shop Taxelicious opened for £14 + £0.20, Payhip store opened, KDP account opened) and the **Kindle sibling live 2026-10-31** in KDP Select; 0 sales at day 3 / day 1 (review W44); by 2026-11-08 (review W45): four shelves live (Payhip and the own checkout joined 11-02), 0 sales on every one, and **Etsy suspended the shop on 11-07** over the unpaid £2.98 bill — the day-60 clock counts visible days only; the second listing (Reseller workbook, built 11-03) waits on the reopen and action 037; **by 2026-11-15 (review W46): the Etsy shelf is closed** — the owner's note of 11-09 stops all Etsy spend, the suspended shop is not reopened (0 sales over 9 visible days); the line continues on Kindle, Payhip and the own checkout with 0 sales at day 13–15, three shelves with no traffic of their own; nothing new is built for it before a first sale and the 12-28 read applies the kill rule |
| **Leanpub books** (`ventures/claude-code-kit`, opened by exchange 2026-W45 on 2026-11-04: *Running Claude Code unattended*, a 20–30k-word operations handbook plus an MIT Extras zip of the operation's own files, as a Package at US$19 minimum / US$29 suggested) | developers who already run Claude Code and buy its books on Leanpub; the job recurs with every release | Leanpub's own shelf, read from 31 book pages' `totalCopiesSold` on 2026-10-31: 11–13 paid copies on each of four operations handbooks of this shape (US$9.99–12.99), 81–530 on the general guides (US$15–40); no rival ships a running operation's files | US$19–29, 80 % royalty (net US$15.20–23.20), PayPal payout from US$20 after a 60-day hold | none per sale; the owner holds the account (Leanpub bars AI agents) — one ≤ 15-min publish session, and the owner's own read of the book is Leanpub's human-curated condition; by 2026-11-08 (review W45): manuscript (21,030 words), Extras zip and listing pack built 11-05, the owner's publish step (038) open 3 days, §4 row added; Kindle and Whop second shelves read 11-07 and parked; by 2026-11-15 (review W46): the publish step (038) open 10 days, unchanged; nothing re-sent (owner 11-09: the open actions come as time allows) |

## 3. Unit economics (what has to be true)

- gankdat break-even on cash: 1 × £5/mo customer covers Workers Paid. Meaningful: **£300 MRR**
  (runbook pivot line) ≈ 13 × £23 or 4 × £79. Gross margin ≈ 95% (Stripe fees only).
- Apify: at US$0.001/row, a typical lead pull (2,000 rows) earns US$1.60 net. Needs volume;
  the value is discovery inside a marketplace that already has the buyers.
- Extensions/plugin: each sale ≈ £9 net; 10 sales/month = pocket money, but £0 to keep alive.
- Owner time: target < 30 min/week of admin. Anything needing more is redesigned or dropped.
  **Owner requests (owner, 2026-10-29):** one request asks ≤ 15 minutes in one sitting and no new identity or business
  verification, unless the work it unblocks scores ≥ 10 (score × queue weight) on paying-buyer evidence. Never append
  steps to an open request. A bigger ask is redesigned to need less, or the item is parked.

## 4. 90-day targets (to 2026-12-20)

| Metric | Now | Target | Where measured |
| --- | --- | --- | --- |
| gankdat paying accounts | 0 (5 accounts — `+1/24h` on 11-09, `+0` since; `0 keys/30d`, `oauth: 0/30d`; `oauth funnel 7d: 36 challenges, 0 authorize` — one `python-requests` client asks `connect_account` 22 times a week and never opens the sign-in page; review W46, Daily numbers 2026-11-15) | 5 | `Daily numbers` rows in `ventures/gankdat/RESEARCH.md` |
| gankdat MRR | £0 (`0 paid` on every row; the ledger's one `revenue` row is £0.24 of x402 receipts, booked 11-15). x402 (buyers and probers split since 10-25): `30d: 66 paid, 19 clients — buyers 39 paid, 10 clients, repeat 2` (uk-trademark-journal 32, eu-ted 3, uk-tenders 2, nhs-ods 1, uk-care-locations 1; `usetested-harness 21`, `node 11`) ≈ US$0.195 from buyers, `probers 27 paid, 9 clients`; the second repeat client paid ten journal calls on 11-10; **last buyer call 11-11**, four quiet days since; the 11-14 day-30 read (receipts row, extend or leave) is overdue behind the paced nights (review W46, Daily numbers 2026-11-15) | £150 | Stripe (weekly report); x402 receipts per the ledger convention of 2026-10-18; the `x402 30d:` clause's `buyers … repeat …` reading since the 10-26 row (gankdat `x402-buyer-vs-survey-split`, built 10-25); probers never count |
| Apify actors live | 18 public of 20 built — the two newest (uk-payment-practices-reports, uk-company-accounts-financials) are held private because Apify now requires a verified owner before more actors go public (run 99, 2026-11-14; not asked of the owner, §3 — gankdat `apify-verified-owner-public-cap` blocked); `uk-planning-applications` paused on every surface since 10-19, its origin down since 11-06 (MHCLG outage page, no restore date) (review W46) | 17 — met | `apify:` in the Daily numbers row (`ventures/gankdat/RESEARCH.md`) — `P public`; all 17 went public 2026-09-28 |
| Apify paid runs / month | **October: estimated profit US$0.17, 1 user (uk-visa-sponsors), no payout** — still the only non-zero reading; November's summary arrives ≈ 12-04; 509 runs by others in the 30 days to 11-15 (520 a week earlier), `19 users/30d` flat, every actor at 28–29 runs/30 d = the QA runner's cadence; the journal actor retitled for the Store's `trademark` searches on 11-11 (absent from all three before), rank read 12-11 (review W46, Daily numbers 2026-11-15) | 100 | `apify:` in the Daily numbers row (`ventures/gankdat/RESEARCH.md`) — lifetime `R runs` plus the `+d/24h` delta (`stats.totalRuns`), 30-day runs by everyone (`stats.publicActorRunStats30Days.TOTAL`) minus our own (`GET /v2/actor-runs`) |
| Change-feed calls / week | **0** (`changes 7d: 0 (mcp 0, rest 0)`); the nine `/x402/changes/:source` routes (US$0.01) are indexed in the Bazaar since 11-08/09 (`bazaar: 25 listed`) and took **0 paid calls in their first seven listed days**; the 11-03 `wanted: get_changes 14` has not recurred; keyless Atom feeds 898 fetches / 70 user agents in 30 d (453 / 24 a week earlier) — read as free RSS, not bought as an API (review W46, Daily numbers 2026-11-15) | 50 | `changes 7d:` in the Daily numbers row (`ventures/gankdat/RESEARCH.md`) — Analytics Engine, MCP `get_changes` + REST `/v1/changes` |
| Extension + plugin sales | 0 (`sales: 0 keys` Highlight Keep, `0 keys (2 test)` ReadFocus on every Daily check row; Figma `purchase_count 0`). **ReadFocus retired by the owner 2026-11-09, `killed` 2026-11-10** — listings stay live at £0 (Chrome users 1 → 5 since). **Highlight Keep retired by the owner 2026-11-15, `killed` the same day** — Chrome 0 users, Firefox 1 adu, 0 search impressions at retirement; listings stay live at £0 on 0.2.0, the 0.4.0 upload dropped. Figma: **first install** (`install_count 1`, 11-15), 23 views / 10 unique runs, verdict 12-20 (review W46, Daily check 2026-11-15) | 20 | Stripe / Figma; `sales:` in the Daily check rows (foundry `metrics-extension-sales`) |
| Directory listings live | **6** — MCP Registry, mcpservers.org, Glama, awesome-remote-mcp-servers, Apify Store, and the x402 Bazaar (25 routes: 16 data + 9 change). In review: Claude Connectors Directory (day 42; `claude tool callers: 0 clients` all week; day-60 read 11-29), Docker MCP Catalog PR docker/mcp-registry#5622 (day 35; Docker's own CI ran "No jobs" on 11-10), and **Clay** (docs page `/clay` live 11-09, the owner's partner intake sent 11-12, Clay replied 11-13 with questions — the answer is a draft the owner sends; day-90 read 2027-02-10). Withdrawn under the owner-request cap of 2026-10-29 (§3): the AppSource Excel add-in and the Power Platform connector; the Zoho CRM widget blocked by the same cap. The path to 8 is two of the three reviews (review W46) | 8 | `MARKETPLACE-PREP.md`; `bazaar:` in the Daily numbers row |
| Hackathon entries / placings | **2 complete entries, 0 placings** — **Meta Global AI: not placed** (winners mail 2026-11-10: 5,367 submissions, five indie prizes, no judge feedback; the community vote to 11-16 is a popularity count, not entered); PayPal AI (submitted 10-16, closed 11-12, judged 1–15 Dec, `paypal-ai-hackathon-results` 12-16); the 11-05 and 11-10 sweeps found no open cash event that takes an existing project. If PayPal does not place, the W51 review kills the line (review W46) | 3 entries, 1 placing credited by 2026-12-15 (RESEARCH §6) | `ventures/hackathons/RESEARCH.md` Metrics rows; Devpost / Cerebral Valley mail in `docs/INBOX.md` |
| Tax workbook sales | 0 on three open shelves — **Kindle guide** (live 2026-10-31, KDP Select to 2027-01-29, £4.99; day 15), **Payhip twin** and **own checkout** (both live 2026-11-02; day 13): `payhip 30d: 0 sales`, `own checkout 30d: 0 sales`, no `Sale` row, no buyer mail. **Etsy closed by the owner 2026-11-09** (no more spend: the shop suspended 11-07 stays closed, the £2.98 bill unpaid, action 037 withdrawn; final count 0 sales over 9 visible days, fees £14.20 paid). The Reseller workbook (built 11-03) waits for a first Payhip sale, the paperback for a KDP sitting; the day-60 read (12-28) applies §6 to Payhip and the own checkout (review W46) | ≥ 10 sales within 60 days of listing (exchange W43 proof); the Kindle title shares the clock from 10-31 | `Sale` rows in `ventures/tax-workbook/RESEARCH.md` from Etsy order mail (inbox triage); `payhip 30d:` in the Daily numbers row; the owner's monthly `etsy views … kindle … sold` note (tax-workbook `shelf-stats-owner-note`, queued W44); `revenue` rows in `docs/LEDGER.md` |
| Leanpub kit copies | 0 — **not yet listed**: the handbook (21,063 words, EPUB + PDF), the 44-file MIT Extras zip and the listing pack were built 11-05; the owner's ≤ 15-min Leanpub step (action 038) is open since 11-05 (day 10; owner 11-09: the open actions come "as I have the time" — not re-sent); second shelves (Kindle, Whop) parked 11-07 on the Leanpub day-60 read (review W46) | first sale within 30 days of the listing going live; ≥ 5 copies in 60 days (RESEARCH §6; kill: < 5 at day 60) | `Sale` rows in `ventures/claude-code-kit/RESEARCH.md` §7 from Leanpub's royalty mail (inbox triage); the book page's public `totalCopiesSold` as a `Daily check` row once live (`leanpub-copies-reading`, queued W45); `revenue` rows in `docs/LEDGER.md` at payout |
| Bounty PRs merged / paid | **line killed 2026-10-18** (review W42). The boards since (10-20, 10-26, 11-02, 11-09, 11-14: 10 of 584 kept, the US$3,000 and US$2,000 tt-metal rows `assigned`, every other row under 1–119 open PRs) do not meet the re-open trigger — the fifth board running with no free, funded, escrowed code row at US$25+ (review W46) | — (was: first payout by 2026-12-20) | `## Claims` table in `ventures/oss-bounties/RESEARCH.md` (`npm run claims`), the weekly `docs/bounties/BOARD.md` |

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
  the one buyer type the paid readings name (in September: bid intelligence or KYB; on the 2026-11-15
  reading: trademark watch, 32 of 39 x402 buyer calls — review W46) and sell the change feeds as the product.
- Recurring cost creep: anything that pushes recurring spend above £10/month needs revenue
  ≥ 3× that cost already banked.
- Cap rule (owner, 2026-10-10): the owner's net outlay never passes £100 — `npm run ledger` fails
  the gate when `spent + planned > £100 + revenue`, and warns under three months of headroom at
  the recurring rate; the review then decides what stops or what pays. A metered Cloudflare charge
  above the US$5 plan is a bug, not a cost: the metrics job files `cf-overage-<period>` (score 8)
  the day the Daily numbers row shows ≥ US$1 of overage.

## 8. Decision log

_The decision log is `docs/decisions/current.md` — append new entries at the end of that file, never here (it merges itself; this file does not). Entries older than 30 days roll into `docs/decisions/<YYYY-MM>.md` (`npm run decisions-roll`, run by the Saturday retro); the git history keeps every entry._
