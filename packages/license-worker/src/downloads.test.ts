import { describe, expect, it } from 'vitest';
import { DOWNLOADS, downloadEmail, mintDownloadToken, verifyDownloadToken } from './downloads.js';

const secret = 'test-signing-secret';
const now = new Date('2026-10-29T18:00:00Z');
const claim = { v: 'tax-workbook', id: 'cs_1', exp: Math.floor(now.getTime() / 1000) + 3600 };

describe('download tokens', () => {
  it('round-trips a claim and rejects the wrong secret', async () => {
    const token = await mintDownloadToken(secret, claim);
    expect(token).toMatch(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
    expect(await verifyDownloadToken(secret, token, now)).toEqual(claim);
    expect(await verifyDownloadToken('other', token, now)).toBeNull();
  });

  it('rejects expiry, tampering and malformed tokens', async () => {
    const token = await mintDownloadToken(secret, claim);
    expect(await verifyDownloadToken(secret, token, new Date((claim.exp + 1) * 1000))).toBeNull();
    const [body, sig] = token.split('.') as [string, string];
    const other = await mintDownloadToken(secret, { ...claim, id: 'cs_2' });
    expect(await verifyDownloadToken(secret, `${other.split('.')[0]}.${sig}`, now)).toBeNull();
    expect(await verifyDownloadToken(secret, body, now)).toBeNull();
    expect(await verifyDownloadToken(secret, `${body}.`, now)).toBeNull();
    expect(await verifyDownloadToken(secret, `${body}.!!!`, now)).toBeNull();
  });

  it('the mail names the product, the link and the date, never a key', () => {
    const product = DOWNLOADS['tax-workbook'];
    if (!product) throw new Error('catalogue entry missing');
    const { subject, text } = downloadEmail(product, 'https://x.test/v1/downloads/t', new Date('2026-11-28T18:00:00Z'));
    expect(subject).toBe('Your UK Sole Trader Tax Workbook 2026/27 download');
    expect(text).toContain('https://x.test/v1/downloads/t');
    expect(text).toContain('until 2026-11-28');
    expect(text).toContain('14 days');
    expect(text).not.toContain('FNDRY1');
  });
});
