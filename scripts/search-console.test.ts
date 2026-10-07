import { createVerify, generateKeyPairSync } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  hasSearchClause,
  INSPECT_CAP,
  inspectTargets,
  jwtAssertion,
  parseKey,
  propertyFor,
  SCOPE,
  searchNote,
  TOKEN_URL,
  upsertSearch,
  VENTURES,
  venturePages,
  type Inspection,
  type PageRow,
  type Venture,
} from './search-console.ts';

const venture = (slug: string): Venture => {
  const v = VENTURES.find((x) => x.slug === slug);
  if (!v) throw new Error(slug);
  return v;
};

const fromB64url = (s: string): string =>
  Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');

describe('parseKey', () => {
  it('names the missing secret and the owner action', () => {
    expect(parseKey(undefined)).toEqual({
      error: 'no SEARCH_CONSOLE_KEY secret; owner action 020',
    });
    expect(parseKey('')).toEqual({ error: 'no SEARCH_CONSOLE_KEY secret; owner action 020' });
  });
  it('rejects non-JSON and non-key JSON without echoing it', () => {
    expect(parseKey('{not json')).toEqual({ error: 'SEARCH_CONSOLE_KEY is not JSON' });
    expect(parseKey('{"type":"authorized_user"}')).toEqual({
      error: 'SEARCH_CONSOLE_KEY is not a service-account JSON key',
    });
  });
  it('keeps only the fields the flow needs', () => {
    expect(
      parseKey(JSON.stringify({ client_email: 'a@b', private_key: 'k', project_id: 'p' })),
    ).toEqual({ client_email: 'a@b', private_key: 'k' });
  });
});

describe('jwtAssertion', () => {
  it('signs RS256 claims for the read-only scope that the key verifies', () => {
    const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
    const key = {
      client_email: 'reader@project.iam.gserviceaccount.com',
      private_key: privateKey.export({ type: 'pkcs8', format: 'pem' }).toString(),
    };
    const jwt = jwtAssertion(key, 1_800_000_000);
    const [header, claims, signature] = jwt.split('.') as [string, string, string];
    expect(JSON.parse(fromB64url(header))).toEqual({ alg: 'RS256', typ: 'JWT' });
    expect(JSON.parse(fromB64url(claims))).toEqual({
      iss: key.client_email,
      scope: SCOPE,
      aud: TOKEN_URL,
      iat: 1_800_000_000,
      exp: 1_800_003_600,
    });
    const verifier = createVerify('RSA-SHA256');
    verifier.update(`${header}.${claims}`);
    expect(
      verifier.verify(
        publicKey,
        Buffer.from(signature.replace(/-/g, '+').replace(/_/g, '/'), 'base64'),
      ),
    ).toBe(true);
    expect(jwt).not.toMatch(/[+/=]/);
  });
});

describe('propertyFor', () => {
  it('prefers the host’s own URL-prefix property', () => {
    expect(propertyFor('gankdat.com', ['sc-domain:gankdat.com', 'https://gankdat.com/'])).toBe(
      'https://gankdat.com/',
    );
  });
  it('falls back to the domain property that covers a subdomain', () => {
    expect(propertyFor('apps.gankdat.com', ['sc-domain:gankdat.com'])).toBe(
      'sc-domain:gankdat.com',
    );
    expect(
      propertyFor('apps.gankdat.com', ['sc-domain:apps.gankdat.com', 'sc-domain:gankdat.com']),
    ).toBe('sc-domain:apps.gankdat.com');
  });
  it('never matches a look-alike domain', () => {
    expect(
      propertyFor('gankdat.com', ['sc-domain:notgankdat.com', 'https://gankdat.co/']),
    ).toBeUndefined();
  });
});

describe('venturePages / inspectTargets', () => {
  const rows: PageRow[] = [
    { page: 'https://apps.gankdat.com/readfocus.html', clicks: 1, impressions: 20, position: 8 },
    {
      page: 'https://apps.gankdat.com/reading-ruler.html',
      clicks: 0,
      impressions: 5,
      position: 30,
    },
    {
      page: 'https://apps.gankdat.com/highlightkeep.html',
      clicks: 0,
      impressions: 3,
      position: 12,
    },
    { page: 'https://gankdat.com/stats/uk-schools', clicks: 2, impressions: 40, position: 4 },
    { page: 'not a url', clicks: 9, impressions: 9, position: 1 },
  ];
  it('keeps each venture to its own pages on its host', () => {
    expect(venturePages(rows, venture('read-focus')).map((r) => r.page)).toEqual([
      'https://apps.gankdat.com/readfocus.html',
      'https://apps.gankdat.com/reading-ruler.html',
    ]);
    expect(venturePages(rows, venture('highlight-keep'))).toHaveLength(1);
    expect(venturePages(rows, venture('gankdat')).map((r) => r.page)).toEqual([
      'https://gankdat.com/stats/uk-schools',
    ]);
  });
  it('inspects gankdat’s /stats index and dataset pages, not facets or legal pages', () => {
    const xml = `<urlset>
      <url><loc>https://gankdat.com/</loc></url>
      <url><loc>https://gankdat.com/docs</loc></url>
      <url><loc>https://gankdat.com/stats</loc></url>
      <url><loc>https://gankdat.com/stats/uk-schools</loc></url>
      <url><loc>https://gankdat.com/stats/uk-schools/phase/primary</loc></url>
      <url><loc>https://gankdat.com/terms</loc></url>
    </urlset>`;
    expect(inspectTargets(xml, venture('gankdat'))).toEqual([
      'https://gankdat.com/',
      'https://gankdat.com/stats',
      'https://gankdat.com/stats/uk-schools',
    ]);
  });
  it('inspects the landing product and comparison pages of the venture only', () => {
    const xml = [
      '/',
      '/highlightkeep.html',
      '/weava-alternative.html',
      '/readfocus.html',
      '/privacy.html',
    ]
      .map((p) => `<url><loc>https://apps.gankdat.com${p}</loc></url>`)
      .join('');
    expect(inspectTargets(xml, venture('highlight-keep'))).toEqual([
      'https://apps.gankdat.com/highlightkeep.html',
      'https://apps.gankdat.com/weava-alternative.html',
    ]);
  });
  it('caps the inspections per venture', () => {
    const xml = Array.from(
      { length: INSPECT_CAP + 5 },
      (_, i) => `<url><loc>https://gankdat.com/stats/ds-${i}</loc></url>`,
    ).join('');
    expect(inspectTargets(xml, venture('gankdat'))).toHaveLength(INSPECT_CAP);
  });
});

describe('searchNote', () => {
  const pages: PageRow[] = [
    { page: 'https://gankdat.com/stats/uk-schools', clicks: 2, impressions: 40, position: 4 },
    { page: 'https://gankdat.com/stats', clicks: 0, impressions: 10, position: 24 },
  ];
  const inspections: Inspection[] = [
    { url: 'https://gankdat.com/', verdict: 'PASS', coverage: 'Submitted and indexed' },
    {
      url: 'https://gankdat.com/stats',
      verdict: 'NEUTRAL',
      coverage: 'Crawled - currently not indexed',
    },
    {
      url: 'https://gankdat.com/stats/a',
      verdict: 'NEUTRAL',
      coverage: 'Crawled - currently not indexed',
    },
    {
      url: 'https://gankdat.com/stats/b',
      verdict: 'NEUTRAL',
      coverage: 'URL is unknown to Google',
    },
    {
      url: 'https://gankdat.com/stats/c',
      verdict: 'VERDICT_UNSPECIFIED',
      coverage: 'unread',
      error: '429',
    },
  ];
  it('sums the week, weights the position, names the top page and the indexing picture', () => {
    expect(searchNote('2026-10-06', pages, inspections)).toBe(
      'search 7d to 10-06: 50 impressions, 2 clicks, avg pos 8.0, top /stats/uk-schools 40, ' +
        'indexed 1/4, not: Crawled - currently not indexed ×2, URL is unknown to Google ×1, 1 inspection failed',
    );
  });
  it('names the reason once when every inspection failed', () => {
    const failed: Inspection[] = [
      {
        url: 'https://gankdat.com/',
        verdict: 'VERDICT_UNSPECIFIED',
        coverage: 'unread',
        error: '403: forbidden',
      },
      {
        url: 'https://gankdat.com/stats',
        verdict: 'VERDICT_UNSPECIFIED',
        coverage: 'unread',
        error: '403: forbidden',
      },
    ];
    expect(searchNote('2026-10-06', [], failed)).toBe(
      'search 7d to 10-06: 0 impressions, 0 clicks, indexed 0/0, inspection n/a (403: forbidden)',
    );
  });
  it('reads zero as zero, with no position or top page', () => {
    expect(searchNote('2026-10-06', [], [])).toBe('search 7d to 10-06: 0 impressions, 0 clicks');
  });
});

describe('upsertSearch', () => {
  const md = [
    '## Metrics',
    '',
    '| Date | Event | Users | Rating | Sales | Notes |',
    '|---|---|---|---|---|---|',
    '| 2026-10-06 | Daily check | 0 | — | — | via store-metrics CI: chrome: 0 users; search: n/a (old) |',
    '| 2026-10-07 | Daily check | 0 | — | — | via store-metrics CI: chrome: 0 users, no ratings; firefox: 0 adu |',
    '',
  ].join('\n');
  it('appends the clause to today’s Notes cell and leaves other rows alone', () => {
    const out = upsertSearch(
      md,
      '2026-10-07',
      'Daily check',
      'search 7d to 10-06: 3 impressions, 0 clicks',
    );
    expect(out).toContain(
      '| 2026-10-07 | Daily check | 0 | — | — | via store-metrics CI: chrome: 0 users, no ratings; firefox: 0 adu; search 7d to 10-06: 3 impressions, 0 clicks |',
    );
    expect(out).toContain('search: n/a (old) |');
    expect(hasSearchClause(out, '2026-10-07', 'Daily check')).toBe(true);
    expect(hasSearchClause(md, '2026-10-07', 'Daily check')).toBe(false);
  });
  it('replaces an existing clause in place instead of stacking a second one', () => {
    const once = upsertSearch(
      md,
      '2026-10-06',
      'Daily check',
      'search 7d to 10-05: 1 impressions, 0 clicks',
    );
    expect(once).toContain('chrome: 0 users; search 7d to 10-05: 1 impressions, 0 clicks |');
    expect(once).not.toContain('n/a (old)');
    expect(upsertSearch(once, '2026-10-06', 'Daily check', 'search: n/a (token 401)', true)).toBe(
      once,
    );
  });
  it('writes nothing when the day has no row of that kind', () => {
    expect(upsertSearch(md, '2026-10-08', 'Daily check', 'search: n/a (x)')).toBe(md);
    expect(upsertSearch(md, '2026-10-07', 'Daily numbers', 'search: n/a (x)')).toBe(md);
  });
  it('works on a gankdat Daily numbers row with an empty-looking Notes cell', () => {
    const row = '| 2026-10-07 | Daily numbers | 1 accts | — | 0 x402 paid | |\n';
    expect(upsertSearch(row, '2026-10-07', 'Daily numbers', 'search: n/a (x)')).toBe(
      '| 2026-10-07 | Daily numbers | 1 accts | — | 0 x402 paid | search: n/a (x) |\n',
    );
  });
});
