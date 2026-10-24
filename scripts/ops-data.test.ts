import { describe, expect, it } from 'vitest';
import { groupOf, parseMetrics, parseNotes, queueView } from './ops-data.ts';
import { parseQueue } from '@foundry/core';

describe('ops-data', () => {
  it('groups channels into the dashboard categories', () => {
    expect(groupOf('api-marketplace')).toBe('Data API');
    expect(groupOf('chrome-web-store')).toBe('Browser extensions');
    expect(groupOf('figma-community')).toBe('Figma plugins');
    expect(groupOf('hackathon')).toBe('Prize entries');
    expect(groupOf('bounty-board')).toBe('Bounties');
    expect(groupOf('etsy')).toBe('Digital downloads');
    expect(groupOf('vscode-marketplace')).toBe('Other');
  });
  it('reads the metrics table rows', () => {
    const md =
      '# X\n\n## 7. Metrics\n\n| Date | Event | Users | Rating | Sales | Notes |\n| --- | --- | --- | --- | --- | --- |\n| 2026-10-01 | Daily check | 3 | — | 0 | fine |\n| 2026-10-02 | Daily check | 4 | — | 1 | sold |\n';
    const rows = parseMetrics(md);
    expect(rows).toHaveLength(2);
    expect(rows[1]).toEqual({
      date: '2026-10-02',
      event: 'Daily check',
      users: '4',
      rating: '—',
      sales: '1',
      notes: 'sold',
    });
    expect(parseMetrics('no table')).toEqual([]);
  });
  it('pairs owner notes with their answers, newest first', () => {
    const md =
      '# Owner notes\n\n- 2026-10-01 10:00 | first idea\n  continued\n  - Claude: noted,\n    queued as x.\n- 2026-10-02 11:00 | [dashboard idea] second\n\n<!-- offset:1 -->\n';
    const notes = parseNotes(md);
    expect(notes).toHaveLength(2);
    expect(notes[0]).toEqual({
      when: '2026-10-02 11:00',
      text: '[dashboard idea] second',
      answer: '',
    });
    expect(notes[1]).toEqual({
      when: '2026-10-01 10:00',
      text: 'first idea continued',
      answer: 'noted, queued as x.',
    });
  });
  it('summarises a queue for the pipeline view', () => {
    const q = parseQueue(
      JSON.stringify({
        venture: 'v',
        status: 'open',
        needs_research: false,
        updated: '2026-10-10',
        weight: 2,
        items: [
          {
            id: 'a',
            title: 'A',
            why: 'w',
            effort_days: 1,
            proof: 'p',
            score: 5,
            status: 'todo',
            added: '2026-10-01',
          },
          {
            id: 'b',
            title: 'B',
            why: 'w',
            effort_days: 1,
            proof: 'p',
            score: 9,
            status: 'todo',
            added: '2026-10-01',
            not_before: '2026-12-01',
          },
          {
            id: 'c',
            title: 'C',
            why: 'w',
            effort_days: 1,
            proof: 'p',
            score: 7,
            status: 'done',
            added: '2026-10-01',
            done_at: '2026-10-15',
          },
          {
            id: 'd',
            title: 'D',
            why: 'w',
            effort_days: 1,
            proof: 'p',
            score: 7,
            status: 'blocked',
            added: '2026-10-01',
            blocked_on: 'owner',
          },
        ],
      }),
    );
    const v = queueView(q, '2026-10-16') as {
      next: { id: string };
      scheduled: unknown[];
      done_recent: unknown[];
      counts: { blocked: number };
      weight: number;
    };
    expect(v.next.id).toBe('a');
    expect(v.scheduled).toHaveLength(1);
    expect(v.done_recent).toHaveLength(1);
    expect(v.counts.blocked).toBe(1);
    expect(v.weight).toBe(2);
  });
});
