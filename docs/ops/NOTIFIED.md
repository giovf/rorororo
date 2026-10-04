# Notified cursor

Written by the `notify owner` GitHub job (`scripts/notify-owner.ts`) after every configured channel
accepted every message: `cursor:` is the last commit on `main` whose additions to `docs/ALERTS.md`,
`docs/RUNS.md` and `docs/for-owner/actions/` reached the owner's phone. Each run sends everything
added after it, so a crashed run, a Telegram 5xx or a cancelled job loses nothing — the next push
resends. Edit by hand only to move the cursor back and resend from there.

cursor: 233030656262f4117c72c03f83ac038b05da2dac
sent: 2026-10-04T15:45:03Z (2 lines)
