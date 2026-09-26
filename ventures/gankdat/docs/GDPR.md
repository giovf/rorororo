# UK GDPR — records of processing and legitimate-interests assessments

Maintained by Claude; reviewed 2026-09-20. Public-facing text lives in `public/privacy.html`
and the per-dataset table in `public/terms.html`; this file is the internal record (UK GDPR
Art 30) and the reasoning behind the lawful bases.

**Controller:** Giovanni Funaro, a UK sole trader trading as gankdat (contact info@gankdat.com) — named in the privacy policy and terms since 2026-09-20.
**ICO data protection fee:** see Foundry action 012 (tier 1; required because serving
sanctions/exclusions lists is processing beyond the exempt "accounts, staff, marketing" purposes).

## 1. Records of processing

| Processing | Data subjects | Personal data | Lawful basis | Retention | Processors | Transfers |
| --- | --- | --- | --- | --- | --- | --- |
| Accounts & API keys | customers | email; key hashes; plan | contract (Art 6(1)(b)) | while account exists; deleted on request | Cloudflare (D1/KV) | UK/EU/US under Cloudflare DPA + UK addendum / Data Bridge |
| Sign-in (magic link) | customers | email; single-use token; session cookie | contract | token 15 min; session 7 d idle / 30 d | Cloudflare, Resend (EU region) | as above |
| Billing | customers | Stripe customer id; invoices (held by Stripe) | contract; legal obligation (tax records, 6 y) | 6 years after last transaction | Stripe (independent controller for its own compliance) | Stripe UK/EU entities |
| Usage metering & logs | customers | request logs with key id, path, status, IP (Workers Logs) | legitimate interests (security, quota, abuse) | Workers Logs ≈ 7 d; Analytics Engine 90 d (user-agent only, no key/IP) | Cloudflare | as above |
| Waitlist / feedback | visitors | email (optional), message | consent (waitlist), legitimate interests (feedback) | until acted on / deleted on request | Cloudflare | as above |
| Support email | anyone writing in | email, content | legitimate interests | 2 years | Cloudflare Email Routing → owner's mailbox (Google) | Google DPA |
| B2B outreach replies (2026-09) | staff of the ten limited companies written to (`docs/OUTREACH-2026-09.md`) | name, work email, reply content | legitimate interests — see LIA C | 2 years, like support mail; opt-outs kept as a domain suppression list | Cloudflare Email Routing → owner's mailbox (Google) | Google DPA |
| Dataset: uk-sanctions | designated persons on the UK Sanctions List | names, aliases, regime, designation dates, countries (DOB, IDs, addresses dropped) | legitimate interests — see LIA A | mirrors the official list; refreshed daily | Cloudflare | as above |
| Dataset: sam-exclusions | excluded persons/entities on SAM.gov | name, classification, program, agency, dates (addresses, SSN/TIN/NPI, comments dropped) | legitimate interests — see LIA A | mirrors the official list; refreshed daily | Cloudflare | as above |
| Dataset: uk-food-hygiene | food business operators (some sole traders) | trading name, trading address, rating fields (operator comments dropped) | legitimate interests — see LIA B | mirrors the FSA file; refreshed daily | Cloudflare | as above |
| Datasets: uk-companies, uk-insolvency, uk-tenders, eu-ted, uk-planning | none by design | Blind Mode: organisation-level fields only; officer/PSC/contact/person fields never ingested | n/a | daily | Cloudflare | as above |
| x402 payments | paying agents' wallet holders | public wallet address on-chain (not linked to any account) | contract | on-chain, permanent by nature | Coinbase CDP facilitator | US |

No special-category data. No automated decision-making with legal effect. No children's data
(business tool). No sale of personal data, no purchased lists, no cold email.

## 2. LIA A — serving sanctions and exclusion lists

- **Purpose:** enable customers to screen counterparties against lists that governments
  publish precisely so that they are screened against. Benefits: sanctions compliance, fraud
  and award-eligibility checks; a legal duty for many customers.
- **Necessity:** screening requires the names; there is no less intrusive way. We minimise:
  dates of birth, identifiers, addresses, contact details and free text are dropped at ingest.
- **Balancing:** the data is already public by law, published for this purpose; subjects have
  a reasonable expectation of screening; harm is limited to what the official publication
  already causes. Safeguards: mirror-only (no enrichment, no inference), daily refresh so
  delistings propagate within 24 h, terms restrict use to compliance/due-diligence/research,
  rights requests routed to the list owner (FCDO / US GSA) who controls the source, plus our
  own contact for our copy.
- **Conclusion:** legitimate interests apply; Art 21 objections handled case by case (we can
  suppress a record in our copy while the source is corrected).

## 3. LIA B — food hygiene ratings (business data with incidental personal data)

- **Purpose:** supplier due diligence, onboarding and lead generation from a public register
  the FSA publishes under the Open Government Licence for reuse.
- **Necessity:** trading name and address are the register's identifiers; the FSA already
  withholds addresses of businesses run from private homes. We drop the operator's free-text
  "right to reply".
- **Balancing:** the data is published by a public authority for public use; expectations are
  set by the scheme itself (ratings are displayed on premises). Low risk.
- **Conclusion:** legitimate interests apply.

## 4. LIA C — B2B outreach (2026-09 experiment)

- **Purpose:** ten one-off emails from info@gankdat.com to UK limited companies (bid consultancies,
  web agencies) whose published work matches a dataset, asking whether the API is useful. Targets,
  addresses and wording: `docs/OUTREACH-2026-09.md`.
- **Personal data:** none sent to — every address is a generic company mailbox (info@, hello@,
  studio@, enquiry@); PECR reg. 22 applies to individual subscribers only, and reg. 23 (sender
  identified, valid reply address) is met by the footer. Personal data arises only when a named
  person replies: their name, work address and message.
- **Necessity and balance:** the reply is processed only to answer it; no profiling, no list, no
  follow-up if there is no reply; one "no thanks" adds the domain to a suppression list every
  routine honours. A reasonable employee expects a reply to their own email. Retention two years,
  as for support mail. Individuals can object or ask for deletion by replying; nothing else is held.
- **Decision:** legitimate interests (Art. 6(1)(f)) for replies; the initial send involves no
  personal data. Not a basis for scaling: a new list needs a fresh LIA line here.

## 5. Rights and breaches

- Requests to info@gankdat.com; identity confirmed via the account email; answered within one
  month. Access/erasure for account data is a D1 query; for dataset copies we suppress the row
  and point to the source.
- Breach: assess within 24 h; notify the ICO within 72 h if risk to individuals; notify affected
  customers if high risk. Key material at risk → revoke keys (KV tombstones) and rotate secrets
  per RUNBOOK.

## 6. Open items

1. ICO fee registration — owner decision 2026-09-20: deferred until the first real customer
   (action 012 records the risk). Add the registration number to the privacy policy when paid.
2. ~~Controller identity~~ — done 2026-09-20 (privacy policy + terms).
3. Datarade profile: sole trader trading as gankdat; city/country only.
