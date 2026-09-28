# Outstanding — everything that is waiting on you (2026-09-28)

One list, kept current by Claude. Newest facts win over older action files. Each item says
what it unblocks and roughly how long it takes. Nothing here spends money.

## A. Quick clicks (under 5 minutes each)

| # | Do this | Unblocks | Where |
| --- | --- | --- | --- |
| A1 | **Figma payout**: Figma → Settings → Community / Creator payouts → confirm Stripe is connected. | Getting paid for Variables Toolkit sales at all | [ALERTS 2026-09-22](../ALERTS.md) |
| A2 | **Search Console**: submit `https://gankdat.com/sitemap.xml` and check the stats pages index. | Search traffic to the 17 dataset pages — the only free buyer channel we have | queue `gankdat/search-console-stats-indexing` |
| A3 | **Chase Apify support** on the new-publisher limit (reply to the open ticket from your mailbox). | 16 priced actors going public on the Apify Store | queue `gankdat/apify-remaining-actors-public` |
| A4 | **Gmail "Send mail as" info@gankdat.com**: click the confirmation link (2026-09-19 email), or re-trigger from Gmail → Settings → Accounts and Import if it expired. | Sending outreach from the business address (B2) | [ALERTS 2026-09-28](../ALERTS.md) |

## B. Short tasks (15–30 minutes)

| # | Do this | Unblocks | Where |
| --- | --- | --- | --- |
| B1 | **Republish Variables Toolkit** from the Figma desktop app with the v2 name, tagline, description and tags in `ventures/variables-toolkit/LISTING.md` (bold headings with the B button, no asterisks). Day-7 read: 2 views, 0 installs; it ranks 8th for its own name. | Any chance of the plugin being found | [LISTING.md](../../ventures/variables-toolkit/LISTING.md) · [ALERTS 2026-09-28](../ALERTS.md) |
| B2 | **Send the ten B2B outreach drafts** in your Gmail (five bid consultancies, five web agencies; all limited companies, generic mailboxes). Two or three a day; note send dates in `OUTREACH-2026-09.md` §6; delete any you dislike. Depends on A4 if you want them from info@. | First direct demand test | [OUTREACH-2026-09.md](../../ventures/gankdat/docs/OUTREACH-2026-09.md) |
| B3 | **Launch posts** (optional): paste the Show HN, Product Hunt, r/datasets and Indie Hackers copy under your own name and answer comments for a few hours. | Referral traffic and backlinks | [LAUNCH-POST-KIT.md](../../ventures/gankdat/docs/LAUNCH-POST-KIT.md) |

## C. Hand-overs (keys and tokens — put them in `.env`, never in chat)

| # | Do this | Deadline | Unblocks | Where |
| --- | --- | --- | --- | --- |
| C1 | **SAM.gov API key rotation**: sign in at sam.gov → profile → Public API Key → copy the replacement key into `.env` as `SAM_API_KEY` and tell Claude. | **before 2026-10-10** | `sam-exclusions` keeps refreshing | [ALERTS 2026-09-25](../ALERTS.md) |
| C2 | **GitHub fine-grained PAT** for `giovf/rorororo` with Contents + Workflows write, saved as repo secret `WORKFLOW_TOKEN` (Settings → Secrets → Actions). | none | Routines can add or change workflows themselves (watchdog, future automations) | queue `foundry/workflow-scope` |

## D. Decisions only you can make

| # | Question | Default if you say nothing |
| --- | --- | --- |
| D1 | **Fable exhausted mid-week**: fall back to Opus for late-week build runs, or accept refused runs until Thursday 03:00 UTC? | Fable-only stays; refused slots are logged. |
| D2 | **Edge Add-ons account** for ReadFocus: Microsoft blocked sign-up on 2026-09-19. Retry, or drop Edge? | Dropped; Chrome + Firefox only. |
| D3 | **Limited company**: Datarade and AWS Data Exchange refuse sole traders. Form one now (~£50 + annual filings) or wait? | Wait until the data line passes £300 MRR (STRATEGY §8). |

## E. Waiting on third parties — nothing for you to do

- Chrome Web Store review: ReadFocus (submitted 19 Sep) and Highlight Keep (20 Sep).
- Firefox AMO review: both extensions (19 Sep).
- Apify publisher limit (after A3).
- ICO data-protection fee: deferred by you until the first real customer (action 012).
- Repo goes private once the store reviews are through (action 013) — Claude does this.

## Closed since the action files were written

Figma dev test (002), payments (003), Figma publish (004, live 21 Sep), Chrome submissions
(005, 007), Firefox account (006), support inbox (008), Google identity (009), gankdat items
(010), Apify account (014), Gmail spam filter (015), Telegram (016). Action 001's remaining
account (Edge) is now D2.

Older per-item write-ups stay in [actions/](actions/) for the steps; this page is the list.
