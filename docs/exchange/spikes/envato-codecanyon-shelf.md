# Spike: Envato Market (CodeCanyon) as a billed code shelf with public sales counts

Queue item `new-ventures/spike-envato-codecanyon-shelf` (burn-down, 2026-10-29 17:44–17:58 UTC; seeded by the 2026-W44
exchange). Sources: three fetch-relay rounds this run (`docs/relay/responses/envato-2026-10-29`, `-b`, `-c`, pruned
after 7 days) — the author help centre read through its keyless Zendesk search API (seven searches, 160–207 hits each,
article bodies included) and the rendered Market Author Terms page (`codecanyon.net/legal/author`, 200 rendered); and
two WebSearch passes for the shelf's item snippets. **codecanyon.net's category and search pages sit behind a
Cloudflare managed challenge** ("Verification successful. Waiting for codecanyon.net to respond", raw and rendered,
twice), so the rival table below is from search-index snippets of the shelf, marked as such. The sandbox cannot resolve
any envato host; `codecanyon.net`, `help.author.envato.com` and `.envato.com` were added to `docs/relay/hosts.txt`.

The questions the exchange left open: the author fee, the review queue, the AI-content policy, UK individual eligibility,
and whether ≤ 1-week JavaScript utilities from small vendors show ≥ 50 sales at ≥ US$10.

## 1. The shelf's terms (Envato's own help centre, dated as read)

| Source | What it says |
| --- | --- |
| **Author applications are paused — new authors join by invitation only** (updated 2026-10-29) and *Becoming an Envato Author FAQs* (2026-10-28), *How to apply* (2026-10-27) | "We're not accepting open applications from new authors. There's no application form to fill out, and no waitlist to join." Envato Market: "new author accounts can't be created at this time." Invitations go "directly by Envato to creators we've identified for a specific category"; "there's no form, waitlist, or process to request an invitation"; "we don't have a confirmed reopening date yet"; when it reopens the intake is "selective … for supported content types only". |
| *Introduction to Earnings* (2026-10-17) | "The Author Fee is always **50 %** of your Item Price"; list price = item price + a fixed buyer fee (US$3 in the example); US royalty withholding on US-sourced earnings applies before the fee; earnings move to the balance on the 8th of each month and pay out at a **US$50 minimum**. Worked example: a US$16 list price earns the author US$5.20 (32.5 %). The older exclusive 12.5–37.5 % / non-exclusive 55 % ladder is gone (secondary sources date the flat 50 % to 1 July 2026). |
| Market Author Terms (rendered 2026-10-29) | Items are listed on a **non-exclusive basis** ("you retain the ability to sell your Items on other websites"); the author warrants being 18 or over, not buying their own items, holding the rights to license; the fee is "set out in the rates schedule". Nothing read bars an individual or a UK seller. |
| *AI-generated content policy for Market and Elements* (updated 2026-10-28) | "You may not publish or submit AI-generated content, either as a standalone item or as the primary component of your item's final download file … This extends to **all content types**, across Market and Elements." Allowed for previews only. The examples are images; code is not named, but "all content types" covers CodeCanyon, and this operation's utilities would be AI-generated as the primary component. |
| *Author ID Checks* (2026-10-27), FAQs | Four onboarding steps after approval: tax information, payout details, a trader declaration, and a biometric **ID check** (personal or business verification). *Trader Status under the EU DSA* (2026-09-10): a regular seller is a trader and Envato verifies and displays trader contact details. |
| *Withholding Taxes* (2026-09-03) | US RWT on US-sourced Market earnings from 1 January 2026 (a W-8BEN treaty rate for a UK author); AU RWT ended. |
| Review | Every item goes through the Quality team (presentation, metadata, technical, legal requirements); approval, soft or hard rejection; no queue time published in the pages read. |

## 2. The shelf (search-index snippets only — the category pages cannot be fetched)

| Item (CodeCanyon) | Price | Sales shown | Last update |
| --- | --- | --- | --- |
| Sky Forms Pro (jQuery forms) | US$12 | 3.5K | 2015-02 |
| Form Wizard — Multi Step Form Validation (jQuery) | US$9 | 361 | 2019-04 |
| Hello Form — PHP Ajax contact form with validation | US$16 | 471 | 2025-05 |
| JavaScript Form Validation Library | US$9 | 12 | 2014-03 |
| PHP Form Builder | — | 5.8K | — |
| ValidForm; Web Form (jQuery validation) | — | not shown | 2026-03 |

What this says: the shelf does publish per-item sales counts (the one thing no other billed shelf spiked since W42
offers), and small-vendor form utilities at US$9–16 have sold in the hundreds to thousands — **over a decade**, with
the two JavaScript-only items at 12 and 361 sales and the big numbers on PHP or 2015-era jQuery. "≥ 50 sales in the
last year" cannot be read from a lifetime count, and the category pages that would sort by recent sales are behind the
challenge wall. The bar's evidence half is therefore unproven, not failed.

## 3. Call: park (the shelf is closed to new authors; the AI policy bars the product anyway)

Three of the four promote conditions fail on Envato's own pages, dated this week:

1. **An individual UK author admitted with no company** — no author of any kind is admitted: open applications are
   paused with no date, no waitlist and no way to ask (2026-10-29).
2. **AI-assisted code allowed** — the policy bars AI-generated content "as the primary component of your item's final
   download file … all content types" (2026-10-28). Every utility this operation would list is that.
3. **The economics** — a flat 50 % author fee plus the buyer fee and US withholding leaves ≈ 32–40 % of the list price
   (US$5.20 of US$16 in Envato's example), the worst take of any shelf spiked since W42 (Payhip ≈ 91 %, JetBrains 85 %,
   Etsy ≈ 81 %), on a shelf whose reach is why one would accept it.
4. **≥ 3 small-vendor items at ≥ US$10 with ≥ 50 sales in the last year** — unproven (lifetime counts only; the
   category listings are unreadable from here).

Nothing to queue. Re-read only if Envato reopens applications for code (the help article names the reopening and the
eligible content types) **and** the AI policy changes for software items; the exchange checks the two articles (ids
53981083605913 and 13313674070681, one relay line each) on 2027-01-15, not before. The shelf's public sales counts
stay useful as a demand reading for utilities sold elsewhere (own checkout, JetBrains), which the parked JetBrains idea
already uses in kind.
