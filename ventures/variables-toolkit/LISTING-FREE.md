# Community listing copy — Unused Variables Finder & Cleaner (free companion plugin)

Queue item `free-unused-variables-finder` (built 2026-10-04, burn-down). Why: "unused variables" is the one
query the toolkit already ranks #1 for (48 hits), but all three leaders there are free (Variables Cleaner
1,189 users, Variables Lint 2,090, Usage Counter 2,499) and a paid listing never gets trial installs
(`RESEARCH.md` §9 point 3). This free plugin does that one job with the toolkit's own hygiene module and its
result screen names what Variables Toolkit adds, with a link to the paid listing. Build: `npm run build:free -w
@foundry/variables-toolkit` → `dist-free/` (manifest, code, UI). Owner steps: `docs/for-owner/actions/018-figma-unused-variables-finder.md`.

**Name (34 characters):**

Unused Variables Finder & Cleaner

**Tagline (≤ 100, this one is 93):**

Find every local variable nothing in your file uses, then delete the ones you tick. Free, no limits.

**Description** — paste as plain text; bold the heading lines with the editor's **B** button, never asterisks.

Find unused variables in your Figma file and delete them in one click. Free, no sign-up, no limits.

How it works
Analyse file reads every page, every local style and every variable alias, and lists the local variables that nothing references. Tick the ones you don't need and press Delete. Variables used by any layer, style or other variable are never listed, so you cannot break a binding by mistake.

What it checks
Fills, strokes, effects, text properties, padding, gaps, corner radii, sizes, visibility and component properties bound to variables on every page; variables bound inside colour, text and effect styles; variables that other variables alias. Library usage in other files is not visible to plugins, so check a published library's consumers before deleting its tokens.

Privacy
Runs entirely inside Figma. No network access, no analytics, no account. The plugin manifest allows no domains.

Want more?
Variables Toolkit, by the same maker, also finds variables that share a value and aliases pointing at deleted variables, converts colour, text and effect styles to variables, and links hard-coded values to your variables — $12 once: https://www.figma.com/community/plugin/1682711656065145288

Support & refunds
Questions and bugs: info@gankdat.com. The plugin is free; nothing to refund.

**Tags (Figma allows up to 12):** unused variables, variables, cleanup, design tokens, clean up, variable cleaner, delete variables, design system, tokens, lint

**Category:** Design tools

**Cover / icon:** reuse the toolkit's palette (`assets/build-assets.js`) with the title "Unused Variables Finder" — the owner can
also publish with Figma's default cover; the title is what search matches.

## Live listing
- Plugin id: _(set by Figma when the owner creates the plugin — also goes into `manifest.free.json`)_
- URL: _(pending)_
- Published: _(pending)_
