# Nebius × NVIDIA Global AI Hackathon — submission text (Devpost form)

Prepared 2026-10-13 by the burn-down routine (hackathons `nebius-diligence-agent`); the owner pastes
these fields into the Devpost form (https://nebiusglobalaihackathon.devpost.com/, submissions close
**2026-10-30 10:00 PT**). Edit freely — the voice is the owner's. The live transcript and the demo
video are added by `nebius-nvidia-hackathon-submit` once the Token Factory key exists (action 025).
Track: **Apps & Agents**.

## Project name

Counterparty check — a Nemotron agent that runs UK due diligence on official registers

## Tagline (≤ 60 chars)

Nemotron on Nebius checks a UK company across 7 registers

## Inspiration

Every UK business that signs a supplier, a tenant or a client is supposed to check it: is the company
real and active, is it on the sanctions list, has it hit the Gazette's insolvency notices, does it hold
public contracts. The data is all public, in seven different registers with seven different shapes,
so the check is usually skipped or paid for. gankdat already serves those registers as one API and
an MCP server for AI agents; this entry puts an open NVIDIA model in front of them so the check
becomes one sentence: "Run due diligence on Acme Widgets Ltd."

## What it does

- **One command, one page.** `nebius-diligence-agent "Acme Widgets Ltd"` asks NVIDIA Nemotron 3.5
  Lightning (served by Nebius Token Factory) to work the case; the model decides which registers to
  read, calls them through gankdat's MCP tools (`query_uk_companies`, `query_uk_sanctions`,
  `query_uk_insolvency`, `query_uk_sponsors`, `query_uk_charities`, `query_uk_contract_awards`,
  `query_uk_company_profiles`) and writes a one-page Markdown report: Identity, Red flags, Public
  money, a LOW / MEDIUM / HIGH verdict with the reason, and a Sources section naming every tool call.
- **Nothing invented.** The system prompt forbids statements without a tool result; a register with
  no match says so. The report cites the tool for every line.
- **Spend guard built in.** Only Nano-class Nemotron models are allowed; the run aborts past 40
  model calls or 300k tokens. A full check costs well under a cent at Token Factory's US$0.06 /
  US$0.24 per million tokens.
- **Dry-run mode.** The same loop runs against a scripted model and canned registers, so the tests
  and the demo rehearsal need no key and no network.

## How we built it

- `scripts/nebius-diligence-agent.ts` (TypeScript, Node 22, no SDK): an OpenAI-compatible tool loop
  against `https://api.tokenfactory.nebius.com/v1/chat/completions` with `tool_choice: auto`; gankdat's
  tools are discovered at run time over MCP (`initialize`, `tools/list`, `tools/call` on
  https://gankdat.com/mcp) and only the seven diligence registers are offered to the model.
- gankdat (https://gankdat.com) is the existing product: a Cloudflare Worker that reads Companies
  House, the Gazette, OFSI/FCDO sanctions, the Home Office sponsor list, the Charity Commission and
  Contracts Finder into one JSON API and one MCP server — 16 datasets, live since 2026-09.
- Tests (`scripts/nebius-diligence-agent.test.ts`): the budget guard, the dry-run report, the Nebius
  request shape, the MCP tool filter.
- Built with Claude Code under the owner's direction (allowed by the rules; the entry says so plainly).

## Challenges we ran into

Keeping a small open model honest: with seven tools and free-text registers, Nemotron's first drafts
cited rows that were not in the tool output. The fix was structural, not prompt magic — the report
format requires a tool name per line and the agent refuses to answer without tool results — and the
spend guard, because a tool loop with a 1M-token context window can burn money fast when the model
re-reads a register.

## Accomplishments that we're proud of

A due-diligence check that a sole trader can run for free against the same registers a compliance
desk pays for, on an open model, with every claim traceable to a public record.

## What we learned

Nemotron 3.5 Lightning handles multi-tool planning well at a fraction of the cost of frontier models
when the tools return compact JSON; the expensive part of an agent is not the model, it is clean data.

## What's next

Watchlists (re-run the check when a register changes, through gankdat's `get_changes` tool), a PDF
export, and the same agent behind gankdat's account page for customers who do not run code.

## Built with

TypeScript, Node.js, NVIDIA Nemotron 3.5 Lightning, Nebius Token Factory, Model Context Protocol,
Cloudflare Workers, D1, Companies House, The Gazette, OFSI, Contracts Finder.

## Links

- Repository: https://github.com/giovf/rorororo (`scripts/nebius-diligence-agent.ts`)
- Try it: https://gankdat.com/mcp (the tools the agent uses; keyless preview)
- Demo video: the `demo-video-nebius-nvidia-hackathon` artifact (recorded by part 2 of the entry)
