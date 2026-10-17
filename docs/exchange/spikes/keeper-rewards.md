# Spike: on-chain keeper rewards on Base — 7 days of liquidations, measured

Research spike `spike-keeper-rewards-simulation` (new-ventures queue, burn-down routine, 2026-10-17 18:11–19:00 UTC).
Decides the parked exchange idea `onchain-keeper-rewards` (owner idea 2026-10-11; exchange 2026-W42 #3, parked at 0.6
because the measurement needed a POST relay). The question the queue item asks: over 7 days of liquidation and
harvest events on Aave v3 and Morpho on Base, how much was paid to callers, to how many callers, at what gas — and
could a £10 gas budget have netted anything.

## How it was read (primary, on-chain, through the relay)

Nine relay rounds (`docs/relay/responses/keeper-rewards-*-2026-10-17/`), all JSON-RPC or public APIs, no credential:

- Window: Base blocks 52,433,366 → 52,735,766 (302,401 blocks, 2 s each): 2026-10-10 18:13 UTC → 2026-10-17 18:13 UTC
  (block timestamps read from the chain). Gas price at read time 0.006 gwei; ETH US$2,413.84 (CoinGecko).
- Aave v3 Pool `0xA238Dd80C259a72e81d7e4664a9801593F98d1c5`, event `LiquidationCall` — every block of the window,
  303 `eth_getLogs` calls of 1,000 blocks. Values at today's prices (CoinGecko ids; token symbol/decimals read with
  `eth_call`). The collateral/debt ratio of the events (median 1.058, p10 1.027, p90 1.086) matches the 5–7.5 % bonus
  configuration, so today's prices are close enough for a spike.
- Morpho Blue `0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb`, event `Liquidate` — every block, 303 calls; market
  parameters (loan token, collateral token, LLTV) from `idToMarketParams` on-chain; prices for all 22 tokens from
  Morpho's public API (`blue-api.morpho.org`, `assets` query). Seized/repaid ratio median 1.108 (p10 1.060, p90
  1.145) matches Morpho's liquidation incentive factor `min(1.15, 1/(0.3·LLTV+0.7))`.
- Gas: `eth_getTransactionReceipt` for all 27 Aave transactions and a seeded sample of 70 of the 208 Morpho
  transactions (`gasUsed × effectiveGasPrice + l1Fee`).
- Beefy `StratHarvest` on any address, the last 9,401 blocks only (5.2 h) — a sample, not a week.
- Compound v3 `AbsorbCollateral` was not read: the chunk budget went to the two protocols the item names, and
  absorbs pay the caller nothing directly (the discount is on the later `buyCollateral`).

Which public endpoints serve a week of logs from a GitHub runner, learned the hard way this run (now in
`docs/relay/hosts.txt` comments and `README.md`): `mainnet.base.org` answers 429 `request limit reached` to every
`eth_getLogs` (even one at a time, 7 s apart; `eth_blockNumber`, `eth_gasPrice`, `eth_call` are fine); PublicNode
wants a token for anything older than a few blocks; dRPC's free plan rejects every `eth_getLogs` with a canned
"over 10000 blocks" error regardless of size; 1RPC allows 50 blocks, Blast 10, MeowRPC none, BlockPI needs a key,
Lava is discontinued, LlamaRPC and Blockscout sit behind a Cloudflare challenge. **Tenderly's public gateway
(`base.gateway.tenderly.co`) serves 1,000-block `eth_getLogs`, one call per line** (a JSON-RPC batch of 15 is
rate-limited as 15 calls); 616 single calls half a second apart went through without one retry.

## Aave v3 on Base: US$6,500 of bonus in the week, 93 % of it to one address

| Measure (7 days)                                   | Value                                                                                                  |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Liquidation events / transactions / borrowers      | 37 / 27 / 36                                                                                           |
| Debt repaid → collateral seized                    | US$91,600 → US$98,123                                                                                  |
| Gross bonus paid to liquidators (seized − repaid)  | **US$6,523**                                                                                            |
| Per event: median / under US$1 / under US$10 / max | US$0.66 / 20 of 37 / 21 of 37 / US$4,881 (one event)                                                   |
| Distinct liquidator addresses (contracts) / EOAs   | 13 / 12                                                                                                |
| Concentration                                      | `0xd128…4b3f`: 11 events, US$6,086 = **93 %**; top 3 = 100 %; the other 10 addresses shared US$30        |
| Events per day (10-10 → 10-17)                     | 0, 1, 8, 5, 22, 1, 0 — 22 of 37 on 2026-10-14/15                                                       |
| Collateral / debt                                  | WETH 25 of 37 (cbBTC 3, USDC 4, USDbC 3, cbETH, weETH) / USDC 24 (USDbC 4, EURC 3, GHO 3)              |
| Gas per liquidation tx (27 receipts)               | median **US$0.084**, mean US$0.40, max US$3.44; median 942,873 gas; all 27 succeeded                   |
| Position in block                                  | median tx index 71; 7 % at index ≤ 2 — not a top-of-block race                                         |

## Morpho Blue on Base: US$153,000 of incentive in the week, 85 % to five addresses

| Measure (7 days)                                     | Value                                                                                                                    |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Liquidation events / transactions / markets          | 620 / 208 / 22 (all 620 priced)                                                                                          |
| Debt repaid → collateral seized                      | US$1,372,984 → US$1,525,989                                                                                              |
| Incentive paid to callers (seized − repaid)          | **US$153,005** (US$142,520 by the LIF formula; 1 bad-debt event)                                                          |
| Per event: median / p75 / p90 / max                  | US$5.28 / US$39.70 / US$243 / US$18,633                                                                                  |
| Events under US$1 / under US$10                      | 132 / 367 of 620                                                                                                         |
| Per transaction: median reward / below median gas    | US$8.81 / 22 of 208 transactions earned less than the US$0.17 median gas                                                 |
| Distinct callers / EOAs in the 70-receipt sample     | 48 / 44                                                                                                                  |
| Concentration                                        | top 1 `0x8b61…8472` 233 events US$49,789 = **33 %**; top 3 = 76 %; top 5 = 85 %; top 10 = 97 %                            |
| The 43 callers outside the top 5                     | US$22,227 between them; **median US$18.72 per caller for the week**; 30 callers cleared US$10, 38 cleared US$1           |
| Where the money was                                  | cbXRP/USDC US$60,310 (82 events), SOL/USDC US$29,194, WETH/USDC US$22,383 (129), cbLTC/USDC US$15,574, JitoSOL/USDC US$9,988 |
| Events per day (10-10 → 10-17)                       | 3, 0, 176, 8, 427, 4, 2 — **603 of 620 (97 %) on two days** (10-12/13 and 10-14/15, the week's price falls)              |
| Gas per liquidation tx (70 receipts)                 | median **US$0.17**, mean US$1.94, p90 US$3.78, max US$82 (a priority-fee bid); median 599,384 gas                        |
| Position in block                                    | median tx index 544; 7 % at index ≤ 2                                                                                    |

Beefy sample (5.2 h, 47 strategies): 49 harvests by 7 addresses; Beefy's own harvester `0x03d9…8557` did 36 (73 %).
The call fee per harvest was not read this run (it is paid in native to the caller, not in the event).

## The £10 question (arithmetic, not a forecast)

£10 ≈ US$13.3 ≈ **158 Aave-sized or 77 Morpho-sized liquidation transactions at median gas.** Gas is not what
limits a keeper on Base; three other things are, and each was measured or surfaced by this read:

1. **The pool is real but it is a two-day pool shared by bots that already exist.** US$160k of incentive was paid in
   the week, 97 % of it in two price falls, to 48 Morpho callers and 13 Aave callers, 85–93 % of it to the top five.
   A new entrant performing like the median caller outside the top five would have netted **≈ US$19 in this (volatile)
   week** and, on the five calm days (2–8 Morpho events a day, 0–5 Aave events, shared by the same 48 bots), **≈ US$0–5**.
2. **A liquidation needs capital, not just gas.** Repaying the debt comes first: the median Morpho event repays about
   US$49 (its US$5.28 reward ÷ 0.108) and the large ones US$1,000–100,000. The wallet holds US$1.11. The capital-free
   route (Morpho's `onMorphoLiquidate` callback: receive collateral, swap it on a DEX, repay in the same transaction)
   is a smart contract to write, test and deploy plus DEX slippage on cbXRP-, SOL- and cbLTC-sized collateral — days
   of build, outside anything the operation has shipped, and the collateral is held for a moment at market risk.
3. **Cadence and data.** The winners are not at the top of the block (median index 71 and 544) but they act in the
   block the oracle moves; a Worker cron polls once a minute. Tracking 22 markets' positions needs either a paid RPC
   plan or an indexer — this run showed the keyless RPCs throttle a routine's reads, let alone a keeper's. The W42
   trigger's lateness measure (blocks between liquidatable and liquidated) needs position histories and was not
   computed; the block-index proxy is what the chain gives for free.

STRATEGY §5 score for a build: evidence 3 (primary, measured) × reach 1 ÷ effort ≥ 5 days ≈ **0.6** — the same as
the W42 exchange guessed, now with the number behind it.

## Recommendation: liquidations declined; one narrow re-read remains

- **Decline liquidation keeping on Base** at a £10 budget: the long-tail share is ≈ US$19 in a crash week and
  pennies otherwise, it needs repayment capital or a liquidation contract, and the money is taken inside the 2-second
  block by 48 incumbents. Logged in STRATEGY §8.
- **Keep the parked idea for one measurement only — harvest call fees.** Beefy-style harvests pay the caller in
  native with no capital and no contract (`harvest(callFeeRecipient)`), which is the only keeper shape a Worker cron can
  run; this run counted ≈ 225 harvests a day on Base but 73 % by Beefy's own bot and no fee size. Trigger: read
  Beefy's fee documentation through the relay (call-fee percentage, which chains still pay it) and a week of
  `StratHarvest` logs with `wantHarvested` priced; if the call fees reaching harvesters outside the top address exceed
  US$20 a week, spike the Worker-only harvester; else decline the idea outright.
- **Operational by-product:** the relay now retries 429/503 with backoff and paces same-host lines (`scripts/fetch-relay.mjs`),
  and `docs/relay/hosts.txt` records which Base RPC serves logs — the next on-chain read costs one round, not nine.
