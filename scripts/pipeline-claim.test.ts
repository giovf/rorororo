import { describe, expect, it } from 'vitest';
import {
  claimItem,
  claimMarkerRoutine,
  claimSubject,
  parseTarget,
  routineFrom,
} from './pipeline-claim.ts';

const queue = (items: Record<string, unknown>[]): string =>
  `${JSON.stringify({ venture: 'foundry', status: 'open', needs_research: false, updated: '2026-10-07', items }, null, 2)}\n`;

const todo = {
  id: 'claim-me',
  title: 't',
  why: 'w',
  score: 5,
  status: 'todo',
  added: '2026-10-07',
};

describe('parseTarget', () => {
  it('splits <venture>/<id> and rejects anything else', () => {
    expect(parseTarget('foundry/build-claim-marker')).toEqual({
      venture: 'foundry',
      id: 'build-claim-marker',
    });
    for (const bad of [
      undefined,
      '',
      'foundry',
      'foundry/',
      '/x',
      'a/b/c',
      'Foundry/x',
      '../x/y',
    ]) {
      expect(() => parseTarget(bad)).toThrow('usage: npm run pipeline claim');
    }
  });
});

describe('claimItem', () => {
  it('marks a todo item doing with today as doing_since, in the shape the queue files keep', () => {
    const text = queue([todo, { ...todo, id: 'other' }]);
    const { text: out, item } = claimItem(text, 'claim-me', '2026-10-07');
    expect(item).toMatchObject({ id: 'claim-me', status: 'doing', doing_since: '2026-10-07' });
    const parsed = JSON.parse(out) as {
      items: { id: string; status: string; doing_since?: string }[];
    };
    expect(parsed.items[0]).toMatchObject({ status: 'doing', doing_since: '2026-10-07' });
    expect(parsed.items[1]).toMatchObject({ id: 'other', status: 'todo' });
    expect(parsed.items[1]).not.toHaveProperty('doing_since');
    expect(out).toBe(`${JSON.stringify(parsed, null, 2)}\n`);
  });

  it('refuses another session’s live claim and a dated or non-todo item', () => {
    const live = queue([{ ...todo, status: 'doing', doing_since: '2026-10-07' }]);
    expect(() => claimItem(live, 'claim-me', '2026-10-07')).toThrow(
      'already doing since 2026-10-07',
    );
    expect(() => claimItem(live, 'claim-me', '2026-10-08')).toThrow('already doing');
    const dated = queue([{ ...todo, not_before: '2026-10-09' }]);
    expect(() => claimItem(dated, 'claim-me', '2026-10-07')).toThrow('dated 2026-10-09');
    // Dated today: not before 07:00 UTC (the morning metrics rows), then claimable.
    expect(() => claimItem(dated, 'claim-me', '2026-10-09', 0)).toThrow('buildable from 07:00 UTC');
    expect(claimItem(dated, 'claim-me', '2026-10-09', 7).item.status).toBe('doing');
    expect(claimItem(dated, 'claim-me', '2026-10-10', 0).item.status).toBe('doing');
    expect(() => claimItem(queue([{ ...todo, status: 'done' }]), 'claim-me', '2026-10-07')).toThrow(
      'is done, not todo',
    );
    expect(() => claimItem(queue([todo]), 'missing', '2026-10-07')).toThrow('no item "missing"');
  });

  it('takes over a leftover claim older than a day (a cut-off session)', () => {
    const left = queue([{ ...todo, status: 'doing', doing_since: '2026-10-05' }]);
    const { item } = claimItem(left, 'claim-me', '2026-10-07');
    expect(item).toMatchObject({ status: 'doing', doing_since: '2026-10-07' });
    // `doing_since` defaults to `added`, as core nextItem reads it.
    const noSince = queue([{ ...todo, status: 'doing', added: '2026-10-05' }]);
    expect(claimItem(noSince, 'claim-me', '2026-10-07').item.doing_since).toBe('2026-10-07');
  });
});

describe('claim commit subject', () => {
  it('names the item and the routine, and the watchdog can tell it from a trace', () => {
    const subject = claimSubject('foundry', 'build-claim-marker', 'burn-down');
    expect(subject).toBe('pipeline: claim foundry/build-claim-marker (burn-down)');
    expect(claimMarkerRoutine(subject)).toBe('burn-down');
    expect(claimMarkerRoutine('pipeline: claim gankdat/x (build)')).toBe('build');
    expect(claimMarkerRoutine('foundry: Search Console reading in CI (burn-down)')).toBeUndefined();
    expect(claimMarkerRoutine('build: slot 2026-10-01 09:03 UTC started (build)')).toBeUndefined();
  });
});

describe('routineFrom', () => {
  it('reads --by= from argv, else the npm_config_by npm leaves when the flag had no `--`, else build', () => {
    expect(routineFrom(['foundry/x', '--by=burn-down'], {})).toBe('burn-down');
    expect(routineFrom(['foundry/x'], { npm_config_by: 'burn-down' })).toBe('burn-down');
    expect(routineFrom(['foundry/x', '--by=exchange'], { npm_config_by: 'build' })).toBe(
      'exchange',
    );
    expect(routineFrom(['foundry/x'], {})).toBe('build');
    expect(() => routineFrom(['foundry/x'], { npm_config_by: 'Build 1' })).toThrow(/routine name/);
  });
});
