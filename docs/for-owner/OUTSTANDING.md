# Outstanding — everything that is waiting on you (updated 2026-09-28 evening)

One list, kept current by Claude. Each item says what it unblocks and roughly how long it takes.
Nothing here spends money. Your answers of 2026-09-28 are applied below.

## Open

| # | Do this | Unblocks | Where |
| --- | --- | --- | --- |
| C2 | **GitHub token for the workflow installer** (~5 min, runthrough below). | Routines can add or change CI workflows themselves instead of waiting days for the interactive session | queue `foundry/workflow-scope` |

**C2 runthrough**

1. GitHub → your avatar (top right) → **Settings** → left menu bottom **Developer settings** → **Personal access tokens** → **Fine-grained tokens** → **Generate new token**.
2. Token name `foundry-workflow-installer`; expiration 1 year (GitHub will email you before it lapses; Claude will re-queue it).
3. **Repository access**: "Only select repositories" → tick `giovf/rorororo`.
4. **Permissions → Repository permissions**: set **Contents** to *Read and write* and **Workflows** to *Read and write* (Metadata becomes read-only automatically). Nothing else.
5. Generate, copy the token once.
6. Repo page `github.com/giovf/rorororo` → **Settings** → **Secrets and variables** → **Actions** → **New repository secret** → Name `WORKFLOW_TOKEN`, paste, Add.
7. Tell Claude "WORKFLOW_TOKEN added" (Telegram note or here). Do not paste the token anywhere else.

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
| A3 Apify publishing | Support's reply explains it: **5 Actor publications per organisation per 24 h**, not a new-publisher ban. Claude changed the publish job to make ≤ 5 actors public per run and to run daily at 04:00 UTC, so the remaining 16 go public over ~3 days without an exception. No reply to support needed unless it stalls; Claude watches it. |
| A4 Gmail send-as | Done by you. |
| B1 Figma relisting | Done by you. |
| B2 Outreach drafts | Sent by you; Claude tracks replies in `OUTREACH-2026-09.md`. |
| C1 SAM.gov key | **False alarm, sorry**: `sam-exclusions` has read the keyless public extract since 2026-09-20, so the individual API key is unused. Whatever you added is harmless; future SAM key emails can be ignored. |

## Waiting on third parties — nothing for you

- Chrome Web Store review: ReadFocus (19 Sep) and Highlight Keep (20 Sep).
- Firefox AMO review: both extensions (19 Sep).
- Apify: actors going public in daily batches of five.
- ICO data-protection fee: deferred by you until the first real customer (action 012).
- Repo goes private once the store reviews are through (action 013) — Claude does this.

Older per-item write-ups stay in [actions/](actions/) for the steps; this page is the list.
