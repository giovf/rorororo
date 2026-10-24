# Spike: paid rivals for the owner's "autonomous AI operation" starter kit

Queue item `new-ventures/spike-ai-setup-course-rivals` (burn-down, 2026-10-19 00:12–00:35 UTC). Sources: the fetch relay
(`docs/relay/responses/ai-setup-course-rivals-{,b-,c-}2026-10-19`, pruned after 7 days — three Gumroad listings, two
Gumroad Discover searches of 36 cards each, Gumroad's pricing page, Stripe's Managed Payments overview, how-it-works and
eligibility pages) and WebSearch for the Udemy figures (udemy.com answers 403 to a GitHub runner). Exchange trigger under
test (`ai-setup-course`, parked 2026-10-18): **at least two paid rivals sell a comparable kit or course at ≥ £20 with
visible sales/reviews**. Gumroad ratings come only from buyers, so a ratings count is a floor on sales.

## 1. The kits found by WebSearch (listing pages read)

| Listing (seller) | Price | Ratings | Promise, audience |
| --- | --- | --- | --- |
| The Agentic Coding Starter Kit (Jovan Chan) | US$9 | 0 | CLAUDE.md / .cursorrules templates for five stacks, 4 subagents, slash commands, hook recipes, MCP configs; "make your AI coding agent act like a senior engineer" — developers |
| Claude Code Agent OS — 30+ Subagents (Planful Nest) | US$29 | 0 | 26 subagents, 12 slash commands, safety hooks; "from blank to a pro-grade AI coding workflow in about 5 minutes" — developers |
| Claude Code Ops Kit — Production Safety in 15 Minutes (Yurukusa) | US$0 pay-what-you-want | 0 | 910 example hooks, 56 CLI commands, 261 test files; guards for "autonomous Claude Code sessions" that delete files or push to the wrong branch — developers |

None of the three shows a buyer. `refund_policy` is null on all three (Gumroad's default applies). None names a
non-technical buyer: every one assumes a repo, a terminal and a running Claude Code.

## 2. Gumroad Discover, "claude code" and "autonomous ai agents claude" (72 cards)

Paid Claude products at ≥ £20 (≈ US$27) with buyer ratings:

| Listing (seller) | Price | Ratings (avg) |
| --- | --- | --- |
| Claude OS (Ziks, "Your AI Guy") | US$47 | 39 (5.0) |
| Claude Code de 0 a 100 + bonus (Bariq Rifki, Spanish) | €37 | 7 (4.9) |
| Job Search OS in Claude Code (Aakash Gupta) | US$49 | 6 (4.8) |
| PM Operating System in Claude Code (Aakash Gupta) | US$49 | 6 (4.8) |

Below the bar or unsold: Claude Code: Practical Guide for Product Designers US$19 (3 ratings); My Complete Claude AI
Collection US$39 (1); Claude Like a Pro AUD 399 (1); Content OS in Claude Code US$49 (1); Claude Code Masterclass Pro
US$80 (0); Claude Code Ultimate Bundle US$49.99 (0); Claude Code Mastery Guide "…to Autonomous Multi-agent" US$39.99 (0).
Free products carry the big counts: Motion Graphics with Claude Code (193 ratings), Houdini AI Assistant (57), Master
OpenClaw (29).

**The owner's framing — a non-technical buyer gets an autonomous operation that earns — is the one shape with no
buyers:** "Ship While You Sleep: Build AI Products That Earn 24/7" US$24 (0 ratings), "AI Operator Kit" US$39 (0),
"Tonka's Dungeon — Multi-Agent AI Business Build Guide" US$9.99 (1), "Build an AI Agent That Builds AI Content Teams"
free (11). What sells at ≥ £20 is a *way of working* for people who already use Claude Code for a job they have
(product management, job search, design, "Claude OS" as a personal system).

## 3. Courses (WebSearch, secondary — Udemy answered 403 to the relay)

- Udemy "Claude – Master Claude Cowork, Claude Code, Skills & Plugins": 4.4 from 1,403 ratings, 17,760 students, list
  US$119.99, Udemy sale price US$15–25.
- Udemy "The Complete Claude AI Course: From Chat to Cowork": 4.6 from 133 ratings, 1,187 students, aimed at non-coders,
  states a Claude Pro subscription (US$20/month) is required — the honest-prerequisite precedent.
- Udemy "Claude, Claude Code, Claude Cowork, and Claude in MS Office": 4.0 from 1,391 ratings; recent reviews call parts obsolete.
- Free floor: Anthropic's "Claude Code in Action" (4.9 from 246 DataCamp reviews), DataCamp "Claude Code 101" (4.8 from 2,055).
- Top end: Code with Mosh US$249; AI Hero live cohort US$795.

## 4. The shelf

- **Gumroad** (pricing page, relay): 10 % + 50¢ per direct sale, 30 % on sales that come through Discover, no monthly
  fee; Gumroad is the merchant of record and "will automatically handle all sales tax collection and remittance
  worldwide" (VAT, GST). Fees are not returned on refunds (secondary). Needs a Gumroad account on the owner's identity
  (~10 min, payouts to a UK bank). Discover is the only distribution the line would have.
- **Stripe Managed Payments** (docs, relay): sells "digital products such as SaaS, software, and digital content or
  downloads" with "Online courses and training" and software among the eligible tax codes; direct integrations only;
  "your business must be based in one of the supported business locations — North America, Europe, Asia Pacific" (the
  country list is rendered client-side; round c read the Markdown copy — see below); Stripe handles tax in 80+ countries,
  may refund within 60 days, monitors dispute rate; Link is shown to the buyer as the seller. Fee ≈ 3.5 % on top of
  processing (secondary; ARCHITECTURE's figure). Uses the existing Stripe account — no new identity — but brings no
  traffic. Round c (the page's Markdown copy) lists **GB** among the supported European business locations (31 countries), so the existing Stripe account qualifies subject to Stripe's eligibility review.

## 5. Gate check (ARCHITECTURE validation gate)

| Gate | Reading |
| --- | --- |
| Buyers with money | Yes — four paid Claude Code kits at £28–37 with 6–39 buyer ratings each; 17,760 students on one Udemy course |
| Recurring job | No — a one-off download; mitigated by versioned updates (Gumroad re-delivers) |
| Paid competitor with a documented gap | Partly — none of the rated kits covers unattended scheduled runs, a work queue, a watchdog or a run log (what Foundry has); but every listing that leads with "autonomous / earns 24/7" has 0–1 buyers, so the gap may be a gap in demand, not supply |
| ≤ 1 week to build | Yes — the files exist; ~1 day to scrub, document a 10-step walkthrough and record a 5-minute screen capture |
| No policy / ToS risk | Yes if the listing says a Claude subscription, a terminal and GitHub are required, uses no Anthropic branding beyond nominative use, and any launch price has a real end date (DMCC Act 2024) |

## 6. Recommendation: promote, reshaped — not as the owner framed it

**Trigger met** (four rivals ≥ £20 with visible sales, two needed). Promote as a **"Claude Code operations kit" for
people who already run Claude Code** — what the buyer gains: a schedule that runs work unattended, a work queue the
sessions pick from, a watchdog, a relay for blocked hosts, a run log the owner reads from a phone — at **US$29–39 on
Gumroad** (Discover at 30 % is the discovery channel; the direct link at 10 % for the owner's own posts), tax code
"software / online training". **Do not build the non-technical "autonomous money machine" version**: the evidence
says that promise does not sell on this shelf (six such listings, 0–1 ratings), and it cannot be made honestly — a
buyer still needs a Claude subscription, a terminal, GitHub and judgement, and Foundry's own ledger shows the operation
has not yet earned. The FOMO ask is answered by a launch price with a dated end, nothing else.

Score for the exchange (STRATEGY §5): evidence 2 × reach 2 ÷ (1 day + 15 owner minutes) ≈ **4**, weight 2 as a new line.
Owner minutes: a Gumroad account (identity) or, if round c lists the United Kingdom, Stripe Managed Payments on the
existing account with a Payment Link (no new identity, no Discover traffic). Kill rule: fewer than 3 sales in the 30
days after listing → park with the number. Proof row for the venture: sales count and ratings on the listing at day 30.
