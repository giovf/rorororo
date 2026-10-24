# Owner action request #029 — open the Etsy shop for the tax workbook, and the free Zoho developer sign-in

- **Date:** 2026-10-24
- **Status:** open
- **Your time:** ~30 minutes (Etsy ~25, Zoho ~5)
- **Cost:** Etsy's one-time shop set-up fee, **≤ £25** — the amount Etsy shows at "Total due now" (US$15–29 plus VAT; waived
  in some promotional periods). It is recorded as `contingent` in `docs/LEDGER.md` and becomes a `cost` row the day you
  pay it. **This is the one line item over the operation's £10 launch rule, so it is your decision** — if you would rather
  not pay it, say so and the workbook goes on Payhip (free, weaker reach) instead. Zoho: £0.
- **Blocks:** `tax-workbook/etsy-listing-live` (the first product on Etsy) and `gankdat/zoho-crm-uk-registers-widget`
  (a paid Zoho CRM extension, built once the developer sign-in exists)

Everything below needs *your* identity or wallet; nothing else in the backlog does. The product is finished:
`ventures/tax-workbook/release/UK-Sole-Trader-Tax-Workbook-2026-27.xlsx` (checked: 0 formula errors, the worked example
matches a hand calculation) with the five listing images in `ventures/tax-workbook/listing/` and every word of the
listing in `ventures/tax-workbook/LISTING.md`.

## Actions

### 1. Open the Etsy shop (sole trader, UK)
- **What:** create a seller account in your own name and open a shop with one listing.
- **Where:** https://www.etsy.com/sell → "Open your Etsy shop"
- **Steps:**
  1. Sign in or create an Etsy account with the email you use for Foundry mail (so sale notifications reach the inbox
     triage). Shop name suggestion: **FoundryTaxSheets** (or anything you like — it is not in the listing copy).
  2. Shop preferences: language English, country United Kingdom, currency GBP. Account type: **individual / sole trader**
     (not a business — a business account asks for registration documents).
  3. "Stock your shop": skip for now or add the listing in step 3 below.
  4. Identity: Etsy's partner Persona asks for a photo of a government ID and a selfie. The name must match the bank
     account you give next.
  5. Payments: your **personal bank account in your name** (Etsy sends a small test deposit to verify it). Payout schedule:
     weekly.
  6. Billing: a card for Etsy's fees.
  7. **"Total due now"**: Etsy shows the set-up fee here. If it is £25 or less, pay it and note the exact amount; if more,
     stop and tell Claude the figure (the ledger decides).
  8. Open the shop.
- **Give back:** the shop URL, the exact fee charged (and date), and whether sale notifications are going to the Foundry
  mailbox. No passwords in chat.
- **Cost:** the set-up fee, ≤ £25.

### 2. Create the listing
- **What:** one digital listing from the paste-ready copy.
- **Where:** Shop Manager → Listings → Add a listing → type **Digital files**
- **Steps:**
  1. Upload the five images from `ventures/tax-workbook/listing/` in order (1-hero … 5-fit-and-refund).
  2. Title, tags (13), description, category and price: copy each from `ventures/tax-workbook/LISTING.md`. Price
     **£6.99** now; set a reminder to change it to £8.99 on 1 December 2026 (the description says the launch price ends
     30 November — keep that true).
  3. Digital file: upload `ventures/tax-workbook/release/UK-Sole-Trader-Tax-Workbook-2026-27.xlsx`.
  4. Quantity 999, renewal automatic, publish.
- **Give back:** the listing URL.
- **Cost:** £0 now (Etsy charges US$0.20 per listing renewal after each sale, inside the fee estimate in the research).

### 3. Zoho Developer Console sign-in (free)
- **What:** a free developer account so the Zoho CRM extension can be built and tested in a developer org.
- **Where:** https://www.zoho.com/crm/developer/ → "Developer Console" (sign in with a Zoho account; create one with the
  Foundry email if you have none)
- **Steps:**
  1. Sign in / sign up (free). Accept the developer terms.
  2. In the Developer Console, confirm a sandbox/developer org is available (it is created for you on first visit).
  3. Nothing else to configure — Claude builds the extension from the repo and asks you only when the marketplace
     submission needs the vendor profile.
- **Give back:** "done" and the email the account uses. No API keys are needed yet.
- **Cost:** £0.

## When you're done
1. Set **Status** above to `done` and note anything that differed from the steps (especially the fee amount).
2. Nothing goes in `.env` for this request.
3. Say "029 done" (Telegram note or the dashboard idea box): the next run records the listing (`etsy-listing-live`),
   adds the fee to the ledger and unblocks the Zoho item.
