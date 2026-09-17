import { describe, expect, it } from 'vitest';
import { defineVenture, type VentureManifest } from './venture.js';

const base: VentureManifest = {
  slug: 'example-tool',
  name: 'Example Tool',
  channel: 'figma-community',
  status: 'idea',
  pricing: { kind: 'one-time', priceUsd: 9 },
  thesis: 'Designers pay to stop doing X by hand.',
  statusChangedOn: '2026-09-17',
};

describe('defineVenture', () => {
  it('returns a valid manifest unchanged', () => {
    expect(defineVenture(base)).toEqual(base);
  });

  it('rejects a non-kebab-case slug', () => {
    expect(() => defineVenture({ ...base, slug: 'Bad Slug' })).toThrow(/kebab-case/);
  });

  it('rejects a negative price', () => {
    expect(() =>
      defineVenture({ ...base, pricing: { kind: 'subscription', monthlyUsd: -1 } }),
    ).toThrow(/invalid price/);
  });

  it('rejects a malformed date', () => {
    expect(() => defineVenture({ ...base, statusChangedOn: '17/09/2026' })).toThrow(/YYYY-MM-DD/);
  });
});
