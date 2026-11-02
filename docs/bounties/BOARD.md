# Open-source bounty board — 2026-11-02

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

Read 595 issues (3 listed on Opire), kept 10; dropped: under 20 stars 264, no amount found 168, sandbox or security repository 69, proposed, not funded 18, the claimant must fund it or it pays to a wallet off GitHub 16, no push in 90 days 13, reads as a security finding 11, contest or usage task, not a fix 10, fork 10, already rewarded 3, archived 2, needs hardware the sandbox lacks 1.

| Amount | Rank | Repository | Issue | Age | Taken | Attempts |
| --- | --- | --- | --- | --- | --- | --- |
| $3000 | 833 | [tenstorrent/tt-metal](https://github.com/tenstorrent/tt-metal) (1739★, Python, Apache-2.0) | [#62681](https://github.com/tenstorrent/tt-metal/issues/62681) [Bounty $3000] Static checker for compute-kernel API ordering rules (init / uninit / recon | 6 d | 2 PRs open | 0 |
| $1000 | 732 | [dev-kp-eloper/BountyScout](https://github.com/dev-kp-eloper/BountyScout) (29★, Python, no licence) | [#1636](https://github.com/dev-kp-eloper/BountyScout/issues/1636) 🎯 Bounty Alert: 11 New Opportunityies found | 11 d | free | 0 |
| $300 | 1 | [go-gitea/gitea](https://github.com/go-gitea/gitea) (58825★, Go, MIT) | [#4898](https://github.com/go-gitea/gitea/issues/4898) Add inline comments on commits | 2976 d | 1 PR open | 15 |
| $250 | 0 | [onyx-dot-app/onyx](https://github.com/onyx-dot-app/onyx) (33167★, Python, no licence) | [#2281](https://github.com/onyx-dot-app/onyx/issues/2281) Jira Service Management Connector | 794 d | 51 PRs open | 98 |
| $60 | 0 | [lablab-ai/community-content](https://github.com/lablab-ai/community-content) (69★, MDX, no licence) | [#462](https://github.com/lablab-ai/community-content/issues/462) Crafting a Comprehensive Tutorial for Vectara Chat | 951 d | 11 PRs open | 16 |
| $50 | 0 | [arakoodev/EdgeChains](https://github.com/arakoodev/EdgeChains) (433★, JavaScript, AGPL-3.0) | [#290](https://github.com/arakoodev/EdgeChains/issues/290) BOUNTY: integrate AWS Comprehend as a utility to redact data | 1065 d | 82 PRs open | 63 |
| $30 | 0 | [arakoodev/EdgeChains](https://github.com/arakoodev/EdgeChains) (433★, JavaScript, AGPL-3.0) | [#273](https://github.com/arakoodev/EdgeChains/issues/273) BOUNTY: add support for qdrant vector database in javascript sdk | 1072 d | 109 PRs open | 72 |
| $25 | 0 | [arakoodev/EdgeChains](https://github.com/arakoodev/EdgeChains) (433★, JavaScript, AGPL-3.0) | [#279](https://github.com/arakoodev/EdgeChains/issues/279) BOUNTY: add support for Google Palm2 API in javascript/typescript | 1068 d | 43 PRs open | 34 |
| $20 | 0 | [highlight/highlight](https://github.com/highlight/highlight) (9385★, TypeScript, no licence) | [#8032](https://github.com/highlight/highlight/issues/8032) document sveltekit backend instrumentation | 962 d | 62 PRs open | 64 |
| $3 | 0 | [tscircuit/pcb-viewer](https://github.com/tscircuit/pcb-viewer) (22★, TypeScript, MIT) | [#163](https://github.com/tscircuit/pcb-viewer/issues/163) Remove `disableAutoFocus` in favor of `focusOnHover={false}` | 625 d | 53 PRs open | 60 |
