import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { epubFiles } from './epubcheck.ts';

describe('epubFiles', () => {
  it('lists every ventures/*/release/*.epub, sorted, when no file is given', () => {
    const root = mkdtempSync(path.join(tmpdir(), 'epubcheck-'));
    for (const [slug, names] of [
      ['zeta', ['b.epub', 'a.EPUB', 'notes.md']],
      ['alpha', ['guide.epub']],
      ['no-release', []],
    ] as const) {
      mkdirSync(path.join(root, 'ventures', slug), { recursive: true });
      if (names.length === 0) continue;
      mkdirSync(path.join(root, 'ventures', slug, 'release'));
      for (const n of names) writeFileSync(path.join(root, 'ventures', slug, 'release', n), '');
    }
    expect(epubFiles(root, [])).toEqual([
      'ventures/alpha/release/guide.epub',
      'ventures/zeta/release/a.EPUB',
      'ventures/zeta/release/b.epub',
    ]);
  });

  it('takes the given files as they are, and an empty list when the repo has no ventures', () => {
    expect(epubFiles('/nowhere', ['x.epub'])).toEqual(['x.epub']);
    expect(epubFiles('/nowhere', [])).toEqual([]);
  });
});
