# Spike: AWS Data Exchange as a data-marketplace shelf for gankdat's registers

Queue item `new-ventures/spike-aws-data-exchange-provider` (burn-down, 2026-10-29 18:27–18:45 UTC; seeded by the
2026-W44 exchange). Sources: four fetch-relay rounds this run (`docs/relay/responses/aws-dx-2026-10-29`, `-b`, `-c`,
`-d`; pruned after 7 days) — the AWS Data Exchange User Guide (provider getting-started, providing data products,
publishing guidelines, provider financials, FAQs), the AWS Marketplace Seller Guide (seller eligibility, listing fees,
data products), the Data Exchange and API Gateway pricing pages, the "Monetize your custom HTTP APIs via AWS Data
Exchange" blog post, four rendered catalogue searches and six rendered product pages; plus four WebSearch passes to find
the page names. `docs.aws.amazon.com` and `aws.amazon.com` were added to `docs/relay/hosts.txt` (the sandbox cannot
resolve either). Nothing was signed up for, nothing fetched needed a login.

The questions the exchange left open: provider eligibility for a UK sole trader with a personal AWS account; the tax,
bank and card requirements; the listing fee; whether OGL register data may be listed; the "for APIs" delivery and its
per-call cost; and what register, sanctions and tender products already sell there, at what prices.

## 1. Eligibility and onboarding (AWS's own pages, read 2026-10-29)

| Source | What it says |
| --- | --- |
| User Guide, *Getting started as a provider* — Step 1 | A provider must "be a permanent resident or citizen in an eligible jurisdiction, or a business entity organized or incorporated in one of those areas"; the **United Kingdom is listed** (individuals qualify — no company needed). Also: "a defined customer support process and support organization", a means to keep data updated, an AWS customer in good standing. Onboarding is **by Support case**: "request on-boarding through the Create case wizard … The AWS Data Exchange team will contact you to complete the qualification and registration process." |
| same page — paid products | "Non-US sellers are required to provide a **W-8 form, value-added tax (VAT) or goods and services tax (GST) registration number, and US bank information**. If you don't have a US bank account, you can register for a virtual US bank account from Hyperwallet." Footnote ¹ on the UK: "Providers of paid products in these countries must provide **VAT registration information in country of establishment**." |
| Seller Guide, *Seller eligibility requirements* | Paid sellers must also "Complete Know Your Customer (KYC) process if … using U.K.-based bank accounts" and "Complete bank account verification process"; an AWS account "in good standing" is the base requirement for everyone. |
| Seller Guide, *Understanding listing fees* (effective 2024-01-05) | Public offer listing fee for **AWS Data Exchange: 3 %** of the pre-tax contract value (SaaS 3 %, server images 20 %); private offers 3 % under US$1M; South Korea buyers +1 %. |
| User Guide, *Provider financials* | AWS disburses monthly to the registered bank account "minus AWS Marketplace service fees", only after the subscriber has paid; the provider sets the refund policy and approves each refund by form. |
| User Guide, *Publishing guidelines* | Data may identify a person only if it is "Publicly Available Information", defined to include information "lawfully made available through federal, state, local government records, open court records, or public company filings" — the registers gankdat serves (Companies House, Gazette, trade marks, licences) fit; sensitive categories must be aggregated. For an API product: "You must first integrate your API with Amazon API Gateway" and "respond to support-related questions from subscribers about the data product in **1 business day**". |
| Pricing page + blog post (AWS Marketplace blog, 2022) | AWS Data Exchange for APIs "requires the backend API to be an Amazon API Gateway REST API endpoint" (a wrapper in front of an external HTTP service is the documented pattern); "Data Providers may incur additional charges from API Gateway". API Gateway REST pricing: US$3.50 per million requests in the first tier plus data transfer out (US$0.09/GB) — ≈ US$0.0000035 per call, far under gankdat's US$0.001 per result, so the per-call margin is not the blocker. Files products also pay US$0.023/GB-month storage; data grants US$0.04167 per active grant-hour. |
| FAQs | "qualified customers must register as a data provider on the AWS Marketplace Management Portal to be eligible to list both free and commercial products"; the catalogue holds "more than 3,500 data products". |

What the pages do **not** say: a card requirement for the seller account itself. That one is inherited from the AWS
account: opening an AWS account asks for a payment method before the console opens (AWS's sign-up flow; the repo holds
no AWS account and no AWS cost line), and the operation's rule since the owner's 2026-10-16 note is no card on a £0 line.

## 2. What already sells there (rendered catalogue, read 2026-10-29)

The rendered search ignored the `FULFILLMENT_OPTION_TYPE=DATA_EXCHANGE` filter (the counts below cover the whole
Marketplace — SaaS, services and data together), so the data-product rivals were picked out of the first page of cards
by hand and their product pages rendered for prices.

| Search | Results (all Marketplace) | Data products on page 1 |
| --- | --- | --- |
| sanctions | 135 | ComplyAdvantage *Sanctions, PEPs & Adverse Media Customer Screening & Monitoring*; ThreatSTOP OFAC/EU/UN firewall rule sets; Flexa Cloud AML/Sanctions; Chainalysis; Windward maritime; Arkham API (free tier) |
| company register | 9,224 | **mnAi** — *All UK companies by postcode town*, *UK Company List with Employee Count*, *All Exporter Companies in the UK*, *Record of all Family-Owned Companies (UK)*, *All UK Companies with Company Ethnicity Data* (each with a free "(Sample)" twin); Open Automation *Global Biz Verify API*; Xtract.io *Indian Company Registry Database*; Cabocia EDINET (Japan); Interzoid name matching |
| tenders procurement | 1,553 | none — every card is procurement software or an AI agent (Zip, Vendr, Siemens, Accenture, Deloitte …); no tender-notice data product on the first page |
| united kingdom | 2,921 | Techsalerator *Businesses in the United Kingdom (B2B in the UK)*; D&B *Country Insight Snapshot — United Kingdom*; Saturn Data *UberEats Restaurants in the UK*; Met Office radar archive (ASDI, free) |

Rendered product pages (round `-d`, prices as shown on 2026-10-29):

| Product | Seller | Delivery | Price | Note |
| --- | --- | --- | --- | --- |
| All UK companies by postcode town | mnAi | AWS Data Exchange (S3 objects, last revision + future revisions) | **US$280,000 / 12-month contract** | a Companies House derivative; "Refunds are not offered"; a free `(Sample)` listing beside it |
| UK Company List with Employee Count (4,000,000+ records) | mnAi | AWS Data Exchange (S3) | **US$280,000 / 12 months** | same seller, same price; free Sample twin |
| Indian Company Registry Database (2.5M companies) | Xtract.io | AWS Data Exchange (S3) | free | a sample listing used as a lead magnet |
| Global Biz Verify API — check company registration worldwide (30+ registries) | Open Automation | SaaS, usage-priced | **US$0.25 per registry status check**, US$0.01 per format check, US$0.001 per result fetch | the closest shape to gankdat's lookup endpoints; sold as SaaS, not "for APIs" |
| Sanctions, PEPs & Adverse Media Screening | ComplyAdvantage | SaaS, contract | **US$65,000 / 12 months** (50,000 name screens) | rating 3.3 (3 reviews) |

What this says: the register sellers already on the shelf price for procurement departments (five- and six-figure
annual contracts, no refunds), not for the per-call buyers gankdat serves; the one per-request rival charges 250× gankdat's
price per lookup. A US$0.001-per-result API would be the cheapest thing in its category by orders of magnitude — a
reach argument for promotion if the gates below were open, and a sign the shelf's buyers are not the long tail.

## 3. Promote / park call — **park**

Against the item's own park conditions:

1. **Entity and identity.** A UK individual *is* eligible, so "must be a registered company" does not bite. But a paid
   UK provider must give a **VAT registration number** (the UK footnote and the non-US sellers line), a **US bank
   account** (or a Hyperwallet virtual one), a W-8, **KYC** for a UK bank account, and pass a Support-case
   qualification by the Data Exchange team. The owner is not VAT-registered (the whole tax-workbook line is written
   for traders under the threshold), and registering for VAT to list a US$0-so-far shelf is a new business
   verification that CLAUDE.md allows only for work scoring ≥ 10 (owner 2026-10-29); this spike scored 4.
2. **Card before any sale.** No AWS account exists for the operation; opening one requires a payment method before
   anything else, and the owner's 2026-10-16 rule is no card on a £0 line. Fails.
3. **Per-call cost.** Passes easily: 3 % listing fee and ≈ US$3.50 per million API Gateway requests against
   US$0.001 per result. The economics are the one thing that is fine.
4. **Demand.** Real but unmeasured: mnAi lists five UK Companies House derivatives, Open Automation sells a company
   verification API and ComplyAdvantage a sanctions screen — the shelf has buyers for exactly gankdat's data — but the
   catalogue publishes no subscriber counts, and the "data products only" filter does not work in the rendered search,
   so the reach number stays 4 on AWS's own "millions of AWS customers" claim rather than a count.

Park with the trigger **"the owner registers for VAT or incorporates, and an AWS account with a card is acceptable"**
(the same family as the Snowflake park: the data line passing £300 MRR makes both worth the admin). No queue item;
the idea stays in `docs/pipeline/exchange.json` as `aws-data-exchange-provider`. If it is ever promoted, the shape is
an API Gateway REST wrapper in front of the gankdat Worker listed as an "AWS Data Exchange for APIs" product (one
product per register family, Data Subscription Agreement from the OGL attribution terms), not a files product.
