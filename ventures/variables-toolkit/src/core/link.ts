import { colorKey, type Rgba } from './color.js';

/**
 * Pure model of "link raw values to variables": given the colour variables in a
 * file and the solid paints found on layers, decide which paints can be bound
 * to which variable. Everything Figma-specific stays in code.ts.
 */
export interface ColorVariableRef {
  id: string;
  name: string;
  collection: string;
  /** Resolved value per mode id, so a paint matches if it equals the value in ANY mode. */
  valuesByMode: Record<string, Rgba>;
}

export interface PaintSite {
  nodeId: string;
  nodeName: string;
  property: 'fills' | 'strokes';
  index: number;
  color: Rgba;
  /** Already bound to a variable — never touched. */
  boundVariableId?: string;
}

export interface LinkSuggestion {
  site: PaintSite;
  variable: ColorVariableRef;
  /** More than one variable had this exact value; the first by name wins but the rest are listed. */
  alternatives: ColorVariableRef[];
}

export function indexVariablesByColor(vars: ColorVariableRef[]): Map<string, ColorVariableRef[]> {
  const index = new Map<string, ColorVariableRef[]>();
  for (const v of [...vars].sort((a, b) => a.name.localeCompare(b.name))) {
    for (const value of Object.values(v.valuesByMode)) {
      const key = colorKey(value);
      const list = index.get(key) ?? [];
      if (!list.some((x) => x.id === v.id)) list.push(v);
      index.set(key, list);
    }
  }
  return index;
}

export function suggestLinks(
  sites: PaintSite[],
  vars: ColorVariableRef[],
): { suggestions: LinkSuggestion[]; unmatched: PaintSite[] } {
  const index = indexVariablesByColor(vars);
  const suggestions: LinkSuggestion[] = [];
  const unmatched: PaintSite[] = [];
  for (const site of sites) {
    if (site.boundVariableId !== undefined) continue;
    const matches = index.get(colorKey(site.color));
    const [variable, ...alternatives] = matches ?? [];
    if (variable === undefined) unmatched.push(site);
    else suggestions.push({ site, variable, alternatives });
  }
  return { suggestions, unmatched };
}

/** Groups suggestions by variable so the UI can show "12 layers → color/brand/primary". */
export function groupByVariable(
  suggestions: LinkSuggestion[],
): { variable: ColorVariableRef; sites: PaintSite[] }[] {
  const groups = new Map<string, { variable: ColorVariableRef; sites: PaintSite[] }>();
  for (const s of suggestions) {
    const g = groups.get(s.variable.id) ?? { variable: s.variable, sites: [] };
    g.sites.push(s.site);
    groups.set(s.variable.id, g);
  }
  return [...groups.values()].sort((a, b) => b.sites.length - a.sites.length);
}
