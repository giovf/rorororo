import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { requestId } from 'hono/request-id';
import { errorHandler, notFoundHandler } from './lib/envelope';
import { structuredLogger } from './middleware/logging';
import { refreshMatchingSources } from './sources/cache';
import { dataRoutes } from './routes/data';
import { healthRoute } from './routes/health';
import { openapiRoute } from './routes/openapi';
import type { AppEnv } from './types';

const app = new Hono<AppEnv>();

app.use('*', requestId());
app.use('*', structuredLogger());
app.use('*', cors());

app.route('/v1/health', healthRoute);
app.route('/v1/data', dataRoutes);
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
