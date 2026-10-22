# Spike: the Atlassian Marketplace as a paid shelf for a Forge app

Queue item `new-ventures/spike-atlassian-marketplace-forge-shelf` (build, 2026-10-22 09:10–09:35 UTC). Sources: four
fetch-relay rounds (`docs/relay/responses/atlassian-marketplace-forge-shelf{,-b,-c,-d}-2026-10-22`, pruned after 7 days):
Atlassian's partner due-diligence page, the pricing/payment/billing FAQ, the become-a-partner page, the Marketplace
Partner Agreement, the 2026 revenue-share post, five developer-community threads on individual vendors (97755,
101919, 102081, 102404, 102458, read as Discourse JSON so every post is dated and attributed), and the keyless
Marketplace REST API 2 (`/rest/2/addons?hosting=cloud&cost=marketplace&application=…`, 1,350 paid cloud apps with
installs, reviews and vendor; `/pricing/cloud/live` for 25 apps; `/versions` for 12). WebSearch only found the URLs.
The question the pre-research left open (2026-10-20): can a UK sole trader sell paid-via-Atlassian, and is there a
niche with paying buyers that we could build in ≤ 1 week?

## 1. Eligibility: a UK sole trader can be a paid partner

| Source | What it says |
| --- | --- |
| Partner due diligence (developer.atlassian.com, last updated 2026-04-21) | Since 2 June 2025 every partner who wants to upload an app gets a one-time Partner Verification ticket. Prerequisites: "Business name, physical address, registration number **and/or** tax identification number" plus an ID document for the primary contact (passport, licence). Two forms (Identity Information Collection, Partner Security Questionnaire) within 14 days, then a **Stripe Identity** check (ID photo + selfie on a phone); business verification is asynchronous. Rejected partners cannot upload apps; false sanctions matches can appeal. |
| Become a partner | "If you're an individual developer without a parent company, then simply create a partner profile using your name (for example, 'Joe Bloggs')." |
| Thread 101919 (UK sole trader, HMRC UTR, no company) | Atlassian staff (ianRagudo) escalated it to the Partner team as ECOHELP-151223 on 2026-08-03; the poster reported on **2026-08-10**: "Confirmed that a UK sole trader can register on the individual path" (a private document; the thread itself holds no Atlassian-written answer). |
| Thread 102404, reply 2026-09-01 (FranciscoLoureiro) | A Portuguese sole trader with no company was verified in August 2026 and his app "is now submitted as Paid via Atlassian". The Identity form has an explicit **"Are you a Sole Proprietor?"** question; he used his personal tax number for both the registration number and the tax ID and his home address as the business address — accepted, no business certificate asked. Paid via Atlassian makes Atlassian a US withholding agent: a **W-8BEN** (individual) is attached to the ECOHELP ticket; without it the statutory 30 % is withheld; Atlassian classed app sales as business profits (treaty Article 7); the W-8BEN is valid to 31 December of the third year. |
| Thread 97755 (2026-03-02) | The opposite reading ("a registered business entity is required") is the poster's paraphrase of a support reply, five months older than the two first-hand accounts above. |
| Partner Agreement §4.4, §4.7 | Payment by **EFT to a bank account in your name**, ~30 days after the month's end, accrued until ≥ **US$500** net is due; wire fees ours; Atlassian collects and remits sales taxes on paid-via-Atlassian sales; income tax is ours. |

Reading: yes — the individual path exists, is documented on Atlassian's own pages, and two 2026 sole traders (UK, PT) passed
it for paid apps. For the owner it is ~30 minutes: the Identity form (name, UTR as the tax ID, home address), a passport
photo and selfie through Stripe Identity, and a W-8BEN with the UTR on line 6a claiming the UK–US treaty (Article 7
business profits → 0 % withholding; the Portuguese account says Atlassian first asked for a US TIN, which the W-8BEN
instructions do not require for a treaty claim). All of this puts the owner's identity on Atlassian (CLAUDE.md: ask
first) — it is the one owner action the line needs and it is batched into the exchange's decision, not raised today.

## 2. The shelf's terms (read on the FAQ and the 2026 revenue-share post)

- **Fee**: "As of 1 January 2026, partners will receive 100% of gross revenue earned on Forge, up to $1 million in
  lifetime Forge revenue"; standard Forge rate 84 % partner share from 1 April 2026, **83 % from 1 October 2026**
  (Connect 75 %); Forge-only = no Connect modules, OAuth, UI Kit or Custom UI; the 0 % incentive "is temporary and may
  change", with ≥ 6 months' notice on standard rates.
- **Payout**: "We owe you remittance for your sales after you reach $500 USD in profit. We pay you within 30 days after
  the end of the month in which you accrue $500+ USD in profit" (so 30–60 days after a sale, same 30-day refund window
  as Atlassian products); remittance report and CSV monthly from ap@atlassian.com, payment between the 17th–20th.
- **Payment models**: Paid via Atlassian, Paid via Vendor, Free; Free → Paid via Atlassian is **not allowed** (a free
  launch cannot later be monetised through Atlassian — the first listing must be paid).
- **Pricing structure** (live prices): every cloud app lists one monthly price for the 10-user tier and annual prices per
  user tier (annual = 10 × monthly). The 10-user tier is **US$0 on 20 of the 25 apps read** (the rest US$1–5/month), so
  the small-site installs that make up much of an install count pay nothing. Per-user monthly price = annual 100-user
  price ÷ 1,000.
- **Support duty** (agreement §6.3): respond to critical requests within 24 h, others within five business days — fits
  the routines (a daily inbox pass), but it is a duty.
- Forge hosting is free (read by the 2026-10-20 pre-research via WebSearch; the `forge-pricing` docs URL answered 404 to
  the relay today, so the figure is unverified by this spike).

## 3. Demand (Marketplace REST API 2, keyless, 2026-10-22)

**Market size**: 4,477 paid cloud apps (`cost=marketplace`): 1,399 Confluence, 3,079 Jira. The list orders by
popularity, so the first 600 Confluence (installs down to ~30) and 750 Jira (down to ~29) results cover the installs
band the spike needed:

| | Confluence (600 sampled) | Jira (750 sampled) |
| --- | --- | --- |
| apps with 200–999 installs | 176 | 328 |
| … from vendors with 1–2 listings in the sample | 23 | 83 |
| distinct vendors in sample | 234 | 314 |
| median installs in sample | 239 (both) | |

(`/rest/2/vendors/{id}` answers 410 Gone, so "listings" counts the vendor's paid apps inside the sample, a floor.)

**The buildable niche — macros that render text (Mermaid, Markdown, PlantUML, LaTeX, code, sequence diagrams)** — Forge
UI Kit macros of this shape are a few days' work. Paid apps with ≥ 200 installs from vendors with 1–2 listings:

| App (vendor, listings) | Installs | Reviews (avg) | First release → latest | US$/user/month at 100 users | 10-user tier |
| --- | --- | --- | --- | --- | --- |
| Markdown Importer for Confluence Cloud (yamuno, 1) | 911 | 4 (4.1) | 2023-08 → 2026-10 | 0.30 | free |
| PowerPlantUML (skylab-ventures, 1) | 434 | 20 (3.5) | 2018-06 → 2022-05 (unmaintained) | 0.69 | free |
| Mermaid Diagrams Integration (skanda, 1) | 453 | 10 (2.8) | 2021-11 → 2026-10 (5 versions) | 0.20 | free |
| Sequence Diagrams for Confluence (ohara, 2) | 252 | 10 (2.0) | 2016-01 → 2026-10 | 0.10 | US$1 |
| SequenceDiagram.org for Confluence (nosparetime, 1) | 230 | 2 (5.0) | 2022-07 → 2026-09 | 0.22 | free |
| Advanced Codeblocks (codeclou, 2) | 202 | 3 (4.6) | 2021-10 → 2026-10 | 0.36 | US$2 |
| Properties — Templates, Metadata & Databases (junovi, 1) | 488 | 18 (4.9) | 2025-02 → 2026-10 | 0.60 | free |

Leaders and ceilings in the same niche: Mermaid Diagrams for Confluence (stratus, 2 listings) 6,228 installs at
US$0.40; Mermaid (tech-labs, 4) 804 at 0.20, last release 2024-12; Apportunity Mermaid (8 listings) 465 at 0.34, launched
2024-08 (the fastest grower: ~210 installs/year); linhtechnology Mermaid (7) 585 at 0.20. **Free rivals cap the price**:
Atlassian Labs' own Mermaid diagrams viewer (7,665 installs) and Better Code Macro (2,707), Render Markdown (3,854),
Mermaid Chart (4,088), PlantUML for Confluence (appsfoundry, 1,191), Mermaid (narva, 726) — their `/pricing/cloud/live`
answers 404, i.e. no paid plan.

**Where ≥ US$1/user/month is paid** (small vendors, ≥ 200 installs): GoEdit — edit attachments (1 listing, 816 installs,
102 reviews 4.8, US$1.90), Cenote Lockpoint — attachment checkout (1, 740, 29 reviews 4.9, US$2.12), Document Control
e-signing (2, 217, US$1.25), Lango AI translator (1, 581, US$1.10). These are workflow/compliance jobs, not macros: each
is a > 1-week build or needs a third-party service.

Other niches read (paid only): `variables` 17 apps — none from a small vendor above 200 installs (MultiExcerpt 3,597 and
Linking 1,212 are Appfire's, 90 listings); `glossary` 16 — Smart Terms 1,150 (4 listings), Glossary 768 (7); `page
properties` 931 — Properties 488 (1 listing, above) is the only small-vendor entry; `export pdf` 323 — all large vendors
(k15t 8,705; Appfire; narva); `lookup` 15 — nothing buildable.

**Revenue arithmetic for a new entrant** (assumptions stated): a new text-render macro at the niche's US$0.30–0.50 and the
observed small-vendor install rates (50–300 installs/year; Apportunity 210, Markdown Importer 290, Properties 290, the
rest 40–90) gives 50–300 installs after a year; the 10-user tier is free so a paying site needs ≥ 15 users — if 30 % of
installs pay (unknown; no source gives conversion) at a median 50 users, that is 15–90 paying sites × US$15–25/month =
**US$225–2,250/month at month 12, at 0 % fee**, first payout when net profit passes US$500 (months 3–9 at those rates).
The lower bound beats every line this operation runs today (£0); the upper is a leader's pace in a niche with six free
rivals, one of them Atlassian's.

## 4. Gate check (ARCHITECTURE validation gate)

| Gate | Reading |
| --- | --- |
| Buyers with money | Yes — 4,477 paid cloud apps; seven small-vendor paid apps with 202–911 installs in the buildable niche, paying US$0.10–0.69/user/month |
| Recurring job | Yes — monthly or annual subscriptions billed by Atlassian |
| Paid competitor with a documented gap | Partly — two of the seven are unmaintained (PowerPlantUML since 2022-05, tech-labs Mermaid since 2024-12) and three carry ≤ 2.8-star averages (skanda 2.8, ohara 2.0, atly export 3.2); but the gap is quality, not an unmet job |
| ≤ 1 week to build | Yes for a UI Kit / Custom UI macro (3–5 days); no for the US$1+ workflow apps |
| No policy / ToS risk | Yes — first-party shelf, Atlassian as commercial agent collects tax; the Marketplace security questionnaire and the 24-h critical-support duty are real obligations |

Owner actions the line would need: partner verification on the owner's identity (Stripe Identity selfie, UTR, W-8BEN;
~30 min, £0) and an Atlassian account whose API token lets CI run `forge deploy` (same pattern as the Figma plugin's
publish). Capital: £0 (Forge hosting free as read 10-20; no domain).

## 5. Promote / park call

The item's own promote rule was: an individual can verify **and** ≥ 3 small-vendor paid apps show ≥ 200 installs **at ≥
US$1/user/month** in a ≤ 1-week niche. First half: **met**. Second half: **not met** — in every buildable niche the
small-vendor apps charge US$0.10–0.69/user/month (seven apps ≥ 200 installs), and the ≥ US$1 apps are > 1-week workflow
builds. So by the rule as written this is a **park**.

Against the rule: this is the first shelf since Figma Community that passes the operation's gates on its own evidence
— buyers present (4,477 paid apps, hundreds with 200–999 installs), billing and tax handled, a 0 % fee until US$1M, a
sole-trader path two people walked in 2026 — and the price bar was set before the pricing structure (free 10-user tier,
per-user tiers) was known; a US$0.40/user/month macro on a 50-user site is US$20/month, which is the unit that matters.

**Recommendation: promote, reshaped, at the 2026-10-28 exchange** — not a 15th Mermaid macro, but a Forge-only
Confluence macro in the text-render niche where the ≥ 200-install small-vendor apps are unmaintained or ≤ 2.8-star,
priced at US$0.40–0.50/user/month with the 10-user tier free, scored by STRATEGY §5 as evidence 1.5 (buyers and prices
read from the shelf; our conversion unknown) × reach 2 (billing supplied, 300k+ cloud customers) ÷ 3 build days ≈ 1,
weight 2 as a new line; kill criterion: < 25 installs or 0 paying sites 60 days after listing. The exchange decides
and, if it promotes, opens the `atlassian-apps` queue with the owner's verification as the queue's first `blocked_on`
(one owner request, batched). If it parks: trigger = a second shelf fact changes (the 0 % incentive ends, or a
small-vendor macro passes US$1/user/month).

Numbers in one line: sole trader **yes** (UK 2026-08-10, PT 2026-09-01); payout EFT ≥ US$500, 30–60 days; fee 0 % to
US$1M (83 % after); 4,477 paid cloud apps; 7 small-vendor paid macros with 202–911 installs at US$0.10–0.69/user/month;
free 10-user tier on 20 of 25; call: promote reshaped, exchange 2026-10-28 decides.
