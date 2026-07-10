import type { StatsSpec } from '../sources/types';

// Generic aggregation for the /stats cite-bait pages: registry-driven, so a
// new source gets a page from its (optional) StatsSpec with no platform code.
// Records are the same cached rows the API serves — stats can't contradict
// the product.

export interface StatsGroup {
  title: string;
  rows: { value: string; count: number }[];
}

export interface SourceStats {
  total: number;
  /** Chronological YYYY-MM buckets (up to the most recent 12 present). */
  monthly: { title: string; buckets: { month: string; count: number }[] } | null;
  groups: StatsGroup[];
}

const asRecord = (row: unknown): Record<string, unknown> =>
  (typeof row === 'object' && row !== null ? row : {}) as Record<string, unknown>;

export function computeStats(records: unknown[], spec?: StatsSpec): SourceStats {
  const stats: SourceStats = { total: records.length, monthly: null, groups: [] };
  if (!spec) return stats;

  const byMonth = new Map<string, number>();
  for (const row of records) {
    const raw = asRecord(row)[spec.date.field];
    if (typeof raw !== 'string' || !/^\d{4}-\d{2}/.test(raw)) continue;
    const month = raw.slice(0, 7);
    byMonth.set(month, (byMonth.get(month) ?? 0) + 1);
  }
  const buckets = [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([month, count]) => ({ month, count }));
  if (buckets.length > 0) stats.monthly = { title: spec.date.title, buckets };

  for (const group of spec.groupBy) {
    const counts = new Map<string, number>();
    for (const row of records) {
      const raw = asRecord(row)[group.field];
      if (raw === null || raw === undefined || raw === '') continue;
      const key = String(raw);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    const rows = [...counts.entries()]
      .sort(([, a], [, b]) => b - a)
      .slice(0, group.limit ?? 10)
      .map(([value, count]) => ({ value, count }));
    if (rows.length > 0) stats.groups.push({ title: group.title, rows });
  }
  return stats;
}
