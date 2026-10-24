# Spike: the Zoho Marketplace as a paid shelf for a Zoho CRM extension

Queue item `new-ventures/spike-zoho-marketplace-paid-extensions` (burn-down, 2026-10-24 01:19–01:40 UTC). Sources: the
2026-10-24 research relay ('Managing payments', the Marketplace developer FAQ) and four fetch-relay rounds this run
(`docs/relay/responses/zoho-marketplace-2026-10-24`, `-b-`, `-c-`, `-d-`, pruned after 7 days): the Zoho Developer
Agreement, the Zoho Marketplace Terms of Use, 'Pricing your Extension' (developer help and the CRM-platform KB, rendered),
'Extension Approval Process', 'Branding and Approval Guidelines', the extensions FAQ, the Marketplace quick-start guide
(company profile, submission, review and listing, partner console, activities after listing, data sharing), the
Marketplace FAQ, the CRM shelf front page (raw and rendered, paid filter) and eleven paid CRM extension listings (raw,
two of them rendered). The questions the research left open: whether an individual can sell and be paid, the commission
as stated on the pricing and terms pages, and whether small vendors' paid extensions have buyers.

**How the listings were read.** `marketplace.zoho.com` answers plain GETs. Each listing page embeds `installURLObj`
(`extensionDetails` with `installCount` as shown — "600+ Installs" — and the exact `extnInstallCount`, the rating
histogram and count, `publishedDate`; `partnerDetails` with the vendor's address and a `verify` flag; `PlanDetails` with
`plan_amount`, `yearly_amount`, `year_discount`), plus 'related apps' tiles with ratings. The price unit is rendered
client-side: the rendered pages show **"$20 /org"** and "$240.00 /org" — Zoho extensions are priced **per organisation
per month (or per year)**, not per user. The item's promote shape assumed per-user billing; it does not exist here.

## 1. The shelf's terms (Zoho's own pages)

| Source | What it says |
| --- | --- |
| Managing Payments (developer help) | "This payment will be handled by us and we will transfer your commission to your account on a monthly basis"; the Partner Commission Report defines Total Value as "the sum of the total amount paid by all your customers … **(For extension developers, the total value and commission will be equal)**" — **no revenue share on extensions**. A statement on the 1st of each month "only if the outstanding due is more than 100 USD"; the developer approves the payout; "about 15 working days … through wired transfer", bank details entered in a form; PayPal on request by email; cheques for US partners. |
| Marketplace FAQ (partners) | "Is there any fee to develop extensions? We will never charge a fee for extension development." "Who can become a Marketplace partner? Independent Software Vendors (ISVs) and System Integrators (SIs) can sign up on Zoho Marketplace and create a company profile … you don't have to be a Zoho partner." Listing: sign up, Partner Console, submit; "The review team will contact to see a demo and proceed with the approval process. The entire process consists of functional and security testing, as well as content review. This will take an average of **two-to-three weeks**." (The older developer FAQ says "two business days"; the quick-start says "around two weeks".) |
| Zoho Developer Agreement (zoho.com/developer/terms) | A contract between "you" and Zoho Corporation Private Limited; "If You are entering into this Agreement on behalf of a company … you represent that you have the authority" — otherwise it binds the individual. "You have the right to distribute your Applications for free or charge a fee … all payments for purchases of your Applications will be processed through Zoho." The developer retains ownership; Zoho may remove applications that violate its terms and may terminate on 10 days' notice; liability capped at US$100; **binding arbitration in Chennai under India's Arbitration and Conciliation Act 1996**; 30 days' notice of significant changes. No commission, fee or revenue share appears anywhere in it. |
| Zoho Marketplace Terms of Use | Buyer-side: Zoho "does not have any kind of affiliation with the Developers", provides no support for third-party apps, may remove apps and may discontinue the Marketplace on 90 days' notice. |
| Pricing your Extension (developer help; CRM-platform KB rendered) | "Zoho Marketplace allows you to price your app however you like … Paid extensions may be listed with either a Recurring Price or a One-time Price"; price in USD; the quick-start adds annual recurring with an optional annual discount; a listed price can change only after 30 business days (search index). Trial: "Your extension can provide a 10-day free trial"; trial users' name and email go to the vendor; Zoho emails them for a review on days 5, 10 and 15. |
| Approval process; branding and approval guidelines; review and listing (quick-start) | Submission form: logo 120×120, banner 310×142 (newer guide: icon 180×180, thumbnail 740×340), screenshots, help documentation hosted by the vendor, privacy and terms URLs, **company name, logo, address, phone and email** shown on the listing. Four review stages: technical (code), functionality and performance, security ("compliant with the OWASP protocol"), content. Criteria: works as described, no performance degradation, no undisclosed data transfer, third-party accounts disclosed, no advertising on the listing page. |
| Company profile; partner console | "The applications you develop can only be submitted or published in Marketplace once you create a company profile" (sign up, Partner Console → Company profile; edits are re-reviewed). The console shows installs and uninstalls by country, page views and traffic sources, moderated reviews, tickets, and **Revenue** ("total net revenue … revenue made by each app"; apps on the US data centre only — other DCs at stores.zoho.com). |
| Build an extension (quick-start, developer console) | Extensions are built and hosted on the **Sigma** platform in the Developer Console (free): widgets in JavaScript plus Deluge glue, or "our Rest APIs and your choice of programming language and infrastructure". Public extensions install directly from the Marketplace; some vendors redirect to their own site for purchase. |

## 2. Eligibility and payout for a UK individual

- **Who may sell.** The FAQ names ISVs and SIs, but the mechanism is a self-serve company profile (name, logo, address,
  phone, email) and the Developer Agreement binds an individual who signs without an entity. The eleven vendors read are
  small firms from the UK/France/Spain, Pakistan, India (five), Bangladesh, the US and Australia — all flagged
  `verify: true` — so the review accepts small foreign vendors; nothing on any page restricts country or entity type. A
  UK sole trader lists under a trading name. **Open point:** whether Zoho's reviewers accept a profile with no registered
  company; the pages do not say either way.
- **Payout path.** Buyer pays Zoho (USD, "billed only for the extension") → Zoho's monthly statement when ≥ US$100 is
  due → the developer approves → wire in ~15 working days to the bank details on file (a UK account; PayPal on request).
  **0 % commission** on extensions by Zoho's own report definition; Zoho handles the buyer's payment, tax and refunds.
  A US$100 floor rolls over month to month.
- **Owner actions if promoted.** (1) Sign up at marketplace.zoho.com and complete the company profile (identity, address,
  phone); (2) bank details in the Zoho Store; (3) **a demo call with Zoho's review team** ("the review team will contact
  to see a demo") — the one shelf this month whose review wants a person on a call; (4) accept the Developer Agreement
  (Indian arbitration). Batch into one request.

## 3. Demand (eleven paid CRM extensions read first-hand, 2026-10-24)

| Extension (vendor, country, listed) | Price (per org) | Installs shown | Rating (count) |
| --- | --- | --- | --- |
| **LinkedIn Finder for Zoho CRM** (MOBIX, UK/FR/ES, 2019-10) | US$1/mo | **2.8K+** (2,800) | 4.0 (43) |
| **Linked Pro for Zoho CRM** (Zenith Innovations, Pakistan, 2026-02) | US$20/mo, US$240/yr | **600+** | 4.6 (49) |
| **Address Auto Complete** (Intovex Digital, India, 2023-12) | US$10/mo, US$100/yr | **400+** | 5.0 (13) |
| Google Maps Finder (Ulgebra, India, 2021-05) | US$1/mo | 300+ | 5.0 (2) |
| Google Drive for Zoho CRM (Yaali, India, 2022-02) | US$15/mo | 300+ | 4.5 (2) |
| LinkedIn for Zoho CRM (Encodingz, India, 2024-11) | US$1/mo | 200+ | — (0) |
| Zoho CRM 2 Moodle Basic (SaasPlugin, Australia, 2016-07) | US$5/mo, US$54/yr | 100+ | 4.8 (6) |
| Find Address using Google Maps (W3S, Bangladesh, 2023-08) | US$5/mo, US$48/yr | 0 | 5.0 (1) |
| Eisenhower Matrix (Currybyte, India, 2025-03) | US$16/mo, US$173/yr | 0 | — |
| Auto Logo Updater (SarthakSoft, India, 2026-07) | US$20 one-time | 0 | — |
| Task Manager (Mav Consulting, US, 2026-09) | US$10/mo, US$120/yr | 0 | — |

Seven of the eleven show 100+ to 2,800 installs; the four at 0 were listed 2023–2026 (two this summer). An install is an
organisation (the FAQ: only admins install; the extension is "billed only for the extension"), and installs include
10-day trials and uninstalls, so paying orgs are a fraction — Zoho shows the vendor installs by country and revenue, not
the public. At a 10 % paying share, Address Auto Complete (400+ × US$10) is ≈ US$400/month and Linked Pro (600+ ×
US$20) ≈ US$1,200/month, both from one-person-sized vendors; LinkedIn Finder's 2,800 installs at US$1 ≈ US$280/month.

**The data-quality category has buyers**: the related-app tiles show paid Contact Info Verifier (48 ratings), Lead
Finder (53), Phone Checker (36), Email Checker (34), List Manager (48) and PostgreSQL Easy Sync (34) — review counts an
order of magnitude above any paid Zendesk sidebar app read tonight (max 5). The rendered paid shelf (page one, 23 cards)
carries 18 paid cards with 0–16 reviews each; the FAQ counts "900+ extensions for Zoho CRM" and "over 2000" overall.
**No UK-register extension exists**: no Companies House, VAT, charity or sanctions extension surfaced on the shelf or
in the index; the native rival is Zoho's Zia Data Enrichment (company size, industry, key contacts, financials) on the
Enterprise edition, and the enrichment extensions that sell (LinkedIn Finder, Linked Pro) are people-lookups for sales.

## 4. Gate check (ARCHITECTURE validation gate)

| Gate | Reading |
| --- | --- |
| Buyers with money | **Yes** — paid per-org extensions by small vendors show 100–2,800 installs and 13–53 reviews; verification extensions (email, phone, contact info) carry 34–48 reviews |
| Recurring job | Yes — monthly or annual per-org subscriptions billed by Zoho, 0 % commission, US$100 payout floor |
| Paid competitor with a documented gap | Partly — people-enrichment and contact-verification sell; **no UK company/charity/sanctions verification extension exists**; Zoho's own Zia enrichment covers company size and financials for Enterprise buyers, so the gap is UK-register verification on Standard/Professional editions |
| ≤ 1 week to build | Yes — a Sigma widget (JavaScript) on the Account/Lead record over the gankdat API plus Deluge glue: 2 days; then a 2–3 week review with a demo call |
| No policy / ToS risk | Yes on the pages read — first-party shelf, no scraping, Zoho handles payments and tax; risks: Indian arbitration, 10-day termination, Zoho may remove listings; Zoho may add fees (nothing reserved in writing, unlike Zendesk §4.4) |

## 5. Promote / park call

Zoho is the first of the eight billed shelves read this month that passes both halves: the terms are the cheapest (0 %
commission, Zoho bills and handles tax, US$100 floor, free developer console, a 10-day trial built in) and the demand is
first-hand (small vendors' paid per-org extensions at 100–2,800 installs with dozens of reviews, where Zendesk's sat at a
median of 2 and Bubble's rival at 3). The job to sell is UK organisation verification on the Account and Lead records —
company status, officers, charity record, sanctions hit — which no extension offers and which Zoho's own enrichment
does not cover for Standard and Professional buyers.

**Recommendation: promote (reshaped) — the 2026-10-28 exchange ranks it against the other shelf promotes.** Reshaped
from "US$3–5 per user per month" to **US$9 per org per month or US$90 per year, 10-day trial** (between Address Auto
Complete's US$10 and Moodle's US$5; per-user plans do not exist on this shelf). Build: `zoho-crm-uk-registers-widget` —
a Sigma extension with a related-list widget on Account and Lead that calls the gankdat registers (uk-company-profiles,
uk-charities, sanctions) for the record's company name or number, 2 days; owner: company profile under the trading name,
bank details, one demo call with Zoho's reviewers, the Developer Agreement — one batched request in
`docs/for-owner/actions/`. STRATEGY §5: evidence 2 (first-hand installs and reviews on paid small-vendor extensions, 0 %
read on three pages, no rival) × reach 2.5 (900+ CRM extensions, Zoho's customer base, per-org price) ÷ (2 days + owner
hour) ≈ 2.4 at weight 2 — ranks with the shelf promotes the exchange already holds (Etsy), behind foundry
`actions-minutes` at 7 until the exchange re-weights. Proof when built: ≥ 25 installs and ≥ 3 paying orgs within 60 days
of listing (the partner console shows both); kill if < 10 installs at day 60. Not raised to the owner today; the exchange's
decision carries it.

**If the exchange parks it instead**, trigger: a gankdat shelf converts (first paying account or ≥ 20 paid Apify runs a
month), or a UK-register or KYB extension appears on the Zoho CRM shelf with ≥ 100 installs (re-read 2026-12-01).

Numbers in one line: individual **likely yes** (self-serve company profile; small foreign vendors verified; the pages
do not say "company required"); commission **0 %** (report definition + "never charge a fee"), floor US$100, wire ~15
working days; review 2–3 weeks with a demo call; prices **per org** US$1–20/month; 7 of 11 paid listings at 100–2,800
installs, data-quality rivals 34–53 reviews; call: **promote (reshaped)** at US$9/org/month for the 2026-10-28 exchange.
