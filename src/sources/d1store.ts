import type { StatsSpec } from './types';
import type { DataSource } from './types';
import type { QueryPage } from './query';
import type { SourceStats } from '../lib/stats';
import { writeRefreshLog } from './cache';

// D1-backed source storage (task 44, migration 0007): datasets too large for
// the KV snapshot pattern. Refresh loads a NEW generation of rows then flips
// source_meta, so queries — which always join on the meta generation — never
// see a partial dataset. Filters are translated to SQL with the same
// semantics as query.ts applyQuery: case-insensitive substring for string
// params and `q`, inclusive ranges for _after/_before (date-only ISO string
// compare — a declared constraint on D1 sources) and _min/_max (numeric).

const RESERVED = new Set(['page', 'per_page', 'q']);

/** Rows per INSERT chunk — sized so the JSON bind stays well under D1 limits. */
const INSERT_CHUNK = 2000;

interface SourceMeta {
  generation: number;
  last_refreshed_at: string;
  total: number;
}

async function readMeta(env: CloudflareBindings, slug: string): Promise<SourceMeta | null> {
  return env.DB.prepare(
    'SELECT generation, last_refreshed_at, total FROM source_meta WHERE source_slug = ?1',
  )
    .bind(slug)
    .first<SourceMeta>();
}

/** Lowercased concatenation of the record's string fields, for `q` search. */
function searchText(record: Record<string, unknown>): string {
  return Object.values(record)
    .filter((value): value is string => typeof value === 'string')
    .join(' ')
    .toLowerCase();
}

/**
 * Full reload into generation+1, then an atomic meta flip. Called from the
 * cron refresh and on cold start — never inline on a request that merely
 * finds the data stale (a full reload takes seconds at 100k+ rows).
 */
export async function refreshD1Source(
  env: CloudflareBindings,
  source: DataSource,
): Promise<SourceMeta> {
  const start = Date.now();
  try {
    const records = await source.fetchFresh(env);
    if (records.length === 0) {
      throw new Error('refresh returned 0 records');
    }
    const previous = await readMeta(env, source.slug);
    const generation = (previous?.generation ?? 0) + 1;

    // Chunked set-based insert: one statement per chunk via json_each keeps
    // bind counts tiny (D1 caps bound parameters per statement).
    const insert = env.DB.prepare(
      `INSERT INTO source_records (source_slug, generation, seq, search, record)
       SELECT ?1, ?2, key + ?3, json_extract(value, '$.s'), json_extract(value, '$.r')
       FROM json_each(?4)`,
    );
    for (let offset = 0; offset < records.length; offset += INSERT_CHUNK) {
      const chunk = records.slice(offset, offset + INSERT_CHUNK).map((record) => ({
        s: searchText(record as Record<string, unknown>),
        r: record,
      }));
      await insert.bind(source.slug, generation, offset, JSON.stringify(chunk)).run();
    }

    const meta: SourceMeta = {
      generation,
      last_refreshed_at: new Date().toISOString(),
      total: records.length,
    };
    await env.DB.prepare(
      `INSERT INTO source_meta (source_slug, generation, last_refreshed_at, total)
       VALUES (?1, ?2, ?3, ?4)
       ON CONFLICT (source_slug) DO UPDATE
       SET generation = ?2, last_refreshed_at = ?3, total = ?4`,
    )
      .bind(source.slug, meta.generation, meta.last_refreshed_at, meta.total)
      .run();
    // Readers are on the new generation now; drop the old rows.
    await env.DB.prepare('DELETE FROM source_records WHERE source_slug = ?1 AND generation < ?2')
      .bind(source.slug, generation)
      .run();

    await writeRefreshLog(env, source.slug, 'ok', records.length, Date.now() - start, null);
    return meta;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await writeRefreshLog(env, source.slug, 'error', 0, Date.now() - start, message);
    throw err;
  }
}

async function metaOrColdStart(env: CloudflareBindings, source: DataSource): Promise<SourceMeta> {
  const meta = await readMeta(env, source.slug);
  if (meta) return meta;
  return refreshD1Source(env, source);
}

interface SqlPredicate {
  sql: string;
  binds: (string | number)[];
}

/** JSON-path helper — queryParams keys are code-defined, never user input. */
const path = (field: string): string => `'$.${field}'`;

/**
 * One predicate per query param, mirroring applyQuery's semantics. Unknown
 * shapes (e.g. a range suffix on a non-matching type) fall back to the
 * equality/substring rule, exactly like the JS engine.
 */
function predicateFor(key: string, wanted: unknown): SqlPredicate | null {
  if (key.endsWith('_after') && typeof wanted === 'string') {
    const field = key.slice(0, -'_after'.length);
    return { sql: `json_extract(record, ${path(field)}) >= ?`, binds: [wanted.slice(0, 10)] };
  }
  if (key.endsWith('_before') && typeof wanted === 'string') {
    const field = key.slice(0, -'_before'.length);
    return { sql: `json_extract(record, ${path(field)}) <= ?`, binds: [wanted.slice(0, 10)] };
  }
  if (key.endsWith('_min') && typeof wanted === 'number') {
    const field = key.slice(0, -'_min'.length);
    return {
      sql: `typeof(json_extract(record, ${path(field)})) IN ('integer','real') AND json_extract(record, ${path(field)}) >= ?`,
      binds: [wanted],
    };
  }
  if (key.endsWith('_max') && typeof wanted === 'number') {
    const field = key.slice(0, -'_max'.length);
    return {
      sql: `typeof(json_extract(record, ${path(field)})) IN ('integer','real') AND json_extract(record, ${path(field)}) <= ?`,
      binds: [wanted],
    };
  }
  if (typeof wanted === 'string') {
    // Case-insensitive substring, like matchesValue. instr avoids LIKE-wildcard
    // escaping; lower() matches JS toLowerCase for the ASCII data we serve.
    return {
      sql: `instr(lower(json_extract(record, ${path(key)})), ?) > 0`,
      binds: [wanted.toLowerCase()],
    };
  }
  if (typeof wanted === 'number') {
    return { sql: `json_extract(record, ${path(key)}) = ?`, binds: [wanted] };
  }
  return null;
}

function buildWhere(
  slug: string,
  generation: number,
  parsed: Record<string, unknown>,
): SqlPredicate {
  const clauses = ['source_slug = ?', 'generation = ?'];
  const binds: (string | number)[] = [slug, generation];
  if (typeof parsed.q === 'string') {
    clauses.push('instr(search, ?) > 0');
    binds.push(parsed.q.toLowerCase());
  }
  for (const [key, wanted] of Object.entries(parsed)) {
    if (RESERVED.has(key) || wanted === undefined) continue;
    const predicate = predicateFor(key, wanted);
    if (predicate) {
      clauses.push(`(${predicate.sql})`);
      binds.push(...predicate.binds);
    }
  }
  return { sql: clauses.join(' AND '), binds };
}

export interface D1QueryResult {
  page: QueryPage<unknown>;
  last_refreshed_at: string;
}

export async function queryD1Source(
  env: CloudflareBindings,
  source: DataSource,
  parsed: Record<string, unknown>,
): Promise<D1QueryResult> {
  const meta = await metaOrColdStart(env, source);
  const where = buildWhere(source.slug, meta.generation, parsed);
  const page = parsed.page as number;
  const perPage = parsed.per_page as number;

  const [countRow, rows] = await Promise.all([
    env.DB.prepare(`SELECT COUNT(*) AS n FROM source_records WHERE ${where.sql}`)
      .bind(...where.binds)
      .first<{ n: number }>(),
    env.DB.prepare(
      `SELECT record FROM source_records WHERE ${where.sql} ORDER BY seq LIMIT ?${where.binds.length + 1} OFFSET ?${where.binds.length + 2}`,
    )
      .bind(...where.binds, perPage, (page - 1) * perPage)
      .all<{ record: string }>(),
  ]);

  return {
    page: {
      records: (rows.results ?? []).map((row) => JSON.parse(row.record) as unknown),
      page,
      perPage,
      total: countRow?.n ?? 0,
    },
    last_refreshed_at: meta.last_refreshed_at,
  };
}

export interface D1StatsResult {
  stats: SourceStats;
  last_refreshed_at: string;
}

/** SQL aggregation mirroring lib/stats computeStats for D1 sources. */
export async function statsD1Source(
  env: CloudflareBindings,
  source: DataSource,
): Promise<D1StatsResult> {
  const meta = await metaOrColdStart(env, source);
  const spec: StatsSpec | undefined = source.stats;
  const stats: SourceStats = { total: meta.total, monthly: null, groups: [] };
  if (!spec) return { stats, last_refreshed_at: meta.last_refreshed_at };

  const monthExpr = `substr(json_extract(record, ${path(spec.date.field)}), 1, 7)`;
  const monthly = await env.DB.prepare(
    `SELECT ${monthExpr} AS month, COUNT(*) AS n FROM source_records
     WHERE source_slug = ?1 AND generation = ?2
       AND json_extract(record, ${path(spec.date.field)}) GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]*'
     GROUP BY month ORDER BY month DESC LIMIT 12`,
  )
    .bind(source.slug, meta.generation)
    .all<{ month: string; n: number }>();
  const buckets = (monthly.results ?? [])
    .reverse()
    .map((row) => ({ month: row.month, count: row.n }));
  if (buckets.length > 0) stats.monthly = { title: spec.date.title, buckets };

  for (const group of spec.groupBy) {
    const valueExpr = `json_extract(record, ${path(group.field)})`;
    const rows = await env.DB.prepare(
      `SELECT ${valueExpr} AS value, COUNT(*) AS n FROM source_records
       WHERE source_slug = ?1 AND generation = ?2
         AND ${valueExpr} IS NOT NULL AND ${valueExpr} != ''
       GROUP BY value ORDER BY n DESC, value ASC LIMIT ?3`,
    )
      .bind(source.slug, meta.generation, group.limit ?? 10)
      .all<{ value: string | number; n: number }>();
    const groupRows = (rows.results ?? []).map((row) => ({
      value: String(row.value),
      count: row.n,
    }));
    if (groupRows.length > 0) stats.groups.push({ title: group.title, rows: groupRows });
  }
  return { stats, last_refreshed_at: meta.last_refreshed_at };
}
