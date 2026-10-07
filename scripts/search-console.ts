// Search Console reading from CI: impressions, clicks and the URL-inspection verdict of the
// Google-facing pages, written as a `search:` clause on today's metrics row of every venture.
//
// Why (foundry `search-console-api-reading`, exchange 2026-W41): three day-30 reviews
// (variables-toolkit 10-21, highlight-keep and read-focus 10-30) and the proofs of the five
// comparison / how-to pages built since 10-01 all read "Search Console impressions", and
// gankdat's `search-console-stats-indexing` had been blocked on an owner export since
// 2026-09-28 — no indexing or impressions reading had ever reached the repo. The Search Console
// API is read-only under the `webmasters.readonly` scope: `sites.list`, `searchAnalytics.query`
// and `urlInspection.index.inspect`. A service account the owner adds as a Restricted user on
// each property (owner action 020) reads it; the JSON key is the `SEARCH_CONSOLE_KEY` secret.
//
// What it does:
//   1. signs a service-account JWT and trades it for an access token (no SDK, node:crypto);
//   2. `sites.list` → which properties the account can read (URL-prefix `https://host/` or
//      domain `sc-domain:…`), so the property type is never guessed;
//   3. per venture (VENTURES below: host + page rule), `searchAnalytics.query` by page for the
//      last seven days → impressions, clicks, average position, top page;
//   4. URL inspection of the venture's pages that matter — gankdat's `/stats` and `/stats/<slug>`
//      pages, the landing's product and comparison pages (read from the sitemaps in the repo, so
//      a new page is inspected the day its sitemap entry lands) → `indexed I/N` plus the
//      coverage states of the rest;
//   5. upserts `search: …` in today's `Daily check` (store-metrics) or `Daily numbers` (gankdat
//      metrics) row of `ventures/<slug>/RESEARCH.md`. Never writes a row of its own.
// Without the secret every row reads `search: n/a (no SEARCH_CONSOLE_KEY …)` — a reading that
// says why, never a silent gap. A property the account cannot see reads `n/a (no property …)`.
//
// Run: node --disable-warning=ExperimentalWarning scripts/search-console.ts
// Env: SEARCH_CONSOLE_KEY            the service account's JSON key (secret, never logged)
//      STORE_METRICS_IF_MISSING=1    leave a row that already has a `search:` clause alone
//      STORE_METRICS_DATE=YYYY-MM-DD row date (default: today, UTC)
// Node 22 runs .ts directly — keep syntax erasable, import only node builtins.
import { createSign } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
export const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const API = 'https://www.googleapis.com/webmasters/v3';
const INSPECT_URL = 'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect';
/** Inspections per venture per run; the API allows 2,000 per property per day. */
export const INSPECT_CAP = 40;

export interface Venture {
  slug: string;
  /** The host whose property the venture's pages live under. */
  host: string;
  /** Which paths on that host belong to the venture (search analytics rows). */
  pages: (pathname: string) => boolean;
  /** Which of those are inspected for their indexing verdict. */
  inspect: (pathname: string) => boolean;
  /** The sitemap in the repo that lists the host's pages. */
  sitemap: string;
  /** The row the clause goes on. */
  row: 'Daily check' | 'Daily numbers';
}

const landing = (
  paths: string[],
): Pick<Venture, 'host' | 'pages' | 'inspect' | 'sitemap' | 'row'> => ({
  host: 'apps.gankdat.com',
  pages: (p) => paths.includes(p),
  inspect: (p) => paths.includes(p),
  sitemap: 'packages/landing/site/sitemap.xml',
  row: 'Daily check',
});

/** One entry per venture with Google-facing pages. Landing paths are the product page plus its
 *  comparison / how-to pages (`packages/landing/site/sitemap.xml`); gankdat is its whole host,
 *  inspecting the `/stats` index and the per-dataset `/stats/<slug>` pages (not the facets). */
export const VENTURES: Venture[] = [
  {
    slug: 'gankdat',
    host: 'gankdat.com',
    pages: () => true,
    inspect: (p) => p === '/' || /^\/stats(?:\/[^/]+)?$/.test(p),
    sitemap: 'ventures/gankdat/public/sitemap.xml',
    row: 'Daily numbers',
  },
  { slug: 'highlight-keep', ...landing(['/highlightkeep.html', '/weava-alternative.html']) },
  {
    slug: 'read-focus',
    ...landing(['/readfocus.html', '/reader-mode-alternative.html', '/reading-ruler.html']),
  },
  {
    slug: 'variables-toolkit',
    ...landing(['/figma-styles-to-variables.html', '/figma-relink-variables.html']),
  },
];

interface ServiceAccountKey {
  client_email: string;
  private_key: string;
  token_uri?: string;
}

/** The key JSON, or the reason it cannot be used (never its contents). */
export function parseKey(raw: string | undefined): ServiceAccountKey | { error: string } {
  if (!raw) return { error: 'no SEARCH_CONSOLE_KEY secret; owner action 020' };
  try {
    const json = JSON.parse(raw) as Partial<ServiceAccountKey>;
    if (typeof json.client_email !== 'string' || typeof json.private_key !== 'string') {
      return { error: 'SEARCH_CONSOLE_KEY is not a service-account JSON key' };
    }
    const key: ServiceAccountKey = {
      client_email: json.client_email,
      private_key: json.private_key,
    };
    if (typeof json.token_uri === 'string') key.token_uri = json.token_uri;
    return key;
  } catch {
    return { error: 'SEARCH_CONSOLE_KEY is not JSON' };
  }
}

const b64url = (s: string | Buffer): string =>
  Buffer.from(s).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

/** RS256 JWT assertion for the OAuth2 service-account flow (RFC 7523): header, claims, signature. */
export function jwtAssertion(key: ServiceAccountKey, nowSeconds: number): string {
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = b64url(
    JSON.stringify({
      iss: key.client_email,
      scope: SCOPE,
      aud: key.token_uri ?? TOKEN_URL,
      iat: nowSeconds,
      exp: nowSeconds + 3600,
    }),
  );
  const signer = createSign('RSA-SHA256');
  signer.update(`${header}.${claims}`);
  return `${header}.${claims}.${b64url(signer.sign(key.private_key))}`;
}

async function accessToken(key: ServiceAccountKey): Promise<string> {
  const body = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion: jwtAssertion(key, Math.floor(Date.now() / 1000)),
  });
  const res = await fetch(key.token_uri ?? TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
    signal: AbortSignal.timeout(20_000),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`token ${res.status}: ${text.replace(/\s+/g, ' ').slice(0, 120)}`);
  const token = (JSON.parse(text) as { access_token?: string }).access_token;
  if (!token) throw new Error('token response without access_token');
  return token;
}

/** The property to query for a host: its own URL-prefix property first, else the domain property
 *  that covers it (`sc-domain:gankdat.com` covers apps.gankdat.com too). */
export function propertyFor(host: string, sites: string[]): string | undefined {
  const prefix = sites.find((s) => s === `https://${host}/`);
  if (prefix) return prefix;
  const domains = sites
    .filter((s) => s.startsWith('sc-domain:'))
    .map((s) => s.slice('sc-domain:'.length))
    .filter((d) => host === d || host.endsWith(`.${d}`))
    .sort((a, b) => b.length - a.length);
  return domains[0] ? `sc-domain:${domains[0]}` : undefined;
}

export interface PageRow {
  page: string;
  clicks: number;
  impressions: number;
  position: number;
}

/** `searchAnalytics.query` rows (`keys: [page]`) that belong to the venture. */
export function venturePages(rows: PageRow[], venture: Venture): PageRow[] {
  return rows.filter((r) => {
    try {
      const u = new URL(r.page);
      return u.hostname === venture.host && venture.pages(u.pathname);
    } catch {
      return false;
    }
  });
}

export interface Inspection {
  url: string;
  /** `PASS` = indexed; `NEUTRAL` / `FAIL` / `VERDICT_UNSPECIFIED` are not. */
  verdict: string;
  /** Google's own phrase, e.g. `Submitted and indexed`, `Crawled - currently not indexed`. */
  coverage: string;
  error?: string;
}

/** The pages a venture inspects, from the sitemap in the repo (order kept, capped). */
export function inspectTargets(sitemapXml: string, venture: Venture): string[] {
  const out: string[] = [];
  for (const m of sitemapXml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)) {
    try {
      const u = new URL(m[1] as string);
      if (u.hostname === venture.host && venture.inspect(u.pathname)) out.push(u.href);
    } catch {
      /* not a URL */
    }
  }
  return out.slice(0, INSPECT_CAP);
}

const short = (s: string): string => s.replace(/^https?:\/\/[^/]+/, '') || '/';

/** The `search:` clause: seven-day totals, the top page, and the indexing picture. */
export function searchNote(endDate: string, pages: PageRow[], inspections: Inspection[]): string {
  const impressions = pages.reduce((a, r) => a + r.impressions, 0);
  const clicks = pages.reduce((a, r) => a + r.clicks, 0);
  const weighted = pages.reduce((a, r) => a + r.position * r.impressions, 0);
  const parts = [`search 7d to ${endDate.slice(5)}: ${impressions} impressions, ${clicks} clicks`];
  if (impressions > 0) {
    parts[0] += `, avg pos ${(weighted / impressions).toFixed(1)}`;
    const top = [...pages].sort((a, b) => b.impressions - a.impressions)[0];
    if (top) parts.push(`top ${short(top.page)} ${top.impressions}`);
  }
  if (inspections.length) {
    const read = inspections.filter((i) => !i.error);
    const indexed = read.filter((i) => i.verdict === 'PASS').length;
    parts.push(`indexed ${indexed}/${read.length}`);
    const states = new Map<string, number>();
    for (const i of read) {
      if (i.verdict !== 'PASS') states.set(i.coverage, (states.get(i.coverage) ?? 0) + 1);
    }
    if (states.size) {
      parts.push(
        `not: ${[...states.entries()]
          .sort((a, b) => b[1] - a[1])
          .map(([state, n]) => `${state} ×${n}`)
          .join(', ')}`,
      );
    }
    const failed = inspections.filter((i) => i.error);
    if (failed.length === inspections.length) {
      // Every inspection failed: say why once (a 403 here means the account lacks the property).
      parts.push(`inspection n/a (${(failed[0]?.error ?? 'unknown').slice(0, 80)})`);
    } else if (failed.length) {
      parts.push(`${failed.length} inspection${failed.length === 1 ? '' : 's'} failed`);
    }
  }
  return parts.join(', ');
}

const CLAUSE = /^search(?: 7d to \d{2}-\d{2})?: /;

/** Does today's row already carry a `search:` clause? */
export function hasSearchClause(md: string, date: string, row: Venture['row']): boolean {
  const m = md.match(new RegExp(`^\\| ${date} \\| ${row} \\|.*$`, 'm'));
  return Boolean(m && notesOf(m[0]).some((c) => CLAUSE.test(c)));
}

/** The Notes cell of a row, split into its `; `-separated clauses. */
function notesOf(line: string): string[] {
  const cells = line.replace(/\s*\|\s*$/, '').split('|');
  const notes = (cells[cells.length - 1] ?? '').trim();
  return notes ? notes.split(/;\s*/) : [];
}

/** Upsert the clause on today's row: replace an existing `search:` clause, else append it to the
 *  Notes cell. No row for the day → unchanged (this script never writes a row of its own). */
export function upsertSearch(
  md: string,
  date: string,
  row: Venture['row'],
  note: string,
  ifMissing = false,
): string {
  const own = new RegExp(`^\\| ${date} \\| ${row} \\|.*$`, 'm');
  const m = md.match(own);
  if (!m) return md;
  const cells = m[0].replace(/\s*\|\s*$/, '').split('|');
  cells.pop();
  const clauses = notesOf(m[0]);
  const i = clauses.findIndex((c) => CLAUSE.test(c));
  if (i !== -1 && ifMissing) return md;
  if (i === -1) clauses.push(note);
  else clauses[i] = note;
  return md.replace(own, `${cells.join('|')}| ${clauses.join('; ')} |`);
}

async function api<T>(token: string, url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method: body ? 'POST' : 'GET',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(30_000),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status}: ${text.replace(/\s+/g, ' ').slice(0, 120)}`);
  return JSON.parse(text) as T;
}

async function listSites(token: string): Promise<string[]> {
  const json = await api<{ siteEntry?: { siteUrl: string }[] }>(token, `${API}/sites`);
  return (json.siteEntry ?? []).map((s) => s.siteUrl);
}

async function queryPages(
  token: string,
  property: string,
  startDate: string,
  endDate: string,
): Promise<PageRow[]> {
  const json = await api<{
    rows?: { keys: string[]; clicks: number; impressions: number; position: number }[];
  }>(token, `${API}/sites/${encodeURIComponent(property)}/searchAnalytics/query`, {
    startDate,
    endDate,
    dimensions: ['page'],
    dataState: 'all',
    rowLimit: 5000,
  });
  return (json.rows ?? []).map((r) => ({
    page: r.keys[0] ?? '',
    clicks: r.clicks,
    impressions: r.impressions,
    position: r.position,
  }));
}

async function inspect(token: string, property: string, url: string): Promise<Inspection> {
  try {
    const json = await api<{
      inspectionResult?: { indexStatusResult?: { verdict?: string; coverageState?: string } };
    }>(token, INSPECT_URL, { inspectionUrl: url, siteUrl: property });
    const r = json.inspectionResult?.indexStatusResult ?? {};
    return {
      url,
      verdict: r.verdict ?? 'VERDICT_UNSPECIFIED',
      coverage: r.coverageState ?? 'unknown',
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { url, verdict: 'VERDICT_UNSPECIFIED', coverage: 'unread', error: msg };
  }
}

const isoDay = (d: Date): string => d.toISOString().slice(0, 10);

async function main(): Promise<void> {
  const root = path.resolve(import.meta.dirname, '..');
  const date = process.env.STORE_METRICS_DATE ?? isoDay(new Date());
  const ifMissing = Boolean(process.env.STORE_METRICS_IF_MISSING);
  // Seven days ending yesterday: Search Console's fresh data reaches the API a day behind.
  const end = new Date(`${date}T00:00:00Z`);
  end.setUTCDate(end.getUTCDate() - 1);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 6);
  const endDate = isoDay(end);
  const startDate = isoDay(start);

  const key = parseKey(process.env.SEARCH_CONSOLE_KEY);
  let token: string | undefined;
  let sites: string[] = [];
  let reason: string | undefined;
  if ('error' in key) {
    reason = key.error;
  } else {
    try {
      token = await accessToken(key);
      sites = await listSites(token);
      console.log(
        `search console: ${sites.length} propert${sites.length === 1 ? 'y' : 'ies'} readable`,
      );
    } catch (e) {
      reason = e instanceof Error ? e.message : String(e);
    }
  }

  const byProperty = new Map<string, PageRow[]>();
  for (const venture of VENTURES) {
    const file = path.join(root, 'ventures', venture.slug, 'RESEARCH.md');
    if (!existsSync(file)) continue;
    const md = readFileSync(file, 'utf8');
    if (!md.includes(`| ${date} | ${venture.row} |`)) {
      console.log(`${venture.slug}: no ${venture.row} row for ${date}, nothing to write on`);
      continue;
    }
    if (ifMissing && hasSearchClause(md, date, venture.row)) {
      console.log(`${venture.slug}: row for ${date} already has a search clause, left alone`);
      continue;
    }
    let note: string;
    const property = token ? propertyFor(venture.host, sites) : undefined;
    if (!token) {
      note = `search: n/a (${reason ?? 'no token'})`;
    } else if (!property) {
      note = `search: n/a (no Search Console property for ${venture.host}; account sees ${sites.length})`;
    } else {
      try {
        let rows = byProperty.get(property);
        if (!rows) {
          rows = await queryPages(token, property, startDate, endDate);
          byProperty.set(property, rows);
        }
        const sitemapFile = path.join(root, venture.sitemap);
        const targets = existsSync(sitemapFile)
          ? inspectTargets(readFileSync(sitemapFile, 'utf8'), venture)
          : [];
        const inspections: Inspection[] = [];
        for (const url of targets) inspections.push(await inspect(token, property, url));
        note = searchNote(endDate, venturePages(rows, venture), inspections);
      } catch (e) {
        note = `search: n/a (${e instanceof Error ? e.message : String(e)})`;
      }
    }
    writeFileSync(file, upsertSearch(md, date, venture.row, note));
    console.log(`${venture.slug}: ${note}`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
