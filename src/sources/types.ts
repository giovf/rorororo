import type { z } from 'zod';

export interface RefreshPolicy {
  /**
   * Intended refresh cadence (advisory). The platform runs a single daily cron
   * (wrangler.jsonc) that refreshes every source, so adding a source never
   * silently skips its refresh regardless of this value.
   */
  cron: string;
  /** How long cached records stay valid in KV. */
  cacheTtlSeconds: number;
}

/**
 * Declarative spec for the public /stats/<slug> cite-bait page (task 34).
 * Lives on the source (isolation rule); a generic engine renders it. Sources
 * without one still get a minimal page (record count + freshness).
 */
export interface StatsSpec {
  /** ISO-date record field bucketed into the monthly-trend table. */
  date: { field: string; title: string };
  /** Categorical record fields rendered as top-N breakdown tables. */
  groupBy: { field: string; title: string; limit?: number }[];
}

/**
 * One dataset behind the platform. Everything dataset-specific lives in the
 * implementing file + a registry entry (CLAUDE.md isolation rule).
 *
 * Filter convention (enforced by the generic query engine, never per-dataset):
 * - a param key naming a record field matches string fields as
 *   case-insensitive substrings, number/boolean fields as strict equality;
 * - `<field>_after` / `<field>_before` params form inclusive ranges over
 *   ISO-date string fields; `<field>_min` / `<field>_max` over numeric fields;
 * - params against array fields match when any element matches;
 * - `page`, `per_page`, and `q` (substring search across all string fields)
 *   are platform-reserved and added to every source automatically.
 * All declared params must be optional.
 */
export interface DataSource<TRecord = unknown> {
  slug: string;
  title: string;
  /** One-liner used by the sources listing, OpenAPI spec, and MCP tool descriptions. */
  description: string;
  /** zod schema of one normalized record (validated at ingest). */
  recordSchema: z.ZodType<TRecord>;
  /** Filters this source supports; validated per-request by the data route. */
  queryParams: z.ZodObject;
  refresh: RefreshPolicy;
  /** Credits debited per request against this source (default 1). */
  creditCost?: number;
  /** x402 pay-per-request price for this source, e.g. '$0.01' (default: X402_PRICE_USD env / platform default). */
  x402PriceUsd?: string;
  /** Per-source REST rate limit for the metered data route (default 60 req / 60s). */
  rateLimit?: { limit: number; windowSeconds: number };
  /** Breakdown spec for the public /stats/<slug> page (optional enrichment). */
  stats?: StatsSpec;
  /** Pull fresh records from the origin (called by cron refresh / cache miss). */
  fetchFresh(env: CloudflareBindings): Promise<TRecord[]>;
}
