import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  amoJwt,
  listingPatch,
  previewsToUpload,
  validateConfig,
  type ListingConfig,
} from './amo-listing.ts';

const cfg: ListingConfig = {
  slug: 'highlight-keep-web-highlighter',
  categories: ['productivity'],
  tags: ['productivity', 'privacy'],
  previews: [
    { file: 'assets/screenshots/highlightkeep-01.png', caption: 'Highlight' },
    { file: 'assets/screenshots/highlightkeep-02.png' },
  ],
};

const decode = (part: string): Record<string, unknown> =>
  JSON.parse(
    Buffer.from(part.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString(),
  ) as Record<string, unknown>;

describe('amoJwt', () => {
  it('is an HS256 token with issuer, a fresh jti and a ≤ 5 min expiry', () => {
    const now = new Date('2026-09-30T22:50:00Z');
    const token = amoJwt('user:1:2', 'secret', now);
    const [h = '', p = '', s = ''] = token.split('.');
    expect(decode(h)).toEqual({ alg: 'HS256', typ: 'JWT' });
    const payload = decode(p);
    expect(payload.iss).toBe('user:1:2');
    expect(payload.iat).toBe(Math.floor(now.getTime() / 1000));
    expect((payload.exp as number) - (payload.iat as number)).toBeLessThanOrEqual(300);
    expect(typeof payload.jti).toBe('string');
    const expected = createHmac('sha256', 'secret').update(`${h}.${p}`).digest('base64url');
    expect(s).toBe(expected);
    expect(amoJwt('user:1:2', 'secret', now)).not.toBe(token); // jti differs
  });
});

describe('listingPatch', () => {
  it('sends category, tags and the metadata homepage/support', () => {
    expect(
      listingPatch(
        {
          homepage: { 'en-US': 'https://apps.gankdat.com/highlightkeep.html' },
          support_email: { 'en-US': 'info@gankdat.com' },
        },
        cfg,
      ),
    ).toEqual({
      categories: ['productivity'],
      tags: ['productivity', 'privacy'],
      homepage: { 'en-US': 'https://apps.gankdat.com/highlightkeep.html' },
      support_email: { 'en-US': 'info@gankdat.com' },
    });
  });
  it('omits fields the metadata does not carry', () => {
    expect(Object.keys(listingPatch({}, cfg))).toEqual(['categories', 'tags']);
  });
});

describe('previewsToUpload', () => {
  it('uploads only what AMO lacks, positioned after the existing ones', () => {
    expect(previewsToUpload(cfg, 0).map((p) => p.position)).toEqual([0, 1]);
    expect(previewsToUpload(cfg, 1)).toEqual([
      { file: 'assets/screenshots/highlightkeep-02.png', position: 1 },
    ]);
    expect(previewsToUpload(cfg, 2)).toEqual([]);
    expect(previewsToUpload(cfg, 5)).toEqual([]);
  });
});

describe('validateConfig', () => {
  it('accepts the shipped shape', () => {
    expect(validateConfig(cfg)).toBe(cfg);
  });
  it('rejects a bad slug, non-string tags, malformed previews and more than ten previews', () => {
    expect(() => validateConfig({ ...cfg, slug: 'Bad Slug' })).toThrow(/slug/);
    expect(() => validateConfig({ ...cfg, tags: [1] })).toThrow(/tags/);
    expect(() => validateConfig({ ...cfg, previews: [{}] })).toThrow(/previews/);
    expect(() => validateConfig({ ...cfg, previews: Array(11).fill({ file: 'x.png' }) })).toThrow(
      /10/,
    );
    expect(() => validateConfig(null)).toThrow(/object/);
  });
});
