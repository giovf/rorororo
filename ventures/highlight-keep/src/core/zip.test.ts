import { describe, expect, it } from 'vitest';
import { buildZip, crc32, dosDateTime } from './zip.js';

const enc = new TextEncoder();
const u32 = (b: Uint8Array, at: number): number => new DataView(b.buffer, b.byteOffset).getUint32(at, true);
const u16 = (b: Uint8Array, at: number): number => new DataView(b.buffer, b.byteOffset).getUint16(at, true);

describe('crc32', () => {
  it('matches the published check values', () => {
    expect(crc32(enc.encode(''))).toBe(0);
    expect(crc32(enc.encode('123456789'))).toBe(0xcbf43926);
    expect(crc32(enc.encode('The quick brown fox jumps over the lazy dog'))).toBe(0x414fa339);
  });
});

describe('dosDateTime', () => {
  it('packs the fields and floors the year at 1980', () => {
    const { date, time } = dosDateTime(new Date(2026, 9, 5, 18, 30, 45));
    expect(date >> 9).toBe(46);
    expect((date >> 5) & 15).toBe(10);
    expect(date & 31).toBe(5);
    expect(time >> 11).toBe(18);
    expect((time >> 5) & 63).toBe(30);
    expect((time & 31) * 2).toBe(44);
    expect(dosDateTime(new Date(1970, 0, 1)).date >> 9).toBe(0);
  });
});

describe('buildZip', () => {
  it('writes stored entries, a central directory and an end record an unzipper can walk', () => {
    const zip = buildZip([{ name: 'a.md', data: '# A\n' }, { name: 'sub/é.md', data: enc.encode('hé') }], new Date(2026, 9, 5, 12, 0, 0));
    // Local header 1.
    expect(u32(zip, 0)).toBe(0x04034b50);
    expect(u16(zip, 8)).toBe(0); // stored
    expect(u16(zip, 6) & 0x0800).toBe(0x0800); // UTF-8 flag
    expect(u32(zip, 14)).toBe(crc32(enc.encode('# A\n')));
    expect(u32(zip, 18)).toBe(4);
    expect(u16(zip, 26)).toBe(4);
    expect(new TextDecoder().decode(zip.subarray(30, 34))).toBe('a.md');
    expect(new TextDecoder().decode(zip.subarray(34, 38))).toBe('# A\n');
    // Local header 2 starts right after; its name is UTF-8 (é is two bytes).
    const l2 = 38;
    expect(u32(zip, l2)).toBe(0x04034b50);
    expect(u16(zip, l2 + 26)).toBe(enc.encode('sub/é.md').length);
    expect(u32(zip, l2 + 18)).toBe(3);
    // End record is the last 22 bytes and points at the central directory.
    const end = zip.length - 22;
    expect(u32(zip, end)).toBe(0x06054b50);
    expect(u16(zip, end + 10)).toBe(2);
    const cdOffset = u32(zip, end + 16);
    const cdSize = u32(zip, end + 12);
    expect(cdOffset + cdSize).toBe(end);
    expect(u32(zip, cdOffset)).toBe(0x02014b50);
    expect(u32(zip, cdOffset + 42)).toBe(0); // first entry's local header offset
    const second = cdOffset + 46 + 4;
    expect(u32(zip, second)).toBe(0x02014b50);
    expect(u32(zip, second + 42)).toBe(l2);
    expect(u32(zip, second + 16)).toBe(crc32(enc.encode('hé')));
  });

  it('handles an empty archive', () => {
    const zip = buildZip([]);
    expect(zip.length).toBe(22);
    expect(u32(zip, 0)).toBe(0x06054b50);
  });
});
