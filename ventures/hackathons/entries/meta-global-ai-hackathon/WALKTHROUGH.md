# Agent walkthrough — Muse Spark runs a counterparty check through gankdat (live)

Live transcript, recorded 2026-11-02 by the `demo video` workflow (run 41493781120) from the public page
https://apps.gankdat.com/diligence — muse-spark-1.3 on Meta Model API, gankdat's registers over MCP, no fixtures.
The page's own events, written by `scripts/demo-meta-global-ai-hackathon.ts`; the video of the same run is
https://apps.gankdat.com/demo/meta-diligence.mp4 (2 min 30 s). The dry-run version of this file (2026-10-26) is in git history.

Recorded from https://apps.gankdat.com/diligence by the demo video workflow on 2026-11-02 17:47 UTC.

## Registers read

- query_uk_companies "Tesco PLC" → 0 matches
- query_uk_sanctions "Tesco PLC" → 0 matches
- query_uk_insolvency "Tesco PLC" → 0 matches
- query_uk_sponsors "Tesco PLC" → 0 matches
- query_uk_charities "Tesco PLC" → 0 matches
- query_uk_contract_awards "Tesco PLC" → 0 matches
- query_uk_companies "Tesco" → 0 matches
- query_uk_company_profiles "{"company":"Tesco PLC"}" → 1 match
- query_uk_sanctions "Tesco" → 0 matches
- query_uk_insolvency "Tesco" → 0 matches
- query_uk_sponsors "Tesco" → 9 matches
- query_uk_charities "Tesco" → 6000 chars
- query_uk_contract_awards "Tesco" → 0 matches
- query_uk_contract_awards "{"supplier_company_number":"00445790"}" → 0 matches

Model calls 4/40, tokens 30722/300000, 23.5 s.

## Report

```markdown
# Due diligence: Tesco PLC

## Identity
- **Pinned company: TESCO PLC – Company No. 00445790** — pinned via `query_uk_company_profiles` (lookup by name `Tesco PLC` returned 1 record).
- **Status:** active; **Type:** plc; **Jurisdiction:** england-wales — per `query_uk_company_profiles`.
- **Incorporated:** 1947-11-27; **SIC:** 47110; **Registered office area:** Welwyn Garden City, AL7 1GA, United Kingdom — per `query_uk_company_profiles`.
- **Previous names:** TESCO STORES (HOLDINGS) PUBLIC LIMITED COMPANY (ceased 1983-08-25), TESCO STORES (HOLDINGS) LIMITED (ceased 1981-12-14) — per `query_uk_company_profiles`.
- **Filing health:** Accounts next due 2027-08-26 (not overdue), Confirmation next due 2027-07-02 (not overdue); 8,372 filings; latest filings include capital SH03/SH06 and confirmation CS01 — per `query_uk_company_profiles`.
- **Note on search:** `query_uk_companies` with `q` = “Tesco PLC” and `q` = “Tesco” both returned 0 rows; identity is established solely on the `query_uk_company_profiles` match above.

## Red flags
- **Sanctions:** No match — `query_uk_sanctions` with `q` = “Tesco PLC” returned 0 rows; repeat search with `q` = “Tesco” also returned 0 rows.
- **Insolvency:** No match — `query_uk_insolvency` with `q` = “Tesco PLC” returned 0 rows; repeat search with `q` = “Tesco” also returned 0 rows; `query_uk_company_profiles` flags `has_insolvency_history: false` and `has_been_liquidated: false`.
- **Charges (Companies House profile only):** 9 charges total (2 outstanding Account security agreements from 2009-11-04, 7 satisfied) — per `query_uk_company_profiles`; not classed as insolvency.
- **Sponsor licence:** No direct match for “Tesco PLC” — `query_uk_sponsors` with `q` = “Tesco PLC” returned 0 rows; broader `q` = “Tesco” returned 9 rows for *other* entities only (Tesco Stores Limited, Tesco Personal Finance plc, plus ATESCO/Notesco/Tescon/Vitesco matches), none naming TESCO PLC 00445790.
- **Charity link:** No direct match — `query_uk_charities` with `q` = “Tesco PLC” returned 0 rows; broader `q` = “Tesco” returned unrelated charities (top hit THE TESCO PRIZE with `company_number: null`), none linking company number 00445790.

## Public money
- **Contract awards:** No match — `query_uk_contract_awards` with `q` = “Tesco PLC” returned 0 rows; repeat with `q` = “Tesco” returned 0 rows; filter by `supplier_company_number` = “00445790” also returned 0 rows (last-two-weeks window).

## Verdict
**LOW risk — long-established active plc (1947) with current filings, no sanctions or insolvency matches, and no adverse public-money signals in the windows checked.**

## Sources
- `query_uk_companies` (q=Tesco PLC → 0 rows; q=Tesco → 0 rows)
- `query_uk_company_profiles` (company=Tesco PLC → TESCO PLC 00445790 active)
- `query_uk_sanctions` (q=Tesco PLC → 0 rows; q=Tesco → 0 rows)
- `query_uk_insolvency` (q=Tesco PLC → 0 rows; q=Tesco → 0 rows)
- `query_uk_sponsors` (q=Tesco PLC → 0 rows; q=Tesco → 9 rows for other entities only)
- `query_uk_charities` (q=Tesco PLC → 0 rows; q=Tesco → unrelated hits only, no 00445790 link)
- `query_uk_contract_awards` (q=Tesco PLC → 0 rows; q=Tesco → 0 rows; supplier_company_number=00445790 → 0 rows)
```
