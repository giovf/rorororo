import { describe, expect, it } from 'vitest';
import { gateLine, parsePaused, pausedAt, pausedNow } from './paused.ts';

const doc = parsePaused(
  JSON.stringify({
    paused: { build: '2026-11-20T19:30:00.000Z' },
    history: [
      { routine: 'inbox', from: '2026-11-19T10:00:00.000Z', to: '2026-11-19T14:00:00.000Z' },
    ],
    updated: '2026-11-20T19:30:00.000Z',
  }),
);

describe('paused gate', () => {
  it('stops a paused routine and lets the others run', () => {
    expect(gateLine(doc, 'build')).toBe(
      'paused: build — build paused since 2026-11-20 19:30 UTC from the ops page; end the run now',
    );
    expect(gateLine(doc, 'metrics')).toBe('run: metrics');
  });

  it('stops the fallback while the build is paused', () => {
    expect(pausedNow(doc, 'fallback')).toContain('build paused since');
  });

  it('runs everything on a missing or broken file', () => {
    expect(gateLine(parsePaused(undefined), 'build')).toBe('run: build');
    expect(gateLine(parsePaused('{oops'), 'build')).toBe('run: build');
  });

  it('knows whether a past slot fell inside a pause', () => {
    expect(pausedAt(doc, 'build', new Date('2026-11-21T09:00:00Z'))).toBe(true);
    expect(pausedAt(doc, 'build', new Date('2026-11-20T17:00:00Z'))).toBe(false);
    expect(pausedAt(doc, 'inbox', new Date('2026-11-19T11:05:00Z'))).toBe(true);
    expect(pausedAt(doc, 'inbox', new Date('2026-11-19T15:05:00Z'))).toBe(false);
  });
});
