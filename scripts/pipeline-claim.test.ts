import { describe, expect, it } from 'vitest';
import {
  claimItem,
  claimMarkerRoutine,
  claimMinute,
  claimResearch,
  claimResearchSubject,
  claimSubject,
  parseTarget,
  parseVenture,
  researchLanded,
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

describe('claimResearch', () => {
  // The queue shape a research commit leaves: research fields, then weight, then items.
  const rq = (extra: Record<string, unknown>): string =>
    `${JSON.stringify(
      {
        venture: 'tax-workbook',
        status: 'open',
        needs_research: false,
        updated: '2026-11-01',
        researched: '2026-10-20',
        ...extra,
        weight: 2,
        items: [todo],
      },
      null,
      2,
    )}\n`;
  const at = new Date('2026-11-03T17:01:40Z');

  it('stamps the minute and the routine after the research fields, before weight and items', () => {
    const { text, since } = claimResearch(rq({}), 'burn-down', at);
    expect(since).toBe('2026-11-03T17:01Z');
    const parsed = JSON.parse(text) as Record<string, unknown>;
    expect(Object.keys(parsed)).toEqual([
      'venture',
      'status',
      'needs_research',
      'updated',
      'researched',
      'researching_since',
      'researching_by',
      'weight',
      'items',
    ]);
    expect(parsed).toMatchObject({
      researching_since: '2026-11-03T17:01Z',
      researching_by: 'burn-down',
    });
    expect(text).toBe(`${JSON.stringify(parsed, null, 2)}\n`);
    expect(claimMinute(new Date('2026-11-03T23:59:59.900Z'))).toBe('2026-11-03T23:59Z');
  });

  it('refuses another session’s claim under 2 h old and takes over an older one', () => {
    const live = rq({ researching_since: '2026-11-03T17:01Z', researching_by: 'build' });
    expect(() => claimResearch(live, 'burn-down', new Date('2026-11-03T17:03:00Z'))).toThrow(
      'being researched since 2026-11-03T17:01Z by build',
    );
    expect(() => claimResearch(live, 'burn-down', new Date('2026-11-03T18:59:00Z'))).toThrow(
      'another session',
    );
    const { text } = claimResearch(live, 'burn-down', new Date('2026-11-03T19:02:00Z'));
    expect(JSON.parse(text)).toMatchObject({
      researching_since: '2026-11-03T19:02Z',
      researching_by: 'burn-down',
    });
  });

  it('refuses a queue that is cooling anyway or finished — research is not due', () => {
    expect(() => claimResearch(rq({ researched: '2026-11-02' }), 'build', at)).toThrow(
      'cooling, research is not due',
    );
    expect(() => claimResearch(rq({ research_after: '2026-12-03' }), 'build', at)).toThrow(
      'waits until 2026-12-03',
    );
    expect(claimResearch(rq({ research_after: '2026-11-03' }), 'build', at).since).toBe(
      '2026-11-03T17:01Z',
    );
    expect(() => claimResearch(rq({ status: 'finished' }), 'build', at)).toThrow('is finished');
  });

  it('names the venture in the subject and the watchdog reads the routine off it', () => {
    expect(claimResearchSubject('tax-workbook', 'build')).toBe(
      'pipeline: claim-research tax-workbook (build)',
    );
    expect(claimMarkerRoutine('pipeline: claim-research tax-workbook (build)')).toBe('build');
    expect(claimMarkerRoutine('pipeline: claim-research tax-workbook')).toBeUndefined();
    expect(parseVenture('tax-workbook', 'claim-research')).toBe('tax-workbook');
    for (const bad of [undefined, '', 'tax-workbook/x', 'Tax', '../x']) {
      expect(() => parseVenture(bad, 'claim-research')).toThrow(
        'usage: npm run pipeline claim-research',
      );
    }
  });
});

describe('researchLanded', () => {
  it('finds a research commit for the venture among the subjects and ignores claims and builds', () => {
    const subjects = [
      'pipeline: claim-research tax-workbook (build)',
      'tax-workbook: product-page-structured-data-faq — Product, Offers and FAQ markup (burn-down)',
      'pipeline: claim tax-workbook/x (burn-down)',
      'tax-workbook: research — three distribution items, kdp-listing-live unblocked (burn-down)',
    ].join('\n');
    expect(researchLanded(subjects, 'tax-workbook')).toBe(
      'tax-workbook: research — three distribution items, kdp-listing-live unblocked (burn-down)',
    );
    expect(researchLanded(subjects, 'gankdat')).toBeUndefined();
    expect(
      researchLanded('gankdat: research pass — facet NOMEM regression (burn-down)', 'gankdat'),
    ).toMatch(/^gankdat/);
    expect(
      researchLanded(
        'new-ventures: Exchange pre-research — KDP paperback (burn-down)',
        'new-ventures',
      ),
    ).toMatch(/^new-ventures/);
    expect(researchLanded('new-ventures: exchange pre-research — x', 'new-ventures')).toBeDefined();
    expect(researchLanded('tax-workbook: researcher page', 'tax-workbook')).toBeUndefined();
    expect(researchLanded('', 'tax-workbook')).toBeUndefined();
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
