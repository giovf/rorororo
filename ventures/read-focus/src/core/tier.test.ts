import { describe, expect, it } from 'vitest';
import { DEFAULT_SITE } from './settings.js';
import { applyTier } from './tier.js';

describe('applyTier', () => {
  const pro = { ...DEFAULT_SITE, enabled: true, strength: 0.42, weight: 800, focus: true, font: 'opendyslexic' as const };
  it('keeps everything for pro', () => {
    expect(applyTier(pro, 'pro')).toEqual(pro);
  });
  it('drops pro options for free but keeps the free ones', () => {
    expect(applyTier(pro, 'free')).toEqual({ ...DEFAULT_SITE, enabled: true, focus: false, font: 'default' });
  });
});
