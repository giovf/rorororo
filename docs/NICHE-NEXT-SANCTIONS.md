# Next niche: sanctions / compliance screening — research & plan (2026-07-11)

> The niche analysis ranked this #3 and GO-TO-MARKET names it the designated
> pivot candidate if Stage 0 fails. This doc refreshes the landscape as of
> July 2026, sharpens the wedge, and plans a phased entry that works for BOTH
> Stage 0 outcomes. Companion docs: `.taskmaster/docs/niche-analysis.md`
> (original scoring), `NICHE-LAUNCH-CHECKLIST.md` (launch mechanics).

## TL;DR

Still the right next niche, but the original wedge needs sharpening: the
"MCP-native + x402-payable, incumbents underserve agents" angle is **no
longer empty** — agent-native entrants shipped in 2026. Our sharpened edge is
**primary-source + UK-anchored + the procurement bridge**: nobody serves
"screen a UK supplier against sanctions + the Procurement Act debarment list"
as one clean self-serve API, and that product sells to the audience we are
already validating. Entry is phased so the first step costs ~2 days and works
as either pivot or expansion.

## What changed since the niche analysis (early 2026)

1. **The agent-native wedge is partially taken.** Limitguard (x402-priced
   sanctions screening over OpenSanctions data, USDC on Base/Solana), LION
   x402 (OFAC flag inside attested KYB dossiers), Gapup (8-list screener in a
   183-tool MCP), and Anthropic's own KYC agent (calls a screening MCP)
   all exist. MCP+x402 is now table stakes here, not differentiation.
   *Note: most of these wrap OpenSanctions — they inherit its licensing costs
   and its data pipeline. Primary-source normalization remains open.*
2. **The UK consolidated their sanctions lists on 28 Jan 2026.** The OFSI
   Consolidated List closed; the FCDO **UK Sanctions List (UKSL)** is now the
   single source — 7 formats (XML/CSV/HTML/PDF), **OGL v3**. A regime change
   like this breaks downstream parsers — good timing for a fresh entrant and
   a ready-made cite-bait/content hook ("the UKSL consolidation, explained,
   with clean JSON").
3. **The UK debarment list (Procurement Act 2023) went live Feb 2025** —
   suppliers excluded from public procurement, maintained by the Cabinet
   Office. Every contracting authority MUST check it in every procurement.
   Published as a **PDF** on gov.uk — normalization pain = moat, and it is
   the bridge dataset between our current niche and this one.
4. **Our launch cost collapsed.** Registry-driven llms.txt/OpenAPI/MCP/x402/
   stats machinery (tasks 26–34) means a new dataset inherits the whole
   exposure surface (see NICHE-LAUNCH-CHECKLIST.md).

## Competitive landscape (July 2026)

| Player | Model | Price | Notes |
| --- | --- | --- | --- |
| OpenSanctions | data vendor + SaaS screening API | €0.10/query PAYG; bulk/reseller licences | The de-facto open dataset; commercial licence required for reuse — we do NOT build on it |
| Verifex | self-serve dev API | $49/mo; $0.006/screen PAYG; 50 free/mo | Aggressive price floor; startup-targeted |
| sanctions.io | mid-market API | ~$0.16/screen | |
| ComplyAdvantage, Castellum.AI | enterprise | $1k–10k+/mo | Sales-led; not our fight |
| Limitguard, LION x402, Gapup | agent-native (MCP/x402) | per-call USDC | Mostly OpenSanctions wrappers; validate agent demand |
| Refinitiv World-Check | incumbent | $5k–50k/yr | The budget line self-serve tools raid |

Read: the *screening* market is crowded at both ends. The uncontested slice
is **UK-anchored compliance data for procurement/supplier due diligence** —
UKSL + debarment + (later) FCA enforcement, normalized, self-serve, with
screening added once list-serving proves demand.

## Sources (all official, no scraping)

| List | Publisher | Format | Licence | Fit |
| --- | --- | --- | --- | --- |
| UK Sanctions List (UKSL) | FCDO | XML/CSV/HTML/PDF, static URLs | **OGL v3** | Clean DataSource fit |
| UK debarment list | Cabinet Office | **PDF** (investigate data formats) | Crown/OGL | Tiny dataset; parse in cron; THE bridge |
| OFAC SDN + Consolidated | US Treasury | XML/CSV via Sanctions List Service | US public domain | Clean fit |
| EU consolidated (FSF) | EU Commission | XML | EU reuse decision (attribution) | Verify terms before ship |
| UN consolidated | UN Security Council | XML | verify terms | Verify before ship |

## The honest engineering delta

- **List-serving fits the platform as-is**: each list is an ordinary
  `DataSource` (fetch, normalize, filter, paginate). Days, not weeks.
- **Screening does not**: real compliance screening is fuzzy name matching
  (normalization, transliteration, aliases, DOB corroboration, scoring,
  match-review semantics). That's a new endpoint class (`/v1/screen`), new
  metering shape, and a quality bar where false negatives carry liability.
  It is the actual product in this niche — and the reason not to rush it.
- **GDPR posture changes**: sanctions/debarment lists ARE personal data —
  the "no personal data, ever" line becomes per-dataset ("Blind Mode applies
  to planning data; sanctions data is served as published by government for
  compliance purposes"). Lawful basis is well-trodden (compliance/legitimate
  interest) but requires: privacy policy update, per-dataset terms (per the
  standing legal-positioning rule), and "screening aid, not legal advice"
  disclaimers. Same-commit rule applies when shipped.

## Phased plan

**Phase A — the bridge (~2 days build, ship when triggered):**
`uk-sanctions` (UKSL) + `uk-debarment` as ordinary DataSources. Query/filter
only, no matching claims. Cross-sells to the procurement audience we already
have ("is this supplier sanctioned or debarred?" is a bid-intelligence
question), inherits the full exposure machinery, and its stats pages
("UK debarment list: who's on it, by ground") are strong cite-bait. Legal
prep first: per-dataset terms + privacy update + EU/UN licence verification
(UKSL/OFAC/debarment are clean).

**Phase B — screening product (weeks, only on demand signal):**
`/v1/screen?name=&dob=` across all lists with scored matches; `screen_entity`
MCP tool; x402 per-screen (~$0.005 undercuts everyone including Verifex);
match-quality test corpus before launch. Gate: Phase A usage + explicit
requests + at least 2 "would pay for screening" conversations.

**Trigger mapping:**
- **Stage 0 fails** (<20 signups after genuine effort) → Phase A becomes the
  pivot: reposition landing copy around supplier-compliance, run the Stage 0
  playbook again against fintech-compliance + procurement-compliance
  audiences (r/fintech, compliance LinkedIn, the same HN playbook).
- **Stage 0 passes** → Phase A becomes the expansion vertical at the
  analysis's £1,000-MRR trigger, bundled as "supplier due diligence" for the
  existing audience. Same build either way — only the copy differs.

## Risks

- **Price floor**: Verifex at $0.006/screen caps screening margins; win on
  UK-completeness (debarment! UKSL day-one freshness) and the bundle, not price.
- **Matching liability**: never ship Phase B without a test corpus and
  disclaimer terms; compliance buyers churn slowly but sue slowly too.
- **Debarment PDF fragility**: format could change without notice; small
  dataset makes manual fallback viable. Investigate structured formats first.
- **Crowding velocity**: the agent-native entrants iterate fast; our moat is
  primary sources + UK anchor + existing platform, not the MCP transport.

## Next actions (UNBLOCKED 2026-07-11 — Stage 0 gate retired; multi-niche
## portfolio strategy. Phase A ships alongside uk-tenders/uk-planning.)

1. **Task 38 first (the only remaining gate — legal, not validation):**
   per-dataset terms + privacy updates; verify EU/UN reuse terms; confirm
   debarment list structured format.
2. Then task 36: build `uk-sanctions` + `uk-debarment` per
   NICHE-LAUNCH-CHECKLIST; position as "supplier due diligence" bundled
   with procurement.
3. Phase B (screening endpoint) still waits for demand signal — now measured
   via /feedback and per-source traffic instead of pre-commit interviews.

Sources: [OpenSanctions licensing](https://www.opensanctions.org/licensing/) · [Verifex](https://verifex.dev/) · [sanctions.io pricing](https://help.sanctions.io/knowledge-base/pricing-plans) · [UKSL](https://www.gov.uk/government/publications/the-uk-sanctions-list) · [UKSL single-list transition, 28 Jan 2026](https://www.gov.uk/guidance/moving-to-a-single-list-for-uk-sanctions-designations-28-january-2026) · [UK debarment list](https://assets.publishing.service.gov.uk/media/68595a94eaa6f6419fade63b/Debarment_List.pdf) · [debarment guidance](https://www.gov.uk/government/publications/procurement-act-2023-guidance-documents-procure-phase/guidance-debarment-html) · [OFAC list formats](https://ofac.treasury.gov/faqs/topic/1641) · [Limitguard MCP](https://conare.ai/marketplace/mcp/limitguard) · [LION x402](https://glama.ai/mcp/connectors/com.lionx402/lion-x402) · [Anthropic KYC agent analysis](https://www.sardine.ai/blog/anthropic-kyc-agent-what-it-actually-is)
