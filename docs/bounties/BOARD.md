# Open-source bounty board — 2026-10-20

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

Read 594 issues (4 listed on Opire), kept 10; dropped: under 20 stars 232, no amount found 170, sandbox or security repository 80, proposed, not funded 52, reads as a security finding 15, no push in 90 days 11, already rewarded 9, contest or usage task, not a fix 6, fork 6, archived 2, needs a real device or the claimant's own recording 1.

| Amount | Rank | Repository | Issue | Age | Taken | Attempts |
| --- | --- | --- | --- | --- | --- | --- |
| $102367 | 25592 | [asyncapi/community](https://github.com/asyncapi/community) (140★, JavaScript, CC-BY-4.0) | [#3633](https://github.com/asyncapi/community/issues/3633) Budget 2027 \| Planning and discussion | 30 d | assigned | 0 |
| $20 | 8 | [slick/slick](https://github.com/slick/slick) (2666★, Scala, BSD-2-Clause) | [#3885](https://github.com/slick/slick/issues/3885) Long union chains overflow the stack in MergeToComprehensions | 1 d | free | 0 |
| $100 | 4 | [moorcheh-ai/memanto](https://github.com/moorcheh-ai/memanto) (2334★, Python, MIT) | [#1852](https://github.com/moorcheh-ai/memanto/issues/1852) [BOUNTY $100]🛡️The Memanto Security Challenge: Test Our Defenses | 69 d | 6 PRs open | 10 |
| $2 | 1 | [auscaster/frantic-board](https://github.com/auscaster/frantic-board) (613★, Shell, MIT) | [#541](https://github.com/auscaster/frantic-board/issues/541) Frantic bounty #143: Write and validate your own MAP description with the mailschema packa | 0 d | free | 0 |
| $60 | 0 | [lablab-ai/community-content](https://github.com/lablab-ai/community-content) (69★, MDX, no licence) | [#462](https://github.com/lablab-ai/community-content/issues/462) Crafting a Comprehensive Tutorial for Vectara Chat | 938 d | 5 PRs open | 11 |
| $50 | 0 | [arakoodev/EdgeChains](https://github.com/arakoodev/EdgeChains) (429★, JavaScript, AGPL-3.0) | [#290](https://github.com/arakoodev/EdgeChains/issues/290) BOUNTY: integrate AWS Comprehend as a utility to redact data | 1052 d | 59 PRs open | 50 |
| $3 | 0 | [tscircuit/pcb-viewer](https://github.com/tscircuit/pcb-viewer) (22★, TypeScript, MIT) | [#163](https://github.com/tscircuit/pcb-viewer/issues/163) Remove `disableAutoFocus` in favor of `focusOnHover={false}` | 612 d | 49 PRs open | 57 |
| $1 | 0 | [auscaster/frantic-board](https://github.com/auscaster/frantic-board) (613★, Shell, MIT) | [#538](https://github.com/auscaster/frantic-board/issues/538) Frantic bounty #139: Send your first email with the Nitrosend CLI and report how it went | 0 d | 1 PR open | 0 |
| $1 | 0 | [auscaster/frantic-board](https://github.com/auscaster/frantic-board) (613★, Shell, MIT) | [#539](https://github.com/auscaster/frantic-board/issues/539) Frantic bounty #140: Send an email with a 30-line Nitrosend SDK script and report how it w | 0 d | free | 0 |
| $1 | 0 | [auscaster/frantic-board](https://github.com/auscaster/frantic-board) (613★, Shell, MIT) | [#540](https://github.com/auscaster/frantic-board/issues/540) Frantic bounty #141: Let your agent onboard itself through the Nitrosend MCP server and se | 0 d | free | 0 |
