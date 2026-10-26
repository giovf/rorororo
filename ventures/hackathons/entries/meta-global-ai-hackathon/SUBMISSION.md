# Meta Global AI Developer Hackathon — submission text (Cerebral Valley form)

Prepared 2026-10-26 by the build routine (hackathons `meta-global-ai-hackathon-entry`); the owner
pastes these fields into the submission portal
(https://cerebralvalley.ai/e/meta-ai-developer-hackathon/hackathon/submit, due **4 Nov 2026,
9:00 PM ET**) — action 032 step 3. Edit freely — the voice is the owner's. The live transcript and the
demo video link are added by `meta-global-ai-hackathon-live-run` once the model key exists (action
032 step 1). Track: **Indie developer**. Theme: **Build for Your World**.

The Official Rules (read 2026-10-26, `ventures/hackathons/RESEARCH.md` §2) judge on Impact 30 %, Use
of Meta AI Tooling 25 %, Technical Depth & Execution 20 % and Demo 25 %; the sections below are
written to those four.

## Project name

Counterparty check — a Muse Spark agent that runs UK due diligence on official registers

## One line (≤ 100 chars)

Type a UK company name; Muse Spark reads seven official registers over MCP and writes a risk report.

## Links

- Live demo: https://apps.gankdat.com/diligence (no sign-in; six checks an hour per visitor)
- Source: https://github.com/giovf/rorororo — `packages/landing/src/diligence-core.ts` (the agent),
  `packages/landing/src/diligence.ts` (the page and its event stream), `scripts/meta-diligence-agent.ts` (CLI)
- The data product it runs on: https://gankdat.com (API, MCP server, 17 UK/EU register datasets)
- Demo video: _added by the live-run item (the `demo video` workflow's artifact)_

## The problem (Impact)

Every UK business that signs a supplier, a tenant or a client is supposed to check it: is the
company real and active, is it on the sanctions list, has it reached the Gazette's insolvency
notices, does it hold public contracts, is it a licensed visa sponsor, is it a registered charity.
The data is public, in seven registers with seven shapes, so the check is usually skipped or paid
for — credit-report subscriptions start around £50 a month for a job a sole trader does a few times
a year. I run a one-person business and skip it like everyone else. This entry makes the check one
sentence: "Run due diligence on Acme Widgets Ltd." Anyone can use it today at the link above, and
the same loop is a 300-line file any firm can run behind its own key.

## What it does

- **One name, one page.** The page (or the CLI) asks Muse Spark to work the case. The model decides
  which registers to read and calls them as tools — `query_uk_companies`, `query_uk_company_profiles`,
  `query_uk_sanctions`, `query_uk_insolvency`, `query_uk_sponsors`, `query_uk_charities`,
  `query_uk_contract_awards` — over the Model Context Protocol against gankdat's MCP server, then
  writes a one-page Markdown report: Identity, Red flags, Public money, a LOW / MEDIUM / HIGH verdict
  with the reason, and a Sources section naming every tool call. The page streams each register as it
  lands.
- **Nothing invented.** The system prompt forbids statements without a tool result; a register with
  no match says so; every line cites the tool it came from. The page tells the reader it is a
  demonstration of what the registers return for the typed name, not advice.
- **Spend guard.** At most 40 model calls and 300k tokens per run, abort beyond; Muse Wonder is refused
  by the guard on Meta Model API. A normal run is three model calls and a few cents; the page adds a
  per-visitor hourly cap and a daily cap so the hackathon credits last the judging.

## Use of Meta AI tooling

- **Muse Spark 1.3 on Meta Model API** (`https://api.meta.ai/v1`, Chat Completions with `tools` and
  `reasoning_effort: low`) is the agent: it plans the register reads, issues parallel tool calls in
  one turn, and writes the report. The entry runs on the hackathon's US$150 of Model API credits.
- **Open-weights by configuration.** The same request goes to Muse Spark Open on Baseten, Modal or
  Fireworks by setting a base URL and a model id (`DILIGENCE_BASE_URL`, `DILIGENCE_MODEL`); the guard
  and the loop do not change. The agent is a thin loop over tools the model discovers at run time,
  which is what the hackathon's "beyond a basic integration" asks: the model is the analyst, not a
  summariser bolted onto a fixed query.
- Built with Muse Code? No — built with Claude Code, the agent that runs this whole portfolio; the
  rules allow it (the submission is my own work product and I own it) and the entry says so plainly.

## Technical depth

- `diligence-core.ts` is one pure TypeScript file (fetch and JSON, no SDK, no Node modules) that runs
  unchanged in a Cloudflare Worker and under Node: the tool loop, the OpenAI-compatible model call,
  MCP discovery (`initialize`, `tools/list`, `tools/call`, limited to the seven registers), the
  budget guard, and a scripted dry-run mode so the tests and the demo rehearsal need no key.
- gankdat (https://gankdat.com) is the existing product underneath: a Cloudflare Worker that reads
  Companies House, the Gazette, the OFSI/FCDO sanctions list, the Home Office sponsor list, the
  Charity Commission and Contracts Finder into one JSON API and one MCP server, live since
  September 2026 with three payment rails. The hackathon work is the Meta adapter, the public page
  with its server-sent-event stream and caps, the CLI, the demo recorder and the tests — all written
  inside the window on an agent that previously existed only against fixtures.
- Tests: the budget guard, the dry-run report, the Meta request shape, the MCP tool filter, the
  page's event stream and caps, the demo shot list.

## Demo

- Live: https://apps.gankdat.com/diligence — type a name, watch the registers come in, read the report.
- Video (≤ 3 min): the live page checking a real company, then the CLI and the source.
- CLI: `META_MODEL_API_KEY=… node scripts/meta-diligence-agent.ts "Acme Widgets Ltd"`, or
  `--dry-run` for the fixture story without a key.

## What's next

A verdict rubric the model must fill from the registers (so two runs on one company agree), the
company number as the key (the name can match several companies), and the change feeds gankdat
already serves — a watch that re-runs the check when a register changes for a counterparty.

## Team

Solo (indie developer track). Built with Claude Code under the owner's direction.
