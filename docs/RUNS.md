# Run log

One line per piece of work done, newest last; every new line is sent to the owner's Telegram
as a bullet by the `notify owner` CI job. Format:
`- YYYY-MM-DD HH:MM | <routine> | <one thing done, ≤ 120 chars>`. A run that did five things
writes five lines (dataset built, tests added, actor pushed, doc updated, item blocked …).
Routines: build, exchange, review, report; interactive sessions too; `watchdog` lines come from
the `run watchdog` CI job (once active) when a routine slot left no trace within 2 h.

- 2026-09-22 12:05 | interactive | Run log wired: build, exchange, review and report now post a one-line overview here after each run
- 2026-09-22 15:10 | interactive | Run log now one bullet per piece of work, not one overview line (owner correction)
- 2026-09-22 15:10 | interactive | Build routine runs twice daily (09:30, 21:30 UTC) on Fable and reads docs/pipeline
- 2026-09-22 15:10 | interactive | New weekly venture exchange routine (Wednesdays 08:00) opens or extends venture queues
- 2026-09-22 15:10 | interactive | Strategy review now weekly (Sundays 08:00) on Fable; applies verdicts to the queues
- 2026-09-22 15:10 | interactive | Pipeline model + npm run pipeline validator added to the root check (6 tests)
- 2026-09-22 15:10 | interactive | GitHub cron missed most slots overnight; owner-notes and metrics jobs now also run on push
- 2026-09-22 15:10 | interactive | Figma comment-feed id filled in; Gazette truncated-body retry; routine clone fallback
- 2026-09-22 18:30 | build | nhs-ods dataset: NHS ODS register (GP practices, trusts+sites, pharmacies, dentists, IHPs), ~45k rows
- 2026-09-22 18:30 | build | nhs-ods tests: 7 specs (6 ZIP files, telephone dropped, loud failure keeps previous generation)
- 2026-09-22 18:30 | build | Refresh wave 6 added at 05:55 UTC so the unverified NHS ingest cannot stall another dataset
- 2026-09-22 18:30 | build | Landing card, terms row, sitemap and stats page for nhs-ods; registry bumped to v0.14.0
- 2026-09-22 18:30 | build | Apify actor nhs-ods (NHS Organisations Directory) added; CI pushes and prices it
- 2026-09-22 18:30 | build | Handoff: verify the live ODS file names tomorrow (build container has no egress to NHS hosts)
- 2026-09-23 08:15 | exchange | Winner: UK Trade Marks Journal dataset for gankdat, score 8 (watch services charge £180–320/mark/yr)
- 2026-09-23 08:15 | exchange | Queued gankdat: uk-trademark-journal (8), uk-gambling-operators (6), trademark-watch-surface (4)
- 2026-09-23 08:15 | exchange | Parked: Variables Toolkit v0.2 relink (day-7 read first); second Figma plugin (day-30 sales)
- 2026-09-23 08:15 | exchange | Declined: Shopify app (cost), Stripe Apps (identity), extension #3 (rule), FCA register (licence)
- 2026-09-23 08:15 | exchange | Comparison with sources in docs/exchange/2026-W39.md; STRATEGY §8 logged; nothing needs the owner
- 2026-09-23 09:40 | build | uk-trademark-journal dataset: IPO weekly Trade Marks Journal, rolling 52 issues, weekly change feed
- 2026-09-23 09:40 | build | Layout-tolerant XML reader (schema unreachable from the sandbox); fails loudly naming the elements it saw
- 2026-09-23 09:40 | build | uk-trademark-journal tests: 16 specs (KV issue cache, download budget, zip edition, Blind Mode, sections)
- 2026-09-23 09:40 | build | Refresh wave 7 added at 06:05 UTC; at most 4 journal issues downloaded per run, window fills over ~13 runs
- 2026-09-23 09:40 | build | Landing card, terms row, sitemap and stats page for uk-trademark-journal; registry bumped to v0.15.0
- 2026-09-23 09:40 | build | Apify actor uk-trademark-journal (UK Trade Mark Applications Weekly) added; CI pushes and prices it
- 2026-09-23 09:40 | build | nhs-ods errored on its first live run (metrics row); cause unreadable from the sandbox, queued blocked + handoff
- 2026-09-23 09:40 | build | Handoff: verify the journal file name and XML layout tomorrow (build container has no egress to ipo.gov.uk)
- 2026-09-24 09:35 | build | uk-gambling-operators blocked: OGL statement unreadable from the sandbox (3 hosts blocked); handoff filed
- 2026-09-24 09:35 | build | change-feed-upsell: /stats pages now show 30 days of added/removed/changed per day + the poll command
- 2026-09-24 09:35 | build | change_feed flag on /v1/data and MCP list_sources; llms.txt gains a Change feeds section and get_changes
- 2026-09-24 09:35 | build | Landing change-feeds card rewritten (8 registers), pricing line: a daily diff of every register fits free
- 2026-09-24 09:35 | build | Docs quickstart step for /v1/changes; registry bumped to v0.16.0; gankdat gate 272 tests green
- 2026-09-24 09:35 | build | Metrics: uk-trademark-journal ran without a refresh error today; nhs-ods and eu-ted still error (blocked)
- 2026-09-24 10:45 | interactive | nhs-ods fixed: NHS moved the files; now read as CSV from odsdatasearchandexport.nhs.uk (6/6 files OK)
- 2026-09-24 10:45 | interactive | uk-trademark-journal verified live: 13,758 marks from journal 2026/038, dates populated
- 2026-09-24 10:45 | interactive | uk-gambling-operators unblocked: OGL v3 confirmed, 5 CSV headers recorded; next build ships it
- 2026-09-24 10:45 | interactive | gankdat listed in awesome-remote-mcp-servers (PR #460 merged); Taskmaster #56/#57 filed
- 2026-09-24 10:45 | interactive | Wednesday burn-down routines created (Wed 18-23, Thu 00-02 UTC); Fable limit was hit Wed 17:09 this week

- 2026-09-24 11:00 | interactive | nhs-ods verified live after a forced refresh: 98,221 organisations (15,651 GP practices) in 69 s
- 2026-09-24 17:28 | build | uk-gambling-operators dataset: Gambling Commission licences, domains and premises, one D1 table, daily diff
- 2026-09-24 17:28 | build | Five register CSVs joined blind against the recorded headers (origin unreachable); every file required, fails loudly
- 2026-09-24 17:28 | build | uk-gambling-operators tests: 6 specs (join, filters incl. is_active, load order, loud failure, fixtures, dates)
- 2026-09-24 17:28 | build | Landing card, terms row, sitemap, docs mention and stats page for uk-gambling-operators; registry bumped to v0.17.0
- 2026-09-24 17:28 | build | Apify actor uk-gambling-operators (UK Gambling Commission Licence Register) added; CI pushes and prices it
- 2026-09-24 17:28 | build | Runs in wave 2 (05:15) from tomorrow; ~15k rows expected; a refresh error would show in the metrics row
- 2026-09-24 17:28 | build | Taskmaster row #58 filed in tasks.json for uk-gambling-operators (no CLI/MCP in the build container)
- 2026-09-24 11:40 | interactive | Fetch relay built: routines can now read blocked hosts via GitHub (docs/relay); self-test request pushed
- 2026-09-24 11:40 | interactive | Foundry queue created (operation's own improvements): watchdog, ops retro, metrics via relay, Fable fallback
- 2026-09-24 11:40 | interactive | gankdat queue: agent paywall sign-up (score 8), launch-post kit, B2B outreach experiment added
- 2026-09-25 09:37 | build | Agent-side sign-up shipped: MCP tools request_api_key + claim_api_key issue a key after one human email click (v0.18.0)
- 2026-09-25 09:37 | build | REST twins POST /v1/auth/agent-signup and /agent-signup/claim; approval page GET-then-POST like magic links
- 2026-09-25 09:37 | build | D1 migration 0011 agent_signups (hashed claim secret, RFC 8628-style code); keys named agent:<client>, inherit plan
- 2026-09-25 09:37 | build | Abuse valves: per-IP sign-up budget shared REST/MCP, per-email hourly cap shared with login; keyless 401s name the path
- 2026-09-25 09:37 | build | 9 new specs (REST + MCP flows, single-use, CSRF, expiry, plan inheritance, rate limits); 290/290 pass
- 2026-09-25 09:37 | build | llms.txt, docs quickstart, landing MCP card, privacy retention updated; server.json republishes with the two tools
- 2026-09-25 09:37 | build | Daily metrics row now reports agent sign-up requests/keys (proof: >= 5 agent-path keys in 30 days)
- 2026-09-25 09:37 | build | uk-gambling-operators first live wave ran without a refresh error (2026-09-25 row); uk-insolvency errored (transient)
- 2026-09-25 09:37 | build | Taskmaster row #59 filed in tasks.json for agent sign-up (no CLI/MCP in the build container)
- 2026-09-25 17:33 | build | Run watchdog built: scripts/run-watchdog.ts flags any routine slot with no RUNS line or commit within 2h (11 tests)
- 2026-09-25 17:33 | build | Replayed on history it reports only the refused Wed 23rd 17:00 build; each miss becomes one Telegram bullet
- 2026-09-25 17:33 | build | BLOCKED on one file move: routine tokens lack the GitHub 'workflow' scope, so the job is drafted at docs/ci/ (handoff)
- 2026-09-25 17:33 | build | Foundry queue: workflow-scope item added (blocked on an owner PAT with the workflow scope, batch with the SAM key)
- 2026-09-25 17:33 | build | metrics-via-relay marked done on evidence: today's Variables Toolkit row carries Figma installs/likes/views via relay
- 2026-09-25 17:33 | build | SCHEDULERS/OPERATIONS note the watchdog and the workflow-scope limit; Taskmaster row #15 filed (root tasks.json)
- 2026-09-26 09:41 | build | Ops retro routine built: Saturday 07:59 UTC audit of slots, throughput, blockers, defects, owner load (docs/retros)
- 2026-09-26 09:41 | build | Retro prompt mirrored at docs/routines/ops-retro.md; proposals scoring >= 4 land in the foundry queue as todo items
- 2026-09-26 09:41 | build | Watchdog now covers the retro slot (run-watchdog.ts, 12 tests green); SCHEDULERS, OPERATIONS, pipeline README updated
- 2026-09-26 09:41 | build | BLOCKED: trigger trig_015Uvn63XZUVqx1TAiWZrZL6 created from the routine has no repo source; test run stalled at 0 tokens
- 2026-09-26 09:41 | build | Trigger left disabled; handoff: interactive session attaches giovf/rorororo and enables it (or recreates it)
- 2026-09-26 09:41 | build | Rule recorded in SCHEDULERS: a routine cannot create a working routine (create_trigger sets no repo/model/connectors)
- 2026-09-26 09:41 | build | Next candidate taken: launch-post-kit — Show HN, Product Hunt, r/datasets, Indie Hackers copy (LAUNCH-POST-KIT.md)
- 2026-09-26 09:41 | build | Kit facts checked against code: 16 registers, 21 MCP tools, per_page max 100, x402 US$0.005, pricing £5–£239
- 2026-09-26 09:41 | build | Kit adds comment prep, 6 screenshot specs, numbers-to-refresh table and a 2-week timing plan; July drafts superseded
- 2026-09-26 09:41 | build | OWNER (optional): post the four launch posts under your name — everything is ready to paste in LAUNCH-POST-KIT.md
- 2026-09-26 09:41 | build | Yesterday's uk-gambling-operators wave ran clean; 2026-09-26 metrics row shows no refresh errors
- 2026-09-26 09:41 | build | Taskmaster rows filed: root #16 (ops-retro, blocked), gankdat #60 (launch-post-kit, done)
- 2026-09-26 17:35 | build | Built b2b-outreach-experiment (gankdat, score 6): ten targeted B2B emails, drafts for owner approval
- 2026-09-26 17:35 | build | Targets: 5 bid consultancies + 5 charity/care web agencies, all Ltd, Companies House numbers confirmed via relay
- 2026-09-26 17:35 | build | Every address a generic company mailbox from the firm's own site (PECR reg. 22); LIA C added to GDPR.md
- 2026-09-26 17:35 | build | Kit: OUTREACH-2026-09.md — claims cross-checked against src, sending rules, suppression list, send log
- 2026-09-26 17:35 | build | Ten drafts created in the owner's Gmail through the connector; nothing sent, nothing spent
- 2026-09-26 17:35 | build | Dropped 9 candidates: named-person addresses only, no Companies House match, or one-person firms
- 2026-09-26 17:35 | build | Queued b2b-outreach-results (score 4), blocked on the sends; proof: >= 2 replies or 1 sign-up from 10
- 2026-09-26 17:35 | build | OWNER: open Gmail Drafts, check each contact page, send 2-3 a day, log dates in OUTREACH-2026-09.md §6
- 2026-09-26 17:35 | build | Today's metrics row: refresh ok, 0 accounts, 186 authed MCP calls/24h; Taskmaster gankdat #61 filed
