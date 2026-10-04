// Fixes what `web-ext sign` cannot: the Firefox (AMO) listing's screenshots, category, tags
// and homepage. `npm run amo-listing -- ventures/<slug>` reads `assets/amo-listing.json` next to
// `amo-metadata.json`, PATCHes the listing fields and uploads any screenshot the listing lacks.
// Idempotent: run it twice and the second run changes nothing. Needs AMO_JWT_ISSUER and
// AMO_JWT_SECRET in .env (owner action #6). Highlight-keep item `amo-listing-previews`.
import { createHmac, randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

export const AMO_API = 'https://addons.mozilla.org/api/v5';

export interface ListingConfig {
  /** AMO add-on slug, e.g. highlight-keep-web-highlighter. */
  slug: string;
  /** Category slugs as AMO's v5 API takes them (flat list), e.g. ["productivity"]. */
  categories: string[];
  /** Tags from AMO's fixed tag list; an unknown one is a 400 that names the allowed set. */
  tags: string[];
  /** Screenshots in display order, paths relative to the venture folder. */
  previews: { file: string; caption?: string }[];
}

interface Metadata {
  homepage?: Record<string, string>;
  support_email?: Record<string, string>;
}

const b64url = (b: Buffer | string): string =>
  Buffer.from(b).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');

/** AMO's JWT: HS256, issuer + secret from the API-keys page, at most five minutes long. */
export function amoJwt(issuer: string, secret: string, now = new Date()): string {
  const iat = Math.floor(now.getTime() / 1000);
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = b64url(JSON.stringify({ iss: issuer, jti: randomUUID(), iat, exp: iat + 240 }));
  const sig = b64url(createHmac('sha256', secret).update(`${header}.${payload}`).digest());
  return `${header}.${payload}.${sig}`;
}

/** The PATCH body for the listing: homepage/support from amo-metadata plus category and tags. */
export function listingPatch(meta: Metadata, cfg: ListingConfig): Record<string, unknown> {
  const body: Record<string, unknown> = { categories: cfg.categories, tags: cfg.tags };
  if (meta.homepage) body.homepage = meta.homepage;
  if (meta.support_email) body.support_email = meta.support_email;
  return body;
}

export function validateConfig(raw: unknown): ListingConfig {
  const c = raw as Partial<ListingConfig> | null;
  if (!c || typeof c !== 'object') throw new Error('amo-listing.json: not an object');
  if (typeof c.slug !== 'string' || !/^[a-z0-9-]+$/.test(c.slug))
    throw new Error('amo-listing.json: slug must be the AMO add-on slug');
  for (const k of ['categories', 'tags'] as const) {
    const v = c[k];
    if (!Array.isArray(v) || v.some((x) => typeof x !== 'string' || !x))
      throw new Error(`amo-listing.json: ${k} must be a list of strings`);
  }
  if (!Array.isArray(c.previews) || c.previews.some((p) => !p || typeof p.file !== 'string'))
    throw new Error('amo-listing.json: previews must be [{file, caption?}]');
  if (c.previews.length > 10) throw new Error('amo-listing.json: AMO allows at most 10 previews');
  return c as ListingConfig;
}

/** Which configured screenshots are still missing: AMO holds `existing` already, in order. */
export function previewsToUpload(
  cfg: ListingConfig,
  existing: number,
): { file: string; caption?: string; position: number }[] {
  return cfg.previews.slice(existing).map((p, i) => ({ ...p, position: existing + i }));
}

interface AddonDetail {
  previews?: unknown[];
  categories?: unknown;
  tags?: string[];
  homepage?: { url?: Record<string, string> } | null;
}

async function api(
  token: string,
  method: string,
  url: string,
  body?: string | FormData,
  json = true,
): Promise<{ status: number; text: string }> {
  const headers: Record<string, string> = { Authorization: `JWT ${token}` };
  if (json && body) headers['Content-Type'] = 'application/json';
  const res = await fetch(url, body ? { method, headers, body } : { method, headers });
  return { status: res.status, text: await res.text() };
}

export async function main(venture: string): Promise<void> {
  const issuer = process.env.AMO_JWT_ISSUER;
  const secret = process.env.AMO_JWT_SECRET;
  if (!issuer || !secret) throw new Error('missing AMO_JWT_ISSUER / AMO_JWT_SECRET in .env');
  const dir = path.resolve(venture);
  const cfg = validateConfig(
    JSON.parse(await readFile(path.join(dir, 'assets/amo-listing.json'), 'utf8')),
  );
  const meta = JSON.parse(
    await readFile(path.join(dir, 'assets/amo-metadata.json'), 'utf8'),
  ) as Metadata;
  const base = `${AMO_API}/addons/addon/${cfg.slug}/`;

  const before = await api(amoJwt(issuer, secret), 'GET', base);
  if (before.status !== 200)
    throw new Error(`GET ${base}: ${before.status} ${before.text.slice(0, 300)}`);
  const detail = JSON.parse(before.text) as AddonDetail;
  console.log(
    `${cfg.slug}: previews ${detail.previews?.length ?? 0}, tags ${JSON.stringify(detail.tags ?? [])}, homepage ${detail.homepage?.url?.['en-US'] ?? '—'}`,
  );

  const patch = await api(
    amoJwt(issuer, secret),
    'PATCH',
    base,
    JSON.stringify(listingPatch(meta, cfg)),
  );
  if (patch.status !== 200)
    throw new Error(`PATCH listing: ${patch.status} ${patch.text.slice(0, 500)}`);
  console.log(
    `listing fields set: categories ${cfg.categories.join(',')}, tags ${cfg.tags.join(',')}`,
  );

  for (const p of previewsToUpload(cfg, detail.previews?.length ?? 0)) {
    const form = new FormData();
    form.set(
      'image',
      new Blob([await readFile(path.join(dir, p.file))], { type: 'image/png' }),
      path.basename(p.file),
    );
    form.set('position', String(p.position));
    // AMO rejects a caption inside the multipart upload ("must provide an object of
    // {lang-code:value}"), so the image goes up first and the caption follows as JSON.
    const up = await api(amoJwt(issuer, secret), 'POST', `${base}previews/`, form, false);
    if (up.status !== 201 && up.status !== 200)
      throw new Error(`preview ${p.file}: ${up.status} ${up.text.slice(0, 500)}`);
    console.log(`uploaded ${p.file} at position ${p.position}`);
    if (p.caption) {
      const id = (JSON.parse(up.text) as { id: number }).id;
      const cap = await api(
        amoJwt(issuer, secret),
        'PATCH',
        `${base}previews/${id}/`,
        JSON.stringify({ caption: { 'en-US': p.caption } }),
      );
      if (cap.status !== 200)
        console.log(`caption for ${p.file}: ${cap.status} ${cap.text.slice(0, 200)}`);
    }
  }
  const after = await api(amoJwt(issuer, secret), 'GET', base);
  const d2 = JSON.parse(after.text) as AddonDetail;
  console.log(`done: previews ${d2.previews?.length ?? 0}, tags ${JSON.stringify(d2.tags ?? [])}`);
}

if (process.argv[1] && path.basename(process.argv[1]) === 'amo-listing.ts') {
  const venture = process.argv[2];
  if (!venture) {
    console.log('usage: npm run amo-listing -- ventures/<slug>');
    process.exit(1);
  }
  main(venture).catch((e: unknown) => {
    console.error(e instanceof Error ? e.message : String(e));
    process.exit(1);
  });
}
