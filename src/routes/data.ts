import { Hono } from 'hono';
import { failure, success } from '../lib/envelope';
import { getSource, listSources } from '../sources/registry';
import { applyQuery, buildQuerySchema } from '../sources/query';
import type { AppEnv } from '../types';

// last_refreshed_at is null until the KV cache + refresh pipeline lands (task 3).
const LAST_REFRESHED_AT: string | null = null;

export const dataRoutes = new Hono<AppEnv>()
  .get('/', (c) => {
    const sources = listSources().map((source) => ({
      slug: source.slug,
      title: source.title,
      description: source.description,
      supported_params: Object.keys(source.queryParams.shape),
      refresh_cron: source.refresh.cron,
      credit_cost: source.creditCost ?? 1,
      last_refreshed_at: LAST_REFRESHED_AT,
    }));
    return c.json(success(sources, { total: sources.length }));
  })
  .get('/:source', async (c) => {
    const slug = c.req.param('source');
    const source = getSource(slug);
    if (!source) {
      return c.json(failure('not_found', `Unknown source '${slug}'`), 404);
    }

    const parsed = buildQuerySchema(source).safeParse(c.req.query());
    if (!parsed.success) {
      const details = parsed.error.issues.map((issue) => ({
        param: issue.path.join('.'),
        code: issue.code,
        message: issue.message,
      }));
      return c.json(failure('bad_request', 'Invalid query parameters', details), 400);
    }

    const records = await source.fetchFresh(c.env);
    const result = applyQuery(records, parsed.data);
    return c.json(
      success(result.records, {
        source: source.slug,
        page: result.page,
        per_page: result.perPage,
        total: result.total,
        last_refreshed_at: LAST_REFRESHED_AT,
      }),
    );
  });
