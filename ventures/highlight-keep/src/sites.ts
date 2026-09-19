/**
 * Per-site enablement without broad host permissions: when the user switches a site on,
 * Chrome asks once for that origin; we then register a content script for it (persisted
 * across restarts) and inject into the current tab right away.
 */
export const originsFor = (hostname: string): string[] => [`https://${hostname}/*`, `http://${hostname}/*`];
export const scriptIdFor = (hostname: string): string => `rf-${hostname}`;

/** Must be called from a user gesture (popup click, keyboard command). */
export async function requestSiteAccess(hostname: string): Promise<boolean> {
  const origins = originsFor(hostname);
  if (await chrome.permissions.contains({ origins })) return true;
  return chrome.permissions.request({ origins });
}

export async function registerSite(hostname: string): Promise<void> {
  const id = scriptIdFor(hostname);
  const existing = await chrome.scripting.getRegisteredContentScripts({ ids: [id] });
  if (existing.length > 0) return;
  await chrome.scripting.registerContentScripts([
    { id, matches: originsFor(hostname), js: ['content.js'], css: ['content.css'], runAt: 'document_idle', persistAcrossSessions: true },
  ]);
}

export async function unregisterSite(hostname: string): Promise<void> {
  const id = scriptIdFor(hostname);
  const existing = await chrome.scripting.getRegisteredContentScripts({ ids: [id] });
  if (existing.length > 0) await chrome.scripting.unregisterContentScripts({ ids: [id] });
}

/** Injects into an already-open tab (the content script guards against running twice). */
export async function injectNow(tabId: number): Promise<void> {
  await chrome.scripting.insertCSS({ target: { tabId }, files: ['content.css'] });
  await chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] });
}
