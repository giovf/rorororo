import { describe, expect, it } from 'vitest';
import { MAX_SECONDS, plannedSeconds } from './demo-video.ts';
import {
  SHOTS,
  dryRunEvents,
  terminalLines,
  transcriptMarkdown,
} from './demo-meta-global-ai-hackathon.ts';

describe('demo-meta-global-ai-hackathon', () => {
  it('plans under the three-minute cap with seven numbered shots', () => {
    expect(SHOTS.map((s) => s.n)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(plannedSeconds(SHOTS)).toBeLessThanOrEqual(MAX_SECONDS);
  });

  it('tells the CLI story from the page events', () => {
    const events = dryRunEvents('Acme Widgets Ltd');
    const lines = terminalLines('Acme Widgets Ltd', events);
    expect(lines[0]).toContain('scripts/meta-diligence-agent.ts "Acme Widgets Ltd"');
    expect(lines).toContain('→ query_uk_sanctions "Acme Widgets Ltd" → 0 matches');
    expect(lines).toContain('model calls 3/40, tokens 6120/300000');
  });

  it('writes the transcript with the registers, the cost line and the report', () => {
    const text = transcriptMarkdown('Acme Widgets Ltd', dryRunEvents('Acme Widgets Ltd'), true);
    expect(text).toContain(
      '# Live walkthrough — muse-spark-1.3 on Meta Model API checks "Acme Widgets Ltd"',
    );
    expect(text).toContain('- query_uk_insolvency "Acme Widgets Ltd" → 1 match');
    expect(text).toContain('Model calls 3/40, tokens 6120/300000, 21.4 s.');
    expect(text).toContain('MEDIUM risk');
    expect(transcriptMarkdown('x', [{ type: 'error', message: 'model 429' }], false)).toContain(
      'No report: model 429',
    );
  });
});
