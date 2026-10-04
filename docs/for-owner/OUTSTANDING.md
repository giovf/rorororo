# Outstanding — everything that is waiting on you (updated 2026-10-04)

One list, kept current by Claude. Each item says what it unblocks and roughly how long it takes.
Nothing here spends money. Your answers of 2026-09-28 are applied below.

## Open (updated 2026-10-04)

| # | Do this | Unblocks | Where |
| --- | --- | --- | --- |
| E1 | **Submit gankdat to the Claude Connectors Directory** (~20 min, your paid Claude plan, no new account, no money): https://claude.ai/directory/manage → Submit new → MCP connector → URL `https://gankdat.com/mcp`, authentication "none". Every field (name, one-liner, description, URLs, reviewer instructions, seven acknowledgements) is pre-written in `ventures/gankdat/docs/CLAUDE-DIRECTORY.md`; the only thing to create is a test key at https://gankdat.com/account. | A shelf that opens itself: the directory lists after an automated policy scan; its users are exactly the agents already hitting our paywall | [CLAUDE-DIRECTORY.md](../../ventures/gankdat/docs/CLAUDE-DIRECTORY.md) |
| E2 | **Chrome Web Store, Highlight Keep** (2 min): https://chrome.google.com/webstore/devconsole → Highlight Keep (`pciignkojfpgmfcmjchmpdhonpjkfepc`) → Privacy tab → Privacy policy URL `https://apps.gankdat.com/privacy.html` → Save → Submit. | Last link keeping the repo public | [action 013](actions/013-repo-private.md) |
| E3 | **Chrome Web Store, ReadFocus** (same 2 min, same visit): ReadFocus (`dckbdaplggmhimpbekhdbaampglfhdgf`) → Privacy tab → same URL → Save → Submit. Then Claude flips the repo private. | Same | [action 013](actions/013-repo-private.md) |
| E4 | **Publish the free "Variables Playground" Figma Community file** (~10 min, Figma desktop, asked 2026-10-02): run the plugin's dev command "Build Community playground file", set the Cover as thumbnail, publish with the copy in `PLAYGROUND.md`, reply with the URL. | The second lever for a listing with 4 views in 13 days; free files are surfaced far more than paid plugins | [action 017](actions/017-figma-playground-file.md) |
| E5 | **Cloudflare usage, 2 min** (asked 2026-10-04): the 2026-10-01 budget alert says US$15 metered usage for 09-10..10-10 against the US$5 baseline. Open the [billable-usage page](https://dash.cloudflare.com/37e56f3ce4dfe49919e85d4380467f44/billing/billable-usage) and say which line carries it (D1 rows, KV, Analytics Engine, requests) and the figure. | STRATEGY §7's cost rule (> £10/month needs 3× revenue banked) — the queue item `cloudflare-usage-breakdown` cuts the driver once the line is known | `docs/reviews/2026-W40.md` §4 |

Both Chrome listings and both Firefox listings are **live** (found 2026-09-30; no approval mail ever arrived). ReadFocus and Highlight Keep 0.2.0 (web-PDF support) are built and waiting for Claude to upload once you say so — store uploads are on the ask-first list.

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
