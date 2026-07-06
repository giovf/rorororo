import { Hono } from 'hono';
import { success } from '../lib/envelope';
import { currentPeriod, getUsage } from '../metering/counters';
import { usageSummary } from '../metering/quota';
import type { AppEnv } from '../types';

// Authed but unmetered: checking your balance never costs credits.
export const usageRoute = new Hono<AppEnv>().get('/', async (c) => {
  const keyCtx = c.get('keyCtx')!;
  const period = currentPeriod();
  const used = await getUsage(c.env, keyCtx.usageSubject, period);
  const { granted, remaining, alerts } = usageSummary(keyCtx.plan, used);

  return c.json(success({ plan: keyCtx.plan, period, used, granted, remaining, alerts }));
});
