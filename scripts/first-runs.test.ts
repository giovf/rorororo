import { describe, expect, it } from 'vitest';
import {
  formatOwed,
  hasDispatch,
  owedFirstRuns,
  parseInstallers,
  triggerEvents,
  waitsFor,
} from './first-runs.ts';

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

describe('triggerEvents / waitsFor', () => {
  it('reads a mapping, a block list, a flow list and a scalar', () => {
    expect(
      triggerEvents(
        'name: x\non:\n  pull_request:\n    branches: [main]\n\npermissions:\n  contents: write\n',
      ),
    ).toEqual(['pull_request']);
    expect(triggerEvents('on:\n  - push\n  - workflow_dispatch\n')).toEqual([
      'push',
      'workflow_dispatch',
    ]);
    expect(triggerEvents('on: [push, pull_request]\n')).toEqual(['push', 'pull_request']);
    expect(triggerEvents('on: push\njobs:\n')).toEqual(['push']);
    expect(
      triggerEvents('on:\n  schedule:\n    - cron: "40 */2 * * *"\n  workflow_dispatch:\n'),
    ).toEqual(['schedule', 'workflow_dispatch']);
    expect(triggerEvents('jobs:\n  a:\n')).toEqual([]);
  });
  it('an event-only workflow waits for its events; one a routine can raise does not', () => {
    expect(waitsFor('on:\n  pull_request:\n    branches: [main]\n')).toBe('pull_request');
    expect(waitsFor('on: [pull_request, issue_comment]\n')).toBe('pull_request, issue_comment');
    expect(waitsFor('on:\n  push:\n  pull_request:\n')).toBeUndefined();
    expect(waitsFor('on:\n  workflow_dispatch:\n')).toBeUndefined();
    expect(waitsFor('on:\n  schedule:\n    - cron: "0 3 * * *"\n')).toBeUndefined();
    expect(waitsFor('jobs:\n')).toBeUndefined();
  });
});

describe('owedFirstRuns', () => {
  const all = (): boolean => true;
  const soon = new Date('2026-10-27T00:00:00Z');
  it('lists an event-only workflow once as waits for <event> and is settled by that line (2026-11-10)', () => {
    const installers = parseInstallers(
      '2026-11-07T09:19:00+00:00|ci: install workflow(s) dependabot.yml (workflow installer)\n',
    );
    const events = (n: string): string | undefined =>
      n === 'dependabot.yml' ? 'pull_request' : undefined;
    const owed = owedFirstRuns(
      installers,
      runs(),
      () => false,
      events,
      new Date('2026-11-07T21:18:00Z'),
    );
    expect(formatOwed(owed[0]!)).toBe(
      'dependabot.yml: installer 2026-11-07 09:19 UTC, waits for pull_request — write "dependabot.yml first run: waits for pull_request" and let the triage record the run, no line',
    );
    const r = runs(
      '- 2026-11-07 21:18 | burn-down | dependabot.yml first run: waits for pull_request',
    );
    expect(
      owedFirstRuns(installers, r, () => false, events, new Date('2026-11-09T09:33:00Z')),
    ).toEqual([]);
    // a `none since` note does not settle it, and after 3 days it is overdue, not forgotten
    const none = runs(
      '- 2026-11-07 21:18 | burn-down | dependabot.yml first run: still none since the 11-07 09:19 install',
    );
    const late = owedFirstRuns(
      installers,
      none,
      () => false,
      events,
      new Date('2026-11-10T19:30:00Z'),
    );
    expect(late[0]?.overdue).toBe(true);
    expect(formatOwed(late[0]!)).toContain(
      'dependabot.yml: overdue (installed over 3 days ago), installer 2026-11-07 09:19 UTC, waits for pull_request',
    );
    expect(
      owedFirstRuns(installers, none, () => false, events, new Date('2026-11-10T09:00:00Z'))[0]
        ?.overdue,
    ).toBe(false);
  });
  it('owes every workflow with no line', () => {
    const owed = owedFirstRuns(parseInstallers(log), runs(), all, undefined, soon).map(
      (o) => o.name,
    );
    expect(owed).toEqual(['demo-video.yml', 'fetch-relay.yml', 'landing.yml', 'notify-owner.yml']);
  });
  it('a success or failure line after the latest installer settles it', () => {
    const r = runs(
      '- 2026-10-26 17:20 | build | landing.yml first run: success (push run 73 at 09:38)',
      '- 2026-10-27 09:13 | build | fetch-relay.yml first run: failure, step Fetch',
      '- 2026-10-24 18:00 | burn-down | notify-owner.yml first run: success (cron)',
    );
    const owed = owedFirstRuns(parseInstallers(log), r, all, undefined, soon).map((o) => o.name);
    expect(owed).toEqual(['demo-video.yml']);
  });
  it('a line that names the workflow without .yml settles it the same way', () => {
    // 2026-11-05: `epubcheck first run: success` at 18:32 was invisible to the 19:00 slot.
    const r = runs(
      '- 2026-10-26 17:20 | burn-down | epubcheck first run: success (run 1 at 18:28)',
    );
    const installers = parseInstallers(
      '2026-10-26T17:17:00+00:00|ci: install workflow(s) epubcheck.yml\n',
    );
    expect(owedFirstRuns(installers, r, all, undefined, soon).map((o) => o.name)).toEqual([]);
  });

  it('a line from an earlier install of the same file does not count', () => {
    const r = runs('- 2026-10-23 10:00 | build | notify-owner.yml first run: success');
    const owed = owedFirstRuns(parseInstallers(log), r, all, undefined, soon).map((o) => o.name);
    expect(owed).toContain('notify-owner.yml');
  });
  it('a "none since the install" note keeps it owed and is shown', () => {
    const r = runs(
      '- 2026-10-26 17:20 | build | demo-video.yml first run: none since the 09:37 install',
    );
    const demo = owedFirstRuns(parseInstallers(log), r, all, undefined, soon).find(
      (o) => o.name === 'demo-video.yml',
    )!;
    expect(formatOwed(demo)).toBe(
      'demo-video.yml: installer 2026-10-26 09:37 UTC, never dispatched (publishes or spends), read only, last note "none since the 09:37 install"',
    );
  });
  it('says whether a workflow can be dispatched', () => {
    const owed = owedFirstRuns(
      parseInstallers(log),
      runs(),
      (n) => n === 'landing.yml',
      undefined,
      soon,
    );
    expect(formatOwed(owed.find((o) => o.name === 'landing.yml')!)).toBe(
      'landing.yml: installer 2026-10-26 09:37 UTC, dispatchable, no line',
    );
    expect(formatOwed(owed.find((o) => o.name === 'fetch-relay.yml')!)).toContain(
      'not dispatchable, read only',
    );
  });
});
