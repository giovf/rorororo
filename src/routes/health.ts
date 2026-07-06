import { Hono } from 'hono';
import { APP_VERSION } from '../lib/constants';
import { success } from '../lib/envelope';
import type { AppEnv } from '../types';

// Unauthenticated liveness endpoint (uptime-monitor target).
export const healthRoute = new Hono<AppEnv>().get('/', (c) =>
  c.json(success({ status: 'ok', version: APP_VERSION })),
);
