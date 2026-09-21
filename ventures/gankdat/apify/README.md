# Apify actors (gankdat data on the Apify Store)

One folder per actor; each is self-contained (`src/gankdat.mjs` is the shared client, copied).
They call gankdat's API with the internal service key (`GANKDAT_INTERNAL_API_KEY` in
`../.env`, account apify@gankdat.com, plan scale) and charge one pay-per-event `result` per
record. Pricing is set in the Apify Console per actor (event `result`); owner action 014 covers
the account. Publish: `cd <actor> && npx apify-cli push` with `APIFY_TOKEN` set. Local run:
`GANKDAT_API_KEY=… APIFY_LOCAL_STORAGE_DIR=./storage node src/main.mjs` with
`storage/key_value_stores/default/INPUT.json`.

## Published actors (account `faceless-api`, 2026-09-20)

| Folder | Actor id | Console |
| --- | --- | --- |
| `uk-food-hygiene` | `F0sVyC6l1GLZ8gZvY` | https://console.apify.com/actors/F0sVyC6l1GLZ8gZvY |
| `uk-charities` | `JmaI2pSRjFJN0TaWz` | https://console.apify.com/actors/JmaI2pSRjFJN0TaWz |
| `uk-care-locations` | `YMrXK9Chuuw0zI1oF` | https://console.apify.com/actors/YMrXK9Chuuw0zI1oF |
| `uk-sponsors` | `f5B9jFHoADfZIwcKd` | https://console.apify.com/actors/f5B9jFHoADfZIwcKd |
| `uk-companies` | `GtHwSKC3Do5XYCjiR` | https://console.apify.com/actors/GtHwSKC3Do5XYCjiR |
| `uk-contract-awards` | see console (pushed 2026-09-21) | https://console.apify.com/actors |
| `uk-schools` | not pushed yet (built 2026-09-21) | https://console.apify.com/actors |

Pricing (`result` event) and Store publication are set through the API once payout billing
info exists on the account (Apify refuses monetisation without it — action 014 step 4).
