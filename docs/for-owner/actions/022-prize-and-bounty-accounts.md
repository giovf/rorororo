# Owner action request #022 — accounts for the two new income lines

- **Date:** 2026-10-11
- **Status:** done 2026-10-11 except #3 (Nebius asked for a card — entry dropped) — #3 reopened 2026-10-13 as action 025 (the account went active on 2026-10-12; the key is still needed)
- **Your time:** ~15 minutes
- **Cost:** £0.00 (if any sign-up asks for a card, stop and tell me — the ledger rule is net outlay ≤ £100)
- **Blocks:** hackathons `paypal-ai-hackathon-entry` (9), `nebius-nvidia-hackathon-entry` (8); oss-bounties `first-bounty-pr` (9)

Your direction of 2026-10-11 ("take the money available on the internet") opened two lines whose
evidence is in `ventures/hackathons/RESEARCH.md` and `ventures/oss-bounties/RESEARCH.md`. Each needs
one account in your name; everything else is built by the routines.

## Policy check (your question of 2026-10-11)

Read from the official rules of both hackathons, Devpost's Terms of Service, GitHub's Terms and
Algora's Terms the same day:

- **Hackathons.** Nothing in either rule set restricts AI tools (PayPal's rules say any AI tool works).
  The entry must be your original work, solely owned by you — code Claude writes for you is yours —
  and you are the entrant: you register, you submit, you would receive the prize. The write-up will
  say the project was built with Claude Code under your direction. Judges may discount that; the
  rules do not forbid it.
- **Devpost** forbids automated access to its site, so Claude never scans or scrapes it; the
  hackathon-scanner item is dropped. You registering for two hackathons is ordinary use.
- **Bounties.** GitHub allows automation under a personal account with the human responsible, which
  is what `PR_TOKEN` does; every PR will say how it was built, and a project whose contribution rules
  forbid AI-assisted work is skipped. Algora forbids bots on algora.io — the scanner reads GitHub's
  API, never algora.io, and the only algora.io action is your sign-in.
- **Tax.** Prizes and bounties are income of your sole trade; the ledger records them.

## Actions

### 1. Devpost account
- **What:** the portal where hackathon entries are submitted; UK individuals are eligible.
- **Where:** https://devpost.com/register (sign up with GitHub is fine)
- **Steps:** register; under Settings → Account note the username. Register for the two hackathons: https://paypalaihackathon.devpost.com/ (click "Join hackathon") and https://nebiusglobalaihackathon.devpost.com/ ("Join hackathon").
- **Give back:** say "done" and the Devpost username. When an entry package is ready I will tell you; submitting is one form you fill with the text, repo link and video I prepare.
- **Cost:** £0.00

### 2. PayPal developer sandbox
- **What:** free sandbox credentials so gankdat can take a test PayPal checkout (no real money moves).
- **Where:** https://developer.paypal.com/dashboard/ (log in with any PayPal account, or create one)
- **Steps:** Apps & Credentials → make sure **Sandbox** is selected → Create App (name `gankdat-hackathon`) → copy the Client ID and Secret.
- **Give back:** put `PAYPAL_SANDBOX_CLIENT_ID=…` and `PAYPAL_SANDBOX_SECRET=…` in `.env`; say "done".
- **Cost:** £0.00

### 3. Nebius Token Factory account
- **What:** the model host the Nebius × NVIDIA hackathon requires.
- **Where:** https://tokenfactory.nebius.com/ (or the link on the hackathon page under "Get started")
- **Steps:** sign up; if the hackathon page offers credits, claim them; create an API key.
- **Give back:** `NEBIUS_API_KEY=…` in `.env`; say "done". **If it asks for a card, stop** and say so — the entry is dropped.
- **Cost:** £0.00

### 4. Bounty board sign-in
- **What:** the board that pays for merged pull requests on open-source issues.
- **Where:** https://algora.io/ → Sign in with GitHub (your `giovf` account)
- **Steps:** sign in; nothing else now. Payout details are asked only when the first bounty is awarded — I will tell you then.
- **Give back:** say "done".
- **Cost:** £0.00

### 5. Still open from #021
`PR_TOKEN` is not in the repository's Actions secrets as of 2026-10-11 10:40 UTC (`SEARCH_CONSOLE_KEY` is).
If you saved it elsewhere, re-add it under Settings → Secrets and variables → Actions. It unblocks
the bounty PRs and the Docker MCP Catalog PR.

## When you're done
1. Set **Status** above to `done` and note anything that differed from the steps.
2. Put the keys in `.env`.
3. Say which items are done — the routines pick up from there.
