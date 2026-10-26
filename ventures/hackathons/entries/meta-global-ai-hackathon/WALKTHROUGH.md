# Agent walkthrough — Muse Spark runs a counterparty check through gankdat

Dry-run transcript of `scripts/meta-diligence-agent.ts` (2026-10-26): a scripted model and canned
registers, so the shape is exact and the figures are fixtures. The live transcript on Meta Model
API (`transcript.md` from the `demo video` workflow's artifact, written by
`scripts/demo-meta-global-ai-hackathon.ts` from the page's own events) replaces this file in
`meta-global-ai-hackathon-live-run` once the key exists (action 032). The same loop is what
https://apps.gankdat.com/diligence streams to the browser.

## Command

```
$ node --disable-warning=ExperimentalWarning scripts/meta-diligence-agent.ts --dry-run "Acme Widgets Ltd"
→ query_uk_companies "Acme Widgets Ltd" → 1 match
→ query_uk_sanctions "Acme Widgets Ltd" → 0 matches
→ query_uk_insolvency "Acme Widgets Ltd" → 1 match
→ query_uk_sponsors "Acme Widgets Ltd" → 0 matches
→ query_uk_contract_awards "Acme Widgets Ltd" → 1 match
model calls 2/40, tokens 2040/300000 (dry run)
```

Live, the first line reads `model muse-spark-1.3 on Meta Model API; 7 registers over MCP` and the
model chooses the registers itself (the system prompt lets it call several in one turn); the cost
line counts what Meta Model API reports in `usage`.

## Report

```markdown
# Due diligence: Acme Widgets Ltd

## Identity
- Companies House: 1 match (query_uk_companies) — active since 2009, SIC 62012, Manchester.

## Red flags
- Sanctions: 0 match (query_uk_sanctions).
- Insolvency notices: 1 (query_uk_insolvency) — Notices of Intended Dividends, Gazette 2025-11-02.

## Public money
- Contract awards: 1 (query_uk_contract_awards) — Manchester City Council, £48,000, 2024-06.
- Sponsor licence: 0 (query_uk_sponsors).

## Verdict
MEDIUM risk — an insolvency notice is on the Gazette; no sanctions match.

## Sources
- query_uk_companies {"q":"Acme Widgets Ltd"}
- query_uk_sanctions {"q":"Acme Widgets Ltd"}
- query_uk_insolvency {"q":"Acme Widgets Ltd"}
- query_uk_sponsors {"q":"Acme Widgets Ltd"}
- query_uk_contract_awards {"q":"Acme Widgets Ltd"}
```

## What the page shows

The same events, streamed: a status line (`Running muse-spark-1.3 on Meta Model API — reading the
registers…`), one line per register as its result lands (`query_uk_sanctions "Acme Widgets Ltd" → 0
matches`), the report rendered with the verdict as a coloured pill, and the meter
(`model calls 2/40 · tokens 2040/300000 · 21.4 s`).
