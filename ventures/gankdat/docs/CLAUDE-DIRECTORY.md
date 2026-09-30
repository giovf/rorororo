# Claude Connectors Directory — listing pack (2026-09-30)

Everything the portal form at https://claude.ai/directory/manage asks for, ready to paste.
Submit on the owner's paid Claude plan: **Submit new → MCP connector**. ~20 minutes, no new
account, no money. Sources: claude.com/docs/connectors/building/{submission,review-criteria}.

What the server does to pass (shipped in v0.20.0, `test/mcp-directory.spec.ts` keeps it true):
every tool has a `title` + `readOnlyHint`/`destructiveHint`; a foreign `Origin` gets 403; every
tool answers without credentials (the keyless preview — 5 rows, 20 calls/day per client — then a
tool error naming the plans). Re-run the test before any later resubmission.

## Step 1 — Connection

- Server URL: `https://gankdat.com/mcp` (single URL; not "users connect to different URLs")

## Step 2 — Tools

Sync automatically. Expect 22 tools: 20 read-only (`list_sources`, `get_usage`, `get_changes`,
17 × `query_*`) and 2 write, non-destructive (`request_api_key`, `claim_api_key`). If the portal
flags a missing title or annotation, the deploy is stale — check `/mcp` `tools/list` first.

## Step 3 — Listing

- **Name** (≤ 100): `gankdat — UK & EU official registers`
- **One-liner** (≤ 200): `UK & EU tenders, contract awards, planning, companies, charities,
  schools, NHS, care, gambling licences and trade marks — official open data as clean JSON, with
  daily change feeds.`
- **Description** (≤ 2,000):

  > gankdat turns official open-data registers into one clean JSON schema so Claude can answer
  > questions about UK and EU public data with sources it can cite. 17 datasets today: UK
  > procurement notices (Find a Tender) and EU notices (TED), UK contract awards (Contracts
  > Finder), planning applications (planning.data.gov.uk), UK sanctions designations (FCDO),
  > US federal exclusions (SAM.gov), UK corporate insolvency notices (The Gazette), new UK
  > company incorporations (Companies House), the Charity Commission register, licensed visa
  > sponsors (Home Office), CQC care locations, food hygiene ratings (FSA), schools in England
  > with Ofsted outcomes (GIAS), the NHS organisation register (ODS), Gambling Commission
  > licences, and the weekly UK Trade Marks Journal.
  >
  > Every dataset has the same filters (substring, numeric and date ranges, `q` full-text) and
  > every register has a change feed — ask what was added, removed or changed since a date
  > instead of re-reading the whole register. Typical questions: "Which open UK tenders over £1m
  > mention solar?", "Has this supplier been excluded or sanctioned?", "Is this company a
  > licensed visa sponsor?", "What trade marks in class 9 were published this week?".
  >
  > Works without an account: every tool returns a preview (up to 5 rows per call, 20 calls a
  > day). A free API key gives 250 credits a month with full pages; Claude can request it for you
  > (request_api_key emails you one approval link). Paid plans from £5/month. Organisation-level
  > data only: personal fields are dropped at ingest and never stored.

- **Categories** (1–5): Data & analytics · Research · Business · Government / legal (pick the
  closest names the portal offers)
- **Documentation URL**: `https://gankdat.com/docs#claude`
- **Privacy policy URL**: `https://gankdat.com/privacy`
- **Support contact**: `info@gankdat.com`
- **Icon**: `ventures/gankdat/public/favicon.png` (64×64 PNG of the raccoon; the SVG is
  `public/icon-raccoon.svg` if a larger raster is asked for — export at the size requested)
- **Slug** (permanent): `gankdat`

## Step 4 — Use cases

- Primary: bid intelligence (tenders, awards, planning), supplier and counterparty due
  diligence (sanctions, exclusions, insolvency, incorporations, sponsors), sector lead lists
  (charities, care, schools, NHS, gambling), trade-mark watching.
- What users need before connecting: nothing (preview). A free gankdat account for full pages.
- Reads data, writes data, or both: **reads** (the two sign-up tools only request a key).

## Step 5 — Company

- Company name: the owner's trading name (sole trader) · Website: `https://gankdat.com`
- Primary contact: `info@gankdat.com`

## Step 6 — Authentication

- **No authentication**. Tick the option that the server works without authentication and
  individual tools ask for it on demand (the preview, then `request_api_key`). OAuth is queued
  (`mcp-oauth-lazy-auth`) and will be added as a listing edit when it ships.

## Step 7 — Data handling

- Underlying API: **our own** (gankdat.com is first-party; it republishes official open-licence
  government data — no third-party API is proxied).
- Personal health data: no. Sponsored content: no.

## Step 8 — Test & launch

Paste as the reviewer instructions:

> No credentials needed: connect `https://gankdat.com/mcp` with no authentication and every
> tool answers. Try `list_sources` (all datasets and their filters), `query_uk_tenders` with
> `{"q":"solar","per_page":5}`, `get_changes` with `{"source":"uk-charities"}`, and `get_usage`
> (shows the preview budget). Without a key the data tools return up to 5 rows and 20 calls per
> day per client; a key removes those limits. Test key for a populated free account: [paste a
> key created at https://gankdat.com/account under an @gankdat.com mailbox]. Clients that
> support headers send it as `Authorization: Bearer <key>`.

Before ticking "I have tested every tool": add the server as a custom connector in Claude and
call one query tool, `get_changes` and `get_usage` from a chat (the CI test already exercises
all 22 tools; the portal wants the human confirmation).

## Step 9 — Compliance

All seven acknowledgments apply as-is: directory guidelines, first-party API, no financial
transactions (x402 payments are a separate REST surface, not an MCP tool), no AI media
generation, no prompt-injection patterns (descriptions state what each tool does and its
cost, nothing about Claude's behaviour), no conversation data collected (tool arguments
only; UA and tool name in analytics, never an IP), public documentation at `/docs#claude`.

## After submission

Community listing appears after the automatic scan. Metrics (rank, distinct accounts, tool
calls, error rate) live in the portal; the queue item `claude-directory-day-30` records them
on 2026-10-30. Anthropic's egress range for the Daily numbers row: `160.79.104.0/21`.
