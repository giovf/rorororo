# Spike: Companies House accounts (iXBRL) as headline financials on gankdat

Queue item `new-ventures/spike-uk-company-accounts-financials` (build, 2026-11-12 17:09–17:19 UTC; seeded by the
09:18 build's exchange pre-research of the same day). Sources: the two pre-research relay rounds of the morning
(`docs/relay/responses/pre-research-ch-accounts-2026-11-12`: the daily and monthly download pages, the GOV.UK
data-products guidance, a HEAD and a 4 KiB Range of the 11-11 ZIP, Apify Store searches, Endole's pricing page;
`…-b`: the DBT data dictionary and docs home, the Companies House FAQ, Company Check's reports page, two Apify
actor records, Global Mindset Marketing's docs, the public-task page), one new round
(`docs/relay/responses/ch-accounts-zip-2026-11-12`: HEADs of the 11-11 and 11-12 ZIPs, bytes 0–1,048,575 and the
last 65,536 bytes of the 11-11 ZIP — the first relay ZIP slice that reached the repo, see §5), the README, LICENSE
and parser source of `uktrade/stream-read-xbrl` read from raw.githubusercontent.com, and a read of
`ventures/gankdat/src/sources/zip.ts`, `store.ts` and `wrangler.jsonc` for the ingest budget. The ZIP slices were
walked with a 60-line Python script (central directory, local headers, raw-deflate inflate, a regex over
`ix:nonFraction` / `ix:nonNumeric` facts); every number below comes from that walk or the pages named.

The question: is `net assets £N, cash £M, K employees, accounts to <date>` worth ≤ 1.0 day as a `financials`
field of `uk-company-profiles`, a `/v1/data/uk-company-accounts` route and a ninth /diligence register — a join on
the company number gankdat's buyers already use — given that four sellers price the series, no shelf shows a buyer
for a standalone wrapper, and the source is 10,000–80,000 HTML files a day inside one ZIP?

## 1. The source (relay 11-12, both rounds)

| Fact | What the page or the bytes say | Consequence |
| --- | --- | --- |
| Licence | GOV.UK guidance (`/guidance/companies-house-data-products`): "We impose no rules or requirements on how the information on the public register is used, and we're not responsible for your use of the company data"; footer "All content is available under the Open Government Licence v3.0, except where otherwise stated. © Crown copyright". The download pages carry no licence of their own (footer: Last Updated, an enquiries address, a phone number); the FAQ calls the product the "Free Accounts Data Product". No member of the 87 inflated carries a licence statement; `NameAuthor` and `DescriptionOrTitleAuthor` are nulled by Companies House before publication (FAQ). | OGL v3 with attribution, as the company lookup already states. Passes. |
| What is in it | "the individual data files (instance documents) of company accounts filed electronically … about 60% of the 2.2 million accounts filed at Companies House each year" (GOV.UK; the seed's 75 % was wrong). "Approximately 97% … iXBRL (HTML file). The remaining 3% … XBRL format (XML file)" (FAQ); member types `.html`, `.xml`, `.zip` (nested iXBRL). "over 90% of the data submitted was indeed tagged appropriately" (FAQ). | ≈ 1.3 million filings a year; HTML parsing covers 97 %, the XML 3 % is the same tag names in the older XBRL form. |
| Cadence | "A new daily file is added each morning over a 5-day period (Tuesday to Saturday). Each file contains the accounts data registered on the previous day." Monthly "within 5 days of the end of the previous month". The 11-12 ZIP was last-modified 07:45 UTC, the 11-11 one 13:55 UTC. | A wave after 08:00 UTC reads yesterday's filings; a late file (the 11-11 one landed 13:55) is picked up the next day, so the walker keys on the file name, not the day. |
| Daily sizes | Listing of 2026-10-01 → 11-12: **597.6 MiB** (10-01), then 60–97 MiB to 10-24, 135 / 115 / 124 / 154 / **208 MiB** (10-27 → 10-31), 159 MiB (11-03), 58–92 MiB since. The FAQ's "average compressed file size of around 30Mb" is years old. | The seed's "58–208 MiB" missed the 10-01 file: the end of September (nine months after a 31 December year end) is a 600 MiB day, roughly 80,000 filings. |
| Member count | EOCD of the 11-11 ZIP: **10,691 entries**, central directory 1,122,603 bytes (105 bytes an entry) at offset 81,339,990, no ZIP64 record. 82,462,615 bytes ÷ 10,691 = **7,713 bytes a member compressed**. | By that ratio: 58.7 MiB → ≈ 8,000 members, 208 MiB → ≈ 28,000, 597.6 MiB → ≈ 81,000. |
| Member layout | Every entry is method 8 (deflate) and flag 0 — the local header carries the compressed size, **no data descriptors** (the charity extract needs the descriptor scan; this does not). Tail sample of 623 central-directory entries: 621 `.html`, 2 `.zip` (stored, method 0 — the nested-iXBRL case), 0 `.xml`; mean 7,752 compressed / 68,206 uncompressed (8.8×, max 971,524). Head: 88 complete members in the first 1 MiB; the 87 HTML ones inflate to 9,881,753 bytes (mean 113,583, max 1,636,955 for a full FRS 102 set). | A walker reads `PK\x03\x04`, name, sizes, skips `csize` bytes to the next header: resumable at any header offset. One day inflates to ≈ 0.7–1.2 GB of HTML. |
| Names | `Prod223_4348_<company number>_<balance-sheet date YYYYMMDD>.html` — first ten: 00029224_20260331, 00056710_20260430, 00073151_20260331, 00090288_20260331, 00109030_20251231, 00130275_20251228, 00147111_20260331, 00152174_20251231, 00184013_20260430, 00188425_20260531; members are ordered by company number (the tail runs OC310831 → SC868116, SC868213, SC873178). `Prod223_4348` is the production run, constant across the file. | `idOf(company_number + balance_sheet_date)` is readable from the name before inflating; the register's key costs nothing. |
| Range | `Range: bytes=0-1048575` and `bytes=82397079-82462614` answered 206 with exact `content-length`; the ETag is an S3 multipart tag (`…-10`). | Chunked, resumable reads on any boundary; a Worker reads 8–16 MiB slices and carries the byte offset in KV between waves. |
| Monthly archives | 13 files listed, Oct 2025 → Oct 2026: 2.2, 2.1, **4.1** (Dec), 2.0, 1.8, 2.5, 1.8, 1.8, 2.2, 2.1, 1.8, 3.1 (Sep), 2.0 GiB. The FAQ: "monthly file will average around 500Mb" — also old. | A 12-month backfill is ≈ 27 GiB ≈ 3.7 million members; the December file exceeds 4 GiB so its directory is ZIP64. Not wave work (§3). |
| The parser already written | `uktrade/stream-read-xbrl` (Department for Business and Trade; **MIT** licence, © 2023 Department for International Trade): 38 columns, "approximately 10 seconds to convert a single day" on an 8-core laptop. Its rules: a fact is an `ix:nonFraction` whose `name` attribute ends in the tag; value = `sign` × text × 10^`scale`, with `format` deciding the thousands separator (`numdotcomma`, `numspacedot`); employees are read as absolute values ("some cases where employee numbers have a negative sign attached"); the period comes from the fact's `contextRef` → `xbrli:context` instant or start/end dates; net assets = `NetAssetsLiabilitiesIncludingPensionAssetLiability` or `NetAssetsLiabilities` (data dictionary). | The tag-to-column rules are a public, permissively licensed reference; the Worker reimplements the dozen tags it needs in a regex pass, not a DOM parse. |

## 2. Tag coverage in the 11-11 ZIP (ten named members, then all 87 in the head)

Counts are facts found per member; a member "carries" a family when at least one of its tags is present.

| Member | net assets | cash | creditors | employees | turnover | profit | equity | b/s date | dormant | taxonomy |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 00029224_20260331 | 2 | 0 | 0 | 0 | 0 | 0 | 2 | 1 | 1 | FRS-102 2023 |
| 00056710_20260430 | 2 | 2 | 8 | 2 | 0 | 0 | 10 | 1 | 1 | FRS-102 2025 |
| 00073151_20260331 | 2 | 6 | 8 | 4 | 2 | 8 | 34 | 1 | 1 | FRS-102 2025 |
| 00090288_20260331 | **0** | 0 | 0 | 2 | 0 | 0 | 0 | 1 | 1 | char 2026 (charity) |
| 00109030_20251231 | 2 | 0 | 4 | 2 | 0 | 0 | 2 | 1 | 1 | FRS-102 2023 |
| 00130275_20251228 | 2 | 0 | 4 | 2 | 0 | 0 | 2 | 1 | 1 | FRS-102 2023 |
| 00147111_20260331 | 2 | 2 | 6 | 2 | 0 | 4 | 26 | 1 | 1 | FRS-102 2026 |
| 00152174_20251231 | 2 | 0 | 2 | 2 | 0 | 0 | 2 | 1 | 1 | FRS-102 2023 |
| 00184013_20260430 | **0** | 2 | 4 | 2 | 0 | 0 | 10 | 1 | 1 | FRS-102 2025 |
| 00188425_20260531 | 2 | 2 | 4 | 2 | 0 | 0 | 12 | 1 | 1 | FRS-102 2025 |
| **first ten carrying** | **8 of 10** | 5 | 8 | 9 | 1 | 2 | 9 | 10 | 10 | |
| **all 87 carrying** | **63 (72 %)** | 50 (57 %) | 71 (82 %) | 83 (95 %) | 2 (2 %) | 6 (7 %) | 85 (98 %) | 87 | 87 | 86 FRS-102, 1 char |

Tags counted: net assets `NetAssetsLiabilities` / `…IncludingPensionAssetLiability`; cash `CashBankInHand` /
`CashBankOnHand`; creditors `Creditors` / `CreditorsDueWithinOneYear` (the within-one-year split is in the
`contextRef`, e.g. `B_F_G`, `CreditorsHypercube_cfwd_30_04_2026_Set1` — the parser's rule); employees
`AverageNumberEmployeesDuringPeriod` / `EmployeesTotal`; turnover `TurnoverGrossOperatingRevenue` / `TurnoverRevenue`;
profit `ProfitLossForPeriod` / `ProfitLoss`; `Equity`; `BalanceSheetDate`; `EntityDormantTruefalse`;
`UKCompaniesHouseRegisteredNumber` (87 of 87). Every member tags two periods (current and prior: `icur4`/`iprev9`,
`I0`/`I5`, `B`/`E`, `cfwd_30_04_2026`/`cfwd_30_04_2025`), so the trend comes free. Attributes over the 1,634 facts:
`scale` absent on 922, `0` on 673, `-2` on 39 (two filers); `sign="-"` on 37 — a negative value is carried by the
attribute, never by a minus in the text, which the regex must honour; formats `ixt2:numdotdecimal` and
`ixt:numcommadot`.

What the sample says: the ten-member bar of the park rule is met exactly (8 of 10 carry a net-assets tag the
dictionary resolves), but across 87 the dictionary's own rule resolves 72 %. The 24 misses are 23 micro-entity
FRS 102 balance sheets that tag the total as `Equity` only (by the balance-sheet identity net assets = total equity,
and 85 of 87 carry `Equity`) plus the one charity-taxonomy filing. With `Equity` as the fallback the field resolves
on **85 of 87 (98 %)**; the spike reports both numbers and the build uses the fallback, labelled
`net_assets_source: NetAssetsLiabilities | Equity`. Turnover and profit are in 2–7 % of filings — small companies
file balance-sheet-only ("filleted") accounts — so the field must promise net assets, cash, creditors, employees,
the dormant flag and the balance-sheet date, and carry turnover and profit as nullable extras, never headline them.

## 3. Ingest budget: one daily wave, resumable, and a runner backfill

| Question | Reading | Answer |
| --- | --- | --- |
| Can a Worker read the ZIP member by member? | Flags are 0 (sizes in the local header), Range is honoured on any byte, names carry the key. `sources/zip.ts` today forwards only the first entry and drops the rest; the extension is a walker that, from a byte offset, reads the 30-byte header + name, pipes exactly `csize` bytes through `DecompressionStream('deflate-raw')`, scans the HTML, and moves on. | Yes; the walker is ≈ 0.25 day and is the build's only new mechanism. |
| Does a normal day fit one wave? | 10,691 members → ≈ 0.7–1.2 GB inflated (tail mean 68 KB, head mean 114 KB). The cron path has `limits.cpu_ms: 300000` (5 min CPU) and 15 min wall. The charity wave inflates a 44 MB ZIP to 160 MB inside its slot (`uk-charities`); this is 5–8× that volume but regex-only (a dozen tag names, one `xbrli:context` lookup each). Budgeting 60–100 MB/s for inflate plus scan gives 10–25 s CPU and 82 MB of egress. | A 58–100 MiB day fits one wave with room. |
| Month-end and the 600 MiB day? | 208 MiB ≈ 28,000 members ≈ 2–3 GB inflated; 597.6 MiB ≈ 81,000 members ≈ 6–9 GB. | Over a wave's budget: the walker stops at a budget (bytes or elapsed) and writes `{ file, offset }` to KV; the next day's wave finishes the old file before opening the new one. Files stay on the host 60 days, so a 600 MiB day clears over ≈ 8 waves while the register keeps serving the latest filing per company. This is the "resumable by byte offset" the seed asked for, and it is the risk the proof must show (§4). |
| Register size | ≈ 1.3 M filings a year, one row per `(company number, balance-sheet date)`, ≈ 40 columns of numbers. | D1 by `idOf(company_number + balance_sheet_date)`, written in `d1Pace` batches as the other registers; ≈ 10,000 upserts a normal day, 80,000 on the peak day spread over its waves. |
| Backfill | 12 monthly archives ≈ 27 GiB ≈ 3.7 M members; the December file is ZIP64. At one wave a day the Worker would need a year. | A second, dated item: a runner-fed load (`run-script.yml` dispatch, the pattern `isRunnerFed` already serves) that streams each monthly archive on a GitHub runner and posts rows to D1 in batches — twelve dispatches, 0.5 day, after the daily source has run a week. |
| Blind Mode | The tags kept are organisation-level money and counts; the narrative, director names and signatory names are never extracted (`NameAuthor` is already nulled upstream). | Same stance as the company lookup. |

## 4. Who sells the series (relay 11-12 and the seed's searches)

| Seller | Product | Price (relay text) | Note |
| --- | --- | --- | --- |
| **Endole** | unlimited company credit reports with financial trends, monitoring, KYB checks and API access (`/pricing`) | £39 a user a month, £25 billed yearly | "Per User Exports – 1,000 rows/month" |
| **Company Check** | unlimited company credit reports (`/company-credit-reports`) | Business Monthly £35+VAT a month; reports "starting from £30" (page meta) | the seed quoted £20+VAT single / £350+VAT yearly from the same page's other tiers |
| **Creditsafe** | company credit report | no published price (`/gb/en/pricing.html` is 404); the seed's WebSearch readings: ≈ £24.99 one-off on a comparison site, £0.20 a report on its G-Cloud rate card | |
| **Global Mindset Marketing** | REST + MCP over this bulk product: filters `negative_net_assets`, `min_employees`, `sort_by=cash`, triggers `cash_rich` / `distressed`, alerts on "negative net assets, and drops of 30%+ in net assets or cash between the last two iXBRL accounts" | Free: 50 requests a month, watchlist of 5; Pro £39 a month for 5,000 (seed) | the closest rival to the proposed field and register |
| Apify Store | 466 hits for "companies house accounts", 410 for "ixbrl"; the accounts-specific actors sit at 0–2 users in 30 days (rein8 2 users / 58 runs, ukdatakit 1 / 5) while register scrapers hold 55, 22, 11 users (seed) | free–paid | no shelf demand for a standalone wrapper |
| npm / GitHub | no package parses the bulk product; 6 repositories for the phrase at 0 stars; `@registrum/mcp` and `uk-business-intelligence-mcp` bundle financials inside KYB servers (seed) | — | the product is the join, not the parser |

## 5. A relay fix made on the way

The morning round's 4 KiB Range of the ZIP was fetched and saved as `5.zip` but never committed: `.gitignore`
ignores `*.zip` repo-wide, so the relay's binary slices (≤ 2 MB by its own cap) silently vanished at the Commit step.
This run's relay commit (`relay: ch-accounts-zip-2026-11-12`, 17:12) adds `!docs/relay/responses/**/*.zip` under the
rule, which is why the two slices above exist. Noted in the run log; no queue item needed.

## 6. Call

**Promote — as the narrow shape, with the coverage number and the peak-day risk written into the item.** None of the
park conditions holds: the ten sampled members meet the net-assets bar exactly (8 of 10) and the Equity fallback
takes the 87-member sample to 98 %; the ZIP can be read member by member on any byte boundary with no data
descriptors and resumed by offset, so a 200 MiB or 600 MiB day is a backlog, not a wall; OGL v3 and "no rules or
requirements on how the information … is used" cover every page and no member carries another licence; and the
field reaches buyers through calls that exist — the company lookup, the trademark journal's applicant checks and the
/diligence agent (whose "negative net assets, cash down 30 %, overdue accounts" is exactly what Global Mindset sells
as alerts). The shelf numbers (0–2 users on every accounts actor) are the warning the item carries: this is 1.0 day of
idle-slot work that makes every company read answer `net assets £N, cash £M, K employees, accounts to <date>`, not a
new income line.

Added to `docs/pipeline/queues/gankdat.json`:

- `uk-company-accounts` (score 3, 1.0 day): the per-member ZIP walker in `sources/zip.ts`, the daily wave with the
  `{ file, offset }` resume marker, the D1 register by `idOf(company_number + balance_sheet_date)`, the
  `financials` field on `uk-company-profiles` (latest filing: balance-sheet date, dormant, net assets with its
  source tag, cash, creditors within a year, employees, turnover and profit when filed, the prior period for the
  trend), `/v1/data/uk-company-accounts` by company number with `filed_since`, the ninth /diligence register,
  Blind Mode, the x402 and MCP lanes, an Apify actor. Proof: a live `uk-company-profiles` read for a company in the
  11-11 ZIP carries `financials`; the refresh_log shows the 11-1x file finished in one wave and a month-end file
  resumed across two; the day-30 read checks the field on ≥ 1 paid or keyed call.
- `uk-company-accounts-backfill` (score 2, 0.5 day, not before 2026-11-26): the runner-fed load of the 12 monthly
  archives, ZIP64-aware, twelve dispatches of `run-script.yml`.

Park trigger if the build slips: not a price change — the number that would park it is a walker that cannot finish
a 58 MiB file inside one wave (≈ 8,000 members), which the charity wave's 160 MB inflate says will not happen; the
month-end resume is the proof, not the gate.
