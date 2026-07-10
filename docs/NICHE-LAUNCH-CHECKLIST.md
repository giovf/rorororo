# New-niche launch checklist — reproducible exposure

Adding a dataset is `src/sources/<slug>.ts` + a registry entry (CLAUDE.md
isolation rule). This doc tracks the *exposure* side: what updates itself,
and the short manual ritual. Goal: every tactic from the 2026-07 discovery
push (see `AGENT-DISCOVERY.md`) reproduces for each future niche.

## Automatic — registry-driven, verify but don't edit

| Surface | Mechanism |
| --- | --- |
| REST route `/v1/data/<slug>` + validation | registry + zod `queryParams` |
| OpenAPI paths/schemas at `/openapi.json` | `lib/openapi.ts` builds from registry |
| MCP tool `query_<slug>` | `mcp/server.ts` builds from registry; directories introspecting `tools/list` see it immediately, no resubmission |
| `llms.txt` datasets + tools sections | `lib/llms.ts` builds from registry (`test/llms.spec.ts` enforces coverage for EVERY registered source) |
| x402 lane `/x402/data/<slug>` + 402 payment metadata | `x402/routes.ts` from registry; **Bazaar/x402scan catalog the new route on its first real settlement — no listing action** |
| Landing catalog grid | rendered client-side from `/v1/data` |
| Traffic + payment analytics | UA/path dimensions, nothing per-source |
| Daily refresh + `refresh_log` | platform cron covers every source |

## Manual ritual (~30 min, plus content)

1. **Taskmaster task first** (new source = task required per CLAUDE.md).
2. **Licence check before anything ships**: non-OGL sources need per-dataset
   licence terms first (deliberate legal positioning — see memory/ToS notes).
3. **Positioning copy** — only if the niche changes what the product claims
   to be (a pivot), not for additive UK public-sector sources: landing hero +
   `<meta>`/OG/JSON-LD (`index.html`), `docs.html` meta, registry
   `server.json` description.
4. **`server.json` version bump + `mcp-publisher publish`** (publish flow in
   `MARKETPLACE-PREP.md`). Tool lists in claimed directory listings
   (Smithery/Glama/PulseMCP) refresh from live introspection; nudge/edit any
   hand-entered descriptions.
5. **Cite-bait stats page** for the source from the template (task 34), then
   add it to `public/sitemap.xml`.
6. **Docs drift**: `ARCHITECTURE.md` + PRD data-model notes in the same
   commit as the source (same-commit rule).

## Verification

- `npm test` — `llms.spec` fails if the new source is missing from the LLM
  surface; `openapi.spec`/`mcp.spec` cover the other generated surfaces.
- `/verify` skill end-to-end, then after deploy: anonymous `tools/list` shows
  `query_<slug>`; `GET /x402/data/<slug>` returns a 402 with payment
  requirements; `npm run traffic` picks up the new path automatically.
