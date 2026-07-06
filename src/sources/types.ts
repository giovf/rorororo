import type { z } from 'zod';

export interface RefreshPolicy {
  /** Cron expression for scheduled refresh (dispatched by the scheduled handler). */
  cron: string;
  /** How long cached records stay valid in KV. */
  cacheTtlSeconds: number;
}

/**
 * One dataset behind the platform. Everything dataset-specific lives in the
 * implementing file + a registry entry (CLAUDE.md isolation rule).
 *
 * Filter convention (enforced by the generic query engine, never per-dataset):
 * - a param key naming a record field matches string fields as
 *   case-insensitive substrings, number/boolean fields as strict equality;
 * - `<field>_after` / `<field>_before` params form inclusive ranges over
 *   ISO-date string fields;
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
  /** Pull fresh records from the origin (called by cron refresh / cache miss). */
  fetchFresh(env: CloudflareBindings): Promise<TRecord[]>;
}
