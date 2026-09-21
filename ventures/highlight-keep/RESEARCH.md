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
