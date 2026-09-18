import { describe, expect, it } from 'vitest';
import { colorHex, colorKey } from './color.js';
import { groupByVariable, suggestLinks, type ColorVariableRef, type PaintSite } from './link.js';

const red = { r: 1, g: 0, b: 0, a: 1 };
const blue = { r: 0, g: 0, b: 1, a: 1 };
const vars: ColorVariableRef[] = [
  { id: 'v1', name: 'color/brand/primary', collection: 'Brand', valuesByMode: { light: red, dark: blue } },
  { id: 'v2', name: 'color/alias/danger', collection: 'Semantic', valuesByMode: { light: red } },
];
const site = (id: string, color: PaintSite['color'], bound?: string): PaintSite => ({
  nodeId: id,
  nodeName: `Layer ${id}`,
  property: 'fills',
  index: 0,
  color,
  ...(bound === undefined ? {} : { boundVariableId: bound }),
});

describe('colour keys', () => {
  it('normalises to 8-bit hex with alpha', () => {
    expect(colorKey(red)).toBe('#ff0000ff');
    expect(colorKey({ r: 0.5, g: 0.5, b: 0.5 }, 0.5)).toBe('#80808080');
    expect(colorHex(red)).toBe('#ff0000');
    expect(colorHex({ ...red, a: 0.2 })).toBe('#ff000033');
  });
});

describe('suggestLinks', () => {
  it('matches paints to variables by exact value in any mode', () => {
    const { suggestions, unmatched } = suggestLinks(
      [site('a', red), site('b', blue), site('c', { r: 0, g: 1, b: 0, a: 1 })],
      vars,
    );
    expect(suggestions.map((s) => [s.site.nodeId, s.variable.id])).toEqual([
      ['a', 'v2'], // alphabetical tie-break: color/alias/danger < color/brand/primary
      ['b', 'v1'],
    ]);
    expect(suggestions[0]?.alternatives.map((v) => v.id)).toEqual(['v1']);
    expect(unmatched.map((s) => s.nodeId)).toEqual(['c']);
  });

  it('never touches paints that are already bound', () => {
    const { suggestions, unmatched } = suggestLinks([site('a', red, 'v9')], vars);
    expect(suggestions).toEqual([]);
    expect(unmatched).toEqual([]);
  });

  it('groups by variable, largest group first', () => {
    const { suggestions } = suggestLinks([site('a', red), site('b', red), site('c', blue)], vars);
    const groups = groupByVariable(suggestions);
    expect(groups.map((g) => [g.variable.id, g.sites.length])).toEqual([
      ['v2', 2],
      ['v1', 1],
    ]);
  });
});
