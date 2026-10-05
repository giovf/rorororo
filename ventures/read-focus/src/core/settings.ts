import type { Preset } from './fixation.js';

export type FontChoice = 'default' | 'opendyslexic' | 'atkinson' | 'system-sans';
/** Ruler band colours; `white` is the one that shows on a dark page. */
export type RulerColor = 'yellow' | 'blue' | 'green' | 'pink' | 'grey' | 'white';
export const RULER_COLORS: readonly RulerColor[] = ['yellow', 'blue', 'green', 'pink', 'grey', 'white'];
/** Band height in CSS px: thin / medium / tall. */
export const RULER_HEIGHTS = [24, 34, 48] as const;
export const RULER_OPACITY = { min: 0.1, max: 0.6, default: 0.2 } as const;

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
  /** Ruler band colour, height (px) and tint opacity — free, like every rival's ruler controls. */
  rulerColor: RulerColor;
  rulerHeight: number;
  rulerOpacity: number;
  /** Locked: the band stays where it is; a click or tap moves it. Unlocked: it follows the pointer. */
  rulerLock: boolean;
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
  rulerColor: 'yellow',
  rulerHeight: 34,
  rulerOpacity: RULER_OPACITY.default,
  rulerLock: false,
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
