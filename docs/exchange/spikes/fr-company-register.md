# Spike: the French company register as gankdat's first non-UK register, sized against Clay's own sentence

Queue item `new-ventures/spike-fr-company-register` (burn-down, 2026-11-17 19:15–19:20 UTC; seeded at 19:13 by the
same slot's exchange pre-research, the night's second pass, with no spike open). Sources: two fetch-relay rounds —
`docs/relay/responses/pre-research-fr-register-2026-11-17` (seven Apify Store searches, two live API calls, the API's
data.gouv.fr page, Clay's integrations page, two data.europa.eu facet reads) and `fr-register-spike-2026-11-17` (the
API's documentation rendered, the Base Sirene dataset and the API's service record through the data.gouv.fr API,
Pappers' and SocieteInfo's price pages, Clay's French SIREN action page, eight filtered searches of 25 records and
twelve single lookups) — plus the npm registry, the GitHub search API and four WebSearch reads from the sandbox.
Relay bodies are pruned after 7 days; every number used is copied here.

Why it was asked: Clay's partnerships team declined gankdat's integration on 2026-11-16 and said it would revisit if
German or French registers are added (INBOX 11-16 14:06). The EU registers spike of 2026-10-19 had parked France on
demand and named two re-open triggers that have now fired: a request for an EU register through the inbox, and an
open-register Apify actor passing 10 users in 30 days.

## 1. The source and its licence

| What | Read | Result |
| --- | --- | --- |
| `recherche-entreprises.api.gouv.fr` (DINUM; partners Insee and INPI) | service record on data.gouv.fr | access `open`; **licence field empty** ("Licence non renseignée" on the page); the documentation's "License: MIT" is the API's code, not its data |
| Base Sirene (Insee), the API's main source | dataset record on data.gouv.fr | **`lov2` — Licence Ouverte 2.0** (reuse including commercial, attribution); monthly; tagged `hvd` |
| One record | `search?q=552032534` | 30 top-level fields: siren, names, legal form, NAF, size category, headcount band, creation and closure dates, `siege` (48 fields), `tva`, `finances` by year, 32 `complements` flags, `statut_diffusion`, `opposition_diffusion_commerciale`, `dirigeants` (name, birth month, role) |
| RNE (INPI) — where `dirigeants` and `finances` come from | `data.inpi.fr` access page | **403 (bot wall) to the runner** — its reuse licence is unread |

So the identity fields rest on a clear open licence; the directors and the financial figures come from a second
register whose terms this spike could not read.

## 2. The prospecting opt-out covers almost half of the sample

Every record carries `opposition_diffusion_commerciale`. Insee lets a registered unit object to the use of its
register entry by third parties for prospecting (Code de commerce art. A123-96; the wording quoted in a data.gouv.fr
discussion: the data "ne puissent être utilisées par des tiers … à des fins de prospection, notamment commerciale").
The article's text itself was not read from Légifrance — the flag's meaning below rests on that secondary quotation
and on Insee's 2019 open-data letter ("il est de leur responsabilité de tenir compte du statut de diffusion le plus
récent").

Sample: 180 distinct companies from eight filtered searches (size GE, ETI, PME; legal forms SAS and SARL; first and
deep pages), all active. The API's ranking is not random, so read the shares as an order of magnitude.

| Size category | Sampled | Opt-out `true` | Share |
| --- | --- | --- | --- |
| Large (GE) | 32 | 26 | 81 % |
| Mid-size (ETI) | 58 | 38 | 66 % |
| SME (PME) | 87 | 18 | 21 % |
| none stated | 3 | 2 | — |
| **All** | **180** | **84** | **47 %** (41 `false`, 55 `null`) |

Of eleven large companies looked up by number, nine carry the flag (Danone, Stellantis Auto, LVMH, TotalEnergies,
EDF, Orange, Bouygues, Carrefour, Schneider Electric France; Peugeot SA and La Poste do not). 123 of the 180 list
directors, 100 carry financial figures, 146 a VAT number; 2 are partly non-diffusible.

What it means here: the State's API serves these records with the flag, so a lookup tool can lawfully serve them for
checking a counterparty. But the channel that asked is Clay, whose tables exist to build prospecting lists — the one
use the flag withdraws. gankdat would have to drop flagged companies on that lane (losing most of the companies a
sales team looks up) or pass them through with a term its buyer breaks by using the product as intended.

## 3. A Worker cannot rely on the State's API, and the bulk file does not fit

- The documentation: "L'API accepte au maximum 7 requêtes par seconde par adresse IP. Une limite de 30 requêtes par
  seconde par ASN est aussi en place. **Il est donc probable de faire face à cette limite sur les cloud publics.**
  Cette valeur correspond à une limite maximale et ne constitue pas un débit garanti … La priorité est alors donnée
  aux systèmes internes et aux services publics." gankdat's Worker leaves from Cloudflare's network, which it shares
  with every other Worker calling the same API.
- The burst from a GitHub runner: 20 calls in 15.5 s (the relay's half-second spacing), 20 of 20 answered 200, 110 ms
  to 2.2 s each, no retry. That shows the API is healthy, not that a shared cloud network keeps its share.
- The lawful alternative is the monthly Sirene stock: `StockUniteLegale` 984,970,049 bytes zipped (717,824,037 as
  Parquet) and `StockEtablissement` 2,892,689,384 bytes (1 November 2026 files). One ZIP member that size cannot be
  walked by Range across waves the way the Companies House accounts ZIP is; it needs a runner-fed load every month
  into a database far larger than gankdat's whole register store — and the stock holds neither directors nor
  financial figures, which are the fields the paid rivals sell.

## 4. Germany, and what Clay already lists

- Germany: the data.europa.eu company-category facet for `de` still counts 5 datasets, none the Handelsregister
  (France: 2 — Base Sirene and "Documents et comptes des entreprises"). 85 Handelsregister and German-company actors
  on the Apify Store share 343 users in 30 days by scraping a portal whose terms forbid it. Declined on 10-19, still
  declined. Clay's sentence names two countries; one of them cannot be supplied lawfully.
- Clay: `www.clay.com/integrations/action/find-french-siren-number-enrich-crm-` is a **Clay-built integration on all
  plans** ("given a French company's domain, name, or professional profile URL/ID, returns its French SIREN registry
  number"), next to "Enrich company firmographics with Enrich-CRM". The seed's reading that Clay lists no French
  register provider was wrong: it lists one that already returns the identifier and firmographics.

## 5. Rivals and prices

| Seller | Price | What a record costs |
| --- | --- | --- |
| The State (`recherche-entreprises`) | free, keyless | 0 |
| Pappers API | €30 a month for 500 credits; 100 free on sign-up | 1 credit a company record (€0.06), 0.1 a search result, 2 for accounts as JSON, 3 a document |
| SocieteInfo | €59 a month for 300 credits, €159 for 1,000, €319 for 3,000, €449 for 6,000 | €0.07–0.20 |
| `dltik/pappers-sirene-scraper` (Apify) | US$0.008–0.01 a company | 38 users/30 d, 199 in all, 2,498 runs |
| `dltik/pappers-enrichment-bundle` | US$0.012 a company | 9 users/30 d, 5,608 runs |
| `tagadanar/french-company-contacts` | per event | 11 users/30 d — director e-mails, a prospecting product |
| 253 French register actors in six searches | — | 353 users/30 d between them; two pass 10 |

Free at the bottom as well: npm `france-data-mcp` 1,155 downloads a month, `@pipeworx/mcp-bodacc` 908,
`@pipeworx/mcp-insee` 875, `n8n-nodes-sirenic` 627; GitHub `etalab/sirene_as_api` 103 stars,
`yoanbernabeu/mcp-recherche-entreprises` 19.

## Call: park

Three of the item's own park conditions are met.

1. **The opt-out and the channel collide.** About half of the sampled companies, and four in five of the large ones,
   have withdrawn their entry from prospecting use; Clay is a prospecting tool.
2. **No lawful shape fits in a day.** A read-through source depends on an API that warns public clouds off and
   promises no rate; the bulk route is a monthly 1–3 GB load without the fields buyers pay for.
3. **France alone does not answer Clay.** The German register is not open data, and Clay already has a French SIREN
   and firmographics action of its own.

The demand signals are real and are kept as the trigger: a named partner asked, and the top open-source actor went
from 4 to 38 users a month. What is missing is a buyer whose use the register allows and a source a Worker can stand
on. Score as built today: evidence 2 × reach 1 ÷ (≥ 2 days with the monthly load) ≈ 1.

**Re-open when** any of: a buyer or channel asks for French company checks for a non-prospecting use (supplier
checks, KYB, the /diligence page) through `/feedback`, the inbox or an MCP `wanted:` count; Clay or another channel
says France alone would change its answer; the API's documentation drops the per-network limit or DINUM offers a
keyed tier; or the German register appears in the EU portal's company category. Next dated read: with
`clay-listing-day-90-read` on 2027-02-10. If it reopens, the first step is Légifrance's text of art. A123-96 and
INPI's RNE licence — neither was read here.

No reply to Clay is drafted: its mail asked for nothing, and there is nothing new to tell it.
