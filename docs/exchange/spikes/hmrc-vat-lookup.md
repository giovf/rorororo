# Spike: HMRC "Check a UK VAT number" as a gankdat lookup — access terms, limits, rivals

Research spike `spike-hmrc-vat-lookup` (new-ventures queue, burn-down routine, 2026-10-17 19:10–19:40 UTC).
Decides the parked exchange idea `uk-vat-number-check` (pre-research 2026-10-14), whose trigger was: an open-access
lookup (no Developer Hub application) and the Apify rival's users and price known → score it against the gankdat
queue; an application-restricted API only → decline unless the owner volunteers a Developer Hub account.

## How it was read (primary sources through the relay, no credential)

Two relay rounds: `docs/relay/responses/vat-check-2026-10-14/` (the v1 and v2 documentation pages, the Developer
Hub terms of use, the Apify rival's page) and `docs/relay/responses/hmrc-vat-2026-10-17/` (the v2 endpoints page,
the Developer Hub reference guide, the application-restricted authorisation page, two keyless probes of the
production and sandbox lookup route, the Apify store search API for `vat` and `hmrc`, a HEAD of the public HTML
checker). Rival prices off Apify come from WebSearch result snippets (rapidapi.com, vatstack.com, trustcomponent.com,
freetier.co); the sandbox cannot open vatsense.com or vatcheckapi.com directly.

## Access: application-restricted only, no keyless route since February 2025

| Fact                                 | Source and value                                                                                                                                                                  |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Current version                      | 2.0 (beta), page last updated 14 October 2026. "Version 1 was removed on 17 February 2025." The 1.0 documentation URL answers 404 on both hosts.                                   |
| Why v2 exists                        | "Version 2 moved the Check a UK VAT Number API behind authentication. We moved the API behind authentication so we can fully understand our users."                                |
| How to get access                    | "You need to register to have access to Version 2 … using HMRC's Software Developer Hub. Registering should take around 2 weeks." Production credentials come after sandbox testing and accepting the Terms of Use 2.0. |
| Auth model                           | Application-restricted endpoint: OAuth 2.0 client-credentials grant, token lives 4 hours, no end-user authorisation (reference guide, authorisation page).                          |
| Keyless probe, production            | `GET api.service.hmrc.gov.uk/organisations/vat/check-vat-number/lookup/123456789` → 404 `MATCHING_RESOURCE_NOT_FOUND` (the unversioned v1 route is gone; v2 needs the `vnd.hmrc.2.0+json` Accept header and a bearer token). Same on `test-api`. |
| Rate limit                           | Reference guide: "Our standard limit is 3 requests per second per application"; 429 `MESSAGE_THROTTLED_OUT`; "we advise software developers to avoid batching requests"; a higher limit is a conversation with HMRC. |
| Stated purpose                       | "The Check a UK VAT Number API is for the sole purpose of allowing traders to do due diligence on VAT-registered businesses." Two modes: simple check (name, address) and verified check (adds a proof reference, needs the requester's own VRN). |
| Terms of use (Developer Hub)         | Production access is a questionnaire on the organisation, its processes and the software: named responsible person, privacy policy URL specific to the product, encryption of stored data, marketing that never claims integration before live access, fraud-prevention headers where an API mandates them. No clause names resale or caching; the purpose clause above is the limit. |
| Public HTML checker                  | `tax.service.gov.uk/check-vat-number/enter-vat-details` answers 200 to a HEAD: a GOV.UK session-and-CSRF web form, not an API.                                                       |

What this means for gankdat: there is no route a Worker can call without an HMRC application registered to a named
person. The application is the owner's identity on a government developer programme (CLAUDE.md "things to ask
before doing"), the review takes about two weeks, and the product it would power — a metered lookup resold per
call to anyone — is not "a trader doing due diligence on its own counterparties", which is the API's declared sole
purpose. The alternative every Apify rival takes, driving the GOV.UK web form from a script, is scraping a
government service built for people; ARCHITECTURE's store-policy rule (no scraping of sites that forbid it, no
ToS risk) and the operation's own line on government services rule it out regardless of what the form tolerates.

## Rivals: a commodity check at US$0.003–0.09, and the Apify shelf is nearly empty

| Rival (source, date read)                                  | Price per UK check                                              | Demand signal                                   |
| ---------------------------------------------------------- | --------------------------------------------------------------- | ----------------------------------------------- |
| Apify `nocodeventure/uk-vat-hmrc-api` (store API 10-17)    | US$0.005 per result + US$0.01 per run ("from $5.00 / 1,000")    | 14 users ever, 4 in 30 days, 585 runs; scrapes the HTML form |
| Apify `landlordtools/uk-identifier-checker` (store API)    | US$0.003 per result (format check only, 7 identifier types)     | 2 users, 10 runs                                |
| Apify `ryanclinton/eu-vat-validator` (store API)           | US$0.004 per validation + US$0.01 per run (EU VIES, not UK)     | 18 users, 5 in 30 days, 26,283 runs — the busiest VAT actor |
| Apify store search `vat`                                   | 872 actors match the word; of the top 50, 1 is a UK check, 9 are EU VIES checks at 2–3 users each, the rest are lead scrapers that happen to output a VAT id |                                                 |
| RapidAPI Apitier "Validate VAT" (EU + GB) (WebSearch)      | "3 request for 1 Cent" ≈ US$0.0033                              | listing only                                    |
| vatstack (pricing page via WebSearch 10-14, 10-17)         | US$0.09 / 0.03 / 0.01 overage on US$15 / US$150 / enterprise plans | —                                               |
| TrustComponent (WebSearch)                                 | €9 per month for 2,000 checks ≈ €0.0045                         | EU-focused                                      |
| vatcheckapi, vatsense (WebSearch snippets)                 | free tier 100–150 checks/month; vatsense caps 3 req/s "to comply with HMRC upstream limits" | vendors hold their own HMRC credentials         |

The money per check is real but tiny and already at the floor gankdat prices (x402 US$0.005 a call): a reseller
cannot undercut Apitier's US$0.0033 or vatstack's enterprise US$0.01 and still pay Apify's 20 % or Stripe's fees.
The one Apify rival on our own shelf has 4 monthly users after five months, so the shelf is not pulling demand
either. The buyers who pay (invoicing SaaS, marketplaces) hold an HMRC application of their own or buy from a
vendor that does; the gap the 10-14 pre-research hoped for — an open lookup nobody has wrapped — closed in
February 2025 when HMRC removed v1.

STRATEGY §5 score for a build: evidence 1 (rivals at 2–14 users, prices at the floor) × reach 2 (Apify, MCP, x402)
÷ effort 1 day = **2**, before the owner-identity blocker, which makes it 0 for a routine.

## Recommendation: declined

- **Decline the gankdat VAT lookup.** No keyless route exists; the only lawful route needs the owner's named HMRC
  Developer Hub application (two weeks, questionnaire, product-specific privacy policy) for an API whose declared
  sole purpose is a trader's own due diligence, not a resold per-call check; the scraping route is a GOV.UK form
  and is out of bounds; and the market pays US$0.003–0.01 a check to vendors already holding credentials. The
  exchange idea `uk-vat-number-check` moves to `declined` with this file as the reason.
- **Reopen only if the owner volunteers** an HMRC Developer Hub registration for a product of their own that needs
  due-diligence checks (then it is a feature of that product, not a dataset), or if HMRC publishes an open-access
  version again — neither is a trigger a routine should poll for.
- **By-product:** the Developer Hub reference guide (3 req/s per application, 4-hour client-credentials tokens,
  fraud-prevention headers) is now on disk for any later HMRC API idea (MTD VAT, trade data), all of which sit
  behind the same registration.
