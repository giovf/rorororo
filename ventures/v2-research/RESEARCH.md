# V2 research — Chrome extension (discovery, task 13)

Status: **in progress** (2026-09-18). Method: web research for candidate niches → store
pages pulled directly (users, rating, rating count, last update) + first page of reviews;
raw in `cws-harvest-2026-09-18.json`. Chrome Web Store search/category pages are
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
