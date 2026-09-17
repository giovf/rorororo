# Owner action request #N — <short title>

- **Date:** YYYY-MM-DD
- **Status:** pending | done
- **Your time:** ~X minutes
- **Cost:** £X.XX (already recorded as `planned` in `docs/LEDGER.md`)
- **Blocks:** task IDs that cannot proceed until this is done

Everything below needs *your* identity or wallet; nothing else in the backlog does.

## Actions

### 1. <Action>
- **What:** one sentence
- **Where:** URL
- **Steps:** numbered, exact
- **Give back:** what to paste into `.env` or tell Claude (never paste secrets in chat —
  put them in `.env` and say "done")
- **Cost:** £0.00

## When you're done
1. Set **Status** above to `done` and note anything that differed from the steps.
2. Put any keys in `.env` (copy `.env.example` if it doesn't exist).
3. Start `claude` and say which items are done — the backlog picks up from there.
