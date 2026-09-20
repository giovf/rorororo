import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { requestId } from 'hono/request-id';
import { secureHeaders } from 'hono/secure-headers';
import { requireApiKey } from './auth/middleware';
import { errorHandler, notFoundHandler } from './lib/envelope';
import { meterCredits } from './metering/middleware';
import { rateLimit } from './metering/ratelimit';
import { structuredLogger } from './middleware/logging';
import { refreshAllSources } from './sources/store';
import { getSource } from './sources/registry';
import { accountRoutes } from './routes/account';
import { authRoutes } from './routes/auth';
import { billingRoutes } from './routes/billing';
import { dataRoutes } from './routes/data';
import { healthRoute } from './routes/health';
import { keysRoutes } from './routes/keys';
import { mcpRoute } from './routes/mcp';
import { llmsRoute } from './routes/llms';
import { openapiRoute } from './routes/openapi';
import { statsRoutes } from './routes/stats';
import { usageRoute } from './routes/usage';
import { feedbackRoute } from './routes/feedback';
import { waitlistRoute } from './routes/waitlist';
import { x402Routes } from './x402/routes';
import type { AppEnv } from './types';

const app = new Hono<AppEnv>();

app.use('*', requestId());
app.use('*', structuredLogger());
// Dynamic-response hardening (JSON API). Static HTML gets the same via
// public/_headers, which the Workers Assets pipeline serves without the Worker.
app.use(
  '*',
  secureHeaders({
    xFrameOptions: 'DENY',
    xContentTypeOptions: 'nosniff',
    referrerPolicy: 'strict-origin-when-cross-origin',
    strictTransportSecurity: 'max-age=63072000; includeSubDomains',
    // Strict CSP for Worker-generated responses: JSON API (no subresources),
    // the sign-in confirm page, and the /stats pages — none run inline scripts
    // (only inline <style> and ld+json data), so script-src 'self' holds.
    // Static HTML has its own per-page CSP in public/_headers.
    contentSecurityPolicy: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      formAction: ["'self'"],
      baseUri: ["'none'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
    xXssProtection: false,
  }),
);
// CORS: allow cross-origin reads of the PUBLIC, bearer-or-payment-authed API
// (data, openapi, mcp, x402) so third-party sites/agents can call it. Cookie-
// authed routes (/v1/auth, /v1/account) and the Stripe webhook are deliberately
// EXCLUDED — same-origin only — so a future credentials:true can never open them.
// Never combine origin-reflection with credentials on the account routes.
const publicCors = cors();
app.use('/v1/data/*', publicCors);
app.use('/v1/health', publicCors);
app.use('/openapi.json', publicCors);
app.use('/mcp/*', publicCors);
app.use('/x402/*', publicCors);

// Public: /v1/health, /openapi.json, key issuance, and the sources listing
// (GET /v1/data — discovery must work before signup). Authed: per-source data
// (rate-limited + metered) and /v1/usage (free to call).
// Note: '/v1/data/*' would also match the bare listing path, hence ':source'.
app.use('/v1/data/:source', requireApiKey());
// Per-source rate limit (source.rateLimit, default 60/60s) so a high-value niche
// can be throttled independently — resolved per request from the registry.
// Throttle by ACCOUNT (usageSubject), not keyId: quota is per-account, so keying
// the limit on the key would let one account mint many keys to multiply its rate.
app.use('/v1/data/:source', (c, next) => {
  const cfg = getSource(c.req.param('source') ?? '')?.rateLimit ?? { limit: 60, windowSeconds: 60 };
  return rateLimit({
    scope: 'data',
    limit: cfg.limit,
    windowSeconds: cfg.windowSeconds,
    identify: (ctx) => ctx.get('keyCtx')?.usageSubject ?? ctx.get('keyCtx')?.keyId ?? 'anonymous',
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
app.route('/v1/feedback', feedbackRoute);
app.route('/mcp', mcpRoute);
app.route('/x402', x402Routes);
app.route('/openapi.json', openapiRoute);
app.route('/llms.txt', llmsRoute);
// Google Search Console verification. Served by the Worker, NOT public/:
// the assets layer's html_handling 307s exact .html URLs to their pretty
// form, and Google's verifier requires a 200 at this precise path.
app.get('/googlecc09a1f1a708bfc8.html', (c) =>
  c.text('google-site-verification: googlecc09a1f1a708bfc8.html'),
);
app.route('/stats', statsRoutes);

app.onError(errorHandler);
app.notFound(notFoundHandler);

const scheduled: ExportedHandlerScheduledHandler<CloudflareBindings> = (controller, env, ctx) => {
  console.log(JSON.stringify({ level: 'info', event: 'scheduled', cron: controller.cron }));
  ctx.waitUntil(refreshAllSources(env, controller.cron));
};

export default {
  fetch: app.fetch,
  scheduled,
} satisfies ExportedHandler<CloudflareBindings>;
