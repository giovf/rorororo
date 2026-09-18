# Owner action request #4 — publish Variables Toolkit to the Figma Community

- **Date:** 2026-09-18
- **Status:** **READY** — all walkthrough steps passed 2026-09-18; release build is on your disk
- **Your time:** ~20 minutes
- **Cost:** £0.00 (Figma takes 15% of each sale, nothing up front)
- **Blocks:** task 12

Publishing happens from the Figma desktop app; I can't do it from here. Everything you
paste is prepared.

## Before you start
- Two builds live side by side on your disk:
  - `ventures/variables-toolkit/manifest.json` → **development** build (testing menu: demo
    page, simulate paid/unpaid). Use this for screenshots.
  - `ventures/variables-toolkit/dist-release/manifest.json` → **release** build (no testing
    menu). Import this one (Plugins → Development → Import plugin from manifest…) right
    before you click Publish, so Figma uploads the release files. Same plugin id, so
    importing one replaces the other — switch back and forth freely.
- Have these open: `ventures/variables-toolkit/LISTING.md` (all text), and the folder
  `ventures/variables-toolkit/assets/out/` (icon-128.png, cover-1920x960.png).

## Steps
1. **Plugins → Development → Variables Toolkit → Publish…** (or Manage plugins → Publish).
2. Name, tagline, description: copy from LISTING.md. Category **Design tools**; tags from
   the file; editor type **Figma Design** only.
3. Screenshots first, with the **development** build imported: **… → Simulate UNPAID** so the
   panel shows the free state, **… → Create demo page**, **… → Open**, then capture. Then
   import the **release** manifest before continuing.
   Images (Figma's names): **Icon** → `icon-128.png`; **Thumbnail** → `cover-1920x960.png`
   (this is the cover); **Carousel** → 3 screenshots from the demo page — Link tab after a
   scan, Styles → Variables preview, Clean up report (Cmd+Shift+4 on a Mac, drag over the
   plugin panel). **Playground file** (optional): the file you tested in, with only the
   "Variables Toolkit demo" page left, renamed "Variables Toolkit — try it".
4. **Monetization**: tick **Sell this resource on Community**, one-time payment if asked,
   amount **12** (USD). There is no free-trial setting in the dialog — the free tier is
   built into the plugin, and the description already explains what's free vs unlocked,
   which is all Figma requires.
5. Support contact: `info@gankdat.com`. Community page: none needed.
6. Submit for review. Figma says 5–10 business days; lately it runs longer.
- **Give back:** "submitted" + the date, and later the approval email. I'll flip the venture
  to `launched`, start the day-1/7/30 metrics, and note the 15% fee in the ledger notes.
