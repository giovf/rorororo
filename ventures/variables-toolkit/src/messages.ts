import type { ConversionPlan, StyleInfo } from './core/convert.js';
import type { HygieneReport } from './core/hygiene.js';
import type { PaintSite } from './core/link.js';
import type { NumberSite } from './core/numbers.js';
import type { ScanOptions } from './core/scan.js';

export interface LinkGroup<S> {
  variableId: string;
  variableName: string;
  sites: S[];
}

/** Messages between the plugin main thread (code.ts) and the UI iframe. */
export type ToUi =
  | { type: 'status'; paid: boolean; freeLeftToday: number }
  | { type: 'progress'; visited: number; pending: number }
  | {
      type: 'scan-result';
      colors: LinkGroup<PaintSite>[];
      numbers: LinkGroup<NumberSite>[];
      unmatchedColors: number;
      unmatchedNumbers: number;
      visited: number;
    }
  | { type: 'scan-cancelled' }
  | { type: 'applied'; count: number; capped: boolean }
  | { type: 'convert-plan'; plan: ConversionPlan; counts: Record<StyleInfo['kind'], number>; styles: { id: string; name: string; kind: StyleInfo['kind'] }[] }
  | { type: 'converted'; created: number; reused: number; bound: number; warning?: string }
  | { type: 'hygiene'; report: HygieneReport; total: number }
  | { type: 'error'; message: string };

export type ToMain =
  | { type: 'scan'; scope: 'selection' | 'page'; options: ScanOptions }
  | { type: 'cancel-scan' }
  | { type: 'apply'; colorVariableIds: string[]; numberVariableIds: string[] }
  | { type: 'convert-preview'; kinds: StyleInfo['kind'][]; styleIds?: string[] }
  | { type: 'convert-apply'; kinds: StyleInfo['kind'][]; collectionName: string; styleIds: string[] }
  | { type: 'hygiene' }
  | { type: 'delete-variables'; ids: string[] }
  | { type: 'upgrade' };
