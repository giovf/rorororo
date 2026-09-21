# Alerts and handoffs

Written by the cloud routines (daily build, daily metrics, inbox triage). Interactive
sessions read this file first and clear the items that need secrets, accounts or a
browser — the routines cannot do those. Convention: one line per item,
`- YYYY-MM-DD handoff: <what the next interactive session must do>`. Delete a line
once it is done (git keeps the history).

## Open

- 2026-09-21 handoff: verify the new `uk-schools` ingest against the real files — the daily
  build container has no egress to `ea-edubase-api-prod.azurewebsites.net` or `www.gov.uk`
  (proxy 403), so the GIAS and Ofsted column mappings in `src/sources/uk-schools.ts` are
  written from the research doc, not from a live file. Run one refresh against production
  (or `npm run dev` with network) and check the row count (~50k) and that `ofsted_rating`
  and `ofsted_last_inspection` are populated. A header change fails loudly
  (`GIAS extract format changed — missing: …`), and the Ofsted join degrades to the
  Ofsted columns GIAS itself carries rather than failing the load.
- 2026-09-21 handoff: push the new Apify actor `ventures/gankdat/apify/uk-schools`
  (`npx apify-cli push` with `APIFY_TOKEN`) and price it at the same US$0.001/result
  pay-per-event as the others — subject to the new-publisher limit still blocking four
  actors (support asked 2026-09-20).
- 2026-09-21 handoff: re-publish the MCP registry entry at v0.12.0 (`server.json` now names
  schools) — needs `mcp-registry-key.pem`; see MARKETPLACE-PREP.md for the two commands.
- 2026-09-21 handoff: the 2026-09-21 metrics row shows the **first paid account**
  (6 accounts, 1 paid). Confirm it in Stripe, record the net GBP as a `revenue` row in
  `docs/LEDGER.md`, and re-open owner action 012 — the ICO fee was deferred by the owner
  "until gankdat has its first real customer", and that condition now looks met.
- 2026-09-21 handoff: the 2026-09-21 metrics row reports refresh errors on five sources
  (`sam-exclusions`, `uk-care-locations`, `uk-charities`, `uk-contract-awards`,
  `uk-food-hygiene`) — every D1 wave except wave 2. Read the Worker logs / `refresh_log`
  and force a refresh; if the waves are overrunning the 15-minute Cron Trigger limit,
  rebalance them (this build added wave 5 at 05:50, so there is room to split wave 3).
- 2026-09-21 handoff: file the Taskmaster row for `uk-schools` retrospectively — the daily
  build container has neither the `task-master` CLI nor a working task-master-ai MCP
  connection (timed out), so the venture's "task before coding" convention could not be
  honoured this run.
