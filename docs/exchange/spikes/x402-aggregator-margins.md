# Spike: x402 aggregator margin map

Research spike `spike-x402-aggregator-margins` (new-ventures queue, build routine, 2026-10-17 17:10 UTC). Decides
the parked exchange idea `x402-aggregator-mcp` (owner 2026-10-11: a gateway that proxies many Bazaar-listed x402
APIs for agents at a 20–40 % markup). Question: at the volumes the Bazaar itself reports, what would such a
gateway net per month, which upstreams allow proxying, and where do agents pay most?

## Sources (primary, read this run)

- Coinbase CDP x402 discovery API, keyless: `GET /platform/v2/x402/discovery/resources`, pages 0–700 of a catalogue
  of **47,204** resources (34,668 on 2026-10-14), each with `quality.l30DaysTotalCalls` and `l30DaysUniquePayers` —
  relay `x402-margins-2026-10-17` (17:13 UTC) and `x402-margins-terms-2026-10-17`.
- CDP docs `x402/core-concepts/facilitator` (fee table) and `x402/bazaar`.
- Upstream terms: Exa Labs Terms of Service (PDF at exa.ai), X Developer Policy (docs.x.com), CoinGecko API pricing
  and terms (WebSearch; the terms page answered 403 to the relay), DexScreener API reference (rate limits), Polymarket
  ToS (page is client-rendered; nothing readable through the relay).
- Analysis script: the sandbox's `margins.mjs` over the relay bodies; categories by keyword on name, description and
  tags (crypto/token data, web search/scrape/social, AI generation/inference, people/company enrichment,
  utility/finance/compliance data, commerce/payment rail, other).

## The market (top 500 by the catalogue's own ranking, 30 days to 2026-10-17)

| Measure                                                                   | Value                                                                                                                                                  |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Paid calls / payer-slots / sellers / hosts                                | **604,338** calls, 18,886 payer-slots, 206 `payTo` addresses, 234 hosts                                                                                |
| Excluded as not proxyable                                                 | Bitrefill invoices at US$1,000 (gift cards, 58 calls), a CoinMarketCap route priced 10¹⁰ (misconfigured), two Keyring "execution fee" routes, Laso prepaid cards — commerce, not data |
| Proxyable resources (488)                                                 | 574,589 calls, **US$9,970** gross spend                                                                                                                 |
| …of which one entertainment endpoint (ax1.vc "token verdict", US$0.02)    | 336,969 calls, 3,085 payers, **US$6,739** — 68 % of all proxyable spend                                                                                 |
| Proxyable minus that outlier                                              | 237,620 calls, **US$3,231** spend, 29 resources ≥ 1,000 calls, 4 ≥ 10,000; top 5 = 81 % of calls                                                       |
| Median resource                                                           | 35 calls / 30 d (p75 98, p90 417); 201 of 488 have ≥ 10 payers, 79 have ≥ 50                                                                           |
| Prices                                                                    | min US$0.001, p25 0.002, **median 0.005**, p75 0.01, p90 0.03                                                                                           |
| Resources 501–700                                                         | add US$229 of spend in total — the tail is empty                                                                                                       |
| Like-for-like with 2026-10-14 (top 200)                                   | calls 518,867 → 586,070 (+13 % in 3 days), payer-slots 17,160 → 15,091, proxyable spend US$11,398 → US$9,622                                           |
| Networks                                                                  | Base 456 of 488, Solana 27, Base Sepolia 5                                                                                                             |
| gankdat                                                                   | not in the catalogue yet (listing item `x402-bazaar-listing` queued in gankdat.json)                                                                   |

### Where agents pay (proxyable, 30 days)

| Category                           | Resources (≥ 100 calls) | Calls   | Payer-slots | Spend        | 30 % markup at 100 % capture, after fee |
| ---------------------------------- | ----------------------- | ------- | ----------- | ------------ | --------------------------------------- |
| Crypto / token data                | 260 (70)                | 401,638 | 14,175      | US$8,193     | US$2,056 (US$34 without ax1.vc)         |
| Web search / scrape / social       | 92 (27)                 | 51,615  | 1,237       | US$780       | US$182                                  |
| AI generation / inference          | 30 (6)                  | 90,446  | 869         | US$515       | US$64                                   |
| People / company enrichment        | 12 (4)                  | 1,759   | 107         | US$320       | US$94                                   |
| Utility / finance / compliance     | 54 (8)                  | 14,035  | 994         | US$81        | US$10                                   |
| Other                              | 40 (6)                  | 15,096  | 1,238       | US$81        | US$9                                    |

The three categories where agents pay most are crypto/token data (dominated by one entertainment endpoint and
"smart money" trade feeds), web search / social (Exa and X-search resales, Google Trends scrapes) and people
enrichment (PDL and FullEnrich resales at US$0.15–0.28 a call). Our own category — registers, filings, sanctions,
company data — is 54 resources and US$81 a month in total: SEC EDGAR filings 74 calls / 29 payers at US$0.003, OFAC
wallet screens 12 / 10 at US$0.001, WHOIS 303 / 4 at US$0.02, no UK or EU register anywhere in the top 700.

## The margin model

Cost side (CDP facilitator docs, read 2026-10-17): "The first 1,000 onchain Facilitator transactions each month are
free, then each additional onchain transaction costs $0.001"; verification is free; batch-settlement vouchers can
claim thousands of payments in one onchain transaction (a seller-side saving once built; the upstream's settlement is
the upstream's cost). A gateway settles one payment in (agent → us) and makes one payment out (us → upstream) per
call; the markup must cover our settlement fee and any upstream price moves.

| Capture of proxyable spend minus the outlier (US$3,231 / 237,620 calls) | 20 % markup | 30 % markup | 40 % markup |
| ------------------------------------------------------------------------- | ----------- | ----------- | ----------- |
| 100 % (the ceiling: every paid call in the top 500 routed through us)     | US$408      | **US$731**  | US$1,054    |
| 10 % (23,762 calls a month)                                               | US$42       | US$74       | US$106      |
| 5 % (11,881 calls)                                                        | US$21       | US$38       | US$54       |
| 2 % (4,752 calls)                                                         | US$9        | US$16       | US$22       |

Including the entertainment outlier at 10 % capture and 30 % markup: US$295 — and that endpoint is already the
best-known resource in the catalogue, so a gateway adds nothing an agent cannot do with one direct call.

Per-call reality: a 30 % markup on the median US$0.005 call is US$0.0015. For **187 of 488** resources the 30 %
markup is at or below the US$0.001 settlement fee; for 278 it is at or below two fees. Weighted by calls, 17 % of all
paid calls cannot carry a 30 % markup past our own fee. The margin only exists on calls priced ≥ US$0.01 — enrichment,
Google Trends, image/video generation — which are 25 % of resources and, outside enrichment, the ones whose upstream
terms forbid resale (below).

Comparable in the wild: stableenrich.dev resells Exa `/search` at US$0.01 against Exa's own US$0.007 and takes
19,676 calls / 167 payers a month to Exa's 5,143 / 93 — the W42 "best reseller": US$0.003 gross a call, about
US$59 a month gross and ~US$40 after fees. That is the measured top of the resale shape, three days later and
unchanged.

## Who allows proxying (upstream terms, primary text)

| Upstream (what the volume resales wrap) | Terms read                                                                                                                                                                                                                                   | Proxying |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| Exa (web search, the biggest resale)    | Terms of Service §1.1: licence is "non-sublicensable"; §3(e) "resell, lease or sublicense the Services to any third party without our prior consent"; §3(a) no "offer for sale any information … obtained from or through the Services"       | only with Exa's written consent — the catalogue's top reseller is off-terms by default |
| X / Twitter (five search resales)       | Developer Policy, "Content redistribution": "we restrict the redistribution of X Content to third parties … you may only distribute Post IDs, Direct Message IDs, and/or User IDs"; Developer Agreement licence "non-sublicensable" (2026-04-27) | no — the X-search sellers themselves breach it; a proxy inherits the breach |
| Google Trends (three sellers)           | no public API exists; the sellers scrape Google, whose terms forbid automated access                                                                                                                                                          | no |
| CoinGecko (price resales)               | API pricing page: commercial plans "cannot resell or sublicense the API"; redistribution and white-labelling need an Enterprise plan; attribution required                                                                                    | no without Enterprise |
| DexScreener (token feeds)               | API reference: public, 60 requests/minute per endpoint, no key; no resale clause on the reference page                                                                                                                                       | tolerated, rate-capped |
| Polymarket (market data)                | ToS page client-rendered, unreadable through the relay; CLOB/Gamma data endpoints are public                                                                                                                                                 | unverified |
| Bazaar sellers themselves               | anonymous x402 routes with no terms page in the listing; the CDP metadata carries no licence field                                                                                                                                           | nothing to agree to, nothing to rely on |

So the categories that carry a markup above the fee (enrichment, search, social) are exactly the ones whose
underlying licences forbid resale; the categories that permit it (public token feeds, DexScreener) price at
US$0.001–0.005 where the markup is swallowed by the settlement fee.

## The layer already exists, free

WebSearch 2026-10-17: `x402node/x402-mcp` (npm `x402node-mcp`) auto-discovers the Bazaar every five minutes and
exposes 100+ paid APIs as MCP tools; the agent's own wallet pays each upstream directly, no markup (`MAX_PRICE_USD`
cap, default US$0.10). The glama "x402 MCP Gateway" and daydreams' `xgate` do the same with a gateway wallet; the
discovery MCPs (`x402-discovery-mcp`, `x402search-mcp` at US$0.01 a search) sell the catalogue lookup, not the calls.
An aggregator at a markup therefore competes with free local software that pays the seller at list price.

## Recommendation: park (with a number)

- At the whole-market ceiling a 30 % gateway nets **≈ US$730 a month**; at a realistic 2–10 % capture **US$16–74**,
  before any build or wallet float. Score on STRATEGY §5: evidence 3 (measured, negative) × reach 1 ÷ 2 days = **1.5**
  — below every open gankdat item.
- The margin exists only where resale is forbidden (Exa, X, Google Trends, CoinGecko) and vanishes where it is
  allowed (public token feeds at US$0.001–0.005 against a US$0.001 fee).
- Keep what the spike confirms is worth having: our own listing (`x402-bazaar-listing`, queued) — a seller keeps 100 %
  of the price and the catalogue's register slots are empty — and the monthly Bazaar read as the market gauge.
- **Trigger to re-score:** proxyable spend in the top 500, excluding the ax1.vc outlier and commerce routes, reaches
  **≥ US$30,000 / 30 days** (10× today) with a non-crypto category ≥ US$5,000, read by the same script at a monthly
  Bazaar read; or a major upstream (Exa, X) publishes an x402 reseller programme in writing. Until then the idea stays
  parked and no further spike is spent on it.
