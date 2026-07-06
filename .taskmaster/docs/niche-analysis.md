# Niche strategic analysis (raw)

> Source: `docs/Future-Proof Niche Data-API Businesses for a Solo UK Builder_ 2026-2030 Strategic Analysis.pdf`
> Text extracted via pdftotext on 2026-07-06 during /setup. Companion to `scope.md`.
> Verdict: #1 = UK public-sector & regulatory data normalization (planning wedge + procurement + regulatory feeds).

Future-Proof Niche Data-API Businesses for a Solo UK Builder
(2026–2030)
TL;DR
     Build a UK/EU public-sector-and-regulatory data normalization API — specifically a
     UK planning-applications + procurement + regulatory-change feed — as your #1 play.
     It rides every future-proof trend (AI agents needing structured public data, regulation-
     driven demand, freshness that can't be absorbed into LLM training), sits on legally safe
     Open Government Licence sources, has near-zero GDPR/ToS risk, low scraper fragility,
     and proven paying demand (PlanAPI, PlanWire, Cognism/Endole all monetize adjacent
     data).
     #2 backup: a hobbyist-plus-investor alternative-asset pricing API (trading cards /
     collectibles / award-flight seats). The seats.aero case proves a solo bootstrapper can hit
     multi-million ARR on freshness-dependent hobby data — but this class carries real
     scraping-litigation risk (Air Canada v. Localhost LLC, ongoing ~3 years), so choose
     sources that are legally defensible.
     Avoid: generic SERP/e-commerce price scraping (saturated), anything requiring personal
     data behind logins (GDPR + ToS hostility — LinkedIn/Meta/OnlyFans), and pure "AI-
     industry meta" plays like LLM-pricing trackers (too easy to clone, commoditized, near-
     zero WTP). x402/agent-native monetization is a real 2026–2030 tailwind but is a
     distribution channel, not a niche.


Key Findings
The market structure that matters. The Model Context Protocol (MCP) went from roughly
100,000 SDK downloads/month at its November 2024 launch to ~97 million/month as of March
2026 (per Anthropic's own reporting), and Anthropic reported over 10,000 active public MCP
servers at the December 2025 donation of MCP to the Linux Foundation (the Glama registry
now indexes 19,831+). Fewer than 5% of MCP servers are monetized. On the payments side, per
the x402 Foundation (via Eco), Coinbase's x402 protocol reached ~69,000 active agents, ~165
million transactions and roughly $50 million in cumulative settled volume by late April 2026;
KPMG's independent analysis recorded 161.32 million cumulative transactions, $43.57 million
settled, 417,000 buyers and 83,000 sellers by February 2026, and Chainalysis separately
confirms x402 "crossed 100 million transactions in three quarters." This is the secular tailwind:
autonomous agents increasingly need to call structured-data tools and can now pay per call.
But temper the agent-payment hype. Real economic activity is still thin: per Sherlock's March
2026 analysis, x402 daily on-chain volume sits around $28,000 (up 20x in a single month), i.e.
only ~$600 million annualized, and on-chain analyst Artemis warns much of that is "wash
trading, self-dealing loops, or low-value tests," with an average payment of ~$0.20–$0.30. Treat
agent-native payment as upside, not the core thesis, over the next 12–24 months.
What "future-proof" means concretely. The durable moat is freshness plus fragmentation
plus normalization. Static reference data (that an LLM can memorize in training) is worthless;
frequently-changing data spread across hundreds of inconsistent sources that must be cleaned
into one schema is the moat. UK planning data is the textbook case: one Hacker News builder
scraped 241 councils and 2.6M decisions and noted the data is "technically public. In practice
it's locked behind 400+ different council portals, some still running bespoke ASP.NET... all
with subtly different schemas." A DEV Community DaaS builder put it exactly: "Cleaning and
normalizing data from multiple government sources took far longer than building the API. But
that mess is exactly what creates value — if it were clean and easy to access, someone would
have done it already."
Willingness-to-pay is proven across several of these niches. Comparable products with real
pricing: Keepa (Amazon price history) charges €19–€53,500/mo across tiers and its API tiers
start ~€49/mo; OpenSanctions runs pay-as-you-go sanctions screening with Verifex
undercutting at $49/mo; TCG pricing APIs charge up to $99/mo (PokemonPriceTracker
Business); Quiver Quantitative sells congressional-trading data at $25/mo (or $300/yr) plus API
tiers; UK B2B data (Cognism, Endole, PDL at ~$0.01/record) is a mature market. Per Apify's own
help centre, "the most successful independent creators on Apify Store make over $10,000
monthly recurring revenue. Many others make more than $1,000 every month, and these
numbers keep growing" — with creators keeping 80% (Apify takes a 20% commission).
The single strongest revenue proof-point is seats.aero (award-flight availability), a (formerly)
solo, zero-funding, bootstrapped data product. Consumer Pro is $9.99/mo or $99.99/yr; a
founder podcast interview (The Daily Churn Ep. 91) cites 500K monthly active users and
100K+ paid members in three years. Reported ARR ranges from $1.5M (late-2024, most
concretely dated) to $7–8M (2025–26, from lower-quality aggregators/social — treat as
unverified). Its commercial/partner API is quote-only ("only by written agreement for
commercial use... many use cases are not supported"). Critically, it demonstrates both the
upside AND the risk: Air Canada/Aeroplan sued its operator (Localhost LLC, founder Ian
Carroll — now run by ExpertFlyer co-founder Chris Lopinto as CEO) in the District of
Delaware on 19 October 2023 under the CFAA seeking up to $2M in statutory damages; the
court denied Air Canada's preliminary injunction in March 2024 (Air Canada "couldn't prove
irreparable harm," Case 23-1177), but the case is still ongoing ~3 years later, with seats.aero
filing antitrust and unfair-competition counterclaims. Boringcashcow Seats

Details: Top Niches Scored and Ranked
Scoring is 1–10 per criterion, weighted toward future-proofing. FP = Future-proofing, MOAT =
defensibility, WTP = willingness to pay, LEGAL = UK/EU legal safety (higher = safer), COMP =
competitive room, MAINT = low-maintenance score (higher = less work), AGENT = AI-agent
demand.

#1 — UK Public-Sector & Regulatory Data Normalization (planning + procurement +
regulatory-change)
FP 9 · MOAT 9 · WTP 7 · LEGAL 10 · COMP 7 · MAINT 8 · AGENT 8
     Product definition. One normalized REST + MCP API aggregating: (a) UK planning
     applications across all ~384–425 local planning authorities (Idox PublicAccess,
     Northgate, OcellaWeb portals + the official planning.data.gov.uk feed), refreshed daily;
     (b) UK procurement — Find a Tender + Contracts Finder via the official OCDS JSON API
     (Open Government Licence), refreshed daily; (c) a regulatory-change/enforcement feed
     layer (FCA, ICO, product recalls). Start with planning as the wedge — it's the highest-
     pain, highest-fragmentation slice.
     Who pays & evidence. Property developers, planning consultants, solar/construction
     lead-gen firms, proptech platforms, and increasingly AI research/procurement agents.
     Direct comparables already charge for this: PlanAPI ("all 384 councils... daily updates...
     self-serve monthly billing"), PlanWire (spatial search, webhooks, paid production tiers),
     and Apify planning-scraper Actors (one lists "$0.95 per 1,000 results"; another is an
     explicit "UK Planning & Solar Lead Finder"). Procurement/bid-intelligence is a known
     paid category. UK company-data enrichment (Endole, DataGardener, Cognism) proves
     buyers pay for normalized official-registry data.
     Future-proofing. Government open-data mandates are expanding (the UK moved all
     above- and below-threshold procurement notices to Find a Tender from Feb 2025). This
     data is intrinsically fresh (new applications/tenders daily), cannot be absorbed into
     foundation models, and is exactly what procurement/research/compliance agents will
     need to call. The OCDS feed even markets itself for "AI agents, lead generation and bid
     intelligence." Find a Tender
     Legal/ToS. Best-in-class. Sources are Crown/Open Government Licence — explicitly
     reusable. planning.data.gov.uk and the Find a Tender OCDS API are official government
     APIs. Planning applications do contain applicant names (personal data), so offer a "Blind
     Mode" (one existing Apify actor already advertises "GDPR-safe Blind Mode (no addresses
     scraped)") and avoid marketing individual-level profiling. No hostile platform, no login-
     walls, no hiQ-style exposure.
     Maintenance. Moderate-low. The official feeds (planning.data.gov.uk, OCDS) are stable
     and just need normalization. The council-portal long tail is the fragile part — but you can
     launch on the official feeds + the ~3 dominant portal software types (Idox, Northgate)
     that cover most councils, and expand. Realistic: 1.5–2.5 hrs/week once built.
     Competition & wedge. Real incumbents exist (PlanAPI, PlanWire, Glenigan/Barbour at
     the enterprise end). Wedge: be the developer-first, self-serve, MCP-native, agent-
     payable option — clean JSON, one schema across all councils + tenders, transparent per-
     call pricing, listed on RapidAPI + Apify + MCP directories + an x402 endpoint.
     Incumbents are either enterprise-sales-led or single-vertical; a cross-vertical (planning +
     tenders + recalls) normalized feed for agents is underserved.
     Revenue. Ceiling: high six figures/year (bid-intelligence and proptech budgets are large).
     Realistic solo 12–24 months: £1,500–£8,000/mo, growing with each vertical and channel
     added.

#2 — Alternative-Asset / Collectibles Pricing (trading cards, award seats, watches, whisky)
FP 8 · MOAT 8 · WTP 9 · LEGAL 5 · COMP 6 · MAINT 6 · AGENT 8
    Product. Real-time, condition- and grade-specific pricing for a hobbyist-plus-investor
    vertical (e.g. Pokémon/MTG/One Piece TCG, or graded-slab valuations), aggregated and
    normalized across marketplaces, refreshed daily/hourly, sold via API + MCP.
    Who pays & evidence. Hobbyists, resellers, portfolio/collection apps, and investors. This
    is the highest-proven-WTP category: Pokémon TCG APIs charge up to $99/mo
    (PokemonPriceTracker Business), $49.99–$99.99/mo (tcgapi.dev Pro/Business), and
    seats.aero proves the hobby-data model scales to 100K+ paid members at ~$100/yr.
    JustTCG's wedge — blending online listings with real in-store sales ("pricing data no
    competitor can replicate") — shows how to differentiate.
    Future-proofing. Collectibles-as-an-asset-class and shopping/portfolio agents both grow
    this. Prices change constantly (freshness moat) and can't be memorized by an LLM.
    Strong secular hobbyist + alternative-investment tailwind.
    Legal/ToS. The weak spot. Scraping marketplace listings can breach ToS, and the
    seats.aero/Air Canada litigation shows platform aggression is real in the award-travel sub-
    niche. Mitigate by (a) preferring sources with reuse-friendly terms or official partner
    feeds, (b) aggregating completed-sale/eBay data and multiple sources rather than one
    hostile platform, (c) staying non-personal-data. Under hiQ and Meta v. Bright Data,
    scraping public logged-out data is defensible in the US, but UK/EU database rights and
    contract claims still apply.
    Maintenance. Medium — marketplace layouts change and anti-bot escalates; multiple
    sources to maintain. Budget 2–3 hrs/week.
    Wedge. Pick ONE vertical, own its normalization + historical depth + a proprietary data
    angle (in-store sales, sold-listing medians), and be MCP/agent-native. Avoid award-flight
    seats specifically unless you accept the litigation risk.
    Revenue. Ceiling: very high (seats.aero-class outcomes exist). Realistic solo 12–24
    months: £1,000–£10,000/mo depending on vertical heat.

#3 — Sanctions / Compliance-Screening & Regulatory-Change Data
FP 9 · MOAT 7 · WTP 9 · LEGAL 8 · COMP 5 · MAINT 7 · AGENT 9
    Product. A sanctions/PEP/watchlist screening API (OFAC, UK HMT, EU, UN consolidated
    lists) plus regulatory-change and product-recall feeds, normalized with fuzzy name-
    matching, refreshed hourly/daily. Sell to fintechs, crypto, procurement, and compliance
    agents.
    Who pays & evidence. Very strong. OpenSanctions runs commercial pay-as-you-go +
    bulk licensing; sanctions.io and ComplyAdvantage are enterprise ($1K–$10K/mo); Verifex
    undercuts at $49/mo self-serve with a free tier. An Apify sanctions actor explicitly targets
    buyers "paying $5K–$50K/year for Refinitiv World-Check." Compliance is non-
    discretionary spend.
    Future-proofing. Regulation only expands (e.g. Australia's Tranche 2 AML reforms).
    Every KYC/onboarding/payments agent will need a sanctions tool call — strongest AI-
    agent-demand alignment of any niche. Data is freshness-critical (lists change weekly).
     Legal. Sources are official government lists under open terms. Note: this IS personal data
     (PEPs), so you're a GDPR data processor — but it's a well-trodden, legitimate-interest-
     backed use case with mature norms. Slightly more compliance overhead than pure
     planning data.
     Maintenance. Low-moderate — official lists are stable feeds; the work is matching
     quality. 1.5–2.5 hrs/week.
     Competition & wedge. More crowded than planning (OpenSanctions, Verifex,
     sanctions.io). Wedge: MCP-native + x402-payable sanctions tool for the agent builder
     market, which incumbents underserve, plus adjacent recall/regulatory feeds bundled in.
     Revenue. Ceiling high. Realistic solo: £1,000–£6,000/mo; compliance buyers convert
     slowly but churn little.

#4 — Energy / Grid Carbon-Intensity & Electricity-Price Data
FP 8 · MOAT 6 · WTP 6 · LEGAL 9 · COMP 5 · MAINT 8 · AGENT 7
     Product. Normalized real-time + forecast electricity price and grid carbon-intensity
     across regions/countries (aggregating the free UK NESO carbon-intensity API, ENTSO-E,
     and others) into one developer- and agent-friendly schema, with webhooks.
     Who pays & evidence. Green-software teams, EV-charging apps, smart-home/energy-
     optimization products, ESG reporting. Comparables charge: Electricity Maps (paid API +
     forecast tier), Singularity Grid Carbon API (paid after 60-day trial), Climatiq, WattTime
     Pro. The UK NESO/carbonintensity.org.uk API is free (CC BY 4.0) — so the moat is
     aggregation + normalization across countries + forecasting, not the UK data itself.
     Future-proofing. Energy transition, carbon accounting mandates (CSRD), and carbon-
     aware computing are durable 2026–2030 trends; data is intrinsically real-time.
     Legal. Very safe — official grid-operator open data.
     Maintenance. Low — stable official APIs. ~1.5 hrs/week.
     Wedge. Multi-country normalized "grid intensity + price" single endpoint for
     agents/green-software; incumbents are either single-region (NESO = UK-only) or
     enterprise (Electricity Maps).
     Revenue. Ceiling moderate. Realistic solo: £500–£3,000/mo — thinner WTP than
     compliance/collectibles.

#5 — Adult-Adjacent COMPLIANCE Tooling Data (the smart adult play)
FP 8 · MOAT 6 · WTP 6 · LEGAL 6 · COMP 6 · MAINT 7 · AGENT 6
     Verdict: the compliance angle beats the content angle. The UK Online Safety Act 2023
     created a real, growing compliance market: age-assurance became mandatory from 25
     July 2025. Per Ofcom's first-year tally, the regulator opened investigations into 30
     companies covering 96 sites and apps and issued 16 fines against 6 providers totalling
     nearly £4 million. The record fine is £1.35M against 8579 LLC (Feb 2026); AVS Group was
     fined £1M (Dec 2025) and Kick Online Entertainment SA £800,000 plus £30,000 (11 Feb
     2026, for the 25 July–29 Dec 2025 breach). Maximum penalty is 10% of qualifying
     worldwide revenue. (Enforcement is still ramping: Ofcom had collected only ~£55,000 of
     the ~£3M imposed by March 2026.)
     Product. Rather than scraping creator/adult content (payment-processor risk, ToS
     hostility, copyright, GDPR — see rejected list), build data tooling for the compliance
     market: an age-assurance-vendor comparison/status API, an Ofcom enforcement-action
     + accredited-method tracker, or a "which platforms require what, by jurisdiction"
     regulatory-mapping feed (UK OSA, EU DSA, US state laws, Australia).
     Who pays. Platform operators, adult sites, agtech/regtech vendors, legal teams needing to
     demonstrate compliance.
     Legal. The compliance-data version avoids the adult-content pitfalls entirely — you're
     aggregating regulatory and vendor information, not adult media. Steer clear of any
     personal/biometric data.
     Maintenance. Low-moderate; regulatory sources are stable.
     Revenue. Ceiling moderate. Realistic solo: £500–£3,000/mo. Included because the user
     explicitly asked — but the honest read is that the OSA compliance angle is a far better
     risk-adjusted bet than adult-creator analytics.

Honorable mention — Alternative financial data for retail investors (congressional trading,
insider filings, IPO/dividend calendars)
FP 7 · MOAT 6 · WTP 8 · LEGAL 8 · COMP 4 · MAINT 6 · AGENT 7. Quiver ($25/mo), Unusual
Whales ($30–$75/mo), and a new entrant "Meridian" that explicitly offers MCP + x402 API
access prove strong WTP and an agent-native trend. Sources (SEC/STOCK Act filings) are
public and safe. But the space is getting crowded and US-centric; a UK builder wins only with a
differentiated slice (e.g. UK/EU insider filings normalization, or the MCP-native agent angle).

Ranking Rationale (against Net Profit per Operational Hour, future-proof)
  1. UK public-sector/regulatory data (#1) wins because it maximizes the user's actual
     objective: legally bulletproof (Open Government Licence, no GDPR/ToS landmines), low
     and predictable maintenance (official feeds + a handful of portal types), durable
     freshness moat, and clean AI-agent demand — with proven paying comparables. Highest
     net-profit-per-hour with the lowest tail risk.
  2. Collectibles/alt-asset pricing (#2) has the highest revenue ceiling and proven hobbyist
     WTP (seats.aero), but the legal/maintenance overhead (scraping hostility, anti-bot arms
     race, litigation precedent) lowers net-profit-per-hour and raises tail risk. A strong backup
     if you enjoy the vertical and pick defensible sources.
  3. Sanctions/compliance (#3) is arguably tied with #2 on fundamentals — best agent-
     demand alignment and non-discretionary spend — but is more competitive and carries
     PEP/GDPR processor duties, so it edges just behind.

Cross-cutting execution advice. Whatever you pick: (1) ship on multiple channels —
RapidAPI, Apify Store (pay-per-event; the rental model retires Oct 2026), an MCP server on
PulseMCP/Glama/Smithery, and an x402-gated endpoint — because "servers that appear on 5+
directories get 10x more installs." (2) Documentation is the product ("the README is your
sales page"). (3) Expect a long discovery grind — the Korean-data-API builder made $80 in 9
days; success is compounding, not instant. Survivorship bias is real: most such APIs earn near-
zero (one builder shipped an MCP server and got "zero paying users" in two weeks), and
Apify's own data shows only a small top tier clear $10K/mo. The niche selection is what
separates the winners.

Recommendations
Stage 0 (weeks 1–2): validate the wedge before building. Confirm demand for UK planning-
data normalization by posting the concept on r/webscraping, IndieHackers, and UK proptech
communities, and by checking Apify run-stats and RapidAPI listings for
planning/procurement scrapers. Benchmark to change the plan: if you find 3+ well-reviewed,
actively-maintained, self-serve planning APIs already at scale, pivot to procurement-only or to
sanctions (#3).
Stage 1 (weeks 3–8): ship the minimum lovable API. Launch UK planning applications using
the official planning.data.gov.uk feed + Idox/Northgate portal coverage, normalized to one
JSON schema, with a "Blind Mode" (no personal data) default. Deploy on a zero/low-cost stack
(the DEV builder ran a DaaS on an idle server). List on RapidAPI + Apify + one MCP directory.
Free tier + paid tiers (~£15–£49/mo self-serve).
Stage 2 (months 3–6): add verticals and agent rails. Bolt on Find a Tender/Contracts Finder
(OCDS — trivial, official API) and a product-recall/regulatory feed. Add an MCP server and an
x402-gated endpoint to capture agent traffic. Thresholds: at £1,000 MRR, add the next vertical;
if planning alone stalls below £300 MRR after 4 months of marketing, the wedge is wrong —
reposition around procurement/bid-intelligence (larger budgets) or merge into
sanctions/compliance.
Stage 3 (months 6–24): move up-market selectively. Offer bulk/enterprise licensing and
webhooks (following PlanWire/PlanAPI). Keep maintenance under 2 hrs/week by prioritizing
official feeds over the fragile council long-tail; only add councils that customers request.
Guardrails / thresholds that change the recommendation:
     If foundation models or a free first-party government API start offering normalized cross-
     source access (e.g. planning.data.gov.uk expands to full real-time coverage of all
     councils), the moat erodes — shift value to alerting, webhooks, and agent-integration
     rather than raw data.
     If GDPR enforcement tightens on public personal data (note Clearview fines €30.5M NL /
     €20M IT / £7.5M UK), double down on Blind Mode and non-personal fields.
     If x402/agent payments cross meaningful real volume (watch for Chainalysis/Sherlock
     reporting sustained daily volume well above the current ~$28,000, stripped of wash
     trading), prioritize the x402 endpoint and agent-directory distribution aggressively.
Caveats
    Revenue figures for private products are uneven. seats.aero's ARR is credibly multi-
    million but the specific $7–8M figures come from aggregators/social media, not audited
    disclosure; the $1.5M (late-2024) figure is the most concretely dated. Apify's "$10K+/mo
    top creators" is self-reported by Apify. Treat all as directional.
    Agent-economy demand is projected, not realized. McKinsey's "$3–5 trillion agentic
    commerce by 2030" and similar figures are forecasts; current x402 real volume is tiny and
    partly wash-traded. The near-term (2026–27) buyer is still overwhelmingly human
    developers and businesses, not autonomous agents. Build for humans first, agents
    second.
    Scraping legality is jurisdiction- and fact-specific. hiQ v. LinkedIn and Meta v. Bright
    Data protect public, logged-out, non-personal scraping in the US, but hiQ still lost on
    contract breach, and the EU/UK apply GDPR to personal data and database rights
    regardless. This report is not legal advice; get UK counsel before scaling any pipeline
    touching personal data or hostile platforms.
    Survivorship bias. The winners cited (seats.aero, Keepa, Quiver) are the visible
    successes; the base rate of niche-API failure is high, and public revenue numbers "lag
    reality by 6–12 months." Niche choice and distribution — not build quality — are the usual
    failure points.
    Some datapoints could not be independently verified within budget (e.g. seats.aero's
    exact commercial API price, which is quote-only; precise Apify per-actor revenue for
    planning/procurement scrapers). These are flagged as such above rather than presented
    as firm.
