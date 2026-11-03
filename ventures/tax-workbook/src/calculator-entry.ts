/// <reference lib="dom" />
// Browser entry for apps.gankdat.com/sole-trader-tax-calculator.html, bundled by calculator.ts into
// packages/landing/site/sole-trader-tax-calculator.js. No network, no storage, no tracking: the
// figures stay in the page.
import { estimate, type EstimateInput } from './calculator-core.ts';
import { RATES_2026_27 as R } from './rates.ts';

const gbp = (n: number): string =>
  `£${n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const pct = (n: number): string => `${Math.round(n * 100)}%`;

function num(id: string): number {
  const el = document.getElementById(id) as HTMLInputElement | null;
  return el ? Number(el.value.replace(/[£,\s]/g, '')) : 0;
}

function set(id: string, text: string): void {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function read(): EstimateInput {
  return {
    income: num('income'),
    expenses: num('expenses'),
    otherIncome: num('other'),
    taxAtSource: num('paye'),
    poaMade: num('poa'),
    class2Voluntary: (document.getElementById('class2') as HTMLInputElement | null)?.checked ?? false,
  };
}

const MTD_TEXT = {
  'april-2026': 'Your turnover is £50,000 or more: Making Tax Digital quarterly updates apply from April 2026.',
  'april-2027': 'Your turnover is £30,000 or more: Making Tax Digital quarterly updates apply from April 2027.',
  'april-2028': 'Your turnover is £20,000 or more: Making Tax Digital quarterly updates apply from April 2028.',
  none: 'Under £20,000 of turnover: no Making Tax Digital quarterly updates are scheduled for you yet.',
} as const;

export function render(): void {
  const e = estimate(read());
  set('r-deduction', `${gbp(e.deduction)} (${e.useAllowance ? 'the £1,000 trading allowance — lower than your expenses' : 'your expenses'})`);
  set('r-profit', gbp(e.profit));
  set('r-income', gbp(e.totalIncome));
  set('r-pa', gbp(e.personalAllowance));
  set('r-tax', gbp(e.incomeTax));
  set('r-class4', gbp(e.class4));
  set('r-class2', gbp(e.class2));
  set('r-total', gbp(e.totalDue));
  set('r-balance', gbp(e.balancingPayment));
  set('r-poa', e.paymentOnAccountEach > 0 ? `${gbp(e.paymentOnAccountEach)} each, on 31 January and 31 July` : 'none required');
  set('r-mtd', MTD_TEXT[e.mtd]);
  const out = document.getElementById('results');
  if (out) out.hidden = false;
}

function fillRates(): void {
  set('rate-pa', gbp(R.personalAllowance).replace('.00', ''));
  set('rate-basic', `${pct(R.basicRate)} to ${gbp(R.personalAllowance + R.basicRateBand).replace('.00', '')}`);
  set('rate-higher', `${pct(R.higherRate)} to ${gbp(R.higherRateLimit).replace('.00', '')}`);
  set('rate-additional', `${pct(R.additionalRate)} above`);
  set('rate-class4', `${Math.round(R.class4MainRate * 100)}% from ${gbp(R.class4Lower).replace('.00', '')} to ${gbp(R.class4Upper).replace('.00', '')}, then ${Math.round(R.class4UpperRate * 100)}%`);
  set('rate-class2', `${gbp(R.class2WeeklyVoluntary)} a week, voluntary under ${gbp(R.class2SmallProfitsThreshold).replace('.00', '')} of profit`);
}

if (typeof document !== 'undefined') {
  fillRates();
  const form = document.getElementById('calc');
  form?.addEventListener('submit', (ev) => {
    ev.preventDefault();
    render();
  });
  form?.addEventListener('input', () => {
    const out = document.getElementById('results');
    if (out && !out.hidden) render();
  });
}
