# Owner action request #019 — republish the Variables Toolkit with the Relink tab

- **Date:** 2026-10-04
- **Status:** pending
- **Your time:** ~10 minutes (plus Figma's review of the new version, usually 1–3 days)
- **Cost:** £0.00
- **Blocks:** queue item `relink-library-variables` proof (variables-toolkit) — a comment or purchase naming relink

Publishing a plugin version needs *your* Figma identity; nothing else in this request does. It batches with actions 017
(playground file) and 018 (free plugin) — one Figma desktop session covers all three.

## Why
The toolkit now has a fourth tab, **Relink to library variables**: layers bound to local variables, or to library variables
that are no longer published, move onto the enabled library's variable of the same name and type. This is the gap users of
Variable Utilities ($17, 181 users) and Design System Organizer complain about (`ventures/variables-toolkit/RESEARCH.md` §5).
Reading the library catalogue needs the `teamlibrary` manifest permission, which only a new published version carries.

## Actions

### 1. Build and try the new version
- **What:** build the release bundle and run the Relink tab once.
- **Where:** the repo on your machine, Figma desktop app.
- **Steps:**
  1. `git pull`, then `npm run build:release -w @foundry/variables-toolkit`.
  2. Figma → **Plugins → Development → Import plugin from manifest…** → `ventures/variables-toolkit/dist-release/manifest.json`
     (if the toolkit is already imported, Figma just refreshes it).
  3. Open a file that has a library with variables enabled (**Assets → Libraries**) and at least one layer bound to a *local*
     variable whose name also exists in that library. Run the plugin → **Relink** → **Scan page**. The matching variable is
     listed with a count; **Relink selected** moves the bindings. If Figma asks to grant "Read team library", accept.
- **Cost:** £0.00

### 2. Publish the new version
- **What:** publish a new version of the live listing (same id `1682711656065145288`).
- **Where:** Plugins → Development → Variables Toolkit → **Publish…** → publish new version.
- **Steps:**
  1. Release notes: "New: Relink to library variables — move layers from local or unpublished variables onto your library's
     variables by name."
  2. Description: paste the current text from `ventures/variables-toolkit/LISTING.md` (it has the new Relink block); bold the
     heading lines with the editor's **B** button, never type asterisks. Add the tag `relink variables` if the dialog has room.
  3. Publish. Figma reviews new permissions; the current version stays live meanwhile.
- **Give back:** the date Figma approves it — tell Claude or set **Status** here to `done`. Claude then dates it in
  `STORE.md` and the day-30 review reads relink comments and the "relink variables" rank.
- **Cost:** £0.00

## When you're done
1. Set **Status** above to `done` and note anything that differed from the steps.
2. Start `claude` and say "toolkit republished with relink" — the backlog picks up from there.
