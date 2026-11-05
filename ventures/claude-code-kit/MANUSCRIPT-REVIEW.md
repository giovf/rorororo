# Manuscript review — Running Claude Code Unattended (first edition, drafted 2026-11-05)

For the owner. Leanpub's condition is that a book is human-curated, and this file is what makes a read-through a real
curation rather than a skim: one row per section, with the claims a reader will rely on marked **check**, and the one
sentence only you can write. The build is `npm run build -w @foundry/claude-code-kit` → `release/` (EPUB, PDF, cover);
the word count and page count are printed by the build and checked by `src/kit.test.ts` (20–30k words).

## The one sentence you must write

The preface carries this placeholder, which the listing-pack item replaces with what you actually did:

> [What the owner did before publishing — to be stated by the owner at publication: edited, cut and verified; or read and published as drafted.]

Write it true. "I read it, cut two paragraphs and published it" is fine. The test fails the build while the placeholder is
in the text, so the listing item cannot ship without it being replaced.

## Sections and the claims to check

| Section | Source in the repo | Claims a reader relies on — **check** |
| --- | --- | --- |
| Preface: how this book was written | this file; `RESEARCH.md` §4 | **check** the process statement matches what you did; the needs-line is present; "about £59 spent and £0 of revenue recorded" (`docs/LEDGER.md`) |
| 1. What “unattended” means here | `CLAUDE.md`; `docs/RUNS.md` 2026-11-05; `docs/STRATEGY.md` §2 | **check** the abridged run-log day is quoted faithfully; "seven ventures"; the owner's brief as stated in §1 of STRATEGY ("make money, legally, ≤ £100") |
| 2. The shape of the operation | `docs/SCHEDULERS.md`; `docs/ARCHITECTURE.md` | **check** the timetable table (times UTC); "nine routines"; "about twenty workflows"; the US$49 invoice story (`docs/LEDGER.md` 2026-10-10) |
| 3. The instruction file: what each rule does and why it exists | `CLAUDE.md` | **check** every rule paraphrased exists in the file as it stands; the "three times in two days" quote; the 2026-10-29 owner-time rule wording |
| 4. Routine prompts: written in the repository, changed by commit | `docs/routines/README.md`; `docs/routines/burn-down.md` header | **check** the bootstrap text is verbatim; the sample `Changes:` lines; the 2026-11-03 research-claim story |
| 5. The work pipeline: queues, scores, weights, claims and cooling | `docs/pipeline/README.md`; `scripts/pipeline.ts` | **check** the example item JSON (from `docs/pipeline/queues/tax-workbook.json`); the weights table (STRATEGY §5); every dated rule |
| 6. Slots, traces and the watchdog | `scripts/run-watchdog.ts`, `scripts/slot.ts` headers; `docs/ops/SLOTS.md` | **check** 2026-09-23 refused build; 2026-09-29/30 three collisions; notify-line rules (burn-down prompt NOTIFY) |
| 7. Working in a sandbox: shallow clones and the fetch relay | `docs/relay/README.md`; `scripts/fetch-relay.mjs` header | **check** "139 commits behind" (2026-10-10); "469 MB" (2026-10-31); the proxy 403 on the licence host (2026-11-05 run) |
| 8. Gates: the check, the pre-push hook and workflows written by a routine | `.githooks/pre-push`; `docs/ci/README.md`; `docs/STRATEGY.md` §8 | **check** the three red mains (2026-10-04/05); "seven failed runs" (2026-10-29); Dependabot majors rule (burn-down prompt) |
| 9. The usage week: budgets, pacing and one commit per item | `docs/ops/BURN.json`; burn-down prompt GATE | **check** the JSON reproduced; the W43 and W44 dark Wednesdays; 33 slots / reserve 3 / "three a night" arithmetic |
| 10. The owner’s part: notes, actions, alerts and self-caused mail | `docs/OWNER-NOTES.md`; `docs/for-owner/actions/`; `docs/ops/SELF-CAUSED.md`; `docs/routines/inbox-triage.md` | **check** the two 2026-10-18 notes are described fairly; action 031 withdrawn under the 15-min rule; "thirty-seven" action files; "three messages a week" is your experience |
| 11. Money: the ledger, the cap and what six weeks earned | `docs/LEDGER.md`; `docs/reviews/2026-W44.md` | **check** every ledger row and the totals (≈ £58.60 spent, £8.16 planned, £0 revenue); the scorecard readings of 2026-11-01 |
| 12. Research before build: the exchange, the review and the kill criteria | `docs/exchange/2026-W40..W45.md`; `docs/reviews/`; `docs/STRATEGY.md` §5–§7 | **check** the six-exchange table; the oss-bounties kill (≈ 3,900 issue reads, 10-18); the Leanpub spike's parked routes |
| 13. Self-expansion: the retro, the operation’s own queue and the fixes it built | `docs/pipeline/queues/foundry.json`; `docs/STRATEGY.md` §8 | **check** each row of the items table against the queue (ids, dates, incidents) |
| 14. The incident catalogue, in date order | `docs/STRATEGY.md` §8; `docs/decisions/2026-09.md`; routine headers | **check** every dated entry; the 2026-10-06 MCP timeout; the 2026-10-11/23 description-limit story; 2026-11-05 entries |
| 15. Starting your own from the Extras | `RESEARCH.md` §4 (the Extras); `kit-extras-zip` item | **check** the ten steps are doable with the zip the `kit-extras-zip` item builds; "about three weeks" from first routine to a fully working week |
| Appendix: glossary, line shapes and the file map of the Extras | burn-down prompt RUN LOG; `scripts/slot-utilisation.ts` | **check** the line shapes; the file map matches the zip's contents once `kit-extras-zip` is built |

## Things the draft deliberately does not say

- No owner name, handle, email or account id; no trigger ids; no secrets. The test `src/kit.test.ts` scans for them.
- No rival author is named (the shelf table in `RESEARCH.md` §2 stays internal).
- No income claim beyond the ledger; no urgency copy.

## Known limits of the draft

- Page count: the PDF is 7 × 10 in; the build prints the real count. The queue item estimated 150–200 pages at Leanpub's
  technical theme; a Chromium print of ~24k words lands lower. Leanpub takes the finished PDF as is.
- The Extras zip is built (`kit-extras-zip`, 2026-11-05: `release/claude-code-kit-extras.zip`, 44 files, 172 kB) and the
  appendix file map is checked against its contents by `src/extras.test.ts`; the placeholders the zip uses (`<owner>`, `data-api`,
  `workbook` …) are listed in its README, which the owner should read once before publishing the Package.
