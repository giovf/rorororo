# Owner action request #2 — load Variables Toolkit in Figma desktop (when asked)

- **Date:** 2026-09-18
- **Status:** not yet — I'll say when the build is ready for a test round
- **Your time:** ~10 minutes per round
- **Cost:** £0.00
- **Blocks:** task 11.7 (manual testing), task 12 (launch)

I can't run Figma here, so plugin testing is the one part of V1 that needs your hands.

## One-time setup
1. Install the **Figma desktop app** (plugin development needs it, the browser won't do).
2. Open any design file → menu **Plugins → Development → New plugin…** → "Figma design"
   → "Default" → save anywhere. This creates a plugin **id**. Open the generated
   `manifest.json` and copy the `"id"` value.
3. Put it in `ventures/variables-toolkit/manifest.json` replacing
   `REPLACE_WITH_FIGMA_PLUGIN_ID` (or tell me the id and I'll do it).
4. **Plugins → Development → Import plugin from manifest…** → pick
   `ventures/variables-toolkit/manifest.json` from this repo (after `npm run build` in that
   folder, or I'll have built it).

## Each test round
1. Pull the branch, run `npm install && npm run build -w @foundry/variables-toolkit`.
2. In Figma: **Plugins → Development → Variables Toolkit**. Follow
   `ventures/variables-toolkit/TESTING.md` and tell me what you saw (screenshots welcome).
3. Payments in dev: **Plugins → Development → (plugin) → Set payment status** lets you
   toggle paid/unpaid without paying.
