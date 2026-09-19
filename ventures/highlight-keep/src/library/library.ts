import { tierForKey } from '../core/license.js';
import { toMarkdown, type PageRecord } from '../core/model.js';
import { loadAllPages, replaceAll, savePage } from '../pages-storage.js';
import { loadSettings } from '../settings-storage.js';

const $ = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T;
let pages: PageRecord[] = [];

function matches(p: PageRecord, q: string): PageRecord | null {
  if (!q) return p;
  const needle = q.toLowerCase();
  if (p.title.toLowerCase().includes(needle) || p.url.toLowerCase().includes(needle)) return p;
  const hs = p.highlights.filter((h) => h.anchor.quote.toLowerCase().includes(needle) || (h.note ?? '').toLowerCase().includes(needle) || (h.tags ?? []).some((t) => t.toLowerCase().includes(needle)));
  return hs.length ? { ...p, highlights: hs } : null;
}

function render(): void {
  const q = $<HTMLInputElement>('q').value.trim();
  const shown = pages.map((p) => matches(p, q)).filter((p): p is PageRecord => p !== null).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  $('status').textContent = pages.length ? `${shown.length} of ${pages.length} pages · ${pages.reduce((n, p) => n + p.highlights.length, 0)} highlights` : 'Nothing saved yet — highlight some text on a page you have turned Highlight Keep on for.';
  $('pages').replaceChildren(
    ...shown.map((p) => {
      const a = document.createElement('article');
      const h2 = document.createElement('h2');
      const link = document.createElement('a');
      link.href = p.url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = p.title || p.url;
      h2.appendChild(link);
      const meta = document.createElement('p');
      meta.className = 'meta';
      meta.textContent = `${new URL(p.url).hostname} \u00b7 ${p.highlights.length} highlight${p.highlights.length === 1 ? '' : 's'} \u00b7 ${p.updatedAt.slice(0, 10)}`;
      a.append(h2, meta);
      for (const h of p.highlights) {
        const bq = document.createElement('blockquote');
        bq.className = h.colour;
        const del = document.createElement('button');
        del.className = 'del';
        del.title = 'Remove';
        del.textContent = '\u2715';
        del.dataset['page'] = p.url;
        del.dataset['id'] = h.id;
        bq.append(del, document.createTextNode(h.anchor.quote));
        if (h.note) {
          const n = document.createElement('span');
          n.className = 'note';
          n.textContent = h.note;
          bq.appendChild(n);
        }
        if (h.tags?.length) {
          const t = document.createElement('span');
          t.className = 'tags';
          t.textContent = h.tags.map((x) => '#' + x).join(' ');
          bq.appendChild(t);
        }
        a.appendChild(bq);
      }
      return a;
    }),
  );
  $('pages').querySelectorAll<HTMLButtonElement>('.del').forEach((b) => {
    b.onclick = async () => {
      const page = pages.find((p) => p.url === b.dataset['page']);
      if (!page) return;
      const next = { ...page, highlights: page.highlights.filter((h) => h.id !== b.dataset['id']) };
      await savePage(next);
      pages = await loadAllPages();
      render();
    };
  });
}

void (async () => {
  const tier = await tierForKey((await loadSettings()).licenseKey);
  if (tier !== 'pro') {
    const locked = document.createElement('p');
    locked.className = 'locked';
    locked.textContent =
      'The library is part of the unlock ($12, once). Your highlights are still saved \u2014 open the popup on any page to see that page\u2019s highlights and copy them as Markdown.';
    $('pages').replaceChildren(locked);
    ['q', 'export-all', 'backup'].forEach((id) => ($<HTMLInputElement>(id).disabled = true));
    return;
  }
  pages = await loadAllPages();
  render();
  $('q').oninput = render;
  $('export-all').onclick = () => {
    const md = pages.map(toMarkdown).join('\n---\n\n');
    void navigator.clipboard.writeText(md).then(() => ($('status').textContent = 'Markdown for all pages copied to the clipboard.'));
  };
  $('backup').onclick = () => {
    const blob = new Blob([JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), pages }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `highlight-keep-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };
  $<HTMLInputElement>('restore').onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text()) as { pages?: PageRecord[] };
      if (!Array.isArray(data.pages)) throw new Error('not a backup file');
      await replaceAll(data.pages);
      pages = await loadAllPages();
      render();
      $('status').textContent = `Restored ${pages.length} pages.`;
    } catch (err) {
      $('status').textContent = `Could not restore: ${err instanceof Error ? err.message : String(err)}`;
    }
  };
})();
