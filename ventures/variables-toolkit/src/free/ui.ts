import { TOOLKIT_URL, freeSummary } from '../core/free.js';
import type { FreeToMain, FreeToUi } from './messages.js';

const $ = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T;
const send = (msg: FreeToMain): void => parent.postMessage({ pluginMessage: msg }, '*');
const esc = (s: string): string => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] ?? c);

const list = $<HTMLUListElement>('list');
const summary = $<HTMLParagraphElement>('summary');
const upsell = $<HTMLParagraphElement>('upsell');
const message = $<HTMLSpanElement>('message');
const deleteSelected = $<HTMLButtonElement>('delete-selected');
const selectAll = $<HTMLInputElement>('select-all');
$<HTMLAnchorElement>('toolkit').href = TOOLKIT_URL;
$<HTMLAnchorElement>('toolkit-footer').href = TOOLKIT_URL;

const checkedIds = (): string[] => [...list.querySelectorAll<HTMLInputElement>('input[data-id]:checked')].map((i) => i.value);
const refreshButton = (): void => {
  const n = checkedIds().length;
  deleteSelected.disabled = n === 0;
  deleteSelected.textContent = n ? `Delete ${n} selected` : 'Delete selected';
};

$('analyse').onclick = () => {
  message.textContent = 'Analysing every page…';
  send({ type: 'analyse' });
};
list.addEventListener('change', refreshButton);
selectAll.onchange = () => {
  list.querySelectorAll<HTMLInputElement>('input[data-id]').forEach((i) => (i.checked = selectAll.checked));
  refreshButton();
};
deleteSelected.onclick = () => send({ type: 'delete-variables', ids: checkedIds() });

window.onmessage = (event: MessageEvent<{ pluginMessage?: FreeToUi } | null>) => {
  const msg = event.data?.pluginMessage;
  if (!msg) return;
  switch (msg.type) {
    case 'report': {
      const s = freeSummary(msg.report, msg.total);
      summary.textContent = s.headline;
      upsell.textContent = s.upsell;
      upsell.hidden = false;
      $('toolkit').hidden = false;
      list.replaceChildren(
        ...msg.report.unused.map((v) => {
          const el = document.createElement('li');
          el.innerHTML = `<input type="checkbox" data-id value="${v.id}" /><span class="name" title="${esc(v.name)}">${esc(v.name)}</span><span class="sub">${esc(v.type.toLowerCase())}</span>`;
          return el;
        }),
      );
      selectAll.checked = false;
      selectAll.disabled = msg.report.unused.length === 0;
      refreshButton();
      message.textContent = msg.report.unused.length === 0 && msg.total > 0 ? 'Every variable is used somewhere in this file.' : '';
      break;
    }
    case 'deleted':
      message.textContent = `Deleted ${msg.count}.`;
      break;
    case 'error':
      message.textContent = msg.message;
      break;
  }
};
