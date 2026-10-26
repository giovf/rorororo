# Open-source bounty board — 2026-10-26

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

Read 589 issues (3 listed on Opire), kept 10; dropped: under 20 stars 304, no amount found 119, sandbox or security repository 82, proposed, not funded 17, no push in 90 days 11, contest or usage task, not a fix 10, reads as a security finding 10, the claimant must fund it or it pays to a wallet off GitHub 9, fork 9, already rewarded 5, archived 2, needs hardware the sandbox lacks 1.

| Amount | Rank | Repository | Issue | Age | Taken | Attempts |
| --- | --- | --- | --- | --- | --- | --- |
| $1000 | 882 | [dev-kp-eloper/BountyScout](https://github.com/dev-kp-eloper/BountyScout) (28★, Python, no licence) | [#1636](https://github.com/dev-kp-eloper/BountyScout/issues/1636) 🎯 Bounty Alert: 11 New Opportunityies found | 4 d | free | 0 |
| $500 | 39 | [Arrow-air/project-quiver](https://github.com/Arrow-air/project-quiver) (582★, HTML, CERN-OHL-S-2.0) | [#256](https://github.com/Arrow-air/project-quiver/issues/256) T-09: Platform Engineering Report, the decision register from PT1 to the 2026 dev kit | 47 d | 1 PR open | 0 |
| $100 | 4 | [moorcheh-ai/memanto](https://github.com/moorcheh-ai/memanto) (2342★, Python, MIT) | [#1852](https://github.com/moorcheh-ai/memanto/issues/1852) [BOUNTY $100]🛡️The Memanto Security Challenge: Test Our Defenses | 75 d | 6 PRs open | 10 |
| $250 | 0 | [onyx-dot-app/onyx](https://github.com/onyx-dot-app/onyx) (32994★, Python, no licence) | [#2281](https://github.com/onyx-dot-app/onyx/issues/2281) Jira Service Management Connector | 787 d | 47 PRs open | 92 |
| $60 | 0 | [lablab-ai/community-content](https://github.com/lablab-ai/community-content) (69★, MDX, no licence) | [#462](https://github.com/lablab-ai/community-content/issues/462) Crafting a Comprehensive Tutorial for Vectara Chat | 944 d | 6 PRs open | 13 |
| $50 | 0 | [arakoodev/EdgeChains](https://github.com/arakoodev/EdgeChains) (432★, JavaScript, AGPL-3.0) | [#290](https://github.com/arakoodev/EdgeChains/issues/290) BOUNTY: integrate AWS Comprehend as a utility to redact data | 1058 d | 67 PRs open | 54 |
| $30 | 0 | [arakoodev/EdgeChains](https://github.com/arakoodev/EdgeChains) (432★, JavaScript, AGPL-3.0) | [#273](https://github.com/arakoodev/EdgeChains/issues/273) BOUNTY: add support for qdrant vector database in javascript sdk | 1065 d | 93 PRs open | 61 |
| $25 | 0 | [arakoodev/EdgeChains](https://github.com/arakoodev/EdgeChains) (432★, JavaScript, AGPL-3.0) | [#279](https://github.com/arakoodev/EdgeChains/issues/279) BOUNTY: add support for Google Palm2 API in javascript/typescript | 1061 d | 34 PRs open | 26 |
| $20 | 0 | [highlight/highlight](https://github.com/highlight/highlight) (9384★, TypeScript, no licence) | [#8032](https://github.com/highlight/highlight/issues/8032) document sveltekit backend instrumentation | 955 d | 50 PRs open | 51 |
| $3 | 0 | [tscircuit/pcb-viewer](https://github.com/tscircuit/pcb-viewer) (22★, TypeScript, MIT) | [#163](https://github.com/tscircuit/pcb-viewer/issues/163) Remove `disableAutoFocus` in favor of `focusOnHover={false}` | 618 d | 50 PRs open | 57 |
