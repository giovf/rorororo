// The free estimate page's arithmetic (tax-workbook `free-tax-estimate-calculator-page`, 2026-11-03):
// the same functions the workbook's Tax tab and the Kindle guide use, so the page, the file and the
// book agree. Pure — the browser entry (calculator-entry.ts) wires it to the form; the tests run it
// against the hand-worked example.
import { RATES_2026_27, type TaxYearRates } from './rates.ts';
import { taxableProfit, useTradingAllowance, yearEnd, type YearEndResult } from './tax.ts';

export interface EstimateInput {
  /** Gross trading income for the year (box 9 + 10). */
  income: number;
  /** Allowable expenses, including mileage and the home-working flat rate. */
  expenses: number;
  /** Other taxable income: a job's salary, a pension — savings and dividends are left out. */
  otherIncome: number;
  /** Tax already paid through PAYE on that other income. */
  taxAtSource: number;
  /** Payments on account already made towards this year. */
  poaMade: number;
  /** Pay Class 2 voluntarily when profit is under the small profits threshold. */
  class2Voluntary: boolean;
}

/** When Making Tax Digital quarterly updates apply at this profit level (gov.uk's phased thresholds). */
export type MtdPhase = 'april-2026' | 'april-2027' | 'april-2028' | 'none';

export interface Estimate extends YearEndResult {
  useAllowance: boolean;
  deduction: number;
  profit: number;
  mtd: MtdPhase;
}

/** MTD for Income Tax: £50,000 from April 2026, £30,000 from April 2027, £20,000 from April 2028 (qualifying income = turnover, not profit). */
export const MTD_PHASES: readonly { from: MtdPhase; turnover: number }[] = [
  { from: 'april-2026', turnover: 50_000 },
  { from: 'april-2027', turnover: 30_000 },
  { from: 'april-2028', turnover: 20_000 },
];

export function mtdPhase(turnover: number): MtdPhase {
  for (const p of MTD_PHASES) if (turnover >= p.turnover) return p.from;
  return 'none';
}

const clean = (n: number): number => (Number.isFinite(n) && n > 0 ? n : 0);

export function estimate(input: EstimateInput, r: TaxYearRates = RATES_2026_27): Estimate {
  const income = clean(input.income);
  const expenses = clean(input.expenses);
  const useAllowance = useTradingAllowance(income, expenses, r);
  const profit = taxableProfit(income, expenses, useAllowance, r);
  const deduction = Math.round((income - profit) * 100) / 100;
  const year = yearEnd(
    {
      tradingProfit: profit,
      otherTaxableIncome: clean(input.otherIncome),
      taxDeductedAtSource: clean(input.taxAtSource),
      paymentsOnAccountMade: clean(input.poaMade),
      payClass2Voluntarily: Boolean(input.class2Voluntary),
    },
    r,
  );
  return { ...year, useAllowance, deduction, profit, mtd: mtdPhase(income) };
}
