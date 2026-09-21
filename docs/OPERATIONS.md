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

| Routine | When (UTC) | Does |
| --- | --- | --- |
| Inbox triage | hourly | reads unread mail, logs `docs/INBOX.md`, alerts, drafts replies (never sends) |
| Daily metrics | 07:00 | store numbers into each `RESEARCH.md`; gankdat numbers come from the GitHub `gankdat metrics` job at 06:30 |
| **Daily build** | 09:30 | picks ONE item by `STRATEGY.md` §5 (alert fix, next dataset, research, distribution), builds it behind the gates, pushes to `main`; hands secret-needing steps to `docs/ALERTS.md` |
| Weekly report | Mon 07:30 | `docs/reports/` |
| Monthly strategy review | 1st 08:00 | `docs/reviews/`, keep/kill verdicts, next three moves |

Interactive sessions start by reading `docs/ALERTS.md` (handoffs from the build routine) and
`docs/INBOX.md`, then do what needs secrets: publishing, forced refreshes, DNS, payments.
