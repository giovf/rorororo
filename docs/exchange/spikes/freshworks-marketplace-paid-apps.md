# Spike: the Freshworks Marketplace as a billed shelf for a UK-organisation verification app

Queue item `new-ventures/spike-freshworks-marketplace-paid-apps` (burn-down, 2026-10-26 00:31–00:35 UTC). Sources: the
fetch relay this run — `docs/relay/responses/billed-shelves-2026-10-26` (the Freshdesk marketplace landing, raw),
`billed-shelves-b-2026-10-26` (Paid Apps Program, Paid Apps Benefits) and `freshworks-spike-2026-10-26` (Developer Terms
of Use, Marketplace User Terms, the Grow page, the AI-powered-apps collection, the Freshdesk and Freshsales landings
rendered, the marketplace's search-API bundle). freshworks.com and developers.freshworks.com do not resolve from the
sandbox; *index* marks a WebSearch snippet. The question the research pass left open: can a UK individual be paid, is
AI-built code barred, how long is review, and does any paid company-lookup app have buyers.

## 1. The shelf's terms (Freshworks' own pages, read 2026-10-26)

| Source | What it says |
| --- | --- |
| Paid Apps Program (developers.freshworks.com) | "Built-in payment processing and billing"; "80/20 revenue split (you keep 80%)" — on a $25/month app the developer receives $20; "Payouts are monthly, typically within 30-45 days"; open to "Anyone with a Freshworks developer account — individuals, companies, agencies"; price per agent per month or flat per account per month; "Set Price for Each Currency is mandatory" in AUD, BRL, EUR, GBP, INR, USD, ZAR; "Data Enrichment - Lead scoring, company lookup, and validation" is a named paid-app category. |
| Paid Apps Benefits | "Access to 75,000+ customers across 120+ countries"; an analytics dashboard of installs, revenue, usage and feedback; one codebase extends from Freshdesk to Freshservice and Freshsales. |
| Developer Terms of Use (developers.freshworks.com/terms-of-use) | 2.15.1: for every Sale "Freshworks will collect payments from the end users on behalf of Developer" and acts as the developer's agent for payments, taxes, refunds and adjustments; 2.16: Freshworks pays "eighty percent (80%) of the MRR … derived from an end user's usage of the App in the previous month", net of taxes, credits and chargebacks, only once the end user has paid in full; 2.17: a monthly report with payment "concurrently", **all payments in US dollars** to "a valid bank account in Developer's name"; 2.18: Freshworks may withhold or offset for chargebacks and disputes; 2.20: **Freshworks collects and remits the sales taxes** on Sales, the developer owes its own income tax. Eligibility is "legal capacity" to use the portal — no company, country or sole-trader clause; no clause on AI-assisted or AI-generated code. Governing law California, arbitration. |
| Marketplace User Terms (freshworks.com/marketplace-user-terms) | the end user's side: paid apps are bought and billed inside the Freshworks account — the shelf bills, as the developer page says. |
| App review (*index*: Freshworks' community wiki and submission docs) | three parallel tracks — code review (source and security), QA, content review; "ideally takes about a week or maybe a bit longer"; paid apps go through the same review as free ones. No rule on AI-assisted or AI-generated code found on any page read (monday's bar has no counterpart here). |

## 2. The shelf's demand (marketplace landings, rendered)

The Freshdesk landing (rendered; its listing API never went idle, so the page is the carousel set, not the catalogue) shows
59 cards, 27 distinct apps, each with rating, rating count, installs and a Free/Paid badge:

| Apps | Installs | Rating counts |
| --- | --- | --- |
| Free, the shelf's top eight (Microsoft Teams, Slack, Hide Fields, Freshsales Suite, Google Calendar, Jira Plus, Customize From Email, Kanban Board) | **3k–5.1k** each | 33 to 1k |
| Paid, nine distinct (ticket scheduling ×2, checklists/sub-tickets, custom task lists, reopen scheduler, Twilio SMS, approval workflows, ChatGPT replies, AI summaries) | **3, 20, 23, 25, 27, 33, 33, 52, 100+** | 2 to 30 |
| Paid, the "AI powered apps" collection (7 apps) | 33–55 for the two with counts (ChatGPT Assistant 55, AI Smart Assist 33) | 9–12 |

The Freshsales landing rendered as a product page without cards (0 parsed). The marketplace's search API
(`searchApiUtils` bundle: `page`, `per_page`, `skus`, `query`, `subscription_types`, `category_ids`) takes a paid-only
filter and a category, but the bundle holds no host for it, so **the Data Enrichment category was not read** — the
promote test (≥ 3 paid company-lookup apps with ≥ 50 installs at ≥ US$3/agent/month) stays untested. What is read says the
shelf's buyers install free apps by the thousand and paid ones by the dozen: the best-selling paid app on the landing has
100+ installs, the median nine have ~27.

## 3. Fit and economics

A ticket- or contact-sidebar app showing the requester's organisation from the gankdat registers (Companies House profile
and officers, charity registers, CQC, the sanctions list; the Zoho widget's design of 10-24 re-targeted to Freshworks'
app SDK) at a flat **£9 per account per month** (the Zoho price point) nets £7.20 after the 20 %; the key behind it is
gankdat's and bills nothing extra. Build ≈ 2–3 days (SDK app, OAuth-less key from the gankdat account, the four
lookups, review fixes). Ten accounts = £72/month, a hundred = £720.

## 4. Call

**Park.** The shelf is better than Zendesk's (Freshworks bills in seven currencies, pays 80 % of MRR monthly, takes
individuals and remits the sales taxes) and nothing on its pages bars an AI-built app, but the demand half fails on what
is readable: paid apps on the landing hold 3–100+ installs against thousands for free ones, so a £9/account app at the
median paid app's ~27 installs is ≈ £190/month at best and the category read that could lift it was not reachable
tonight. Score ≈ evidence 1.5 × reach 2 ÷ (3 build days + 20 owner minutes) ≈ 1, below the baseline and below the Zoho
widget already queued (2.4) for the same registers on a shelf that bills at 0 %. Recorded in the exchange as
`freshworks-marketplace-paid-apps`, parked. Re-open when (a) the Zoho CRM verification widget passes 10 installs (the same
sidebar shape selling to the same buyer), or (b) a gankdat account signs up from a helpdesk or CRM user agent, or (c) the
Data Enrichment category is read through the search API and shows ≥ 3 paid company-lookup apps with ≥ 50 installs. The
build then is 2–3 days with the Zoho widget's lookups behind Freshworks' app SDK; the owner step is the developer account
and a US-dollar-receiving bank in the owner's name (Wise or the business account), ~15 min.
