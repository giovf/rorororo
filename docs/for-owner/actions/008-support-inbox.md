# Owner action request #8 — hand the support inbox (info@gankdat.com) to Claude

- **Date:** 2026-09-19
- **Status:** **REVISED 2026-09-19** — the owner's real inbox is gio@1402celsius.com (Google Workspace), which already receives info@ mail. Simplest route: connect Gmail to Claude (below). The Cloudflare/Resend steps become optional (only needed to *send* from info@gankdat.com rather than from gio@).
- **Your time:** ~5 minutes
- **Cost:** £0.00
- **Blocks:** Claude answering support, refunds and key re-sends without you

`gankdat.com` receives mail through **Cloudflare Email Routing** and sends through **Resend**
(verified on `mail.gankdat.com` only). Claude will add an Email Worker that stores every
message to `info@` and keeps forwarding it to you unchanged, and will reply from
`info@gankdat.com` via Resend. Three small permissions make that possible:

## 0. Connect Gmail (gio@1402celsius.com) to Claude — 1 minute, does most of it
Claude starts the connection from the terminal and gives you a Google sign-in link; approve
it with the gio@1402celsius.com account. Claude can then read, search, label, draft and
send from that mailbox in every session (and routines can use it too). Reply-as
`info@gankdat.com` works if that address is set up as a "Send mail as" alias in Gmail
(Settings → Accounts) — otherwise replies go from gio@ with Reply-To info@.

## 1. (Optional) Cloudflare — extend the existing API token (2 min)
dash.cloudflare.com → profile → **API Tokens** → edit the token you made for Foundry →
add permissions:
- **Zone → Email Routing Rules → Edit** (zone: `gankdat.com`)
- **Zone → DNS → Edit** (zone: `gankdat.com`) — to add Resend's records for the root domain
Save. The token value doesn't change, nothing to paste.

## 2. Resend — verify the root domain (2 min)
resend.com → **Domains** → *Add domain* → `gankdat.com` (region: same as `mail.gankdat.com`).
Leave the DNS records page open or just click *Verify* later — Claude adds the DNS records
through the Cloudflare API once step 1 is done, then verification passes on its own.
(If you'd rather Claude add the domain too: create a **full-access** Resend API key and
put it in `.env` as `RESEND_API_KEY`, replacing the send-only one.)

## 3. Tell Claude where `info@` currently forwards
One line, e.g. "info@ forwards to my Hotmail" — or say nothing and Claude reads it from the
routing rules after step 1. The forward is kept as-is; Claude's worker adds a copy, it
never intercepts.

- **Give back:** "Cloudflare token updated", "gankdat.com added in Resend".
