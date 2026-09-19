import { describe, locate } from './core/anchor.js';
import { tierForKey } from './core/license.js';
import { COLOURS, FREE_COLOURS, canAddOnSite, newId, siteOf, type Colour, type Highlight } from './core/model.js';
import { fromPosition, indexText, unwrap, wrapRange, type TextIndex } from './dom.js';
import { loadIndex, loadPage, savePage, sitesInIndex, upsertHighlight } from './pages-storage.js';
import { loadSettings } from './settings-storage.js';

declare global {
  interface Window {
    __highlightKeepLoaded?: boolean;
  }
}
if (window.__highlightKeepLoaded) throw new Error('Highlight Keep already loaded');
window.__highlightKeepLoaded = true;

let pro = false;
let index: TextIndex = indexText();
const rendered = new Map<string, Highlight>();

// ---------- render ----------
function paint(h: Highlight): boolean {
  const m = locate(index.text, h.anchor);
  if (!m) return false;
  try {
    wrapRange(index, m.start, m.end, `hk hk-${h.colour}${h.note ? ' hk-noted' : ''}`, h.id);
  } catch {
    return false;
  }
  rendered.set(h.id, h);
  return true;
}

async function restore(): Promise<void> {
  const page = await loadPage(location.href);
  index = indexText();
  let painted = 0;
  for (const h of page.highlights) if (!rendered.has(h.id) && paint(h)) painted++;
  if (painted < page.highlights.length) setTimeout(() => void restore(), 1500); // late-rendering pages
}

// ---------- toolbar ----------
const ui = document.createElement('div');
ui.className = 'hk-ui hk-toolbar';
ui.hidden = true;
document.documentElement.appendChild(ui);
let pendingRange: Range | null = null;
let editing: string | null = null;

function showToolbar(x: number, y: number, target: 'new' | Highlight): void {
  const colours = pro ? COLOURS : FREE_COLOURS;
  const isNew = target === 'new';
  ui.innerHTML =
    colours.map((c) => `<button class="hk-dot hk-${c}" data-colour="${c}" title="${c}"></button>`).join('') +
    (pro ? `<button class="hk-btn" data-act="note" title="Add a note">✎</button>` : '') +
    (isNew ? '' : `<button class="hk-btn" data-act="delete" title="Remove highlight">✕</button>`) +
    (pro || isNew ? '' : `<span class="hk-hint">Unlock for colours & notes</span>`);
  ui.style.left = `${Math.max(8, Math.min(window.innerWidth - 240, x))}px`;
  ui.style.top = `${Math.max(8, y - 44)}px`;
  ui.hidden = false;
  ui.querySelectorAll<HTMLButtonElement>('[data-colour]').forEach((b) => (b.onclick = () => void (isNew ? create(b.dataset['colour'] as Colour) : recolour(target, b.dataset['colour'] as Colour))));
  const del = ui.querySelector<HTMLButtonElement>('[data-act="delete"]');
  if (del && !isNew) del.onclick = () => void remove(target);
  const note = ui.querySelector<HTMLButtonElement>('[data-act="note"]');
  if (note) note.onclick = () => (isNew ? void create('yellow', true) : editNote(target));
}
const hide = (): void => {
  ui.hidden = true;
  pendingRange = null;
};

document.addEventListener('mouseup', (e) => {
  if ((e.target as Element).closest?.('.hk-ui')) return;
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed || sel.rangeCount === 0) return;
  const range = sel.getRangeAt(0);
  if (range.toString().trim().length < 2) return;
  pendingRange = range.cloneRange();
  showToolbar(e.clientX, e.clientY, 'new');
});
document.addEventListener('mousedown', (e) => {
  const target = e.target as Element;
  if (target.closest?.('.hk-ui')) return;
  const mark = target.closest?.<HTMLElement>('mark[data-hk]') ?? null;
  if (mark) {
    const h = rendered.get(mark.dataset['hk'] ?? '');
    if (h) {
      e.preventDefault();
      showToolbar(e.clientX, e.clientY, h);
      return;
    }
  }
  hide();
});

// ---------- actions ----------
async function create(colour: Colour, withNote = false): Promise<void> {
  if (!pendingRange) return;
  const range = pendingRange;
  index = indexText();
  const start = fromPosition(index, range.startContainer, range.startOffset);
  const end = fromPosition(index, range.endContainer, range.endOffset);
  if (start === null || end === null || end <= start) {
    hide();
    return;
  }
  const idx = await loadIndex();
  const site = siteOf(location.href);
  if (!canAddOnSite(sitesInIndex(idx), site, pro)) {
    ui.innerHTML = `<span class="hk-hint">Free plan: highlights on up to 3 sites. Unlock for unlimited.</span>`;
    return;
  }
  const h: Highlight = { id: newId(), anchor: describe(index.text, start, end), colour, createdAt: new Date().toISOString() };
  window.getSelection()?.removeAllRanges();
  hide();
  paint(h);
  const page = await loadPage(location.href);
  await savePage(upsertHighlight({ ...page, title: document.title }, h));
  if (withNote) editNote(h);
}

async function recolour(h: Highlight, colour: Colour): Promise<void> {
  const next = { ...h, colour };
  document.querySelectorAll<HTMLElement>(`mark[data-hk="${h.id}"]`).forEach((m) => (m.className = `hk hk-${colour}${next.note ? ' hk-noted' : ''}`));
  rendered.set(h.id, next);
  await savePage(upsertHighlight(await loadPage(location.href), next));
  hide();
}

async function remove(h: Highlight): Promise<void> {
  unwrap(h.id);
  rendered.delete(h.id);
  const page = await loadPage(location.href);
  await savePage({ ...page, highlights: page.highlights.filter((x) => x.id !== h.id) });
  hide();
}

function editNote(h: Highlight): void {
  editing = h.id;
  ui.innerHTML = `<textarea class="hk-note" placeholder="Note…" rows="3">${(h.note ?? '').replace(/</g, '&lt;')}</textarea><button class="hk-btn hk-save">Save</button>`;
  const ta = ui.querySelector<HTMLTextAreaElement>('textarea');
  ta?.focus();
  const save = ui.querySelector<HTMLButtonElement>('.hk-save');
  if (save)
    save.onclick = async () => {
      const note = ta?.value.trim() ?? '';
      const next: Highlight = { ...h, ...(note ? { note } : {}) };
      if (!note) delete next.note;
      document.querySelectorAll<HTMLElement>(`mark[data-hk="${h.id}"]`).forEach((m) => m.classList.toggle('hk-noted', Boolean(note)));
      rendered.set(h.id, next);
      await savePage(upsertHighlight(await loadPage(location.href), next));
      editing = null;
      hide();
    };
}

// ---------- boot ----------
void (async () => {
  pro = (await tierForKey((await loadSettings()).licenseKey)) === 'pro';
  await restore();
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes['highlightkeep']) void tierForKey((changes['highlightkeep'].newValue as { licenseKey?: string })?.licenseKey ?? '').then((t) => (pro = t === 'pro'));
    if (area === 'local' && !editing) {
      // another view (popup/library) changed this page's highlights → re-sync
      void loadPage(location.href).then((page) => {
        for (const id of [...rendered.keys()]) if (!page.highlights.some((h) => h.id === id)) {
          unwrap(id);
          rendered.delete(id);
        }
        for (const h of page.highlights) if (!rendered.has(h.id)) paint(h);
      });
    }
  });
})();
