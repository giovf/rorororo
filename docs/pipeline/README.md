# Work pipeline — the exchange and the venture queues

Owner decision 2026-09-22: work is organised as a hierarchy of queues that the routines read
and write, validated by `npm run pipeline` (part of `npm run check`).

```
docs/pipeline/exchange.json          ideas not yet assigned to a venture (parked / promoted / declined)
docs/pipeline/queues/<venture>.json  one queue per venture: status open|finished, scored items
```

| Who | When | Does |
| --- | --- | --- |
| **Build** (cloud routine `trig_01P9WT733fg3qnuJeKUHE8fx`, Opus) | 09:30 and 21:30 UTC | `npm run pipeline next` → builds that one item, marks it `done`; if the item's queue is then empty, sets `needs_research`. If any open queue already needs research, it researches that venture instead of building: writes the evidence, adds ≥ 3 scored items, or marks the queue `finished` with a reason. |
| **Venture exchange** (cloud routine `trig_01CaSyBqwyKVL6NiPqPzhM8L`, Opus) | Wednesdays 08:00 UTC | Market research across the exchange's parked ideas and fresh candidates. Either **opens a new queue** (a new venture: folder, `venture.json` as `idea`, `RESEARCH.md`, queue with scored items) or **reopens/extends an existing queue** when enhancing a live venture scores higher — and says which in the exchange and STRATEGY §8. |
| **Strategy review** (cloud routine `trig_01Mv7z5Ae9gEGq9zBnrfDH6R`, Sonnet) | Sundays 08:00 UTC | Scores every venture against STRATEGY §4/§7; may mark a queue `finished` (killed) and re-park or promote exchange ideas. |
| **Interactive session** | when the owner opens Claude Code | Same rules; also takes `blocked` items whose blocker was an owner action. |

Item fields: `score` is STRATEGY §5 (evidence × reach ÷ effort), higher first, oldest first on
ties; `proof` is the number that would show it worked; `blocked` items name what they wait on
and do not count as "empty". A `finished` queue is a venture with nothing left to do; only the
exchange or the review reopens it. Every change to a queue lands in the same commit as the work.
