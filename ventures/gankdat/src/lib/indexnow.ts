import { readSourceStats } from '../sources/cache';
import type { SourceStats } from './stats';

// IndexNow (indexnow.org): one POST of changed URLs, authenticated by a key file at the
// site root, feeds Bing's index — which DuckDuckGo, Copilot and ChatGPT web search read.
// No account, no identity: the only indexing signal the repo can send itself while the
// Search Console reading stays owner-blocked (queue `search-console-stats-indexing`).
// The key is deliberately a plain wrangler var, not a secret: anyone can read it from the
// key file anyway, and it proves nothing but control of the host.

export const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/IndexNow';
/** The protocol's ceiling per POST. */
export const INDEXNOW_MAX_URLS = 10_000;
/** 8–128 of [a-zA-Z0-9-] per the protocol; the Worker only serves a key of this shape. */
export const INDEXNOW_KEY_SHAPE = /^[A-Za-z0-9-]{8,128}$/;

export type FetchLike = (input: string, init: RequestInit) => Promise<Response>;

/** The public pages one source's refresh changed: the parent stats page and every facet sub-page. */
export function statsUrlsFor(baseUrl: string, slug: string, stats: SourceStats | null): string[] {
  const base = baseUrl.replace(/\/+$/, '');
  const urls = [`${base}/stats/${slug}`];
  for (const facet of stats?.facets ?? []) {
    for (const page of facet.pages) {
      urls.push(`${base}/stats/${slug}/${facet.segment}/${encodeURIComponent(page.value)}`);
    }
  }
  return urls;
}

export interface IndexNowResult {
  /** URLs submitted (after de-duplication). */
  urls: number;
  /** HTTP status of the last call; null when nothing was sent (no key, no URLs). */
  status: number | null;
  /** Number of POSTs made (URLs are chunked at INDEXNOW_MAX_URLS). */
  calls: number;
}

/**
 * POST `urls` to IndexNow for the host of `baseUrl`, chunked at `maxPerCall`. Pure: no
 * bindings, so the GitHub runner (runner-refresh.mjs) can call it too. Never throws — a
 * network error reads as status 0 so a wave is never failed by an indexing hint.
 */
export async function postIndexNow(opts: {
  baseUrl: string;
  key: string;
  urls: string[];
  fetchImpl?: FetchLike;
  maxPerCall?: number;
}): Promise<IndexNowResult> {
  const key = opts.key.trim();
  const unique = [...new Set(opts.urls)];
  if (!INDEXNOW_KEY_SHAPE.test(key) || unique.length === 0) {
    return { urls: 0, status: null, calls: 0 };
  }
  const base = opts.baseUrl.replace(/\/+$/, '');
  const host = new URL(base).host;
  const fetchImpl = opts.fetchImpl ?? ((input, init) => fetch(input, init));
  const max = Math.max(1, Math.min(opts.maxPerCall ?? INDEXNOW_MAX_URLS, INDEXNOW_MAX_URLS));
  let status: number | null = null;
  let calls = 0;
  for (let i = 0; i < unique.length; i += max) {
    const urlList = unique.slice(i, i + max);
    calls += 1;
    try {
      const res = await fetchImpl(INDEXNOW_ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ host, key, keyLocation: `${base}/${key}.txt`, urlList }),
      });
      status = res.status;
    } catch {
      status = 0;
    }
    // A rejected key or a throttle will not change on the next chunk; stop and report it.
    if (status !== 200 && status !== 202) break;
  }
  return { urls: unique.length, status, calls };
}

/**
 * After a refresh wave: submit the stats pages of the sources that refreshed OK and
 * record the outcome as an Analytics Engine point (blob1 'indexnow', blob2 status,
 * blob3 wave, double1 URLs) — the `indexnow:` reading in the Daily numbers row.
 */
export async function pingStatsPages(
  env: CloudflareBindings,
  slugs: string[],
  wave: string,
  fetchImpl?: FetchLike,
): Promise<IndexNowResult> {
  const key = (env.INDEXNOW_KEY ?? '').trim();
  if (!INDEXNOW_KEY_SHAPE.test(key) || slugs.length === 0) {
    return { urls: 0, status: null, calls: 0 };
  }
  const urls: string[] = [];
  for (const slug of slugs) {
    const cached = await readSourceStats(env, slug).catch(() => null);
    urls.push(...statsUrlsFor(env.PUBLIC_BASE_URL, slug, cached?.stats ?? null));
  }
  const result = await postIndexNow({ baseUrl: env.PUBLIC_BASE_URL, key, urls, fetchImpl });
  console.log(
    JSON.stringify({
      level: result.status === 200 || result.status === 202 ? 'info' : 'warn',
      event: 'indexnow',
      wave,
      sources: slugs,
      urls: result.urls,
      status: result.status,
      calls: result.calls,
    }),
  );
  try {
    env.TRAFFIC.writeDataPoint({
      blobs: ['indexnow', String(result.status ?? ''), wave, '', slugs.join(',').slice(0, 256)],
      doubles: [result.urls],
      indexes: ['indexnow'],
    });
  } catch {
    // Analytics is best-effort; the ping already happened.
  }
  return result;
}
