import type { ToMain, ToUi } from '../messages.js';

const $ = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T;
const send = (msg: ToMain): void => parent.postMessage({ pluginMessage: msg }, '*');

const groups = $<HTMLUListElement>('groups');
const summary = $<HTMLParagraphElement>('summary');
const apply = $<HTMLButtonElement>('apply');
const upgrade = $<HTMLButtonElement>('upgrade');
const tierTag = $<HTMLSpanElement>('tier');

$('scan-selection').onclick = () => send({ type: 'scan', scope: 'selection' });
$('scan-page').onclick = () => send({ type: 'scan', scope: 'page' });
upgrade.onclick = () => send({ type: 'upgrade' });
apply.onclick = () => {
  const ids = [...groups.querySelectorAll<HTMLInputElement>('input:checked')].map((i) => i.value);
  send({ type: 'apply', variableIds: ids });
};

window.onmessage = (event: MessageEvent<{ pluginMessage: ToUi }>) => {
  const msg = event.data.pluginMessage;
  switch (msg.type) {
    case 'status':
      tierTag.textContent = msg.paid ? 'unlocked' : 'free';
      tierTag.classList.toggle('paid', msg.paid);
      upgrade.hidden = msg.paid;
      break;
    case 'scan-result': {
      groups.replaceChildren(
        ...msg.groups.map((g) => {
          const li = document.createElement('li');
          li.innerHTML = `<input type="checkbox" checked value="${g.variableId}" /><span class="name" title="${g.variableName}">${g.variableName}</span><span class="count">${g.sites.length}</span>`;
          return li;
        }),
      );
      const linkable = msg.groups.reduce((n, g) => n + g.sites.length, 0);
      summary.textContent = `${msg.scanned} paints scanned · ${linkable} can be linked · ${msg.unmatched} have no matching variable`;
      apply.disabled = linkable === 0;
      break;
    }
    case 'applied':
      summary.textContent = msg.capped
        ? `Linked ${msg.count}. Free runs link up to 25 at a time — unlock for unlimited.`
        : `Linked ${msg.count}. Scan again to continue.`;
      apply.disabled = true;
      break;
    case 'error':
      summary.textContent = msg.message;
      break;
  }
};
