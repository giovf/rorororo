import path from 'node:path';
import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';
import { chapters } from './content.ts';
import { assembleExtras, buildExtrasZip, fileMapPaths, MANIFEST, PLACEHOLDERS, readme, rewrite, ScrubError, scrubbed, scrubFindings } from './extras.ts';

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..', '..');

describe('the Extras zip (claude-code-kit kit-extras-zip)', () => {
  const assembled = assembleExtras(repoRoot);

  it('assembles every file of the manifest from the repository and passes the scrub', async () => {
    const files = await assembled;
    expect([...files.keys()]).toEqual(MANIFEST.map((e) => e.dest));
    for (const [p, body] of files) expect(body.length, p).toBeGreaterThan(100);
    expect(new Set(MANIFEST.map((e) => e.dest)).size).toBe(MANIFEST.length);
  });

  it('rewrites the owner, the repository, the domains, the trigger ids, the mailboxes and the ventures to placeholders', () => {
    const sample = [
      'Routine trig_011mbqaUzm3qTK2ZdevCuYpH on giovf/rorororo, mail info@gankdat.com or giova1506@hotmail.com,',
      'Co-Authored-By: Claude <noreply@anthropic.com>; https://apps.gankdat.com/ops and https://gankdat.com/data;',
      'npm run check -w @foundry/gankdat; ventures/tax-workbook, read-focus, highlight-keep, variables-toolkit, oss-bounties, claude-code-kit.',
    ].join('\n');
    const out = rewrite(sample);
    expect(out).toContain('trig_<id> on <owner>/<repo>, mail <owner-email> or <owner-email>,');
    expect(out).toContain('<noreply@anthropic.com>'); // a public convention, kept
    expect(out).toContain('https://apps.example.com/ops and https://example.com/data');
    expect(out).toContain('@foundry/data-api; ventures/workbook, extension-a, extension-b, figma-plugin, bounties, handbook.');
    expect(scrubFindings('sample', out)).toEqual([]);
    for (const slug of PLACEHOLDERS.keys()) expect(out).not.toContain(slug);
  });

  it('refuses a planted secret, email, trigger id, domain, handle or venture slug — and the zip is never built', async () => {
    const plants: [string, string][] = [
      ['a Stripe key', `STRIPE_KEY=${'sk_' + 'live_'}${'Q'.repeat(24)}`], // assembled so no key-shaped literal is committed
      ['a GitHub token', `token: ${'ghp' + '_'}${'a'.repeat(36)}`],
      ['an AWS access key id', 'AKIAIOSFODNN7EXAMPLE'],
      ['a private key', '-----BEGIN RSA PRIVATE KEY-----'],
      ['a Telegram bot token', `${'123456789'}:${'A'.repeat(35)}`],
      ['an email address', 'write to someone@somewhere.co.uk'],
      ['a trigger id', 'trig_01P9WT733fg3qnuJeKUHE8fx'],
      ['a domain of ours', 'https://api.gankdat.com/v1'],
      ["the owner's handle", 'github.com/giovf'],
      ['a venture slug', 'ventures/tax-workbook/src'],
    ];
    for (const [label, text] of plants) {
      const findings = scrubFindings('planted.md', `clean line\n${text}\n`);
      expect(findings.some((f) => f.startsWith('planted.md:2: ' + label)), label).toBe(true);
    }
    const files = new Map(await assembled);
    files.set('scripts/planted.ts', `const key = '${'sk_' + 'test_'}${'Z'.repeat(28)}';\n`);
    expect(() => scrubbed(files)).toThrow(ScrubError);
    expect(() => scrubbed(files)).toThrow(/scripts\/planted\.ts:1: a Stripe key/);
    // the public address and the placeholders are not findings
    expect(scrubFindings('ok', 'Co-Authored-By: Claude <noreply@anthropic.com>\ntrig_<id> <owner-email> example.com data-api')).toEqual([]);
  });

  it('builds reproducibly: two zips of the same tree are byte-identical and hold every file', async () => {
    const files = await assembled;
    const [a, b] = await Promise.all([buildExtrasZip(files), buildExtrasZip(files)]);
    expect(a.byteLength).toBeGreaterThan(50_000);
    expect(Buffer.from(a).equals(Buffer.from(b))).toBe(true);
    const zip = await JSZip.loadAsync(a);
    expect(Object.keys(zip.files).filter((n) => !zip.files[n]?.dir)).toEqual(MANIFEST.map((e) => e.dest));
    expect(await zip.file('LICENSE')?.async('string')).toContain('MIT License');
    expect(await zip.file('docs/routines/README.md')?.async('string')).toContain('trig_<id>');
    expect(await zip.file('CLAUDE.md')?.async('string')).toContain('@foundry/data-api');
  });

  it('writes a README that lists every file with what it is for', async () => {
    const files = await assembled;
    const text = files.get('README.md') ?? '';
    expect(text).toBe(readme());
    for (const entry of MANIFEST) expect(text, entry.dest).toContain(`| \`${entry.dest}\` | ${entry.note} |`);
    expect(text).toMatch(/adapt/i);
    expect(text).toContain('refuses to zip');
  });

  it("matches the book's appendix file map exactly (the appendix is re-checked here, not trusted)", () => {
    const appendix = chapters().find((ch) => ch.id === 'appendix');
    const pre = (appendix?.body.match(/File map of the Extras<\/h3>\s*<pre><code>([\s\S]*?)<\/code><\/pre>/)?.[1] ?? '').replace(/&amp;/g, '&');
    const listed = fileMapPaths(pre);
    expect(listed.length).toBeGreaterThan(30);
    expect(new Set(listed)).toEqual(new Set(MANIFEST.map((e) => e.dest)));
  });

  it('parses comma lists in the file map against the directory of their first entry', () => {
    expect(fileMapPaths('scripts/a.ts, b.ts   the queue\n\nworkflows/x.yml, y.yml\nLICENSE                 MIT')).toEqual([
      'scripts/a.ts',
      'scripts/b.ts',
      'workflows/x.yml',
      'workflows/y.yml',
      'LICENSE',
    ]);
  });
});
