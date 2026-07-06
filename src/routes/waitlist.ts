import { Hono } from 'hono';
import { z } from 'zod';
import { failure, success } from '../lib/envelope';
import { rateLimit } from '../metering/ratelimit';
import type { AppEnv } from '../types';

const waitlistBodySchema = z.object({
  email: z.email(),
  source: z.string().trim().max(100).optional(),
});

const waitlistRateLimit = rateLimit({
  scope: 'waitlist',
  limit: 10,
  windowSeconds: 3600,
  identify: (c) => c.req.header('CF-Connecting-IP') ?? 'unknown',
});

export const waitlistRoute = new Hono<AppEnv>().post('/', waitlistRateLimit, async (c) => {
  const parsed = waitlistBodySchema.safeParse(await c.req.json().catch(() => ({})));
  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      code: issue.code,
      message: issue.message,
    }));
    return c.json(failure('bad_request', 'Invalid request body', details), 400);
  }

  // Idempotent: re-subscribing the same email is a silent success.
  await c.env.DB.prepare(
    'INSERT INTO waitlist (email, source) VALUES (?1, ?2) ON CONFLICT (email) DO NOTHING',
  )
    .bind(parsed.data.email, parsed.data.source ?? null)
    .run();

  return c.json(success({ subscribed: true }));
});
