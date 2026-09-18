import type { SiteSettings } from './settings.js';

export type Tier = 'free' | 'pro';

/** Strips pro-only options from a site configuration when unlicensed. */
export function applyTier(site: SiteSettings, tier: Tier): SiteSettings {
  if (tier === 'pro') return site;
  const rest: SiteSettings = { ...site, focus: false, font: 'default' };
  delete rest.strength;
  delete rest.weight;
  return rest;
}

export const PRO_FEATURES = ['Precise coverage and weight', 'Paragraph focus', 'Dyslexia-friendly fonts'] as const;
