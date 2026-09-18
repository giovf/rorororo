import { describe, expect, it } from 'vitest';
import { FREE_LINKS_PER_DAY, allowedLinks, rollover } from './tier.js';

describe('free tier', () => {
  it('is unlimited when paid', () => {
    expect(allowedLinks({ paid: true, day: '2026-09-18', used: 999 }, 500)).toBe(500);
  });
  it('caps unpaid use per day and never goes negative', () => {
    expect(allowedLinks({ paid: false, day: '2026-09-18', used: 0 }, 500)).toBe(FREE_LINKS_PER_DAY);
    expect(allowedLinks({ paid: false, day: '2026-09-18', used: 20 }, 10)).toBe(5);
    expect(allowedLinks({ paid: false, day: '2026-09-18', used: 30 }, 10)).toBe(0);
  });
  it('resets the counter on a new day', () => {
    const state = { paid: false, day: '2026-09-18', used: 25 };
    expect(rollover(state, new Date('2026-09-18T23:00:00Z'))).toBe(state);
    expect(rollover(state, new Date('2026-09-19T00:01:00Z'))).toEqual({ paid: false, day: '2026-09-19', used: 0 });
  });
});
