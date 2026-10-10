export interface SiteSettings {
  enabled: boolean;
}
export interface Settings {
  sites: Record<string, SiteSettings>;
  /** "Highlight on every site": one optional host permission for http/https, asked once, off by default. */
  allSites: boolean;
  licenseKey: string;
}
export const DEFAULT_SETTINGS: Settings = { sites: {}, allSites: false, licenseKey: '' };

export function normalize(raw: unknown): Settings {
  const r = (typeof raw === 'object' && raw !== null ? raw : {}) as Partial<Settings>;
  return {
    sites: r.sites && typeof r.sites === 'object' ? r.sites : {},
    allSites: r.allSites === true,
    licenseKey: typeof r.licenseKey === 'string' ? r.licenseKey : '',
  };
}
export function siteKey(hostname: string): string {
  return hostname.toLowerCase().replace(/^www\./, '');
}
export function withSite(settings: Settings, hostname: string, enabled: boolean): Settings {
  return { ...settings, sites: { ...settings.sites, [siteKey(hostname)]: { enabled } } };
}
export function withAllSites(settings: Settings, allSites: boolean): Settings {
  return { ...settings, allSites };
}
/** True where the highlighter runs: every site once "all sites" is on, else the sites switched on one by one. */
export function isEnabled(settings: Settings, hostname: string): boolean {
  return settings.allSites || settings.sites[siteKey(hostname)]?.enabled === true;
}
