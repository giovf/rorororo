# Spike: Microsoft AppSource as a shelf for a paid Excel add-in from a UK sole trader

Queue item `new-ventures/spike-appsource-excel-add-in-shelf` (burn-down, 2026-10-24 20:24–20:36 UTC; seeded by the same
run's pre-research pass). Sources: three fetch-relay rounds this run (`docs/relay/responses/appsource-2026-10-24`, `-r-`,
`-b-`, pruned after 7 days): Partner Center "Steps to open a developer account" (account types, fees, verification),
"Open an Office account in Partner Center" (2025-09-25), "Submit your solutions to Microsoft Marketplace via Partner
Center" (2025-09-25), the add-in submission guide, "Monetize your app through Microsoft Marketplace", the Office Store
submission FAQ (2026-10-01), the commercial marketplace certification policies (§100, §1120), and the AppSource Excel shelf
read first-hand — the raw listing pages embed `window.__INITIAL_STATE__` with every tile's publisher, average rating,
rating count and `additionalPurchasesRequired` flag (no Playwright needed; the four rendered pages of round `-r-` carried
the same tiles and nothing more, and `filters=free-trial` returned 0 results because the trial filter applies to SaaS offers
only). learn.microsoft.com and appsource.microsoft.com do not resolve from the sandbox; both hosts were added to
`docs/relay/hosts.txt` by the pre-research commit.

The questions the pre-research left open: which Partner Center account a UK sole trader needs and what its verification
asks for; what AppSource's rules say about an add-in whose paid part is a licence or API key sold outside the store; and
whether small-vendor paid Excel add-ins show buyers (ratings, counts) on the shelf.

## 1. The account route for a UK sole trader (Microsoft's own pages)

| Source | What it says |
| --- | --- |
| Partner Center, "Steps to open a developer account" | Two account types, Individual and Company. "With the new onboarding experience, there are no registration fees for either account type" (the FAQ repeats: "Do I need to pay the registration fee? No — if you're using the new flow via the Store marketing page", `storedeveloper.microsoft.com`; other entry points "will show the legacy flow", which is where the US$19 of the older page lives). "Changing a developer account from Individual to Company is not supported." |
| same page, who selects which | Individual: "Independent developers whose distribution of apps through the Store is **not** in relation to their business, trade, or profession", hobbyists, students. Company: "Independent developers and freelancers whose distribution of apps through the Store **is** in relation to their business, trade, or profession", plus corporations, LLCs, partnerships. A sole trader selling an add-in is the second line: a **Company account**. |
| same page, company verification | "For business verification (choose one): Option 1: DUNS number (recommended) … Option 2: Official business documents … Articles or certificate of incorporation, partnership deed, or equivalent formation document; Government-issued business registration or license; Official company registry record from a government website; Tax filings or stock exchange filings. If you don't use a DUNS number, your account will go through manual review, which can take longer." Then "contact and employment verification: a work email address associated with your organization's domain"; a mismatched domain needs "an official domain ownership record" or purchase invoice. Individual accounts verify with "a government-issued ID and selfie" on a phone. |
| "Open an Office account in Partner Center" (Office-specific, 2025-09-25) | "You sign up for a developer account using your Microsoft Entra ID work account." Before you begin: "Authority to sign legal agreements on your company's behalf. Your company's legal business name, address, and primary contact (this can be you). We verify this information during the account creation process." The account is enrolled in the Microsoft AI Cloud Partner Program and the "Microsoft 365 and Copilot" program; the Microsoft Publisher Agreement is accepted "on your company's behalf". |

Reading for this operation: a UK sole trader has no incorporation certificate or registry record; the documents that fit
Option 2 are HMRC's Self Assessment registration (UTR letter) or a tax filing — "tax filings" is on Microsoft's list, so the
route exists but goes through **manual review** under the owner's name with a tax document, and the account must be a
work (Entra ID) account on a domain the owner controls (gankdat.com's Workspace / Entra tenant, or a new free Entra tenant on
that domain). That is one owner sitting of perhaps 30–45 minutes plus a manual review of unknown length, at £0. It puts the
owner's identity, legal name and a tax document on a Microsoft account — the same class of step as the Etsy Persona check
(action 029), to be batched, never raised by a routine on its own.

## 2. The shelf's rules for an add-in whose paid part is sold outside the store

- **The store lists add-ins free.** Office Store submission FAQ: "Can I submit a paid app to Microsoft Marketplace? All apps
  submitted to Microsoft Marketplace via Partner Center are free. You can monetize your app through Microsoft Marketplace".
  "Monetize your app through Microsoft Marketplace" describes the one store-billed route — a **transactable SaaS offer**
  linked to the add-in, with Microsoft License Management or the publisher's own licensing database and the SaaS fulfilment
  APIs — and adds: "Transactable SaaS apps are only purchasable using a work or school account … you should consider
  implementing your own billing model" for Microsoft-account users, and "You're also free to monetize using your own
  payment model." The SaaS route needs an Azure app registration, webhooks and the fulfilment APIs (days, not hours) and a
  Marketplace account "associated with a company"; the own-billing route is what the small vendors on the shelf use (§3).
- **Own-billing add-ins are allowed and labelled.** Submission page: "If your free app or add-in contains an in-app purchase,
  the listing for your add-in in Microsoft Marketplace reflects this by stating 'Additional purchase might be required' under
  the pricing options." Policy §1120.1 (quoted on the policies page): add-in "features or content that require an extra
  charge, whether through in-app or add-in purchases or through other means" must tick "My product requires purchase of a
  service or offers additional in-app purchases" on the Product Setup tab. The shelf's own tile data carries this as
  `additionalPurchasesRequired: true` and the listing shows "Additional purchase may be required" (the page's string table).
  No commission is taken on money that never passes through the store.
- **Mobile is the one hard limit (§1120.2):** an add-in also offered on iOS or Android "must not include any in-app
  purchases, trial offers, UI that aims to up-sell to paid versions, or links to any online stores"; the fix is to not declare
  mobile support (Excel custom functions are desktop and web anyway).
- **Excel custom functions (§1120.5):** `helpUrl` set in the functions metadata; "custom functions HTML, JavaScript, and
  JSON metadata files must be hosted on the same domain"; the add-in "must support add-in commands" (a ribbon button, so the
  functions are discoverable); certification test notes for at least one function; the XLL-compatible-mode manifest markup
  after approval. All of it fits a Cloudflare-hosted static add-in on gankdat.com.
- **General (§100, §1120.1, §1120.3, the FAQ's 1100.5 column):** latest hosted Office.js, latest manifest schema, a support
  URL and a high-resolution icon, a privacy policy separate from the terms, an https EULA link, descriptions per language,
  Office on the web and Mac supported, touch-only devices, Edge/Chrome/Firefox/Safari; sign-in flows must show the value
  proposition before the user signs up; the value proposition must be "more than a simple utility or of limited scope".
  Validation "can take 3-5 working days, depending on the volume of submissions"; the validation team tests every platform
  the manifest claims. Microsoft 365 App Compliance (publisher attestation) is optional.

## 3. Demand: the Excel shelf read first-hand (2026-10-24)

Nine listing pages of the Excel shelf (`product=office;excel`, pages 1–4 and the searches `api`, `license`, `company data`),
**427 unique add-ins of the 1,937 listed**, each tile with its publisher, average rating, rating count and the
`additionalPurchasesRequired` flag that renders as "Additional purchase may be required". Ratings are the only buyer
signal AppSource shows (no installs, no sales); the product pages carry the same record plus the description.

| Reading | Number |
| --- | --- |
| Tiles flagged "additional purchase" (own billing outside the store) | **316 of 427 (74 %)**; free with no purchase 111 |
| Own-billing add-ins with ≥ 10 ratings / ≥ 50 ratings | **59 / 23** (55 of the 59 are small vendors, not OpenAI/SAP/Anthropic-class) |
| Own-billing add-ins with 0 ratings / median ratings | 157 of 316 / **1** (the free ones: 46 of 111 at zero, median 1) |
| Search results inside Excel's store | `api` 203, `license` 221, `company data` 173 |

Rivals of the promote shape — an API vendor's add-in whose paid part is a key bought on the vendor's site (all flagged
"additional purchase"): **Alpha Vantage Market Data 4.0 (12 ratings), Twelve Data 4.2 (10), Financial Modeling Prep 4.7 (10),
IEX Cloud Stock Data 3.5 (11), GenderAPI.io 4.9 (52), Wisesheets 4.5 (22), CData Connect Spreadsheets 4.8 (20), Supermetrics
4.5 (830), MarketXLS 4.5 (6), SheetsFinance 5.0 (6), XBRL Filed Data 5.0 (1), Grata for Excel 5.0 (1)**. Small-vendor
own-billing add-ins with the most ratings: GPT for MS Excel (Twistly) 4.5 (526), seoClarity 4.7 (216), GPT for Excel Word
(Talarian) 4.4 (150), CoreGPT 4.9 (115), Excel-to-Word Automation 4.4 (94), Log-hub Supply Chain 4.5 (49), Tiller Money Feeds
4.6 (41), XL-Connector 365 4.3 (28), ZIPPYDOC 5.0 (24). Product pages read: GPT for Excel Word (`pricingModel 0`, additional
purchase, "Excel AI agent"), Autopilot ("no subscriptions. Free to try", 2.2 (13)), Fuzzy Lookup (1.3 (12), "you need an
active subscription from the link on the Excel add-in side bar"), Mini Calendar by Vertex42 (`pricingModel 1`, free, 3.0
(134)) — `pricingModel` 0 is the own-billing tier, 1 the free one; `startingPrice` is empty for every add-in because the
store never prices them.

Reading: the shape works on this shelf and is the norm (three in four add-ins bill outside the store), but the long tail is
long — half the own-billing add-ins have never been rated, and the data-API vendors sit at 10–50 ratings after years, i.e.
tens to a few hundred engaged users each, not thousands. A `=UKCOMPANY()` / `=CQC()` / `=TENDERS()` add-in would land in
the `company data` search next to FactSet, Grata and XBRL US with the UK-register angle to itself; the buyers are the
analysts and bookkeepers who already type company numbers into Excel, and the add-in's job is to turn them into gankdat API
keys and credit packs (already sold), with nothing new to bill.

## 4. Gate check (ARCHITECTURE validation gate)

- **Buyers with money:** yes on the shelf (own-billing add-ins with 10–500 ratings, data-API vendors among them); the
  question is whether gankdat's registers are what Excel users search for — `company data` returns 173 results today,
  none UK-register specific.
- **Recurring job:** yes — a lookup in a spreadsheet is repeated every time the sheet is refreshed; credit packs fit.
- **Paid competitor with a gap:** Alpha Vantage, Twelve Data, FMP, Wisesheets sell financial data into Excel the same way;
  no UK Companies House / CQC / tenders add-in was found among the 427 tiles or the three searches.
- **≤ 1 week to build:** yes — about 2.5 days: an add-in-only manifest, Office.js custom functions calling the existing
  API with the user's key, a task pane for the key and the credit-pack link, static hosting on gankdat.com (same domain
  for HTML, JS and metadata per §1120.5.2), privacy, EULA and support pages (the landing site has them), test notes;
  then 3–5 working days of Microsoft validation.
- **No policy / ToS risk:** own billing is explicitly allowed and labelled; no mobile declaration; the add-in must show
  the value proposition before asking for a key (§1100.5) and must be "more than a simple utility" — the task pane
  should run a keyless preview (the API already has one) before the key step.
- **Owner cost:** £0 and one sitting — a Partner Center **Company** account (a UK sole trader is "a person acting in
  relation to their trade or profession"), verified by manual review against a tax document (UTR letter or SA return) and
  a work (Entra ID) account on the gankdat.com domain; then the Publisher Agreement signed in the owner's name. No DUNS
  needed. This is the one owner step and it is batched into the actions file of whichever build lands first, never
  raised by a routine alone.

## 5. Promote / park call

**Promote, reshaped as a gankdat distribution item, not a new venture.** Score: evidence 2 (the shelf read first-hand —
own billing is the norm, API-vendor rivals at 10–50 ratings, the rules and account route from Microsoft's pages; no
install or revenue number exists on the shelf) × reach 3 (Excel's in-app store, searched by the buyer; no marketing)
÷ (2.5 build days + 45 owner minutes ≈ 0.75) = **1.8** → `gankdat/appsource-excel-custom-functions-add-in` (weight 1),
which places it with the gankdat queue's other shelf listings (zoho-crm-uk-registers-widget 2.4) and behind every item
earning now. The build happens when it wins on score; the Partner Center company account is the owner step at that
point. Park triggers for a re-score: a first paying gankdat key (the add-in then multiplies a proven buyer path), or a
UK-register add-in appearing on the shelf (a rival proving the search). Not pursued: the transactable SaaS route (Azure
app registration, fulfilment APIs, work-account-only buyers) — days of plumbing for a store cut we do not need.
