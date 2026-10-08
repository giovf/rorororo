# Work pipeline — the exchange and the venture queues

Owner decision 2026-09-22: work is organised as a hierarchy of queues. **`queues/foundry.json` is the
operation's own queue** (owner 2026-09-24: self-expansion — routines, relays, watchdogs, retros — is in
scope and competes on the same score; any routine may add to it) that the routines read
and write, validated by `npm run pipeline` (part of `npm run check`).

```
docs/pipeline/exchange.json          ideas not yet assigned to a venture (parked / promoted / declined)
docs/pipeline/queues/<venture>.json  one queue per venture: status open|finished, scored items
```

| Who | When | Does |
| --- | --- | --- |
| **Build** (cloud routine `trig_01P9WT733fg3qnuJeKUHE8fx`, Fable) | 09:00 and 17:00 UTC (10:00 and 18:00 UK) | `npm run pipeline next` → builds that one item, marks it `done`; if the item's queue is then empty, sets `needs_research`. If any open queue already needs research, it researches that venture instead of building: writes the evidence, adds ≥ 3 scored items, or marks the queue `finished` with a reason. |
| **Evening burn** (cloud routines `trig_011mbqaUzm3qTK2ZdevCuYpH`, `trig_013tLPWgysoiHWpciYGgXJQ2`, Fable) | every day 17:00–02:00 UTC, hourly; gated by `docs/ops/BURN.json` | Same as build, but loops: item → gate → one commit → push, until nothing is buildable, ~50 min, or the usage limit cuts it. Spends whatever Fable allowance is left before the Thursday 03:00 UTC reset. |
| **Venture exchange** (cloud routine `trig_01CaSyBqwyKVL6NiPqPzhM8L`, Fable) | Wednesdays 08:00 UTC | Market research across the exchange's parked ideas and fresh candidates. Either **opens a new queue** (a new venture: folder, `venture.json` as `idea`, `RESEARCH.md`, queue with scored items) or **reopens/extends an existing queue** when enhancing a live venture scores higher — and says which in the exchange and STRATEGY §8. |
| **Ops retro** (cloud routine `trig_015Uvn63XZUVqx1TAiWZrZL6`, Sonnet; created 2026-09-26, disabled until the interactive session attaches the repo — ALERTS handoff) | Saturdays 07:59 UTC | Reviews how the routines themselves performed over the week (slots missed, repeat blockers, defects, owner load) and **writes proposals scoring ≥ 4 into `queues/foundry.json`** as `todo` items with the evidence and, for prompt changes, the exact wording; adds evidence to an existing item rather than duplicating it. Proof: ≥ 2 retro-originated items built per month. |
| **Strategy review** (cloud routine `trig_01Mv7z5Ae9gEGq9zBnrfDH6R`, Fable) | Sundays 08:00 UTC | Scores every venture against STRATEGY §4/§7; may mark a queue `finished` (killed) and re-park or promote exchange ideas. |
| **Interactive session** | when the owner opens Claude Code | Same rules; also takes `blocked` items whose blocker was an owner action. |

Item fields: `score` is STRATEGY §5 (evidence × reach ÷ effort), higher first, oldest first on
ties; `proof` is the number that would show it worked; `blocked` items name what they wait on
and do not count as "empty". An item that only needs elapsed time rather than a blocker — a
day-7 or day-30 review — stays `todo` and carries `not_before: YYYY-MM-DD`: `npm run pipeline
next` skips it until that date (listing it on a `scheduled:` line instead) and offers it from
07:00 UTC on that day — after the 06:30/06:45 metrics jobs have written the Daily numbers row a
dated reading is usually dated for (2026-10-08: the midnight burn-down read a "10-08 row" item
against the 10-07 rows); `cold` and `claim` apply the same hour. Like a blocked item it still counts as work, so it does not put the queue into
`needs_research`. **Starvation** (2026-10-01): when no queue is flagged but `next` finds nothing
buildable anywhere — every open item blocked or dated — `npm run pipeline empty` lists the open
queues with no buildable item instead, oldest `updated` first, so the build slot researches the
first of them rather than idling (both slots did nothing on 2026-10-01 morning: `next` null,
`empty` `[]`). One buildable item anywhere ends the fallback. **Doing** (2026-10-05): a `doing` item is one a run is building,
dated by `doing_since` (else `added`); `npm run pipeline` lists every one on a `doing:` line. One that has been doing
for more than a day with no future `not_before` is a cut-off session's leftover (nothing of it reached `main`), so
`next` offers it again; a deliberate hold is `todo` with `not_before` (or carries `not_before` while doing). **Claim** (2026-10-07): the
`doing` edit only guards other sessions once it is on `main`, so a session runs `npm run pipeline claim <venture>/<id>
-- --by=<routine>` right after `next` (the `--` matters: npm keeps a bare `--by=` for itself, 2026-10-08) — one commit of the queue file (`pipeline: claim <venture>/<id> (<routine>)`), pushed
before any work, like the slot marker; a claim refused because another session's `doing` is under a day old means take
`next` again (on 2026-10-07 the 17:00 burn-down and the 17:10 build each built `search-console-api-reading` in full, and the
second push was discarded). The watchdog never counts a claim commit as a slot's trace. **Cooling** (2026-10-06): a queue carries
`researched: YYYY-MM-DD`, the day of its last research run (every research run sets it with `updated`); for 48 h after
that the starvation fallback skips the queue and `npm run pipeline` lists it on a `cooling:` line, so a venture is not
researched twice in a day (2026-10-05 had five research runs and the next morning's build was offered the same venture
eleven hours later). When `next` is null and every starved queue is cooling, `empty` prints `[]` and the status says
so: the run writes one run-log line and stops (the burn-down's one pre-research pass per night aside). **Waiting** (2026-10-07): a
research run that finds no new evidence — the metrics unchanged since the last pass, every lever built or owner-blocked, the next
signal a dated reading — sets `research_after: YYYY-MM-DD` (that reading's date) instead of adding items; the fallback treats
the queue as cooling until then and the status says `waiting until <date>` (three ventures had each been researched three times
in eight days on an unchanged zero). A `finished` queue is a venture
with nothing left to do; only the exchange or the review reopens it. Every change to a queue
lands in the same commit as the work.
