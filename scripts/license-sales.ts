// Extension sales reading from CI (foundry `metrics-extension-sales`, 2026-10-11): counts the licence
// Worker's `license:<id>` KV records per venture and fills the `Sales` column of today's `Daily check`
// row (plus a `sales: …` clause in Notes) for every venture whose metrics table has that column.
//
// Why: STRATEGY §4 "Extension + plugin sales" had a reading for the Figma plugin (the versions API's
// purchase count) and none for ReadFocus or Highlight Keep — their rows printed `—` under Sales and
// the only record of a sale would have been a Stripe payout mail. packages/license-worker stores
// every issued key as `license:<session id>` in the LICENSES namespace (wrangler.toml) with the
// venture slug, the buyer's email and the activation timestamps; this reads that namespace through
// the Cloudflare API with the deploy token (template "Edit Cloudflare Workers" + Workers KV Storage,
// owner action 003). Internal/test buyers (@gankdat.com, @1402celsius.com, @example.com, giova1506@)
// are counted apart, never as sales; revoked keys likewise.
//
// Reads: `sales: 2 keys (3 activations)`; `sales: 0 keys`; `sales: n/a (<reason>)` when the token is
// missing or lacks the KV scope — a reading that says why, never a silent gap. The Sales cell gets
// the key count (or stays `—` on n/a). Never writes a row of its own.
//
// Run: node --disable-warning=ExperimentalWarning scripts/license-sales.ts
// Env: CLOUDFLARE_API_TOKEN          the deploy token (secret, never logged)
//      STORE_METRICS_IF_MISSING=1    leave a row that already has a `sales:` clause alone
//      STORE_METRICS_DATE=YYYY-MM-DD row date (default: today, UTC)
// Node 22 runs .ts directly — keep syntax erasable, import only node builtins.
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ACCOUNT_ID = '37e56f3ce4dfe49919e85d4380467f44'; // not a secret (landing.yml)
export const WRANGLER_TOML = path.join('packages', 'license-worker', 'wrangler.toml');
export const VENTURES_DIR = 'ventures';
export const KEY_PREFIX = 'license:';
/** Reads per run: the namespace is tiny today; a cap keeps a runaway day from burning minutes. */
export const MAX_RECORDS = 500;
export const CLAUSE = /^sales: /;
/** Mailboxes that are ours (CLAUDE.md "Facts you must not misread"): test keys, never customers. */
export const INTERNAL_EMAIL = /(@gankdat\.com|@1402celsius\.com|@example\.com)$|^giova1506@/i;

export interface LicenseRecord {
  key?: string;
  email: string | null;
  payload: { venture: string; tier?: string; id: string; issued: string };
  revoked?: boolean;
  activations?: number[];
}

export interface VentureSales {
  keys: number;
  activations: number;
  revoked: number;
  test: number;
}

/** The LICENSES namespace id from the Worker's wrangler.toml (one `[[kv_namespaces]]` block). */
export function namespaceId(toml: string): string | undefined {
  const m = toml.match(/\[\[kv_namespaces\]\][^[]*?\bid\s*=\s*"([0-9a-f]{32})"/);
  return m?.[1];
}

/** Records by venture slug: live keys of real buyers, their activations, revoked and test keys apart. */
export function summarise(records: LicenseRecord[]): Map<string, VentureSales> {
  const out = new Map<string, VentureSales>();
  for (const r of records) {
    const venture = r.payload?.venture;
    if (!venture) continue;
    const s = out.get(venture) ?? { keys: 0, activations: 0, revoked: 0, test: 0 };
    if (r.email && INTERNAL_EMAIL.test(r.email)) s.test += 1;
    else if (r.revoked) s.revoked += 1;
    else {
      s.keys += 1;
      s.activations += r.activations?.length ?? 0;
    }
    out.set(venture, s);
  }
  return out;
}

/** `sales: 2 keys (3 activations, 1 revoked, 1 test)` — the zero parts left out. */
export function salesClause(s: VentureSales | undefined): string {
  const v = s ?? { keys: 0, activations: 0, revoked: 0, test: 0 };
  const parts = [
    v.keys > 0 ? `${v.activations} activations` : '',
    v.revoked > 0 ? `${v.revoked} revoked` : '',
    v.test > 0 ? `${v.test} test` : '',
  ].filter(Boolean);
  return `sales: ${v.keys} keys${parts.length ? ` (${parts.join(', ')})` : ''}`;
}

/** The metrics table header (`| Date | Event | … |`) after `## Metrics`, or undefined. */
export function metricsHeader(md: string): string | undefined {
  const i = md.search(/^## Metrics/m);
  if (i === -1) return undefined;
  return md.slice(i).match(/^\| *Date *\|.*$/m)?.[0];
}

/** Column index of `Sales` in the header, or -1 (Figma's table has `Purchases`, read elsewhere). */
export function salesColumn(header: string | undefined): number {
  if (!header) return -1;
  return header
    .split('|')
    .map((c) => c.trim())
    .filter(Boolean)
    .indexOf('Sales');
}

function notesOf(line: string): string[] {
  const cells = line.replace(/\s*\|\s*$/, '').split('|');
  const notes = (cells[cells.length - 1] ?? '').trim();
  return notes ? notes.split(/;\s*/) : [];
}

/**
 * Upsert the reading on today's `Daily check` row: the Sales cell (left alone when `sales` is
 * undefined — an n/a reading) and the `sales:` clause in Notes. No row for the day → unchanged.
 */
export function upsertSales(
  md: string,
  date: string,
  sales: number | undefined,
  clause: string,
  ifMissing = false,
): string {
  const col = salesColumn(metricsHeader(md));
  if (col === -1) return md;
  const own = new RegExp(`^\\| ${date} \\| Daily check \\|.*$`, 'm');
  const m = md.match(own);
  if (!m) return md;
  const clauses = notesOf(m[0]);
  const i = clauses.findIndex((c) => CLAUSE.test(c));
  if (i !== -1 && ifMissing) return md;
  if (i === -1) clauses.push(clause);
  else clauses[i] = clause;
  const cells = m[0]
    .replace(/^\|\s*/, '')
    .replace(/\s*\|\s*$/, '')
    .split('|')
    .map((c) => c.trim());
  if (sales !== undefined) cells[col] = String(sales);
  cells[cells.length - 1] = clauses.join('; ');
  return md.replace(own, `| ${cells.join(' | ')} |`);
}

interface KvKeysPage {
  success: boolean;
  errors?: { code: number; message: string }[];
  result?: { name: string }[];
  result_info?: { cursor?: string };
}

async function listKeys(token: string, ns: string): Promise<string[]> {
  const names: string[] = [];
  let cursor = '';
  do {
    const url = new URL(
      `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${ns}/keys`,
    );
    url.searchParams.set('prefix', KEY_PREFIX);
    url.searchParams.set('limit', '1000');
    if (cursor) url.searchParams.set('cursor', cursor);
    const res = await fetch(url, { headers: { authorization: `Bearer ${token}` } });
    const body = (await res.json()) as KvKeysPage;
    if (!res.ok || !body.success) {
      const why =
        body.errors?.map((e) => `${e.code} ${e.message}`).join('; ') || `HTTP ${res.status}`;
      throw new Error(why.slice(0, 120));
    }
    for (const k of body.result ?? []) names.push(k.name);
    cursor = body.result_info?.cursor ?? '';
  } while (cursor && names.length < MAX_RECORDS);
  return names.slice(0, MAX_RECORDS);
}

async function readRecord(token: string, ns: string, name: string): Promise<LicenseRecord | null> {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${ns}/values/${encodeURIComponent(name)}`,
    { headers: { authorization: `Bearer ${token}` } },
  );
  if (!res.ok) return null;
  try {
    return (await res.json()) as LicenseRecord;
  } catch {
    return null;
  }
}

/** Every venture folder with a RESEARCH.md whose metrics table has a Sales column. */
export function venturesWithSales(root = VENTURES_DIR): string[] {
  if (!existsSync(root)) return [];
  return readdirSync(root)
    .filter((slug) => existsSync(path.join(root, slug, 'RESEARCH.md')))
    .filter(
      (slug) =>
        salesColumn(metricsHeader(readFileSync(path.join(root, slug, 'RESEARCH.md'), 'utf8'))) !==
        -1,
    )
    .sort();
}

async function main(): Promise<void> {
  const date = process.env['STORE_METRICS_DATE'] ?? new Date().toISOString().slice(0, 10);
  const ifMissing = process.env['STORE_METRICS_IF_MISSING'] === '1';
  const token = process.env['CLOUDFLARE_API_TOKEN'];
  const ns = existsSync(WRANGLER_TOML)
    ? namespaceId(readFileSync(WRANGLER_TOML, 'utf8'))
    : undefined;

  let byVenture: Map<string, VentureSales> | undefined;
  let reason = '';
  if (!token) reason = 'no CLOUDFLARE_API_TOKEN';
  else if (!ns) reason = `no LICENSES namespace id in ${WRANGLER_TOML}`;
  else {
    try {
      const names = await listKeys(token, ns);
      const records = (await Promise.all(names.map((n) => readRecord(token, ns, n)))).filter(
        (r): r is LicenseRecord => r !== null,
      );
      byVenture = summarise(records);
      console.log(`license-sales: ${names.length} keys read from LICENSES`);
    } catch (e) {
      reason = `KV list failed: ${e instanceof Error ? e.message : String(e)}`;
    }
  }

  for (const slug of venturesWithSales()) {
    const file = path.join(VENTURES_DIR, slug, 'RESEARCH.md');
    const md = readFileSync(file, 'utf8');
    const s = byVenture?.get(slug);
    const clause = byVenture ? salesClause(s) : `sales: n/a (${reason})`;
    const next = upsertSales(md, date, byVenture ? (s?.keys ?? 0) : undefined, clause, ifMissing);
    if (next !== md) {
      writeFileSync(file, next);
      console.log(`${slug}: ${clause}`);
    } else {
      console.log(`${slug}: no Daily check row for ${date} or already read`);
    }
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((e: unknown) => {
    console.error(e instanceof Error ? e.message : String(e));
    process.exit(1);
  });
}
