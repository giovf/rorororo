import { existsSync, readFileSync } from 'node:fs';
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

  it('names the Kindle guide and passes a ?from= referrer to the Stripe link as client_reference_id (cross-sell-links-guide-and-workbook)', () => {
    expect(html).toContain('UK Sole Trader Tax 2026/27');
    expect(html).toContain('Kindle Store');
    expect(html).not.toMatch(/amazon\./i);
    expect(html).toContain("client_reference_id=' + from");
    expect(html).toContain('/^[a-z0-9-]{1,32}$/');
  });

  it('has a thanks page for the Payment Link redirect', () => {
    const thanks = page('thanks-tax-workbook.html');
    expect(thanks).toContain('download link');
    expect(thanks).toContain('noindex');
  });
});

/**
 * tax-workbook `product-page-structured-data-faq` (2026-11-03): Product + Offer and FAQPage JSON-LD on
 * the product page, each Offer's price the page's own price, the FAQ markup mirroring the visible
 * questions word for word (Google's rule for FAQ markup), the product image a file the site serves.
 */
describe('tax-workbook product page structured data', () => {
  const html = page('tax-workbook.html');
  const blocks = [
    ...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g),
  ].map((m) => JSON.parse(m[1] ?? '') as Record<string, unknown>);
  const product = blocks.find((b) => b['@type'] === 'Product') as
    | {
        offers: { price: string; priceCurrency: string; priceValidUntil: string; url: string }[];
        image: string;
      }
    | undefined;
  const faq = blocks.find((b) => b['@type'] === 'FAQPage') as
    { mainEntity: { name: string; acceptedAnswer: { text: string } }[] } | undefined;

  it('carries a Product with one Offer per seller at the page price', () => {
    expect(product).toBeDefined();
    expect(product?.offers).toHaveLength(3);
    const price = /£(\d+\.\d\d)/.exec(html)?.[1];
    for (const o of product?.offers ?? []) {
      expect(o.price).toBe(price);
      expect(o.priceCurrency).toBe('GBP');
      expect(o.priceValidUntil).toBe('2026-11-30');
      expect(html).toContain(o.url.replace(/#buy$/, ''));
    }
    expect(html).toContain('30 November 2026');
  });

  it('serves the product image it names', () => {
    const file = product?.image.replace('https://apps.gankdat.com/', '') ?? '';
    expect(file).not.toBe('');
    expect(existsSync(`packages/landing/site/${file}`), file).toBe(true);
  });

  it('mirrors every FAQ question and answer on the page', () => {
    const h3s = [...html.matchAll(/<h3>([^<]+)<\/h3>/g)].map((m) => m[1]);
    expect(faq?.mainEntity.map((q) => q.name)).toEqual(h3s);
    const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    for (const q of faq?.mainEntity ?? []) {
      expect(text).toContain(q.acceptedAnswer.text.slice(0, 40));
    }
    expect(faq?.mainEntity.length).toBeGreaterThanOrEqual(4);
  });
});
