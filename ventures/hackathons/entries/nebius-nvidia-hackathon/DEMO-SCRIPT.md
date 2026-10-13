# Demo video — shot list (≤ 3 minutes)

Input for `scripts/demo-nebius-nvidia-hackathon.ts` (part 2, `nebius-nvidia-hackathon-submit`), run by
the `demo video` workflow on the demo-video pipeline (Playwright + ffmpeg, captions from this table,
no narration). Live mode needs `NEBIUS_API_KEY` as a repository secret (action 025); `DEMO_DRY_RUN=1`
records the same shots from the dry-run transcript with every frame marked DRY RUN.

| # | Seconds | Screen | Caption |
| --- | --- | --- | --- |
| 1 | 0–10 | gankdat.com landing, scroll to the MCP section | "gankdat: seven UK registers as one API and an MCP server for AI agents" |
| 2 | 10–25 | terminal: `nebius-diligence-agent "Acme Widgets Ltd"` starting, model line showing `nvidia/Nemotron-3_5-Lightning` on Token Factory | "An open NVIDIA model on Nebius Token Factory takes the case." |
| 3 | 25–60 | terminal: the `→ query_uk_…` lines appearing one by one | "It reads Companies House, sanctions, insolvency, sponsors and contract awards through MCP." |
| 4 | 60–110 | terminal: the report scrolling — Identity, Red flags, Public money, Verdict | "One page, every line cites the register that returned it. Nothing invented." |
| 5 | 110–130 | terminal: the `model calls 2/40, tokens …/300000` line | "Two model calls, a fraction of a cent. The guard stops any run past 40 calls." |
| 6 | 130–155 | Claude (or MCP Inspector) tools list on gankdat.com/mcp showing the same `query_*` tools | "Same tools for Claude, Cursor and ChatGPT — the agent is a thin loop over them." |
| 7 | 155–175 | repo: `scripts/nebius-diligence-agent.ts` and its tests | "Open source. Built with Claude Code. Runs on Nemotron via Nebius only." |
