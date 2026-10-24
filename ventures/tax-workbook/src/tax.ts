// The workbook's arithmetic as plain functions: the tests check these against a hand-worked
// 2026/27 case, and `recalc.ts` checks the LibreOffice-recalculated Example tab against them, so
// the spreadsheet formulas and this code have to agree.
import type { TaxYearRates } from './rates.ts';

const round2 = (n: number): number => Math.round(n * 100) / 100;

/** Personal allowance after the £1-per-£2 taper above the taper start. */
export function personalAllowance(totalIncome: number, r: TaxYearRates): number {
  return Math.max(0, r.personalAllowance - Math.max(0, totalIncome - r.paTaperStart) / 2);
}

/** Income tax on non-savings income (England, Wales, Northern Ireland bands). */
export function incomeTax(totalIncome: number, r: TaxYearRates): number {
  const pa = personalAllowance(totalIncome, r);
  const taxable = Math.max(0, totalIncome - pa);
  const additionalFrom = Math.max(0, r.higherRateLimit - pa);
  const basic = Math.min(taxable, r.basicRateBand) * r.basicRate;
  const higher =
    Math.min(Math.max(taxable - r.basicRateBand, 0), Math.max(additionalFrom - r.basicRateBand, 0)) *
    r.higherRate;
  const additional = Math.max(taxable - additionalFrom, 0) * r.additionalRate;
  return round2(basic + higher + additional);
}

/** Class 4 National Insurance on trading profit. */
export function class4(profit: number, r: TaxYearRates): number {
  const main = Math.min(Math.max(profit - r.class4Lower, 0), r.class4Upper - r.class4Lower) * r.class4MainRate;
  const upper = Math.max(profit - r.class4Upper, 0) * r.class4UpperRate;
  return round2(main + upper);
}

/** Voluntary Class 2 for a year when profit is under the small profits threshold. */
export function class2Voluntary(profit: number, pay: boolean, r: TaxYearRates): number {
  return pay && profit < r.class2SmallProfitsThreshold ? round2(r.class2WeeklyVoluntary * 52) : 0;
}

/** HMRC approved mileage: cars and vans step down after the threshold, cumulative over the year. */
export function mileageClaim(carMiles: number, motorcycleMiles: number, bicycleMiles: number, r: TaxYearRates): number {
  const first = Math.min(carMiles, r.mileageCarThresholdMiles) * r.mileageCarFirst;
  const after = Math.max(carMiles - r.mileageCarThresholdMiles, 0) * r.mileageCarAfter;
  return round2(first + after + motorcycleMiles * r.mileageMotorcycle + bicycleMiles * r.mileageBicycle);
}

/** Trading allowance versus actual deductions: true when the allowance gives the lower profit. */
export function useTradingAllowance(grossIncome: number, actualDeductions: number, r: TaxYearRates): boolean {
  return actualDeductions < Math.min(r.tradingAllowance, grossIncome);
}

export function taxableProfit(grossIncome: number, actualDeductions: number, useAllowance: boolean, r: TaxYearRates): number {
  const deduction = useAllowance ? Math.min(r.tradingAllowance, grossIncome) : actualDeductions;
  return round2(grossIncome - deduction);
}

export interface YearEndInput {
  tradingProfit: number;
  otherTaxableIncome: number;
  taxDeductedAtSource: number;
  paymentsOnAccountMade: number;
  payClass2Voluntarily: boolean;
}

export interface YearEndResult {
  totalIncome: number;
  personalAllowance: number;
  incomeTax: number;
  class4: number;
  class2: number;
  /** Tax + Class 4 + Class 2 less tax deducted at source: what the year costs. */
  totalDue: number;
  /** totalDue less payments on account already made: the 31 January balancing payment. */
  balancingPayment: number;
  /** Each of the two payments on account for the following year (0 when not required). */
  paymentOnAccountEach: number;
}

export function yearEnd(i: YearEndInput, r: TaxYearRates): YearEndResult {
  const totalIncome = i.tradingProfit + i.otherTaxableIncome;
  const tax = incomeTax(totalIncome, r);
  const c4 = class4(i.tradingProfit, r);
  const c2 = class2Voluntary(i.tradingProfit, i.payClass2Voluntarily, r);
  const liability = tax + c4; // Class 2 is outside payments on account
  const netLiability = liability - i.taxDeductedAtSource;
  const totalDue = round2(liability + c2 - i.taxDeductedAtSource);
  const poaRequired =
    netLiability > r.paymentsOnAccountMin && i.taxDeductedAtSource < r.paymentsOnAccountSourceShare * liability;
  return {
    totalIncome,
    personalAllowance: personalAllowance(totalIncome, r),
    incomeTax: tax,
    class4: c4,
    class2: c2,
    totalDue,
    balancingPayment: round2(totalDue - i.paymentsOnAccountMade),
    paymentOnAccountEach: poaRequired ? round2(netLiability / 2) : 0,
  };
}

/** The hand-worked case the Example tab shows: fixed inputs, figures checked by hand below. */
export const EXAMPLE_CASE = {
  turnover: 42_000,
  otherBusinessIncome: 0,
  actualExpenses: 6_500,
  carMiles: 8_000,
  motorcycleMiles: 0,
  bicycleMiles: 0,
  capitalItems: 0,
  otherTaxableIncome: 0,
  taxDeductedAtSource: 0,
  paymentsOnAccountMade: 0,
} as const;

/**
 * Hand-worked 2026/27: mileage 8,000 × 45p = £3,600; deductions £10,100; profit £31,900;
 * taxable £19,330 at 20 % = £3,866.00; Class 4 (31,900 − 12,570) × 6 % = £1,159.80;
 * total £5,025.80; payments on account £2,512.90 each.
 */
export const EXAMPLE_EXPECTED = {
  mileage: 3_600,
  profit: 31_900,
  incomeTax: 3_866,
  class4: 1_159.8,
  totalDue: 5_025.8,
  paymentOnAccountEach: 2_512.9,
} as const;
