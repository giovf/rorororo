import { listSources } from './registry';
import type { DataSource } from './types';

export interface CachedPayload {
  records: unknown[];
  last_refreshed_at: string;
}

const dataKey = (slug: string): string => `data:${slug}`;

/** Serve from KV; on miss, refresh synchronously (first request after expiry pays). */
export async function readCached(
  env: CloudflareBindings,
  source: DataSource,
): Promise<CachedPayload> {
  const hit = await env.CACHE.get<CachedPayload>(dataKey(source.slug), 'json');
  if (hit) return hit;
  return refreshSource(env, source);
}

/** Pull fresh records, cache them, and record the attempt in refresh_log. */
export async function refreshSource(
  env: CloudflareBindings,
  source: DataSource,
): Promise<CachedPayload> {
  const start = Date.now();
  try {
    const records = await source.fetchFresh(env);
    const payload: CachedPayload = { records, last_refreshed_at: new Date().toISOString() };
    await env.CACHE.put(dataKey(source.slug), JSON.stringify(payload), {
      expirationTtl: source.refresh.cacheTtlSeconds,
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
