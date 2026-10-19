# Open-source bounty board — 2026-10-19

Written daily by `scripts/bounty-scanner.ts` (`.github/workflows/bounty-board.yml`) from GitHub's search API:
open issues that received a `/bounty $N` command in the last 90 days or carry a bounty label, plus the issues
of repositories where OpireBot is installed (its footer on every issue) whose code owner posted a `/reward N`. Feature and
bug-fix work only: sandbox and security repositories and issues that read as security findings are dropped by
rule, and so are contests, showcases and usage tasks that pay for something other than a change to the repository,
results the claimant must record on a real device, claims the maintainer hands out first, fixes that need hardware, and
tasks the claimant must fund or that pay to a wallet off GitHub.
Only money a maintainer, the bounty bot or a label posted counts; a contributor's "bounty proposal" is dropped, and so
is a `/reward` from anyone but a code owner (Opire ignores it). Algora holds the money it lists; Opire does not — the
creator arranges payment after the merge, if the PR meets the issue — so an Opire row reads `not escrowed` under Taken.
Rank = amount × language fit ÷ (1 + age in months) ÷ (1 + open PRs + assigned). Taken says what stands between a new
claim and the money; the top 3 free ones at $25 or more become `oss-bounties` queue items.

Read 595 issues (4 listed on Opire), kept 10; dropped: under 20 stars 256, no amount found 135, sandbox or security repository 81, proposed, not funded 45, the claimant must fund it or it pays to a wallet off GitHub 16, reads as a security finding 15, contest or usage task, not a fix 11, no push in 90 days 11, fork 8, needs a real device or the claimant's own recording 4, archived 2, needs hardware the sandbox lacks 1.

| Amount | Rank | Repository | Issue | Age | Taken | Attempts |
| --- | --- | --- | --- | --- | --- | --- |
| $102367 | 26026 | [asyncapi/community](https://github.com/asyncapi/community) (140★, JavaScript, CC-BY-4.0) | [#3633](https://github.com/asyncapi/community/issues/3633) Budget 2027 \| Planning and discussion | 29 d | assigned | 0 |
| $1000 | 91 | [tenstorrent/tt-metal](https://github.com/tenstorrent/tt-metal) (1715★, Python, Apache-2.0) | [#51655](https://github.com/tenstorrent/tt-metal/issues/51655) [Bounty $1,000] ttnn.typecast to uint16 rounds while every other integer destination and t | 80 d | assigned | 0 |
| $1000 | 71 | [tenstorrent/tt-metal](https://github.com/tenstorrent/tt-metal) (1715★, Python, Apache-2.0) | [#58986](https://github.com/tenstorrent/tt-metal/issues/58986) [Bounty $1,000] FP32 ttnn.cumsum returns NaN after infinity or overflow | 17 d | assigned | 1 |
| $250 | 0 | [onyx-dot-app/onyx](https://github.com/onyx-dot-app/onyx) (32577★, Python, no licence) | [#2281](https://github.com/onyx-dot-app/onyx/issues/2281) Jira Service Management Connector | 780 d | 45 PRs open | 87 |
| $60 | 0 | [lablab-ai/community-content](https://github.com/lablab-ai/community-content) (69★, MDX, no licence) | [#462](https://github.com/lablab-ai/community-content/issues/462) Crafting a Comprehensive Tutorial for Vectara Chat | 937 d | 5 PRs open | 11 |
| $50 | 0 | [arakoodev/EdgeChains](https://github.com/arakoodev/EdgeChains) (429★, JavaScript, AGPL-3.0) | [#290](https://github.com/arakoodev/EdgeChains/issues/290) BOUNTY: integrate AWS Comprehend as a utility to redact data | 1051 d | 58 PRs open | 49 |
| $30 | 0 | [arakoodev/EdgeChains](https://github.com/arakoodev/EdgeChains) (429★, JavaScript, AGPL-3.0) | [#273](https://github.com/arakoodev/EdgeChains/issues/273) BOUNTY: add support for qdrant vector database in javascript sdk | 1058 d | 85 PRs open | 54 |
| $25 | 0 | [arakoodev/EdgeChains](https://github.com/arakoodev/EdgeChains) (429★, JavaScript, AGPL-3.0) | [#279](https://github.com/arakoodev/EdgeChains/issues/279) BOUNTY: add support for Google Palm2 API in javascript/typescript | 1054 d | 32 PRs open | 25 |
| $20 | 0 | [highlight/highlight](https://github.com/highlight/highlight) (9382★, TypeScript, no licence) | [#8032](https://github.com/highlight/highlight/issues/8032) document sveltekit backend instrumentation | 948 d | 47 PRs open | 48 |
| $3 | 0 | [tscircuit/pcb-viewer](https://github.com/tscircuit/pcb-viewer) (22★, TypeScript, MIT) | [#163](https://github.com/tscircuit/pcb-viewer/issues/163) Remove `disableAutoFocus` in favor of `focusOnHover={false}` | 611 d | 47 PRs open | 56 |
