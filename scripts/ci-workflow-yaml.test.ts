import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  checkWorkflowFiles,
  checkWorkflowText,
  formatProblems,
  workflowFiles,
} from './ci-workflow-yaml.ts';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const good = `name: license worker
on:
  push:
    branches: [main]
  workflow_dispatch:
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - name: "Build (tsc -b; the Worker's main is dist/index.js)"
        run: npm run build
`;

describe('checkWorkflowText', () => {
  it('accepts a workflow GitHub accepts', () => {
    expect(checkWorkflowText(good, 'docs/ci/ok.yml')).toEqual([]);
  });
  it('refuses the 2026-10-29 18:27 license-worker.yml: a step name with an unquoted colon', () => {
    const bad = good.replace(
      `      - name: "Build (tsc -b; the Worker's main is dist/index.js)"`,
      `      - name: Load the download products' files into the LICENSES namespace (private: served only by /v1/downloads/<token>)`,
    );
    const problems = checkWorkflowText(bad, 'docs/ci/license-worker.yml');
    expect(problems).toHaveLength(1);
    expect(problems[0]!.file).toBe('docs/ci/license-worker.yml');
    expect(problems[0]!.message).toMatch(/BLOCK_AS_IMPLICIT_KEY.*line 11/);
    expect(formatProblems(problems)).toContain(
      '  docs/ci/license-worker.yml: BLOCK_AS_IMPLICIT_KEY',
    );
  });
  it('names a duplicated key and a tab', () => {
    expect(checkWorkflowText(`${good}name: twice\n`, 'f')[0]!.message).toMatch(/DUPLICATE_KEY/);
    expect(checkWorkflowText(good.replace('    steps:', '\tsteps:'), 'f')[0]!.message).toMatch(
      /TAB_AS_INDENT|BAD_INDENT|MULTILINE_IMPLICIT_KEY/,
    );
  });
  it('checks the shape GitHub needs: on, jobs, runs-on or uses, steps with run or uses', () => {
    const messages = (text: string): string[] => checkWorkflowText(text, 'f').map((p) => p.message);
    expect(messages('name: x\njobs: {}\n')).toEqual(['no `on` trigger', 'no `jobs` mapping']);
    expect(messages('on: push\njobs:\n  a:\n    steps:\n      - run: echo\n')).toEqual([
      'job a has no runs-on (nor uses)',
    ]);
    expect(messages('on: push\njobs:\n  a:\n    runs-on: ubuntu-latest\n')).toEqual([
      'job a has no steps',
    ]);
    expect(
      messages('on: push\njobs:\n  a:\n    runs-on: ubuntu-latest\n    steps:\n      - name: x\n'),
    ).toEqual(['job a step 1 has neither run nor uses']);
    expect(
      messages(
        'on: push\njobs:\n  a:\n    runs-on: ubuntu-latest\n    steps:\n      - name: [x]\n        run: echo\n',
      ),
    ).toEqual(['job a step 1: name is not a string']);
    // a reusable-workflow job needs neither runs-on nor steps
    expect(messages('on: push\njobs:\n  a:\n    uses: ./.github/workflows/x.yml\n')).toEqual([]);
    expect(messages('- a\n- b\n')).toEqual(['the file is not a mapping']);
  });
});

describe('workflowFiles / checkWorkflowFiles', () => {
  it('lists docs/ci and .github/workflows yml files and reports their problems', () => {
    const root = mkdtempSync(path.join(tmpdir(), 'ci-yaml-'));
    try {
      mkdirSync(path.join(root, 'docs', 'ci'), { recursive: true });
      mkdirSync(path.join(root, '.github', 'workflows'), { recursive: true });
      writeFileSync(path.join(root, 'docs', 'ci', 'README.md'), '# not a workflow\n');
      writeFileSync(path.join(root, 'docs', 'ci', 'new.yml'), good);
      writeFileSync(path.join(root, '.github', 'workflows', 'old.yaml'), 'on: push\njobs: {}\n');
      expect(workflowFiles(root)).toEqual(['.github/workflows/old.yaml', 'docs/ci/new.yml']);
      const { files, problems } = checkWorkflowFiles(root);
      expect(files).toHaveLength(2);
      expect(problems).toEqual([
        { file: '.github/workflows/old.yaml', message: 'no `jobs` mapping' },
      ]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
  it('finds no problem in this repository', () => {
    const { files, problems } = checkWorkflowFiles(repoRoot);
    expect(files.length).toBeGreaterThan(10);
    expect(formatProblems(problems)).toBe('');
  });
});
