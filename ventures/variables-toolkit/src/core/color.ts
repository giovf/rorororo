/** Colour helpers on plain data so they can be unit-tested outside Figma. */
export interface Rgb {
  r: number; // 0..1
  g: number;
  b: number;
}

export interface Rgba extends Rgb {
  a: number; // 0..1
}

/** Normalises a Figma RGB/RGBA to an 8-bit hex key (with alpha) for exact matching. */
export function colorKey(c: Rgb | Rgba, opacity = 1): string {
  const a = 'a' in c ? c.a * opacity : opacity;
  const to8 = (v: number): string =>
    Math.round(Math.min(1, Math.max(0, v)) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${to8(c.r)}${to8(c.g)}${to8(c.b)}${to8(a)}`;
}

/** Human hex (#rrggbb, plus alpha only when not opaque). */
export function colorHex(c: Rgb | Rgba, opacity = 1): string {
  const key = colorKey(c, opacity);
  return key.endsWith('ff') ? key.slice(0, 7) : key;
}
