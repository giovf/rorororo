# Spike: JetBrains Marketplace as a paid shelf for a sole trader's plugin

Queue item `new-ventures/spike-jetbrains-marketplace-paid-plugins` (burn-down, 2026-10-22 17:30–18:00 UTC). Sources:
two fetch-relay rounds (`docs/relay/responses/jetbrains-marketplace{,-b}-2026-10-22`, pruned after 7 days): the
Marketplace documentation pages on trader status (23 July 2025), vendor profile (30 July 2026), revenue sharing
(23 January 2024), billing & licensing (18 January 2024) and the verified vendor badge (30 July 2026); the
**JetBrains Marketplace Developer Agreement v3.2, effective 24 August 2026** (the current text on jetbrains.com/legal);
and the keyless Marketplace search API (`/api/searchPlugins?pricingModels=PAID`). WebSearch only found the URLs
(a 2025 JetBrains blog post on the trader-verification requirement said the same as the trader-status page).
The question the 2026-10-22 research left open: can a UK sole trader without a company be a paid-plugin vendor, and
is there a ≤ 1-week utility niche where small vendors' paid plugins show downloads at ≥ US$10/user/year?

## 1. Eligibility: an individual can sell paid plugins — read from the agreement and the help pages

| Source | What it says |
| --- | --- |
| Developer Agreement v3.2 §1 | The agreement is between JetBrains s.r.o. (Prague) and "You, either a legal entity or a natural person ('Developer')"; no company is required to accept it. |
| Agreement §3.1 | "You must indicate whether You are a trader or a non-trader within the meaning of EEA consumer protection laws" — the DSA/Omnibus declaration every vendor makes at upload. |
| Trader-status page | A natural person "acting for professional purposes" is a trader "and it is immaterial whether you offer some or all of your plugins for free". An **individual** trader provides: full name, a copy of an identification document, phone number, residential address, email, and "registration number in the trade register" (UK sole traders have no such register; the 2025 blog post reads this as "if registered"); all traders also provide banking details and certify EU-law compliance. |
| Vendor profile page | "Every plugin must be associated with a vendor profile, regardless of whether the vendor is an individual or represents an organization"; both have vendor pages; the profile is created at the first upload. |
| Verified vendor badge page (30 July 2026) | The badge "means that a Vendor declares themselves as a trader and JetBrains has verified the provided vendor details (of a legal entity or of an individual)" — the individual path is verified the same way. |
| Agreement §5.4 | Payment "to a valid bank account in Your name" — a personal UK account in the owner's name qualifies. |
| Agreement §7.6 | Self-billing for a "non-EU developer" or "non-EU non-entrepreneur": JetBrains issues the invoices on the vendor's behalf; the vendor raises none (no UK VAT registration needed below the threshold). |

Reading: **yes**. The agreement and all four help pages name the individual explicitly; nothing asks for a company
number from a person (the trade-register number is what a registered person supplies). What the owner would do once
(~30 minutes, and it puts the owner's identity on JetBrains — CLAUDE.md: ask first): create the Marketplace account,
declare trader status, upload an ID document, residential address, phone, and bank details; the published vendor page
then shows the name, email, address and phone to EU buyers (trader-status page: "some of the information provided,
such as your name, email, address, and phone number, will be displayed to end-users"). That public display is the one
term the Atlassian path did not have.

## 2. The shelf's terms (Developer Agreement v3.2 and the revenue-sharing page)

- **Fee**: Developer Fee = **85 % of the List Price excluding taxes** (§5.2a); JetBrains may notify another percentage
  with ≥ 1 month's notice, never below 75 % (§5.2b); no listing or development fee (revenue-sharing page). Taxes (VAT,
  WHT) are "calculated on top of the price and can't be included in the calculation of the fee"; a reseller's cut comes
  out of JetBrains' 15 %, so the developer's share is constant.
- **Pricing**: the vendor sets the List Price and the model (subscription, one-off) per plugin (§3.2, §4.2); plugins join
  JetBrains' Special Offers (classroom, student, open source, continuity discount) unless opted out at upload. Billing &
  licensing page: evaluation licences, card/PayPal/wire, quotes, monthly/yearly, personal/commercial subscriptions, the
  on-premises License Server — the buyer-side machinery is JetBrains' own.
- **Payout**: a sales report "up to thirty (30) days after the end of each calendar month" (§5.4); payment "within thirty
  (30) days from issuance of the invoice" (so 30–60 days after the month); **USD or EUR at JetBrains' sole discretion**
  (§5.4; the help page says the vendor chooses under Vendor Information); accrued until **US$200 / €200** is due (§5.5),
  always paid out at December 31. Refunds and chargebacks are offset against future fees (§5.5).
- **Taxes**: the developer bears income tax; JetBrains "maintains the right to deduct or withhold any applicable withholding
  taxes" (§6.1) — a UK individual's Czech withholding position (treaty rate on the fee) is not stated on any page read and
  is an open question for the owner's accountant, not for this spike.
- **Support duty** (§12): "commercially reasonable efforts to provide web-based and/or email support … during normal
  business hours at Your location" and a support email JetBrains can direct customers to — the same shape as Atlassian's,
  lighter (no 24 h critical-response clause).
- **Content**: the Approval Guidelines and the Content Moderation policy apply (§8.4); a paid plugin cannot later be
  moved to another vendor without Marketplace Support (vendor-profile page).

## 3. Demand (Marketplace search API, keyless, 2026-10-22)

`/api/searchPlugins?pricingModels=PAID&max=20&offset=N&orderBy=downloads` (max accepts 20, not 50 or 100) lists every
paid-via-JetBrains plugin with downloads, rating, last-update date, tags and vendor; `/api/plugins/{id}` adds the vendor's
type, country and trader flag and a `purchaseInfo.productCode` but no price (the `/pricing` sub-path answers
`Parameter 'family' is incorrect` to every value tried; prices are the one number this spike could not read keylessly —
see §4).

**Market size**: **494 paid plugins from 224 vendors** (the whole paid catalogue, 25 pages). 404 of the 494 were updated in
2026 — a live shelf, not a graveyard. Downloads (lifetime, the API's only demand number):

| Downloads | all 494 | from vendors with 1–2 paid listings (219 plugins, 189 vendors) |
| --- | --- | --- |
| < 2,000 | 301 | 136 |
| 2,000–9,999 | 94 | 30 |
| 10,000–99,999 | 71 | 38 |
| ≥ 100,000 | 28 | 15 |
| median | 739 | 623 |

So 83 paid plugins from one- or two-listing vendors clear the spike's 2,000-download bar, 53 of them 10,000+. The shelf is
not dominated by studios: the eight largest vendors (Jetplugins 31, Ilscipio 25, Anbora Labs 23, Gerry Themes 14 …) hold
~145 listings and the other 216 vendors the rest. Every one of the 83 is from a verified (trader) vendor.

**Small-vendor paid plugins at ≥ 2,000 downloads in a ≤ 1-week utility shape** (editor rendering, formatting, icons,
themes, navigation, small viewers — no language support, no database tooling):

| Plugin (vendor, paid listings) | Downloads | Rating | Last update | Shape |
| --- | --- | --- | --- | --- |
| ANSI Highlighter Premium (Ahmed Layouni, 1; FR, verified trader) | 1,553,264 | 4.87 | 2026-10-16 | renders ANSI colour codes in log files — an editor highlighter |
| MyBatis Log (obroom, 2) | 632,639 | 4.29 | 2026-06-11 | re-formats MyBatis SQL log lines — a log formatter |
| Simple Object Copy (com-cs-org, 1) | 33,460 | 3.47 | 2022-05-10 | generates copy code between Java beans — a code generator, unmaintained |
| AICommit (AICommit, 1) | 24,632 | 4.54 | 2026-10-18 | commit-message generator — an API call and a dialog |
| VSCode Icons (JTracker, 1) | 22,018 | 4.31 | 2026-07-28 | an icon pack |
| JavaDoc Clean Read (Artsiom Chapialiou, 2) | 18,851 | 4.56 | 2025-09-28 | renders Javadoc comments cleanly — an editor folding/rendering plugin |
| .log (WeirdDev, 1) | 16,930 | 3.79 | 2026-09-25 | log-file viewer |
| Skol — Calm Semantic Themes (kreuzercode, 1) | 15,890 | 4.73 | 2026-09-11 | a colour theme |
| SequenceDiagram.org (SequenceDiagram.org, 1) | 15,778 | 3.80 | 2025-08-17 | text-to-diagram renderer |
| Smart Jump (obroom, 2) | 11,476 | 4.80 | 2026-04-11 | caret-navigation helper |
| CodeMate (小白菜, 1) | 11,312 | 4.07 | 2025-02-17 | code-editing helpers |
| Monokai Pro Lifetime (Monokai, 1) | 9,613 | 4.80 | 2026-09-08 | a colour theme (one-off licence) |
| Find In Files (Favorites) (Martin Kadlec, 1) | 3,823 | — | 2025-04-17 | a search-scope helper |
| Combine and Copy Files to Clipboard for AI (Jure Stepisnik, 1) | 3,349 | 3.63 | 2026-07-06 | a context-packer for LLM prompts |

Tag counts over the 83: Formatting 9, Editor 16, User Interface 10, Theme 3, Editor Color Schemes 4, Viewer 4,
Navigation 4 — the utility shapes exist and sell, but they are a minority next to language support (Programming
Language 13, Framework 17) and database tooling (11), which are the multi-week builds. Leaders of the utility shapes for
the ceiling: Extra Icons (Jonathan Lermitage, 3+ listings) 1,401,027 downloads; Gerry Themes Pro (14 listings) 550,321;
Fast Request HTTP client (DKingSoft) 314,823 — a one-person HTTP client at 4.93 stars.

## 4. Prices — the number the API withholds, read first-hand from one vendor

The catalogue API carries no price: `/api/plugins/{id}/pricing` answers `Parameter 'family' is incorrect` for
`intellij`, `INTELLIJ`, `idea` and no value, `/prices` and `/price` the same, the public pricing tab is client-rendered
(84 KB of HTML with no figure in it) and `data.services.jetbrains.com/products?code=<productCode>` answers `[]` for a
plugin code. What could be read keylessly:

- **The store's rule** (JetBrains Terms and Conditions of Purchase, WebSearch): "Prices for Paid Plugins are set in
  one of the following currencies depending on Customer's country: USD, EUR, GBP, or CZK" — per-user monthly or yearly
  subscriptions, personal and commercial, like JetBrains' own IDEs (billing page §2).
- **A one-listing vendor's own numbers** (Wolfram Language plugin, Hal's Corner, 132,372 downloads, 4.81): launched on the
  Marketplace in 2019 at €3/month personal and €12/month business (yearly = 10 × monthly: €30 and €120); the vendor's
  2022 "pricing changes" post raised it to **€12/month or €120/year personal and €48/month or €480/year commercial**,
  citing "JetBrains' commission fee went up from 5% to 15% after the first year". One first-hand data point, three years
  old, 10–40× the spike's US$10/user/year bar.

So the price bar (≥ US$10/user/year on three small-vendor plugins) is **not proven by this spike** — one vendor is, the
other thirteen rows carry downloads only. It is the one open number, and it is readable in minutes by anyone with a
browser (each plugin's pricing tab), so it goes to the 2026-10-28 exchange as a ten-minute check, not back to the relay.

### 4a. The 14 prices, read 2026-10-24 (queue item `new-ventures/spike-jetbrains-price-read`, burn-down)

One relay round of 14 `RENDER` lines (`docs/relay/responses/jetbrains-prices-2026-10-24`, pruned after 7 days): every
pricing tab rendered (HTTP 200, 226–271 KB each, network idle, the only failed request on each page a Google ad
beacon). What the tab shows without a click is the **"For individual use"** price for the **United States** (USD); the
"For organizations" toggle is a click the relay does not make, so commercial prices stay unread (JetBrains' own IDEs
price commercial at roughly 2–3× personal; the Wolfram vendor's 4× in §4 is the only plugin reading). Yearly prices are
the first-year figure; where the vendor joins JetBrains' continuity discount the tab also lists the second year (−20 %)
and third year onwards (−40 %).

| Plugin (downloads, §3) | Trial | Monthly | Yearly (1st yr → 2nd → 3rd+) | ≥ US$10/user/yr |
| --- | --- | --- | --- | --- |
| ANSI Highlighter Premium (1,553,264) | 10 days | US$1.00 | US$10.00 | yes |
| MyBatis Log (632,639) | 30 days | — | US$5.00 → 4.00 → 3.00 | no |
| Simple Object Copy (33,460) | 30 days | — | US$1.00 → 1.00 → 1.00 | no |
| AICommit (24,632) | 30 days | US$1.00 → 0.80 → 0.60 | US$10.00 → 8.00 → 6.00 | yes |
| VSCode Icons (22,018) | 14 days | — | US$5.00 → 4.00 → 3.00 | no |
| JavaDoc Clean Read (18,851) | 30 days | US$1.00 → 0.80 → 0.60 | US$10.00 → 8.00 → 6.00 | yes |
| .log (16,930) | 30 days | US$3.80 → 3.00 → 2.30 | US$38.00 → 30.00 → 23.00 | yes |
| Skol — Calm Semantic Themes (15,890) | 30 days | US$2.00 | US$20.00 | yes |
| SequenceDiagram.org (15,778) | 30 days | US$1.00 → 0.80 → 0.60 | US$10.00 → 8.00 → 6.00 | yes |
| Smart Jump (11,476) | 30 days | — | US$5.00 → 4.00 → 3.00 | no |
| CodeMate (11,312) | 30 days | US$1.00 → 0.80 → 0.60 | US$10.00 → 8.00 → 6.00 | yes |
| Monokai Pro Lifetime (9,613) | — | — | US$29.00 perpetual, one payment, all updates | yes (one-off) |
| Find In Files (Favorites) (3,823) | 30 days | US$1.00 → 0.80 → 0.60 | US$10.00 → 8.00 → 6.00 | yes |
| Combine and Copy Files to Clipboard for AI (3,349) | 30 days | US$1.00 → 0.80 → 0.60 | — (monthly only; 12 × US$1 = US$12) | yes (monthly) |

**Count: 10 of 14 at ≥ US$10 per user in year one** — eight yearly subscriptions at US$10–38, one monthly-only plan
worth US$12/year, one US$29 perpetual licence; four below the bar at US$1–5/year (MyBatis Log, Simple Object Copy, VSCode
Icons, Smart Jump — the two with the most downloads after ANSI are among them). The bar the 2026-10-22 call set (≥ 3)
is cleared three times over, so the exchange re-scores the idea at **evidence 2**.

What the prices also say:

- **US$1/month and US$10/year is where eight of the fourteen sit**, including the shelf's most-downloaded small-vendor
  plugin (ANSI Highlighter Premium, 1.55 M downloads, US$10/year personal). Nothing read names a Marketplace minimum
  price, but eight vendors landing on the same round figure reads like a floor or a default, not a market price; the
  honest planning number for a one-screen utility is therefore **US$10/user/year personal (US$8.50 to the vendor at
  85 %)**, with the commercial tier the upside the next read must check (the Wolfram vendor's 4× would make it US$40).
- **A yearly plan with a monthly option** is the common shape (8 of 14); a yearly-only plan (4) and a one-off perpetual
  (1) also exist, so a theme can be sold once at US$29 — the Monokai Pro shape — if that fits better than a subscription.
- **Perpetual fallback licences** (12 months of uninterrupted payment) and the continuity discount are JetBrains-wide
  terms the tab repeats for every vendor that opted in; a 10–30-day trial is on 13 of 14.
- **Unit economics at the floor**: at US$10/year × 85 % a plugin needs ~120 paying users for US$1,000/year — ANSI
  Highlighter Premium's 1.55 M downloads make that plausible at the top of the shelf and the §3 median of 623 downloads
  makes it unlikely for a new entrant in year one, which is the §5 kill rule's point.

## 5. Call: promote reshaped — the exchange decides with the price check

What this shelf has that the Atlassian spike (same morning) lacked: the vendor sets a per-user price in the IDE's own
store, JetBrains bills monthly or yearly subscriptions, collects VAT, pays 85 % by bank transfer from US$200 (Atlassian:
US$500), and the individual path is written into the agreement and four help pages rather than found in forum threads.
What it shares: a support duty, the owner's identity on the shelf (and, here, displayed to EU buyers), and 30–60 days
to the first payout. What it costs: a plugin is a Kotlin/Java IntelliJ Platform build (Gradle, the platform SDK, a
sandbox IDE for tests) — a new toolchain for this operation, which is why the first item is a one-screen utility, not a
language.

- **Promote reshaped**: for the 2026-10-28 exchange — open a `jetbrains-plugins` venture queue (venture.json as `idea`,
  RESEARCH.md from this spike) whose first item is one ≤ 1-week editor utility from the §3 table's shapes (a log/ANSI
  renderer, a Javadoc/comment renderer, a diagram-from-text renderer or a theme are the proven ones), priced per user
  per month with a yearly plan, 30-day trial as the shelf allows, **if** the exchange's price check finds ≥ 3 of the §3
  rows at ≥ US$10/user/year; else park with that reading. Score as a line: evidence 1.5 (fee, payout, eligibility and
  downloads read from JetBrains' own pages and API; price from one vendor) × reach 2 (JetBrains' paid IDE base, billing
  supplied) ÷ 4 build days (new toolchain) ≈ 0.75, weight 2 — above the Atlassian macro's ≈ 1 × 2 only on the unit
  price, so the exchange ranks the two shelves together.
- **Owner actions, batched into the decision** (CLAUDE.md: identity on a service — ask first): a JetBrains Marketplace
  account, the trader declaration with ID document, residential address, phone and bank details (~30 min), and a
  Marketplace permanent token for CI's plugin upload. None raised today.
- **Kill rule for the line, if opened**: < 100 downloads or 0 paying licences 60 days after listing.
- **What the next read needs**: ~~the 14 prices (pricing tabs)~~ read 2026-10-24 (§4a: 10 of 14 at ≥ US$10/user/year,
  eight at exactly US$1/month, US$10/year personal); still open — the "For organizations" (commercial) prices behind the
  tab's toggle, whether an individual's vendor page must show a residential address (trader-status page says name,
  email, address and phone "will be displayed") and whether US$1/month is the Marketplace's minimum price.
