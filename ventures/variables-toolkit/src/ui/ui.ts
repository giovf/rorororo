import type { StyleInfo } from '../core/convert.js';
import type { ScanOptions } from '../core/scan.js';
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
const cancel = $<HTMLButtonElement>('cancel-scan');
const options = (): ScanOptions => ({
  numbers: $<HTMLInputElement>('opt-numbers').checked,
  sizes: $<HTMLInputElement>('opt-sizes').checked,
  includeHidden: $<HTMLInputElement>('opt-hidden').checked,
  skipInstances: $<HTMLInputElement>('opt-instances').checked,
});
const startScan = (scope: 'selection' | 'page'): void => {
  cancel.hidden = false;
  say('Scanning…');
  send({ type: 'scan', scope, options: options() });
};
$('scan-selection').onclick = () => startScan('selection');
$('scan-page').onclick = () => startScan('page');
cancel.onclick = () => send({ type: 'cancel-scan' });
const checked = (kind: string): string[] =>
  [...groups.querySelectorAll<HTMLInputElement>(`input[data-kind="${kind}"]:checked`)].map((i) => i.value);
apply.onclick = () => send({ type: 'apply', colorVariableIds: checked('color'), numberVariableIds: checked('number') });

// convert
const selectedKinds = (): StyleInfo['kind'][] =>
  (['paint', 'text', 'effect'] as const).filter((k) => $<HTMLInputElement>(`kind-${k}`).checked);
const plan = $<HTMLUListElement>('plan');
const convertApply = $<HTMLButtonElement>('convert-apply');
const checkedStyles = (): string[] => [...plan.querySelectorAll<HTMLInputElement>('input[data-style]:checked')].map((i) => i.value);
let previewing = false;
$('convert-preview').onclick = () => {
  previewing = false;
  send({ type: 'convert-preview', kinds: selectedKinds() });
};
plan.addEventListener('change', (e) => {
  if ((e.target as HTMLElement).matches('input[data-style]')) {
    previewing = true;
    send({ type: 'convert-preview', kinds: selectedKinds(), styleIds: checkedStyles() });
  }
});
convertApply.onclick = () =>
  send({ type: 'convert-apply', kinds: selectedKinds(), collectionName: $<HTMLInputElement>('collection').value, styleIds: checkedStyles() });

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

window.onmessage = (event: MessageEvent<{ pluginMessage?: ToUi } | null>) => {
  // Figma posts other messages into the iframe too; only ours carry pluginMessage.
  const msg = event.data?.pluginMessage;
  if (!msg) return;
  switch (msg.type) {
    case 'status': {
      paid = msg.paid;
      const tag = $('tier');
      tag.textContent = paid ? 'unlocked' : `free · ${msg.freeLeftToday} links left today`;
      tag.classList.toggle('paid', paid);
      $('upgrade').hidden = paid;
      document.querySelectorAll('.pro').forEach((el) => ((el as HTMLElement).hidden = paid));
      break;
    }
    case 'progress':
      say(`Scanning… ${msg.visited} layers (${msg.pending} queued)`);
      break;
    case 'scan-cancelled':
      cancel.hidden = true;
      say('Scan cancelled.');
      break;
    case 'scan-result': {
      cancel.hidden = true;
      const row = (kind: 'color' | 'number', g: { variableId: string; variableName: string; sites: unknown[] }): HTMLLIElement =>
        li(
          `<input type="checkbox" data-kind="${kind}" checked value="${g.variableId}" /><span class="name" title="${esc(g.variableName)}">${esc(g.variableName)}</span><span class="count">${g.sites.length}</span>`,
        );
      groups.replaceChildren(
        ...(msg.colors.length ? [li('Colours', 'head'), ...msg.colors.map((g) => row('color', g))] : []),
        ...(msg.numbers.length ? [li('Numbers', 'head'), ...msg.numbers.map((g) => row('number', g))] : []),
      );
      const linkable = [...msg.colors, ...msg.numbers].reduce((n, g) => n + g.sites.length, 0);
      $('link-summary').textContent = `${msg.visited} layers scanned · ${linkable} values can be linked · ${msg.unmatchedColors} colours and ${msg.unmatchedNumbers} numbers have no matching variable`;
      apply.disabled = linkable === 0;
      say('');
      break;
    }
    case 'applied':
      say(msg.capped ? `Linked ${msg.count}. That's today's free allowance — unlock for unlimited.` : `Linked ${msg.count}.`);
      apply.disabled = true;
      break;
    case 'convert-plan': {
      const skippedIds = new Set(msg.plan.skipped.map((s) => s.styleId));
      const reasons = new Map(msg.plan.skipped.map((s) => [s.styleId, s.reason]));
      if (!previewing) {
        // Fresh preview: list every eligible style with a checkbox (skipped ones unticked).
        plan.replaceChildren(
          ...msg.styles.map((s) =>
            li(
              `<input type="checkbox" data-style value="${s.id}" ${skippedIds.has(s.id) ? '' : 'checked'} /><span class="name" title="${esc(s.name)}">${esc(s.name)}</span><span class="sub">${esc(reasons.get(s.id) ?? s.kind)}</span>`,
            ),
          ),
        );
      }
      const locked = (['text', 'effect'] as const).filter((k) => !paid && $<HTMLInputElement>(`kind-${k}`).checked && msg.counts[k] > 0);
      const modes = msg.plan.modes.length ? ` · modes: ${msg.plan.modes.join(', ')}` : '';
      $('convert-summary').textContent =
        `${msg.plan.create.length} variables (${msg.plan.create.filter((v) => v.reuseId).length} reused) from ${msg.plan.bind.length} style properties${modes}` +
        (locked.length ? ` · ${locked.join(' & ')} styles need the unlock` : '');
      convertApply.disabled = msg.plan.bind.length === 0;
      say('');
      break;
    }
    case 'converted':
      say(msg.warning ?? `Created ${msg.created}, reused ${msg.reused}, bound ${msg.bound}.`);
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
