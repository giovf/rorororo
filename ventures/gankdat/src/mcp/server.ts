import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { normalizeEmail } from '../auth/accounts';
import { emailSendAllowed, recordEmailSend } from '../auth/emailcap';
import { claimAgentKey, createAgentSignup, CLAIM_RETRY_SECONDS } from '../auth/signup';
import { emailEnabled, sendEmail } from '../email/send';
import { agentKeyRequestEmail } from '../email/templates';
import {
  API_BASE_URL,
  APP_VERSION,
  DOCS_ERRORS_URL,
  FREE_TIER_CREDITS,
  publicBaseUrl,
} from '../lib/constants';
import { creditCost } from '../metering/costs';
import { currentPeriod, getUsage, incrementUsage } from '../metering/counters';
import { planAllowance } from '../billing/plans';
import { usageSummary } from '../metering/quota';
import {
  clampPreviewArgs,
  PREVIEW_CALLS_PER_DAY,
  PREVIEW_ROWS,
  previewCallsRemaining,
  previewExhaustedMessage,
  previewNextStep,
  takePreviewCall,
} from './preview';
import type { PreviewContext } from './preview';
import { z } from 'zod';
import { buildQuerySchema } from '../sources/query';
import { missingLookupKey } from '../sources/lookup';
import { queryD1Changes } from '../sources/d1store';
import { changeFiltersSchema, changesQuerySchema } from '../routes/changes';
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

/** The tools an agent may call WITHOUT a key — they are how it gets one (routes/mcp.ts). */
export const SIGNUP_TOOLS: ReadonlySet<string> = new Set(['request_api_key', 'claim_api_key']);

/**
 * Tools that need the user's account: called without a token they are refused
 * at the HTTP layer with the OAuth 401 (routes/mcp.ts), which is what makes
 * Claude show its Connect card — the explicit "sign in" entry point next to
 * the implicit one (a spent preview budget).
 */
export const PROTECTED_TOOLS: ReadonlySet<string> = new Set(['connect_account']);

/** Free, keyless, never gated: metadata about the server and the caller's own budget. */
export const FREE_TOOLS: ReadonlySet<string> = new Set(['list_sources', 'get_usage']);

/** Appended to the HTTP 401 on a keyless tools/call: the sign-up funnel's first line. */
export const MCP_NO_KEY_HINT =
  "No key yet? Call the request_api_key tool with the user's email (no key needed): they approve one emailed link, then claim_api_key returns the key.";

// Tool annotations (Claude Connectors Directory review criteria, 2026-09-30):
// every tool carries a title and readOnlyHint/destructiveHint — Claude runs
// read-only tools without a per-call confirmation. The two sign-up tools
// write (an email is sent, a claim is consumed) but destroy nothing.
const READ_ONLY = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
} as const;
const WRITE_SAFE = {
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
  openWorldHint: false,
} as const;

// Keyless callers get the preview (mcp/preview.ts) instead of a 401: the
// directory lists this server without credentials, so every data tool must
// answer without one. The gate below decides per call.
type DataGate =
  | { kind: 'key'; granted: number; cost: number }
  | { kind: 'preview'; remaining: number }
  | { kind: 'denied'; message: string };

async function gateDataCall(
  env: CloudflareBindings,
  keyCtx: KeyContext | null,
  preview: PreviewContext,
  source: DataSource,
  toolName: string,
): Promise<DataGate> {
  const cost = creditCost(source);
  if (keyCtx) {
    const granted = planAllowance(keyCtx.plan);
    const used = await getUsage(env, keyCtx.usageSubject, currentPeriod());
    if (used + cost > granted) {
      return {
        kind: 'denied',
        message: `Monthly credit quota exhausted (${granted}). Upgrade via POST ${API_BASE_URL}/v1/billing/checkout — see ${DOCS_ERRORS_URL}#quota_exceeded`,
      };
    }
    return { kind: 'key', granted, cost };
  }
  const taken = await takePreviewCall(env, preview.clientId);
  if (!taken.allowed) {
    // The paywall signal the daily numbers count (metrics.mjs "paywall hits"):
    // an agent wanted data and got the plan text instead. UA only, no IP.
    env.TRAFFIC.writeDataPoint({
      blobs: ['mcp_denied', preview.userAgent, 'tools/call', 'preview_exhausted', toolName],
      doubles: [1],
      indexes: ['mcp_denied'],
    });
    return { kind: 'denied', message: previewExhaustedMessage() };
  }
  return { kind: 'preview', remaining: taken.remaining };
}

/** Debit a keyed call or annotate a preview one; returns the meta fields to append. */
async function settleDataCall(
  env: CloudflareBindings,
  keyCtx: KeyContext | null,
  gate: Exclude<DataGate, { kind: 'denied' }>,
): Promise<Record<string, unknown>> {
  if (gate.kind === 'key' && keyCtx) {
    const newUsed = await incrementUsage(env, keyCtx.usageSubject, gate.cost, currentPeriod());
    return { credits_remaining: Math.max(0, gate.granted - newUsed) };
  }
  return {
    preview: {
      rows_max: PREVIEW_ROWS,
      calls_remaining_today: gate.kind === 'preview' ? gate.remaining : 0,
      next: previewNextStep(),
    },
  };
}

function sourceListing(): Record<string, unknown>[] {
  return listSources().map((source) => ({
    slug: source.slug,
    title: source.title,
    description: source.description,
    tool: `query_${source.slug.replaceAll('-', '_')}`,
    supported_params: [...Object.keys(source.queryParams.shape), 'q'],
    credit_cost: source.creditCost ?? 1,
    change_feed: hasChangeFeed(source) ? 'get_changes' : null,
    lookup: source.lookup ? [...source.lookup.keys] : null,
  }));
}

function registerQueryTool(
  server: McpServer,
  env: CloudflareBindings,
  keyCtx: KeyContext | null,
  preview: PreviewContext,
  source: DataSource,
): void {
  const schema = buildQuerySchema(source);
  const toolName = `query_${source.slug.replaceAll('-', '_')}`;
  server.registerTool(
    toolName,
    {
      title: source.title,
      description: `${source.description} ${source.lookup ? `One record per call, named by ${source.lookup.keys.join(' or ')} (e.g. ${JSON.stringify(source.lookup.example)}).` : 'Filters combine with AND; q searches all text fields.'} Costs ${creditCost(source)} credit(s) per call with an API key; without one, a preview of up to ${PREVIEW_ROWS} rows (${PREVIEW_CALLS_PER_DAY} calls/day).`,
      inputSchema: schema.shape,
      annotations: { ...READ_ONLY, title: source.title },
    },
    async (args: Record<string, unknown>): Promise<ToolResult> => {
      const missing = missingLookupKey(source, args);
      if (missing) return errorResult(missing);
      const gate = await gateDataCall(env, keyCtx, preview, source, toolName);
      if (gate.kind === 'denied') return errorResult(gate.message);

      let queried;
      try {
        queried = await querySource(
          env,
          source,
          gate.kind === 'preview' ? clampPreviewArgs(args) : args,
        );
      } catch {
        return errorResult(`Source '${source.slug}' is temporarily unavailable, retry later`);
      }

      const result = queried.page;
      return jsonResult({
        ok: true,
        data: result.records,
        meta: {
          source: source.slug,
          page: result.page,
          per_page: result.perPage,
          total: result.total,
          last_refreshed_at: queried.last_refreshed_at,
          ...(await settleDataCall(env, keyCtx, gate)),
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
  preview: PreviewContext,
): void {
  const feeds = listSources().filter(hasChangeFeed);
  if (feeds.length === 0) return;
  const slugs = feeds.map((s) => s.slug) as [string, ...string[]];
  server.registerTool(
    'get_changes',
    {
      title: 'Changes since a date',
      description: `Rows added, removed or changed between daily refreshes of a register dataset (${slugs.join(', ')}), newest first, 90-day history. Poll this instead of re-reading a whole register. \`filter\` takes the source's own query params (see list_sources supported_params, plus q) applied to the changed record — e.g. {"classes":"09","q":"acme"} watches one Nice class of uk-trademark-journal for a mark. Costs 1 credit per call with an API key; without one, a preview of up to ${PREVIEW_ROWS} rows (${PREVIEW_CALLS_PER_DAY} calls/day).`,
      annotations: { ...READ_ONLY, title: 'Changes since a date' },
      inputSchema: {
        source: z.enum(slugs),
        ...changesQuerySchema.shape,
        filter: z
          .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
          .optional()
          .describe(
            "The source's query params (as for its query_ tool, plus q) to match the changed record against",
          ),
      },
    },
    async (args: Record<string, unknown>): Promise<ToolResult> => {
      const source = getSource(String(args.source));
      if (!source?.idOf) return errorResult(`Source '${String(args.source)}' has no change feed`);
      const parsed = changesQuerySchema.safeParse(keyCtx ? args : clampPreviewArgs(args));
      if (!parsed.success) return errorResult('Invalid arguments: ' + parsed.error.message);
      const filters = changeFiltersSchema(source).safeParse(args.filter ?? {});
      if (!filters.success) return errorResult('Invalid filter: ' + filters.error.message);
      const gate = await gateDataCall(env, keyCtx, preview, source, 'get_changes');
      if (gate.kind === 'denied') return errorResult(gate.message);
      const since = parsed.data.since ?? new Date(Date.now() - 7 * 86_400_000).toISOString();
      let result;
      try {
        result = await queryD1Changes(env, source, {
          ...parsed.data,
          since,
          filters: filters.data as Record<string, unknown>,
        });
      } catch {
        return errorResult(`Source '${source.slug}' is temporarily unavailable, retry later`);
      }
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
          ...(await settleDataCall(env, keyCtx, gate)),
        },
      });
    },
  );
}

/**
 * Agent-side sign-up (build routine 2026-09-25): the paywall's audience is
 * agents that cannot click a magic link, so the flow starts inside the agent
 * and the human only approves. Both tools are free and keyless; abuse valves
 * (per-IP, per-email) live in routes/mcp.ts and auth/emailcap.ts.
 */
function registerSignupTools(server: McpServer, env: CloudflareBindings): void {
  server.registerTool(
    'request_api_key',
    {
      title: 'Request a free API key for the user (no browser needed)',
      description: `Start sign-up from inside the agent: give the user's email address and gankdat emails them a one-click approval link with a short code. Show the user the returned code (they approve only if it matches), then call claim_api_key with request_id and claim_secret every ${CLAIM_RETRY_SECONDS}s until it returns the key (${FREE_TIER_CREDITS} free credits/month, no card; an existing account's plan carries over). Free to call; no key needed.`,
      annotations: {
        ...WRITE_SAFE,
        title: 'Request a free API key for the user (no browser needed)',
      },
      inputSchema: {
        email: z.email().describe("The user's email address — they must be able to open the email"),
        client_name: z
          .string()
          .trim()
          .min(1)
          .max(60)
          .optional()
          .describe('Name of the agent or app asking, shown to the user'),
      },
    },
    async (args: { email: string; client_name?: string }): Promise<ToolResult> => {
      if (!emailEnabled(env)) return errorResult('Email sign-up is not configured yet');
      const clientName = args.client_name ?? null;
      if (!(await emailSendAllowed(env, normalizeEmail(args.email)))) {
        return errorResult('Too many sign-up emails for this address; retry in an hour');
      }
      const { request, approveToken } = await createAgentSignup(env, args.email, clientName);
      const link = `${publicBaseUrl(env)}/v1/auth/approve?token=${approveToken}`;
      const sent = await sendEmail(
        env,
        agentKeyRequestEmail(request.email, link, request.code, clientName),
      );
      if (!sent) return errorResult('Could not send the approval email — please try again shortly');
      await recordEmailSend(env, request.email);
      return jsonResult({
        ok: true,
        data: {
          ...request,
          next: `Tell the user: "Check ${request.email} for a gankdat email and approve the request with code ${request.code}." Then call claim_api_key with request_id and claim_secret every ${CLAIM_RETRY_SECONDS}s until status is "approved".`,
        },
      });
    },
  );

  server.registerTool(
    'claim_api_key',
    {
      title: 'Collect the API key once the user has approved',
      description: `Poll after request_api_key: returns status "pending" until the user approves the emailed link, then "approved" with the key exactly once. Send the key as "Authorization: Bearer <key>" on every later request (reconnect the MCP client with that header). Free to call; no key needed.`,
      annotations: { ...WRITE_SAFE, title: 'Collect the API key once the user has approved' },
      inputSchema: {
        request_id: z.string().min(1),
        claim_secret: z.string().min(1),
      },
    },
    async (args: { request_id: string; claim_secret: string }): Promise<ToolResult> => {
      const result = await claimAgentKey(env, args.request_id, args.claim_secret);
      switch (result.status) {
        case 'approved':
          return jsonResult({
            ok: true,
            data: {
              status: 'approved',
              api_key: result.api_key,
              key_id: result.key_id,
              plan: result.plan,
              message:
                'Store this key now — it is shown only once. Send it as: Authorization: Bearer <key>',
            },
          });
        case 'pending':
          return jsonResult({
            ok: true,
            data: {
              status: 'pending',
              approve_by: result.approve_by,
              retry_after_seconds: CLAIM_RETRY_SECONDS,
              message: 'The user has not approved the emailed link yet; ask them to, then retry.',
            },
          });
        case 'not_found':
          return errorResult('Unknown request_id or wrong claim_secret');
        case 'claimed':
          return errorResult('This request already issued its key');
        case 'key_limit':
          return errorResult('Key limit reached (25 active) — revoke a key at /account first');
        default:
          return errorResult('This request expired; call request_api_key again');
      }
    },
  );
}

/**
 * keyCtx is null for anonymous calls (introspection and the keyless preview —
 * see routes/mcp.ts): registries and directories index tools without a key,
 * so every tool registers with its full schema regardless of auth, and every
 * tool answers without one (preview) so an authless listing passes review.
 */
export function buildMcpServer(
  env: CloudflareBindings,
  keyCtx: KeyContext | null,
  preview: PreviewContext = { clientId: 'unknown', userAgent: '' },
): McpServer {
  const server = new McpServer({ name: 'gankdat', version: APP_VERSION });

  server.registerTool(
    'list_sources',
    {
      title: 'List available data sources',
      description:
        'Datasets this API serves, with the tool name and filter params for each. Free to call.',
      inputSchema: {},
      annotations: { ...READ_ONLY, title: 'List available data sources' },
    },
    () => Promise.resolve(jsonResult({ ok: true, data: sourceListing() })),
  );

  server.registerTool(
    'get_usage',
    {
      title: 'Current credit usage',
      description:
        'Plan, credits used/granted/remaining for the presented API key; without a key, the preview calls left today. Free to call.',
      inputSchema: {},
      annotations: { ...READ_ONLY, title: 'Current credit usage' },
    },
    async (): Promise<ToolResult> => {
      if (!keyCtx) {
        const remaining = await previewCallsRemaining(env, preview.clientId);
        return jsonResult({
          ok: true,
          data: {
            plan: 'preview',
            preview: {
              rows_max: PREVIEW_ROWS,
              calls_per_day: PREVIEW_CALLS_PER_DAY,
              calls_remaining_today: remaining,
            },
            next: previewNextStep(),
          },
        });
      }
      const period = currentPeriod();
      const used = await getUsage(env, keyCtx.usageSubject, period);
      const { granted, remaining, alerts } = usageSummary(keyCtx.plan, used);
      return jsonResult({
        ok: true,
        data: { plan: keyCtx.plan, period, used, granted, remaining, alerts },
      });
    },
  );

  server.registerTool(
    'connect_account',
    {
      title: 'Sign in so this chat uses your gankdat plan',
      description:
        "Connect the user's gankdat account (OAuth sign-in prompt in clients that support it, such as Claude): afterwards every tool answers with full pages and the account's credits instead of the preview. Returns the plan and usage once connected. Free to call.",
      inputSchema: {},
      annotations: { ...READ_ONLY, title: 'Sign in so this chat uses your gankdat plan' },
    },
    async (): Promise<ToolResult> => {
      // Unreachable without a token: routes/mcp.ts answers 401 first. Kept as
      // a belt-and-braces tool error for transports that skip the gate.
      if (!keyCtx) return errorResult('Sign in required: ' + previewNextStep());
      const period = currentPeriod();
      const used = await getUsage(env, keyCtx.usageSubject, period);
      const { granted, remaining } = usageSummary(keyCtx.plan, used);
      return jsonResult({
        ok: true,
        data: {
          connected: true,
          account: keyCtx.usageSubject,
          plan: keyCtx.plan,
          period,
          used,
          granted,
          remaining,
          message: `Connected as ${keyCtx.usageSubject} (${keyCtx.plan} plan): data tools now return full pages and bill this account's credits.`,
        },
      });
    },
  );

  registerSignupTools(server, env);
  for (const source of listSources()) {
    registerQueryTool(server, env, keyCtx, preview, source);
  }
  registerChangesTool(server, env, keyCtx, preview);
  return server;
}
