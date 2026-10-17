# Open-source bounty board — 2026-10-17

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

Read 589 issues (4 listed on Opire), kept 9; dropped: under 20 stars 273, no amount found 132, sandbox or security repository 86, proposed, not funded 51, no push in 90 days 12, reads as a security finding 11, contest or usage task, not a fix 3, already rewarded 3, fork 3, needs a real device or the claimant's own recording 3, archived 2, the claimant must fund it or it pays to a wallet off GitHub 1.

| Amount | Rank | Repository | Issue | Age | Taken | Attempts |
| --- | --- | --- | --- | --- | --- | --- |
| $1000 | 93 | [tenstorrent/tt-metal](https://github.com/tenstorrent/tt-metal) (1712★, Python, Apache-2.0) | [#51655](https://github.com/tenstorrent/tt-metal/issues/51655) [Bounty $1,000] ttnn.typecast to uint16 rounds while every other integer destination and t | 78 d | assigned | 0 |
| $500 | 44 | [Arrow-air/project-quiver](https://github.com/Arrow-air/project-quiver) (567★, HTML, CERN-OHL-S-2.0) | [#256](https://github.com/Arrow-air/project-quiver/issues/256) T-09: Platform Engineering Report, the decision register from PT1 to the 2026 dev kit | 38 d | 1 PR open | 0 |
| $60 | 0 | [lablab-ai/community-content](https://github.com/lablab-ai/community-content) (69★, MDX, no licence) | [#462](https://github.com/lablab-ai/community-content/issues/462) Crafting a Comprehensive Tutorial for Vectara Chat | 935 d | 5 PRs open | 11 |
| $50 | 0 | [arakoodev/EdgeChains](https://github.com/arakoodev/EdgeChains) (429★, JavaScript, AGPL-3.0) | [#290](https://github.com/arakoodev/EdgeChains/issues/290) BOUNTY: integrate AWS Comprehend as a utility to redact data | 1049 d | 56 PRs open | 49 |
| $30 | 0 | [arakoodev/EdgeChains](https://github.com/arakoodev/EdgeChains) (429★, JavaScript, AGPL-3.0) | [#273](https://github.com/arakoodev/EdgeChains/issues/273) BOUNTY: add support for qdrant vector database in javascript sdk | 1056 d | 85 PRs open | 54 |
| $25 | 0 | [arakoodev/EdgeChains](https://github.com/arakoodev/EdgeChains) (429★, JavaScript, AGPL-3.0) | [#279](https://github.com/arakoodev/EdgeChains/issues/279) BOUNTY: add support for Google Palm2 API in javascript/typescript | 1052 d | 32 PRs open | 25 |
| $20 | 0 | [highlight/highlight](https://github.com/highlight/highlight) (9380★, TypeScript, no licence) | [#8032](https://github.com/highlight/highlight/issues/8032) document sveltekit backend instrumentation | 946 d | 47 PRs open | 48 |
| $3 | 0 | [tscircuit/pcb-viewer](https://github.com/tscircuit/pcb-viewer) (22★, TypeScript, MIT) | [#163](https://github.com/tscircuit/pcb-viewer/issues/163) Remove `disableAutoFocus` in favor of `focusOnHover={false}` | 609 d | 47 PRs open | 56 |
| $1 | 0 | [SalamLang/Salam](https://github.com/SalamLang/Salam) (58★, TeX, GPL-3.0) | [#1716](https://github.com/SalamLang/Salam/issues/1716) 🎃 Hacktoberfest 2026: Contribute to Salam and earn via GitHub Sponsors | 21 d | free | 0 |
