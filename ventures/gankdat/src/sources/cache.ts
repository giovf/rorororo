import { computeStats } from '../lib/stats';
import type { SourceStats } from '../lib/stats';
import type { DataSource } from './types';

export interface CachedPayload {
  records: unknown[];
  last_refreshed_at: string;
}

export interface CachedStats {
  stats: SourceStats;
  last_refreshed_at: string;
}

const dataKey = (slug: string): string => `data:${slug}`;
const statsKey = (slug: string): string => `srcstats:${slug}`;
const refreshLockKey = (slug: string): string => `refreshlock:${slug}`;

// Keep the last-good payload well past its freshness window so it can be served
// stale while the origin is down (freshness is judged in code, not by KV TTL).
const STALE_RETENTION_FACTOR = 7;

// Best-effort single-flight window. Concurrent request-path refreshers see the
// lock and serve stale (or 503) instead of each hammering the upstream — which
// for keyed/fair-use origins (Companies House 600/5min, Gazette 5/10s) means a
// refresh storm can no longer get our shared key banned. Best-effort only: KV
// has no atomic CAS, so this coalesces but doesn't perfectly serialize; the TTL
// bounds a crashed holder. Cron refreshes bypass it (they must always run).
const REFRESH_LOCK_TTL_SECONDS = 120;

/** Precomputed /stats payload; written at refresh, read by the public page. */
export async function readSourceStats(
  env: CloudflareBindings,
  slug: string,
): Promise<CachedStats | null> {
  return env.CACHE.get<CachedStats>(statsKey(slug), 'json');
}

export async function putSourceStats(
  env: CloudflareBindings,
  source: DataSource,
  stats: SourceStats,
  lastRefreshedAt: string,
): Promise<void> {
  const payload: CachedStats = { stats, last_refreshed_at: lastRefreshedAt };
  await env.CACHE.put(statsKey(source.slug), JSON.stringify(payload), {
    expirationTtl: Math.max(60, source.refresh.cacheTtlSeconds * STALE_RETENTION_FACTOR),
  });
}

function isFresh(payload: CachedPayload, source: DataSource): boolean {
  return Date.now() - Date.parse(payload.last_refreshed_at) < source.refresh.cacheTtlSeconds * 1000;
}

/**
 * Non-refreshing snapshot read (KV sources): returns the last-good payload if
 * present, else null. Used by /stats to compute from the existing snapshot
 * without ever triggering an origin refresh.
 */
export async function readSnapshot(
  env: CloudflareBindings,
  slug: string,
): Promise<CachedPayload | null> {
  return env.CACHE.get<CachedPayload>(dataKey(slug), 'json');
}

/**
 * Serve fresh cache; on staleness/miss, refresh — but coalesce concurrent
 * request-path refreshers via a best-effort KV lock so a burst of misses can't
 * storm a keyed/fair-use origin. If refresh fails or the lock is held by
 * another refresher, serve the last-known-good payload; only a cold cache with
 * nothing to serve surfaces as a 503.
 */
export async function readCached(
  env: CloudflareBindings,
  source: DataSource,
): Promise<CachedPayload> {
  const hit = await env.CACHE.get<CachedPayload>(dataKey(source.slug), 'json');
  if (hit && isFresh(hit, source)) return hit;

  const lockKey = refreshLockKey(source.slug);
  let acquired = false;
  let busy = false;
  try {
    if (await env.CACHE.get(lockKey)) {
      busy = true; // another isolate is already refreshing
    } else {
      await env.CACHE.put(lockKey, '1', { expirationTtl: REFRESH_LOCK_TTL_SECONDS });
      acquired = true;
    }
  } catch {
    // KV error → fail open and attempt the refresh (availability over coalescing).
    acquired = true;
  }

  if (busy) {
    // Don't pile onto the in-flight refresh: serve stale if we have it, else
    // 503 (the holder populates the cache within seconds).
    if (hit) return hit;
    throw new Error(`refresh in progress for '${source.slug}', no cached data yet`);
  }

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
  } finally {
    if (acquired) {
      try {
        await env.CACHE.delete(lockKey);
      } catch {
        // lock will expire on its TTL
      }
    }
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
    // Precompute /stats over the ≤MAX_RECORDS snapshot so the public page reads
    // a cached blob rather than recomputing per request. Best-effort.
    try {
      await putSourceStats(
        env,
        source,
        computeStats(records, source.stats),
        payload.last_refreshed_at,
      );
    } catch {
      // stale/absent stats just yields a "warming" page — never fail the refresh
    }
    await writeRefreshLog(env, source.slug, 'ok', records.length, Date.now() - start, null);
    return payload;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await writeRefreshLog(env, source.slug, 'error', 0, Date.now() - start, message);
    throw err;
  }
}

export async function writeRefreshLog(
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
