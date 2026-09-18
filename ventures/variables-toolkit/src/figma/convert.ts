import type { ConversionPlan, ExistingVariable, VariableSpec } from '../core/convert.js';

export async function readExistingVariables(): Promise<ExistingVariable[]> {
  const vars = await figma.variables.getLocalVariablesAsync();
  const out: ExistingVariable[] = [];
  for (const v of vars) {
    const type = v.resolvedType;
    if (type !== 'COLOR' && type !== 'FLOAT' && type !== 'STRING') continue;
    out.push({ id: v.id, name: v.name, type, collectionId: v.variableCollectionId });
  }
  return out;
}

async function findOrCreateCollection(name: string): Promise<VariableCollection> {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  return collections.find((c) => c.name === name) ?? figma.variables.createVariableCollection(name);
}

function createVariable(spec: VariableSpec, collection: VariableCollection, modeIds: Map<string, string>): Variable {
  const variable = figma.variables.createVariable(spec.name, collection, spec.type);
  variable.setValueForMode(collection.defaultModeId, spec.value);
  for (const [mode, value] of Object.entries(spec.valuesByMode ?? {})) {
    const id = modeIds.get(mode);
    if (id !== undefined) variable.setValueForMode(id, value);
  }
  return variable;
}

/**
 * Makes sure the collection has the plan's modes. Returns mode name → mode id. Adding modes
 * needs a paid Figma plan; on failure the remaining modes are reported and values fall back
 * to the default mode.
 */
function ensureModes(collection: VariableCollection, modes: string[]): { ids: Map<string, string>; warning?: string } {
  const ids = new Map<string, string>();
  if (modes.length === 0) return { ids };
  const existing = new Map(collection.modes.map((m) => [m.name, m.modeId]));
  const [first, ...rest] = modes;
  if (first !== undefined) {
    if (existing.has(first)) ids.set(first, existing.get(first) ?? collection.defaultModeId);
    else if (collection.modes.length === 1 && collection.modes[0]?.name === 'Mode 1') {
      collection.renameMode(collection.defaultModeId, first);
      ids.set(first, collection.defaultModeId);
    } else ids.set(first, collection.defaultModeId);
  }
  const missing: string[] = [];
  for (const mode of rest) {
    const known = existing.get(mode);
    if (known !== undefined) {
      ids.set(mode, known);
      continue;
    }
    try {
      ids.set(mode, collection.addMode(mode));
    } catch {
      missing.push(mode);
    }
  }
  return missing.length ? { ids, warning: `Couldn't add modes ${missing.join(', ')} (your Figma plan may limit modes) — used the default mode's values.` } : { ids };
}

/** Executes a plan: creates/reuses variables, then binds style properties. Returns counts. */
export async function executePlan(
  plan: ConversionPlan,
  collectionName: string,
): Promise<{ created: number; reused: number; bound: number; warning?: string }> {
  const collection = await findOrCreateCollection(collectionName);
  const { ids: modeIds, warning } = ensureModes(collection, plan.modes);
  const byKey = new Map<string, Variable>();
  let created = 0;
  let reused = 0;
  for (const spec of plan.create) {
    const variable = spec.reuseId
      ? await figma.variables.getVariableByIdAsync(spec.reuseId)
      : createVariable(spec, collection, modeIds);
    if (!variable) continue;
    if (spec.reuseId) reused++;
    else created++;
    byKey.set(spec.key, variable);
  }

  let bound = 0;
  const paintStyles = new Map((await figma.getLocalPaintStylesAsync()).map((s) => [s.id, s]));
  const textStyles = new Map((await figma.getLocalTextStylesAsync()).map((s) => [s.id, s]));
  const effectStyles = new Map((await figma.getLocalEffectStylesAsync()).map((s) => [s.id, s]));

  for (const b of plan.bind) {
    const variable = byKey.get(b.variableKey);
    if (!variable) continue;
    if (b.styleKind === 'paint') {
      const style = paintStyles.get(b.styleId);
      const paint = style?.paints[0];
      if (!style || !paint || paint.type !== 'SOLID') continue;
      style.paints = [figma.variables.setBoundVariableForPaint(paint, 'color', variable)];
      bound++;
    } else if (b.styleKind === 'text') {
      const style = textStyles.get(b.styleId);
      if (!style) continue;
      await figma.loadFontAsync(style.fontName);
      style.setBoundVariable(b.field as VariableBindableTextField, variable);
      bound++;
    } else {
      const style = effectStyles.get(b.styleId);
      if (!style) continue;
      const index = style.effects.findIndex((e) => e.type === 'DROP_SHADOW' || e.type === 'INNER_SHADOW');
      const effect = style.effects[index];
      if (!effect) continue;
      const effects = [...style.effects];
      effects[index] = figma.variables.setBoundVariableForEffect(
        effect,
        b.field as VariableBindableEffectField,
        variable,
      );
      style.effects = effects;
      bound++;
    }
  }
  return { created, reused, bound, ...(warning ? { warning } : {}) };
}
