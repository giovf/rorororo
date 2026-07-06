import { listSources } from './registry';
import type { DataSource } from './types';

export interface CachedPayload {
  records: unknown[];
  last_refreshed_at: string;
}

const dataKey = (slug: string): string => `data:${slug}`;

// Keep the last-good payload well past its freshness window so it can be served
// stale while the origin is down (freshness is judged in code, not by KV TTL).
const STALE_RETENTION_FACTOR = 7;

function isFresh(payload: CachedPayload, source: DataSource): boolean {
  return Date.now() - Date.parse(payload.last_refreshed_at) < source.refresh.cacheTtlSeconds * 1000;
}

/**
 * Serve fresh cache; on staleness/miss, refresh. If the refresh fails, serve the
 * last-known-good payload rather than erroring (only a cold cache + failing
 * origin surfaces as a 503). No cross-request single-flight — concurrent misses
 * each refresh; a Durable Object is the coalescing upgrade path (PRD), not built.
 */
export async function readCached(
  env: CloudflareBindings,
  source: DataSource,
): Promise<CachedPayload> {
  const hit = await env.CACHE.get<CachedPayload>(dataKey(source.slug), 'json');
  if (hit && isFresh(hit, source)) return hit;
  try {
    return await refreshSource(env, source);
  } catch (err) {
    if (hit) {
      console.log(
        JSON.stringify({
          level: 'warn',
          event: 'served_stale',
          source: source.slug,
          last_refreshed_at: hit.last_refreshed_at,
          reason: err instanceof Error ? err.message : String(err),
        }),
      );
      return hit;
    }
    throw err;
  }
}

/** Pull fresh records, cache them, and record the attempt in refresh_log. */
export async function refreshSource(
  env: CloudflareBindings,
  source: DataSource,
): Promise<CachedPayload> {
  const start = Date.now();
  try {
    const records = await source.fetchFresh(env);
    // A live source that suddenly returns nothing is almost always an origin
    // outage or schema change, not a real empty dataset. Treat it as an error so
    // the good cache is retained (readCached serves it stale) and refresh_log
    // shows the failure, instead of silently caching an empty result as healthy.
    if (records.length === 0) {
      throw new Error('refresh returned 0 records');
    }
    const payload: CachedPayload = { records, last_refreshed_at: new Date().toISOString() };
    await env.CACHE.put(dataKey(source.slug), JSON.stringify(payload), {
      expirationTtl: Math.max(60, source.refresh.cacheTtlSeconds * STALE_RETENTION_FACTOR),
    });
    await writeRefreshLog(env, source.slug, 'ok', records.length, Date.now() - start, null);
    return payload;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await writeRefreshLog(env, source.slug, 'error', 0, Date.now() - start, message);
    throw err;
  }
}

/** Cron entrypoint: refresh every source whose cron matches; never throws. */
export async function refreshMatchingSources(
  env: CloudflareBindings,
  cron: string,
): Promise<void> {
  for (const source of listSources()) {
    if (source.refresh.cron !== cron) continue;
    try {
      await refreshSource(env, source);
    } catch (err) {
      // Already recorded in refresh_log; keep the loop alive for other sources.
      console.error(
        JSON.stringify({
          level: 'error',
          event: 'refresh_failed',
          source: source.slug,
          message: err instanceof Error ? err.message : String(err),
        }),
      );
    }
  }
}

async function writeRefreshLog(
  env: CloudflareBindings,
  slug: string,
  status: 'ok' | 'error',
  records: number,
  durationMs: number,
  message: string | null,
): Promise<void> {
  try {
    await env.DB.prepare(
      'INSERT INTO refresh_log (source_slug, status, records, duration_ms, message) VALUES (?1, ?2, ?3, ?4, ?5)',
    )
      .bind(slug, status, records, durationMs, message)
      .run();
  } catch (err) {
    // Guarded: a missing local migration must not take the API down.
    console.error(
      JSON.stringify({
        level: 'error',
        event: 'refresh_log_write_failed',
        source: slug,
        message: err instanceof Error ? err.message : String(err),
      }),
    );
  }
}
