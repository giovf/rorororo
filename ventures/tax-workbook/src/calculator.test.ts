import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { bundleCalculator, BUNDLE } from './calculator.ts';
import { estimate, mtdPhase } from './calculator-core.ts';
import { RATES_2026_27 as R } from './rates.ts';
import { EXAMPLE_CASE, EXAMPLE_EXPECTED, yearEnd } from './tax.ts';

describe('free tax estimate (calculator-core)', () => {
  it('agrees with the workbook year end on the hand-worked example', () => {
    // the Example tab: £42,000 turnover, £6,500 expenses + 8,000 car miles (£3,600) = £10,100 deducted
    const e = estimate({
      income: EXAMPLE_CASE.turnover,
      expenses: EXAMPLE_CASE.actualExpenses + EXAMPLE_EXPECTED.mileage,
      otherIncome: EXAMPLE_CASE.otherTaxableIncome,
      taxAtSource: EXAMPLE_CASE.taxDeductedAtSource,
      poaMade: EXAMPLE_CASE.paymentsOnAccountMade,
      class2Voluntary: false,
    });
    expect(e.useAllowance).toBe(false);
    expect(e.profit).toBe(EXAMPLE_EXPECTED.profit);
    expect(e.incomeTax).toBe(EXAMPLE_EXPECTED.incomeTax);
    expect(e.class4).toBe(EXAMPLE_EXPECTED.class4);
    expect(e.totalDue).toBe(EXAMPLE_EXPECTED.totalDue);
    expect(e.paymentOnAccountEach).toBe(EXAMPLE_EXPECTED.paymentOnAccountEach);
    expect(e.balancingPayment).toBe(EXAMPLE_EXPECTED.totalDue);
    expect(e).toMatchObject(
      yearEnd({ tradingProfit: EXAMPLE_EXPECTED.profit, otherTaxableIncome: 0, taxDeductedAtSource: 0, paymentsOnAccountMade: 0, payClass2Voluntarily: false }, R),
    );
    // with expenses under £1,000 the trading allowance wins
    const small = estimate({ income: 5_000, expenses: 400, otherIncome: 0, taxAtSource: 0, poaMade: 0, class2Voluntary: false });
    expect(small.useAllowance).toBe(true);
    expect(small.deduction).toBe(R.tradingAllowance);
    expect(small.profit).toBe(4_000);
  });

  it('treats blanks and negatives as zero and names the MTD phase from turnover', () => {
    const zero = estimate({ income: Number.NaN, expenses: -5, otherIncome: 0, taxAtSource: 0, poaMade: 0, class2Voluntary: false });
    expect(zero.profit).toBe(0);
    expect(zero.totalDue).toBe(0);
    expect(mtdPhase(50_000)).toBe('april-2026');
    expect(mtdPhase(49_999.99)).toBe('april-2027');
    expect(mtdPhase(30_000)).toBe('april-2027');
    expect(mtdPhase(20_000)).toBe('april-2028');
    expect(mtdPhase(19_999)).toBe('none');
    expect(estimate({ income: 60_000, expenses: 20_000, otherIncome: 0, taxAtSource: 0, poaMade: 0, class2Voluntary: false }).mtd).toBe('april-2026');
  });

  it('keeps the committed bundle current with the sources', async () => {
    expect(existsSync(BUNDLE), `${path.relative(process.cwd(), BUNDLE)} missing — npm run calculator -w @foundry/tax-workbook`).toBe(true);
    const committed = readFileSync(BUNDLE, 'utf8');
    const fresh = await bundleCalculator(BUNDLE, false);
    const strip = (s: string): string => s.replace(/^\/\*.*?\*\/\n?/, '');
    expect(strip(committed)).toBe(strip(fresh));
    expect(committed).toContain(R.taxYear);
    expect(committed).not.toMatch(/fetch\(|localStorage|XMLHttpRequest/);
  });

  it('is linked from the page with its structured data and the workbook as the next step', () => {
    const page = readFileSync(path.join(path.dirname(BUNDLE), 'sole-trader-tax-calculator.html'), 'utf8');
    expect(page).toContain('src="sole-trader-tax-calculator.js"');
    const ld = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(page)?.[1] ?? '';
    const data = JSON.parse(ld) as { '@type': string; offers: { price: string } };
    expect(data['@type']).toBe('WebApplication');
    expect(data.offers.price).toBe('0');
    for (const id of ['income', 'expenses', 'other', 'paye', 'poa', 'class2', 'results', 'r-total', 'r-mtd', 'rate-class4']) {
      expect(page, id).toContain(`id="${id}"`);
    }
    expect(page).toContain('tax-workbook.html');
    const sitemap = readFileSync(path.join(path.dirname(BUNDLE), 'sitemap.xml'), 'utf8');
    expect(sitemap).toContain('https://apps.gankdat.com/sole-trader-tax-calculator.html');
  });
});
