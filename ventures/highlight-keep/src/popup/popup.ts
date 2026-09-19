import { activateKey, tierForKey, type Tier } from '../core/license.js';
import { FREE_SITE_LIMIT, toMarkdown } from '../core/model.js';
import { isEnabled } from '../core/settings.js';
import { loadIndex, loadPage, sitesInIndex } from '../pages-storage.js';
import { loadSettings, saveSettings } from '../settings-storage.js';
import { requestSiteAccess } from '../sites.js';

const $ = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T;
let hostname = '';
let href = '';
let tabId: number | null = null;
let tier: Tier = 'free';

async function activeTab(): Promise<void> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  tabId = tab?.id ?? null;
  try {
    const url = new URL(tab?.url ?? '');
    hostname = url.protocol.startsWith('http') ? url.hostname : '';
    href = hostname ? url.href : '';
  } catch {
    hostname = '';
  }
}

async function render(): Promise<void> {
  const settings = await loadSettings();
  $('site').textContent = hostname || 'Open a web page to use Highlight Keep';
  $<HTMLInputElement>('enabled').checked = isEnabled(settings, hostname);
  document.body.classList.toggle('is-pro', tier === 'pro');
  $('tier').textContent = tier;
  $('tier').classList.toggle('pro', tier === 'pro');
  $('unlock-title').textContent = tier === 'pro' ? 'Unlocked — thank you' : 'Unlock everything — $12, once';
  const index = await loadIndex();
  const sites = sitesInIndex(index);
  $('sites').textContent = tier === 'pro' ? `${Object.keys(index).length} pages saved` : `${sites.size}/${FREE_SITE_LIMIT} free sites used`;
  if (!href) return;
  const page = await loadPage(href);
  const list = $<HTMLUListElement>('list');
  list.replaceChildren(
    ...page.highlights.map((h) => {
      const li = document.createElement('li');
      const dot = document.createElement('span');
      dot.className = `dot ${h.colour}`;
      const q = document.createElement('span');
      q.className = 'q';
      q.textContent = h.anchor.quote;
      if (h.note) {
        q.appendChild(document.createElement('br'));
        const n = document.createElement('span');
        n.className = 'n';
        n.textContent = h.note;
        q.appendChild(n);
      }
      li.append(dot, q);
      return li;
    }),
  );
  $('count').textContent = page.highlights.length ? `${page.highlights.length} highlight${page.highlights.length === 1 ? '' : 's'} on this page` : 'No highlights on this page';
  const copy = $<HTMLButtonElement>('copy');
  copy.disabled = page.highlights.length === 0;
  copy.onclick = () => {
    void navigator.clipboard.writeText(toMarkdown({ ...page, title: page.title || document.title })).then(() => (copy.textContent = 'Copied'));
  };
}

async function setEnabled(on: boolean): Promise<void> {
  if (!hostname) return;
  if (on && !(await requestSiteAccess(hostname))) {
    $('site').textContent = 'Highlight Keep needs permission for this site to work here.';
    await render();
    return;
  }
  await chrome.runtime.sendMessage({ type: on ? 'enable-site' : 'disable-site', hostname, tabId });
  await render();
}

async function init(): Promise<void> {
  await activeTab();
  tier = await tierForKey((await loadSettings()).licenseKey);
  await render();
  $('enabled').onchange = (e) => void setEnabled((e.target as HTMLInputElement).checked);
  $('library').onclick = () => void chrome.runtime.sendMessage({ type: 'open-library' });
  $('shortcuts').onclick = (e) => {
    e.preventDefault();
    void chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
  };
  const commands = await chrome.commands.getAll();
  $('kbd-site').textContent = commands.find((c) => c.name === 'toggle-site')?.shortcut || 'not set';
  $('activate').onclick = () => {
    void (async () => {
      const key = $<HTMLInputElement>('key').value.trim();
      const status = $('key-status');
      status.textContent = 'Checking…';
      const { tier: t, reason } = await activateKey(key);
      if (t !== 'pro') {
        status.textContent = reason === 'revoked' ? 'This key was refunded and is no longer valid.' : reason === 'blocked' ? 'This key has been activated too many times recently. If it’s yours, reply to your receipt email.' : 'That key is not valid for Highlight Keep. Check for missing characters or reply to your receipt email.';
        return;
      }
      await saveSettings({ ...(await loadSettings()), licenseKey: key });
      tier = 'pro';
      status.textContent = 'Unlocked. Enjoy.';
      await render();
    })();
  };
}
void init();
