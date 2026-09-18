import type { ConversionPlan, StyleInfo } from './core/convert.js';
import type { HygieneReport } from './core/hygiene.js';
import type { PaintSite } from './core/link.js';

/** Messages between the plugin main thread (code.ts) and the UI iframe. */
export type ToUi =
  | { type: 'status'; paid: boolean }
  | {
      type: 'scan-result';
      groups: { variableId: string; variableName: string; sites: PaintSite[] }[];
      unmatched: number;
      scanned: number;
    }
  | { type: 'applied'; count: number; capped: boolean }
  | { type: 'convert-plan'; plan: ConversionPlan; counts: Record<StyleInfo['kind'], number> }
  | { type: 'converted'; created: number; reused: number; bound: number }
  | { type: 'hygiene'; report: HygieneReport; total: number }
  | { type: 'error'; message: string };

export type ToMain =
  | { type: 'scan'; scope: 'selection' | 'page' }
  | { type: 'apply'; variableIds: string[] }
  | { type: 'convert-preview'; kinds: StyleInfo['kind'][] }
  | { type: 'convert-apply'; kinds: StyleInfo['kind'][]; collectionName: string }
  | { type: 'hygiene' }
  | { type: 'delete-variables'; ids: string[] }
  | { type: 'select-nodes'; ids: string[] }
  | { type: 'upgrade' };
