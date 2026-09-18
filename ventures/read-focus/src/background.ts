import { effectiveFor, withSiteChange } from './core/settings.js';
import { loadSettings, saveSettings } from './storage.js';

chrome.commands.onCommand.addListener((command) => {
  void (async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.url) return;
    let hostname: string;
    try {
      hostname = new URL(tab.url).hostname;
    } catch {
      return;
    }
    const settings = await loadSettings();
    const site = effectiveFor(settings, hostname);
    if (command === 'toggle-site') await saveSettings(withSiteChange(settings, hostname, { enabled: !site.enabled }));
    if (command === 'toggle-ruler') await saveSettings(withSiteChange(settings, hostname, { enabled: true, ruler: !site.ruler }));
  })();
});

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') void chrome.tabs.create({ url: chrome.runtime.getURL('popup.html?welcome=1') });
});
