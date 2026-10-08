# V1 research — Figma plugin (discovery, task 10)

Status: **validated 2026-09-18** — gate (a)–(e) met; see §5 for the rival-gap evidence.
Date: 2026-09-17/18. Method: Figma's internal community search endpoint
(`/api/search/resources`, `price_type=paid`) queried with ~235 keywords → 5,038 plugins,
of which 167 sell through Figma checkout (purchase counts are public in
`monetized_resource_metadata`) and 261 monetise externally. Raw subset:
`research/figma-monetised-plugins-2026-09-17.csv`. Growth checks via fig-stats.com.

## 1. Market shape (Figma-checkout plugins, ~22 months of sales since Nov 2024)

- 167 paid plugins; estimated total gross **$662,630** (price × purchases; subscriptions
  counted once, so recurring revenue is understated).
- Brutal power law: the top 2 (Autoflow, html.to.design) are 69% of the total.
  **Median paid plugin: 16 purchases.** Distribution by purchases — 1–9: 74, 10–49: 42, 50–199: 31, 200–999: 13, 1,000+: 7.
- Price points that sell: $2–5 for impulse utilities (low totals), **$10–39 one-time for
  workflow tools** (all the big earners except html.to.design). Subscriptions: 68 of 167.
- Free→paid conversion among the top sellers: 0.3%–2.5%; best rates are in
  design-system/variables tools (1.7–2.9%), worst in visual gimmicks.
- Growth (fig-stats, week to 16 Sep 2026): Autoflow +180 users/day at rank 17;
  Styles & Variables Organizer +40 users/day at rank 217.

### Top 20 by estimated gross

| # | Plugin | Price | Model | Purchases | Est. gross | Users | Conv. |
|---|---|---|---|---|---|---|---|
| 1 | Autoflow | $39 | one-time | 6,721 | $262,119 | 1,071,985 | 0.6% |
| 2 | html.to.design — by ‹div›RIOTS — Import we | $18 | sub | 10,861 | $195,498 | 2,632,643 | 0.4% |
| 3 | Styles & Variables Organizer | $15 | one-time | 2,333 | $34,995 | 139,567 | 1.7% |
| 4 | Print for Figma | CMYK, Bleed, Crop Marks, | $12 | sub | 2,183 | $26,196 | 267,191 | 0.8% |
| 5 | Noise | $5 | one-time | 3,481 | $17,405 | 711,009 | 0.5% |
| 6 | Draw Connector | $39 | one-time | 397 | $15,483 | 128,985 | 0.3% |
| 7 | Simpleflow — FigJam Connectors everywhere | $10 | one-time | 1,370 | $13,700 | 112,173 | 1.2% |
| 8 | Figma to Tailwind CSS Converter, Code Gene | $49 | one-time | 171 | $8,379 | 16,898 | 1.0% |
| 9 | GIF Export | $10 | one-time | 741 | $7,410 | 315,390 | 0.2% |
| 10 | JSON to Figma | $17 | one-time | 364 | $6,188 | 90,981 | 0.4% |
| 11 | Specs Classic | $8 | sub | 674 | $5,392 | 139,100 | 0.5% |
| 12 | Propstar | $7 | one-time | 719 | $5,033 | 59,731 | 1.2% |
| 13 | Color Overlay | $10 | one-time | 481 | $4,810 | 213,325 | 0.2% |
| 14 | Photos | $25 | one-time | 179 | $4,475 | 287,529 | 0.1% |
| 15 | OlivePress - Image Compression and Export  | $95 | one-time | 35 | $3,325 | 29,299 | 0.1% |
| 16 | Variable Utilities | $17 | one-time | 181 | $3,077 | 9,193 | 2.0% |
| 17 | ARC - Bend your type! | $2 | sub | 1,526 | $3,052 | 1,105,094 | 0.1% |
| 18 | Variants Randomizer | $27 | one-time | 111 | $2,997 | 11,239 | 1.0% |
| 19 | Figmap - Map maker | $9 | one-time | 329 | $2,961 | 260,566 | 0.1% |
| 20 | Pixel Fine Converter — Import Adobe XD to  | $29 | one-time | 96 | $2,784 | 3,298 | 2.9% |

## 2. Candidate niches

### A. Flow arrows / connectors in Figma Design
- Demand: Autoflow 1.07M users, $39, 6,721 purchases (~$262k). Draw Connector $39 × 397,
  Simpleflow $10 × 1,370, My Connector $9 × 82. Free rivals: Arrow Connector 219k users,
  ProToFlow 82k, Give Me FigJam Connectors 45k.
- Crowding: since Autoflow went paid, ~10 clones appeared in 2025–26 (Flow Arrow, Linx
  "Autoflow-like", Flowlight, Smart Arrow Connector, FigArrow, AUTO FLOW, Free Flow).
- Platform risk: FigJam has native connectors; Figma Design does not (yet). Config 2026
  added "generative plugins" (prompt-to-plugin) which commoditises simple utilities.
- Build: arrow routing + keeping arrows attached on move (documentchange events) — a
  focused MVP fits in a week; matching Autoflow's polish does not.

### B. Variables / design-token tooling
- Demand: 2,348 plugins match "variables". Styles & Variables Organizer $15 × 2,333
  (139k users, 1.7%); Variable Utilities $17 × 181 (2.0%); Variables Doc Designer
  $29 × 78 (2.5%). Design System Organizer (external, 205k users), Tokens Studio
  (external, 367k). Free: Export/Import Variables 90k, Styles to Variables 89k,
  Variables Pro 81k, six+ "rename variables" plugins.
- Structural tailwind: Figma's Variables REST API is Enterprise-only, so plugins are the
  only route for everyone else.
- Crowding: heavy on export/import/rename (mostly free). Sub-niches with weak coverage:
  unused-variable cleanup (top plugin 4.6k users), variables diff/compare across files,
  styles→variables for typography/effects (existing tool is colour-only).

### C. Component documentation / spec generation
- Demand: Specs Classic $8/mo × 674 (139k users); Propstar $7 × 719 (60k users);
  Automatic Style Guides (free, 102k). Buyers are design-system teams — professional
  budgets.
- Documented gaps (from 154 user comments already pulled): Specs — variable/mode
  detection broken after updates, hangs on large components, subscription/restore bugs,
  no "slots" support; Propstar — combination limits, crashes on 170+ variants, no
  variable-based styling, slots unsupported. Both publishers respond slowly.
- **But:** Specs Classic is deprecated in favour of *Specs 2* (EightShapes/DirectedEdges,
  actively maintained, recently added variables + Tokens Studio detection, free core +
  Pro), and Obra Autodocs is a free alternative with Propstar migration. The gaps above
  are largely gaps in the *old* product. Incumbent is strong → niche C fails gate (c).

### Platform-risk note (all niches)
Config 2026 (June) shipped *generative plugins*: any user on any plan can prompt the Figma
agent to build a plugin and publish it to the Community. Simple single-function utilities
(rename, export, convert) are now commoditised. A paid plugin must be something a prompt
won't produce: stateful, UI-rich, robust on large files, maintained.

## 3. Decision (2026-09-18): niche B — **Variables Toolkit**

| Gate | A: flow arrows | B: variables tooling | C: component specs |
|---|---|---|---|
| (a) buyers with money | designers — yes | design-system teams — yes | DS teams — yes |
| (b) recurring job | yes | yes | yes |
| (c) paid rival with documented gap | Autoflow paid; gaps **unknown** (blocked) | S&V Organizer paid; gaps **unknown** (blocked); free leader in "styles to variables" is colour-only (documented) | gaps documented but only in the deprecated product; Specs 2 is strong |
| (d) ≤ 1 week build | MVP yes, parity no | yes | no |
| (e) policy/ToS risk | none | none | none |
| Platform risk | **high** — native connectors in Design is a top feature request | moderate — Figma iterates on variables; Enterprise-only REST API is a tailwind | moderate |
| Newcomer growth evidence | best 2025–26 entrant 22k users (free) | best 2026 entrant <2k; 2025 entrant Kigen 37k | — |
| Conversion (paid leaders) | 0.3–1.2% | 1.7–2.9% | 1.2% (sub) |

Why B over A: twice the conversion, a smaller leader to rank beside (rank 217 vs 17), a
structural reason plugins persist, and no headline native-feature threat. A has 10× the
audience but I would be the ~12th clone competing on polish against a 1M-user incumbent.

**Product:** *Variables Toolkit — Styles to Variables, Link & Clean Up.* Three jobs, one
plugin: (1) link hard-coded fills/strokes to the local variable with the same value —
the job S&V Organizer proves people pay $15 for; (2) convert styles → variables for
colour, typography, effects and number tokens, with modes — the leading free tool does
colour only; (3) hygiene: unused, duplicate-valued and broken variable references.
Free: up to 25 links per run, colour-only conversion. Paid: unlimited, all types, hygiene
report. **$12 one-time** via Figma checkout (below the $15 leader, above impulse tier).

**Expected value, honestly:** a newcomer in this niche reaching 5–20k users in a year at
1.5–2.5% conversion × $12 ≈ $900–$6,000 gross, minus Figma's 15%. Typical outcome is the
low end. It is a portfolio shot, not a business on its own; the point is to learn what
ranks and convert that into V2/V3.

**Validated 2026-09-18** on the S&V Organizer comment evidence in §5. Figma checkout
needs nothing beyond the Stripe payout setup the owner completed.

## 4. Build notes
- Workspace: `ventures/variables-toolkit/` (renamed from `v1`). esbuild bundles
  `src/code.ts` (main thread) and inlines `src/ui/*` into `dist/ui.html`.
- Deps added: `esbuild`, `@figma/plugin-typings` (dev). No runtime deps.
- Core logic (`src/core/`) is pure and unit-tested; Figma API touches only in `code.ts`.
- Manifest: `documentAccess: dynamic-page`, `networkAccess: none`, `permissions: payments`.

## 5. Rival-gap evidence (Styles & Variables Organizer, 57 user comments, 2024-08 → 2026-05)

Raw: `research/rival-comments-2026-09-18.json`. Themes, with counts of distinct commenters:

| Theme | n | Representative quotes |
|---|---|---|
| **Performance / hangs** | 9 | "button reads scanning… forever"; "waiting 15 minutes, the file is small"; "several minutes to scan one frame with three objects"; "getting slower" |
| **Breaks on page content** | 3 | "if you have any FigJam connector on your page it does not work"; "scanning numbers doesn't work when a page has widgets" |
| **Scope control** | 5 | "Scan Page has too many elements — add Scan Selected" (added 2025-03); "option to not include component instances" (added 2026-05); "skips hidden layers" (added 2026-05) |
| **Number / spacing variables** | 4 | "Number Variables doesn't work"; "Auto spacing mistaken with other values"; "icon sizes not mapped"; merge logic "frustrating" (rem/1 = 16) |
| **Buying / licensing confusion** | 7 | "is it monthly or yearly?"; "team admin — available to all members?"; "can't transfer to partner's account"; India/China cards not accepted by Figma checkout |
| **Feature asks** | 3 | rename variables in place; resizable window; act on results after scan |
| **Praise (job is worth paying for)** | 8 | "solved 3 days work in 30 mins"; "use it every day… happy to pay"; "used across 3 companies"; "lifesaver for a large design system" |

Autoflow (51 comments) shows the same failure modes in niche A — "major lag", "mass deleting
my arrows", broken by Figma's *slots* update, purchase-restore confusion — confirming that
robustness and support responsiveness are where paid plugins lose users.

### What this changes in the product
1. **Robustness first**: chunked scanning with a progress bar and a cancel button; never a
   single blocking pass. Skip widgets/connectors/FigJam nodes explicitly. Scope = selection
   or page, with "include hidden layers" and "skip component instances" switches from v1.
2. **Number variables**: link padding, gap, corner radius and (opt-in) width/height to FLOAT
   variables, with sensible exclusions ("Auto" spacing, hug/fill sizes).
3. **Listing clarity**: "$12 one-time, per Figma account" spelled out; refund policy linked.

### More rivals (comments harvested later on 2026-09-18)
- **Variable Utilities** ($17 × 181): "no longer works with Figma's recent updates", copy/paste
  variables "always spinning", clientStorage errors; asks: move variables between
  collections, **re-connect broken links to library variables with the same name**.
- **Design System Organizer** (external licence, 205k users): swap broken by *slots*; "Mark as
  swap target no longer works"; no feedback on what was swapped; **licence server down**
  ("SERVER CONNECTION ERROR", suspended page), licence emails lost for a month.
- **Export/Import Variables** (free, 90k): import fails at ~2,800 variables; alias references
  detached ("useless w/o references"); wants hex output and multi-collection export.

Takeaways added to the plan: (1) keep following Figma API changes fast — every rival lost
users to breakage after updates (slots, storage); (2) V1.1 candidate feature with clear
demand: **relink local/broken variables to library variables by name**; (3) V1 uses Figma's
own checkout — the external-licence failures above are a real reason buyers prefer it; V2's
keys are offline-verifiable for the same reason.

### Free rivals closest to "styles → variables" (comments, 2026-09-18)
- **Styles to Variables** (89k): "Light and Dark styles … after binding, all the same" —
  users expect `Light/Primary` + `Dark/Primary` styles to become **one variable with two
  modes**; spaces in style names break binding; no way to convert a subset; no success
  notification; "doesn't work" reports through 2024.
- **Variables Pro** (81k): copied variables "not attached"; aliases to local variables lost on
  import; "limited to 4 modes"; 15-minute imports; wants collection overwrite/swap.

Backlog for V1 (added as subtasks of task 11): (1) mode pairing — detect a common prefix
segment set (Light/Dark, Default/…) across styles and create modes instead of duplicate
variables; (2) pick a subset of styles to convert; (3) toast with counts after every action.

## 6. Metrics

| Date | Event | Users | Likes | Purchases | Notes |
|---|---|---|---|---|---|
| 2026-09-18 | Submitted to Figma Community review | — | — | — | release build; $12 one-time |
| 2026-09-19 | Daily check | — | — | — | not live yet |
| 2026-09-18 | Rejected by Figma review — crash on launch (unguarded window.onmessage) | — | — | — | fixed 2026-09-19 as v0.1.1; awaiting owner resubmit |
| 2026-09-20 | Daily check | — | — | — | not live yet |
| 2026-09-21 | Daily check | — | — | — | not live yet |
| 2026-09-22 | Daily check | — | — | — | STORE.md says not live, but docs/ALERTS.md (2026-09-21 handoff) reports Figma approved this plugin 20:29 UTC — status unconfirmed, fetch blocked by network policy; STORE.md/venture.json not yet updated |
| 2026-09-21 | **Approved by Figma review — listing live** | — | — | — | approval email 20:29 UTC (v0.1.1); listing https://www.figma.com/community/plugin/1682711656065145288 |
| 2026-09-22 | Status confirmed | — | — | — | approval verified against the Figma notification email; `venture.json` → `launched`, STORE.md → live, landing card links the listing. Figma stats not readable from the build container (figma.com egress blocked); the 07:00 metrics routine takes over from here |
| 2026-09-23 | Daily check | — | — | — | fetch failed: egress blocked by network policy (figma.com, fig-stats.com) |
| 2026-09-24 | Daily check | — | — | — | fetch failed: egress blocked by network policy (figma.com, fig-stats.com) |
| 2026-09-25 | Daily check | 0 | 0 | — | via relay: install_count 0, like_count 0, view_count 2, comment_count 0; no new comments; fig-stats.com fetch failed: 404 |
| 2026-09-26 | Daily check | 0 | 0 | — | via relay: install_count 0, like_count 0, view_count 2, comment_count 0; no new comments; fig-stats.com fetch failed: 404 |
| 2026-09-27 | Daily check | 0 | 0 | — | via relay: install_count 0, like_count 0, view_count 2, comment_count 0; no new comments; fig-stats.com fetch failed: 404 |
| 2026-09-28 | Daily check | 0 | 0 | — | via relay: install_count 0, like_count 0, view_count 2, comment_count 0; no new comments; fig-stats.com fetch failed: 404 |
| 2026-09-29 | Daily check | 0 | 0 | — | via relay: install_count 0, like_count 0, view_count 2, comment_count 0; no new comments; fig-stats.com fetch failed: 404. Listing title/description now read as the v2 rewrite ("Styles to Variables, Link & Clean Up Unused Variables — Variables Toolkit") — owner appears to have republished from the Figma desktop app |
| 2026-09-30 | Daily check | 0 | 0 | — | via relay: install_count 0, like_count 0, view_count 2, comment_count 0, unique_run_count 1, purchase_count 0; no new comments; fig-stats.com fetch failed: 404. Listing still reads as the v2 rewrite (current version 281046, created 2026-09-28) |
| 2026-10-01 | Daily check | 0 | 0 | 0 | via store-metrics CI: figma: install_count 0, like_count 0, view_count 2, unique_run_count 1, comment_count 0, purchase_count 0, version 281046 (2026-09-28) |
| 2026-10-01 | Comments checked (07:00 metrics routine) | — | — | — | no new comments (relay fetch of comments API: empty list) |
| 2026-10-02 | Daily check | 0 | 0 | 0 | via store-metrics CI: figma: install_count 0, like_count 0, view_count 3, unique_run_count 1, comment_count 0, purchase_count 0, version 281046 (2026-09-28); rank: styles to variables 78/1235, link to variables 13/163, unused variables 1/48, variables toolkit 8/45 |
| 2026-10-02 | Comments checked (07:00 metrics routine) | — | — | — | no new comments (relay fetch of comments API: empty list) |
| 2026-10-03 | Daily check | 0 | 0 | 0 | via store-metrics CI: figma: install_count 0, like_count 0, view_count 4, unique_run_count 1, comment_count 0, purchase_count 0, version 281046 (2026-09-28); rank: styles to variables 78/1239, link to variables 12/165, unused variables 1/48, variables toolkit 8/45 |
| 2026-10-03 | Comments checked (07:00 metrics routine) | — | — | — | no new comments (relay fetch of comments API: empty list) |
| 2026-10-04 | Daily check | 0 | 0 | 0 | via store-metrics CI: figma: install_count 0, like_count 0, view_count 4, unique_run_count 1, comment_count 0, purchase_count 0, version 281046 (2026-09-28); rank: styles to variables 78/1242, link to variables 13/165, unused variables 1/48, variables toolkit 8/45 |
| 2026-10-04 | Comments checked (07:00 metrics routine) | — | — | — | no new comments (relay fetch of comments API: empty list) |
| 2026-10-05 | Daily check | 0 | 0 | 0 | via store-metrics CI: figma: install_count 0, like_count 0, view_count 6, unique_run_count 3, comment_count 0, purchase_count 0, version 281046 (2026-09-28); rank: styles to variables 68/1239, link to variables 10/164, unused variables 1/48, variables toolkit 8/45 |
| 2026-10-05 | Comments checked (07:00 metrics routine) | — | — | — | no new comments (relay fetch of comments API: empty list) |
| 2026-10-06 | Daily check | 0 | 0 | 0 | via store-metrics CI: figma: install_count 0, like_count 0, view_count 7, unique_run_count 3, comment_count 0, purchase_count 0, version 281046 (2026-09-28); rank: styles to variables 69/1247, link to variables 10/164, unused variables 1/48, variables toolkit 8/45, relink variables absent/19, swap variables >100/121, library variables >100/390 |
| 2026-10-06 | Comments checked (07:00 metrics routine) | — | — | — | no new comments (relay fetch of comments API: empty list) |
| 2026-10-07 | Daily check | 0 | 0 | 0 | via store-metrics CI: figma: install_count 0, like_count 0, view_count 7, unique_run_count 3, comment_count 0, purchase_count 0, version 281046 (2026-09-28); rank: styles to variables 68/1257, link to variables 10/167, unused variables 1/49, variables toolkit 8/45, relink variables absent/20, swap variables >100/124, library variables >100/393; search: n/a (no SEARCH_CONSOLE_KEY secret; owner action 020) |
| 2026-10-07 | Comments checked (07:00 metrics routine) | — | — | — | no new comments (relay fetch of comments API: empty list) |
| 2026-10-08 | Daily check | 0 | 0 | 0 | via store-metrics CI: figma: install_count 0, like_count 0, view_count 7, unique_run_count 3, comment_count 0, purchase_count 0, version 281046 (2026-09-28); rank: styles to variables 68/1265, link to variables 10/169, unused variables 1/49, variables toolkit 8/46, relink variables absent/20, swap variables >100/124, library variables >100/395; search: n/a (no SEARCH_CONSOLE_KEY secret; owner action 020) |
| 2026-10-08 | Comments checked (07:00 metrics routine) | — | — | — | no new comments (relay fetch of comments API: empty list) |

## 7. Post-launch measurement (day 1 / 7 / 30)

Live since **2026-09-21**. The 07:00 daily metrics routine reads `STORE.md` and records users,
likes and purchases in §6 above; these are the dates that matter for the decision:

| Checkpoint | Date | What we read | What it would mean |
| --- | --- | --- | --- |
| Day 1 | 2026-09-22 | listing reachable, install count starts moving | listing is discoverable at all |
| Day 7 | 2026-09-28 | **read: 0 installs (the 1 "user" is our own test run), 0 likes, 0 purchases, 2 views, 0 comments** | no install→purchase read is possible: nobody reaches the page. §8 shows why (search rank) and what changes |
| Day 30 | 2026-10-21 | users, likes, purchases | scored against the §1 benchmark |

Benchmark from §1 (measured across 167 Figma-checkout plugins): the **median paid plugin has 16
purchases lifetime**, and design-system/variables tools convert free→paid at **1.7–2.9%** — the
best band in the market. At $12 with Figma's 15% fee, each sale nets ≈$10.20 (≈£7.55 at ~1.35).

Decision rule (STRATEGY.md §7 kill criteria): zero sales **and** zero organic signal (installs,
likes, comments) by **2026-12-20** (90 days live) → kill and keep the code. A day-30 read of
installs with no purchases is a pricing/description problem, not a kill — fix the listing first.

## 8. Day-7 review (2026-09-28): the listing is not findable — relist under the searched terms

Read on day 7 through the relay (`docs/relay/responses/vt-day7/`, Figma's own search API,
`figma.com/api/search/resources?query=<term>&resource_type=plugin&sort=relevancy`, the endpoint
the Community search box calls):

| Buyer query | Hits | Our rank | #1 result (users) | Newest rival with traction |
| --- | --- | --- | --- | --- |
| variables toolkit (our own name) | 45 | **8** | Variables Toolkit: Find, Swap and Bind Variables (2,784) | — |
| styles to variables | 1,222 | **79** | Styles & Variables Organizer, $15 (139,949) | Convert Variables to Styles, 2026-04 (56) |
| convert styles to variables | 160 | absent from top 100 | Styles to Variables Converter (37,360) | — |
| link variables | 160 | **14** | Generating variables & Linking styles (3,358) | Easy Sync — Auto-Link Variables & Styles, 2026-04 (69) |
| unused variables | 48 | **41** of 48 | Variables Cleaner (1,181) | Unused Token Finder, 2026-07 (41) |
| variables | 2,377 | absent from top 100 | variables2json (14,720) | Token Toolkit Pro, 2026-09-08 (16 users in 20 days) |
| design tokens | 1,588 | absent from top 100 | Design Tokens (65,454) | TokenOps, 2025-12 (483) |

What the numbers say:

1. **Two page views in seven days is a search problem, not a conversion problem.** Plugins
   published in the same niche this year pick up tens of users in their first weeks from search
   alone (Token Toolkit Pro: 16 users in 20 days; Unused Token Finder: 41; Easy Sync: 69). Ours has
   one "user" and one unique run — the owner's own approval test. Zero organic reach.
2. **The name collides.** "Variables Toolkit: Find, Swap and Bind Variables" (2,784 users, since
   2024-11) owns the query "variables toolkit"; six more "Variable(s) Toolkit" plugins sit between
   it and us. A brand with no users cannot win its own name back, and the brand is worth nothing
   yet (the plugin is 7 days old), so it moves to the end of the name.
3. **Figma's search weights the name far above the description.** Every top-8 result for every
   query carries the query words in its *name*; our rank tracks where the words appear — "link"
   (in the tagline) ranks 14, "unused" (once, deep in the description) ranks 41, "convert" (absent
   from name and tagline) is nowhere. The name must lead with the three phrases buyers type:
   *styles to variables*, *link variables*, *unused variables*.
4. **The description shows raw markdown.** The live description contains literal `**Link**`,
   `**Styles → Variables**` … — the asterisks were pasted into Figma's rich-text editor, which does
   not parse markdown, so every heading renders with stars around it. Cheap to fix on republish.
5. **Category is right.** `file-organization` under Design tools is the category of the #1 result
   (Styles & Variables Organizer); no change.

Decision (owner-delegated, logged in STRATEGY.md §8): **relist v2** — name, tagline, tags and
description rewritten in `LISTING.md` against the terms above; `manifest.json` carries the new
name so the next release import publishes it. Republishing is a Figma-desktop action for the
owner (ALERTS 2026-09-28 owner line, ~15 minutes). No product change: nothing in the plugin is
implicated by the data. The venture, package and UI keep the name Variables Toolkit.

Proof (queue `relist-v2` → `day-30-review`, 2026-10-21): ≥ 100 views, ≥ 10 installs, and a rank
≤ 20 for "styles to variables" or ≤ 5 for "unused variables". The day-30 rank check is the same
relay request (`docs/relay/requests/vt-day7.txt` in the git history — copy it as
`vt-day30.txt`). If the republished listing is still under 20 views at day 30, the channel is
the problem and the next lever is the Figma-file *playground* + a Community *file* resource that
links the plugin (free resources are indexed and shown far more often than paid plugins).

## 9. Research run (2026-10-01, day 10, three days after the v2 relisting): the shelf cannot be ranked into

Why this run: every venture queue had only blocked or dated items left, so the build slot was
starved; the pipeline now sends such a slot to research (`docs/pipeline/README.md`, starvation),
and this queue was first (oldest `updated`). Read through the relay
(`docs/relay/responses/build-2026-10-01/`: Figma's versions API, the search API for five queries,
the comments API).

**The relist is live** — version 281046, created 2026-09-28 21:06 UTC, name "Styles to Variables,
Link & Clean Up Unused Variables — Variables Toolkit" (queue item `relist-v2` is done, not blocked).
Three days later: install_count 0, view_count 2 (unchanged since day 1), unique_run_count 1 (our
own), 0 likes, 0 comments, 0 purchases.

| Buyer query | Hits | Rank day 7 (v1 name) | Rank day 10 (v2 name) | #1 result (users) |
| --- | --- | --- | --- | --- |
| unused variables | 48 | 41 | **1** | ours (1 user), then Variables Cleaner (1,189) |
| link to variables | 163 | 14 | 13 | Link spacing variables (4,369) |
| variables toolkit | 45 | 8 | 8 | Variables Toolkit: Find, Swap and Bind (2,790) |
| styles to variables | 1,234 | 79 | 75 | Styles & Variables Organizer, $15 × 2,341 (140,117) |
| variables | 2,394 | absent | absent | variables2css (28,854) |

What it says:

1. **Name matching only moves uncrowded queries.** The new name took #1 for "unused variables"
   (48 hits) instantly, and nothing else: the queries with buyers in them ("styles to variables",
   "variables") rank by user count, and every result above us has thousands of users. A one-user
   listing cannot climb them by wording; §8's "≤ 20 for styles to variables" proof is unreachable
   from inside the search box.
2. **The #1 slot brought no views.** Two views in ten days, zero since the relist. The 48-hit query
   is too small to matter (its leaders have 1–2.5k users after 1–2 years), so being first there is
   not a channel.
3. **Newcomers that grew did so with free listings.** Of the 2026 entrants in these result sets,
   the ones with users are free (Style Teleport 90, Easy Sync 69, Unused Token Finder 43, Variable
   Mapper and Linker 41, Token Toolkit Pro 18); the paid 2026 entrants sit at 2–20 users and 0–1
   purchases (My Linter $9 × 0, Varlint $5 × 0, Design System Auditor $2 × 0, Rebind $5 × 0). Figma
   shows paid plugins less, and a paid newcomer gets no trial installs to seed its rank.
4. **The product is not implicated.** No comment, no run beyond our own, no bug; nothing in the
   plugin can be read from zero traffic. Features (relink by name, mode pairing — §5 backlog) stay
   behind distribution per STRATEGY §5.

Decision: the next levers are **off the Figma search box** — a Google-facing page on
apps.gankdat.com (Search Console already indexes that host; the extensions got the same page),
a free Community *file* (playground) that links the plugin (free resources are indexed and shown
far more than paid plugins), and a free single-job companion listing in the one query we can own
("unused variables") that funnels to the paid toolkit. Rank measurement moves into the 06:45
`store metrics` CI job so the day-30 review (2026-10-21) reads it without a relay round. **Built
2026-10-01 (17:00 build):** `scripts/store-metrics.ts` reads the four queries from STORE.md (`Search rank queries`)
and appends `rank: <query> <position>/<hits>` to every Daily check row from 2026-10-02 on; the day-10
bodies replayed through it give exactly the table above (75/1234, 13/163, 1/48, 8/45). Five
scored items in `docs/pipeline/queues/variables-toolkit.json`. Kill date unchanged: 2026-12-20
with zero sales and zero organic signal (STRATEGY §7).

### 2026-10-02 (build) — `figma-styles-to-variables-page` built
`https://apps.gankdat.com/figma-styles-to-variables.html` is the Google-facing page for "figma styles to
variables" / "figma unused variables" / "link variables figma": the first lever off the Figma search box
(§9, decision). Nine-row table against Styles & Variables Organizer ($15, ~140k users, >2,000 purchases),
Styles to Variables (free, colour-only) and Variables Pro (free, swap/import/export); every rival cell is
a §5 comment theme or a listing fact, "not shown on the listing" where unverified; the four mode-pairing,
subset, toast and text-style asks from the free converter's thread are each answered by a shipped feature.
$12 once stated, refund policy linked, two install buttons to the listing, mode-pairing claim checked
against `core/convert.ts` (on by default). Linked from the landing card and the listing's Support block
(`LISTING.md`; the live copy picks it up on the next republish — not worth an owner republish on its own).
Measurement: Search Console impressions and clicks for the page, read at the day-30 review (2026-10-21)
and the proof date (2026-10-31: ≥ 20 impressions, ≥ 1 click; Daily check views off 2).

### 2026-10-02 (build, 17:00) — `community-playground-file` built, waits on one owner click
The second lever off the search box (§9, decision): a free Community *file* that needs the plugin to
be useful. Rationale restated with the day-10 numbers: every 2026 entrant with users is free; files
publish instantly with no review and are duplicated and surfaced far more than paid plugins; a
practice file reaches the designers who have the job, at the moment they have it. Built as data plus
a renderer rather than a hand-made file: `src/core/playground.ts` holds the tokens, styles, sample
card, page copy and cover; `src/figma/playground.ts` builds the five pages in Figma from the dev
build's new menu command "Build Community playground file"; ten unit tests keep the copy honest
(the Before card's values match the tokens bar the deliberate magenta; the Light/Dark styles pair
through the converter's own `pairModes`; the clean-up page names exactly the three unused tokens and
the one duplicate; free tier, $12 and the refund are stated on the start page). Publishing is the
only step a sandbox cannot do — ALERTS 2026-10-02 owner line, action 017, ~10 minutes. Listing copy,
tags and category in `PLAYGROUND.md`. Measurement: listing `view_count` on the Daily check row (≥ 20
within 14 days of the file going live); the file's own views join `store-metrics.ts` once its URL is
known (queue item `playground-file-views`, blocked on the URL).

## Free companion listing (2026-10-04, burn-down)

Built `free-unused-variables-finder` (§9 point 3): a free plugin "Unused Variables Finder & Cleaner" from the same
`src/core/hygiene.ts` + `src/figma/hygiene.ts`, with delete, no payments permission, no network — the one job behind
the one query we already own ("unused variables": rank 1/48 on 10-02..10-04, 0 installs; the leaders there — Variables
Cleaner 1,189, Variables Lint 2,090, Usage Counter 2,499 users — are all free). Its result screen names only what the paid
toolkit would add for *this* file (duplicate-value groups, broken aliases it counted but does not list) and links to the
toolkit listing (`src/core/free.ts`, tested). Entry `src/free/`, manifest `manifest.free.json`, build `npm run build:free`
→ `dist-free/`. Copy: `LISTING-FREE.md`; owner publishes (action 018). Proof: ≥ 50 installs of the free plugin and ≥ 5
views of the paid listing attributed within 30 days of publishing; read by the daily store-metrics row once the id is known.

## Relink to library variables (2026-10-04, burn-down)

Built `relink-library-variables`, the V1.1 candidate from §5 "More rivals": Variable Utilities ($17 × 181) users ask to
re-connect broken links to library variables with the same name, Design System Organizer's swap broke with slots, and Token
Toolkit Pro put "Relink" in its name (18 users in three weeks). Model in `src/core/relink.ts` (7 tests): a binding is
*current* when its variable's publish key is still among the enabled libraries' variables (so a library file never relinks
to itself), *local* when the variable is not remote, *stale* when it is remote but its key is no longer published; local and
stale bindings move onto the library variable with the same trimmed name **and** resolved type, one library only — the same
name in two libraries is listed as ambiguous until a collection is picked (a `<select>` appears when more than one is
enabled). Figma side `src/figma/relink.ts`: `figma.teamLibrary` for the catalogue (new `teamlibrary` permission),
`importVariableByKeyAsync` once per target, then `setBoundVariableForPaint` / `setBoundVariable` per site; chunked
traversal with the Link tab's cancel. Covers solid fills and strokes plus the twelve number fields Link binds; text,
effect, stroke-weight and variable-alias bindings are not moved (next slice if a comment asks). Free tier: relinks share
the 25-a-day link allowance; unlock removes it. Not live until the owner republishes (action 019). Proof: ≥ 1 comment or
purchase naming relink within 30 days of the republish; the 06:45 store-metrics row also tracks rank for "relink variables"
once the tag is live.

## 10. Research run (2026-10-05, day 14, burn-down starvation fallback): paid newcomers sell nothing on this shelf

Why this run: every venture queue had only dated or blocked items (`docs/pipeline/README.md`, starvation) and this
queue was first (oldest `updated`). All three built levers still wait on the owner's Figma desktop (actions 017 file,
018 free plugin, 019 republish with Relink), so the question was what else moves a number without that session.

**Day-14 read (§6):** view_count 6 (4 on day 12), unique_run_count 3 (1 since launch — the first two runs by someone
other than us, on 2026-10-05), 0 installs, 0 likes, 0 comments, 0 purchases. Rank "styles to variables" 68/1239 (78 on
day 11), "link to variables" 10/164 (13), "unused variables" 1/48, "variables toolkit" 8/45.

**The day-10 search bodies re-read as a market table** (`docs/relay/responses/build-2026-10-01/`, 333 distinct listings
across five queries, `monetized_resource_metadata` per listing):

| Listings created in 2026 (index date) | n | median users | ≥ 40 users | purchases |
| --- | --- | --- | --- | --- |
| free | 101 | 39 | 50 | — |
| paid (Figma checkout) | 9 | 13 | 2 | **0 across all nine** |

The nine paid 2026 entrants: JSON Exporter/Importer ($5/mo, 1,480 users), Fig Swiss Knife ($15/mo, 212), My Linter ($9,
20), Rebind ($5, 15), Figma Quality Guardian ($5, 13), Coverset ($5, 11), Varlint ($5, 6), Design System Auditor ($2,
7-day trial, 2) and ours ($12, 1) — purchase_count 0 for every one, including the two subscriptions with four-figure and
three-figure user counts. 14 of the 16 paid listings in the whole set use a freemium code, 2 a timed trial. The only paid
seller with real sales in the set, Styles & Variables Organizer ($15 × 2,341), carries 140k users from before the index
date. Reading: in 2026 a paid variables plugin does not sell from Figma's search box at any price or trial shape; users
come to free listings (half of the free entrants pass 40 users) and buy, if at all, from inside a tool they already run.
So zero purchases at day 30 is the shelf's norm for a paid newcomer, **not** a signal about $12 — the day-30 item's
"installs but no purchases = pricing" rule is amended below, and the free companion (018) is the install channel.

**Web, 2026-10-05.** Figma still has no native styles → variables conversion and no unused-variables cleaner (only
"Detach deleted variables" in quick actions); Variables Cleaner (free) shipped an update in 2026-08 — the jobs remain
plugin territory, not platform-absorbed (§2 platform-risk note holds). Figma forum: five threads on the same problem —
layers stuck on the old library's variables after moving a file or swapping libraries, local variables "all broken",
and a feature request to **remap library variables to local variables** (threads 44372, 48877, 19012, 62854, 11143); the
only workaround named is a third-party "Swap Variables" plugin. Our Relink tab (action 019) does local → library; the
forum asks for both directions. Tokens Studio prices its Starter Plus at €39/mo for sync and automation, while plain
export is free everywhere (variables2css 28.9k users, Export/Import Variables 90.8k) — export alone is not a paid job.

**Relay note.** A relay request for fresh rival comments and twelve uncrowded-query hit counts
(`docs/relay/requests/vt-research-2026-10-05.txt`) sat queued on GitHub's runners for the whole run (nothing else
queued; README promises ~2 minutes) — the evidence above is from the day-10 bodies and the web; the bodies land under
`docs/relay/responses/vt-research-2026-10-05/` for the next run. Logged as a foundry queue item (`relay-wait-loop`).

**Decision and queue (scores per STRATEGY §5):**
1. `relink-howto-page` (4) — a Google-facing how-to on apps.gankdat.com for "figma variables broken after moving file /
   swap library / relink variables to library", answering the five forum threads with the Relink tab and its honest limits;
   linked from the comparison page and the landing card; Search Console measures. No owner minutes.
2. `relink-to-local` (4) — the forum's other direction: a direction switch on the Relink tab that moves library bindings
   onto the local variable of the same name and type (the "remap to local" feature request), reusing `core/relink.ts`.
   Rides the pending 019 republish if built before it, so zero extra owner minutes.
3. `search-rank-relink-queries` (3) — add "relink variables", "swap variables" and "library variables" to STORE.md's
   `Search rank queries` so the 06:45 store-metrics row carries the series from before the Relink tag goes live.
4. `day-30-review` amended: zero purchases is the 2026 norm for paid newcomers; read installs of the free companion and
   listing views instead, and treat pricing as a question only once installs exist.
Kill date unchanged: 2026-12-20 with zero sales and zero organic signal (STRATEGY §7).

**Built the same night (burn-down 20:40 and 21:20):** `relink-howto-page` is live at
`apps.gankdat.com/figma-relink-variables.html`; `relink-to-local` is a direction switch on the Relink tab (planner option
`direction`, local catalogue read with `getLocalVariablesAsync`, rebinding by variable id) with four unit tests, and the
how-to page gained a section for it. Both wait on the 019 republish to reach users — no extra owner minutes.

## Research 2026-10-07 (burn-down; starvation fallback — no new evidence)

Third starvation pass in eight days (09-30/10-04, 10-05 built out the same night). Evidence unchanged:
7 views, 3 runs, 0 installs and 0 purchases unchanged since 09-28; the free finder, the playground file and the relink republish all wait on Figma desktop actions 017–019. Nothing unblocked is left that the earlier passes did not queue and build, so no items are
added; the queue carries `research_after: 2026-10-21`, the `day-30-review` reading, and the fallback skips it until then
(`docs/pipeline/README.md`, Waiting).
