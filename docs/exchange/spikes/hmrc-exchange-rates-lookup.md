# Spike: HMRC monthly customs exchange rates as a gankdat lookup

Queue item `new-ventures/spike-hmrc-exchange-rates-lookup` (burn-down, 2026-11-10 20:11–20:45 UTC). Sources: two
fetch-relay rounds this run — `docs/relay/responses/hmrc-rates-spike-2026-11-10` (25 lines: the trade-tariff index and
two monthly pages, the v2 period-list API, HEAD and a 4 KB range of the November XML, HEAD of the October XML and the
November CSV, the monthly page rendered raw, the GOV.UK collection page, the API reference, Open Exchange Rates' plans,
exchangeratesapi.io, Fixer, currencylayer, ExchangeRate-API's plans and open-access page, Frankfurter's docs and two
GBP-base calls) and `…-b` (AllRatesToday's pricing, HMRC page, keyless open endpoint, docs and terms) — plus direct
reads of the GitHub search API, the npm registry and PyPI from the sandbox. The question: is a GBP-base table of the
rates HMRC prescribes for customs and VAT conversions a dataset gankdat can sell per call, or does someone already give
it away?

## 1. The source (relay 11-10)

| Fact | What the page says | Consequence |
| --- | --- | --- |
| Licence | Footer of `/exchange_rates` and of every monthly page: "All content is available under the **Open Government Licence v3.0**, except where otherwise stated. © Crown copyright". No other licence statement on the index, the monthly page or in the XML. | re-use, including resale, is allowed with attribution — the one promote-side fact |
| Publication | "Exchange rates are published by HMRC on the penultimate Thursday of every month (as per section 18 of Notices made under the Taxation (Cross-border Trade) Act 2018). These exchange rates apply to the following calendar month, and represent rates as of midday the day before publication." November 2026 was published 21 October 2026. | one ingest a month, ~10 days ahead of the month it serves; a `latest` call is cheap |
| Files | Each month lists `View online`, `CSV 8.4 KB` and `XML 35.0 KB`: `/exchange_rates/view/files/monthly_csv_2026-11.csv` and `monthly_xml_2026-11.xml`; the API path `/api/v2/exchange_rates/files/monthly_xml_2026-11.xml` answers HEAD 200 `application/xml` 35,851 bytes and serves a byte range; `monthly_csv_2026-11.csv` HEAD 200 `text/csv` 8,584 bytes. Months are not zero-padded (`monthly_xml_2026-9.xml`). | the file names are predictable after all (the seed's "unpredictable descriptor" is a 2024 client's note, not today's service) |
| Period API | `/api/v2/exchange_rates/period_lists?filter[type]=monthly` (200, 10 KB JSON:API) lists each period with its two files and `publication_date` (Nov 2026: 2026-10-21, Oct: 09-16, Sep: 08-19, …); without the filter it answers 422; `/periods/<id>` and `/period/<id>` answer 404. Years on the service: 2021–2026. | an ingest cron reads one JSON list, downloads one XML; history on this service starts 2021 (older years live only in GOV.UK archives) |
| XML shape | `<exchangeRateMonthList Period="01/Nov/2026 to 30/Nov/2026">` → `<exchangeRate>` with `countryName`, `countryCode`, `currencyName`, `currencyCode`, `rateNew` (currency units per £1, 4 decimals) | a 20-line parser |
| Size | the November 2026 table has **163 country/territory rows** (Abu Dhabi … Zimbabwe), ≈ 141 distinct currency codes (territories share XCD, EUR, XPF, XAF, XOF, USD) | ~160 rows a month, ~12 k rows since 2021: a tiny D1 table |

## 2. Who sells rates, and at what price (relay 11-10)

| Rival | Free tier | Cheapest paid | GBP base free? | Sells the HMRC series? |
| --- | --- | --- | --- | --- |
| **AllRatesToday** (allratestoday.com; HMRC page published 2026-07-28) | €0: 10 requests/min, "latest" tables of 123 central banks + 6 tax authorities **including HMRC**; a keyless open endpoint `/api/open/central-bank/hmrc?source=GBP&target=USD` answered `{"rate":1.3396,"rate_date":"2026-11-01","rate_type":"monthly","derived":false}` with an attribution field; "Latest table on every plan including free" | Small **€4.99/mo** 5,000 requests + history; Medium €9.99 10,000; Large €49.99 100,000; Business €239/mo (€199 annual) 1M requests, "129 institutions", ERP help. Terms: the free tier and keyless endpoints in a commercial product need a paid plan; "Resell or redistribute API data without permission" is prohibited | yes | **yes — the whole thing**: 141 currencies, history from 2021-01-01, JSON/CSV/Excel, an MCP server (`@allratestoday/central-bank-mcp`), npm `hmrc-exchange-rate` (26 versions since 2026-08-08, zero dependencies), Google Sheets formulas, a Dynamics 365 Business Central extension, Hugging Face and Kaggle mirrors |
| Open Exchange Rates | 1,000 requests/mo, hourly, **USD base only** | Developer **US$12/mo** 10,000 requests, "all base currencies"; Enterprise $47; Unlimited $97 | paid | no (market rates) |
| exchangeratesapi.io (APILayer) | 100 requests/mo, daily | Basic **US$14.99/mo** 10,000 requests, base switching | paid | no |
| Fixer (APILayer) | 100 calls/mo | Basic US$14.99 10,000 calls, all base currencies | paid | no (ECB-tracked) |
| currencylayer (APILayer) | 100 calls/mo | US$14.99 10,000 requests | paid | no |
| ExchangeRate-API | open access, **no key**, daily, attribution required, no redistribution; a free keyed plan | Pro **US$10/mo** 30,000 requests hourly | yes (any base on open access) | no |
| **Frankfurter** | free, open source, **no key**, 219 currencies "from 111 central banks and official sources", any base, history "back to 1948", an MCP page, self-hostable | none | yes — `v1/latest?base=GBP` answered 29 ECB quotes for 2026-11-10 and `v1/2026-10-01?base=GBP` the same set | not the HMRC table as such (the GBP-base call is the ECB set); the provider list was not read |

So the paid market is real (US$10–15/mo entry tiers at five vendors, €4.99 at the sixth), but two vendors give a GBP
base away keyless, and one of them sells exactly the HMRC series with the latest table free. The seed's "no
HMRC-specific paid rival found" was wrong: AllRatesToday launched its HMRC page in July 2026 and its npm client in
August; an npm search for the series' name finds it in one read.

## 3. Who wraps the files (direct reads 11-10)

| Registry | Count | Charging |
| --- | --- | --- |
| GitHub, `hmrc "exchange rates"` in name/description/readme | 211 results; **15 repositories wrap the HMRC monthly files**: matchilling/hmrc-exchange-rates (15 stars, a Shell/API mirror), alexanderGugel/hmrc-exchange-rates (Go, 4), AllRates-Today/hmrc-exchange-rate, alicnik, chrisdbuck (notebook scraper), lukapeharda (PHP), Dev-ND9, pakscode, philayres, reisroni, sodastsai (Swift and Python), gillesruppert/hmrccc (2014), simshard/xcRates, and HMRC's own `hmrc/currency-conversion` Scala service; the rest are CGT and crypto-tax calculators that read the rates | 1 (AllRatesToday) |
| npm, `hmrc exchange rates` | 2 packages: `hmrc-exchange-rate` and `@allratestoday/hmrc-exchange-rate` — both AllRatesToday's | the same 1 |
| PyPI | 0 (`hmrc-exchange-rates`, `hmrcfx`, `hmrc-fx` all 404; `allratestoday` is the rival's general client) | — |

Developer interest exists (15 wrappers in six languages, one maintained as a public API with 15 stars), but it is
hobby-sized, and the one commercial wrapper is the rival in §2.

## 4. The gankdat shape, counted (not built)

`/v1/data/hmrc-exchange-rates`: filters `currency` (ISO code), `month` (`YYYY-MM`), `country`; `latest=true` returns the
month in force; rows `{ month, currency, currency_name, country, country_code, units_per_gbp, published, applies_from,
applies_to }`; D1 by `idOf(month, currency)`; one cron wave on the 25th and the 1st reading the period list and the
newest XML (~160 rows, seconds); backfill 2021-01 → today from 71 XML files at ingest; Blind Mode trivial (no people);
the key, x402 (`$0.01`) and MCP lanes as every register; landing card, terms row, sitemap, `server.json` bump and an
Apify actor. **0.4 day**, no owner minutes, no new account.

## 5. Call

**Park.** Three of the item's four park conditions hold and only the licence is on the promote side:

- a rival sells the HMRC series — AllRatesToday, since July 2026, with the **latest table free and keyless** and history
  from €4.99/mo, plus an MCP server and an npm client, i.e. every lane gankdat would open;
- general rate APIs below US$20/mo with the GBP base free exist — Frankfurter (free, keyless, any base, open source),
  ExchangeRate-API's open access (keyless, any base), Open Exchange Rates at US$12 with all bases;
- the registers' buyers show no reason to want a rate table from the same key: no inbox, metrics or owner-note signal
  mentions currency conversion, and the compliance/KYB use (status, insolvency, sanctions, sponsor licence) has no GBP
  conversion step.

A gankdat copy would be the eighth source of the same 160 numbers, priced above two free ones, with the only
differentiator (the same key as the registers) unasked for. Scored honestly it is 1 × 2 ÷ 0.4 = 5 before the
rival discount and ≈ 1 after it — below every open item.

**Trigger to revisit:** a paying gankdat key asks for GBP conversion alongside a register read (an inbox or
support signal naming currency or customs), or a gankdat trade/customs dataset lands that needs the monthly rate in its
own rows, or AllRatesToday's free HMRC tier closes (its terms already bar commercial use of the free key, so the trigger
is the keyless endpoint going paid) — then the §4 shape is a 0.4-day item in gankdat's queue.

**Lesson for the pre-research pass:** before seeding a dataset spike, search npm and GitHub for the series' name — a
one-read check that would have found the rival on 11-10 19:36 and saved the spike.
