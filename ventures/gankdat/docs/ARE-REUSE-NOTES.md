# ARE (Asset Retrieval Engine) — what is worth reusing here

Assessed 2026-09-28 by the interactive session from the private repo `giovf/ARE`, branch `beta`
(226 commits, Feb–Jul 2026, ~63k lines of Python + a Next.js front end, 172 test files, no CI).
Routines cannot read that repo; everything a build needs is captured here.

## Verdict

- **Do not port the product.** ARE is an internal business-development tool whose revenue model
  is licensing drugs, not selling software: clinician-in-the-loop review is mandatory, the stack is
  a Postgres + OpenSearch + Redis + Celery monolith (server cost from day one), and there is no
  external buyer or price in any of its documents. Every one of those breaks a Foundry rule
  (no human hours per sale, no recurring infrastructure, buyers with money on a shelf we can reach).
- **Do mine its source inventory.** ARE's connectors are readers of free, permissively licensed
  regulatory registers — exactly the shape of a gankdat dataset — and the docs record the URLs,
  file formats, quirks and schedules that took weeks to discover.
- **Borrow three patterns** when gankdat grows an LLM layer (not now): a deterministic
  calibration-rules pass over LLM JSON, a confidence-weighted review queue, and a provenance record
  per extracted claim (source, excerpt, timestamp, model version).

## Candidate datasets (verified in ARE; re-verify through the relay before building)

| Slug (proposed) | Source | Format / cadence | Licence | Buyer and paid rival |
| --- | --- | --- | --- | --- |
| `fda-drug-shortages` | openFDA `https://api.fda.gov/drug/shortages.json` (paginate `limit=100&skip=`; ≤ 4 req/s; key optional) or bulk `https://download.open.fda.gov/drug/shortages/drug-shortages-0001-of-0001.json.zip` | JSON; FDA updates daily | US government work, public domain | Pharmacy procurement, generics BD, healthtech; rivals: ASHP shortage service, Vizient, paid drug-database APIs |
| `fda-orange-book` | `https://www.fda.gov/media/76860/download?attachment` → ZIP of `products.txt`, `patent.txt`, `exclusivity.txt` (tilde `~` delimited, lowercase names) | Monthly update; ARE synced weekly | Public domain | Generics/505(b)(2) planners, IP analysts; rivals: Citeline, GlobalData, DrugPatentWatch ($) |
| `fda-drugs-at-fda` | `https://www.fda.gov/media/89850/download?attachment` → ZIP of tab-delimited `Products.txt`, `Applications.txt`, `MarketingStatus.txt` (status ids 1 Rx, 2 OTC, 3 Discontinued …) | Daily-ish | Public domain | Same buyers; a change feed of new approvals/discontinuations is the product |
| `ema-medicines` | `https://medicines.europa.eu/api/search` (JSON; status `authorised`/`suspended`/…) | Continuous | EMA data reuse permitted with attribution (check the current EMA legal notice) | EU market-access teams; pairs with the two above |
| `mhra-products` | `https://products.mhra.gov.uk/api/search` (JSON) | Continuous | OGL v3 | UK generics, pharmacies; fits the UK-register brand |
| **`region-delta` (derived)** | EMA-authorised INNs with no Drugs@FDA application, and the reverse; INN join via RxNorm (`https://rxnav.nlm.nih.gov/REST`, open) | Daily diff of the three registers above | Derived from public-domain + attributed data | **Nobody sells this as a feed.** ARE's whole beta is built on it; pharma BD and generics teams pay Citeline five figures for adjacent lists |

Not for gankdat: SEC EDGAR full-text (needs LLM classification to be useful), CMS Open Payments
(named individuals — personal data), DrugBank (licence-gated), grey literature, PubTator.

## Patterns worth lifting later (file paths in ARE)

- `are/services/calibration_rules.py` + YAML: rule pass between LLM output and a human/queue.
- `are/services/review_service.py`, `review_threshold_service.py`: priority queue by confidence,
  approve/edit/reject that records few-shot examples.
- `are/connectors/base.py`: token-bucket rate limit, tenacity retry, checksum change detection —
  we already have equivalents in `src/sources/`; nothing to copy.
- `docs/auditreports/caps-and-limits-audit.md`: the method (enumerate every truncation, flag
  silent ones) is a good one-off audit for `src/sources/` byte caps.

## Why the code itself does not transfer

Python/SQLAlchemy/Celery against our TypeScript/Workers stack; 18 sources entangled with a drug
ontology (INN/RxNorm/ATC) and a nine-component scoring model; the beta still had 14 open tasks
about mis-routed drugs; generated exports and worker logs are committed. Knowledge transfers,
lines do not.
