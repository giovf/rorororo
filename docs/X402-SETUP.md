# x402 setup (agent pay-per-request)

The `/x402/data/:source` lane lets agents pay per call in USDC with no account
— payment is the auth. It ships **dark**: with `X402_WALLET_ADDRESS` unset
(the default), every `/x402/*` route 404s and no x402 code executes.

## Enabling it

1. **Wallet** (PRD open question #4 — still to decide): any Base-network
   address you control receives the USDC. Options: a fresh self-custody wallet
   (e.g. hardware or Coinbase Wallet), or a CDP-managed wallet. Testing can use
   a throwaway address on Base Sepolia.
2. **Facilitator** (verifies + settles payments so the Worker never touches
   chain state):
   - `https://x402.org/facilitator` — public, **Base Sepolia testnet only**;
     good for end-to-end testing without real money.
   - Coinbase's mainnet facilitator (via CDP) for real Base USDC at launch.
3. Config (local `.dev.vars` / prod `wrangler secret put`):

   ```
   X402_WALLET_ADDRESS=0x...            # required to un-dark
   X402_PRICE_USD=$0.005                # optional, default $0.005/request
   X402_NETWORK=base                    # or base-sepolia for testing
   X402_FACILITATOR_URL=                # optional; defaults to x402.org
   ```

## Verifying the flow

```bash
npm run dev
curl -i localhost:8787/x402/data/uk-planning       # → 402 + payment requirements JSON
# pay + retry automatically with the x402 client:
npx tsx -e "import { wrapFetchWithPayment } from 'x402-fetch'; ..."  # see x402.org docs
```

The unpaid 402 body lists `accepts[].payTo` (your wallet), price, and network.
A paying client retries with an `X-PAYMENT` header; the middleware verifies via
the facilitator, the data handler runs, and settlement lands in the
`X-PAYMENT-RESPONSE` header. Paid requests are logged (`event: "x402_paid"`).

Full mainnet verification is **blocked by config, not code**, until the wallet
decision is made.
