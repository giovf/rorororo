import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, isEnabled, normalize, siteKey, withAllSites, withSite } from './settings.js';

describe('settings', () => {
  it('normalizes anything into the default shape, all-sites off', () => {
    expect(normalize(undefined)).toEqual(DEFAULT_SETTINGS);
    expect(normalize({ sites: 'nope', allSites: 'yes', licenseKey: 3 })).toEqual(DEFAULT_SETTINGS);
    expect(normalize({ allSites: true })).toEqual({ ...DEFAULT_SETTINGS, allSites: true });
  });

  it('keys sites by lower-case hostname without www', () => {
    expect(siteKey('WWW.Example.com')).toBe('example.com');
    const s = withSite(DEFAULT_SETTINGS, 'www.example.com', true);
    expect(isEnabled(s, 'example.com')).toBe(true);
    expect(isEnabled(s, 'other.example')).toBe(false);
    expect(isEnabled(withSite(s, 'example.com', false), 'example.com')).toBe(false);
  });

  it('all-sites mode enables every hostname and keeps the per-site list for when it is switched off', () => {
    const s = withAllSites(withSite(DEFAULT_SETTINGS, 'example.com', true), true);
    expect(isEnabled(s, 'never-enabled.example')).toBe(true);
    const off = withAllSites(s, false);
    expect(isEnabled(off, 'never-enabled.example')).toBe(false);
    expect(isEnabled(off, 'example.com')).toBe(true);
  });
});
