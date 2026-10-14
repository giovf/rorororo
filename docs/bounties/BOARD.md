# Open-source bounty board — 2026-10-14

Written daily by `scripts/bounty-scanner.ts` (`.github/workflows/bounty-board.yml`) from GitHub's search API:
open issues that received a `/bounty $N` command in the last 90 days or carry a bounty label. Feature and
bug-fix work only: sandbox and security repositories and issues that read as security findings are dropped by
rule, and so are contests, showcases and usage tasks that pay for something other than a change to the repository,
results the claimant must record on a real device, claims the maintainer hands out first, and fixes that need hardware.
Only money a maintainer, the bounty bot or a label posted counts; a contributor's "bounty proposal" is dropped.
Rank = amount × language fit ÷ (1 + age in months) ÷ (1 + open PRs + assigned). Taken says what stands between a new
claim and the money; the top 3 free ones at $25 or more become `oss-bounties` queue items.

Read 498 issues, kept 8; dropped: under 20 stars 245, sandbox or security repository 106, contest or usage task, not a fix 49, proposed, not funded 38, no amount found 20, reads as a security finding 9, no push in 90 days 9, already rewarded 7, fork 5, archived 2.

| Amount | Rank | Repository | Issue | Age | Taken | Attempts |
| --- | --- | --- | --- | --- | --- | --- |
| $250 | 5 | [onyx-dot-app/onyx](https://github.com/onyx-dot-app/onyx) (32447★, Python, no licence) | [#2281](https://github.com/onyx-dot-app/onyx/issues/2281) Jira Service Management Connector | 775 d | 1 PR open | 48 |
| $60 | 0 | [lablab-ai/community-content](https://github.com/lablab-ai/community-content) (69★, MDX, no licence) | [#462](https://github.com/lablab-ai/community-content/issues/462) Crafting a Comprehensive Tutorial for Vectara Chat | 932 d | 5 PRs open | 11 |
| $50 | 0 | [arakoodev/EdgeChains](https://github.com/arakoodev/EdgeChains) (429★, JavaScript, AGPL-3.0) | [#290](https://github.com/arakoodev/EdgeChains/issues/290) BOUNTY: integrate AWS Comprehend as a utility to redact data | 1046 d | 9 PRs open | 48 |
| $30 | 0 | [arakoodev/EdgeChains](https://github.com/arakoodev/EdgeChains) (429★, JavaScript, AGPL-3.0) | [#273](https://github.com/arakoodev/EdgeChains/issues/273) BOUNTY: add support for qdrant vector database in javascript sdk | 1053 d | 14 PRs open | 53 |
| $25 | 0 | [arakoodev/EdgeChains](https://github.com/arakoodev/EdgeChains) (429★, JavaScript, AGPL-3.0) | [#279](https://github.com/arakoodev/EdgeChains/issues/279) BOUNTY: add support for Google Palm2 API in javascript/typescript | 1049 d | 6 PRs open | 25 |
| $20 | 0 | [highlight/highlight](https://github.com/highlight/highlight) (9380★, TypeScript, no licence) | [#8032](https://github.com/highlight/highlight/issues/8032) document sveltekit backend instrumentation | 943 d | 10 PRs open | 47 |
| $3 | 0 | [tscircuit/pcb-viewer](https://github.com/tscircuit/pcb-viewer) (22★, TypeScript, MIT) | [#163](https://github.com/tscircuit/pcb-viewer/issues/163) Remove `disableAutoFocus` in favor of `focusOnHover={false}` | 606 d | 13 PRs open | 56 |
| $1 | 0 | [SalamLang/Salam](https://github.com/SalamLang/Salam) (54★, TeX, GPL-3.0) | [#1716](https://github.com/SalamLang/Salam/issues/1716) 🎃 Hacktoberfest 2026: Contribute to Salam and earn via GitHub Sponsors | 18 d | free | 0 |
