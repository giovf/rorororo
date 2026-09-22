# Run log

One line per piece of work done, newest last; every new line is sent to the owner's Telegram
as a bullet by the `notify owner` CI job. Format:
`- YYYY-MM-DD HH:MM | <routine> | <one thing done, ≤ 120 chars>`. A run that did five things
writes five lines (dataset built, tests added, actor pushed, doc updated, item blocked …).
Routines: build, exchange, review, report; interactive sessions too.

- 2026-09-22 12:05 | interactive | Run log wired: build, exchange, review and report now post a one-line overview here after each run
- 2026-09-22 15:10 | interactive | Run log now one bullet per piece of work, not one overview line (owner correction)
- 2026-09-22 15:10 | interactive | Build routine runs twice daily (09:30, 21:30 UTC) on Fable and reads docs/pipeline
- 2026-09-22 15:10 | interactive | New weekly venture exchange routine (Wednesdays 08:00) opens or extends venture queues
- 2026-09-22 15:10 | interactive | Strategy review now weekly (Sundays 08:00) on Fable; applies verdicts to the queues
- 2026-09-22 15:10 | interactive | Pipeline model + npm run pipeline validator added to the root check (6 tests)
- 2026-09-22 15:10 | interactive | GitHub cron missed most slots overnight; owner-notes and metrics jobs now also run on push
- 2026-09-22 15:10 | interactive | Figma comment-feed id filled in; Gazette truncated-body retry; routine clone fallback
