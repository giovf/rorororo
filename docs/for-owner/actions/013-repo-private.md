# 013 — make the GitHub repo private (after the store reviews finish)

**Status:** WAITING on store reviews (ReadFocus + Highlight Keep on Chrome and Firefox, Variables
Toolkit on Figma). · **Cost:** £0.

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

Nothing to do right now.
