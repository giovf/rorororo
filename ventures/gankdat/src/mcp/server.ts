import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { API_BASE_URL, APP_VERSION, DOCS_ERRORS_URL } from '../lib/constants';
import { creditCost } from '../metering/costs';
import { currentPeriod, getUsage, incrementUsage } from '../metering/counters';
import { planAllowance } from '../billing/plans';
import { usageSummary } from '../metering/quota';
import { z } from 'zod';
import { buildQuerySchema } from '../sources/query';
import { queryD1Changes } from '../sources/d1store';
import { changesQuerySchema } from '../routes/changes';
import { querySource } from '../sources/store';
import { getSource, hasChangeFeed, listSources } from '../sources/registry';
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

// Tool execution never runs anonymously in practice — the route 401s
// unauthenticated tools/call before the server is invoked — but the handlers
// guard anyway so a route regression degrades to a polite tool error.
const AUTH_REQUIRED = `Authentication required: send an API key as "Authorization: Bearer <key>" on the HTTP request. Get a free key at ${API_BASE_URL}/account.`;

function sourceListing(): Record<string, unknown>[] {
  return listSources().map((source) => ({
    slug: source.slug,
    title: source.title,
    description: source.description,
    tool: `query_${source.slug.replaceAll('-', '_')}`,
    supported_params: [...Object.keys(source.queryParams.shape), 'q'],
    credit_cost: source.creditCost ?? 1,
    change_feed: hasChangeFeed(source) ? 'get_changes' : null,
  }));
}

function registerQueryTool(
  server: McpServer,
  env: CloudflareBindings,
  keyCtx: KeyContext | null,
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
      if (!keyCtx) return errorResult(AUTH_REQUIRED);
      const cost = creditCost(source);
      const period = currentPeriod();
      const granted = planAllowance(keyCtx.plan);
      const used = await getUsage(env, keyCtx.usageSubject, period);
      if (used + cost > granted) {
        return errorResult(
          `Monthly credit quota exhausted (${granted}). Upgrade via POST ${API_BASE_URL}/v1/billing/checkout — see ${DOCS_ERRORS_URL}#quota_exceeded`,
        );
      }

      let queried;
      try {
        queried = await querySource(env, source, args);
      } catch {
        return errorResult(`Source '${source.slug}' is temporarily unavailable, retry later`);
      }

      const result = queried.page;
      const newUsed = await incrementUsage(env, keyCtx.usageSubject, cost, period);
      return jsonResult({
        ok: true,
        data: result.records,
        meta: {
          source: source.slug,
          page: result.page,
          per_page: result.perPage,
          total: result.total,
          last_refreshed_at: queried.last_refreshed_at,
          credits_remaining: Math.max(0, granted - newUsed),
        },
      });
    },
  );
}

/** One tool for every register dataset's change feed (sources with a stable record id). */
function registerChangesTool(
  server: McpServer,
  env: CloudflareBindings,
  keyCtx: KeyContext | null,
): void {
  const feeds = listSources().filter(hasChangeFeed);
  if (feeds.length === 0) return;
  const slugs = feeds.map((s) => s.slug) as [string, ...string[]];
  server.registerTool(
    'get_changes',
    {
      title: 'Changes since a date',
      description: `Rows added, removed or changed between daily refreshes of a register dataset (${slugs.join(', ')}), newest first, 90-day history. Poll this instead of re-reading a whole register. Costs 1 credit per call.`,
      inputSchema: { source: z.enum(slugs), ...changesQuerySchema.shape },
    },
    async (args: Record<string, unknown>): Promise<ToolResult> => {
      if (!keyCtx) return errorResult(AUTH_REQUIRED);
      const source = getSource(String(args.source));
      if (!source?.idOf) return errorResult(`Source '${String(args.source)}' has no change feed`);
      const parsed = changesQuerySchema.safeParse(args);
      if (!parsed.success) return errorResult('Invalid arguments: ' + parsed.error.message);
      const cost = creditCost(source);
      const period = currentPeriod();
      const granted = planAllowance(keyCtx.plan);
      const used = await getUsage(env, keyCtx.usageSubject, period);
      if (used + cost > granted) {
        return errorResult(
          `Monthly credit quota exhausted (${granted}). Upgrade via POST ${API_BASE_URL}/v1/billing/checkout — see ${DOCS_ERRORS_URL}#quota_exceeded`,
        );
      }
      const since = parsed.data.since ?? new Date(Date.now() - 7 * 86_400_000).toISOString();
      const result = await queryD1Changes(env, source, { ...parsed.data, since });
      const newUsed = await incrementUsage(env, keyCtx.usageSubject, cost, period);
      return jsonResult({
        ok: true,
        data: result.rows,
        meta: {
          source: source.slug,
          since,
          page: parsed.data.page,
          per_page: parsed.data.per_page,
          total: result.total,
          last_refreshed_at: result.last_refreshed_at,
          credits_remaining: Math.max(0, granted - newUsed),
        },
      });
    },
  );
}

/**
 * keyCtx is null for anonymous introspection (initialize/tools/list — see
 * routes/mcp.ts): registries and directories index tools without a key, so
 * every tool must register with its full schema regardless of auth.
 */
export function buildMcpServer(env: CloudflareBindings, keyCtx: KeyContext | null): McpServer {
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
      if (!keyCtx) return errorResult(AUTH_REQUIRED);
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
  registerChangesTool(server, env, keyCtx);
  return server;
}
