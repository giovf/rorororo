import { describe, expect, it } from 'vitest';
import { planStyleConversion, variableNameFromStyle, type StyleInfo } from './convert.js';

const red = { r: 1, g: 0, b: 0, a: 1 };
const styles: StyleInfo[] = [
  { kind: 'paint', id: 'p1', name: 'Brand / Primary Blue', solid: red, paintCount: 1 },
  { kind: 'paint', id: 'p2', name: 'Gradient/Hero', paintCount: 1 },
  { kind: 'paint', id: 'p3', name: 'Layered', paintCount: 2 },
  { kind: 'text', id: 't1', name: 'Body/Regular', fontFamily: 'Inter', fontStyle: 'Regular', fontSize: 16, lineHeightPx: 24 },
  { kind: 'effect', id: 'e1', name: 'Shadow/Card', shadow: { color: red, radius: 8, spread: 0, x: 0, y: 2 } },
  { kind: 'effect', id: 'e2', name: 'Blur/Glass' },
];

describe('variableNameFromStyle', () => {
  it('slugs each path segment', () => {
    expect(variableNameFromStyle('Brand / Primary Blue')).toBe('brand/primary-blue');
    expect(variableNameFromStyle(' Text Styles/H1 (Desktop) ', 'tokens')).toBe('tokens/text-styles/h1-desktop');
    expect(variableNameFromStyle('///')).toBe('');
  });
});

describe('planStyleConversion', () => {
  it('converts solid paints only, in the free tier', () => {
    const plan = planStyleConversion(styles, { kinds: new Set(['paint']), existing: [] });
    expect(plan.create).toEqual([{ key: 'COLOR:brand/primary-blue', name: 'brand/primary-blue', type: 'COLOR', value: red }]);
    expect(plan.bind).toEqual([{ styleId: 'p1', styleKind: 'paint', field: 'color', variableKey: 'COLOR:brand/primary-blue' }]);
    expect(plan.skipped.map((s) => s.reason)).toEqual(['not a solid colour', '2 paints (only single solids convert)']);
  });

  it('expands text and effect styles into typed variables', () => {
    const plan = planStyleConversion(styles, { kinds: new Set(['text', 'effect']), existing: [] });
    expect(plan.create.map((v) => `${v.type} ${v.name}`)).toEqual([
      'STRING body/regular/font-family',
      'STRING body/regular/font-style',
      'FLOAT body/regular/font-size',
      'FLOAT body/regular/line-height',
      'COLOR shadow/card/color',
      'FLOAT shadow/card/radius',
      'FLOAT shadow/card/spread',
      'FLOAT shadow/card/offset-x',
      'FLOAT shadow/card/offset-y',
    ]);
    expect(plan.bind.filter((b) => b.styleId === 't1').map((b) => b.field)).toEqual(['fontFamily', 'fontStyle', 'fontSize', 'lineHeight']);
    expect(plan.skipped).toEqual([{ styleId: 'e2', name: 'Blur/Glass', reason: 'no shadow effect' }]);
  });

  it('reuses an existing variable with the same name and type instead of duplicating', () => {
    const plan = planStyleConversion(styles, {
      kinds: new Set(['paint']),
      existing: [{ id: 'v-old', name: 'brand/primary-blue', type: 'COLOR', collectionId: 'c1' }],
    });
    expect(plan.create[0]?.reuseId).toBe('v-old');
  });

  it('dedupes variables shared by several styles', () => {
    const two: StyleInfo[] = [
      { kind: 'text', id: 'a', name: 'X', fontFamily: 'Inter', fontStyle: 'Bold', fontSize: 12 },
      { kind: 'text', id: 'b', name: 'X', fontFamily: 'Inter', fontStyle: 'Bold', fontSize: 12 },
    ];
    const plan = planStyleConversion(two, { kinds: new Set(['text']), existing: [] });
    expect(plan.create).toHaveLength(3);
    expect(plan.bind).toHaveLength(6);
  });
});

describe('mode pairing', () => {
  const blue = { r: 0, g: 0, b: 1, a: 1 };
  const paired: StyleInfo[] = [
    { kind: 'paint', id: 'l1', name: 'Light/Brand/Primary', solid: red, paintCount: 1 },
    { kind: 'paint', id: 'd1', name: 'Dark/Brand/Primary', solid: blue, paintCount: 1 },
    { kind: 'paint', id: 'l2', name: 'Light/Surface', solid: red, paintCount: 1 },
    { kind: 'paint', id: 'x', name: 'Brand/Accent', solid: blue, paintCount: 1 },
  ];

  it('turns Light/Dark twins into one variable with two modes and leaves singles alone', () => {
    const plan = planStyleConversion(paired, { kinds: new Set(['paint']), existing: [] });
    expect(plan.modes).toEqual(['Light', 'Dark']);
    const primary = plan.create.find((v) => v.name === 'brand/primary');
    expect(primary?.valuesByMode).toEqual({ Light: red, Dark: blue });
    expect(primary?.value).toEqual(red);
    expect(plan.bind.filter((b) => b.variableKey === 'COLOR:brand/primary').map((b) => b.styleId)).toEqual(['l1', 'd1']);
    // unpaired styles keep their full slug
    expect(plan.create.map((v) => v.name)).toEqual(['brand/primary', 'light/surface', 'brand/accent']);
  });

  it('can be switched off and honours a subset', () => {
    const off = planStyleConversion(paired, { kinds: new Set(['paint']), existing: [], modePairing: false });
    expect(off.modes).toEqual([]);
    expect(off.create.map((v) => v.name)).toEqual(['light/brand/primary', 'dark/brand/primary', 'light/surface', 'brand/accent']);
    const subset = planStyleConversion(paired, { kinds: new Set(['paint']), existing: [], onlyStyleIds: new Set(['x']) });
    expect(subset.create.map((v) => v.name)).toEqual(['brand/accent']);
    expect(subset.modes).toEqual([]);
  });
});
