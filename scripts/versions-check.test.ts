import { describe, expect, it } from 'vitest';
import {
  activeLtsMajor,
  alreadyOpen,
  handoffLine,
  newerModels,
  newestPerFamily,
  parseModelId,
  pinnedModels,
} from './versions-check.ts';

const page =
  'Prompting Claude Opus 5.5 claude-opus-5-5 … claude-sonnet-5 … claude-sonnet-5-5 … claude-fable-5-1 claude-fable-5 claude-haiku-4-5-20251001 claude-opus-4-8';
const versions =
  '| Claude model, build | `claude-fable-5-1` | x |\n| Claude model, fallback | `claude-opus-5` | x |\n| Claude model, metrics | `claude-sonnet-5` | x |\n| Node on GitHub runners | `22` | x |\n';

describe('versions-check', () => {
  it('finds the newest id per family on the page', () => {
    const n = newestPerFamily(page);
    expect(n.get('opus')?.id).toBe('claude-opus-5-5');
    expect(n.get('sonnet')?.id).toBe('claude-sonnet-5-5');
    expect(n.get('fable')?.id).toBe('claude-fable-5-1');
    expect(n.get('haiku')?.id).toBe('claude-haiku-4-5');
    expect(parseModelId('claude-opus-5')).toEqual({
      family: 'opus',
      major: 5,
      minor: 0,
      id: 'claude-opus-5',
    });
  });
  it('compares the pinned routine models with the page', () => {
    expect(pinnedModels(versions)).toEqual([
      'claude-fable-5-1',
      'claude-opus-5',
      'claude-sonnet-5',
    ]);
    expect(newerModels(pinnedModels(versions), newestPerFamily(page))).toEqual([
      { pinned: 'claude-opus-5', newer: 'claude-opus-5-5' },
      { pinned: 'claude-sonnet-5', newer: 'claude-sonnet-5-5' },
    ]);
  });
  it('writes one handoff line, and none when current', () => {
    expect(
      activeLtsMajor([
        { version: 'v25.1.0', lts: false },
        { version: 'v24.22.0', lts: 'Krypton' },
      ]),
    ).toBe(24);
    const line = handoffLine(
      '2026-10-16',
      [{ pinned: 'claude-opus-5', newer: 'claude-opus-5-5' }],
      [22],
      24,
    )!;
    expect(line).toMatch(/^- 2026-10-16 handoff: versions check/);
    expect(line).toMatch(/claude-opus-5 → claude-opus-5-5/);
    expect(line).toMatch(/Node 22 while the active LTS is 24/);
    expect(handoffLine('2026-10-16', [], [24], 24)).toBeUndefined();
    expect(alreadyOpen(`${line}\n`)).toBe(true);
    expect(alreadyOpen(`${line} — Done 2026-10-17 (interactive): updated\n`)).toBe(false);
  });
});
