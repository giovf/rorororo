# Spike: Payhip as the £0-launch twin shelf for the UK Sole Trader Tax Workbook

Queue item `new-ventures/spike-payhip-digital-downloads-shelf` (burn-down, 2026-10-24 18:32–18:45 UTC). Sources: three
fetch-relay rounds this run (`docs/relay/responses/payhip-2026-10-24`, `-b-`, `-c-`, pruned after 7 days) — Payhip's help
centre answered (How Payhip Works, How Do I Get Paid, Billing and Upgrading, Connect Your Stripe Account, Connect Your
PayPal Account, Marketplace, Digital EU VAT & UK VAT, Public API, Refund Request, the Sales Tax and Developer categories),
while **payhip.com itself returned a Cloudflare 403 block page to every runner request, raw and rendered** (pricing, terms,
eu-vat, features/vat-taxes, the marketplace and discover paths, and all four rival listings `payhip.com/b/…`); the
sandbox's own fetcher cannot resolve payhip.com at all. So the seller terms and the rivals' pages are read only as the
search index holds them (three searches), marked below. The questions the exchange left open: who bills, what Payhip
takes, whether a UK individual can be paid, and whether anyone browses.

## 1. The shelf's terms (Payhip's help centre, read 2026-10-24)

| Source | What it says |
| --- | --- |
| Billing and Upgrading (last updated 2021-06-20) | **Free Forever plan: $0 a month, all features, unlimited products and revenue, a 5 % Payhip fee on every transaction**; Plus $29/month at 2 %; Pro $99/month at 0 %. "PayPal and Stripe will still charge their transaction fees." |
| How Do I Get Paid (2026-03-03) | "Before you can sell through Payhip, you will need to connect to one of our supported payment processors" — 13 of them; "in most cases, you are able to connect PayPal plus one other payment processor". **Payhip never holds the money**: the sale is deposited in the seller's PayPal/Stripe account (How Payhip Works). |
| Connect Your Stripe Account | Stripe available in 40+ countries including the United Kingdom; "the standard Stripe fee is 2.9 % + $0.30 … fees may vary by country … collected by Stripe and do not go to Payhip" (Stripe UK: 1.5 % + 20p on UK cards). Payouts to the connected bank account **daily by default**, changeable to weekly/monthly/manual; the first Stripe transaction stays pending a few days during Stripe's approval. |
| Connect Your PayPal Account | UK sellers may connect **a personal or a business PayPal account**; PayPal's card fee 2.99 % + a fixed fee per currency, +1.5 % international. |
| Digital EU VAT & UK VAT (2026-07-09) | "By default, we automatically handle digital UK & EU VAT for you" — Payhip detects a UK/EU buyer, adds the buyer's country rate (on top of the price, or included in it — a Taxes setting), **collects the VAT amount together with its 5 %** and pays the seller the rest; a non-UK/EU buyer pays the plain price. The public page (search index, not fetchable) says "we act as your reseller which means we're 100 % responsible for digital EU/UK VAT". US and Canadian sales tax are separate articles (seller-side). |
| Marketplace (2026-05-13) | A buyer-facing marketplace exists: "recommends your products to prospective customers outside of your existing following". **Eligibility: the store has made at least US$10 in total sales (self-purchases excluded) and Payhip's accounts team has reviewed it; then each product is approved (aim 10 days)**; digital products only; submitted from the product's Category & Tags tab; tags feed its search; no extra fee. |
| Refund Request (2026-03-17) | "Payhip does not hold funds and cannot issue refunds directly"; each seller sets and manages its own refund policy; refunds go through the seller's PayPal/Stripe; a seller "acting in bad faith" can be reported to contact@payhip.com. Chargebacks: the seller's checkout terms are the protection (help article 287). |
| Public API (2025-08-05) + Developer category | An API for coupons and licence keys only; **webhooks** exist (sale events to a URL) — a funnel reading without email parsing, unlike Etsy. |
| Seller terms, eligibility (age, countries, individuals), prohibited content, automated access | **Unread**: `payhip.com/terms` is behind the Cloudflare block. The help centre's PayPal article admits a personal PayPal account for UK sellers, which implies individuals sell; nothing read states an ID check by Payhip itself (Stripe/PayPal do their own KYC). The block itself answers the automation question: the shelf cannot be read by this operation's runner or sandbox. |

## 2. Rivals (search index only — their pages are blocked)

| Listing (payhip.com/b/…) | Price | What the snippet says | Sales / reviews |
| --- | --- | --- | --- |
| 11-tab UK sole trader workbook 2026/27, Excel + Google Sheets | £9.99 | SA103 mapping, Income Tax + Class 4 NI estimate, an MTD-applies check (£50k / £30k / £20k thresholds) | none shown |
| Sole trader planner 2026/27 | £7.99 | income + expense logs, mileage log, estimates for England/Wales/NI and Scotland; "organisational and estimation tool" | none shown |
| Sole trader tracker | £12.00 | income log, expense categories; "guidance tool, not tax advice" | none shown |
| MTD-focused 9-tab workbook | £14.00 | quarterly updates with a bridging summary tab | none shown |
| Free two-tab sheet (digitaladaption.co.uk) | £0 | SA103 drop-downs, mileage tab, 2026/27 totals | — |

Payhip listings show no sales counts or review counts in the index, and the pages cannot be fetched, so **demand on this
shelf is unmeasurable from here** — the opposite of Etsy, where the 172-sales listing is the evidence. The same product at
£7.99–14 exists on Payhip, which says sellers believe it sells there, not that it does.

## 3. Economics for the same £6.99 file

- **Net per sale** (price ex-VAT, VAT added on top for a UK buyer as the default setting does): Payhip 5 % = £0.35, Stripe UK
  card 1.5 % + 20p ≈ £0.30 → **≈ £6.34 kept (91 %)**, against ≈ £5.80 of £7.19 on Etsy (19 % stack). With VAT included in a
  £6.99 sticker price the net is ≈ £5.20. Payouts daily to the owner's bank through Stripe; no floor; the Free plan costs £0.
- **Launch cost £0**: no set-up fee, no listing fee. Owner steps: a Payhip account (email) and one Stripe Connect or PayPal
  authorisation — the owner's identity goes on a new service (CLAUDE.md: ask first), but the identity itself already sits in
  the owner's Stripe account, so ~5–10 minutes, no new ID check; then the same upload of the file, images and copy.
- **Reach**: a storefront URL and, after US$10 of sales from the owner's own links, the Payhip marketplace. No search engine
  presence to speak of (reviews agree SEO is weak); the first sales must come from somewhere else — the product pages at
  apps.gankdat.com, the owner, or buyers Etsy already brought. Etsy's shelf supplies the buyers; Payhip supplies the checkout.
- **Reading the funnel**: Payhip webhooks can post each sale to a Worker endpoint, so the Daily numbers could carry a
  `payhip:` count without reading mail — better than Etsy's email-only funnel, and the one thing this shelf does better.

## 4. Call: promote as the twin listing, never as the primary shelf

**Promote (reshaped as a twin, 0.2 d):** list the same workbook on a Payhip store at the same price with Stripe connected,
link it from the tax-workbook product page on apps.gankdat.com, set the Taxes default (Payhip handles UK/EU VAT), and submit
it to the marketplace once US$10 of sales exist. Reason: the marginal cost is near zero (one upload, no fee, Payhip and
Stripe take ≈ 9 %), it gives the owner a shelf with no set-up fee if Etsy's fee is declined, it pays daily, and its
webhooks make the funnel readable. **Not the primary shelf**: demand cannot be measured on it (no counts, no fetch), the
marketplace is gated behind sales that must come from elsewhere, and the evidence of paying buyers for this product lives
on Etsy. Score as a tax-workbook item: evidence 1.5 (the same product listed by four rivals, no counts) × reach 1 (own
links until the marketplace admits the store) ÷ (0.2 d + 10 owner min) ≈ **5** at weight 2, queued as
`tax-workbook/payhip-twin-listing`, blocked on the owner's Payhip account + Stripe/PayPal connection — added as a £0 step
to the already-open action 029 rather than a new request. Park would be right only if the owner says no new service on
their name; then the own-Stripe link on apps.gankdat.com (Stripe Managed Payments, the licence Worker) is the fallback at
the same economics minus the marketplace, and it is already built.

Nothing to read again: the terms page is unreadable from here, and the marketplace's effect becomes visible only in the
store's own sales after it is listed (day-60 read with the Etsy one).
