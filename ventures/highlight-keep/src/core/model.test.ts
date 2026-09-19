import { describe, expect, it } from 'vitest';
import { canAddOnSite, pageKey, siteOf, toMarkdown } from './model.js';

describe('model', () => {
  it('keys pages without hash or trailing slash', () => {
    expect(pageKey('https://www.example.com/a/b/#top')).toBe('https://www.example.com/a/b');
    expect(pageKey('https://example.com/?q=1#x')).toBe('https://example.com/?q=1');
    expect(siteOf('https://www.example.com/a')).toBe('example.com');
  });

  it('caps free users at three sites but never blocks a site they already use', () => {
    const sites = new Set(['a.com', 'b.com', 'c.com']);
    expect(canAddOnSite(sites, 'a.com', false)).toBe(true);
    expect(canAddOnSite(sites, 'd.com', false)).toBe(false);
    expect(canAddOnSite(sites, 'd.com', true)).toBe(true);
    expect(canAddOnSite(new Set(['a.com']), 'd.com', false)).toBe(true);
  });

  it('exports a page to Markdown', () => {
    const md = toMarkdown({
      url: 'https://e.com/p',
      title: 'Page',
      updatedAt: '',
      highlights: [
        { id: '1', anchor: { quote: 'first quote', prefix: '', suffix: '', start: 0 }, colour: 'yellow', createdAt: '' },
        { id: '2', anchor: { quote: 'second', prefix: '', suffix: '', start: 9 }, colour: 'green', note: 'my note', tags: ['read'], createdAt: '' },
      ],
    });
    expect(md).toBe('# Page\n\nSource: https://e.com/p\n\n> first quote\n\n> second\n\nmy note\n\n#read\n');
  });
});
