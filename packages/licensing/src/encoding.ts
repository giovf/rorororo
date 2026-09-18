/** base64url helpers that work in Node and browsers (no Buffer). */

/** Bytes backed by a plain ArrayBuffer, as WebCrypto's BufferSource requires. */
export type Bytes = Uint8Array<ArrayBuffer>;

export function toBase64Url(bytes: Uint8Array): string {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function fromBase64Url(text: string): Bytes {
  const padded = text.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (text.length % 4)) % 4);
  const bin = atob(padded);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export const utf8 = {
  encode: (s: string): Bytes => {
    const encoded = new TextEncoder().encode(s);
    const out = new Uint8Array(encoded.length);
    out.set(encoded);
    return out;
  },
  decode: (b: Uint8Array): string => new TextDecoder().decode(b),
};
