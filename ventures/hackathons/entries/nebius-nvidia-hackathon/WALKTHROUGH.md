# Agent walkthrough — Nemotron runs a counterparty check through gankdat

Dry-run transcript of `scripts/nebius-diligence-agent.ts` (2026-10-13): a scripted model and canned
registers, so the shape is exact and the figures are fixtures. The live transcript on Nebius Token
Factory replaces this file in `nebius-nvidia-hackathon-submit` once the key exists (action 025).

## Command

```
$ node --disable-warning=ExperimentalWarning scripts/nebius-diligence-agent.ts --dry-run "Acme Widgets Ltd"
→ query_uk_companies {"q":"Acme Widgets Ltd"} (200 chars)
→ query_uk_sanctions {"q":"Acme Widgets Ltd"} (22 chars)
→ query_uk_insolvency {"q":"Acme Widgets Ltd"} (179 chars)
→ query_uk_sponsors {"q":"Acme Widgets Ltd"} (22 chars)
→ query_uk_contract_awards {"q":"Acme Widgets Ltd"} (128 chars)
model calls 2/40, tokens 2040/300000 (dry run)
```

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

Turn 1: the model answers with five tool calls at once (`q` = the company name). Turn 2: with the
five tool messages in context it writes the report. Two model calls, ~2k tokens — about US$0.0005
at the Nano-class price; the guard would stop it at 40 calls or 300k tokens.
