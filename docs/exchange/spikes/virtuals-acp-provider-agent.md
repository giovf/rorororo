# Spike: gankdat as a provider agent on Virtuals' Agent Commerce Protocol (ACP)

Queue item `new-ventures/spike-virtuals-acp-provider-agent` (burn-down, 2026-10-31 17:33–17:40 UTC; seeded by the same
morning's new-ventures research). Sources: the morning's relay round (`new-ventures-research-2026-10-31` lines 19–23 and
the rendered scan page) and three rounds this run (`acp-spike-2026-10-31`, `-b`, `-c`: the economyOS docs at
os.virtuals.io — its `llms-full.txt` is the whole docs set in one file — the whitepaper's ACP product-resources pages, the
app's offerings and agents routes raw and rendered, and RNWY's independent on-chain index; pruned after 7 days). x402
comparison figures from `ventures/gankdat/src/lib/constants.ts` ($0.005 default, $0.01 uk-company-profiles) and the
10-31 Daily numbers row (x402 30 d: 5 paid buyer calls from 3 clients).

The question: does anyone on ACP buy data lookups, what does a job net after the protocol cut, can a Worker or a
GitHub Actions cron serve jobs without a 24/7 process, and is a gankdat provider agent worth a build?

## 1. The protocol (primary pages, read 2026-10-31)

| Page | What it says |
| --- | --- |
| *What is ACP?* (`os.virtuals.io/acp/overview`; the same text in `llms-full.txt`) | The reference implementation of **ERC-8183** (proposed Ethereum standard for agent commerce). Current ACP replaced the memo-based "earlier ACP" — hooks instead of memos, event-driven `agent.on("entry")`, multi-chain, **non-custodial wallet (OS keychain in the CLI, Privy in the SDK)**, roles Client / Provider / Evaluator, job types service-only, fund-transfer and subscription. "Over 18 months in production … onboarded over **2,000 agents**." Base mainnet contracts listed (ACP Core `0x238E…32E0`). |
| *Fee Structure* (concepts page) | **"A deterministic fee split at the protocol layer, enforced in the Job smart contract": without an Evaluator 95 % provider / 5 % protocol; with an Evaluator 90 / 5 / 5.** The 20 % the seller reported in April was the earlier ACP; the current cut is 5 %. |
| *Job Offerings* | A provider's catalogue: name, description, **price (service fee in USDC, fixed or percentage)**, SLA in minutes, requirements (free text or JSON schema), deliverable, fund-transfer flag. A **Resource** is a free read-only data endpoint with no pricing, escrow or lifecycle. |
| *Job lifecycle* | `client create-job` → `job.created` → `provider set-budget` → `client fund` (USDC → escrow) → `provider submit` → `client complete` (escrow → provider); optional `client review --rating` on-chain if the provider is ERC-8004-registered. |
| *Why there's no provider daemon* (CLI migration page) | "`events listen` is the long-running process … Your agent is the daemon." Event handling is **SSE streaming**; "**You must start `acp events listen` before creating a job. Without it, you will miss events and the job will stall.**" |
| *ACP Serve* | One `handler.ts` (requirements in, deliverable out) plus an `offering.json`; `budget.ts` is optional and "not needed for fixed-price offerings"; a running serve exposes **x402, MPP and ACP-native endpoints for the same handler**. Two modes: self-hosted (`acp serve start`, runs on your machine, your key pair) or **hosted (`acp serve deploy`, "deployed as encrypted package", a deploy signer generated at deploy time)** — the hosted mode's price and terms are not on any page read. |
| *Quickstart* | `acp configure` = **one-time browser OAuth sign-in** (tokens in the OS keychain); `acp agent create` provisions an on-chain wallet and an email inbox; `acp agent add-signer` a browser-approved P256 key; registration is on the ACP Registry at `app.virtuals.io/acp/new`; "a builder code is applied automatically to every CLI transaction". Gas is not mentioned as a provider cost (the April seller: sponsored). No graduation or sandbox step appears anywhere in the current docs — the graduation review the April seller went through belongs to the earlier ACP. |
| *Agent Console* | The no-code hosted path: "hosting, uptime and wallet creation" managed, **a token is created automatically with liquidity pairing** — i.e. the console path tokenises the agent, which is not something a UK sole trader's data API should do without reading the token terms. |
| aGDP (whitepaper glossary) | **aGDP = trading value + service fees**; the scan's US$481.82M is overwhelmingly trading volume routed through trading agents, and **total revenue US$4.53M is the service-fee figure** over the protocol's life. |

## 2. What is being bought on ACP (the live scan, the independent index)

| Reading | Value | Source |
| --- | --- | --- |
| Total aGDP / total revenue / jobs / unique active wallets | **US$481.82M / US$4.53M / 2.55M / 36.7K** (30-day deltas +0.02 % / +0.02 % / +0.35 % / +0.91 %) | app.virtuals.io/acp/scan, rendered 10-31 |
| Top agents by 7-day aGDP | **all ten tagged `Trade`**: Capminal $157.5K (5 offerings, 12,807 jobs, 1,393 users), AgentPulse $103.1K, Nox $83.5K (91,976 jobs), aixbt $38.1K, Otto AI Market Alpha $22.2K (56,801 jobs, 2,363 users), Remi $20.1K, Otto AI Tools $14.3K, ClawOracle $2.4K, Wizard $2.1K, Johnny Suede $1.9K (25 offerings, 597 jobs); every one 100 % success | same page |
| Jobs indexed from Base (V1 + V2) | **over 3 million**; **27,441 client addresses hire, 2,091 provider addresses are hired (13 : 1)**; the top provider address holds **1.38M jobs, about 45 %** of everything, #2 about 201,000, rank 20 in the low tens of thousands, rank 50 about 5,000; counts are job *creations*, not completions | rnwy.com, updated 2026-03-17 |
| Offerings, Agents and Transactions tabs | client-side state on the scan page — `/acp/offerings` is a 404 (raw and rendered), `/acp/agents` renders a login wall, `?tab=offerings` renders the same Overview (the tabs are client-side state, not routes); the page's own metrics call `acpx.virtuals.io/api/metrics/four-metrics` failed from the runner, so there is no keyless offerings API in sight | this run's rounds |
| A graduated data seller's own numbers | PriceVerifier (a BTC/ETH price check): **service price $0.01 USDC, protocol takes 20 %, net $0.008 a job**, gas sponsored; after graduation Butler routed the request to an older agent first; "first month: maybe 0–5 jobs daily"; the author saw Butler users asking for token-tax analysis, i.e. crypto questions | printmoneylab.com, episode 7, 2026-04-02 |

So the catalogue of offerings — the one reading the spike was for — is not readable from a runner: the app's offerings list sits behind the login wall and client-side tabs, RNWY indexes wallet addresses and job counts but not offering names or categories, and the scan's public top-ten is ten trading agents whose "offerings" are trade execution and signals. The only data-lookup provider with public numbers is the April seller's price checker: 0–5 jobs a day projected, and the demand it saw on Butler was crypto questions (token tax, price checks). Nothing read shows an ACP client paying for a company, sanctions, tender or register lookup.

## 3. Our net per job

| Offering | ACP price | Protocol cut | **Net per job** | Our x402 price today | Notes |
| --- | --- | --- | --- | --- | --- |
| UK company profile | US$0.02 | 5 % (95/5, no evaluator) | **US$0.019** | $0.01 | the same Companies House read |
| Sanctions screen (OFAC / UK / EU) | US$0.05 | 5 % | **US$0.0475** (US$0.045 with an evaluator) | $0.005 default | gankdat's sanctions sources |
| Tender search (Contracts Finder) | US$0.10 | 5 % | **US$0.095** (US$0.09 with an evaluator) | $0.005 default | one search, up to N rows |

Gas is sponsored by the protocol, so there is no per-job cost on our side beyond the Worker's own request; at the
seller's observed "0–5 jobs a day" that is **US$0–14 a month** at these prices, and the break-even question is the serving
model, not the margin.

## 4. Serving model

The current protocol has no provider daemon, but it does need a listener: `acp events listen` is an SSE subscription and the docs say a job created while nothing is listening stalls. That rules out the two serving models this operation runs:

| Model | Can it hold the SSE listen? | Verdict |
| --- | --- | --- |
| Cloudflare Worker (gankdat) | No — a Worker answers requests; it cannot keep an outbound SSE stream open between invocations, and a cron trigger every 15 min would miss `job.created` / `job.funded` in between | the Worker can be the *handler* behind `acp serve` (one HTTPS call per job), not the listener |
| GitHub Actions cron | No — a job caps at 6 h, schedules drift, and jobs created between runs stall | could drain a backlog with `events drain` if the protocol queued events for absent listeners; the docs say it does not |
| `acp serve deploy` (Virtuals' hosted mode) | Yes — Virtuals runs the package and the deploy signer | price and terms unread (not on any page the relay could reach); the signer is generated by Virtuals at deploy time |
| Agent Console | Yes — hosted, no code | tokenises the agent automatically; a different product |
| A 24/7 host (the April seller: Railway US$5/mo, then Oracle free tier) | Yes | a third account and a running process outside CI, for a line whose observed demand is 0–5 jobs a day at 1–2 cents |

The honest serving plan, if demand ever showed, is `acp serve deploy` with a handler that calls gankdat's existing x402 routes — but only after reading its terms, which this run could not.

## 5. Call

**Park, dated.** Three of the item's four questions came back against it:

1. **Demand for data lookups is unobservable, and what is observable is trading.** The scan's US$481.8M aGDP is trading value by the glossary's own definition; the fee revenue is US$4.53M over the protocol's life; the public top ten are all `Trade`; RNWY's index shows 13 client addresses per provider and one address with 45 % of all jobs. The one readable data seller projected 0–5 jobs a day. gankdat's own x402 shelf — the same buyers, the same chain, no listener needed — has 5 paid buyer calls in 30 days.
2. **The serving model is one we do not have.** The protocol needs a live SSE listener; neither a Worker nor an Actions cron is one; Virtuals' hosted deploy exists but its terms and price were not readable.
3. **Registration puts the owner's identity on Virtuals** (a browser OAuth sign-in, a wallet, an agent email) — CLAUDE.md asks before any such step and the owner-time rule (2026-10-29) reserves identity steps for work scoring ≥ 10; this scores about 1 (evidence 1 × reach 2 ÷ 1 build day + the identity step).

What came back for it, and keeps the idea alive: the **protocol cut is 5 %, not 20 %** (net US$0.019 on a 2¢ job), fixed-price offerings need no negotiation code, one handler serves x402, MPP and ACP-native buyers at once, and a provider is discoverable in the registry from day one. Re-open when **either** a keyless offerings or jobs feed shows at least one data / lookup / verification offering with ≥ 100 jobs in 30 days (the `acpx.virtuals.io` metrics API the scan page calls is the first thing to probe, then RNWY if it adds offering names), **or** gankdat's x402 Bazaar reading passes 50 paid buyer calls in 30 days (agent buyers exist on the chain) — and, either way, only once `acp serve deploy`'s terms have been read. Dated re-read: **2026-12-01** (the x402 day-60 reading).
