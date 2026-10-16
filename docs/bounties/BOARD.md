# Open-source bounty board — 2026-10-16

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

Read 593 issues (4 listed on Opire), kept 9; dropped: under 20 stars 326, no amount found 102, sandbox or security repository 98, proposed, not funded 14, reads as a security finding 13, contest or usage task, not a fix 12, no push in 90 days 12, fork 3, archived 2, already rewarded 1, needs a real device or the claimant's own recording 1.

| Amount | Rank | Repository | Issue | Age | Taken | Attempts |
| --- | --- | --- | --- | --- | --- | --- |
| $30 | 29 | [verdikta/verdikta-applications](https://github.com/verdikta/verdikta-applications) (32★, JavaScript, MIT) | [#76](https://github.com/verdikta/verdikta-applications/issues/76) [BOUNTY ~$30 x4] Post and fund a real task on Verdikta, publish a write-up (paid on Poidh, | 1 d | free | 0 |
| $250 | 0 | [onyx-dot-app/onyx](https://github.com/onyx-dot-app/onyx) (32510★, Python, no licence) | [#2281](https://github.com/onyx-dot-app/onyx/issues/2281) Jira Service Management Connector | 777 d | 45 PRs open | 86 |
| $60 | 0 | [lablab-ai/community-content](https://github.com/lablab-ai/community-content) (69★, MDX, no licence) | [#462](https://github.com/lablab-ai/community-content/issues/462) Crafting a Comprehensive Tutorial for Vectara Chat | 934 d | 5 PRs open | 11 |
| $50 | 0 | [arakoodev/EdgeChains](https://github.com/arakoodev/EdgeChains) (429★, JavaScript, AGPL-3.0) | [#290](https://github.com/arakoodev/EdgeChains/issues/290) BOUNTY: integrate AWS Comprehend as a utility to redact data | 1048 d | 56 PRs open | 48 |
| $30 | 0 | [arakoodev/EdgeChains](https://github.com/arakoodev/EdgeChains) (429★, JavaScript, AGPL-3.0) | [#273](https://github.com/arakoodev/EdgeChains/issues/273) BOUNTY: add support for qdrant vector database in javascript sdk | 1055 d | 84 PRs open | 53 |
| $25 | 0 | [arakoodev/EdgeChains](https://github.com/arakoodev/EdgeChains) (429★, JavaScript, AGPL-3.0) | [#279](https://github.com/arakoodev/EdgeChains/issues/279) BOUNTY: add support for Google Palm2 API in javascript/typescript | 1051 d | 32 PRs open | 25 |
| $20 | 0 | [highlight/highlight](https://github.com/highlight/highlight) (9381★, TypeScript, no licence) | [#8032](https://github.com/highlight/highlight/issues/8032) document sveltekit backend instrumentation | 945 d | 47 PRs open | 47 |
| $3 | 0 | [tscircuit/pcb-viewer](https://github.com/tscircuit/pcb-viewer) (22★, TypeScript, MIT) | [#163](https://github.com/tscircuit/pcb-viewer/issues/163) Remove `disableAutoFocus` in favor of `focusOnHover={false}` | 608 d | 47 PRs open | 56 |
| $1 | 0 | [SalamLang/Salam](https://github.com/SalamLang/Salam) (58★, TeX, GPL-3.0) | [#1716](https://github.com/SalamLang/Salam/issues/1716) 🎃 Hacktoberfest 2026: Contribute to Salam and earn via GitHub Sponsors | 20 d | free | 0 |
