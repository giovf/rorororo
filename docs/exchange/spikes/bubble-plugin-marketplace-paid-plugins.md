# Spike: Bubble's plugin marketplace as a paid shelf

Queue item `new-ventures/spike-bubble-plugin-marketplace-paid-plugins` (burn-down, 2026-10-24 00:35–00:48 UTC). Sources: three
fetch-relay rounds (`docs/relay/responses/new-ventures-research-2026-10-24`, `bubble-plugin-marketplace-2026-10-24`,
`bubble-plugin-marketplace-b-2026-10-24`, pruned after 7 days): Bubble's help articles (Selling on the Marketplace,
its FAQ, Marketplace payouts FAQ, Marketplace apps, the support policy, the ratings-and-installs article), the manual's
selling page, the Marketplace Policies page, the rendered plugin directory and four rendered plugin listings, and three
forum threads read as Discourse JSON (the commission, a seller's installs-versus-revenue reading, the pricing-model
thread). WebSearch found the URLs and the Companies House plugin. The question the research left open (2026-10-24):
the commission on the policies page, an individual UK seller's eligibility and payout, and whether the data-lookup niche
has small-vendor plugins with buyers.

## 1. The shelf's terms (Bubble's own pages)

| Source | What it says |
| --- | --- |
| Marketplace Policies (`bubble.io/marketplace-policies`, last revised 2024-07-10) | "**Bubble retains a 25% commission on all Plugin License payments.** Bubble will accept payments on Seller's behalf from Buyers in accordance with their billing period and will remit the remainder during the subsequent month." Price range for a Plugin License: **US$3–300** (one-time or recurring; the buyer "pays a recurring subscription fee for the license, which is collected along with Buyer's regular payments to Bubble"). A free plugin cannot be converted to paid — a new paid copy is published and the free one hidden, and its installs and reviews do not carry over. "Bubble may change the pricing guidelines, commission structure, and discounts and promotions at any time." |
| Selling on the Marketplace (help, 2026-08-03) and the manual's page | Sellers register a public seller profile; "payouts are made directly to you, with Bubble taking a fee on each transaction", through a Stripe account in the seller's name with Stripe's identity and tax steps complete; PayPal only where Stripe cannot pay; "if your country is not supported by Stripe yet, you will not be able to sell on the Bubble Marketplace" (the UK is supported). |
| Marketplace payouts: FAQ (2026-06-18) | "Marketplace payouts go out on the 5th of every month" above a threshold the seller sets (a US$5 example); "the 'Plugin Uses' count includes all apps with your plugin installed — even ones without an active subscription. Plugins without active subscriptions are disabled in run mode and don't generate payouts." |
| Selling FAQ (2026) | Ratings and install counts update about twice a day; Bubble does not remove user reviews; plugins and templates may also be sold outside the Marketplace. Review turnaround is in the FAQ's title list but the answer did not render. |
| Support policy (revised 2025-06-09) | Bubble's own support excludes "building and/or troubleshooting custom plugins" and "plugins or templates that are published by third-party developers" — the seller supports buyers. |

## 2. Eligibility and payout for a UK individual

- **Who may sell.** Any Bubble account with a Stripe account in the seller's name; no company, no application, no identity step beyond Stripe's own KYC. A UK individual qualifies today (Stripe-supported country). The seller profile is public (name, city/country).
- **Payout path.** Stripe payout on the 5th of each month for the previous month's collected licence fees, net of 25 %, above a seller-set threshold — effectively no floor (against US$500 Atlassian, US$200 Wix/JetBrains, US$100 Zoho). Stripe's payout to a UK bank is free; Bubble's 25 % is the whole fee.
- **Obligations.** The seller supports buyers (Bubble's support excludes third-party plugins); the plugin must be published without obfuscation issues; price within US$3–300.
- **Owner actions.** None beyond connecting an existing Stripe account (gankdat's) to the Marketplace profile — the lightest owner footprint of any shelf read this month.

## 3. Demand

**The directory cannot be read in bulk**: `bubble.io/plugins` rendered as a shell (its cards load behind the filter controls), so demand comes from four rendered plugin pages, the search index and the forum.

| Plugin (vendor) | Price | Rating (count) | Installs | Note |
| --- | --- | --- | --- | --- |
| **Companies House UK** (Form Data Solutions) — the exact rival of the promote shape | US$5 one-time or **US$2/mo** | 0 ratings | **3** | published 2025-06, updated 2026-04; buyer brings a free Companies House API key |
| Top 15 Plugins bundle (Zeroqode, ~850 plugins, ~60 % of the market per its own sale listing) | US$20/mo | 4.2 (5) | 24.0K | the leader's bundle |
| Stripe Connect – Marketplace | US$249 one-time or US$19/mo | 4.9 (72) | 3.8K | payments, the best-reviewed paid category |
| PayPal Pro Payment + Subscription | US$3 one-time or US$2/mo | 3.0 (1) | 17 | |
| Google Analytics Data API (search index) | US$4/mo or one-time | (2) | 44 | an API-wrapper plugin |
| Elegant Loading (forum thread 276939, seller's own numbers, 2023-08) | US$3/mo or US$16 once | — | **298 installs → ≈ €12/month** | "people install it for a month and uninstall"; installs count trials, churned and one-time buyers |

What the shelf's own sellers say (forum, dated): Zeroqode's founder (2019-01-08) on a scrape that estimated plugin revenues from install counts — "I wish these figures were anywhere close to reality … users install the plugin to try and then unsubscribe"; the payouts FAQ says the same in Bubble's words. So an install count on Bubble is a trial count, and the one seller who published both numbers converts 298 installs into about four paying apps.

**The data-lookup niche**: one plugin (Companies House UK) with 3 installs in 16 months at US$2 a month; no postcode, VAT, sanctions or charity plugin surfaced in the index. Bubble builders reach any REST API through the built-in API Connector for free, which is why API-wrapper plugins sit at tens of installs while payments and UI plugins carry the thousands.

## 4. Gate check (ARCHITECTURE validation gate)

| Gate | Reading |
| --- | --- |
| Buyers with money | Thin — the paid categories with buyers are payments and UI (Stripe Connect 3.8K installs, 72 ratings); API wrappers sit at 3–44 installs; a seller's 298 installs paid ≈ €12/month |
| Recurring job | Yes — monthly plugin subscriptions billed with the buyer's Bubble bill, 25 % to Bubble |
| Paid competitor with a documented gap | No — the one rival in the niche (Companies House UK, US$2/mo) has 3 installs; the gap is demand, not quality |
| ≤ 1 week to build | Yes — a JavaScript element plus server actions over the gankdat API is a day; publishing is self-serve |
| No policy / ToS risk | Yes — first-party shelf, Stripe KYC only, the policies allow API plugins; Bubble may change the commission at any time |

## 5. Promote / park call

The item's promote shape was a 'UK registers' subscription plugin at about US$5–10 a month. Terms and eligibility are the easiest of any shelf read this month (self-serve, Stripe-only, no floor, 25 % flat), and the build is a day. Demand fails: the exact rival has 3 installs after 16 months at US$2 a month, the API-wrapper category sits at tens of installs because Bubble's API Connector does the same job for free, and the shelf's own sellers and FAQ say installs are trials, not subscribers (298 installs → ≈ €12/month).

**Recommendation: park.** A gankdat plugin would be a day's work for a reading of a few dollars a month — below the baseline (STRATEGY §5: evidence 1 × reach 2 ÷ 1 day = 2 against foundry `actions-minutes` at 7). It is also distribution for existing data rather than a new line, so it belongs in gankdat's queue if ever built, not here.

**Trigger** (idea `bubble-plugin-marketplace-paid-plugins`, parked): a gankdat shelf converts (first paying account or ≥ 20 paid Apify runs a month — the buyer-side signal every register idea waits on), or a small-vendor data-lookup plugin on Bubble shows ≥ 200 installs at ≥ US$5 a month (re-read the Companies House UK listing at the 2026-12-01 exchange). Then: a one-day gankdat item (`bubble-plugin-uk-registers`), not a venture.

Numbers in one line: individual **yes** (Stripe KYC only); payout Stripe on the 5th, no floor; commission **25 %**, price US$3–300; rival Companies House plugin 3 installs / US$2 a month; Stripe Connect 3.8K installs at US$19 a month; 298 installs ≈ €12/month for one seller; call: **park**, trigger a gankdat conversion or a 200-install data plugin.
