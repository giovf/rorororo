# Alerts and handoffs

Written by the cloud routines (daily build, daily metrics, inbox triage). Interactive
sessions read this file first and clear the items that need secrets, accounts or a
browser — the routines cannot do those. Convention: one line per item,
`- YYYY-MM-DD handoff: <what the next interactive session must do>` for agent-to-agent
work, and `- YYYY-MM-DD owner: <what and where>` for anything needing the owner — those
lines are sent to their phone by the `notify owner` job. Delete a line once it is done
(git keeps the history).

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
- 2026-09-21 owner: gankdat looks to have its **first paying account** (today's metrics row:
  6 accounts, 1 paid; no revenue row in the ledger yet). Please confirm it in Stripe — and
  note it re-opens the ICO data protection fee (action 012), which you deferred until the
  first real customer. Claude will record the net GBP in `docs/LEDGER.md` once confirmed.
- 2026-09-21 handoff: the 2026-09-21 metrics row reports refresh errors on five sources
  (`sam-exclusions`, `uk-care-locations`, `uk-charities`, `uk-contract-awards`,
  `uk-food-hygiene`) — every D1 wave except wave 2. Read the Worker logs / `refresh_log`
  and force a refresh; if the waves are overrunning the 15-minute Cron Trigger limit,
  rebalance them (this build added wave 5 at 05:50, so there is room to split wave 3).
- 2026-09-21 handoff: file the Taskmaster row for `uk-schools` retrospectively — the daily
  build container has neither the `task-master` CLI nor a working task-master-ai MCP
  connection (timed out), so the venture's "task before coding" convention could not be
  honoured this run.
- 2026-09-21 owner: Telegram notifications are live — this line is the end-to-end test; nothing to do.
- 2026-09-21 owner: Telegram is wired end to end — this is the CI test message; nothing to do.
- 2026-09-21 owner: correction — the "first paying account" alert earlier today was a false alarm: the paid-plan account is our own internal service account for the Apify actors, not a customer. No revenue yet; the ICO fee stays deferred; nothing to do. (Metrics now exclude internal accounts.)
- 2026-09-21 done: handoffs from the daily build executed by the interactive session — registry at v0.12.0, Apify actor uk-schools pushed + priced (JpzvkJcNfbaieyqrg), Taskmaster #54 filed, live ingest verified (52,578 schools loaded in wave 5 at 12:50 UTC), the five-source refresh-error note was yesterday's forced runs inside the 24h window (today's waves: 10/12 ok, two transient origin errors now retried), and the "first paying account" was the internal Apify service account (metrics now exclude internal accounts).
- 2026-09-21 handoff: Figma approved "Variables Toolkit — Styles to Variables, Link & Clean Up" (email 20:29 UTC) — the listing is now live on Figma Community. Update the venture's status/RESEARCH.md from "awaiting owner test + launch" and run the launch checklist in `docs/launch/`.
