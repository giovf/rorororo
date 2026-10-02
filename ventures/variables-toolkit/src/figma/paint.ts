/** Hex → Figma paint helpers shared by the development-only page builders. */
export const rgb = (hex: string): RGB => ({
  r: parseInt(hex.slice(1, 3), 16) / 255,
  g: parseInt(hex.slice(3, 5), 16) / 255,
  b: parseInt(hex.slice(5, 7), 16) / 255,
});
export const rgba = (hex: string): RGBA => ({ ...rgb(hex), a: 1 });
export const solid = (hex: string): SolidPaint => ({ type: 'SOLID', color: rgb(hex) });
