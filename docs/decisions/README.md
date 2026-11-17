# Decision log

`current.md` is the decision log of record for the last 30 days (`docs/STRATEGY.md` §8 keeps its
heading and one pointer line here). Every routine appends its entry at the END of `current.md` —
`- YYYY-MM-DD <routine>: <what and why>` — and never edits or reorders an earlier one.

Why a file of its own (2026-11-17, foundry `decision-log-union-merge`): two slots that each finish
an item in the same window both append an entry, and on 2026-11-17 the build's 17:16 entry and the
burn-down's 17:34 entry conflicted at the end of §8. `docs/RUNS.md` has merged itself since
2026-10-12 (`merge=union` in `.gitattributes`), but STRATEGY.md could not take that driver: its
other sections are rewritten in place, and union would keep both sides of a rewritten paragraph.
`current.md` is append-only, so it can — both sides' entries are kept, main's first.

Entries older than 30 days roll into `<YYYY-MM>.md` here — the entry's own month, newest last, the
same line shape — by `npm run decisions-roll` (`scripts/decisions-roll.ts`, idempotent; `--days N`
tightens the window, `--dry-run` only prints), which the Saturday ops retro runs (foundry
`strategy-decision-log-rollover`, 2026-10-31: §8 was 273 of STRATEGY.md's 294 KB). The same run
sweeps into `current.md` any entry a session still wrote under §8, and `npm run runs` names such
entries when it sees them.

Rules: append-only — `npm run runs` counts the dated lines of STRATEGY.md, `current.md` and every
month file in the `strategy` floor of `docs/ops/RUNS-COUNT.json`, so a roll never reads as a
deletion and a whole-file write of any of them fails the gate. A routine that needs an older
decision reads the month file (`grep '^- 2026-09' docs/decisions/2026-09.md`).
