# Owner action request #028 — give the PayPal hackathon judges demo access (Devpost form)

- **Date:** 2026-10-23
- **Status:** open
- **Your time:** ~3 minutes
- **Cost:** £0.00
- **Deadline:** **Wednesday 2026-11-12, 12:00 PT** (20:00 UK) — the organiser's message of 2026-10-21 02:29 (INBOX) says the
  entry "lacks access to a functional demo" and asks for run instructions in the repo or a hosted demo URL on the form
- **Blocks:** the PayPal AI Hackathon entry being judged at all (hackathons `paypal-ai-hackathon-submit`, done 2026-10-16)

The entry's demo already exists — the live service with PayPal's sandbox, the MCP server and the demo video — but the
Devpost form you submitted on 2026-10-16 seems not to carry the demo URL or the testing instructions (both are in
`ventures/hackathons/entries/paypal-ai-hackathon/SUBMISSION.md`). Two things fix it; the first is already done for you.

## Already done (no step for you)

The public mirror https://github.com/giovf/gankdat now carries a **"Try the PayPal credit-pack checkout (sandbox)"**
section in its README with the three run paths (human, agent over MCP, curl) — the `mirror gankdat` job pushed it with
this commit. That is the "run instructions in the repo" the organiser asked for.

## Actions

### 1. Add the demo URL and the testing instructions to the Devpost submission
- **What:** edit the entry so the judges have a hosted demo URL and run steps.
- **Where:** https://paypalaihackathon.devpost.com/ → *My projects* → **gankdat — agentic commerce for official data** → *Edit*.
- **Steps:**
  1. In **"Provide a URL to a working demo, hosted application or test build"** paste:
     > https://gankdat.com/account (credit packs; sign in with any email, free plan) and the MCP server at https://gankdat.com/mcp (tools `buy_credits`, `confirm_credit_purchase`). Run steps: https://github.com/giovf/gankdat#try-the-paypal-credit-pack-checkout-sandbox. The demo video shows the full sandbox purchase end to end.
  2. In **"Testing instructions or credentials the judges need"** paste:
     > Everything runs on the live service with PayPal's sandbox; no real money can move.
     >
     > 1. Human path (2 minutes). Go to https://gankdat.com/account, enter any email address and click the sign-in link you receive (free plan, 250 credits). Under "Credit packs" choose a pack: you land on PayPal's sandbox checkout. Approve it with a PayPal sandbox personal account (free: developer.paypal.com → Testing Tools → Sandbox Accounts → Create account → Personal) and PayPal returns you to the account page with the credits added and "topup" shown in the usage line.
     > 2. Agent path over MCP (5 minutes). In Claude, Cursor or ChatGPT add the MCP server https://gankdat.com/mcp (no key needed to list tools and preview data). Ask the agent to buy 1,000 credits: it calls buy_credits, which starts a sign-in (the same email link), creates the sandbox order and returns PayPal's approval link; approve it as in step 1, then tell the agent to continue: it calls confirm_credit_purchase and the next data tool call shows the credits coming from the top-up balance.
     > 3. REST path (curl). With the API key from the account page: POST https://gankdat.com/v1/billing/paypal/orders with body {"pack":"pack_1k"} returns approve_url; after approval, POST https://gankdat.com/v1/billing/paypal/orders/<id>/capture adds the credits; any GET /v1/data/<dataset> then carries X-Credits-Source.
     >
     > Code: https://github.com/giovf/gankdat (src/billing/paypal.ts, src/mcp/server.ts, test/paypal.spec.ts); run steps in its README.
  3. If the video field is empty, attach the mp4 from the `demo video` CI run named in action 023 (`demo-video-paypal-ai-hackathon` artifact).
  4. Save, then reply to the organiser's Devpost message (the 2026-10-21 thread) with one line: "Demo URL and testing instructions added; run steps are in the repo README."
- **Give back:** tell Claude "028 done" (or set Status above to `done`).
- **Cost:** £0.00

*Optional, if you want to spare the judges creating a sandbox buyer:* in developer.paypal.com → Testing Tools → Sandbox
Accounts create one more **Personal** account and paste its email and password at the end of the testing field. It is
test money only — never the real PayPal login, and never the buyer secrets already in GitHub (action 024).

## When you're done
1. Set **Status** above to `done` and note anything that differed from the steps.
2. Start `claude` and say "028 done" — the routines record the date in `docs/ALERTS.md` and the hackathons research file.
