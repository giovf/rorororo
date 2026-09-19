/**
 * DOM ↔ text mapping for anchoring. `indexText` walks the readable text nodes of the page
 * and produces the normalised page text plus a map from normalised offsets back to nodes.
 */
import { normalise } from './core/anchor.js';

const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT', 'SELECT', 'SVG', 'MATH', 'BUTTON']);

export interface Segment {
  node: Text;
  /** Normalised offsets covered by this node (end exclusive). */
  start: number;
  end: number;
  /** For each normalised char in the node, its raw offset in node.data. */
  rawOffsets: number[];
}

export interface TextIndex {
  text: string;
  segments: Segment[];
}

function skippable(node: Node): boolean {
  let el: Node | null = node.parentNode;
  while (el && el !== document.body) {
    if (el instanceof Element) {
      if (SKIP.has(el.tagName.toUpperCase()) || (el as HTMLElement).isContentEditable || el.classList.contains('hk-ui')) return true;
    }
    el = el.parentNode;
  }
  return false;
}

export function indexText(root: Node = document.body): TextIndex {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (skippable(n) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  });
  const segments: Segment[] = [];
  let text = '';
  let lastWasSpace = true; // collapse leading whitespace of the whole document
  let n: Node | null;
  while ((n = walker.nextNode())) {
    const node = n as Text;
    const raw = node.data;
    const rawOffsets: number[] = [];
    const start = text.length;
    for (let i = 0; i < raw.length; i++) {
      const ch = raw[i] ?? '';
      if (/\s/.test(ch)) {
        if (lastWasSpace) continue;
        text += ' ';
        rawOffsets.push(i);
        lastWasSpace = true;
      } else {
        text += ch;
        rawOffsets.push(i);
        lastWasSpace = false;
      }
    }
    if (text.length > start) segments.push({ node, start, end: text.length, rawOffsets });
  }
  return { text: normalise(text), segments };
}

/** Normalised offset → (text node, raw offset). Offsets past the end clamp to the last node. */
export function toPosition(index: TextIndex, offset: number): { node: Text; offset: number } | null {
  for (const seg of index.segments) {
    if (offset >= seg.start && offset < seg.end) return { node: seg.node, offset: seg.rawOffsets[offset - seg.start] ?? 0 };
    if (offset === seg.end) return { node: seg.node, offset: (seg.rawOffsets[seg.end - seg.start - 1] ?? -1) + 1 };
  }
  return null;
}

/** (text node, raw offset) → normalised offset, or null if the node isn't indexed. */
export function fromPosition(index: TextIndex, node: Node, rawOffset: number): number | null {
  let target: Text | null = null;
  let off = rawOffset;
  if (node.nodeType === Node.TEXT_NODE) target = node as Text;
  else {
    // element boundary: use the first text node at/after the child offset
    const child = node.childNodes[rawOffset] ?? node.childNodes[node.childNodes.length - 1] ?? null;
    const walker = document.createTreeWalker(child ?? node, NodeFilter.SHOW_TEXT);
    target = (walker.nextNode() as Text | null) ?? null;
    off = 0;
  }
  if (!target) return null;
  const seg = index.segments.find((s) => s.node === target);
  if (!seg) return null;
  let i = 0;
  while (i < seg.rawOffsets.length && (seg.rawOffsets[i] ?? 0) < off) i++;
  return seg.start + i;
}

/** Wraps [start, end) in <mark> elements, one per text node crossed. Returns the marks. */
export function wrapRange(index: TextIndex, start: number, end: number, cls: string, id: string): HTMLElement[] {
  const marks: HTMLElement[] = [];
  for (const seg of index.segments) {
    if (seg.end <= start || seg.start >= end) continue;
    const a = Math.max(start, seg.start) - seg.start;
    const b = Math.min(end, seg.end) - seg.start;
    const rawA = seg.rawOffsets[a] ?? 0;
    const rawB = (seg.rawOffsets[b - 1] ?? seg.node.data.length - 1) + 1;
    const range = document.createRange();
    range.setStart(seg.node, rawA);
    range.setEnd(seg.node, rawB);
    const mark = document.createElement('mark');
    mark.className = cls;
    mark.dataset['hk'] = id;
    range.surroundContents(mark);
    marks.push(mark);
  }
  return marks;
}

export function unwrap(id: string): void {
  for (const mark of document.querySelectorAll<HTMLElement>(`mark[data-hk="${id}"]`)) {
    const parent = mark.parentNode;
    if (!parent) continue;
    while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
    parent.removeChild(mark);
    parent.normalize();
  }
}
