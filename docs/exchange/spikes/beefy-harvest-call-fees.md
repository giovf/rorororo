# Spike: Beefy harvest call fees on Base

Queue item `new-ventures/spike-beefy-harvest-call-fees` (burn-down, 2026-10-19 00:24–00:32 UTC). The last open trigger of
the parked `onchain-keeper-rewards` idea (liquidations were declined by the 2026-10-17 keeper spike): *does a week of
Beefy harvest call fees on Base leave more than US$20 to harvesters outside the top address?* Sources: the fetch relay
(`docs/relay/responses/beefy-fees-2026-10-19` and `beefy-harvests-2026-10-19`, pruned after 7 days) — Beefy's docs
(Strategy Contract, Fees Breakdown bulletin, FeeConfigurator), its public API (`/vaults/base`, `/fees`, `/config`,
`/tvl`, `/apy`) and Base's chain through Tenderly's keyless JSON-RPC (`eth_blockNumber`, twelve 1,000-block
`eth_getLogs` windows on the `StratHarvest(address,uint256,uint256)` topic, `0x9bc239f1…92410`).

## 1. What the caller is paid

- Docs: "anyone is able to call the function, and can earn a reward between 0.05–0.5 % of the total yield" (Strategy
  Contract page); the Fees Breakdown bulletin's typical vault pays "0.05 % … to the one calling the harvest function" and,
  under BIP:45's up-to-9.5 % structure for newer vaults, c. 3.06–3.24 % to BIFI holders and c. 5.44–5.75 % to the treasury.
- API `/fees` (the per-vault fee configuration the contracts read): **every one of the 537 Base vaults carries the same
  tuple — total 9.5 % of yield, call 0.01 % (`0.0001`), strategist 0.5 %, treasury 5.75 %, stakers 3.24 %.** The
  harvest caller's share on Base is one basis point of the harvested yield, a tenth of the docs' "typical" figure.

## 2. How much yield there is to take a basis point of

`/vaults/base` lists 537 vaults, 226 active (200 Aerodrome, 13 PancakeSwap, 7 Morpho, 3 Curve). `/tvl` (chain 8453)
and `/apy` for the active ones:

| Reading | Value |
| --- | --- |
| Active-vault TVL | US$14,980,603 |
| Weekly yield at each vault's listed APY | US$52,011 |
| Call fees at 0.01 % — **the whole chain's weekly pool at 100 % capture** | **US$5.20** |
| Largest single vault's weekly yield (aerodrome-usdc-aero, US$1.13 M TVL, 38.6 % APY) | US$8,391 → US$0.84 of call fee a week |

## 3. Who harvests (6.7-hour sample, blocks 52,777,205–52,789,204, head 52,790,104)

477 `StratHarvest` events on 88 strategies (87 of them in the Base vault list), 11 distinct harvesters:

| Harvester | Events | Share |
| --- | --- | --- |
| `0x4026…406a` | 423 | 88.7 % |
| `0x03d9…8557` | 35 | 7.3 % |
| `0x9916…977a` | 6 | 1.3 % |
| eight others | 13 | 2.7 % |

Neither top address is the `keeper` in Beefy's `/config` (`0x4fED…B619`), so the harvesting is already run by
dedicated bots, not by Beefy's listed keeper — exactly the contention the keeper spike predicted for liquidations.
Extrapolated to a week (×25): ≈ 12,000 harvests, of which ≈ 1,350 (11 %) by callers outside the top address — worth
**≈ US$0.59 a week between ten addresses** at the 0.01 % share, before gas (Base gas US$0.08–0.17 a transaction on
2026-10-17, so each harvest outside the big vaults loses money).

## 4. Call: decline the keeper idea outright

The trigger asked for more than US$20 a week reaching harvesters outside the top address. The ceiling for *every*
harvester on the chain is US$5.20 a week, the share outside the top address is about US$0.59, and a harvest costs more
in gas than its fee on all but the largest vault. A Worker-only harvester cannot clear its gas, let alone the £10 budget
rule's first unprofitable week. `onchain-keeper-rewards` moves to `declined` in the exchange with these numbers; the
only thing that would reopen it is a protocol paying callers a share two orders of magnitude larger (≥ 1 % of yield)
with no dedicated bot, which is not a reading worth scheduling. Sample caveat: 6.7 hours, not a week — the ceiling in
§2 does not depend on the sample, and the harvester split would have to invert for the call to change.
