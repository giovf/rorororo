# 011 — list gankdat on Datarade (one account, ~10 minutes)

**Status:** REJECTED by Datarade on 2026-09-21 — "we only work with registered businesses as opposed to sole proprietors". Nothing to do; revisit only if a limited company is formed (see STRATEGY.md §8). · **Cost:** £0 (free plan; Datarade takes 30% only on deals
it brokers itself; direct customers are ours).

Datarade is the one free marketplace where business data buyers search by category, request
samples and post "I need X data" requests. It needs a provider account in your name; nothing else
here needs you. Full eligibility notes: `ventures/gankdat/docs/DATA-MARKETPLACES.md`.

## What to do

1. Go to https://datarade.ai/company/contact/data-providers and apply as a provider. Use
   info@gankdat.com as the contact email (it lands in your inbox, and I read it).
2. Paste the text below where the form asks about the company, products and customers.
3. When the account is approved, add the products (one per bundle) with the same text, and
   set pricing to "from £5/month, free tier available" linking to https://gankdat.com.
4. Reply "011 done" here. If Datarade messages arrive at info@, I'll draft the replies for you.

## Supporting documents (ready — pull the repo, they are in `docs/for-owner/datarade/`)

| Datarade field | Upload |
| --- | --- |
| Data samples | `gankdat-data-samples.zip` (25 live records per dataset, JSON, with a README) |
| Data catalog overview | `gankdat-data-catalog.pdf` |
| Data dictionary | `gankdat-data-dictionary.pdf` |
| Marketing material | `gankdat-data-catalog.pdf` again, or leave empty |
| Certifications | leave empty (none held; GDPR posture is in the catalogue's compliance section) |

Primary data categories: Company Data, Government Data, Sanctions/Compliance (KYB) — then
Procurement/Tender or B2B Leads if a fourth is allowed. Location: London, United Kingdom.
Legal entity: sole trader, trading as gankdat.

## Copy-paste text

**Company:** gankdat (gankdat.com) — UK sole trader. Official government open data served as a
clean JSON API (REST + MCP for AI agents), refreshed daily, self-serve plans from £5/month with a
free tier.

**Data products (two bundles):**
- *Bid intelligence:* UK public procurement notices (Find a Tender), EU procurement notices (TED),
  UK planning applications — one flat schema, filterable by buyer, CPV, value, dates, authority.
- *Counterparty risk & leads:* UK Sanctions List (FCDO), US federal exclusions (SAM.gov), UK
  corporate insolvency notices (The Gazette), new UK company incorporations (Companies House),
  UK food hygiene ratings (Food Standards Agency, ~610,000 establishments with rating history
  signals).

**Sources & licensing:** official government feeds only, Open Government Licence v3 / Crown
copyright / EU reuse decision / US public domain. No scraping. Personal data minimised or dropped
at ingest; posture documented per dataset at https://gankdat.com/terms.

**Delivery:** REST API (OpenAPI 3.1 at https://gankdat.com/openapi.json), MCP server at
https://gankdat.com/mcp for AI agents, pay-per-request in USDC (x402). Daily refresh; stable
identifiers per record. Free sample: 250 requests/month on a free key.

**Target customers:** bid managers and bid-writing consultancies; compliance/KYB and supplier
due-diligence teams; hospitality wholesalers, EPOS and food-delivery platforms (onboarding and
lead generation from hygiene ratings); insurers; proptech.

**Pricing:** free (250 req/month); £5/1,000; £23/5,000; £79/20,000; £239/100,000 requests per
month. Custom feeds on request.
