import { describe, expect, it } from 'vitest';
import { FREE_LINKS_PER_RUN, allowedLinks } from './tier.js';

describe('free tier', () => {
  it('is unlimited when paid', () => {
    expect(allowedLinks({ paid: true, usedThisRun: 999 }, 500)).toBe(500);
  });
  it('caps unpaid runs and never goes negative', () => {
    expect(allowedLinks({ paid: false, usedThisRun: 0 }, 500)).toBe(FREE_LINKS_PER_RUN);
    expect(allowedLinks({ paid: false, usedThisRun: 20 }, 10)).toBe(5);
    expect(allowedLinks({ paid: false, usedThisRun: 30 }, 10)).toBe(0);
  });
});
