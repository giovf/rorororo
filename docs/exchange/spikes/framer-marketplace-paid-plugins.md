# Spike: the Framer Marketplace as a paid plugin shelf for a sole trader

Queue item `new-ventures/spike-framer-marketplace-paid-plugins` (burn-down, 2026-10-22 21:00–22:00 UTC; the 20:35 slot
seeded it and pushed the first relay round, the 20:45 slot released the claim while that round ran). Sources: three
fetch-relay rounds (`docs/relay/responses/framer-marketplace-2026-10-22` from the pre-research, `framer-plugins-2026-10-22`
and `framer-plugins-b-2026-10-22`, pruned after 7 days): the help articles *How the Creator Program works*, *How to publish
a plugin* (updated 15 September 2026) and *How refunds work on the Marketplace*, the creators page (`/partner`), the legal
index with the **Acceptable Use Policy v2.0 (effective 9 April 2026)** and the **Community Terms**, the plugin listing
rendered in Chromium (`RENDER`: all plugins, `?price=paid`, and the Utilities, CMS and Localization categories) and
43 plugin pages (Utilities, CMS, Localization, Media, AI, Libraries, Integrations, Ecommerce). WebSearch
supplied the refund article's URL and the prices that creators publish only on their own sites (FrameAuth, Frameship,
Framer Commerce, CMS Translator), marked third-party where the figure comes from a blog rather than the creator. Six guessed
help and legal URLs (how-to-sell-a-plugin, marketplace-payouts, how-to-get-paid-as-a-creator, legal/marketplace-terms,
legal/creator-program-terms, legal/creator-terms) are 404 — Framer publishes no marketplace or payout terms page.
The question the pre-research left open: does Framer bill paid plugins itself (and if so what is the payout path for a UK
individual), what do paid plugins cost, who sells them, and does the shelf show any demand numbers?

## 1. Who bills: the creator, not Framer — the 0 % is a directory fee

| Source | What it says |
| --- | --- |
| *How to publish a plugin* (15 Sep 2026) | "Share your plugin with the Framer Community … **You keep 100% of your plugin revenue** and gain visibility through the Community." The listing form asks for "Pricing information, **if your plugin includes paid features**" and the tips say "Clearly explain any paid features or upgrade options." FAQ: "Do I need approval before my plugin is published? **No.** Plugins are published immediately after you submit them. There is no review process or waiting period." Upload is a `.zip` from `npm run pack`; new versions and edits "at any time". |
| *How refunds work on the Marketplace* (15 Sep 2026) | Purchases "are made directly from independent creators"; **Framer does not process Marketplace payments or issue refunds**; the creator's refund policy is on "the checkout page, confirmation email, or payment receipt"; Framer Support "can help facilitate communication but cannot approve or issue refunds". Template listings found by WebSearch carry the line that Framer "doesn't handle refund processing" and products "are purchased directly from their respective creators". |
| Creators page (`/partner`) | "Keep everything you make on the Marketplace. Framer takes a 0% cut from your work"; "Gain visibility … on a platform visited by thousands daily"; "$753,000 total paid out to creators in November". The testimonials name the money's actual route: "@lmsqueezy Template Sales: $694" and "a Partner payout from @framer on @contra" (the referral commission, paid through Contra). |
| *How the Creator Program works* | Creators "earn through Marketplace sales and referral commissions"; "For paid templates, you keep 100% of the revenue"; "Plugins, components, and vectors do not generate referral commissions but can still generate direct sales revenue if sold through the Marketplace"; enrolment by publishing, then "Wait for the review process to be completed. Once approved, you'll gain access to the" Creator dashboard (the review is of the Creator Program application, not of the plugin — see the publishing article). |
| Templates EARN page (WebSearch) | Payment and delivery through "Lemon Squeezy, Gumroad, Polar, Stripe Payment Links, or another checkout provider". |
| The plugin pages themselves | No price field and no `Offer` in the `Product` ld+json; a plugin's price appears only where its creator wrote it into the description, and the buy path is the creator's: Josie "Buy license", Imagegen "Acquire an Imagegen license key", FrameAuth "Launch checkout (Stripe, Lemon Squeezy)" with its own pricing page billed by Lemon Squeezy, The Design Futurist "unlocked … at thedesignfuturist.zip/pricing", FrameLoc "Plans and pricing: frameloc.app/pricing" (a Lemon Squeezy checkout). |
| Legal index (`/legal/`) | Ten documents: Acceptable Use Policy, Affiliates, AI Notice, Community Terms, Cookie Statement, DPA, Expert Terms, Privacy Statement, Terms of Service, Trademark Guidelines — nothing titled marketplace, creator or payout. |

**Community Terms v1.0 (effective 1 June 2026)** — the creator agreement, read in full tonight (`framer-plugins-b-2026-10-22/1.html`):

- **Parties and eligibility** (preamble, §1): between Framer B.V. (Netherlands) and "the entity or person" accessing the
  Services; "You must have an active Framer account in good standing to participate. Framer may approve or reject any
  Creator Content in its sole discretion." No company, country, age or tax-status clause anywhere in the text.
- **§6.3 Payment**: "**Framer does not process, collect, hold, or disburse any payments between Creators and End Users.
  All payment transactions for paid Creator Content are conducted directly between Creator and End User.** Framer has no
  liability in connection with any such payment transactions, including disputes, chargebacks, refunds". §6.1: "Creator
  may designate Creator Content as free or paid"; Framer "may run promotions on your Creator Content without prior notice".
  §6.2: the creator "is responsible for all applicable taxes … including payments received by Creator from End Users".
- **§2.7**: "Creator Content may not include unlockable features or functionality that require payments through channels
  **not disclosed to and approved by Framer**" — the listing's "pricing information" field is where the channel is
  disclosed; with publishing immediate and unreviewed, approval is after the fact (§5.2: Framer may remove or suspend a
  listing "in its sole discretion").
- **§3**: "You may advertise or sell your Creator Content on third-party websites or marketplaces, including your own
  website" — no exclusivity. **§4.1**: the creator alone supports end users and must publish "a valid support email".
  **§4.3**: every end-user dispute over "pricing, refunds, warranties" is the creator's.
- **§7.3** assigns the licence automatically: free content under a "Limited Commercial License", paid content under a
  "**Single-Use Commercial License**" — "solely for the Permitted Project", not "in more than one project, website,
  product, or client engagement" — which is why the shelf's paid utilities price **per project** and why every plugin
  page says "License: Limited". §7.2 grants Framer a royalty-free licence to host, promote and "resell, distribute" the
  content on the Community. §8: either side ends the agreement at will. §12.4: Framer's liability is capped at US$100.

Reading: **Framer is a free directory with a one-click install, not a store.** It never bills the buyer, so it has no fee,
no payout, no minimum, no tax form and no eligibility rule beyond a Framer account (CLAUDE.md: creating one puts the owner's
name on a service — one owner action of about five minutes, £0, on a free plan). The payout path is whatever processor the
creator wires into the plugin — for this operation that is **Stripe Managed Payments plus the Ed25519 licence keys already
built for the Chrome products (`@foundry/licensing`, `packages/license-worker`)**: no new account, and unlike Figma we see the
buyer's email and set the refund policy. Per US$12 sale the creator nets about: Figma Community US$10.20 (15 %), Gumroad
US$10.30 (10 % + 50¢), Lemon Squeezy US$10.90 (5 % + 50¢), Stripe Managed Payments about US$11.20 (≈ 3.5 % on top of
processing; Stripe UK card rates 1.5 % + 20p domestic to 3.25 % + 20p international). The lowest fee of the six shelves read
this week — because the shelf does nothing but list.

## 2. What the shelf is (listing, discovery, rules)

- **Categories**: AI, CMS, Code, Ecommerce, Integrations, Libraries, Localization, Media, SEO, Styles, Utilities; sort
  Trending / Best / Recent; a **Price** filter. The filter is a client-side menu: `?price=paid` rendered the same 24
  trending plugins in the same order as the unfiltered page, so the paid set is not URL-addressable and the relay's
  `RENDER` (no clicks) cannot open it.
- **A listing shows**: name, byline, screenshots, description, creator and handle, Published and Updated dates, "License:
  Limited" (all 43 pages say the same; Framer does not define the term on the page), one category tag,
  the creator's other listings and four related plugins — each with a **Paid / Free** label. **No install, like, rating,
  review or purchase count anywhere**, on cards or pages (Figma shows users and likes). Demand cannot be read from the
  shelf — the same blindness as the Wix App Market, without even Wix's review counts.
- **Scale**: "Browse hundreds of plugins". The sibling and related lists on the pages read label **150 distinct
  plugins: 74 Paid, 76 Free** — about half the shelf charges.
- **Publishing**: immediate, no review, `.zip` upload through the Community's "Create Listing → Plugin"; the plugin API is
  React + TypeScript (the developers page: "extend Framer's capabilities with standard React and JavaScript"), the same
  stack as Variables Toolkit.
- **Acceptable Use Policy v2.0 (9 April 2026)** §2 forbids any "robot", "spider" or "page-scrape" of the platform and §3
  bans adult content; §4 lets Framer remove content and suspend accounts at its discretion. Today's reads were two one-off
  rounds of about 60 public pages at page-view pace; **no recurring fetch of framer.com is scheduled and none may be** (CLAUDE.md:
  no scraping of sites that forbid it). A re-read of this shelf is a one-off relay round, never a scanner.

## 3. Paid plugins read (listing pages 2026-10-22; prices as the creator states them)

"Listings" is the creator's plugin count from the "From <creator>" block (the plugin itself included). Prices marked
*(site)* come from the creator's own site via WebSearch, *(blog)* from a third-party comparison and are unverified.

| Plugin | Category | Creator (listings) | Price | Billing path |
| --- | --- | --- | --- | --- |
| Image & Video Lightbox Gallery | Media | Şafak Otur (2) | **US$14 one-time per project** | creator checkout |
| Josie UI Kit | Libraries | Frederik Roessell (3) | **US$49** launch price for the first 100 buyers, then **US$99** one-time | "Buy license" |
| The Design Futurist | Libraries | THE DESIGN FUTURIST (1) | free install; premium items singly or a **Lifetime membership from US$99** | creator's own site |
| Framer Forms Connect | Integrations | Roman's design (2) | **US$29** one project / **US$8.99 a month or US$59 a year** unlimited sites / **US$89** forever; 7-day trial | creator checkout |
| Lantis — Translate your site | Localization | Pol Domingo (1) | **€3 a month per language** (€2.50 each from 2, €2 from 10); first 100 translations free | creator subscription |
| FrameAuth | Integrations | Danny Sapio (1) | **US$14.99 a month billed yearly** *(site)*, 1,000 members, 14-day trial | Lemon Squeezy *(site)* |
| Imagegen | AI | new dawn studio (1) | one-time licence key "valid forever" (price not on the page); images cost the buyer's own OpenAI key about US$0.02 each | licence key |
| Frameship | Ecommerce | Insert Frame (5) | "One-time fee"; **from US$99** *(blog)* | creator checkout |
| Framer Commerce | Ecommerce | Framer Commerce (1) | **US$12 / 24 / 40 a month** by product count *(blog)* | creator subscription |
| Kompa | Libraries | Kompa (1) | "One-time purchase — no subscriptions"; free tier; price not on the page | creator checkout |
| FrameLoc | Localization | Elias ALVES (1) | "One-time payment per project"; price on frameloc.app | Lemon Squeezy *(site)* |
| Edit Image | Media | Fehmi Özüseven (3) | credits (5 free at sign-up) | creator account |
| CMS Translator | CMS | — | **€19 one-time** Pro *(WebSearch, listing text)* | creator checkout |
| Paddle Checkout | Ecommerce | — | **US$19 one-time** Pro (pre-research, listing text) | creator checkout |
| Password Gate | Utilities | Khushal Dewra (KDX Studios) (5) | free gate; **Pro US$19 lifetime** | creator checkout |
| Breakpoint Pilot | Utilities | Nacy Dev (5) | free scan; **Pro US$19 one-time** | Gumroad (hoanle.gumroad.com) |
| Noteframe | Utilities | Insert Frame (5) | free solo; **US$3.99 a month per team member** | creator subscription |
| React Export | Code | Tommy D. Rossi (5) | **US$50 a month** hobby or **US$250 a month** commercial | creator subscription |
| PDF Export | Utilities | Chris Lacorte (5) | free tier; Pro 300 exports a month on a monthly subscription (price not on the page) | creator subscription |
| Template Checker | Utilities | Syed Saboor (2) | first 5 checks free, then paid (price not on the page) | creator account |
| Layout Scale | Utilities | George Kvasnikov (1) | "Upgrade to Pro" (price not on the page) | creator checkout |
| Superfields | CMS | Insert Frame (5) | "One-Time Purchase — pay once" (price not on the page); Mapframe upgrade in-plugin | creator checkout |
| AI Design to Framer | Code | Frederik Roessell (3) | "Requires a license key" (price not on the page) | licence key |
| Migrate | AI | Tommy D. Rossi (5) | free credit quota, then purchased credits tied to the buyer's Google account | creator account |
| Punchcut | Ecommerce | Şafak Otur (2) | Paid label; the plugin is itself a licence-selling checkout on Stripe and PayPal | creator checkout |
| VideoFrame, FramerForms, Feedify RSS, Figma Sync | Media, Utilities, Utilities, Styles | Insert Frame (5), Insert Frame (5), Benjamin Barak (4), Benjamin Barak (4) | Paid label, price not on the page | — |

Reading: **14 paid plugins carry a stated price, 11 of them on their Framer listing page** (the bar was 10): one-time per project
US$14–29, one-time lifetime US$19–99 (a **US$19 lifetime Pro tier appears twice among the Utilities** — Password Gate and
Breakpoint Pilot — and is the utility price point), subscriptions US$3.99–250 a month where a service runs behind the
plugin. Of the 13 Utilities read in round b, 8 carry a paid tier. The Paid/Free labels on the sibling and related lists
name **150 distinct plugins: 74 Paid, 76 Free**.

- **Creator size**: of the 32 creators on the 43 pages read, 13 have a single listing and
  7 have two or three; the 12 creators with four or five listings (Insert Frame, Tommy D. Rossi, Apex
  Interactive, Nacy Dev, KDX Studios …) mix paid and free. Small creators selling one US$14–99 plugin are the shelf's norm — the pattern
  the Atlassian and JetBrains reads showed and the Wix and Notion reads did not.
- **Price shapes**: one-time per project (US$14–29), one-time lifetime (US$19–99), a few subscriptions (US$8.99–40 a
  month) where the plugin runs a service (translation, auth, commerce). A per-project one-time price is the shelf's
  default for a utility.
- **What nobody can read**: how many of those sell. Framer publishes no counts and the creators' own sites publish none
  (the creators page's US$753,000 month and US$6.5M year are template-heavy and not split by product type).

## 4. Fit: a Framer port of Variables Toolkit

- **Code**: a Framer plugin is React + TypeScript on the `framer-plugin` API; Variables Toolkit is TypeScript on the Figma
  plugin API with a plain-DOM UI. Framer has **Color Styles and Text Styles**, not variables, collections or modes, so the
  port is the *styles* half of the toolkit: import a token file (W3C DTCG JSON, CSS custom properties, Tailwind config) as
  Framer styles, export styles back out, and audit a project for hard-coded colours and fonts that match a style. The
  variable-specific features (modes, aliases, scoping) have no Framer counterpart. Estimate 2–3 days including the
  Stripe checkout and licence-key unlock (both exist) and the listing copy (exists, re-targeted).
- **Checkout**: free tier (export + audit) and a US$19 one-time per-project unlock through Stripe Managed Payments, key
  validated in the plugin — the same gating the Chrome products use. Framer takes nothing; refunds are ours to set.
- **Rival check still owed**: the **Styles** category and the token/CSS-variable plugins already on the shelf were not read
  tonight (one `RENDER` of `/marketplace/plugins/categories/styles/` plus their pages). If a free style-sync plugin already
  covers import/export, the paid part shrinks to the audit.
- **What the Figma listing taught** (`ventures/variables-toolkit/RESEARCH.md` §10): 0 installs and 0 purchases at day 30
  on a shelf that *does* show counts; the free companion is the install channel. The Framer port would launch the same way
  (free tier first) on a shelf where nobody — buyers included — can see that it has no installs yet.

## 5. Call: **promote reshaped — the exchange ranks it on 2026-10-28**

- **Who bills — answered**: the creator. Framer's 0 % is real because Framer never touches money; there is no Framer fee,
  payout, minimum, schedule or tax form to read, and nothing on Framer's side restricts a UK individual. The operation's
  own Stripe Managed Payments and licence keys are the payout path, which no other shelf read this week allows.
- **Prices — answered**: 14 paid plugins with a stated price (§3), small creators at US$14–99 one-time.
- **Demand — unreadable**, by design of the shelf, so the evidence factor stays at 1: paid small-creator plugins exist in
  numbers (about half of 150 labelled plugins are paid) but no count says any of them sells. STRATEGY §5:
  evidence 1 × reach 2 (a marketplace Framer says thousands visit daily, our own checkout) ÷ (3 build days + 5 owner
  minutes) ≈ **0.7** — above the parked Wix and Notion ideas, below the Atlassian Forge macro (same reach, a readable
  install bar) unless the Styles-category read on 2026-10-28 shows the token gap open.
- **Trigger for the exchange on 2026-10-28**: one relay round — `RENDER` the Styles category and `GET` the style/token
  plugin pages it names. If no paid token-import plugin exists there, open a `framer-plugins` queue with the port as its
  first item (2–3 days; free tier + US$19 per project; kill at 0 purchases and fewer than 10 free-tier keys issued 60 days
  after listing), with the owner action batched: a free Framer account in the owner's name (~5 min, £0). If a free plugin
  already covers import and export, park with that reading.
- **Rules this shelf adds**: no automated reads of framer.com beyond one-off relay rounds (AUP §2); the plugin's listing
  must state the paid feature and price in its description (the help article's own guidance and the UI-copy convention).

## 6. What this run did not read

- The Styles category and any existing token or CSS-variable plugin — the exchange's 2026-10-28 read.
- Any sales figure for any plugin: none is published anywhere reached tonight.
- The CMS and Localization category listings as rendered pages: the two `RENDER` lines were dropped when relay run 153
  timed out installing Chromium (fixed in `docs/ci/fetch-relay.yml` tonight); the category plugin pages read cover them.
