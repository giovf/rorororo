# Demo video — shot list (≤ 3 minutes)

Input for `scripts/demo-meta-global-ai-hackathon.ts`, run by the `demo video` workflow (entry
`meta-global-ai-hackathon`) on the demo-video pipeline (Playwright + ffmpeg, captions from this
table, no narration). Live mode drives the public page https://apps.gankdat.com/diligence, which
holds the model key itself (the landing Worker's `DILIGENCE_API_KEY`, set by CI from the
`META_MODEL_API_KEY` repository secret — action 032), so the recording needs no secret of its own;
`DEMO_COMPANY` (workflow input `company`) is the company checked, `Tesco Stores Limited` by
default — a large, long-established company whose public records are plentiful and dull, so the
report is about what the registers hold rather than about anyone's reputation. `DEMO_DRY_RUN=1`
records the same shots from fixtures with every frame marked DRY RUN. The recorded page's events
are written beside the mp4 as `transcript.md` (the live walkthrough the submission quotes).

| # | Seconds | Screen | Caption |
| --- | --- | --- | --- |
| 1 | 0–8 | gankdat.com landing, scroll to the MCP section | "gankdat: seven official UK registers as one API and an MCP server for AI agents" |
| 2 | 8–18 | apps.gankdat.com/diligence: the company name typed, Run the check clicked | "Type a UK company name. Muse Spark on Meta Model API takes the case." |
| 3 | 18–53 | the register steps appearing one by one under the status line | "It reads Companies House, sanctions, insolvency, sponsors and contract awards — live, over MCP." |
| 4 | 53–93 | the report: Identity, Red flags, Public money, Verdict, Sources; scrolled to the end | "One page: Identity, Red flags, Public money, Verdict. Every line names the register it came from." |
| 5 | 93–108 | the meter line: model calls n/40, tokens n/300000, seconds | "A few model calls, a few cents. A spend guard stops any run past 40 calls or 300k tokens." |
| 6 | 108–133 | terminal: `meta-diligence-agent "<company>"` telling the same story from the page's events | "The same loop from a terminal — any endpoint serving Meta's models, chosen by configuration." |
| 7 | 133–148 | repo: `packages/landing/src/diligence-core.ts` on GitHub | "Open source. Built with Claude Code inside the hackathon window on an agent that only had fixtures." |

Shots 3 and 4 hold until the page shows the first register step and the report (up to 150 s each
in live mode); the planned total with the recorder's overhead is 158.5 s.
