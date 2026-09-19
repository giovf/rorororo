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
Manage at https://claude.ai/code/routines. Keep `STORE.md` current (ids/URLs) — it is what
the routines read. Each session: `git pull` first (routines commit to the branch), read
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
