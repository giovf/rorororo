import { describe, expect, it } from 'vitest';
import { amountOf, applyOrder, applyRefund, emptyDay, summarise, type SalesDay } from './sales.js';

describe('own-checkout sales reading (tax-workbook own-checkout-sale-reading)', () => {
  it('reads a session amount in minor units and its currency; a missing amount is null, a coupon test is 0', () => {
    expect(amountOf({ amount_total: 699, currency: 'gbp' })).toEqual({ pence: 699, currency: 'GBP' });
    expect(amountOf({ amount_total: 0, currency: 'gbp' })).toEqual({ pence: 0, currency: 'GBP' });
    expect(amountOf({})).toEqual({ pence: null, currency: 'GBP' });
    expect(amountOf({ amount_total: -5, currency: 'x' })).toEqual({ pence: null, currency: 'GBP' });
  });

  it('counts paid orders, their pence and referrer tokens; £0 orders apart; refunds step the net down', () => {
    let day = applyOrder(emptyDay(), { pence: 699, currency: 'GBP', ref: 'guide' });
    day = applyOrder(day, { pence: 699, currency: 'GBP' });
    day = applyOrder(day, { pence: 0, currency: 'GBP', ref: 'guide' });
    expect(day).toMatchObject({ orders: 2, test: 1, gross_pence: 1398, refs: { guide: 1 } });
    day = applyRefund(day, 699);
    expect(day).toMatchObject({ refunds: 1, refunded_pence: 699 });
  });

  it('sums the 30-day window ending `to`, oldest day first, with the referrers summed too', () => {
    const paid = (ref?: string): SalesDay => applyOrder(emptyDay(), { pence: 699, currency: 'GBP', ref });
    const days: Record<string, SalesDay> = {
      '2026-10-01': paid(),
      '2026-11-01': paid('guide'),
      '2026-11-05': applyRefund(paid('guide'), 699),
      '2026-11-06': paid(),
    };
    const s = summarise('tax-workbook', days, '2026-11-05');
    expect(s).toMatchObject({ venture: 'tax-workbook', from: '2026-10-07', to: '2026-11-05', sales: 2, refunds: 1, gross_pence: 1398, refunded_pence: 699, net_pence: 699, refs: { guide: 2 } });
    expect(s.days.map((d) => d.date)).toEqual(['2026-11-01', '2026-11-05']);
  });
});
