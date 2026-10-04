# V3 research — Highlight Keep (Chrome/Firefox/Edge extension; discovery 2026-09-19)

Status: **validated 2026-09-19** (store data + reviews). Rule applied: fully testable by
Claude in the container (Playwright harness), no owner testing.

## Niches examined (store pages pulled 2026-09-19)

### ✗ Tab / session managers
| Extension | Users | Rating | Updated |
|---|---|---|---|
| OneTab | 2,000,000 | 4.4 (14.6K) | Jul 2026 |
| Session Buddy | 1,000,000 | 4.7 (25.1K) | Apr 2026 |
| Toby | 300,000 | 4.2 (3.3K) | Sep 2026 |
| Workona | 200,000 | 4.6 (3.8K) | Jan 2025 |
| Tab Session Manager | 100,000 | 3.5 (443) | Jul 2026 |
Excellent free incumbents (Session Buddy 4.7). No wedge. Skip.

### ✓ Web highlighters / annotation
| Extension | Users | Rating | Updated | Notes |
|---|---|---|---|---|
| Glasp | 500,000 | 4.5 (985) | Sep 2026 | free, account required, highlights public by default; iframe/shadow-DOM gaps |
| LINER | 300,000 | 4.4 (6K) | Sep 2026 | pivoted to "AI copilot", subscription |
| Hypothesis | 300,000 | 4.1 (223) | Apr 2026 | nonprofit; "never completes log in", "not working anymore" |
| **Weava** | 200,000 | 4.0 (2.8K) | **Feb 2024** | premium $3.99–7.99/mo; "hasn't been updated since feb 2024, no longer saves your highlights"; "no way to cancel the subscription… support non-responsive"; "stole $240… direct debit"; PDF highlighting broken |
| Super Simple Highlighter | 200,000 | 3.9 (1.3K) | Jun 2026 | local, free; "saved pages started to disappear"; must enable per site; no subframes |

Demand: ~1.5M users across five products, paid tiers at $4–8/month (Weava, LINER), and an
abandoned paid incumbent whose users are actively burned by billing. The two free
alternatives require an account (Glasp) or lose data (Super Simple).

## Gate
| (a) buyers | students, researchers, analysts — proven by Weava/LINER subscriptions |
| (b) recurring | daily reading/research |
| (c) paid rival + documented gap | Weava (above); Glasp's account + public-by-default model |
| (d) ≤ 1 week | MVP: robust text anchoring (quote + prefix/suffix + position fallback), colours, notes, per-page restore, library page, Markdown/Obsidian export — yes |
| (e) policy/ToS | none; local storage; optional host permissions per site like ReadFocus |

## Product: Highlight Keep
Highlight any page, add a note, come back and it's still there. Everything stored locally
(`chrome.storage.local` + IndexedDB for scale), no account, export to Markdown / Obsidian /
JSON, search across highlights. Free: unlimited highlights on up to 3 sites at a time,
1 colour, export. **Unlock $12 one-time**: unlimited sites, 6 colours, notes, tags, a
library page with search, backup/restore file. Stripe Managed Payments + the existing
licence worker (venture `highlight-keep`). Later: PDF (PDF.js viewer) — the most-asked gap
in every rival's reviews.

Honest EV: same class as ReadFocus (5–20k users in year one at 1–2% × $12); the upside is a
larger, clearly frustrated audience and three stores (Chrome, Firefox, Edge) from day one.

## Metrics

| Date | Event | Users | Rating | Sales | Notes |
|---|---|---|---|---|---|
| 2026-09-19 | Built + e2e-tested; Stripe link live; awaiting owner's store upload | — | — | 0 | zero owner testing |
| 2026-09-20 | Daily check | — | — | — | not live yet |
| 2026-09-21 | Daily check | — | — | — | fetch failed: egress blocked by network policy (chromewebstore.google.com, addons.mozilla.org) |
| 2026-09-22 | Daily check | — | — | — | not live yet |
| 2026-09-23 | Daily check | — | — | — | not live yet |
| 2026-09-24 | Daily check | — | — | — | not live yet |
| 2026-09-25 | Daily check | — | — | — | not live yet |
| 2026-09-26 | Daily check | — | — | — | not live yet |
| 2026-09-27 | Daily check | — | — | — | not live yet |
| 2026-09-28 | Daily check | — | — | — | not live yet |
| 2026-09-29 | Daily check | — | — | — | not live yet |
| 2026-09-30 | Daily check | 0 | — | — | via store-metrics CI: chrome: 0 users, no ratings, v0.1.0, updated September 21, 2026; firefox: 0 adu, 0 weekly downloads, no ratings, v0.1.0 |
| 2026-09-30 | Firefox listing recorded live (approved 2026-09-22; STORE.md was 7 days stale) | 0 daily / 0 weekly downloads (AMO API) | — | 0 | source: relay `amo-listings`; Chrome still in review |
| 2026-09-30 | Chrome Web Store listing found live (relay: page 200, "Add to Chrome"); user count is not in the static HTML | — | — | 0 | approval mail never reached INBOX; foundry `store-metrics-in-ci` queued to read the numbers from CI |
| 2026-10-01 | Daily check | 0 | — | — | via store-metrics CI: chrome: 0 users, no ratings, v0.1.0, updated September 21, 2026; firefox: 0 adu, 0 weekly downloads, no ratings, v0.1.0 |
| 2026-10-01 | Reviews checked (07:00 metrics routine) | — | — | — | no new Chrome reviews (relay fetch of reviews page: "no reviews" on listing) |
| 2026-10-02 | Daily check | 0 | — | — | via store-metrics CI: chrome: 0 users, no ratings, v0.1.0, updated September 21, 2026; firefox: 0 adu, 0 weekly downloads, no ratings, v0.1.0 |
| 2026-10-02 | Reviews checked (07:00 metrics routine) | — | — | — | no new Chrome reviews (relay fetch of reviews page: "No ratings" on listing); AMO ratings count 0 |
| 2026-10-03 | Daily check | 0 | — | — | via store-metrics CI: chrome: 0 users, no ratings, v0.1.0, updated September 21, 2026; firefox: 0 adu, 0 weekly downloads, no ratings, v0.1.0 |
| 2026-10-03 | Reviews checked (07:00 metrics routine) | — | — | — | no new Chrome reviews (relay fetch of reviews page: "No ratings" on listing); AMO ratings count 0 |
| 2026-10-04 | Daily check | 0 | — | — | via store-metrics CI: chrome: 0 users, no ratings, v0.1.0, updated September 21, 2026; firefox: 0 adu, 0 weekly downloads, no ratings, v0.1.0 |
| 2026-10-04 | Reviews checked (07:00 metrics routine) | — | — | — | no new Chrome reviews (relay fetch of reviews page: "No ratings" on listing) |

## Research 2026-09-30 (burn-down; queue emptied after `post-approval-links`)

Evidence read: the metrics rows above (0 Chrome users, 0 Firefox daily users / weekly downloads,
Chrome live since ~2026-09-21, Firefox public since 2026-09-22), relay `amo-listings` (the live
AMO listing: **0 previews, no tags, category `other`**, homepage on github.io — `web-ext sign`
only ships the text fields of `assets/amo-metadata.json`), relay `cws-pages` (Chrome listing
created via the API with the bare name, no promo tile), the 2026-09-19 competitor table
(Weava still abandoned, its reviews still the wedge) and STRATEGY §5 (distribution before
features until the funnel converts).

Reading: nothing is wrong with the product yet — nobody can find it. Two listings without
screenshots in the "other" category and no page of ours that answers the search a burned
Weava user actually types. Items added (score = evidence × reach ÷ effort):

| Item | Score | Effort | What it fixes |
|---|---|---|---|
| `amo-listing-previews` | 6 | 0.3 d | screenshots, Productivity category, tags, homepage on AMO via the API (script + one handoff run) |
| `weava-alternative-page` | 6 | 0.3 d | the search-capture page for Weava / Super Simple refugees on apps.gankdat.com |
| `cws-listing-keywords` | 4 (blocked: owner dashboard) | 0.1 d | Chrome title keywords, category, promo tile — rides the action-013 dashboard visit |
| `pdf-highlighting` | 3 | 2 d | the most-asked rival gap; a feature, so behind the three above |

Foundry: `extension-publish-in-ci` (5) — releases stop being handoffs once five store secrets
are in GitHub Actions. Kill check (STRATEGY §7): zero sales and zero organic signal 90 days after
every listing is live → 2026-12-21 if nothing moves; the items above are what "effort" means
until then.

### 2026-09-30 (burn-down) — `weava-alternative-page` built
`https://apps.gankdat.com/weava-alternative.html` is the search-capture page for "weava alternative" /
"weava not saving highlights" / "super simple highlighter pages disappear": an 11-row comparison table,
one paragraph per rival written from the September 2026 review sample in `research/cws-reviews-2026-09-19.json`
(quoted as "reviews report …", never as our claim), an honest "not yet" for PDF highlighting and sync, and
the two live install buttons. Linked from the landing index and the Highlight Keep page, and appended to
both listing descriptions (AMO via `assets/amo-metadata.json` on the 0.1.1 sign; Chrome via `LISTING.md`
on the owner's action-013 dashboard visit). `sitemap.xml` and `robots.txt` now exist on apps.gankdat.com
(the property is already verified in Search Console). Proof at day 30 (2026-10-30): ≥ 50 impressions or
≥ 5 clicks on the page in Search Console; the metrics row shows whether installs follow.

### 2026-10-01 (burn-down) — `pdf-highlighting` built (0.2.0)

The most-asked rival gap (Weava "PDF highlighting broken", Glasp iframe gaps) is closed for PDFs on the
web. Neither Chrome's nor Firefox's built-in PDF viewer can host a content script, so the extension
ships its own viewer page (`src/pdf/`, PDF.js 6 legacy build — the standard build needs
`Map.prototype.getOrInsertComputed`, newer than Chrome 116 / the e2e Chromium). The popup shows
*Highlight this PDF* on any `http(s)` URL ending in `.pdf`; it asks for that site's permission once
(the viewer fetches the file itself) and opens `pdf.html?file=<url>`. Highlights are stored under the
PDF's own URL (`core/pdf.ts documentUrl`), so the popup, the library (which links PDFs back into the
viewer) and the Markdown export need no PDF-specific code; the text layer is indexed like any page.
Canvases draw lazily on scroll; text layers for every page are there from the start so highlights
restore and the whole file is selectable. Not supported, and said so on the comparison page:
`file://` PDFs (extensions cannot read local files without a setting the stores dislike) and PDFs
served without a `.pdf` path. e2e (`npm run e2e`, section 4) proves render → select → highlight →
reload → restore in a real Chromium; 5 unit tests cover the URL helpers. Proof stays as queued: a
"PDF" mention in a review or support mail, and conversions after 0.2.0 vs before. Ships with the
open 0.1.1 handoff (now 0.2.0, same commands).

## Research 2026-10-04 (burn-down; starvation fallback — no buildable item in any queue)

Evidence read: the metrics rows (0 Chrome users, 0 Firefox daily users, 0 weekly downloads every day
2026-09-30..10-04; 0.2.0 in review on both stores since 10-04, so no reading of the fixed listings exists yet),
the 2026-09-19 review sample (`research/cws-reviews-2026-09-19.json`: 9 Weava, 8 Glasp, 7 Hypothesis, 7 Super
Simple reviews — asks: PDF 4, login/account 3, lost data 2, billing 2, Reddit anchoring 1; nobody mentions sync,
export or Notion), and two web reads today: (1) Super Simple Highlighter's help page documents a **backup
(beta) file** holding every style and highlight location, loaded back by replacing everything, and states
highlights "aren't sent anywhere, synced, or backed up … if they're lost, they really are lost"
(dexterouslogic.com/supersimplehighlighter/help); (2) the 2026 "weava alternative" results are rival blogs —
Web Highlights (100k users, 4.8) and Marqly's "best web highlighters 2026" — which report Weava's last-100-review
rating at 2.9 and "folders and highlights randomly disappearing from the dashboard" as the top complaint
(web-highlights.com, marqly.com, chrome-stats.com). Our comparison page names neither rival.

Reading: still a findability problem first (the listing fixes are days old and unmeasured), so the cheap
items are the ones that make the comparison page answer today's search results and give a burned user a
one-click way across. Correction 20:50 (same run): the library page already ships Backup (JSON) and Restore
(`src/library/library.ts`) and every listing text says so — the first draft of this note missed it. What is
missing is an *import* from a rival's file, and a restore that merges rather than wipes (`replaceAll`). Items added (score = evidence × reach ÷ effort):

| Item | Score | Effort | What it does |
|---|---|---|---|
| ~~`library-backup-restore`~~ | — | — | dropped the same run: backup and restore already exist (see correction above); the merge gap moved into the import item |
| `import-super-simple-highlighter` | 5 | 0.6 d | reads a Super Simple Highlighter backup file into the library through a tested merge that Restore also uses (verify the rival's JSON layout from a real export first); listing + comparison page say "bring your highlights" |
| `day-30-funnel-review` | 5 | 0.1 d (not before 2026-10-30) | installs, sales, Search Console on the comparison page; keep, fix or kill per STRATEGY §7 |
| `comparison-page-2026-rivals` | 4 | 0.2 d | add Web Highlights and Marqly rows (the two that rank for "weava alternative" today) with verified pricing; one-time vs subscription stated plainly |

Not queued: Reddit/XPath anchoring (one review, our anchors are text-quote based — `core/anchor.ts` — check
on a day-30 complaint, not before); Firefox for Android (unverified demand); Edge (owner account, in the
ReadFocus queue). Kill check unchanged: 2026-12-21 if nothing moves.

### 2026-10-04 (burn-down) — `import-super-simple-highlighter` built (0.3.0)

Format verified from the rival's own code rather than a guessed export: dexterouslogic/super-simple-highlighter
on GitHub (public archive, GPL-3; `js/options/controllers/advanced.js` writes the backup, `js/shared/db.js`
names the fields). The `.ldjson` file is: a header `{"magic":"Super Simple Highlighter Exported Database",
"version":1}`, the style definitions (`highlightDefinitions[]` with `className` and `style["background-color"]`,
or null), a PouchDB replication-stream header, then `{"docs":[…]}` lines of `{verb:create|delete, match (url
without hash, decodeURI'd), date (ms), range (XPath — ignored, we anchor by the quoted text), className, text,
title, correspondingDocumentId}`. Built: `src/core/ssh-import.ts` (+4 tests), `src/core/merge.ts` (+3 tests;
Restore now merges instead of wiping — `pages-storage.mergeInto`), the library button, and the "bring your
highlights" line on LISTING.md, AMO metadata, the comparison page (new table row + how-to paragraph), the
landing and the welcome page. Proof (unchanged): ≥ 1 import named in a review or support mail within 60 days
of 0.3.0 going live; installs after the listing line vs before. Ships when 0.3.0 is signed (ALERTS handoff).

### 2026-10-04 (burn-down) — `comparison-page-2026-rivals` built
`weava-alternative.html` now has five columns: Web Highlights and Marqly joined Weava and Super Simple Highlighter, with
one paragraph on the pair. Facts read through the relay (`docs/relay/responses/hk-rivals-2026/`, 2026-10-04 22:17 UTC)
from the rivals' own pages, not blogs: **Web Highlights** — Chrome listing 200,000 users, 4.8 (5.1K ratings), v13.0.49
updated 2026-10-03; "completely free without an account … offline"; Premium/Ultimate subscriptions add cloud sync + web
app, 7-day trial; FAQ: importing a backup *replaces* all highlights, highlights "may not show up due to URL changes or
sync issues"; export Markdown/HTML/PDF/Notion/Obsidian; PDFs online and local. Its pricing page renders the dollar
figures client-side (not in the HTML; third-party listings disagree, $3.49–4.99/mo), so the page says
"subscription, prices shown only inside the app" rather than a number we could not verify. **Marqly** — Chrome listing
1,000 users, 3.6 (40 ratings), v9.78 updated 2026-10-03; account required ("Sign up free at app.marqly.com"); free plan
100 bookmarks + 10 notes; Pro $49 first year then $72/year or $9/month, 7-day trial; six colours + notes, highlights sync
to the account; imports are bookmarks (Pocket, Raindrop, HTML), not highlights; no highlight export stated. Reading: the
one-time-vs-subscription line is now stated against every rival a searcher sees; the day-30 review measures whether the
page earns impressions (proof unchanged: ≥ 50 at 2026-10-30). Relay allowlist gained `.web-highlights.com` and `.marqly.com`.
