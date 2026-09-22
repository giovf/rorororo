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
