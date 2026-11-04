# Spike: a second agent-payment rail beside x402 for gankdat's per-call routes

Queue item `new-ventures/spike-agent-payment-rails` (build, 2026-11-04 09:10–10:40 UTC; seeded by the W45 exchange,
`docs/exchange/2026-W45.md` §Scoring 5). Sources: four relay rounds this run (`agent-rails-spike-2026-11-04`, `-2`,
`-3`, `-4`: Skyfire's developer portal and services agreement, its keyless directory API, Nevermined's pricing, docs and
catalogue pages, ap2-protocol.org and the AP2 repository README, Stripe's agentic-commerce and machine-payments docs,
PayAI's docs, pricing JSON and discovery catalogue, facilitator.x402.rs, thirdweb's pricing and portal, x402scan
rendered, and two third-party facilitator comparisons; pruned after 7 days). gankdat's own x402 lane figures from the
11-04 Daily numbers row (`x402 30d: 40 paid, 13 clients — buyers 17 paid, 7 clients, repeat 1`; `bazaar: 16 listed,
54 calls/30d, 48 payers`) and `src/lib/constants.ts` (US$0.005 default, US$0.01 uk-company-profiles).

The question: does any rail beside the Coinbase CDP x402 lane take an individual seller at 0 owner identity steps,
what does it keep per call, does its catalogue or on-chain index show a buyer pool for data lookups that the CDP
Bazaar does not, and can a Cloudflare Worker serve it? Promote = one ≤ 1-day gankdat listing item at 0 owner identity
steps; park on KYC/KYB, a card, or an empty catalogue.

## 1. The per-rail table

| Rail | Identity an individual seller needs | Fee kept per call | Payout | Buyers for data lookups (the rail's own numbers) | Worker fit | Owner steps |
| --- | --- | --- | --- | --- | --- | --- |
| **Coinbase CDP x402** (what gankdat runs) | CDP account held since W42; a funded Base wallet | first 1,000 settlements a month free, then US$0.001 each; the seller keeps 100 % of the price | USDC to our wallet on settlement | x402scan, cumulative: **2.91 M requests, US$606.77K, 28.96K buyers, 7.42K sellers**; past 24 h 267,024 transactions, 2,511 buyers; our listing: 54 calls / 48 payers in 30 d, 17 buyer calls from 7 clients | in production | 0 (done) |
| **Skyfire** (Skyfire Systems Inc., US) | email magic-link account; a *seller agent* created in the dashboard; each service **reviewed by Skyfire, "typically 48 hours"**; KYA verification optional and **"requires a subscription"** (Individual plan, price not published) | **"Skyfire does not currently charge a fee"** (Services Agreement §3.4, 25 June 2025; 30 days' notice of any new fee) | off-chain wallet; a token settles after its expiry + 24 h grace within 3 h, **up to ~51 h**, sooner past US$1.00; withdrawal terms not on any page read | directory API (keyless): **75 services from 38 sellers**, 58 of 75 with an unverified seller, 22 from one no-code vendor (BuildShip); no call or buyer counts anywhere; data-like services: `companyResearcher` US$0.01, `researchCompetitors` US$0.01, `Ai Compliance` US$0.01, x402node's crypto feeds; 2 services are literally named `test` | yes: verify a JWT against Skyfire's JWKS per request, deliver, then one `Charge Token` API call — no chain, no daemon | **1** (a Skyfire account in the owner's name; a seller is "a person or an organization" with "a single verified identity") |
| **Nevermined** (Nevermined AG, Zug) | free personal account (20 agents, 10 plans) can *sell*; **listing in the AI Services Catalog needs a paid organization tier — Starter US$50 a month lists one service** — or an email review that is "not guaranteed and slower" | **1 %** of a stablecoin plan, **~2 %** of a card plan (`["9800000","200000"]` split in the registration guide) | USDC/EURC on Base to the seller's wallet; fiat via a connected **Stripe Connect** account | catalogue: **160 vetted paid services** "for search, scraping and data" (Exa and You.com are the named sellers, selling API keys at US$5–7); the app's per-service pages sit behind a login; no call or buyer counts public | yes: the seller side is a 402 → `/verify` → `/settle` flow against Nevermined's facilitator, the same shape as x402 (the docs call MPP "the plan-model sibling of x402") | **1 + a card**: an account, and either US$50/month or an unguaranteed email review |
| **Google AP2** (v0.2, donated to the FIDO Alliance, April 2026) | no rail to join: a specification for *mandates* (signed credentials) between a Shopping Agent, a Credentials Provider, a Merchant and a **Merchant Payment Processor**; "the specific APIs for communication between the different roles are outside the scope" | none of its own; the Merchant's PSP charges its normal card fees | through the Merchant's own PSP | none: no catalogue, no directory, no micro-prices; the current version "supports common 'pull' payment methods like credit and debit cards" | a Worker could sign a Checkout JWT and verify a Checkout Mandate, but there is nothing to list and no PSP of ours that speaks it | n/a — nothing to sell on |
| **Stripe agentic payments** (MPP cards, MPP/x402 stablecoins) | the owner's existing Stripe account plus a Stripe *profile*; card payments by **Shared Payment Tokens: minimum US$0.50**, "available to agents, customers, and sellers in the US, Canada, and select European countries"; **stablecoins: "available to businesses in all US states, except New York"**, elsewhere "email machine-payments@stripe.com with your Stripe account ID to request access … in more than 30 countries" and Stripe "reviews your access request" | Stripe's card pricing on SPTs; stablecoin fee not stated on the pages read; **Stripe's x402 path "settle[s] through the Coinbase Developer Platform (CDP) facilitator"** with a Stripe deposit address as `payTo` — the same lane, off-ramped into the Stripe balance | into the Stripe balance on the normal payout schedule | **the same buyers as today**: Stripe adds no catalogue or index; MPP's card buyers come from the Link Agent Wallet at ≥ US$0.50 a call, 50–100× gankdat's price | yes (402 middleware, `mppx` or the `@x402/hono` stack already used) | **1** (an access request from the owner's Stripe account, reviewed by Stripe) for stablecoins; cards need a different product at ≥ US$0.50 |
| **PayAI** (PayAI Network, LLC, Delaware; x402 facilitator) | **none**: "no sign-up or API key needed", 1,000 free credits per receiving wallet; after that credits bought in the merchant portal or by an agent over x402 | **per settlement, never a percentage**: Base `exact` **1.97 credits = US$0.00197** on 11-04 (on-chain gas + 30 %, refreshed daily) — about twice CDP's US$0.001, and CDP's first 1,000 a month are free | USDC to our wallet (the facilitator only submits the transfer) | its own Bazaar: **15,115 resources**; top 500 carry no call or payer counts (CDP's `quality` block is absent), 93 `payTo` addresses, 649 of 1,100 `accepts` on Solana; x402scan, cumulative: **456.33K requests, US$22.26K, 1.27K buyers, 1.14K sellers** — buyers ≈ sellers, i.e. mostly self-tests; past 24 h 8,463 transactions and **111 buyers against Coinbase's 2,511 (4 %)**; company-data rows in the top 500: 33 (VAT checks, SEC snapshots, firmographic enrichment, Indonesian holidays), no UK or EU register | yes: a one-line facilitator URL swap (`X402_FACILITATOR_URL`) — but the Worker's lane takes **one** facilitator, so a PayAI listing means moving the whole lane or adding a second route prefix | 0 |
| **thirdweb** (x402 facilitator) | a thirdweb account, a project secret key and a thirdweb **server wallet** that "execute[s] transactions gaslessly" (EIP-7702) | **0.3 % per transaction** (pricing page, "Fee % on each transaction executed through facilitator") | USDC to the server wallet | no catalogue of its own; not among x402scan's listed facilitators on 11-04 | yes (middleware) | **1** (account + wallet custody at thirdweb) |
| **x402.rs** | — | — | — | `facilitator.x402.rs` now reads **"Test x402 payments on real infrastructure. Free. Testnet only."**, operated by FareSide, "when your integration is ready for mainnet, fareside.com is where you go next"; fareside.com did not answer the relay | — | not a mainnet rail today |
| Others on x402scan (24 h) | FluxA 23,099 transactions for **US$90.96** (191 sellers, 804 buyers — sub-cent bot traffic); Ultravioleta DAO 1,014 for US$257.97 with **371 sellers = 371 buyers**; Daydreams 163 / US$139.63 / 1 seller; Meridian 117 / US$3.87K / 7 sellers | | | none reaches a hundred distinct real buyers a day | | |

## 2. What the numbers say

- **The buyer pool is not split by facilitator; it is split by catalogue.** Any x402 client with a Base USDC wallet
  can pay any Base seller whichever facilitator that seller uses; what differs is where an agent *finds* the route.
  x402scan's cumulative index puts Coinbase's facilitator at 28.96K buyers and 7.42K sellers; PayAI's at 1.27K and
  1.14K. A pool where sellers ≈ buyers is a pool of sellers testing their own routes. The past-24-h split (2,511 vs
  111 buyers; Base 3,771 buyers across 11 facilitators vs Solana 111) says the same thing on the day.
- **Nothing read shows a data-lookup buyer that the CDP Bazaar does not already reach.** Skyfire's 75-service
  directory has no usage numbers at all; Nevermined's 160 are search, scraping and inference resold at the rails'
  own prices; PayAI's top 500 are Solana trading feeds, an OpenAI-compatible inference proxy and sub-cent utility
  routes. The one shape that does sell to agents on every rail is the same one the 10-17 margins spike found on
  Coinbase's: crypto data, web search and people enrichment.
- **The fee question is moot.** CDP keeps US$0 of our first 1,000 settlements a month and US$0.001 after; PayAI
  US$0.00197 per settlement; Nevermined 1–2 %; thirdweb 0.3 %; Skyfire 0 % today. At gankdat's US$0.005–0.01 a call
  and 40 paid calls a month, no rail's fee changes the number that matters, which is buyers.
- **Every rail but PayAI costs an owner identity step** (a Skyfire account, a Nevermined organization and card, a
  Stripe access request reviewed by Stripe, a thirdweb account with wallet custody), and the owner-time rule of
  2026-10-29 spends one only for work scoring ≥ 10. PayAI, the one rail at 0 steps, is the one whose index shows the
  smallest and most self-referential buyer pool.
- **x402scan's own listing is keyless.** Its "Add your API" page is a single URL field with no sign-in, and its
  index counts 33.81K buyers in 30 days — the widest agent-facing read of x402 there is. Round 4 (see §4) checks
  whether gankdat's routes are already indexed from the CDP-settled payments; if they are not, that submission is the
  one ≤ 0.1-day listing step this spike found at 0 owner steps, and it rides on the existing lane rather than a
  second rail.

## 3. The call: PARK

No second rail is promoted. The promote condition — a ≤ 1-day gankdat listing item at 0 owner identity steps that
reaches a buyer pool the CDP lane does not — is not met by any rail read:

| Rail | Why not now | Re-open when |
| --- | --- | --- |
| Skyfire | an account in the owner's name for a directory of 75 services with no usage numbers and a 48-hour review per service; settlement up to 51 h off-chain; 0 % fee is not a reason to spend an identity step | the directory publishes call or buyer counts, or Skyfire's `Live Implementations` page names a data seller with a number; then score it against the owner-time rule |
| Nevermined | US$50 a month to be listed (the free account can sell but not be found), a card, an account; 160 services of search/scrape/inference | a free listing path for individuals, or a named data seller's volume on its catalogue |
| Google AP2 | not a rail: card mandates through a PSP; nothing to list; no micro-prices | a PSP of ours (Stripe) ships an AP2 merchant endpoint with per-call pricing below US$0.50 |
| Stripe MPP / x402 | same buyers (its x402 path settles through the CDP facilitator); stablecoins outside the US are an access request Stripe reviews; cards floor at US$0.50 | Stripe opens stablecoin machine payments to UK accounts self-serve, or MPP buyers show up on x402scan as a pool distinct from x402's |
| PayAI | 0 steps, but 4 % of Coinbase's daily buyers, sellers ≈ buyers cumulatively, Solana-heavy, no usage counts in its catalogue to read a listing by, and ~2× the settlement fee; moving the lane would lose the CDP Bazaar's `quality` row the Daily numbers read | PayAI's x402scan buyers ≥ 25 % of Coinbase's on a 24-h read, or a Base data route in its top 100 with ≥ 100 payers |
| thirdweb | 0.3 % plus an account and wallet custody; no catalogue | never for a listing; only if CDP's facilitator withdraws from UK sellers |
| x402.rs | testnet only since FareSide took it over | FareSide publishes mainnet pricing and a catalogue |

What the spike does recommend, inside the lane we have: (a) the queued `x402-change-feed-route` (6) stays the one
build that widens what the paying agents can buy; (b) the 11-14 `x402-bazaar-day-30` read adds one line from
x402scan's facilitator page (Coinbase vs PayAI buyers, 24 h and cumulative) so the "second pool" question is re-read
for free each month; (c) if round 4 shows gankdat absent from x402scan, submit the routes there as a ≤ 0.1-day step in
the next gankdat build (no account, no money) — see §4.

## 4. x402scan listing check (round 4)

x402scan's front page defines its server table as "top addresses that have received x402 transfers **and are listed
in the Bazaar**", and its Coinbase facilitator page counts 7.42K sellers against the CDP Bazaar's `payTo` set — so a
gankdat route is in x402scan's index on the same condition that put it in the Bazaar in mid-October (a settled payment
through the CDP facilitator with the `bazaar` declaration), not by a submission. The "Add your API" page (one URL
field, no sign-in) is the route in for sellers outside any Bazaar. `/all` is 216–388 rendered pages of servers ranked
by 24-hour activity; a seller at ~1 paid call a day is not on page 1 and the page has no server-side search (`?q=`
renders the same page), so confirming our row needs the wallet address in x402scan's command palette, which a runner
cannot drive. No listing item follows. The 11-14 `x402-bazaar-day-30` read notes x402scan's facilitator split (Coinbase
vs PayAI buyers, 24 h and cumulative) beside the Bazaar clause, which is the free monthly re-read of this spike's
question.
