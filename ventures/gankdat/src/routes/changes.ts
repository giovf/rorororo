import { Hono } from 'hono';
import { z } from 'zod';
import { failure, success } from '../lib/envelope';
import { queryD1Changes } from '../sources/d1store';
import { omitEmptyParams, paginationShape } from '../sources/query';
import { getSource, hasChangeFeed } from '../sources/registry';
import type { AppEnv } from '../types';

/** Query params of /v1/changes/:source — shared with the MCP get_changes tool. */
export const changesQuerySchema = z.object({
  /** Only changes observed at or after this date/time (YYYY-MM-DD or ISO). Default: last 7 days. */
  since: z.union([z.iso.date(), z.iso.datetime()]).optional(),
  change: z.enum(['added', 'removed', 'changed']).optional(),
  ...paginationShape,
});

/**
 * "What changed since <date>" for register-style datasets (those with a stable
 * record id): rows added, removed or changed between daily refreshes, newest
 * first. Metered like a data query. Task 51.
 */
export const changesRoutes = new Hono<AppEnv>().get('/:source', async (c) => {
  const slug = c.req.param('source');
  const source = getSource(slug);
  if (!source) return c.json(failure('not_found', `Unknown source '${slug}'`), 404);
  if (!hasChangeFeed(source)) {
    return c.json(
      failure('not_found', `Source '${slug}' has no change feed (no stable record id)`),
      404,
    );
  }
  const parsed = changesQuerySchema.safeParse(omitEmptyParams(c.req.query()));
  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => ({
      param: issue.path.join('.'),
      code: issue.code,
      message: issue.message,
    }));
    return c.json(failure('bad_request', 'Invalid query parameters', details), 400);
  }
  if (c.req.method === 'HEAD') return c.body(null, 200);
  const since = parsed.data.since ?? new Date(Date.now() - 7 * 86_400_000).toISOString();
  const result = await queryD1Changes(c.env, source, { ...parsed.data, since });
  return c.json(
    success(result.rows, {
      source: source.slug,
      since,
      page: parsed.data.page,
      per_page: parsed.data.per_page,
      total: result.total,
      last_refreshed_at: result.last_refreshed_at,
    }),
  );
});
