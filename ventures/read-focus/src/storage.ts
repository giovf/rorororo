import { normalize, type Settings } from './core/settings.js';

const KEY = 'readfocus';

export async function loadSettings(): Promise<Settings> {
  const data = await chrome.storage.sync.get(KEY);
  return normalize(data[KEY]);
}

export async function saveSettings(settings: Settings): Promise<void> {
  await chrome.storage.sync.set({ [KEY]: settings });
}

export function onSettingsChange(handler: (settings: Settings) => void): void {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes[KEY]) handler(normalize(changes[KEY].newValue));
  });
}
