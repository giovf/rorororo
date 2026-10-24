# gankdat for Excel — AppSource listing and certification notes

Built 2026-10-24 (burn-down, queue `gankdat/appsource-excel-custom-functions-add-in`, spike
`docs/exchange/spikes/appsource-excel-add-in-shelf.md`). The add-in is static files served by the Worker:

| File | Role |
| --- | --- |
| `public/addin/manifest.xml` | add-in-only XML manifest (TaskPaneApp + VersionOverrides 1.0: custom functions, ribbon button). Version = `APP_VERSION` + `.0`; the id GUID is fixed for the listing's life |
| `public/addin/functions.json` / `functions.js` / `functions.html` | custom functions metadata, runtime script and runtime page — namespace `GANKDAT`, six functions |
| `public/addin/taskpane.html` + `public/js/addin-taskpane.js` | task pane: keyless preview (MCP `tools/call`, 5 rows) first, then the API key form (`OfficeRuntime.storage`), links to /account for the free key, plans and credit packs |
| `public/addin/commands.html` + `public/js/addin-commands.js` | the ribbon FunctionFile (the only command is ShowTaskpane) |
| `public/addin/icon-{16,32,64,80,128}.png` | ribbon and listing icons (from `favicon.png`) |
| `public/addin.html` (`/addin`) | help page = `helpUrl` of every function and the manifest's Help.Url |
| `public/_headers` | per-page CSP for `/addin*`: Office.js from `appsforoffice.microsoft.com`, Office frame ancestors, X-Frame-Options detached |
| `test/addin.spec.ts` | pins the certification facts below |

Everything the add-in needs from the API already exists: `/v1/data/<slug>` with a bearer key (one credit per formula),
the keyless MCP preview, `/account` for keys, Stripe plans and PayPal credit packs. The store never bills: the listing
is free with "Additional purchase may be required" (certification policy 1120.1, Product Setup tab: *My product requires
purchase of a service or offers additional in-app purchases*).

## Owner steps (action 031)

1. **Partner Center Company account** (a sole trader distributes "in relation to their trade or profession" → Company,
   not Individual; an Individual account cannot be converted later). New flow at storedeveloper.microsoft.com, £0.
   Verification: no DUNS → manual review against an official document; for a sole trader the documents Microsoft's list
   covers are a tax filing or registration (UTR letter / Self Assessment return). Contact verification wants a work
   email on a domain the business controls (a gankdat.com mailbox; a Microsoft Entra work account on that domain is
   what the Office program enrolment uses — a free Entra tenant on gankdat.com if none exists).
2. Enrol the account in the **Microsoft 365 and Copilot** program (Partner Center → Account settings → Programs).
3. **Create the offer**: Partner Center → Marketplace offers → New offer → Office add-in. Upload `manifest.xml`
   from https://gankdat.com/addin/manifest.xml. Product setup: tick *requires purchase of a service / additional
   in-app purchases*. Properties: category *Productivity* and *Data & analytics* (as the shelf shows them), industries
   *Financial services*, *Professional services*. Listing copy below. Availability: all markets. No mobile.
4. **Test notes for the validation team** (Notes for certification box): see below.
5. Submit. Validation is 3–5 working days; results arrive by mail (row in `docs/ops/SELF-CAUSED.md`).

## Listing copy (paste)

- **Name** (≤ 50): `gankdat: UK registers in Excel`
- **Summary** (≤ 100): `Companies House, charities, CQC, sanctions and tenders as Excel formulas from official UK data.`
- **Description** (≤ 3,000):

  gankdat for Excel puts official UK and EU registers in a cell. Six custom functions call the gankdat API — Companies
  House company records (=GANKDAT.UKCOMPANY), the Charity Commission register (=GANKDAT.UKCHARITY), CQC regulated
  care locations (=GANKDAT.CQC), the UK sanctions list (=GANKDAT.SANCTIONS), Find a Tender procurement notices
  (=GANKDAT.TENDERS) and any of 17 registers with one filter (=GANKDAT.QUERY): schools in England, NHS organisations,
  food hygiene ratings, licensed visa sponsors, EU TED notices, US federal exclusions, new incorporations, corporate
  insolvency, contract awards, the UK trade marks journal and Gambling Commission licences. Results spill as a header
  row plus data rows, so a column of company numbers becomes a column of statuses, incorporation dates or SIC codes.

  Data comes from the publishers' own open feeds (Open Government Licence and equivalents), normalised to one clean
  schema and refreshed every morning; personal data is dropped at source. The task pane previews any register without
  an account. Formulas use your own gankdat API key: free for 250 calls a month, with paid plans and one-off credit
  packs on gankdat.com for more. The add-in is free; nothing is billed through the store.

  For analysts, bookkeepers, bid teams and compliance staff who already type company numbers into spreadsheets.
  Support: gankdat.com/feedback. Privacy: gankdat.com/privacy. Terms: gankdat.com/terms.

- **Search keywords**: `Companies House`, `UK company data`, `charity register`, `CQC`, `sanctions screening`
- **Privacy policy URL**: https://gankdat.com/privacy · **EULA / terms**: https://gankdat.com/terms ·
  **Support**: https://gankdat.com/feedback · **Help**: https://gankdat.com/addin
- **Icons**: 300 × 300 logo for the listing (resize `public/icon-raccoon.svg`; the manifest's PNGs are ribbon sizes)
- **Screenshots** (1366 × 768, ≤ 5): the pane's preview table; `=GANKDAT.UKCOMPANY("00000006")` spilled; `=GANKDAT.SANCTIONS`
  with "no match"; the key form with a saved-key confirmation. Taken by the owner in Excel after sideloading.

## Notes for certification (paste)

```
The add-in is free. Formulas need a gankdat API key (free tier, 250 calls/month) which the task pane stores in
OfficeRuntime.storage; paid plans and credit packs are sold on gankdat.com, not in the add-in.

Test key: <owner pastes a key from https://gankdat.com/account, account tester@gankdat.com>

1. Home tab > UK registers (ribbon button) opens the task pane. Section 1: pick "uk-tenders", type "software",
   click "Preview 5 rows" — a 5-row table appears with no key (keyless preview, 20/day per device).
2. Section 2: paste the test key, "Save key" — status reads "Saved."
3. In a cell: =GANKDAT.UKCOMPANY("00000006") — spills two rows (field names, values) for company 00000006.
   =GANKDAT.UKCOMPANY("00000006","status") — one cell: "active".
   =GANKDAT.SANCTIONS("zzzzqq") — "no match". =GANKDAT.TENDERS("software",3) — header + 3 rows.
   =GANKDAT.QUERY("uk-schools","postcode","OX1",5) — header + 5 rows.
4. Remove the key (Section 2 > Remove key), recalculate: formulas return #VALUE! with the message
   "gankdat: add your API key in the UK registers pane".

All files are hosted on https://gankdat.com/addin/ (same domain for HTML, JS and JSON metadata). Each custom function
has a helpUrl on https://gankdat.com/addin. No mobile form factor is declared. Supported: Excel on Windows, Mac and
the web (CustomFunctionsRuntime 1.1).
```

## Certification facts pinned by `test/addin.spec.ts`

- every manifest URL is `https://gankdat.com/…`; the five add-in files, the help page and the support URL are present
  (1120.5.2 same-domain hosting; 1120.3 support URL);
- `CustomFunctionsRuntime 1.1`, a `CustomFunctions` extension point, a `PrimaryCommandSurface` ribbon button (1120.5.4
  add-in commands), `DesktopFormFactor` only — no `MobileFormFactor` (1120.2);
- the six functions in `functions.json` are associated in `functions.js` under the same ids, each has a `helpUrl`
  anchor that exists on the help page (1120.5.1), optional parameters trail required ones;
- the formulas call only `/v1/data/` with the stored key (never the MCP preview budget); the pane shows the preview
  before the key step (1100.5: value before sign-up);
- the `/addin*` pages carry a CSP that allows Office.js and Office frame ancestors, and the sitemap lists `/addin`.

## What the runtime cannot test here

No sandbox runs Excel, so the manifest has not been loaded by Office. Before submission the owner sideloads it once
(Excel on the web → Add-ins → More add-ins → Upload my add-in → `manifest.xml`) and runs the certification notes
above; a manifest error shows as Excel refusing the upload with the element name. Two known risks, both fixable in
minutes: a `<Requirements>` block Office rejects for a custom-functions add-in on an older channel (drop it — the
VersionOverrides runtime declaration is what matters), and the frame-ancestors list missing a host Excel for the web
loads the pane from (the pane shows blank; add the host to `_headers`).

## Proof (queue item)

Listed under the gankdat publisher with "Additional purchase may be required"; within 30 days ≥ 10 distinct API keys make
their first call from the add-in and ≥ 1 credit pack is bought through its pane. Reading: the `rest_data` analytics point
carries the user agent — Excel's custom functions runtime sends an Office/Edge WebView UA — so the Daily numbers row can
count add-in calls once the first lands; a `datasets 30d external` entry from a new account with that UA is the first key.
