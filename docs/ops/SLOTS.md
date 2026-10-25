# Slot starts

One line per routine run, written by `npm run slot -- start <routine>` as the run's first push, so
the fallback and the watchdog can tell an in-flight slot from a missed one. Not sent to the owner.
Since 2026-10-19 (foundry `notify-owner-cron-not-push`) the watchdog runs on `notify owner`'s 2-hourly
cron, not on every routine push, so a stamped-then-silent slot shows as `stalled:` 2–4 h after its grace
window (the first fire inside the window sees nothing yet; the next one reports it).

- 2026-09-30 18:21 | burn-down | started
- 2026-10-01 09:11 | build | started
- 2026-10-01 17:11 | build | started
- 2026-10-02 09:10 | build | started
- 2026-10-02 17:10 | build | started
- 2026-10-03 09:10 | build | started
- 2026-10-03 17:10 | build | started
- 2026-10-04 09:09 | build | started
- 2026-10-04 17:10 | build | started
- 2026-10-05 09:11 | build | started
- 2026-10-05 17:10 | build | started
- 2026-10-06 09:10 | build | started
- 2026-10-06 17:10 | build | started
- 2026-10-07 09:10 | build | started
- 2026-10-07 17:11 | build | started
- 2026-10-08 09:11 | build | started
- 2026-10-08 17:10 | build | started
- 2026-10-09 09:11 | build | started
- 2026-10-09 17:10 | build | started
- 2026-10-10 09:09 | build | started
- 2026-10-10 17:10 | build | started
- 2026-10-11 09:09 | build | started
- 2026-10-11 17:10 | build | started
- 2026-10-12 09:10 | build | started
- 2026-10-12 17:10 | build | started
- 2026-10-13 09:10 | build | started
- 2026-10-13 17:11 | build | started
- 2026-10-14 09:10 | build | started
- 2026-10-14 17:10 | build | started
- 2026-10-15 09:10 | build | started
- 2026-10-15 17:10 | build | started
- 2026-10-16 07:16 | metrics | started
- 2026-10-16 09:10 | build | started
- 2026-10-16 17:10 | build | started
- 2026-10-17 09:09 | build | started
- 2026-10-17 17:10 | build | started
- 2026-10-18 07:08 | metrics | started
- 2026-10-18 09:10 | build | started
- 2026-10-18 17:10 | build | started
- 2026-10-19 07:15 | metrics | started
- 2026-10-19 09:10 | build | started
- 2026-10-19 17:10 | build | started
- 2026-10-20 07:07 | metrics | started
- 2026-10-20 09:11 | build | started
- 2026-10-20 17:10 | build | started
- 2026-10-21 07:12 | metrics | started
- 2026-10-22 07:08 | metrics | started
- 2026-10-22 09:10 | build | started
- 2026-10-22 17:10 | build | started
- 2026-10-23 07:12 | metrics | started
- 2026-10-23 09:11 | build | started
- 2026-10-23 17:10 | build | started
- 2026-10-24 07:08 | metrics | started
- 2026-10-24 09:09 | build | started
- 2026-10-24 17:10 | build | started
- 2026-10-25 07:09 | metrics | started
