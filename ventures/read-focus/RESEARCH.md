# V2 research — ReadFocus (Chrome extension; discovery, task 13)

Status: **validated 2026-09-18** — see §Decision. Method: web research for candidate niches → store
pages pulled directly (users, rating, rating count, last update) + first page of reviews;
raw in `research/cws-harvest-2026-09-18.json`. Chrome Web Store search/category pages are
client-rendered, so there is no whole-market harvest like Figma's; this is a targeted sample.

## V1 learnings applied
- Name for the searched term; the store's search is the only free distribution.
- A paid incumbent with public complaints is the gate; "no rival" usually means no demand.
- Local-only, no account, no server: zero cost, and it's the privacy story buyers now ask
  for (52% of "AI" extensions collect data; 900k-user fake-AI incident, Jan 2026).
- Chrome Web Store policy (effective 2026-08-01): collect only what the single purpose
  needs; prominent disclosure; no circumventing AI-service guardrails.

## Niches examined

### ✗ BYOK AI assistant (bring your own API key)
Compliant (Anthropic requires per-user keys for third-party tools; OpenAI forbids key
*transfer*, not user-entered keys), and privacy-aligned — but nobody installs them:
NexTool 4 users, BYOK AI Chat 77, SnapMind 37, GPT Breeze 1,000; versus hosted Monica
3,000,000 and Merlin 900,000. Consumers will not manage API keys. Dead.

### ✗ Etsy / marketplace seller tools
Big paying audience (EverBee 300k, Alura 100k at $9.99/mo) but Etsy's Terms forbid
crawling/scraping without permission; incumbents live in that grey zone. Fails gate (e).

### ~ Web table → Excel/CSV
| Extension | Users | Rating | Notes |
|---|---|---|---|
| Table Capture | 200,000 | 4.3 (604) | Pro ≈ $12/yr; free ≤ 250 rows; responsive developer; updated Sep 2026 |
| Copytables | 100,000 | 4.3 (229) | free; "freezes with large table"; "author not replying" |
| Table Capture (Tabular) | 10,000 | 3.6 | |
| HTML Table Exporter | 1,000 | 3.4 | free, unlimited — didn't catch on |
Complaints on the leader are about the paywall, not the product. A well-run incumbent →
hard to displace; parked.

### ✓ candidate: focused / accessible reading
| Extension | Users | Rating | Last update | Notes |
|---|---|---|---|---|
| OpenDyslexic | 600,000 | 4.1 (222) | Jul 2026 | free font switcher |
| Helperbird | 500,000 | 4.6 (175) | Sep 2026 | $30/yr suite (TTS, fonts, ruler…); complaints: TTS quality, paywalled features |
| **Bionic Reading** | 100,000 | **2.4 (316)** | **Jun 2024** | official; "doesn't work", no instructions, no PDF/Docs |
| **Reader Mode** | 100,000 | **3.1 (186)** | Nov 2025 | crashes (STATUS_ACCESS_VIOLATION), breaks sites, lifetime promo w/o promised features |
| Reader Mode Pro | 2,000 | 3.9 | Nov 2022 | $15 one-time; licence-key friction; MV2 |
| Bionic Reader | 2,000 | 3.8 | Jul 2024 | "the only one that works"; wants PDF |
| Dyslexia Friendly | 10,000 | 4.2 | Dec 2025 | |
| Jiffy Reader (free, OSS) | 4,000 | 4.7 (4) | Feb 2026 | re-listed under a new id; the old listing (130 reviews, privacy complaints) is gone |
| Reader Line (ruler) | 20,000 | 4.9 (100) | Dec 2024 | every top review asks for PDF support |
| ReadingLine (ruler) | 8,000 | 3.9 | Jun 2022 | abandoned; "zero controls" |
| ReadingRuler | 722 | 3.4 | Apr 2026 | "not working after recent update" |
| Chrome Reader Mode | 10,000 | 3.9 | Sep 2026 | no width control, harsh colours |
| ADHD Reading | ? | ? | 2026 | **$29/yr or $59 lifetime**, Stripe, local-first; free = 3 emphasis modes; Pro = typography controls, per-site auto-apply, profiles |

Demand + gap: 200k users sit on two 2–3★ products; the good small tools are unmaintained
or lack PDF support; buyers are ADHD/dyslexic/slow readers, students and professionals who
read all day; paid tiers already exist at $15 one-time, $30/yr and $59 lifetime.

**Legal constraints:** "Bionic Reading" is a registered trademark (Renato Casutt / BRCG
Casutt GmbH, CH) and the owner has pursued open-source projects over the name — the product
must never use the word "Bionic". The owner also claims patent rights on the method; see the
assessment below before any build starts.

| ADHD Reader | 10,000 | 3.3 (32) | Sep 2023 | "wish I could fine-tune how much is bold"; breaks Google Keep; wants Docs/Word |
| ADHD Reading Help | 7,000 | 4.0 (32) | Dec 2023 | "broken, not working at all" |
| ADHD Reading (adhdreading.org) | 604 | 4.2 (5) | Feb 2026 | the polished one; $29/yr · $59 lifetime; "developers don't respond" |
| ADHD Reading Focus | 25 | — | Apr 2026 | |

### Legal assessment (reading niche)
- **Trademark**: "Bionic Reading" registered in UK (UK00915969488), EU, US and 7 more; owner
  has pursued projects over the name. → The word never appears in our name, listing, code
  comments or marketing. We describe the technique generically ("fixation bolding",
  "bold word starts").
- **Patent**: the owner lists a single French publication (FR1755215); no UK, EU or US
  patent is claimed. An independent implementation is not a UK legal problem; France is
  the one exposure and is noted, not blocking. Copyright: our code is our own.
- **Store policy**: no data collection at all (settings in `chrome.storage`), so the
  2026 Limited Use / Disclosure rules are trivially met.

## Decision (2026-09-18): **ReadFocus** — `ventures/read-focus`

| Gate | Result |
|---|---|
| (a) buyers with money | ADHD/dyslexic/slow readers, students, all-day professional readers; Helperbird (500k) at $30/yr and ADHD Reading at $59 lifetime prove willingness to pay |
| (b) recurring job | daily reading |
| (c) paid rival with documented gap | Bionic Reading 2.4★/100k abandoned; Reader Mode 3.1★/100k crashes; Reader Mode Pro abandoned with licence-key friction; every ruler tool asks for PDF |
| (d) ≤ 1 week build | yes — content script + popup + options + offline licence |
| (e) policy/ToS risk | none; zero data collection; trademark avoided |

**Product:** ReadFocus — fixation bolding (light/medium/heavy + fine strength), reading
ruler / line focus, paragraph focus, dyslexia-friendly font switch (OpenDyslexic, Atkinson
Hyperlegible — both OFL), per-site auto-apply and keyboard shortcut. Works on normal pages,
Google Docs (via the canvas fallback is *not* possible — document as a known limit) and,
in a later release, PDFs through a bundled PDF.js viewer (the single most-requested gap).
**Free:** bolding presets + ruler. **Unlock $12 one-time** (Stripe Managed Payments, key
by email, verified offline): fine strength, per-site profiles, fonts, focus modes, PDF
viewer when it ships. Listed on Chrome, then Edge Add-ons and Firefox AMO (free channels).

**Honest EV:** the polished newcomer in this category has 604 users after a year; the
best-made simple tool (Reader Line) reached 20k in two. Plan for 5–20k users in year one
at 1–2% conversion × $12 → $600–$4,800 gross, typically the low end. Portfolio shot #2;
the multi-store listing is the main upside over V1.

## Metrics

| Date | Event | Users | Rating | Sales | Notes |
|---|---|---|---|---|---|
| 2026-09-18 | Payment path proven (£0 test purchase) | — | — | 0 | Payment Link live; store submission pending screenshots |
| 2026-09-19 | Submitted to Chrome Web Store review | — | — | 0 | per-site optional permissions; video to follow on YouTube |
| 2026-09-19 | Automated e2e harness in place (Playwright); owner testing no longer needed for web changes | — | — | 0 | `npm run e2e` |
| 2026-09-19 | Daily check | — | — | — | not live yet |
| 2026-09-20 | Daily check | — | — | — | not live yet |
| 2026-09-21 | Daily check | — | — | — | not live yet |
| 2026-09-22 | Daily check | — | — | — | not live yet |
| 2026-09-23 | Daily check | — | — | — | not live yet |
| 2026-09-24 | Daily check | — | — | — | not live yet |
| 2026-09-25 | Daily check | — | — | — | not live yet |
| 2026-09-26 | Daily check | — | — | — | not live yet |
| 2026-09-27 | Daily check | — | — | — | not live yet |
| 2026-09-28 | Daily check | — | — | — | not live yet |
| 2026-09-29 | Daily check | — | — | — | not live yet |
| 2026-09-30 | Daily check | 0 | — | — | via store-metrics CI: chrome: 0 users, no ratings, v0.1.0, updated September 21, 2026; firefox: 0 adu, 2 weekly downloads, no ratings, v0.1.0 |
| 2026-09-30 | Firefox listing recorded live (approved 2026-09-22; STORE.md was 7 days stale) | 0 daily / 2 weekly downloads (AMO API) | — | 0 | source: relay `amo-listings`; Chrome still in review |
| 2026-09-30 | Chrome Web Store listing found live (relay: page 200, "Add to Chrome"); user count is not in the static HTML | — | — | 0 | approval mail never reached INBOX; foundry `store-metrics-in-ci` queued to read the numbers from CI |
| 2026-10-01 | Daily check | 0 | — | — | via store-metrics CI: chrome: 0 users, no ratings, v0.1.0, updated September 20, 2026; firefox: 0 adu, 1 weekly downloads, no ratings, v0.1.0 |
| 2026-10-01 | Reviews checked (07:00 metrics routine) | — | — | — | no new Chrome reviews (relay fetch of reviews page: "no reviews" on listing) |
| 2026-10-02 | Daily check | 0 | — | — | via store-metrics CI: chrome: 0 users, no ratings, v0.1.0, updated September 20, 2026; firefox: 0 adu, 0 weekly downloads, no ratings, v0.1.0 |
| 2026-10-02 | Reviews checked (07:00 metrics routine) | — | — | — | no new Chrome reviews (relay fetch of reviews page: "No ratings" on listing); AMO ratings count 0 |
| 2026-10-03 | Daily check | 0 | — | — | via store-metrics CI: chrome: 0 users, no ratings, v0.1.0, updated September 21, 2026; firefox: 0 adu, 0 weekly downloads, no ratings, v0.1.0 |
| 2026-10-03 | Reviews checked (07:00 metrics routine) | — | — | — | no new Chrome reviews (relay fetch of reviews page: "No ratings" on listing); AMO ratings count 0 |
| 2026-10-04 | Daily check | 0 | — | — | via store-metrics CI: chrome: 0 users, no ratings, v0.1.0, updated September 21, 2026; firefox: 0 adu, 0 weekly downloads, no ratings, v0.1.0 |
| 2026-10-04 | Reviews checked (07:00 metrics routine) | — | — | — | no new Chrome reviews (relay fetch of reviews page: "No ratings" on listing) |
| 2026-10-05 | Daily check | 0 | — | — | via store-metrics CI: chrome: 0 users, no ratings, v0.1.0, updated October 4, 2026; firefox: 0 adu, 0 weekly downloads, no ratings, v0.2.0 |
| 2026-10-05 | Reviews checked (07:00 metrics routine) | — | — | — | no new Chrome reviews (relay fetch of reviews page: "No ratings" on listing) |
| 2026-10-06 | Daily check | 0 | — | — | via store-metrics CI: chrome: 0 users, no ratings, v0.2.0, updated October 6, 2026; firefox: 0 adu, 0 weekly downloads, no ratings, v0.2.0 |
| 2026-10-06 | Reviews checked (07:00 metrics routine) | — | — | — | no new Chrome reviews (relay fetch of reviews page: "No ratings" on listing) |
| 2026-10-07 | Daily check | 0 | — | — | via store-metrics CI: chrome: 0 users, no ratings, v0.2.0, updated October 6, 2026; firefox: 0 adu, 0 weekly downloads, no ratings, v0.2.0; search: n/a (no SEARCH_CONSOLE_KEY secret; owner action 020) |
| 2026-10-07 | Reviews checked (07:00 metrics routine) | — | — | — | no new Chrome reviews (relay fetch of reviews page: "No ratings" on listing) |
| 2026-10-08 | Daily check | 1 | — | — | via store-metrics CI: chrome: 1 users, no ratings, v0.2.0, updated October 6, 2026; firefox: 0 adu, 0 weekly downloads, no ratings, v0.2.0; search: n/a (no SEARCH_CONSOLE_KEY secret; owner action 020) |
| 2026-10-08 | Reviews checked (07:00 metrics routine) | — | — | — | no new Chrome reviews (relay fetch of reviews page: "No ratings" on listing) |
| 2026-10-09 | Daily check | 0 | — | — | via store-metrics CI: chrome: 0 users, no ratings, v0.2.0, updated October 6, 2026; firefox: 0 adu, 0 weekly downloads, no ratings, v0.2.0; search: n/a (no SEARCH_CONSOLE_KEY secret; owner action 020) |

## Research 2026-09-30 (burn-down; queue emptied after `post-approval-links`)

Evidence read: the metrics rows above (0 Chrome users and no ratings since ~2026-09-21, 0 Firefox
daily users and 2 weekly downloads since 2026-09-22), relay `amo-listings` (the live Firefox listing
had no screenshots, no tags and category `other` — `assets/amo-listing.json` + `scripts/amo-listing.ts`
fix that in the open 0.1.1 handoff, so no new item), relay `cws-pages` (the Chrome listing already has the
searched-term title from the manifest, the Accessibility category and its screenshots; only the promo tile is missing), the 2026-09-18 competitor table (Reader Mode 3.1★ and
the official bolding tool 2.4★ still the wedge; every ruler tool asks for PDF; ADHD Reading at $29/yr
or $59 lifetime), the legal assessment (the trademarked name never appears in our marketing, including
comparison pages) and STRATEGY §5 (distribution before features until the funnel converts).

Reading: same as Highlight Keep — nothing is wrong with the product yet, nobody can find it. Both
listings are being fixed by the open handoff; what is missing is a page of ours that answers the
search a burned Reader Mode / ADHD-reading user types, and a date on which the numbers decide.
Items added (score = evidence × reach ÷ effort):

| Item | Score | Effort | What it fixes |
|---|---|---|---|
| `reader-mode-alternative-page` | 6 | 0.3 d | the search-capture page on apps.gankdat.com (pattern and table CSS shipped with Highlight Keep's page); names rivals honestly, never the trademarked term |
| `day-30-funnel-review` | 5 | 0.1 d | `not_before` 2026-10-30: installs, activations, sales once every listing is fixed; keep / fix / kill per §7 |
| `cws-promo-tile` | 3 (blocked: owner dashboard) | 0.1 d | the one Chrome listing asset missing (title, category, screenshots are already right); rides the action-013 dashboard visit |
| `pdf-viewer` | 3 | 3 d | the most-asked gap in the niche (bundled PDF.js); a feature, so behind the distribution items and the day-30 numbers |
| `edge-add-ons-listing` | 3 (blocked: owner account) | 0.2 d | the third free channel; needs a Partner Center account, batched with other account asks |

Not added: Google Docs support (canvas rendering, documented as a known limit); a video listing asset
(no evidence it moves installs at this stage). Kill check (STRATEGY §7): zero sales and zero organic
signal 90 days after every listing is live → 2026-12-21 if nothing moves.

### 2026-10-01 (burn-down) — `reader-mode-alternative-page` built
`https://apps.gankdat.com/reader-mode-alternative.html` is the search-capture page for "reader mode alternative" /
"reading ruler chrome" / "adhd reading extension": a 12-row comparison table against Reader Mode, the official
bolding extension (never named by its trademark — the legal assessment above) and ADHD Reading, one paragraph per
rival written from the September 2026 review sample in `research/cws-harvest-2026-09-18.json` (quoted as
"reviews report …", never as our claim; cells we could not confirm say "not shown on the listing"), a paragraph for
ruler users, an honest "not yet" for PDF and "no" for Google Docs, a pointer to Helperbird for anyone wanting a
text-to-speech suite, and the two live install buttons. Linked from the landing index and the ReadFocus page, and
appended to both listing descriptions (Chrome via `LISTING.md` on the owner's action-013 dashboard visit; AMO via
`assets/amo-metadata.json` on the next version sign — the listing script does not set the description). `sitemap.xml`
lists it. Proof at day 30 (2026-10-30, the `day-30-funnel-review` item): ≥ 50 impressions or ≥ 5 clicks on the page
in Search Console; the metrics row shows whether installs follow.

### 2026-10-01 (burn-down) — `pdf-viewer` built: ReadFocus 0.2.0 reads web PDFs

The most-asked-for gap in the niche (every top Reader Line review, the Bionic-style tools' reviews) is now in the
product. Design decision: PDF.js's usual rendering (canvas + invisible text layer) would hide the product's own
effect — bold starts and fonts are invisible on transparent text — so ReadFocus ships a **reader page**, not a
viewer: `src/pdf/pdf.ts` fetches the PDF (host permission granted once from the popup), takes each page's text runs
and `core/pdf.ts paragraphs()` reflows them into real `<p>` elements (baseline grouping, gap / short-sentence /
heading paragraph breaks, hyphen joins). The ordinary content script then bolds, rules, focuses and re-fonts them,
keyed by the PDF's own host (`documentUrl`), so the popup's per-site switch and settings apply unchanged. Pages
without text (scans) say so; images are not shown — it is a reading view, with "open the original" in the bar.
Free tier: the first page; the unlock reads the whole file (the queue item's "unlock-tier" decision, implemented as
a demo-then-pay so a free user sees it work before paying; the note states what they gain). Local `file://` PDFs are
out: the extension cannot fetch them without the file-URL permission, which store reviewers flag. e2e section 4
proves reflow → bold → ruler → first-page gate in Chromium; 7 unit tests cover the URL helpers and the reflow.
Proof (queue `proof`): a review or support mail mentioning PDFs; unlock conversion after 0.2.0 reaches the stores
above the pre-release rate (0 so far, so any sale counts). Ships with the open 2026-09-30 handoff.

## Research 2026-10-04 (burn-down; starvation fallback — every open ReadFocus item blocked or dated)

Evidence read: the metrics rows (0 Chrome users, no ratings, 0 Firefox daily users since 2026-09-30; 0.2.0 in
review on both stores since 10-04, so the PDF reader and the fixed listings are still unmeasured), the 2026-09-18
competitor table, the 2026-09-30 and 10-01 research notes, STRATEGY §5 (distribution before features) and four web
searches today for what a searcher actually sees: (1) "reader mode alternative" — AlternativeTo's Reader Mode page,
Product Hunt's alternatives page and listicles (Medium, Tooltivity, web-highlights.com) that lead with Reader View
(300k users, free) and Just Read; (2) "reading ruler chrome extension dyslexia pdf" — Dyslexly (dyslexly.com: free, no
account, five fonts, line focus, reading ruler, PDF viewer, Pro ≈ £2/month), Helperbird and Nook, plus a ruler
blog; (3) "adhd reading extension" — Half Bold (halfbold.vercel.app: free, no premium, 8,000+ users, 4.8 from 55
ratings), ADHD Reading Focus, ADHD Reading Help and bushe.co's list; (4) Firefox for Android — AMO lists Android-
compatible extensions on its own home page (450+ at launch), and compatibility is a developer-hub flag once the
extension works on mobile. Our comparison page (`reader-mode-alternative.html`, 2026-10-01) names Reader Mode, the
official bolding tool and ADHD Reading — none of the names in today's results.

Reading: the same findability problem as Highlight Keep, with one twist — the strongest 2026 rivals (Dyslexly, Half
Bold) are free and local, so the one-time-vs-subscription argument does not land against them; what ReadFocus still
has is the PDF reflow (0.2.0), paragraph focus and a precise bold strength. The cheap items are the ones that put
ReadFocus on the pages a searcher reaches and state those three gaps honestly. Items added (score = evidence × reach
÷ effort):

| Item | Score | Effort | What it does |
|---|---|---|---|
| `comparison-page-2026-rivals` | 4 | 0.2 d | Dyslexly and Half Bold columns on `reader-mode-alternative.html` with facts read from their own sites and listings through the relay (allowlist: dyslexly.com, halfbold.vercel.app); honest cells where they win |
| `reading-ruler-page` | 4 | 0.3 d | `reading-ruler.html`: the search-capture page for "reading ruler chrome extension" — Reader Line (20k, 4.9) reviews all ask for PDF, ReadingLine is abandoned, ReadingRuler "not working after update"; ReadFocus has the ruler and web PDFs since 0.2.0 |
| `alternativeto-listing` | 3 (blocked: owner account) | 0.1 d | list ReadFocus as a Reader Mode / Reader View alternative on alternativeto.net (its Reader Mode page is the top result for the query) and on Product Hunt's alternatives page; both need an account under the owner's identity |
| `firefox-android-compat` | 2 | 0.3 d | `browser_specific_settings.gecko_android` + a popup that works at phone width, then the AMO Android flag: a free shelf (AMO's Android home page) with no evidence yet that dyslexic readers install reading tools on mobile Firefox — build after the two pages, drop at day 30 if no Android installs |

Built 2026-10-04 (burn-down, same night): `firefox-android-compat` as **0.2.1** — `gecko_android` in the Firefox manifest, a
phone-width popup, guarded shortcut API, tap-to-place ruler and focus. Ships with the next AMO sign; the proof is the AMO
API's compatibility field plus any Android installs by the day-30 review. Not tested on a device.

Not added: a free companion extension (the Variables Toolkit pattern) — a ruler-only or bold-only free extension would
sit next to Half Bold and Dyslexly, which are already free and larger, and risks the Chrome Web Store's repetitive-
content rule; a demo video (no evidence it moves installs). Kill check unchanged: 2026-12-21 if nothing moves.

### 2026-10-04 (burn-down) — `comparison-page-2026-rivals` built
`reader-mode-alternative.html` now has six columns: Half Bold and Dyslexly joined the three September rivals, with one
paragraph on the pair. Facts through the relay (`docs/relay/responses/rf-rivals-2026/`, `rf-rivals-2026b/`): **Half Bold** —
halfbold.vercel.app: "100% free … no premium version, no subscriptions", two engines (CSS-only / tag-wrapping),
OpenDyslexic, focus modes, PDFs "need conversion first", a Google Docs integration guide; Chrome listing 10,000 users,
4.8 (55), v2.0.4 updated 2026-03-05. **Dyslexly** — dyslexly.com answers 403 to the runner, so its Chrome listing is the
source: 271 users, 5.0 (5), v1.6.24 updated 2026-09-28; free tools "do not require an account, subscription or credit
card": four fonts, spacing, overlays, line focus, reading ruler, read-aloud, a bold-starts mode, per-site settings, a
built-in reader for text-based PDFs; Pro adds rewriting and voice tools (price not on the listing, so not on our page).
Reading: both are free, so the page says plainly where they win and keeps ReadFocus's three real differences (bold
strength, paragraph focus, PDF reflow as real text). Dyslexly's 271 users show it ranks on content, not installs — the
`reading-ruler-page` item is the same play. Allowlist gained `.dyslexly.com` and `halfbold.vercel.app`.

### 2026-10-04 (burn-down) — `reading-ruler-page` built
`https://apps.gankdat.com/reading-ruler.html` is the search-capture page for "reading ruler chrome extension" / "reading
ruler pdf": an 11-row table against Reader Line (20,000 users, 4.9, every top review asks for PDF), ReadingLine (8,000,
3.9, abandoned June 2022, "zero controls") and ReadingRuler (722, 3.4, "not working after recent update"), all from the
September 2026 harvest (`research/cws-harvest-2026-09-18.json`); honest cells where ReadFocus's ruler is thinner (one
band, no colour/size controls, no lock-in-place) and the PDF reflow explained as the reason a ruler can work on a web PDF
at all. Links: landing index, the ReadFocus page, the comparison page, `sitemap.xml`, `LISTING.md` and
`assets/amo-metadata.json` (the live listings pick the line up on the next dashboard visit / version sign). Proof (queue):
≥ 30 impressions or ≥ 3 clicks at the 2026-10-30 review. Not built: colour/size controls for the band — a product change,
queued only if the page or a review asks for it.

## Research 2026-10-05 (burn-down 19:00; starvation fallback — every open ReadFocus item blocked or dated)

Evidence read: the metrics rows (0 Chrome users and no ratings every day since 2026-09-30; 0.2.0 shows as the live Firefox
version on 10-05 and the Chrome listing's "updated October 4, 2026", so the PDF reader and the fixed listings have had one
day — nothing readable yet), the two research notes above, STRATEGY §5 (distribution before features; every distribution
item left is blocked on an owner account — `cws-promo-tile`, `edge-add-ons-listing`, `alternativeto-listing` — and the
numbers are dated 2026-10-30), the September review sample re-read **by ask** rather than by rival
(`research/cws-harvest-2026-09-18.json`), the live source (`core/settings.ts`: the ruler is one fixed yellow band with no
setting; no spacing, no tint, no read-aloud), the British Dyslexia Association style guide (web search: line spacing 1.5,
letter spacing ≈ 35 % of the average letter width, cream or a soft pastel instead of white — "white can appear too
dazzling"), two 2026 listicles for "chrome extension dyslexia read aloud" (Dyslexly's free tier: five fonts, spacing,
colour overlay, line focus, ruler, text-to-speech with word highlighting, PDF viewer; Helperbird's word-by-word read-aloud
is the feature its blog leads with) and Half Bold's own FAQ from the 10-04 relay capture (`docs/relay/responses/rf-rivals-2026/3.html`):
"Does it work with Google Docs? Yes! … File → Share → Publish to web, then enable Half Bold on the published page" — a
workaround, not Docs support, and one ReadFocus can give for free.

Asks in the sample that ReadFocus does not answer today:

| Ask | Where it is said | Count |
|---|---|---|
| ruler colour / size / opacity | ReadingRuler ("the only thing that could make it better would be color and opacity options"; praises hex/RGB/HSL/eyedropper), ReadingLine ×2 ("wish we could tweak colour, size and opacity"; "option to change color — not usable on dark background themes"), Reader Line ("the color filters are nice") | 4 |
| background colour / tint | Dyslexia Friendly ("I can change the background colour of the page … and the font size"), Quiet Reader ("the colours are harsh (black & white) and cannot be changed"), Dyslexia Reader (colour changers "caused the screen to blink" — change the tint gently, once) | 3 |
| spacing | Dyslexia Friendly ("messes with the spacing of words and entire page layout … increases the zoom" — spacing must be a control, not a side effect) | 1 |
| Google Docs | the official bolding tool ("doesn't work on pdf documents or google docs"), ADHD Reader ("wants Docs/Word") | 2 |
| read aloud | none in the sample; it is a suite feature (Helperbird, Dyslexly, Dyslexia Reader's click-a-sentence) and the free "Read Aloud" extension serves it standalone | 0 |

Reading: the 10-04 note deferred ruler controls "until the page or a review asks" — the sample already asks four times
across the three ruler tools (28,000 users), and our own `reading-ruler.html` admits the band is thinner than Reader
Line's. Spacing and tint are the BDA basics every dyslexia suite ships and the one thing a cream-background reader
cannot get from ReadFocus at all. Read-aloud is real but served elsewhere, so it sits last. Items added (score =
evidence × reach ÷ effort):

| Item | Score | Effort | What it does |
|---|---|---|---|
| `ruler-controls` | 5 | 0.3 d | colour (six swatches incl. a dark-page-safe one), height (3 sizes), opacity, and a lock-in-place toggle for the ruler; free, like every rival's ruler |
| `spacing-and-tint` | 4 | 0.4 d | line / letter / word spacing with the BDA numbers as the one-click default, plus a page tint (cream, pale yellow, blue, green, pink, grey) as a soft fixed overlay; spacing free, tint in the unlock |
| `read-aloud` | 3 | 0.6 d | the browser's own voices (`speechSynthesis`, nothing leaves the browser), sentence highlighting that follows the voice, play/pause in the popup and a shortcut; in the unlock; listing says plainly it uses the computer's voices |
| `google-docs-publish-tip` | 3 | 0.05 d | the "Publish to web" route on the comparison page, the ReadFocus page and the welcome page — honest "ReadFocus cannot read the editor itself" kept |

Not added: a Docs editor integration (canvas; Half Bold has none either); a ruler colour picker with hex input (six
swatches cover the asks; a picker if a review asks); dark mode / page colour inversion (Dark Reader's job, 5M users).
Kill check unchanged: 2026-12-21 if nothing moves.

### 2026-10-05 (burn-down 19:00) — `ruler-controls` built (0.3.0)
The popup's ruler row now has six colour swatches (yellow, blue, green, pink, grey and white — the one that shows on a dark
page, the ReadingLine complaint), three heights (24 / 34 / 48 px), an opacity slider (0.1–0.6) and **lock in place**: a
locked band ignores the mouse and moves only on a click or a tap, so you scroll the page under it (the Reader Line
behaviour; on a phone it is simply the tap-to-place the 0.2.1 popup already promised). Free, like every rival's ruler
controls. Implementation: four `SiteSettings` fields with defaults (`normalize` backfills old saves, unit-tested), the
band styled through three CSS variables on the element, `pointermove` ignored while locked. e2e section 1b (4 checks):
height and `rgba(56, 150, 255, 0.4)` computed on the band, a mouse move leaving a locked band where it was, a click moving
it. Copy: listing, AMO notes, welcome page, the ReadFocus page and `reading-ruler.html` (its "one band, no controls" cells
and the "does not do yet" list now say what is there). Ships as 0.3.0 with the open ALERTS handoff (amended). Proof: a
ruler review or support mail naming colour/size/opacity within 60 days of the version going live.

### 2026-10-05 (burn-down 19:00, 2nd item) — `spacing-and-tint` built (0.3.0)
**Wider spacing** (free): one switch sets line height 1.5, letter spacing 0.12em and word spacing 0.16em on reading
blocks only (editors untouched, as the Dyslexia Friendly review asks) — the BDA guide's 1.5 line spacing and wider
tracking, at the WCAG 1.4.12 text-spacing values every browser is required to tolerate, so pages do not break.
**Page tint** (unlock): cream, pale yellow / blue / green / pink or soft grey as one fixed full-viewport layer with
`mix-blend-mode: multiply` — white turns to the tint, text stays dark, and nothing is repainted per element (the
Dyslexia Reader complaint, "the screen blinks"). Free keys get `tint: none` from `applyTier` (unit-tested). e2e 2b
(4 checks: computed line height and letter spacing on a paragraph, textarea untouched, no tint without a key) plus the
tint layer's computed colour in the pro section and its absence with a bad key. Copy: listing (free bullet, unlock
line), AMO notes, welcome, the ReadFocus page and the comparison page's ReadFocus cell. Proof: a review or support mail
naming spacing or the tint within 60 days of 0.3.0 going live; unlock conversions after vs before.

### 2026-10-05 (burn-down 19:00, 3rd item) — `read-aloud` built (0.3.0, unlock)
`speechSynthesis` only — the computer's own voices, nothing leaves the browser (the listing says so, because Helperbird's
one complaint is voice quality and that is the OS's). Reading starts at the first block on screen, one utterance per
sentence (`core/speech.ts`: `Intl.Segmenter` sentences with a regex fallback, and the pure `locateSpan` that maps a
sentence onto a block's text nodes — 4 unit tests), and the sentence being read is marked through the **CSS Custom
Highlight API** (a Range, not a wrapper, so it lives beside the bolding spans and vanishes on stop; Chrome 105+, Firefox
140 = our floor). Popup: ▶ Read / ⏸ Pause / ▶ Resume, ■ Stop, a speed slider (0.7–1.6), plain notes for "part of the
unlock", "no voices on this browser" and "nothing to read"; shortcut Alt+Shift+A. Switching the site off stops reading.
e2e (4 checks through the extension's own message, as the popup sends it): refused without a key, starts for a key with
9 sentences, the first sentence on screen is the one marked with its highlight registered, stop clears it — headless
Chromium has no voices, so the utterance errors at once and the reply is read synchronously; audio itself is unverified
here. Proof: a review or support mail naming read-aloud within 60 days of 0.3.0 going live; unlock conversions.

### 2026-10-05 (burn-down 19:00, 4th item) — `google-docs-publish-tip` built
The Publish-to-web route (File → Share → Publish to web, then ReadFocus on the published page) is now on the comparison
page's Google Docs row (ReadFocus cell, and Half Bold's cell says honestly that its "integration guide" is the same
workaround), the reading-ruler page's "does not do yet" list, the ReadFocus landing page and the welcome page's tips —
each keeping "cannot read the editor itself". No product change. Proof: a Docs-related install or question within 60 days.

## Research 2026-10-07 (burn-down; starvation fallback — no new evidence)

Third starvation pass in eight days (09-30/10-04, 10-05 built out the same night). Evidence unchanged:
0 users and no ratings on Chrome and Firefox (0.2.0) on every row; 0.3.0 waits on the signing handoff; Edge, AlternativeTo and the promo tile are owner-blocked. Nothing unblocked is left that the earlier passes did not queue and build, so no items are
added; the queue carries `research_after: 2026-10-30`, the `day-30-funnel-review` reading, and the fallback skips it until then
(`docs/pipeline/README.md`, Waiting).
