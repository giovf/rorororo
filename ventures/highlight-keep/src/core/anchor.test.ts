import { describe as suite, expect, it } from 'vitest';
import { describe, locate, normalise } from './anchor.js';

const page = 'Alpha beta gamma. The quick brown fox jumps over the lazy dog. Beta again here. The end.';

suite('anchors', () => {
  it('describes a selection with context and offset', () => {
    const start = page.indexOf('quick brown');
    const a = describe(page, start, start + 'quick brown'.length);
    expect(a).toEqual({ quote: 'quick brown', prefix: 'Alpha beta gamma. The ', suffix: ' fox jumps over the lazy dog. Be', start });
  });

  it('re-finds exactly when the page is unchanged or shifted', () => {
    const start = page.indexOf('quick brown');
    const a = describe(page, start, start + 11);
    expect(locate(page, a)).toEqual({ start, end: start + 11, how: 'exact' });
    const shifted = 'NEW BANNER TEXT. ' + page;
    expect(locate(shifted, a)).toMatchObject({ start: start + 17, how: 'exact' });
  });

  it('falls back to the quote when context changed, picking the nearest occurrence', () => {
    const start = page.indexOf('Beta again');
    const a = describe(page, start, start + 4); // "Beta"
    const changed = page.replace('Beta again here', 'Beta again there');
    // context differs after the quote → not exact; "Beta" occurs once with a capital B
    expect(locate(changed, a)).toMatchObject({ start, how: 'quote' });
    const twice = 'Beta first. ' + changed;
    const m = locate(twice, a);
    expect(m?.how).toBe('nearest');
    expect(m?.start).toBe(start + 'Beta first. '.length);
  });

  it('returns null when the text is gone and normalises whitespace', () => {
    const a = describe(page, 0, 5);
    expect(locate('completely different', a)).toBeNull();
    expect(normalise('a  b\n\tc')).toBe('a b c');
    expect(locate('Alpha\n   beta gamma', a)).toMatchObject({ start: 0, end: 5 });
  });
});
