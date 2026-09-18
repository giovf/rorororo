# V1 research — Figma plugin (discovery, task 10)

Status: **in progress** — market sized, gap analysis pending (comments harvest running).
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

## 3. Validation gate — pending

Filled in once the comments harvest for niches A and B completes.
