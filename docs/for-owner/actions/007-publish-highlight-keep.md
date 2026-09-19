# Owner action request #7 — publish Highlight Keep (Chrome first)

- **Date:** 2026-09-19
- **Status:** READY
- **Your time:** ~15 minutes
- **Cost:** £0.00
- **Blocks:** Highlight Keep going live

Everything is prepared and tested in a real browser by the harness; no test round needed.

## 1. Stripe — add the product to Managed Payments (2 min)
Dashboard → **Managed Payments** → products sold through it → add **Highlight Keep —
lifetime unlock** (created by Claude today). Same as you did for ReadFocus.

## 2. Chrome Web Store (10 min)
- **Zip:** `ventures/highlight-keep/highlight-keep.zip`
- **Listing text / privacy answers:** `ventures/highlight-keep/LISTING.md`
- **Icon:** `ventures/highlight-keep/dist/icons/icon-128.png`
- **Screenshots:** `ventures/highlight-keep/assets/screenshots/` (two, 1280×800; take more from the popup or library if you like)
- Developer dashboard → **+ New item** → upload → paste → Privacy practices as in LISTING.md → Distribution public, free → Submit.
- **Give back:** "submitted" + date.

## 3. Firefox & Edge — once action #6's accounts exist
- Firefox: `ventures/highlight-keep/highlight-keep-firefox.zip` (lint-clean); I upload it with
  `web-ext` when the AMO keys are in `.env`.
- Edge: same zip as Chrome; I publish via API if credentials exist, else you upload.
