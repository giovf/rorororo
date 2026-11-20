# Spike: the Microsoft Store as a shelf for a packaged web app

Queue item `new-ventures/spike-microsoft-store-pwa-shelf` (build, 2026-11-20 17:00 UTC slot; seeded by the 09:00 slot's
research). Sources: the seeding round (`docs/relay/responses/new-ventures-2026-11-20` 1–3: account types, the free
registration post, the publish index) and two rounds of this spike — `ms-store-spike-2026-11-20` (18 lines: eleven
Microsoft Learn addresses, two of them 404, the App Developer Agreement PDF, the web Store's `robots.txt` and five GB searches) and
`ms-store-spike-2026-11-20-b` (4 lines: company onboarding, PWA packages, payout thresholds, support info). Every
quote and number below is from a page fetched today.

The question: can a UK sole trader put the free tax estimate page on the Store as an installable app with a paid tier,
on the free individual account, and does the GB shelf show anyone paying for that kind of tool?

**Call: park.** Two of the item's four park conditions are met, each on Microsoft's own words or data. (1) The
agreement itself — not only the help page — puts anyone who distributes "in relation to your business, trade, or
profession" on the Company account, which asks for a D-U-N-S number or an official business document plus a work-domain
email check: a new business verification, which STRATEGY §3 allows only for work scoring ≥ 10. (2) The shelf shows no
paying demand for the niche: across five GB searches the only relevant paid app is a £3.99 mileage tracker released in
August with no rating, and three of the five searches return no app of the kind at all. The line scores about 1.5.
Nothing was created on any account and nothing is asked of the owner.

What is good here, and kept for the trigger: this is the one large store that lets a non-game app sell through its own
checkout and keep everything, and a web app is packaged from its URL with no Windows machine.

## 1. The account question (primary, quoted)

- **App Developer Agreement** v8.11 (published 17 March 2026, effective 17 April 2026), §2: "If your intended
  distribution of Apps or In-App Products through the Microsoft Store is in relation to your business, trade, or
  profession, your Store Account must be a Company account type. By choosing an Individual or Company account type
  during the Store Account sign-up process, you thereby declare such status."
- **Account types page** (last updated 2026-10-29) — Individual is for "Independent developers whose distribution of
  apps through the Store is not in relation to their business, trade, or profession", "Small scale creators producing
  content for non-commercial purposes" and hobby, school or personal projects. Company is for "Independent developers
  and freelancers whose distribution of apps through the Store is in relation to their business, trade, or profession".
  "Changing a developer account from Individual to Company is not supported".
- A sole trader's app that sells a workbook, or carries a paid tier, is distribution in relation to a trade. Opening
  the Individual account for it would be a false declaration under §2, so that route is closed whatever the app costs
  — a free app that leads to our checkout is covered just the same.
- **What the Company account asks** (company onboarding page): no fee ("The $99 registration fee is waived in the new
  flow"), then business verification by "A valid 9-digit DUNS number" or an official document — "Articles or
  certificate of incorporation, partnership deed, or equivalent formation document", "Government-issued business
  registration or license", "Official company registry record from a government website", "Tax filings or stock
  exchange filings" — and "A work email address associated with your organization's domain" ("Personal emails like
  Gmail or Yahoo aren't supported"), with domain ownership records if the domains differ. "Mandatory due diligence is
  required and is a blocking step"; manual review "can take up to 3-5 business days", three appeals per check.
- For this owner: no company, no registry record, and no Self Assessment registration until income passes the £1,000
  trading allowance (ARCHITECTURE, compliance). The only route today is a D-U-N-S number requested from Dun &
  Bradstreet for a sole trader — a second third-party identity file, days to weeks — or waiting until an HMRC document
  exists. Either is a new business verification.
- The support-info page adds that a phone number and postal address are collected "for regulatory compliance and
  legal dispute resolution purposes" and are "generally not displayed to customers browsing the Store".

## 2. The money, in the Store's words

- **Fee** (agreement §6(b)): "Fifteen percent (15%) of Net Receipts for any Apps (and any In-App Products in such
  Apps…)" when the Microsoft commerce engine is used; the benefits page says the same — "a competitive fee of 15% for
  apps and 12% for games".
- **Own checkout allowed** (agreement §5(d)–(e)): for non-game apps on Windows "you may make use of a secure
  third-party commerce engine to support the purchase of any In-App Product(s)", and "Purchases made on a third-party
  commerce engine are not subject to the Store Fee". Store policy 10.8.1: "Non-game products made available on PC
  devices may either use a secure third-party purchase API or the Microsoft Store in-product purchase API". The
  conditions (10.8.2): the product "must identify the commerce transaction provider, authenticate the user, and obtain
  the user's confirmation of the transaction", card handling must meet PCI DSS (a hosted Stripe or Payhip checkout
  does), "After installation of your product is completed, users may be directed to a browser to complete registration
  or transactions", and the third-party checkout is declared at submission. This is the opposite of Google Play's rule
  (spike 2026-11-18), and the reason the idea is parked with a trigger rather than declined.
- **Store billing from a web app**: the Digital Goods API page — "If your Progressive Web App (PWA) is listed in the
  Microsoft Store, you can provide in-app products and subscriptions by using the Digital Goods API and the Payment
  Request API"; the billing method "is available only for a PWA that's installed from the Microsoft Store, on
  Windows". No native wrapper is needed (that park condition is not met), but it is new payment code; a paid download
  needs none ("You are required to select a base price for your app… either Free or one of the available price
  tiers", with optional time-limited or unlimited trials).
- **Payout**: "The payment threshold in all cases is USD $50"; the United Kingdom is ticked for the Microsoft Store and
  for PayPal; payment by "ACH/SEPA or wire transfer", PayPal where supported, two to three business days by PayPal and
  seven to ten by bank. The tax profile's questions sit behind the Partner Center sign-in and were not read.

## 3. Packaging

- "To publish your PWA to the Microsoft Store, no code changes are required. Instead, you create an app reservation in
  Microsoft Partner Center, package your PWA using PWA Builder, and then submit your package to the Microsoft Store."
  The download is "a .zip archive that contains an .msixbundle file and a .classic.appxbundle file". No Windows
  machine and no signing key of ours: the Store signs.
- "Generally, when you update your PWA code, you don't need to create a new app package and submit it to the Microsoft
  Store again" — the page stays deployed from this repo as it is today.
- Store policy 10.1.1: "Products submitted as web apps must be published by the domain or website owner" (we own
  apps.gankdat.com). Policy 10.1 asks for "unique and distinct value" and a "clear" value at first run; a calculator
  with its own state passes on the wording, a page of links would not.
- Whether PWA Builder's packaging can be scripted on a hosted runner was not read; the build would be a day at most
  either way and is not what decides this.

## 4. The shelf (GB store, five searches, read 2026-11-20)

The web Store's search pages are web components and came back as empty shells in the morning round; the page's own
listing call, `https://apps.microsoft.com/api/products/search?query=…&mediaType=apps&gl=GB&hl=en-GB`, answers JSON to a
plain GET (`robots.txt` is one line, a sitemap, with no disallow). 20 apps per search, 100 rows, 89 distinct apps. The
rating count is the Store's own rounded figure; "none" means no rating at all. The feed gives the release date, not the
last update, and no install count.

What the five searches say:

- **mileage** — one mileage app in twenty: Metre2 Mileage Tracker, £3.99, released 2026-08-03, no rating. The rest are
  mail clients, calculators, GPS and battery tools. A vehicle log (My Car, free, 30 ratings, 2013) is the only other
  near match.
- **self assessment** — nothing: Adobe Creative Cloud, Goodnotes, quiz and study apps. No tax app of any country.
- **tax calculator** — nothing: nine general calculators and Zoho's invoice generator, then zip, PDF and typing tools. No tax calculator appears.
- **sole trader** — nothing for the trade: a trading platform, a desktop-publishing tool at £24.99 (6 ratings), two
  personal money trackers (MoneyBook 17 ratings, MoneyPoint 1K) and the same £3.99 mileage app.
- **invoice** — the one populated niche, and it is free: ten invoice apps, every one a free download — Zoho's Free
  Invoice Generator (524 ratings) and Zoho Invoice (165), BizXpert (125), Invoice 360 (85), All My Invoices (44), Moon
  (40), Invoice Ninja (23), SBX (16), SubTotal (11), one unrated — then WhatsApp, Notion and Amazon Music fill the page.
- **Paid apps in all 100 rows: seven** — Metre2 £3.99 (unrated), Mail+ £4.19 (30), SRW Publisher £24.99 (6), and four
  priced "Paid" by the feed (AVG TuneUp 6, Snagit unrated, Typing Master 37, Scrivener 11). One of the seven is in our
  niche and it has no rating. Sixteen of the 89 apps have no rating at all.

Read against the park conditions: "every paying rival in the five searches has under 25 ratings" — met (the one rival
has none). "The niche's leaders are free with 1,000+ ratings" — not met; outside invoicing there are no leaders. An
empty shelf can mean room or no buyers, and the rating counts say which: the Store's own ten-year-old invoice apps, free and from known publishers, hold
11–524 ratings. People do not come to this store's search for
bookkeeping tools; the extensions' lesson (0–5 users from store search alone) would repeat.

## 5. Score and call

Score = evidence 1 (one unrated paying rival) × reach 3 ÷ (1 build day + the Company account's verification, counted
as 1 day of owner waiting and forms) ≈ 1.5; new-ventures weight 2 gives 3. STRATEGY §3 asks ≥ 10 before any request for
a new business verification. **Parked** in `docs/pipeline/exchange.json` as `microsoft-store-pwa-shelf`; no owner
request, no tax-workbook item.

**Trigger** — any one of: the owner holds a document the Company account accepts (a D-U-N-S number, or an HMRC Self
Assessment registration once income passes £1,000) for another reason; a product of ours shows 50+ weekly Windows
desktop users on the page that would be the app, or a buyer asks for a desktop app; Microsoft's account page lets a
sole trader sell on the Individual account. The shape then: the tax estimate page packaged with PWA Builder, free, with
the workbook sold through our own checkout under policy 10.8 (0 % to the Store) — a day's work, no payment code.

## 6. The 89 apps

| App | Publisher | Price | Rating (count) | Released | Search and position |
| --- | --- | --- | --- | --- | --- |
| Mail | eyacker.com | Free | 4.4 (2K) | 2013-10-01 | mileage 1; invoice 12 |
| Mail‘ | Codaapp Studio | Free | 4.7 (43) | 2025-10-15 | mileage 2; invoice 20 |
| GPS Map+ | WzzT | Free | 4.6 (100) | 2012-12-28 | mileage 3 |
| WorkingHours: Time Tracker, Timesheet | T. Partl | Free | 4.6 (170) | 2017-01-04 | mileage 4 |
| Calculator² | Richard Walters | Free | 4.2 (305) | 2012-02-13 | mileage 5; self assessment 12; tax calculator 2 |
| Measure Killer | Brunner BI GmbH | Free | none | — | mileage 6 |
| ServiceM8 | ServiceM8 Pty Ltd | Free | 5 (6) | 2021-09-15 | mileage 7; sole trader 15 |
| Battery Meter | Stefan vd | Free | 3.3 (7) | 2023-04-26 | mileage 8 |
| Metre2 Mileage Tracker | metre2 | £3.99 | none | 2026-08-03 | mileage 9; sole trader 9 |
| speed O Meter | Peter Engler | Free | 4.7 (12) | 2016-04-06 | mileage 10 |
| Mail+ | eyacker.com | £4.19 | 3.9 (30) | 2013-10-01 | mileage 11 |
| Money Tracker Infinite | Vitaly Knyazev | Free | 4.4 (43) | 2022-01-28 | mileage 12 |
| Calculator+ | SGS | Free | 4 (7) | 2011-02-08 | mileage 13; tax calculator 5 |
| AVG TuneUp | AVG Technologies | Paid | 4.3 (6) | — | mileage 14 |
| Calculator + | Jonas Zoche | Free | 3 (20) | 2014-03-21 | mileage 15; tax calculator 6 |
| GPS Routes | Kathy Grobbelaar | Free | none | 2016-03-23 | mileage 16 |
| SBX Invoice | SBX Studio | Free | 4.2 (16) | 2018-10-11 | mileage 17; invoice 8 |
| Data Usage | smart_Apps | Free | 3.7 (121) | 2013-01-31 | mileage 18 |
| My Car | kineapps | Free | 4.3 (30) | 2013-04-16 | mileage 19 |
| ServiceMax Go | PTC Inc. - ServiceMax | Free | none | 2020-03-16 | mileage 20 |
| Adobe Creative Cloud | ADOBE INC. | Free | 3.7 (70) | — | self assessment 1 |
| Mail Apps | MediaFinoLabs | Free | 4.7 (142) | 2025-07-23 | self assessment 2 |
| Goodnotes | Goodnotes Limited | Free | 3.7 (175) | 2022-11-17 | self assessment 3 |
| Monitorian | emoacht | Free | 4.6 (81) | 2017-02-21 | self assessment 4 |
| Quick Assist | Microsoft Corp. | Free | 3.5 (233) | 2022-01-26 | self assessment 5 |
| Microsoft Journal | Microsoft Corporation | Free | 4.2 (157) | 2021-01-08 | self assessment 6 |
| FlashQuiz | Wimberry | Free | 4.4 (123) | 2012-11-07 | self assessment 7 |
| One Task | Code Spark | Free | 4 (116) | 2016-04-24 | self assessment 8 |
| Aviation Exam | Aviationexam | Free | 4.8 (59) | 2013-07-08 | self assessment 9 |
| Achievement Art | Matthew Chartier | Free | 4.2 (38) | 2015-01-03 | self assessment 10 |
| AIMP | Artem Izmaylov | Free | 4.3 (23) | 2019-05-20 | self assessment 11 |
| iMath - AI Tutor | Math2Do.com | Free | 4.1 (352) | 2012-12-26 | self assessment 13 |
| My Computer | AI For Windows | Free | 4.3 (359) | 2018-07-23 | self assessment 14 |
| Snagit | TechSmith Corporation | Paid | none | — | self assessment 15 |
| Digital Study Planner | APPTERRA | Free | 3.8 (40) | 2023-09-08 | self assessment 16 |
| Moodle UAM | ARCADIO GARCÍA | Free | none | 2015-09-03 | self assessment 17 |
| PerformanceTest | PassMark Software Pty Ltd | Free | 4.2 (9) | 2021-05-20 | self assessment 18 |
| Multi control | Samsung Electronics Co, Ltd. | Free | 1.4 (5) | 2022-08-29 | self assessment 19 |
| Showbie | Showbie inc | Free | 3.8 (23) | 2016-04-02 | self assessment 20 |
| Free Invoice Generator | Zoho Corp | Free | 4.8 (524) | 2016-03-11 | invoice 1; tax calculator 3 |
| Zoho Invoice - Free Invoicing for Businesses | Zoho Corp | Free | 4.7 (165) | 2014-07-09 | invoice 2 |
| Invoice Generator & Estimate Maker by Moon | Moon Technolabs Pvt. Ltd. | Free | 4.4 (40) | 2014-04-23 | invoice 3 |
| All My Invoices - Invoice Maker | Aidaluu Inc. | Free | 4.1 (44) | 2020-11-30 | invoice 4 |
| Invoice Ninja | Invoice Ninja | Free | 4.8 (23) | 2021-09-02 | invoice 5 |
| Invoice – BizXpert | Key-Soft Ltd. | Free | 4.4 (125) | 2017-10-18 | invoice 6 |
| SubTotal: Invoice Maker & Billing | T. Partl | Free | 4.9 (11) | 2021-06-08 | invoice 7 |
| Invoice 360 | ConnectCode | Free | 3.7 (85) | 2012-11-09 | invoice 9 |
| Simple Invoice Manager for PC | TACKTILE SYSTEMS PRIVATE LIMITED | Free | none | 2026-07-10 | invoice 10 |
| WhatsApp | WhatsApp Inc. | Free | 4.6 (58K) | 2017-02-01 | invoice 11 |
| Epic Games Store | Epic Games Inc. | Free | 4.6 (5K) | — | invoice 13 |
| Prime Video for Windows | Amazon Development Centre (London) Ltd | Free | 3.4 (2K) | 2020-02-24 | invoice 14 |
| iTunes | Apple Inc. | Free | 2.8 (3K) | 2018-04-26 | invoice 15 |
| Notion | Notion Labs Inc. | Free | 4.4 (32) | — | invoice 16 |
| Facebook | Meta | Free | 3.8 (17K) | 2013-10-17 | invoice 17 |
| WeChat | Tencent WeChat Limited | Free | 4.1 (90) | — | invoice 18 |
| Amazon Music | AMZN Mobile LLC | Free | 4.7 (11K) | 2018-02-13 | invoice 19 |
| Windows Calculator | Microsoft Corporation | Free | 4.2 (10K) | 2013-04-06 | tax calculator 1 |
| Calculator X8 | Gergely Orosz | Free | 4.4 (831) | 2012-12-12 | tax calculator 4 |
| Scientific Calculator % | Wuhan Net Power Technology Co., Ltd | Free | 4.8 (5) | 2020-11-12 | tax calculator 7 |
| Calculator 1+2= | PeterCarrington | Free | none | 2018-10-02 | tax calculator 8 |
| Calculator Plus | Pavan.Kumbhar | Free | 1.5 (8) | 2014-09-04 | tax calculator 9 |
| Calculator⁺ | Asparion | Free | 3.5 (11) | 2012-10-17 | tax calculator 10 |
| ZIP Unzip - RAR & 7Z File Compressor | Wuhan Net Power Technology Co., Ltd | Free | 4.7 (380) | 2020-04-28 | tax calculator 11 |
| XLSX Spreadsheet | File Viewer Pro Inc. | Free | 4.3 (531) | 2023-07-20 | tax calculator 12 |
| PDF24 Creator | PDF24 | Free | 4.2 (23) | — | tax calculator 13 |
| Company Portal | Microsoft Corporation | Free | 2.7 (60) | 2012-12-17 | tax calculator 14; sole trader 1 |
| PDF* | Tim Grabinat | Free | 4.8 (145) | 2021-01-05 | tax calculator 15 |
| Quick Share | Samsung Electronics Co, Ltd. | Free | 2.3 (120) | 2021-02-12 | tax calculator 16 |
| ChatGPT (Beta) | OpenAI | Free | none | 2026-03-28 | tax calculator 17 |
| Typing Master 12 | Cloud Kayak Labs, Inc | Paid | 4.6 (37) | — | tax calculator 18 |
| MSN Money | Microsoft Corporation | Free | 3.9 (1K) | 2012-02-07 | tax calculator 19 |
| Speed Test for Windows | LISAppStudio.com | Free | 4.3 (192) | 2023-03-21 | tax calculator 20 |
| Plus500 | Plus500 | Free | 3.9 (43) | 2014-12-15 | sole trader 2 |
| Player | Virtual Pulse | Free | 3.7 (1K) | 2017-03-18 | sole trader 3 |
| trader2B Desktop | trader2B | Free | none | 2026-02-25 | sole trader 4 |
| Hermes Agent | Nous Research Inc. | Free | none | 2026-09-09 | sole trader 5 |
| SRW Publisher | SRW Software | £24.99 | 4.5 (6) | 2026-10-05 | sole trader 6 |
| MoneyBook | LAT | Free | 4.1 (17) | 2015-04-30 | sole trader 7 |
| Jobseeker | Resumedia | Free | none | 2022-03-31 | sole trader 8 |
| Private Share | Samsung Electronics Co. Ltd. | Free | none | 2021-10-15 | sole trader 10 |
| Signal Private Messenger | Signal Messenger, LLC | Free | 4.4 (9) | — | sole trader 11 |
| Scrivener | Literature & Latte Ltd | Paid | 3.7 (11) | — | sole trader 12 |
| PubKeep: Open & Edit Publisher (.pub) Files | Saint Systems LLC | Free | none | — | sole trader 13 |
| WorkBuddy | 深圳市腾讯计算机系统有限公司 | Free | none | — | sole trader 14 |
| Everywriter | Rain Fu | Free | 3.9 (49) | 2016-02-03 | sole trader 16 |
| Dynamics 365 Business Central | Microsoft | Free | none | 2021-12-06 | sole trader 17 |
| MoneyPoint | Two Square Systems | Free | 4.7 (1K) | 2013-10-16 | sole trader 18 |
| Dropshipping Store Business Guide | Better courses | Free | 4.6 (5) | 2024-01-29 | sole trader 19 |
| Dj Mixer | KetoLabs | Free | 3.2 (109) | 2013-01-23 | sole trader 20 |
