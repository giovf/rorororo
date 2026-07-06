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
 * Filter convention: each key of `queryParams` must name a field of the
 * record; the generic query engine matches string params as case-insensitive
 * substrings and number/boolean params as strict equality. All params must be
 * optional.
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
