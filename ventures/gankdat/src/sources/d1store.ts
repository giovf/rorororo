import type { StatsSpec } from './types';
import type { DataSource } from './types';
import { PRESENT_SUFFIX, type QueryPage } from './query';
import type { SourceStats } from '../lib/stats';
import { putSourceStats, writeRefreshLog } from './cache';

/** Thrown when a D1 source is queried before cron has loaded it (routes → 503). */
export class SourceNotLoadedError extends Error {
  constructor(slug: string) {
    super(`Source '${slug}' has not been loaded yet`);
    this.name = 'SourceNotLoadedError';
  }
}

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
// …and a byte bound: wide rows (uk-charities: 23 fields + a 400-char text, stored three
// ways) blew D1's per-bind size cap ("string or blob too big", 2026-09-20) at 2000 rows.
const INSERT_CHUNK_BYTES = 700_000; // 400k made ~3,600 statements for uk-charities and blew the 15-min trigger

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
 * Deep copy with every string leaf JS-lowercased (numbers/booleans/null kept).
 * Stored as record_lc so per-field substring filters fold identically to the
 * KV path's JS toLowerCase — SQLite lower() only handles ASCII.
 */
function lowercaseStrings(value: unknown): unknown {
  if (typeof value === 'string') return value.toLowerCase();
  if (Array.isArray(value)) return value.map(lowercaseStrings);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, lowercaseStrings(v)]),
    );
  }
  return value;
}

/**
 * Full reload into generation+1, then an atomic meta flip. Called ONLY from the
 * scheduled cron (never inline on a request path — a full reload takes seconds
 * to minutes at 100k+ rows, and must not be triggerable by an unauthenticated
 * request; see queryD1Source / the /stats route, which read committed state
 * only). Idempotent per generation, so a crashed attempt self-heals next run.
 */
/** Rows per DELETE statement — a single DELETE of ~600k rows (uk-food-hygiene) tripped D1's
 *  per-statement storage timeout ("operation exceeded timeout which caused object to be
 *  reset", 2026-09-20), so old generations are removed in bounded chunks. */
const DELETE_CHUNK = 20_000;

/** Deletes every row of `slug` whose generation is `>=` or `<` the given one, chunk by chunk. */
async function deleteGenerations(
  env: CloudflareBindings,
  slug: string,
  op: '>=' | '<',
  generation: number,
): Promise<void> {
  const stmt = env.DB.prepare(
    `DELETE FROM source_records WHERE rowid IN (
       SELECT rowid FROM source_records WHERE source_slug = ?1 AND generation ${op} ?2 LIMIT ${DELETE_CHUNK}
     )`,
  );
  for (;;) {
    const res = await stmt.bind(slug, generation).run();
    if ((res.meta?.changes ?? 0) < DELETE_CHUNK) return;
  }
}

/** How long change rows are kept. */
const CHANGES_RETENTION_DAYS = 90;

/**
 * Records added / removed / changed rows between two generations of a source
 * (by record_id) into source_changes, stamped with the refresh time. Skipped
 * when the previous generation predates record ids (nothing to compare).
 */
async function recordChanges(
  env: CloudflareBindings,
  slug: string,
  previousGeneration: number,
  generation: number,
  changedAt: string,
): Promise<void> {
  const prevHasIds = await env.DB.prepare(
    'SELECT 1 AS ok FROM source_records WHERE source_slug = ?1 AND generation = ?2 AND record_id IS NOT NULL LIMIT 1',
  )
    .bind(slug, previousGeneration)
    .first<{ ok: number }>();
  if (!prevHasIds) return;
  const added = `INSERT OR IGNORE INTO source_changes (source_slug, changed_at, change, record_id, record)
     SELECT n.source_slug, ?3, 'added', n.record_id, n.record
     FROM source_records n
     LEFT JOIN source_records o ON o.source_slug = n.source_slug AND o.generation = ?1 AND o.record_id = n.record_id
     WHERE n.source_slug = ?4 AND n.generation = ?2 AND n.record_id IS NOT NULL AND o.record_id IS NULL`;
  const removed = `INSERT OR IGNORE INTO source_changes (source_slug, changed_at, change, record_id, record)
     SELECT o.source_slug, ?3, 'removed', o.record_id, o.record
     FROM source_records o
     LEFT JOIN source_records n ON n.source_slug = o.source_slug AND n.generation = ?2 AND n.record_id = o.record_id
     WHERE o.source_slug = ?4 AND o.generation = ?1 AND o.record_id IS NOT NULL AND n.record_id IS NULL`;
  const changed = `INSERT OR IGNORE INTO source_changes (source_slug, changed_at, change, record_id, record)
     SELECT n.source_slug, ?3, 'changed', n.record_id, n.record
     FROM source_records n
     JOIN source_records o ON o.source_slug = n.source_slug AND o.generation = ?1 AND o.record_id = n.record_id
     WHERE n.source_slug = ?4 AND n.generation = ?2 AND n.record != o.record`;
  for (const sql of [added, removed, changed]) {
    await env.DB.prepare(sql).bind(previousGeneration, generation, changedAt, slug).run();
  }
  await env.DB.prepare(
    "DELETE FROM source_changes WHERE source_slug = ?1 AND changed_at < datetime('now', ?2)",
  )
    .bind(slug, `-${CHANGES_RETENTION_DAYS} days`)
    .run();
}

export interface ChangesQuery {
  since?: string;
  change?: 'added' | 'removed' | 'changed';
  page: number;
  per_page: number;
}

export interface ChangeRow {
  change: string;
  changed_at: string;
  record_id: string;
  record: unknown;
}

/** Page of change rows for a source, newest refresh first (read-only; no refresh). */
export async function queryD1Changes(
  env: CloudflareBindings,
  source: DataSource,
  q: ChangesQuery,
): Promise<{ rows: ChangeRow[]; total: number; last_refreshed_at: string | null }> {
  const meta = await readMeta(env, source.slug);
  const clauses = ['source_slug = ?1'];
  const binds: (string | number)[] = [source.slug];
  if (q.since) {
    clauses.push(`changed_at >= ?${binds.length + 1}`);
    binds.push(q.since.length === 10 ? `${q.since}T00:00:00.000Z` : q.since);
  }
  if (q.change) {
    clauses.push(`change = ?${binds.length + 1}`);
    binds.push(q.change);
  }
  const where = clauses.join(' AND ');
  const count = await env.DB.prepare(`SELECT COUNT(*) AS n FROM source_changes WHERE ${where}`)
    .bind(...binds)
    .first<{ n: number }>();
  const total = count?.n ?? 0;
  const offset = (q.page - 1) * q.per_page;
  const res = await env.DB.prepare(
    `SELECT change, changed_at, record_id, record FROM source_changes WHERE ${where}
     ORDER BY changed_at DESC, change, record_id LIMIT ?${binds.length + 1} OFFSET ?${binds.length + 2}`,
  )
    .bind(...binds, q.per_page, offset)
    .all<{ change: string; changed_at: string; record_id: string; record: string }>();
  const rows = (res.results ?? []).map((r) => ({
    change: r.change,
    changed_at: r.changed_at,
    record_id: r.record_id,
    record: JSON.parse(r.record) as unknown,
  }));
  return { rows, total, last_refreshed_at: meta?.last_refreshed_at ?? null };
}

export async function refreshD1Source(
  env: CloudflareBindings,
  source: DataSource,
): Promise<SourceMeta> {
  const start = Date.now();
  try {
    const previous = await readMeta(env, source.slug);
    const generation = (previous?.generation ?? 0) + 1;

    // Idempotency sweep: meta only advances on success, so a prior crashed
    // attempt left orphan rows at THIS same generation. Clear them first —
    // otherwise the first chunk's seq=0 collides on the PK and every future
    // refresh throws, wedging the dataset on stale data permanently.
    await deleteGenerations(env, source.slug, '>=', generation);

    // Chunked set-based insert: one statement per chunk via json_each keeps
    // bind counts tiny (D1 caps bound parameters per statement). fetchStream
    // (preferred when present) holds only one chunk in memory, so datasets far
    // beyond Worker memory can load; fetchFresh materializes like the KV path.
    const insert = env.DB.prepare(
      `INSERT INTO source_records (source_slug, generation, seq, search, record, record_lc, record_id)
       SELECT ?1, ?2, key + ?3, json_extract(value, '$.s'), json_extract(value, '$.r'), json_extract(value, '$.l'), json_extract(value, '$.i')
       FROM json_each(?4)`,
    );
    let total = 0;
    let chunk: { s: string; r: unknown; l: unknown; i: string | null }[] = [];
    let chunkBytes = 0;
    const flush = async (): Promise<void> => {
      if (chunk.length === 0) return;
      await insert.bind(source.slug, generation, total - chunk.length, JSON.stringify(chunk)).run();
      chunk = [];
      chunkBytes = 0;
    };
    const records: AsyncIterable<unknown> | unknown[] = source.fetchStream
      ? source.fetchStream(env)
      : await source.fetchFresh(env);
    for await (const record of records) {
      const entry = {
        s: searchText(record as Record<string, unknown>),
        r: record,
        l: lowercaseStrings(record),
        i: source.idOf ? source.idOf(record) : null,
      };
      chunk.push(entry);
      chunkBytes += JSON.stringify(entry).length;
      total += 1;
      if (chunk.length >= INSERT_CHUNK || chunkBytes >= INSERT_CHUNK_BYTES) await flush();
    }
    await flush();
    if (total === 0) {
      // Never flip meta to an empty generation (origin outage vs real-empty is
      // indistinguishable); readers keep the prior generation. The partial rows
      // at this generation are cleared by the next attempt's idempotency sweep.
      throw new Error('refresh returned 0 records');
    }

    const meta: SourceMeta = {
      generation,
      last_refreshed_at: new Date().toISOString(),
      total,
    };
    await env.DB.prepare(
      `INSERT INTO source_meta (source_slug, generation, last_refreshed_at, total)
       VALUES (?1, ?2, ?3, ?4)
       ON CONFLICT (source_slug) DO UPDATE
       SET generation = ?2, last_refreshed_at = ?3, total = ?4`,
    )
      .bind(source.slug, meta.generation, meta.last_refreshed_at, meta.total)
      .run();
    // Readers are on the new generation now. Before the old generation goes,
    // diff it against the new one for the change feed (best-effort).
    if (source.idOf && previous) {
      try {
        await recordChanges(
          env,
          source.slug,
          previous.generation,
          generation,
          meta.last_refreshed_at,
        );
      } catch (diffErr) {
        console.log(
          JSON.stringify({
            level: 'warn',
            event: 'change_diff_failed',
            source: source.slug,
            reason: diffErr instanceof Error ? diffErr.message : String(diffErr),
          }),
        );
      }
    }
    // Drop every older generation.
    await deleteGenerations(env, source.slug, '<', generation);

    // Precompute the /stats aggregation once here (cron), so the public,
    // unauthenticated /stats page never runs a full-table GROUP BY per request.
    // Best-effort: a stats-cache failure must not fail the data refresh.
    try {
      const stats = await aggregateD1Stats(env, source, generation, total);
      await putSourceStats(env, source, stats, meta.last_refreshed_at);
    } catch (statsErr) {
      console.log(
        JSON.stringify({
          level: 'warn',
          event: 'stats_precompute_failed',
          source: source.slug,
          reason: statsErr instanceof Error ? statsErr.message : String(statsErr),
        }),
      );
    }

    await writeRefreshLog(env, source.slug, 'ok', total, Date.now() - start, null);
    return meta;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await writeRefreshLog(env, source.slug, 'error', 0, Date.now() - start, message);
    throw err;
  }
}

interface SqlPredicate {
  sql: string;
  binds: (string | number)[];
}

// JSON-path helper. Field names are code-defined (zod-schema keys / StatsSpec
// fields), never user input — but this is the ONE place a string is
// interpolated into SQL, so assert the identifier shape defensively. Turns a
// future footgun (a dev putting a quote in a queryParams key or stats field)
// into a loud error at first use instead of a silent injection.
const IDENT = /^[A-Za-z0-9_]+$/;
function path(field: string): string {
  if (!IDENT.test(field)) {
    throw new Error(`unsafe D1 field identifier: ${JSON.stringify(field)}`);
  }
  return `'$.${field}'`;
}

/**
 * One predicate per query param, mirroring applyQuery's semantics. Unknown
 * shapes (e.g. a range suffix on a non-matching type) fall back to the
 * equality/substring rule, exactly like the JS engine.
 */
function predicateFor(key: string, wanted: unknown): SqlPredicate | null {
  if (key.endsWith(PRESENT_SUFFIX) && typeof wanted === 'boolean') {
    // Mirrors isPresent(): missing key (json_type NULL) / JSON null / '' / [] are absent,
    // anything else present. A searched CASE — a simple CASE on a NULL operand would fall to ELSE.
    const p = path(key.slice(0, -PRESENT_SUFFIX.length));
    const t = `json_type(record, ${p})`;
    return {
      sql: `(CASE WHEN ${t} IS NULL OR ${t} = 'null' THEN 0 WHEN ${t} = 'text' THEN trim(json_extract(record, ${p})) != '' WHEN ${t} = 'array' THEN json_array_length(record, ${p}) > 0 ELSE 1 END) = ?`,
      binds: [wanted ? 1 : 0],
    };
  }
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
  if (typeof wanted === 'boolean') {
    // Strict equality like matchesValue. json_extract of a JSON true/false
    // yields 1/0; bind the same so a boolean param filters correctly.
    return { sql: `json_extract(record, ${path(key)}) = ?`, binds: [wanted ? 1 : 0] };
  }
  if (typeof wanted === 'string') {
    // Case-insensitive substring, like matchesValue. Match against record_lc
    // (JS-lowercased at ingest) so folding matches the KV path's toLowerCase
    // for non-ASCII too; fall back to SQLite lower(record) for rows written
    // before record_lc existed. The typeof guard mirrors matchesValue: a string
    // param only matches TEXT fields (a number field yields no substring match).
    const p = path(key);
    return {
      sql: `typeof(json_extract(record, ${p})) = 'text' AND instr(COALESCE(json_extract(record_lc, ${p}), lower(json_extract(record, ${p}))), ?) > 0`,
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
  // Read committed state only — NEVER trigger a refresh from the request path
  // (a D1 reload is a multi-minute upstream pull; letting a request drive it
  // was an unauthenticated-DoS vector). Cron is the sole loader.
  const meta = await readMeta(env, source.slug);
  if (!meta) throw new SourceNotLoadedError(source.slug);
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

/**
 * SQL aggregation mirroring lib/stats computeStats for D1 sources. Called ONCE
 * per refresh (cron) against the just-committed generation; the result is
 * cached so /stats never scans the table per request.
 */
async function aggregateD1Stats(
  env: CloudflareBindings,
  source: DataSource,
  generation: number,
  total: number,
): Promise<SourceStats> {
  const spec: StatsSpec | undefined = source.stats;
  const stats: SourceStats = { total, monthly: null, groups: [] };
  if (!spec) return stats;

  const monthExpr = `substr(json_extract(record, ${path(spec.date.field)}), 1, 7)`;
  const monthly = await env.DB.prepare(
    `SELECT ${monthExpr} AS month, COUNT(*) AS n FROM source_records
     WHERE source_slug = ?1 AND generation = ?2
       AND json_extract(record, ${path(spec.date.field)}) GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]*'
     GROUP BY month ORDER BY month DESC LIMIT 12`,
  )
    .bind(source.slug, generation)
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
      .bind(source.slug, generation, group.limit ?? 10)
      .all<{ value: string | number; n: number }>();
    const groupRows = (rows.results ?? []).map((row) => ({
      value: String(row.value),
      count: row.n,
    }));
    if (groupRows.length > 0) stats.groups.push({ title: group.title, rows: groupRows });
  }
  return stats;
}
