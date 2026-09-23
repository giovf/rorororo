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
