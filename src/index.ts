import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { requestId } from 'hono/request-id';
import { requireApiKey } from './auth/middleware';
import { errorHandler, notFoundHandler } from './lib/envelope';
import { meterCredits } from './metering/middleware';
import { rateLimit } from './metering/ratelimit';
import { structuredLogger } from './middleware/logging';
import { refreshAllSources } from './sources/cache';
import { getSource } from './sources/registry';
import { accountRoutes } from './routes/account';
import { authRoutes } from './routes/auth';
import { billingRoutes } from './routes/billing';
import { dataRoutes } from './routes/data';
import { healthRoute } from './routes/health';
import { keysRoutes } from './routes/keys';
import { mcpRoute } from './routes/mcp';
import { openapiRoute } from './routes/openapi';
import { usageRoute } from './routes/usage';
import { waitlistRoute } from './routes/waitlist';
import { x402Routes } from './x402/routes';
import type { AppEnv } from './types';

const app = new Hono<AppEnv>();

app.use('*', requestId());
app.use('*', structuredLogger());
app.use('*', cors());

// Public: /v1/health, /openapi.json, key issuance, and the sources listing
// (GET /v1/data — discovery must work before signup). Authed: per-source data
// (rate-limited + metered) and /v1/usage (free to call).
// Note: '/v1/data/*' would also match the bare listing path, hence ':source'.
app.use('/v1/data/:source', requireApiKey());
// Per-source rate limit (source.rateLimit, default 60/60s) so a high-value niche
// can be throttled independently — resolved per request from the registry.
app.use('/v1/data/:source', (c, next) => {
  const cfg = getSource(c.req.param('source') ?? '')?.rateLimit ?? { limit: 60, windowSeconds: 60 };
  return rateLimit({
    scope: 'data',
    limit: cfg.limit,
    windowSeconds: cfg.windowSeconds,
    identify: (ctx) => ctx.get('keyCtx')?.keyId ?? 'anonymous',
  })(c, next);
});
app.use('/v1/data/:source', meterCredits());
app.use('/v1/usage', requireApiKey());

app.route('/v1/health', healthRoute);
app.route('/v1/data', dataRoutes);
app.route('/v1/keys', keysRoutes);
app.route('/v1/usage', usageRoute);
app.route('/v1/auth', authRoutes);
app.route('/v1/account', accountRoutes);
app.route('/v1/billing', billingRoutes);
app.route('/v1/waitlist', waitlistRoute);
app.route('/mcp', mcpRoute);
app.route('/x402', x402Routes);
app.route('/openapi.json', openapiRoute);

app.onError(errorHandler);
app.notFound(notFoundHandler);

const scheduled: ExportedHandlerScheduledHandler<CloudflareBindings> = (controller, env, ctx) => {
  console.log(JSON.stringify({ level: 'info', event: 'scheduled', cron: controller.cron }));
  ctx.waitUntil(refreshAllSources(env));
};

export default {
  fetch: app.fetch,
  scheduled,
} satisfies ExportedHandler<CloudflareBindings>;
