import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const page = (name: string): string => readFileSync(`packages/landing/site/${name}`, 'utf8');

/**
 * tax-workbook `own-checkout-listing` (2026-10-29): the product page carries the own-checkout block, and
 * the block is hidden until a real Stripe Payment Link replaces the placeholder (action 034) — never a
 * visible button that leads nowhere, never a live link kept hidden. Lives under scripts/ (node types) like
 * the other repo-file tests; the landing package's own tsconfig is Workers-only.
 */
describe('tax-workbook product page', () => {
  const html = page('tax-workbook.html');
  const buy = /<p id="buy"([^>]*)>([\s\S]*?)<\/p>/.exec(html);
  const attrs = buy?.[1] ?? '';
  const block = buy?.[2] ?? '';
  const href = /href="([^"]+)"/.exec(block)?.[1] ?? '';

  it('has the own-checkout block with a Stripe link or the placeholder', () => {
    expect(buy).not.toBeNull();
    expect(
      href === 'STRIPE_PAYMENT_LINK_PLACEHOLDER' || href.startsWith('https://buy.stripe.com/'),
    ).toBe(true);
  });

  it('is hidden exactly while the link is the placeholder', () => {
    expect(/\bhidden\b/.test(attrs)).toBe(href === 'STRIPE_PAYMENT_LINK_PLACEHOLDER');
  });

  it('says what the buyer gains: the price, the mail delivery, the 30-day link, the refund route', () => {
    expect(block).toContain('£6.99');
    expect(block).toContain('download link');
    expect(block).toContain('30 days');
    expect(html).toContain('refunded');
    expect(html).toContain('replying to the download email');
    expect(html).not.toMatch(/only \d+ left|hurry|selling fast/i);
  });

  it('has a thanks page for the Payment Link redirect', () => {
    const thanks = page('thanks-tax-workbook.html');
    expect(thanks).toContain('download link');
    expect(thanks).toContain('noindex');
  });
});
