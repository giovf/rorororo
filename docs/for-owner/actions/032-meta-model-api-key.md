# Owner action request #032 — Meta hackathon: the model key, then the submission

- **Date:** 2026-10-26
- **Status:** pending
- **Your time:** ~10 minutes now (step 1), ~15 minutes by 4 Nov (step 3)
- **Cost:** £0.00 (the hackathon's US$150 of Meta Model API credits; nothing on a card)
- **Blocks:** hackathons `meta-global-ai-hackathon-live-run` (the live run, the video, the final text)

The Meta Global AI Developer Hackathon entry is built (2026-10-26 build run): a counterparty-check
page at https://apps.gankdat.com/diligence that runs Muse Spark on Meta Model API over gankdat's
seven UK registers, the CLI, the demo recorder and the submission text
(`ventures/hackathons/entries/meta-global-ai-hackathon/`). The page runs nothing until it has the
model key, which only your Meta account can create. Official Rules read 2026-10-26: an existing
project may be entered, AI-assisted work is not excluded, you keep the IP, winners (indie track
US$150k / 100k / 75k / 50k / 25k) sign a W-8BEN; submissions close **4 Nov 2026, 9:00 PM ET**.

## Actions

### 1. Create a Meta Model API key and save it as a repository secret (~10 min)
- **Where:** https://dev.meta.ai/ → sign in with the account you applied with → **API keys** tab
  (docs: https://dev.meta.ai/docs/authentication)
- **Steps:**
  1. Claim the hackathon credits first if the dashboard or the Cerebral Valley event page asks you to
     (the Official Rules say "before claiming your credits, carefully review the Credit Terms" — they
     are behind the participant login, so read them there; stop if they ask for a card).
  2. **Create API key**, name it `foundry diligence demo`, copy it (shown once; it starts `LLM_`).
  3. GitHub → https://github.com/giovf/rorororo/settings/secrets/actions → **New repository secret**
     → name `META_MODEL_API_KEY`, paste the key. Also put it in `.env` as `META_MODEL_API_KEY=…`.
  4. Optional (~2 min): a gankdat API key from https://gankdat.com/account as the repository secret
     `GANKDAT_DEMO_API_KEY`, so the registers answer in full on the page instead of preview rows.
- **Give back:** say "key done". The next build or burn-down run dispatches the `landing` workflow
  (it stores the key as the Worker secret), checks the page live, records the video and finishes the
  submission text; never paste the key in chat.
- **Cost:** £0.00

### 2. Accept the Official Rules on the Cerebral Valley platform if it asks (~1 min)
- **Where:** https://cerebralvalley.ai/e/meta-ai-developer-hackathon/details (participant login)
- The rules are the event waiver (https://cerebralvalley.ai/e/meta-ai-developer-hackathon/waiver);
  the routines read them 2026-10-26. Nothing to decide — accept if prompted.

### 3. Submit the entry by 4 Nov 2026, 9:00 PM ET (~15 min, after the live-run item says "ready")
- **Where:** https://cerebralvalley.ai/e/meta-ai-developer-hackathon/hackathon/submit
- **Steps:** paste the fields from `ventures/hackathons/entries/meta-global-ai-hackathon/SUBMISSION.md`
  (track: indie developer; theme: Build for Your World), the links (live page, repo, gankdat.com) and
  the demo video (download it from the `demo video` workflow run the live-run item names in ALERTS).
- **Give back:** the submission URL or "submitted" (and the date); it goes in RESEARCH.md.
- **Cost:** £0.00

## When you're done
1. Set **Status** above to `done` and note anything that differed from the steps.
2. Keys go in `.env` and the repository secret only — never in chat.
3. Say "key done" (step 1) and later "submitted" (step 3); the routines take it from there.
