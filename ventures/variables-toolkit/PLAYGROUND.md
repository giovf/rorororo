# Free Community file — "Variables Playground" (queue item `community-playground-file`, 2026-10-02)

Why: the Figma search box cannot bring a one-user paid plugin its first users (RESEARCH.md §9: the
queries with buyers rank by user count), while free Community *files* are indexed, surfaced and
duplicated far more than paid plugins. A practice file that needs the plugin to be useful puts the
listing in front of exactly the designers who have the job — for free, with no review queue (files
publish instantly) and no code in the file itself.

## What the repo holds

- `src/core/playground.ts` — the file's content as data: the token collection (`Playground tokens`),
  the paint/text/effect styles, the sample card, the copy of every page, the cover. Unit-tested
  (`playground.test.ts`) so the exercises stay true: every raw value on the Before card matches a
  token bar one deliberate miss, the Light/Dark styles pair the way the converter pairs them, and
  the clean-up page names exactly the tokens the report will list.
- `src/figma/playground.ts` — renders it inside Figma: Cover page (1920×960 frame, the Community
  thumbnail size), "Start here", "1 · Link hard-coded values" (Before card raw, After card bound),
  "2 · Styles to variables" (styled sample to flip to Dark after converting), "3 · Clean up unused
  variables" (a token table saying what the report will find). Every page carries a how-to panel
  with a hyperlink to the plugin listing and one to the comparison page.
- The development build's menu command **Build Community playground file (testing only)**
  (`manifest.json` → `playground`). Release builds drop the whole menu, as for the demo page.

## Publishing (owner, ~10 minutes, Figma desktop app) — `docs/for-owner/actions/017-figma-playground-file.md`

1. `npm run build -w @foundry/variables-toolkit`, then in Figma: new design file in Drafts, name it
   **Variables Playground**; Plugins → Development → Import plugin from manifest →
   `ventures/variables-toolkit/manifest.json` (already imported if the demo page was ever run).
2. Plugins → Development → Variables Toolkit → **Build Community playground file**. It builds the
   five pages in a few seconds and lands on the Cover page.
3. Right-click the frame **Cover (set as thumbnail)** → **Set as thumbnail**.
4. Share → **Publish to Community** (same creator profile as the plugin). Paste the copy below, free,
   no "Figma Make" or paid option. Publish.
5. Reply with the file's Community URL (or paste it under **Live file** below). Nothing else.

## Community listing copy

**Name (58):**

Variables Playground — Styles to Variables, Link, Clean Up

**Description** (plain text; Figma's description box is rich text, so bold the three page names with
the editor's B button rather than typing asterisks):

A practice file for the three jobs a Figma file needs when it moves onto variables. Duplicate it, install the free Variables Toolkit plugin, and work through three pages.

1 · Link hard-coded values — a Before card built from raw hex colours, paddings, a gap and a radius that each equal a token in the Playground tokens collection, next to the same card with every value bound. Scan it with the plugin and link them in one click.

2 · Styles to variables — five paint styles (Light and Dark twins plus one without a twin), two text styles and a shadow, used by a sample frame. Convert them into a new collection with Light and Dark modes and flip the sample to Dark.

3 · Clean up unused variables — the collection is seeded with two unused colour tokens, an unused spacing token and a duplicate. Read the report and delete what nothing uses.

The plugin runs entirely inside your file (no network access, no account). Free tier: 25 links a day, colour styles to variables, the full clean-up report. $12 one-time unlocks unlimited links, text and effect styles and deleting from the report; 14-day refund.

Plugin: https://www.figma.com/community/plugin/1682711656065145288
How it compares with Styles & Variables Organizer and the free converters: https://apps.gankdat.com/figma-styles-to-variables.html
Questions: info@gankdat.com

**Category:** Design systems (nearest file category; pick "Education" if the dialog offers no better) ·
**Price:** free · **Tags, in order:** variables · design tokens · styles to variables · unused variables ·
link variables · design system · tokens · playground · practice · figma variables

## Live file

- URL: _(owner pastes after publishing; then `LISTING.md` gains a "Practice file" line for the next
  republish, the landing card links it, and `scripts/store-metrics.ts` reads its views — queue item
  `playground-file-views`, blocked on this URL)_

## Measurement

Proof (queue): plugin listing views ≥ 20 within 14 days of the file going live, read from the Daily
check row in `RESEARCH.md` §6/§7 (`view_count` on the versions API) — the file is the only new
referrer, so any move off 2 views is attributable. File views come from the resource's own page once
its id is known (`figma.com/api/search/resources?query=Variables%20Playground&resource_type=file`),
to be added to `store-metrics.ts` with the URL.
