# PayPal AI Hackathon — submission text (Devpost form)

Prepared 2026-10-11 by the burn-down routine; the owner pastes these fields into the Devpost form
(https://paypalaihackathon.devpost.com/, submissions close 2026-11-12). Edit freely — the voice is
the owner's. Facts below are checked against the code in `ventures/gankdat/` at v0.24.0.

## Project name

gankdat — agentic commerce for official data: AI agents buy their own API credits with PayPal

## Tagline (≤ 60 chars)

AI agents buy official-data credits with PayPal, in chat

## Inspiration

gankdat serves official UK and EU registers (companies, insolvency, sanctions, tenders, planning,
charities, schools, NHS, trade marks) as one clean JSON API and an MCP server that Claude, Cursor and
ChatGPT connect to. Agents already pay per request with USDC (x402) and humans subscribe through
Stripe — but the most common moment in practice is an agent in the middle of a due-diligence task
hitting "monthly credit quota exhausted". Until now the only answer was "ask your human to open a
browser and subscribe". This entry makes that moment a PayPal checkout the agent starts itself.

## What it does

- **Credit packs**: one-off packs (1,000 / 5,000 / 20,000 credits) sold through PayPal's Orders API,
  added to a *top-up balance* that the API spends once the month's plan allowance is gone. They never
  expire, work on the free plan, and show up on every usage reading (`topup`).
- **The agent buys in chat**: two MCP tools, `buy_credits` and `confirm_credit_purchase`. The agent
  creates the order and hands the human PayPal's approval link; the human approves on PayPal (the
  agent never sees a card, a password or a PayPal login); the agent captures the order and carries on
  with the task on the new credits. Keyless callers get an OAuth sign-in prompt first.
- **REST twins and a human path**: `POST /v1/billing/paypal/orders` → `…/capture` for any client, and
  "credit packs" buttons on the account page where PayPal returns the browser to a capture endpoint.
- **Metering that knows which balance paid**: every metered response says `X-Credits-Source: plan`
  or `topup`; the 402 names the pack and the tool that buys one.

## How we built it

- Cloudflare Worker (Hono, TypeScript) — the existing gankdat service; PayPal Orders API v2 with
  client-credentials auth, orders created with `payment_source.paypal.experience_context` and
  captured server-side; the order row's `created → completed` update is the idempotency guard.
- D1 for orders and the audit ledger, KV for the live top-up balance beside the monthly counters —
  the same split gankdat already uses for Stripe.
- One budget decision shared by REST metering and the MCP tools so the two surfaces never disagree.
- Built with Claude Code under the owner's direction, as a scheduled routine of an autonomous
  portfolio operation; 10 integration tests stub PayPal's sandbox at the fetch layer.

## Challenges we ran into

- Making an agent purchase safe: the agent must never hold payment credentials. The approval step is
  PayPal's own page; the agent only ever sees an order id and an approval URL.
- Spending from two balances without touching the hot path: the top-up is read only when the plan
  allowance is exhausted, so the common request costs the same one KV read as before.
- Idempotency across three capture paths (agent, REST, browser return) that can all fire for the same
  order — solved with one conditional UPDATE instead of a lock.

## Accomplishments that we're proud of

An end-to-end agentic commerce loop on a live product with real data: an agent runs out of credits,
buys more with PayPal, and finishes its job — with the human in the loop exactly once, at the
payment approval.

## What we learned

PayPal's Orders API maps cleanly onto an agent flow because approval and capture are separate HTTP
steps: the agent owns the two API calls, the human owns the click between them.

## What's next

Live PayPal checkout (currently sandbox only, by design), a `credits_low` hint in tool results so
the agent buys *before* it is blocked, and packs priced per dataset tier.

## Built with

cloudflare-workers, hono, typescript, paypal-orders-api, model-context-protocol, d1, workers-kv,
zod, vitest, claude-code

## Links

- Try it: https://gankdat.com/account (credit packs) · MCP: https://gankdat.com/mcp (tools `buy_credits`, `confirm_credit_purchase`)
- Code: https://github.com/giovf/gankdat (public mirror of the service) — `src/billing/paypal.ts`, `src/metering/budget.ts`, `src/mcp/server.ts`, `test/paypal.spec.ts`
- Walkthrough: `ventures/gankdat/scripts/paypal-walkthrough.mjs`
- Demo video: (attach the mp4 produced by the demo-video pipeline)

## PayPal integration (judging criterion: "PayPal integration must be central")

The whole new capability is the PayPal rail: orders created and captured through the Orders API v2,
credits granted only on a successful capture, and a PayPal checkout started by an AI agent over MCP.
Sandbox credentials; no live money moves during the hackathon.

## AI usage (judging criterion: "AI must be meaningful")

The buyer *is* the AI agent: an MCP client (Claude, Cursor, ChatGPT) decides it needs credits, calls
`buy_credits`, relays the approval link, and completes the purchase with `confirm_credit_purchase` —
then spends the credits on the data tools that answer its user's question. The product itself exists
for agents (MCP server, keyless preview, agent-side sign-up, x402).

## Disclosure

This project was built with Claude Code, directed and owned by the entrant (a UK sole trader). The
service's code is in the public mirror above.

## Required form fields (added 2026-10-16 — the Devpost form asks these separately)

**If it existed before, explain what already existed and what you built or changed during the submission period.**
gankdat existed before the hackathon: a Cloudflare Worker serving 16 official UK and EU registers as a JSON API and an MCP server, with Stripe subscriptions for humans and x402 USDC micropayments for agents, live since July 2026. Everything PayPal-related was built during the submission period (release 0.24.0, 11 October 2026): the PayPal Orders API v2 integration (`src/billing/paypal.ts`), one-off credit packs on a new top-up balance that the metering spends after the monthly plan allowance, the two MCP tools `buy_credits` and `confirm_credit_purchase` so an agent can buy in chat, the REST twins (`POST /v1/billing/paypal/orders` and `…/capture`), the credit-pack buttons and PayPal return handling on the account page, the `X-Credits-Source` header that says which balance paid, ten integration tests that stub PayPal's sandbox, the agent walkthrough script and the demo video pipeline (release 0.24.0 of the service, 11 October 2026; the public mirror is synced from the private monorepo, and its README names the upstream commit).

**Explain how your project meets the main technology requirement.**
PayPal is the whole new capability, not an add-on. Credit packs are sold only through PayPal: an order is created with the Orders API v2 (client-credentials auth, `payment_source.paypal.experience_context`), the buyer approves on PayPal's own page, and the order is captured server-side; credits are granted only on a successful capture, recorded in D1 with a conditional `created → completed` update that makes capture idempotent across the three paths (agent, REST, browser return). The AI part is the buyer: an MCP client such as Claude starts the PayPal checkout itself when it runs out of credits, hands the human the approval link, confirms the order and continues its task. Sandbox credentials throughout the hackathon; no live money moves.

**Which additional sponsor tool(s) did you use for this project?**
None. The project uses PayPal's Orders API with Cloudflare Workers, Hono, D1, Workers KV and the Model Context Protocol.

**Provide a URL to your public code repository.**
https://github.com/giovf/gankdat — the public mirror of the gankdat service (PayPal code in `src/billing/paypal.ts`, metering in `src/metering/budget.ts`, MCP tools in `src/mcp/server.ts`, tests in `test/paypal.spec.ts`). The service is developed in a private monorepo; the mirror's README names the upstream commit it was synced from.

**Provide a URL to a working demo, hosted application or test build.**
https://gankdat.com/account (credit packs; sign in with any email, free plan) and the MCP server at https://gankdat.com/mcp (tools `buy_credits`, `confirm_credit_purchase`). The demo video shows the full sandbox purchase end to end.

**How would you rate your overall experience integrating PayPal?** *(your call — suggested: 4 of 5)*

**Overall experience rating: please share why or provide additional feedback.** *(suggested, in your words)*
The Orders API v2 maps cleanly onto an agent flow because approval and capture are separate HTTP steps: the agent owns the two API calls and the human owns the click between them, so the agent never holds a payment credential. The sandbox was good for an automated test suite. Friction we hit: the developer account asked for tax information days after sign-up and briefly restricted the sandbox account until it was supplied, which is surprising for sandbox-only use; and the hosted checkout's login renders inside an iframe in some layouts, which took a retry to automate for our demo recording. Clear, stable docs on the `experience_context` options and on which checkout layout a given account sees would have saved the most time.

**Are you open to us contacting you for additional feedback?** *(your call — suggested: yes)*

**Attestations (age of majority, eligible jurisdiction, not an employee or agent of the promotion entities).** You tick these yourself: you are an adult UK resident entering as an individual and have no connection to PayPal or Devpost.

**Which AI tools have you leveraged while working on this project?**
Claude Code (Anthropic's Claude model, Fable 5.1) wrote the code, the tests, the demo video pipeline and the first draft of this submission, working as scheduled routines of an autonomous portfolio operation that I direct and own. Playwright recorded the demo. The buyer in the product is itself an AI agent over MCP (Claude, Cursor or ChatGPT).

**Describe the level of learning you/your team derived from the project.**
High. The main lesson is a design pattern for agentic commerce: keep the agent on the API side of a payment (create and capture) and the human on the approval side, with idempotency enforced by a single conditional database update rather than a lock. We also learned where two balances (plan and top-up) can be spent without touching the hot path, and what it takes to run an end-to-end sandbox purchase unattended in CI.

**Did you gain AI value that you can use in your career?**
Yes. The project is a working example of an AI agent completing a purchase safely on a live product, and of running an AI-built engineering operation (routines, tests, CI-recorded demos) end to end. Both are directly reusable.

**Testing instructions or credentials the judges need (optional field).**
Everything runs on the live service with PayPal's sandbox; no real money can move.

1. *Human path (2 minutes).* Go to https://gankdat.com/account, enter any email address and click the sign-in link you receive (free plan, 250 credits). Under "Credit packs" choose a pack: you land on PayPal's **sandbox** checkout. Approve it with a PayPal sandbox personal account (free: developer.paypal.com → Testing Tools → Sandbox Accounts → Create account → Personal) and PayPal returns you to the account page with the credits added and `topup` shown in the usage line.
2. *Agent path over MCP (5 minutes).* In Claude, Cursor or ChatGPT add the MCP server `https://gankdat.com/mcp` (no key needed to list tools and preview data). Ask the agent to buy 1,000 credits: it calls `buy_credits`, which starts a sign-in (the same email link), creates the sandbox order and returns PayPal's approval link; approve it as in step 1, then tell the agent to continue: it calls `confirm_credit_purchase` and the next data tool call shows the credits coming from the top-up balance.
3. *REST path (curl).* With the API key from the account page: `POST https://gankdat.com/v1/billing/paypal/orders` with body `{"pack":"pack_1k"}` returns `approve_url`; after approval, `POST https://gankdat.com/v1/billing/paypal/orders/<id>/capture` adds the credits; any `GET /v1/data/<dataset>` then carries `X-Credits-Source`.

The demo video shows the full loop. Code: https://github.com/giovf/gankdat (`src/billing/paypal.ts`, `src/mcp/server.ts`, `test/paypal.spec.ts`). *(Optional: if you create a second sandbox personal account for the judges, paste its email and password here — test money only, never a real PayPal login.)*
