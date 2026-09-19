import { effectiveFor, withSiteChange } from './core/settings.js';
import { injectNow, registerSite, requestSiteAccess, unregisterSite } from './sites.js';
import { loadSettings, saveSettings } from './storage.js';

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

/** Turns a site on: permission (once) → registered script → inject now → save. */
export async function enableSite(hostname: string, tabId: number | null): Promise<boolean> {
  if (!(await requestSiteAccess(hostname))) return false;
  await registerSite(hostname);
  if (tabId !== null) await injectNow(tabId).catch(() => undefined);
  const settings = await loadSettings();
  await saveSettings(withSiteChange(settings, hostname, { enabled: true }));
  return true;
}

export async function disableSite(hostname: string): Promise<void> {
  const settings = await loadSettings();
  await saveSettings(withSiteChange(settings, hostname, { enabled: false }));
  await unregisterSite(hostname);
}

chrome.runtime.onMessage.addListener((msg: { type: string; hostname?: string; tabId?: number | null }, _sender, respond) => {
  void (async () => {
    if (msg.type === 'enable-site' && msg.hostname) respond(await enableSite(msg.hostname, msg.tabId ?? null));
    else if (msg.type === 'disable-site' && msg.hostname) {
      await disableSite(msg.hostname);
      respond(true);
    } else respond(false);
  })();
  return true; // async response
});

chrome.commands.onCommand.addListener((command) => {
  void (async () => {
    const tab = await activeTab();
    if (!tab) return;
    const settings = await loadSettings();
    const site = effectiveFor(settings, tab.hostname);
    if (command === 'toggle-site') {
      if (site.enabled) await disableSite(tab.hostname);
      else await enableSite(tab.hostname, tab.id);
    }
    if (command === 'toggle-ruler') {
      if (!site.enabled && !(await enableSite(tab.hostname, tab.id))) return;
      const latest = await loadSettings();
      await saveSettings(withSiteChange(latest, tab.hostname, { ruler: !effectiveFor(latest, tab.hostname).ruler }));
    }
  })();
});

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') void chrome.tabs.create({ url: chrome.runtime.getURL('welcome.html') });
  // Re-register scripts for sites already enabled (e.g. after an update).
  void (async () => {
    const settings = await loadSettings();
    for (const [host, s] of Object.entries(settings.sites)) {
      if (s.enabled && (await chrome.permissions.contains({ origins: [`https://${host}/*`, `http://${host}/*`] }))) await registerSite(host);
    }
  })();
});
