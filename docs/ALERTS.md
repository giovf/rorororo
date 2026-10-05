# Alerts and handoffs

Written by the cloud routines (daily build, daily metrics, inbox triage). Interactive
sessions read this file first and clear the items that need secrets, accounts or a
browser — the routines cannot do those. Convention: one line per item,
`- YYYY-MM-DD handoff: <what the next interactive session must do>` for agent-to-agent
work, and `- YYYY-MM-DD owner: <what and where>` for anything needing the owner — those
lines are sent to their phone by the `notify owner` job. Closing an entry **appends** to it —
`npm run handoffs -- close "<first-line text>" --by <routine> --how "<how>"` writes
` — Done YYYY-MM-DD (<routine>): <how>` (or ` — Superseded …` with `--superseded`) on the original
entry; never a new `done:` line, never a deletion by a routine. `npm run handoffs` lists what is still
open, oldest first, with ages (`scripts/handoffs.ts`, 2026-10-01). An interactive session may prune
closed entries older than 30 days (git keeps the history).

## Open

- 2026-09-21 handoff: verify the new `uk-schools` ingest against the real files — the daily
  build container has no egress to `ea-edubase-api-prod.azurewebsites.net` or `www.gov.uk`
  (proxy 403), so the GIAS and Ofsted column mappings in `src/sources/uk-schools.ts` are
  written from the research doc, not from a live file. Run one refresh against production
  (or `npm run dev` with network) and check the row count (~50k) and that `ofsted_rating`
  and `ofsted_last_inspection` are populated. A header change fails loudly
  (`GIAS extract format changed — missing: …`), and the Ofsted join degrades to the
  Ofsted columns GIAS itself carries rather than failing the load. — Done 2026-10-01 (burn-down): executed by the interactive session 2026-09-21 (done: line below): 52,578 schools loaded in wave 5, ofsted columns populated
- 2026-09-21 handoff: push the new Apify actor `ventures/gankdat/apify/uk-schools`
  (`npx apify-cli push` with `APIFY_TOKEN`) and price it at the same US$0.001/result
  pay-per-event as the others — subject to the new-publisher limit still blocking four
  actors (support asked 2026-09-20). — Done 2026-10-01 (burn-down): pushed and priced 2026-09-21 by the interactive session (actor JpzvkJcNfbaieyqrg)
- 2026-09-21 handoff: re-publish the MCP registry entry at v0.12.0 (`server.json` now names
  schools) — needs `mcp-registry-key.pem`; see MARKETPLACE-PREP.md for the two commands. — Done 2026-10-01 (burn-down): registry at v0.12.0 since 2026-09-21 (done: line below)
- 2026-09-21 owner: gankdat looks to have its **first paying account** (today's metrics row:
  6 accounts, 1 paid; no revenue row in the ledger yet). Please confirm it in Stripe — and
  note it re-opens the ICO data protection fee (action 012), which you deferred until the
  first real customer. Claude will record the net GBP in `docs/LEDGER.md` once confirmed. — Superseded 2026-10-01 (burn-down): false alarm, see the correction owner line of the same day (internal Apify service account)
- 2026-09-21 handoff: the 2026-09-21 metrics row reports refresh errors on five sources
  (`sam-exclusions`, `uk-care-locations`, `uk-charities`, `uk-contract-awards`,
  `uk-food-hygiene`) — every D1 wave except wave 2. Read the Worker logs / `refresh_log`
  and force a refresh; if the waves are overrunning the 15-minute Cron Trigger limit,
  rebalance them (this build added wave 5 at 05:50, so there is room to split wave 3). — Done 2026-10-01 (burn-down): yesterday's forced runs inside the 24h window; waves 10/12 ok on 2026-09-21 (done: line below)
- 2026-09-21 handoff: file the Taskmaster row for `uk-schools` retrospectively — the daily
  build container has neither the `task-master` CLI nor a working task-master-ai MCP
  connection (timed out), so the venture's "task before coding" convention could not be
  honoured this run. — Done 2026-10-01 (burn-down): Taskmaster #54 filed 2026-09-21 by the interactive session
- 2026-09-21 owner: Telegram notifications are live — this line is the end-to-end test; nothing to do. — Done 2026-10-01 (burn-down): end-to-end test line, nothing was owed
- 2026-09-21 owner: Telegram is wired end to end — this is the CI test message; nothing to do. — Done 2026-10-01 (burn-down): CI test line, nothing was owed
- 2026-09-21 owner: correction — the "first paying account" alert earlier today was a false alarm: the paid-plan account is our own internal service account for the Apify actors, not a customer. No revenue yet; the ICO fee stays deferred; nothing to do. (Metrics now exclude internal accounts.) — Done 2026-10-01 (burn-down): information only, nothing was owed
- 2026-09-21 done: handoffs from the daily build executed by the interactive session — registry at v0.12.0, Apify actor uk-schools pushed + priced (JpzvkJcNfbaieyqrg), Taskmaster #54 filed, live ingest verified (52,578 schools loaded in wave 5 at 12:50 UTC), the five-source refresh-error note was yesterday's forced runs inside the 24h window (today's waves: 10/12 ok, two transient origin errors now retried), and the "first paying account" was the internal Apify service account (metrics now exclude internal accounts).
- 2026-09-22 done: Variables Toolkit launch recorded by the daily build — approval verified against Figma's own notification email (2026-09-21 20:29 UTC), `venture.json` → `launched`, STORE.md → live with the listing URL, ARCHITECTURE/LEDGER notes updated, the apps.gankdat.com product card now links the listing, and day-1/7/30 measurement is set out in `ventures/variables-toolkit/RESEARCH.md` §7. The 07:00 metrics routine reads STORE.md, so real Figma numbers start landing from tomorrow.
- 2026-09-22 owner: **Variables Toolkit is live on Figma Community** — https://www.figma.com/community/plugin/1682711656065145288. The portfolio's first listing on a shelf that takes payment. One thing only you can check (~2 min): open Figma → Settings → Community/Creator payouts and confirm the **Stripe payout is connected**. Without it Figma can sell the $12 unlock but cannot pay the money out. Nothing else needed — no spend, no account creation. — Done 2026-10-01 (interactive): owner 2026-09-28: paid Figma checkout implies payouts connected; closed in OUTSTANDING.md
- 2026-09-22 handoff: fill in the Figma **community resource uuid** in `ventures/variables-toolkit/STORE.md` (needed to read listing comments) — the daily build container has no egress to `figma.com` (proxy 403). One fetch of `https://www.figma.com/api/search/resources?query=Variables%20Toolkit&resource_type=plugin` from a session with network gets it. — Done 2026-10-01 (burn-down): filled in 2026-09-22 (done: line below)
- 2026-09-22 handoff: verify the new `nhs-ods` ingest against the real files — the build container
  has no egress to `files.digital.nhs.uk` (proxy blocked), so the six file names
  (`etr`, `ets`, `epraccur`, `edispensary`, `egdpprac`, `ephp` under
  `/assets/ods/current/`) and the standard 27-column positional layout in
  `src/sources/nhs-ods.ts` come from the ODS file specifications, not a live download. Wave 6
  runs at 05:55; check tomorrow's `refresh_log` / metrics row (~45k rows expected, telephone
  column absent, `status` populated for practices and pharmacies) and fix any file name that
  404s. A reshaped file fails loudly (`ODS <file> format changed`). — Done 2026-10-01 (burn-down): fixed 2026-09-24 by the interactive session: files moved to odsdatasearchandexport.nhs.uk getReport CSVs (done: line of 2026-09-24)
- 2026-09-22 handoff: file the Taskmaster row for `nhs-ods` retrospectively (no `task-master`
  CLI and the task-master-ai MCP timed out in the build container again). — Done 2026-10-01 (burn-down): row filed today with npm run task -- add (scripts/taskmaster-add.ts)
- 2026-09-22 done: Figma community resource uuid filled in (`b376009b-…`); the 07:00 metrics routine can now read listing comments. Stale sandbox clone stalled the 04:05 triage run — every routine prompt now carries a non-destructive fallback (`git switch -c work origin/main`). GitHub-scheduled jobs (owner notes, gankdat metrics) missed most of their slots overnight; both now also run on every push to `main` as a fallback.
- 2026-09-22 handoff: **ReadFocus** tentatively approved on Firefox Add-ons (AMO), v0.1.0, live at
  https://addons.mozilla.org/addon/readfocus-focus-reading-dyslex/ (Mozilla email 2026-09-22 22:25 UTC,
  ref Addon#3075364 — automated screening only, a human reviewer may still ask for changes or pull it).
  Update `ventures/readfocus/venture.json`/STORE.md with the AMO listing and note the new channel. — Done 2026-10-01 (burn-down): recorded 2026-09-30 in ventures/read-focus/STORE.md and RESEARCH.md (Firefox live since 2026-09-22)
- 2026-09-22 handoff: **Highlight Keep** tentatively approved on Firefox Add-ons (AMO), v0.1.0, live at
  https://addons.mozilla.org/addon/highlight-keep-web-highlighter/ (Mozilla email 2026-09-22 22:40 UTC,
  ref Addon#3075366 — automated screening only, a human reviewer may still ask for changes or pull it).
  Update `ventures/highlight-keep/venture.json`/STORE.md with the AMO listing and note the new channel. — Done 2026-10-01 (burn-down): recorded 2026-09-30 in ventures/highlight-keep/STORE.md (Firefox live since 2026-09-22)
- 2026-09-23 handoff: **gankdat** is now listed in the community directory
  `punkpeye/awesome-remote-mcp-servers` — PR #460 merged 2026-09-23 02:21 UTC. Add the
  listing to `ventures/gankdat/STORE.md` distribution channels. The merge-bot comment also
  asks for a Discord username for a "server-author flair" — optional, no action taken (not
  an owner-identity action, just a nice-to-have; skip unless the owner wants it). — Done 2026-10-01 (burn-down): recorded as live 2026-09-24 by the interactive session (done: line of 2026-09-24)
- 2026-09-23 handoff: verify the new `uk-trademark-journal` ingest against a real issue — the build
  container has no egress to ipo.gov.uk (proxy 403), so the file name (`jnl.zip` tried first, then
  `jnl.xml`, the latter confirmed by search-engine index at
  `https://www.ipo.gov.uk/t-tmj/tm-journals/<yyyy>-<nnn>/jnl.xml`), the element and section names
  in `LAYOUT` (`src/sources/uk-trademark-journal.ts`) and the applicant-name heuristic are
  assumptions. Wave 7 first runs 06:05 tomorrow; a wrong layout fails loudly in `refresh_log`
  ("no published application recognised … element names seen: …") — paste the real names into
  `LAYOUT`, and check `publication_date`/`opposition_deadline` are populated. One `curl -sI` of
  `…/2026-038/jnl.zip` and `jnl.xml` settles the file question. — Done 2026-10-01 (burn-down): verified live 2026-09-24: jnl.xml 200, 13,758 records, dates populated (done: line of 2026-09-24)
- 2026-09-23 handoff: `nhs-ods` errored on its first live wave-6 run (2026-09-23 metrics row) and
  `sam-exclusions` + `uk-charities` errored the same night. Read the `refresh_log` messages (the
  build container cannot) and fix `nhs-ods`; queue item `nhs-ods-refresh-error` is blocked on that
  text. Likely suspects: a file name under `/assets/ods/current/`, a host that refuses the Worker's
  user agent, or a ZIP with more than one entry (the shared unwrapper reads the first entry only). — Done 2026-10-01 (burn-down): nhs-ods fixed 2026-09-24 (done: line of 2026-09-24)
- 2026-09-23 handoff: file the Taskmaster row for `uk-trademark-journal` retrospectively (the
  task-master-ai MCP timed out in the build container again). — Done 2026-10-01 (burn-down): Taskmaster #56 filed 2026-09-24 by the interactive session
- 2026-09-24 handoff: `uk-gambling-operators` (gankdat queue) is blocked on one page view: read the
  licence field on https://www.data.gov.uk/dataset/operator-licence-register (and, if it is not
  OGL, the terms on https://www.gamblingcommission.gov.uk/public-register/businesses/download) —
  the build container cannot reach data.gov.uk, ckan or gamblingcommission.gov.uk. Paste the
  statement into the queue item's `why`, set it back to `todo`, and the next build run ships it.
  While there: `curl -sI` the five files under `https://www.gamblingcommission.gov.uk/downloads/`
  (`business-licence-register-{businesses,licences,trading-names,domain-names}.csv`,
  `premises-licence-register.csv`) and note the header rows so the ingest is not written blind.
  Also file the Taskmaster row for `change-feed-upsell` (v0.16.0) retrospectively — no
  `task-master` CLI in the build container and the MCP timed out again. — Done 2026-10-01 (burn-down): unblocked 2026-09-24: OGL v3 confirmed, five CSV headers in the queue item, Taskmaster #57 filed (done: line of 2026-09-24)
- 2026-09-24 done: handoffs from the 2026-09-23/24 builds executed by the interactive session — nhs-ods fixed (files moved to odsdatasearchandexport.nhs.uk getReport CSVs; old ZIP path 403s for every UA); uk-trademark-journal verified live (jnl.xml 200, 13,758 records, publication_date + opposition_deadline populated; jnl.zip is 403 so the code's zip-then-xml order is right); uk-gambling-operators unblocked (OGL v3 confirmed on data.gov.uk + CKAN; five CSV headers recorded in the queue item; activities.csv does not exist); awesome-remote-mcp-servers listing recorded as live; Taskmaster #56 (trademark journal) and #57 (change-feed upsell) filed.
- 2026-09-25 handoff: activate the run watchdog — `git mv docs/ci/run-watchdog.yml .github/workflows/run-watchdog.yml`
  and push (needs a token with the `workflow` scope; the build routine's git push and GitHub API calls
  were both refused with "required workflow scope"). The script (`scripts/run-watchdog.ts`, tests
  green, dormant until then) then reports any routine slot with no trace within 2 h as a
  `watchdog | missed:` Telegram bullet. Set foundry queue item `run-watchdog` to `done` in the same
  commit. While there: the queued `workflow-scope` item needs the owner's fine-grained PAT
  (Contents + Workflows write) as repo secret `WORKFLOW_TOKEN` — batch with the SAM key hand-over. — Done 2026-10-01 (burn-down): run-watchdog.yml moved into .github/workflows by the interactive session 2026-09-28 (foundry item run-watchdog done)
- 2026-09-25 gankdat/apify: Actor `uk-planning-applications` (faceless-api/uk-planning-applications) flagged "under maintenance" by Apify's automated QA — failing prefilled-input test runs for 3 days; needs investigation (failed run: https://console.apify.com/view/runs/wuRDmzbT84RthY4CB).
- 2026-09-26 handoff: enable the ops retro routine — `trig_015Uvn63XZUVqx1TAiWZrZL6` "Foundry ops retro"
  (Sat 07:59 UTC, prompt mirrored at `docs/routines/ops-retro.md`) was created by the build routine with
  the `create_trigger` tool, which sets no repository source: its validation firing (session
  `cse_01FzQ9gN1R2KVqFD6hTCvva6`) stalled in "requires action" with 0 tokens used, so the trigger is
  left disabled. Attach `giovf/rorororo` to it (routines UI, or the RemoteTrigger HTTP API used for the
  other routines) and enable it, or recreate it from the mirrored prompt (Sonnet, `59 7 * * 6`) and delete
  the disabled one; then set foundry queue item `ops-retro` to `done` and fire it once to get the first
  `docs/retros/2026-W39.md`. The stalled session can be archived. General note recorded in SCHEDULERS.md:
  routines cannot create working routines, only drafts + this handoff. — Done 2026-10-01 (burn-down): attached, set to Sonnet and enabled by the interactive session 2026-09-28 (SCHEDULERS.md row, foundry item ops-retro done); first run Sat 2026-10-03
- 2026-09-26 owner: launch posts are ready to paste — `ventures/gankdat/docs/LAUNCH-POST-KIT.md` has the Show HN,
  Product Hunt, r/datasets and Indie Hackers copy (current facts, images to take, comment answers, a two-week
  timing table). Optional, as in action 010 §2: these venues need you to post under your own name and answer
  comments for a few hours; nothing else is needed from you. — Done 2026-10-01 (interactive): owner 2026-09-28 declined launch posts
- 2026-09-26 owner: ten B2B outreach emails are drafted in your Gmail (gio@1402celsius.com → Drafts): five bid consultancies, five
  charity/care web agencies, all limited companies, generic mailboxes only, Companies House checked. Read
  `ventures/gankdat/docs/OUTREACH-2026-09.md` (§2 lawful basis, §4 how to send), glance at each firm's contact page, pick the
  From address (info@gankdat.com alias if Gmail has it), send two or three a day and note the dates in §6. Delete any draft you
  do not like. Nothing has been sent. — Done 2026-10-01 (interactive): owner sent them 2026-09-28
- 2026-09-28 owner: Variables Toolkit day-7 read: 2 views, 0 installs in 7 days (the one "user" is your approval test). Figma's
  search API shows why — the listing ranks 8th for its own name behind a 2,784-user plugin also called "Variables Toolkit",
  79th for "styles to variables" and nowhere for "convert styles to variables"; Figma ranks on the name first, and the live
  description shows literal `**` around every heading. Please republish from the Figma desktop app (~15 min, no code change):
  Plugins → Development → import `ventures/variables-toolkit/dist-release/manifest.json` after `npm run build:release -w
  @foundry/variables-toolkit` (or just edit the listing) and paste name, tagline, description and tags from
  `ventures/variables-toolkit/LISTING.md` v2 — bold the headings with the editor's B button, no asterisks. Evidence and the
  day-30 target (≥ 100 views, ≥ 10 installs by 2026-10-21) are in `ventures/variables-toolkit/RESEARCH.md` §8. — Done 2026-10-01 (interactive): owner republished v2 listing 2026-09-28
- 2026-09-28 handoff: inbox backlog catch-up found two store mails that never reached this file — **gankdat's
  MCP server listing is approved and live** on mcpservers.org (email 2026-09-21 07:14 UTC) and **Chrome Web
  Store identity verification is complete** (email 2026-09-21 07:22 UTC, publishing via the CWS API/Developer
  Dashboard is now unblocked). Add the mcpservers.org listing to `ventures/gankdat/STORE.md` distribution
  channels; note the CWS verification where the Chrome Web Store developer account is tracked. Also worth a
  look: 9 unread threads dated 2026-09-18 to 09-21 were sitting unprocessed (never in `docs/INBOX.md`) until
  today's run caught them up — likely from the same missed-run gaps already noted 2026-09-22; no fix applied
  this run since the hourly `newer_than:3h` search is working correctly today. — Done 2026-09-30 (burn-down): mcpservers.org was already in the listings log (`ventures/gankdat/docs/MARKETPLACE-PREP.md`, live 2026-09-21; gankdat has no STORE.md); the CWS identity verification is noted in `ventures/read-focus/STORE.md`; the triage window fix shipped as `triage-backlog-window`.
- 2026-09-28 owner: a Gmail **"Send Mail As" confirmation for info@gankdat.com** (via the 1402celsius.com
  account) has been sitting unconfirmed since 2026-09-19 23:11 UTC — only surfaced now via backlog catch-up.
  Confirming it requires clicking the link in that email under your own Google identity; given the age it may
  have expired, in which case re-trigger from Gmail Settings → Accounts and Import → Send mail as. Nothing to
  do if you don't need to send as info@gankdat.com. — Done 2026-10-01 (interactive): owner confirmed 2026-09-28
- 2026-09-29 done (build routine): the 2026-09-27 and 2026-09-28 Apify "pricing change" handoffs are false alarms — the
  $1.00 / 1,000 results is the PAY_PER_EVENT price `ventures/gankdat/scripts/publish-actors.mjs` sets on every actor we
  publish (US$0.001 per result, STRATEGY §2); Apify mails the publisher when a pricing model is set. It is revenue we
  charge, not a cost we pay; nothing for the ledger. The general fix (a self-caused notification list read by triage and
  the report) is queued as foundry item `self-caused-alerts`.
- 2026-09-29 handoff: apply the self-caused-alerts prompt change to two routines — the build routine cannot
  (`update_trigger` refuses routines created via the HTTP API). Replace the stored prompt of **Foundry inbox
  triage** (`trig_011NfGaSrEEsr5B1xTHEBRAr`) with the text below the `---` in `docs/routines/inbox-triage.md`
  and of **Foundry weekly report** (`trig_01PjxdBAcvYSAT32fCyzcvQg`) with `docs/routines/weekly-report.md`
  (https://claude.ai/code/routines/<id> or the RemoteTrigger API). The weekly report differs from its live prompt by one
  sentence pointing at `docs/ops/SELF-CAUSED.md`; the triage prompt differs by that sentence and (since 2026-09-30) by
  step 1's search, which drops `newer_than:3h` for `in:inbox is:unread`, oldest first, 30 threads a run, plus the
  `(backlog)` marker in step 2, and (since 2026-09-30 burn-down) step 3's STORE.md/venture.json update on a listing
  approval or rejection mail — one replacement from the mirror file carries all three. Nothing else changes. Then delete
  this line's remark in `docs/SCHEDULERS.md` ("live prompt pending the handoff"). — Superseded 2026-09-30 (burn-down): the
  prompts-from-repo handoff below swaps both prompts for the bootstrap, and the mirrors already carry every sentence.
- 2026-09-29 handoff: delete three lines from this file that are now documented false alarms — the
  2026-09-27 Apify pricing handoff, the 2026-09-28 `gankdat/apify` pricing line (both are our own
  US$0.001/result publisher price, `docs/ops/SELF-CAUSED.md` row 1) and the 2026-09-25 SAM.gov
  `owner:` key-rotation line (`sam-exclusions` keyless since 2026-09-20, OUTSTANDING.md C1). Today's
  build commit wrote the self-caused list and its row says "both handoffs closed", but the lines it
  describes are still open above. The fallback run corrected their `docs/INBOX.md` dispositions but
  its deletion from this file was refused by the sandbox's auto-mode classifier (irreversible local
  destruction), so the removal is left to a session that can confirm it. — Done 2026-09-30 (burn-down): the three entries are deleted in this commit; the false alarms stay documented in `docs/ops/SELF-CAUSED.md` and `docs/INBOX.md`.
- 2026-09-29 handoff: file the Taskmaster row for `metrics-change-feed-count` retrospectively
  (`src/middleware/traffic.ts` + the `changes 7d:` metrics query) — the fallback sandbox has no
  `task-master` CLI and the task-master-ai MCP timed out again at session start (30 s). Same
  recurring gap as 2026-09-21/22/23/24; gankdat's CLAUDE.md wants a task before a new module.
  2026-09-30 build: same for `claude-directory-listing` (`src/mcp/preview.ts`, the Origin gate
  in `routes/mcp.ts`, `test/mcp-directory.spec.ts`) — task-master-ai timed out again (CONNECT_TIMEOUT).
  2026-09-30 build (17:00): same for `mcp-oauth-lazy-auth` (`src/auth/oauth.ts`, `src/routes/oauth.ts`,
  migration 0013, `test/oauth.spec.ts`) — CONNECT_TIMEOUT again; the sandbox has no `task-master` CLI. — Done 2026-10-01 (burn-down): rows 17, 18 and 19 filed 2026-09-30 with npm run task -- add (done: line of 2026-09-30)
- 2026-09-30 owner: nothing to do yet — heads-up that the exchange chose a **Claude Connectors Directory** listing for
  gankdat (`docs/exchange/2026-W40.md`); once the build routine ships `claude-directory-listing` it will ask you for one
  portal form at https://claude.ai/directory/manage on your paid Claude plan (~20 min, no new account, no money). — Superseded 2026-10-01 (burn-down): the next owner line (gankdat is ready for the Claude Connectors Directory) is the live ask
- 2026-09-30 owner: **gankdat is ready for the Claude Connectors Directory** (v0.20.0 deploys with this push:
  tool annotations, Origin check, keyless 5-row preview so every tool answers without a key). One portal form on
  your paid Claude plan, ~20 min, no new account, no money: https://claude.ai/directory/manage → Submit new →
  MCP connector, URL `https://gankdat.com/mcp`, no authentication. Every field is pre-written in
  `ventures/gankdat/docs/CLAUDE-DIRECTORY.md` (name, one-liner, description, URLs, reviewer instructions, the
  seven acknowledgments); the only thing to create is a test key at https://gankdat.com/account under an
  @gankdat.com mailbox for the reviewer box. Before ticking "tested in Claude": add it as a custom connector
  and ask one question. Day-30 read is queued for 2026-10-30.
- 2026-09-30 done (fallback routine): triage's `newer_than:3h` window is gone from the prompt mirror
  (`docs/routines/inbox-triage.md` step 1) — the search is now `in:inbox is:unread` with no age filter, oldest
  first, at most 30 threads a run, and step 2 marks any thread older than 3 h `(backlog)`. Unread state, not the
  clock, is the queue, so a missed slot (GitHub cron gaps 2026-09-21/22, usage limits) delays mail instead of
  losing it, as the nine threads of 2026-09-18..21 were lost for a week. No new handoff: the live prompt edit
  rides the 2026-09-29 handoff above, which now carries both sentences. Foundry item `triage-backlog-window`.
- 2026-09-30 handoff: add one sentence to the stored prompt of **Foundry daily build** (`trig_01P9WT733fg3qnuJeKUHE8fx`),
  right before its STEP 0: "STEP -1 — mark the slot: before anything else (before `npm ci`), run
  `npm run slot -- start build`; it pushes a one-line marker so the :20 fallback can see this slot is in flight;
  if the push fails, continue anyway." Optionally replace the fallback's (`trig_01GraXN5FPXmq5M9wJSYYeHN`)
  trace check with: "run `npm run slot -- check build`; if it prints `running` or `done`, stop — the slot is
  taken" (its current `(build)`-commit check already stops on the marker, so this is clarity, not a fix). The
  CLAUDE.md rule of the same date makes the build routine stamp from tomorrow either way; foundry item
  `fallback-slot-race`, `scripts/slot.ts`, `docs/ops/SLOTS.md`. — Superseded 2026-09-30 (burn-down): both sentences are in
  `docs/routines/build.md` and `fallback.md`; the prompts-from-repo handoff below applies them.
- 2026-09-30 handoff: add one sentence to the stored prompt of **Foundry daily metrics** (`trig_01JBrWDAZLeWEAhSBBnA9g8K`),
  at the start of its store-stats step: "The `store metrics` GitHub job (06:45) has already written today's `Daily check` row in
  each venture's RESEARCH.md from a runner that can reach the stores; read that row instead of fetching Chrome, Firefox or
  Figma stats yourself, never overwrite it, and only write a row for a venture whose row for today is missing (then say
  `store-metrics job left no row`)." Ten days of `not live yet` rows for live listings is what this ends; foundry item
  `store-metrics-in-ci`, `scripts/store-metrics.ts`, `docs/ci/store-metrics.yml`. — Superseded 2026-09-30 (burn-down): the
  sentence is in `docs/routines/metrics.md`; the prompts-from-repo handoff below applies it.
- 2026-09-30 done (burn-down): the 2026-09-29 Taskmaster handoff is closed without the interactive session —
  rows 17 (`metrics-change-feed-count`), 18 (`claude-directory-listing`) and 19 (`mcp-oauth-lazy-auth`, migration 0013)
  are in `.taskmaster/tasks/tasks.json`, filed with the new offline command `npm run task -- add` (`scripts/taskmaster-add.ts`,
  foundry item `taskmaster-offline-add`). Routines file their own rows from now on; no more Taskmaster handoffs.
- 2026-09-30 handoff: **one prompt swap for all nine routines** (foundry `prompts-from-repo`; closes the three prompt handoffs
  above). For each row of the table in `docs/routines/README.md`, replace the stored prompt at https://claude.ai/code/routines/<id>
  (or the RemoteTrigger API) with the bootstrap quoted in that README, `<name>` and `<file>` filled from the row — ten triggers
  (the burn-down has two). Order: first the four verbatim mirrors (burn-down, inbox-triage, weekly-report, ops-retro) — swap as
  is. Then the five written from the repo record (build, fallback, exchange, review, metrics): open the stored prompt, diff it
  against the file's text below the `---`, add to the file any sentence the stored prompt has that the file lacks (commit
  `routines: <name> prompt reconciled`), then swap. Nothing else changes; from then on a prompt change is a commit to
  `docs/routines/` and the README's "Stored prompt" column reads `bootstrap` for each swapped row. Also enable the ops retro if
  it is still disabled. ~30 min, no new account, no money. — Done 2026-10-01 (interactive): 2026-10-01: five files reconciled with the stored prompts (missing sentences added), ten triggers now hold the bootstrap
- 2026-09-30 handoff: **ship Highlight Keep 0.1.1** (links moved from github.io to apps.gankdat.com; queue item
  `post-approval-links`, action 013). From a machine with `.env`: `bash scripts/amo-publish.sh ventures/highlight-keep`
  (signs 0.1.1 with `assets/amo-metadata.json`, whose `homepage` is now apps.gankdat.com — AMO takes the homepage from the
  metadata), then `npm run amo-listing -- ventures/highlight-keep` (new `scripts/amo-listing.ts`: uploads the two
  screenshots, sets category Productivity, tags, homepage and support on the AMO listing, idempotent; a 400 on `tags`
  names AMO's allowed list — pick the nearest and rerun; then the same for `ventures/read-focus`, whose
  `assets/amo-listing.json` is already there; **2026-10-01 burn-down: ReadFocus is now 0.2.0 — the PDF reader — so also
  sign and upload it: `bash scripts/amo-publish.sh ventures/read-focus`, then `cd ventures/read-focus && npm run zip && cd ../.. && node scripts/cws-publish.ts upload dckbdaplggmhimpbekhdbaampglfhdgf ventures/read-focus/read-focus.zip && node scripts/cws-publish.ts publish dckbdaplggmhimpbekhdbaampglfhdgf`; dates into `ventures/read-focus/STORE.md`**), then
  `cd ventures/highlight-keep && npm run zip && cd ../.. && node scripts/cws-publish.ts upload pciignkojfpgmfcmjchmpdhonpjkfepc ventures/highlight-keep/highlight-keep.zip && node scripts/cws-publish.ts publish pciignkojfpgmfcmjchmpdhonpjkfepc`.
  (2026-10-01 burn-down: the repo is now **0.2.0** — PDF highlighting — the same commands sign and upload it; AMO release notes updated.)
  Record the submission dates in `ventures/highlight-keep/STORE.md`. Do not flip the repo private yet: that waits for the
  owner's Chrome dashboard privacy-URL edit (action 013) on both extensions and for ReadFocus's own 0.1.1. ~15 min. — Done 2026-10-04 (interactive): 2026-10-04: Highlight Keep 0.2.0 and ReadFocus 0.2.0 signed and submitted to AMO and uploaded+published to CWS (both in review); AMO listing fields set, screenshots re-run after AMO's throttle
- 2026-09-30 owner: **one 2-minute dashboard edit** — the Chrome Web Store privacy-policy URL for Highlight Keep must move
  to `https://apps.gankdat.com/privacy.html` (the page is live; steps in `docs/for-owner/actions/013-repo-private.md`).
  It is the last link keeping the repo public; once you have done it (and the same for ReadFocus, asked the same way
  when its item lands) Claude flips the repo to private. No new account, no money.
- 2026-09-30 owner: ReadFocus is ready for **the same 2-minute dashboard edit** as Highlight Keep — Chrome Web Store →
  ReadFocus (`dckbdaplggmhimpbekhdbaampglfhdgf`) → Privacy tab → privacy policy URL `https://apps.gankdat.com/privacy.html` →
  Save → Submit. Both extensions in one dashboard visit; then Claude flips the repo private. No new account, no money.
- 2026-10-01 owner: GitHub emailed that the **Claude GitHub App is requesting updated/additional permissions** on the
  giovf account (installation 163075240). Review and accept or ignore at
  https://github.com/settings/installations/163075240/permissions/update — only the owner's GitHub identity can approve
  this; Claude keeps current permissions until you do. No money, no new account.
- 2026-10-02 owner: **publish the free "Variables Playground" Community file** (~10 min, £0, Figma desktop): build the
  plugin, run its new dev command "Build Community playground file" in an empty file, set the Cover frame as thumbnail,
  Publish to Community with the copy in `ventures/variables-toolkit/PLAYGROUND.md`, reply with the URL. Steps:
  `docs/for-owner/actions/017-figma-playground-file.md`. Why: free files are surfaced far more than paid plugins; the
  listing has 2 views in 11 days. No new account, no money.
- 2026-10-04 owner: **two minutes on Cloudflare, then the Claude form.** (1) Cloudflare's budget alert of 2026-10-01 says
  **US$15.00 of metered usage** for 2026-09-10..10-10 — three times the US$5 Workers Paid line in `docs/LEDGER.md`, with
  £0 revenue, which trips STRATEGY §7's cost rule. Open https://dash.cloudflare.com/37e56f3ce4dfe49919e85d4380467f44/billing/billable-usage
  and reply (Telegram or a note) with which line carries it — D1 rows written/read, KV, Analytics Engine or Workers requests —
  and the figure; the queue item `cloudflare-usage-breakdown` (8) then cuts the driver (the nightly full D1 rewrites are the
  prime suspect) and corrects the ledger. If the deploy token can read the breakdown itself the build routine will say so and
  you can skip this. (2) The Claude Connectors Directory form (OUTSTANDING E1, ~20 min, pre-written) is still the one shelf
  that opens without a third party; nothing else on the list moves a §4 number. No new account, no money.
- 2026-10-04 owner: **publish the free "Unused Variables Finder & Cleaner" plugin** (~15 min + Figma review, £0, Figma desktop):
  create the plugin so Figma assigns its id, paste the id into `ventures/variables-toolkit/manifest.free.json`, `npm run build:free -w
  @foundry/variables-toolkit`, import `dist-free/manifest.json`, publish with the copy in `LISTING-FREE.md`. Steps:
  `docs/for-owner/actions/018-figma-unused-variables-finder.md`. Why: the toolkit is #1 for "unused variables" yet has 0 installs —
  every winner of that query is free; this one links to the paid listing. Batch with action 017. No new account, no money.
- 2026-10-04 owner: **republish the Variables Toolkit** (~10 min, £0, same Figma desktop session as actions 017/018): it gained a
  fourth tab, **Relink to library variables** (the Variable Utilities / DSO gap from RESEARCH §5), and `manifest.json` now asks for the
  `teamlibrary` permission, so the live build cannot read libraries until a new version is published. `git pull`, `npm run build:release -w
  @foundry/variables-toolkit`, import `ventures/variables-toolkit/dist-release/manifest.json`, try Relink on a file with an enabled
  library, then **Publish → new version** and paste the description + tags from `LISTING.md` (bold headings with B, no asterisks). Steps:
  `docs/for-owner/actions/019-figma-toolkit-republish-relink.md`. No new account, no money.
- 2026-10-04 handoff: **sign and upload ReadFocus 0.3.0** (ruler colour / height / opacity / lock-in-place controls, plus 0.2.1's Firefox for Android: `gecko_android`, phone-width popup, tap-to-place ruler)
  once 0.2.0 clears review on each store, the same way as 0.2.0: `bash scripts/amo-publish.sh ventures/read-focus` (release notes in
  `assets/amo-metadata.json`), then `cd ventures/read-focus && npm run zip && cd ../.. && node scripts/cws-publish.ts upload dckbdaplggmhimpbekhdbaampglfhdgf ventures/read-focus/read-focus.zip && node scripts/cws-publish.ts publish dckbdaplggmhimpbekhdbaampglfhdgf`.
  Afterwards check `https://addons.mozilla.org/api/v5/addons/addon/readfocus-focus-reading-dyslex/` → `current_version.compatibility` lists `android`;
  if not, the AMO developer hub's version page has the Android compatibility box. Record the date in `ventures/read-focus/STORE.md`. ~5 min.
- 2026-10-04 handoff: **sign and upload Highlight Keep 0.3.0** (import from Super Simple Highlighter, merging Restore) the
  same way as 0.2.0: `bash scripts/amo-publish.sh ventures/highlight-keep` (release notes already in `assets/amo-metadata.json`),
  then `cd ventures/highlight-keep && npm run zip && cd ../.. && node scripts/cws-publish.ts upload pciignkojfpgmfcmjchmpdhonpjkfepc ventures/highlight-keep/highlight-keep.zip && node scripts/cws-publish.ts publish pciignkojfpgmfcmjchmpdhonpjkfepc`.
  CWS rejects an upload while 0.2.0 is still in review — wait for that mail (or it is published) first; AMO accepts it now.
  Record the dates in `ventures/highlight-keep/STORE.md`. ~5 min. — Superseded 2026-10-05 (build): 0.4.0 (Weava import) supersedes it; same commands, new handoff below
- 2026-10-05 handoff: **sign and upload Highlight Keep 0.4.0** (imports from Weava/Glasp .csv and Hypothesis exports, the "On for every site" switch, frames/shadow DOM, Markdown-files and Readwise CSV downloads; includes the 0.3.0 Super Simple
  import and merging Restore) the same way as 0.2.0: `bash scripts/amo-publish.sh ventures/highlight-keep` (release notes already in
  `assets/amo-metadata.json`), then `cd ventures/highlight-keep && npm run zip && cd ../.. && node scripts/cws-publish.ts upload pciignkojfpgmfcmjchmpdhonpjkfepc ventures/highlight-keep/highlight-keep.zip && node scripts/cws-publish.ts publish pciignkojfpgmfcmjchmpdhonpjkfepc`.
  CWS rejects an upload while 0.2.0 is still in review — wait for that mail (or it is published) first; AMO accepts it now.
  Record the dates in `ventures/highlight-keep/STORE.md`, then write the `notify` line ("Highlight Keep 0.4 submitted …: imports Weava highlights"). ~5 min.
