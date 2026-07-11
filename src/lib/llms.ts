import { PAID_PLANS } from '../billing/plans';
import { FREE_TIER_CREDITS } from './constants';
import { creditCost } from '../metering/costs';
import { buildQuerySchema } from '../sources/query';
import { listSources } from '../sources/registry';

// llms.txt generated from the source registry (same single-source-of-truth
// pattern as lib/openapi.ts): a new registry entry appears in the Datasets and
// MCP-tools sections automatically, and pricing derives from plans.json, so
// this LLM-discovery surface cannot drift from the product. Positioning copy
// (the blockquote) is assembled from source titles; origin-feed naming lives
// in each source's description.

function datasetLines(baseUrl: string): string {
  return listSources()
    .map((source) => {
      const params = Object.keys(buildQuerySchema(source).shape).join(', ');
      const cost = creditCost(source);
      const costNote = cost === 1 ? '' : ` Costs ${cost} credits/request.`;
      return `- GET ${baseUrl}/v1/data/${source.slug} — ${source.description}${costNote}\n  Filters: ${params}.`;
    })
    .join('\n');
}

export function buildLlmsTxt(baseUrl: string): string {
  const sources = listSources();
  const catalog = sources.map((s) => s.title).join('; ');
  const tools = ['list_sources', 'get_usage', ...sources.map((s) => `query_${s.slug.replaceAll('-', '_')}`)].join(', ');
  const minGbp = Math.min(...Object.values(PAID_PLANS).map((p) => p.gbpPerMonth));

  return `# gankdat

> ${catalog} — as clean JSON, one schema, refreshed daily from official
> government feeds; no scraping. Built for developers and AI agents. Native
> MCP server + x402 pay-per-request. Licence and personal-data posture are
> stated per dataset in ${baseUrl}/terms (current datasets: OGL v3, Blind
> Mode — personal data dropped at ingest).

Base URL: ${baseUrl}
Machine-readable spec: ${baseUrl}/openapi.json

## Auth & pricing

- Free key: sign in at ${baseUrl}/account (email magic link) and create a key
  → ${FREE_TIER_CREDITS} requests/month, no card. Agents without a key can pay
  per request via x402 (see below) — no signup.
- Send the key as \`Authorization: Bearer fapi_...\` on every data request.
- 1 credit = 1 request; paid plans from £${minGbp}/mo (billed GBP/USD/EUR by
  location); usage at GET /v1/usage (free).
- Every response: {"ok":true,"data":[...],"meta":{...}} or
  {"ok":false,"error":{"code","message","docs_url"}}.

## Datasets

- GET ${baseUrl}/v1/data — list sources and their filter params (public).
${datasetLines(baseUrl)}

## For AI agents

- MCP server (Streamable HTTP): ${baseUrl}/mcp — anonymous initialize and
  tools/list; tool calls use the same bearer key. Tools: ${tools}.
  Structured JSON results with credits_remaining in meta.
- x402 pay-per-request (no account, USDC on Base):
  GET /x402/data/{source} → HTTP 402 with payment requirements → pay → retry
  with X-PAYMENT header. ~$0.005/request.

## Docs

- Human docs: ${baseUrl}/docs
- Dataset statistics (citable, computed daily): ${baseUrl}/stats — one page
  per dataset at /stats/{slug}
- Quickstart: get a key, then
  curl -H "Authorization: Bearer fapi_..." "${baseUrl}/v1/data/${sources[0]?.slug ?? 'uk-tenders'}?per_page=3"
`;
}

let cached: string | undefined;

/** Registry + base URL are static per deployment, so the text is built once. */
export function getLlmsTxt(baseUrl: string): string {
  cached ??= buildLlmsTxt(baseUrl);
  return cached;
}
