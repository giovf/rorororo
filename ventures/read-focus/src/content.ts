import { PRESET_STRENGTH, hasWords, segment } from './core/fixation.js';
import { tierForKey } from './core/license.js';
import { effectiveFor, type SiteSettings } from './core/settings.js';
import { locateSpan, sentenceSpans } from './core/speech.js';
import { applyTier, type Tier } from './core/tier.js';
import { loadSettings, onSettingsChange } from './storage.js';

// Injected both by the registered content script and by executeScript on first enable —
// never run twice in the same page.
declare global {
  interface Window {
    __readfocusLoaded?: boolean;
  }
}
if (window.__readfocusLoaded) throw new Error('ReadFocus already loaded');
window.__readfocusLoaded = true;

// ---------- bolding ----------

const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT', 'SELECT', 'OPTION', 'CODE', 'PRE', 'KBD', 'SAMP', 'SVG', 'MATH', 'BUTTON']);
const wrapped: { wrapper: HTMLElement; original: Text }[] = [];
let mutating = false;
let observer: MutationObserver | null = null;
/** Bumped on every remove; a chunked apply that outlives its generation stops. */
let boldGeneration = 0;

function skippable(node: Node): boolean {
  let el: Node | null = node.parentNode;
  while (el && el !== document.body) {
    if (el instanceof HTMLElement) {
      if (SKIP.has(el.tagName) || el.isContentEditable || el.classList.contains('rf-w') || el.classList.contains('rf-ruler')) return true;
    } else if (el.nodeType === Node.ELEMENT_NODE && SKIP.has((el as Element).tagName.toUpperCase())) return true;
    el = el.parentNode;
  }
  return false;
}

function boldNode(text: Text, strength: number): void {
  const value = text.nodeValue ?? '';
  if (!hasWords(value)) return;
  const wrapper = document.createElement('span');
  wrapper.className = 'rf-w';
  for (const seg of segment(value, strength)) {
    if (seg.bold) {
      const b = document.createElement('b');
      b.className = 'rf-b';
      b.textContent = seg.text;
      wrapper.appendChild(b);
    } else {
      wrapper.appendChild(document.createTextNode(seg.text));
    }
  }
  text.replaceWith(wrapper);
  wrapped.push({ wrapper, original: text });
}

function collect(root: Node, limit = 25_000): Text[] {
  const out: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (skippable(n) || !hasWords(n.nodeValue ?? '') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  });
  let n: Node | null;
  while ((n = walker.nextNode()) && out.length < limit) out.push(n as Text);
  return out;
}

function applyBold(root: Node, strength: number): void {
  const nodes = collect(root);
  const generation = boldGeneration;
  let i = 0;
  const step = (deadline?: IdleDeadline): void => {
    if (generation !== boldGeneration) return; // switched off (or re-applied) meanwhile
    mutating = true;
    const until = performance.now() + 12;
    while (i < nodes.length && (deadline ? deadline.timeRemaining() > 1 : performance.now() < until)) {
      const node = nodes[i++];
      if (node && node.isConnected) boldNode(node, strength);
    }
    mutating = false;
    if (i < nodes.length) schedule(step);
  };
  schedule(step);
}

function schedule(fn: (d?: IdleDeadline) => void): void {
  if ('requestIdleCallback' in window) window.requestIdleCallback(fn, { timeout: 200 });
  else setTimeout(() => fn(), 0);
}

function removeBold(): void {
  boldGeneration++;
  mutating = true;
  for (const { wrapper, original } of wrapped.splice(0)) {
    if (wrapper.isConnected) wrapper.replaceWith(original);
  }
  mutating = false;
}

function watch(strength: number): void {
  observer?.disconnect();
  observer = new MutationObserver((records) => {
    if (mutating) return;
    for (const r of records) for (const node of r.addedNodes) {
      if (node.nodeType === Node.ELEMENT_NODE && !(node as Element).classList.contains('rf-w')) applyBold(node, strength);
      else if (node.nodeType === Node.TEXT_NODE && !skippable(node)) boldNode(node as Text, strength);
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

// ---------- ruler ----------

// Pointer events cover the mouse and, on a phone (Firefox for Android), a tap: the ruler and the
// focus block follow the mouse on desktop and go where the finger lands on touch.
const POINTER_EVENTS = ['pointermove', 'pointerdown'] as const;
// The band's tint per colour; the inset hairline is the same colour, a little stronger.
const RULER_RGB: Record<SiteSettings['rulerColor'], string> = {
  yellow: '255, 214, 10',
  blue: '56, 150, 255',
  green: '40, 190, 110',
  pink: '255, 105, 180',
  grey: '120, 120, 120',
  white: '255, 255, 255',
};
let ruler: HTMLDivElement | null = null;
let rulerLocked = false;
const placeRuler = (y: number): void => {
  if (ruler) ruler.style.top = `${y - ruler.offsetHeight / 2}px`;
};
const onMove = (e: PointerEvent): void => {
  // Locked: the band stays put while the page scrolls under it; a click or tap moves it.
  if (rulerLocked && e.type !== 'pointerdown') return;
  placeRuler(e.clientY);
};
function styleRuler(s: SiteSettings): void {
  if (!ruler) return;
  const rgb = (RULER_RGB as Record<string, string>)[s.rulerColor] ?? RULER_RGB.yellow; // stored data may predate a colour
  const alpha = Math.min(0.6, Math.max(0.1, s.rulerOpacity || 0.2));
  ruler.style.setProperty('--rf-ruler-h', `${Math.min(80, Math.max(16, s.rulerHeight || 34))}px`);
  ruler.style.setProperty('--rf-ruler-bg', `rgba(${rgb}, ${alpha.toFixed(2)})`);
  ruler.style.setProperty('--rf-ruler-line', `rgba(${rgb}, ${Math.min(1, alpha * 2).toFixed(2)})`);
  rulerLocked = s.rulerLock;
  ruler.classList.toggle('rf-ruler-locked', rulerLocked);
}
function setRuler(on: boolean, s: SiteSettings): void {
  if (on && !ruler) {
    ruler = document.createElement('div');
    ruler.className = 'rf-ruler';
    document.documentElement.appendChild(ruler);
    for (const ev of POINTER_EVENTS) window.addEventListener(ev, onMove, { passive: true });
  } else if (!on && ruler) {
    ruler.remove();
    ruler = null;
    for (const ev of POINTER_EVENTS) window.removeEventListener(ev, onMove);
  }
  if (on) styleRuler(s);
}

// ---------- paragraph focus (pro) ----------

const BLOCKS = 'p, li, h1, h2, h3, h4, h5, h6, blockquote, dd, dt, td, th, figcaption, pre';
let focused: Element | null = null;
let pointer = { x: -1, y: -1 };
function focusAt(x: number, y: number): void {
  const target = document.elementFromPoint(x, y)?.closest(BLOCKS) ?? null;
  if (target === focused) return;
  focused?.classList.remove('rf-focus-target');
  focused = target;
  focused?.classList.add('rf-focus-target');
}
const onFocusMove = (e: PointerEvent): void => {
  pointer = { x: e.clientX, y: e.clientY };
  focusAt(pointer.x, pointer.y);
};
// While scrolling the pointer stays put but the page moves under it: re-evaluate.
const onFocusScroll = (): void => {
  if (pointer.x >= 0) requestAnimationFrame(() => focusAt(pointer.x, pointer.y));
};
function setFocus(on: boolean): void {
  document.documentElement.classList.toggle('rf-focus', on);
  if (on) {
    for (const ev of POINTER_EVENTS) window.addEventListener(ev, onFocusMove, { passive: true });
    window.addEventListener('scroll', onFocusScroll, { passive: true, capture: true });
  } else {
    for (const ev of POINTER_EVENTS) window.removeEventListener(ev, onFocusMove);
    window.removeEventListener('scroll', onFocusScroll, { capture: true });
    focused?.classList.remove('rf-focus-target');
    focused = null;
  }
}

// ---------- page tint (pro) ----------

// One fixed layer that multiplies into the page: white turns cream, text stays dark, nothing is
// repainted per element (a rival's per-element colour change "caused the screen to blink").
const TINT_RGBA: Record<string, string> = {
  cream: 'rgba(255, 244, 214, 0.55)',
  yellow: 'rgba(255, 236, 150, 0.4)',
  blue: 'rgba(170, 210, 255, 0.4)',
  green: 'rgba(190, 240, 200, 0.4)',
  pink: 'rgba(255, 205, 225, 0.4)',
  grey: 'rgba(200, 200, 200, 0.4)',
};
let tint: HTMLDivElement | null = null;
function setTint(choice: SiteSettings['tint']): void {
  const rgba = TINT_RGBA[choice];
  if (rgba && !tint) {
    tint = document.createElement('div');
    tint.className = 'rf-tint';
    document.documentElement.appendChild(tint);
  } else if (!rgba && tint) {
    tint.remove();
    tint = null;
  }
  if (tint && rgba) tint.style.setProperty('--rf-tint', rgba);
}

// ---------- read aloud (pro) ----------

// The browser's own voices (speechSynthesis — nothing leaves the browser), one utterance per
// sentence, and the sentence being read marked through the CSS Custom Highlight API: a Range,
// not a wrapper, so it lives alongside the bolding spans and is gone the moment reading stops.
interface Sentence {
  block: Element;
  range: Range;
  text: string;
}
const READ_HIGHLIGHT = 'rf-reading';
let reading: { sentences: Sentence[]; at: number; paused: boolean } | null = null;
/** Why the last reading stopped on its own (no voices on this machine), shown by the popup. */
let lastReason: 'no-voice' | undefined;
const synth: SpeechSynthesis | undefined = typeof speechSynthesis === 'undefined' ? undefined : speechSynthesis;

/** Text nodes that are not readable: code, inputs, editors, our own ruler/tint — bolding wrappers are fine. */
function unreadable(node: Node): boolean {
  let el: Element | null = node.parentElement;
  while (el && el !== document.body) {
    if (SKIP.has(el.tagName) || (el as HTMLElement).isContentEditable || el.classList.contains('rf-ruler') || el.classList.contains('rf-tint')) return true;
    el = el.parentElement;
  }
  return false;
}

/** The block's own text nodes (nested blocks excluded) and their concatenation. */
function ownText(block: Element): { nodes: Text[]; text: string } {
  const nodes: Text[] = [];
  const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => {
      const parent = n.parentElement;
      if (!parent || unreadable(n) || parent.closest(BLOCKS) !== block) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let n: Node | null;
  while ((n = walker.nextNode())) nodes.push(n as Text);
  return { nodes, text: nodes.map((t) => t.nodeValue ?? '').join('') };
}

function sentencesFrom(firstVisible: boolean): Sentence[] {
  const out: Sentence[] = [];
  let started = !firstVisible;
  for (const block of document.querySelectorAll(BLOCKS)) {
    if (!started) {
      if (block.getBoundingClientRect().bottom <= 0) continue;
      started = true;
    }
    const { nodes, text } = ownText(block);
    if (!hasWords(text)) continue;
    const lengths = nodes.map((t) => (t.nodeValue ?? '').length);
    for (const span of sentenceSpans(text)) {
      const at = locateSpan(lengths, span.start, span.end);
      const startNode = at && nodes[at.startIndex];
      const endNode = at && nodes[at.endIndex];
      if (!at || !startNode || !endNode) continue;
      const range = document.createRange();
      range.setStart(startNode, at.startOffset);
      range.setEnd(endNode, at.endOffset);
      out.push({ block, range, text: span.text });
    }
  }
  return out;
}

function markSentence(s: Sentence | undefined): void {
  if (!('highlights' in CSS)) return;
  if (!s) {
    CSS.highlights.delete(READ_HIGHLIGHT);
    return;
  }
  CSS.highlights.set(READ_HIGHLIGHT, new Highlight(s.range));
  const r = s.range.getBoundingClientRect();
  if (r.top < 0 || r.bottom > window.innerHeight) s.block.scrollIntoView({ block: 'center', behavior: 'smooth' });
}

function speakNext(): void {
  if (!reading || !synth) return;
  const s = reading.sentences[reading.at];
  if (!s) {
    stopReading();
    return;
  }
  markSentence(s);
  const u = new SpeechSynthesisUtterance(s.text);
  u.rate = Math.min(1.6, Math.max(0.7, current?.speechRate || 1));
  u.lang = document.documentElement.lang || navigator.language;
  const session = reading;
  u.onend = () => {
    if (reading !== session) return;
    reading.at++;
    speakNext();
  };
  u.onerror = (e) => {
    if (reading !== session) return;
    if (e.error !== 'interrupted' && e.error !== 'canceled') lastReason = 'no-voice';
    stopReading();
  };
  synth.speak(u);
}

function stopReading(): void {
  reading = null;
  synth?.cancel();
  markSentence(undefined);
}

export interface ReadState {
  ok: boolean;
  playing: boolean;
  paused: boolean;
  sentences: number;
  /** The sentence being read and whether its highlight is registered — what the e2e asserts on. */
  sentence: string;
  highlighted: boolean;
  reason?: 'pro' | 'no-voice' | 'nothing';
}
function readState(ok = true, reason?: ReadState['reason']): ReadState {
  const r: ReadState = {
    ok,
    playing: reading !== null,
    paused: reading?.paused ?? false,
    sentences: reading?.sentences.length ?? 0,
    sentence: reading?.sentences[reading.at]?.text ?? '',
    highlighted: 'highlights' in CSS && CSS.highlights.has(READ_HIGHLIGHT),
  };
  const why = reason ?? (reading ? undefined : lastReason);
  if (why) r.reason = why;
  return r;
}

/** Popup and shortcut entry point: toggle = play / pause / resume; stop clears everything. */
function readAloud(action: 'toggle' | 'stop' | 'state'): ReadState {
  if (action === 'state') return readState();
  if (action === 'stop') {
    stopReading();
    return readState();
  }
  if (tier !== 'pro') return readState(false, 'pro');
  if (!synth) return readState(false, 'no-voice');
  if (reading) {
    if (reading.paused) {
      reading.paused = false;
      synth.resume();
    } else {
      reading.paused = true;
      synth.pause();
    }
    return readState();
  }
  const sentences = sentencesFrom(true);
  if (sentences.length === 0) return readState(false, 'nothing');
  lastReason = undefined;
  reading = { sentences, at: 0, paused: false };
  speakNext();
  return readState();
}

chrome.runtime.onMessage.addListener((msg: { type?: string; action?: 'toggle' | 'stop' | 'state' }, _sender, respond: (r: ReadState) => void) => {
  if (msg.type !== 'read-aloud') return false;
  respond(readAloud(msg.action ?? 'toggle'));
  return false;
});

// ---------- fonts (pro) ----------

const FONT_FILES: Record<string, { regular: string; bold: string }> = {
  opendyslexic: { regular: 'OpenDyslexic-Regular.otf', bold: 'OpenDyslexic-Bold.otf' },
  atkinson: { regular: 'AtkinsonHyperlegible-Regular.ttf', bold: 'AtkinsonHyperlegible-Bold.ttf' },
};
function setFont(font: SiteSettings['font']): void {
  const html = document.documentElement;
  html.classList.remove('rf-font-opendyslexic', 'rf-font-atkinson', 'rf-font-system-sans');
  if (font === 'default') return;
  const files = FONT_FILES[font];
  if (files && !document.getElementById(`rf-font-${font}`)) {
    const style = document.createElement('style');
    style.id = `rf-font-${font}`;
    const face = (file: string, weight: number): string =>
      `@font-face{font-family:"ReadFocus ${font}";src:url("${chrome.runtime.getURL(`fonts/${file}`)}");font-weight:${weight};font-display:swap}`;
    style.textContent = face(files.regular, 400) + face(files.bold, 700);
    document.head.appendChild(style);
  }
  html.classList.add(`rf-font-${font}`);
}

// ---------- orchestration ----------

let current: SiteSettings | null = null;
let tier: Tier = 'free';

/** On the extension's PDF reader page settings are keyed by the PDF's own host (core/pdf.ts documentUrl). */
function readerHost(): string | undefined {
  if (!location.pathname.endsWith('/pdf.html') || !location.protocol.endsWith('-extension:')) return undefined;
  const file = new URL(location.href).searchParams.get('file');
  try {
    return file ? new URL(file).hostname : undefined;
  } catch {
    return undefined;
  }
}

function strengthOf(s: SiteSettings): number {
  return s.strength ?? PRESET_STRENGTH[s.preset];
}

function apply(next: SiteSettings): void {
  const prev = current;
  current = next;
  const boldOn = next.enabled && next.bold;
  const boldWas = prev !== null && prev.enabled && prev.bold;
  if (boldOn && (!boldWas || strengthOf(prev) !== strengthOf(next))) {
    removeBold();
    applyBold(document.body, strengthOf(next));
    watch(strengthOf(next));
  } else if (!boldOn && boldWas) {
    observer?.disconnect();
    removeBold();
  }
  // weight 700 → plain bold; up to 900 → + up to 0.8px stroke.
  const stroke = next.enabled ? Math.max(0, ((next.weight ?? 700) - 700) / 200) * 0.8 : 0;
  document.documentElement.style.setProperty('--rf-stroke', `${stroke.toFixed(2)}px`);
  const size = next.enabled ? Math.min(1.5, Math.max(1, next.size || 1)) : 1;
  document.documentElement.style.setProperty('--rf-size', String(size));
  document.documentElement.classList.toggle('rf-size', size !== 1);
  document.documentElement.classList.toggle('rf-spacing', next.enabled && next.spacing);
  setTint(next.enabled ? next.tint : 'none');
  if (!next.enabled && reading) stopReading();
  setRuler(next.enabled && next.ruler, next);
  setFocus(next.enabled && next.focus);
  setFont(next.enabled ? next.font : 'default');
}

async function refresh(): Promise<void> {
  const settings = await loadSettings();
  tier = await tierForKey(settings.licenseKey);
  apply(applyTier(effectiveFor(settings, readerHost() ?? location.hostname), tier));
}

void refresh();
onSettingsChange(() => void refresh());
