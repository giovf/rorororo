import type { MiddlewareHandler } from 'hono';
import { creditCost } from './costs';
import { currentPeriod, getUsage, incrementUsage } from './counters';
import { alertThreshold, NUDGE_MESSAGES } from './quota';
import { planAllowance } from '../billing/plans';
import { failure } from '../lib/envelope';
import { getSource } from '../sources/registry';
import type { AppEnv } from '../types';

/**
 * Runs after auth on metered routes. Rejects exhausted quotas with a 402
 * envelope; otherwise charges successful responses, sets credit headers, and
 * surfaces upgrade nudges (header + meta.usage_alert) from 80% usage.
 */
export function meterCredits(): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const keyCtx = c.get('keyCtx');
    if (!keyCtx) return next(); // auth must be mounted before metering

    // HEAD is re-dispatched as GET by Hono but returns no body; don't bill or
    // count it (a bodyless probe shouldn't consume credits).
    if (c.req.method === 'HEAD') return next();

    const cost = creditCost(getSource(c.req.param('source') ?? ''));
    const period = currentPeriod();
    const granted = planAllowance(keyCtx.plan);
    const used = await getUsage(c.env, keyCtx.usageSubject, period);

    if (used + cost > granted) {
      c.header('X-Credits-Limit', String(granted));
      c.header('X-Credits-Remaining', '0');
      return c.json(
        failure(
          'quota_exceeded',
          `Monthly credit quota exhausted (${granted}); upgrade or wait for the next period`,
        ),
        402,
      );
    }

    await next();
    if (!c.res.ok) return; // only successful responses are charged

    const newUsed = await incrementUsage(c.env, keyCtx.usageSubject, cost, period);
    c.set('creditsCharged', cost);
    c.res.headers.set('X-Credits-Limit', String(granted));
    c.res.headers.set('X-Credits-Remaining', String(Math.max(0, granted - newUsed)));

    const alert = alertThreshold(newUsed, granted);
    if (!alert) return;

    c.res.headers.set('X-Upgrade-Nudge', NUDGE_MESSAGES[alert]!);
    console.log(
      JSON.stringify({
        level: 'info',
        event: 'usage_alert',
        keyId: keyCtx.keyId,
        threshold: alert,
        used: newUsed,
        granted,
      }),
    );
    if (c.res.headers.get('content-type')?.includes('application/json')) {
      const body = (await c.res.json()) as { ok?: boolean; meta?: Record<string, unknown> };
      if (body.ok === true) {
        body.meta = { ...(body.meta ?? {}), usage_alert: alert };
      }
      c.res = new Response(JSON.stringify(body), c.res);
    }
  };
}
