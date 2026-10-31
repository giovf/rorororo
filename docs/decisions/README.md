# Decision log archive

`docs/STRATEGY.md` §8 is the decision log of record for the last 30 days. Entries older than that
roll into `<YYYY-MM>.md` here — the entry's own month, newest last, the same `- YYYY-MM-DD …` line
shape — by `npm run decisions-roll` (`scripts/decisions-roll.ts`, idempotent; `--days N` tightens
the window, `--dry-run` only prints), which the Saturday ops retro runs (foundry
`strategy-decision-log-rollover`, 2026-10-31: §8 was 273 of STRATEGY.md's 294 KB and six routine
prompts read it at the start of every slot).

Rules: append-only like §8 — `npm run runs` counts the dated lines of §8 plus every month file here
in the `strategy` floor of `docs/ops/RUNS-COUNT.json`, so a roll never reads as a deletion and a
whole-file write of either place fails the gate. New decisions are still written to §8, never here.
A routine that needs an older decision reads the month file (`grep '^- 2026-09' docs/decisions/2026-09.md`).
