import { readFileSync } from 'node:fs';
import path from 'node:path';
import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';
import { BOOK, chapters, NEEDS_LINE, OWNER_PROCESS_LINE, OWNER_PROCESS_PLACEHOLDER, plainText, wordCount } from './content.ts';
import { COVER_H, COVER_W, coverSvg, renderCoverPng } from './cover.ts';
import { buildEpub, epubFiles } from './epub.ts';
import { interiorHtml } from './pdf.ts';

/** A small well-formedness check: balanced tags, no stray `&`, no unescaped `<` in text. */
function assertWellFormed(xml: string, name: string): void {
  const body = xml.replace(/<\?xml[^>]*\?>/, '').replace(/<!DOCTYPE[^>]*>/, '');
  const stack: string[] = [];
  const tag = /<(\/?)([A-Za-z][\w:-]*)([^<>]*?)(\/?)>/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = tag.exec(body)) !== null) {
    const text = body.slice(last, m.index);
    expect(text, `${name}: stray < or & in text near "${text.slice(-40)}"`).not.toMatch(/<|&(?!(amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/);
    last = m.index + m[0].length;
    const [, close, tagName, , selfClose] = m;
    if (close) {
      expect(stack.pop(), `${name}: closing </${tagName}>`).toBe(tagName);
    } else if (!selfClose) {
      stack.push(tagName ?? '');
    }
  }
  expect(stack, `${name}: unclosed tags`).toEqual([]);
}

const here = path.dirname(new URL(import.meta.url).pathname);

describe('the handbook text (claude-code-kit kit-handbook-manuscript)', () => {
  const chs = chapters();
  const all = chs.map((ch) => plainText(ch.body)).join(' ');

  it('is 20–30k words over a preface, 15 chapters and an appendix, every section well-formed', () => {
    expect(chs.map((ch) => ch.id)[0]).toBe('preface');
    expect(chs.filter((ch) => !ch.frontMatter && !ch.backMatter)).toHaveLength(15);
    expect(chs.at(-1)?.backMatter).toBe(true);
    const words = wordCount();
    expect(words).toBeGreaterThanOrEqual(20_000);
    expect(words).toBeLessThanOrEqual(30_000);
    expect(new Set(chs.map((ch) => ch.id)).size).toBe(chs.length);
    for (const ch of chs) {
      assertWellFormed(`<div>${ch.body}</div>`, ch.id);
      expect(plainText(ch.body).length, ch.id).toBeGreaterThan(1_500);
    }
  });

  it("carries the disclosure preface 'How this book was written' with the real process and the owner's part, placeholder gone", () => {
    const preface = chs.find((ch) => ch.id === 'preface');
    expect(preface?.frontMatter).toBe(true);
    expect(preface?.title).toMatch(/how this book was written/i);
    const text = plainText(preface?.body ?? '');
    expect(text).toContain('drafted by the operation it describes');
    expect(text).toContain('from that business’s own repository');
    // the owner's part is the publication rule action 038 makes binding (listing-pack item, 2026-11-05): the placeholder
    // the manuscript carried must be gone from every chapter, and the rule stated once, in the preface
    expect(text).toContain(OWNER_PROCESS_LINE);
    expect(OWNER_PROCESS_LINE).toMatch(/only after reading it/);
    expect(all).not.toContain(OWNER_PROCESS_PLACEHOLDER);
    expect(all).not.toContain('[What the owner did');
  });

  it('states what the reader still needs: a Claude subscription, a terminal and judgement', () => {
    expect(NEEDS_LINE).toMatch(/Claude subscription/);
    expect(NEEDS_LINE).toMatch(/terminal/);
    expect(NEEDS_LINE).toMatch(/judgement/);
    expect(plainText(chs.find((ch) => ch.id === 'preface')?.body ?? '')).toContain(NEEDS_LINE);
  });

  it('is scrubbed: no secrets, no owner identity, no private third parties, no fake urgency', () => {
    const bodies = chs.map((ch) => ch.body).join('\n');
    // owner identity and the operation's mailboxes (CLAUDE.md "Facts you must not misread")
    expect(bodies).not.toMatch(/giov|1402celsius|@gankdat\.com|@example\.com|hotmail/i);
    expect(bodies).not.toMatch(/[\w.+-]+@[\w-]+\.[\w.-]+/); // no email address at all
    // secret shapes
    expect(bodies).not.toMatch(/sk_(live|test)_|whsec_|ghp_[A-Za-z0-9]|xox[abp]-|-----BEGIN|AKIA[0-9A-Z]{12}/);
    expect(bodies).not.toMatch(/trig_0[01][A-Za-z0-9]{20,}/); // trigger ids are the owner's account
    // rival authors on the shelf are not named (RESEARCH.md §2 lists them for the exchange only)
    expect(bodies).not.toMatch(/De Vos|yurukusa|Berton|Mukhin|Pelizzone|Bustos/);
    // honest copy: no get-rich-quick or urgency claims (Gumroad-spike rule, RESEARCH.md §5)
    expect(all).not.toMatch(/passive income|get rich|limited time|only \d+ left|act now/i);
    expect(all).toMatch(/£0 of revenue recorded/);
  });

  it('cites the operation’s own documents and dates its rules', () => {
    expect(all).toContain('CLAUDE.md');
    expect(all).toContain('docs/RUNS.md');
    expect(all).toContain('docs/pipeline/');
    expect((all.match(/2026-\d{2}-\d{2}/g) ?? []).length).toBeGreaterThan(80);
  });

  it('lists every chapter in MANUSCRIPT-REVIEW.md for the owner with claims to check', () => {
    const review = readFileSync(path.join(here, '..', 'MANUSCRIPT-REVIEW.md'), 'utf8');
    for (const ch of chs) expect(review, ch.id).toContain(ch.title);
    expect(review).toMatch(/check/i);
    expect(review).toContain(OWNER_PROCESS_LINE.slice(0, 60));
  });
});

describe('the EPUB and PDF builds', () => {
  it('packages a valid EPUB 3 structure: mimetype first and stored, container, package, nav, NCX, every chapter', async () => {
    const files = epubFiles('2026-11-05T00:00:00Z');
    for (const [p, body] of files) if (p.endsWith('.xhtml') || p.endsWith('.opf') || p.endsWith('.ncx') || p.endsWith('.xml')) assertWellFormed(body, p);
    const opf = files.get('OEBPS/package.opf') ?? '';
    expect(opf).toContain('<dc:title id="title">Running Claude Code Unattended</dc:title>');
    expect(opf).toContain(`<dc:identifier id="pub-id">${BOOK.identifier}</dc:identifier>`);
    for (const ch of chapters()) {
      expect(files.has(`OEBPS/${ch.id}.xhtml`), ch.id).toBe(true);
      expect(opf).toContain(`<itemref idref="${ch.id}"/>`);
    }
    const epub = await buildEpub(new Uint8Array([0xff, 0xd8, 0xff, 0xd9]), '2026-11-05T00:00:00Z');
    const zip = await JSZip.loadAsync(epub);
    const names = Object.keys(zip.files);
    expect(names[0]).toBe('mimetype');
    expect(await zip.file('mimetype')?.async('string')).toBe('application/epub+zip');
    // the first local file header must be stored (method 0): bytes 8–9 of the archive
    expect(epub[8]).toBe(0);
    expect(epub[9]).toBe(0);
    expect(names).toContain('OEBPS/cover.jpg');
  });

  it('renders a 1600 × 2400 cover from an SVG that names the book', () => {
    expect(coverSvg()).toContain('RUNNING');
    expect(coverSvg()).toContain('UNATTENDED');
    const png = renderCoverPng();
    expect(png.length).toBeGreaterThan(10_000);
    // PNG IHDR: width and height at bytes 16–23
    const width = (png[16]! << 24) | (png[17]! << 16) | (png[18]! << 8) | png[19]!;
    const height = (png[20]! << 24) | (png[21]! << 16) | (png[22]! << 8) | png[23]!;
    expect([width, height]).toEqual([COVER_W, COVER_H]);
  });

  it('prints every chapter on its own page in the PDF interior', () => {
    const html = interiorHtml();
    expect((html.match(/<section class="chapter/g) ?? []).length).toBe(chapters().length + 2);
    expect(html).toContain('<title>Running Claude Code Unattended</title>');
  });
});
