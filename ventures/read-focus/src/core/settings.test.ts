import { describe, expect, it } from 'vitest';
import { DEFAULT_SITE, effectiveFor, normalize, siteKey, withSiteChange } from './settings.js';

describe('settings', () => {
  it('normalizes missing or partial data', () => {
    expect(normalize(undefined)).toEqual({ defaults: DEFAULT_SITE, sites: {}, licenseKey: '' });
    const s = normalize({ defaults: { preset: 'heavy' }, licenseKey: 7 });
    expect(s.defaults).toEqual({ ...DEFAULT_SITE, preset: 'heavy' });
    expect(s.licenseKey).toBe('');
  });
  it('keys sites by hostname without www', () => {
    expect(siteKey('WWW.Example.co.uk')).toBe('example.co.uk');
    expect(siteKey('docs.example.com')).toBe('docs.example.com');
  });
  it('layers site overrides over defaults', () => {
    const s = withSiteChange(normalize(undefined), 'www.news.com', { enabled: true, ruler: true });
    expect(effectiveFor(s, 'news.com')).toEqual({ ...DEFAULT_SITE, enabled: true, ruler: true });
    expect(effectiveFor(s, 'other.com')).toEqual(DEFAULT_SITE);
  });
});
