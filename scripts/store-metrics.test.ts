import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_HEADER,
  flipStore,
  listingsOf,
  metricsHeader,
  parseChrome,
  parseFigma,
  parseFigmaRank,
  parseFirefox,
  rankNote,
  rankQueriesOf,
  renderRow,
  upsertRow,
} from './store-metrics.ts';

// Shapes below are what the relay returned on 2026-09-30 (cws-pages, amo-listings,
// metrics-2026-09-30), trimmed — not invented.
const cwsPage = (opts: { users?: string; rating?: string; live?: boolean } = {}): string => `
<html><head><title>ReadFocus — Focus Reading - Chrome Web Store</title>
<script>var x = "1,000,000 users Add to Chrome Average rating 1 out of 5";</script>
<style>.badge-users{grid-area:badge-users}</style></head><body>
<h1>ReadFocus &amp; Dyslexia Fonts</h1>${opts.rating ? `<span>${opts.rating}</span>` : ''}
<span>Extension</span><span>Accessibility</span>${opts.users ? `<span>${opts.users} users</span>` : ''}
${opts.live === false ? '' : '<button>Add to Chrome</button>'}
<h2>Overview</h2><p>Bold word starts, a reading ruler.</p>
<div>${opts.rating ? '' : '0 out of 5 No ratings'} Learn more about results and reviews.</div>
<h2>Details</h2><div>Version</div><div>0.1.0</div><div>Updated</div><div>September 21, 2026</div>
<h2>You might also like…</h2><div>Read It To Me 4.3 Average rating 4.3 out of 5 stars. 12,345 users</div>
</body></html>`;

const amo = JSON.stringify({
  slug: 'readfocus-focus-reading-dyslex',
  status: 'public',
  average_daily_users: 0,
  weekly_downloads: 2,
  ratings: { average: 0, bayesian_average: 0, count: 0, text_count: 0 },
  current_version: { version: '0.1.0' },
});

const figma = JSON.stringify({
  error: false,
  status: 200,
  meta: {
    plugin: {
      id: '1682711656065145288',
      current_plugin_version_id: '281046',
      install_count: 0,
      like_count: 0,
      view_count: 2,
      comment_count: 0,
      unique_run_count: 1,
      publishing_status: 'approved_public',
      monetized_resource_metadata: { price: 1200, purchase_count: 0 },
      versions: { '281046': { created_at: '2026-09-28T21:06:34.197Z' } },
    },
  },
});

describe('listingsOf', () => {
  it('finds one listing per channel in the real STORE.md files', () => {
    const rf = listingsOf(readFileSync('ventures/read-focus/STORE.md', 'utf8'));
    expect(rf).toEqual([
      {
        channel: 'chrome',
        id: 'dckbdaplggmhimpbekhdbaampglfhdgf',
        url: 'https://chromewebstore.google.com/detail/dckbdaplggmhimpbekhdbaampglfhdgf?hl=en',
      },
      {
        channel: 'firefox',
        id: 'readfocus-focus-reading-dyslex',
        url: 'https://addons.mozilla.org/api/v5/addons/addon/readfocus-focus-reading-dyslex/',
      },
    ]);
    const hk = listingsOf(readFileSync('ventures/highlight-keep/STORE.md', 'utf8'));
    expect(hk.map((l) => `${l.channel}:${l.id}`)).toEqual([
      'chrome:pciignkojfpgmfcmjchmpdhonpjkfepc',
      'firefox:highlight-keep-web-highlighter',
    ]);
    const vt = listingsOf(readFileSync('ventures/variables-toolkit/STORE.md', 'utf8'));
    expect(vt).toEqual([
      {
        channel: 'figma',
        id: '1682711656065145288',
        url: 'https://www.figma.com/api/plugins/1682711656065145288/versions',
      },
    ]);
  });

  it('accepts slugged Chrome URLs and the AMO listing page, and ignores a `<id>` placeholder', () => {
    const md = `- https://chromewebstore.google.com/detail/readfocus-%E2%80%94-focus-reading/dckbdaplggmhimpbekhdbaampglfhdgf?hl=en
- \`https://chromewebstore.google.com/detail/<id>?hl=en\`
- https://addons.mozilla.org/en-US/firefox/addon/readfocus-focus-reading-dyslex/`;
    expect(listingsOf(md).map((l) => l.id)).toEqual([
      'dckbdaplggmhimpbekhdbaampglfhdgf',
      'readfocus-focus-reading-dyslex',
    ]);
  });
});

describe('parseChrome', () => {
  it('reads a live page with no users yet — the count is not rendered, so it is 0', () => {
    const r = parseChrome(200, cwsPage());
    expect(r).toMatchObject({ channel: 'chrome', live: true, users: 0 });
    expect(r.rating).toBeUndefined();
    expect(r.note).toBe('chrome: 0 users, no ratings, v0.1.0, updated September 21, 2026');
  });

  it('reads users and rating from the page header, never from the related items', () => {
    const r = parseChrome(
      200,
      cwsPage({ users: '1,204', rating: '4.8 (17 ratings) Average rating 4.8 out of 5 stars.' }),
    );
    expect(r.users).toBe(1204);
    expect(r.rating).toBe('4.8 (17)');
    expect(r.note.startsWith('chrome: 1204 users, rating 4.8 (17)')).toBe(true);
  });

  it('treats a 404 or a page without the install button as not live', () => {
    expect(parseChrome(404, '<html>Not found</html>')).toMatchObject({
      live: false,
      note: 'chrome: 404 (not live)',
    });
    expect(parseChrome(200, cwsPage({ live: false })).live).toBe(false);
  });
});

describe('parseFirefox', () => {
  it('reads the AMO API body', () => {
    const r = parseFirefox(200, amo);
    expect(r).toMatchObject({ channel: 'firefox', live: true, users: 0 });
    expect(r.note).toBe('firefox: 0 adu, 2 weekly downloads, no ratings, v0.1.0');
  });

  it('is not live unless status is public', () => {
    expect(parseFirefox(200, amo.replace('"public"', '"nominated"')).note).toBe(
      'firefox: status nominated',
    );
    expect(parseFirefox(404, '{"detail":"Not found."}').note).toBe('firefox: 404 (not live)');
    expect(parseFirefox(200, '<html>').live).toBe(false);
  });
});

describe('parseFigma', () => {
  it('reads the versions API body', () => {
    const r = parseFigma(200, figma);
    expect(r).toMatchObject({ channel: 'figma', live: true, users: 0, likes: 0, purchases: 0 });
    expect(r.note).toBe(
      'figma: install_count 0, like_count 0, view_count 2, unique_run_count 1, comment_count 0, purchase_count 0, version 281046 (2026-09-28)',
    );
  });

  it('is not live unless approved_public', () => {
    expect(parseFigma(200, figma.replace('approved_public', 'in_review')).note).toBe(
      'figma: status in_review',
    );
  });
});

describe('renderRow', () => {
  it('fills the extension columns from Chrome + Firefox', () => {
    const row = renderRow('2026-10-01', DEFAULT_HEADER, [
      parseChrome(200, cwsPage({ users: '3' })),
      parseFirefox(200, amo),
    ]);
    expect(row).toBe(
      '| 2026-10-01 | Daily check | 3 | — | — | via store-metrics CI: chrome: 3 users, no ratings, v0.1.0, updated September 21, 2026; firefox: 0 adu, 2 weekly downloads, no ratings, v0.1.0 |',
    );
  });

  it('fills the Figma columns (Users/Likes/Purchases)', () => {
    const header = '| Date | Event | Users | Likes | Purchases | Notes |';
    const row = renderRow('2026-10-01', header, [parseFigma(200, figma)]);
    expect(
      row.startsWith(
        '| 2026-10-01 | Daily check | 0 | 0 | 0 | via store-metrics CI: figma: install_count 0',
      ),
    ).toBe(true);
  });

  it('says not live yet only when every channel answered and none is live', () => {
    const row = renderRow('2026-10-01', DEFAULT_HEADER, [
      parseChrome(404, ''),
      parseFirefox(404, '{"detail":"Not found."}'),
    ]);
    expect(row).toBe(
      '| 2026-10-01 | Daily check | — | — | — | not live yet (store-metrics CI: chrome: 404 (not live); firefox: 404 (not live)) |',
    );
  });

  it('says unread, never not live yet, when a channel could not be read (403, fetch error)', () => {
    const figma403 = parseFigma(403, '<html>Forbidden</html>');
    expect(figma403).toMatchObject({ live: false, unread: true, note: 'figma: 403, not JSON' });
    expect(parseChrome(429, '')).toMatchObject({ unread: true, note: 'chrome: 429 (unread)' });
    expect(parseFirefox(503, '{}')).toMatchObject({ unread: true, note: 'firefox: 503 (unread)' });
    const header = '| Date | Event | Users | Likes | Purchases | Notes |';
    expect(renderRow('2026-10-01', header, [figma403])).toBe(
      '| 2026-10-01 | Daily check | — | — | — | unread (store-metrics CI: figma: 403, not JSON) |',
    );
    const row = renderRow('2026-10-01', DEFAULT_HEADER, [
      parseChrome(404, ''),
      { channel: 'firefox', live: false, unread: true, note: 'firefox: fetch failed: timeout' },
    ]);
    expect(row).toContain(
      '| unread (store-metrics CI: chrome: 404 (not live); firefox: fetch failed: timeout) |',
    );
  });
});

describe('metricsHeader + upsertRow', () => {
  const md = `# Venture

## 6. Metrics

| Date | Event | Users | Likes | Purchases | Notes |
|---|---|---|---|---|---|
| 2026-09-29 | Daily check | 0 | 0 | — | via relay |
| 2026-09-30 | Daily check | 0 | 0 | — | via relay |

## 7. Next
text
`;

  it('finds the venture-specific header', () => {
    expect(metricsHeader(md)).toBe('| Date | Event | Users | Likes | Purchases | Notes |');
    expect(metricsHeader('# nothing')).toBe(DEFAULT_HEADER);
  });

  it('appends after the last table row, keeping the following section', () => {
    const out = upsertRow(md, '2026-10-01', '| 2026-10-01 | Daily check | 1 | 0 | 0 | ci |');
    expect(out).toContain(
      '| 2026-09-30 | Daily check | 0 | 0 | — | via relay |\n| 2026-10-01 | Daily check | 1 | 0 | 0 | ci |\n\n## 7. Next',
    );
  });

  it('replaces an existing row for the day unless ifMissing', () => {
    const row = '| 2026-09-30 | Daily check | 1 | 0 | 0 | ci |';
    expect(upsertRow(md, '2026-09-30', row)).toContain(`${row}\n\n## 7. Next`);
    expect(upsertRow(md, '2026-09-30', row)).not.toContain(
      '| 2026-09-30 | Daily check | 0 | 0 | — |',
    );
    expect(upsertRow(md, '2026-09-30', row, true)).toBe(md);
  });

  it('creates the section when a RESEARCH.md has none', () => {
    const out = upsertRow('# New\n', '2026-10-01', '| 2026-10-01 | Daily check | 0 | — | — | ci |');
    expect(out).toBe(
      `# New\n\n## Metrics\n\n${DEFAULT_HEADER}\n|---|---|---|---|---|---|\n| 2026-10-01 | Daily check | 0 | — | — | ci |\n`,
    );
  });
});

describe('flipStore', () => {
  const chromeLive = parseChrome(200, cwsPage());
  const firefoxDown = parseFirefox(404, '{}');

  it('flips only the channel whose page answers', () => {
    const md = `- **Status:** Chrome: not live yet (submitted 2026-09-20); Firefox: submitted\n- **Firefox Add-ons:** not live yet\n`;
    const out = flipStore(md, [chromeLive, firefoxDown], '2026-10-01');
    expect(out).toBe(
      `- **Status:** Chrome: live (chrome page answered 2026-10-01, store-metrics CI) (submitted 2026-09-20); Firefox: submitted\n- **Firefox Add-ons:** not live yet\n`,
    );
  });

  it('flips a bare status line when the venture has one channel and it is live', () => {
    const md = `- **Status:** not live yet\n`;
    expect(flipStore(md, [parseFigma(200, figma)], '2026-10-01')).toBe(
      `- **Status:** live (figma page answered 2026-10-01, store-metrics CI)\n`,
    );
  });

  it('leaves a file alone when nothing is live or nothing says not live yet', () => {
    expect(flipStore('- **Status:** not live yet\n', [firefoxDown], 'd')).toBe(
      '- **Status:** not live yet\n',
    );
    const live = readFileSync('ventures/read-focus/STORE.md', 'utf8');
    expect(flipStore(live, [chromeLive], 'd')).toBe(live);
  });
});

// Figma search API shape as the relay returned it on 2026-10-01 (`build-2026-10-01/5.json`,
// query "unused variables": 48 hits, ours first), trimmed to the fields the parser reads.
const search = (ids: string[], totalHits = ids.length): string =>
  JSON.stringify({
    error: false,
    status: 200,
    meta: {
      results: ids.map((id) => ({
        model: {
          id: `uuid-${id}`,
          content_id: id,
          rdp_url: `https://www.figma.com/community/plugin/${id}`,
          user_count: 1,
        },
        score: 0,
      })),
      total_hits: totalHits,
    },
  });

const OURS = '1682711656065145288';

describe('rankQueriesOf', () => {
  it('reads the four buyer queries from the real variables-toolkit STORE.md', () => {
    expect(rankQueriesOf(readFileSync('ventures/variables-toolkit/STORE.md', 'utf8'))).toEqual([
      'styles to variables',
      'link to variables',
      'unused variables',
      'variables toolkit',
    ]);
  });
  it('is empty for a STORE.md without the line', () => {
    expect(rankQueriesOf(readFileSync('ventures/read-focus/STORE.md', 'utf8'))).toEqual([]);
    expect(rankQueriesOf('- **Status:** live\n')).toEqual([]);
  });
});

describe('parseFigmaRank', () => {
  it('is the 1-based position on the first page, over total_hits', () => {
    expect(
      parseFigmaRank('unused variables', OURS, 200, search([OURS, '1499763131998478678'])),
    ).toEqual({
      query: 'unused variables',
      rank: 1,
      hits: 2,
      note: 'unused variables 1/2',
    });
    expect(parseFigmaRank('q', OURS, 200, search(['a', 'b', OURS], 1234)).note).toBe('q 3/1234');
  });
  it('matches on rdp_url when content_id is missing', () => {
    const body = search([OURS]).replace(`"content_id":"${OURS}",`, '');
    expect(parseFigmaRank('q', OURS, 200, body).rank).toBe(1);
  });
  it('says >N when the page of N does not hold the plugin but more hits exist, absent when it is the whole list', () => {
    const page = Array.from({ length: 100 }, (_, i) => `id${i}`);
    expect(parseFigmaRank('variables', OURS, 200, search(page, 2394))).toEqual({
      query: 'variables',
      hits: 2394,
      note: 'variables >100/2394',
    });
    expect(parseFigmaRank('q', OURS, 200, search(['a', 'b'])).note).toBe('q absent/2');
  });
  it('is unread, never a rank, on an error or a non-JSON body', () => {
    expect(parseFigmaRank('q', OURS, 403, '<html>Forbidden</html>')).toEqual({
      query: 'q',
      unread: true,
      note: 'q unread (403, not JSON)',
    });
    expect(parseFigmaRank('q', OURS, 500, '{"error":true}').note).toBe('q unread (500)');
  });
});

describe('rank: in the Daily check row', () => {
  const header = '| Date | Event | Users | Likes | Purchases | Notes |';
  const ranks = [
    parseFigmaRank('unused variables', OURS, 200, search([OURS], 48)),
    parseFigmaRank('variables', OURS, 200, search(['a'], 2394)),
  ];
  it('appends the clause after the channel notes', () => {
    expect(rankNote(ranks)).toBe('rank: unused variables 1/48, variables >1/2394');
    expect(renderRow('2026-10-02', header, [parseFigma(200, figma)], ranks)).toBe(
      '| 2026-10-02 | Daily check | 0 | 0 | 0 | via store-metrics CI: figma: install_count 0, like_count 0, view_count 2, unique_run_count 1, comment_count 0, purchase_count 0, version 281046 (2026-09-28); rank: unused variables 1/48, variables >1/2394 |',
    );
  });
  it('keeps the row readable with no queries and on an unread listing', () => {
    expect(rankNote([])).toBe('');
    expect(renderRow('2026-10-02', header, [parseFigma(200, figma)])).not.toContain('rank:');
    expect(renderRow('2026-10-02', header, [parseFigma(403, 'x')], ranks)).toBe(
      '| 2026-10-02 | Daily check | — | — | — | unread (store-metrics CI: figma: 403, not JSON; rank: unused variables 1/48, variables >1/2394) |',
    );
  });
});
