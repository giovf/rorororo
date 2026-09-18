import { colorKey } from '../core/color.js';
import type { VariableUsage } from '../core/hygiene.js';

type BoundMap = Record<string, VariableAlias | VariableAlias[] | Record<string, VariableAlias> | undefined>;

/** Counts bound-variable references across every page (loads all pages) and local styles. */
export async function readVariableUsage(): Promise<VariableUsage[]> {
  await figma.loadAllPagesAsync();
  const refs = new Map<string, number>();
  const bump = (id: string): void => {
    refs.set(id, (refs.get(id) ?? 0) + 1);
  };
  const countBound = (bound: BoundMap | undefined): void => {
    if (!bound) return;
    for (const value of Object.values(bound)) {
      if (value === undefined) continue;
      if (Array.isArray(value)) value.forEach((alias) => bump(alias.id));
      else if ('id' in value && typeof value.id === 'string') bump(value.id);
      else for (const alias of Object.values(value as Record<string, VariableAlias>)) bump(alias.id);
    }
  };
  for (const page of figma.root.children) {
    for (const node of page.findAll(() => true)) countBound(node.boundVariables);
  }
  const styles: BaseStyle[] = [
    ...(await figma.getLocalPaintStylesAsync()),
    ...(await figma.getLocalTextStylesAsync()),
    ...(await figma.getLocalEffectStylesAsync()),
  ];
  for (const s of styles) countBound(s.boundVariables);

  const vars = await figma.variables.getLocalVariablesAsync();
  return vars.map((v) => {
    const aliasTargets: string[] = [];
    const valueKeys: string[] = [];
    for (const value of Object.values(v.valuesByMode)) {
      if (typeof value === 'object' && value !== null && 'type' in value && value.type === 'VARIABLE_ALIAS') {
        aliasTargets.push(value.id);
        valueKeys.push(`alias:${value.id}`);
      } else if (typeof value === 'object' && value !== null && 'r' in value) {
        valueKeys.push(colorKey(value));
      } else if (typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean') {
        valueKeys.push(String(value));
      } else {
        valueKeys.push(JSON.stringify(value));
      }
    }
    return {
      id: v.id,
      name: v.name,
      type: v.resolvedType,
      collectionId: v.variableCollectionId,
      valueKeys,
      references: refs.get(v.id) ?? 0,
      aliasTargets,
    };
  });
}
