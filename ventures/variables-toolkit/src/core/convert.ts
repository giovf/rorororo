/**
 * Pure model of "styles → variables". Given local styles and existing variables,
 * produce a plan: variables to create (or reuse) and style properties to bind.
 * Figma execution lives in code.ts.
 */
export type VariableType = 'COLOR' | 'FLOAT' | 'STRING';

export interface ExistingVariable {
  id: string;
  name: string;
  type: VariableType;
  collectionId: string;
}

export interface PaintStyleInfo {
  kind: 'paint';
  id: string;
  name: string;
  /** Only single solid paints convert; others are skipped with a reason. */
  solid?: { r: number; g: number; b: number; a: number };
  paintCount: number;
}

export interface TextStyleInfo {
  kind: 'text';
  id: string;
  name: string;
  fontFamily: string;
  fontStyle: string;
  fontSize: number;
  /** px line height; undefined for AUTO or % */
  lineHeightPx?: number;
  /** px letter spacing; undefined for % */
  letterSpacingPx?: number;
}

export interface EffectStyleInfo {
  kind: 'effect';
  id: string;
  name: string;
  /** Only the first shadow effect converts in v1. */
  shadow?: { color: { r: number; g: number; b: number; a: number }; radius: number; spread: number; x: number; y: number };
}

export type StyleInfo = PaintStyleInfo | TextStyleInfo | EffectStyleInfo;

export interface VariableSpec {
  /** Stable key used to link `create` entries with `bind` entries. */
  key: string;
  name: string;
  type: VariableType;
  value: number | string | { r: number; g: number; b: number; a: number };
  /** Set when a variable with this name and type already exists: reuse it, don't create. */
  reuseId?: string;
}

export interface BindSpec {
  styleId: string;
  styleKind: StyleInfo['kind'];
  /** Property on the style to bind, e.g. "color", "fontSize", "radius". */
  field: string;
  variableKey: string;
}

export interface ConversionPlan {
  create: VariableSpec[];
  bind: BindSpec[];
  skipped: { styleId: string; name: string; reason: string }[];
}

export interface ConvertOptions {
  /** Which style kinds to include (free tier: paint only). */
  kinds: ReadonlySet<StyleInfo['kind']>;
  /** Existing variables — same name + type is reused instead of duplicated. */
  existing: ExistingVariable[];
  /** Prefix for generated names, e.g. "" or "tokens". */
  prefix?: string;
}

/** "Brand / Primary Blue" → "brand/primary-blue" */
export function variableNameFromStyle(styleName: string, prefix = ''): string {
  const parts = styleName
    .split('/')
    .map((p) => p.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''))
    .filter((p) => p.length > 0);
  const name = parts.join('/');
  return prefix ? `${prefix}/${name}` : name;
}

export function planStyleConversion(styles: StyleInfo[], options: ConvertOptions): ConversionPlan {
  const plan: ConversionPlan = { create: [], bind: [], skipped: [] };
  const byName = new Map(options.existing.map((v) => [`${v.type}:${v.name}`, v]));
  const seen = new Map<string, VariableSpec>();

  const spec = (name: string, type: VariableType, value: VariableSpec['value']): VariableSpec => {
    const key = `${type}:${name}`;
    const known = seen.get(key);
    if (known) return known;
    const existing = byName.get(key);
    const s: VariableSpec = { key, name, type, value, ...(existing ? { reuseId: existing.id } : {}) };
    seen.set(key, s);
    plan.create.push(s);
    return s;
  };

  for (const style of styles) {
    if (!options.kinds.has(style.kind)) continue;
    const base = variableNameFromStyle(style.name, options.prefix);
    if (base.length === 0) {
      plan.skipped.push({ styleId: style.id, name: style.name, reason: 'empty name' });
      continue;
    }
    switch (style.kind) {
      case 'paint': {
        if (!style.solid) {
          plan.skipped.push({
            styleId: style.id,
            name: style.name,
            reason: style.paintCount === 1 ? 'not a solid colour' : `${style.paintCount} paints (only single solids convert)`,
          });
          continue;
        }
        const v = spec(base, 'COLOR', style.solid);
        plan.bind.push({ styleId: style.id, styleKind: 'paint', field: 'color', variableKey: v.key });
        break;
      }
      case 'text': {
        const fields: [string, VariableType, number | string | undefined][] = [
          ['fontFamily', 'STRING', style.fontFamily],
          ['fontStyle', 'STRING', style.fontStyle],
          ['fontSize', 'FLOAT', style.fontSize],
          ['lineHeight', 'FLOAT', style.lineHeightPx],
          ['letterSpacing', 'FLOAT', style.letterSpacingPx],
        ];
        for (const [field, type, value] of fields) {
          if (value === undefined) continue;
          const v = spec(`${base}/${field.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())}`, type, value);
          plan.bind.push({ styleId: style.id, styleKind: 'text', field, variableKey: v.key });
        }
        break;
      }
      case 'effect': {
        if (!style.shadow) {
          plan.skipped.push({ styleId: style.id, name: style.name, reason: 'no shadow effect' });
          continue;
        }
        const fields: [string, VariableType, VariableSpec['value']][] = [
          ['color', 'COLOR', style.shadow.color],
          ['radius', 'FLOAT', style.shadow.radius],
          ['spread', 'FLOAT', style.shadow.spread],
          ['offsetX', 'FLOAT', style.shadow.x],
          ['offsetY', 'FLOAT', style.shadow.y],
        ];
        for (const [field, type, value] of fields) {
          const v = spec(`${base}/${field.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())}`, type, value);
          plan.bind.push({ styleId: style.id, styleKind: 'effect', field, variableKey: v.key });
        }
        break;
      }
    }
  }
  return plan;
}
