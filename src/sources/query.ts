import { z } from 'zod';
import type { DataSource } from './types';

export const paginationShape = {
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(25),
};

/** Params handled by the platform, never by a source: pagination + full-text q. */
const RESERVED_KEYS = new Set([...Object.keys(paginationShape), 'q']);

/** The source's declared filters plus the shared pagination and q params. */
export function buildQuerySchema(source: DataSource): z.ZodObject {
  return source.queryParams.extend({
    ...paginationShape,
    q: z.string().optional(),
  });
}

export interface QueryPage<T> {
  records: T[];
  page: number;
  perPage: number;
  total: number;
}

function matchesFilter(record: Record<string, unknown>, key: string, wanted: unknown): boolean {
  // <field>_after / <field>_before: inclusive range on ISO-date string fields
  // (lexicographic compare is correct for ISO dates).
  for (const [suffix, cmp] of RANGE_SUFFIXES) {
    if (key.endsWith(suffix) && typeof wanted === 'string') {
      const actual = record[key.slice(0, -suffix.length)];
      return typeof actual === 'string' && cmp(actual, wanted);
    }
  }
  const actual = record[key];
  if (typeof wanted === 'string' && typeof actual === 'string') {
    return actual.toLowerCase().includes(wanted.toLowerCase());
  }
  return actual === wanted;
}

const RANGE_SUFFIXES: [string, (actual: string, wanted: string) => boolean][] = [
  ['_after', (actual, wanted) => actual >= wanted],
  ['_before', (actual, wanted) => actual <= wanted],
];

function matchesFullText(record: Record<string, unknown>, q: string): boolean {
  const needle = q.toLowerCase();
  return Object.values(record).some(
    (value) => typeof value === 'string' && value.toLowerCase().includes(needle),
  );
}

/**
 * Generic, schema-driven filtering — never per-dataset. String params match as
 * case-insensitive substrings, number/boolean params as strict equality,
 * `<field>_after`/`<field>_before` as inclusive ranges, and `q` as a substring
 * search across all string fields.
 */
export function applyQuery<T>(records: T[], parsedQuery: Record<string, unknown>): QueryPage<T> {
  const filters = Object.entries(parsedQuery).filter(
    ([key, value]) => !RESERVED_KEYS.has(key) && value !== undefined,
  );
  const q = parsedQuery.q;

  const filtered = records.filter((record) => {
    const fields = record as Record<string, unknown>;
    if (typeof q === 'string' && !matchesFullText(fields, q)) return false;
    return filters.every(([key, wanted]) => matchesFilter(fields, key, wanted));
  });

  const page = parsedQuery.page as number;
  const perPage = parsedQuery.per_page as number;
  return {
    records: filtered.slice((page - 1) * perPage, page * perPage),
    page,
    perPage,
    total: filtered.length,
  };
}
