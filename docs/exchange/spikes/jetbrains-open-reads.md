# Spike: the JetBrains Marketplace line's three open reads and a toolchain check

Queue item `new-ventures/spike-jetbrains-open-reads` (build, 2026-11-04 17:12–18:05 UTC). Follows
`jetbrains-marketplace-paid-plugins.md` (2026-10-22, §4a prices 2026-10-24). Sources: three fetch-relay rounds
(`docs/relay/responses/jetbrains-open-reads-2026-11-04`, `…-b-2026-11-04`, `jetbrains-toolchain-hosts-2026-11-04`,
pruned after 7 days) — the Marketplace's own keyless API (`/api/plugins/{id}`, and the price endpoint the pricing tab
calls, found by reading the site's `index.js` bundle: `/api/marketplace/plugin/{id}/prices?countryCode=XX`), the help
pages (plugin monetization, pricing guidelines, licence types, paid plugins, required parameters, vendor profile,
trader status, getting paid; dates 2023-11-09 to 2026-07-30), one rendered vendor page, and twelve host checks from
a GitHub runner; plus Gradle runs in this sandbox (commands and output in §4) and JetBrains' own plugin-template
workflow read from GitHub. The W45 exchange's question (docs/exchange/2026-W45.md §3): do the three reads hold at the
price bar, is the vendor's residential address displayed, is US$1/month a floor, and can the sandbox or CI build an
IntelliJ Platform plugin at all.

## 1. Commercial ("For organizations") prices — read from the price API, not the toggle

The toggle is a client-side switch between two blocks of one JSON answer; the API returns both without a click, for
any country (`countryCode=US` → USD, `=DE` → EUR; every figure below is identical in the two currencies, so EU buyers
pay the same number in euros, VAT on top). Year-one figures; where the vendor joined the continuity discount the
second and third years are −20 % / −40 % of these, as on the personal tab.

| Plugin (downloads, §3 of the 10-22 spike) | Personal, per user | Commercial, per user | Commercial ÷ personal | Commercial ≥ US$10/user/yr |
| --- | --- | --- | --- | --- |
| ANSI Highlighter Premium (1,553,264) | US$1/mo, US$10/yr | US$1/mo, US$10/yr | 1× | yes |
| MyBatis Log (632,639) | US$5/yr | US$10/yr | 2× | yes |
| Simple Object Copy (33,460) | US$1/yr | US$1/yr | 1× | no |
| AICommit (24,632) | US$1/mo, US$10/yr | US$3/mo, US$30/yr | 3× | yes |
| VSCode Icons (22,018) | US$5/yr | US$5/yr | 1× | no |
| JavaDoc Clean Read (18,851) | US$1/mo, US$10/yr | US$10/mo, US$100/yr | 10× | yes |
| .log (16,930) | US$3.80/mo, US$38/yr | US$8.60/mo, US$86/yr | 2.3× | yes |
| Skol — Calm Semantic Themes (15,890) | US$2/mo, US$20/yr | US$20/mo, US$200/yr | 10× | yes |
| SequenceDiagram.org (15,778) | US$1/mo, US$10/yr | US$2/mo, US$20/yr | 2× | yes |
| Smart Jump (11,476) | US$5/yr | US$10/yr | 2× | yes |
| CodeMate (11,312) | US$1/mo, US$10/yr | US$1/mo, US$10/yr | 1× | yes |
| Monokai Pro Lifetime (9,613) | US$29 perpetual | US$49 perpetual | 1.7× | yes (one-off) |
| Find In Files (Favorites) (3,823) | US$1/mo, US$10/yr | US$2/mo, US$20/yr | 2× | yes |
| Combine and Copy Files to Clipboard for AI (3,349) | US$1/mo (monthly only) | US$1/mo | 1× | yes (US$12/yr) |

**Reading.** 12 of 14 charge organisations ≥ US$10 per user per year (the two below are the two cheapest personal
plans, US$1 and US$5). Nine of 14 price commercial above personal — 2× is the common multiple (five vendors), with 3×,
10× (twice) and a 1.7× one-off; five vendors left commercial equal to personal, among them the shelf's most-downloaded
small-vendor plugin (ANSI Highlighter Premium at US$10 both ways). Median commercial price across the 14: US$20/user/yr.
So the park condition "commercial prices show the US$10/user/year floor is the ceiling too" is **not met**: the
commercial tier goes to US$100–200/user/yr on two one-person plugins (JavaDoc Clean Read, Skol), and the planning
numbers for a one-screen utility are US$10/user/yr personal and US$20–30/user/yr commercial (US$8.50 and US$17–25.50 to
the vendor at 85 %). The monthly price is one tenth of the yearly on every plan that has both (JetBrains' own
subscription convention); the vendor sets one yearly figure per tier and the store derives the rest.

## 2. Is the vendor's residential address displayed? Yes — served by the keyless API and on the vendor page

- **The API.** `GET /api/plugins/{id}` (no key, no login) returns the plugin's `vendor` block with a `details`
  object — street address, city, postcode and phone — for every one of the 14 vendors, with `isTrader: true`,
  `isVerified: true` and `showEmail: true` on all 14. For the sole vendors the address is a home address at flat or
  apartment level (six of the 14 carry an apartment, unit or "Lgh" number); the figures themselves are not copied
  here, because they are personal data of third parties — the relay bodies hold them for seven days and the API serves
  them to anyone. All 14 vendors are `type: "Organization"` in the API — the vendor profile is one object whether it
  belongs to a person or a company (vendor-profile page, 30 July 2026: "Both individuals and organizations have
  dedicated vendor pages").
- **The page.** `/vendor/Nifty-Thoughts` rendered: the vendor's public name, email address, website, country, "Trader" and a "more..." link, then the plugin list. The street address and phone sit behind the "more..." expander (the
  relay makes no clicks), which is the DSA trader disclosure the trader-status page announces: "some of the information
  provided, such as your name, email, address, and phone number, will be displayed to end-users".
- **No non-display path.** Selling a paid plugin is acting "for purposes relating to his trade, business, craft or
  profession" — the page's own trader definition — so the owner would declare trader status, and a trader's address is
  what the Digital Services Act (Art. 30) makes the marketplace display. A registered-office or mail-forwarding address
  would cost £10–30 a month, above the line's £0 budget and the portfolio's < £10 launch rule.

So the park condition "the address is displayed and the owner has not said yes to that" **is met**: the owner's home
address and phone number would be public (and machine-readable) on the JetBrains vendor page, and the owner has not
been asked. STRATEGY §3 (2026-10-29) bars a request for a new identity verification unless the work it unblocks
scores ≥ 10; this line scores 1.8, so the question is not filed as an owner action (see §5).

## 3. Is US$1/month a Marketplace floor? No — nothing read names a minimum, and vendors sit below it

- The pricing-guidelines page (18 January 2024) says "There is no silver bullet in regard to setting a price for your
  plugin" and links seven strategy pages (perception, cost-plus, competitor-based, value-based, metrics, pricing as a
  constant process) — no number, no minimum. The licence-types page (9 November 2023), the required-parameters page
  (product code `P…`, `release-date`, `release-version`) and the paid-plugins page name no floor either.
- The data: Simple Object Copy charges **US$1 per year** (personal and commercial, yearly only) and MyBatis Log, VSCode
  Icons and Smart Jump US$5/yr — below US$1/month. Combine and Copy Files has a monthly plan and no yearly one. Monokai
  sells a US$29 perpetual licence with no subscription at all.
- So the eight vendors at exactly US$1/month, US$10/year chose that figure; it is a convention (JetBrains' IDE pricing
  is quoted per month with the year at 10×), not a rule. A new utility can be priced anywhere from US$1/yr up; the
  honest planning number stays US$10/yr personal because that is where comparable utilities cluster, with the commercial
  tier at 2–3× (§1).

## 4. Toolchain: can the sandbox or CI build an IntelliJ Platform plugin?

**From this sandbox — no.** JDK 21.0.12 and Gradle 8.14.3 are installed (`/usr/bin/java`, `/opt/gradle/bin/gradle`), the
JVM is wired to the egress proxy through `JAVA_TOOL_OPTIONS`, and a minimal project (Kotlin JVM plugin + IntelliJ
Platform Gradle Plugin, `intellijIdeaCommunity("2025.2")`, `defaultRepositories()`) was run three ways:

| Command (scratchpad project, `--no-daemon --console=plain`) | Result |
| --- | --- |
| `gradle dependencies --configuration intellijPlatformDependency` with plugin **2.19.0** (the current release on plugins.gradle.org) | `IntelliJ Platform Gradle Plugin requires Gradle Gradle 9.0.0 and higher` — fails at plugin application; on the first attempt the classpath download itself failed with `Received status code 429 from server: Too Many Requests` from repo.maven.apache.org (the proxy's Maven Central path is throttled) |
| `gradle wrapper --gradle-version 9.8.2`, then `curl https://services.gradle.org/distributions/gradle-9.8.2-bin.zip` | the listing page is reachable (200) but the zip is a 307 to **downloads.gradle.org**, which the egress proxy refuses (`CONNECT tunnel failed, response 403`) — Gradle 9 cannot be fetched here |
| same with plugin **2.5.0** (last line accepting Gradle 8) | the plugin applies and the classpath resolves (Maven Central and the plugin portal answer), then `intellijPlatformDependency` reports `idea:ideaIC:2025.2 FAILED` — "Configuration 'intellijPlatformDependency' has some resolution errors" — because every IntelliJ repository host is refused (below); `gradle buildPlugin` stops at the same point with the hosts named: `Could not HEAD 'https://download.jetbrains.com/idea/ideaIC-2025.2.tar.gz'. Received status code 403 from server: Forbidden` and the same 403 for `cache-redirector.jetbrains.com/www.jetbrains.com/intellij-repository/releases/idea/ideaIC/2025.2/ideaIC-2025.2.pom` (the proxy's refusal, not JetBrains') |

Host checks from the sandbox (`curl`, 20 s): plugins.gradle.org 200, services.gradle.org 200 (listing only), repo.maven.apache.org
429, **cache-redirector.jetbrains.com, download.jetbrains.com, www.jetbrains.com, plugins.jetbrains.com, downloads.gradle.org, api.adoptium.net: refused** (no
connection). The IntelliJ Platform itself (ideaIC, the platform SDK, the plugin verifier, the IDE for tests) is served
only by those JetBrains hosts, so nothing beyond the Gradle plugin's own classpath can resolve here, and a Kotlin
plugin cannot be compiled or tested in the sandbox.

**From a GitHub runner — yes, every host answers.** Relay round `jetbrains-toolchain-hosts-2026-11-04` (12 lines, 200
each): `downloads.gradle.org/distributions/gradle-9.8.2-bin.zip` (HEAD 200, served from GitHub release assets),
`cache-redirector.jetbrains.com/intellij-repository/releases/…/ideaIC/maven-metadata.xml` (200, latest `2026.2.4`,
updated 2026-10-30) and the same path on `www.jetbrains.com` (the cache redirector switched off), `download.jetbrains.com/idea/ideaIC-2025.2.4.tar.gz` (HEAD 200),
the plugin verifier's Maven metadata on `cache-redirector…/packages.jetbrains.team` and on `packages.jetbrains.team`
directly (200, verifier-cli `1.411`), `www.jetbrains.com/updates/updates.xml` (the verifier's IDE list, 206 on a range),
and the Gradle plugin's metadata on plugins.gradle.org. JetBrains' own `intellij-platform-plugin-template` workflow
(`.github/workflows/build.yml`, read from GitHub) runs `./gradlew buildPlugin`, `./gradlew check` (unit tests on the
platform test framework, headless) and `./gradlew verifyPlugin` (the Plugin Verifier CLI, headless) as plain steps on
`ubuntu-latest` with `actions/setup-java@v6` (Zulu 21); only its separate, manually triggered UI-test workflow starts an
IDE, under Xvfb on Linux. The repo is public (owner 2026-11-02, action 036), so runner minutes are not billed.

**Verdict.** The line is buildable **only as a CI-compiled loop**: the routine writes Kotlin it cannot compile, pushes,
and reads the compiler, test and verifier results from a workflow run — one round-trip (install + Gradle cold start +
IDE download ≈ 6–10 min) per compile error, versus the seconds every other venture gets from `npm run check`. That is
workable for a plugin of a few hundred lines with a tight loop, and it is what rules out anything larger.

**What the smallest ≤ 1-week utility needs** (from the §3 shapes of the 10-22 spike): Gradle 9 + JDK 21 project from
the template; `plugin.xml` with `<product-descriptor code="P…" release-date release-version>` (required-parameters page)
and the Marketplace licence-verification calls in code (prepare-for-publication page lists both as required steps, and
recommends obfuscation); a vendor profile with trader declaration, ID document, address, phone and bank details (the
owner, ~30 min, §2); a Marketplace permanent token for `publishPlugin` from CI; a listing with screenshots. Shapes by
build size: a **theme** is `plugin.xml` + a `.theme.json` + an editor colour scheme — no Kotlin, no IDE in the build,
the cheapest first item and sold at US$20–29 by Skol and Monokai, but the two paid-theme vendors read here are 14- and
1-listing design shops and a new theme has no evidence beyond theirs; an **ANSI / log renderer** is an editor
highlighter (a lexer + a `TextAttributes` layer, 300–600 lines) behind a 1.55 M-download incumbent at US$10; a
**comment renderer** competes with the IDE's own reader mode; **diagram-from-text** is a tool-window with a JS renderer
in JCEF (the SequenceDiagram.org shape, US$10/20). Build days: 4 for the renderer shapes (toolchain, licence check,
listing), 1.5 for a theme.

## 5. Call: PARK — two of the three park conditions hold

- **Price: clear.** Commercial prices are 2–10× personal on nine of 14 and ≥ US$10/user/yr on twelve; the US$10 floor
  is not a ceiling and is not a floor (§1, §3).
- **Address: park.** A paid-plugin vendor is a trader and the Marketplace serves a trader's street address and phone
  from a keyless API and behind "more..." on the vendor page (§2). The owner has not said yes to that, and at 1.8 the
  line is below STRATEGY §3's ≥ 10 bar for asking the owner for a new identity verification (ID document + public home
  address), so no owner action is filed.
- **Toolchain: park-leaning.** CI can build (every host answers from a runner, JetBrains' template builds, tests and
  verifies headless on `ubuntu-latest`), but the sandbox cannot run Gradle 9, reach the IntelliJ repository or
  compile Kotlin, so the build is a blind, 6–10-minute-per-error CI loop (§4) — not the "cannot build from CI" park
  condition, but a cost the 4-day estimate did not include.

**Re-open triggers** (recorded on the parked exchange entry): (a) the owner writes, unprompted, that a public home
address and phone on a JetBrains vendor page is acceptable — then the exchange opens `jetbrains-plugins` with a theme
(1.5 days) as the first item and the renderer as the second, budgeted as a CI-compiled loop; or (b) the owner obtains
a non-residential trading address for another reason; or (c) a sandbox image with Gradle 9 and the JetBrains hosts
allowed (the line's build cost then falls to the 4 days the W45 exchange assumed). Atlassian (1.7) and Framer (1.4),
parked behind this spike, are re-ranked by the next exchange on the same starvation reading; Framer bills through our
own Stripe checkout and shows no address, so it goes first of the three if the reading holds.
