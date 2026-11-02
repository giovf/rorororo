# Owner action request #036 — Pay for GitHub Pro to make the code private, or keep it public? (~2 min)

- **Date:** 2026-11-02
- **Status:** done 2026-11-02 — owner chose A (stay public behind the mirror, £0)
- **Your time:** ~2 minutes (a yes/no reply; the "yes" path adds ~5 minutes on GitHub)
- **Cost:** £0 for "no"; US$4/month (≈ £3.10, before VAT) for "yes" — a second standing cost next to Cloudflare's US$5
- **Blocks:** foundry `actions-minutes` (the private flip you asked for on 2026-10-16)

You asked on 2026-10-16 to keep this repository private and surface only what is needed. The plan was to
flip it private once a week's GitHub Actions use fitted the free private cap (2,000 minutes a month,
≈ 467 a week). Two readings are in and the cadence does not fit:

| Week (to 09:00 UTC) | Billed minutes | Free cap share |
| ------------------- | -------------- | -------------- |
| 2026-10-26          | 459            | 467            |
| 2026-11-02          | 574            | 467            |

The extra minutes are the routines' own checks (phone-line dispatches, live probes after a push), and the
operation's weekly use has grown every week since 10-26. On a private repository the free cap is a cliff:
past 2,000 minutes every workflow stops until the month resets — deploys, the metrics, the owner-notes
bot and your phone line — silently. So the flip waits on one choice from you.

## Actions

### 1. Choose (~2 min)
- **What:** reply **A** or **B** (Telegram or the dashboard idea box).
- **A — stay public behind the mirror (recommended, £0, nothing for you to do).** The code stays public
  as it is today. Nothing secret is in the repository (keys live in GitHub secrets and `.env`, never in
  git), the public gankdat mirror already carries only what the product pages need, and the ledger's
  headroom stays at about nine months.
- **B — GitHub Pro, US$4/month.** 3,000 private minutes a month, which today's cadence (≈ 2,460) fits
  with about a fifth to spare while use is still rising. Ledger headroom drops from about nine months
  to about five. If you choose B: open https://github.com/settings/billing/plans, pick **Pro** with
  your card (~5 min), then say `036 B done` — Claude flips the repository private the same day (the
  token already holds admin; the listings were moved on 2026-10-04) and adds the recurring row to
  `docs/LEDGER.md`.
- **Give back:** `036 A` or `036 B done`.

## When you're done
1. Set **Status** above to `done` and note anything that differed from the steps.
2. Send the note. On A, Claude drops the flip item and keeps trimming the routines' own CI use; on B,
   Claude flips the repository and records the cost.
