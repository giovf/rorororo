# Open-source bounty board — 2026-11-23

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

Read 699 issues (3 listed on Opire), kept 9; dropped: under 20 stars 320, no amount found 166, sandbox or security repository 122, proposed, not funded 25, fork 16, no push in 90 days 13, reads as a security finding 10, contest or usage task, not a fix 7, already rewarded 6, archived 2, needs hardware the sandbox lacks 1, needs a real device or the claimant's own recording 1, the claimant must fund it or it pays to a wallet off GitHub 1.

| Amount | Rank | Repository | Issue | Age | Taken | Attempts |
| --- | --- | --- | --- | --- | --- | --- |
| $300 | 1 | [go-gitea/gitea](https://github.com/go-gitea/gitea) (59224★, Go, MIT) | [#4898](https://github.com/go-gitea/gitea/issues/4898) Add inline comments on commits | 2997 d | 1 PR open | 15 |
| $5 | 1 | [paraspell/xcm-tools](https://github.com/paraspell/xcm-tools) (66★, TypeScript, MIT) | [#2461](https://github.com/paraspell/xcm-tools/issues/2461) [Bug bounty] DuplicateAssetError guard bypass in findEthMatch allows ambiguous symbol to s | 15 d | assigned | 0 |
| $250 | 0 | [onyx-dot-app/onyx](https://github.com/onyx-dot-app/onyx) (33514★, Python, no licence) | [#2281](https://github.com/onyx-dot-app/onyx/issues/2281) Jira Service Management Connector | 815 d | 52 PRs open | 120 |
| $60 | 0 | [lablab-ai/community-content](https://github.com/lablab-ai/community-content) (69★, MDX, no licence) | [#462](https://github.com/lablab-ai/community-content/issues/462) Crafting a Comprehensive Tutorial for Vectara Chat | 972 d | 18 PRs open | 24 |
| $50 | 0 | [arakoodev/EdgeChains](https://github.com/arakoodev/EdgeChains) (434★, JavaScript, AGPL-3.0) | [#290](https://github.com/arakoodev/EdgeChains/issues/290) BOUNTY: integrate AWS Comprehend as a utility to redact data | 1086 d | 99 PRs open | 79 |
| $30 | 0 | [arakoodev/EdgeChains](https://github.com/arakoodev/EdgeChains) (434★, JavaScript, AGPL-3.0) | [#273](https://github.com/arakoodev/EdgeChains/issues/273) BOUNTY: add support for qdrant vector database in javascript sdk | 1093 d | 120 PRs open | 83 |
| $25 | 0 | [arakoodev/EdgeChains](https://github.com/arakoodev/EdgeChains) (434★, JavaScript, AGPL-3.0) | [#279](https://github.com/arakoodev/EdgeChains/issues/279) BOUNTY: add support for Google Palm2 API in javascript/typescript | 1089 d | 58 PRs open | 42 |
| $20 | 0 | [highlight/highlight](https://github.com/highlight/highlight) (9393★, TypeScript, no licence) | [#8032](https://github.com/highlight/highlight/issues/8032) document sveltekit backend instrumentation | 983 d | 79 PRs open | 77 |
| $3 | 0 | [tscircuit/pcb-viewer](https://github.com/tscircuit/pcb-viewer) (22★, TypeScript, MIT) | [#163](https://github.com/tscircuit/pcb-viewer/issues/163) Remove `disableAutoFocus` in favor of `focusOnHover={false}` | 646 d | 59 PRs open | 64 |
