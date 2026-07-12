import { Hono } from 'hono';
import { publicBaseUrl } from '../lib/constants';
import { failure } from '../lib/envelope';
import type { SourceStats } from '../lib/stats';
import { isolateRateLimit } from '../metering/ratelimit';
import { getSource, listSources } from '../sources/registry';
import { sourceStats } from '../sources/store';
import type { DataSource } from '../sources/types';
import type { AppEnv } from '../types';

// Public per-source statistics pages (cite-bait, task 34): computed monthly
// numbers with methodology and machine-legible tables + schema.org Dataset
// JSON-LD, so search snippets and LLM retrieval can lift facts with
// attribution. Registry-driven — a new source gets its page automatically;
// its StatsSpec (in the source file, isolation rule) enriches it. No auth, no
// metering: the page IS the marketing. In-isolate rate limit only (KV-free).

const esc = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

const STYLE = `
:root{--bg:#0A0A0A;--panel:#111315;--green:#00FF41;--border:#2A2E33;--fg:#E6E8EA;--muted:#8B9299;
--mono:"JetBrains Mono","Fira Code",ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.6 var(--mono);padding:0 20px 60px}
main{max-width:820px;margin:0 auto}h1{font-size:1.5rem;letter-spacing:-.02em;margin:36px 0 6px}
h1 b,a{color:var(--green)}h2{font-size:.8rem;text-transform:uppercase;letter-spacing:.14em;color:var(--muted);margin-top:34px}
h2::before{content:"// ";color:var(--green)}table{border-collapse:collapse;width:100%;margin-top:10px;background:var(--panel)}
td,th{border:1px solid var(--border);padding:6px 12px;text-align:left;font-size:.85rem}th{color:var(--muted);font-weight:600}
td:last-child,th:last-child{text-align:right}.muted{color:var(--muted);font-size:.85rem}
.cta{border:1px solid var(--green);padding:14px 18px;margin-top:38px}.cta a{margin-right:18px}`;

function tableHtml(header: [string, string], rows: [string, number][]): string {
  const body = rows
    .map(
      ([label, count]) =>
        `<tr><td>${esc(label)}</td><td>${count.toLocaleString('en-GB')}</td></tr>`,
    )
    .join('');
  return `<table><thead><tr><th>${header[0]}</th><th>${header[1]}</th></tr></thead><tbody>${body}</tbody></table>`;
}

function jsonLd(source: DataSource, baseUrl: string, refreshedAt: string | null): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `${source.title} — statistics`,
    description: source.description,
    url: `${baseUrl}/stats/${source.slug}`,
    license: 'https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/',
    isAccessibleForFree: true,
    dateModified: refreshedAt ?? undefined,
    creator: { '@type': 'Organization', name: 'gankdat', url: baseUrl },
    distribution: [
      {
        '@type': 'DataDownload',
        encodingFormat: 'application/json',
        contentUrl: `${baseUrl}/v1/data/${source.slug}`,
      },
    ],
  });
}

function pageHtml(
  source: DataSource,
  stats: SourceStats,
  refreshedAt: string | null,
  baseUrl: string,
): string {
  const updated = refreshedAt ? refreshedAt.slice(0, 10) : 'daily';
  const sections: string[] = [];

  if (stats.monthly) {
    sections.push(
      `<h2>${esc(stats.monthly.title)}</h2>` +
        tableHtml(
          ['month', 'count'],
          stats.monthly.buckets.map((b) => [b.month, b.count]),
        ),
    );
  }
  for (const group of stats.groups) {
    sections.push(
      `<h2>${esc(group.title)}</h2>` +
        tableHtml(
          ['value', 'records'],
          group.rows.map((r) => [r.value, r.count]),
        ),
    );
  }

  const description = `${source.title}: ${stats.total.toLocaleString('en-GB')} records, updated ${updated}. Monthly statistics computed from the official feed. Free JSON API.`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="icon" type="image/png" href="/favicon.png">
<title>${esc(source.title)} — statistics | gankdat</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${baseUrl}/stats/${source.slug}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="gankdat">
<meta property="og:title" content="${esc(source.title)} — statistics">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${baseUrl}/stats/${source.slug}">
<script type="application/ld+json">${jsonLd(source, baseUrl, refreshedAt)}</script>
<style>${STYLE}</style>
</head>
<body><main>
<p class="muted"><a href="/">gankdat</a> / <a href="/stats">stats</a></p>
<h1>${esc(source.title)} — <b>statistics</b></h1>
<p class="muted">${esc(source.description)}</p>
<h2>headline</h2>
<table><tbody>
<tr><td>records in dataset</td><td>${stats.total.toLocaleString('en-GB')}</td></tr>
<tr><td>last refreshed</td><td>${esc(updated)}</td></tr>
</tbody></table>
${sections.join('\n')}
<h2>methodology</h2>
<p class="muted">Computed from the same records the gankdat API serves — official
government feeds, refreshed daily, no scraping. This dataset's licence and
personal-data posture are stated in the <a href="/terms">terms</a>. Counts
reflect the current dataset window, not all-time totals. Cite this page with
its URL and the last-refreshed date.</p>
<div class="cta">
<b>Get this data as JSON</b><br>
<span class="muted">free tier, 250 req/mo — or MCP for agents</span><br><br>
<a href="/docs">docs</a> <a href="/account">get a key</a> <a href="/llms.txt">llms.txt</a>
</div>
</main></body></html>`;
}

export const statsRoutes = new Hono<AppEnv>()
  .use('*', async (c, next) => {
    const ip = c.req.header('CF-Connecting-IP') ?? 'unknown';
    const retryAfter = isolateRateLimit(`stats:${ip}`, 120, 60);
    if (retryAfter > 0) {
      c.header('Retry-After', String(retryAfter));
      return c.json(failure('rate_limited', 'Rate limit exceeded; retry later'), 429);
    }
    return next();
  })
  .get('/', (c) => {
    const baseUrl = publicBaseUrl(c.env);
    const items = listSources()
      .map(
        (s) =>
          `<li><a href="/stats/${s.slug}">${esc(s.title)}</a> — <span class="muted">${esc(s.description)}</span></li>`,
      )
      .join('');
    c.header('Cache-Control', 'public, max-age=3600');
    return c.html(`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="icon" type="image/png" href="/favicon.png">
<title>Dataset statistics | gankdat</title>
<meta name="description" content="Monthly statistics computed from gankdat's UK public-sector datasets — citable, updated daily.">
<link rel="canonical" href="${baseUrl}/stats">
<style>${STYLE}</style></head>
<body><main><p class="muted"><a href="/">gankdat</a> / stats</p>
<h1>dataset <b>statistics</b></h1>
<p class="muted">Computed daily from official feeds. Citable with URL + date.</p>
<ul>${items}</ul></main></body></html>`);
  })
  .get('/:source', async (c) => {
    const source = getSource(c.req.param('source'));
    if (!source) return c.json(failure('not_found', 'Unknown source'), 404);
    let result;
    try {
      result = await sourceStats(c.env, source);
    } catch {
      return c.json(failure('unavailable', 'Source temporarily unavailable, retry later'), 503);
    }
    c.header('Cache-Control', 'public, max-age=3600');
    return c.html(pageHtml(source, result.stats, result.last_refreshed_at, publicBaseUrl(c.env)));
  });
