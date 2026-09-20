# UK Food Hygiene Ratings (FSA) — leads & risk

Every food business in England, Wales, Northern Ireland and Scotland with its **official Food Hygiene Rating** (0–5, or Pass / Improvement Required in Scotland), the three inspection sub-scores, business type, trading address and area, local authority, inspection date, and whether a new rating is pending. **~613,000 establishments, refreshed daily** from the Food Standards Agency's open-data file (Open Government Licence v3). Keyed by the stable FHRSID.

## What people use it for
- **Lead generation** — new openings ("awaiting inspection") and low ratings (0–2) by area for wholesalers, EPOS, pest control, cleaning and consultancy.
- **Supplier due diligence / onboarding** for food-delivery platforms and insurers.
- **Estate monitoring** for franchisors and multi-site operators.

## Output (one item per business)
`fhrs_id, business_name, business_type, address, postcode, outward_code, local_authority, local_authority_code, rating_value, scheme_type, rating_date, hygiene_score, structural_score, confidence_score, new_rating_pending, latitude, longitude`

## Pricing
Pay per result. Set **Maximum results** to control spend. Data comes from gankdat.com, which also offers a REST API, an MCP server for AI agents, and daily change feeds ("what changed since…"). Rating artwork (the sticker images) is not included; the FSA licenses that separately.

## Data posture
Business-level data only, as published by the FSA (private addresses are withheld at source). The operator's free-text "right to reply" is not included.
