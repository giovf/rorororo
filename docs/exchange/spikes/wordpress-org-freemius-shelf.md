# Spike: WordPress.org plugin directory + Freemius as a freemium shelf for a sole trader

Queue item `new-ventures/spike-wordpress-org-freemius-shelf` (burn-down, 2026-10-22 18:00–19:00 UTC). Sources: three
fetch-relay rounds (`docs/relay/responses/wordpress-freemius{,-b,-c}-2026-10-22`, pruned after 7 days): Freemius's
pricing page, its help-centre pages in their Markdown form (*Our Pricing*, *Check Earnings, Setup Payout Methods and Get
Paid*, *Supported Countries*, the seller FAQ), its Terms of Use (effective 24 February 2015) and the WordPress & Templates
solution page; WordPress.org's *Detailed Plugin Guidelines* and *Plugin Developer FAQ*; and the keyless `plugins_api`
(`api.wordpress.org/plugins/info/1.2/`, `query_plugins` with `active_installs`, `downloaded`, `author_profile`;
`plugin_information` with `sections`). WebSearch found the Markdown URLs of the help pages and nothing the pages do not
say themselves (the "4.7 % + 2.3 %" figures quoted in the item come from a rival's blog and Freemius's old plan — see §2).
The question the 2026-10-22 research left open: can a UK sole trader sell a freemium plugin through WordPress.org with
Freemius as merchant of record, at what all-in fee, and is there a ≤ 1-week utility niche where small vendors' freemium
plugins show ≥ 1,000 active installs with a pro tier ≥ US$29/year?

## 1. Eligibility: an individual can sell, from the UK, with no company or VAT registration

| Source | What it says |
| --- | --- |
| Seller FAQ, "Do I need a company to start selling?" | "No. You can start selling as an individual. Freemius handles payments, taxes, and compliance on your behalf, so you don't need to: open a company, register for VAT, set up payment processors. Many makers start this way and formalize later." |
| Pricing page FAQ | "You can start selling immediately after registration" — Freemius "serves as your reseller", so no gateway account of the seller's own; "we resell your products". |
| *Supported Countries* | "We work with software makers in 190+ countries and territories"; the payout list "includes all countries where at least one payout method is available" and names the **United Kingdom**; checkout works "from nearly every country worldwide, as long as the region is not under U.S. sanctions". |
| *Your Earnings* | Before the first payout the seller fills in **Billing Information** on *My Profile* (used for the pro-forma and the reverse invoices Freemius issues on the seller's behalf) and a payout method per selling currency; no ID document, tax form or business number is named on the page. |
| Terms of Use (24 Feb 2015) | A site-wide "Terms of Use" (account, user content, DMCA, Delaware company); the seller agreement proper is the "Vendor terms" linked in the footer, not read today. |

Reading: **yes**. Freemius is the merchant of record (it resells the plugin, issues the invoices, collects and remits
US sales tax, EU and UK VAT, handles refunds, fraud and chargebacks) and its own FAQ says an individual sells without a
company or VAT registration; the UK is on the payout list. What the owner would do once (~15 minutes, and it puts the
owner's identity on Freemius — CLAUDE.md: ask first): create the seller account, fill in billing information (name and
address for the reverse invoices) and a payout method (PayPal is the default, Wise/wire/Payoneer too; GBP payouts can go to
a GBP account). Less than the JetBrains path (no ID document, no public trader page) and less than Atlassian (no Stripe
Identity). Open, not read today: the *Vendor terms* page (the actual seller agreement) and whether a W-8BEN is collected at
onboarding — neither changes the answer for a UK individual, both go on the owner's sheet when the line is opened.

## 2. The shelf's terms (pricing page and *Our Pricing*, 2026-10-22)

- **Freemius fee, current plan**: **3.8 % + US$0.50 per successful transaction, plus gateway fees**, for the SaaS & Software
  solution; the **WordPress & Templates solution adds 2.3 %** (licensing, automatic updates served from Freemius's servers,
  the WordPress SDK, deactivation feedback) — **6.1 % + 50¢ + gateway**. The 3.8 % is charged on the *total* transaction
  including VAT (the help page's worked example: a US$100 product + US$20 French VAT → Freemius 3.8 % of US$120 = US$4.56
  + 50¢; gateway US$4.40; "effective rate 9.46 %" of the product price). Growth pricing steps the share down from 3.7 % at
  US$50k/month gross to 0.5 % above US$100k — irrelevant at our scale.
- **Gateway fees**: "the current average effective rate is 3.5 %" (Stripe and PayPal; Freemius "does not take any portion of
  the processing fees"). So the all-in cost of the WordPress plan is ≈ **9.6 % + 50¢ of each sale** (6.1 + 3.5, before the
  VAT effect above): on a US$39/year licence ≈ US$4.24, the seller nets ≈ US$34.76. The item's "4.7 % + 2.3 %" was the older
  plan (still honoured for existing sellers; the page says "Keep your current plan, or contact support … to switch"); the
  Fungies "10.5 % all-in" figure is close to the current reading, only by coincidence.
- **No other fees** (*Our Pricing*): no setup or monthly fee, none on subscription payments, payouts, cart or dunning
  recovery, affiliates, PayPal transactions or currency conversion ("you can receive payouts in the native currency in
  which they were processed" — USD, EUR and GBP to separate accounts).
- **Payout**: earnings of a month "are calculated on the 1st of the second following month" and paid "on the 10th of each
  month, with a US$100 minimum payout threshold" (January's sales are payable on 10 March; below US$100 carries over) — so
  the first money arrives 40–70 days after the first sale. Methods: PayPal (MassPay, default), Payoneer, wire (IBAN/SWIFT),
  Wise; only Wise and wire convert currency. Wire "may incur intermediate bank fees".
- **Tax**: Freemius "calculate[s], collect[s], report[s], and remit[s] sales tax and VAT wherever your customers are"
  (US sales tax, EU and UK VAT), issues invoices on every purchase and validates EU VAT numbers for B2B exemption; it
  issues reverse invoices to the seller from the billing information (the seller raises none).
- **What the WordPress plan buys**: the Freemius WordPress SDK (licensing, activations per plan, automatic updates of the
  paid add-on from Freemius's servers, trial handling, deactivation feedback, in-dashboard checkout and upgrade screens);
  "Our WordPress SDK is compliant with the WordPress.org guidelines and has been reviewed and approved" (solution page) —
  the free build on WordPress.org carries the SDK, the premium code lives in a separate paid build served by Freemius.

## 3. The directory's rules on freemium (*Detailed Plugin Guidelines*, read 2026-10-22)

- **Guideline 5, trialware is not permitted**: "Plugins may not contain functionality that is restricted or locked, only to
  be made available by payment or upgrade. Functionality may not be disabled after a trial period or quota is met." Then:
  "Paid functionality in services is permitted (see guideline 6: serviceware), provided all the code inside a plugin is
  fully available. **We recommend the use of add-on plugins, hosted outside of WordPress.org, in order to exclude the
  premium code.**" and "Attempting to upsell the user on ad-hoc products and features is acceptable, provided it falls within
  bounds of guideline 11 (hijacking the admin experience)."
- **Guideline 6, software as a service is permitted**: plugins "that act as an interface to some external third party
  service … are allowed, even for paid services", but "a service that exists for the sole purpose of validating licenses or
  keys while all functional aspects of the plugin are included locally is not permitted" and "storefronts that are not
  services" are refused.
- **Guideline 8**: a plugin on WordPress.org may not serve "updates or otherwise install plugins, themes, or add-ons from
  servers other than WordPress.org's" nor install "premium versions of the same plugin" — the paid add-on is bought and
  installed from Freemius's checkout outside the directory, which is exactly the Freemius split (and why the WordPress
  plan's "automatic updates" line exists: the paid build updates from Freemius, the free one from WordPress.org).
- **Guideline 1**: everything hosted on WordPress.org is GPL-compatible, so the free tier is forkable; the paid add-on,
  hosted by Freemius, may be GPL too (most are) — the moat is updates, support and the licence check, not the code.
- Reading for the item's "guideline 6" wording: the useful-free-tier rule is guideline 5 (no locked or time-limited
  functionality in the free build), not 6; the freemium shape the directory accepts is **a complete free plugin plus a
  separate paid add-on sold and updated elsewhere**, which is the shape Freemius's SDK produces. The premium build must
  not be a time-limited trial of the free one, and the free one must do its job on its own.

## 4. Demand: the directory's counts for three ≤ 1-week utility niches (plugins_api, 2026-10-22)

`query_plugins` is keyless and returns `active_installs` (banded: 1,000 / 2,000 … 10,000 / 20,000 … 1 million+),
`downloaded`, rating, last update and the author's profile for every plugin; `request[author]=<nicename>` lists a
vendor's plugins, which is the "≤ 3 plugins" test; `plugin_information` with `sections` gives the readme, where a pro
tier shows as "pro"/"premium"/"pricing" and a vendor link. 14 broad and 18 narrow searches plus 5 tag queries returned
1,010 + 334 distinct plugins; the counts below exclude plugins above 300,000 installs (platform vendors: WooCommerce,
Elementor, Yoast) and below 1,000.

| Niche (≤ 1 week each) | Plugins 1k–300k installs | ≥ 10k | Who holds the installs |
| --- | --- | --- | --- |
| VAT / tax-ID validation and B2B checkout (EU VAT number, VIES, NIF/CIF, IBAN) | 55 | 17 | mostly multi-plugin WooCommerce shops (WPFactory 38 listings, WP Desk, Vendidero 7, Naked Cat 24, Art Project Group 11); 3 one-or-two-listing vendors |
| Accessibility (widget, checker, WCAG helpers) | 67 | 31 | split: SaaS widgets (UserWay 80k, accessiBe 10k, CookieYes 20k) and 5 small vendors with a pro tier |
| Cookie consent / GDPR banners | 63 | 37 | SaaS consent managers (Cookiebot, CookieYes, Complianz, Termly's `uk-cookie-consent` 80k, Real Cookie Banner 100k); the small-vendor banners are free (Italy Cookie Choices 9k, Pressidium 10k, open source) |

**Small-vendor freemium plugins** (author with ≤ 3 listings, ≥ 1,000 active installs, a pro tier) and their pro price as
read from the vendor's page through the relay:

| Plugin (slug) | Vendor (listings) | Active installs | Updated | Pro tier | Price read |
| --- | --- | --- | --- | --- | --- |
| OneTap accessibility widget (`accessibility-onetap`) | OneTap (1) | 60,000 | 2026-08-31 | yes — pricing page linked from the readme | **US$69/year** 1 site (list US$129), US$118/year 3 sites, lifetime from US$199 |
| WP Accessibility Helper (`wp-accessibility-helper`) | Alex Volkov (2) | 10,000 | 2026-09-02 | yes — WAH PRO shop | Store API: **WAH PRO US$259** (list US$299), 2 sites US$490, 12 months' support US$199 |
| Accessibility Checker (`accessibility-checker`) | Equalize Digital (5, four of them ≤ 1,000 installs) | 10,000 | 2026-10-09 | yes | **US$190/year** 1 site, US$750/year 5 sites, US$2,250/year 25 sites |
| SOGO Accessibility (`sogo-accessibility`) | SOGO (3) | 5,000 | 2026-09-06 | "premium" in the readme | unread (vendor site not fetched) |
| Fluid Checkout (`fluid-checkout`) | Diego Versiani (2) | 20,000 | 2026-08-21 | PRO | **€99/year** 1 site (list €129), €199/year 5 sites, €499/year 25 sites |
| WooCommerce Smart COD (`wc-smart-cod`) | FullStack-ing (1) | 30,000 | 2026-10-10 | PRO | Store API: **€64–189** (variable; the one-site plan is the €64 floor) |
| Pay for Payment (`woocommerce-pay-for-payment`) | Karolina Vyskočilová (9) | 10,000 | 2026-10-12 | Pro, **sold through Freemius** (the SDK is in the free build) | **US$39/year** 1 site or US$119 lifetime, US$99/year 5 sites, US$199/year 25 sites; 7-day trial |
| EU VAT Assistant (`woocommerce-eu-vat-assistant`) | Aelia (1 directory listing; a ~20-product shop) | 5,000 | 2026-10-05 | premium, **Freemius SDK in the free build** | unread: the shop's Store API lists it as a variable product with no price exposed; Aelia's other plugins US$49–99 |
| WooCommerce EU VAT Compliance (`woocommerce-eu-vat-compliance`) | Team Updraft (16) | 3,000 | 2026-10-03 | premium | £135 in the readme — not a small vendor |
| Donation Platform for WooCommerce (`wc-donation-platform`) | Jonas (1) | 7,000 | 2026-10-13 | no — "$0 forever", donations | — |
| Italy Cookie Choices, Pressidium Cookie Consent | 1 and 2 listings | 9,000 / 10,000 | 2026-10 | no — free, developed on GitHub | — |

Reading against the item's bar (≥ 3 small-vendor freemium plugins in one ≤ 1-week niche, ≥ 1,000 installs, pro ≥ US$29/year):

- **Accessibility helpers — met with one caveat.** Three priced pro tiers at US$69, US$190 and US$259 on 60k / 10k / 10k
  installs; two vendors have 1–2 listings, Equalize Digital has five of which four are ≤ 1,000-install side projects.
  The caveat on the niche itself: the widget/overlay segment is where UserWay (80k) and accessiBe (10k) sell SaaS, and
  overlays carry a reputational and legal argument (the ADA-overlay critique; the US FTC's 2025 order against accessiBe
  for its claims) — a *checker* or *fixer* (Equalize Digital's and Joe Dolson's shape) is the defensible version.
- **WooCommerce checkout-rule utilities — met with one caveat.** Three priced tiers at €64, €99 and US$39/year on 30k /
  20k / 10k installs; Pay for Payment's vendor has nine small listings (a one-person Czech shop, Freemius-billed since
  2014), the other two have 1–2. A fourth (EU VAT Assistant, Freemius-billed, 5k) has a pro tier whose price the Store
  API withholds.
- **VAT / tax-ID validation proper — not met as a small-vendor niche.** The installs sit with multi-plugin WooCommerce
  shops (WPFactory's EU VAT 7k, WP Desk, Vendidero's OSS 10k, Updraft's compliance 3k) and the official WooCommerce
  "EU VAT Number" extension; the one small vendor is Aelia. Country-specific tax-ID fields do get installs on their own
  (Spanish NIF/CIF 10k, Portuguese NIF 5k, Czech IČO/DIČ 2k) — there is no UK equivalent (company number + VAT number)
  in the directory, which is the gap the §5 first item uses.
- **Cookie consent — not met.** The small-vendor banners are free and the paid ones are SaaS consent managers; a new
  banner would compete with Complianz (1M), CookieYes (1M), Cookiebot and Real Cookie Banner (100k each) for free.

What the directory does for a new entrant (Plugin Developer FAQ): one submission at a time; "if your plugin is small and
all the code is correct, it should be approved within fourteen days of initial review"; search shows it "usually 6 to 14
days after a plugin is committed to SVN"; a new plugin has no usage data, so ranking starts from zero. The audience is
real but earned: installs come from directory search on the plugin's name and tags, not from a shelf that lists every
paid app on one page the way Atlassian's and JetBrains' do.

## 5. Call: promote reshaped — the 2026-10-28 exchange ranks it with the Atlassian and JetBrains shelves

Both gates in the item hold on primary sources: a UK individual sells on Freemius without a company or VAT registration
(FAQ, Supported Countries), the all-in cost is ≈ 9.6 % + 50¢ (3.8 % + 50¢ + 2.3 % WordPress + ≈ 3.5 % gateway) with a
US$100 payout floor and 40–70 days to the first money, and two ≤ 1-week niches show three small-vendor freemium plugins
each at US$39–259 a year on 10k–60k installs. What is weaker than the other two shelves: no single "paid plugins" page
sends buyers (installs are earned per search term), a two-stage wait (review ≤ 14 days after it starts, search 6–14 days
after commit), and a PHP/WordPress toolchain (plugin headers, readme, Plugin Check, SVN release, the Freemius SDK) that is
new to this operation. What is stronger: the lowest owner load of the three (name, address and a PayPal/GBP payout on
Freemius; a WordPress.org account; no ID document, no trader page), the directory's counts are public and keyless, and
the free tier is itself a distribution asset (GPL, listed, updated from WordPress.org).

- **Promote reshaped**: for the 2026-10-28 exchange — open a `wp-plugins` venture queue (venture.json as `idea`, RESEARCH.md
  from this spike) whose first item is **UK business checkout fields for WooCommerce**: company number and VAT number
  fields at checkout with format checks and the keyless VIES check for EU numbers, reverse-charge handling and the
  numbers on order emails — complete and free on WordPress.org (guideline 5) — with a Freemius-billed pro add-on at
  US$39/year per site (per-country rules, Companies House name lookup on the buyer's own free key, invoice fields, CSV
  export), modelled on the country-field plugins (10k / 5k / 2k installs for ES / PT / CZ) and priced at Pay for
  Payment's floor; the accessibility checker is the second shape if the exchange prefers it. Score as a line: evidence
  1.5 (fee, payout, eligibility, installs and three prices per niche from primary sources) × reach 2 (the directory's
  search plus Freemius billing) ÷ 5 build days (new toolchain, SDK, review) = 0.6, weight 2 → 1.2 — alongside the
  JetBrains utility (0.75 × 2) and the Atlassian macro (≈ 1 × 2); the exchange ranks the three.
- **Owner actions, batched into the decision** (CLAUDE.md: identity on a service — ask first): a Freemius seller account
  (name, address for the reverse invoices, PayPal or a GBP bank payout; ~15 min) and a WordPress.org account to submit
  under (the plugin page shows the account's display name). None raised today.
- **Kill rule for the line, if opened**: < 200 active installs 60 days after approval, or 0 pro licences 90 days after the
  pro add-on is on sale.
- **What the next read needs**: the Freemius *Vendor terms* page (the seller agreement; not fetched today), EU VAT
  Assistant's pro price (Aelia's shop page is client-rendered), and whether a Companies House lookup in the pro tier can
  run on the *buyer's* key without putting the owner's key on a server (it can: the plugin calls the API from the buyer's
  site with the buyer's key, as the country-field plugins call VIES).
