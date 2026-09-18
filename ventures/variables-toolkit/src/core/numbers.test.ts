import { describe, expect, it } from 'vitest';
import { suggestNumberLinks, type NumberSite, type NumberVariableRef } from './numbers.js';

const vars: NumberVariableRef[] = [
  { id: 's4', name: 'space/4', collection: 'Spacing', valuesByMode: { m: 16 } },
  { id: 'r2', name: 'radius/md', collection: 'Radius', valuesByMode: { m: 8, compact: 4 } },
  { id: 's2', name: 'space/2', collection: 'Spacing', valuesByMode: { m: 8 } },
];
const site = (id: string, field: NumberSite['field'], value: number, bound?: string): NumberSite => ({
  nodeId: id,
  nodeName: id,
  field,
  value,
  ...(bound === undefined ? {} : { boundVariableId: bound }),
});

describe('suggestNumberLinks', () => {
  it('matches exact values across modes and orders ties by name', () => {
    const { suggestions, unmatched } = suggestNumberLinks(
      [site('a', 'paddingTop', 16), site('b', 'topLeftRadius', 8), site('c', 'itemSpacing', 12)],
      vars,
    );
    expect(suggestions.map((s) => [s.site.nodeId, s.variable.name])).toEqual([
      ['a', 'space/4'],
      ['b', 'radius/md'],
    ]);
    expect(suggestions[1]?.alternatives.map((v) => v.name)).toEqual(['space/2']);
    expect(unmatched.map((s) => s.nodeId)).toEqual(['c']);
  });

  it('skips bound sites and zero values', () => {
    const { suggestions, unmatched } = suggestNumberLinks([site('a', 'paddingTop', 16, 'x'), site('b', 'itemSpacing', 0)], vars);
    expect(suggestions).toEqual([]);
    expect(unmatched).toEqual([]);
  });

  it('tolerates float noise', () => {
    expect(suggestNumberLinks([site('a', 'width', 16.0000001)], vars).suggestions).toHaveLength(1);
  });
});
