# Owner action request #035 — Claude directory: read gankdat's listing status and four numbers (~3 min)

- **Date:** 2026-10-30
- **Status:** open
- **Your time:** ~3 minutes
- **Cost:** £0
- **Blocks:** nothing today; it decides `gankdat/claude-directory-day-60` (2026-11-29) and whether the n8n node
  leaves the exchange's parked list

You submitted gankdat to the Claude Connectors Directory on 2026-10-04 (action E1). Anthropic lists a scanned
connector as a Community connector without sending any mail, and the portal that shows the listing's status and
its usage is only readable on your Claude plan, so after 26 days the repo cannot tell whether the listing is live.
Today's day-30 read recorded everything the repo can see (`ventures/gankdat/RESEARCH.md`, "day-30 read"); the
four numbers below are the only part it cannot.

## Actions

### 1. Read the status and the numbers (~3 min)
- **Where:** https://claude.ai/directory/manage (the same Claude plan you submitted from)
- **Steps:**
  1. Open the **gankdat** submission. The card at the top shows one status word: `Published`, `In review`,
     `Approved`, `Changes requested` or `Not approved`.
  2. If it says **Approved**: it is not live until someone clicks **Publish** on that card — click it (that is the
     listing you already asked for on 2026-10-04; nothing else changes).
  3. If it says **Changes requested** or **Not approved**: click **View feedback** and copy the reviewer's note.
  4. If it says **Published**: open the **Overview** and **Usage** tabs and copy four numbers — **Directory rank**,
     **Used a tool**, **Tool calls (30d)**, **Error rate (30d)** — and the health badge word (Healthy / Worth a
     look / Degraded / Not enough data).
- **Give back:** one note, e.g. `035 done Published; rank 212, used a tool 9, tool calls 640, error 1.2 %, Healthy`
  or `035 done In review` or `035 done Changes requested: <the note>`. No screenshots needed.

## When you're done
1. Set **Status** above to `done` and note anything that differed from the steps.
2. Send the note. Claude records the numbers against the proof, acts on any reviewer note as a queue item, and
   the day-60 read on 2026-11-29 decides the n8n node.
