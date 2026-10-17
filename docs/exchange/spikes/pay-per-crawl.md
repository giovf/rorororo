# Spike: AI-crawler pay-per-crawl on the gankdat stats pages

Research spike `spike-pay-per-crawl-stats-pages` (new-ventures queue, burn-down routine, 2026-10-17 17:10 UTC).
Decides the parked exchange idea `ai-crawler-paywall-stats-pages` (exchange 2026-W42 #7: let Cloudflare charge AI
crawlers per fetch of the public `/stats/<slug>` register pages — money already flowing, no audience to capture, no
build). Three questions: is Pay Per Crawl open to a zone like ours, how many AI-crawler fetches do the stats pages
take, and what would the monthly take be at the price the docs allow.

## Sources (primary, read this run through the relay)

- `developers.cloudflare.com/ai-crawl-control/` — product index (updated 2026-08-14), `get-started`,
  `features/analyze-ai-traffic` (plan comparison table), `features/pay-per-crawl/` and every sub-page under it:
  `what-is-pay-per-crawl` (2026-07-28), `use-pay-per-crawl-as-site-owner/{enable-in-account-settings,
  set-a-pay-per-crawl-price, select-crawlers-to-charge, monitor-activity, manage-payouts, advanced-configuration}`,
  `use-pay-per-crawl-as-ai-owner/crawl-pages`, `faq` (all 2026-04-23) — relays `pay-per-crawl-2026-10-17` and
  `pay-per-crawl-2-2026-10-17`. A `pay-per-use` path (the rename the W42 exchange had read about second-hand) is a
  404: the feature is still called Pay Per Crawl in the docs.
- `developers.cloudflare.com/analytics/graphql-api/limits/` (2026-10-02): adaptive datasets such as
  `httpRequestsAdaptiveGroups` "retain at least 31 days of data on every plan" — which is what makes the 30-day
  crawler count below readable from a Free zone.
- Our own traffic: the Worker's structured request line (path + user agent, Workers Logs), the zone's HTTP analytics
  by user agent, and the `/mcp` Analytics Engine rows — the new `stats crawlers:` clause of the Daily numbers row
  (`src/lib/crawler-hits.ts`, `scripts/metrics.mjs`, this run).

## Eligibility: closed beta, Enterprise with Bot Management

| Fact (docs text)                                                                                                                                                                                                                                                                                                               | Consequence for gankdat.com                                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "Pay per crawl is currently in **closed beta**. To find out how to join the beta program, reach out to us at Pay per crawl signup, or contact your account executive if you are an existing Enterprise customer." (`what-is-pay-per-crawl`, 2026-07-28); the product index calls it "private beta" (2026-08-14).                     | Not self-serve: a sign-up form and a wait, no date for general availability.                                                                                                      |
| Plan comparison (`analyze-ai-traffic`, 2026-10): **all plans** get AI-crawler detection by user agent, a 24-hour analytics window and allow/block controls; **Enterprise plans with Bot Management** get detection IDs, configurable timeframes "and the ability to charge AI crawlers using pay per crawl".                      | Charging is an Enterprise-with-Bot-Management capability. gankdat.com is a Free zone on Workers Paid (US$5/month); Enterprise is a sales contract, Bot Management an add-on — both outside the £100 cap by orders of magnitude. |
| Prerequisites: domain on Cloudflare nameservers, Administrator access, domain made **Visible** in Manage Account → Settings → Pay Per Crawl; then AI Crawl Control → Payments → Enable.                                                                                                                                     | The toggle the W42 exchange imagined exists, but only appears once the account is in the beta.                                                                                      |
| Price: one default price per zone, **minimum US$0.001 per crawl**, charged "for each successful content retrieval (HTTP 200 response) by an AI crawler"; errors and 402s are not billed; `/robots.txt`, `/sitemap.xml`, `/security.txt`, `/.well-known/security.txt`, `/crawlers.json` are always free. Dynamic pricing: an origin or Worker `crawler-price: USD n.nn` response header per page. | Pricing is the site owner's choice; the docs publish no market rate (the AI-owner example shows `crawler-price: USD 0.01`). The estimate below uses US$0.001, 0.01 and 0.05.           |
| Payment: the crawler must present `crawler-exact-price` or `crawler-max-price` **and** sign the request with Web Bot Auth; unsigned bots get the 402. Cloudflare is Merchant of Record; payout is **monthly** through a **dedicated Cloudflare Stripe Connect account** ("Pre-existing Stripe accounts are not compatible"), subject to "settlement periods and minimum payout thresholds"; "Your accrued balance is not currently visible in the dashboard. You can request balance updates from your Cloudflare team." | Only crawlers that have on-boarded to Cloudflare's programme can ever pay; a crawler that has not simply loses access (or is set to Allow). The docs name no paying crawler. The W42 trigger's "at least one paying crawler" is still unmet by any primary text. |
| FAQ: a single price for all charged crawlers; "Setting [search engine crawlers] to Block or Charge may negatively impact your site's SEO".                                                                                                                                                                                        | Googlebot/Bingbot must stay on Allow — the stats pages' only route to the 7 indexed pages and 22 impressions/7 d we have.                                                            |

## Crawler hits on the stats pages

Read 2026-10-17 17:28 UTC by the metrics job dispatched from this run (Daily numbers row, `stats crawlers:` clause;
job log `gankdat metrics` #247):

| Surface and window                                                                 | Requests | From AI crawler families                                                                                                                                                                 | Note                                                                                                                                                                                                                                                          |
| ---------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/stats…` seen by the Worker, 7 days (Workers Logs, needle `/stats`, limit 1,000)  | ≤ 18     | **0**                                                                                                                                                                                      | 18 log lines mention `/stats` in 7 days and none is the structured request line (`"path":"/stats…"`), so they are invocation request lines or wave output; either way the Worker sees at most ~2–3 stats fetches a day — the pages are cached at the edge (`Cache-Control`), so most fetches never reach it. |
| `/stats…` at the zone edge, 30 days (GraphQL `httpRequestsAdaptiveGroups`)          | n/a      | n/a                                                                                                                                                                                        | The CI token lacks Zone Read / Zone Analytics Read (`Actor … does not have permission`); handoff filed in `docs/ALERTS.md` 2026-10-17. This is the only reading that counts edge-cached fetches; the clause fills in once the token gains the two read permissions. |
| `/mcp`, 30 days (Analytics Engine `gankdat_traffic`, user agent in blob2)          | 63,763   | **236** (0.37 %): Claude-User 193, PetalBot 24, Amazonbot 12, ClaudeBot 2, Applebot 1, Google-Extended 1, PerplexityBot 1, DuckAssistBot 1, Meta-ExternalAgent 1; GPTBot, Bytespider, CCBot **0** | The long-window proxy for how much AI-crawler traffic this domain attracts at all. 193 of the 236 are `Claude-User` — a person asking Claude to fetch gankdat, i.e. a prospect, not a training crawler; charging or blocking it would turn away the only agent traffic that converts. |
| Search Console, 7 days to 10-16                                                    | —        | —                                                                                                                                                                                          | 22 impressions, 0 clicks, 7 of 19 stats pages indexed — the search engines the FAQ says to keep on Allow are the pages' only human discovery channel.                                                                                                             |

The W42 trigger asked for ≥ 100 AI-crawler fetches a day on the stats pages. The best available reading is 0 a day at
the Worker and, as an upper bound, 236 across the whole domain's busiest surface in 30 days (≈ 8 a day) — two
orders of magnitude short, before asking which of those crawlers has on-boarded to pay.

## The monthly take (arithmetic, not a forecast)

`take = AI-crawler 200s on /stats… per month × price`, charged only to crawlers that have on-boarded to Cloudflare's
programme and signed with Web Bot Auth (the docs name none).

| AI-crawler fetches / 30 d                                   | at US$0.001 (the minimum) | at US$0.01 (the docs' example) | at US$0.05 |
| ----------------------------------------------------------- | ------------------------- | ------------------------------ | ---------- |
| 0 (what the Worker saw, 7 days scaled)                      | US$0                      | US$0                           | US$0       |
| 236 (the whole domain's `/mcp` AI share, as an upper bound) | US$0.24                   | US$2.36                        | US$11.80   |
| 3,000 (the W42 threshold, ≈ 100 a day)                      | US$3                      | US$30                          | US$150     |
| 30,000 (10× the threshold)                                  | US$30                     | US$300                         | US$1,500   |

Against: Enterprise plan + Bot Management (four to five figures a year), a dedicated Stripe Connect account, monthly
payout with a minimum threshold and a balance only Cloudflare's team can report. Even the 3,000-a-day row would not
pay the plan; and 43 of the 236 real hits are search-adjacent crawlers (Applebot, Google-Extended, Amazonbot, PetalBot)
whose charging the FAQ warns costs indexing.

## Recommendation: decline for now, re-read on two dated facts

- **Not eligible.** Charging is Enterprise-with-Bot-Management and the programme is a closed beta; there is nothing a
  £0 toggle can switch on. STRATEGY §5 score: evidence 3 (primary docs, negative) × reach 1 ÷ 0.1 days is high only
  because the effort is nil — the gate it fails is "no policy/plan barrier", so the score is moot.
- **The money is small even when eligible.** At today's traffic the take is US$0 at any allowed price; at the whole domain's AI share (236
  fetches / 30 d, mostly `Claude-User`, a prospect) it is US$0.24–11.80 a month; the W42 threshold of 100 a day would be
  US$30 a month at US$0.01 — none of it covers an Enterprise plan, and the one crawler family that visits (Claude-User)
  is the one we want unmetered.
- **What to keep.** The `stats crawlers:` reading now lands in every Daily numbers row (logs 7 d, zone 30 d, `/mcp`
  30 d), so the AI-crawler share of the register pages is measured from today; the robots.txt stays welcoming
  (AGENT-DISCOVERY.md) because those fetches are the stats pages' only discovery channel besides Google.
- **Triggers to re-score** (written into the parked idea): (1) `what-is-pay-per-crawl` or the AI Crawl Control plan
  table drops the beta / Enterprise wording — i.e. Pay Per Crawl becomes available on Free or Pro zones (read at the
  monthly exchange through the relay, same two URLs); **and** (2) the zone reading shows AI-crawler fetches of
  `/stats…` ≥ 3,000 / 30 d (≈ 100 a day, the W42 threshold) so that US$0.01 a crawl is ≥ US$30 a month. TollBit
  (the alternative the W42 exchange named) was not read this run: its terms were not in the spike and it needs a
  DNS/proxy change on the zone, which is a build, not a toggle — it gets its own spike only if (2) fires first.
