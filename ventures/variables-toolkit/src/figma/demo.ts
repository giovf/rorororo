/**
 * Builds a self-contained demo page so a first-time Figma user can test every feature:
 * a token collection, styles (incl. Light/Dark twins), shapes with raw values that match
 * variables, one that doesn't, a hidden layer, a component + instance, and hygiene bait.
 * Development-only: the "demo" menu command is removed before publishing.
 */
const rgb = (hex: string): RGB => ({
  r: parseInt(hex.slice(1, 3), 16) / 255,
  g: parseInt(hex.slice(3, 5), 16) / 255,
  b: parseInt(hex.slice(5, 7), 16) / 255,
});
const solid = (hex: string): SolidPaint => ({ type: 'SOLID', color: rgb(hex) });

export async function createDemoPage(): Promise<string> {
  const page = figma.createPage();
  page.name = 'Variables Toolkit demo';
  await figma.setCurrentPageAsync(page);

  // --- variables ---
  const tokens = figma.variables.createVariableCollection('Demo tokens');
  const color = (name: string, hex: string): Variable => {
    const v = figma.variables.createVariable(name, tokens, 'COLOR');
    v.setValueForMode(tokens.defaultModeId, { ...rgb(hex), a: 1 });
    return v;
  };
  const num = (name: string, value: number): Variable => {
    const v = figma.variables.createVariable(name, tokens, 'FLOAT');
    v.setValueForMode(tokens.defaultModeId, value);
    return v;
  };
  color('brand/primary', '#3B82F6');
  color('brand/danger', '#EF4444');
  color('brand/primary-copy', '#3B82F6'); // duplicate value → Clean up tab
  color('unused/old-teal', '#14B8A6'); // never referenced → Clean up tab
  num('space/2', 8);
  num('space/4', 16);
  num('radius/md', 8);

  // --- styles ---
  const paint = (name: string, paints: Paint[]): PaintStyle => {
    const s = figma.createPaintStyle();
    s.name = name;
    s.paints = paints;
    return s;
  };
  paint('Light/Brand/Primary', [solid('#3B82F6')]);
  paint('Dark/Brand/Primary', [solid('#60A5FA')]);
  paint('Brand/Accent', [solid('#F59E0B')]);
  paint('Gradient/Hero', [
    { type: 'GRADIENT_LINEAR', gradientTransform: [[1, 0, 0], [0, 1, 0]], gradientStops: [{ position: 0, color: { ...rgb('#3B82F6'), a: 1 } }, { position: 1, color: { ...rgb('#F59E0B'), a: 1 } }] },
  ]);
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
  const text = figma.createTextStyle();
  text.name = 'Body/Regular';
  text.fontName = { family: 'Inter', style: 'Regular' };
  text.fontSize = 16;
  text.lineHeight = { unit: 'PIXELS', value: 24 };
  const effect = figma.createEffectStyle();
  effect.name = 'Shadow/Card';
  effect.effects = [{ type: 'DROP_SHADOW', color: { r: 0, g: 0, b: 0, a: 0.2 }, offset: { x: 0, y: 2 }, radius: 8, spread: 0, visible: true, blendMode: 'NORMAL' }];

  // --- layers with raw values ---
  const frame = figma.createFrame();
  frame.name = 'Card (auto layout: padding 16, gap 8, radius 8)';
  frame.layoutMode = 'VERTICAL';
  frame.paddingTop = frame.paddingRight = frame.paddingBottom = frame.paddingLeft = 16;
  frame.itemSpacing = 8;
  frame.cornerRadius = 8;
  frame.fills = [solid('#FFFFFF')];
  frame.x = 0;
  frame.y = 0;
  const rect = (name: string, hex: string): RectangleNode => {
    const r = figma.createRectangle();
    r.name = name;
    r.resize(200, 48);
    r.fills = [solid(hex)];
    frame.appendChild(r);
    return r;
  };
  rect('Primary button (matches brand/primary)', '#3B82F6');
  rect('Another primary (matches brand/primary)', '#3B82F6');
  rect('Danger (matches brand/danger)', '#EF4444');
  rect('Magenta (no matching variable)', '#FF00FF');
  const hidden = rect('Hidden primary (only found with "Include hidden")', '#3B82F6');
  hidden.visible = false;
  const label = figma.createText();
  label.characters = 'Hello, variables';
  label.fills = [solid('#3B82F6')];
  frame.appendChild(label);

  const component = figma.createComponent();
  component.name = 'Chip component';
  component.resize(120, 32);
  component.fills = [solid('#EF4444')];
  component.x = 260;
  const instance = component.createInstance();
  instance.name = 'Chip instance (skipped with "Skip instances")';
  instance.x = 260;
  instance.y = 60;

  const note = figma.createText();
  note.characters = 'Demo page for Variables Toolkit. Run the plugin: Plugins → Development → Variables Toolkit → Open.';
  note.y = 140;
  note.x = 260;
  figma.viewport.scrollAndZoomIntoView([frame, component, instance, note]);
  return page.name;
}
