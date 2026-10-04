import { describe, expect, it } from 'vitest';
import { TOOLKIT_URL, freeSummary } from './free.js';
import type { VariableUsage } from './hygiene.js';

const v = (id: string, references = 0): VariableUsage => ({
  id,
  name: id,
  type: 'COLOR',
  collectionId: 'c',
  valueKeys: ['#000'],
  references,
  aliasTargets: [],
});

describe('freeSummary', () => {
  it('counts the file and the unused variables', () => {
    const s = freeSummary({ unused: [v('a'), v('b')], duplicates: [], dangling: [] }, 5);
    expect(s.headline).toBe('5 local variables · 2 unused in this file');
    expect(s.upsell).not.toContain('This file also has');
    expect(s.upsell).toContain('$12 once');
  });

  it('names only what the paid report would add for this file', () => {
    const s = freeSummary(
      {
        unused: [],
        duplicates: [{ valueKey: 'k', variables: [v('a', 1), v('b', 1)] }],
        dangling: [{ variable: v('c', 1), missingTargetId: 'gone' }],
      },
      3,
    );
    expect(s.upsell).toMatch(/^This file also has 1 group of variables sharing one value and 1 alias pointing at a deleted variable\. /);
  });

  it('handles an empty file and singulars', () => {
    expect(freeSummary({ unused: [], duplicates: [], dangling: [] }, 0).headline).toBe('No local variables in this file.');
    expect(freeSummary({ unused: [v('a')], duplicates: [], dangling: [] }, 1).headline).toBe('1 local variable · 1 unused in this file');
  });

  it('links to the paid listing', () => {
    expect(TOOLKIT_URL).toMatch(/^https:\/\/www\.figma\.com\/community\/plugin\/\d+$/);
  });
});
