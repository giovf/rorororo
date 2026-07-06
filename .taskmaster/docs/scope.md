# Project scope (raw)

> Source: `docs/Faceless Niche Data-API Business_ 2026 Blueprint for Maximum Profit-per-Hour.pdf`
> Text extracted via pdftotext on 2026-07-06 during /setup. This is the raw scope input;
> the approved PRD lives in `.taskmaster/docs/prd.md`.

The Faceless Niche Data-API Business: A 2026 Blueprint for
Maximum Profit-per-Hour
TL;DR
    Build a faceless, single-purpose data/scraping API — a "boring" niche data feed sold on
    usage-based pricing, distributed both to human developers (via your own site +
    RapidAPI/Apify) and, critically, to AI agents (via MCP servers and x402 micropayments).
    This wins on Net Profit per Operational Hour because it has near-zero marginal cost, no
    content-refresh treadmill, ~80%+ gross margins, and an automation ceiling close to zero-
    touch once built.
    Realistic economics: solo founder Adrian Horning took his social-data API "Scrape
    Creators" from launch (June 2024) to $10k+ MRR in ~12 months (self-reported, Indie
    Hackers). A conservative outcome is £1–3k MRR within 9–15 months; moderate £5–10k
    MRR by 18 months; optimistic £15k+ MRR. At maturity, with <2 hrs/week of operations,
    this can mean £50–200+ net profit per operational hour — far above faceless YouTube,
    Notion templates, or affiliate sites.
    Why now: traditional SEO is being gutted by AI Overviews — Seer Interactive's January
    2025 study found organic CTR on AI-Overview queries "plummeted from 1.41% to
    0.64%" (their September 2025 update revised this to a 61% drop, from 1.76% to 0.61%,
    across 3,119 queries and 42 organizations). So ad/affiliate content models are eroding.
    Meanwhile the AI-agent economy (Anthropic reported the Model Context Protocol
    reaching over 97 million monthly SDK downloads and 10,000 active servers with first-
    class support across ChatGPT, Claude, Cursor, Gemini, Microsoft Copilot and VS Code)
    creates brand-new, machine-driven demand for structured data APIs. A data API is
    positioned to benefit from the exact shift that is killing content sites.


Key Findings
 1. The macro shift penalizes content, rewards infrastructure. AI Overviews now appear in
    a large and growing share of US searches, and independent studies show organic click-
    through rate collapses when they appear (Seer Interactive: from 1.76% to 0.61%, a 61%
    drop, in its September 2025 update). This directly erodes programmatic-SEO, faceless-
    content, and affiliate-site models that depend on Google referral clicks. Data/API products
    don't sell via SEO clicks — they sell to developers and increasingly to autonomous agents,
    so they are insulated from (and even boosted by) this trend.
 2. The AI-agent tooling economy is the single biggest emerging tailwind. The Model
    Context Protocol (MCP), open-sourced by Anthropic in November 2024, was donated to
    the Linux Foundation's Agentic AI Foundation on December 9, 2025, with OpenAI and
    Block (Square) as co-founders and AWS, Google, Microsoft, Cloudflare and Bloomberg as
    members — cementing it as the vendor-neutral universal standard for connecting AI
    agents to tools/data. Anthropic reports it grew from ~2M SDK downloads at its November
    2024 launch to over 97 million monthly SDK downloads and 10,000 active servers. The
     x402 micropayment protocol lets APIs charge agents per-request with zero platform
     commission. A niche data API can be wrapped as an MCP server and monetized to agents
     — a distribution channel that did not exist 18 months ago.
  3. Micro-SaaS reality is brutal but the winners are real. Per a ScrapingFish analysis of
     Stripe-verified Indie Hackers products, "54% make exactly zero in revenue." Per
     SaaSRanger's review of 1,000+ products, the median micro-SaaS earns roughly
     $500/month MRR, breaking $1k MRR takes a median of 12–18 months even for good
     execution, and only ~18% reach sustainability. This is survivorship-bias-adjusted: plan
     against the median, not the highlight reel. API/data products are a favorable sub-niche
     because they have low support burden and sticky, infrastructure-like usage.
  4. API-as-a-product has documented solo winners. Adrian Horning's Scrape Creators
     (social-media data API, usage-based credits) reached $10k+ MRR in ~12 months as a true
     solo operation (self-reported, Indie Hackers: "By March 2025, it was paying most of my
     bills. And now, it's at $10k+ MRR"). Tony Dinh's Black Magic (Twitter data tool) is the
     cautionary counterweight: per his own May 2023 newsletter, "I sold Black Magic for
     USD$128,000… At the time of selling, Black Magic was at ~$14K MRR" — forced because
     Twitter's new API "minimum price is now $42,000 per month," which he could not afford.
     RapidAPI niche data APIs with 50–100 subscribers are estimated at $2,000–
     $8,000/month; top Apify scraper developers are estimated at $10,000–$50,000/month
     (both industry estimates, not named/audited).
  5. Adult/AI-companion is the highest-revenue-density option but carries disqualifying
     operational drag for a solo UK operator. Per Appfigures data shared with TechCrunch
     (August 12, 2025), AI companion apps generated $82 million in H1 2025 and were on pace
     to exceed $120 million by December, with the top 10% of apps capturing 89% of revenue;
     NSFW apps charge $15–99/month with exceptional conversion. BUT: the UK Online
     Safety Act (enforced 25 July 2025) mandates "highly effective age assurance" with fines
     up to £18M or 10% of global turnover. Ofcom told LBC that since March 2025 it had
     investigated 30 companies covering 96 sites (23 probes still ongoing), issuing ~£3M in
     fines — including £800,000 against Kick Online Entertainment (plus £30,000 for non-
     cooperation, announced Feb 12, 2026, for failing age checks on motherless.com), £1M
     against AVS Group Ltd (18 adult sites, Dec 2025), and its largest OSA fine of £1.35M
     against 8579 LLC (Feb 2026). In January 2026 Ofcom opened investigations into AI
     services (X's Grok, Joi.com). Payment processing requires high-risk providers (CCBill,
     Segpay) charging 5–15% with rolling reserves. This is legal and lucrative but the
     compliance + payment-risk overhead violates the "near-zero ongoing maintenance"
     constraint. It is the runner-up, not the winner. Swell

Details
1. The Core Concept & Monetization Engine
The vehicle: A single-purpose, faceless niche data API — pick one narrow, valuable, hard-to-
get, frequently-changing dataset and turn it into a clean JSON endpoint. Examples of the type
(not prescriptions): structured data from a vertical that lacks a good official API (e.g., a specific
category of public listings, sports/statistics niches, financial/alt-data, e-commerce pricing in a
vertical, social/creator metadata, regulatory/government data, job postings in a niche). The
product is "public data in → clean, structured JSON out," sold by the request/credit.
Why this shape wins on Net Profit per Operational Hour:
     Near-zero marginal cost: each API call costs you a fraction of a cent (compute +
     proxy/LLM). Gross margins for bootstrapped micro-SaaS run ~80%+.
     No content treadmill: unlike a blog/YouTube channel/newsletter, the product doesn't
     decay if you stop publishing. The data refreshes itself via cron; you don't.
     Sticky, infrastructure-like revenue: once a customer wires your endpoint into their
     product, they don't rip it out unless it breaks. This is the "boring but essential" moat
     Scrape Creators' founder describes.
     Buyers are global and price-tolerant: you sell in USD to a worldwide developer base from
     the UK, capturing dollar pricing with a sterling cost base.

Pricing strategy (usage-based, agent-ready):
     Free tier: ~100–500 requests/month, no card. This is your funnel and your LLM-
     discoverability asset.
     Paid tiers: credit/usage-based, mirroring how AI companies charge (Scrape Creators uses
     exactly this — "customers pay for credits and use the API, just like how all the AI
     companies are charging"). Typical bands: ~$0.001–$0.01 per request depending on cost-
     to-serve; packaged as e.g. $29 (Starter), $99 (Growth), $299+ (Scale) monthly credit
     bundles, plus pay-as-you-go overage.
     Annual plans at ~2 months free to lock in cash and cut churn.
     x402 per-request endpoint for AI agents: zero-commission USDC micropayments
     straight to your wallet — a channel that keeps 100% of revenue vs. RapidAPI's ~20–25%
     cut. Proxies Businessmodelcanvastem…

Revenue ramp projections (solo, technical founder, part-time-to-full-time):
     Conservative: £0 for months 0–4 (build + first users); £500–£1,500 MRR by month 9–12;
     plateau around £1–3k MRR. This is the modal good-execution outcome and still ~£30–80
     net profit/hour at <2 hrs/week.
     Moderate: £2–4k MRR by month 9–12; £5–10k MRR by month 18 (Scrape Creators
     trajectory). ~£70–150 net profit/hour.
     Optimistic: £10k MRR by month 12; £15k+ MRR by month 18–24 with multi-endpoint
     expansion and agent-channel adoption. £150–250+ net profit/hour.
     Honest base rate: ~54% of launched indie products make $0 and the median micro-SaaS
     earns ~$500/month MRR. The edge here is (a) technical founder, (b) picking a dataset
     with proven willingness-to-pay, (c) riding the agent-economy tailwind.

2. Architecture & Automation Stack (fits £0–500)
Core build:
     Language/framework: Node/TypeScript (Hono or Fastify) or Python (FastAPI). Hono is
     specifically recommended for x402 middleware.
     Hosting: start on a free/cheap tier — Cloudflare Workers (generous free tier, global edge,
     native x402/MCP fit) or a $5–6/month Hetzner/DigitalOcean VPS, or
     Railway/Render/Fly.io free-to-cheap tiers. Serverless keeps idle cost at ~£0.
     Database: Supabase (free tier) or Cloudflare D1/KV for caching results. Many endpoints
     need no DB (pure calculation or live fetch + cache).
     Scraping/data layer: if scraping, use a managed scraping API to avoid the anti-bot arms
     race — ScraperAPI (free 5,000 calls, then ~$49/mo/100k), Scrape.do (pay-as-you-go from
     $15/100k credits), or Zyte/Bright Data for hard targets. Cache aggressively to minimize
     per-call cost.
     AI extraction (optional): ScrapeGraphAI or a cheap LLM (GPT-class API) for schema-
     flexible parsing so scrapers don't break on markup changes.

Billing & auth:
     Human developers: Stripe (usage-based billing + metering) on your own site, OR list on
     RapidAPI/Apify to borrow their 4M+ developer distribution (they handle
     billing/keys/rate-limiting for a ~20–25% cut). LemonSqueezy/Paddle as merchant-of-
     record alternatives (they handle UK/EU VAT).
     AI agents: x402 endpoint (0% commission, USDC direct to wallet); list on agent-
     discovery marketplaces.
     Key management/metering: RapidAPI handles this natively; self-hosted, use an API-
     gateway layer or a lightweight metering middleware.

Automation pipelines (the "hands-off" engine):
     Cron jobs (Cloudflare Cron Triggers / GitHub Actions / VPS crontab) to refresh cached
     datasets on a schedule.
     CI/CD: GitHub → auto-deploy on push (Cloudflare/Railway native).
     Auto-billing/dunning: Stripe handles retries, failed-payment emails, and subscription
     lifecycle automatically.
     Webhook flows: Stripe webhooks → provision/deprovision API keys automatically.
     Self-healing scrapers: exponential-backoff retry, block-detection with longer waits, and
     monitoring of success-rate-by-domain (a drop signals new anti-bot measures).

Startup cost tally: domain (~£10/yr), hosting (£0–6/mo), managed scraping (£0 free tier →
~£40/mo once revenue justifies), Stripe (pay-per-transaction, no fixed cost). Total to launch:
well under £500, realistically under £100.

3. Traffic & Customer Acquisition (systematic, mostly autopilot)
The whole point: acquisition channels that don't depend on eroding Google organic clicks.
Primary channels:
 1. Marketplace distribution (borrowed audience): List on RapidAPI (4M+ developers,
    ~20–25% fee) and Apify Store for immediate discovery. Downside: competition and
    commission; upside: buyers arrive pre-qualified. Use as a launch channel, then migrate
    high-volume customers to your direct (higher-margin) billing.
 2. Developer-community seeding: Post genuinely useful build logs and free-tier offers on
    r/webscraping, Hacker News, Indie Hackers, and niche Discords. The scraping/dev
    community is tight-knit and word-of-mouth-driven. This is the channel Scrape Creators'
    founder credits most (that plus a personal Twitter brand built over years: "My Twitter was
    a huge asset, building up a brand for a couple years helped tremendously").
 3. LLM/AI-search optimization (the new SEO): Because LLM-referred traffic converts far
    higher than organic (multiple 2025–2026 datasets put LLM referral conversion around
    18%, and a Visibility Labs study of 94 ecommerce brands found ChatGPT traffic
    converting 31% higher than non-branded organic — $3.65 vs $3.30 revenue per session),
    optimize your docs and landing pages to be cited by ChatGPT/Perplexity/Claude/Gemini:
    answer-first copy, clear structured docs, comparison content ("best API for X"), and
    earned mentions in developer publications. Get listed in "there's an API for that"-style
    directories and AI-tool directories.
 4. AI-agent discoverability: Ensure your x402 endpoint has a clear machine-readable
    description; publish an MCP server so agents can find and call your tool natively. As the
    agent economy grows, this becomes a passive, compounding channel.
 5. Programmatic SEO — used cautiously: you can generate one high-quality, data-backed
    page per data slice (these rank because they contain unique proprietary data AI can't
    synthesize), but treat it as a bonus, not the backbone. Google deindexes thin template
    pages aggressively (one travel site reportedly lost 98% of pages within 3 months);
    differentiation via your unique dataset is the only safe play.

Cold outreach (UK-legal): B2B cold email to corporate subscribers is legal in the UK under
PECR's Regulation 22 corporate exception — no prior consent needed for a business email
address (name@company.com) if content is relevant to their role and every message has an
easy opt-out. BUT UK GDPR still applies (you need a documented Legitimate Interest
Assessment), and emailing sole traders/individuals or personal addresses (gmail) requires
consent. Avoid purchased lists. ICO fines run up to £17.5M (GDPR) / £500k (PECR). Keep cold
outreach tightly targeted and role-relevant.
Target CAC/LTV math: community + LLM-citation + marketplace channels put CAC in the
$0–50 band (vs. $200–600 for paid ads, which you should avoid). With usage-based LTVs of
$300–1,500+ for sticky infrastructure customers, LTV:CAC easily clears the 3:1 minimum and
often 5:1+.

4. Maintenance Blueprint (<2 hrs/week)
The model is chosen precisely because maintenance compresses to near-zero. The recurring
tasks:
     Uptime & error monitoring (automated): UptimeRobot or Better Stack (free tiers) for
     endpoint uptime + status page; Sentry (free tier) for error tracking. Alerts to your phone
     only when something breaks. ~10 min/week reviewing.
     Scraper health (automated + brief review): dashboard tracking success-rate-by-domain,
     latency p95, empty-result rate. Automated alerts on drops. Fixing a broken scraper is the
     main "real work" event — batch it. ~20–30 min/week average.
     Customer support (AI-assisted): thorough self-serve docs + an FAQ/help center handle
     80%+ of queries. An AI support bot (an LLM trained on your docs) or a simple email
     inbox with templated responses handles the rest. API customers are technical and low-
     touch. ~20 min/week.
     Billing/dunning (fully automated): Stripe handles failed payments, retries, receipts, and
     subscription changes with zero manual input.
     Dependency updates: Dependabot auto-PRs; merge monthly. ~15 min/month.
     Data-refresh (fully automated): cron jobs; you only intervene on failure alerts.

Total: comfortably under 2 hrs/week once stable, often under 1.

5. Risk & Churn Mitigation
What fails first (in order of likelihood):
  1. Source/platform dependency (the #1 killer). If your data comes from one platform's API
     or one website, you're exposed. Tony Dinh's Black Magic went from ~$14k MRR to
     unviable overnight when Twitter's API minimum price jumped to $42,000/month; he sold
     for $128k. X's Oct 2025 usage-based pricing repriced a mid-tier workload from ~$200 to
     ~$575/month. Guardrail: diversify across multiple data sources; own your scraping layer
     where possible; abstract sources behind your own schema so you can swap them; never
     build a business on a single third-party API's goodwill.
  2. Anti-bot / scraping breakage. Cloudflare/DataDome/Kasada get more sophisticated
     constantly. Guardrail: use managed scraping APIs with high success rates, AI-based
     extraction that survives markup changes, automated success-rate monitoring, and multi-
     provider fallback.
  3. Marketplace commission/policy risk. RapidAPI takes ~20–25% and owns the customer
     relationship. Guardrail: use marketplaces for discovery, but drive high-value customers
     to your direct billing + x402; multi-list across RapidAPI, Apify, APILayer, and agent
     marketplaces. Businessmodelcanvastem…
  4. Payment processor risk. Low for a mainstream data API on Stripe. (This is precisely why
     the mainstream data API beats the adult route, where CCBill/Segpay charge 5–15% with
     rolling reserves and termination risk.) Guardrail: keep chargebacks near zero (easy for
     B2B API), and keep a secondary processor (Paddle/LemonSqueezy) ready. Swell
  5. Competitor cloning. APIs are somewhat copyable, but the moat is (a) reliability/uptime
     reputation, (b) data breadth/freshness, (c) being the cited default in LLMs and the
     indexed default in agent registries, (d) switching costs once wired into customers' code.
     Guardrail: relentlessly expand endpoints/coverage; build the brand that LLMs cite.
  6. Legal/compliance (scraping). Scrape only public data; respect robots/ToS where legally
     required; for any personal data, comply with UK GDPR. Prefer open-data sources where
     possible (one indie built an entire e-commerce toolkit API on the open ODbL database
     specifically to avoid scraping-legality issues).

Churn-reduction automation: Stripe dunning emails for failed payments; annual-plan
incentives (2 months free); usage alerts that nudge users toward upgrades before they hit
limits (turning a churn risk into expansion revenue); and — most powerful — being
infrastructure they can't easily remove.

Recommendations
Stage 0 — Validate before you build (Weeks 1–3, target: 20 signups or 5 pre-commits).
     Pick 3 candidate datasets where you can prove existing willingness to pay (search
     RapidAPI/Apify for similar APIs already charging money; check for dead/abandoned
     competitors that left demand — exactly how Scrape Creators started, after its founder
     saw a similar API for sale making "$20,000 to $30,000 a month" then disappear). Choose
     the one with paying comparables but weak/expensive incumbents.
     Put up a landing page with the endpoint spec and a free-tier waitlist. Post in 2–3 relevant
     communities. Threshold to proceed: 20+ signups or 5 people who say "I'd pay for this." If
     you can't get 20 signups, change the dataset — don't build.

Stage 1 — Ship MVP (Weeks 3–6).
     One endpoint, clean JSON, docs, free tier (100–500 req/mo), Stripe usage billing. Add an
     x402 gated endpoint and a basic MCP server wrapper from day one — this is your
     differentiator and costs little extra.
     List on RapidAPI + Apify for discovery. Deploy on Cloudflare Workers or a £5 VPS.

Stage 2 — Acquire first paying customers (Months 2–4).
     Daily-ish community engagement (genuine help, not spam) + free-trial offers. Write 2–3
     "how to get [dataset]" articles optimized for LLM citation. DM relevant builders (UK-legal
     B2B, targeted).
     Threshold: first $500 MRR → double down on whichever channel converted.

Stage 3 — Compound & automate (Months 4–12).
     Add endpoints/coverage to raise LTV and defensibility. Migrate high-volume
     marketplace customers to direct billing. Fully wire monitoring/support/dunning
     automation. Introduce annual plans.
     Threshold to go "full passive": once at £3–5k MRR with <2 hrs/week ops and 3
     consecutive growth months, either coast (maximize profit/hour) or reinvest into a second
     niche API (portfolio approach — the Pieter Levels power-law strategy).
Benchmarks that change the plan:
    If after 4 months you're still at $0 MRR despite shipping and marketing → the dataset
    lacks willingness-to-pay; kill it and re-pick (cheap to do; you've spent <£200).
    If a single data source exceeds ~40% of your cost or revenue exposure → diversify sources
    immediately (Black Magic lesson).
    If marketplace fees exceed what direct acquisition would cost → push customers to direct
    billing/x402.
    If LLM-citation traffic starts converting → reallocate content effort entirely toward being
    cited, away from classic SEO.


Caveats
    Survivorship bias is real and severe. The majority of indie products earn $0–$1k MRR
    (54% make exactly zero; median ~$500/month). The named successes (Horning, Dinh)
    are self-reported, not audited, and are outliers. Treat the "moderate/optimistic"
    projections as achievable-but-not-typical; plan your finances against the conservative
    case.
    Founder revenue figures are self-reported. Scrape Creators' $10k+ MRR, Black Magic's
    ~$14k MRR, and marketplace earnings estimates ($2k–$8k/mo RapidAPI niche APIs;
    $10k–$50k/mo top Apify devs) come from founder statements and industry estimates,
    not verified financials.
    The agent-economy tailwind is early and volatile. MCP/x402 adoption is real and fast,
    but agent-driven API purchasing is still nascent; AI-referral traffic is <2% of total referral
    traffic today (albeit growing 3x+ YoY). Don't bet the whole model on agents yet — human
    developers remain the near-term paying customers, with agents as the compounding
    upside.
    Scraping carries legal/technical fragility. Where possible, prefer open-data or officially-
    licensed sources over scraping to reduce both legal exposure and breakage risk.
    This requires 6–18 months of upfront grind before meaningful cashflow — consistent
    with the user's stated tolerance for heavy upfront labor in exchange for high profit-per-
    hour at maturity.


Runner-Up & Rejected Ideas (evaluated, didn't make the cut)
    Legal adult AI-companion / NSFW chatbot app — RUNNER-UP. Highest revenue
    density (market $82M H1 2025 on pace for $120M+; $15–99/mo pricing; 25% conversion at
    Replika vs 2–5% typical) and rides the AI-commoditization wave, BUT UK Online Safety
    Act age-verification (fines up to £18M/10% of turnover; Ofcom already fining operators
    and, since Jan 2026, investigating AI services), high-risk payment processors
    (CCBill/Segpay 5–15% + rolling reserves + termination risk), and ongoing content-
    moderation duties violate the near-zero-maintenance constraint. Lucrative and legal, but
    operationally heavy for a solo UK operator. Swell
Adult affiliate marketing (digital, faceless) — RUNNER-UP-ADJACENT. Lower
compliance burden than running a platform (you're driving traffic, not hosting content)
and high payouts, but depends on the same eroding SEO/traffic channels and platform
goodwill; profit-per-hour capped by traffic acquisition grind.
Micro-SaaS (traditional B2B tool) — strong but higher support burden. Same tailwinds,
but full SaaS apps carry heavier customer support and feature-request load than a
headless API, lowering profit-per-hour. A data API is "micro-SaaS with the support
burden amputated."
Faceless YouTube/TikTok automation — rejected. YouTube's July 2025 "inauthentic
content" policy demonetizes mass-produced AI template content; RPMs volatile; requires
continuous production (fails "no content treadmill"); platform-ban risk high.
Programmatic SEO content/directory sites (ads/affiliate) — rejected. Directly in the
crosshairs of AI Overviews (organic CTR collapse) and Google's thin-content deindexing.
Eroding trend; being actively killed by the 2025–2026 shift.
AI-curated newsletter (sponsorships) — rejected as primary. Real (Rundown AI 2M+
subs), but requires daily publishing (content treadmill), audience-building grind, and
sponsorship sales (manual). Lower profit-per-hour and higher ongoing effort.
Notion/digital-template marketplaces (Gumroad/Etsy) — rejected. Very low barrier =
extreme saturation (1.6M+ products on Gumroad); AI has commoditized production;
individual sales are one-off, not recurring; discovery depends on eroding organic
channels. Cash-flow-fast but low ceiling and not truly passive. Gumroad
Chrome extension (freemium) — viable but rejected vs. API. Real indie successes ($2.5–
15k/mo examples), but ~107k of 137k extensions make $0, Manifest/policy risk, and
Chrome-store dependency. A solid alternative if a specific extension idea has strong pull,
but higher platform risk than a multi-channel API.
KDP ebook automation — rejected. Amazon AI-content policy risk, saturation, one-off
(non-recurring) sales, low profit-per-hour.
AI stock assets (images/music/video) — rejected. Marketplace policy churn on AI
content, race-to-the-bottom pricing, commoditized by the same AI wave that enables
production.
Domain flipping / digital arbitrage — rejected. Speculative, non-recurring, not
systematically automatable at small capital; closer to gambling than a profit-per-hour
business.
Discord/Telegram paid community (bot-automated) — rejected as primary. Recurring
revenue possible, but community management is inherently high-touch and persona-
driven; fails near-zero-maintenance.
Generic AI-wrapper subscription app — rejected. Thin moat (anyone can wrap an
LLM), high churn, rising inference costs; only works with a genuine niche/data moat —
which is exactly what the winning data-API model provides.
Pure MCP-server product (paid tool for agents) — promising but premature as
standalone. The agent-payment economy is real but early; better captured as a channel
for the data-API business than as a standalone product today.
