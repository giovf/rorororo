import { describe, expect, it } from 'vitest';
import { formatOwed, hasDispatch, owedFirstRuns, parseInstallers } from './first-runs.ts';

const log = [
  '2026-10-26T19:45:29+00:00|ci: install workflow(s) fetch-relay.yml (workflow installer)',
  '2026-10-26T09:37:58+00:00|ci: install workflow(s) demo-video.yml landing.yml (workflow installer)',
  '2026-10-24T17:29:37+00:00|ci: install workflow(s) notify-owner.yml (workflow installer)',
  '2026-10-22T08:00:00+00:00|ci: install workflow(s) notify-owner.yml (workflow installer)',
].join('\n');
const runs = (...lines: string[]): string => `# Runs\n\n${lines.join('\n')}\n`;

describe('parseInstallers', () => {
  it('reads every workflow name and the UTC minute', () => {
    const got = parseInstallers(log);
    expect(got[1]).toEqual({ at: '2026-10-26 09:37', names: ['demo-video.yml', 'landing.yml'] });
    expect(got).toHaveLength(4);
  });
  it('converts an offset commit time to UTC', () => {
    const got = parseInstallers('2026-10-26T20:45:00+01:00|ci: install workflow(s) a.yml (x)');
    expect(got[0]!.at).toBe('2026-10-26 19:45');
  });
});

describe('hasDispatch', () => {
  it('sees the trigger as a key or list item, not in a comment', () => {
    expect(hasDispatch('on:\n  workflow_dispatch:\n')).toBe(true);
    expect(hasDispatch('on: [push]\n# workflow_dispatch would resend\n')).toBe(false);
    expect(hasDispatch('on:\n  - push\n  - workflow_dispatch\n')).toBe(true);
  });
});

describe('owedFirstRuns', () => {
  const all = (): boolean => true;
  it('owes every workflow with no line', () => {
    const owed = owedFirstRuns(parseInstallers(log), runs(), all).map((o) => o.name);
    expect(owed).toEqual(['demo-video.yml', 'fetch-relay.yml', 'landing.yml', 'notify-owner.yml']);
  });
  it('a success or failure line after the latest installer settles it', () => {
    const r = runs(
      '- 2026-10-26 17:20 | build | landing.yml first run: success (push run 73 at 09:38)',
      '- 2026-10-27 09:13 | build | fetch-relay.yml first run: failure, step Fetch',
      '- 2026-10-24 18:00 | burn-down | notify-owner.yml first run: success (cron)',
    );
    const owed = owedFirstRuns(parseInstallers(log), r, all).map((o) => o.name);
    expect(owed).toEqual(['demo-video.yml']);
  });
  it('a line from an earlier install of the same file does not count', () => {
    const r = runs('- 2026-10-23 10:00 | build | notify-owner.yml first run: success');
    const owed = owedFirstRuns(parseInstallers(log), r, all).map((o) => o.name);
    expect(owed).toContain('notify-owner.yml');
  });
  it('a "none since the install" note keeps it owed and is shown', () => {
    const r = runs(
      '- 2026-10-26 17:20 | build | demo-video.yml first run: none since the 09:37 install',
    );
    const demo = owedFirstRuns(parseInstallers(log), r, all).find(
      (o) => o.name === 'demo-video.yml',
    )!;
    expect(formatOwed(demo)).toBe(
      'demo-video.yml: installer 2026-10-26 09:37 UTC, never dispatched (publishes or spends), read only, last note "none since the 09:37 install"',
    );
  });
  it('says whether a workflow can be dispatched', () => {
    const owed = owedFirstRuns(parseInstallers(log), runs(), (n) => n === 'landing.yml');
    expect(formatOwed(owed.find((o) => o.name === 'landing.yml')!)).toBe(
      'landing.yml: installer 2026-10-26 09:37 UTC, dispatchable, no line',
    );
    expect(formatOwed(owed.find((o) => o.name === 'fetch-relay.yml')!)).toContain(
      'not dispatchable, read only',
    );
  });
});
