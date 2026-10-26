import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  checkWorkflows,
  entryPointsOf,
  expandEntry,
  formatViolations,
  hasExtension,
  relativeSpecifiers,
  walkEntry,
} from './node-entry-imports.ts';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('entryPointsOf', () => {
  it('reads the script after node and its flags, once per path', () => {
    const yml = `
      - run: node --disable-warning=ExperimentalWarning scripts/search-console.ts
      - run: node ventures/gankdat/scripts/metrics.mjs
      - run: node --disable-warning=ExperimentalWarning scripts/search-console.ts
      - run: node --disable-warning=ExperimentalWarning scripts/demo-\${{ inputs.entry }}.ts
      - run: npm ci && node_modules/.bin/vitest run
    `;
    expect(entryPointsOf(yml)).toEqual([
      'scripts/search-console.ts',
      'ventures/gankdat/scripts/metrics.mjs',
      'scripts/demo-${{ inputs.entry }}.ts',
    ]);
  });
});

describe('relativeSpecifiers and hasExtension', () => {
  it('finds static and dynamic relative imports and leaves bare ones alone', () => {
    const src = `
      import { a } from './a.ts';
      import b from '../lib/b';
      import { readFile } from 'node:fs/promises';
      import 'vitest';
      const { c } = await import('./c.mjs');
      const d = await import('../d');
    `;
    expect(relativeSpecifiers(src)).toEqual(['./a.ts', '../lib/b', './c.mjs', '../d']);
    expect(hasExtension('./a.ts')).toBe(true);
    expect(hasExtension('./c.mjs')).toBe(true);
    expect(hasExtension('../lib/b')).toBe(false);
    expect(hasExtension('../d')).toBe(false);
    expect(hasExtension('./data.json')).toBe(true);
  });
});

describe('walkEntry', () => {
  it('reports the extensionless import two hops from the entry and follows .js written for .ts', () => {
    const root = mkdtempSync(path.join(tmpdir(), 'node-entry-'));
    try {
      mkdirSync(path.join(root, 'scripts'));
      mkdirSync(path.join(root, 'src', 'lib'), { recursive: true });
      writeFileSync(
        path.join(root, 'scripts', 'metrics.mjs'),
        "import { x } from '../src/lib/rest.ts';\n",
      );
      writeFileSync(
        path.join(root, 'src', 'lib', 'rest.ts'),
        "import { ua } from './sales';\nimport { ok } from './ok.js';\nexport const x = ua + ok;\n",
      );
      writeFileSync(path.join(root, 'src', 'lib', 'sales.ts'), 'export const ua = 1;\n');
      writeFileSync(
        path.join(root, 'src', 'lib', 'ok.ts'),
        "import { deep } from './deep';\nexport const ok = deep;\n",
      );
      writeFileSync(path.join(root, 'src', 'lib', 'deep.ts'), 'export const deep = 2;\n');
      const found = walkEntry('scripts/metrics.mjs', root);
      expect(found).toEqual([
        { file: 'src/lib/rest.ts', specifier: './sales' },
        { file: 'src/lib/ok.ts', specifier: './deep' },
      ]);
      expect(formatViolations(found)).toBe(
        "src/lib/rest.ts: import './sales' has no extension (Node refuses it)\n" +
          "src/lib/ok.ts: import './deep' has no extension (Node refuses it)",
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('expands a workflow expression in the entry to the matching files', () => {
    const root = mkdtempSync(path.join(tmpdir(), 'node-entry-'));
    try {
      mkdirSync(path.join(root, 'scripts'));
      for (const f of ['demo-a.ts', 'demo-b.ts', 'demo-a.test.ts', 'other.ts'])
        writeFileSync(path.join(root, 'scripts', f), '');
      expect(expandEntry('scripts/demo-${{ inputs.entry }}.ts', root)).toEqual([
        'scripts/demo-a.ts',
        'scripts/demo-b.ts',
      ]);
      expect(expandEntry('scripts/other.ts', root)).toEqual(['scripts/other.ts']);
      expect(expandEntry('scripts/missing.ts', root)).toEqual([]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('checkWorkflows reads the workflows of a root and reports through its entries', () => {
    const root = mkdtempSync(path.join(tmpdir(), 'node-entry-'));
    try {
      mkdirSync(path.join(root, '.github', 'workflows'), { recursive: true });
      mkdirSync(path.join(root, 'scripts'));
      writeFileSync(
        path.join(root, '.github', 'workflows', 'job.yml'),
        'jobs:\n  j:\n    steps:\n      - run: node scripts/job.ts\n',
      );
      writeFileSync(path.join(root, 'scripts', 'job.ts'), "import { v } from './lib';\n");
      expect(checkWorkflows(root)).toEqual([{ file: 'scripts/job.ts', specifier: './lib' }]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe('this repository', () => {
  it('has no extensionless relative import reachable from a Node-run workflow entry point', () => {
    const violations = checkWorkflows(repoRoot);
    expect(formatViolations(violations)).toBe('');
  });
});
