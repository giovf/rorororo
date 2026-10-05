# Store listing — Highlight Keep

- **Channels:** Chrome Web Store (first), Firefox Add-ons, Edge Add-ons
- **Extension ids:** Chrome `pciignkojfpgmfcmjchmpdhonpjkfepc` (item created via API, submitted for review 2026-09-20)
- **Listing URLs:** Chrome (live, confirmed 2026-09-30): https://chromewebstore.google.com/detail/pciignkojfpgmfcmjchmpdhonpjkfepc
- **Status:** built and e2e-tested 2026-09-19; **Chrome live** (found 2026-09-30 via relay `cws-pages`: detail page 200, slug redirect, "Add to Chrome"; no approval mail reached the inbox log, approval date between 2026-09-21 and 09-30); **Firefox live since 2026-09-22** (AMO mail 22:40 "tentatively approved", Addon#3075366; confirmed public v0.1.0 via the AMO API on 2026-09-30)
- **Metrics sources:** `https://chromewebstore.google.com/detail/<id>?hl=en` and `/reviews?hl=en`
- **Buy link:** https://buy.stripe.com/28E14g8KN7u95pA9uCefC02
- **Firefox Add-ons:** **live** (status `public`, tentatively approved 2026-09-22, v0.1.0): https://addons.mozilla.org/en-US/firefox/addon/highlight-keep-web-highlighter/
- **Firefox metrics source:** `https://addons.mozilla.org/api/v5/addons/addon/highlight-keep-web-highlighter/` (JSON: `average_daily_users`, `weekly_downloads`, `ratings.average`, `ratings.count`, `current_version.version`) — the daily metrics routine reads this, not the HTML page
- **Own host (2026-09-30, burn-down):** every link in the repo now points at https://apps.gankdat.com/ (popup and welcome page in `src/`, AMO metadata `homepage`, LISTING privacy URL) — the relay confirmed all five pages answer 200 (`docs/relay/responses/apps-host-check`). Version bumped to **0.1.1** (links only, no functional change), not yet signed or uploaded: the interactive session ships it (`docs/ALERTS.md` handoff) and the owner edits the Chrome dashboard privacy-policy URL (action 013 step 1). Until both are done the live listings still show the github.io copy, which stays up.
- **AMO listing fields (2026-09-30, burn-down):** the live listing has 0 screenshots, no tags, category `other` (relay `amo-listings`) because `web-ext sign` ships text fields only. `npm run amo-listing -- ventures/highlight-keep` (`scripts/amo-listing.ts`, config `assets/amo-listing.json`) fixes all four through the AMO API; it runs with the 0.1.1 handoff.
- **Comparison page (2026-09-30, burn-down):** https://apps.gankdat.com/weava-alternative.html — linked from both listing descriptions (`LISTING.md`, `assets/amo-metadata.json`); the live copies pick it up with the 0.1.1 sign (AMO) and the owner's dashboard edit (Chrome). `sitemap.xml` lists it.

- 2026-10-04: **Highlight Keep 0.2.0** (web-PDF support) submitted — Chrome Web Store upload SUCCESS + publish (in review), Firefox AMO signed and submitted (listed channel, in review). AMO listing: category/tags/homepage set via `npm run amo-listing`; screenshot uploads were throttled by AMO (429) and re-run later the same day.

- 2026-10-04 (burn-down): repo is **0.3.0** — import from Super Simple Highlighter + merging Restore. Needs signing/upload
  once 0.2.0 clears review (CWS refuses a new upload while one is pending; AMO takes it any time) — ALERTS handoff.

- 2026-10-05 (build 17:00): repo is **0.4.0** — import from Weava's .csv dashboard export (header-driven: URL + highlight required;
  note, title, folder→tag, colour, date when present). Needs signing/upload once 0.2.0 clears review — ALERTS handoff (supersedes the 0.3.0 one).
