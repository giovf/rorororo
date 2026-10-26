import { describe, expect, it } from 'vitest';
import { dryRunChat, dryRunTools, runAgent } from '../packages/landing/src/diligence-core.ts';
import { modelFromEnv, parseCli, transcript } from './meta-diligence-agent.ts';

describe('meta-diligence-agent cli', () => {
  it('parses the flags and joins the company words', () => {
    expect(
      parseCli(['--dry-run', 'Acme', 'Widgets', '--out', 'r.md', '--transcript', 'w.md']),
    ).toEqual({ company: 'Acme Widgets', dryRun: true, out: 'r.md', transcript: 'w.md' });
  });

  it('picks Meta Model API with Muse Spark by default and a partner endpoint by env', () => {
    expect(modelFromEnv({})).toEqual({ error: expect.stringMatching(/no model key/) as string });
    const meta = modelFromEnv({ META_MODEL_API_KEY: 'LLM_1_x' });
    expect(meta).toEqual({
      provider: 'Meta Model API',
      config: {
        baseUrl: 'https://api.meta.ai/v1',
        model: 'muse-spark-1.3',
        apiKey: 'LLM_1_x',
        reasoningEffort: 'low',
      },
    });
    expect(
      modelFromEnv({
        DILIGENCE_API_KEY: 'k',
        DILIGENCE_BASE_URL: 'https://api.fireworks.ai/inference/v1',
      }),
    ).toEqual({ error: expect.stringMatching(/DILIGENCE_MODEL is required/) as string });
    const partner = modelFromEnv({
      DILIGENCE_API_KEY: 'k',
      DILIGENCE_BASE_URL: 'https://api.fireworks.ai/inference/v1',
      DILIGENCE_MODEL: 'accounts/fireworks/models/muse-spark-open',
    });
    expect(partner).toEqual({
      provider: 'api.fireworks.ai',
      config: {
        baseUrl: 'https://api.fireworks.ai/inference/v1',
        model: 'accounts/fireworks/models/muse-spark-open',
        apiKey: 'k',
      },
    });
  });

  it('writes the walkthrough transcript from a dry run', async () => {
    const company = 'Acme Widgets Ltd';
    const result = await runAgent({ company, chat: dryRunChat(company), ...dryRunTools() });
    const text = transcript(company, 'dry run', 'scripted', result, true);
    expect(text).toContain('scripts/meta-diligence-agent.ts --dry-run "Acme Widgets Ltd"');
    expect(text).toContain('→ query_uk_companies "Acme Widgets Ltd" → 1 match');
    expect(text).toContain('model calls 2/40, tokens 2040/300000 (dry run)');
    expect(text).toContain('# Due diligence: Acme Widgets Ltd');
  });
});
