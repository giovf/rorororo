# Notified cursor

Written by the `notify owner` GitHub job (`scripts/notify-owner.ts`) after every configured channel
accepted every message: `cursor:` is the last commit on `main` whose additions to `docs/ALERTS.md`,
`docs/RUNS.md` and `docs/for-owner/actions/` reached the owner's phone. Each run sends everything
added after it, so a crashed run, a Telegram 5xx or a cancelled job loses nothing — the next push
resends. Edit by hand only to move the cursor back and resend from there.

cursor: 30ff0743fd525af13f34f9ba1aa7869e5e18f7d2
sent: 2026-10-04T18:45:13Z (2 lines)
