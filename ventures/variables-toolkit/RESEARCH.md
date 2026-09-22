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

## 7. Post-launch measurement (day 1 / 7 / 30)

Live since **2026-09-21**. The 07:00 daily metrics routine reads `STORE.md` and records users,
likes and purchases in §6 above; these are the dates that matter for the decision:

| Checkpoint | Date | What we read | What it would mean |
| --- | --- | --- | --- |
| Day 1 | 2026-09-22 | listing reachable, install count starts moving | listing is discoverable at all |
| Day 7 | 2026-09-28 | users, likes, purchases | first read on install→purchase conversion |
| Day 30 | 2026-10-21 | users, likes, purchases | scored against the §1 benchmark |

Benchmark from §1 (measured across 167 Figma-checkout plugins): the **median paid plugin has 16
purchases lifetime**, and design-system/variables tools convert free→paid at **1.7–2.9%** — the
best band in the market. At $12 with Figma's 15% fee, each sale nets ≈$10.20 (≈£7.55 at ~1.35).

Decision rule (STRATEGY.md §7 kill criteria): zero sales **and** zero organic signal (installs,
likes, comments) by **2026-12-20** (90 days live) → kill and keep the code. A day-30 read of
installs with no purchases is a pricing/description problem, not a kill — fix the listing first.
