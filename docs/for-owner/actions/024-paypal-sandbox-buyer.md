# Owner action request #024 — PayPal sandbox buyer for the demo video

- **Date:** 2026-10-11
- **Status:** pending
- **Your time:** ~5 minutes
- **Cost:** £0.00
- **Blocks:** hackathons `demo-video-paypal-record`, then `paypal-ai-hackathon-submit` (action 023)

The PayPal AI Hackathon demo video is now recorded by a CI job (`demo video` workflow): a headless
browser walks through the live product with captions and publishes an mp4. One shot has a human
approve the sandbox payment on PayPal's page, so the job needs a **sandbox buyer** to log in as.
Your developer account from action 022 already has one — nothing new is created.

## Actions

### 1. Copy the sandbox buyer's login into two repository secrets
- **What:** give CI the sandbox buyer account's email and password (test money only; no real
  PayPal credential is involved — never use your own PayPal login here)
- **Where:** https://developer.paypal.com/dashboard/accounts (Sandbox → Accounts), then
  https://github.com/giovf/rorororo/settings/secrets/actions
- **Steps:**
  1. On the PayPal developer dashboard, Sandbox → Accounts, open the **Personal** (buyer) account's
     "View/edit account" — the email ends in `@personal.example.com`; set or copy its password.
  2. On GitHub, add secret `PAYPAL_SANDBOX_BUYER_EMAIL` with that email and
     `PAYPAL_SANDBOX_BUYER_PASSWORD` with that password.
- **Give back:** say "done" — the next routine runs the workflow and sends you the video link for
  action 023. (Or run it yourself: Actions → "demo video" → Run workflow, entry
  `paypal-ai-hackathon`; the mp4 is the run's `demo-video-paypal-ai-hackathon` artifact.)
- **Cost:** £0.00

## When you're done
1. Set **Status** above to `done` and note anything that differed from the steps.
2. Say "done" in Telegram or the next interactive session; the backlog picks up from there.
