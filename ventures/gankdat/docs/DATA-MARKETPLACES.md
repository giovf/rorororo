# Data marketplaces — eligibility check (2026-09-20)

Where B2B data buyers already shop, and whether gankdat can list there today. Foundry rules:
no paid infrastructure, £100 cap, owner is a UK sole trader (not VAT-registered), owner does
account creation only.

| Marketplace | Can list now? | Why / condition | Cost & cut |
| --- | --- | --- | --- |
| **Datarade** (datarade.ai) | **Yes — apply** | Application reviewed for fit; free "Standard" plan; buyers browse, request samples, post data requests and message providers in-platform. Sales-led (someone answers messages), but inbound only. | Free listing; 30% commission on deals Datarade facilitates. Direct deals off-platform are ours. |
| **AWS Data Exchange** | **Not yet** | UK is an eligible jurisdiction and sole traders qualify ("permanent resident or citizen"), but **paid products require a VAT registration number** (UK footnote ¹) plus W-8 and a US bank account (Hyperwallet virtual account is accepted). Owner is below the VAT threshold. Free products are possible but pointless. Also needs a qualification case with the AWS Data Exchange team. | Free to list; AWS Marketplace listing fee on paid products. |
| **Snowflake Marketplace** | **Not yet** | Requires a full (paid) Snowflake account with the data hosted in it, an approved provider profile, and a Stripe Express account for payouts. Breaks the zero-infra rule until revenue justifies it. | Snowflake compute/storage; commission undisclosed. |
| **RapidAPI / Apify** | parked | See MARKETPLACE-PREP.md. | 20–25% / per-event |

## Decision

1. **Datarade**: worth a listing — it is the one free marketplace where data buyers search by
   category (procurement, compliance, company data all exist there). Needs an owner account
   (application form asks for company, datasets, target customers). Batched into the next
   owner action together with anything else from the dataset research. Claude drafts the
   application text; message replies are Claude's job via the owner's login being shared or
   by forwarding — decide when the first enquiry arrives.
2. **AWS Data Exchange**: revisit when the owner registers for VAT (voluntary registration is
   possible below the threshold but adds quarterly returns — not worth it for this alone) or
   when a buyer specifically asks for delivery through AWS.
3. **Snowflake**: revisit at ≥ £300 MRR.

Sources: AWS Data Exchange provider getting-started (eligible jurisdictions, tax/bank
requirements); Snowflake "Becoming a provider" doc; Datarade provider pages and G2/Zoominfo
summaries (Standard plan, 30% commission, buyer messaging).
