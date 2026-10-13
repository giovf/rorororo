# Owner action request #025 — Nebius Token Factory API key for the hackathon entry

- **Date:** 2026-10-13
- **Status:** pending
- **Your time:** ~5 minutes
- **Cost:** up to £2.00 of Nebius inference beyond the US$1 trial credit (recorded as `planned` in `docs/LEDGER.md`)
- **Deadline:** the hackathon closes **2026-10-30 10:00 PT**; the key is needed by about 2026-10-24 to record and submit in time
- **Blocks:** hackathons `nebius-nvidia-hackathon-submit` (the agent itself, `nebius-diligence-agent`, is built against fixtures meanwhile)

Nebius mailed on 2026-10-12 that your Token Factory account is active, so the Nebius × NVIDIA
Global AI Hackathon entry dropped on 2026-10-11 is back on (`ventures/hackathons/RESEARCH.md` §2b).
Nebius's billing page says onboarding needs a bank card and gives US$1 of trial credit for 30 days;
the Nemotron models the entry uses cost US$0.06 in / US$0.24 out per million tokens, the agent stops
itself after 40 calls or 300k tokens per run, and the whole entry stays under US$2. Nothing here
spends more than that; if you would rather keep no card on the account, say so and the entry is
dropped again — your call.

## Actions

### 1. Create an API key
- **What:** the key the agent and the demo recording use to call Nemotron on Token Factory.
- **Where:** https://tokenfactory.nebius.com/ → API keys (left menu)
- **Steps:** 1. Sign in. 2. Create a key named `foundry-hackathon`. 3. Copy it once.
- **Give back:** `NEBIUS_API_KEY=…` in `.env`, and the same value as the repository secret
  `NEBIUS_API_KEY` (GitHub → Settings → Secrets and variables → Actions) so the `demo video`
  workflow can record the live run. Say "done" and whether a card is on the account.
- **Cost:** £0.00 for the key; usage as above.

### 2. (Optional) Nebius AI Builder Program
- **What:** Nebius's free programme that gives "$400+ in credits and discounts" across Token Factory and partners.
- **Where:** https://nebius.com/blog/posts/introducing-the-nebius-ai-builder-program (the "Sign up" link)
- **Steps:** apply with the same account; if credits land, say so — the `planned` ledger row is then removed.
- **Cost:** £0.00

## When you're done
1. Set **Status** above to `done` and note anything that differed from the steps.
2. Put the key in `.env` and the repository secret (never in chat).
3. Say "done" — the next build run records the live demo and prepares the Devpost form (as action 023).
