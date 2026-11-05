/**
 * Own-checkout sales reading (tax-workbook `own-checkout-sale-reading`, 2026-11-05): per-day counts of
 * a download product's orders, kept in the LICENSES namespace next to the order records and served
 * keyless at `GET /v1/downloads/summary` in the shape of the landing Worker's Payhip summary
 * (`packages/landing/src/payhip.ts`), so the gankdat Daily numbers row prints `own checkout 30d: …`
 * beside `payhip 30d:` and the inbox triage can name the referrer of a sale without a credential.
 *
 * What a day holds: paid orders, £0 orders apart (the owner's 100 %-off test sessions are never sales —
 * CLAUDE.md "Facts you must not misread"), pence from the session's `amount_total`, refunds (an
 * `/admin/revoke` of a download order) and a count per referrer token (`ref`, the product page's
 * `?from=` query). Never the buyer's email, name or order id: counts and pence only.
 */
import type { KV } from './worker.js';

export interface SalesDay {
  /** Paid orders (amount_total > 0). */
  orders: number;
  /** £0 orders: coupon tests, never counted as sales. */
  test: number;
  gross_pence: number;
  refunds: number;
  refunded_pence: number;
  currency: string;
  /** Paid orders per referrer token; orders without one are not listed. */
  refs: Record<string, number>;
}

export interface SalesSummary {
  venture: string;
  currency: string;
  window_days: number;
  from: string;
  to: string;
  sales: number;
  test_orders: number;
  refunds: number;
  gross_pence: number;
  refunded_pence: number;
  /** gross − refunded; Stripe's fee is not on the session, so this is before processing fees. */
  net_pence: number;
  refs: Record<string, number>;
  days: (SalesDay & { date: string })[];
}

export const WINDOW_DAYS = 30;
const DAY_PREFIX = 'sales:day:';

export const emptyDay = (currency = 'GBP'): SalesDay => ({
  orders: 0,
  test: 0,
  gross_pence: 0,
  refunds: 0,
  refunded_pence: 0,
  currency,
  refs: {},
});

export const dayKey = (venture: string, date: string): string => `${DAY_PREFIX}${venture}:${date}`;

/** The UTC day of a Date, `YYYY-MM-DD`. */
export const dateOf = (d: Date): string => d.toISOString().slice(0, 10);

/** A session's amount in minor units and its ISO currency; `null` amount when the session carries none. */
export function amountOf(session: { amount_total?: number | null; currency?: string | null }): { pence: number | null; currency: string } {
  const pence = typeof session.amount_total === 'number' && Number.isFinite(session.amount_total) && session.amount_total >= 0 ? Math.round(session.amount_total) : null;
  const currency = typeof session.currency === 'string' && /^[a-z]{3}$/i.test(session.currency) ? session.currency.toUpperCase() : 'GBP';
  return { pence, currency };
}

/** The day after one paid order (£0 counts as a test, not a sale). Pure. */
export function applyOrder(day: SalesDay, order: { pence: number | null; currency: string; ref?: string }): SalesDay {
  const next: SalesDay = { ...day, refs: { ...day.refs }, currency: order.currency || day.currency };
  if (order.pence === 0) {
    next.test += 1;
    return next;
  }
  next.orders += 1;
  next.gross_pence += order.pence ?? 0;
  if (order.ref) next.refs[order.ref] = (next.refs[order.ref] ?? 0) + 1;
  return next;
}

/** The day after one refund (a revoked paid order). Pure. */
export function applyRefund(day: SalesDay, pence: number): SalesDay {
  return { ...day, refs: { ...day.refs }, refunds: day.refunds + 1, refunded_pence: day.refunded_pence + Math.max(0, pence) };
}

export async function readDay(kv: KV, venture: string, date: string): Promise<SalesDay> {
  const raw = await kv.get(dayKey(venture, date));
  if (!raw) return emptyDay();
  try {
    const parsed = JSON.parse(raw) as Partial<SalesDay>;
    return { ...emptyDay(), ...parsed, refs: { ...(parsed.refs ?? {}) } };
  } catch {
    return emptyDay();
  }
}

export async function recordOrder(kv: KV, venture: string, date: string, order: { pence: number | null; currency: string; ref?: string }): Promise<void> {
  await kv.put(dayKey(venture, date), JSON.stringify(applyOrder(await readDay(kv, venture, date), order)));
}

export async function recordRefund(kv: KV, venture: string, date: string, pence: number): Promise<void> {
  await kv.put(dayKey(venture, date), JSON.stringify(applyRefund(await readDay(kv, venture, date), pence)));
}

/** The last `window` days ending `to` (inclusive), summed; days oldest first; the refs summed too. */
export function summarise(venture: string, days: Record<string, SalesDay>, to: string, window: number = WINDOW_DAYS): SalesSummary {
  const end = new Date(`${to}T00:00:00Z`).getTime();
  const from = new Date(end - (window - 1) * 86_400_000).toISOString().slice(0, 10);
  const inWindow = Object.entries(days)
    .filter(([date]) => date >= from && date <= to)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([date, d]) => ({ date, ...d }));
  const sum = (f: (d: SalesDay) => number): number => inWindow.reduce((n, d) => n + f(d), 0);
  const refs: Record<string, number> = {};
  for (const d of inWindow) for (const [k, n] of Object.entries(d.refs)) refs[k] = (refs[k] ?? 0) + n;
  const gross = sum((d) => d.gross_pence);
  const refunded = sum((d) => d.refunded_pence);
  return {
    venture,
    currency: inWindow.find((d) => d.orders > 0)?.currency ?? 'GBP',
    window_days: window,
    from,
    to,
    sales: sum((d) => d.orders),
    test_orders: sum((d) => d.test),
    refunds: sum((d) => d.refunds),
    gross_pence: gross,
    refunded_pence: refunded,
    net_pence: gross - refunded,
    refs,
    days: inWindow,
  };
}

/** Every stored day of a venture, read through the KV prefix listing. */
export async function readDays(kv: KV, venture: string): Promise<Record<string, SalesDay>> {
  const prefix = dayKey(venture, '');
  const out: Record<string, SalesDay> = {};
  for (const key of await kv.list(prefix)) out[key.slice(prefix.length)] = await readDay(kv, venture, key.slice(prefix.length));
  return out;
}
