# Owner action request #018 — publish the free "Unused Variables Finder & Cleaner" plugin

- **Date:** 2026-10-04
- **Status:** pending
- **Your time:** ~15 minutes (plus Figma's review, usually 1–5 days)
- **Cost:** £0.00
- **Blocks:** queue item `free-unused-variables-finder` proof (variables-toolkit) — installs of the free plugin and the
  listing views it sends to the paid one

Everything below needs *your* Figma identity (plugins publish under the same creator profile as the toolkit);
nothing else in the backlog does. It batches with action 017 (the playground file) — one Figma desktop session.

## Why
The toolkit ranks #1 for "unused variables" (48 hits) but has 0 installs in 13 days: every plugin that wins
that query is free, and a paid listing never gets the trial install. This free plugin does the one job with
the toolkit's own code and its result screen links to the paid listing (`ventures/variables-toolkit/LISTING-FREE.md`).

## Actions

### 1. Create the plugin and give it the id
- **What:** let Figma assign the plugin id, then build with it.
- **Where:** Figma desktop app, the repo on your machine.
- **Steps:**
  1. Figma → **Plugins → Development → New plugin…** → Figma design → name **Unused Variables Finder & Cleaner** →
     "Empty" → save anywhere temporary. Open the `manifest.json` Figma wrote there and copy its `"id"` value.
  2. In the repo: `git pull`, paste that id into `ventures/variables-toolkit/manifest.free.json` (replacing
     `REPLACE_WITH_THE_ID_FIGMA_ASSIGNS`), then `npm run build:free -w @foundry/variables-toolkit`.
  3. **Plugins → Development → Import plugin from manifest…** → `ventures/variables-toolkit/dist-free/manifest.json`
     (delete the temporary plugin from step 1 in **Manage plugins in development** so only this one remains).
  4. Try it in any file with variables: **Analyse file**, tick one unused variable, **Delete 1 selected**.
- **Cost:** £0.00

### 2. Publish it
- **What:** publish to Figma Community, free.
- **Where:** Plugins → Development → Unused Variables Finder & Cleaner → **Publish…**
- **Steps:**
  1. Name, tagline, description, tags, category: copy from `LISTING-FREE.md`. Bold the heading lines with the
     editor's **B** button; never type asterisks.
  2. Icon and cover: upload any 128×128 icon and 1920×960 cover (reuse the toolkit's from `assets/out/` if you
     still have them; otherwise Figma's defaults are fine for a free listing).
  3. Price: free. Publish — Figma reviews it (the toolkit took 3 days).
- **Give back:** the plugin id and, once approved, the Community URL — paste them under "Live listing" in
  `LISTING-FREE.md` or tell Claude, and commit the id in `manifest.free.json`. Claude then adds the plugin to the
  daily store-metrics read and links it from the toolkit's listing copy.
- **Cost:** £0.00

## When you're done
1. Set **Status** above to `done` and note anything that differed from the steps.
2. Start `claude` and say "free plugin published, id … URL …" — the backlog picks up from there.
