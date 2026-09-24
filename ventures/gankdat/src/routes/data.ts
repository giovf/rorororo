import { Hono } from 'hono';
import type { Context } from 'hono';
import { failure, success } from '../lib/envelope';
import { getSource, hasChangeFeed, listSources } from '../sources/registry';
import { buildQuerySchema, omitEmptyParams } from '../sources/query';
import { querySource } from '../sources/store';
import type { AppEnv } from '../types';

/**
 * Core source-query flow, shared by the authed REST route and the x402
 * pay-per-request route (which differ only in what guards them).
 */
export async function handleSourceQuery(c: Context<AppEnv>): Promise<Response> {
  const slug = c.req.param('source') ?? '';
  const source = getSource(slug);
  if (!source) {
    return c.json(failure('not_found', `Unknown source '${slug}'`), 404);
  }

  const parsed = buildQuerySchema(source).safeParse(omitEmptyParams(c.req.query()));
  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => ({
      param: issue.path.join('.'),
      code: issue.code,
      message: issue.message,
    }));
    return c.json(failure('bad_request', 'Invalid query parameters', details), 400);
  }

  // HEAD is unmetered (meterCredits skips it), so don't run the query — that
  // would let a HEAD probe drive an expensive scan / origin read for free.
  // Answer liveness with a bodyless 200 after validation.
  if (c.req.method === 'HEAD') {
    return c.body(null, 200);
  }

  let queried;
  try {
    queried = await querySource(c.env, source, parsed.data);
  } catch {
    // Failure detail is in refresh_log / logs; clients get a clean 503.
    return c.json(
      failure('unavailable', `Source '${slug}' is temporarily unavailable, retry later`),
      503,
    );
  }

  const result = queried.page;
  return c.json(
    success(result.records, {
      source: source.slug,
      page: result.page,
      per_page: result.perPage,
      total: result.total,
      last_refreshed_at: queried.last_refreshed_at,
    }),
  );
}

export const dataRoutes = new Hono<AppEnv>()
  .get('/', (c) => {
    const sources = listSources().map((source) => ({
      slug: source.slug,
      title: source.title,
      description: source.description,
      supported_params: [...Object.keys(source.queryParams.shape), 'q'],
      refresh_cron: source.refresh.cron,
      credit_cost: source.creditCost ?? 1,
      change_feed: hasChangeFeed(source) ? `/v1/changes/${source.slug}` : null,
    }));
    return c.json(success(sources, { total: sources.length }));
  })
  .get('/:source', handleSourceQuery);
