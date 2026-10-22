# Spike: the Wix App Market as a paid shelf for a sole trader

Queue item `new-ventures/spike-wix-app-market-paid-apps` (burn-down, 2026-10-22 19:00–20:00 UTC; the 18:39 slot
pre-fetched the first two rounds). Sources: six fetch-relay rounds (`docs/relay/responses/wix-app-market{,-b,-c,-d,-e,-f}-2026-10-22`,
pruned after 7 days): the **Wix App Market Partner Agreement** (version effective 30 June 2026, `dev.wix.com/app-market-partner-agreement`),
the developer-portal pages in their Markdown form (*Payments and Billing FAQs*, *Set Up Your Payout Account*, *Monetize your app*,
*About pricing plans and business models*, *About Verified Apps*, *The Wix Choice Program*), the support-centre feature request
*Calculating payout threshold per partner*, the Wix Studio articles *Joining the Wix Partner Program* and *Receiving Revenue Share*,
`robots.txt` and `sitemap.xml`, 14 app listing pages in three utility niches (found by WebSearch; the category and search pages are
client-rendered shells with no app links, and `/app-market/search-result?query=` is disallowed in `robots.txt`) and 15 developer
pages (`market.wix.com/developer/<name>`, server-rendered, with the vendor's app count and total reviews). WebSearch supplied the
listing URLs and nothing the pages do not say themselves. The question the 2026-10-22 research left open: can a UK individual
complete payout setup, what are the fee, transaction-fee and US$200 rules as currently published, and does a ≤ 1-week utility niche
show ≥ 3 paid apps from developers with ≤ 2 listings at ≥ 20 reviews and ≥ US$5 a month?

## 1. Eligibility: an individual may sign the agreement; payouts need the Studio partner form and a Tipalti account

| Source | What it says |
| --- | --- |
| Partner Agreement, preamble | made "between Wix.com Ltd. … and a developer (**whether entity or person**) joining the App Market or submitting an application" |
| Partner Agreement §10.3 | "Partner is at least 18 years of age (or the age of majority in jurisdiction of residence)"; §6.10 sanctions warranty (OFAC, UN, EU, HM Treasury, Israel); no company, VAT or country requirement anywhere in the text |
| *Set Up Your Payout Account* | "Before you can publish a paid app, you must become a Wix partner and then set up a **Tipalti** account to receive payouts. This is a one-time setup at the account level"; a blocker in app review holds a non-free app until it is done; needs the **Manage Earnings** permission (account owners have it); the flow is **Earnings › Payouts › Join the Partner Program** — "the Wix Partners onboarding flow guides you through registering your company as a Wix partner" — then Tipalti |
| *Wix Studio: Joining the Wix Partner Program* | "a loyalty program for **agencies and freelancers**"; "The option to become a Partner is only available to **Wix Studio** users"; only the workspace owner applies; the form is mandatory in every field: agency logo, name, site URL, main expertise, team size |
| *Wix Studio: Receiving Revenue Share* | payouts tracked in the Studio workspace's Payouts tab; "revenue share payments are not issued to banks located in Russia and Pakistan" — no other country rule; the page is about plan and Wix Payments revenue share, not apps |
| Partner Agreement §9.5–9.6 | "All Revenue Share payments shall be due and payable in **U.S. Dollars only**. Payment shall be made through wire transfer or any other method chosen by Wix"; "against a lawful **tax invoice to be issued by the Party receiving** the respective payment"; "subject to any applicable withholding tax obligations (if any)"; the partner pays its own taxes |

Reading: **yes, with more friction than the other shelves read this week.** The agreement itself admits a person; the money path
runs through the Wix Studio partner programme, whose own FAQ names freelancers, so a UK sole trader qualifies — but the owner would
have to (a) switch the Wix account to Wix Studio, (b) fill an "agency" form (logo, name, site URL, team size) and (c) complete
Tipalti's payee onboarding (bank details in the owner's name; Tipalti's own form and tax-document steps are not on any Wix page read
today — open), then (d) receive USD by wire, paying the bank's conversion, and issue a USD invoice to Wix for each payout. All of it
puts the owner's identity on Wix (CLAUDE.md: ask first). Compared with this week's reads: more steps than Freemius (billing details
and a PayPal address) or Notion (a Stripe account), about the same as JetBrains (ID + bank) and less than Atlassian (Stripe Identity +
UTR + W-8BEN).

## 2. The shelf's terms (agreement of 30 June 2026 and the developer portal, read 2026-10-22)

- **Revenue share** (§9.3, "Effective February 1, 2022"): 80 % to the partner, 20 % to Wix of the *Net App Revenues*; "**during the
  first twelve (12) months of the launch of the App** at the App Market" the partner keeps 100 %. The clock is per app (the FAQ's
  "your first year on our platform" is looser than the agreement; the agreement wins). For a *Partner Billed App* Wix also takes 20 %
  of any other income from the app, advertising included.
- **Transaction fee**: Net App Revenues are "the aggregate amounts actually paid by Users … less the Transaction Fee", **2.5 % of each
  payment**, deducted before the share, applying only to billing Wix conducts; "Wix may, at its sole discretion, reduce, waive, or
  decline to apply the Transaction Fee" — so the item's "one page keeps and another says is waived" is a discretion clause, not two
  rules: plan on 2.5 %. The FAQ adds "after … applicable sales tax": Wix bills the site owner, charges and remits the tax (US sales
  tax, EU/UK VAT and seven more regimes listed), so the partner sees net-of-tax, net-of-fee amounts.
- **Payout** (§9.4): payable "within thirty (30) days following the end of each month"; "Wix will not pay to a Partner hereunder an
  amount lower than two hundred US Dollars (USD 200; the 'Minimal Payment Amount')" — a balance below it "shall be carried over and
  added to the next month's Revenue Share amount". The agreement and the FAQ word the floor as the **partner's balance**; the support
  feature request (still "collecting votes") says "developers are only paid when an individual app reaches the payout threshold, and
  cumulative earnings across multiple apps do not count" — treat the per-app reading as the operational one until the first payout
  shows otherwise. The FAQ's timing: "revenue earned in March would arrive at the beginning of May" (35–60 days).
- **Currency and FX**: the primary price is set in USD; Wix "calculates the fair market rate" and sets local prices in other
  territories, so "the money you receive for each app sale can fluctuate up and down"; §9.6 lets Wix set off exchange-rate costs.
- **Refunds and chargebacks** (§9.2, FAQ): Wix approves cancellations and refunds at its discretion; the partner returns the related
  revenue share within 30 days or has it deducted; a failed chargeback reversal shows as a debit in payout data; failed card payments
  get a 45-day retry window before the package is cancelled.
- **Reporting** (§9.7): the partner "shall be obligated to provide Wix a monthly report, within no later than fifteen (15) days from
  the end of each calendar month" on purchases, billing and advertising income — as written it is general, in practice it bites
  Partner Billed and usage-based apps.
- **Pricing models** (*About pricing plans and business models*): Free, Single (one-off, not shown in the listing), Recurring (monthly
  and/or yearly), Usage-based and Custom (the last two need App Market approval); each plan maps to up to 4 benefits; the business
  model labels the listing "Free Plan Available", "Free to Install" or "From $X / month"; free trials, coupons and a Wix-hosted or
  external pricing page are supported; the developer codes the plan gating itself.
- **Recognition tiers** (*About Verified Apps*, *Wix Choice*): **Verified** is automatic after **60 days live and 40 live installs on
  Premium Wix sites** ("a live snapshot of current installs"); **Wix Choice** is hand-picked at 500 Premium installs, 45 reviews and a
  4.3 rating. Wix says both lift search placement.
- **Term** (§13): Wix may terminate "with or without cause" on 30 days' notice; the partner on 90 days'.
- **What the public listing shows**: name, developer, one-line pitch, average rating and review count, plan names and prices with any
  sale (end date stated), Verified badge, "Premium Site Required" where applicable. **Install counts are not shown anywhere** — the
  developer page shows the vendor's app count and total reviews, nothing more. Demand must be read from reviews and prices.

## 3. Demand: 14 paid utility apps in three ≤ 1-week niches (listing and developer pages, 2026-10-22)

Prices are the monthly plan in USD; "sale" prices carry the listing's stated end date. "Apps / reviews" is the vendor's developer page.

| Niche | App | Developer (apps / total reviews) | Model | Paid tier(s) per month | Rating (reviews) | Verified |
| --- | --- | --- | --- | --- | --- | --- |
| VAT / checkout validation | Optimizer: Valid VAT & Address | Certified Code (≥ 5 by search; developer page empty) | Freemium (10 checkouts free) | US$9.60 / 19.20 / 38.40 | none | yes |
| VAT / checkout validation | FME VAT Dual Pricing | FME Modules (6 / 1) | Premium | US$2.99 | none | no |
| VAT / checkout validation | Exemptify (EU reverse charge) | daxanema (**1** / 0; app launched 2016 per its page) | Premium, 5-day trial, Premium site required | US$4.49 | none | yes |
| VAT / checkout validation | VAT Dual Pricing | Neuralheads (6 / 0) | Freemium | US$2.99 | none | no |
| Cookie consent | Cookie (GDPR Cookie Consent) | PurpleBear (121 / 3,197) | usage-based, 3-day trial | from US$9.99 | 4.5 (13) | yes |
| Cookie consent | Cookie Banner for GDPR & CCPA | OverLayout (16 / 8) | Freemium | US$3.84 sale to 25 Oct (list 6.99) | 5.0 (1) | no |
| Cookie consent | CookieYes GDPR Cookie Banner | CookieYes Limited (**1** / 22) | Freemium | US$8.40 / 20.84 / 45.84 | 3.8 (22) | yes |
| Cookie consent | Cookie Consent & GDPR | Tornado (18 / 79) | Freemium | US$4.40 sale to 30 Nov (list 5.50) | 5.0 (20) | yes |
| Cookie consent | Consentik GDPR Cookie Banner | Omega (10 / 743) | Freemium, 7-day trial | US$6.99 / 15.00 | 4.9 (342) | yes |
| Age verification | Age Verification Popup 18+/21+ | Effective Apps (12 / 4,747) | Freemium | US$4.89 sale to 1 Nov (list 6.99) | 5.0 (999) | yes |
| Age verification | Age Verification Gate | Tornado (18 / 79) | Freemium | US$3.20 sale to 30 Nov (list 4.00) | 5.0 (23) | yes |
| Age verification | BL Age Verification 18+ 21+ | BACKLIP (15 / 85) | Premium, 3-day trial | US$1.27 sale to 1 Jan (list 1.59) | none | no |
| Age verification | AgeCheck: Age Verification | Amasty (5 / 34) | Premium, 7-day trial | US$1.29 | none | no |
| Age verification | Age Verification | Site Spiker (15 / 14) | Premium, 7-day trial | US$1.60 / 2.40 sale to 15 Nov (list 3.20 / 4.80) | 5.0 (1) | no |
| Age verification | Age Verification Popup | Codeyard (8 / 3) | Freemium | US$1.50 sale to 30 Nov (list 3.00) | none | no |
| (reference) | Price Table | POWR (33 / 17,976) | Freemium | US$3.19 / 5.25 | 4.1 (535) | yes |

Reading against the item's bar (≥ 3 paid apps from developers with ≤ 2 listings, ≥ 20 reviews, ≥ US$5 a month, in one niche):

- **Not met in any niche — zero apps clear all three.** Only two of the 15 vendors have ≤ 2 listings: daxanema (Exemptify, nine
  years on the shelf, no review) and CookieYes Limited (a consent-management company, 22 reviews at US$8.40+). The apps with ≥ 20
  reviews belong to vendors with 10–121 listings (Effective Apps, Omega, Tornado, PurpleBear, POWR).
- **The shelf's small vendors are multi-app studios with almost no reviews**: Neuralheads 6 apps / 0 reviews, Codeyard 8 / 3,
  Site Spiker 15 / 14, OverLayout 16 / 8, FME Modules 6 / 1, BACKLIP 15 / 85. Seven of the 14 utility apps show "No Reviews Yet";
  the pattern is many cheap apps per vendor, each gathering nothing — the opposite of the Atlassian and JetBrains reads, where a
  single macro or plugin from a one-product vendor showed hundreds of installs.
- **Prices are low**: the small-vendor paid tiers run **US$1.27–6.99 a month**, most under US$5 after the running sales (8 of 14
  listings are on a sale). Only the SaaS-backed consent apps (CookieYes, PurpleBear, Omega) and the checkout validator price at
  US$7–46.
- **The US$200 floor at these prices**: a US$4-a-month app nets US$3.90 in year one (after the 2.5 % fee) and US$3.12 from year two,
  so the first payout needs **~52 paying sites in one month** (64 after year one) if the per-app reading holds; at Codeyard's or
  BACKLIP's US$1.27–1.50 it is 130–160 sites. The Verified badge that lifts placement needs 40 live Premium installs for 60 days
  first. With installs hidden, nothing on the shelf says how long the small vendors took to reach either.
- **The VAT / business-data niche the item named has no UK entry** (no Companies House or UK VAT check at checkout; the four VAT apps
  are EU-VAT and dual-price displays) — a gap, but one with zero visible buyers: all four show no review.

What the shelf does for a new entrant: app review before publication (payout setup is a blocker for a paid app), a category page
and search that are client-rendered (so indexing of the listing depends on Wix's own search; the robots file blocks the search
URL), and Wix-run sales of its own ("Apps on Sale" is the second navigation item). The audience is real (Wix cites "230m+ Wix users"
on every listing) but a new utility starts with no reviews next to 12-app studios running 50–70 % sales.

## 4. Call: **park**

- **Eligibility — passes**, with the owner-identity steps in §1 (Studio switch, agency form, Tipalti payee, USD wire). Not a blocker,
  but more owner minutes than Freemius or Notion.
- **Terms — the best headline of the five shelves read this week** (100 % for 12 months, then 80 % less 2.5 %; Wix bills and
  handles tax), undone by the floor: US$200 in USD, read per app, with the FAQ's 35–60-day lag.
- **Demand — fails the item's own bar by a wide margin**: 0 of 14 utility apps meet it; small vendors show 0–13 reviews at US$1–7 a
  month; the review-rich apps are multi-app studios'. STRATEGY §5: evidence 0–1 × reach 2 ÷ (5 build days + ~45 owner minutes) —
  below every open item.
- Re-read **2026-12-01** (exchange trigger): re-fetch the 14 listing pages and the Tornado and Neuralheads developer pages (one relay
  line each); re-open only if ≥ 3 small-vendor paid apps gained ≥ 10 reviews, or if Wix publishes install counts on listings. A UK
  business-data check at checkout (company number + VAT number) stays the shape to test first if it re-opens, because no such app
  exists on the shelf.

## 5. What this run did not read

- Tipalti's payee onboarding for a UK individual (form fields, tax documents) — not on any Wix page; needed only if the idea re-opens.
- The App Market guidelines and the review process's turnaround — not needed for the call.
- Shelf-wide counts: the category and search pages carry no app data, and `sitemap.xml` lists the App Market's landing pages but no
  per-app URLs, so the "count paid apps from developers with ≤ 2 listings" part of the item was answered on a 14-app sample found by
  search, not on the whole shelf. The developer pages are the one server-rendered place to read a vendor's size.
