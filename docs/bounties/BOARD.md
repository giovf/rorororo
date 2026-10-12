# Open-source bounty board — 2026-10-12

Written daily by `scripts/bounty-scanner.ts` (`.github/workflows/bounty-board.yml`) from GitHub's search API:
open issues that received a `/bounty $N` command in the last 90 days or carry a bounty label. Feature and
bug-fix work only: sandbox and security repositories and issues that read as security findings are dropped by
rule. Only money a maintainer, the bounty bot or a label posted counts; a contributor's "bounty proposal" is dropped.
Rank = amount × language fit ÷ (1 + age in months) ÷ (1 + open PRs + assigned). Taken says what stands between a new
claim and the money; the top 3 free ones become `oss-bounties` queue items.

Read 498 issues, kept 16; dropped: under 20 stars 265, sandbox or security repository 103, proposed, not funded 41, no amount found 37, reads as a security finding 11, no push in 90 days 10, already rewarded 7, fork 6, archived 2.

| Amount | Rank | Repository | Issue | Age | Taken | Attempts |
| --- | --- | --- | --- | --- | --- | --- |
| $80 | 65 | [useagenthq/useagent](https://github.com/useagenthq/useagent) (381★, TypeScript, AGPL-3.0) | [#61](https://github.com/useagenthq/useagent/issues/61) Build the UseAgent mobile app for iOS and Android | 7 d | free | 0 |
| $30 | 8 | [useagenthq/useagent](https://github.com/useagenthq/useagent) (381★, TypeScript, AGPL-3.0) | [#56](https://github.com/useagenthq/useagent/issues/56) Desktop app: make it work perfectly on Windows and Linux | 7 d | 2 PRs open | 0 |
| $500 | 7 | [gyroflow/gyroflow](https://github.com/gyroflow/gyroflow) (9581★, Rust, GPL-3.0) | [#742](https://github.com/gyroflow/gyroflow/issues/742) Refactor lens profile handling | 1096 d | 1 PR open | 23 |
| $30 | 6 | [useagenthq/useagent](https://github.com/useagenthq/useagent) (381★, TypeScript, AGPL-3.0) | [#51](https://github.com/useagenthq/useagent/issues/51) Student and campus kit: a workshop guide and starter projects | 7 d | 3 PRs open | 0 |
| $250 | 5 | [onyx-dot-app/onyx](https://github.com/onyx-dot-app/onyx) (32413★, Python, no licence) | [#2281](https://github.com/onyx-dot-app/onyx/issues/2281) Jira Service Management Connector | 773 d | 1 PR open | 48 |
| $5 | 5 | [useagenthq/useagent](https://github.com/useagenthq/useagent) (381★, TypeScript, AGPL-3.0) | [#113](https://github.com/useagenthq/useagent/issues/113) Coding with an agent: 3 tasks (website, real bug fix, tests) | 2 d | free | 0 |
| $100 | 4 | [moorcheh-ai/memanto](https://github.com/moorcheh-ai/memanto) (2311★, Python, MIT) | [#1852](https://github.com/moorcheh-ai/memanto/issues/1852) [BOUNTY $100]🛡️The Memanto Security Challenge: Test Our Defenses | 61 d | 8 PRs open | 10 |
| $500 | 1 | [gyroflow/gyroflow](https://github.com/gyroflow/gyroflow) (9581★, Rust, GPL-3.0) | [#45](https://github.com/gyroflow/gyroflow/issues/45) Optical only stabilization | 1712 d | 7 PRs open | 14 |
| $5 | 1 | [SalamLang/Salam](https://github.com/SalamLang/Salam) (53★, TeX, GPL-3.0) | [#1713](https://github.com/SalamLang/Salam/issues/1713) 🎁 Build Something with Salam Programming Language (Community Reward) | 17 d | free | 0 |
| $200 | 0 | [gyroflow/gyroflow](https://github.com/gyroflow/gyroflow) (9581★, Rust, GPL-3.0) | [#150](https://github.com/gyroflow/gyroflow/issues/150) Support lensfun database | 1706 d | 10 PRs open | 10 |
| $60 | 0 | [lablab-ai/community-content](https://github.com/lablab-ai/community-content) (69★, MDX, no licence) | [#462](https://github.com/lablab-ai/community-content/issues/462) Crafting a Comprehensive Tutorial for Vectara Chat | 930 d | 6 PRs open | 11 |
| $50 | 0 | [arakoodev/EdgeChains](https://github.com/arakoodev/EdgeChains) (429★, JavaScript, AGPL-3.0) | [#290](https://github.com/arakoodev/EdgeChains/issues/290) BOUNTY: integrate AWS Comprehend as a utility to redact data | 1044 d | 9 PRs open | 46 |
| $30 | 0 | [arakoodev/EdgeChains](https://github.com/arakoodev/EdgeChains) (429★, JavaScript, AGPL-3.0) | [#273](https://github.com/arakoodev/EdgeChains/issues/273) BOUNTY: add support for qdrant vector database in javascript sdk | 1051 d | 14 PRs open | 51 |
| $25 | 0 | [arakoodev/EdgeChains](https://github.com/arakoodev/EdgeChains) (429★, JavaScript, AGPL-3.0) | [#279](https://github.com/arakoodev/EdgeChains/issues/279) BOUNTY: add support for Google Palm2 API in javascript/typescript | 1047 d | 6 PRs open | 22 |
| $20 | 0 | [highlight/highlight](https://github.com/highlight/highlight) (9384★, TypeScript, no licence) | [#8032](https://github.com/highlight/highlight/issues/8032) document sveltekit backend instrumentation | 941 d | 10 PRs open | 44 |
| $3 | 0 | [tscircuit/pcb-viewer](https://github.com/tscircuit/pcb-viewer) (22★, TypeScript, MIT) | [#163](https://github.com/tscircuit/pcb-viewer/issues/163) Remove `disableAutoFocus` in favor of `focusOnHover={false}` | 604 d | 13 PRs open | 54 |
