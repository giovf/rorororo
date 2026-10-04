# Notified cursor

Written by the `notify owner` GitHub job (`scripts/notify-owner.ts`) after every configured channel
accepted every message: `cursor:` is the last commit on `main` whose additions to `docs/ALERTS.md`,
`docs/RUNS.md` and `docs/for-owner/actions/` reached the owner's phone. Each run sends everything
added after it, so a crashed run, a Telegram 5xx or a cancelled job loses nothing — the next push
resends. Edit by hand only to move the cursor back and resend from there.

cursor: cf4a458d3d3da1d560f9a2af9b19f09aef828af7
sent: 2026-10-04T21:27:00Z (0 lines — cursor moved forward by hand: the heal commit restores 470 run lines already sent)
