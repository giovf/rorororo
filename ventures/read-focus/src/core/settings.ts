import type { Preset } from './fixation.js';

export type FontChoice = 'default' | 'opendyslexic' | 'atkinson' | 'system-sans';

export interface SiteSettings {
  /** Master switch for this site. */
  enabled: boolean;
  bold: boolean;
  preset: Preset;
  /** Pro: precise coverage 0.1–0.9 (how far into each word) overriding the preset. */
  strength?: number;
  /** Pro: extra thickness of the emphasised part, 700 (plain bold) … 900 (+0.8px stroke). */
  weight?: number;
  ruler: boolean;
  /** Text size multiplier for reading blocks, 1.0–1.5 (free). */
  size: number;
  /** Pro: dim everything except the paragraph under the cursor. */
  focus: boolean;
  /** Pro. */
  font: FontChoice;
}

export interface Settings {
  defaults: SiteSettings;
  /** Hostname → overrides. Pro feature to persist; free tier keeps only the session. */
  sites: Record<string, Partial<SiteSettings>>;
  licenseKey: string;
}

export const DEFAULT_SITE: SiteSettings = {
  enabled: false,
  bold: true,
  preset: 'medium',
  ruler: false,
  size: 1,
  focus: false,
  font: 'default',
};

export const DEFAULT_SETTINGS: Settings = { defaults: DEFAULT_SITE, sites: {}, licenseKey: '' };

/** Merges stored data (possibly partial / from an older version) with defaults. */
export function normalize(raw: unknown): Settings {
  const r = (typeof raw === 'object' && raw !== null ? raw : {}) as Partial<Settings>;
  return {
    defaults: { ...DEFAULT_SITE, ...(r.defaults ?? {}) },
    sites: r.sites && typeof r.sites === 'object' ? r.sites : {},
    licenseKey: typeof r.licenseKey === 'string' ? r.licenseKey : '',
  };
}

/** "www.example.co.uk" → "example.co.uk" (strip a leading www only; keep subdomains). */
export function siteKey(hostname: string): string {
  return hostname.toLowerCase().replace(/^www\./, '');
}

export function effectiveFor(settings: Settings, hostname: string): SiteSettings {
  return { ...settings.defaults, ...(settings.sites[siteKey(hostname)] ?? {}) };
}

export function withSiteChange(settings: Settings, hostname: string, change: Partial<SiteSettings>): Settings {
  const key = siteKey(hostname);
  return { ...settings, sites: { ...settings.sites, [key]: { ...(settings.sites[key] ?? {}), ...change } } };
}
