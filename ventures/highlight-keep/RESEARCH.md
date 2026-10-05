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
| 2026-10-05 | Daily check | 0 | — | — | via store-metrics CI: chrome: 0 users, no ratings, v0.1.0, updated October 4, 2026; firefox: 0 adu, 0 weekly downloads, no ratings, v0.2.0 |
| 2026-10-05 | Reviews checked (07:00 metrics routine) | — | — | — | no new Chrome reviews (relay fetch of reviews page: "No ratings" on listing) |

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

## Research 2026-10-05 (build 09:00; starvation fallback — no buildable item in any queue)

Evidence read: the metrics rows (0 users on both stores every day 2026-09-30..10-05; 0.2.0 now shows as the live
Firefox version and the Chrome listing's "updated October 4, 2026", so the fixed listings have had one day — nothing
is readable), the 2026-09-19 review sample re-counted by ask (31 highlighter reviews: PDF 4, account/login 4,
**activate on every site by default 3**, lost data/backup 3, billing 2, **iframe/shadow DOM 2**, Reddit anchoring 1,
toolbar overlap 1), the live source (`sites.ts` registers the content script without `allFrames`; the library's
"export all" copies Markdown to the clipboard and the only file export is the JSON backup), and web searches today
(chromewebstore, AMO, web-highlights.com, tooltivity.com and dexterouslogic.com are all blocked from this sandbox;
only the search index answered): (1) Weava's own knowledge base documents a dashboard export to Word, Excel, CSV and
plain text carrying resource URL, highlight and annotation, and **both rivals that outrank us for "weava alternative"
built a Weava import** (Web Highlights "How to import highlights from Weava", Glasp "Import Weava highlights");
2026 reviews still report Weava "hasn't been updated since Feb 2024, no longer saves highlights", rating 2.9 on its
last 100 reviews (tooltivity/web-highlights summaries); (2) every rival a searcher sees ships a notes-app path —
Web Highlights (Notion, Obsidian, Capacities, MD/HTML/PDF), Glasp (Notion, Obsidian, Readwise, Roam, Logseq;
MD/CSV/JSON), Readwise Highlighter, Hypothesis (JSON/TXT/CSV/HTML export from the sidebar) — while our "exports to
Markdown" is a clipboard copy; (3) Firefox for Android has a handful of local highlighters ("Highlighter Extension"
lists Android), none with notes or export — demand unverified, parked until ReadFocus's Android reading exists.

Reading: findability work is done and unmeasured until 10-30, so the next items are the ones that turn a searcher
who lands on the comparison page into an install — a way across for the Weava refugees the page is written for,
and parity on the three asks the review sample repeats that we had not addressed (every-site mode, subframes,
export to a notes app). Items added (score = evidence × reach ÷ effort):

| Item | Score | Effort | What it does |
|---|---|---|---|
| `import-weava-export` | 6 | 0.6 d | import Weava's CSV/TXT dashboard export (verify columns via relay first); "bring your highlights from Weava" on listing + page |
| `all-sites-mode` | 4 | 0.3 d | opt-in "every site" switch via the optional `<all_urls>` permission; per-site stays the default |
| `subframe-highlighting` | 4 | 0.3 d | `allFrames` + shadow-root-aware anchoring; e2e fixture with an iframe and a shadow root |
| `export-markdown-files-readwise-csv` | 4 | 0.4 d | download one .md per page (zip, front matter) for a vault, and a Readwise-import CSV; no OAuth integrations |
| `import-glasp-hypothesis-exports` | 3 | 0.5 d | Glasp CSV/JSON and Hypothesis JSON imports, after the Weava import proves the pattern |

Relay allowlist gained `.weavatools.com`, `weavatools.atlassian.net`, `.readwise.io`, `.glasp.co`, `.hypothes.is`
so the builds above can read the real file layouts (never guess a format). Not queued: Firefox for Android
(above); directory pages that rank for the query (tooltivity.com, extpose.com, alternativeto) — extpose indexes
every Chrome listing by itself, alternativeto needs an owner account (already blocked in the ReadFocus queue),
tooltivity's submission path could not be read; Reddit/XPath anchoring (one review; ours is text-quote based).
Kill check unchanged: 2026-12-21 if nothing moves; day-30 review 2026-10-30.

### 2026-10-05 (build 17:00) — `import-weava-export` built (0.4.0)

What could be read, through the relay (`docs/relay/responses/hk-weava-export`, `-2`, 17:12–17:14 UTC): weavatools.com's own
"How To Export Your Highlights and Notes" and the Weava Manual §8 say only that the dashboard's export button writes "Microsoft
Word, Excel, .csv, or .txt"; the knowledge-base page on the export (`weavatools.atlassian.net/wiki/spaces/WEAV/pages/84967585`)
redirects to an Atlassian login and the service-desk portal answers 403; `app.weavatools.com` and `web.weavatools.com` do not
answer at all; Web Highlights' "How to Import Highlights from Weava" (2024-08-04) and Glasp's guide (403 for the runner, read
from the search index) show the same four steps — open a folder, export icon top right, choose .csv, upload — and name no
column. So no sample exists in the repo and the parser is what the queue item planned for that case: `src/core/weava-import.ts`
reads the header row (RFC 4180 cells, delimiter detected from the header: `,` `;` tab `|`, BOM and CRLF tolerated), maps
columns by name — page URL and highlight text required; note/annotation, title, folder (becomes a tag), colour (by name or hex
hue, via the shared `colourOfHex`) and date used when present — and refuses any other file with a message naming the headers it
saw and asking for the first line by mail. Ids are `weava_<fnv><djb2>` of url + quote + note, so a second import adds nothing;
pages merge through `pages-storage.mergeInto` like Restore and the Super Simple import. 8 tests. The library gains
*Import Weava*; LISTING.md, the AMO release notes and description, the comparison page (table row; the "About Weava" paragraph
now tells refugees how to come across instead of "there is no importer"), the landing page and the welcome page say so.
Risk, stated on the page: a real export may spell the columns in a way the patterns miss — then the user sees the headers and
the mail address, and one support mail fixes the mapping. Proof (unchanged): ≥ 1 Weava import named in a review or support
mail within 60 days of 0.4.0 going live; comparison-page clicks → installs after the line lands. Ships with the 0.4.0 sign
handoff (ALERTS; supersedes the 0.3.0 one; CWS still waits on the 0.2.0 review).

### 2026-10-05 (burn-down 18:00) — `export-markdown-files-readwise-csv` built (0.4.0)

Readwise's import format, read through the relay (`docs/relay/responses/hk-readwise-csv`, 18:25 UTC): `readwise.io/import_bulk`
redirects the runner to a login page, so the page itself could not be read; `docs.readwise.io` (its `llms.txt` dump, 495 KB)
points bulk import at that page and documents inline tags (a note starting with `.word` becomes a tag); a third-party copy of
the import page (kb.iany.me, web search) lists the columns — Highlight (required), Title, Author, URL, Note (inline tags
work), Location (integer), Date (`YYYY-MM-DD HH:MM:SS`, UTC). Built: `src/core/export.ts` — `markdownFiles` (one `.md` per
page, file-system-safe unique name from the title, YAML front matter with title/url/site/created/updated/highlights/tags, then
the existing page Markdown) and `readwiseCsv` (those seven columns, one row per highlight, Author = site, Location = order on
the page, tags as `.tag` inline notes, RFC 4180 quoting, CRLF); `src/core/zip.ts` — a store-only ZIP writer (CRC-32, UTF-8
names, ~90 lines; `unzip -t` and Python's `zipfile` both accept its output) so the Markdown files arrive as one download with
no new dependency. The library's tools row gains *Download Markdown files* and *Download CSV for Readwise* beside *Copy all
(Markdown)*; 8 unit tests and e2e section 9 (real downloads in Chromium: zip signature and front matter, CSV header and row).
Copy: LISTING.md, AMO release notes and description, welcome page, landing page and the comparison page's export row now say
"Markdown files for Obsidian/Logseq, Readwise CSV" instead of the clipboard-only "exports to Markdown". Not done, on
purpose: no Notion/Obsidian OAuth integration (needs an account and a server — against the product's stance); Readwise is
the bridge to those. Proof: Readwise or Obsidian named in a review or support mail; listing conversions after 0.4.0 vs before.

### 2026-10-05 (burn-down 18:00, 2nd item) — `import-glasp-hypothesis-exports` built (0.4.0)

Hypothesis, verified from the vendor's own code (github.com/hypothesis/client, `src/sidebar/services/annotations-exporter.tsx`
and `src/types/api.ts`, fetched 2026-10-05; the help page "Exporting and Importing Annotations" via relay
`hk-glasp-hypothesis` confirms Share → Export offers JSON, TXT, CSV, HTML): the JSON file is `{export_date, export_userid,
client_version, annotations: APIAnnotationData[]}`, each annotation with `uri`, `text` (the comment), `tags`, `created`,
`document.title`, `target[].selector[]` holding a `TextQuoteSelector` (`exact`, `prefix`, `suffix`) and `references` on a
reply; the CSV header is `Created at,Author,Page,URL,Group,Type,Quote/description,Comment,Tags` with Type one of Annotation,
Highlight, Reply, Page note. `src/core/hypothesis-import.ts` reads both: quote + prefix/suffix become the anchor (a better
start than Weava's bare quote), the comment a note, tags come along, replies and page notes are skipped (nothing to anchor),
ids are `hyp_<annotation id>` (CSV rows: a hash) so a second import adds nothing; no colours in Hypothesis, so yellow. 4 tests.
Glasp: blog.glasp.co's export guide and FAQ (same relay) say CSV, Markdown or JSON and name no column, and its site needs a
login, so no Glasp parser was guessed. Instead the header-driven reader written for Weava — URL + highlight columns required,
note/title/tags/colour/date optional — is offered as *Import Weava / Glasp (.csv)* and a tags or folder cell is now split on
commas; an unreadable file lists its headers and the support address. Copy updated in LISTING.md, AMO release notes and
description, the welcome page, the landing page and the comparison page. Proof: a Hypothesis or Glasp import named in a review
or support mail within 60 days of 0.4.0 going live; until then, zero "could not import" mails with a Glasp header line.
