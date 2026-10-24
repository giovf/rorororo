import { describe, expect, it } from 'vitest';
import { EXPENSE_CATEGORIES, RATES_2026_27 as R } from './rates.ts';
import {
  EXAMPLE_CASE,
  EXAMPLE_EXPECTED,
  class2Voluntary,
  class4,
  incomeTax,
  mileageClaim,
  personalAllowance,
  taxableProfit,
  useTradingAllowance,
  yearEnd,
} from './tax.ts';

describe('2026/27 income tax', () => {
  it('is zero inside the personal allowance', () => {
    expect(incomeTax(12_570, R)).toBe(0);
  });
  it('taxes the basic band at 20 %', () => {
    expect(incomeTax(31_900, R)).toBe(3_866);
    expect(incomeTax(50_270, R)).toBe(7_540);
  });
  it('taxes the higher band at 40 %', () => {
    // 80,000: 37,700 × 20 % + (80,000 − 12,570 − 37,700) × 40 % = 7,540 + 11,892
    expect(incomeTax(80_000, R)).toBe(19_432);
  });
  it('tapers the allowance above £100,000 and charges 45 % above £125,140', () => {
    expect(personalAllowance(110_000, R)).toBe(7_570);
    expect(personalAllowance(125_140, R)).toBe(0);
    // 150,000 with no allowance: 7,540 + (125,140 − 37,700) × 40 % + (150,000 − 125,140) × 45 %
    expect(incomeTax(150_000, R)).toBe(7_540 + 34_976 + 11_187);
  });
});

describe('National Insurance', () => {
  it('Class 4 is 6 % between the limits and 2 % above', () => {
    expect(class4(10_000, R)).toBe(0);
    expect(class4(31_900, R)).toBe(1_159.8);
    expect(class4(60_000, R)).toBe(2_262 + 194.6);
  });
  it('voluntary Class 2 only applies under the small profits threshold', () => {
    expect(class2Voluntary(5_000, true, R)).toBe(189.8);
    expect(class2Voluntary(8_000, true, R)).toBe(0);
    expect(class2Voluntary(5_000, false, R)).toBe(0);
  });
});

describe('mileage and the trading allowance', () => {
  it('steps cars down after 10,000 miles', () => {
    expect(mileageClaim(8_000, 0, 0, R)).toBe(3_600);
    expect(mileageClaim(12_000, 100, 50, R)).toBe(4_500 + 500 + 24 + 10);
  });
  it('prefers the allowance only when it beats actual deductions', () => {
    expect(useTradingAllowance(5_000, 600, R)).toBe(true);
    expect(useTradingAllowance(5_000, 1_200, R)).toBe(false);
    expect(useTradingAllowance(800, 0, R)).toBe(true);
    expect(taxableProfit(5_000, 600, true, R)).toBe(4_000);
    expect(taxableProfit(800, 0, true, R)).toBe(0);
    expect(taxableProfit(5_000, 1_200, false, R)).toBe(3_800);
  });
});

describe('the hand-worked example', () => {
  it('matches the figures worked by hand', () => {
    const mileage = mileageClaim(EXAMPLE_CASE.carMiles, 0, 0, R);
    expect(mileage).toBe(EXAMPLE_EXPECTED.mileage);
    const profit = taxableProfit(EXAMPLE_CASE.turnover, EXAMPLE_CASE.actualExpenses + mileage, false, R);
    expect(profit).toBe(EXAMPLE_EXPECTED.profit);
    const y = yearEnd(
      {
        tradingProfit: profit,
        otherTaxableIncome: 0,
        taxDeductedAtSource: 0,
        paymentsOnAccountMade: 0,
        payClass2Voluntarily: false,
      },
      R,
    );
    expect(y.incomeTax).toBe(EXAMPLE_EXPECTED.incomeTax);
    expect(y.class4).toBe(EXAMPLE_EXPECTED.class4);
    expect(y.totalDue).toBe(EXAMPLE_EXPECTED.totalDue);
    expect(y.balancingPayment).toBe(EXAMPLE_EXPECTED.totalDue);
    expect(y.paymentOnAccountEach).toBe(EXAMPLE_EXPECTED.paymentOnAccountEach);
  });
  it('skips payments on account when most tax was deducted at source or the bill is small', () => {
    const small = yearEnd(
      { tradingProfit: 15_000, otherTaxableIncome: 0, taxDeductedAtSource: 0, paymentsOnAccountMade: 0, payClass2Voluntarily: false },
      R,
    );
    expect(small.totalDue).toBe(486 + 145.8);
    expect(small.paymentOnAccountEach).toBe(0);
    const paye = yearEnd(
      { tradingProfit: 20_000, otherTaxableIncome: 40_000, taxDeductedAtSource: 10_000, paymentsOnAccountMade: 0, payClass2Voluntarily: false },
      R,
    );
    expect(paye.paymentOnAccountEach).toBe(0);
  });
});

describe('SA103S categories', () => {
  it('cover boxes 11 to 19, the capital box and one non-allowable bucket', () => {
    const boxes = EXPENSE_CATEGORIES.map((c) => c.box);
    expect(boxes).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 23, null]);
  });
});
