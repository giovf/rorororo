# Spike: the Heroku Elements Marketplace as a billed shelf for the gankdat API as an add-on

Queue item `new-ventures/spike-heroku-elements-add-on` (burn-down, 2026-10-26 00:39–00:41 UTC). Sources: the fetch
relay this run — `docs/relay/responses/billed-shelves-2026-10-26` (Building an Add-on, the Elements catalogue and its
Data Stores category, the Heroku Postgres listing), `billed-shelves-b-2026-10-26` (Becoming an Add-on Partner, Submitting
an Add-on, the License and Distribution Agreement PDF, the Ecosystem Partner page) and `heroku-spike-2026-10-26` (the
Partner Portal home, the Add-on Guidelines & Requirements category, Support Channels, Usage & Billing, four API-type
add-on listings). heroku.com does not resolve from the sandbox. The questions the research pass left open: can a sole
trader sign, what a GA add-on owes customers, which API-type add-ons sell on the shelf and at what plans, and the
integration effort.

## 1. The shelf's terms (Heroku's own pages, read 2026-10-26)

| Source | What it says |
| --- | --- |
| salesforce.com License and Distribution Agreement for the Heroku Elements Marketplace (PDF, "last updated on October 1, 2020") | §5.1 "SFDC shall pay Provider 70% of the Net Subscription Revenues it receives" and "may change the percentage of the Revenue Share" (the Provider may then terminate on 45 days' notice); §5.2 payment within thirty days; §5.3 reports by the due date; §5.4 taxes on the Revenue Share are the Provider's; SFDC may withhold the Revenue Share and hide a listing on a breach. The preamble binds "the individual accepting this agreement … on behalf of a company or other legal entity" and defines the Provider's Affiliates by voting interests; **no sole-trader or individual-provider clause either way**. Governing entity and law by the Provider's domicile (§11.9 table). |
| Becoming an Add-on Partner (Dev Center) | "All that's required to do is review the applicable agreements and policies, and then register for a Heroku account"; the Partner Portal's Company tab holds "company information"; the agreement "set[s] up the business relationship between your company and Heroku". |
| Submitting an Add-on | alpha (developers and invited testers only, the free Test plan) → beta after business approval, a Dev Center article, an automatic provisioning review and **"a minimum of 15 unique app owners to install and test your add-on"** → GA; "Upon reaching GA, it can offer paid plans to Heroku customers." |
| Building an Add-on | manifest (`heroku addons:admin:manifest:generate`), basic-auth Add-on Partner API at `/heroku/resources` (provision, plan change, deprovision), SSO, the Platform API for Partners; "Add-ons are billed from when the provisioning request is sent and pro-rated to the second." |
| Partner Portal home (addons-next.heroku.com/provider/home) | an 8 kB sign-in shell — the registration form and its company fields are behind the Heroku login, so **whether an individual can register is unread**; the Dev Center's wording ("your company") is all there is. |
| Add-on Guidelines & Requirements (Dev Center category) | names the obligations — "Add-on Support", "Getting Support as an Add-on Partner", "Add-on Security Requirements", "Support Channels" — whose articles were not fetched this run (one more round); Support Channels itself is the customer-facing page (Heroku Help, Stack Overflow, paid support plans). |
| Usage & Billing | add-ons are "prorated … to the second" and the listed price "is the maximum that you're charged if you run the dyno 24 hours a day" — the shelf bills hourly against a monthly cap, so a plan must be shaped as a capped hourly rate. |

## 2. The shelf's catalogue (elements.heroku.com/addons, 156 add-ons, read 00:12 UTC)

Listings show name, tagline and plans; **no install, rating or review counts anywhere**. Of the 156, ten sell an API
rather than a database, dyno tool or monitor: IPinfo and IP to Earth (IP geolocation), IP Investigator (proxy/bot check),
Real Email and Mailgun Email Validation (address validation), DNCSolution (Do-Not-Contact compliance), DocRaptor,
BreezyPDF and FileTurn (document conversion), Algolia (search). None is a register, company or compliance lookup; the
29 Data Stores entries are databases and object storage. Plan prices read tonight:

| Add-on | Plans (hourly rate, monthly cap) |
| --- | --- |
| Attachment Scanner (anti-virus API) | Startup ~$0.138/h ($99/mo), Professional ~$0.346/h ($249/mo), Premium ~$0.693/h ($499/mo) |
| Algolia Realtime Search (search API) | Free; Starter ~$0.096/h ($69/mo) |
| ActivePrime CleanData (Salesforce data quality) | Data Quality Assessment ~$6.944/h ($5,000/mo) |
| BreezyPDF (HTML-to-PDF API) | a free plan; paid plans not in the saved page |
| Heroku Postgres (for scale) | $5, $9, $20, $50 … $4,500/mo |

The shelf tolerates API plans from $69 to $499 a month with no free-tier obligation, so gankdat's tiers fit the price
norm; what nobody can read is whether anyone buys them.

## 3. Fit and economics

gankdat's key tiers map one-to-one to add-on plans; the Worker gains the four Partner-API endpoints, SSO to the account
page and the `GANKDAT_API_KEY` config var (≈ 2 days), and Heroku bills the customer's existing invoice — the "store lists,
the key bills" norm with the store billing too. At 70 % of a US$9 plan the shelf nets US$6.30 a month per app; GA needs
15 unique app owners first, which gankdat has no Heroku audience to supply.

## 4. Call

**Park.** The fee and payout are the best read this fortnight (70 % of net subscription revenue, paid within 30 days,
the customer billed on their Heroku invoice) and the integration is two days, but three facts bar a build now: the
Partner Portal's registration sits behind a login and the agreement speaks only of a company, so a sole trader's
eligibility is unread (the owner would have to sign to find out); paid plans need GA, which needs 15 unique Heroku app
owners to install a free Test plan first — an audience gankdat does not have on Heroku; and the catalogue shows no
install, rating or review count for any of its 156 add-ons and no register, company or compliance lookup among its ten
API-type add-ons, so demand for a data API there cannot be measured before the 15-tester hurdle is paid. Score ≈
evidence 1 × reach 2 ÷ (2 build days + the owner's registration) ≈ 1 — below the baseline. Recorded in the exchange as
`heroku-elements-add-on`, parked. Re-open when (a) a gankdat account or paid call arrives from a Heroku-hosted app
(request origin `*.herokuapp.com` or a Heroku user agent in `rest 7d by UA:`), which also supplies the testers, or (b) the
Add-on Support and Security Requirements articles are read and show no staffed-support obligation **and** the owner
confirms the Partner Portal takes an individual (one sign-in, ~5 min, batched with the next account request). Never
before: the AppSource and Power Platform shelves (free certification, Microsoft's buyers, no tester gate) are the same
"the store lists, the key bills" shape already queued for the owner's one Partner Center sitting.
