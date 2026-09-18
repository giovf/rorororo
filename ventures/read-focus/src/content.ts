import { PRESET_STRENGTH, hasWords, segment } from './core/fixation.js';
import { tierForKey } from './core/license.js';
import { effectiveFor, type SiteSettings } from './core/settings.js';
import { applyTier, type Tier } from './core/tier.js';
import { loadSettings, onSettingsChange } from './storage.js';

// ---------- bolding ----------

const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT', 'SELECT', 'OPTION', 'CODE', 'PRE', 'KBD', 'SAMP', 'SVG', 'MATH', 'BUTTON']);
const wrapped: { wrapper: HTMLElement; original: Text }[] = [];
let mutating = false;
let observer: MutationObserver | null = null;

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
  let i = 0;
  const step = (deadline?: IdleDeadline): void => {
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

let ruler: HTMLDivElement | null = null;
const onMove = (e: MouseEvent): void => {
  if (ruler) ruler.style.top = `${e.clientY - ruler.offsetHeight / 2}px`;
};
function setRuler(on: boolean): void {
  if (on && !ruler) {
    ruler = document.createElement('div');
    ruler.className = 'rf-ruler';
    document.documentElement.appendChild(ruler);
    window.addEventListener('mousemove', onMove, { passive: true });
  } else if (!on && ruler) {
    ruler.remove();
    ruler = null;
    window.removeEventListener('mousemove', onMove);
  }
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
const onFocusMove = (e: MouseEvent): void => {
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
    window.addEventListener('mousemove', onFocusMove, { passive: true });
    window.addEventListener('scroll', onFocusScroll, { passive: true, capture: true });
  } else {
    window.removeEventListener('mousemove', onFocusMove);
    window.removeEventListener('scroll', onFocusScroll, { capture: true });
    focused?.classList.remove('rf-focus-target');
    focused = null;
  }
}

// ---------- fonts (pro) ----------

const FONT_FILES: Record<string, string> = { opendyslexic: 'OpenDyslexic-Regular.otf', atkinson: 'AtkinsonHyperlegible-Regular.ttf' };
function setFont(font: SiteSettings['font']): void {
  const html = document.documentElement;
  html.classList.remove('rf-font-opendyslexic', 'rf-font-atkinson', 'rf-font-system-sans');
  if (font === 'default') return;
  const file = FONT_FILES[font];
  if (file && !document.getElementById(`rf-font-${font}`)) {
    const style = document.createElement('style');
    style.id = `rf-font-${font}`;
    style.textContent = `@font-face{font-family:"ReadFocus ${font}";src:url("${chrome.runtime.getURL(`fonts/${file}`)}");font-display:swap}`;
    document.head.appendChild(style);
  }
  html.classList.add(`rf-font-${font}`);
}

// ---------- orchestration ----------

let current: SiteSettings | null = null;

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
  document.documentElement.style.setProperty('--rf-weight', String(next.enabled ? (next.weight ?? 700) : 700));
  setRuler(next.enabled && next.ruler);
  setFocus(next.enabled && next.focus);
  setFont(next.enabled ? next.font : 'default');
}

async function refresh(): Promise<void> {
  const settings = await loadSettings();
  const tier: Tier = await tierForKey(settings.licenseKey);
  apply(applyTier(effectiveFor(settings, location.hostname), tier));
}

void refresh();
onSettingsChange(() => void refresh());
