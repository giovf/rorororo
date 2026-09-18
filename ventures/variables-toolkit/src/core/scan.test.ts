import { describe, expect, it } from 'vitest';
import { DEFAULT_SCAN_OPTIONS, decide } from './scan.js';

describe('decide', () => {
  it('never traverses widgets or FigJam nodes', () => {
    expect(decide({ type: 'WIDGET', visible: true }, DEFAULT_SCAN_OPTIONS)).toBe('skip-subtree');
    expect(decide({ type: 'CONNECTOR', visible: true }, DEFAULT_SCAN_OPTIONS)).toBe('skip-subtree');
  });
  it('honours hidden and instance switches', () => {
    expect(decide({ type: 'FRAME', visible: false }, DEFAULT_SCAN_OPTIONS)).toBe('skip-subtree');
    expect(decide({ type: 'FRAME', visible: false }, { ...DEFAULT_SCAN_OPTIONS, includeHidden: true })).toBe('visit');
    expect(decide({ type: 'INSTANCE', visible: true }, DEFAULT_SCAN_OPTIONS)).toBe('visit');
    expect(decide({ type: 'INSTANCE', visible: true }, { ...DEFAULT_SCAN_OPTIONS, skipInstances: true })).toBe('skip-subtree');
  });
});
