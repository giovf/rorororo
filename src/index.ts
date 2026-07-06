import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { requestId } from 'hono/request-id';
import { requireApiKey } from './auth/middleware';
import { errorHandler, notFoundHandler } from './lib/envelope';
import { meterCredits } from './metering/middleware';
import { rateLimit } from './metering/ratelimit';
import { structuredLogger } from './middleware/logging';
import { refreshMatchingSources } from './sources/cache';
import { dataRoutes } from './routes/data';
import { healthRoute } from './routes/health';
import { keysRoutes } from './routes/keys';
import { openapiRoute } from './routes/openapi';
import { usageRoute } from './routes/usage';
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
app.use(
  '/v1/data/:source',
  rateLimit({
    scope: 'data',
    limit: 60,
    windowSeconds: 60,
    identify: (c) => c.get('keyCtx')?.keyId ?? 'anonymous',
  }),
);
app.use('/v1/data/:source', meterCredits());
app.use('/v1/usage', requireApiKey());

app.route('/v1/health', healthRoute);
app.route('/v1/data', dataRoutes);
app.route('/v1/keys', keysRoutes);
app.route('/v1/usage', usageRoute);
app.route('/openapi.json', openapiRoute);

app.onError(errorHandler);
app.notFound(notFoundHandler);

const scheduled: ExportedHandlerScheduledHandler<CloudflareBindings> = (controller, env, ctx) => {
  console.log(JSON.stringify({ level: 'info', event: 'scheduled', cron: controller.cron }));
  ctx.waitUntil(refreshMatchingSources(env, controller.cron));
};

export default {
  fetch: app.fetch,
  scheduled,
} satisfies ExportedHandler<CloudflareBindings>;
