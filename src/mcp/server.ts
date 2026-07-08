import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { API_BASE_URL, APP_VERSION, DOCS_ERRORS_URL } from '../lib/constants';
import { creditCost } from '../metering/costs';
import { currentPeriod, getUsage, incrementUsage } from '../metering/counters';
import { planAllowance } from '../billing/plans';
import { usageSummary } from '../metering/quota';
import { readCached } from '../sources/cache';
import { applyQuery, buildQuerySchema } from '../sources/query';
import { listSources } from '../sources/registry';
import type { DataSource } from '../sources/types';
import type { KeyContext } from '../types';

// Tools are generated from the source registry — the same zod schemas that
// drive REST validation and the OpenAPI spec (single source of truth). A new
// registry entry appears here automatically. Tool calls share auth (route
// middleware) and metering (below) with REST; list_sources and get_usage are
// free, query_* tools debit the source's credit cost on success.

interface ToolResult {
  content: { type: 'text'; text: string }[];
  structuredContent?: Record<string, unknown>;
  isError?: boolean;
  [key: string]: unknown;
}

function jsonResult(payload: Record<string, unknown>): ToolResult {
  return {
    content: [{ type: 'text', text: JSON.stringify(payload) }],
    structuredContent: payload,
  };
}

function errorResult(message: string): ToolResult {
  return { content: [{ type: 'text', text: message }], isError: true };
}

function sourceListing(): Record<string, unknown>[] {
  return listSources().map((source) => ({
    slug: source.slug,
    title: source.title,
    description: source.description,
    tool: `query_${source.slug.replaceAll('-', '_')}`,
    supported_params: [...Object.keys(source.queryParams.shape), 'q'],
    credit_cost: source.creditCost ?? 1,
  }));
}

function registerQueryTool(
  server: McpServer,
  env: CloudflareBindings,
  keyCtx: KeyContext,
  source: DataSource,
): void {
  const schema = buildQuerySchema(source);
  server.registerTool(
    `query_${source.slug.replaceAll('-', '_')}`,
    {
      title: source.title,
      description: `${source.description} Filters combine with AND; q searches all text fields. Costs ${creditCost(source)} credit(s) per call.`,
      inputSchema: schema.shape,
    },
    async (args: Record<string, unknown>): Promise<ToolResult> => {
      const cost = creditCost(source);
      const period = currentPeriod();
      const granted = planAllowance(keyCtx.plan);
      const used = await getUsage(env, keyCtx.usageSubject, period);
      if (used + cost > granted) {
        return errorResult(
          `Monthly credit quota exhausted (${granted}). Upgrade via POST ${API_BASE_URL}/v1/billing/checkout — see ${DOCS_ERRORS_URL}#quota_exceeded`,
        );
      }

      let payload;
      try {
        payload = await readCached(env, source);
      } catch {
        return errorResult(`Source '${source.slug}' is temporarily unavailable, retry later`);
      }

      const result = applyQuery(payload.records, args);
      const newUsed = await incrementUsage(env, keyCtx.usageSubject, cost, period);
      return jsonResult({
        ok: true,
        data: result.records,
        meta: {
          source: source.slug,
          page: result.page,
          per_page: result.perPage,
          total: result.total,
          last_refreshed_at: payload.last_refreshed_at,
          credits_remaining: Math.max(0, granted - newUsed),
        },
      });
    },
  );
}

export function buildMcpServer(env: CloudflareBindings, keyCtx: KeyContext): McpServer {
  const server = new McpServer({ name: 'gankdat', version: APP_VERSION });

  server.registerTool(
    'list_sources',
    {
      title: 'List available data sources',
      description:
        'Datasets this API serves, with the tool name and filter params for each. Free to call.',
      inputSchema: {},
    },
    () => Promise.resolve(jsonResult({ ok: true, data: sourceListing() })),
  );

  server.registerTool(
    'get_usage',
    {
      title: 'Current credit usage',
      description: 'Plan, credits used/granted/remaining for the presented API key. Free to call.',
      inputSchema: {},
    },
    async (): Promise<ToolResult> => {
      const period = currentPeriod();
      const used = await getUsage(env, keyCtx.usageSubject, period);
      const { granted, remaining, alerts } = usageSummary(keyCtx.plan, used);
      return jsonResult({
        ok: true,
        data: { plan: keyCtx.plan, period, used, granted, remaining, alerts },
      });
    },
  );

  for (const source of listSources()) {
    registerQueryTool(server, env, keyCtx, source);
  }
  return server;
}
