import { z } from 'zod';
import type { DataSource } from './types';

export const paginationShape = {
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(25),
};

const PAGINATION_KEYS = new Set(Object.keys(paginationShape));

/** The source's declared filters plus the shared pagination params. */
export function buildQuerySchema(source: DataSource): z.ZodObject {
  return source.queryParams.extend(paginationShape);
}

export interface QueryPage<T> {
  records: T[];
  page: number;
  perPage: number;
  total: number;
}

/**
 * Generic, schema-driven filtering: string params match as case-insensitive
 * substrings, number/boolean params as strict equality. Never per-dataset.
 */
export function applyQuery<T>(records: T[], parsedQuery: Record<string, unknown>): QueryPage<T> {
  const filters = Object.entries(parsedQuery).filter(
    ([key, value]) => !PAGINATION_KEYS.has(key) && value !== undefined,
  );

  const filtered = records.filter((record) =>
    filters.every(([key, wanted]) => {
      const actual = (record as Record<string, unknown>)[key];
      if (typeof wanted === 'string' && typeof actual === 'string') {
        return actual.toLowerCase().includes(wanted.toLowerCase());
      }
      return actual === wanted;
    }),
  );

  const page = parsedQuery.page as number;
  const perPage = parsedQuery.per_page as number;
  return {
    records: filtered.slice((page - 1) * perPage, page * perPage),
    page,
    perPage,
    total: filtered.length,
  };
}
