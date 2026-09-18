import { PRESET_STRENGTH, type Preset } from '../core/fixation.js';
import { activateKey, tierForKey } from '../core/license.js';
import { effectiveFor, withSiteChange, type SiteSettings } from '../core/settings.js';
import type { Tier } from '../core/tier.js';
import { loadSettings, saveSettings } from '../storage.js';

const $ = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T;
let hostname = '';
let tier: Tier = 'free';

async function activeHostname(): Promise<string> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  try {
    const url = new URL(tab?.url ?? '');
    return url.protocol.startsWith('http') ? url.hostname : '';
  } catch {
    return '';
  }
}

function render(site: SiteSettings): void {
  $('site').textContent = hostname || 'Open a web page to use ReadFocus';
  $<HTMLInputElement>('enabled').checked = site.enabled;
  $('controls').classList.toggle('off', !site.enabled);
  $<HTMLInputElement>('bold').checked = site.bold;
  document.querySelectorAll<HTMLButtonElement>('[data-preset]').forEach((b) => b.classList.toggle('active', b.dataset['preset'] === site.preset));
  $<HTMLInputElement>('strength').value = String(site.strength ?? PRESET_STRENGTH[site.preset]);
  $<HTMLInputElement>('ruler').checked = site.ruler;
  $<HTMLInputElement>('focus').checked = site.focus;
  $<HTMLSelectElement>('font').value = site.font;
  document.body.classList.toggle('is-pro', tier === 'pro');
  document.body.classList.toggle('is-free', tier !== 'pro');
  $('tier').textContent = tier;
  $('tier').classList.toggle('pro', tier === 'pro');
  $('unlock-title').textContent = tier === 'pro' ? 'Unlocked — thank you' : 'Unlock everything — $12, once';
}

async function change(patch: Partial<SiteSettings>): Promise<void> {
  if (!hostname) return;
  const settings = await loadSettings();
  const next = withSiteChange(settings, hostname, patch);
  await saveSettings(next);
  render(effectiveFor(next, hostname));
}

async function init(): Promise<void> {
  hostname = await activeHostname();
  const settings = await loadSettings();
  tier = await tierForKey(settings.licenseKey);
  render(effectiveFor(settings, hostname));

  $('enabled').onchange = (e) => void change({ enabled: (e.target as HTMLInputElement).checked });
  $('bold').onchange = (e) => void change({ bold: (e.target as HTMLInputElement).checked });
  $('ruler').onchange = (e) => void change({ ruler: (e.target as HTMLInputElement).checked });
  $('focus').onchange = (e) => void change({ focus: (e.target as HTMLInputElement).checked });
  $('font').onchange = (e) => void change({ font: (e.target as HTMLSelectElement).value as SiteSettings['font'] });
  document.querySelectorAll<HTMLButtonElement>('[data-preset]').forEach((b) => {
    b.onclick = () => {
      const settings = { preset: b.dataset['preset'] as Preset };
      void (async () => {
        // choosing a preset clears a pro custom strength
        const s = await loadSettings();
        const key = hostname.toLowerCase().replace(/^www\./, '');
        const site = { ...(s.sites[key] ?? {}) };
        delete site.strength;
        await saveSettings({ ...s, sites: { ...s.sites, [key]: { ...site, ...settings } } });
        render(effectiveFor(await loadSettings(), hostname));
      })();
    };
  });
  $('strength').onchange = (e) => void change({ strength: Number((e.target as HTMLInputElement).value) });

  $('activate').onclick = () => {
    void (async () => {
      const key = $<HTMLInputElement>('key').value.trim();
      const status = $('key-status');
      status.textContent = 'Checking…';
      const { tier: t, reason } = await activateKey(key);
      if (t !== 'pro') {
        status.textContent =
          reason === 'revoked'
            ? 'This key was refunded and is no longer valid.'
            : reason === 'blocked'
              ? 'This key has been activated too many times recently. If it\u2019s yours, reply to your receipt email and we\u2019ll sort it.'
              : 'That key is not valid for ReadFocus. Check for missing characters or reply to your receipt email.';
        return;
      }
      const s = await loadSettings();
      await saveSettings({ ...s, licenseKey: key });
      tier = 'pro';
      status.textContent = 'Unlocked. Enjoy.';
      render(effectiveFor(await loadSettings(), hostname));
    })();
  };
}

void init();
