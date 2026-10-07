# Owner action request #020 — let CI read Google Search Console

- **Date:** 2026-10-07
- **Status:** pending
- **Your time:** ~10 minutes
- **Cost:** £0.00 (a Google Cloud project with only the Search Console API enabled bills nothing)
- **Blocks:** gankdat `search-console-stats-indexing` (4); the day-30 reviews of variables-toolkit (10-21), highlight-keep
  and read-focus (10-30) and the proofs of the five comparison / how-to pages, which all read "Search Console impressions"

Adding a user to a Search Console property needs *your* Google identity; nothing else in this request does. No new
account: the Google account that owns the gankdat.com and apps.gankdat.com properties is the one that does every step.

## Why
No Search Console number has ever reached the repo: the /stats pages' indexing has waited on an export since 2026-09-28,
and every Google-facing page built since 10-01 is judged on impressions nobody can see. From 2026-10-07 the 06:45
`store metrics` job runs `scripts/search-console.ts`, which writes a `search: …` clause (7-day impressions, clicks,
average position, top page, and how many of the /stats and comparison pages Google has indexed) on each venture's
daily metrics row. Until the key below exists every row reads `search: n/a (no SEARCH_CONSOLE_KEY secret; owner action
020)`. The account you create is **read-only**: the script asks Google for the `webmasters.readonly` scope only, and
Search Console's *Restricted* permission cannot change anything on the property.

## Actions

### 1. Create a service account and its key (Google Cloud, ~4 min)
- **What:** a service account is a robot Google identity; its JSON key is what CI signs in with.
- **Where:** https://console.cloud.google.com/
- **Steps:**
  1. Sign in with the Google account that owns the Search Console properties. If you have no project yet, create one
     (any name, e.g. `foundry-readings`; no billing account is needed).
  2. **APIs & Services → Library** → search **Google Search Console API** → **Enable**.
  3. **IAM & Admin → Service Accounts → Create service account** → name `search-console-reader` → **Create and continue**
     → grant **no roles** → **Done**.
  4. Open the new account → **Keys → Add key → Create new key → JSON → Create**. A `.json` file downloads; keep it for
     step 3 and delete it afterwards.
  5. Copy the account's email (`search-console-reader@<project>.iam.gserviceaccount.com`).
- **Cost:** £0.00

### 2. Add the account to the Search Console properties (~2 min)
- **What:** give the robot read access to the two properties.
- **Where:** https://search.google.com/search-console/users
- **Steps:**
  1. Pick the **gankdat.com** property (top-left selector) → **Settings → Users and permissions → Add user** → paste the
     service-account email → permission **Restricted** → **Add**.
  2. Repeat for the **apps.gankdat.com** property. If gankdat.com is a *domain* property (`sc-domain:gankdat.com` in the
     selector, covering every subdomain) one add covers both — the script works out which property it can see.
- **Cost:** £0.00

### 3. Paste the key as a GitHub secret (~2 min)
- **What:** the JSON key becomes a repository secret only CI can read.
- **Where:** https://github.com/giovf/rorororo/settings/secrets/actions
- **Steps:**
  1. **New repository secret** → Name `SEARCH_CONSOLE_KEY` → Secret: the **entire contents** of the downloaded `.json`
     file (open it in a text editor, select all, paste; line breaks are fine) → **Add secret**.
  2. Delete the downloaded `.json` file.
  3. Optional, to see the first reading now: https://github.com/giovf/rorororo/actions/workflows/store-metrics.yml →
     **Run workflow**. Otherwise the 06:45 UTC run tomorrow writes it.
- **Give back:** nothing to paste anywhere else — tell Claude "020 done" (Telegram note or `docs/OWNER-NOTES.md`). Never
  paste the key in chat or in a note.
- **Cost:** £0.00

## What you will see
Each venture's `RESEARCH.md` metrics row gains e.g. `search 7d to 10-13: 42 impressions, 1 clicks, avg pos 14.2, top
/stats/uk-schools 20, indexed 9/21, not: Crawled - currently not indexed ×12`. A `search: n/a (403 …)` means the
account was not added to that property yet; `n/a (token …)` means the pasted key is not the whole file.

## When you're done
1. Set **Status** above to `done` and note anything that differed from the steps.
2. Say "020 done" — the next routine closes the `owner:` line and the gankdat indexing item reads the series.
