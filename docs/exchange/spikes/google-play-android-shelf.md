# Spike: Google Play as a shelf, now that the owner has opened it

Queue item `new-ventures/spike-google-play-android-shelf` (build, 2026-11-18 09:09 UTC slot; queued by exchange 2026-W47
§1). Sources: the exchange's round (`docs/relay/responses/exchange-w47-2026-11-18` 1–3 — testing rule, service fee,
Payments policy) and two rounds of this spike: `spike-google-play-2026-11-18` (21 lines: nine Play Console help pages and
twelve Play searches, `hl=en_GB&gl=GB`) and `spike-google-play-2026-11-18-b` (51 listing pages, every one 200); the
Bubblewrap CLI's README read from its repository and one WebSearch read. Every number below is from a page fetched today.

The question: is there a product this operation can build in a week whose Play niche shows paying rivals and thin free
competition, can a hosted runner build and sign the bundle at £0, and what would the twelve-tester rule ask of the owner?

**Call: park.** No niche read today shows both a paying rival and room. Where money is charged, the shelf is led by funded
firms at 100K–10M installs; where the shelf is thin, the apps already there sit at 0–1K installs with no rating shown —
the browser extensions' result (0–5 users on store search alone) repeated by other people's apps. The line scores 2, and
the owner's part is hours, so no request is raised (STRATEGY §3: over 15 minutes needs ≥ 10). The build itself is not
the obstacle. Nothing was created on the owner's Play account and nothing is asked of the owner.

## 1. The rules that would shape an app (primary, quoted)

- **Testing before production** (answer 14151465): "Developers with personal accounts created after 13 November 2023 must
  run a closed test for their app with a minimum of 12 testers who have been opted in continuously for at least 14 days."
  "If a tester opts out and opts back in later, the 14 days must be consecutive." The production application asks "how
  easy it was to recruit testers", "whether testers used all available app features" and for a summary of their feedback;
  "Reasons for required continued testing include having fewer than 12 opted-in testers or insufficient tester engagement
  during the testing period." Review "usually takes seven days or less". Paid apps: "Testers must purchase paid apps when
  participating in open or closed tests" (answer 9845334) — a paid download would charge the twelve testers.
- **Minimum functionality** (answer 9898783): "We do not allow apps that only have limited functionality and content" —
  the examples are "apps that are static without app-specific functionalities, for example, text-only or PDF file apps".
  The Kindle guide or a workbook download wrapped as an app is barred; a calculator or tracker with its own state is not.
- **Web views** (answer 9899034): "We don't allow apps whose primary purpose is to drive affiliate traffic to a website or
  provide a web view of a website without permission from the website owner or administrator." A wrapper of our own page
  has the owner's permission, so the rule does not bar it; the same page also says "We don't allow apps that merely
  provide the same experience as other apps already on Google Play" — the thirtieth free tax calculator is that.
- **Payments** (answer 9858738): "Play-distributed apps requiring or accepting payment for access to in-app features or
  services, including any app functionality, digital content or goods … must use Google Play's billing system", and
  "apps may not lead users to a payment method other than Google Play's billing system", including through "in-app user
  interface flows". **This is the rule that shapes everything**: an app cannot link to the Stripe, Payhip or Kindle
  checkout of the workbooks, nor sell gankdat credits by card. Money on Play is a paid download or Play Billing (15 % on
  the first US$1M), which a wrapped web page reaches only through Chrome's Digital Goods API — new payment code, not a
  reuse of what exists. (The page names programmes for alternative billing and external links in "eligible
  countries/regions"; whether the UK is one was not read.)
- **AI-generated content** (answer 13985936): the policy covers apps that generate content from user prompts, which must
  carry "in-app user reporting or flagging features". It says nothing about apps written with AI; none of the candidate
  shapes generates content. No bar. (The /diligence page, which does, would need the reporting feature.)
- **Target API** (answer 11926878): "Starting on 31 August 2026: New apps and app updates must target Android 16 (API
  level 36) or higher to be submitted to Google Play". Any build tool has to emit target 36 today.
- **Data safety** (answer 10787469): "All developers that have an app published on Google Play must complete the Data
  safety form, including apps on closed, open or production testing tracks", and "even developers with apps that do not
  collect any user data must complete this form and provide a link to their privacy policy."
- **Play App Signing** (answer 9842756): for new apps "Your app will be automatically enrolled in quantum-ready, hybrid
  signing with Google-generated keys"; the developer creates only an **upload key** ("use the Java keytool utility from
  the command line") and "must register the Google-held app signing key fingerprint" wherever the app is authenticated —
  for a Trusted Web Activity that is the `assetlinks.json` on our own domain, and with hybrid signing "you must copy the
  fingerprints for three keys".

## 2. The shelf, niche by niche (51 listing pages, GB store, read 2026-11-18)

"none shown" means Play prints no star rating on the page — too few ratings to publish. In-app price ranges are not in the
page body; a price is given only where the listing's own text states one. The page's developer type field says `Person`
for every app including HMRC's, so it is not tabled; developer names stand in for it.

**A. Reseller profit and inventory tracker (search `reseller profit tracker`, round 1 line 10)**

| App (developer) | Installs | Rating (count) | Money | Updated |
| --- | --- | --- | --- | --- |
| Reseller Profit Tracker (Mobilia Apps) | 100+ | none shown | ads + in-app purchases — fee calculator "free forever", optional premium | 13 Nov 2026 |
| Resale Ledger: Reseller Profit (Ender's Apps) | 100+ | none shown | ads + in-app purchases — optional premium | 14 Nov 2026 |
| Daily Sales Record (Kutir Soft) | 500K+ | 4.5 (4,332) | in-app purchases | 17 Nov 2026 |
| Daily Sales Profit & Inventory (Shrey Jain) | 100K+ | none shown | ads + in-app purchases | 10 Oct 2026 |
| SellerBook 2: Reseller Tracker (Daisuke Yamashita) | 1K+ | none shown | in-app purchases — US$6.49/month or US$64.99/year; free to 300 sales | 17 Nov 2026 |
| ThriftAI: Profit Identifier (smallstack ApS) | 100K+ | 4.6 (18,787) | in-app purchases | 24 Oct 2026 |
| Profit Tracker - Trade Journal (Finance98) | 500+ | none shown | ads | 29 Oct 2026 |
| eProfit - Sell on ebay with AI (SPOKEN TECHNOLOGIES INC) | 50K+ | 4.3 (2,195) | ads + in-app purchases | 8 Oct 2026 |

**B. eBay fee and profit calculator (search `ebay profit calculator fees`, line 11; eBay's own app and eProfit, already in A, left out)**

| App (developer) | Installs | Rating (count) | Money | Updated |
| --- | --- | --- | --- | --- |
| Profit - eBay Fees Calculator (Titanyou Studio) | 1K+ | none shown | ads | 31 Aug 2025 |
| Seller Fee Calculator for eBay (Maxim G.) | 10K+ | 1.9 (165) | ads + in-app purchases | 7 Aug 2026 |
| Profit Calculator for eBay UK (CFS 365 Network) | 50+ | none shown | ads | 14 Oct 2026 |
| Profit Calc for eBay & Amazon (Buzmasol Ltd) | 50+ | none shown | in-app purchases | 4 Jun 2026 |
| eBay Fee Calculator: FeeTally (Solo Soft Ltd) | 50+ | none shown | ads + in-app purchases | 23 Aug 2026 |
| eBay & Poshmark Fee Calculator (Smart Home Triage) | 100+ | none shown | ads | 8 Nov 2026 |
| Profit Kalkulator für eBay (LSMF Tech Ventures Limited) | 100+ | none shown | free, no ads | 23 Oct 2024 |

**C. UK mileage log (search `mileage tracker uk`, line 13)**

| App (developer) | Installs | Rating (count) | Money | Updated |
| --- | --- | --- | --- | --- |
| Mileage Tracker by Driversnote (Driversnote Mileage Tracker) | 1M+ | 4.7 (39,216) | free, no ads | 9 Nov 2026 |
| Mileage Tracker by MileageWise (MileageWise Inc.) | 50K+ | none shown | in-app purchases | 11 Nov 2026 |
| Mileage Tracker App by TripLog (TripLog, Inc.) | 500K+ | 4.3 (7,634) | in-app purchases | 6 Nov 2026 |
| Mileage Tracker & Log Book (motolog.app) | 500K+ | 4.5 (8,354) | in-app purchases | 12 Nov 2026 |
| MileClear: Mileage Tracker UK (GairWare) | 500+ | 4.8 (33) | in-app purchases — £4.99/month or £44.99/year (Pro: MTD quarterly updates) | 10 Nov 2026 |
| Mileage Tracker UK: Miles Log (HJSolutions) | 10+ | none shown | in-app purchases | 26 Sept 2026 |
| LogBook - Mileage Tracker (AntiD Digital) | 500+ | none shown | in-app purchases | 9 Apr 2026 |
| Mileage Tracker: Private Log (Kawaii Inc) | 0+ | none shown | in-app purchases | 10 Nov 2026 |

**D. Self-employed expenses and MTD (search `self employed expenses mtd`, line 14)**

| App (developer) | Installs | Rating (count) | Money | Updated |
| --- | --- | --- | --- | --- |
| Zoho Expense - Expense Reports (Zoho Corporation) | 1M+ | 4.7 (27,617) | free, no ads | 5 Nov 2026 |
| Expensify - Travel & Expense (Expensify Inc.) | 1M+ | 4.3 (32,617) | free, no ads | 16 Nov 2026 |
| Wallet: Budget & Money Manager (BudgetBakers) | 10M+ | 4.6 (389,236) | in-app purchases | 10 Nov 2026 |
| Access Expense (The Access Group) | 10K+ | 2.0 (32) | free, no ads | 6 Jul 2026 |
| Sage Sole Trader - MTD Tax (Sage Global Services Ltd) | 100K+ | 4.7 (463) | in-app purchases — free tier capped at 5 invoices a month (a review) | 5 Nov 2026 |
| Employee Expenses (KTech Products LLC) | 500+ | none shown | free, no ads | 24 Jul 2026 |
| Expense Tracker & Budget App (Bookipi - Billing Estimate) | 100K+ | 4.6 (5,104) | in-app purchases | 10 Nov 2026 |
| Monthly Expenses: Manage Money (Kaushik Baruah) | 100K+ | 4.1 (4,134) | in-app purchases | 5 Aug 2026 |

**E. Companies House / company check (search `companies house company check`, line 15; the three GOV.UK apps left out)**

| App (developer) | Installs | Rating (count) | Money | Updated |
| --- | --- | --- | --- | --- |
| Companies House (LingoKit) | 100+ | none shown | in-app purchases | 5 Nov 2026 |
| Companies House Check – UK (Ant Mobile Tech) | 0+ | none shown | in-app purchases | 10 Nov 2026 |
| Companies House Register (iGnite100 UK) | 100+ | none shown | free, no ads | 17 Nov 2026 |
| UK Companies House On The Go (Companies On The Go) | 500+ | none shown | in-app purchases | 22 Oct 2026 |
| UK Companies House Search (xizhongyou) | 1+ | none shown | free, no ads | 24 Oct 2026 |
| Smart Company Check (Smarty Software LTD) | 1K+ | none shown | free, no ads | 14 Nov 2021 |

**F. Trade mark search and watch (search `trademark search uk`, line 17; five relevant results of eight)**

| App (developer) | Installs | Rating (count) | Money | Updated |
| --- | --- | --- | --- | --- |
| U.K. Trademark Search Tool (Marcaria.com) | 500+ | none shown | free, no ads | 24 Aug 2023 |
| E.U. Trademark Search Tool (Marcaria.com) | 1K+ | none shown | free, no ads | 12 Jul 2024 |
| AI Trademark & Logo Identifier (Conquer App) | 1K+ | none shown | free, no ads | 22 Nov 2024 |
| Trademark Watchdog (Worldwide Trademarks App) | 50+ | none shown | free, no ads | 13 Nov 2026 |
| Trademark Class Finder (JSK Software) | 500+ | none shown | ads | 19 Sept 2018 |

**G. The other register subjects — tenders, sanctions, charity, food hygiene (lines 18, 16, 20, 19: the only on-subject results) and the two tax apps the exchange named**

| App (developer) | Installs | Rating (count) | Money | Updated |
| --- | --- | --- | --- | --- |
| Online Tenders Information (Bidding Source) | 50K+ | none shown | in-app purchases | 1 Nov 2023 |
| Tender Notice (Jojolapa Tech) | 1K+ | none shown | free, no ads | 20 May 2026 |
| Sanctions List (Bird & Bird) | 100+ | none shown | free, no ads | 15 Oct 2025 |
| Sanctions & Trade Intelligence (SetSailGo) | 10+ | none shown | free, no ads | 22 Jun 2026 |
| CharityCheck (Arqtechs) | 500+ | none shown | ads + in-app purchases | 6 Sept 2026 |
| The UK Food Safety App (FsYay) | 5K+ | 4.4 (66) | free, no ads | 16 Nov 2026 |
| HygiMap: Food Hygiene Map (Cavalier Venues Oy) | 1+ | none shown | in-app purchases | 14 Nov 2026 |
| #Pie Tax: Self Assessment app (Pie Money Limited) | 50K+ | 4.4 (208) | in-app purchases | 4 Nov 2026 |
| HMRC (HM Revenue & Customs) | 5M+ | 4.7 (86,640) | free, no ads | 27 Oct 2026 |

What the tables say:

| Niche | Who leads | Does anyone charge? | New or small entrants | Reading |
| --- | --- | --- | --- | --- |
| A. Reseller tracker | Daily Sales Record 500K+, ThriftAI 100K+ (18,787 ratings), eProfit 50K+ — general or US/AI-led | yes — SellerBook 2 at US$6.49/month | the two apps named for the search term, both updated this week: **100+ installs each**; SellerBook 2, the one with a stated price: 1K+ | paying rival exists but at 1K+ installs; free leaders ≥ 100K |
| B. eBay fee calculator | Seller Fee Calculator 10K+ at **1.9 stars** | ads, a few in-app purchases | the three UK-made ones (CFS 365, Buzmasol, Solo Soft): **50+ installs each** | no demand reaches a new calculator |
| C. UK mileage log | Driversnote 1M+ (39,216 ratings), TripLog 500K+, motolog 500K+ | yes — MileClear £4.99/month | MileClear, HMRC-recognised for MTD: **500+ installs, 33 ratings**; "Mileage Tracker UK": 10+ | led by ≥ 100K apps; needs background GPS, not a wrapped page |
| D. Expenses and MTD | Wallet 10M+, Zoho Expense 1M+, Expensify 1M+, Sage Sole Trader 100K+ (free tier) | yes, by firms with sales teams | Employee Expenses 500+ | closed; MTD filing also needs HMRC recognition |
| E. Companies House check | nobody — best is 1K+, last updated 2021 | three list in-app purchases | six apps at 0+, 1+, 100+, 100+, 500+, 1K+; **none shows a rating** | thin, and empty of users |
| F. Trade mark search / watch | nobody — 1K+ at most | none | Trademark Watchdog, updated 13 Nov 2026: 50+ | no users |
| G. Tenders, sanctions, charity, food hygiene | an Indian tenders app 50K+; FSA-data app 5K+ (66 ratings, free) | CharityCheck (ads + IAP, 500+) | Bird & Bird's sanctions list 100+; a second 10+ | no users; the tax pair for scale: HMRC 5M+, Pie Tax 50K+ |

The two niches of the spike's own finding were the eBay fee calculator (B — the Reseller workbook's fee maths as a pocket
tool) and the register subjects beyond company checks (G). Neither changes the picture. Vinted (line 12) returned no
seller tracker at all — only Vinted's own apps and general listing tools.

Two patterns, no exception across 51 listings:

1. **Where buyers pay, they pay incumbents.** Mileage, expenses, MTD and tax are led by apps with 100K–10M installs and
   tens of thousands of ratings, most with a free tier. The best-placed small rival read today — MileClear, UK-specific,
   HMRC-recognised, 4.8 stars — has 500+ installs.
2. **Where the shelf is thin, it is thin because nobody arrives.** Seventeen of the 51 apps sit in the 100+ band or below and 31 at 1K+ or below,
   and every app built on the subjects this operation holds data for (company, trade mark, sanctions, charity checks) is
   at 1K+ or below with no rating shown. Play search does not deliver users to a new utility in these niches any more
   than the Chrome Web Store did to ReadFocus and Highlight Keep.

## 3. Can a hosted runner build and sign the bundle at £0?

Yes on the evidence read; not run (the item says sketch only, nothing dispatched).

- **Tool**: Bubblewrap (`@bubblewrap/cli`, GoogleChromeLabs) wraps a page as a Trusted Web Activity. Its README asks for
  Node 18+, JDK 17 and the Android command-line tools; `init` is interactive, but `build` runs from a committed
  `twa-manifest.json` (`--manifest`), takes `--signingKeyPath` / `--signingKeyAlias`, reads the passwords from
  `BUBBLEWRAP_KEYSTORE_PASSWORD` and `BUBBLEWRAP_KEY_PASSWORD` (documented for running the build in CI) and writes `app-release-bundle.aab` for Play and `app-release-signed.apk` for a device.
- **Cost**: £0 — a public repository's hosted minutes, no paid service.
- **What it needs once**: an upload keystore (generated by `keytool` on the runner and stored as two repository secrets —
  the same pattern as the licence signing key), and `/.well-known/assetlinks.json` on the wrapped domain carrying the
  Google-held signing fingerprints, which only the Play Console shows — one copy-and-paste by the owner after the first
  upload. Uploads after the first can go through the Play Developer API with a service-account key (a second owner step)
  or by hand.
- **Unverified**: that Bubblewrap's generated project targets API 36 as the 31 August 2026 rule requires (section 1), and
  that the runner image's Android SDK matches. A first run would settle both; a native Kotlin shell is the fallback and
  builds with Gradle on the same runner.

Sketch (kept here, not in `docs/ci/` — a file there is installed by the workflow installer and owes a first run):

```yaml
name: android bundle
on: workflow_dispatch
jobs:
  bundle:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with: { distribution: temurin, java-version: 17 }
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: echo "$UPLOAD_KEYSTORE_B64" | base64 -d > upload.keystore
        env: { UPLOAD_KEYSTORE_B64: "${{ secrets.PLAY_UPLOAD_KEYSTORE_B64 }}" }
      - run: npx @bubblewrap/cli build --manifest ventures/<slug>/android/twa-manifest.json --signingKeyPath upload.keystore --signingKeyAlias upload --skipPwaValidation
        env:
          BUBBLEWRAP_KEYSTORE_PASSWORD: ${{ secrets.PLAY_UPLOAD_KEYSTORE_PASSWORD }}
          BUBBLEWRAP_KEY_PASSWORD: ${{ secrets.PLAY_UPLOAD_KEYSTORE_PASSWORD }}
      - uses: actions/upload-artifact@v4
        with: { name: app-release-bundle, path: app-release-bundle.aab }
```

## 4. The owner's part, in full, if this were ever promoted

| Step | What | Minutes |
| --- | --- | --- |
| 1 | Create the app in Play Console; paste the store listing (name, descriptions, icon, screenshots — all supplied) | 20 |
| 2 | Content rating questionnaire, target audience, ads declaration, Data safety form, privacy-policy link (answers supplied) | 25 |
| 3 | Upload the first bundle to a closed-testing track; create the tester email list or Google Group | 15 |
| 4 | Copy the app signing key fingerprints from Play Console into a note (for `assetlinks.json`) | 5 |
| 5 | **Find twelve people with Google accounts on Android, send each the opt-in link, and keep all twelve opted in for fourteen consecutive days** | hours, over two weeks — the step no routine can do |
| 6 | Apply for production: three pages of written answers on tester recruitment, engagement and feedback (drafts supplied, but they must be true) | 20 |
| 7 | Wait for review ("usually seven days or less"); if sent back, continue the closed test | — |

About 85 minutes of form-filling plus the tester fortnight: first public listing no sooner than three weeks after the
bundle exists. Step 6 asks what testers actually did, so the twelve have to be real users of the app, not names on a list.

## 5. Score and call

STRATEGY §5: evidence **1** (rivals charge in A and C, but no small entrant shows users, and nothing of ours has sold
through store search) × reach **5** ÷ (2 build days + the owner's tester hours, counted as 0.5 day) ≈ **2**. The item's
promote test was a niche with paying rivals and no free app above 100K installs. A, C and D fail on the leaders; E, F and
G have no leaders and no paying users either. The request a promote would raise is far over 15 minutes and the line is
far under 10, so the request is not made.

**Park** — `google-play-android-apps` in `docs/pipeline/exchange.json`, ARCHITECTURE's out-of-scope line unchanged. What
this spike spent and settled: the fee and identity hurdles are gone (the owner's £18.50), the build is a solved problem on
a hosted runner, policy does not bar a real tool but does bar every checkout link we own, and the shelf does not hand
users to a new utility in any niche we could enter.

**Re-open when** (any one):

- the owner says in a note what the Play account was opened for, or that twelve testers for fourteen days are available —
  then the best candidate is the reseller tracker (A: the Reseller workbook's fee and profit maths with its own stored
  inventory, free, Play Billing for an export tier; the paid rival is SellerBook 2 at US$6.49/month and 1K+ installs);
- a product of ours gains an audience elsewhere that asks for an Android app (a /feedback line, an inbox request, 50+
  weekly users on a web page that would be the app) — distribution first, then the shelf;
- Google drops or shortens the twelve-tester rule for personal accounts, or the account becomes an organisation account;
- a re-read of niche A or C shows a UK-specific small rival past 10K installs (MileClear today: 500+; the two reseller
  trackers named for the term: 100+ each).

No dated re-read is set: nothing here changes by a date.
