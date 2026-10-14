# x402 setup (agent pay-per-request)

The `/x402/data/:source` lane lets agents pay per call in USDC with no account
— payment is the auth. It ships **dark**: with `X402_WALLET_ADDRESS` unset
(the default), every `/x402/*` route 404s and no x402 code executes.

**x402 v2 since 2026-10-14** (v0.25.0, `@x402/hono` + `@x402/core` + `@x402/evm` +
`@x402/extensions`, CDP facilitator through `@coinbase/x402`; `x402-hono` 1.2 / x402 v1
before). The move was made for the x402 Bazaar: the CDP catalogue indexes only v2
resources that declare `extensions.bazaar`, and only after one settled payment
(exchange 2026-W42, `docs/exchange/2026-W42.md`). v1 clients (`X-PAYMENT` header,
requirements in the 402 body) are no longer served — the lane had 0 payments in three
months.

## Enabling it

1. **Wallet**: any Base-network address you control receives the USDC (self-custody
   wallet or a CDP-managed one). Testing can use a throwaway address on Base Sepolia.
2. **Facilitator** (verifies + settles payments so the Worker never touches chain
   state, and — for CDP — indexes the resources in the Bazaar):
   - Coinbase CDP (`CDP_API_KEY_ID` + `CDP_API_KEY_SECRET`): Base mainnet, the one the
     Bazaar reads. First 1,000 on-chain settlements a month free, then US$0.001 each;
     verification always free (CDP docs, read 2026-10-14).
   - `https://x402.org/facilitator` — public, **Base Sepolia testnet only**; the default
     when no CDP credentials and no `X402_FACILITATOR_URL` are set.
3. Config (local `.dev.vars` / prod `wrangler secret put`):

   ```
   X402_WALLET_ADDRESS=0x...            # required to un-dark
   X402_PRICE_USD=$0.005                # optional, default $0.005/request (a source's x402PriceUsd overrides)
   X402_NETWORK=base                    # or base-sepolia for testing (→ eip155:8453 / eip155:84532)
   X402_FACILITATOR_URL=                # optional; ignored when CDP credentials are set
   CDP_API_KEY_ID= / CDP_API_KEY_SECRET= # Coinbase CDP facilitator (mainnet + Bazaar)
   ```

## The wire protocol (v2)

```
GET /x402/data/uk-tenders?per_page=2
→ 402, body: {"ok":false,"error":{"code":"payment_required",…}}
      PAYMENT-REQUIRED: <base64 JSON>   the payment-required document
→ pay, retry with PAYMENT-SIGNATURE: <base64 JSON payment payload>
→ 200, data envelope + PAYMENT-RESPONSE: <base64 JSON settlement receipt>
```

The decoded `PAYMENT-REQUIRED` document:

```json
{
  "x402Version": 2,
  "resource": { "url": "https://gankdat.com/x402/data/uk-tenders", "description": "…", "mimeType": "application/json" },
  "accepts": [{ "scheme": "exact", "network": "eip155:8453", "asset": "0x8335…2913", "amount": "5000",
                "payTo": "0x…", "maxTimeoutSeconds": 300, "extra": { "name": "USD Coin", "version": "2" } }],
  "extensions": { "bazaar": { "info": { "input": { "type": "http", "method": "GET", "queryParams": { "per_page": "5" } },
                                        "output": { "type": "json", "example": { "ok": true, "data": [ … ], "meta": { … } } } },
                              "schema": { … JSON Schema of input.queryParams and output.example … } } }
}
```

Everything under `extensions.bazaar` is generated per route in `src/x402/bazaar.ts` from
the source registry: the description is the source's own one-liner cut to whole
sentences (declarative — the catalogue's content policy drops text that reads like an
instruction to an agent), the query schema is `buildQuerySchema(source)` through
`z.toJSONSchema` (filters + `page`, `per_page`, `q`; a lookup source lists its keys under
`anyOf`), the output example is the success envelope around one record derived from the
record schema (dates look like dates, enums use their first member; a live page-1 read
would cost 17 store reads on the lane's first request), the output schema is the same
envelope as JSON Schema. 3–7 KB per route before base64.

The resource server is built on the first lit request per configuration (wallet, price,
network, facilitator) and kept for the isolate's life: the facilitator handshake
(`GET /supported`) runs once, not per request. A failed build is retried by the next
request.

## Verifying the flow

```bash
npm run dev
curl -si localhost:8787/x402/data/uk-planning | grep -i payment-required | cut -d' ' -f2 | base64 -d | jq .
# pay + retry with the v2 client (Base mainnet by default; X402_NETWORK=base-sepolia for testnet):
PRIVATE_KEY=0xBUYER_KEY node scripts/x402-test-client.mjs
```

Paid requests are logged (`event: "x402_paid"`) and written to Analytics Engine
(`x402_paid`, UA, path, source, hashed client id). The test client sends the user agent
`gankdat-x402-probe/…`; the metrics runner counts payments under it as internal
(`+N own probe` beside the sale count), never as sales.

## Getting indexed in the x402 Bazaar

Docs: `docs.cdp.coinbase.com/x402/seller/get-discovered` (read 2026-10-14 through the relay).

1. **Validate** — keyless, from the runner (the sandbox proxy refuses the host):
   `POST https://api.cdp.coinbase.com/platform/v2/x402/validate {"resource":"https://gankdat.com/x402/data/<slug>","method":"GET"}`
   → `valid: true`, `simulation.outcome: "accepted"`, `bazaarExtension` echoing our
   metadata. The metrics runner does this for every live source daily and writes
   `x402 validate: 17/17 valid` (or the failing slugs with the first preflight failure)
   on the Daily numbers row. Validation does not check the content policy.
2. **One settled payment** through the CDP facilitator — "every validated endpoint is
   eligible for indexing after a successful settled payment". No sandbox or runner holds
   a funded wallet: the owner makes the call (`docs/for-owner/actions/026-x402-bazaar-first-payment.md`,
   ≤ 10 min, half a cent) with the test client above, or funds a US$1 probe wallet whose
   key becomes a repository secret so the runner can repeat it.
3. **Read the catalogue, never assume** — sellers report resources that validate yet
   never index (cdp-sdk issues #806, #759): the proof is our `payTo` returning the
   resources from `GET /platform/v2/x402/discovery/resources` (queued:
   `metrics-bazaar-merchant-read` writes `bazaar: N listed, C calls/30d, P payers` on the
   row; day-30 read 2026-11-14). New endpoints "rank conservatively until usage accrues";
   curation (featured tier) needs live mainnet payments, ≥ 99% availability and complete
   metadata — that is editorial, not a step.

If the metadata is rejected for policy, revise the wording (descriptions must describe,
never instruct), redeploy and make another paid call; discovery runs again.
