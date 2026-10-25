# Owner action request #031 — a Partner Center account, the AppSource submission for gankdat's Excel add-in, and the Power Platform connector offer on the same account

- **Date:** 2026-10-24
- **Status:** open
- **Your time:** ~45 minutes in one sitting (account 25–30, sideload test 5, offer upload 10), then a manual review by
  Microsoft of unknown length (no action from you while it runs); **plus ~50 minutes for the second shelf** (step 4,
  added 2026-10-25: the Power Platform connector — environment 5, connector + ten test calls 10, solution 10,
  package + storage link 10, offer 10; later a 5-minute pull request when Microsoft asks for it)
- **Cost:** £0.00 (the new Partner Center flow has no registration fee; the add-in is listed free)
- **Blocks:** gankdat `appsource-excel-custom-functions-add-in` reaching the shelf, and (since 2026-10-25) gankdat
  `power-platform-certified-connector` reaching the Power Automate / Power Apps / Logic Apps / Copilot Studio connector
  picker — the connector package is built and tested under `ventures/gankdat/connector/`; the Seller account, the
  solution export and the offer need your identity — the add-in is built and served at
  https://gankdat.com/addin (help page) and https://gankdat.com/addin/manifest.xml; only the publisher account and the
  submission need your identity (CLAUDE.md: account creation is yours).

Everything you paste is prepared in `ventures/gankdat/docs/APPSOURCE-ADDIN.md` (listing copy, certification notes,
categories). Read `docs/exchange/spikes/appsource-excel-add-in-shelf.md` §1–2 if you want the sources for the rules below.

## Actions

### 1. Try the add-in once in Excel (5 min, before anything else)
- **What:** no sandbox can run Excel, so the manifest has never been loaded by Office. One sideload shows whether it
  installs; if Excel refuses the upload, send the error text as a Telegram note and stop — the next routine fixes it.
- **Where:** Excel for the web (office.com → Excel → blank workbook)
- **Steps:**
  1. Home → **Add-ins** → **More add-ins** → **My add-ins** → **Upload my add-in** → paste or upload
     https://gankdat.com/addin/manifest.xml (download it first if the dialog wants a file).
  2. A **UK registers** button appears on the Home tab; open it. Section 1: register `uk-tenders`, search `software`,
     **Preview 5 rows** — a small table should appear without a key.
  3. Paste a key from https://gankdat.com/account into section 2, then in a cell: `=GANKDAT.UKCOMPANY("00000006","status")`
     → `active`. If this works the add-in is ready to submit.
- **Give back:** a Telegram note `addin sideload ok` (or the error text).

### 2. Open a Partner Center **Company** developer account (25–30 min)
- **What:** Microsoft's rule: an independent developer "whose distribution of apps through the Store is in relation to
  their business, trade, or profession" selects **Company**, not Individual (and the choice cannot be changed later).
  No DUNS number is needed; without one the account goes through **manual review** against an official document.
- **Where:** https://storedeveloper.microsoft.com (the new flow — the older Partner Center entry points still show the
  legacy flow with a fee)
- **Steps:**
  1. Sign in with a **work account** on a domain you control — a gankdat.com mailbox (Microsoft asks for a work email on
     the organisation's domain for contact verification; a personal Outlook/Hotmail account will be asked for a domain
     proof later). If gankdat.com has no Microsoft Entra tenant, the sign-up creates one for free.
  2. Account type **Company**. Legal business name: your trading name as a sole trader (your own name is fine), your
     address, you as the primary contact.
  3. Business verification: choose **official business documents** and upload the HMRC document that names you as a
     sole trader — the Self Assessment registration / UTR letter or a filed SA return ("tax filings" is on Microsoft's
     list). Skip DUNS.
  4. Accept the Microsoft Publisher Agreement. Then Account settings → **Programs** → enrol in **Microsoft 365 and
     Copilot** (the Office Store program).
  5. Wait for the verification mail (hours to a few days). Nothing else until it arrives.
- **Give back:** a Telegram note `partner center verified` when the mail comes.

### 3. Create and submit the offer (10 min, after step 2)
- **Where:** https://partner.microsoft.com/dashboard → Marketplace offers → **+ New offer** → **Office add-in**
- **Steps:**
  1. Offer alias `gankdat-excel`. **Product setup**: upload the manifest from https://gankdat.com/addin/manifest.xml;
     tick **"My product requires purchase of a service or offers additional in-app purchases"** (the listing then says
     "Additional purchase may be required" — the honest label for keys sold on gankdat.com).
  2. **Properties**: categories *Productivity* and *Data & analytics*; industries *Financial services*, *Professional
     services*. **Marketplace listing**: paste the name, summary, description, keywords, privacy, terms, support and
     help URLs from `APPSOURCE-ADDIN.md` → *Listing copy*; upload a 300 × 300 logo (export `ventures/gankdat/public/icon-raccoon.svg`
     at 300 px) and 1–5 screenshots at 1366 × 768 from step 1.
  3. **Availability**: all markets. **Notes for certification**: paste the block from `APPSOURCE-ADDIN.md` and replace
     `<owner pastes a key…>` with a fresh key from https://gankdat.com/account (make it on a `tester@gankdat.com`
     account so the metrics skip it; revoke it after approval).
  4. **Review and publish** → **Submit**. Validation takes 3–5 working days; the result arrives by mail and the inbox
     triage knows the sender (`docs/ops/SELF-CAUSED.md`).
- **Give back:** a Telegram note `appsource submitted`; later the approval or the rejection text (a rejection becomes a
  queue item the next burn-down fixes and resubmits — resubmissions are free).

### 4. Second shelf on the same account: the Power Platform connector (~50 min, after step 2; added 2026-10-25)
- **What:** Microsoft certifies connectors for free and lists them as Premium in every Power Automate, Power Apps,
  Logic Apps and Copilot Studio tenant. The connector package (Swagger, connection parameter, icon, readme, intro) is
  rendered from the API's own schema and committed under `ventures/gankdat/connector/`; only a Power Platform
  environment can turn it into a connector, and only your Seller account can submit it.
- **Where:** make.powerautomate.com / make.powerapps.com (free developer environment), partner.microsoft.com, and a
  storage link for the package.
- **Steps:** follow `ventures/gankdat/docs/POWER-PLATFORM-CONNECTOR.md` → *Owner steps* 1–7 in order (environment,
  create the connector from the files with `paconn` or the OpenAPI import, ten test calls, solution + Solution
  checker, zip + validator + SAS link, the **Connectors & Agents in Microsoft Copilot Studio** offer, then the
  open-sourcing pull request when Microsoft asks). Every value to paste is in that file.
- **Cost:** £0 expected (the Azure Storage blob for the package link sits in the free tier; if anything is charged it
  is pennies — tell me and it goes in `docs/LEDGER.md`).
- **Give back:** a Telegram note `connector submitted` after the offer is published, and `connector live` when the
  offer shows *Live*; a failed certification report becomes a queue item the next routine fixes.

## What happens next
- The daily metrics row counts add-in calls by their Office user agent once the first key is used from Excel; the item's
  proof is ≥ 10 keys and ≥ 1 credit pack through the pane within 30 days of listing.
- Nothing recurs: no renewal, no fee, no store billing to reconcile.
- The connector: 24–48 h to the certification report, a preview-environment test you confirm with *Go live*, then 10–14
  days to every region. The day-30 reading (≥ 10 connections' first call) is filed when you note `connector live`.
