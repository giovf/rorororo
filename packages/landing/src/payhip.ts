// /hooks/payhip — the Payhip sale webhook for the UK Sole Trader Tax Workbook's twin listing
// (tax-workbook `payhip-twin-listing`, 2026-10-29). Payhip posts a JSON body on every `paid` and
// `refunded` event (help.payhip.com/article/115-webhooks, read 2026-10-29): prices in pence, a
// `signature` that equals sha256 of the store's API key, a retry once an hour for three hours
// unless the endpoint answers 200. The receiver keeps per-day totals in KV — counts and pence
// only, never the buyer's email, name or IP — and serves them keyless at /hooks/payhip/summary,
// which the gankdat Daily numbers job reads into its row (`payhip 30d: …`), so the Payhip funnel
// is read without mail parsing (the one thing this shelf does better than Etsy).
//
// Secret (wrangler secret put; the landing workflow sets it from the PAYHIP_API_KEY repository
// secret, docs/for-owner/actions/033-payhip-upload-and-webhook.md): PAYHIP_API_KEY — the store's
// API key from Settings → Developer. Without it every post answers 503 and nothing is stored.
import { Hono } from 'hono';

export type PayhipBindings = {
  OPS_KV: KVNamespace;
  PAYHIP_API_KEY?: string;
};

/** One UTC day's totals; `products` counts paid items by Payhip product key. */
export interface DayTotals {
  paid: number;
  refunded: number;
  gross_pence: number;
  fees_pence: number;
  refunded_pence: number;
  currency: string;
  products: Record<string, number>;
}

export interface PayhipEvent {
  id: string;
  type: string;
  currency: string;
  price: number;
  stripe_fee: number;
  payhip_fee: number;
  amount_refunded: number;
  date: number | null;
  date_refunded: number | null;
  product_keys: string[];
}

export interface Summary {
  currency: string;
  window_days: number;
  from: string;
  to: string;
  sales: number;
  refunds: number;
  gross_pence: number;
  fees_pence: number;
  refunded_pence: number;
  net_pence: number;
  days: (DayTotals & { date: string })[];
}

const DAY_PREFIX = 'payhip:day:';
const EVENT_PREFIX = 'payhip:ev:';
/** How long a handled event id is remembered (Payhip retries for three hours; 90 days is ample). */
export const EVENT_TTL = 90 * 24 * 3600;
export const WINDOW_DAYS = 30;
const HANDLED = new Set(['paid', 'refunded']);

export async function sha256(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

const num = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v)) ? Number(v) : 0);
const str = (v: unknown): string => (typeof v === 'string' ? v : '');

/** The fields this receiver keeps from a webhook body; null when it is not an event at all. */
export function parseEvent(body: unknown): PayhipEvent | null {
  if (!body || typeof body !== 'object') return null;
  const b = body as Record<string, unknown>;
  const id = str(b.id);
  const type = str(b.type);
  if (!id || !type) return null;
  const items = Array.isArray(b.items) ? b.items : [];
  const product_keys = items
    .map((it) => (it && typeof it === 'object' ? str((it as Record<string, unknown>).product_key) : ''))
    .filter((k) => k !== '');
  const date = num(b.date);
  const dateRefunded = num(b.date_refunded);
  return {
    id,
    type,
    currency: str(b.currency).toUpperCase() || 'GBP',
    price: num(b.price),
    stripe_fee: num(b.stripe_fee),
    payhip_fee: num(b.payhip_fee),
    amount_refunded: num(b.amount_refunded),
    date: date > 0 ? date : null,
    date_refunded: dateRefunded > 0 ? dateRefunded : null,
    product_keys,
  };
}

/** True when the body's `signature` is the sha256 hex of the store's API key (Payhip's scheme). */
export async function verified(body: unknown, apiKey: string): Promise<boolean> {
  if (!body || typeof body !== 'object') return false;
  const sig = str((body as Record<string, unknown>).signature).trim().toLowerCase();
  return sig !== '' && sig === (await sha256(apiKey));
}

/** The UTC day of a unix-seconds timestamp, or of `now` when the event carries none. */
export function dayOf(ts: number | null, now: number = Date.now()): string {
  return new Date(ts ? ts * 1000 : now).toISOString().slice(0, 10);
}

export const emptyDay = (currency = 'GBP'): DayTotals => ({
  paid: 0,
  refunded: 0,
  gross_pence: 0,
  fees_pence: 0,
  refunded_pence: 0,
  currency,
  products: {},
});

/** The day's totals after one event. `refunded` adds the refunded amount; anything else is a no-op. */
export function apply(day: DayTotals, ev: PayhipEvent): DayTotals {
  const next: DayTotals = { ...day, products: { ...day.products }, currency: ev.currency || day.currency };
  if (ev.type === 'paid') {
    next.paid += 1;
    next.gross_pence += ev.price;
    next.fees_pence += ev.stripe_fee + ev.payhip_fee;
    for (const k of ev.product_keys) next.products[k] = (next.products[k] ?? 0) + 1;
  } else if (ev.type === 'refunded') {
    next.refunded += 1;
    next.refunded_pence += ev.amount_refunded > 0 ? ev.amount_refunded : ev.price;
  }
  return next;
}

/** The last `window` days ending `to` (inclusive), summed; days are returned oldest first. */
export function summarise(days: Record<string, DayTotals>, to: string, window: number = WINDOW_DAYS): Summary {
  const end = new Date(`${to}T00:00:00Z`).getTime();
  const from = new Date(end - (window - 1) * 86_400_000).toISOString().slice(0, 10);
  const inWindow = Object.entries(days)
    .filter(([date]) => date >= from && date <= to)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([date, d]) => ({ date, ...d }));
  const sum = (f: (d: DayTotals) => number): number => inWindow.reduce((n, d) => n + f(d), 0);
  const gross = sum((d) => d.gross_pence);
  const fees = sum((d) => d.fees_pence);
  const refunded = sum((d) => d.refunded_pence);
  return {
    currency: inWindow.find((d) => d.currency)?.currency ?? 'GBP',
    window_days: window,
    from,
    to,
    sales: sum((d) => d.paid),
    refunds: sum((d) => d.refunded),
    gross_pence: gross,
    fees_pence: fees,
    refunded_pence: refunded,
    net_pence: gross - fees - refunded,
    days: inWindow,
  };
}

async function readDay(kv: KVNamespace, date: string): Promise<DayTotals> {
  const raw = await kv.get(`${DAY_PREFIX}${date}`);
  if (!raw) return emptyDay();
  try {
    return { ...emptyDay(), ...(JSON.parse(raw) as Partial<DayTotals>) };
  } catch {
    return emptyDay();
  }
}

async function readDays(kv: KVNamespace): Promise<Record<string, DayTotals>> {
  const out: Record<string, DayTotals> = {};
  let cursor: string | undefined;
  do {
    const page = await kv.list({ prefix: DAY_PREFIX, cursor });
    for (const k of page.keys) out[k.name.slice(DAY_PREFIX.length)] = await readDay(kv, k.name.slice(DAY_PREFIX.length));
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);
  return out;
}

async function bodyOf(req: Request): Promise<unknown> {
  const text = await req.text();
  try {
    return JSON.parse(text) as unknown;
  } catch {
    // A form-encoded post with the JSON in a field (some senders do this): take the first field that parses.
    const params = new URLSearchParams(text);
    for (const [, v] of params) {
      try {
        return JSON.parse(v) as unknown;
      } catch {
        /* next field */
      }
    }
    return null;
  }
}

export const payhip = new Hono<{ Bindings: PayhipBindings }>();

payhip.post('/', async (c) => {
  if (!c.env.PAYHIP_API_KEY) return c.json({ ok: false, error: 'not configured' }, 503);
  const body = await bodyOf(c.req.raw);
  if (!(await verified(body, c.env.PAYHIP_API_KEY))) return c.json({ ok: false, error: 'bad signature' }, 401);
  const ev = parseEvent(body);
  if (!ev) return c.json({ ok: false, error: 'not an event' }, 400);
  if (!HANDLED.has(ev.type)) return c.json({ ok: true, ignored: ev.type });
  const marker = `${EVENT_PREFIX}${ev.type}:${ev.id}`;
  if (await c.env.OPS_KV.get(marker)) return c.json({ ok: true, duplicate: true });
  const date = dayOf(ev.type === 'refunded' ? ev.date_refunded : ev.date);
  const day = apply(await readDay(c.env.OPS_KV, date), ev);
  await c.env.OPS_KV.put(`${DAY_PREFIX}${date}`, JSON.stringify(day));
  await c.env.OPS_KV.put(marker, date, { expirationTtl: EVENT_TTL });
  return c.json({ ok: true, date, type: ev.type });
});

// `?to=YYYY-MM-DD` ends the 30-day window on that day instead of today (a dated re-read).
payhip.get('/summary', async (c) => {
  const q = c.req.query('to') ?? '';
  const to = /^\d{4}-\d{2}-\d{2}$/.test(q) ? q : dayOf(null);
  const days = await readDays(c.env.OPS_KV);
  const s = summarise(days, to);
  c.header('cache-control', 'public, max-age=300');
  c.header('access-control-allow-origin', '*');
  return c.json(s);
});
