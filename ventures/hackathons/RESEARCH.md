# Hackathon prizes — research

Owner direction 2026-10-11: take money that is already on offer on the internet instead of only
building products and waiting for buyers; research from primary sources (the boards' own APIs and
official rules), never from articles about making money. This file is the evidence.

## 1. The job

Online hackathons publish cash prize tables, accept individuals and existing projects, and judge on
merit. The portfolio already has entrants: gankdat (MCP server, x402 agent payments, 16 datasets),
the Foundry operation (an autonomous Claude-run portfolio with routines, queues and self-heal) and
the extensions. An entry costs a write-up, a repo link, a working demo and a short video.

## 2. Evidence (primary sources, read 2026-10-11)

Devpost's public API (`GET devpost.com/api/hackathons?status[]=open&challenge_type[]=online`):
**38 open online hackathons**. The largest with their official rules read the same day:

| Hackathon | Pool | Submissions close | What it requires | Fit |
| --- | --- | --- | --- | --- |
| PayPal AI Hackathon | $67,500 (1st $12k, 2nd $8k, 3rd $5k + category prizes) | 2026-11-12 | integrate the PayPal developer platform (free sandbox) + AI; new or existing projects with meaningful progress during the period; functional demo | **high** — gankdat sells data to agents; a PayPal sandbox checkout for credits + the MCP server is "agentic commerce" end to end |
| Nebius × NVIDIA Global AI Hackathon | $50,000 (grand $20k, 2nd $10k, 3rd $6k + track awards) | 2026-10-30 10:00 PT | run on Nebius Token Factory / AI Cloud with at least one NVIDIA open model | **revived 2026-10-13** — dropped 2026-10-11 when sign-up asked for a card; the owner's Token Factory account went active on 2026-10-12 (inbox) and §2b shows the whole entry costs under US$2, so it is queued again (`nebius-diligence-agent`, `nebius-nvidia-hackathon-submit`) |
| GitLab "Life After Code" | $45,000 | 2026-10-27 | GitLab Duo Agent Platform features; Path B needs an MIT-licensed project (this repo is GPL-3) | low — Duo access and a licence mismatch |
| Amazon Developer Hackathon | $138,000 | 2026-10-23 | Fire TV / Alexa tracks | none |
| Meta VR Start | $1,000,000 | 2026-11-18 | AR/VR | none |

Read 2026-10-13 (burn-down) from the sponsors' and organisers' own pages through the relay
(`docs/relay/responses/hackathons-2026-10-13/`), never from Devpost:

| Hackathon | Pool | Submissions close | What it requires | Fit |
| --- | --- | --- | --- | --- |
| Open Agent Hackathon 2026 (GenAI.Works, fully online) | up to $20,000: $15,000 cash — three tracks at $2,000 / $1,350 / $1,000 and a "Wildcard [Tinkerer]" bring-your-own-project track at $1,000 / $600 / $400 — plus $5,000 in kind | build window 22–27 Oct 2026 (UTC), registration closes 2026-10-22 23:59 UTC | open worldwide from age 16; "Every submission must integrate Zetaris and Meterless, and teams must use Cursor for development"; "Work committed before the window opens is not eligible, except for clearly declared pre-existing components"; demo video 1–4 min and a slide deck | **declined** — the Cursor rule cannot be met by work the routines build, and the only track for an existing project pays $1,000 at best |
| The Rise of AI Agents (lablab.ai, Dubai AI Week) | "$60,000+" headline; cash only in "Best use of Vultr": $5,000 / $3,000 / $1,000 + $1,000 API credits each; "Best use of Gemini" pays GCP credits ($25k / $15k / $10k) | "Fall 2026 / TBA" on the official page (aggregators say 26 Oct–2 Nov online) | hybrid: global online build phase, on-site finale in Dubai by invitation (travel not covered); solo entry allowed; "Submissions must be original and MIT-compliant"; the Vultr track deploys on a Vultr VM with 30-day credits (a payment method only to keep resources afterwards) | **watch** — `lablab-rise-of-agents-date-read` re-reads the page on 2026-10-20 and files an entry once the window is known; the entry's own code would carry an MIT licence in its folder |
| Build, Ship, Shape — Amazon Developer Hackathon | $190K cash and AWS credits (Fire TV, Alexa+, Ring, Bee tracks) | 2026-10-23 | the Alexa+ track takes "Agent Skills, MCP-based experiences"; developer.amazon.com says Alexa+ for Builders "is currently available to select partners working directly with our team"; rules only on Devpost | **declined** — an existing MCP server fits the track on paper, but the toolchain is partner-only and ten days remain |

Read 2026-10-15 (burn-down) — a market sweep by web search (the sandbox resolves neither lablab.ai nor the
organisers' hosts, so what a search index shows is the evidence; a primary read goes through the relay on
2026-10-20 with the lablab item). Nothing new fits an existing-project entry; no item added:

| Candidate | What the search index shows | Verdict |
| --- | --- | --- |
| Vultr: Agent Rush (lablab.ai, hybrid) | online build 3–8 Nov 2026, registration opens 2026-11-03 15:00 UTC, submissions close 2026-11-08 22:00 UTC; tracks TBA, no prize table on the page yet ("winners get highlighted"); aggregators quote $9,000 + $5,000 credits | **watch** — read with the lablab page on 2026-10-20 (same relay round); an entry only if a cash track is published and existing projects qualify |
| lablab.ai AI Genesis / The Rise of AI Agents | lablab's own profile lists AI Genesis 26 Oct–3 Nov 2026, projects due 2 Nov; aggregators attach the "$60,000" figure to one or the other | already watched (`lablab-rise-of-agents-date-read`, 2026-10-20) |
| Colosseum Agent Hackathon ($100k USDC) | submission window was 2–12 Feb 2026; "all code must be written by AI agents" | closed — its next edition would fit this operation unusually well (the whole portfolio is agent-built); the exchange watches colosseum.com |
| Meta Global AI Developer Hackathon ("$1,000,000", virtual) | aggregator listings only; "complete eligibility rules have not yet been published"; no official page found | unverifiable — re-search on 2026-10-20 |
| IBM / Tara Research Steerability Challenge (cash, due 2026-11-21) | a model-alignment benchmark (suppress deception), not an application | none |
| GSA MCP Server and AI Agent Government Hackathon | Sept–Nov 2026, online, "cannot offer cross-agency monetary prizes" | none (no cash) |
| Gloo AI Hackathon ($200k) | 6–8 Oct 2026 in Boulder, in person | none |
| Cosmo Hacks, Global Virtual Hackathon | December, students only | none |

Both queued entries are owner-blocked (action 023: submit PayPal on Devpost; action 025: Nebius key), so the
next signal is the 2026-10-20 reading; `research_after` set to it.

Read 2026-10-20 (burn-down) — the dated lablab reading plus a sweep for new sponsor-run hackathons. Primary pages
through the relay (`docs/relay/responses/hackathons-2026-10-20/`, `hackathons-b-2026-10-20/`); web search only to find them:

| Hackathon | Pool | Dates | What it requires | Fit |
| --- | --- | --- | --- | --- |
| **Meta Global AI Developer Hackathon** (Meta + Cerebral Valley, online, `dev.meta.ai/events/global-hackathon`, `cerebralvalley.ai/e/meta-ai-developer-hackathon`) | **US$1,000,000 cash** across two tracks — indie developer (individuals and students; "creativity, technical ambition, and whether it works") and startup; split not published | applications 13 Oct – **25 Oct 11:59 PM ET** or until 20,000 acceptances; approval mails by 26 Oct 09:00 ET; build 26 Oct – 4 Nov 9:00 PM ET; judging to 8 Nov; winners 9 Nov | "free to enter if selected"; apply with a project idea and evidence of technical skill (both weighted equally, links optional); build with Meta's models — Muse Spark / Muse Image / SAM 3.1 through Meta Model API (US$150 credits per participant) or open-weights Llama through Baseten (US$100), Modal (US$100) or Fireworks (US$25) credits; themes "Build for Your World" and "Push the Frontier"; open worldwide except sanctioned countries (the UK is eligible); **Official Rules published before 26 Oct** — the existing-project and AI-tool rules are unread until then | **high** — the due-diligence agent built for the Nebius entry (`scripts/nebius-diligence-agent.ts`, an OpenAI-compatible tool loop over gankdat's MCP server, fixtures and tests) ports to a Llama endpoint by configuration, the partner credits cover a live run without a card, and the only owner step is the application form (action 027, by 25 Oct). Queued: `meta-global-ai-hackathon-apply` (owner), `meta-global-ai-hackathon-rules-read` (26 Oct), `meta-global-ai-hackathon-entry` (26 Oct – 4 Nov, built inside the window in case pre-window work does not count) |
| The Rise of AI Agents (lablab.ai, Dubai AI Week) | "$60,000+" headline; cash only in Best use of Vultr: $5,000 / $3,000 / $1,000 + API credits; Gemini track pays GCP credits | official page still **"Fall 2026 / TBA"** on 2026-10-20 and the event is absent from lablab's own upcoming list (`lablab.ai/ai-hackathons` shows only Vultr: Agent Rush); Internshala's listing says 26 Oct – 2 Nov online, finale 3 Nov in Dubai | Vultr track: "a web-based enterprise agent deployed on Vultr" (marketing / sales / operations workflows), "Submissions must be original and MIT-compliant" | **no entry** — `lablab-rise-of-agents-date-read` done: no official window a week before the aggregators' start, and a Vultr deployment needs a Vultr account, whose sign-up requires a payment method (Vultr docs: "add a valid payment method … for verification"), the same no-card rule that ended the Nebius entry |
| Vultr: Agent Rush (lablab.ai, hybrid) | US$9,000 cash ($5,000 / $3,000 / $1,000) + US$5,000 Vultr credits; US$200 credits per participant | online build 3–8 Nov 2026, on-site 8 Nov Salt Lake City (travel not covered); further tracks "to be announced before the kickoff" | main challenge "Blast Radius Zero": a web agent that writes and runs code or drives a browser with every action inside a sandbox on Vultr (throwaway instance or container per task), teams 1–6, MIT-compliant | **declined** — a new product, not an existing one (gankdat has no execution sandbox), five build days, and a Vultr account needs a payment method |
| Qloo Agentic Hackathon (Devpost) | US$25,000 cash | build to 30 Oct 2026, winners ~23 Nov | agents on Qloo's cultural-taste API; public demo, open-source repo | **declined** on fit — the sponsor's API must be central and no product here has a taste or culture angle; rules sit on Devpost, unread (ToS) |
| Hackathon for MCP and AI Agents (`aihackathon.dev`, MCP_HACK//26, Solo.io / CNCF judges) | US$5,000 (five US$1,000 tracks: starter, secure & govern MCP with agentgateway, kagent agents, agent registry, OSS contributions) | **submissions closed** on 2026-10-20 | MCP servers and agents around agentgateway / kagent / agentregistry | closed — the agentregistry track would have fitted gankdat's MCP server; the exchange watches for the next edition |
| Algorand Global x402 Challenge | US$100k pool | registration closed; leaderboard in October, ten finalists in early November | x402 on Algorand | closed |
| Meta Global AI Developer Hackathon selection | — | — | 20,000 places, rolling review, "eligible applications meeting minimum scoring cut-offs will be accepted automatically" | the application is the whole gamble: no cost, ~10 minutes |

Next signal: the owner's application (action 027, by 25 Oct) and the Official Rules on 26 Oct; `research_after` set to
2026-10-26. Research sources that stay open: lablab.ai's hackathon index (Agent Rush's extra tracks), the next MCP_HACK and
Colosseum editions, and the Meta Model API docs (`dev.meta.ai`) for the entry's endpoint shape.

### 2b. Nebius Token Factory terms (official docs, read 2026-10-13 through the relay)

- Billing (`docs.tokenfactory.nebius.com/other-capabilities/billing-new`): "Billing setup is mandatory — you
  cannot complete onboarding without it. Setting up a billing account requires a bank card." "Upon first
  sign-up, you receive $1 in trial credit, valid for 30 days." A card is charged "at the start of the month,
  if your balance is negative" or at a configured threshold; a failed charge suspends the account. Promo
  codes add free credit. Bank transfer is for companies only.
- The owner's account is active (Nebius welcome mail, 2026-10-12), so onboarding was completed; whether a
  card is on it is the owner's to say (action 025). The 2026-10-11 drop rule was "no card on a £0 line"; the
  line is no longer £0 by choice of the owner, and the spend is bounded below.
- Prices (`tokenfactory.nebius.com/model-catalog`, `nebius.com/services/token-factory/models/nvidia-nemotron-models-inference`):
  `nvidia/Nemotron-3_5-Lightning` and `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B` US$0.06 input / US$0.24 output per
  million tokens (262k–1M context); `nvidia/nemotron-3-super-120b-a12b` US$0.30 / US$0.90; Ultra US$1 / US$3.
  A due-diligence run of ≤ 40 calls and ≤ 300k tokens costs under US$0.10; building, testing and recording the
  entry stays under US$2 — the ledger carries a £2 `planned` row and the agent aborts past its cap.
- Nebius AI Builder Program (`nebius.com/blog/posts/introducing-the-nebius-ai-builder-program`): "The program is
  free" and gives "$400+ in credits and discounts from Nebius Token Factory, LangChain, Toloka, Tavily, and
  more" — an optional owner application (identity) in action 025 that would cover the entry many times over.

Eligibility (identical Devpost rules text across the three): open to individuals of the age of
majority; the UK is not on any exclusion list. Entries are submitted by the owner's Devpost account
(one-off, action 022); everything else is built by routines.

## 3. Validation gate

- Buyers with money: the prize money is already committed by the sponsor — the only "buyer" is a judge.
- Recurring job: Devpost lists tens of open online hackathons at any time; a scanner keeps the board fresh.
- Competitor gap: entries are judged on working software and a clear story; the portfolio's entrants are live products with real data, which most hackathon entries are not.
- ≤ 1 week to build: each entry reuses a live product; the new part is the sponsor-specific integration and the submission package.
- Policy (checked 2026-10-11 at the owner's request, from the official rules and Devpost's Terms of Service):
  - Neither hackathon's rules restrict AI tools; PayPal's say "Any AI tool works, as long as PayPal integration is central". Judging weighs "genuine effort and a working, non-trivial implementation", which is what the entry must show.
  - The Submission must be the Entrant's original work, solely owned by the Entrant. Code produced by Claude Code at the owner's direction is the owner's to own under Anthropic's terms, so this holds; the write-up states plainly that the project was built with Claude Code under the owner's direction — judges may discount that, but nothing forbids it.
  - The Entrant is a human individual (the owner), who registers, submits and would receive the prize; routines prepare the package only. Existing projects qualify if "significantly updated" during the submission period, and the entrant must explain how.
  - **Devpost's Terms of Service §4 forbid automated software to access, scrape or crawl the site.** The 2026-10-11 API read was a one-off and is not repeated: the `hackathon-scanner` item is dropped, and hackathons are found from sponsors' own sites.
  - Prizes are income of the owner's sole trade (the ledger records them; the £1,000 trading allowance and Self Assessment rules apply as for any revenue).
  - Nebius's terms page could not be read from here (404); the Nebius entry item re-reads the sign-up terms before any build and stops if they exclude the use.

## 4. Costs

PayPal's sandbox and Devpost are free. Nebius Token Factory (2026-10-13, §2b): US$1 trial credit, then
metered inference at US$0.06 / US$0.24 per million tokens on the Nano-class Nemotron models; the entry is
capped by the agent's call budget and a £2 `planned` ledger row (ledger rule: net outlay ≤ £100, overspend
only from profit). The owner's account carries the card Nebius requires; the routines never add one.

## 5. Risks

Prizes are a lottery weighted by merit: a placing is likely only when the entry is unusually
complete. A video is required by most portals — `demo-video-pipeline` records it with Playwright.
Judges may discount AI-built entries; the submission says plainly how it was built.

## 6. Proof and kill

Proof: a prize (any placing) credited within 60 days of the first submission. Kill: three complete
submissions with no placing and no judge feedback → `finished`.

## Metrics

| Date | Event | Users | Rating | Sales | Notes |
| --- | --- | --- | --- | --- | --- |
| 2026-10-11 | Validated | — | — | — | 38 open online hackathons on Devpost; two high-fit entries queued; owner action 022 (accounts) |
| 2026-10-11 | Accounts | — | — | — | owner on Devpost + joined PayPal AI; PayPal sandbox keys set; Nebius dropped (card required) |
| 2026-10-11 | Built | — | — | — | PayPal entry built: sandbox credit packs live in gankdat v0.24.0 (REST, MCP buy_credits, /account), write-up and walkthrough in `entries/paypal-ai-hackathon/`; waits on the demo video, then the owner submits |
| 2026-10-11 | Demo pipeline | — | — | — | CI records entry demo videos (Playwright + ffmpeg); PayPal video waits on the sandbox buyer secrets (action 024) |
| 2026-10-13 | Research | — | — | — | Nebius entry revived (account active 2026-10-12; Token Factory terms in §2b, entry under US$2); GenAI.Works Open Agent (Cursor-only) and Amazon Build, Ship, Shape (Alexa+ partner-only) declined; lablab.ai Rise of AI Agents watched for its date |
| 2026-10-15 | Research | — | — | — | market sweep: Vultr Agent Rush (3–8 Nov, prizes TBA) added to the 10-20 lablab read; Colosseum Agent Hackathon closed in Feb; nothing new fits; waiting until 2026-10-20 |
| 2026-10-16 | Nebius dropped | — | — | — | owner declined action 025 (card required for onboarding); PayPal entry media (15 images) prepared for the Devpost form |
| 2026-10-16 | Submitted | — | — | — | PayPal AI Hackathon entry submitted by the owner on Devpost (pool $67,500; judging after 2026-11-12) |
| 2026-10-17 | Status | — | — | — | venture.json → launched as of the 2026-10-16 submission (an entry on the shelf is the line's 'live'); earning = a prize credited |
| 2026-10-20 | Research | — | — | — | Meta Global AI Developer Hackathon found ($1M cash, online, free, UK eligible): owner applies by 25 Oct (action 027), entry built inside the 26 Oct–4 Nov window on the existing diligence agent; lablab Rise of AI Agents still TBA (no entry), Vultr Agent Rush and Qloo declined, MCP_HACK//26 closed |
