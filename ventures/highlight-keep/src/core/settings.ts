export interface SiteSettings {
  enabled: boolean;
}
export interface Settings {
  sites: Record<string, SiteSettings>;
  licenseKey: string;
}
export const DEFAULT_SETTINGS: Settings = { sites: {}, licenseKey: '' };

export function normalize(raw: unknown): Settings {
  const r = (typeof raw === 'object' && raw !== null ? raw : {}) as Partial<Settings>;
  return { sites: r.sites && typeof r.sites === 'object' ? r.sites : {}, licenseKey: typeof r.licenseKey === 'string' ? r.licenseKey : '' };
}
export function siteKey(hostname: string): string {
  return hostname.toLowerCase().replace(/^www\./, '');
}
export function withSite(settings: Settings, hostname: string, enabled: boolean): Settings {
  return { ...settings, sites: { ...settings.sites, [siteKey(hostname)]: { enabled } } };
}
export function isEnabled(settings: Settings, hostname: string): boolean {
  return settings.sites[siteKey(hostname)]?.enabled === true;
}
