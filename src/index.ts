import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { requestId } from 'hono/request-id';
import { errorHandler, notFoundHandler } from './lib/envelope';
import { structuredLogger } from './middleware/logging';
import { healthRoute } from './routes/health';
import type { AppEnv } from './types';

const app = new Hono<AppEnv>();

app.use('*', requestId());
app.use('*', structuredLogger());
app.use('*', cors());

app.route('/v1/health', healthRoute);

app.onError(errorHandler);
app.notFound(notFoundHandler);

const scheduled: ExportedHandlerScheduledHandler<CloudflareBindings> = async (controller) => {
  // Cron-driven source refresh dispatch lands with the DataSource registry (task 3).
  console.log(JSON.stringify({ level: 'info', event: 'scheduled', cron: controller.cron }));
};

export default {
  fetch: app.fetch,
  scheduled,
} satisfies ExportedHandler<CloudflareBindings>;
