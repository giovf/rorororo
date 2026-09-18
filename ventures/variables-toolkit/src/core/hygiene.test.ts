import { describe, expect, it } from 'vitest';
import { hygieneReport, type VariableUsage } from './hygiene.js';

const v = (id: string, name: string, valueKeys: string[], references = 0, aliasTargets: string[] = []): VariableUsage => ({
  id,
  name,
  type: 'COLOR',
  collectionId: 'c1',
  valueKeys,
  references,
  aliasTargets,
});

describe('hygieneReport', () => {
  it('flags unused variables but not ones referenced via aliases', () => {
    const r = hygieneReport([v('a', 'base/red', ['#f00'], 0), v('b', 'alias/danger', ['#f00'], 3, ['a']), v('c', 'lonely', ['#0f0'])]);
    expect(r.unused.map((x) => x.id)).toEqual(['c']);
  });

  it('groups duplicate values within a collection, ignoring aliases', () => {
    const r = hygieneReport([v('a', 'red-1', ['#f00'], 1), v('b', 'red-2', ['#f00'], 1), v('c', 'alias', ['#f00'], 1, ['a'])]);
    expect(r.duplicates).toHaveLength(1);
    expect(r.duplicates[0]?.variables.map((x) => x.name)).toEqual(['red-1', 'red-2']);
  });

  it('reports aliases whose target no longer exists', () => {
    const r = hygieneReport([v('a', 'alias', ['#f00'], 1, ['gone'])]);
    expect(r.dangling).toEqual([{ variable: r.dangling[0]?.variable, missingTargetId: 'gone' }]);
  });
});
