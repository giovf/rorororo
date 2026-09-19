# Owner action request #6 — two free store accounts (Firefox, Edge) for ReadFocus

- **Date:** 2026-09-19
- **Status:** Firefox **DONE** (keys in .env; both extensions submitted to AMO 2026-09-19). Chrome Publish API **DONE** (refresh token stored). Edge **parked** — Microsoft blocked account creation (2026-09-19); retry later.
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

## 3. Chrome Web Store Publish API (~10 min, once) — so Claude ships updates itself
Honest scope: the API uploads and publishes **new versions** of an extension; the very first
listing (description, screenshots, privacy answers) still has to be created once in the
dashboard by you. After that, every update to ReadFocus / Highlight Keep goes out from here.

- **Where:** https://console.cloud.google.com (same Google account as the Chrome developer account).
- **Steps:**
  1. Create a project (name: `foundry`), or pick an existing one.
  2. **APIs & Services → Library** → search *Chrome Web Store API* → **Enable**.
  3. **APIs & Services → OAuth consent screen** → External → app name `Foundry publisher`,
     your email for both contact fields → Save. Under **Test users** add your own Google
     account (the app can stay in "Testing"; no verification needed for one user).
  4. **APIs & Services → Credentials → + Create credentials → OAuth client ID** →
     type **Desktop app** → name `foundry-cli` → Create. Copy the **Client ID** and
     **Client secret** into `.env` as `CWS_CLIENT_ID` and `CWS_CLIENT_SECRET`.
  5. Authorise once: open this URL in your browser (replace CLIENT_ID):
     `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&access_type=offline&prompt=consent&scope=https://www.googleapis.com/auth/chromewebstore&redirect_uri=http://localhost:1/&client_id=CLIENT_ID`
     → sign in, allow → the browser lands on an error page at `localhost:1` — that's
     expected. Copy the `code=…` value from the address bar (everything between `code=` and
     `&`) into `.env` as `CWS_AUTH_CODE` (it expires in ~10 minutes, so tell me straight away).
- **Give back:** "CWS code in .env" — I exchange it for a refresh token immediately and
  store that instead; from then on I publish versions without you.
