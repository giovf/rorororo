import { describe, expect, it } from 'vitest';
import {
  COLOR_TOKENS,
  COVER,
  NO_TOKEN_HEX,
  NUMBER_TOKENS,
  PAGES,
  PAINT_STYLES,
  PLUGIN_URL,
  SAMPLE_CARD,
  expectedDuplicates,
  expectedModes,
  expectedUnused,
  linkableSummary,
} from './playground.js';

describe('playground spec — exercise 1 (link)', () => {
  const summary = linkableSummary(SAMPLE_CARD, COLOR_TOKENS, NUMBER_TOKENS);

  it('every raw colour on the card matches a token except the deliberate magenta', () => {
    expect(summary.unmatchedColors).toEqual([NO_TOKEN_HEX]);
    expect(Object.keys(summary.colorMatches).sort()).toEqual(
      ['color/border/subtle', 'color/brand/danger', 'color/brand/primary', 'color/surface/card', 'color/text/body'].sort(),
    );
  });

  it('matches the counts the page-1 copy promises (5 colour sites + 1 hidden, 9 number sites)', () => {
    const colorSites = Object.values(summary.colorMatches).reduce((a, b) => a + b, 0);
    const numberSites = Object.values(summary.numberMatches).reduce((a, b) => a + b, 0);
    expect(colorSites).toBe(6); // five visible plus the hidden rectangle
    expect(numberSites).toBe(9);
    expect(summary.unmatchedNumbers).toEqual([]);
    // The page copy quotes these numbers; keep them in step.
    const page1 = PAGES[1];
    expect(page1?.steps.join(' ')).toContain('5 colour sites and 9 number sites');
    expect(page1?.steps.join(' ')).toContain('listed as unmatched');
    expect(colorSites + numberSites).toBeLessThanOrEqual(25); // fits the free tier's daily links
  });

  it('only matches bound tokens by value, never the hygiene bait', () => {
    const matched = new Set(Object.keys(summary.colorMatches));
    for (const t of COLOR_TOKENS.filter((t) => t.role === 'unused')) expect(matched.has(t.name)).toBe(false);
  });
});

describe('playground spec — exercise 2 (styles to variables)', () => {
  it('pairs the Light/Dark twins and leaves Brand/Accent single-mode, as the page-2 copy says', () => {
    const { modes, pairedRemainders, single } = expectedModes(PAINT_STYLES);
    expect(modes).toEqual(['Light', 'Dark']);
    expect(pairedRemainders.sort()).toEqual(['Brand/Primary', 'Surface/Page']);
    expect(single).toEqual(['Brand/Accent']);
  });
});

describe('playground spec — exercise 3 (clean up)', () => {
  it('lists exactly the three unused tokens the page-3 copy names', () => {
    const unused = expectedUnused(COLOR_TOKENS, NUMBER_TOKENS).filter((n) => n.startsWith('unused/'));
    expect(unused.sort()).toEqual(['unused/legacy-grey', 'unused/old-teal', 'unused/space-7']);
    for (const name of unused) expect(PAGES[3]?.steps.join(' ')).toContain(name);
  });

  it('has one duplicate pair: primary and primary-copy', () => {
    expect(expectedDuplicates(COLOR_TOKENS, NUMBER_TOKENS)).toEqual([['color/brand/primary', 'color/brand/primary-copy']]);
  });

  it('the duplicate is unbound so it is also reported unused (a real duplicate to delete)', () => {
    expect(COLOR_TOKENS.find((t) => t.role === 'duplicate')?.bound).toBe(false);
  });
});

describe('playground spec — copy and cover', () => {
  it('names the plugin on every page and keeps each page name short enough for the pages panel', () => {
    for (const p of PAGES) {
      expect(p.name.length).toBeLessThanOrEqual(32);
      expect([p.intro, ...p.steps, p.footer].join(' ')).toContain('Variables Toolkit');
    }
  });

  it('states the free tier and the price honestly on the start page', () => {
    const start = PAGES[0]?.footer ?? '';
    expect(start).toContain('25 links a day');
    expect(start).toContain('$12 one-time');
    expect(start).toContain('14-day refund');
  });

  it('cover is the Community thumbnail size and points at the listing', () => {
    expect([COVER.width, COVER.height]).toEqual([1920, 960]);
    expect(COVER.footnote).toContain(PLUGIN_URL.replace('https://www.', ''));
    expect(COVER.chips.map((c) => c.label)).toEqual(['Link', 'Styles to Variables', 'Clean up']);
  });
});
