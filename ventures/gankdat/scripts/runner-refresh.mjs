#!/usr/bin/env node
// Runner-side refresh for the sources whose origin the Worker cannot read (`RefreshPolicy.runner`).
//
// Why: from 2026-09-28 every Worker read of The Gazette's insolvency feed came back as 0 bytes
// (four paced reads a day, page size halved on 09-30, still nothing) while a GitHub runner read
// the same URL in full each time — the origin cuts the body for the Worker's egress, not for
// anything in the parser. So the `gankdat metrics` job runs this on its runner once a day: the
// source's own `fetchFresh` (same Blind-Mode whitelist, same retries), then the two KV writes the
// Worker would have made (`snapshotWrites` in src/sources/cache.ts) and a `refresh_log` row,
// through the Cloudflare REST API with the deploy token. The Worker's cron waves skip these
// sources (store.ts `cronSources`), so the Daily numbers row keeps reading `refresh_log` as before:
// a day this job fails still lands there as `refresh errors: <slug> (runner: …)`.
//
// Bundled at run time (esbuild) because the sources are TypeScript with Bundler resolution:
//   npm run runner-refresh            (repo root or ventures/gankdat; CLOUDFLARE_API_TOKEN set)
// Idempotent per day: a source whose last `ok` row is under 20 h old is skipped, so the job may
// run on every push to main as the metrics step does. Exit 1 when any source failed.
import { writeFile } from 'node:fs/promises';
import { URL } from 'node:url';
import { postIndexNow, statsUrlsFor } from '../src/lib/indexnow.ts';
import { snapshotWrites, statsKey } from '../src/sources/cache.ts';
import { listSources } from '../src/sources/registry.ts';
import { isRunnerFed } from '../src/sources/store.ts';

const ACCOUNT_ID = '37e56f3ce4dfe49919e85d4380467f44'; // not a secret
const DATABASE_ID = 'ac051277-5f69-46ba-965b-50da2f1ec524'; // wrangler.jsonc
const CACHE_NAMESPACE_ID = 'eacc87d970e94b9b87ce944985af0b52'; // wrangler.jsonc CACHE binding
// IndexNow (src/lib/indexnow.ts): the one daily submission of the refreshed /stats pages is made
// from this runner (`submitStatsPages` below), never from the Worker. Copied from wrangler.jsonc
// vars (not a secret — it is public at /<key>.txt).
const INDEXNOW_KEY = '25d4108fe9beff29d13ec9422a302e26';
const PUBLIC_BASE_URL = 'https://gankdat.com';
const FRESH_ENOUGH_MS = 20 * 60 * 60 * 1000;
const API = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}`;

const token = process.env.CLOUDFLARE_API_TOKEN;
if (!token) {
  console.error('CLOUDFLARE_API_TOKEN missing');
  process.exit(1);
}
const auth = { Authorization: `Bearer ${token}` };

/** @param {string} query @param {unknown[]} params */
async function sql(query, params = []) {
  const res = await fetch(`${API}/d1/database/${DATABASE_ID}/query`, {
    method: 'POST',
    headers: { ...auth, 'content-type': 'application/json' },
    body: JSON.stringify({ sql: query, params }),
  });
  const body = await res.json();
  if (!body.success) throw new Error(`D1: ${JSON.stringify(body.errors).slice(0, 200)}`);
  return body.result[0].results;
}

/** @param {{ key: string; value: string; ttl: number }} write */
async function kvPut(write) {
  const url = `${API}/storage/kv/namespaces/${CACHE_NAMESPACE_ID}/values/${encodeURIComponent(write.key)}?expiration_ttl=${write.ttl}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { ...auth, 'content-type': 'text/plain' },
    body: write.value,
  });
  if (!res.ok)
    throw new Error(`KV put ${write.key}: ${res.status} ${(await res.text()).slice(0, 200)}`);
}

/** @param {string} slug @param {'ok'|'error'} status @param {number} records @param {number} ms @param {string|null} message */
async function refreshLog(slug, status, records, ms, message) {
  await sql(
    'INSERT INTO refresh_log (source_slug, status, records, duration_ms, message) VALUES (?1, ?2, ?3, ?4, ?5)',
    [slug, status, records, ms, message],
  );
}

/** @param {string} slug */
async function lastOkAgeMs(slug) {
  const [row] = await sql(
    "SELECT MAX(created_at) AS last_ok FROM refresh_log WHERE source_slug = ?1 AND status = 'ok'",
    [slug],
  );
  if (!row?.last_ok) return Infinity;
  return Date.now() - Date.parse(`${String(row.last_ok).replace(' ', 'T')}Z`);
}

// The sources only read FIXTURE_FALLBACK from the bindings; prod pins it "false" and so do we —
// a runner that cannot read the origin must fail loudly, never cache the bundled fixtures as live.
const env = /** @type {CloudflareBindings} */ (
  /** @type {unknown} */ ({ FIXTURE_FALLBACK: 'false' })
);

let failed = 0;
for (const source of listSources().filter(isRunnerFed)) {
  const start = Date.now();
  try {
    const age = await lastOkAgeMs(source.slug);
    if (age < FRESH_ENOUGH_MS) {
      console.log(`${source.slug}: refreshed ${Math.round(age / 3_600_000)} h ago, skipping`);
      continue;
    }
    const records = await source.fetchFresh(env);
    if (records.length === 0) throw new Error('refresh returned 0 records');
    const lastRefreshedAt = new Date().toISOString();
    for (const write of snapshotWrites(source, records, lastRefreshedAt)) await kvPut(write);
    await refreshLog(source.slug, 'ok', records.length, Date.now() - start, 'runner');
    console.log(`${source.slug}: ${records.length} records written from the runner`);
  } catch (err) {
    failed += 1;
    const message = `runner: ${err instanceof Error ? err.message : String(err)}`;
    console.error(`${source.slug}: ${message}`);
    await refreshLog(source.slug, 'error', 0, Date.now() - start, message).catch((e) =>
      console.error(`${source.slug}: refresh_log write failed too: ${e.message}`),
    );
  }
}
// IndexNow from the runner (2026-10-07, queue `indexnow-from-runner`): api.indexnow.org answers
// 429 to every POST from Cloudflare Workers egress (shared IPs; each wave on 10-05 and 10-06) and
// 200 to a GitHub runner (uk-insolvency's ping from this job the same morning), so the one daily
// submission is made here, after the Worker's waves: every source with an `ok` refresh_log row in
// the last 26 h, its parent /stats page plus the facet pages from the stats blob the refresh left
// in KV (read whole, so the ~1,100 facet URLs go too — the Worker's wave-end ping saw ~40). The
// result lands in dist/indexnow.json next to this bundle for metrics.mjs (`indexnow: N urls S`
// in the Daily numbers row); a failure is printed, never fails the job.
/** @param {string} key */
async function kvGet(key) {
  const url = `${API}/storage/kv/namespaces/${CACHE_NAMESPACE_ID}/values/${encodeURIComponent(key)}`;
  const res = await fetch(url, { headers: auth });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`KV get ${key}: ${res.status}`);
  return res.json();
}

async function submitStatsPages() {
  const rows = await sql(
    "SELECT DISTINCT source_slug FROM refresh_log WHERE status = 'ok' AND created_at > datetime('now','-26 hours')",
  );
  const slugs = rows.map((r) => String(r.source_slug));
  const urls = [];
  for (const slug of slugs) {
    const blob = await kvGet(statsKey(slug)).catch(() => null);
    urls.push(...statsUrlsFor(PUBLIC_BASE_URL, slug, blob?.stats ?? null));
  }
  const result = await postIndexNow({ baseUrl: PUBLIC_BASE_URL, key: INDEXNOW_KEY, urls });
  const out = { date: new Date().toISOString().slice(0, 10), sources: slugs.length, ...result };
  await writeFile(new URL('./indexnow.json', import.meta.url), JSON.stringify(out));
  console.log(
    `indexnow: ${result.urls} urls, status ${result.status ?? 'n/a'}, ${slugs.length} sources refreshed in 26 h`,
  );
}
await submitStatsPages().catch((e) => console.error(`indexnow: ${e.message}`));
process.exit(failed ? 1 : 0);
