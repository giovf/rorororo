// Store metrics from CI: one `Daily check` row per venture, written from a GitHub runner.
//
// Why: the 07:00 metrics routine runs in a sandbox whose egress policy blocks the stores
// (`fetch failed: egress blocked by network policy (chromewebstore.google.com,
// addons.mozilla.org)`, highlight-keep RESEARCH 2026-09-21), so it fell back to STORE.md's
// status line and wrote `not live yet` for read-focus and highlight-keep every day from
// 2026-09-20 to 09-30 while all four of their listings were live (AMO approved both on
// 2026-09-22, the Chrome pages answered 200 with "Add to Chrome" by 09-21). Ten days of a
// launched product with no reading, twice. gankdat's numbers already come from a runner
// (`.github/workflows/gankdat-metrics.yml` → `ventures/gankdat/scripts/metrics.mjs`); this
// script does the same for every store listing so the routine only reads.
//
// What it does, per `ventures/<slug>/STORE.md`:
//   1. finds the listing URLs it mentions — Chrome Web Store item ids, AMO slugs, Figma plugin ids;
//   2. fetches the public source for each: the CWS detail page (`?hl=en`, "Add to Chrome" = live,
//      no user count rendered below the first users), the AMO add-on API (JSON, `status: public`),
//      the Figma versions API (JSON, `publishing_status: approved_public`);
//   3. upserts `| <date> | Daily check | … |` in the venture's `## Metrics` table, in that
//      table's own columns (Users/Rating/Sales for extensions, Users/Likes/Purchases for Figma);
//   4. if STORE.md still says `not live yet` for a channel whose page answers, flips that phrase.
// Field names and page shapes were confirmed on 2026-09-30 through the relay (`cws-pages`,
// `amo-listings`, `metrics-2026-09-30`), not from memory.
//
// Run: node --disable-warning=ExperimentalWarning scripts/store-metrics.ts
// Env: STORE_METRICS_IF_MISSING=1  leave an existing row for today alone (push-triggered runs)
//      STORE_METRICS_DATE=YYYY-MM-DD  row date (default: today, UTC)
// Node 22 runs .ts directly — keep syntax erasable, import only node builtins.
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export type Channel = 'chrome' | 'firefox' | 'figma';

export interface Listing {
  channel: Channel;
  id: string;
  /** The URL the metrics come from (not always the listing page). */
  url: string;
}

export interface Reading {
  channel: Channel;
  live: boolean;
  users?: number;
  rating?: string;
  likes?: number;
  purchases?: number;
  /** One clause for the Notes column, e.g. `chrome: 0 users, no ratings, v0.1.0`. */
  note: string;
  error?: string;
}

const CHANNEL_WORD: Record<Channel, RegExp> = {
  chrome: /chrome/i,
  firefox: /firefox|mozilla|amo\b/i,
  figma: /figma/i,
};

/** Listing URLs a STORE.md mentions, one per channel+id (first mention wins). */
export function listingsOf(storeMd: string): Listing[] {
  const out: Listing[] = [];
  const seen = new Set<string>();
  const add = (channel: Channel, id: string, url: string): void => {
    const key = `${channel}:${id}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ channel, id, url });
  };
  for (const m of storeMd.matchAll(
    /chromewebstore\.google\.com\/detail\/(?:[^\s/)`]+\/)?([a-p]{32})/g,
  )) {
    add('chrome', m[1] as string, `https://chromewebstore.google.com/detail/${m[1]}?hl=en`);
  }
  for (const m of storeMd.matchAll(
    /addons\.mozilla\.org\/(?:api\/v5\/addons\/addon|[a-zA-Z-]+\/firefox\/addon)\/([a-z0-9-]+)\//g,
  )) {
    add('firefox', m[1] as string, `https://addons.mozilla.org/api/v5/addons/addon/${m[1]}/`);
  }
  for (const m of storeMd.matchAll(/figma\.com\/community\/plugin\/(\d+)/g)) {
    add('figma', m[1] as string, `https://www.figma.com/api/plugins/${m[1]}/versions`);
  }
  return out;
}

const decode = (s: string): string =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');

/** Visible text of an HTML page: scripts, styles and tags gone, whitespace collapsed. */
export function visibleText(html: string): string {
  return decode(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' '),
  ).trim();
}

const num = (s: string): number => Number(s.replace(/,/g, ''));

/** Chrome Web Store detail page. Live = 200 + an "Add to Chrome" button. The page's own
 *  numbers sit before "You might also like…" (the related items carry their own ratings): the
 *  header shows `N users` once there are any, and the reviews block shows `No ratings` or
 *  `Average rating X out of 5` with `(N ratings)`. */
export function parseChrome(status: number, html: string): Reading {
  const text = visibleText(html);
  const live = status === 200 && text.includes('Add to Chrome');
  if (!live) {
    return {
      channel: 'chrome',
      live: false,
      note: `chrome: ${status === 200 ? 'page answered without "Add to Chrome"' : `${status} (not live)`}`,
    };
  }
  const cut = text.indexOf('You might also like');
  const own = cut === -1 ? text : text.slice(0, cut);
  const users = own.match(/(\d[\d,]*) users?\b/);
  const rated = own.match(/Average rating ([\d.]+) out of 5/);
  const count = own.match(/\((\d[\d,]*) ratings?\)/);
  const version = own.match(/\bVersion ([\d.]+)/);
  const updated = own.match(/\bUpdated ([A-Z][a-z]+ \d{1,2}, \d{4})/);
  const reading: Reading = {
    channel: 'chrome',
    live: true,
    users: users ? num(users[1] as string) : 0,
    note: '',
  };
  if (rated && !/No ratings/.test(own)) {
    reading.rating = `${rated[1]}${count ? ` (${count[1]})` : ''}`;
  }
  reading.note = [
    `chrome: ${reading.users} users`,
    reading.rating ? `rating ${reading.rating}` : 'no ratings',
    version ? `v${version[1]}` : undefined,
    updated ? `updated ${updated[1]}` : undefined,
  ]
    .filter(Boolean)
    .join(', ');
  return reading;
}

interface AmoAddon {
  status?: string;
  average_daily_users?: number;
  weekly_downloads?: number;
  ratings?: { average?: number; count?: number };
  current_version?: { version?: string };
}

/** AMO add-on API (`/api/v5/addons/addon/<slug>/`). Live = 200 + `status: public`. */
export function parseFirefox(status: number, body: string): Reading {
  let json: AmoAddon;
  try {
    json = JSON.parse(body) as AmoAddon;
  } catch {
    return { channel: 'firefox', live: false, note: `firefox: ${status}, not JSON` };
  }
  if (status !== 200 || json.status !== 'public') {
    return {
      channel: 'firefox',
      live: false,
      note: `firefox: ${status === 200 ? `status ${json.status ?? 'unknown'}` : `${status} (not live)`}`,
    };
  }
  const users = json.average_daily_users ?? 0;
  const count = json.ratings?.count ?? 0;
  const reading: Reading = { channel: 'firefox', live: true, users, note: '' };
  if (count > 0) reading.rating = `${(json.ratings?.average ?? 0).toFixed(1)} (${count})`;
  reading.note = [
    `firefox: ${users} adu`,
    `${json.weekly_downloads ?? 0} weekly downloads`,
    count > 0 ? `rating ${reading.rating}` : 'no ratings',
    json.current_version?.version ? `v${json.current_version.version}` : undefined,
  ]
    .filter(Boolean)
    .join(', ');
  return reading;
}

interface FigmaPlugin {
  install_count?: number;
  like_count?: number;
  view_count?: number;
  comment_count?: number;
  unique_run_count?: number;
  publishing_status?: string;
  current_plugin_version_id?: string;
  monetized_resource_metadata?: { purchase_count?: number } | null;
  versions?: Record<string, { created_at?: string }>;
}

/** Figma versions API (`/api/plugins/<id>/versions`). Live = 200 + `approved_public`. */
export function parseFigma(status: number, body: string): Reading {
  let plugin: FigmaPlugin | undefined;
  try {
    plugin = (JSON.parse(body) as { meta?: { plugin?: FigmaPlugin } }).meta?.plugin;
  } catch {
    return { channel: 'figma', live: false, note: `figma: ${status}, not JSON` };
  }
  if (status !== 200 || !plugin || plugin.publishing_status !== 'approved_public') {
    return {
      channel: 'figma',
      live: false,
      note: `figma: ${status === 200 ? `status ${plugin?.publishing_status ?? 'unknown'}` : `${status} (not live)`}`,
    };
  }
  const current = plugin.current_plugin_version_id;
  const created = current ? plugin.versions?.[current]?.created_at?.slice(0, 10) : undefined;
  const purchases = plugin.monetized_resource_metadata?.purchase_count;
  const reading: Reading = {
    channel: 'figma',
    live: true,
    users: plugin.install_count ?? 0,
    likes: plugin.like_count ?? 0,
    note: '',
  };
  if (purchases !== undefined) reading.purchases = purchases;
  reading.note = [
    `figma: install_count ${plugin.install_count ?? 0}`,
    `like_count ${plugin.like_count ?? 0}`,
    `view_count ${plugin.view_count ?? 0}`,
    `unique_run_count ${plugin.unique_run_count ?? 0}`,
    `comment_count ${plugin.comment_count ?? 0}`,
    purchases !== undefined ? `purchase_count ${purchases}` : undefined,
    current ? `version ${current}${created ? ` (${created})` : ''}` : undefined,
  ]
    .filter(Boolean)
    .join(', ');
  return reading;
}

export const DEFAULT_HEADER = '| Date | Event | Users | Rating | Sales | Notes |';

/** The `Daily check` row in the venture's own columns. Users sums the live channels. */
export function renderRow(date: string, header: string, readings: Reading[]): string {
  const cols = header
    .split('|')
    .map((c) => c.trim())
    .filter(Boolean);
  const live = readings.filter((r) => r.live);
  const sum = (key: 'users' | 'likes' | 'purchases'): string => {
    const vals = live.map((r) => r[key]).filter((v): v is number => typeof v === 'number');
    return vals.length ? String(vals.reduce((a, b) => a + b, 0)) : '—';
  };
  const ratings = live.map((r) => r.rating).filter((r): r is string => Boolean(r));
  const notes = readings.map((r) => r.note).join('; ');
  const cells = cols.map((col) => {
    switch (col) {
      case 'Date':
        return date;
      case 'Event':
        return 'Daily check';
      case 'Users':
        return sum('users');
      case 'Likes':
        return sum('likes');
      case 'Purchases':
        return sum('purchases');
      case 'Rating':
        return ratings.length ? ratings.join(' / ') : '—';
      case 'Notes':
        return live.length
          ? `via store-metrics CI: ${notes}`
          : `not live yet (store-metrics CI: ${notes})`;
      default:
        return '—';
    }
  });
  return `| ${cells.join(' | ')} |`;
}

const METRICS_HEADING = /^## (?:\d+\.\s*)?Metrics\b.*$/m;

/** The table header line of the venture's `## Metrics` section, or the default. */
export function metricsHeader(md: string): string {
  const i = md.search(METRICS_HEADING);
  if (i === -1) return DEFAULT_HEADER;
  const m = md.slice(i).match(/^\| *Date *\|.*$/m);
  return m ? m[0] : DEFAULT_HEADER;
}

/** Upsert the row: replace today's `Daily check` (unless `ifMissing`), else append after the
 *  last row of the metrics table; create the section when the file has none. */
export function upsertRow(md: string, date: string, row: string, ifMissing = false): string {
  if (md.search(METRICS_HEADING) === -1) {
    md = `${md.trimEnd()}\n\n## Metrics\n\n${DEFAULT_HEADER}\n|---|---|---|---|---|---|\n`;
  }
  const own = new RegExp(`^\\| ${date} \\| Daily check \\|.*$`, 'm');
  if (own.test(md)) {
    return ifMissing ? md : md.replace(own, row);
  }
  const i = md.search(METRICS_HEADING);
  const after = md.slice(i);
  const nextHeading = after.search(/\n## /);
  const section = nextHeading === -1 ? after : after.slice(0, nextHeading);
  const lastRow = section.lastIndexOf('\n|');
  const lineEnd = section.indexOf('\n', lastRow + 1);
  const end = i + (lineEnd === -1 ? section.length : lineEnd);
  const out = `${md.slice(0, end).trimEnd()}\n${row}${md.slice(end)}`;
  return out.endsWith('\n') ? out : `${out}\n`;
}

/** Flip STORE.md's `not live yet` on lines naming a channel whose page answers. When no line
 *  names a channel and every channel is live, flip the phrase everywhere. */
export function flipStore(storeMd: string, readings: Reading[], date: string): string {
  const phrase = /not live yet/gi;
  if (!phrase.test(storeMd)) return storeMd;
  const live = readings.filter((r) => r.live);
  if (!live.length) return storeMd;
  const stamp = (channel: Channel): string =>
    `live (${channel} page answered ${date}, store-metrics CI)`;
  let touched = false;
  const lines = storeMd.split('\n').map((line) => {
    if (!/not live yet/i.test(line)) return line;
    const hit = live.find((r) => CHANNEL_WORD[r.channel].test(line));
    if (!hit) return line;
    touched = true;
    return line.replace(/not live yet/gi, stamp(hit.channel));
  });
  if (touched) return lines.join('\n');
  if (live.length === readings.length && live[0]) {
    const only = live[0].channel;
    return storeMd.replace(/not live yet/gi, stamp(only));
  }
  return storeMd;
}

async function fetchListing(listing: Listing): Promise<Reading> {
  try {
    const res = await fetch(listing.url, {
      headers: {
        'user-agent': 'foundry-store-metrics/1 (+https://apps.gankdat.com)',
        accept: listing.channel === 'chrome' ? 'text/html' : 'application/json',
        'accept-language': 'en',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(20_000),
    });
    const body = await res.text();
    if (listing.channel === 'chrome') return parseChrome(res.status, body);
    if (listing.channel === 'firefox') return parseFirefox(res.status, body);
    return parseFigma(res.status, body);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      channel: listing.channel,
      live: false,
      note: `${listing.channel}: fetch failed: ${msg.replace(/\s+/g, ' ').slice(0, 80)}`,
      error: msg,
    };
  }
}

const today = (): string => new Date().toISOString().slice(0, 10);

async function main(): Promise<void> {
  const root = path.resolve(import.meta.dirname, '..');
  const date = process.env.STORE_METRICS_DATE ?? today();
  const ifMissing = Boolean(process.env.STORE_METRICS_IF_MISSING);
  const venturesDir = path.join(root, 'ventures');
  let ventures = 0;
  let failures = 0;
  for (const slug of readdirSync(venturesDir).sort()) {
    const storeFile = path.join(venturesDir, slug, 'STORE.md');
    const researchFile = path.join(venturesDir, slug, 'RESEARCH.md');
    if (!existsSync(storeFile) || !existsSync(researchFile)) continue;
    const storeMd = readFileSync(storeFile, 'utf8');
    const listings = listingsOf(storeMd);
    if (!listings.length) continue;
    ventures += 1;
    const readings = await Promise.all(listings.map(fetchListing));
    if (readings.every((r) => r.error)) failures += 1;
    const md = readFileSync(researchFile, 'utf8');
    const row = renderRow(date, metricsHeader(md), readings);
    const next = upsertRow(md, date, row, ifMissing);
    if (next !== md) writeFileSync(researchFile, next);
    const flipped = flipStore(storeMd, readings, date);
    if (flipped !== storeMd) writeFileSync(storeFile, flipped);
    console.log(
      `${slug}${next === md ? ' (row for today already present, left alone)' : ''}: ${row}`,
    );
  }
  if (ventures && failures === ventures) {
    console.error('every store fetch failed — no row is trustworthy');
    process.exit(1);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
