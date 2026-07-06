import type { MiddlewareHandler } from 'hono';
import { creditCost } from './costs';
import { currentPeriod, getUsage, incrementUsage } from './counters';
import { failure } from '../lib/envelope';
import { getSource } from '../sources/registry';
import type { AppEnv } from '../types';

const NUDGE_MESSAGES: Record<string, string> = {
  '80': 'Approaching your monthly quota — consider upgrading',
  '100': 'Monthly quota exhausted — upgrade to keep access',
};

function alertThreshold(used: number, granted: number): '80' | '100' | undefined {
  if (granted <= 0 || used >= granted) return '100';
  if (used >= granted * 0.8) return '80';
  return undefined;
}

/**
 * Runs after auth on metered routes. Rejects exhausted quotas with a 402
 * envelope; otherwise charges successful responses, sets credit headers, and
 * surfaces upgrade nudges (header + meta.usage_alert) from 80% usage.
 */
export function meterCredits(): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const keyCtx = c.get('keyCtx');
    if (!keyCtx) return next(); // auth must be mounted before metering

    const cost = creditCost(getSource(c.req.param('source') ?? ''));
    const period = currentPeriod();
    const granted = keyCtx.creditsGranted;
    const used = await getUsage(c.env, keyCtx.keyId, period);

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

    const newUsed = await incrementUsage(c.env, keyCtx.keyId, cost, period);
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
