import { describe, expect, it } from 'vitest';
import { banner, scan, shouldSkip } from './mirror-gankdat.ts';

describe('mirror-gankdat', () => {
  it('keeps the service and drops internal files, keys and build output', () => {
    for (const keep of [
      'src/index.ts',
      'test/paypal.spec.ts',
      'public/index.html',
      'wrangler.jsonc',
      'migrations/0001.sql',
      'apify/actors/x.json',
    ])
      expect(shouldSkip(keep)).toBe(false);
    for (const drop of [
      'docs/RUNBOOK.md',
      'CLAUDE.md',
      'RESEARCH.md',
      '.taskmaster/tasks/tasks.json',
      'design/a.png',
      'mcp-registry-key.pem',
      'x402-test-wallet.key',
      'dist/worker.js',
      'node_modules/x/y.js',
      'docs/report.pdf',
      '.dev.vars',
    ])
      expect(shouldSkip(drop)).toBe(true);
  });
  it('scans for live secrets but tolerates the test fixture', () => {
    const files = {
      'a.ts': "const s = 'whsec_testsecret';",
      'b.ts': 'key = "sk_live_abcdefghijkl"',
      'c.md': 'nothing',
    };
    expect(scan((rel) => files[rel as keyof typeof files], Object.keys(files))).toEqual([
      'b.ts: /sk_live_[A-Za-z0-9]{8,}/',
    ]);
  });
  it('names the upstream commit in the banner', () => {
    expect(banner('0123456789abcdef', '2026-10-16')).toMatch(/commit `0123456789ab`, 2026-10-16/);
  });
});
