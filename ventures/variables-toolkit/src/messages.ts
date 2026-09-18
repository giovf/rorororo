import type { LinkSuggestion, PaintSite } from './core/link.js';

/** Messages between the plugin main thread (code.ts) and the UI iframe. */
export type ToUi =
  | { type: 'status'; paid: boolean }
  | { type: 'scan-result'; groups: { variableId: string; variableName: string; sites: PaintSite[] }[]; unmatched: number; scanned: number }
  | { type: 'applied'; count: number; capped: boolean }
  | { type: 'error'; message: string };

export type ToMain =
  | { type: 'scan'; scope: 'selection' | 'page' }
  | { type: 'apply'; variableIds: string[] }
  | { type: 'upgrade' };

export type { LinkSuggestion };
