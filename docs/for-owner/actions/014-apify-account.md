# 014 — Apify account (free) so gankdat data can sell on the Apify Store

**Status:** DONE on your side (account, token, payouts, Store terms — 20 Sep). First actor LIVE: https://apify.com/faceless-api/uk-food-hygiene-ratings. The other four are blocked by Apify's new-publisher limit; Claude emailed support@apify.com from info@gankdat.com to lift it — watch for their reply in your inbox. — this is the one shelf where buyers already pay for
exactly this data (food-hygiene, charity, company, care-provider scrapers sell at ~US$1 per
1,000 records). · **Cost:** £0 (free plan; Apify takes 20% of sales and pays out monthly).

## What to do (~10 minutes)
1. Create an account at https://console.apify.com/sign-up — use info@gankdat.com, name
   "gankdat". You can sign up with GitHub or Google if you prefer.
2. Settings → Integrations → **Personal API token** → create one named "foundry" → put it in
   `.env` (repo root) as `APIFY_TOKEN=` — never in chat.
3. Reply "014 done". I'll publish the actors and set their prices from here.
4. **Needed now after all:** Apify refuses to attach a price to an actor until payout billing
   info exists (the API answered "cannot monetize without payout billing info"). Go to
   https://console.apify.com/actors/F0sVyC6l1GLZ8gZvY/publication (or Settings → Payouts),
   fill in your name/address and a PayPal email or bank account, and reply "014 payouts
   done". I then set the per-result price on all five actors and publish them to the Store.
   Until then they stay private on the account.

## What Claude is building
Apify "actors" that wrap gankdat's API: a buyer picks filters (e.g. "food businesses rated 0–2
in Leeds"), the actor pulls the records and charges per result. Same data, second shop window,
no human involvement. Code lives under `ventures/gankdat/apify/`.
