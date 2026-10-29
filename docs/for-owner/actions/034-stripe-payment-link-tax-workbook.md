# Owner action request #034 — Stripe: one Payment Link for the tax workbook (~3 min)

- **Date:** 2026-10-29
- **Status:** open
- **Your time:** ~3 minutes
- **Cost:** £0 (Stripe's fee per sale only; nothing up front)
- **Blocks:** `tax-workbook/own-checkout-live` (the Buy button on https://apps.gankdat.com/tax-workbook.html)

The workbook can now be sold from our own page the way ReadFocus is: Stripe takes the payment as merchant of
record, our licence Worker mails the buyer a signed download link (valid 30 days, the file served privately), and a
refund revokes the link. Everything is built, tested and deployed except the one thing that creates a live-mode
Stripe object, which is yours: a Payment Link. The page keeps its Buy button hidden until the link exists.

## Actions

### 1. Create the Payment Link (~3 min)
- **Where:** https://dashboard.stripe.com/payment-links/create (live mode, the same account as ReadFocus)
- **Steps:**
  1. Product: **Add new product** → name `UK Sole Trader Tax Workbook 2026/27`, one-off, price **£6.99 GBP**.
     Description (optional): `Spreadsheet for UK sole traders: income, expense and mileage logs, SA103 boxes, MTD
     quarters and a 2026/27 tax estimate. Download link by email.`
  2. Tax: leave as it is for ReadFocus's link (Managed Payments handles VAT); do not add a tax rate by hand.
  3. **After payment** → "Don't show confirmation page", redirect to `https://apps.gankdat.com/thanks-tax-workbook.html`.
  4. **Advanced options** → **Metadata** (the box is near the bottom; if the editor hides it, open the link after
     creating it and use *Edit* → *Advanced options*): add **one key** `venture` with value `tax-workbook`. This is the
     line that makes the webhook mail a download link instead of a licence key; without it the sale is ignored.
  5. Create the link.
- **Give back:** the link's URL (`https://buy.stripe.com/…`) in a note: `034 done <url>`. Nothing else: Claude
  pastes it into the page, un-hides the button and makes one £0 test purchase with the 100 %-off coupon flow that
  proved ReadFocus's mail in September.

## When you're done
1. Set **Status** above to `done` and note anything that differed from the steps.
2. Send the note with the URL. The follow-up item `own-checkout-live` does the rest the same day.
