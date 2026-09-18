/** Pure model of the hygiene report: unused, duplicate-valued and dangling references. */
export interface VariableUsage {
  id: string;
  name: string;
  type: 'COLOR' | 'FLOAT' | 'STRING' | 'BOOLEAN';
  collectionId: string;
  /** Stable string per mode, e.g. colour hex or number, for duplicate detection. */
  valueKeys: string[];
  /** Number of bound references found on nodes/styles in the file. */
  references: number;
  /** Ids of variables this one aliases (for dangling detection). */
  aliasTargets: string[];
}

export interface HygieneReport {
  unused: VariableUsage[];
  duplicates: { valueKey: string; variables: VariableUsage[] }[];
  dangling: { variable: VariableUsage; missingTargetId: string }[];
}

export function hygieneReport(vars: VariableUsage[]): HygieneReport {
  const ids = new Set(vars.map((v) => v.id));
  const referencedAsAlias = new Set(vars.flatMap((v) => v.aliasTargets));
  const unused = vars.filter((v) => v.references === 0 && !referencedAsAlias.has(v.id));

  const byValue = new Map<string, VariableUsage[]>();
  for (const v of vars) {
    if (v.aliasTargets.length > 0) continue; // aliases legitimately share values
    const key = `${v.type}|${v.collectionId}|${[...v.valueKeys].sort().join(',')}`;
    byValue.set(key, [...(byValue.get(key) ?? []), v]);
  }
  const duplicates = [...byValue.entries()]
    .filter(([, list]) => list.length > 1)
    .map(([valueKey, variables]) => ({ valueKey, variables: [...variables].sort((a, b) => a.name.localeCompare(b.name)) }));

  const dangling = vars.flatMap((variable) =>
    variable.aliasTargets.filter((t) => !ids.has(t)).map((missingTargetId) => ({ variable, missingTargetId })),
  );
  return { unused, duplicates, dangling };
}
