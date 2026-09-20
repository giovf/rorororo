# 014 — Apify account (free) so gankdat data can sell on the Apify Store

**Status:** open · **Urgency:** medium — this is the one shelf where buyers already pay for
exactly this data (food-hygiene, charity, company, care-provider scrapers sell at ~US$1 per
1,000 records). · **Cost:** £0 (free plan; Apify takes 20% of sales and pays out monthly).

## What to do (~10 minutes)
1. Create an account at https://console.apify.com/sign-up — use info@gankdat.com, name
   "gankdat". You can sign up with GitHub or Google if you prefer.
2. Settings → Integrations → **Personal API token** → create one named "foundry" → put it in
   `.env` (repo root) as `APIFY_TOKEN=` — never in chat.
3. Reply "014 done". I'll publish the actors and set their prices from here.
4. Later (only when there is revenue to pay out): Settings → Payouts → add PayPal or bank
   details. Not needed to list.

## What Claude is building
Apify "actors" that wrap gankdat's API: a buyer picks filters (e.g. "food businesses rated 0–2
in Leeds"), the actor pulls the records and charges per result. Same data, second shop window,
no human involvement. Code lives under `ventures/gankdat/apify/`.
