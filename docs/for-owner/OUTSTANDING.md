# Outstanding — everything that is waiting on you (updated 2026-10-04)

Since 2026-10-06 the live, ordered list of open requests is generated in [OPEN.md](OPEN.md) with every push; this page keeps the decisions and history.
One list, kept current by Claude. Each item says what it unblocks and roughly how long it takes.
Nothing here spends money. Your answers of 2026-09-28 are applied below.

## Open (updated 2026-10-10)

| # | Do this | Why | Where |
| --- | --- | --- | --- |
| ~~F1~~ | **Done 2026-10-10**: you paid the US$49 invoice. Your rule is recorded in `docs/LEDGER.md`: the £100 cap is your net outlay, the US$5/month Workers Paid line is yours by agreement, and anything beyond the cap comes out of profit. The repo now enforces it (`npm run ledger` fails past the cap, warns under 3 months of headroom; the daily metrics job queues a fix the day any metered overage appears). Nothing more to do. | — | ledger row 2026-10-10 |

**Standing 10-second item**: once a week (Wednesday evening is ideal, just before the Thursday 03:00 UTC reset) send the Telegram bot a note like `usage 62% fable 71%` from your `/usage` screen. The nightly evening-burn routine throttles itself from that number (`docs/ops/BURN.json`), aiming for 70–80% of the week. No note means it keeps running every night.

| # | Do this | Unblocks | Where |
| --- | --- | --- | --- |
| ~~E4~~ | **Done 2026-10-04 15:43 UTC**: owner signed in through the connector; code exchanged, tokens issued, tools answer full pages on the free plan (249 credits left after the test query). Step 8 of the directory pack is complete. | — | — |
| D4 | **Decided 2026-10-04: repo goes private.** Claude trimmed CI (root check on code pushes + nightly, watchdog 2-hourly, deploy ignores docs, Pages job removed) and added a minutes guard; the flip happens once a measured week lands under 350 Actions minutes (≈1,500/month against the 2,000 cap). Nothing for you to do. | — | `foundry/actions-minutes` |

E1 (Connectors Directory submission), E2 and E3 (Chrome privacy URLs) done by you 2026-10-04. ReadFocus and Highlight Keep 0.2.0 shipped to both stores the same day (in review).

## Decided 2026-09-28 (applied)

| Item | Your answer | What Claude did |
| --- | --- | --- |
| D1 Fable exhausted | Fall back to Opus, low-complexity items only | New "build fallback" routine on Opus 5 at 09:20 and 17:20 UTC: runs only if the Fable slot left no trace, takes only items with effort ≤ 0.3 days. (The latest Opus available is Opus 5; there is no 5.5.) |
| D2 Edge store | Drop | Edge removed from ReadFocus plans; action 006 closed. |
| D3 Limited company | Wait | Stays parked until the data line passes £300 MRR. |
| B3 Launch posts | Not doing | Item dropped; will not be re-asked. |

## Closed 2026-09-28

| Item | Outcome |
| --- | --- |
| A1 Figma payout | The plugin sells through Figma checkout ($12), which Figma only enables once payouts are connected — so this was already satisfied at publish time. If a sale ever fails to pay out, the setting lives at figma.com → your avatar → Settings → **Community** tab → Payouts. |
| A2 Search Console sitemap | Done by you. |
| A3 Apify publishing | Resolved: as of 2026-09-28 21:15 UTC **all 17 actors are public on the Apify Store** (support's reply explained the block was a 5-publications-per-24h limit; the daily publish job now respects it). Nothing more to send to support. |
| A4 Gmail send-as | Done by you. |
| B1 Figma relisting | Done by you. |
| B2 Outreach drafts | Sent by you; Claude tracks replies in `OUTREACH-2026-09.md`. |
| C1 SAM.gov key | **False alarm, sorry**: `sam-exclusions` has read the keyless public extract since 2026-09-20, so the individual API key is unused. Whatever you added is harmless; future SAM key emails can be ignored. |

## Waiting on third parties — nothing for you

- Chrome Web Store review: ReadFocus (19 Sep) and Highlight Keep (20 Sep).
- Firefox AMO review: both extensions (19 Sep).
- ICO data-protection fee: deferred by you until the first real customer (action 012).
- Repo goes private once the store reviews are through (action 013) — Claude does this.

Older per-item write-ups stay in [actions/](actions/) for the steps; this page is the list.
