import { describe, expect, it } from 'vitest';
import { SHOTS, dryProduct, toolsForShot, usageLine } from './demo-paypal-ai-hackathon.ts';
import {
  MAX_SECONDS,
  appendJs,
  captionHtml,
  captionJs,
  parseFfprobeDuration,
  placeholderHtml,
  plannedSeconds,
  terminalHtml,
  terminalLineHtml,
} from './demo-video.ts';

describe('caption and terminal markup', () => {
  it('escapes the caption text and marks a dry run', () => {
    const html = captionHtml('<b>"agents" & humans</b>', true);
    expect(html).toContain('&lt;b&gt;&quot;agents&quot; &amp; humans&lt;/b&gt;');
    expect(html).toContain('DRY RUN');
    expect(captionHtml('plain')).not.toContain('DRY RUN');
    expect(html).toMatch(/id="demo-caption"/);
  });

  it('classes terminal lines as command, step or output', () => {
    expect(terminalLineHtml('$ node x.mjs')).toContain('class="cmd"');
    expect(terminalLineHtml('[2] create an order')).toContain('class="step"');
    expect(terminalLineHtml('    order 1: 1000 credits')).toContain('class="out"');
    expect(terminalLineHtml('')).toContain('&nbsp;');
    const page = terminalHtml('title <x>', ['$ a', 'b']);
    expect(page).toContain('title &lt;x&gt;');
    expect(page).toContain(
      '<div id="term"><div class="cmd">$ a</div><div class="out">b</div></div>',
    );
  });

  it('labels a placeholder as not fetched', () => {
    const html = placeholderHtml('https://gankdat.com/account', 'account page');
    expect(html).toContain('dry run — not fetched');
    expect(html).toContain('https://gankdat.com/account');
  });

  it('builds page-side snippets that carry the html as a JSON string', () => {
    expect(appendJs('term', '<div>"x"</div>')).toContain('getElementById("term")');
    expect(appendJs('term', '<div>"x"</div>')).toContain('"<div>\\"x\\"</div>"');
    expect(captionJs('<div id="demo-caption">c</div>')).toContain(
      "getElementById('demo-caption')?.remove()",
    );
  });
});

describe('durations', () => {
  it('reads ffprobe output and ignores noise before it', () => {
    expect(parseFfprobeDuration('178.240000\n')).toBeCloseTo(178.24);
    expect(parseFfprobeDuration('warning\n12.5')).toBe(12.5);
    expect(parseFfprobeDuration('')).toBeNull();
    expect(parseFfprobeDuration('N/A')).toBeNull();
  });

  it('plans the PayPal shot list under the cap with per-shot overhead', () => {
    expect(SHOTS.map((s) => s.n)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(plannedSeconds(SHOTS)).toBeLessThan(MAX_SECONDS);
    expect(plannedSeconds([{ seconds: 10 }, { seconds: 5 }], 1)).toBe(17);
  });
});

describe('PayPal entry helpers', () => {
  it('prints the usage line as the walkthrough does', () => {
    expect(usageLine({ plan: 'free', used: 250, granted: 250, topup: 999, remaining: 999 })).toBe(
      '    plan free: 250/250 used, top-up 999, remaining 999',
    );
  });

  it('lists the two purchase tools first and caps the list', () => {
    const tools = [
      { name: 'query_a' },
      { name: 'confirm_credit_purchase' },
      { name: 'query_b' },
      { name: 'buy_credits' },
    ];
    expect(toolsForShot(tools)).toEqual([
      'confirm_credit_purchase',
      'buy_credits',
      'query_a',
      'query_b',
    ]);
    expect(toolsForShot(tools, 3)).toHaveLength(3);
  });

  it('answers every step of the story in the dry run without network', async () => {
    const product = dryProduct();
    const order = await product.createOrder('pack_1k');
    expect(order.approve_url).toContain('sandbox.paypal.com');
    expect((await product.capture(order.order_id)).credits_added).toBe(1000);
    expect((await product.dataCall()).source).toBe('topup');
    expect((await product.mcpTools()).map((t) => t.name)).toContain('buy_credits');
    expect(await product.mcpBuyCredits('pack_1k')).toContain('Approve US$8');
  });
});
