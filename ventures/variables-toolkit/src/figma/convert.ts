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

function createVariable(spec: VariableSpec, collection: VariableCollection): Variable {
  const variable = figma.variables.createVariable(spec.name, collection, spec.type);
  variable.setValueForMode(collection.defaultModeId, spec.value);
  return variable;
}

/** Executes a plan: creates/reuses variables, then binds style properties. Returns counts. */
export async function executePlan(
  plan: ConversionPlan,
  collectionName: string,
): Promise<{ created: number; reused: number; bound: number }> {
  const collection = await findOrCreateCollection(collectionName);
  const byKey = new Map<string, Variable>();
  let created = 0;
  let reused = 0;
  for (const spec of plan.create) {
    const variable = spec.reuseId
      ? await figma.variables.getVariableByIdAsync(spec.reuseId)
      : createVariable(spec, collection);
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
  return { created, reused, bound };
}
