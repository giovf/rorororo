# Owner action request #030 — two read scopes on the CI Cloudflare token, and a yes/no on the devcontainer's Node line

- **Date:** 2026-10-24
- **Status:** open
- **Your time:** ~6 minutes (Cloudflare ~5, the yes/no ~1)
- **Cost:** £0.00
- **Blocks:** the `stats crawlers: zone` reading on gankdat's daily metrics row (AI-crawler fetches of the `/stats`
  pages over 30 days, read for the pay-per-crawl spike of 2026-10-17) — it prints `n/a` until step 1 is done; and the
  devcontainer moving to Node 24 like every workflow already has (foundry `node-24-runners`, 2026-10-20).

Everything below needs *your* identity (a token you own, a rule that asks you first); nothing else in the backlog does.
Both were filed on 2026-10-17 and 2026-10-20 as `handoff:` lines for an attended Claude session, which has not run since
2026-10-17 — the W43 retro re-filed them here (foundry `owner-only-handoffs-as-owner-lines`).

## Actions

### 1. Add two read permissions to the CI Cloudflare token
- **What:** the token CI uses (repository secret `CLOUDFLARE_API_TOKEN`) can deploy Workers but cannot read zone
  analytics, so the daily metrics job cannot count crawler fetches. Editing the token's permissions keeps its value —
  **no new secret, nothing to paste**.
- **Where:** https://dash.cloudflare.com/profile/api-tokens (if the token is not listed there, it is an account token:
  https://dash.cloudflare.com/ → gankdat.com's account → Manage Account → Account API Tokens)
- **Steps:**
  1. Find the token CI uses (the one created for the gankdat deploy; its name usually says Workers or CI). Do not create a
     new one — click **Edit** (the ⋯ menu on its row).
  2. Under *Permissions*, click **+ Add more** twice and add: `Zone` → `Zone` → `Read`, and `Zone` → `Analytics` → `Read`.
  3. Under *Zone Resources*, make sure `gankdat.com` is included (Specific zone → gankdat.com, or All zones).
  4. **Continue to summary** → **Save** (editing never shows the token value again; that is expected).
- **Give back:** a Telegram note `cloudflare token scopes done`. The next 06:45 metrics run fills the `stats crawlers:
  zone` column; if it still says `n/a` the following day, the routine files a one-line note, nothing more for you.
- **Cost:** £0.00

### 2. Say yes or no to the devcontainer running Node 24
- **What:** every GitHub workflow runs Node 24 since 2026-10-20; `.devcontainer/Dockerfile` still installs Node 22
  (one line, `setup_22.x` → `setup_24.x`). CLAUDE.md lists `.devcontainer/` under *Things to ask before doing*, so the
  routines will not touch it without your word. It only affects a machine that opens this repo in the devcontainer.
- **Where:** nowhere to click — reply in Telegram.
- **Steps:** send `devcontainer node 24 yes` (the next build routine makes the one-line change, runs the gates and records
  it in `docs/ops/VERSIONS.md`) or `devcontainer node 24 no` (the line is recorded as deliberately left on 22).
- **Give back:** that one note.
- **Cost:** £0.00

## When you're done
1. Set **Status** above to `done` and note anything that differed from the steps (or just send the Telegram notes — the
   hourly owner-notes job files them and the next routine closes this request).
2. Nothing goes in `.env` for this request.
