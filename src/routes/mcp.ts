import { StreamableHTTPTransport } from '@hono/mcp';
import { Hono } from 'hono';
import { requireApiKey } from '../auth/middleware';
import { buildMcpServer } from '../mcp/server';
import { rateLimit } from '../metering/ratelimit';
import type { AppEnv } from '../types';

// Stateless Streamable HTTP: Workers are stateless, so every request gets a
// fresh server + transport pair (no session ids). Auth is the same bearer API
// key as REST; metering happens per tool call inside the handlers.
//
// POST only: a stateless server never pushes server-initiated notifications, so
// GET would just open a hanging SSE stream with a live keepalive timer, and
// DELETE (session teardown) is meaningless without sessions. Both 404 here.
export const mcpRoute = new Hono<AppEnv>().post(
  '/',
  requireApiKey(),
  rateLimit({
    scope: 'mcp',
    limit: 60,
    windowSeconds: 60,
    identify: (c) => c.get('keyCtx')?.keyId ?? 'anonymous',
  }),
  async (c) => {
    const server = buildMcpServer(c.env, c.get('keyCtx')!);
    const transport = new StreamableHTTPTransport();
    await server.connect(transport);
    const response = await transport.handleRequest(c);
    // The per-request server/transport are unreferenced after this returns and
    // GC'd by the isolate; no standalone stream or timer is left open (POST only).
    return response ?? c.body(null, 202);
  },
);
