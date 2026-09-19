import { isEnabled, withSite } from './core/settings.js';
import { loadSettings, saveSettings } from './settings-storage.js';
import { injectNow, registerSite, requestSiteAccess, unregisterSite } from './sites.js';

async function activeTab(): Promise<{ id: number; hostname: string } | null> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !tab.url) return null;
  try {
    const url = new URL(tab.url);
    return url.protocol.startsWith('http') ? { id: tab.id, hostname: url.hostname } : null;
  } catch {
    return null;
  }
}

export async function enableSite(hostname: string, tabId: number | null): Promise<boolean> {
  if (!(await requestSiteAccess(hostname))) return false;
  await registerSite(hostname);
  if (tabId !== null) await injectNow(tabId).catch(() => undefined);
  await saveSettings(withSite(await loadSettings(), hostname, true));
  return true;
}

export async function disableSite(hostname: string): Promise<void> {
  await saveSettings(withSite(await loadSettings(), hostname, false));
  await unregisterSite(hostname);
}

chrome.runtime.onMessage.addListener((msg: { type: string; hostname?: string; tabId?: number | null }, _sender, respond) => {
  void (async () => {
    if (msg.type === 'enable-site' && msg.hostname) respond(await enableSite(msg.hostname, msg.tabId ?? null));
    else if (msg.type === 'disable-site' && msg.hostname) {
      await disableSite(msg.hostname);
      respond(true);
    } else if (msg.type === 'open-library') {
      await chrome.tabs.create({ url: chrome.runtime.getURL('library.html') });
      respond(true);
    } else respond(false);
  })();
  return true;
});

chrome.commands.onCommand.addListener((command) => {
  void (async () => {
    const tab = await activeTab();
    if (!tab || command !== 'toggle-site') return;
    if (isEnabled(await loadSettings(), tab.hostname)) await disableSite(tab.hostname);
    else await enableSite(tab.hostname, tab.id);
  })();
});

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') void chrome.tabs.create({ url: chrome.runtime.getURL('welcome.html') });
  void (async () => {
    const settings = await loadSettings();
    for (const [host, s] of Object.entries(settings.sites)) {
      if (s.enabled && (await chrome.permissions.contains({ origins: [`https://${host}/*`, `http://${host}/*`] }))) await registerSite(host);
    }
  })();
});
