# Notified cursor

Written by the `notify owner` GitHub job (`scripts/notify-owner.ts`) after every configured channel
accepted every message: `cursor:` is the last commit on `main` whose additions to `docs/ALERTS.md`,
`docs/RUNS.md` and `docs/for-owner/actions/` reached the owner's phone. Each run sends everything
added after it, so a crashed run, a Telegram 5xx or a cancelled job loses nothing — the next push
resends. Edit by hand only to move the cursor back and resend from there.

cursor: 1007fe1354a19ed2e4a5e3c4d8c0b940f853504b
sent: 2026-09-30T21:00:00Z (initial cursor, set by the burn-down that built the job)
