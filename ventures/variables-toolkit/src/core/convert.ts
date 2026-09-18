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

export type VariableValue = number | string | { r: number; g: number; b: number; a: number };

export interface VariableSpec {
  /** Stable key used to link `create` entries with `bind` entries. */
  key: string;
  name: string;
  type: VariableType;
  /** Value for the collection's default (first) mode. */
  value: VariableValue;
  /** Present when several styles were paired into one variable: mode name → value. */
  valuesByMode?: Record<string, VariableValue>;
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
  /** Mode names the collection needs, in order (first = default). Empty = single mode. */
  modes: string[];
}

export interface ConvertOptions {
  /** Which style kinds to include (free tier: paint only). */
  kinds: ReadonlySet<StyleInfo['kind']>;
  /** Existing variables — same name + type is reused instead of duplicated. */
  existing: ExistingVariable[];
  /** Prefix for generated names, e.g. "" or "tokens". */
  prefix?: string;
  /** Restrict to these style ids (user's subset). Undefined = all. */
  onlyStyleIds?: ReadonlySet<string>;
  /** Pair "Light/x" + "Dark/x" colour styles into one variable with modes (default true). */
  modePairing?: boolean;
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

/**
 * Finds paint styles that differ only by their first path segment (e.g. "Light/Brand/Primary"
 * and "Dark/Brand/Primary") and returns, per remainder, the segment→style pairs, plus the
 * ordered mode names. A segment counts as a mode only if it pairs with another segment on at
 * least one remainder, so "Brand/Primary" next to "Light/Brand/Primary" is left alone.
 */
export function pairModes(styles: PaintStyleInfo[]): { modes: string[]; groups: Map<string, Map<string, PaintStyleInfo>> } {
  const byRemainder = new Map<string, Map<string, PaintStyleInfo>>();
  for (const s of styles) {
    const parts = s.name.split('/').map((p) => p.trim());
    if (parts.length < 2) continue;
    const [head, ...rest] = parts;
    const remainder = rest.join('/');
    const group = byRemainder.get(remainder) ?? new Map<string, PaintStyleInfo>();
    if (head && !group.has(head)) group.set(head, s);
    byRemainder.set(remainder, group);
  }
  const groups = new Map([...byRemainder].filter(([, g]) => g.size >= 2));
  const modeNames = new Set<string>();
  for (const g of groups.values()) for (const head of g.keys()) modeNames.add(head);
  const preferred = ['light', 'default', 'day'];
  const modes = [...modeNames].sort((a, b) => {
    const pa = preferred.indexOf(a.toLowerCase());
    const pb = preferred.indexOf(b.toLowerCase());
    return (pa === -1 ? 99 : pa) - (pb === -1 ? 99 : pb) || a.localeCompare(b);
  });
  return { modes, groups };
}

export function planStyleConversion(styles: StyleInfo[], options: ConvertOptions): ConversionPlan {
  const plan: ConversionPlan = { create: [], bind: [], skipped: [], modes: [] };
  const byName = new Map(options.existing.map((v) => [`${v.type}:${v.name}`, v]));
  const seen = new Map<string, VariableSpec>();
  const selected = styles.filter((s) => options.kinds.has(s.kind) && (options.onlyStyleIds?.has(s.id) ?? true));

  const spec = (name: string, type: VariableType, value: VariableSpec['value'], valuesByMode?: Record<string, VariableValue>): VariableSpec => {
    const key = `${type}:${name}`;
    const known = seen.get(key);
    if (known) return known;
    const existing = byName.get(key);
    const s: VariableSpec = { key, name, type, value, ...(valuesByMode ? { valuesByMode } : {}), ...(existing ? { reuseId: existing.id } : {}) };
    seen.set(key, s);
    plan.create.push(s);
    return s;
  };

  // Mode pairing: paired paint styles become one variable each; they are removed from the
  // per-style pass below.
  const paired = new Set<string>();
  if (options.modePairing ?? true) {
    const paints = selected.filter((s): s is PaintStyleInfo => s.kind === 'paint' && s.solid !== undefined);
    const { modes, groups } = pairModes(paints);
    if (modes.length > 0) {
      plan.modes = modes;
      for (const [remainder, group] of groups) {
        const name = variableNameFromStyle(remainder, options.prefix);
        const valuesByMode: Record<string, VariableValue> = {};
        for (const [mode, style] of group) if (style.solid) valuesByMode[mode] = style.solid;
        const first = modes.find((m) => valuesByMode[m] !== undefined);
        const firstValue = first === undefined ? undefined : valuesByMode[first];
        if (firstValue === undefined) continue;
        const v = spec(name, 'COLOR', firstValue, valuesByMode);
        for (const style of group.values()) {
          paired.add(style.id);
          plan.bind.push({ styleId: style.id, styleKind: 'paint', field: 'color', variableKey: v.key });
        }
      }
    }
  }

  for (const style of selected) {
    if (paired.has(style.id)) continue;
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
