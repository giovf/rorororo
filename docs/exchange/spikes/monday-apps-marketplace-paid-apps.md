# Spike: the monday.com apps marketplace as a paid shelf

Queue item `new-ventures/spike-monday-apps-marketplace-paid-apps` (burn-down, 2026-10-24 00:18–00:40 UTC). Sources: five
fetch-relay rounds (`docs/relay/responses/new-ventures-research-2026-10-24`, `monday-apps-marketplace-2026-10-24`,
`monday-apps-marketplace-{b,c,d,e}-2026-10-24`, pruned after 7 days): monday's app-developers page, the developer docs read as
their `.md` variants (monetization, implementing monetization, plans and pricing, seat-based pricing, installs,
marketplace programs, partner program, the 2024 monetisation-requirement and revenue-share changelogs), the rendered
Marketplace, two community threads on payouts and seat pricing, and two small vendors' own price pages. WebSearch
found the URLs and the rival price points. The question the research left open (2026-10-24): can a UK individual
monetise through monday's billing, what is the payout path, and is there a ≤ 1-week niche with paying buyers?

## 1. The shelf's terms (monday's own pages)

| Source | What it says |
| --- | --- |
| App-developers page (`monday.com/w/app-developers`, last modified 2026-10-21) | "You can offer free, paid, or usage-based plans using monday.com's billing system. monday.com collects payments on your behalf, handles renewals, taxes, and compliance, and transfers the proceeds to you (after fees and revenue share). Once your app reaches $200,000 in lifetime accumulated revenue, the revenue-sharing program activates: for every subsequent month, 85% of revenue goes to you and 15% goes to monday.com." Shelf size on the same page: **1.6M app installs**, **49 % of all accounts** (87 % of enterprise accounts) have installed at least one app, 250k customers. Publishing: "develop independently and submit your app anytime for review" against the app review checklist, the listing requirements and the Vibe design system; a list of saturated categories to avoid. Partner Program tiers from US$5K ARR (Bronze) to US$1M+ (Platinum). |
| Monetization (`apps/docs/monetization`, 2025-10-23) and Implement monetization (2026-01-30) | "All new marketplace apps must be monetized by monday rather than an external monetization system" (since July 2024); "our platform handles the entire payment and billing process, including VAT and currency conversions"; payments are received "directly through **Payoneer**" — the prerequisites list "Payoneer eligibility verified", and step 5: "Register as a vendor: … you will receive an email from **Zip** with a link to register. You can't receive payments from monday until this process is completed." The app itself must check and enforce the subscription at runtime ("Failing to do so may lead to customers using your app for free!"). |
| Plans and pricing (2026-02-25) | Feature-based (≤ 15 plans) or **seat-based** (default for new seat-based apps since August 2025): "customers purchase the app for all seats in their account", priced by seat buckets with a progressive per-seat discount, monthly and yearly cycles; every seat-based app must include a trial (default 14 days), free buckets optional; prices in USD, every plan submitted as a pricing version for approval. |
| Submit your app (2026-02-25) | Four phases; "any app developer can build and list an app". **"New apps built primarily using no-code platforms or AI-generated 'vibe code' are not eligible for marketplace approval."** Review covers product, engineering, security, privacy, content, assets, support, documentation and legal; first response within 72 business hours, then a shared board; "submissions that do not demonstrate clear, unique value … or significantly replicate the functionality of existing marketplace apps may be declined." Terms to accept: the Marketplace Listing Terms and the Developer Terms. |
| Partner Program (2026-03-13) | Tiers from Bronze (US$5K ARR) to Platinum (US$1M); every tier requires monday monetisation, a security questionnaire, a customer SLA (< 48 h, < 24 h from Gold), the listing agreement signed; payments and sales reports monthly. |
| Community thread "App payouts – Payoneer?" (developer-community, 2023-08-30, monday staff) | "monday.com transfers the fees to the developers using Payoneer"; "Becoming an approved monday vendor is a one-time task"; the developer is invited to a payments board the first week of the month after a sale, issues an **invoice** against the subscriptions report, and "you will get paid either on the 15th or the 30th of the month". |
| Analytics docs (Installs, Payment, Sales; 2025-11-20) | Install, uninstall, install-to-pay conversion, ARR/MRR dashboards are **developer-side only** (Developer Center, no API); the public listing shows a rating, its count and — on the rendered Marketplace cards — an install band ("3K", "5K", "8K"). |

## 2. Eligibility and payout for a UK individual

- **Who may sell.** monday's pages say "any app developer" and name no company requirement; the gates are a Payoneer account (open to individuals in the UK — Payoneer's own eligibility, not read here) and vendor registration through Zip, monday's procurement system, which asks for the payee's tax and bank details. Neither page read says whether a sole trader without a company passes Zip's vendor form; no first-hand individual account was found in the two community threads. **Unread — this is the owner-side question the exchange would carry.**
- **Payout path.** Payoneer only (no bank wire option is described), monthly, by invoice against monday's subscriptions report, paid on the 15th or 30th; no payout floor is stated anywhere read (against US$500 Atlassian, US$200 Wix/JetBrains, US$100 Zoho). Payoneer's own withdrawal fee to a UK bank (typically up to 2 % or a flat fee on GBP withdrawals) sits on top of monday's 0 %.
- **Fee.** 0 % until US$200,000 lifetime revenue per app, then 15 % on the app-developers page — but the **Marketplace Listing Terms** (last updated 2024-08-28, §4(j)) say: "Starting September 1, 2024 … monday.com collects a Revenue Share from the Net App Revenues of your Apps, at a proportion determined by monday.com at its sole discretion ('Revenue Share Rate'). monday.com may any time modify the Revenue Share mechanism, or Revenue Share Rate, the Revenue Share term, or any part thereof", and §4(a) reserves "listing fees … upon a sixty (60) days notice". The 0 %/15 % is a programme, not a contract term.
- **Payment mechanics (Listing Terms §4(b)).** After each calendar month monday reports the Net App Revenues past the Refund Period; the developer **issues an invoice** to monday (at least 15 days before a Payment Cycle), net of the Revenue Share, "any processing, banking or other charges", refunds and withholding; payment "in two billing cycles each month … to a bank account designated by you". Taxes: monday collects indirect taxes where it is registered and issues the user's tax invoice; income tax is ours. Jurisdiction Tel Aviv; indemnity and a reserved right to require insurance naming monday as additional insured.
- **Who signs.** The Terms and the Developer Terms both bind "you, either individually, or on behalf of your employer or any other legal entity" — an individual can sign; the legal checklist asks for a "company/entity name", a Terms of Service and a privacy policy "under the same entity name", which a sole trader's trading name satisfies.
- **Obligations.** Runtime enforcement of subscriptions in our own code; a support SLA (the marketplace SLA; < 48 h for Bronze partners); a privacy policy and the security/privacy checklist; a website with an install button (partnership checklist); continuous compliance after listing.
- **The AI-code rule.** The submission page excludes apps "built primarily using … AI-generated 'vibe code'" from approval. This operation's apps are written by Claude Code end to end; CLAUDE.md's own rule for other projects' contribution terms (2026-10-11) is to respect them and skip a project that forbids AI-assisted work. Nothing on the page defines "primarily" or how review detects it; a disclosed, test-covered, reviewed codebase is not what "vibe code" describes, but the listing form would have to be answered truthfully if it asks, and the honest answer is that the code is AI-written.

## 3. Demand

**Shelf size (monday's own page):** 1.6M app installs, 49 % of all accounts with at least one app, 250k customers. **Listing counters:** the Marketplace cards show a rating, its count and an install count; the listing page itself shows the rating only, and its Pricing tab loads on click (unreadable through the relay's one scroll-through), so prices below come from vendors' own pages. The developer-side dashboards (installs, install-to-pay conversion, ARR/MRR) are private.

**Trending this week** (rendered 2026-10-24 00:22 UTC; small studios, not monday or enterprise vendors):

| App (vendor, partner tier) | Rating (count) | Installs |
| --- | --- | --- |
| SuperForm (Spot-nik, Platinum) | 5 (89) | 11.3K |
| DocExport PDF Generator (Tower Apps, Gold) | 5 (58) | 10.9K |
| SuperMail (Spot-nik) | 5 (56) | 9.5K |
| Connected Boards Automations (Fantasy Media, Gold) | 5 (41) | 6.5K |
| M365 SharePoint & Outlook (David Simpson Apps) | 5 (38) | 25.7K |
| Templify (Workiflow) | 5 (35) | 6.4K |
| GetSign (Jetpack Apps) | 4.9 (149) | 8.1K |
| Same Item Multiple Boards (Pioneera, Gold) | 4.9 (98) | 9.6K |
| Subitem Automations (Fantasy Media) | 4.9 (71) | 27.1K |
| Board Reports Automations (Fantasy Media) | 4.9 (33) | 17.9K |
| DriveSync (Baruzo Tech) | 4.9 (30) | 12.4K |
| VLOOKUP auto-link (Jetpack Apps) | 4.8 (173) | 15.8K |
| Time Tracking – Tracket (Avisi Apps) | 4.7 (43) | 9K |
| Microsoft Power Automate (Plugin Genie) | 4.5 (13) | 5.7K |
| Outlook Integration (Unitask) | 4.5 (30) | 16.3K |
| Recurring Tasks (Upscale/Adaptavist) | 4.2 (17) | 15K |
| Google Sheets Automations (Pioneera) | 3.8 (20) | 9.8K |
| Calendar MasterPlan (appSolution, Bronze) | 4.9 (15) | — |
| Google Calendar Sync (Super Workday, Silver) | 5 (11) | — |
| Google Forms Integration Plus (Fantasy Media) | 5 (30) | — |

**New apps** (the same render): 15 listings with 1–114 installs each (median 5) — Formula Column Automation 13, Print 8, StatusTrail 6, Gantt Dependencies 66, Quizell 114 — the pace a new entrant starts at.

**Prices (vendors' own pages, seat-bucket plans, USD per account per month):** SaaSJet Time in Status US$1 (≤ 2 seats) → 11 (20) → 22 (50) → 31 (100) → 58 (200) → 79 (unlimited) on the annual plan, US$2–84 monthly; SaaSJet Email to Tasks US$8 (5 seats) → 25 → 40 → 75 → 125 → 250; Creativas free to 2 seats then US$5/4 for 3 seats, scaling with the monday plan one-to-one; Dropcontact's monday enrichment needs its €24/user/month Pro plan; 7pace Timetracker free to 2 seats then by account tier. Every seat-based app bills the account's **total** seats (guests excluded), so a 50-seat account pays US$20–40 a month for a one-job utility — the unit price the Atlassian macro lacked (US$0.10–0.69/user there).

**The niche the spike named (a UK company / charity record panel from the gankdat registers):** the enrichment slot is held by API-key resellers — Surfe, Lusha, ZoomInfo, Dropcontact (legal company data, €24/user) and monday CRM's own Crunchbase-powered Data Enrichment (beta, Standard plan and up). No Companies House, charity-register or UK-VAT app surfaced in the index. The product checklist's saturated list (Q1 2026) is multi-tool automations, Microsoft and Google integrations — not registers. So the job is open, but with no paid rival to prove a buyer, which is the weaker of the two evidence shapes STRATEGY §5 counts.

## 4. Gate check (ARCHITECTURE validation gate)

| Gate | Reading |
| --- | --- |
| Buyers with money | Yes — 1.6M installs; small studios' one-job apps at 5K–27K installs with 30–170 ratings; seat-bucket plans of US$20–80 a month per mid-size account |
| Recurring job | Yes — monthly or yearly subscriptions billed by monday, VAT and currency handled |
| Paid competitor with a documented gap | No for the register panel (no rival; the enrichment slot is held by API-key resellers); yes for generic utilities (time tracking, templates, PDF) where the small vendors already sit at 4.7–5 stars |
| ≤ 1 week to build | The view itself is a day; the review checklist is not: Burp scan of every domain, encrypted tokens with evidence, a domain-association JSON, Terms of Service and privacy policy under the entity name, an iframe-safe how-to page, in-app onboarding, the value-created event, a support SLA, then a 72-business-hour first response and a shared review board. Five to seven working days end to end, review time excluded |
| No policy / ToS risk | **Fails as things stand**: the submission page says "New apps built primarily using no-code platforms or AI-generated 'vibe code' are not eligible for marketplace approval." This operation's code is AI-written by design; CLAUDE.md's rule for other projects' contribution terms (2026-10-11) is to respect them. Also: the Revenue Share Rate is discretionary in the Terms, listing fees can start on 60 days' notice, and the developer indemnifies monday with insurance on request |

Owner actions the line would need: signing the Listing Terms and Developer Terms as an individual, Payoneer onboarding and Zip vendor registration (identity, bank, tax), a public privacy policy and Terms of Service under the trading name — and, given the AI-code rule, a decision to submit with the code's provenance disclosed. Capital: £0 (monday code hosting or a Cloudflare Worker; no fees today).

## 5. Promote / park call

The item's promote shape was a one-job board/item view priced per seat through monday's billing. Terms, billing and demand support it better than any shelf read since Figma Community: billing supplied with VAT handled, no payout floor, 0 % until US$200k per app (as a programme), install counts in the tens of thousands for small studios, and seat-bucket unit prices of US$20–80 per mid-size account.

**Recommendation: park.** The shelf's own submission page excludes apps "built primarily using … AI-generated 'vibe code'". Every line of this operation's code is written by Claude Code; submitting under a form that excludes it is either a misrepresentation or a declined review after a week of checklist work, and the operation's standing rule (CLAUDE.md, 2026-10-11) is to respect a platform's terms on AI-assisted work rather than argue them. The exchange is not asked to overrule this; it is asked to note the trigger. Secondary reasons that would weigh on a promote even without that clause: the discretionary Revenue Share Rate and listing-fee right in the Listing Terms (the 0 %/15 % is marketing, not contract), the Burp-scan-and-evidence review (a week, not a day), and the lack of a paid rival for the register panel.

**Trigger** (idea `monday-apps-marketplace-paid-apps`, parked): monday's submit-your-app page drops or defines the AI-generated-code clause in a way a disclosed, test-covered, human-reviewed codebase meets — or the owner, reading this, decides the operation should submit with the provenance disclosed in the review board and accept a decline (an owner-only call, batched into the exchange's next request, not raised today). Re-read the page at the 2026-12-01 exchange. If it changes: promote reshaped as a seat-based view app in a non-saturated category (a register-verification panel or a status-time utility), evidence 1.5 × reach 2 ÷ 6 days ≈ 0.5, weight 2 as a new line.

Numbers in one line: individual **can sign** (Listing + Developer Terms "either individually"); payout bank/Payoneer twice monthly by invoice, no floor; fee 0 % to US$200k then 15 % (programme) with a discretionary rate in the Terms; 1.6M installs, 49 % of accounts; 17 small-studio apps at 5.7K–27.1K installs; prices US$1–250/account/month by seat bucket; AI-written apps not eligible; call: **park**, trigger the clause.
