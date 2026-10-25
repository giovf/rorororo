# gankdat on Power Platform — certified connector package and certification notes

Built 2026-10-25 (burn-down, queue `gankdat/power-platform-certified-connector`, spike
`docs/exchange/spikes/power-platform-connector-shelf.md`). The connector is a **package rendered from the source
registry** — the same zod schemas that build the REST validation, the OpenAPI 3.1 document, the MCP tools and the x402
Bazaar declarations — so a new dataset is in the connector the day it ships, and nothing dataset-specific lives outside
its source file (isolation rule).

| File | Role |
| --- | --- |
| `src/connector/render.ts` | pure renderer: Swagger 2.0 document, `apiProperties.json`, `readme.md`, `intro.md`; the JSON Schema 2020-12 → Swagger 2.0 converter (`toSwaggerSchema`); the certification constants |
| `scripts/connector.mjs` → `npm run connector` | esbuild-bundles the renderer with the registry, writes `connector/` (JSON through Prettier) and renders `icon.png` from `public/icon-raccoon.svg` |
| `connector/apiDefinition.swagger.json` | the connector: 28 operations (17 `query_<slug>` actions, 9 `changes_<slug>` actions, `list_sources`, `get_usage`), every response typed from the record schema |
| `connector/apiProperties.json` | the one connection parameter (`api_key`, securestring, entered as `Bearer yourKey`), `iconBrandColor`, publisher |
| `connector/readme.md` | the folder readme for `microsoft/PowerPlatformConnectors` (the repository's own headings) |
| `connector/intro.md` | the connector's reference page for Microsoft Learn (Partner Center package) |
| `connector/icon.png` | 230 × 230 PNG, raccoon at 65 % on the `#0a0a0a` canvas |
| `test/connector.spec.ts` | pins every rule below for every source, and that the committed files equal the registry's render |

**After any dataset or schema change run `npm run connector` and commit `connector/`** — the spec fails otherwise.

## Certification rules the package follows (Microsoft Learn, "Prepare connector files", read 2026-10-25)

| Rule | How the package meets it |
| --- | --- |
| Title ≤ 30 chars, English, unique, no "API", "Connector" or product names, ends alphanumeric | `gankdat` |
| Description 30–500 chars, no product names | `CONNECTOR_DESCRIPTION` (≈ 380 chars) |
| Icon 100–230 px square PNG, non-white background that matches `iconBrandColor`, logo under 70 % of the side, brand colour not `#ffffff` / `#007ee5` | 230 px, `#0a0a0a`, logo 65 % |
| Operation and parameter summaries ≤ 80 chars of letters, digits, spaces, parentheses | `summaryText()` — `&` → `and`, every other character dropped, cut at a word |
| Descriptions are full sentences ending in punctuation | `sentence()` on every operation, parameter, property and item description |
| Exact response schemas, no `default` response, no empty operation or schema, typed outputs (no dynamic schema) | one `200` per operation, the envelope typed from `recordSchema`; an untyped node throws in the renderer |
| Swagger 2.0 + the connectors' extended standard | `toSwaggerSchema`: nullable → `x-nullable`, `T \| null` unions → the branch, `const` → `enum`, numeric `exclusiveMinimum` → boolean, zod's ±2^53 integer bounds dropped, `additionalProperties: false` dropped; `x-ms-summary` on every parameter and property, `x-ms-visibility` on every operation (`important` for data and changes, `advanced` for listing and usage; `page`, `per_page`, `q` advanced) |
| Connection parameter in the documented API-key shape | `api_key` securestring, `tabIndex 2`, `clearText false`, `required "true"` |
| Production host only | `gankdat.com`, https |
| Every operation tested ≥ 10 times before submission | the owner's preview-environment step (below); the actions are the live `/v1/data` and `/v1/changes` routes the REST tests cover |

**The Bearer prefix.** The Worker requires `Authorization: Bearer <key>` and the connector platform sends an API-key
connection parameter as the header's value verbatim. The shelf's bearer-key connectors (OpenAI, Cohere, Hugging Face,
Resend — read from the repository 2026-10-25) all ask the user to enter the key as `Bearer yourKey`; the package does
the same, in the display name, the description, the tooltip, the readme and the intro. A `setheader` policy template
with `@connectionParameters('api_key')` would hide the prefix, but no connector read first-hand used it that way, so
the documented pattern stands (a later certification comment can change it in one place, `renderApiProperties`).

**Premium.** Every connector to an external service is Premium: a maker needs a Power Automate / Power Apps premium
licence to use it (Logic Apps lists it as Standard). The connector itself is free and the store never bills; the key,
plans and credit packs are sold on gankdat.com — the same shape as the Excel add-in and the five key-billed data-API
connectors on the shelf.

## Owner steps (action 031, second shelf)

Prerequisite: action 031 step 2 (the Partner Center **Company** account with the **Microsoft 365 and Copilot** program
enrolled — the verified-publisher lane uses the same Seller account; "all Seller accounts go through a vetting process").
Nothing below can run from a sandbox: a custom connector exists only inside a Power Platform environment.

1. **An environment** (5 min): the free Power Apps Developer Plan (https://aka.ms/PowerAppsDevPlan) with the work
   account from step 2 gives one. Nothing to pay.
2. **Create the custom connector from the files** (10 min). Either the `paconn` CLI (Python) from the repository's
   `ventures/gankdat/connector/` folder —
   ```
   pip install paconn
   paconn login
   paconn create --api-prop apiProperties.json --api-def apiDefinition.swagger.json --icon icon.png
   ```
   — or in make.powerautomate.com → Custom connectors → New custom connector → **Import an OpenAPI file**
   (`apiDefinition.swagger.json`), then on *General* upload `icon.png` and set the background to `#0a0a0a`, on
   *Security* choose **API Key**, parameter label `API key (in the form 'Bearer yourKey')`, name `Authorization`,
   location Header; create. On the *Test* tab create a connection with `Bearer <a key from gankdat.com/account>` and
   run `list_sources`, `get_usage`, one `query_` and one `changes_` action until each has ten green runs (Microsoft's
   checklist asks for ten successful calls per operation before submission; the 28 operations share two code paths,
   so a sample of each path is the honest reading — note any that fail as a Telegram note and stop).
3. **A solution** (10 min): make.powerapps.com → Solutions → New solution (`gankdat`, publisher `gankdat`) → Add
   existing → Automation → Custom connector → the connector; New → Automation → Cloud flow → Instant: one step
   `gankdat – List datasets`; save. Run **Solution checker** on the solution (must report no connector issues). Export
   the solution twice — once holding only the connector, once holding the flow — as unmanaged zips (the submission
   page asks for a connector solution and a flow solution).
4. **The package** (10 min): a folder holding the two solution zips and `connector/intro.md`, zipped. Run Microsoft's
   `ConnectorPackageValidator.ps1` (PowerShell; link on the "Prepare connector files" page) on the zip. Upload the zip
   to an Azure Storage blob and generate a **SAS URI valid for at least 15 days** (an Azure free account's storage
   covers it at £0; if anything is charged it is pennies — log it in `docs/LEDGER.md`).
5. **The offer** (10 min): partner.microsoft.com → Marketplace offers → **Microsoft 365 and Copilot program** → New
   offer → **Connectors & Agents in Microsoft Copilot Studio** → name `gankdat connector`. Packages: paste the SAS URI
   (no OAuth fields — the connector is API key). Properties: categories *Data* and *Business Intelligence* (a third is
   optional); tick the **Standard Contract**; privacy link `https://gankdat.com/privacy`; support link
   `https://gankdat.com/feedback`. Availability: no HideKey. Review and publish → **Publish**.
6. **After submission** (no action for 24–48 h): the certification report appears in the offer's *Product overview*; a
   failed report becomes a queue item the next burn-down fixes (the package is re-rendered, the SAS URI re-uploaded by
   you). When it passes, Microsoft gives a **preview environment** link live for 48 business hours: create a connection
   there and run a few actions, then select **Go live**. Deployment to all regions takes 10–14 days from the next Friday.
7. **Open-sourcing** (5 min, when Microsoft asks for it during certification — it adds you to `CODEOWNERS`): fork
   `microsoft/PowerPlatformConnectors`, add `certified-connectors/gankdat/` with `apiDefinition.swagger.json`,
   `apiProperties.json` and `readme.md` from the repository's `connector/` folder (no secrets in them — the key is the
   user's), open a pull request against `dev` with the body below, sign Microsoft's CLA when the bot asks.

**Give back:** a Telegram note `connector submitted` after step 5 and `connector live` when the offer shows *Live*;
the next routine files the day-30 reading (≥ 10 connections' first call within 30 days, read from the Power Platform
gateway user agents on `rest_data`) and the SELF-CAUSED row already covers Partner Center's mail.

### Pull request body (paste)

```
Adds the gankdat certified connector (verified publisher: we own the API at https://gankdat.com).

UK and EU public registers as clean JSON — company lookup and monitoring, tenders and contract awards, sanctions
and exclusions, charities, schools, NHS organisations, care locations, trade marks, licences — one action per
dataset plus a daily change-feed action per register, API-key connection (bearer key from the user's gankdat account).

The package is generated from the API's schema registry (TypeScript, zod) and validated by a test that pins the
certification rules; it was built with Claude Code, reviewed and submitted by the publisher. Partner Center offer:
<offer name/id>.
```

## Why this shelf (spike, 2026-10-25)

Microsoft certifies connectors for free in both lanes; the verified lane (an API you own) runs through the Partner
Center account action 031 already asks for and releases the connector as Premium into every Power Automate, Power
Apps, Logic Apps and Copilot Studio tenant's picker. The shelf holds 1,578 connectors, 435 independent-publisher ones;
five key-billed data-API vendors (Abstract ×9, Hunter, OpenSanctions, OpenCage, Tax ID Pro) use the identical one-key
connection, so "the store lists, the key bills" is the shelf's norm; Companies House, CQC and UK VAT have single-register
wrappers (Companies House unchanged since 2022-02-08) and nobody offers a cross-register bundle or a change feed as a
connector. Score 3.2 = evidence 2 × reach 2 ÷ (1 day + the owner's sitting).

## Sources read

- Microsoft Learn: "Get your connector certified — overview", "Verified publisher certification process", "Prepare
  Copilot Studio and Power Platform connector files for certification" (last updated 2026-09-30), the connectors FAQ —
  through the relay, `docs/relay/responses/power-platform-connector-shelf/{1,2,3,5}.html` (pruned after 7 days).
- `microsoft/PowerPlatformConnectors` (`dev`): `schemas/paconn-apiProperties.schema.json`,
  `schemas/apiDefinition.swagger.schema.json`, the Companies House, Cloudmersive, OpenAI, Cohere, Hugging Face, Resend,
  Pinecone, Notion, Tax ID Pro and Abstract `apiProperties.json` files — read directly from raw.githubusercontent.com,
  which answers from the sandbox (api.github.com does not).
