# Operations — how Foundry runs day to day

## The loop (any session)
1. `task-master next` → implement → `npm run check` → `task-master set-status --id=<id> --status=done`.
2. Anything needing the owner's identity or wallet goes into `docs/for-owner/actions/NNN-*.md`
   (one batched request), never into chat piecemeal.
3. Money in or out is a row in `docs/LEDGER.md` the day it happens.

Hands-free option for the owner: `/loop Work the Foundry backlog: task-master next →
implement fully → npm run check → set-status done → repeat. Decide everything yourself;
only surface owner actions in docs/for-owner/actions/.`

## Automated testing (no owner needed)
The container has Chromium + Playwright. `npm run e2e` builds ReadFocus's test build and
drives it in a real browser: bolding, editors untouched, restore on off, text size, ruler,
pro features with a real key, invalid key. Screenshots land in `ventures/read-focus/e2e/out/`.
Run it before every store submission and after any content-script change. New web/extension
ventures get the same harness from day one; Figma plugins still need the owner (desktop app).

## Publishing from here
- **Chrome**: `npm run cws -- token` once (after the owner's auth code lands), then
  `npm run cws -- upload <itemId> <zip>` and `npm run cws -- publish <itemId>` per release.
  First listings are created in the dashboard by the owner (the API can't fill listing text).
- **Firefox**: `bash scripts/amo-publish.sh ventures/<slug>` (needs AMO keys) — submits for review.
- **Edge**: same zip as Chrome; Partner Center upload by the owner until API credentials exist.
Extension ids go into each venture's `STORE.md` when known.

## Support inbox (info@gankdat.com)
info@ forwards (Cloudflare Email Routing) to **gio@1402celsius.com**, which Claude reads via
the claude.ai Gmail connector — search `to:info@gankdat.com newer_than:7d` at session start,
plus store mail (Figma, Mozilla, Chrome, Stripe, Google Payments). Replies: from gio@ via
Gmail, or from info@gankdat.com via Resend once the root domain verifies
(`POST /admin/mail/<id>/reply` exists on the worker as a fallback path). The worker's
Email-Routing capture below is built but not wired in, so nothing changes for the owner:
`GET /admin/mail?unread=1`, `GET /admin/mail/<id>`, `POST /admin/mail/<id>/read`,
`POST /admin/mail/<id>/reply {"text"}` (Resend, from info@gankdat.com, threaded). Refunds:
Stripe dashboard/API + `POST /admin/revoke/<id>`; key re-send: `POST /admin/resend/<id>`.
Routing rule + root-domain Resend verification need owner action #8 first.

## Owner interface
`npm run ops` regenerates the ops page from repo data (ventures, ledger, backlog, owner
actions, git log) into `ops.html`; republish it to the existing artifact
https://claude.ai/artifact/5EVansYqPeYLQVEcpTG2LU (pass its URL as `url`). Do this at the end of every
working session. At the start of a session read the owner's notes (artifact db, collection
`inbox`) and any `actions/<id>` docs marked `done-by-owner`, then confirm them in the docs.

## Cloud routines (run without anyone typing)
Created 2026-09-19 on the owner's claude.ai account (GitHub connected):
- **Foundry daily metrics** — 07:00 UTC daily: reads each `ventures/<slug>/STORE.md`, fetches
  public store numbers/reviews, appends a `Daily check` row to the venture's Metrics table,
  writes bug/refund/privacy mentions to `docs/ALERTS.md`, commits.
- **Foundry weekly report** — Mondays 07:30 UTC: writes `docs/reports/<year>-W<week>.md`
  (money, ventures, alerts, waiting-on-owner, activity, next step), commits.
Ids: daily `trig_01JBrWDAZLeWEAhSBBnA9g8K`, weekly `trig_01PjxdBAcvYSAT32fCyzcvQg`. Manage at https://claude.ai/code/routines. Keep `STORE.md` current (ids/URLs) — it is what
the routines read. Each session: `git pull --no-rebase` first (routines commit to the branch; merge, don't rebase), read
`docs/ALERTS.md` and the latest report, then regenerate the dashboard.

## Per-venture review cadence (Phase 4)
| When | What | Where it goes |
|---|---|---|
| Launch day | listing live, price, free/paid boundary, screenshots | `venture.json` → `launched`; `RESEARCH.md` §metrics |
| Day 7 | users, rating, first reviews; fix anything with ≥2 identical complaints | `RESEARCH.md` §metrics; subtasks on the build task |
| Day 30 | users, purchases (Figma dashboard / Stripe), conversion %, revenue in GBP | `LEDGER.md` revenue rows; `venture.json` → `earning` if ≥1 sale |
| Day 60 | keep / iterate / kill decision against the EV in `RESEARCH.md` | `venture.json` status; next slot's channel chosen from the data |

Sources: Figma → fig-stats.com/plugins/<id> (daily users/likes) and the Community
dashboard (purchases). Chrome → developer dashboard (users, ratings) and the store's
`/detail/<id>/reviews` page.

## Kill criteria (honest defaults)
- Day 60 with < 500 users **and** < 3 sales → kill (keep the record).
- A store policy strike or takedown → fix within 7 days or kill.

## Support
`info@gankdat.com`; reply within two working days; 14-day refunds, no questions asked
(Figma refunds via Figma; Stripe refunds via the dashboard, then `POST /admin/revoke/<id>`
on the licence worker).

## Strategy loop (added 2026-09-20)

research → plan → build → distribute → measure → review. The plan is `docs/STRATEGY.md`; the
monthly strategy review is a cloud routine (first Monday, 08:00 UTC) writing `docs/reviews/YYYY-MM.md`
with a scorecard, keep/kill verdicts per venture, market signals, research gaps and the next three
moves. Claude rewrites STRATEGY.md after each review and logs decisions in its §8.

## Routines (cloud, run without anyone present)

Full inventory with times, ids, infrastructure and outputs: `docs/SCHEDULERS.md` (keep it
current whenever a scheduler changes). The prompts themselves live in `docs/routines/<name>.md`
(the stored prompt is a bootstrap that reads the file, 2026-09-30) — a prompt change is a commit.

| Routine | When (UTC) | Does |
| --- | --- | --- |
| Inbox triage | hourly | reads unread mail, logs `docs/INBOX.md`, alerts, drafts replies (never sends) |
| Daily metrics | 07:00 | store numbers into each `RESEARCH.md`; gankdat numbers come from the GitHub `gankdat metrics` job at 06:30 |
| **Daily build** | 09:30 | picks ONE item by `STRATEGY.md` §5 (alert fix, next dataset, research, distribution), builds it behind the gates, pushes to `main`; hands secret-needing steps to `docs/ALERTS.md` |
| Weekly report | Mon 07:30 | `docs/reports/` |
| Monthly strategy review | 1st 08:00 | `docs/reviews/`, keep/kill verdicts, next three moves |
| Ops retro (created 2026-09-26, disabled until the repo is attached — ALERTS handoff) | Sat 07:59 | audits the routines themselves (missed slots, repeat blockers, defects, owner load) into `docs/retros/`; fixes become scored `foundry` queue items |

Publishing, registry updates and D1 migrations run in CI after every push (keys are repo
secrets, never in a Claude sandbox), so the daily build is autonomous end to end. Interactive
sessions start by reading `docs/OWNER-NOTES.md`, `docs/ALERTS.md` and `docs/INBOX.md`, then do
only what CI cannot: Stripe, DNS, account creation. The owner leaves notes for any agent by
messaging the Telegram bot; they land in `docs/OWNER-NOTES.md` within the hour.

## Owner notifications

Any agent that needs the owner appends `- YYYY-MM-DD owner: <what and where>` to `docs/ALERTS.md`
(or creates a new `docs/for-owner/actions/NNN-*.md`). The `notify owner` GitHub job sends those
lines to the owner's phone (Telegram and/or WhatsApp; secrets in the repo settings). Handoffs
between agents use `handoff:` and are not sent. The job sends everything added since the commit in
`docs/ops/NOTIFIED.md` and moves that cursor only after the phone accepted it (2026-09-30), so a
failed run resends on the next push instead of losing lines; move the cursor back by hand to resend.
Mail that our own automation triggers (Apify pricing/publish confirmations, DMARC reports, CI
failures on our pushes, the retired SAM key reminder) is listed in `docs/ops/SELF-CAUSED.md`; triage
logs a match and never escalates it, and the weekly report never makes one a next step.

## Interrupted runs (usage limits, timeouts, crashes)

- Routine sandboxes are discarded when a run dies; nothing reaches `main` unless pushed. Every
  routine therefore pushes exactly once, at the end, after the gates pass — a dead run leaves no
  trace and the next run simply redoes the item.
- A slot that leaves no trace at all (refused by the usage limit, stalled clone) is reported by
  the `run watchdog` CI job (drafted 2026-09-25 at `docs/ci/run-watchdog.yml`, active once moved
  into `.github/workflows/`) within 2 h as a `watchdog | missed:` line in `docs/RUNS.md` → Telegram
  bullet, so silence is never mistaken for a quiet day (`docs/SCHEDULERS.md`).
- Slot race (2026-09-29/30, three collisions in two days): the fallback's :20 check could only see a
  build that had already committed, and builds commit 26–45 min after the slot. Since 2026-09-30 the
  build routine's first push is a start marker (`npm run slot -- start build` → `docs/ops/SLOTS.md` +
  a `… started (build)` commit), which the fallback's existing check stops on; `npm run slot -- check
  build` answers `running` / `done` / `missed`. The watchdog reports a marker with no work commit
  by the deadline as `stalled:` rather than counting it as a trace (`scripts/slot.ts`).
- `main` is gated by the `check` workflow on every push. If it goes red, the next daily build
  run fixes or reverts before doing anything else; interactive sessions do the same at start.
- Live-state side effects (temporary cron triggers used to force a refresh) are reconciled with
  `wrangler.jsonc` every morning by the `gankdat metrics` job (`scripts/schedules.mjs reset`).
- Owner-visible state (action files, alerts) is only ever written together with the work it
  describes, in the same commit.

## Ops research log (the foundry queue's evidence; the Saturday retro takes over from here)

- **2026-09-29 (build routine, research run — `npm run pipeline empty` listed `foundry`)**. Week to
  2026-09-28 measured from RUNS.md, ALERTS.md, INBOX.md, review W39, report W40 and the code:
  every build/exchange/review/report slot since 2026-09-24 left a trace (builds finish 26–45 min after
  the slot; the one miss, Wed 2026-09-23 17:00, was the usage limit and is what the watchdog now
  catches); the relay round trip is 15–25 s (request commit → response commit), well inside the
  routines' 120 s wait; all eight foundry items were done. Defects found and queued: three false
  alarms our own automation caused (Apify "pricing change" mails are the `publish-actors.mjs`
  PAY_PER_EVENT price we set ourselves — two handoffs and report W40's "highest-leverage" next step;
  the SAM key reminder for a keyless source) → `self-caused-alerts` (8); nine threads of mail lost for
  a week to triage's `newer_than:3h` window → `triage-backlog-window` (7); two STRATEGY §4 targets
  with no measurement anywhere — change-feed calls (REST routes write no traffic point at all) and
  Apify runs (token already in CI) → `metrics-change-feed-count` (8), `metrics-apify-runs` (7); store
  approvals that never reach STORE.md (AMO, seven days) → `store-approval-to-store-md` (5). Seen but
  not queued (score < 4): the root gate's 4–5 minutes of vitest per run; the Wednesday burn-down has
  no evidence yet (first window 2026-09-30). Also fixed today: uk-insolvency's momentary Gazette 500
  (gankdat queue `gazette-5xx-retry`, done).
- **2026-09-30 (burn-down, research run — the foundry queue emptied at 18:35)**. Evidence from RUNS,
  ALERTS, INBOX, the two venture RESEARCH files and three relay probes. (1) All four extension listings
  are live and nothing in the repo knew: AMO approved both add-ons on 2026-09-22 (found today, API
  status `public`, ReadFocus 2 weekly downloads) and both Chrome Web Store pages answer 200 with a
  slug redirect and an "Add to Chrome" button (relay `cws-status`, `cws-pages`) — no CWS approval
  mail ever reached INBOX.md, and the Sonnet metrics routine cannot reach either store from its
  sandbox (`fetch failed: egress blocked`, 2026-09-21), so it wrote "not live yet" for ten days →
  `store-metrics-in-ci` (9): the numbers come from a GitHub runner, as gankdat's already do. (2) The
  Taskmaster MCP timed out in seven sandboxes and `npx -y task-master-ai` crashes there
  (ERR_MODULE_NOT_FOUND zod/v4, tested today); four modules wait on one handoff for rows that are
  plain JSON → `taskmaster-offline-add` (8). (3) Five prompt changes in two days all wait on the
  interactive session because routines cannot edit their triggers, and the retro has been dark since
  2026-09-26 → `prompts-from-repo` (8): the stored prompt becomes a bootstrap that reads
  `docs/routines/<name>.md`, the mechanism CLAUDE.md already proves. Seen, not queued (< 4): a build
  that stamps its slot and then dies is not filled by the fallback until a second fallback check
  exists (no occurrence yet); the CWS user count is rendered by script, not in the first 256 KB of
  HTML (the CI item reads the page's structured data instead). Unblocked today: `post-approval-links`
  in both extension queues (their blocker, store review, is over).
- **2026-09-30 (burn-down, second research run — the foundry queue emptied again at 20:50)**. Evidence from
  this evening's CI runs, RUNS, ALERTS and the gankdat Daily numbers. (1) `notify owner` run 63 crashed on
  a two-commit push (depth-2 checkout, no `before` commit) and four bullets were lost; the cause is fixed
  (`push-diff-range-depth`, done) but any failed notify run still loses its bullets for good →
  `notify-owner-cursor` (6). (2) uk-insolvency has errored on refresh four days running (500, empty body,
  500, zero-byte body with a declared content-length) and nobody queued it: a routine only sees the row it
  reads, and the 09-29 fix covered the 500 alone → `refresh-errors-to-queue` (8) for the class, plus gankdat
  `insolvency-truncated-body` (6) for the instance. (3) ALERTS.md held eight open handoff lines with the
  interactive session absent since 09-28; four were stale (satisfied or superseded) and one only asked for a
  deletion a routine may make → closed tonight (three false-alarm entries deleted per the 09-29 handoff, the
  09-28 store-mail handoff marked done: mcpservers.org was already in MARKETPLACE-PREP.md, the CWS
  verification is now in read-focus/STORE.md) and `handoff-ledger` (5) for the class. Seen, not queued
  (< 4): the installer's push racing the routine's next push (one merge commit, harmless); the first ops
  retro fires 2026-10-03, so retro-side evidence does not exist yet.
