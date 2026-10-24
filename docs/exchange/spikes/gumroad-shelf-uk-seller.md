# Spike: Gumroad as the shelf for the parked Claude Code operations kit

Queue item `new-ventures/spike-gumroad-shelf-uk-seller` (burn-down, 2026-10-24 19:18–19:35 UTC). Sources: four fetch-relay
rounds (`docs/relay/responses/gumroad-shelf{,-b,-c,-d}-2026-10-24`, pruned after 7 days) — the Gumroad **Terms of Service**
(effective 1 January 2025, last updated 14 September 2026), the **pricing** page, **Prohibited Products and Activities**
(last revised 16 September 2026), 24 help-centre articles (Getting paid, payout settings, fees, sales tax, EU & UK VAT,
Discover, Discover indirect taxes, ratings, PayPal checkout, currency, suspension FAQ, fraud, things not allowed, creator
privacy, payout delays, 1099/DAC7, refund policy, custom refund policy, licence keys, multiple accounts, services, the
Claude connector, content protection, why Gumroad) and the four rival listings from spike `ai-setup-course-rivals` re-read
today. Two relay lessons for the next reader: `help.gumroad.com/article/…` redirects to the help index (the 14 rendered
pages in round b are the sidebar only); the articles live at `gumroad.com/help/article/<id>-<slug>` and a plain GET
returns an Inertia shell whose `data-page` attribute carries the article HTML — no RENDER needed, decode the attribute.

The question the 2026-10-19 spike left open (its "round c"): does Gumroad take a UK individual, what does the account ask
of the owner, what are the fees, VAT and payout as published today, how does Discover list a product, and have the four
rivals moved?

## 1. Eligibility: a UK individual sells, is paid in GBP to a UK bank, and goes through Stripe's KYC

| Source | What it says |
| --- | --- |
| Getting paid — bank payouts table | **UK — GBP** is in the direct-bank-payout list (standard US$100 minimum; "We can only pay out to a local bank account and in your local currency"). |
| Payout settings — Requirements | "If you are 18 or older, you fill out these settings yourself"; full legal name, a physical address (no PO box); account type **Individual** "if you operate under your name (effectively as a sole proprietor) or do not have business registration documents" — no company needed. |
| Payout settings — A. Identity verification | Payouts run through Stripe's KYC: "At some point, Stripe will request several of the following: your date of birth, legal name, phone number, and address; a government ID number; a scan or image of your photo ID (passport, driver's license, or ID); proof of home address (recent utility bill, bank statement, rental agreement)". Non-US tax IDs are "the list of Tax IDs accepted by our payment processor (Stripe)" (not read; for the UK that list is NINO/UTR territory — the owner's accountant's question). |
| Getting paid — prompt payouts | "A valid, government-issued photo ID; proof of residence in that country, or a business registered there." |
| Terms §4.2 | Gumroad may itself ask for "full legal name, mailing address, phone number, date of birth, taxpayer identification number …, bank account information, and a form of government-issued identification". |
| Creator privacy | Buyers see the profile name and the account (or support) email; "never … your banking information, payout information, or address" — with a rare exception where the name or phone from payment settings reached a buyer's card statement via Stripe. |
| Terms §6.7; licence-keys article | The product stays licensed by the seller to the buyer under the seller's own end-user terms; Gumroad issues licence keys per purchase with a keyless verify API (`/v2/licenses/verify`) — the kit can ship with a key and check it, or not. |

Reading: **yes, a UK sole trader is written into the pages** — "Individual" account, GBP payouts, 18+. What the owner would
do once (~30 minutes, and it puts the owner's identity and ID document on Gumroad/Stripe — CLAUDE.md: ask first): create the
account, choose Individual, enter name, date of birth, address, phone and a UK bank account, and answer Stripe's ID and
proof-of-address requests when they come. Nothing on the shelf is anonymous: the profile name and email are public.

## 2. The shelf's terms (Terms of Service 14 September 2026, pricing page, fees article)

- **Model**: Gumroad is the **merchant of record** — the seller appoints Gumroad as non-exclusive reseller (§1.1, §6.1);
  Gumroad invoices the buyer, handles refunds, chargebacks and disputes as first-tier support (§6.2d) and "will be treated
  as the seller of your Products for purposes of any relevant Indirect Tax" (§6.2e). The seller "shall not issue any
  invoice or make any demand for payment to any Buyer" (§6.1).
- **Fee** (pricing page and fees article, same day): **10 % + US$0.50 per direct sale, and that "does not include" card
  processing of 2.9 % + US$0.30** (PayPal fees likewise) — so the published "10 %" is ≈ 15–16 % at US$29–39 (table below);
  **30 % flat on Discover sales, "which includes all processing fees"**; no monthly fee; direct fee drops to 5 % + 50¢ above
  US$20,000 of sales in a month (not our problem). The Terms carry no percentage (§6.4 names a per-transaction "Gumroad
  Fee"), so the numbers can change without a Terms change. On a refund Gumroad's own fee comes back and only the
  processing part is kept (fees article, 2026 text — the 2026-10-19 reading "fees are not returned" is out of date).
- **Price**: the seller gives a "suggested retail price"; Gumroad "reserves the right to set the price (or license fee)
  at which such Product is offered for resale" (§6.3) — a reseller clause Etsy, Payhip and JetBrains do not have in this
  form. Prices display in a chosen currency; eligible card buyers are charged in their local currency, the seller's
  earnings are in USD at the time-of-sale rate (currency article).
- **Payout**: weekly (or monthly/quarterly) once the balance reaches **US$100**; "payouts include sales made through the
  previous Friday (UTC)" with a **7-day holding period**; the UK's payout day is **Wednesday**; bank transfers land in 2–7
  business days. Before the first payout an **account review** of 1–3 weeks, "typically 3–4 sales with a balance over
  US$100"; every payout day before the review passes is silently skipped and the balance held (payout-delays article).
  Self-purchases are treated as fraud and never count. A country change forfeits unpaid amounts on a connected account
  (§11.4, new in the September 2026 Terms); PayPal payout only where no bank payout exists (2 % fee, USD).
- **Refunds**: the seller sets a custom policy per product; Gumroad "reserves the right to issue refunds within 90 days
  of purchase, at its discretion, to prevent chargebacks"; a dispute rate above 1 % of customers forces a 30-day
  money-back guarantee on the whole account; a chargeback rate above 1.5 % holds 25 % of each payout in reserve.
- **Identity and suspension**: §4.2 as above; suspensions are "manually reviewed by our risk team"; a Stripe rejection is
  final and unappealable; "misleading or deceptive marketing" is a named hold reason (suspension FAQ) — the FOMO copy
  rule from the 2026-10-18 owner note is also a shelf rule here.
- **Tax reporting**: Gumroad files no DAC7 and no UK return — the owner self-reports the Supplier Fees as trading income,
  the ledger makes that visible (ARCHITECTURE).
- **Prohibited products** (gumroad.com/prohibited and "Things not allowed", both current): the entries that touch this
  kit — "**AI services** which includes selling access to AI tools, chatbots, image or content generation services, or
  subscriptions to AI services that are fulfilled outside of Gumroad"; "**installation or tech support services** — your
  customer pays you on Gumroad, and you install or manage software for them remotely" (services article, account-closing);
  "consulting firms"; "security brokerage services (including … 'get rich quick' schemes, business opportunities …)";
  "deceptive marketing practices"; reselling anything the seller did not create; a product "whose only way of delivering
  it is telling buyers to message you somewhere else" is blocked at publish. A kit of configuration files, prompts and
  scripts the buyer runs on their own Claude subscription sells no access to an AI service and is delivered as files on
  Gumroad, so it is outside those entries — **provided the listing sells the files, never "access", a subscription, a
  set-up service or support beyond "email me if a link breaks"**; and the "get rich quick / business opportunities" entry
  rules out the owner's "autonomous money machine" framing on policy as the 2026-10-19 spike ruled it out on evidence.

**Effective take at the kit's price points (direct link vs Discover, before VAT, which Gumroad adds on top for UK/EU buyers):**

| List price | Direct: 10 % + 0.50 + 2.9 % + 0.30 | Seller keeps | Discover 30 % | Seller keeps |
| --- | --- | --- | --- | --- |
| US$29 | US$4.54 (15.7 %) | US$24.46 | US$8.70 | US$20.30 |
| US$39 | US$5.83 (15.0 %) | US$33.17 | US$11.70 | US$27.30 |
| £6.99 ≈ US$9.30 (the tax workbook, for the twin question) | US$2.00 (21.5 %) | US$7.30 | US$2.79 | US$6.51 |

The last row answers a side question the day's Payhip spike raised: at the workbook's price Gumroad's fixed 50¢ + 30¢
makes it the dearer twin (21.5 % vs Payhip's ≈ 9 %); Gumroad is a shelf for US$29+ items, not a second home for a £6.99 one.

## 3. VAT and sales tax — Gumroad collects and remits, on top of the price

- "Gumroad handles VAT on behalf of creators for all digital product sales in the EU and the UK. We collect, remit, and
  even allow buyers to refund VAT" as merchant of record (VAT article); the pricing page dates the worldwide
  merchant-of-record switch to **1 January 2025** and all seller tax settings are gone.
- VAT is **added at checkout on top of the seller's price**; "Can I choose not to charge VAT … or make it inclusive? No";
  "Do you charge higher fees on VAT sales? No"; a refund returns the VAT too. UK buyers of a US$29 kit therefore pay
  US$34.80 and the seller's take is unchanged — the fee table above holds.
- Discover sales may carry marketplace-facilitator tax in six US states and Canada (Discover indirect-taxes article) —
  Gumroad's job, not the seller's. A "Reseller Certificate" is offered for sellers who already file indirect-tax returns
  (not the owner, below the UK VAT threshold).

## 4. Discover — the free traffic exists, but only after the shelf trusts the account

The Discover article's **account-level** criteria, in order: payout settings filled; **"reach a balance of at least
US$100 USD from enough genuine sales (not self-purchases or asking your partner/housemates to buy)"**; **"be verified by
our risk team in the risk review process, which can take on average 3 weeks after you pass the $100 threshold"**. Then a
product is listed if it has made at least one successful sale, has a category and has ratings enabled (the default);
Discover products are auto-enrolled in the affiliate programme. Ranking inputs: the article names categories and tags
("the more descriptive and specific your tags are, the better chance you'll have") and ratings (turning ratings off
removes the product from Discover search); nothing else about ordering is published, and no paid placement appears in the
current text. Ratings come only from buyers, within a year of purchase, with a reminder mail five days after purchase.

What this means for a line with £0 marketing and no audience: **the first US$100 — three or four kit sales at US$29–39 —
must come through direct links before Discover shows the product at all**, then a ~3-week review, then listing. The
2026-10-19 spike's plan ("Discover at 30 % is the discovery channel") is right about the fee and wrong about the order:
Discover is the channel for the fifth sale onwards, and the kill rule written for the kit (fewer than 3 sales in 30
days) would fire before the shelf's own traffic ever reached it unless the owner, or the public mirror repo's readers,
bring the first buyers. That is exactly the audience-capture weakness STRATEGY §1 (owner 2026-10-11) ranks lines down for.

## 5. The four rival kits, re-read 2026-10-24 (five days after the 2026-10-19 read)

| Listing (seller) | Price | Ratings 10-19 → 10-24 | What changed |
| --- | --- | --- | --- |
| Claude OS (Ziks, "Your AI Guy") | US$47 | 39 (5.0) → **39 (5.0)** | none |
| Claude Code de 0 a 100 + bonus (Bariq Rifki, Spanish) | €37 | 7 (4.9) → **7 (4.9)** | none; the page exposes `sales_count: 131` — 131 sales for 7 ratings, so ratings understate sales ≈ 19× for this seller |
| Job Search OS in Claude Code (Aakash Gupta) | US$49 | 6 (4.8) → **6 (4.8)** | none |
| PM Operating System in Claude Code (Aakash Gupta) | US$49 | 6 (4.8) → **6 (4.8)** | none |

Zero new ratings on four listings in five days. One listing shows the sales-to-ratings ratio the shelf hides elsewhere
(131 : 7); applied to Claude OS's 39 ratings it would mean several hundred sales at US$47 for a seller with a YouTube
audience — the ceiling is real, and it belongs to sellers who arrive with an audience. All four still carry Gumroad's
default refund handling (`refund_policy: null`).

## 6. Gate check (ARCHITECTURE validation gate) — the shelf facts only; demand is the 2026-10-19 spike's

| Gate | Reading |
| --- | --- |
| Shelf takes a UK individual | **Yes** — Individual account, GBP bank payouts, Stripe KYC (ID document + proof of address), name and email public |
| Published fees hold | **Yes, with a correction** — 10 % + 50¢ is before card processing (2.9 % + 30¢): ≈ 15–16 % direct at US$29–39; 30 % all-in on Discover |
| VAT handled | **Yes** — merchant of record since 2025-01-01, VAT added on top, seller's take unchanged |
| Discover traffic measurable at launch | **No** — Discover lists only after US$100 of genuine direct sales and a ~3-week risk review |
| Policy / ToS risk | **Low if the listing sells files only** — no "access", subscription, set-up or support service; no get-rich-quick or urgency copy; delivered on Gumroad |
| Owner minutes | ~30 min once (account, Individual type, bank, ID + proof of address when Stripe asks); then a payout review of 1–3 weeks after the first 3–4 sales |

## 7. Call: park — the shelf is open to us, the traffic is not

The exchange's W43 trigger for the kit was "open a `claude-code-kit` queue if Gumroad takes a UK individual at the
published 10 % / 30 % **with Discover traffic measurable**; else re-park with the reading." Two of three hold; the third
does not: Discover is gated behind US$100 of direct sales and a three-week review, so at launch the kit has the reach of
our own links only. Re-scored for the 2026-10-28 exchange: evidence 2 (four rivals with buyers; shelf terms read first-hand)
× reach **1** at launch (direct links; 2 once Discover lists it) ÷ (1 build day + 0.5 owner day) ≈ **1.3 → 2.7**, weight 2
= **2.7–5.3** — below the Etsy workbook (24), the Meta hackathon entry (18) and the baseline (18), where the W43 exchange
already placed it at 8 on the optimistic reach.

- **Park**, with this reading in the exchange idea's trigger. What would re-open it: a direct channel of our own that
  can plausibly bring the first four buyers at US$29–39 — the public mirror repo passing ~500 stars, a gankdat.com or
  apps.gankdat.com page with measurable developer traffic, or the owner choosing to post it — or the Etsy tax-workbook
  shop proving the owner's appetite for shelf admin, since the Gumroad account is a second identity step of the same kind.
- **Not the tax workbook's twin**: at £6.99 Gumroad's fixed fees cost 21.5 % against Payhip's ≈ 9 % (today's Payhip spike
  stands).
- **If it is ever built**: list the files (prompts, pipeline and watchdog scripts, relay, run log, a 10-step walkthrough
  and a 5-minute screen capture) with a licence file and a stated 14-day refund policy; copy says a Claude subscription,
  a terminal and GitHub are required; no "access", no set-up service, no urgency claims; US$29 launch, US$39 after a
  dated end; category "Software Development", tags for Claude Code, agents, automation; kill at < 3 sales in 30 days.
- **Owner actions, none raised today**: a Gumroad account on the owner's identity (Individual, UK bank, ID and proof of
  address for Stripe) — batched into the decision if the exchange ever opens the queue.
- **Operational note for later**: Gumroad runs an MCP server for Claude (`gumroad.com/claude/v1/mcp`, help article 355)
  that lists products and sales, creates unpublished drafts and publishes — a routine could keep a listing's price and
  description in step from the repo once the owner authorises it; files still upload by hand.
