import { computeStats } from '../lib/stats';
import type { SourceStats } from '../lib/stats';
import { readCached, readSnapshot, readSourceStats, refreshSource } from './cache';
import { queryD1Source, refreshD1Source } from './d1store';
import { applyQuery } from './query';
import type { QueryPage } from './query';
import { listSources } from './registry';
import type { DataSource } from './types';

// Storage-aware dispatch: every consumer of source data (REST route, x402
// lane, MCP tools, stats pages, cron) goes through here, so a source's
// storage choice ('kv' snapshot vs 'd1' rows) never leaks past the registry.

export interface SourceQueryResult {
  page: QueryPage<unknown>;
  last_refreshed_at: string | null;
}

export async function querySource(
  env: CloudflareBindings,
  source: DataSource,
  parsed: Record<string, unknown>,
): Promise<SourceQueryResult> {
  if (source.storage === 'd1') {
    return queryD1Source(env, source, parsed);
  }
  const payload = await readCached(env, source);
  return {
    page: applyQuery(payload.records, parsed),
    last_refreshed_at: payload.last_refreshed_at,
  };
}

export interface SourceStatsResult {
  stats: SourceStats;
  last_refreshed_at: string | null;
}

/**
 * Stats for the public /stats page. Prefers the blob precomputed at refresh.
 * If that's absent (e.g. just after a deploy, before the next cron), a KV
 * source falls back to computing from its existing cached snapshot — bounded
 * (≤ snapshot size), and crucially WITHOUT triggering a refresh. A D1 source
 * has no cheap fallback (computing means scanning ~100k+ rows), so it returns
 * null → the page shows "warming" until cron precomputes. Never refreshes,
 * never scans the D1 table per request.
 */
export async function sourceStats(
  env: CloudflareBindings,
  source: DataSource,
): Promise<SourceStatsResult | null> {
  const cached = await readSourceStats(env, source.slug);
  if (cached) return { stats: cached.stats, last_refreshed_at: cached.last_refreshed_at };

  if (source.storage !== 'd1') {
    const snapshot = await readSnapshot(env, source.slug);
    if (snapshot) {
      return {
        stats: computeStats(snapshot.records, source.stats),
        last_refreshed_at: snapshot.last_refreshed_at,
      };
    }
  }
  return null;
}

/**
 * Cron entrypoint: refresh EVERY source on each scheduled tick. Per-source cron
 * is advisory — the platform runs one daily cron, and refreshing all sources
 * means adding a source never silently skips its refresh (no wrangler.jsonc/code
 * cron drift). Never throws.
 */
export async function refreshAllSources(env: CloudflareBindings): Promise<void> {
  for (const source of listSources()) {
    try {
      if (source.storage === 'd1') {
        await refreshD1Source(env, source);
      } else {
        await refreshSource(env, source);
      }
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
