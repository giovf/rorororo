import type { Context, MiddlewareHandler } from 'hono';
import { failure } from '../lib/envelope';
import type { AppEnv } from '../types';

export interface RateLimitOptions {
  /** Namespaces the RATE KV keys, e.g. 'data', 'keys'. */
  scope: string;
  limit: number;
  windowSeconds: number;
  /** What to count by — key id for authed routes, IP for public ones. */
  identify: (c: Context<AppEnv>) => string;
}

/**
 * Fixed-window counter on the RATE KV namespace — best-effort by design
 * (same KV caveats as metering counters; Durable Objects are the accurate
 * upgrade path, not built for v1).
 */
export function rateLimit(options: RateLimitOptions): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const window = Math.floor(nowSeconds / options.windowSeconds);
    const key = `rl:${options.scope}:${options.identify(c)}:${window}`;

    const current = Number((await c.env.RATE.get(key)) ?? '0');
    if (current >= options.limit) {
      const retryAfter = options.windowSeconds - (nowSeconds % options.windowSeconds);
      c.header('Retry-After', String(retryAfter));
      return c.json(
        failure(
          'rate_limited',
          `Rate limit exceeded (${options.limit} per ${options.windowSeconds}s); retry later`,
        ),
        429,
      );
    }
    await c.env.RATE.put(key, String(current + 1), {
      expirationTtl: Math.max(60, options.windowSeconds * 2),
    });
    await next();
  };
}
