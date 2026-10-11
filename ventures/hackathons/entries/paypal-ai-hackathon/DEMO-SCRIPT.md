# Demo video — shot list (≤ 3 minutes)

Input for the `demo-video-pipeline` queue item (Playwright + ffmpeg on a GitHub runner; captions
from this script, no narration). Runs against https://gankdat.com with a sandbox buyer account.

| # | Seconds | Screen | Caption |
| --- | --- | --- | --- |
| 1 | 0–10 | gankdat.com landing, scroll to the MCP section | "gankdat: official UK/EU registers as one API and an MCP server for AI agents" |
| 2 | 10–30 | terminal: `node scripts/paypal-walkthrough.mjs pack_1k` step 1–2 output | "An agent on the free plan runs out of credits. It creates a PayPal order itself (sandbox)." |
| 3 | 30–60 | browser: the approval URL on sandbox.paypal.com, log in with the sandbox buyer, Pay Now | "The human approves on PayPal. The agent never sees a card." |
| 4 | 60–80 | terminal: step 3–4 output (capture, balance after) | "The agent captures the order: +1,000 credits on the account's top-up balance." |
| 5 | 80–100 | terminal: step 5 output, `X-Credits-Source: topup` header | "The next data call is paid from the pack — plan first, then top-up." |
| 6 | 100–140 | gankdat.com/account signed in: usage line "250 / 250 credits + 999 top-up", credit packs block | "Same packs for humans on the account page; PayPal returns the browser to a capture endpoint." |
| 7 | 140–170 | Claude (or MCP Inspector) tools list showing `buy_credits`, `confirm_credit_purchase`; one `buy_credits` call | "Over MCP the two tools do the same — the agent buys in chat." |
| 8 | 170–180 | repo: `src/billing/paypal.ts` and `test/paypal.spec.ts` | "Open source. Built with Claude Code. Sandbox only during the hackathon." |

Needs before recording: a sandbox buyer account (developer dashboard → Sandbox Accounts), a gankdat
key on a free account with its monthly usage at 250 (seed by calling any dataset 250 times, or ask
the interactive session to set KV `usage:<email>:<yyyymm>` to 250).
