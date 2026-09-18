/** Scan options and the node-skipping policy, kept pure for tests. */
export interface ScanOptions {
  includeHidden: boolean;
  skipInstances: boolean;
  numbers: boolean;
  sizes: boolean;
}

export const DEFAULT_SCAN_OPTIONS: ScanOptions = {
  includeHidden: false,
  skipInstances: false,
  numbers: true,
  sizes: false,
};

/** FigJam/widget node types that have broken other plugins; never traversed. */
const SKIPPED_TYPES: ReadonlySet<string> = new Set([
  'WIDGET',
  'CONNECTOR',
  'STICKY',
  'SHAPE_WITH_TEXT',
  'CODE_BLOCK',
  'STAMP',
  'TABLE',
  'EMBED',
  'LINK_UNFURL',
  'MEDIA',
  'SLIDE',
  'SLIDE_ROW',
  'SLIDE_GRID',
]);

export type Decision = 'visit' | 'skip-subtree';

export function decide(node: { type: string; visible: boolean }, options: ScanOptions): Decision {
  if (SKIPPED_TYPES.has(node.type)) return 'skip-subtree';
  if (!options.includeHidden && !node.visible) return 'skip-subtree';
  if (options.skipInstances && node.type === 'INSTANCE') return 'skip-subtree';
  return 'visit';
}
