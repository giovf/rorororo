import { describe, expect, it } from 'vitest';
import {
  activeLtsMajor,
  closeFinding,
  fileLineReviews,
  fileModelFindings,
  fileNodeRunners,
  markProbed,
  modelFindings,
  modelRoles,
  newerModels,
  newestPerFamily,
  ownerSwitchLine,
  parseModelId,
  pendingFindings,
  pinnedModels,
  recordSwitch,
  reviewedLines,
  unreviewedLines,
} from './versions-check.ts';

// A fixture of the models page the day a new Fable and a new line appear.
const page =
  'Prompting Claude Opus 5.5 claude-opus-5-5 … claude-sonnet-5 … claude-sonnet-5-5 claude-sonnet-5-5-system-card … claude-fable-5-3 claude-fable-5-2 claude-fable-5-2-mythos-5-2-system-card claude-haiku-4-5-20251001 claude-opus-4-20250514 claude-opus-4-8 claude-mythos-5-2 claude-saga-1';
const versions = `# Pinned versions

| What | Pinned |
| --- | --- |
| Node on GitHub runners | \`24\` |

## Model roles

| Role | Line | Current | Previous | Routines |
| --- | --- | --- | --- | --- |
| deep work | \`fable\` | \`claude-fable-5-2\` | \`claude-fable-5-1\` | build \`trig_01A\`, review \`trig_01B\` |
| build fallback | \`opus\` | \`claude-opus-5-5\` | \`claude-opus-5\` | \`trig_01C\` |
| read and summarise | \`sonnet\` | \`claude-sonnet-5\` | \`claude-sonnet-4-6\` | metrics \`trig_01D\` |

Lines reviewed and not used: \`haiku\` (too small), \`mythos\` (limited availability).

## Log

- 2026-11-12 — earlier line.
`;
const alerts = '# Alerts\n\n- 2026-11-03 owner: something else\n';

describe('versions-check', () => {
  it('finds the newest id per line on the page, dates and card names aside', () => {
    const n = newestPerFamily(page);
    expect(n.get('opus')?.id).toBe('claude-opus-5-5');
    expect(n.get('sonnet')?.id).toBe('claude-sonnet-5-5');
    expect(n.get('fable')?.id).toBe('claude-fable-5-3');
    expect(n.get('haiku')?.id).toBe('claude-haiku-4-5');
    expect(n.get('saga')?.id).toBe('claude-saga-1');
    expect(parseModelId('claude-opus-5')).toEqual({
      family: 'opus',
      major: 5,
      minor: 0,
      id: 'claude-opus-5',
    });
  });

  it('reads the roles as data and compares each with its own line', () => {
    const roles = modelRoles(versions);
    expect(roles.map((r) => [r.role, r.family, r.current, r.previous, r.triggers])).toEqual([
      ['deep work', 'fable', 'claude-fable-5-2', 'claude-fable-5-1', ['trig_01A', 'trig_01B']],
      ['build fallback', 'opus', 'claude-opus-5-5', 'claude-opus-5', ['trig_01C']],
      ['read and summarise', 'sonnet', 'claude-sonnet-5', 'claude-sonnet-4-6', ['trig_01D']],
    ]);
    expect(pinnedModels(versions)).toEqual([
      'claude-fable-5-2',
      'claude-opus-5-5',
      'claude-sonnet-5',
    ]);
    expect(newerModels(['claude-opus-5'], newestPerFamily(page))).toEqual([
      { pinned: 'claude-opus-5', newer: 'claude-opus-5-5' },
    ]);
    expect(modelFindings(roles, newestPerFamily(page))).toEqual([
      {
        role: 'deep work',
        from: 'claude-fable-5-2',
        to: 'claude-fable-5-3',
        triggers: ['trig_01A', 'trig_01B'],
      },
      {
        role: 'read and summarise',
        from: 'claude-sonnet-5',
        to: 'claude-sonnet-5-5',
        triggers: ['trig_01D'],
      },
    ]);
  });

  it('raises a line nobody reviewed as a queue item, once, and never as a switch', () => {
    const roles = modelRoles(versions);
    expect(reviewedLines(versions)).toEqual(['haiku', 'mythos']);
    const fresh = unreviewedLines(newestPerFamily(page), roles, reviewedLines(versions));
    expect(fresh.map((v) => v.id)).toEqual(['claude-saga-1']);
    const queue = {
      venture: 'foundry',
      status: 'open',
      needs_research: false,
      updated: '2026-11-01',
      items: [],
    };
    const filed = fileLineReviews(queue, fresh, '2026-11-13');
    expect(filed.items.map((i) => [i.id, i.status])).toEqual([['model-line-saga', 'todo']]);
    expect(filed.updated).toBe('2026-11-13');
    expect(fileLineReviews(filed, fresh, '2026-11-14')).toBe(filed);
    expect(fileLineReviews(queue, [], '2026-11-13')).toBe(queue);
  });

  it('dry run: page → finding → probe → owner line → recorded switch, each written once', () => {
    const roles = modelRoles(versions);
    const found = modelFindings(roles, newestPerFamily(page));
    const day1 = fileModelFindings(alerts, '2026-12-01', found);
    expect(day1).toContain(
      '- 2026-12-01 handoff: models: deep work: claude-fable-5-2 → claude-fable-5-3 (docs/ops/VERSIONS.md "Model roles", 2 routines)',
    );
    // The next morning's check repeats nothing.
    expect(fileModelFindings(day1, '2026-12-02', found)).toBe(day1);
    expect(pendingFindings(day1, roles).map((f) => [f.role, f.to, f.probed])).toEqual([
      ['deep work', 'claude-fable-5-3', undefined],
      ['read and summarise', 'claude-sonnet-5-5', undefined],
    ]);

    const fable = found[0]!;
    const probed = markProbed(day1, '2026-12-01', fable, 'ok', 'last_served_model matched in 9 s');
    const owner = ownerSwitchLine('2026-12-01', fable);
    expect(owner).toBe(
      '- 2026-12-01 owner: New Claude model claude-fable-5-3 tested: at claude.ai/code/routines set it on the 2 routines still on claude-fable-5-2',
    );
    expect(owner.replace(/^- \S+ owner: /, '').length).toBeLessThanOrEqual(120);
    expect(probed.split('\n').filter((l) => l === owner)).toHaveLength(1);
    expect(pendingFindings(probed, roles)[0]?.probed).toBe('ok');

    // A failed probe closes its finding for good: that id is never proposed again.
    const failed = markProbed(probed, '2026-12-01', found[1]!, 'failed', 'status failed');
    expect(pendingFindings(failed, roles).map((f) => f.role)).toEqual(['deep work']);
    expect(fileModelFindings(failed, '2026-12-03', found)).toBe(failed);

    const recorded = recordSwitch(versions, '2026-12-02', 'deep work', 'claude-fable-5-3');
    expect(modelRoles(recorded)[0]).toMatchObject({
      current: 'claude-fable-5-3',
      previous: 'claude-fable-5-2',
    });
    expect(recorded).toMatch(
      /- 2026-12-02 — \*\*claude-fable-5-2 → claude-fable-5-3\*\* on the 2 /,
    );
    expect(recordSwitch(recorded, '2026-12-03', 'deep work', 'claude-fable-5-3')).toBe(recorded);
    const closed = closeFinding(failed, '2026-12-02', 'deep work', 'claude-fable-5-3');
    expect(pendingFindings(closed, roles)).toEqual([]);
    expect(closed.split('\n').filter((l) => /— Done 2026-12-02 \(build\)/.test(l))).toHaveLength(2);
    // With the table moved on, the page holds nothing newer for the role.
    expect(modelFindings(modelRoles(recorded), newestPerFamily(page)).map((f) => f.role)).toEqual([
      'read and summarise',
    ]);
    expect(() => closeFinding(closed, '2026-12-02', 'deep work', 'claude-fable-5-3')).toThrow();
  });

  it('files one Node runners queue item, and none when current or already filed', () => {
    expect(
      activeLtsMajor([
        { version: 'v25.1.0', lts: false },
        { version: 'v24.22.0', lts: 'Krypton' },
      ]),
    ).toBe(24);
    const queue = {
      venture: 'foundry',
      status: 'open',
      needs_research: false,
      updated: '2026-10-01',
      items: [],
    };
    const filed = fileNodeRunners(queue, [22], 24, '2026-10-16');
    expect(filed.items).toHaveLength(1);
    expect(filed.items[0]).toMatchObject({ id: 'node-24-runners', status: 'todo', score: 5 });
    expect(filed.items[0]?.title).toMatch(/from 22 to the active LTS 24/);
    expect(filed.updated).toBe('2026-10-16');
    // Current, unknown LTS, or the item exists in any status: the same queue object comes back.
    expect(fileNodeRunners(queue, [24], 24, '2026-10-16')).toBe(queue);
    expect(fileNodeRunners(queue, [22], undefined, '2026-10-16')).toBe(queue);
    expect(fileNodeRunners(filed, [22], 24, '2026-10-17')).toBe(filed);
    const done = { ...filed, items: filed.items.map((it) => ({ ...it, status: 'done' })) };
    expect(fileNodeRunners(done, [22], 24, '2026-11-01')).toBe(done);
  });
});
