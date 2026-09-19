# Owner action request #6 — two free store accounts (Firefox, Edge) for ReadFocus

- **Date:** 2026-09-19
- **Status:** READY
- **Your time:** ~15 minutes total
- **Cost:** £0.00 (both stores are free to list on)
- **Blocks:** ReadFocus on Firefox Add-ons (AMO) and Microsoft Edge Add-ons — two more
  channels for the same product, no new code beyond what's already built.

## 1. Firefox Add-ons (AMO)
- **Where:** https://addons.mozilla.org → *Log in* (a Mozilla account; create one with the
  same email you use for the other stores).
- **Steps:** after login, open https://addons.mozilla.org/developers/ and accept the
  developer agreement. That's all — the upload itself is done with `web-ext` from here
  using API credentials: **Tools → Manage API Keys** → *Generate new credentials* → put
  them in `.env` as `AMO_JWT_ISSUER` and `AMO_JWT_SECRET`.
- **Give back:** "AMO keys in .env".

## 2. Microsoft Edge Add-ons (Partner Center)
- **Where:** https://partner.microsoft.com/dashboard/microsoftedge/public/login → sign in
  with a Microsoft account → enroll in the Edge program (free, individual account; it
  asks for name/address/phone, shown as publisher details).
- **Steps:** once enrolled, the upload is a zip in the dashboard; there is also an API
  (Settings → Publish API → *Create API credentials*) — if it lets you create them, put
  `EDGE_CLIENT_ID`, `EDGE_API_KEY` in `.env` and I'll publish from here; otherwise I'll give
  you the zip and the listing text to paste (same as Chrome's).
- **Give back:** "Edge enrolled" (+ "keys in .env" if you created them).

Not requested: Safari (needs a Mac + Apple developer account, £79/yr) — parked.
