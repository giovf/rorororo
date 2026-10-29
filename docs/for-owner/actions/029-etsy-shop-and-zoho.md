# Owner action request #029 — open the Etsy shop for the tax workbook, and the free Zoho developer sign-in

- **Date:** 2026-10-24
- **Status:** done (2026-10-29)
- **Your time:** ~55 minutes (Etsy ~25, Zoho ~5, Payhip ~10, Kindle ~15 — step 5 added 2026-10-26)
- **Cost:** Etsy's one-time shop set-up fee, **≤ £25** — the amount Etsy shows at "Total due now" (US$15–29 plus VAT; waived
  in some promotional periods). It is recorded as `contingent` in `docs/LEDGER.md` and becomes a `cost` row the day you
  pay it. **This is the one line item over the operation's £10 launch rule, so it is your decision** — if you would rather
  not pay it, say so and the workbook goes on Payhip (free, weaker reach) instead. Zoho: £0.
- **Blocks:** `tax-workbook/etsy-listing-live` (the first product on Etsy), `gankdat/zoho-crm-uk-registers-widget`
  (a paid Zoho CRM extension, built once the developer sign-in exists) and, since 2026-10-26, `tax-workbook/kdp-listing-live`
  (the Kindle guide, step 5)

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
  0. **Set "What type of item is it?" to Digital first** (the editor defaults to Physical, which asks for delivery,
     returns and GPSR details and hides the file upload). `LISTING.md` follows the editor's sections top to bottom
     (re-checked against your screenshot, 2026-10-29).
  1. Upload the five images from `ventures/tax-workbook/listing/` in order (1-hero … 5-fit-and-refund).
  2. Title, tags (13, typed one at a time), description (the plain-text block), attributes, "How it's made" and price:
     copy each from `ventures/tax-workbook/LISTING.md`. Price
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

### 4. Payhip store (free) — the twin shelf, and the fallback if you decline Etsy's fee
- **What:** a free Payhip account so the same file can be sold from a second storefront with no set-up fee (Payhip takes 5 %
  and handles UK/EU VAT; the money lands in your Stripe or PayPal daily). Spike: `docs/exchange/spikes/payhip-digital-downloads-shelf.md`.
- **Where:** https://payhip.com → Sign up (use the Foundry email)
- **Steps:**
  1. Create the account (Free Forever plan — do not upgrade).
  2. Account → Settings → Payment Details: connect **Stripe** (the account you already have) or your PayPal; both are fine.
  3. Settings → Taxes: leave "handle digital UK & EU VAT" ticked (the default).
  4. Stop there — Claude writes the product listing from `LISTING.md` once the account exists and asks you only for the
     upload (the sandbox cannot log in). Store name suggestion: the same as the Etsy shop.
- **Give back:** "Payhip done" and the store URL (payhip.com/\<name\>).
- **Cost:** £0.

### 5. Amazon KDP — publish the Kindle guide (free, ~15 min; added 2026-10-26)
- **What:** a KDP account in your own name and one upload: the finished ebook `UK Sole Trader Tax 2026/27` (a standalone
  guide built from the same rates as the workbook) and its cover. Amazon lists it for £0, adds VAT and pays 70 % of the
  ex-VAT price (≈ £2.70 a sale at £4.99) by bank transfer in GBP about 60 days after each month.
- **Where:** https://kdp.amazon.com → Sign up (your Amazon login works) → Bookshelf
- **Steps:**
  1. Create the KDP account with the Foundry email (so "your book is live" and payment mails reach the inbox triage).
  2. **Account → Tax interview:** individual, not a US person, UK resident; it produces a W-8BEN with 0 % US withholding
     under the UK treaty. Give your UK tax identifier (UTR or National Insurance number). **Bank:** your UK account in
     your name. KDP asks for the **IBAN** (and the BIC/SWIFT code if it asks), not the sort code and account number; both
     are printed in your banking app or on a statement. A UK IBAN already contains the sort code and account number. Nothing is charged to you — KDP only pays out.
  3. Bookshelf → Create → Kindle eBook. Paste every field from `ventures/tax-workbook/KINDLE.md` (title, subtitle,
     description, 7 keywords, 2 categories). **Answer "Yes" to the AI-generated content question** and choose "Text:
     AI-generated" — KDP requires the disclosure and allows the book; it is not shown to buyers.
  4. Upload `ventures/tax-workbook/kindle/UK-Sole-Trader-Tax-2026-27.epub` and `ventures/tax-workbook/kindle/cover.jpg`.
     Open the previewer once. DRM: no.
  5. Pricing: enrol in KDP Select, all territories, primary marketplace Amazon.co.uk, 70 % royalty, £4.99. Publish.
  6. When the "live" mail arrives (up to 72 h): Bookshelf → Promote and Advertise → Kindle Countdown Deal, £2.99 for 7 days.
- **Give back:** the book's amazon.co.uk URL (or ASIN) and the date it went live. Once a month, a note `kindle: N sold`
  from KDP Reports. No passwords in chat.
- **Cost:** £0.

## When you're done
1. Set **Status** above to `done` and note anything that differed from the steps (especially the fee amount).
2. Nothing goes in `.env` for this request.
3. Say "029 done" (Telegram note or the dashboard idea box): the next run records the listing (`etsy-listing-live`),
   adds the fee to the ledger and unblocks the Zoho item. If you do the Kindle step on its own, say "029 kindle done" with
   the book URL and the next run records it (`kdp-listing-live`).

## Outcome (2026-10-29, owner)

1. Etsy shop https://taxelicious.etsy.com opened (shop name differs from the suggestion — fine). Set-up fee **£14** plus a
   **£0.20** listing fee, both in `docs/LEDGER.md`.
2. Listing live: https://www.etsy.com/uk/listing/4605571079/uk-sole-trader-tax-workbook-202627-self. The editor differed
   from the original pack (item type defaulted to Physical, plain-text description, tags cut short when pasted together);
   `LISTING.md` was re-ordered to match it the same day.
3. Zoho Developer Console: done, on the Foundry mailbox.
4. Payhip: https://payhip.com/gankdat.
5. KDP: submitted, in review. Differences: KDP asked for the IBAN rather than sort code + account number (step corrected);
   the title was entered as "The UK Sole Trader - A guide for the self employed & side hustlers" (see `KINDLE.md` Status).
