import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { describePricing, formatPortfolio, loadPortfolio } from './portfolio.js';

async function venturesDir(manifests: Record<string, unknown>): Promise<string> {
  const dir = await mkdtemp(path.join(tmpdir(), 'ventures-'));
  for (const [slug, body] of Object.entries(manifests)) {
    await mkdir(path.join(dir, slug));
    await writeFile(path.join(dir, slug, 'venture.json'), JSON.stringify(body));
  }
  return dir;
}

const good = {
  slug: 'good-tool',
  name: 'Good Tool',
  channel: 'figma-community',
  status: 'idea',
  pricing: { kind: 'one-time', priceUsd: 12 },
  thesis: 'Designers pay to skip a chore.',
  statusChangedOn: '2026-09-17',
};

describe('loadPortfolio', () => {
  it('loads valid manifests and reports invalid ones', async () => {
    const dir = await venturesDir({
      'good-tool': good,
      'bad-tool': { ...good, slug: 'bad-tool', statusChangedOn: 'soon' },
      mismatch: { ...good, slug: 'other' },
    });
    const { ventures, errors } = await loadPortfolio(dir);
    expect(ventures.map((v) => v.slug)).toEqual(['good-tool']);
    expect(errors).toHaveLength(2);
    expect(errors.join('\n')).toMatch(/YYYY-MM-DD/);
    expect(errors.join('\n')).toMatch(/does not match folder/);
  });

  it('returns nothing for a missing directory', async () => {
    const result = await loadPortfolio(path.join(tmpdir(), 'does-not-exist-foundry'));
    expect(result).toEqual({ ventures: [], errors: [] });
  });
});

describe('formatting', () => {
  it('describes each pricing model', () => {
    expect(describePricing({ kind: 'free' })).toBe('free');
    expect(describePricing({ kind: 'one-time', priceUsd: 9 })).toBe('$9 once');
    expect(describePricing({ kind: 'subscription', monthlyUsd: 4, yearlyUsd: 30 })).toBe(
      '$4/mo · $30/yr',
    );
  });

  it('formats an empty portfolio', () => {
    expect(formatPortfolio([])).toBe('(no ventures yet)');
  });
});
