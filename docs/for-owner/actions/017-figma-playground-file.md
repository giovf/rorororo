# Owner action request #017 — publish the free "Variables Playground" file on Figma Community

- **Date:** 2026-10-02
- **Status:** pending
- **Your time:** ~10 minutes
- **Cost:** £0.00
- **Blocks:** queue item `playground-file-views` (variables-toolkit) — the file's URL is all it needs

Everything below needs *your* Figma identity (the file publishes under the same creator profile as
the plugin); nothing else in the backlog does.

## Why
The plugin listing has had 2 views in 11 days because Figma's search ranks crowded queries by user
count (`ventures/variables-toolkit/RESEARCH.md` §9). Free Community *files* are indexed and surfaced
far more than paid plugins and publish instantly, with no review. Claude built the whole file as a
plugin command so you only run it and press Publish.

## Actions

### 1. Build the file
- **What:** run the development build's "Build Community playground file" command in an empty file.
- **Where:** Figma desktop app (plugin development needs it), the repo on your machine.
- **Steps:**
  1. In the repo: `git pull` then `npm run build -w @foundry/variables-toolkit`.
  2. Figma → Drafts → **New design file** → name it **Variables Playground**.
  3. **Plugins → Development → Import plugin from manifest…** → `ventures/variables-toolkit/manifest.json`
     (skip if the Development menu already lists Variables Toolkit from action 002).
  4. **Plugins → Development → Variables Toolkit → Build Community playground file (testing only)**.
     In a few seconds the file has five pages: Cover, Start here, 1 · Link hard-coded values,
     2 · Styles to variables, 3 · Clean up unused variables. It ends on the Cover page.
  5. Right-click the frame **Cover (set as thumbnail)** → **Set as thumbnail**.
- **Cost:** £0.00

### 2. Publish it
- **What:** publish the file to Figma Community, free.
- **Where:** the file's **Share** button → **Publish to Community** (or File → Publish to Community).
- **Steps:**
  1. Name, description, category, tags: copy them from `ventures/variables-toolkit/PLAYGROUND.md`
     ("Community listing copy"). Do not type asterisks in the description; bold the three page
     names with the editor's **B** button.
  2. Thumbnail: "Use file thumbnail" (the Cover frame). Price: free. Publish.
- **Give back:** the file's Community URL — paste it under "Live file" in `PLAYGROUND.md`, or tell
  Claude. Claude then links it from the plugin listing copy and the landing page and adds its view
  count to the daily metrics.
- **Cost:** £0.00

## When you're done
1. Set **Status** above to `done` and note anything that differed from the steps.
2. Start `claude` and say "playground file published, URL …" — the backlog picks up from there.
