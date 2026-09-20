# Apify actors (gankdat data on the Apify Store)

One folder per actor; each is self-contained (`src/gankdat.mjs` is the shared client, copied).
They call gankdat's API with the internal service key (`GANKDAT_INTERNAL_API_KEY` in
`../.env`, account apify@gankdat.com, plan scale) and charge one pay-per-event `result` per
record. Pricing is set in the Apify Console per actor (event `result`); owner action 014 covers
the account. Publish: `cd <actor> && npx apify-cli push` with `APIFY_TOKEN` set. Local run:
`GANKDAT_API_KEY=… APIFY_LOCAL_STORAGE_DIR=./storage node src/main.mjs` with
`storage/key_value_stores/default/INPUT.json`.
