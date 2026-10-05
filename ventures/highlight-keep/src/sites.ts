/**
 * Per-site enablement without broad host permissions: when the user switches a site on,
 * Chrome asks once for that origin; we then register a content script for it (persisted
 * across restarts) and inject into the current tab right away.
 *
 * "Highlight on every site" is the same mechanism once: the user asks for the optional
 * http/https host permission the manifest declares, and one content script is registered
 * for all of it. Off by default; the per-site switches stay as they were for when it is
 * turned off again.
 */
export const originsFor = (hostname: string): string[] => [`https://${hostname}/*`, `http://${hostname}/*`];
export const scriptIdFor = (hostname: string): string => `rf-${hostname}`;
/** Exactly the manifest's optional_host_permissions — a request must be a subset of them. */
export const ALL_ORIGINS = ['http://*/*', 'https://*/*'];
export const ALL_SCRIPT_ID = 'hk-all-sites';

/** Must be called from a user gesture (popup click, keyboard command). */
export async function requestSiteAccess(hostname: string): Promise<boolean> {
  const origins = originsFor(hostname);
  if (await chrome.permissions.contains({ origins })) return true;
  return chrome.permissions.request({ origins });
}

/** Must be called from a user gesture (the popup's switch). */
export async function requestAllSitesAccess(): Promise<boolean> {
  if (await chrome.permissions.contains({ origins: ALL_ORIGINS })) return true;
  return chrome.permissions.request({ origins: ALL_ORIGINS });
}

async function register(id: string, matches: string[]): Promise<void> {
  const existing = await chrome.scripting.getRegisteredContentScripts({ ids: [id] });
  if (existing.length > 0) return;
  await chrome.scripting.registerContentScripts([
    { id, matches, js: ['content.js'], css: ['content.css'], runAt: 'document_idle', persistAcrossSessions: true },
  ]);
}

async function unregister(id: string): Promise<void> {
  const existing = await chrome.scripting.getRegisteredContentScripts({ ids: [id] });
  if (existing.length > 0) await chrome.scripting.unregisterContentScripts({ ids: [id] });
}

export const registerSite = (hostname: string): Promise<void> => register(scriptIdFor(hostname), originsFor(hostname));
export const unregisterSite = (hostname: string): Promise<void> => unregister(scriptIdFor(hostname));
export const registerAllSites = (): Promise<void> => register(ALL_SCRIPT_ID, ALL_ORIGINS);
export const unregisterAllSites = (): Promise<void> => unregister(ALL_SCRIPT_ID);

/** Injects into an already-open tab (the content script guards against running twice). */
export async function injectNow(tabId: number): Promise<void> {
  await chrome.scripting.insertCSS({ target: { tabId }, files: ['content.css'] });
  await chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] });
}
