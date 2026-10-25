# Spike: Microsoft Power Platform certified connector as a shelf for the gankdat API

Queue item `new-ventures/spike-power-platform-connector-shelf` (burn-down, 2026-10-25 17:26–17:33 UTC; seeded by the same
run's pre-research pass). Sources: two fetch-relay rounds this run (`docs/relay/responses/power-platform-connector-shelf`,
`-2`, pruned after 7 days): Microsoft Learn's "Get your connector certified — overview", "Verified publisher
certification process", "Prepare connector files for certification", "Independent publisher certification process", the
connectors FAQ, the Power Automate connector reference (every connector, 1,578 table rows), nine connector pages read
first-hand, and the `microsoft/PowerPlatformConnectors` repository through the GitHub API (README, root listing, the
Companies House connector's folder, readme and last commit, the repository record). learn.microsoft.com and
api.github.com do not answer from the sandbox (000 / 403); both were already on `docs/relay/hosts.txt`.

The questions the pre-research left open: which lane gankdat's own API takes and what it asks of a UK sole trader; the
certification files against our OpenAPI 3.1 and bearer-key auth; whether data-API vendors whose connections take a paid
key are on the shelf; the state of the Companies House connector; and the repository's rule on AI-assisted pull requests.

## 1. The two lanes, and which is ours (Microsoft's own pages)

| Source | What it says |
| --- | --- |
| Overview, FAQ | Certification is free in both lanes ("no cost to register, go through the certification process, or update"); it typically takes 3–5 business days, then 7–10 business days of regional deployment; every connector to an external service is released as **Premium** (a maker needs a Premium licence to use it; Logic Apps lists it as Standard). |
| Repository README | `certified-connectors` holds connectors "built by partners who own the end service"; `independent-publisher-connectors` holds connectors "submitted by publishers … that do not own the underlying service". The FAQ: an independent publisher need not own the service nor hold rights to the API. |
| Verified publisher process | The lane for an API you own, so **gankdat's lane**. Steps: open-source the connector in the repository (Microsoft adds you to `CODEOWNERS`); create a **Partner Center Seller account** ("all Seller accounts go through a vetting process"), with a valid email on the Entra ID account (a missing email auto-rejects the request), verified account information, and enrolment in the **Microsoft 365 and Copilot program**; then Partner Center → Marketplace offers → Microsoft 365 and Copilot program → New offer → "Connectors & Agents in Microsoft Copilot Studio", package uploaded by SAS URI, Marketplace Policies §5000 apply. |
| Independent publisher process | By pull request to the repository; every PR needs **verified credentials** (a Microsoft Entra Verified ID in the Authenticator app); the connector must not already exist on the platform. Not available to us for our own API; a third party could list gankdat this way, which is a trigger, not a plan. |
| Prepare files | Swagger **OpenAPI 2.0** (`apiDefinition.swagger.json`, "the connectors' extended standard"), `apiProperties.json` with the connection parameters (an API-key connection is one `securestring` parameter with a `uiDefinition`), icon, no empty operations, no dynamic-schema responses without typed output, `readme.md`, `intro.md`. |

Reading for this operation: the owner step is the **same Partner Center account the AppSource add-in needs** (action 031:
Company account, manual review on a tax document, £0) plus one programme enrolment — one sitting covers both Microsoft
shelves. The build step is a generator: gankdat already renders its OpenAPI from the registry's zod schemas; the connector
needs the same surface emitted as Swagger 2.0 with one action per dataset (`query_<slug>`), `get_changes`, and the
lookup, the bearer key as the single connection parameter, and the package files beside it. Certification then runs on
Microsoft's side with no further owner time, and the connector appears in every tenant's connector picker.

## 2. The shelf: who is on it and how they bill

| Reading | Number |
| --- | --- |
| Connector reference rows (Power Automate) | 1,578 |
| Of which "(Independent Publisher)" | 435 |
| Key-billed data-API vendors read first-hand, connection = one `API Key` `securestring` | Abstract Company Enrichment (one of nine Abstract connectors: email, phone, VAT, IBAN validators, IP geolocation …), Hunter, OpenSanctions, OpenCage Geocoding, Tax ID Pro — five, all independent-publisher connectors over paid plans sold on the vendor's own site |
| UK registers already on the shelf | Companies House (Independent Publisher): publisher Matt Collins-Jones, 13 actions over the official API (profile, officers, PSCs, charges, filing history, UK establishments), connection = the Companies House key, 100 calls / 60 s per connection, folder last changed **2022-02-08** (its one commit); CQC Data (Independent Publisher) and UK Check VAT (Independent Publisher) over the government APIs |
| Monitor / change-feed connector for any UK register | none seen in the list (no sanctions, tenders, charities, sponsors, insolvency, trade marks, schools or NHS register connector) |
| Repository | 1,298 stars, 1,480 forks, pushed 2026-10-22; default branch `dev`; no `CONTRIBUTING.md` and no `.github/PULL_REQUEST_TEMPLATE.md` at the paths tried (404); contributions sit under Microsoft's CLA (README); nothing read forbids or mentions AI-assisted contributions — the PR will say it was built with Claude Code, as CLAUDE.md requires |

What this says: the shape — a free connector in Microsoft's picker whose connection asks for a key the vendor sells —
is the norm for data APIs on this shelf (Abstract alone has nine), so gankdat's connector is a known pattern, not an
exception to argue for. The two UK registers we serve that already have connectors are single-source, keyless-API
wrappers; nobody offers the cross-register bundle, the change feeds or the keyless preview as a connector. The
Companies House connector has not changed in 3 years 8 months, which is how the shelf treats a finished wrapper, not a
sign of churn.

## 3. Gaps between gankdat and the certification files

- **Swagger 2.0**, not OpenAPI 3.1: a second renderer over the same zod registry (`src/routes/openapi` already walks it);
  the connectors' extended standard adds `x-ms-summary`, `x-ms-visibility` and the `x-ms-connector-metadata` block.
- **One typed response per action**: Microsoft rejects dynamic-schema outputs with no typed properties, so each dataset
  action declares the record's fields from the source's zod output schema (the registry has them; `/openapi.json`
  already emits them).
- **Connection parameter**: `Authorization: Bearer <key>` as an APIKey parameter in header position — the documented shape.
- **Premium only**: no way round it for an external service; the free plan's 250 credits still gates the first call.
- **Open-sourcing**: the `certified-connectors/gankdat` folder is public by rule; the files carry no secret (the key is the
  user's).

## 4. Call: promote (score 3.2, gankdat queue, weight 1)

Evidence 2 (five key-billed data-API connectors with the identical connection shape, a UK-register connector already on
the shelf, 435 independent-publisher connectors live) × reach 2 (every Power Automate, Power Apps, Logic Apps and
Copilot Studio tenant, trimmed by the Premium licence) ÷ (1 build day for the generator, package, readme and a
validation run + the owner's Partner Center enrolment, ≈ 15 min on top of action 031) = **3.2**. Promoted as
`gankdat/power-platform-certified-connector`: the connector package generated from the registry and validated, an owner
action appended to the Partner Center sitting, and the day-30 proof read from the Daily numbers row (`rest_data` user
agents from the Power Platform gateway) — ≥ 10 connections' first call within 30 days of the connector going live.
Parked alternative (no item): wait for a third party to list gankdat as an independent-publisher connector — nothing
makes that happen.
