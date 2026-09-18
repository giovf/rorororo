import { PRESET_STRENGTH, segment, type Preset } from '../core/fixation.js';

const sample = document.getElementById('sample') as HTMLParagraphElement;
const original = sample.textContent ?? '';

function render(preset: Preset | 'off'): void {
  if (preset === 'off') {
    sample.textContent = original;
    return;
  }
  sample.replaceChildren(
    ...segment(original, PRESET_STRENGTH[preset]).map((s) => {
      if (!s.bold) return document.createTextNode(s.text);
      const b = document.createElement('b');
      b.textContent = s.text;
      return b;
    }),
  );
}

for (const button of document.querySelectorAll<HTMLButtonElement>('[data-preset]')) {
  button.onclick = () => {
    document.querySelectorAll('[data-preset]').forEach((b) => b.classList.remove('active'));
    button.classList.add('active');
    render(button.dataset['preset'] as Preset | 'off');
  };
}
render('medium');

void chrome.commands.getAll().then((commands) => {
  const label = (name: string): string => commands.find((c) => c.name === name)?.shortcut || 'no shortcut set';
  (document.getElementById('kbd-site') as HTMLElement).textContent = label('toggle-site');
  (document.getElementById('kbd-ruler') as HTMLElement).textContent = label('toggle-ruler');
});
(document.getElementById('shortcuts') as HTMLAnchorElement).onclick = (e) => {
  e.preventDefault();
  void chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
};
