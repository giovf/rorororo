import { describe, expect, it } from 'vitest';
import {
  metricsHeader,
  namespaceId,
  salesClause,
  salesColumn,
  summarise,
  upsertSales,
  type LicenseRecord,
} from './license-sales.ts';

// Record shape is packages/license-worker's StoredLicense (key, email, payload, revoked, activations).
const rec = (
  venture: string,
  email: string | null,
  extra: Partial<LicenseRecord> = {},
): LicenseRecord => ({
  key: 'k',
  email,
  payload: { venture, tier: 'pro', id: `cs_${venture}_${email ?? 'none'}`, issued: '2026-10-11' },
  ...extra,
});

const md = `# ReadFocus — research

## Metrics

| Date | Event | Users | Rating | Sales | Notes |
| --- | --- | --- | --- | --- | --- |
| 2026-10-10 | Daily check | 2 | — | — | via store-metrics CI: chrome: 2 users; search: n/a (no key) |
| 2026-10-11 | Daily check | 3 | — | — | via store-metrics CI: chrome: 3 users, no ratings; search 7d to 10-10: 0 impressions |
`;

describe('namespaceId', () => {
  it('reads the LICENSES namespace id from wrangler.toml', () => {
    const toml = `name = "foundry-licenses"\n[[kv_namespaces]]\nbinding = "LICENSES"\nid = "7316344bc3a245498bec8e0a1baf3316"\n\n[vars]\nX = "y"\n`;
    expect(namespaceId(toml)).toBe('7316344bc3a245498bec8e0a1baf3316');
    expect(namespaceId('name = "x"\n')).toBeUndefined();
  });
});

describe('summarise', () => {
  it('counts live keys and activations per venture, test and revoked keys apart', () => {
    const by = summarise([
      rec('read-focus', 'buyer@example.org', { activations: [1, 2] }),
      rec('read-focus', 'other@mail.com', { activations: [3] }),
      rec('read-focus', 'gone@mail.com', { revoked: true, activations: [4] }),
      rec('read-focus', 'info@gankdat.com', { activations: [5, 6, 7] }),
      rec('read-focus', 'giova1506@hotmail.com'),
      rec('highlight-keep', null),
      { email: null, payload: { venture: '', id: 'x', issued: '2026-10-11' } },
    ]);
    expect(by.get('read-focus')).toEqual({ keys: 2, activations: 3, revoked: 1, test: 2 });
    expect(by.get('highlight-keep')).toEqual({ keys: 1, activations: 0, revoked: 0, test: 0 });
    expect(by.size).toBe(2);
  });
});

describe('salesClause', () => {
  it('leaves the zero parts out', () => {
    expect(salesClause({ keys: 2, activations: 3, revoked: 1, test: 2 })).toBe(
      'sales: 2 keys (3 activations, 1 revoked, 2 test)',
    );
    expect(salesClause({ keys: 1, activations: 0, revoked: 0, test: 0 })).toBe(
      'sales: 1 keys (0 activations)',
    );
    expect(salesClause(undefined)).toBe('sales: 0 keys');
    expect(salesClause({ keys: 0, activations: 0, revoked: 0, test: 1 })).toBe(
      'sales: 0 keys (1 test)',
    );
  });
});

describe('salesColumn', () => {
  it('finds Sales in the extensions header and not in the Figma one', () => {
    expect(salesColumn(metricsHeader(md))).toBe(4);
    expect(salesColumn('| Date | Event | Users | Likes | Purchases | Notes |')).toBe(-1);
    expect(salesColumn(undefined)).toBe(-1);
  });
});

describe('upsertSales', () => {
  it('fills the Sales cell and appends the clause on the day’s row only', () => {
    const out = upsertSales(md, '2026-10-11', 2, 'sales: 2 keys (3 activations)');
    expect(out).toContain(
      '| 2026-10-11 | Daily check | 3 | — | 2 | via store-metrics CI: chrome: 3 users, no ratings; search 7d to 10-10: 0 impressions; sales: 2 keys (3 activations) |',
    );
    expect(out).toContain(
      '| 2026-10-10 | Daily check | 2 | — | — | via store-metrics CI: chrome: 2 users; search: n/a (no key) |',
    );
  });

  it('replaces an existing clause unless ifMissing, and keeps the cell on an n/a reading', () => {
    const once = upsertSales(md, '2026-10-11', 2, 'sales: 2 keys (3 activations)');
    const again = upsertSales(once, '2026-10-11', 3, 'sales: 3 keys (4 activations)');
    expect(again).toContain('| 3 | — | 3 | ');
    expect(again).toContain('sales: 3 keys (4 activations) |');
    expect(again).not.toContain('sales: 2 keys');
    expect(upsertSales(once, '2026-10-11', 3, 'sales: 3 keys', true)).toBe(once);
    const na = upsertSales(md, '2026-10-11', undefined, 'sales: n/a (no CLOUDFLARE_API_TOKEN)');
    expect(na).toContain(
      '| 3 | — | — | via store-metrics CI: chrome: 3 users, no ratings; search 7d to 10-10: 0 impressions; sales: n/a (no CLOUDFLARE_API_TOKEN) |',
    );
  });

  it('leaves a file alone without a row for the day or without a Sales column', () => {
    expect(upsertSales(md, '2026-10-12', 1, 'sales: 1 keys')).toBe(md);
    const figma = md.replace('| Users | Rating | Sales |', '| Users | Likes | Purchases |');
    expect(upsertSales(figma, '2026-10-11', 1, 'sales: 1 keys')).toBe(figma);
  });
});
