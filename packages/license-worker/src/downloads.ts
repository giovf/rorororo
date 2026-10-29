/**
 * Download products (tax-workbook `own-checkout-listing`, 2026-10-29): a venture whose purchase
 * delivers a file rather than a licence key. The Stripe webhook still issues and stores a key
 * (the order's record, revocable on refund), but the buyer's mail carries a signed, time-limited
 * download link instead. The file itself lives in the LICENSES KV namespace under `asset:<venture>`
 * (the deploy workflow puts it there from the venture's release folder) and is served only by
 * `GET /v1/downloads/<token>`: never a public URL, never a listing of the namespace.
 *
 * Token: base64url(JSON {v, id, exp}) + '.' + base64url(HMAC-SHA256). The HMAC key is derived from
 * the Worker's signing secret with a fixed label, so no new secret is needed and the licence
 * signature and the link signature can never be confused for one another.
 */
import { fromBase64Url, toBase64Url, type Bytes } from '@foundry/licensing';

export interface DownloadProduct {
  /** Product name as the buyer sees it (mail subject, page). */
  name: string;
  /** File name offered by the browser. */
  filename: string;
  /** KV key holding the file bytes. */
  asset: string;
  contentType: string;
  /** Days the link stays valid after the mail is sent. */
  linkDays: number;
}

export const DOWNLOADS: Readonly<Record<string, DownloadProduct>> = {
  'tax-workbook': {
    name: 'UK Sole Trader Tax Workbook 2026/27',
    filename: 'UK-Sole-Trader-Tax-Workbook-2026-27.xlsx',
    asset: 'asset:tax-workbook',
    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    linkDays: 30,
  },
};

export interface DownloadClaim {
  /** Venture slug (a DOWNLOADS key). */
  v: string;
  /** Order id — the stored licence's id (checkout session), checked for revocation. */
  id: string;
  /** Unix seconds after which the link is dead. */
  exp: number;
}

const encoder = new TextEncoder();

async function hmacKey(signingSecret: string): Promise<CryptoKey> {
  const material = await crypto.subtle.digest('SHA-256', encoder.encode(`foundry-download-link-v1:${signingSecret}`));
  return crypto.subtle.importKey('raw', material, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

export async function mintDownloadToken(signingSecret: string, claim: DownloadClaim): Promise<string> {
  const body = toBase64Url(encoder.encode(JSON.stringify(claim)));
  const sig = await crypto.subtle.sign('HMAC', await hmacKey(signingSecret), encoder.encode(body));
  return `${body}.${toBase64Url(new Uint8Array(sig))}`;
}

/** The claim when the signature holds and the link has not expired; null otherwise. */
export async function verifyDownloadToken(signingSecret: string, token: string, now: Date): Promise<DownloadClaim | null> {
  const dot = token.indexOf('.');
  if (dot <= 0 || dot === token.length - 1) return null;
  const body = token.slice(0, dot);
  let sig: Bytes;
  try {
    sig = fromBase64Url(token.slice(dot + 1));
  } catch {
    return null;
  }
  const ok = await crypto.subtle.verify('HMAC', await hmacKey(signingSecret), sig, encoder.encode(body));
  if (!ok) return null;
  let claim: unknown;
  try {
    claim = JSON.parse(new TextDecoder().decode(fromBase64Url(body)));
  } catch {
    return null;
  }
  if (!isClaim(claim)) return null;
  if (claim.exp * 1000 <= now.getTime()) return null;
  return claim;
}

function isClaim(x: unknown): x is DownloadClaim {
  if (typeof x !== 'object' || x === null) return false;
  const c = x as Record<string, unknown>;
  return typeof c['v'] === 'string' && typeof c['id'] === 'string' && typeof c['exp'] === 'number' && Number.isFinite(c['exp']);
}

/** The buyer's mail: what they bought, the link, how long it lasts, where to get help. */
export function downloadEmail(product: DownloadProduct, link: string, expires: Date): { subject: string; text: string } {
  const until = expires.toISOString().slice(0, 10);
  return {
    subject: `Your ${product.name} download`,
    text: [
      `Thanks for buying the ${product.name}.`,
      '',
      'Your file (one click, no account needed):',
      '',
      link,
      '',
      `The link works until ${until}; save the file somewhere you will find it again. It opens in Microsoft Excel 2010 or later,`,
      'Google Sheets (File → Import), LibreOffice Calc and Apple Numbers. Every blue cell is yours to type in; the rest is',
      'calculated, formulas only, nothing to enable.',
      '',
      'If the file does not open on your device, reply to this email within 14 days for a replacement file or a full refund.',
      'One purchase is one licence for your own business records; please do not share or resell the file.',
      '',
      '— Foundry',
    ].join('\n'),
  };
}
