# 016 — get a message on your phone when something needs you (5 minutes)

**Status:** DONE 2026-09-21 — Telegram bot @foundry_ops_tg_bot connected, CI secrets set, test message delivered. · **Cost:** £0.

From now on every agent (me, the routines) writes owner items as `owner:` lines in
`docs/ALERTS.md`, and a GitHub job sends exactly those lines to your phone on each push. Pick
one channel (or both):

## Option A — WhatsApp (via CallMeBot, a free third-party relay)
1. Follow https://www.callmebot.com/blog/free-api-whatsapp-messages/ : save their number as a
   contact, send it the activation message from your WhatsApp, and it replies with an API key.
2. Put in `.env` (repo root): `CALLMEBOT_PHONE=+44…` (your number, international format) and
   `CALLMEBOT_APIKEY=…`. Reply "016 whatsapp".
Caveat: it's a hobby service; delivery is best-effort and messages pass through their servers.
The messages only ever contain the alert text, never keys or account details.

## Option B — Telegram (recommended for reliability; official bot API, free)
1. In Telegram, message **@BotFather** → `/newbot` → name it e.g. "Foundry Ops" → copy the token.
2. Open your new bot's chat and send it any message (so it can reply to you).
3. Put in `.env`: `TELEGRAM_BOT_TOKEN=…`. Reply "016 telegram" — I fetch your chat id and set
   the CI secrets myself.

Then I trigger a test message.
