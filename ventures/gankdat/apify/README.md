# Apify actors (gankdat data on the Apify Store)

One folder per actor; each is self-contained (`src/gankdat.mjs` is the shared client, copied).
They call gankdat's API with the internal service key (`GANKDAT_INTERNAL_API_KEY` in
`../.env`, account apify@gankdat.com, plan scale) and charge one pay-per-event `result` per
record. Pricing is set in the Apify Console per actor (event `result`); owner action 014 covers
the account. Publish: `cd <actor> && npx apify-cli push` with `APIFY_TOKEN` set. Local run:
`GANKDAT_API_KEY=… APIFY_LOCAL_STORAGE_DIR=./storage node src/main.mjs` with
`storage/key_value_stores/default/INPUT.json`.

Each actor's `.actor/dataset_schema.json` (Apify validates every pushed item against it) and
`.actor/input_schema.json` (every field is sent as an API query param) must match the source's
zod `recordSchema` / `queryParams`: `test/apify-schemas.spec.ts` checks both for every folder.
A type that drifts fails every run — `uk-planning-applications` was flagged "under maintenance"
by Apify QA on 2026-09-25 because `authority` was declared a string and served as a number.

## Published actors (account `faceless-api`, 2026-09-20)

| Folder | Actor id | Console |
| --- | --- | --- |
| `uk-food-hygiene` | `F0sVyC6l1GLZ8gZvY` | https://console.apify.com/actors/F0sVyC6l1GLZ8gZvY |
| `uk-charities` | `JmaI2pSRjFJN0TaWz` | https://console.apify.com/actors/JmaI2pSRjFJN0TaWz |
| `uk-care-locations` | `YMrXK9Chuuw0zI1oF` | https://console.apify.com/actors/YMrXK9Chuuw0zI1oF |
| `uk-sponsors` | `f5B9jFHoADfZIwcKd` | https://console.apify.com/actors/f5B9jFHoADfZIwcKd |
| `uk-companies` | `GtHwSKC3Do5XYCjiR` | https://console.apify.com/actors/GtHwSKC3Do5XYCjiR |
| `uk-contract-awards` | see console (pushed 2026-09-21) | https://console.apify.com/actors |
| `uk-schools` | `JpzvkJcNfbaieyqrg` | https://console.apify.com/actors/JpzvkJcNfbaieyqrg |
| `nhs-ods` | pushed by CI on the 2026-09-22 commit | https://console.apify.com/actors |
| `uk-trademark-journal` | pushed by CI on the 2026-09-23 commit | https://console.apify.com/actors |
| `uk-gambling-operators` | pushed by CI on the 2026-09-24 commit | https://console.apify.com/actors |
| `uk-no-website-leads` | pushed by CI on the 2026-09-21 commit (merged feed: care + charities + schools with `website_present=false`) | https://console.apify.com/actors |

Pricing (`result` event) and Store publication are set through the API once payout billing
info exists on the account (Apify refuses monetisation without it — action 014 step 4).
