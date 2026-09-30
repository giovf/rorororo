# 013 — make the GitHub repo private (after the store reviews finish)

**Status:** store reviews finished (all four extension listings live by 2026-09-30; Figma's listing never
used github.io). Repo side done for Highlight Keep (2026-09-30). Waiting on: the 0.1.1 sign/upload (interactive
session, ALERTS handoff) and **one 2-minute dashboard edit from you** (below). · **Cost:** £0.

## Why the repo is public today
GitHub Pages on a free account only serves public repos, and the landing/policy pages for the
extensions went live on `giovf.github.io/rorororo` on 17 Sep. On 19 Sep the gankdat source
(previously in a private repo) was merged in — no secrets are in git, but the code, ledger and
these owner docs are readable by anyone who finds the repo. Claude should have flagged that
at the time.

## What Claude did (20 Sep)
- Re-hosted the landing and policy pages on Cloudflare (free, works with private repos) at
  **https://apps.gankdat.com/** — same paths (`/readfocus.html`, `/highlightkeep.html`,
  `/privacy.html`, `/terms.html`, `/thanks.html`). Deploys automatically from `main`.
- Pointed the Stripe payment links' thank-you redirects at the new host.
- The github.io copy stays up until the listings are switched, so nothing in review breaks.

## What happens next (Claude, then one click from you)
1. When each store review completes, Claude updates the privacy/terms/homepage URLs in that
   listing's metadata files and, where the API allows, the listing itself; where a dashboard
   is needed (Chrome, Figma) it becomes a 2-minute item here.
2. The extensions' welcome/popup links move to apps.gankdat.com in their next release.
3. Once every listing points at the new host, Claude flips the repo to private
   (`gh repo edit --visibility private`) and removes the GitHub Pages workflow. No action
   needed from you unless GitHub asks for a confirmation in the browser.

## Your 2-minute item (added 2026-09-30, burn-down)
The Chrome Web Store privacy-policy URL can only be edited in the dashboard, under your Google login:
https://chrome.google.com/webstore/devconsole → **Highlight Keep** (`pciignkojfpgmfcmjchmpdhonpjkfepc`) → Privacy tab →
Privacy policy URL: `https://apps.gankdat.com/privacy.html` → Save → Submit for review (listing-only changes
review quickly). Do the same for ReadFocus (`dckbdaplggmhimpbekhdbaampglfhdgf`) once its queue item lands (same
day). Nothing else; the Firefox homepage moves by API when 0.1.1 is signed.

## Progress
- 2026-09-30 (burn-down): Highlight Keep — popup/welcome links, AMO `homepage`, LISTING privacy URL all on
  apps.gankdat.com; version 0.1.1 in the repo, not yet published. Relay `apps-host-check`: highlightkeep, readfocus,
  privacy, terms, thanks all 200 on the new host.
