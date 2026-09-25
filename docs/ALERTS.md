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
- 2026-09-22 done: Variables Toolkit launch recorded by the daily build — approval verified against Figma's own notification email (2026-09-21 20:29 UTC), `venture.json` → `launched`, STORE.md → live with the listing URL, ARCHITECTURE/LEDGER notes updated, the apps.gankdat.com product card now links the listing, and day-1/7/30 measurement is set out in `ventures/variables-toolkit/RESEARCH.md` §7. The 07:00 metrics routine reads STORE.md, so real Figma numbers start landing from tomorrow.
- 2026-09-22 owner: **Variables Toolkit is live on Figma Community** — https://www.figma.com/community/plugin/1682711656065145288. The portfolio's first listing on a shelf that takes payment. One thing only you can check (~2 min): open Figma → Settings → Community/Creator payouts and confirm the **Stripe payout is connected**. Without it Figma can sell the $12 unlock but cannot pay the money out. Nothing else needed — no spend, no account creation.
- 2026-09-22 handoff: fill in the Figma **community resource uuid** in `ventures/variables-toolkit/STORE.md` (needed to read listing comments) — the daily build container has no egress to `figma.com` (proxy 403). One fetch of `https://www.figma.com/api/search/resources?query=Variables%20Toolkit&resource_type=plugin` from a session with network gets it.
- 2026-09-22 handoff: verify the new `nhs-ods` ingest against the real files — the build container
  has no egress to `files.digital.nhs.uk` (proxy blocked), so the six file names
  (`etr`, `ets`, `epraccur`, `edispensary`, `egdpprac`, `ephp` under
  `/assets/ods/current/`) and the standard 27-column positional layout in
  `src/sources/nhs-ods.ts` come from the ODS file specifications, not a live download. Wave 6
  runs at 05:55; check tomorrow's `refresh_log` / metrics row (~45k rows expected, telephone
  column absent, `status` populated for practices and pharmacies) and fix any file name that
  404s. A reshaped file fails loudly (`ODS <file> format changed`).
- 2026-09-22 handoff: file the Taskmaster row for `nhs-ods` retrospectively (no `task-master`
  CLI and the task-master-ai MCP timed out in the build container again).
- 2026-09-22 done: Figma community resource uuid filled in (`b376009b-…`); the 07:00 metrics routine can now read listing comments. Stale sandbox clone stalled the 04:05 triage run — every routine prompt now carries a non-destructive fallback (`git switch -c work origin/main`). GitHub-scheduled jobs (owner notes, gankdat metrics) missed most of their slots overnight; both now also run on every push to `main` as a fallback.
- 2026-09-22 handoff: **ReadFocus** tentatively approved on Firefox Add-ons (AMO), v0.1.0, live at
  https://addons.mozilla.org/addon/readfocus-focus-reading-dyslex/ (Mozilla email 2026-09-22 22:25 UTC,
  ref Addon#3075364 — automated screening only, a human reviewer may still ask for changes or pull it).
  Update `ventures/readfocus/venture.json`/STORE.md with the AMO listing and note the new channel.
- 2026-09-22 handoff: **Highlight Keep** tentatively approved on Firefox Add-ons (AMO), v0.1.0, live at
  https://addons.mozilla.org/addon/highlight-keep-web-highlighter/ (Mozilla email 2026-09-22 22:40 UTC,
  ref Addon#3075366 — automated screening only, a human reviewer may still ask for changes or pull it).
  Update `ventures/highlight-keep/venture.json`/STORE.md with the AMO listing and note the new channel.
- 2026-09-23 handoff: **gankdat** is now listed in the community directory
  `punkpeye/awesome-remote-mcp-servers` — PR #460 merged 2026-09-23 02:21 UTC. Add the
  listing to `ventures/gankdat/STORE.md` distribution channels. The merge-bot comment also
  asks for a Discord username for a "server-author flair" — optional, no action taken (not
  an owner-identity action, just a nice-to-have; skip unless the owner wants it).
- 2026-09-23 handoff: verify the new `uk-trademark-journal` ingest against a real issue — the build
  container has no egress to ipo.gov.uk (proxy 403), so the file name (`jnl.zip` tried first, then
  `jnl.xml`, the latter confirmed by search-engine index at
  `https://www.ipo.gov.uk/t-tmj/tm-journals/<yyyy>-<nnn>/jnl.xml`), the element and section names
  in `LAYOUT` (`src/sources/uk-trademark-journal.ts`) and the applicant-name heuristic are
  assumptions. Wave 7 first runs 06:05 tomorrow; a wrong layout fails loudly in `refresh_log`
  ("no published application recognised … element names seen: …") — paste the real names into
  `LAYOUT`, and check `publication_date`/`opposition_deadline` are populated. One `curl -sI` of
  `…/2026-038/jnl.zip` and `jnl.xml` settles the file question.
- 2026-09-23 handoff: `nhs-ods` errored on its first live wave-6 run (2026-09-23 metrics row) and
  `sam-exclusions` + `uk-charities` errored the same night. Read the `refresh_log` messages (the
  build container cannot) and fix `nhs-ods`; queue item `nhs-ods-refresh-error` is blocked on that
  text. Likely suspects: a file name under `/assets/ods/current/`, a host that refuses the Worker's
  user agent, or a ZIP with more than one entry (the shared unwrapper reads the first entry only).
- 2026-09-23 handoff: file the Taskmaster row for `uk-trademark-journal` retrospectively (the
  task-master-ai MCP timed out in the build container again).
- 2026-09-24 handoff: `uk-gambling-operators` (gankdat queue) is blocked on one page view: read the
  licence field on https://www.data.gov.uk/dataset/operator-licence-register (and, if it is not
  OGL, the terms on https://www.gamblingcommission.gov.uk/public-register/businesses/download) —
  the build container cannot reach data.gov.uk, ckan or gamblingcommission.gov.uk. Paste the
  statement into the queue item's `why`, set it back to `todo`, and the next build run ships it.
  While there: `curl -sI` the five files under `https://www.gamblingcommission.gov.uk/downloads/`
  (`business-licence-register-{businesses,licences,trading-names,domain-names}.csv`,
  `premises-licence-register.csv`) and note the header rows so the ingest is not written blind.
  Also file the Taskmaster row for `change-feed-upsell` (v0.16.0) retrospectively — no
  `task-master` CLI in the build container and the MCP timed out again.
- 2026-09-24 done: handoffs from the 2026-09-23/24 builds executed by the interactive session — nhs-ods fixed (files moved to odsdatasearchandexport.nhs.uk getReport CSVs; old ZIP path 403s for every UA); uk-trademark-journal verified live (jnl.xml 200, 13,758 records, publication_date + opposition_deadline populated; jnl.zip is 403 so the code's zip-then-xml order is right); uk-gambling-operators unblocked (OGL v3 confirmed on data.gov.uk + CKAN; five CSV headers recorded in the queue item; activities.csv does not exist); awesome-remote-mcp-servers listing recorded as live; Taskmaster #56 (trademark journal) and #57 (change-feed upsell) filed.
- 2026-09-25 owner: SAM.gov emailed a 1st reminder (2026-09-25 08:02 UTC) that the individual-account API key backing gankdat's `sam-exclusions` source rotates in 15 days (~2026-10-10). A replacement key is already generated under the account's Public API Key profile section at sam.gov — please sign in, grab it, and hand it to Claude to update the Worker secret before the old key stops working. Nothing to do until then.
- 2026-09-25 handoff: activate the run watchdog — `git mv docs/ci/run-watchdog.yml .github/workflows/run-watchdog.yml`
  and push (needs a token with the `workflow` scope; the build routine's git push and GitHub API calls
  were both refused with "required workflow scope"). The script (`scripts/run-watchdog.ts`, tests
  green, dormant until then) then reports any routine slot with no trace within 2 h as a
  `watchdog | missed:` Telegram bullet. Set foundry queue item `run-watchdog` to `done` in the same
  commit. While there: the queued `workflow-scope` item needs the owner's fine-grained PAT
  (Contents + Workflows write) as repo secret `WORKFLOW_TOKEN` — batch with the SAM key hand-over.
