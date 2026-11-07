# Spike: Whop as the developer-audience shelf for the Claude Code operations kit

Queue item `new-ventures/spike-whop-claude-code-kit-shelf` (burn-down, 2026-11-07 21:35–21:45 UTC). Sources: the fetch
relay this run — `docs/relay/responses/whop-kit-2026-11-07` (docs.whop.com fees, set-up-payouts and payout-methods;
whop.com seller terms and community guidelines; six Claude Code storefronts and the marketplace search rendered) — and
the kit's RESEARCH.md (Leanpub's terms and counts, 10-31). Figures marked *index* are WebSearch snippets of 11-07. The
question: does Whop's marketplace bring buyers for the handbook + Extras zip at US$19/29 without a new identity step
for the owner (rule of 2026-10-29: none under score 10), and what does a sale net.

## 1. The shelf's terms

| Source (relay 11-07) | What it says | Consequence |
| --- | --- | --- |
| docs.whop.com/fees | "Card processing 2.7% + $0.30"; "Everything enabled, tax collected 6% + $0.30" (the stacked optional fees); "International cards and currency conversion add to the base"; payout by "local bank transfer in your country and currency (timing varies by country)"; no monthly fee | base cost US$0.81 on a US$19 sale, US$1.08 on US$29 |
| whop.com/seller-terms | "our Financial Partners and applicable law require we **verify your identity upon onboarding** and while you have an open Whop account. Approval can be revoked at any time." | a new identity verification on a new service — the 2026-10-29 owner-time rule bars it for work scoring under 10 |
| seller terms, tax | Whop Collects and Remits Mode (Whop as merchant of record for VAT) is "available only in jurisdictions Whop supports … currently 18 U.S. states, the United Kingdom, and EU member countries", at "a fee of 2% per transaction" on top | UK and EU VAT handled for +2 %, as Leanpub handles it inside its 20 % |
| set-up-payouts | withdraw "at any time, as long as you meet the minimum withdrawal threshold of $10"; funds "according to your schedule and reserve policy" | low floor (Leanpub's PayPal floor is US$20) |
| whop.com/guidelines | prohibits "false, misleading, or unsubstantiated information", "false earnings claims", "misleading product descriptions", fake reviews and inflated metrics; external links in content are not allowed; no rule on AI-generated products in the guidelines or the seller terms | the kit's honest copy passes; the disclosure stays in the book and the listing |

## 2. Claude Code products on Whop (rendered 11-07)

The marketplace search page (`/discover/search/?q=claude code`) rendered as Whop's AI "blueprints" shell with no
listings (11 failed sub-requests), so the six storefronts the index named were read one page at a time.

| Storefront | Product | Price | Counts on the page |
| --- | --- | --- | --- |
| whop.com/claude-code-templates ("WhopFlow") | Done For You: Claude Code Blueprints | US$9 / month (US$99 tier) | 4.6 stars, 79 reviews; "100 users" |
| whop.com/digital-products-9b3e | Motion Video Director — a Claude Code skill | US$4.96 (US$7.52 list; US$5.96 / month tier) | 5.0 stars, 5 reviews; 1.2K community members |
| whop.com/joined/the-claude-code-playbook | The Claude Code Playbook: The Basics | US$97 (US$121.25 shown struck) | no review or member count |
| whop.com/content-engine-hq | The Content Engine (Claude Code content folder) | US$47 (US$19–32 add-ons) | no count |
| whop.com/master-claude-ai | Claude Code Complete Course (unofficial guide) | US$29.99 | no count |
| whop.com/ship-with-claude | Ship With Claude (30-day course) | no price in the text | no count |

Reading: the category exists and two stores show buyers (79 reviews on a US$9/month blueprint subscription; 5 reviews
and 1,200 members on a US$5 skill), but no page shows a sales count and four of six show no social proof at all; the
shape that sells here is a subscription or community, not a one-off handbook. Prices for one-off Claude Code
products run US$30–97, well above Leanpub's US$19–39 band for the same buyer.

## 3. Economics against Leanpub

| Shelf | List | Net per copy | Note |
| --- | --- | --- | --- |
| Leanpub, book only / Package | US$19 / 29 | **US$15.20 / 23.20** (80 %) | 60-day refund hold; PayPal payout at US$20 |
| Whop | US$19 | **US$18.19** (US$17.81 with the tax mode) | 2.7 % + US$0.30 + processing; international and currency lines if they apply |
| Whop | US$29 | **US$27.92** (US$27.34 with the tax mode) | |

## 4. Call

**Park — on the identity step, not the economics.** Whop nets more per copy than Leanpub (US$17.81 vs 15.20 at US$19;
27.34 vs 23.20 at US$29), charges no monthly fee, pays to a UK bank from a US$10 floor and handles UK VAT for 2 %. But
its seller terms make identity verification a condition of onboarding on a new account, and the owner-time rule
(2026-10-29) does not ask the owner for a new identity verification for work scoring under 10 — this line scores 4
(two of six rival pages show any buyers, none shows sales, and the marketplace's own search is not readable from
outside). The handbook's demand test stays the Leanpub listing (action 038).

- **Trigger (exchange.json `whop-claude-code-kit-shelf`):** the Leanpub day-60 read shows ≥ 10 copies sold *and* the
  owner volunteers an identity check on a new service in the same batched request → a kit item writes the Whop
  listing from the Leanpub pack (≤ 0.2 day; Collects and Remits on; book-only and Package tiers at the Leanpub prices)
  and the owner's step is the sign-up and upload (~15 min).
- **Learned for other shelves:** when a shelf with an identity gate is compared, Whop is the better of the two
  identity-gated developer shelves read so far (Udemy: Persona check, 37 % on organic sales, 30 minutes of video
  required; Whop: KYC, 2.7 % + 30¢, files as they are).
