# Spike: Notion Marketplace paid templates as a shelf for a sole trader

Queue item `new-ventures/spike-notion-marketplace-paid-templates` (burn-down, 2026-10-22 18:27–18:55 UTC). Sources: three
fetch-relay rounds (`docs/relay/responses/notion-marketplace{,-b,-c}-2026-10-22`, pruned after 7 days): Notion's help
page *Selling templates on Marketplace* (English and en-GB copies), the *Marketplace guidelines & terms* page (the
Notion Marketplace Terms of Use), the gallery's server-rendered page data (`__NEXT_DATA__` on the Business Finance and
Freelance category pages, their sub-categories, template pages and a creator page). WebSearch found the help-page URLs
and the third-party storefronts (Gumroad, Payhip, Etsy) where the same bookkeeping templates are sold. The questions
the 2026-10-22 research left open: is the UK eligible and can an individual sell; what is the current fee; and do paid
small-creator templates in a sole-trader operations niche show visible buyers (≥ 10 ratings at ≥ US$10)?

## 1. Eligibility: the UK is eligible; an individual applies, after a waitlist "of a few months"

| Source | What it says |
| --- | --- |
| Help page, *Get verified for payments* | "Notion uses Stripe to process payments. Creators will need to join the waitlist, get approved by the Notion team, and onboard with Stripe to start selling directly on Marketplace." Apply from the creator profile: "Select Apply to provide Notion with information about yourself and your business. You'll be added to a waitlist for review. Please note that it may take a few months to get reviewed, and that Notion may approve or reject submissions at its discretion." |
| Help page, *Eligible countries* | "If you are in the following countries, you are eligible to sell directly on Marketplace" — the list names the **United Kingdom**. "If your country is ineligible, you can still list a paid template, it just must link to a third party site for payment." |
| Terms, *Paid templates* | A creator must "(a) submit such Paid Template to Notion for approval …; (b) sign up and register for an account with the Payment Processor …; (d) submit a creator profile to Notion for approval; and (e) provide ongoing commercially reasonable support to End Users". "You agree to provide the Payment Processor with valid bank account information in your name." Representations: "you are at least 18 years of age (if you offer paid Paid Templates)". No company is asked for anywhere on either page; "yourself and your business" is the application's wording. |
| Terms, agency | "You appoint and authorize Notion as your non-exclusive disclosed commercial agent … Notion may be the listed merchant of record on such Purchase Fee charges." |
| Help page, third-party sales | Without Stripe onboarding a paid listing can "link to 3rd party payment sites" (Gumroad, Payhip …) — the listing is then a referral, and a Notion-sold template's Site URL "will automatically redirect to the checkout page". |

Reading: **eligible, as an individual, but gated by a review queue Notion itself describes as months long** — the one
shelf of the four researched this week (Atlassian, JetBrains, WordPress.org + Freemius, Notion) whose onboarding is a
waitlist rather than a form. Owner actions if the line opens (identity on a service — ask first): a creator profile at
app.notion.com/profile, the "Sell templates with Notion" application, Stripe Express onboarding when approved (bank
account in the owner's name). In the meantime a paid template can be listed linking to a third-party checkout — which is
what the US$15 bookkeeping templates read today do (§3).

## 2. The shelf's terms (help page and Terms of Use, read 2026-10-22)

- **Fee**: "Notion charges a 8% fee plus 40 cents per transaction to cover operational costs, including payment
  processing, purchase support, refund handling, and fraud monitoring" (the English page; the item's 10 % came from two
  localised copies). On a US$15 template: US$1.60 → the creator nets US$13.40 before FX; on US$29: US$2.72.
- **Currency and FX**: "All template sales are in USD. Creators outside the United States receive payments in their local
  currency" and "pay an additional 1% foreign exchange fee for converting their payouts from USD to their local currency".
- **Tax**: "Notion handles regional sales tax or VAT as part of each transaction"; creators handle their own income tax.
- **Payout**: "initiated biweekly on Thursdays at 9am Pacific time and require a minimum balance of $20"; "funds are held
  for 14 days before becoming eligible for payout to account for potential refunds" — first money ≈ 2–4 weeks after a sale.
- **Refunds**: buyers "can request a refund within 14 days of purchase"; Notion may refund at its sole discretion; the
  creator bears the processor's refund fee and any chargeback fees; a negative Stripe balance is netted from future sales.
- **Listing rules**: the template must be a published Notion Site with "Duplicate as template" on; price set at listing in
  USD; *Access locking* "Restricted" stops buyers redistributing it; an email requirement (none / optional / required) at
  duplication; paid templates "may not be offered … as a mechanism to drive direct or off Notion Marketplace sales".
- **Support and discretion**: "You are solely responsible for providing all support"; Notion "reserves the right to not
  list, revoke, suspend, or otherwise remove Your Work" and "may have or develop products or features that may be
  competitive with Your Work".
- **Webhooks**: `marketplace.purchase` / `marketplace.refund` events with `listingPrice`, `taxAmount` and
  `sellerTransferAmount` in cents, and the buyer's email when shared — enough for a ledger row per sale without a login.

## 3. Demand: what the gallery's page data shows (2026-10-22)

Every gallery page is server-rendered with a `__NEXT_DATA__` blob. A category page carries its total and the 24 most
popular templates with the creator's name, template count and Stripe phase (`completed` = sells through Notion,
`disabled` = links out) and, for paid ones, the USD `price`; a template page adds the listing's `installation_count`
and `ratings_attributes` (count, sum, star histogram) and the published reviews. The gallery's old public
`number_of_duplicates` is `-1` on every object read — the duplicate count the item asked for is no longer exposed; the
Marketplace's install and rating counts replace it. Category totals: Business Finance 3,928 templates, Freelance 6,138,
Client Portal 509, Expense Tracker 374, Invoicing 234, Cash Flow Management 120, Contract Management 120, Taxes 76, Side
Hustle 40 (there is no bookkeeping, invoices or accounting category; those live under Invoicing, Cash Flow and Taxes).

Paid templates among the 24 most popular of each fetched category: Taxes 8, Side Hustle 8, Cash Flow 4, Invoicing 1,
Contract Management 1, Expense Tracker 0, Client Portal 0 — 22 in all at US$1–149, median US$12.99. Creators: the
large catalogues (Simo 166 templates at US$149, ZikoTemplates 266, Still Linda 81 at US$9, Capital Acquisition 178,
heyismail.co 664 free-and-linking-out) and a long tail of 1–32-template creators at US$5–39.

**The 19 paid templates read page by page** (every paid listing on the Taxes, Side Hustle, Cash Flow, Invoicing and
Contract Management pages, plus four "business OS" listings the related-templates links surfaced), with the listing's
install and rating counts as the gallery serves them:

| Template | Price | Creator (templates, Stripe) | Listed | Installs | Ratings |
| --- | --- | --- | --- | --- | --- |
| One-Person Business OS | US$9.99 | The Blueprint (99, Notion) | Oct 2026 | 1 | 0 |
| Freelance Business Tracker | US$29 | TechEd Analyst (1, links out) | Oct 2026 | 0 | 0 |
| Freelance Invoice & Payment | US$69 | ZikoTemplates (266, Notion) | Oct 2026 | 0 | 0 |
| Freelance Income / Expense / Stock & Reorder / Business Subscription Tracker | US$9 each | Still Linda (81, Notion) | Oct 2026 | 0 | 0 |
| Side Hustle OS | US$10 | Flow OS (13, links out) | Oct 2026 | 0 | 0 |
| Side Hustle Empire | US$9.99 | Dami (32, Notion) | Sep 2026 | 0 | 0 |
| GovCon Command Center | US$79.98 | Nexus Template Co (11, Notion) | Sep 2026 | 0 | 0 |
| Freelancer Tax Tracker | US$29 | Ozan (10, Notion) | Aug 2026 | 0 | 0 |
| Self-Employed Tax Command Center | US$49 | Capital Acquisition (178, links out) | Aug 2026 | 0 | 0 |
| Backstage Books | US$39 | Gig Flow Solutions (2, Notion) | Jun 2026 | 0 | 0 |
| Freelance Tax Vault – Pro | US$12.99 | H. S. Patil (59, links out) | Jun 2026 | 0 | 0 |
| The Freelancer Tax HQ | US$12 | Not your tax guy (1, links out) | May 2026 | 0 | 0 |
| Freelancer Tax Desk | US$15 | Deeke Business (22, started) | Apr 2026 | 0 | 0 |
| Business Owner OS | US$59 | System4Business Co (421, Notion) | Aug 2026 | 0 | 0 |
| Series A Operations OS, Tax Practice OS | US$149 each | Simo (166, Notion) | Oct 2026 | 0 | 0 |

For scale, the free *Mini business finance tracker* next to them (Gabi, 26 templates, Notion-onboarded) shows
**3,210 installs and 50 ratings at 4.9★** with five published reviews, and a free *Finance Flow* (System4Business Co)
36 installs — so the counters are live for free templates. Whether a paid purchase increments `installation_count`
the same way is not stated anywhere read; one paid listing shows 1, the other eighteen 0, and none has a rating, so
either paid sales are not counted (then the gallery shows no buyer signal at all for paid work) or these listings have
sold at most once each in April–October 2026. Both readings fail the item's condition.

Reading against the item's bar (≥ 3 paid small-creator templates in the niche with ≥ 10 ratings at ≥ US$10): **not
met** — prices are there (12 of the 19 at ≥ US$10, from creators with 1–32 templates), visible buyers are not: 0 ratings
on every paid listing read. The sole-trader finance niche also already carries the shapes the item proposed (freelancer
tax trackers for quarterly/self-employed tax at US$12–49, bookkeeping at US$15, invoice trackers free), and the
highest-rated template in it is free with an optional-email gate — the shelf's visible economy is free templates as
lead magnets for the creators' own stores (Gumroad, Payhip, Etsy, where the same US$15 bookkeeping template is also
listed), with Notion's own checkout a recent (2026) and so far unrated layer on top.

## 4. Call: park — eligibility and fee are fine, the buyers are not visible

- **Park.** The shelf costs nothing to list on and takes 8 % + 40¢, but its paid layer shows no rating on any of 19
  listings in the niche, the waitlist to sell through Notion is "a few months", and a template's moat is nil (GPL-free
  duplication, access locking aside). A template of this operation's run-books would be a free lead magnet for the
  `ai-setup-course` idea, not an income line — that is the one shape worth a few hours, and only if that course idea is
  promoted.
- **Re-read trigger**: on 2026-12-01 re-fetch the 19 listing pages above (one relay line each): if ≥ 3 paid listings show
  ≥ 10 installs or ≥ 5 ratings, the paid counters are live and the niche has visible buyers — re-open with a US$19–29
  sole-trader finance template (MTD for Income Tax quarterly updates from April 2026 as the hook) and the waitlist
  application as the owner action. Earlier if Notion publishes paid-template sales counts or a creator-side "best
  sellers" list.
- **No owner action** raised today (the waitlist application would put the owner's identity on Notion for a shelf that
  showed no buyer).
