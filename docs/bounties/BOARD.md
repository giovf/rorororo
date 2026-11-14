# Open-source bounty board — 2026-11-14

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

Read 584 issues (3 listed on Opire), kept 10; dropped: no amount found 225, under 20 stars 211, sandbox or security repository 65, proposed, not funded 18, the claimant must fund it or it pays to a wallet off GitHub 11, no push in 90 days 11, reads as a security finding 10, fork 10, already rewarded 8, contest or usage task, not a fix 2, archived 2, needs hardware the sandbox lacks 1.

| Amount | Rank | Repository | Issue | Age | Taken | Attempts |
| --- | --- | --- | --- | --- | --- | --- |
| $3000 | 313 | [tenstorrent/tt-metal](https://github.com/tenstorrent/tt-metal) (127★, Python, Apache-2.0) | [#62681](https://github.com/tenstorrent/tt-metal/issues/62681) [Bounty $3000] Static checker for compute-kernel API ordering rules (init / uninit / recon | 18 d | assigned | 0 |
| $2000 | 313 | [tenstorrent/tt-metal](https://github.com/tenstorrent/tt-metal) (127★, Python, Apache-2.0) | [#65437](https://github.com/tenstorrent/tt-metal/issues/65437) [Bounty $2,000] Restore OpenVLA execution and action correctness | 2 d | assigned | 0 |
| $300 | 1 | [go-gitea/gitea](https://github.com/go-gitea/gitea) (59084★, Go, MIT) | [#4898](https://github.com/go-gitea/gitea/issues/4898) Add inline comments on commits | 2988 d | 1 PR open | 15 |
| $250 | 0 | [onyx-dot-app/onyx](https://github.com/onyx-dot-app/onyx) (33395★, Python, no licence) | [#2281](https://github.com/onyx-dot-app/onyx/issues/2281) Jira Service Management Connector | 806 d | 50 PRs open | 116 |
| $60 | 0 | [lablab-ai/community-content](https://github.com/lablab-ai/community-content) (69★, MDX, no licence) | [#462](https://github.com/lablab-ai/community-content/issues/462) Crafting a Comprehensive Tutorial for Vectara Chat | 963 d | 18 PRs open | 22 |
| $50 | 0 | [arakoodev/EdgeChains](https://github.com/arakoodev/EdgeChains) (434★, JavaScript, AGPL-3.0) | [#290](https://github.com/arakoodev/EdgeChains/issues/290) BOUNTY: integrate AWS Comprehend as a utility to redact data | 1077 d | 98 PRs open | 78 |
| $30 | 0 | [arakoodev/EdgeChains](https://github.com/arakoodev/EdgeChains) (434★, JavaScript, AGPL-3.0) | [#273](https://github.com/arakoodev/EdgeChains/issues/273) BOUNTY: add support for qdrant vector database in javascript sdk | 1084 d | 119 PRs open | 83 |
| $25 | 0 | [arakoodev/EdgeChains](https://github.com/arakoodev/EdgeChains) (434★, JavaScript, AGPL-3.0) | [#279](https://github.com/arakoodev/EdgeChains/issues/279) BOUNTY: add support for Google Palm2 API in javascript/typescript | 1080 d | 59 PRs open | 42 |
| $20 | 0 | [highlight/highlight](https://github.com/highlight/highlight) (9390★, TypeScript, no licence) | [#8032](https://github.com/highlight/highlight/issues/8032) document sveltekit backend instrumentation | 974 d | 78 PRs open | 76 |
| $3 | 0 | [tscircuit/pcb-viewer](https://github.com/tscircuit/pcb-viewer) (22★, TypeScript, MIT) | [#163](https://github.com/tscircuit/pcb-viewer/issues/163) Remove `disableAutoFocus` in favor of `focusOnHover={false}` | 637 d | 59 PRs open | 64 |
