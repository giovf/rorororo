import { Hono } from 'hono';
import { success } from '../lib/envelope';
import { currentPeriod, getUsage } from '../metering/counters';
import type { AppEnv } from '../types';

// Authed but unmetered: checking your balance never costs credits.
export const usageRoute = new Hono<AppEnv>().get('/', async (c) => {
  const keyCtx = c.get('keyCtx')!;
  const period = currentPeriod();
  const used = await getUsage(c.env, keyCtx.keyId, period);
  const granted = keyCtx.creditsGranted;

  const alerts: string[] = [];
  if (granted <= 0 || used >= granted) alerts.push('100');
  else if (used >= granted * 0.8) alerts.push('80');

  return c.json(
    success({
      plan: keyCtx.plan,
      period,
      used,
      granted,
      remaining: Math.max(0, granted - used),
      alerts,
    }),
  );
});
