import { StreamableHTTPTransport } from '@hono/mcp';
import { Hono } from 'hono';
import { requireApiKey } from '../auth/middleware';
import { buildMcpServer } from '../mcp/server';
import { rateLimit } from '../metering/ratelimit';
import type { AppEnv } from '../types';

// Stateless Streamable HTTP: Workers are stateless, so every request gets a
// fresh server + transport pair (no session ids). Auth is the same bearer API
// key as REST; metering happens per tool call inside the handlers.
export const mcpRoute = new Hono<AppEnv>().all(
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
    return response ?? c.body(null, 202);
  },
);
