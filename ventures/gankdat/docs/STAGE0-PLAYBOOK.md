# Launch-marketing playbook — for a first-time marketer

> **Strategy update 2026-07-11:** the Stage 0 gate is retired — the platform
> ships multiple niches in parallel and lets shipped-product signal decide
> (signups via `npm run scoreboard`, visitors via `npm run traffic`, and the
> website `/feedback` form). This playbook remains the marketing sequence to
> run **per dataset launch** — the 20-signup figure below is a progress
> benchmark, not a go/no-go gate, and "pivot" steps now mean "deprioritize
> that dataset," not "abandon the platform."

**Benchmark: 20 signups per niche within ~4 weeks of genuine effort.** Post
copy lives in `GO-TO-MARKET.md` — this doc is the WHEN, WHERE, and
WHAT-NEXT. Log "I'd pay" signals in the table at the bottom; they now arrive
via the feedback form too.

Positioning reminder: **lead with procurement / bid-intelligence** (Find a
Tender, less contested, bigger budgets) and the **agent-native angle**
(MCP + x402). Planning is the bundled second dataset, never the headline.

## The five rules (read before every post)

1. **Disclose.** Always "I built this". Communities forgive self-promo from
   builders who show up honestly; they bury stealth marketing.
2. **Never argue.** Criticism → "fair point, noted — what would make it
   useful for you?" Every critic is a requirements interview.
3. **One venue per day, max.** Posting is 20% of the work; the follow-up
   window (first 2–4 hours of comments) is where signups happen. Don't
   post anywhere you can't babysit that day.
4. **Lead with the reader's pain or a concrete number** (the /stats pages
   exist for this), never with "I launched a product".
5. **Same copy never posted twice.** Each venue gets its tailored draft
   from GO-TO-MARKET.md, adjusted to that day's real numbers.

## Week 0 — prep (~2 hours, once)

- [ ] **Account readiness.** HN and Reddit distrust fresh accounts. If yours
      are new or dormant: spend 3–4 days leaving genuinely helpful comments
      (HN threads about APIs/Cloudflare/agents; r/webscraping questions you
      can answer). No product mentions. You're buying credibility.
- [ ] **LinkedIn profile line** mentions you're building gankdat (people
      check who's DMing them).
- [ ] **Verify the funnel yourself**: incognito browser → gankdat.com →
      get a key → make a request. Any friction you feel, fix first.
- [ ] **Search Console + Bing Webmaster**: verify domain, submit
      `sitemap.xml` (accelerates /stats indexing; Bing feeds ChatGPT).
- [ ] Skim each target venue's self-promo rules (they differ; some require
      a "Show and tell" flair or specific day).

## Week 1 — builders (the agent-native angle)

| Day | Action | Copy | Follow-up |
|-----|--------|------|-----------|
| Tue | **Show HN**, 13:00–15:00 UK (morning US East). | GO-TO-MARKET "Show HN" | Stay online 4h. Reply to EVERY comment. Technical questions = your best content; answer precisely. |
| Wed | Keep replying on HN (day-2 comments are calmer and often the buyers). | — | Note every "I'd use this if X" → the pre-commit table. |
| Thu | **r/webscraping** post. | GO-TO-MARKET "r/webscraping" | Same discipline. |
| Fri | **MCP community Discord** + **Cloudflare Discord** showcase channels: 3-line show-and-tell + link. | trim the HN post to 3 lines | Casual; answer questions same day. |
| Sat | **X/Twitter thread** on the x402 angle ("a UK data API agents can pay per-request, no signup") tagging the x402/Base ecosystem; post in Base/CDP builders Discord. Coinbase devrel amplifies real x402 services — we're one of the first live ones. | fresh 4–5 tweet thread; include the Basescan settlement link | Reply to every QT/reply. |

## Week 2 — buyers (bid-intelligence, LinkedIn)

| Day | Action | Notes |
|-----|--------|-------|
| Mon | **LinkedIn post** (copy in GO-TO-MARKET; put the link in the first comment, not the post — reach penalty). | Reply to every comment; connect with everyone who engages. |
| Tue–Fri | **3 personalized DMs/day** to bid managers, bid-writing consultants, framework specialists (search LinkedIn for "bid manager" + UK). LinkedIn DMs avoid PECR email rules entirely. | Opener: one real stat from `/stats/uk-tenders` relevant to THEIR sector, then "built an API that serves this as clean JSON — free tier, would it help your pipeline?" Never pitch price first. |
| any | Join 2 UK public-procurement LinkedIn groups; comment helpfully for 2 days before posting the LinkedIn draft there. | |

## Week 3 — long tail + follow-ups

- **Indie Hackers** post (copy in GO-TO-MARKET) — this one invites the
  validation question directly; harvest pre-commits.
- **dev.to build-log article** (recycle the HN post + what HN taught you).
- **Console.dev** submission (free dev-tool newsletter) + one or two
  "there's an API for that"-style directories.
- **Follow up week-2 DMs**: one polite bump after 4–5 days ("any thoughts?
  happy to run a query for you") — then STOP. Two touches max, ever.
- Anyone who signed up: short thank-you + "what were you hoping to query?"
  — their answer is roadmap gold and your warmest pre-commit lead.

## Week 4 — assess and decide

Run `npm run scoreboard`:

- **≥20 signups or ≥5 pre-commits** → gate passed. Execute "After Stage 0"
  in GO-TO-MARKET (RapidAPI/Apify listings, deepen procurement data).
- **Close but short** → one more cycle on the single best-performing
  channel only (the scoreboard's by-day chart + `npm run traffic` UAs tell
  you which post moved numbers).
- **Flat after genuine effort** → pivot review per the blueprint: next
  candidate is sanctions/compliance screening; swapping `src/sources/`
  keeps the whole platform (see NICHE-LAUNCH-CHECKLIST.md).

## Follow-up discipline (applies everywhere)

- Reply window: first 2–4 hours decide a post's fate. Never post-and-ghost.
- "Would you pay?" is asked ONLY after someone volunteers interest — then:
  "what would make it worth £5–25/mo to you? which filters/fields?"
- Every conversation gets one line in the log below, same day.
- No purchased lists, no bulk email, nothing PECR-grey. LinkedIn DMs and
  public posts only, unless the cold-email guardrails in GO-TO-MARKET are
  followed to the letter.

## Pre-commit & conversation log

| date | who / where | signal ("would pay", filters wanted, objection) | follow-up |
|------|-------------|--------------------------------------------------|-----------|
|      |             |                                                  |           |
