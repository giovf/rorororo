// `npm run pipeline next|empty|status` must run on plain Node before `npm ci` (2026-10-12, foundry
// claim-before-install): the slot claims its item in the first minute, not after a 5–7 min install.
// These guard the two facts that make it so: the script imports the pipeline code from source, and
// that source stays free of imports (anything it pulled in would have to exist before the install).
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = path.resolve(import.meta.dirname, '..');
const read = (p: string): string => readFileSync(path.join(root, p), 'utf8');

describe('pipeline runs before npm ci', () => {
  it('scripts/pipeline.ts imports the pipeline code from packages/core/src, never the dist', () => {
    const script = read('scripts/pipeline.ts');
    expect(script).toContain("'../packages/core/src/pipeline.ts'");
    expect(script).not.toMatch(/from '@foundry\/core'|import\('@foundry\/core'\)/);
  });

  it('packages/core/src/pipeline.ts has no imports of its own', () => {
    const lines = read('packages/core/src/pipeline.ts').split('\n');
    expect(lines.filter((l) => /^\s*import\b/.test(l))).toEqual([]);
  });

  it('the helper scripts the gate runs before the install stay import-free too', () => {
    for (const p of ['scripts/pipeline-cold.ts', 'scripts/pipeline-claim.ts']) {
      const imports = read(p)
        .split('\n')
        .filter((l) => /^\s*import\b/.test(l))
        .filter((l) => !/from 'node:/.test(l));
      expect(imports, p).toEqual([]);
    }
  });
});
