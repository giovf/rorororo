/** Pure model of "link raw numbers to FLOAT variables" (padding, gap, radius, size). */
export type NumberField =
  | 'paddingTop'
  | 'paddingRight'
  | 'paddingBottom'
  | 'paddingLeft'
  | 'itemSpacing'
  | 'counterAxisSpacing'
  | 'topLeftRadius'
  | 'topRightRadius'
  | 'bottomLeftRadius'
  | 'bottomRightRadius'
  | 'width'
  | 'height';

export const SIZE_FIELDS: ReadonlySet<NumberField> = new Set(['width', 'height']);

export interface NumberVariableRef {
  id: string;
  name: string;
  collection: string;
  valuesByMode: Record<string, number>;
}

export interface NumberSite {
  nodeId: string;
  nodeName: string;
  field: NumberField;
  value: number;
  boundVariableId?: string;
}

export interface NumberSuggestion {
  site: NumberSite;
  variable: NumberVariableRef;
  alternatives: NumberVariableRef[];
}

const numKey = (n: number): string => String(Math.round(n * 1000) / 1000);

export function indexVariablesByNumber(vars: NumberVariableRef[]): Map<string, NumberVariableRef[]> {
  const index = new Map<string, NumberVariableRef[]>();
  for (const v of [...vars].sort((a, b) => a.name.localeCompare(b.name))) {
    for (const value of Object.values(v.valuesByMode)) {
      const key = numKey(value);
      const list = index.get(key) ?? [];
      if (!list.some((x) => x.id === v.id)) list.push(v);
      index.set(key, list);
    }
  }
  return index;
}

export function suggestNumberLinks(
  sites: NumberSite[],
  vars: NumberVariableRef[],
): { suggestions: NumberSuggestion[]; unmatched: NumberSite[] } {
  const index = indexVariablesByNumber(vars);
  const suggestions: NumberSuggestion[] = [];
  const unmatched: NumberSite[] = [];
  for (const site of sites) {
    if (site.boundVariableId !== undefined) continue;
    // 0 matches every "none" variable and is never a token; skip it.
    if (site.value === 0) continue;
    const [variable, ...alternatives] = index.get(numKey(site.value)) ?? [];
    if (variable === undefined) unmatched.push(site);
    else suggestions.push({ site, variable, alternatives });
  }
  return { suggestions, unmatched };
}
