# Owner action request #7 — publish Highlight Keep (Chrome first)

- **Date:** 2026-09-19
- **Status:** DONE for Chrome — submitted by the owner 2026-09-20, awaiting review. Firefox submitted 2026-09-19. Edge parked (no account).
- **Your time:** ~15 minutes
- **Cost:** £0.00
- **Blocks:** Highlight Keep going live

Everything is prepared and tested in a real browser by the harness; no test round needed.

## 1. Stripe — add the product to Managed Payments (2 min)
Dashboard → **Managed Payments** → products sold through it → add **Highlight Keep —
lifetime unlock** (created by Claude today). Same as you did for ReadFocus.

## 2. Chrome Web Store (~10 min) — the item already exists, you fill in the listing
Claude created the item and uploaded the package through the API on 2026-09-20. The store
listing itself (text, screenshots, privacy answers) can only be entered in the dashboard.

- Open https://chrome.google.com/webstore/devconsole/ → **Highlight Keep** (item id
  `pciignkojfpgmfcmjchmpdhonpjkfepc`). It shows as a draft.
- **Store listing tab:** paste from `ventures/highlight-keep/LISTING.md` (title, summary,
  description, category, language). Icon: `ventures/highlight-keep/dist/icons/icon-128.png`.
  Screenshots: `ventures/highlight-keep/assets/screenshots/` (1280×800).
- **Privacy tab:** single purpose, permission justifications and data-use answers are all in
  LISTING.md — copy them across.
- **Distribution tab:** public, free (payment is the Stripe link inside the extension).
- **Submit for review.**
- **Give back:** "007 submitted" + date.
## 3. Firefox & Edge — once action #6's accounts exist
- Firefox: `ventures/highlight-keep/highlight-keep-firefox.zip` (lint-clean); I upload it with
  `web-ext` when the AMO keys are in `.env`.
- Edge: same zip as Chrome; I publish via API if credentials exist, else you upload.
