# Project media for the Devpost form (image gallery, up to 15)

Fifteen 1280×720 PNGs in `media/`, numbered in upload order. 01 is the thumbnail. Frames 03–09 are
taken from the demo video (sandbox run of 2026-10-11, CI run 38171740523); 13–15 are live pages as
they were on 2026-10-16. Rendered by a one-off Playwright script in the interactive session.

| File | Caption to paste |
| --- | --- |
| 01-title.png | AI agents buy their own official-data credits with PayPal, in chat |
| 02-how-it-works.png | Five steps: quota hit → buy_credits → approve on PayPal → confirm_credit_purchase → next call paid from the pack |
| 03-agent-runs-out-of-credits.png | An agent on the free plan runs out of credits mid-task |
| 04-agent-creates-paypal-order.png | The agent creates a PayPal (sandbox) order itself and hands the human the approval link |
| 05-human-approves-on-paypal.png | The human approves on PayPal's own page; the agent never sees a card |
| 06-order-captured-credits-added.png | The agent confirms the order: +1,000 credits on the account's top-up balance |
| 07-next-call-paid-from-pack.png | The next data call is paid from the pack: X-Credits-Source: topup |
| 08-account-page-credit-packs.png | The same packs for humans on the account page |
| 09-same-flow-over-mcp.png | Over MCP the two tools do the same: the agent buys in chat |
| 10-whats-new.png | What was built during the hackathon (gankdat v0.24.0) |
| 11-safety-and-idempotency.png | Safe by construction: no payment credential on the agent, idempotent capture, unchanged hot path |
| 12-stack.png | Stack: PayPal Orders API v2, Cloudflare Workers + Hono, MCP, built with Claude Code |
| 13-live-landing.png | gankdat.com: official UK and EU registers as one API |
| 14-live-docs.png | The API docs |
| 15-live-stats-uk-sanctions.png | A live register page: UK sanctions designations |
