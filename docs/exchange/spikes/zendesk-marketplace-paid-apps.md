# Spike: the Zendesk Marketplace as a paid shelf for a support-sidebar app

Queue item `new-ventures/spike-zendesk-marketplace-paid-apps` (burn-down, 2026-10-24 01:06–01:18 UTC). Sources: the
2026-10-24 research relay (`docs/relay/responses/new-ventures-research-2026-10-24`: 'Set up a paid app or theme', 'Submit
your app') and three fetch-relay rounds this run (`zendesk-marketplace-2026-10-24`, `-b-`, `-c-`, pruned after 7 days):
the Zendesk Developer Terms (effective 2025-08-12), the Marketplace overview with its 'Requirements for publishing an app',
'Register your organization', 'Create a Zendesk Marketplace profile', 'Build and test your app', 'Request header
requirements', 'Getting a trial or sponsored account' and 'Best practices' pages, and twelve Marketplace listings. The
question the research left open: whether Zendesk takes a share beyond Stripe's fee, a UK individual's eligibility, the
review bar, and whether small vendors' per-agent sidebar apps have buyers.

**How the listings were read.** `www.zendesk.com/marketplace/…` sits behind a Cloudflare bot challenge (every GET and the
RENDER came back 403 "Just a moment…"). The regional mirrors (`www.zendesk.co.uk`, `www.zendesk.de`, `zendesk.nl`,
`www.zendesk.com.br`) serve the same Next.js listing page without the wall, and each page's `__NEXT_DATA__` carries the
listing plus its 'more from this developer' and 'related' tiles as full records — name, vendor, `installation_count` (an
exact integer; the visible page rounds it to "Less than 5", "5+" …), ratings, plans with `plan_type`
(`per_agent` / `per_account` / `one_off`), amount in cents and trial days. Twelve pages yielded 78 distinct apps, 64 of them
paid. The category index (`/marketplace/apps/support/?pricing=paid`) is a 404 on the mirrors, so the sample is the
twelve vendors' catalogues plus their related tiles, not the whole paid shelf.

## 1. The shelf's terms (Zendesk's own pages)

| Source | What it says |
| --- | --- |
| Set up a paid app or theme (developer docs) | "We use Stripe for accepting and managing online payments." The developer connects a Stripe account to the Zendesk Stripe application by OAuth; "if you already use Stripe for your business, we recommend setting up a new Stripe account … Connecting to the Zendesk Stripe app allows us to make transactions on your behalf. It also gives us access to transactional data in your Stripe account." Three payment types: one-time, per account per month, **per agent per month**; each monthly plan is a Stripe product priced in **USD only**; up to four active plans. Tax: "Zendesk Marketplace uses Stripe tax calculation and collection capabilities" — the developer adds a Stripe Tax registration for "the country where you are registered for tax collection". Trials 1–90 days (card required, auto-billed after), trial cool-down 1–999 days, coupons for subscription plans, refunds done by the developer in Stripe, an unpaid subscription locks the app in the customer's Zendesk. Payout: "Stripe transfers funds to your bank account based on the schedule listed in your dashboard" — **no Zendesk payout cycle, floor or statement**. |
| Zendesk Developer Terms, effective 2025-08-12 (§4 Marketplace) | §4.3: "Purchase Fees will be transferred to Licensee's Payment Processor account … and Zendesk bears no financial responsibility with respect to any Purchase Fees"; Zendesk "may initiate a refund … if Zendesk determines, in its sole discretion, such a refund is appropriate. Such refund will be the exclusive financial responsibility of Licensee". **§4.4: "Zendesk reserves the right to charge fees to Licensee related to any aspect of the Marketplace at its sole discretion, either as indicated to Licensee at the time of listing the Paid Application or upon 10 days' notice"** — no rate is stated anywhere, so today the developer keeps 100 % less Stripe's own fee. §4.1 approval and §4.5 delisting at Zendesk's sole discretion; §4.2: an app published on the Marketplace may not be offered on another marketplace unless "published in identical form on the Marketplace"; §3.7 Zendesk may run security assessments of the app on 7 days' notice; §8 the developer supports its customers; §14.7 California law. "Licensee" is "the party accessing or using the APIs" — no entity type, no country list. |
| Submit your app | New submissions **1–3 weeks** of review, updates 1–2 weeks; register the organization at `apps.zendesk.com` first; ZIP upload with automatic checks (errors block, warnings do not) and a branding check; up to two categories; privacy-policy URL; the paid toggle takes the Stripe Plan id and the Stripe Integration id entered in the organization details; "All mandatory compliance questions must be answered"; approval publishes the listing "by 10am PST the next day". |
| Requirements for publishing an app (Marketplace overview) | Global OAuth tokens for any server-side Zendesk API request; the Marketplace request headers (verified on a designated test account during review — "The requirement doesn't apply to API requests from apps using the Zendesk Apps framework"); the best-practices page; disclose in the listing what Zendesk data the app reads and why. |
| Register your organization; Marketplace profile | Sign-up at `apps.zendesk.com/sign-up` by email, Google or GitHub; "Complete your organization profile and click Submit". The profile (optional, reviewed with the first app) asks for partner type, descriptions, regions and a point of contact. |
| Getting a trial or sponsored account | A free 14-day Support trial is converted, through the Sponsored Account Request Form, into a sponsored instance "for up to 5 agents" on Suite Enterprise that "does not expire" — "reserved for developers creating applications for the Zendesk Marketplace". |

## 2. Eligibility and payout for a UK individual

- **Who may sell.** Nothing in the Terms or the portal pages requires a company: the Terms bind "the party accessing or
  using the APIs", the portal takes any email/Google/GitHub account and an "organization profile" (a name and a
  description), and money moves through the developer's own Stripe account (UK supported, Stripe's KYC). A UK individual
  qualifies on the pages read.
- **Payout path.** Buyer → Zendesk's Stripe application → the developer's Stripe account → the developer's bank on
  Stripe's own schedule. No marketplace floor (against US$500 Atlassian, US$200 Wix/JetBrains, US$100 Zoho), no
  commission published; §4.4 lets Zendesk add one on 10 days' notice.
- **Owner actions if ever promoted.** Four, all identity: (1) a `d3v-` trial account and the sponsored-account form;
  (2) the `apps.zendesk.com` organization; (3) a **separate** Stripe account connected by OAuth (Zendesk sees that
  account's transactions, so not gankdat's); (4) a Stripe Tax registration — the owner trades under the £1,000 allowance
  with no VAT registration, and every plan is priced in USD to a worldwide buyer, so what Zendesk expects a non-registered
  UK seller to collect is an open question for Zendesk's Marketplace support before any listing.
- **Obligations.** Developer supports buyers; refunds may be forced by Zendesk at the developer's cost; the app may not
  be sold elsewhere in a different form; Zendesk may test the app's security.

## 3. Demand (64 paid small-vendor apps, counts from the listing data on 2026-10-24)

| App (vendor, listed) | Price | Installs | Rating (count) |
| --- | --- | --- | --- |
| **Mirakl Connector by Volvox** (2020-12) | US$2.00/agent/mo, 7-day trial | **189** | 5 (1) |
| Marketplace Channels (Volvox, 2020-12) | US$5.00/agent/mo | 53 | 5 (2) |
| Mirakl (juble.io, 2023-05) | US$5.00/agent/mo, 7-day trial | 52 | 5 (5) |
| Better Views (helphouse.io, 2019-02) | US$1.50/agent/mo, 14-day trial | 27 | 5 (1) |
| FNACDarty Connector (Volvox, 2020-12) | US$2.00/agent/mo | 19 | 5 (1) |
| Pipedrive (helphouse.io, 2018-09) | US$4.00/agent/mo, 14-day trial | 19 | — |
| Required Fields (helphouse.io, 2017-06) | US$1.00/agent/mo, 14-day trial | 17 | — |
| Kaufland Connector (Volvox, 2024-12) | US$2.00/agent/mo, 7-day trial | 16 | — |
| Octopia Connector (Volvox, 2024-06) | US$2.00/agent/mo, 7-day trial | 15 | — |
| **HubSpot by helphouse.io** (2019-01) — a CRM sidebar | US$7.00/agent/mo, 14-day trial | 14 | 2 (3) |
| Klick-Zen Action Buttons (Acenerate, 2025-01) | US$4/agent/mo or US$199 flat, 14-day trial | 13 | 5 (3) |
| Custom Links (2app.pro, 2023-04) | US$0.10/agent/mo | 12 | — |
| CSAT Viewer (Tripelhop, 2024-12) | US$3/agent/mo or US$39 instance, 7-day trial | 11 | — |
| Sharely (2026-01) | US$5/user/mo, free tier | 11 | — |
| Order Details (Volvox, 2020-07) — customer data in the sidebar | US$1.00/agent/mo, 14-day trial | 9 | — |
| **HubSpot CRM Connect** (Spritle, 2023-08) — a CRM sidebar | US$5/agent/mo or US$89 account, 5-day trial | 5 | — |
| Intelligence Viewer (Tripelhop, 2024-12) | US$3/agent/mo or US$39 instance, 7-day trial | 4 | — |
| AI Agent Assist Pro (2app.pro, 2023-08) | US$2.50/agent/mo or US$79 instance, 30-day trial | 2 | 2 (1) |
| **Customer Details** (Volvox, 2020-06) — the exact rival of the promote shape | US$1.00/agent/mo, 14-day trial | **2** | — |
| **Customer Details Advanced** (Volvox, 2021-06) | US$3/agent/mo or US$29 instance, 14-day trial | **1** | — |
| Agent Notes (Assist Apps, 2025-01) | US$0.90/agent/mo, 14-day trial | 1 | — |
| plus 43 more paid apps from Saasly (12), Volvox, Tripelhop, 2app.pro, Spritle, Assist Apps | US$0.10–10/agent/mo | 0–8 each | 3 rated |

The whole paid sample: **64 apps, median 2 installs, mean 8.8; 17 at 0, 42 at 3 or fewer, 14 at 10 or more, 3 at
50 or more**; the 50 listed before 2025 also sit at a median of 2, so the low counts are not youth. Only 12 of the 64
carry any rating. Per-agent prices run US$0.10–10 with a median of US$3. By vendor: Volvox 16 paid apps and 320
installs in total (five years of e-commerce-marketplace connectors), helphouse.io 7 and 89, juble.io 2 and 55, Saasly
12 and 15, Tripelhop 5 and 25, 2app.pro 5 and 14.

An install is a Zendesk account, and a per-agent plan bills every agent on it, so revenue ≈ accounts × agents × price:
the median paid app (2 accounts × ~5 agents × US$3) is about US$30 a month; the sample's top app (189 × ~5 × US$2) is in
the low thousands. The jobs that reach 50+ accounts are connectors to a channel the support team must answer in
(Mirakl, FNAC, Kaufland, Octopia — marketplace seller messaging) — a buyer who has no choice. "Show the requester's
data in the sidebar" apps — Customer Details, Customer Details Advanced, Order Details, the two HubSpot sidebars — sit at
1–14 accounts after one to six years.

## 4. Gate check (ARCHITECTURE validation gate)

| Gate | Reading |
| --- | --- |
| Buyers with money | Yes for the shelf (paying support teams, per-agent billing) — thin for the job: the exact rival (Customer Details, US$1/agent) has 2 accounts after four years; the two CRM sidebars 5 and 14 |
| Recurring job | Yes — monthly per-agent subscriptions through our own Stripe, no commission today |
| Paid competitor with a documented gap | No — the gap is demand for a requester-organisation panel, not quality; the one-job sidebar category's median is 2 accounts |
| ≤ 1 week to build | Yes — a ZAF iframe app in plain JavaScript over the gankdat API is 1–2 days; no Zendesk API tokens or Marketplace headers needed when the app only calls our API; review adds 1–3 weeks |
| No policy / ToS risk | Yes on the pages read — first-party shelf, Stripe KYC; Zendesk may add fees on 10 days' notice, force refunds and delist at will; the Stripe Tax question for a non-VAT-registered seller is open |

## 5. Promote / park call

The shelf's terms are the best of the seven read this month: our own Stripe account, no commission published, no payout
floor, per-agent billing at a US$3 median, a free non-expiring developer instance, and a 1–3 week review. Demand for
the promote shape fails on the shelf's own numbers: 64 paid apps by small vendors sit at a median of 2 accounts, the
exact rival has 2 accounts in four years, and the apps that do sell are connectors to channels a team is forced to answer
in — which a UK-registers panel is not. A median outcome (≈ US$30/month) would still beat every live venture's revenue,
but it is distribution for gankdat's data, needs four owner-identity actions (portal, sponsored account, a second Stripe
account, Stripe Tax), and waits 1–3 weeks on review.

**Recommendation: park** (STRATEGY §5: evidence 1.5 × reach 2 ÷ 2 days ≈ 1.5 against foundry `actions-minutes` at 7;
STRATEGY §1: it must capture a new audience rather than take a cut of money already flowing). Not a new line: if built it
is a gankdat distribution item.

**Trigger** (idea `zendesk-marketplace-paid-apps`, parked): a gankdat shelf converts (first paying account or ≥ 20 paid
Apify runs a month), or the Customer Details / HubSpot sidebar listings show ≥ 50 accounts at the 2026-12-01 exchange
re-read (the `.co.uk` mirror's `__NEXT_DATA__`), or Zendesk's Marketplace support answers the Stripe Tax question for a
non-registered UK seller. Then: a two-day gankdat item `zendesk-sidebar-uk-registers` (ticket-sidebar panel: company
status, officers, charity record, sanctions hit for the requester's organisation at US$3 per agent per month, 14-day
trial) with the four owner actions batched into one request.

Numbers in one line: individual **yes** (any account + own Stripe); share **none published**, reservable on 10 days'
notice; payout Stripe's schedule, no floor; review 1–3 weeks; 64 paid small-vendor apps median **2** installs, best 189
at US$2/agent; exact rival 2 installs at US$1/agent; call: **park**, trigger a gankdat conversion or a 50-account sidebar
rival.
