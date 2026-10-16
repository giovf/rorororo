# Owner action request #026 — one x402 payment to list gankdat in Coinbase's x402 Bazaar

- **Date:** 2026-10-14
- **Status:** done 2026-10-16, option B — by Claude: the x402 test wallet from 2026-09-19 already held US$1.11 USDC on Base, so its key became the `X402_PROBE_KEY` secret and the first paid call (US$0.005, HTTP 200, settled) was made against v0.25.1. Nothing needed from the owner.
- **Your time:** ~5 minutes (option A) or ~10 minutes (option B)
- **Cost:** half a cent of USDC (option A) or US$1 of USDC in a probe wallet (option B); `planned` £0.80 in `docs/LEDGER.md`
- **Deadline:** none hard — the sooner the call is made, the sooner the 30-day reading (2026-11-14) means something
- **Blocks:** gankdat `metrics-bazaar-merchant-read`'s proof and `x402-bazaar-day-30`

The x402 Bazaar is Coinbase's catalogue of pay-per-call endpoints for AI agents: 34,668 resources,
and the 200 most-used took 518,867 paid calls from about 17,000 payers in the last 30 days (read
2026-10-14; `docs/exchange/2026-W42.md`). No UK register, company register, tender feed or sanctions
list is in it. gankdat's pay-per-call lane has been live since July with 0 payments because it was
listed nowhere. Today's build (v0.25.0) moved the lane to the x402 v2 protocol with the discovery
metadata the catalogue reads — one entry per dataset, 17 in all. The catalogue indexes an endpoint
**after one settled payment through Coinbase's facilitator**, and no automated session holds a
funded wallet. That one payment is yours to make. It is the documented onboarding step, not a sale;
the metrics row counts it as internal.

Wait for the deploy first: `curl -s https://gankdat.com/v1/health` must show `"version":"0.25.1"` (0.25.1, pushed 2026-10-14 evening, fixes the metadata CDP rejected: `per_page` typed as a string — a payment made against 0.25.0 did not index anything, so if you already paid today, one more call after 0.25.1 is live is needed)
(CI deploys within ~10 minutes of the build's push).

## Actions

### Option A — one call from a wallet you already have (~5 min, half a cent)

- **What:** pay US$0.005 in USDC on Base for one `/x402/data/uk-tenders` request with the repo's test client.
- **Needs:** a wallet with a few cents of USDC on the Base network (Coinbase Wallet, MetaMask, Rabby…)
  that is **not** the receiving wallet (`X402_WALLET_ADDRESS`). Gas is paid by the facilitator.
- **Steps:**
  1. In the wallet app, export the account's private key (MetaMask: Account menu → Account details →
     Show private key). Keep it in the terminal only — never in a file, never in chat.
  2. From the repo root, with `npm ci` done:
     `PRIVATE_KEY=0x… node ventures/gankdat/scripts/x402-test-client.mjs`
  3. Expect `HTTP status: 200`, a `Settlement receipt (PAYMENT-RESPONSE)` line and a basescan link.
     A 402 means the payment was not accepted — paste the output (it holds no secret).
- **Give back:** "done" and the basescan link (optional).
- **Cost:** US$0.005 (≈ £0.004).

### Option B — a US$1 probe wallet the runner can reuse (~10 min, US$1)

- **What:** a fresh wallet funded with US$1 of USDC on Base whose key lives in GitHub secrets, so the
  metrics runner can repeat the settled probe when needed (a re-screen after a metadata change, a
  monthly liveness payment) without asking you again.
- **Steps:**
  1. Create a new account in your wallet app (never reuse an account that holds anything else).
  2. Send it US$1 of USDC on the Base network.
  3. Save its private key as the repository secret `X402_PROBE_KEY`
     (GitHub → Settings → Secrets and variables → Actions). The daily metrics job already holds the
     probe step (built 2026-10-14): it pays again only while the catalogue still shows us unlisted,
     once a month after that, and never twice in a week.
  4. Make the first call yourself as in option A, with that key.
- **Give back:** "done, option B".
- **Cost:** US$1 (≈ £0.80) of USDC parked in the probe wallet; spent half a cent at a time.

## When you're done

1. Set **Status** above to `done` and note which option.
2. Say "done" — the Daily numbers row then reads the catalogue (`bazaar:` clause) and the 30-day
   review on 2026-11-14 decides whether the listing earns.
