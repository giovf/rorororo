import { StreamableHTTPTransport } from '@hono/mcp';
import { Hono } from 'hono';
import type { Context } from 'hono';
import { requireApiKey } from '../auth/middleware';
import { SIGNUP_RATE_LIMIT } from '../auth/signup';
import { failure } from '../lib/envelope';
import { buildMcpServer, MCP_NO_KEY_HINT, SIGNUP_TOOLS } from '../mcp/server';
import { isolateRateLimit, rateLimit } from '../metering/ratelimit';
import type { AppEnv } from '../types';

// Stateless Streamable HTTP: Workers are stateless, so every request gets a
// fresh server + transport pair (no session ids). Tool execution uses the same
// bearer API key as REST; metering happens per tool call inside the handlers.
//
// POST only: a stateless server never pushes server-initiated notifications, so
// GET would just open a hanging SSE stream with a live keepalive timer, and
// DELETE (session teardown) is meaningless without sessions. Both 404 here.

// Methods a registry or directory crawler needs to index this server (the
// official MCP Registry's aggregators, Glama, Smithery all introspect tools by
// calling these). Metadata only — none touches an account or debits credits.
const INTROSPECTION_METHODS = new Set([
  'initialize',
  'notifications/initialized',
  'ping',
  'tools/list',
]);

// What an unauthenticated request may do. Anonymous only when NO key is
// presented — a presented key is always validated (a typo'd key should 401
// loudly, not silently downgrade to anonymous). 'introspection' is metadata
// only; 'signup' is the agent-side sign-up tools (request_api_key /
// claim_api_key — the one tools/call that must work without a key, since it
// is how a key is obtained); 'request' marks a message that sends an email
// and so gets the stricter KV-backed budget. Reading the body here is safe:
// HonoRequest caches parsed JSON, so the transport's own req.json() gets the
// cached copy, not a consumed stream.
type AnonymousKind = 'introspection' | 'signup' | 'request' | null;

async function anonymousKind(c: Context<AppEnv>): Promise<AnonymousKind> {
  if (c.req.header('Authorization')) return null;
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return null; // malformed JSON: fall through to auth's 401
  }
  const messages = Array.isArray(body) ? body : [body];
  if (messages.length === 0) return null;
  let kind: AnonymousKind = 'introspection';
  for (const message of messages) {
    if (typeof message !== 'object' || message === null) return null;
    const { method, params } = message as { method?: unknown; params?: { name?: unknown } };
    if (typeof method !== 'string') return null;
    if (INTROSPECTION_METHODS.has(method)) continue;
    if (
      method === 'tools/call' &&
      typeof params?.name === 'string' &&
      SIGNUP_TOOLS.has(params.name)
    ) {
      if (params.name === 'request_api_key') kind = 'request';
      else if (kind !== 'request') kind = 'signup';
      continue;
    }
    return null;
  }
  return kind;
}

// Comma-joined sorted unique JSON-RPC method names from the (possibly batched)
// body, recorded in analytics blobs. Same cached-parse safety note as
// isAnonymousIntrospection; '' when the body is malformed JSON.
/** JSON-RPC method(s) and, for tools/call, the tool name(s) — which dataset an agent wanted. */
async function requestShape(c: Context<AppEnv>): Promise<{ methods: string; tools: string }> {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return { methods: '', tools: '' };
  }
  const messages = Array.isArray(body) ? body : [body];
  const methods = new Set<string>();
  const tools = new Set<string>();
  for (const message of messages) {
    const msg =
      typeof message === 'object' && message !== null
        ? (message as { method?: unknown; params?: { name?: unknown } })
        : {};
    methods.add(typeof msg.method === 'string' ? msg.method : '(invalid)');
    if (msg.method === 'tools/call' && typeof msg.params?.name === 'string') {
      tools.add(msg.params.name.slice(0, 64));
    }
  }
  return { methods: [...methods].sort().join(','), tools: [...tools].sort().join(',') };
}

// Anonymous introspection is limited in-isolate (zero KV ops): crawler waves
// after directory listings were burning the KV write budget one put per
// request, and metadata reads don't need globally-accurate accounting.
const ANON_LIMIT = 120;
const ANON_WINDOW_SECONDS = 60;

// Authed traffic keeps KV-backed accounting, per-account (quota is
// per-account, so keying on the key would let one account mint many keys to
// multiply its effective rate).
const authedRateLimit = rateLimit({
  scope: 'mcp',
  limit: 60,
  windowSeconds: 60,
  identify: (c) => c.get('keyCtx')?.usageSubject ?? c.get('keyCtx')?.keyId ?? 'unknown',
});

// Sign-up requests send an email, so they share the login-sized per-IP budget
// (KV-backed, same scope as POST /v1/auth/agent-signup). Claim polls are cheap
// D1 reads and ride the in-isolate limiter like introspection.
const signupRequestRateLimit = rateLimit({
  ...SIGNUP_RATE_LIMIT,
  identify: (c) => c.req.header('CF-Connecting-IP') ?? 'unknown',
});

export const mcpRoute = new Hono<AppEnv>().post(
  '/',
  async (c, next) => {
    const kind = await anonymousKind(c);
    if (kind !== null) {
      const ip = c.req.header('CF-Connecting-IP') ?? 'unknown';
      const retryAfter = isolateRateLimit(`mcp:${ip}`, ANON_LIMIT, ANON_WINDOW_SECONDS);
      if (retryAfter > 0) {
        c.header('Retry-After', String(retryAfter));
        return c.json(
          failure(
            'rate_limited',
            `Rate limit exceeded (${ANON_LIMIT} per ${ANON_WINDOW_SECONDS}s); retry later`,
          ),
          429,
        );
      }
      return kind === 'request' ? signupRequestRateLimit(c, next) : next();
    }
    // requireApiKey's 401 short-circuits before the analytics write in the
    // final handler, which would hide the strongest adoption signal there is:
    // an agent attempting tools/call without a key. Record rejections here.
    const response = await requireApiKey(MCP_NO_KEY_HINT)(c, next);
    if (response instanceof Response && response.status === 401) {
      const shape = await requestShape(c);
      c.env.TRAFFIC.writeDataPoint({
        // blob5 = tool name(s) on tools/call: which dataset the agent wanted (task 52).
        blobs: [
          'mcp_denied',
          c.req.header('User-Agent') ?? '',
          shape.methods,
          c.req.header('Authorization') ? 'bad_key' : 'no_key',
          shape.tools,
        ],
        doubles: [1],
        indexes: ['mcp_denied'],
      });
    }
    return response;
  },
  // Anonymous requests were already limited above; keyCtx present ⇒ authed.
  async (c, next) => (c.get('keyCtx') ? authedRateLimit(c, next) : next()),
  async (c) => {
    // Adoption analytics (fire-and-forget, no request-path cost): who calls
    // /mcp and which method — splits crawler introspection (initialize,
    // tools/list) from real tool usage. UA only, no IPs (data-minimization).
    const shape = await requestShape(c);
    c.env.TRAFFIC.writeDataPoint({
      blobs: [
        c.get('keyCtx') ? 'mcp_authed' : 'mcp_anon',
        c.req.header('User-Agent') ?? '',
        shape.methods,
        '',
        shape.tools,
      ],
      doubles: [1],
      indexes: [c.get('keyCtx') ? 'mcp_authed' : 'mcp_anon'],
    });

    const server = buildMcpServer(c.env, c.get('keyCtx') ?? null);
    const transport = new StreamableHTTPTransport();
    await server.connect(transport);
    const response = await transport.handleRequest(c);
    // The per-request server/transport are unreferenced after this returns and
    // GC'd by the isolate; no standalone stream or timer is left open (POST only).
    return response ?? c.body(null, 202);
  },
);
