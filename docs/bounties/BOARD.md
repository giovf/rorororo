# Open-source bounty board — 2026-10-15

Written daily by `scripts/bounty-scanner.ts` (`.github/workflows/bounty-board.yml`) from GitHub's search API:
open issues that received a `/bounty $N` command in the last 90 days or carry a bounty label, plus the issues
of repositories where OpireBot is installed (its footer on every issue) whose code owner posted a `/reward N`. Feature and
bug-fix work only: sandbox and security repositories and issues that read as security findings are dropped by
rule, and so are contests, showcases and usage tasks that pay for something other than a change to the repository,
results the claimant must record on a real device, claims the maintainer hands out first, and fixes that need hardware.
Only money a maintainer, the bounty bot or a label posted counts; a contributor's "bounty proposal" is dropped, and so
is a `/reward` from anyone but a code owner (Opire ignores it). Algora holds the money it lists; Opire does not — the
creator arranges payment after the merge, if the PR meets the issue — so an Opire row reads `not escrowed` under Taken.
Rank = amount × language fit ÷ (1 + age in months) ÷ (1 + open PRs + assigned). Taken says what stands between a new
claim and the money; the top 3 free ones at $25 or more become `oss-bounties` queue items.

Read 600 issues (4 listed on Opire), kept 10; dropped: under 20 stars 295, sandbox or security repository 105, no amount found 78, contest or usage task, not a fix 46, proposed, not funded 34, reads as a security finding 12, no push in 90 days 10, already rewarded 5, fork 3, archived 2.

| Amount | Rank | Repository | Issue | Age | Taken | Attempts |
| --- | --- | --- | --- | --- | --- | --- |
| $1000 | 78 | [tenstorrent/tt-metal](https://github.com/tenstorrent/tt-metal) (1705★, Python, Apache-2.0) | [#58986](https://github.com/tenstorrent/tt-metal/issues/58986) [Bounty $1,000] FP32 ttnn.cumsum returns NaN after infinity or overflow | 13 d | assigned | 1 |
| $250 | 5 | [onyx-dot-app/onyx](https://github.com/onyx-dot-app/onyx) (32471★, Python, no licence) | [#2281](https://github.com/onyx-dot-app/onyx/issues/2281) Jira Service Management Connector | 776 d | 1 PR open | 48 |
| $30 | 1 | [trovu/trovu](https://github.com/trovu/trovu) (77★, TypeScript, AGPL-3.0) | [#329](https://github.com/trovu/trovu/issues/329) Open target URLs not in PWA but in default browser | 942 d | free, not escrowed | 63 |
| $60 | 0 | [lablab-ai/community-content](https://github.com/lablab-ai/community-content) (69★, MDX, no licence) | [#462](https://github.com/lablab-ai/community-content/issues/462) Crafting a Comprehensive Tutorial for Vectara Chat | 933 d | 5 PRs open | 11 |
| $50 | 0 | [arakoodev/EdgeChains](https://github.com/arakoodev/EdgeChains) (429★, JavaScript, AGPL-3.0) | [#290](https://github.com/arakoodev/EdgeChains/issues/290) BOUNTY: integrate AWS Comprehend as a utility to redact data | 1047 d | 9 PRs open | 48 |
| $30 | 0 | [arakoodev/EdgeChains](https://github.com/arakoodev/EdgeChains) (429★, JavaScript, AGPL-3.0) | [#273](https://github.com/arakoodev/EdgeChains/issues/273) BOUNTY: add support for qdrant vector database in javascript sdk | 1054 d | 14 PRs open | 53 |
| $25 | 0 | [arakoodev/EdgeChains](https://github.com/arakoodev/EdgeChains) (429★, JavaScript, AGPL-3.0) | [#279](https://github.com/arakoodev/EdgeChains/issues/279) BOUNTY: add support for Google Palm2 API in javascript/typescript | 1050 d | 6 PRs open | 25 |
| $20 | 0 | [highlight/highlight](https://github.com/highlight/highlight) (9378★, TypeScript, no licence) | [#8032](https://github.com/highlight/highlight/issues/8032) document sveltekit backend instrumentation | 944 d | 10 PRs open | 47 |
| $3 | 0 | [tscircuit/pcb-viewer](https://github.com/tscircuit/pcb-viewer) (22★, TypeScript, MIT) | [#163](https://github.com/tscircuit/pcb-viewer/issues/163) Remove `disableAutoFocus` in favor of `focusOnHover={false}` | 607 d | 13 PRs open | 56 |
| $1 | 0 | [SalamLang/Salam](https://github.com/SalamLang/Salam) (55★, TeX, GPL-3.0) | [#1716](https://github.com/SalamLang/Salam/issues/1716) 🎃 Hacktoberfest 2026: Contribute to Salam and earn via GitHub Sponsors | 19 d | free | 0 |
