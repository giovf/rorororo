/**
 * DOM ↔ text mapping for anchoring. `indexText` walks the readable text nodes of the page —
 * descending into open shadow roots, so text inside web components anchors like any other —
 * and produces the normalised page text plus a map from normalised offsets back to nodes.
 */
import { normalise } from './core/anchor.js';

const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT', 'SELECT', 'SVG', 'MATH', 'BUTTON']);

/** Mark styling for shadow roots, which a content script's CSS never reaches. Keep in step with content.css. */
const MARK_CSS = `mark.hk { background: #FDE047; color: inherit; padding: 0; border-radius: 2px; cursor: pointer; }
mark.hk-green { background: #86EFAC; } mark.hk-blue { background: #93C5FD; } mark.hk-pink { background: #F9A8D4; }
mark.hk-orange { background: #FDBA74; } mark.hk-purple { background: #C4B5FD; }
mark.hk-noted { box-shadow: 0 2px 0 0 #1F2937; }`;

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

/** Open shadow roots seen by the last walks: where marks may live besides the document. */
const shadowRoots = new Set<ShadowRoot>();
const styledRoots = new WeakSet<ShadowRoot>();

function skipElement(el: Element): boolean {
  return SKIP.has(el.tagName.toUpperCase()) || (el as HTMLElement).isContentEditable || el.classList.contains('hk-ui');
}

function* textNodes(node: Node): Generator<Text> {
  for (const child of node.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) yield child as Text;
    else if (child instanceof Element) {
      if (skipElement(child)) continue;
      if (child.shadowRoot) {
        shadowRoots.add(child.shadowRoot);
        yield* textNodes(child.shadowRoot);
      }
      yield* textNodes(child);
    }
  }
}

export function indexText(root: Node = document.body): TextIndex {
  const segments: Segment[] = [];
  let text = '';
  let lastWasSpace = true; // collapse leading whitespace of the whole document
  for (const node of textNodes(root)) {
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

/** A shadow root gets the mark styles once, the first time a mark lands in it. */
function styleShadowRoot(root: ShadowRoot): void {
  if (styledRoots.has(root)) return;
  styledRoots.add(root);
  try {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(MARK_CSS);
    root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet];
  } catch {
    const style = document.createElement('style');
    style.textContent = MARK_CSS;
    root.appendChild(style);
  }
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
    const root = seg.node.getRootNode();
    if (root instanceof ShadowRoot) styleShadowRoot(root);
    marks.push(mark);
  }
  return marks;
}

/** Every <mark> of a highlight, in the document and in the shadow roots the walks have seen. */
export function marksOf(id: string): HTMLElement[] {
  const selector = `mark[data-hk="${id}"]`;
  const out = [...document.querySelectorAll<HTMLElement>(selector)];
  for (const root of shadowRoots) out.push(...root.querySelectorAll<HTMLElement>(selector));
  return out;
}

export function unwrap(id: string): void {
  for (const mark of marksOf(id)) {
    const parent = mark.parentNode;
    if (!parent) continue;
    while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
    parent.removeChild(mark);
    parent.normalize();
  }
}
