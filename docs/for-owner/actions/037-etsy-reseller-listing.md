# Owner action request #037 — Etsy: publish the second listing, the Reseller workbook (~10 min)

- **Date:** 2026-11-03
- **Status:** pending
- **Your time:** ~10 minutes
- **Cost:** £0.16 (Etsy's US$0.20 listing fee, charged when you publish; recorded as `planned` in `docs/LEDGER.md`)
- **Blocks:** `tax-workbook/reseller-listing-live`

The shop you opened on 29 October (taxelicious.etsy.com) has one listing. A second product is built, tested
and ready: the **UK Reseller Profit & Tax Workbook 2026/27**, for people who buy things to sell on eBay,
Vinted, Depop and Etsy. It shares the tax tabs of the first workbook and adds an inventory, a sales log with
each platform's fees worked out, a profit-by-platform view and the HMRC platform-reporting check (30 sales or
£1,700 a year). Two listings in one shop show up twice as often in Etsy's search, which is the point of this.

## Actions

### 1. Publish the listing (~10 min)
- **Where:** https://www.etsy.com/your/shops/me/tools/listings → **Add a listing** (or open the first listing
  and use **Copy**, which keeps the Digital item type and the attributes; then change the file, images, title,
  description, tags and price).
- **Steps:** follow `ventures/tax-workbook/LISTING.md` → **Second listing** — the copy is paste-ready in the
  editor's order. In short:
  1. Item type **Digital**. File: `ventures/tax-workbook/release/UK-Reseller-Profit-and-Tax-Workbook-2026-27.xlsx`.
  2. Images, in order: `ventures/tax-workbook/listing/reseller/1-hero.png` … `4-fit-and-refund.png`.
  3. Title, description, 13 tags (one at a time), attributes: as written in LISTING.md.
  4. Price **£5.99**, quantity 999, no variations, no personalisation.
  5. How it's made: same answers as the first listing (I did · a finished product · AI generator and
     computerised tools ticked).
  6. Publish.
- **Give back:** a note `037 done <listing URL>`. Claude records the listing, the £0.16 fee and the day-60 read.
- **Cost:** £0.16 at publish (the listing then renews itself for the same fee after each sale, like the first).

## When you're done
1. Set **Status** above to `done` and note anything that differed from the steps.
2. Send the note with the URL. The follow-up item `reseller-listing-live` does the rest the same day.
