import { StreamableHTTPTransport } from '@hono/mcp';
import { Hono } from 'hono';
import type { Context } from 'hono';
import { requireApiKey } from '../auth/middleware';
import { failure } from '../lib/envelope';
import { buildMcpServer } from '../mcp/server';
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

// Anonymous only when NO key is presented AND the message is pure
// introspection. A presented key is always validated — a typo'd key should
// 401 loudly, not silently downgrade to anonymous. Reading the body here is
// safe: HonoRequest caches parsed JSON, so the transport's own req.json()
// gets the cached copy, not a consumed stream.
async function isAnonymousIntrospection(c: Context<AppEnv>): Promise<boolean> {
  if (c.req.header('Authorization')) return false;
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return false; // malformed JSON: fall through to auth's 401
  }
  const messages = Array.isArray(body) ? body : [body];
  return (
    messages.length > 0 &&
    messages.every((message) => {
      if (typeof message !== 'object' || message === null) return false;
      const { method } = message as { method?: unknown };
      return typeof method === 'string' && INTROSPECTION_METHODS.has(method);
    })
  );
}

// Comma-joined sorted unique JSON-RPC method names from the (possibly batched)
// body, recorded in analytics blobs. Same cached-parse safety note as
// isAnonymousIntrospection; '' when the body is malformed JSON.
async function requestMethods(c: Context<AppEnv>): Promise<string> {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return '';
  }
  const messages = Array.isArray(body) ? body : [body];
  const methods = new Set<string>();
  for (const message of messages) {
    const method =
      typeof message === 'object' && message !== null
        ? (message as { method?: unknown }).method
        : undefined;
    methods.add(typeof method === 'string' ? method : '(invalid)');
  }
  return [...methods].sort().join(',');
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

export const mcpRoute = new Hono<AppEnv>().post(
  '/',
  async (c, next) => {
    if (await isAnonymousIntrospection(c)) {
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
      return next();
    }
    // requireApiKey's 401 short-circuits before the analytics write in the
    // final handler, which would hide the strongest adoption signal there is:
    // an agent attempting tools/call without a key. Record rejections here.
    const response = await requireApiKey()(c, next);
    if (response instanceof Response && response.status === 401) {
      c.env.TRAFFIC.writeDataPoint({
        blobs: [
          'mcp_denied',
          c.req.header('User-Agent') ?? '',
          await requestMethods(c),
          c.req.header('Authorization') ? 'bad_key' : 'no_key',
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
    c.env.TRAFFIC.writeDataPoint({
      blobs: [
        c.get('keyCtx') ? 'mcp_authed' : 'mcp_anon',
        c.req.header('User-Agent') ?? '',
        await requestMethods(c),
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
