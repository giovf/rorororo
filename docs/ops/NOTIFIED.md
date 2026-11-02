# Notified cursor

Written by the `notify owner` GitHub job (`scripts/notify-owner.ts`) after every configured channel
accepted every message: `cursor:` is the last commit on `main` whose additions to `docs/ALERTS.md`,
`docs/RUNS.md` and `docs/for-owner/actions/` reached the owner's phone. Each run sends everything
added after it, so a crashed run, a Telegram 5xx or a cancelled job loses nothing — the next push
resends. Edit by hand only to move the cursor back and resend from there.

cursor: 8a399a00b61d8a243d9c14f59d8fa4c4ddb6720f
sent: 2026-11-02T20:06:55Z (2 lines)
