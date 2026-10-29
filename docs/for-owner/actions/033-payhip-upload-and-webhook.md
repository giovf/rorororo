# Owner action request #033 — Payhip: upload the workbook and switch on the sale webhook

- **Date:** 2026-10-29
- **Status:** open
- **Your time:** ~13 minutes (upload ~8, webhook + secret ~5)
- **Cost:** £0 (Free Forever plan; Payhip takes 5 % + Stripe's fee per sale, nothing up front)
- **Blocks:** `tax-workbook/payhip-listing-live` (the twin listing live and linked), `tax-workbook/payhip-marketplace-submission`
  (after US$10 of sales there)

Your Payhip store exists (https://payhip.com/gankdat, action 029 step 4). The twin listing of the UK Sole Trader Tax
Workbook is written and the sale reading is deployed: the upload itself and the store's Developer settings need your
login, which the sandbox does not have. Everything to paste is in `ventures/tax-workbook/PAYHIP.md`.

## Actions

### 1. Upload the product (~8 min)
- **Where:** https://payhip.com → Products → Add a product → **Digital product**
- **Steps:**
  1. File: `ventures/tax-workbook/release/UK-Sole-Trader-Tax-Workbook-2026-27.xlsx` (the same file as Etsy).
  2. Product name, price **£6.99**, description: copy from `PAYHIP.md` §1 (the description block has a copy button).
  3. Cover: `ventures/tax-workbook/listing/1-hero.png`; gallery: `2-tabs.png`, `3-tax-estimate.png`, `4-mtd-sa103.png`,
     `5-fit-and-refund.png`.
  4. Category & Tags tab: category and the 13 tags from `PAYHIP.md` §2. **Do not press "Submit to marketplace"** — Payhip
     refuses it before US$10 of sales; Claude raises that step when the numbers show it.
  5. Everything else at its default (`PAYHIP.md` §3). Publish.
- **Give back:** the product link (`https://payhip.com/b/XXXX`).

### 2. Webhook and its key (~5 min)
- **Where:** Payhip → Account → Settings → **Developer** tab
- **Steps:**
  1. Webhook URL: `https://apps.gankdat.com/hooks/payhip` — tick the events **paid** and **refunded**, save.
  2. Copy the **API key** shown on that page.
  3. GitHub → the repository → Settings → Secrets and variables → Actions → **New repository secret**: name
     `PAYHIP_API_KEY`, value the key. (The next landing deploy stores it on the Worker; until then the endpoint
     answers 503 and Payhip retries hourly for three hours, so do this before sharing the link.)
- **Give back:** "Payhip webhook set". Nothing else: the Daily numbers row shows `payhip 30d: …` from the next run.

## What happens after

- The product page https://apps.gankdat.com/tax-workbook.html already links the store; `payhip-listing-live` switches it to
  the product link you give back and records the listing in `RESEARCH.md` §7.
- Payhip will email you on each sale and each refund (recorded in `docs/ops/SELF-CAUSED.md`; the triage never escalates
  them). Payouts land in your Stripe or PayPal daily.
- At US$10 of Payhip sales Claude raises the one-click marketplace submission (the button on the Category & Tags tab, ~1 min).
