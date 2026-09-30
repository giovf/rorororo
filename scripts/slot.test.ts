import { describe, expect, it } from 'vitest';
import {
  checkSlot,
  parseStarted,
  startMarkerRoutine,
  startedLine,
  startedSubject,
} from './slot.ts';

const at = (iso: string): Date => new Date(iso);
const now = at('2026-10-01T09:21:00Z'); // the fallback's STEP 0 check, 21 min after the slot

describe('start marker', () => {
  it('writes the SLOTS.md line and a commit subject the routine tag check already stops on', () => {
    const t = at('2026-10-01T09:03:00Z');
    expect(startedLine('build', t)).toBe('- 2026-10-01 09:03 | build | started');
    expect(startedSubject('build', t)).toBe('build: slot 2026-10-01 09:03 UTC started (build)');
    expect(startedSubject('build', t).endsWith('(build)')).toBe(true);
  });

  it('recognises its own subject and nothing else', () => {
    expect(startMarkerRoutine('build: slot 2026-10-01 09:03 UTC started (build)')).toBe('build');
    expect(startMarkerRoutine('gankdat: something useful (build)')).toBeUndefined();
    expect(
      startMarkerRoutine('build: slot 2026-10-01 09:03 UTC started (fallback)'),
    ).toBeUndefined();
  });

  it('parses SLOTS.md and ignores anything that is not a started line', () => {
    const text = [
      '# Slot starts',
      '',
      '- 2026-10-01 09:03 | build | started',
      '- 2026-10-01 09:30 | build | Built something', // RUNS-style line: not a marker
      '- not a line',
    ].join('\n');
    expect(parseStarted(text)).toEqual([{ routine: 'build', at: at('2026-10-01T09:03:00Z') }]);
  });
});

describe('checkSlot', () => {
  it('is running when the build stamped its start but has not committed yet (the race window)', () => {
    const r = checkSlot({
      routine: 'build',
      now,
      slotsText: '- 2026-10-01 09:03 | build | started\n',
      commitsText: '2026-10-01T09:03:20+00:00\tbuild: slot 2026-10-01 09:03 UTC started (build)\n',
    });
    expect(r).toEqual({ state: 'running', evidence: '- 2026-10-01 09:03 | build | started' });
  });

  it('is done once a finished-work commit tagged (build) landed inside the window', () => {
    const r = checkSlot({
      routine: 'build',
      now: at('2026-10-01T09:40:00Z'),
      slotsText: '- 2026-10-01 09:03 | build | started\n',
      commitsText: [
        '2026-10-01T09:33:00+00:00\tgankdat: a dataset (build)',
        '2026-10-01T09:03:20+00:00\tbuild: slot 2026-10-01 09:03 UTC started (build)',
      ].join('\n'),
    });
    expect(r).toEqual({ state: 'done', evidence: 'gankdat: a dataset (build)' });
  });

  it('is missed when the only traces are older than the window or from another routine', () => {
    const r = checkSlot({
      routine: 'build',
      now,
      slotsText: '- 2026-09-30 17:02 | build | started\n- 2026-10-01 09:05 | metrics | started\n',
      commitsText: [
        '2026-10-01T09:10:00+00:00\tinbox: 2026-10-01 09:05 triage',
        '2026-09-30T17:40:00+00:00\tgankdat: yesterday (build)',
      ].join('\n'),
      windowMinutes: 120,
    });
    expect(r).toEqual({ state: 'missed' });
  });
});
