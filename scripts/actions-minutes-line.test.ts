import { describe, expect, it } from 'vitest';
import { RUN_LINE_CAP, ciMinutesLine } from './actions-minutes-line.ts';

const top = [
  ['fetch relay', 139],
  ['owner notes', 84],
  ['notify owner', 71],
] as const;

describe('ciMinutesLine', () => {
  it('prints the three workflows with complete numbers inside the cap', () => {
    const line = ciMinutesLine({ billed: 630, projection: 2700, top });
    expect(line).toBe(
      'ci-minutes: 630 billed min/7d (~2700/mo; cap 2000) top: fetch relay 139, owner notes 84, notify owner 71',
    );
    expect(line.length).toBeLessThanOrEqual(RUN_LINE_CAP);
  });

  it('drops whole entries from the end rather than cutting a number', () => {
    const long = [
      ['gankdat publish and registry mirror', 139],
      ['variables toolkit figma release', 84.4],
      ['notify owner', 71],
    ] as const;
    const line = ciMinutesLine({ billed: 630, projection: 2700, top: long });
    expect(line.length).toBeLessThanOrEqual(RUN_LINE_CAP);
    expect(line).toMatch(/gankdat publish and registry mirror 139$/);
    expect(line).not.toContain('variables');
  });

  it('shortens a name, never its minutes, when even the first entry does not fit', () => {
    const name = 'w'.repeat(200);
    const line = ciMinutesLine({ billed: 630, projection: 2700, top: [[name, 139]] });
    expect(line.length).toBe(RUN_LINE_CAP);
    expect(line).toMatch(/ 139$/);
  });

  it('rounds minutes to whole numbers and prints only the first three', () => {
    const line = ciMinutesLine({
      billed: 10,
      projection: 43,
      top: [
        ['a', 1.6],
        ['b', 1.4],
        ['c', 1],
        ['d', 1],
      ],
    });
    expect(line).toBe('ci-minutes: 10 billed min/7d (~43/mo; cap 2000) top: a 2, b 1, c 1');
  });

  it('never exceeds the cap for the longest workflow names in this repo', () => {
    const names = [
      'workflow installer',
      'gankdat publish',
      'mirror gankdat',
      'fetch relay',
      'notify owner',
    ];
    for (let i = 0; i < names.length; i++) {
      const line = ciMinutesLine({
        billed: 9999,
        projection: 42853,
        top: names.slice(i, i + 3).map((n) => [n, 9999] as const),
      });
      expect(line.length).toBeLessThanOrEqual(RUN_LINE_CAP);
      expect(line).toMatch(/ \d+$/);
    }
  });

  it('leaves out the top list when there is none', () => {
    expect(ciMinutesLine({ billed: 0, projection: 0, top: [] })).toBe(
      'ci-minutes: 0 billed min/7d (~0/mo; cap 2000)',
    );
  });
});
