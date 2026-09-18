import type { EffectStyleInfo, PaintStyleInfo, StyleInfo, TextStyleInfo } from '../core/convert.js';

/** Reads local styles into the plain shapes the planner understands. */
export async function readLocalStyles(): Promise<StyleInfo[]> {
  const [paints, texts, effects] = await Promise.all([
    figma.getLocalPaintStylesAsync(),
    figma.getLocalTextStylesAsync(),
    figma.getLocalEffectStylesAsync(),
  ]);
  const out: StyleInfo[] = [];
  for (const s of paints) {
    const info: PaintStyleInfo = { kind: 'paint', id: s.id, name: s.name, paintCount: s.paints.length };
    const only = s.paints.length === 1 ? s.paints[0] : undefined;
    if (only && only.type === 'SOLID') info.solid = { ...only.color, a: only.opacity ?? 1 };
    out.push(info);
  }
  for (const s of texts) {
    const info: TextStyleInfo = {
      kind: 'text',
      id: s.id,
      name: s.name,
      fontFamily: s.fontName.family,
      fontStyle: s.fontName.style,
      fontSize: s.fontSize,
    };
    if (s.lineHeight.unit === 'PIXELS') info.lineHeightPx = s.lineHeight.value;
    if (s.letterSpacing.unit === 'PIXELS') info.letterSpacingPx = s.letterSpacing.value;
    out.push(info);
  }
  for (const s of effects) {
    const info: EffectStyleInfo = { kind: 'effect', id: s.id, name: s.name };
    const shadow = s.effects.find((e) => e.type === 'DROP_SHADOW' || e.type === 'INNER_SHADOW');
    if (shadow && (shadow.type === 'DROP_SHADOW' || shadow.type === 'INNER_SHADOW')) {
      info.shadow = {
        color: shadow.color,
        radius: shadow.radius,
        spread: shadow.spread ?? 0,
        x: shadow.offset.x,
        y: shadow.offset.y,
      };
    }
    out.push(info);
  }
  return out;
}
