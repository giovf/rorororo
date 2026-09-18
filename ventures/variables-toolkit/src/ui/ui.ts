import type { StyleInfo } from '../core/convert.js';
import type { ToMain, ToUi } from '../messages.js';

const $ = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T;
const send = (msg: ToMain): void => parent.postMessage({ pluginMessage: msg }, '*');
const esc = (s: string): string => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] ?? c);
const li = (html: string, cls = ''): HTMLLIElement => {
  const el = document.createElement('li');
  if (cls) el.className = cls;
  el.innerHTML = html;
  return el;
};

let paid = false;
const message = $<HTMLSpanElement>('message');
const say = (text: string): void => {
  message.textContent = text;
};

// tabs
for (const tab of document.querySelectorAll<HTMLButtonElement>('.tab')) {
  tab.onclick = () => {
    document.querySelectorAll('.tab, .panel').forEach((el) => el.classList.remove('active'));
    tab.classList.add('active');
    $(`tab-${tab.dataset['tab'] ?? 'link'}`).classList.add('active');
  };
}

// link
const groups = $<HTMLUListElement>('groups');
const apply = $<HTMLButtonElement>('apply');
$('scan-selection').onclick = () => send({ type: 'scan', scope: 'selection' });
$('scan-page').onclick = () => send({ type: 'scan', scope: 'page' });
apply.onclick = () =>
  send({ type: 'apply', variableIds: [...groups.querySelectorAll<HTMLInputElement>('input:checked')].map((i) => i.value) });

// convert
const selectedKinds = (): StyleInfo['kind'][] =>
  (['paint', 'text', 'effect'] as const).filter((k) => $<HTMLInputElement>(`kind-${k}`).checked);
const plan = $<HTMLUListElement>('plan');
const convertApply = $<HTMLButtonElement>('convert-apply');
$('convert-preview').onclick = () => send({ type: 'convert-preview', kinds: selectedKinds() });
convertApply.onclick = () =>
  send({ type: 'convert-apply', kinds: selectedKinds(), collectionName: $<HTMLInputElement>('collection').value });

// hygiene
const hygieneList = $<HTMLUListElement>('hygiene-list');
const deleteUnused = $<HTMLButtonElement>('delete-unused');
$('hygiene-run').onclick = () => {
  say('Analysing every page…');
  send({ type: 'hygiene' });
};
deleteUnused.onclick = () =>
  send({ type: 'delete-variables', ids: [...hygieneList.querySelectorAll<HTMLInputElement>('input:checked')].map((i) => i.value) });

$('upgrade').onclick = () => send({ type: 'upgrade' });

window.onmessage = (event: MessageEvent<{ pluginMessage: ToUi }>) => {
  const msg = event.data.pluginMessage;
  switch (msg.type) {
    case 'status': {
      paid = msg.paid;
      const tag = $('tier');
      tag.textContent = paid ? 'unlocked' : 'free';
      tag.classList.toggle('paid', paid);
      $('upgrade').hidden = paid;
      document.querySelectorAll('.pro').forEach((el) => ((el as HTMLElement).hidden = paid));
      break;
    }
    case 'scan-result': {
      groups.replaceChildren(
        ...msg.groups.map((g) =>
          li(
            `<input type="checkbox" checked value="${g.variableId}" /><span class="name" title="${esc(g.variableName)}">${esc(g.variableName)}</span><span class="count">${g.sites.length}</span>`,
          ),
        ),
      );
      const linkable = msg.groups.reduce((n, g) => n + g.sites.length, 0);
      $('link-summary').textContent = `${msg.scanned} paints scanned · ${linkable} can be linked · ${msg.unmatched} have no matching variable`;
      apply.disabled = linkable === 0;
      say('');
      break;
    }
    case 'applied':
      say(msg.capped ? `Linked ${msg.count}. Free runs link up to 25 at a time — unlock for unlimited.` : `Linked ${msg.count}.`);
      apply.disabled = true;
      break;
    case 'convert-plan': {
      const items = msg.plan.create.map((v) =>
        li(`<span class="name" title="${esc(v.name)}">${esc(v.name)}</span><span class="sub">${v.type.toLowerCase()}${v.reuseId ? ' · reuse' : ''}</span>`),
      );
      const skipped = msg.plan.skipped.map((s) => li(`<span class="name">${esc(s.name)}</span><span class="sub">${esc(s.reason)}</span>`));
      plan.replaceChildren(...items, ...(skipped.length ? [li('Skipped', 'head'), ...skipped] : []));
      const locked = (['text', 'effect'] as const).filter((k) => !paid && $<HTMLInputElement>(`kind-${k}`).checked && msg.counts[k] > 0);
      $('convert-summary').textContent =
        `${msg.plan.create.length} variables (${msg.plan.create.filter((v) => v.reuseId).length} reused) from ${msg.plan.bind.length} style properties` +
        (locked.length ? ` · ${locked.join(' & ')} styles need the unlock` : '');
      convertApply.disabled = msg.plan.bind.length === 0;
      say('');
      break;
    }
    case 'converted':
      say(`Created ${msg.created}, reused ${msg.reused}, bound ${msg.bound}.`);
      convertApply.disabled = true;
      break;
    case 'hygiene': {
      const r = msg.report;
      const rows: HTMLLIElement[] = [];
      rows.push(li(`Unused in this file (${r.unused.length})`, 'head'));
      rows.push(
        ...r.unused.map((v) =>
          li(`<input type="checkbox" value="${v.id}" ${paid ? '' : 'disabled'} /><span class="name" title="${esc(v.name)}">${esc(v.name)}</span><span class="sub">${v.type.toLowerCase()}</span>`),
        ),
      );
      rows.push(li(`Duplicate values (${r.duplicates.length})`, 'head'));
      rows.push(...r.duplicates.map((d) => li(`<span class="name">${esc(d.variables.map((v) => v.name).join(' = '))}</span>`)));
      rows.push(li(`Broken aliases (${r.dangling.length})`, 'head'));
      rows.push(...r.dangling.map((d) => li(`<span class="name">${esc(d.variable.name)}</span><span class="sub">→ missing</span>`)));
      hygieneList.replaceChildren(...rows);
      $('hygiene-summary').textContent = `${msg.total} local variables · ${r.unused.length} unused · ${r.duplicates.length} duplicate groups · ${r.dangling.length} broken aliases` + (paid ? '' : ' · unlock to delete');
      deleteUnused.disabled = !paid || r.unused.length === 0;
      say('');
      break;
    }
    case 'error':
      say(msg.message);
      break;
  }
};
