# Store listing — ReadFocus

- **Channel:** Chrome Web Store
- **Extension id:** dckbdaplggmhimpbekhdbaampglfhdgf
- **Listing URL:** https://chromewebstore.google.com/detail/dckbdaplggmhimpbekhdbaampglfhdgf (live, confirmed 2026-09-30)
- **Status:** **Chrome live** (found 2026-09-30 via relay `cws-pages`: detail page 200, slug redirect, "Add to Chrome"; no approval mail reached the inbox log, so the approval date is between 2026-09-21 and 09-30). **Firefox live since 2026-09-22** (AMO mail 22:25 "tentatively approved", Addon#3075364; confirmed public v0.1.0 via the AMO API on 2026-09-30, 2 weekly downloads)
- **Metrics sources:** `https://chromewebstore.google.com/detail/<id>?hl=en` and `/reviews?hl=en`
- **Buy link:** https://buy.stripe.com/6oUdR2gdfcOtaJU22aefC00
- **Firefox Add-ons:** **live** (status `public`, tentatively approved 2026-09-22, v0.1.0): https://addons.mozilla.org/en-US/firefox/addon/readfocus-focus-reading-dyslex/
- **Firefox metrics source:** `https://addons.mozilla.org/api/v5/addons/addon/readfocus-focus-reading-dyslex/` (JSON: `average_daily_users`, `weekly_downloads`, `ratings.average`, `ratings.count`, `current_version.version`) — the daily metrics routine reads this, not the HTML page

- Chrome Web Store developer account: identity verification complete 2026-09-21 07:22 UTC (mail found in the 2026-09-28 backlog catch-up); publishing via the Developer Dashboard or the CWS API is unblocked for every extension.
- **Own host (2026-09-30, burn-down):** listing links moved to https://apps.gankdat.com/ — AMO `homepage` in `assets/amo-metadata.json` (applied by `npm run amo-listing -- ventures/read-focus` in the open 0.1.1 handoff; no new version needed, the extension itself has no github.io link) and the LISTING privacy URL (the owner's Chrome dashboard edit, action 013). The landing page shows the live Chrome and Firefox install buttons. Until both are done the live listings still show the github.io copy, which stays up.
- **Comparison page (2026-10-01, burn-down):** https://apps.gankdat.com/reader-mode-alternative.html — linked from the landing index, the ReadFocus page and both listing texts (`LISTING.md`, `assets/amo-metadata.json`); the live Chrome copy picks it up on the owner's action-013 dashboard visit, the live AMO copy on the next ReadFocus version sign (the `amo-listing` script sets previews, category, tags and homepage, not the description). `sitemap.xml` lists it.
