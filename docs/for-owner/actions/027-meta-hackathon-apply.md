# Owner action request #027 — apply to the Meta Global AI Developer Hackathon

- **Date:** 2026-10-20
- **Status:** open
- **Your time:** ~10 minutes
- **Cost:** £0.00 (free to enter; selected participants get US$150 of Meta Model API credits and partner credits)
- **Deadline:** **Saturday 2026-10-25, 11:59 PM ET** (04:59 UK, Sunday 26 Oct) — or earlier if the 20,000 places fill; applications are reviewed on a rolling basis, so sooner is better
- **Blocks:** hackathons `meta-global-ai-hackathon-entry` and `meta-global-ai-hackathon-rules-read`

Meta and Cerebral Valley run a free, fully online hackathon from 26 Oct to 4 Nov 2026 with a
**US$1,000,000 cash prize pool** across two tracks (indie developers, startups); UK individuals are
eligible (read 2026-10-20 from `dev.meta.ai/events/global-hackathon` and
`cerebralvalley.ai/e/meta-ai-developer-hackathon`, `ventures/hackathons/RESEARCH.md`). Entry is by
application: a short form judged on the project idea and your technical skill, with links optional.
Routines cannot submit forms in your name, so this is the one step that needs you. If accepted, the
build routines port the due-diligence agent already in the repo to Meta's models inside the hackathon
window and prepare the submission as for the PayPal entry (action 023).

## Actions

### 1. Apply (indie developer track)
- **Where:** https://cerebralvalley.ai/e/meta-ai-developer-hackathon → "Apply" (a Cerebral Valley
  account is created on the way; the official page https://dev.meta.ai/events/global-hackathon links to the same form)
- **Track:** indie developer (individual builders; judged on creativity, technical ambition and whether it works)
- **Theme:** "Build for Your World"
- **Project idea (paste or adapt):**
  > A UK counterparty due-diligence agent on Meta's models. An agent built on Llama / Muse Spark calls
  > gankdat's MCP server — seven official UK registers (Companies House companies and profiles, insolvency
  > notices, sanctions, licensed visa sponsors, charities, public contract awards) — and writes a one-page
  > risk report on any UK company a buyer is about to deal with. A prototype of the tool loop exists against
  > recorded fixtures; the hackathon work is the port to Meta Model API / open-weights Llama through a
  > partner endpoint, the live run, a small web UI and the demo.
- **Technical skill (paste or adapt):**
  > Built and operate gankdat.com: a Cloudflare Worker that serves 17 UK/EU public-register datasets to AI
  > agents over REST and a remote MCP server, with three payment rails (Stripe, Coinbase x402 agent payments,
  > PayPal sandbox credit packs), D1/KV storage, scheduled ingestion of government open data and signed
  > licence keys. The whole portfolio is built and run by Claude Code under my direction, with CI deploys,
  > automated listings and a self-healing pipeline.
- **Links (optional on the form):** https://gankdat.com, https://github.com/giovf/gankdat (public mirror),
  https://apps.gankdat.com
- **Questions 13–16** are survey questions and do not affect selection — answer briefly.
- **Give back:** say "applied" (and the date). The approval mail arrives by 26 Oct 09:00 ET; the inbox
  routine logs it and the next build run starts the entry. If you are not selected, say so and the entry is dropped.
- **Cost:** £0.00

### 2. Accept the Official Rules when published (26 Oct)
- The rules are published before the kickoff and must be accepted by selected participants; the routines
  read them through the relay the same day (`meta-global-ai-hackathon-rules-read`) and stop the entry if an
  existing project or AI-built code is excluded. Nothing else to do unless the mail asks you to click accept.

## When you're done
1. Set **Status** above to `applied` (or `declined`) and note anything that differed from the steps.
2. Say "applied" — the build routines take it from there inside the 26 Oct–4 Nov window; you submit the
   finished entry on the Cerebral Valley form by 4 Nov 9:00 PM ET (the routines prepare the text, links and video as for action 023).
