// The Kindle guide's text. Every figure is computed from `../rates.ts` and `../tax.ts` so the book,
// the workbook and the tests agree; the prose is plain XHTML fragments (one per chapter) that
// `epub.ts` wraps into files. Facts and their gov.uk sources are listed in the Sources chapter.
//
// KDP's content-quality rules shape the book (docs/exchange/spikes/kdp-sole-trader-tax-guide.md §1):
// it must stand alone — no redirect anywhere for "the full content", nothing whose purpose is to
// advertise, not a companion to another book — so the workbook is named once, in the back matter.

import { EXPENSE_CATEGORIES, RATES_2026_27 as R } from '../rates.ts';
import { class2Voluntary, class4, EXAMPLE_CASE as X, incomeTax, mileageClaim, personalAllowance, taxableProfit, useTradingAllowance, yearEnd } from '../tax.ts';

export interface Chapter {
  id: string;
  title: string;
  /** XHTML body fragment (well-formed; `&` written as `&amp;`). */
  body: string;
  /** Back matter is listed after the main chapters in the table of contents. */
  backMatter?: boolean;
}

export const BOOK = {
  title: 'UK Sole Trader Tax 2026/27',
  subtitle: 'Self Assessment, Making Tax Digital and the numbers — a plain guide for the self-employed',
  author: 'Foundry Tax Guides',
  publisher: 'Foundry Tax Guides',
  language: 'en-GB',
  /** Stable identifier for this edition (a new edition each April gets a new one). */
  identifier: 'urn:uuid:7f3f2a9e-2c6b-4a56-9d7e-20260406a001',
  edition: '2026/27 edition, first published October 2026',
} as const;

export const gbp = (n: number, pence = true): string =>
  `£${n.toLocaleString('en-GB', { minimumFractionDigits: pence ? 2 : 0, maximumFractionDigits: pence ? 2 : 0 })}`;
const pct = (n: number): string => `${Math.round(n * 1000) / 10}%`;
const pence = (n: number): string => `${Math.round(n * 100)}p`;

const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const p = (...lines: string[]): string => lines.map((l) => `<p>${l}</p>`).join('\n');
const h2 = (s: string): string => `<h2>${esc(s)}</h2>`;
const h3 = (s: string): string => `<h3>${esc(s)}</h3>`;
const ul = (items: string[]): string => `<ul>\n${items.map((i) => `<li>${i}</li>`).join('\n')}\n</ul>`;
const ol = (items: string[]): string => `<ol>\n${items.map((i) => `<li>${i}</li>`).join('\n')}\n</ol>`;
const tip = (s: string): string => `<div class="tip"><p>${s}</p></div>`;
function table(head: string[], rows: string[][], caption?: string): string {
  const th = head.map((h) => `<th>${h}</th>`).join('');
  const tr = rows.map((r) => `<tr>${r.map((c, i) => (i === 0 ? `<th scope="row">${c}</th>` : `<td>${c}</td>`)).join('')}</tr>`).join('\n');
  return `<table>${caption ? `<caption>${caption}</caption>` : ''}<thead><tr>${th}</tr></thead><tbody>\n${tr}\n</tbody></table>`;
}

/* ------------------------------------------------------------- worked figures */

/** The main worked year (the same case the companion spreadsheet's Example tab shows). */
export const SAM = (() => {
  const mileage = mileageClaim(X.carMiles, X.motorcycleMiles, X.bicycleMiles, R);
  const deductions = X.actualExpenses + mileage;
  const gross = X.turnover + X.otherBusinessIncome;
  const allowance = useTradingAllowance(gross, deductions, R);
  const profit = taxableProfit(gross, deductions, allowance, R);
  const year = yearEnd(
    { tradingProfit: profit, otherTaxableIncome: X.otherTaxableIncome, taxDeductedAtSource: X.taxDeductedAtSource, paymentsOnAccountMade: X.paymentsOnAccountMade, payClass2Voluntarily: false },
    R,
  );
  return { mileage, deductions, gross, profit, year, taxable: profit - year.personalAllowance };
})();

/** A higher-rate case: a consultant whose profit crosses the basic-rate limit. */
export const PRIYA = (() => {
  const profit = 58_000;
  const year = yearEnd({ tradingProfit: profit, otherTaxableIncome: 0, taxDeductedAtSource: 0, paymentsOnAccountMade: 0, payClass2Voluntarily: false }, R);
  const basicPart = R.basicRateBand * R.basicRate;
  const higherPart = (profit - R.personalAllowance - R.basicRateBand) * R.higherRate;
  const c4Main = (R.class4Upper - R.class4Lower) * R.class4MainRate;
  const c4Upper = (profit - R.class4Upper) * R.class4UpperRate;
  return { profit, year, basicPart, higherPart, c4Main, c4Upper };
})();

/** A side business where the trading allowance beats the real costs. */
export const LEO = (() => {
  const gross = 3_400;
  const costs = 310;
  const allowance = useTradingAllowance(gross, costs, R);
  return { gross, costs, allowance, profit: taxableProfit(gross, costs, allowance, R), profitActual: taxableProfit(gross, costs, false, R) };
})();

/** A low-profit year: under the Class 2 small profits threshold, voluntary contributions worth considering. */
export const AMY = (() => {
  const profit = 6_200;
  return { profit, voluntary: class2Voluntary(profit, true, R), tax: incomeTax(profit, R), c4: class4(profit, R) };
})();

/** Mileage over the step-down. */
export const MILES = (() => {
  const miles = 12_400;
  return { miles, claim: mileageClaim(miles, 0, 0, R), first: R.mileageCarThresholdMiles * R.mileageCarFirst, after: (miles - R.mileageCarThresholdMiles) * R.mileageCarAfter };
})();

/** Personal allowance taper. */
export const TAPER = (() => {
  const income = 110_000;
  return { income, pa: personalAllowance(income, R), lost: R.personalAllowance - personalAllowance(income, R) };
})();

const higherRateLimitTotal = R.personalAllowance + R.basicRateBand; // £50,270 of total income

/* -------------------------------------------------------------- the dates */

export const DATES = {
  yearStart: '6 April 2026',
  yearEnd: '5 April 2027',
  register: '5 October 2027',
  paperReturn: '31 October 2027',
  onlineReturn: '31 January 2028',
  payBalance: '31 January 2028',
  firstPoa: '31 January 2028',
  secondPoa: '31 July 2028',
  mtdQuarters: [
    ['Q1', '6 April – 5 July 2026', '1 April – 30 June 2026', '7 August 2026'],
    ['Q2', '6 July – 5 October 2026', '1 July – 30 September 2026', '7 November 2026'],
    ['Q3', '6 October 2026 – 5 January 2027', '1 October – 31 December 2026', '7 February 2027'],
    ['Q4', '6 January – 5 April 2027', '1 January – 31 March 2027', '7 May 2027'],
  ],
} as const;

/* ---------------------------------------------------------------- chapters */

function frontMatter(): Chapter {
  return {
    id: 'about',
    title: 'About this guide',
    body: `${h2('About this guide')}
${p(
  `This is a plain-language guide to the tax a self-employed sole trader in the United Kingdom pays for the <strong>2026/27 tax year</strong> — the year that runs from ${DATES.yearStart} to ${DATES.yearEnd}. It covers registering with HMRC, what counts as income, which costs you can set against it, the mileage and home-working short-cuts, the £${R.tradingAllowance.toLocaleString('en-GB')} trading allowance, how Income Tax and National Insurance are worked out, payments on account, the Self Assessment calendar and penalties, and Making Tax Digital for Income Tax, which starts for the first group of sole traders in this very year. Every figure is the ${R.taxYear} rate published by HMRC on gov.uk, read in October 2026, and every calculation is shown so you can follow it with your own numbers.`,
  `<strong>Who it is for.</strong> A sole trader with one business — a freelancer, a tradesperson, a consultant, a side-hustler selling online, a driver, a tutor, a cleaner, a maker — who is not VAT-registered, is not in a partnership and does not run a limited company. It uses the Income Tax bands for England, Wales and Northern Ireland; Scottish rates and bands differ, and a note in chapter 8 says what changes.`,
  `<strong>What it is not.</strong> It is not tax advice and it is not a substitute for HMRC's own calculation, which is the one you pay. It leaves out the things that make a return complicated — student loan repayments, savings and dividend income, pension and Gift Aid relief, the Marriage Allowance, the High Income Child Benefit Charge, losses brought forward and Capital Gains Tax — and says where they would come in so you know to look. If your affairs include any of those, or your turnover is near the VAT threshold, an accountant's fee is usually money well spent, and it is an allowable expense.`,
  `<strong>How to read it.</strong> The chapters run in the order a tax year does: set up, record, claim, work out, pay, and from this year, report every quarter. Four people appear throughout as worked examples — Sam, a self-employed plumber with a van; Priya, a consultant whose profit crosses into higher-rate tax; Leo, who sells prints online alongside a job; and Amy, whose first year made a small profit. Their figures are worked in full in the chapters and brought together in chapter 13.`,
  `<strong>How it was written.</strong> The text was drafted with the help of AI writing tools from HMRC's published 2026/27 rates and guidance pages, and the arithmetic in every example was produced and checked by the same code that builds the book, so the numbers in the tables and the numbers in the prose cannot disagree. Where HMRC's guidance has changed in the last two years (Class 2 National Insurance, the cash basis, the tax-year basis, Making Tax Digital), the chapter says what changed and when.`,
)}`,
  };
}

function ch1(): Chapter {
  return {
    id: 'ch01',
    title: '1. Being a sole trader: the basics',
    body: `${h2('1. Being a sole trader: the basics')}
${p(
  `A sole trader is a person who runs a business as themselves. There is no company, no shareholders and no separate legal person: you are the business, you keep all the profit after tax, and you are personally responsible for its debts. It is the simplest way to be self-employed in the UK, it costs nothing to set up, and the great majority of the UK's self-employed people trade this way.`,
  `The tax consequences follow from that simplicity. Your business profit is just another kind of income you receive, alongside a salary or a pension if you have one. It is taxed under <strong>Income Tax</strong> at the same rates and in the same bands as any other income, and it carries <strong>Class 4 National Insurance</strong>, the self-employed equivalent of the National Insurance an employee pays. You report both once a year on a <strong>Self Assessment tax return</strong>, and from April 2026 some sole traders also send HMRC a summary of their figures every quarter under <strong>Making Tax Digital for Income Tax</strong> (chapter 11).`,
)}
${h3('The tax year')}
${p(
  `The UK tax year runs from 6 April to 5 April. The year this guide covers is ${R.taxYear}: <strong>${DATES.yearStart} to ${DATES.yearEnd}</strong>. Everything you earn and spend in those dates belongs to this year's return, which is due by ${DATES.onlineReturn}, with the tax paid by the same date.`,
  `Since the 2024/25 tax year, every sole trader is taxed on the profit of the <strong>tax year itself</strong> — the "tax-year basis". Before then, a business could draw up accounts to any date and be taxed on the accounting year that ended in the tax year, which produced the notorious overlap-profit rules for new businesses. Those are gone. If you draw up accounts to 5 April (or 31 March, which HMRC treats as the same thing), your accounts and your tax year are one and the same, and that is what this guide assumes. If you keep accounts to another date you apportion two accounting years to the tax year, which is a job for an accountant.`,
)}
${h3('Do you need to register at all?')}
${p(
  `You must tell HMRC you are self-employed if your <strong>gross</strong> trading income — your takings before any costs — is more than £${R.tradingAllowance.toLocaleString('en-GB')} in the tax year. That figure is the trading allowance (chapter 7). Below it you may ignore the income entirely for tax, and you need not register, though you can choose to in order to pay voluntary National Insurance or to show a loss. The government has said it intends to raise this <em>reporting</em> threshold to £3,000 later in the parliament while leaving the £1,000 allowance itself unchanged; until that change is law the £1,000 figure applies, so check gov.uk before you rely on the higher one.`,
  `Register through the "Register for Self Assessment" service on gov.uk, choosing "self-employed". The deadline is <strong>${DATES.register}</strong> — the 5 October after the end of the tax year in which you started. HMRC posts you a ten-digit <strong>Unique Taxpayer Reference (UTR)</strong>, usually within ten working days, and sets up your online account. Registering late does not by itself attract a penalty, but it can leave you with too little time to file, and the filing and payment deadlines do not move.`,
)}
${h3('The cash basis')}
${p(
  `Since 6 April 2024 the <strong>cash basis</strong> is the default way for a sole trader to work out profit: income counts when the money arrives and a cost counts when you pay it. The old turnover limit for using it has been removed, as have the cap on deducting interest and the restriction on using losses. The alternative, "traditional accounting" (accruals), counts invoices when raised and bills when incurred and spreads the cost of equipment over years; you choose it by ticking a box on the return. For almost every sole trader the cash basis is simpler and matches the bank statement, and this guide assumes it. The one place it changes the arithmetic — equipment — is explained in chapter 5.`,
)}
${tip(
  `Open a separate bank account for the business on day one, even if it is just a second personal current account. Your records become the statement; a mixed account means sorting every line at the year end.`,
)}`,
  };
}

function ch2(): Chapter {
  const rows: string[][] = [
    ['Personal Allowance', gbp(R.personalAllowance, false), `tax-free; reduced by £1 for every £2 of income over ${gbp(R.paTaperStart, false)}`],
    ['Basic rate', `${pct(R.basicRate)} on the next ${gbp(R.basicRateBand, false)}`, `taxable income up to ${gbp(R.basicRateBand, false)} — total income up to ${gbp(higherRateLimitTotal, false)} with a full allowance`],
    ['Higher rate', `${pct(R.higherRate)}`, `from ${gbp(higherRateLimitTotal, false)} to ${gbp(R.higherRateLimit, false)} of total income`],
    ['Additional rate', `${pct(R.additionalRate)}`, `above ${gbp(R.higherRateLimit, false)}`],
    ['Class 4 NI, main rate', `${pct(R.class4MainRate)}`, `profit between ${gbp(R.class4Lower, false)} and ${gbp(R.class4Upper, false)}`],
    ['Class 4 NI, upper rate', `${pct(R.class4UpperRate)}`, `profit above ${gbp(R.class4Upper, false)}`],
    ['Class 2 NI', `voluntary, ${gbp(R.class2WeeklyVoluntary)} a week`, `only worth considering when profit is under the ${gbp(R.class2SmallProfitsThreshold, false)} small profits threshold`],
    ['Trading allowance', gbp(R.tradingAllowance, false), 'tax-free trading income, or a flat deduction instead of expenses'],
    ['Mileage, car or van', `${pence(R.mileageCarFirst)} then ${pence(R.mileageCarAfter)}`, `${pence(R.mileageCarFirst)} a mile for the first ${R.mileageCarThresholdMiles.toLocaleString('en-GB')} business miles in the year, ${pence(R.mileageCarAfter)} after`],
    ['Mileage, motorcycle', pence(R.mileageMotorcycle), 'every business mile'],
    ['Mileage, bicycle', pence(R.mileageBicycle), 'every business mile'],
    ['Payments on account', `half the previous bill, twice`, `when the bill is over ${gbp(R.paymentsOnAccountMin, false)} and less than ${pct(R.paymentsOnAccountSourceShare)} of it was taken at source`],
    ['Making Tax Digital', `from ${gbp(R.mtdThreshold, false)}`, `qualifying income over ${gbp(R.mtdThreshold, false)} from 6 April 2026; over £30,000 from April 2027; over £20,000 from April 2028`],
  ];
  return {
    id: 'ch02',
    title: '2. The 2026/27 numbers on one page',
    body: `${h2('2. The 2026/27 numbers on one page')}
${p(
  `Every rate and threshold used in this guide is in the table below. They are the ${R.taxYear} figures published by HMRC on gov.uk; the Income Tax thresholds and the Personal Allowance are frozen at these amounts until April 2031 under the Autumn Budget 2025, so expect the same numbers next year too. The National Insurance thresholds for Class 2 move each April with inflation.`,
)}
${table(['Item', '2026/27', 'Applies to'], rows, 'The 2026/27 rates and thresholds for a sole trader in England, Wales or Northern Ireland')}
${h3('The dates')}
${table(
  ['What', 'When'],
  [
    ['Tax year', `${DATES.yearStart} – ${DATES.yearEnd}`],
    ['Tell HMRC you are self-employed (new businesses)', DATES.register],
    ['Paper tax return', DATES.paperReturn],
    ['Online tax return', DATES.onlineReturn],
    ['Pay the balance for 2026/27', DATES.payBalance],
    ['First payment on account for 2027/28', DATES.firstPoa],
    ['Second payment on account for 2027/28', DATES.secondPoa],
    ['MTD quarterly updates (if you are in from April 2026)', DATES.mtdQuarters.map((q) => q[3]).join(', ')],
  ],
  'The Self Assessment and Making Tax Digital calendar for the 2026/27 tax year',
)}
${p(
  `Two things in that table surprise people in their first year. The tax for a year that ends in April is not due until the following <em>January</em>, nine months later — and then, if the bill is over ${gbp(R.paymentsOnAccountMin, false)}, half of next year's estimated bill is due on the same day, with the other half in July. Chapter 10 works through it; the short version is that the first January is the expensive one, and the way to be ready is to put a share of every payment aside as it arrives.`,
)}`,
  };
}

function ch3(): Chapter {
  return {
    id: 'ch03',
    title: '3. Records: what to keep and for how long',
    body: `${h2('3. Records: what to keep and for how long')}
${p(
  `HMRC does not tell you how to keep your books, only that you must keep records that let you fill in a complete and correct return, and keep them for <strong>at least five years after the 31 January filing deadline</strong> of the year they relate to — so your 2026/27 records stay until 31 January 2033. If you are in Making Tax Digital the records of income and expenses must be kept <em>digitally</em> (a spreadsheet counts, provided the figures reach HMRC through software without being retyped — chapter 11).`,
)}
${h3('The three logs')}
${p(`In practice a sole trader's year fits in three lists, kept as they happen rather than reconstructed in January:`)}
${ul([
  `<strong>Income</strong>: the date, who paid, what for, and the amount — one line per payment received. Keep the invoices or sales reports behind them (a marketplace's monthly statement is fine).`,
  `<strong>Expenses</strong>: the date, the supplier, what it was, the amount, and <em>which category</em> it belongs to (chapter 5 lists them — categorising as you go is what makes the return a copy-out rather than a sort). Keep the receipt; a photo is a record. Where a cost is partly private — a phone, a car, home broadband — note the business share.`,
  `<strong>Mileage</strong>: the date, where from and to, why, and the miles, for every business journey, if you claim the flat mileage rate (chapter 6). This is the record HMRC most often asks for and the one most people do not have.`,
])}
${h3('What else to keep')}
${ul([
  'Bank and card statements for the business account, and for any personal account the business used.',
  'Invoices you raised and bills you received, including the ones paid in cash.',
  'Records of money you took out for yourself ("drawings") and money you put in — neither is income or expense, but both explain the bank balance.',
  'Details of equipment you bought, with the date and the business use.',
  'If you work from home, a note of the hours per month (chapter 5) or the floor-area and bill figures behind an actual-cost claim.',
  'Grants or support payments received, which are usually taxable income (chapter 4).',
  'P60 or P45 from any employment in the year, and a pension statement, so the return can carry your other income and the tax already taken.',
])}
${p(
  `Records need not be paper. Scans and photos are acceptable provided they are legible and complete and you can produce them if asked. HMRC can charge a penalty of up to £3,000 for failing to keep records, and more importantly, without them an enquiry becomes HMRC's estimate against your word.`,
)}
${tip(
  `Do the books once a month, not once a year. Thirty lines take twenty minutes; three hundred and sixty lines take a lost weekend and a worse return.`,
)}`,
  };
}

function ch4(): Chapter {
  return {
    id: 'ch04',
    title: '4. Income: what counts',
    body: `${h2('4. Income: what counts')}
${p(
  `Your <strong>turnover</strong> is everything the business took in return for its goods or services during the year: invoices paid, cash in hand, card takings, marketplace payouts, tips if they come to you as a sole trader, and payments in kind at their market value. Under the cash basis it is the money that <em>arrived</em> between ${DATES.yearStart} and ${DATES.yearEnd} — an invoice sent in March and paid in April belongs to next year. On the return it goes in <strong>box 9</strong> of the self-employment pages.`,
  `Gross, not net. If a platform or marketplace takes its fee before paying you, your turnover is the full amount the customer paid; the fee is an expense (chapter 5). Report the £100 sale and the £12 fee, not £88. The same goes for card-processing charges.`,
)}
${h3('Other business income (box 10)')}
${p(
  `Money that came to the business but was not a sale: business grants and support payments, insurance payouts for lost stock, a rebate from a supplier, income from renting out a business asset, bank interest on a business account. It is taxable in the same way as turnover and sits in <strong>box 10</strong>. The one grant most people remember, the coronavirus support schemes, is long past; but local-authority business grants still arrive and still count.`,
)}
${h3('What is not income')}
${ul([
  `<strong>Money you put into the business</strong> from your own savings is capital, not income.`,
  `<strong>Loans</strong> you receive are not income (and repayments of the capital are not expenses; the interest is).`,
  `<strong>VAT</strong> does not arise: this guide assumes you are not VAT-registered. Keep an eye on the threshold, though — if your turnover over any rolling twelve months exceeds £90,000 you must register within 30 days, and the whole picture changes.`,
  `<strong>Your own wages</strong> do not exist. A sole trader has no salary; what you take out is drawings, which are neither income nor expense. You are taxed on the profit whether you took it out or left it in the account.`,
  `<strong>Selling a business asset</strong> (a van, a machine) is dealt with through capital allowances or, for larger items, Capital Gains Tax, not turnover — see chapter 5 for the cash-basis treatment.`,
  `<strong>Gifts</strong> with no connection to the trade are not income. A customer's tip <em>is</em>.`,
])}
${h3('Employment income alongside the business')}
${p(
  `If you also have a job, or a pension, that income is reported on its own pages of the return and sits <em>on top of</em> your trading profit for the Income Tax calculation. It does not change your Class 4 National Insurance, which looks only at the trading profit. It matters for the bands: Leo, who earns £38,000 from his job and makes a small profit from selling prints, pays basic-rate tax on the profit from the first pound, because his Personal Allowance is already used against his salary. His worked example is in chapter 7.`,
)}`,
  };
}

function ch5(): Chapter {
  const cats = EXPENSE_CATEGORIES.filter((c) => c.box !== null && c.box < 20);
  const rows = cats.map((c) => [`Box ${c.box}`, esc(c.label), esc(c.note)]);
  return {
    id: 'ch05',
    title: '5. Expenses: what you can claim',
    body: `${h2('5. Expenses: what you can claim')}
${p(
  `An expense is allowable when it is incurred <strong>wholly and exclusively</strong> for the business. That phrase comes straight from the legislation and it does two jobs: it lets you deduct the obvious costs of trading, and it stops you deducting the cost of living. A cost that has a private purpose as well as a business one can still be claimed <em>in part</em>, provided the business share can be identified — your phone bill, your car, your home broadband. A cost that cannot be separated — an ordinary suit you also wear to work, lunch on a normal working day — is not allowable at all.`,
  `The self-employment pages group expenses into nine boxes. The table lists them with the kinds of cost that belong in each; categorise every expense as you record it and the return fills itself in.`,
)}
${table(['Box', 'Category', 'What goes in it'], rows, 'The SA103S expense boxes, 2025 form (check the box numbers on the form for the year you file)')}
${p(
  `If your turnover is under £90,000 you may use the <em>short</em> self-employment pages (SA103S) and enter just the <strong>total</strong> of your expenses in box 20 rather than each category — but you still need the categories in your records, and HMRC can ask for the split.`,
)}
${h3('The costs people miss')}
${ul([
  'Accountancy, bookkeeping software and the fee for filing software (box 19).',
  'Bank charges on the business account, card-processing and marketplace fees, and interest on a business loan or overdraft (box 18).',
  'Professional subscriptions and trade-body memberships, and insurance — public liability, professional indemnity, tool cover (boxes 19 and 14).',
  'Training that <em>updates</em> skills you already use in the business. Since 2024 HMRC also accepts training that keeps you up to date with developments in your field, including new technology; training to start an entirely new trade is still not allowable.',
  'Protective clothing and uniform with a logo; not ordinary clothes.',
  'The business share of your mobile phone and home broadband, worked out by use.',
  'Postage, stationery, printing, small tools and consumables (box 16 or 11).',
  'Advertising, your website and its hosting, business cards, samples (box 17).',
])}
${h3('The costs you cannot claim')}
${ul([
  '<strong>Entertaining</strong> anyone other than your own staff — a client lunch is never allowable, however business-like.',
  '<strong>Fines and penalties</strong>, including parking fines on business journeys.',
  '<strong>Your own drawings</strong>, your own National Insurance and Income Tax, and pension contributions (those get relief elsewhere on the return, not as a business expense).',
  '<strong>Depreciation</strong> in traditional accounting — the tax system uses capital allowances instead.',
  '<strong>Ordinary clothing, ordinary meals and commuting</strong> to a fixed place of work.',
  '<strong>The private share</strong> of any mixed cost.',
])}
${h3('Working from home')}
${p(
  `If you work from home for 25 hours or more a month you can use HMRC's <strong>simplified expenses</strong> flat rate instead of apportioning your bills: £10 a month for 25–50 hours, £18 for 51–100 hours and £26 for 101 hours or more, for each month that qualifies. The flat rate covers heat, light, power and the home's running costs; you can still claim the business share of your phone and broadband separately. A year at the middle rate is £216 and needs only a note of your hours. The alternative — the business share of rent or mortgage interest, council tax, utilities and insurance, apportioned by rooms and hours — can be worth much more for a dedicated workshop, but needs the bills and the working.`,
)}
${h3('Equipment, vans and the cash basis')}
${p(
  `Under the cash basis, equipment you buy for the business — a laptop, tools, a machine, furniture — is simply an <strong>expense when you pay for it</strong>, in full, in the year you pay. There is nothing to spread. The exception is <strong>cars</strong>: a car is never a cash-basis expense; you either claim the flat mileage rate (chapter 6) or capital allowances on its cost, and most sole traders choose mileage. A <em>van</em> bought for the business can be a cash-basis expense; if you do that you cannot also claim mileage for it, so compare before you choose.`,
  `Under traditional accounting the same purchases are claimed through <strong>capital allowances</strong>. The Annual Investment Allowance lets you deduct 100 % of the cost of qualifying plant and machinery in the year of purchase, up to £1 million; it goes in <strong>box 23</strong> of the short pages rather than among the expenses. If an asset has private use you claim the business share. When you later sell an asset you claimed, the proceeds come back into the computation as a receipt (cash basis) or a balancing charge (capital allowances).`,
)}
${h3('Business use of a mixed cost: the method')}
${p(
  `Pick a reasonable basis, write it down and use it consistently. A phone used for the business 70 % of the time by call and data volume supports a 70 % claim. A car's business share is simply business miles over total miles — which is why the mileage log in chapter 6 matters even if you claim actual costs. HMRC accepts estimates when they are sensible and evidenced; it does not accept a round 50 % with nothing behind it.`,
)}
${tip(`A good rule for the grey areas: would you have spent this money if the business did not exist? If the honest answer is yes, the cost is private, whatever the receipt says.`)}`,
  };
}

function ch6(): Chapter {
  return {
    id: 'ch06',
    title: '6. Mileage: the flat rate and the 10,000-mile step',
    body: `${h2('6. Mileage: the flat rate and the 10,000-mile step')}
${p(
  `For most sole traders who drive, the simplest and often the most generous way to claim vehicle costs is HMRC's <strong>approved mileage rate</strong>: a fixed amount per business mile that covers fuel, insurance, road tax, servicing, repairs, depreciation and the vehicle's finance interest. You keep a log of business journeys and multiply. You do not need a single fuel receipt. Parking, tolls and congestion charges on business journeys are <em>not</em> covered by the rate and are claimed as travel expenses on top.`,
)}
${table(
  ['Vehicle', 'Rate'],
  [
    ['Car or van, first ' + R.mileageCarThresholdMiles.toLocaleString('en-GB') + ' business miles in the tax year', pence(R.mileageCarFirst) + ' a mile'],
    ['Car or van, every business mile after that', pence(R.mileageCarAfter) + ' a mile'],
    ['Motorcycle', pence(R.mileageMotorcycle) + ' a mile'],
    ['Bicycle', pence(R.mileageBicycle) + ' a mile'],
  ],
  'HMRC approved mileage rates for the self-employed, 2026/27',
)}
${p(
  `The ${R.mileageCarThresholdMiles.toLocaleString('en-GB')}-mile threshold is <em>per tax year</em> and <em>cumulative across the year</em>, not per vehicle or per month: mile 10,001 in February is paid at ${pence(R.mileageCarAfter)} however many cars you drove to get there. It resets on 6 April.`,
)}
${h3('A worked year')}
${p(
  `A mobile dog-groomer drives ${MILES.miles.toLocaleString('en-GB')} business miles in ${R.taxYear}. The first ${R.mileageCarThresholdMiles.toLocaleString('en-GB')} miles at ${pence(R.mileageCarFirst)} are ${gbp(MILES.first)}; the remaining ${(MILES.miles - R.mileageCarThresholdMiles).toLocaleString('en-GB')} miles at ${pence(R.mileageCarAfter)} are ${gbp(MILES.after)}; the claim is <strong>${gbp(MILES.claim)}</strong>, which goes in box 12 with any parking and tolls. Sam the plumber, in the main worked example, drives ${X.carMiles.toLocaleString('en-GB')} miles — all under the threshold — and claims ${X.carMiles.toLocaleString('en-GB')} × ${pence(R.mileageCarFirst)} = <strong>${gbp(SAM.mileage)}</strong>.`,
)}
${h3('What counts as a business mile')}
${ul([
  'Travel between jobs, to customers, suppliers, the bank, the accountant, a trade show.',
  'Travel from home to a customer when home is your base — most tradespeople and mobile services. If you rent a fixed workshop or office and go there every day, the trip from home to it is commuting and is not allowable.',
  'Not: the school run on the way to a job (claim the extra mileage only), personal errands, or any journey whose main purpose is private.',
])}
${h3('Rules of the choice')}
${ul([
  'Once you use the mileage rate for a vehicle you keep using it for as long as you own that vehicle. You can choose afresh for the next one.',
  'You cannot claim the mileage rate <em>and</em> the actual running costs or capital allowances for the same vehicle. You can still claim parking, tolls and — if the vehicle is used for business more than privately — the business share of its finance <em>interest</em> is already inside the rate, so do not add it.',
  'The rate is not available for a vehicle that has already had capital allowances claimed on it.',
  'A log is the proof. Date, from, to, purpose, miles. A notes app, a diary, a spreadsheet or a tracking app all work; a reconstruction in January does not.',
])}
${p(
  `When is the actual-cost method better? For an expensive vehicle driven few business miles, or a van bought outright under the cash basis (chapter 5), the real costs can exceed the flat rate. Run both numbers for the first year you own the vehicle, then stick with your choice.`,
)}`,
  };
}

function ch7(): Chapter {
  return {
    id: 'ch07',
    title: '7. The £1,000 trading allowance',
    body: `${h2(`7. The ${gbp(R.tradingAllowance, false)} trading allowance`)}
${p(
  `The trading allowance is a flat ${gbp(R.tradingAllowance, false)} of trading income a year that is tax-free. It works in one of two ways, and you choose which:`,
)}
${ol([
  `<strong>Full relief.</strong> If your gross trading income for the year is ${gbp(R.tradingAllowance, false)} or less, it is not taxable at all and you do not have to report it or register as self-employed. (If you have already registered, you still file a return, and you tick the box to say the allowance covers you.)`,
  `<strong>Partial relief.</strong> If your gross trading income is more than ${gbp(R.tradingAllowance, false)}, you may deduct the ${gbp(R.tradingAllowance, false)} <em>instead of</em> your actual expenses. You cannot have both. On the short pages the allowance goes in <strong>box 10.1</strong> and the expense boxes are left empty.`,
])}
${p(
  `Partial relief pays when your real allowable costs come to less than ${gbp(R.tradingAllowance, false)} — a common position for a side business with a laptop, a few supplies and no vehicle. It cannot create a loss (you cannot deduct more than your income), and if you have more than one trade it is one allowance across all of them, not one each. A sister allowance of the same size exists for property income, with its own rules.`,
)}
${h3('Leo’s prints')}
${p(
  `Leo has a full-time job and sells art prints online in the evenings. In ${R.taxYear} the shop takes ${gbp(LEO.gross, false)} gross (he reports the full amount; the marketplace fees are a cost) and his real costs — fees, packaging, postage — come to ${gbp(LEO.costs, false)}. With actual expenses his profit would be ${gbp(LEO.profitActual)}. Claiming the trading allowance instead, his profit is ${gbp(LEO.gross, false)} − ${gbp(R.tradingAllowance, false)} = <strong>${gbp(LEO.profit)}</strong>, which is ${gbp(LEO.profitActual - LEO.profit)} less to be taxed. Because his salary already uses his Personal Allowance, every pound of that profit is taxed at the basic rate: ${gbp(LEO.profit)} × ${pct(R.basicRate)} = <strong>${gbp(LEO.profit * R.basicRate)}</strong> of Income Tax. His profit is under the Class 4 lower limit so there is no National Insurance, and under the Class 2 small profits threshold — but his job already gives him a qualifying year, so voluntary Class 2 would buy him nothing (chapter 9).`,
  `Had Leo's costs been ${gbp(1_400, false)} — a new printer, say — actual expenses would have won, and he would have filled in the expense boxes and left box 10.1 empty. The rule of thumb: <strong>allowance if your costs are under ${gbp(R.tradingAllowance, false)}, expenses if they are over</strong>; and you may switch from year to year.`,
)}
${tip(`The allowance is set against <em>gross</em> income, so a side business that takes ${gbp(1_200, false)} and spends ${gbp(300, false)} is over the ${gbp(R.tradingAllowance, false)} and must be reported — with a profit of ${gbp(200, false)} after the allowance.`)}`,
  };
}

function ch8(): Chapter {
  const s = SAM;
  const pr = PRIYA;
  return {
    id: 'ch08',
    title: '8. Income Tax: from profit to the bill',
    body: `${h2('8. Income Tax: from profit to the bill')}
${p(
  `Your <strong>taxable profit</strong> is your turnover and other business income, less either your allowable expenses (including any mileage claim and, under the cash basis, equipment) or the trading allowance. Add any other income you had in the year — a salary, a pension, taxable benefits, interest above the savings allowance — and you have your <strong>total income</strong>. Income Tax is then charged in slices:`,
)}
${ol([
  `The <strong>Personal Allowance</strong> of ${gbp(R.personalAllowance, false)} is tax-free. (If your total income is over ${gbp(R.paTaperStart, false)} the allowance is reduced by £1 for every £2 above that, reaching zero at ${gbp(R.paTaperStart + R.personalAllowance * 2, false)}.)`,
  `The next ${gbp(R.basicRateBand, false)} — the <strong>basic-rate band</strong> — is taxed at ${pct(R.basicRate)}. With a full allowance that takes you to ${gbp(higherRateLimitTotal, false)} of total income.`,
  `Income above that up to ${gbp(R.higherRateLimit, false)} is taxed at the <strong>higher rate</strong> of ${pct(R.higherRate)}.`,
  `Income above ${gbp(R.higherRateLimit, false)} is taxed at the <strong>additional rate</strong> of ${pct(R.additionalRate)}.`,
])}
${p(
  `Other income is stacked <em>under</em> your trading profit for this purpose, so if you have a job the profit sits in the higher slices. Savings interest and dividends have their own allowances and rates and are stacked on top; they are outside this guide.`,
)}
${h3('Sam’s year')}
${p(
  `Sam is a plumber. Turnover ${gbp(X.turnover, false)}; allowable expenses ${gbp(X.actualExpenses, false)} (materials, insurance, phone, tools, accountancy); ${X.carMiles.toLocaleString('en-GB')} business miles at ${pence(R.mileageCarFirst)} = ${gbp(s.mileage)}. Total deductions ${gbp(s.deductions)}, far more than the trading allowance, so he claims expenses. <strong>Taxable profit ${gbp(s.profit)}.</strong> He has no other income.`,
)}
${table(
  ['Step', 'Working', '£'],
  [
    ['Total income', 'trading profit only', gbp(s.profit)],
    ['Personal Allowance', `income under ${gbp(R.paTaperStart, false)}, so the full amount`, gbp(s.year.personalAllowance)],
    ['Taxable income', `${gbp(s.profit)} − ${gbp(s.year.personalAllowance)}`, gbp(s.taxable)],
    [`Basic rate ${pct(R.basicRate)}`, `${gbp(s.taxable)} is within the ${gbp(R.basicRateBand, false)} band`, gbp(s.year.incomeTax)],
    ['Higher rate', 'none', gbp(0)],
    ['<strong>Income Tax</strong>', '', `<strong>${gbp(s.year.incomeTax)}</strong>`],
  ],
  `Sam's Income Tax for ${R.taxYear}`,
)}
${h3('Priya’s year: into the higher rate')}
${p(
  `Priya is a consultant with a taxable profit of ${gbp(pr.profit, false)} and no other income. Her Personal Allowance is ${gbp(R.personalAllowance, false)}, leaving ${gbp(pr.profit - R.personalAllowance, false)} taxable. The first ${gbp(R.basicRateBand, false)} is taxed at ${pct(R.basicRate)} = ${gbp(pr.basicPart)}; the remaining ${gbp(pr.profit - R.personalAllowance - R.basicRateBand, false)} at ${pct(R.higherRate)} = ${gbp(pr.higherPart)}. <strong>Income Tax ${gbp(pr.year.incomeTax)}.</strong> Notice that crossing into the higher rate does not tax the whole profit at 40 % — only the slice above ${gbp(higherRateLimitTotal, false)}.`,
)}
${h3('The taper above £100,000')}
${p(
  `Someone with total income of ${gbp(TAPER.income, false)} loses £1 of allowance for every £2 over ${gbp(R.paTaperStart, false)}: ${gbp(TAPER.income - R.paTaperStart, false)} over, so ${gbp(TAPER.lost, false)} of allowance lost, leaving ${gbp(TAPER.pa, false)}. The effect is a marginal rate of 60 % on income in the ${gbp(R.paTaperStart, false)}–${gbp(R.paTaperStart + R.personalAllowance * 2, false)} band, which is why a pension contribution that brings income back under ${gbp(R.paTaperStart, false)} is unusually valuable there. Relief for pension contributions is claimed on the return, not as a business expense.`,
)}
${h3('Scotland and Wales')}
${p(
  `If you live in Scotland you pay Scottish Income Tax on your trading profit: the same Personal Allowance but six bands with different rates and thresholds set by the Scottish Parliament, generally lower for small incomes and higher from around £27,000 upward. The tables in this guide are not Scottish. Wales sets its own rates in principle but has kept them equal to England's, so the figures here apply. National Insurance is UK-wide and unchanged in either case.`,
)}`,
  };
}

function ch9(): Chapter {
  const s = SAM;
  const pr = PRIYA;
  return {
    id: 'ch09',
    title: '9. National Insurance for the self-employed',
    body: `${h2('9. National Insurance for the self-employed')}
${p(
  `A sole trader pays <strong>Class 4</strong> National Insurance on trading profit, calculated with the Income Tax and paid with it through Self Assessment. There is no monthly deduction and no separate bill; it appears as a line on your tax calculation and is part of the January payment. It stops when you reach State Pension age (you pay for the full year in which you reach it, then no more).`,
)}
${table(
  ['Profit', 'Class 4 rate'],
  [
    [`up to ${gbp(R.class4Lower, false)} (the lower profits limit)`, 'nil'],
    [`${gbp(R.class4Lower, false)} to ${gbp(R.class4Upper, false)} (the upper profits limit)`, pct(R.class4MainRate)],
    [`above ${gbp(R.class4Upper, false)}`, pct(R.class4UpperRate)],
  ],
  'Class 4 National Insurance, 2026/27',
)}
${p(
  `<strong>Sam:</strong> profit ${gbp(s.profit)} − ${gbp(R.class4Lower, false)} = ${gbp(s.profit - R.class4Lower)} at ${pct(R.class4MainRate)} = <strong>${gbp(s.year.class4)}</strong>. <strong>Priya:</strong> the full band ${gbp(R.class4Upper - R.class4Lower, false)} at ${pct(R.class4MainRate)} = ${gbp(pr.c4Main)}, plus ${gbp(pr.profit - R.class4Upper, false)} above the upper limit at ${pct(R.class4UpperRate)} = ${gbp(pr.c4Upper)}; <strong>${gbp(pr.year.class4)}</strong>. Class 4 looks only at trading profit: a salary does not use up the ${gbp(R.class4Lower, false)}, and nor does it count towards the upper limit.`,
)}
${h3('Class 2: what changed in 2024')}
${p(
  `Until 5 April 2024 a sole trader also paid a flat weekly <strong>Class 2</strong> contribution, which was what built up entitlement to the State Pension and some benefits. From 6 April 2024 compulsory Class 2 was <strong>abolished</strong>. Now:`,
)}
${ul([
  `If your profit is at or above the <strong>small profits threshold</strong> of ${gbp(R.class2SmallProfitsThreshold, false)}, you are <em>treated</em> as having paid Class 2 and get a qualifying year for the State Pension without paying anything.`,
  `If your profit is <strong>below</strong> ${gbp(R.class2SmallProfitsThreshold, false)}, or you made a loss, you get no automatic credit, but you may pay Class 2 <strong>voluntarily</strong> at ${gbp(R.class2WeeklyVoluntary)} a week — ${gbp(R.class2WeeklyVoluntary * 52)} for a full year — to secure the qualifying year. You tick the box on the return and the amount is added to your bill.`,
])}
${p(
  `Is the voluntary payment worth it? A full new State Pension needs 35 qualifying years; each year is worth roughly 1/35th of it for life. ${gbp(R.class2WeeklyVoluntary * 52)} for a year that would otherwise be missing is one of the cheapest ways to buy pension entitlement there is — far cheaper than the Class 3 voluntary rate. It is worth nothing, though, if you already have a qualifying year from employment above the lower earnings limit or from National Insurance credits (child benefit, Universal Credit, carer's credit) in the same year. Check your record in your Personal Tax Account first.`,
)}
${h3('Amy’s first year')}
${p(
  `Amy started a small business and made a profit of ${gbp(AMY.profit, false)} in ${R.taxYear}, with no other income. Her Income Tax is ${gbp(AMY.tax)} (under the Personal Allowance) and her Class 4 is ${gbp(AMY.c4)} (under the lower profits limit). Her profit is under the ${gbp(R.class2SmallProfitsThreshold, false)} threshold, so she gets no automatic credit; she has no job and no credits. Paying voluntary Class 2 of <strong>${gbp(AMY.voluntary)}</strong> gives her a qualifying year for ${R.taxYear} — her whole tax bill, and a good use of it.`,
)}`,
  };
}

function ch10(): Chapter {
  const s = SAM;
  const y = s.year;
  return {
    id: 'ch10',
    title: '10. Paying: the January bill and payments on account',
    body: `${h2('10. Paying: the January bill and payments on account')}
${p(
  `Your ${R.taxYear} Income Tax and Class 4 National Insurance (and any voluntary Class 2) are due in one sum on <strong>${DATES.payBalance}</strong> — the same day as the online return. That is the "balancing payment". Then the system looks forward.`,
)}
${h3('Payments on account')}
${p(
  `If your ${R.taxYear} bill (Income Tax plus Class 4, after any tax taken at source) is <strong>more than ${gbp(R.paymentsOnAccountMin, false)}</strong>, and <strong>less than ${pct(R.paymentsOnAccountSourceShare)}</strong> of it was collected at source through PAYE, HMRC asks you to pay <strong>next year's</strong> tax in advance in two instalments, each <strong>half of this year's bill</strong>: the first on ${DATES.firstPoa} — the same day as the balancing payment — and the second on ${DATES.secondPoa}. Voluntary Class 2 is not included in the payments on account.`,
  `When you file the 2027/28 return in January 2029 the two payments on account are set against that year's actual bill, you pay any shortfall as the balancing payment, and the next pair of payments on account is set from the 2027/28 figure. Once the cycle is running you are paying roughly as you go; the shock is the first year, when the balancing payment for the year just gone and the first half of the year to come fall on the same day.`,
)}
${h3('Sam’s first January')}
${table(
  ['Due', 'What', '£'],
  [
    [DATES.payBalance, `Income Tax ${R.taxYear}`, gbp(y.incomeTax)],
    [DATES.payBalance, `Class 4 NI ${R.taxYear}`, gbp(y.class4)],
    [DATES.payBalance, '<strong>Balancing payment for 2026/27</strong>', `<strong>${gbp(y.totalDue)}</strong>`],
    [DATES.firstPoa, 'First payment on account for 2027/28 (half of ' + gbp(y.totalDue) + ')', gbp(y.paymentOnAccountEach)],
    [DATES.firstPoa, '<strong>Total to pay on 31 January 2028</strong>', `<strong>${gbp(y.totalDue + y.paymentOnAccountEach)}</strong>`],
    [DATES.secondPoa, 'Second payment on account for 2027/28', gbp(y.paymentOnAccountEach)],
  ],
  `What Sam pays and when, from a ${R.taxYear} bill of ${gbp(y.totalDue)}`,
)}
${p(
  `Sam's bill of ${gbp(y.totalDue)} on a profit of ${gbp(s.profit)} is about ${Math.round((y.totalDue / s.profit) * 100)} % of profit — a useful planning figure for a basic-rate sole trader: <strong>put aside a sixth of everything that comes in</strong> and the January bill is covered; put aside a quarter and the first-year double payment is too.`,
)}
${h3('Reducing payments on account')}
${p(
  `If you know next year's profit will be lower — you are winding down, taking leave, lost a contract — you can ask HMRC to reduce your payments on account to what you expect to owe, online or on form SA303. Be realistic: if the reduced payments turn out too low, interest runs on the shortfall from the original due dates. If they turn out too high, the excess is repaid or set against the next bill with interest in your favour.`,
)}
${h3('Budget payment plan')}
${p(
  `HMRC lets anyone who is up to date set up a <strong>budget payment plan</strong> by direct debit: a weekly or monthly amount of your choosing that accumulates against your next bill. It costs nothing, can be paused, and converts the January cliff into a standing order. It is not the same as a Time to Pay arrangement, which is for a bill you already cannot meet — that too can be set up online for bills under £30,000 if you ask before the deadline, with interest but no late-payment penalty while you keep to it.`,
)}
${h3('If you also have a job')}
${p(
  `Tax already taken from a salary through PAYE is credited on your return. If at least ${pct(R.paymentsOnAccountSourceShare)} of your total bill was collected that way, no payments on account are asked for. If your Self Assessment bill is under £3,000 and you file online by 30 December, you can ask for it to be collected through next year's PAYE code instead of paid in January.`,
)}`,
  };
}

function ch11(): Chapter {
  return {
    id: 'ch11',
    title: '11. Making Tax Digital for Income Tax',
    body: `${h2('11. Making Tax Digital for Income Tax')}
${p(
  `<strong>Making Tax Digital for Income Tax</strong> (MTD) is the biggest change to Self Assessment in a generation, and ${R.taxYear} is the year it begins. It replaces the once-a-year return with digital record-keeping and a short summary sent to HMRC <strong>every quarter</strong> through software, followed by a final declaration after the year end. It does not change how much tax you pay or when — the payment dates in chapter 10 are unchanged — but it changes how and how often you report.`,
)}
${h3('Who is in, and from when')}
${table(
  ['From', 'Qualifying income over', 'Measured on'],
  [
    ['6 April 2026', gbp(R.mtdThreshold, false), 'your 2024/25 tax return'],
    ['6 April 2027', '£30,000', 'your 2025/26 tax return'],
    ['6 April 2028', '£20,000', 'your 2026/27 tax return'],
  ],
  'The MTD for Income Tax timetable',
)}
${p(
  `"Qualifying income" is your <strong>gross</strong> income from self-employment and from property, added together, before expenses — turnover, not profit. A sole trader with ${gbp(45_000, false)} of turnover and ${gbp(8_000, false)} of rental income is over the ${gbp(R.mtdThreshold, false)} line for April 2026. HMRC reads the figure from the return two years back (the last one filed before the start of the year) and writes to tell you that you must join; you can also check and sign up yourself through your HMRC account. Income from a job or a pension does not count towards the threshold.`,
  `Below the threshold you carry on with the annual return exactly as before — but if your ${R.taxYear} turnover and property income together exceed £20,000, this year's return is the one that will bring you in from April 2028, so the quarterly habit is worth starting now.`,
)}
${h3('What you have to do')}
${ol([
  `<strong>Keep digital records</strong> of each business transaction — date, amount, category — in software or a spreadsheet. A spreadsheet is allowed provided it links to HMRC through "bridging" software so that totals are not retyped by hand; paper and a shoebox are not.`,
  `<strong>Send a quarterly update</strong> of your total income and total expenses by category, for the year to date, through MTD-compatible software by the deadline for each quarter. The update is cumulative, so an error in one quarter is simply corrected in the next; there is no separate amendment. No tax is paid at a quarterly update and no accounting adjustments are needed in it.`,
  `<strong>Make the final declaration</strong> by 31 January after the tax year, in software: here you add the year-end adjustments, the other income (salary, pension, interest), the reliefs and allowances, and confirm the figures. This replaces the tax return. HMRC's own free online return is not available to people in MTD; you file through the software.`,
])}
${h3('The quarters and their deadlines')}
${table(
  ['Quarter', 'Standard period', 'Calendar-quarter election', 'Update due by'],
  DATES.mtdQuarters.map((q) => [...q]),
  `MTD quarterly updates for ${R.taxYear}`,
)}
${p(
  `The standard quarters follow the tax year (the 6th to the 5th). You may instead <strong>elect calendar quarters</strong> — the 1st to the month end — which match most bank statements and invoicing runs; the election is made in software before your first update of the year and the deadlines are the same, one month and seven days after each standard quarter end. The totals the quarterly tab of any decent bookkeeping set-up shows — income, expenses by category, the difference — are exactly what the update asks for.`,
)}
${h3('Penalties under MTD')}
${p(
  `MTD brings a <strong>points-based</strong> late-submission penalty. Each late quarterly update or final declaration earns a point; at four points you pay a £200 penalty, and a further £200 for each late submission after that until you have had a run of four on-time submissions and the points expire. Points for the first year are being applied with a light touch, but the system is live. Late <em>payment</em> penalties for people in MTD are 3 % of the tax unpaid at 15 days, a further 3 % at 30 days and 10 % a year from day 31, on top of interest at the Bank of England base rate plus four points. The payment dates are unchanged from chapter 10.`,
)}
${h3('Software')}
${p(
  `HMRC publishes a list of MTD-compatible software on gov.uk, including free products for simple businesses and bridging tools that take totals from a spreadsheet. Choose one before your first quarter ends, enter your records, and send the first update early: a quarterly update sent on time with a figure you later correct costs nothing; a quarter missed costs a point. If you use an accountant or bookkeeper they can be authorised to send the updates for you.`,
)}
${h3('Exemptions')}
${p(
  `You can apply to be exempt if it is not reasonably practical for you to use digital tools because of age, disability, remoteness or religious belief, or if you are a trustee or a foster carer in certain cases. Everyone else above the threshold is in. Being bad at computers is not an exemption, but a bookkeeper's monthly hour is an allowable expense.`,
)}`,
  };
}

function ch12(): Chapter {
  const expenses = EXPENSE_CATEGORIES.filter((c) => c.box !== null && c.box < 20);
  const s = SAM;
  const rows: string[][] = [
    ['9', 'Your turnover', gbp(X.turnover), 'Everything the business took, gross of fees.'],
    ['10', 'Any other business income', gbp(X.otherBusinessIncome), 'Grants, insurance receipts, interest on the business account.'],
    ['10.1', 'Trading income allowance', '—', `Only if you claim the ${gbp(R.tradingAllowance, false)} instead of expenses; then leave boxes 11–20 empty.`],
    ...expenses.map((c) => [
      String(c.box),
      esc(c.label),
      c.box === 12 ? gbp(s.mileage) : c.box === 11 || c.box === 14 || c.box === 16 || c.box === 19 ? '…' : '—',
      c.box === 12 ? 'Travel costs plus the mileage claim.' : esc(c.note),
    ]),
    ['20', 'Total allowable expenses', gbp(s.deductions), 'The sum of 11–19. Under £90,000 of turnover you may enter only this total.'],
    ['21', 'Net profit', gbp(s.profit), 'Boxes 9 + 10 − 20, if positive.'],
    ['22', 'Net loss', '—', 'If 20 exceeds 9 + 10.'],
    ['23', 'Annual Investment Allowance', gbp(X.capitalItems), 'Capital allowances under traditional accounting; nil under the cash basis.'],
    ['31', 'Total taxable profits from this business', gbp(s.profit), 'The figure the Income Tax and Class 4 are charged on.'],
  ];
  return {
    id: 'ch12',
    title: '12. The self-employment pages, box by box',
    body: `${h2('12. The self-employment pages, box by box')}
${p(
  `Whether you file the annual return or the MTD final declaration, the self-employment figures are the same set of boxes. The <strong>short</strong> pages, SA103S, are for a business with turnover under £90,000 that is not claiming anything exotic; the full pages, SA103F, add detail you are unlikely to need. The box numbers below follow the 2025 SA103S; HMRC occasionally renumbers, so check the form for the year you file. Sam's figures are shown as the example — his ${gbp(X.actualExpenses, false)} of expenses are spread over boxes 11, 14, 16 and 19 in his records and shown here only in the total.`,
)}
${table(['Box', 'Description', 'Sam', 'Note'], rows, 'SA103S, the figures from the chapters so far')}
${h3('The business details boxes')}
${p(
  `Before the figures, the pages ask for the description of your business, its start date if it began this year, whether you used the cash basis (tick it), whether your accounting date is 5 April (yes, in this guide), and whether you are claiming the trading allowance. Answer those first; they decide which figure boxes the software opens.`,
)}
${h3('Boxes you may meet and can usually skip')}
${ul([
  'Goods and services for your own use — if you took stock for yourself, add its selling price back here.',
  'Losses: this year’s loss can be set against your other income of the year, carried back, or carried forward against the trade. A first-year loss against a salary can produce a refund; it needs the full working.',
  'Construction Industry Scheme deductions, if a contractor withheld tax from your invoices — enter them so they are credited.',
  'Class 2 voluntary contributions — the tick box from chapter 9.',
  'Class 4 exemption — if you are under 16 or over State Pension age at the start of the year.',
])}
${p(`Everything else on the return — employment, pensions, interest, reliefs, student loan — sits on other pages and simply adds to the picture the software totals for you.`)}`,
  };
}

function ch13(): Chapter {
  const s = SAM;
  const y = s.year;
  return {
    id: 'ch13',
    title: '13. A complete year, start to finish',
    body: `${h2('13. A complete year, start to finish')}
${p(
  `Here is Sam's ${R.taxYear} brought together, in the order he would actually do it. He is a self-employed plumber working from home with a van, not VAT-registered, no other income, in his second year of trading, using the cash basis and the mileage rate.`,
)}
${h3('Through the year')}
${ol([
  `<strong>April 2026.</strong> Checks his records are digital (a spreadsheet that his bridging software reads); his 2024/25 turnover was under ${gbp(R.mtdThreshold, false)}, so he is not in MTD this year, but his ${R.taxYear} turnover will put him over £20,000 and bring him in from April 2028, so he keeps the quarterly habit anyway.`,
  `<strong>Each month.</strong> Enters every payment received (${gbp(X.turnover, false)} across the year), every cost with its category (${gbp(X.actualExpenses, false)}), and every business journey (${X.carMiles.toLocaleString('en-GB')} miles). Puts a quarter of each payment into a savings account for tax.`,
  `<strong>Each quarter end.</strong> Looks at income, expenses and profit to date against the ${DATES.mtdQuarters.map((q) => q[3].split(' ').slice(0, 2).join(' ')).join(', ')} deadlines he will have from 2028, so there are no surprises when they bind.`,
  `<strong>${DATES.yearEnd}.</strong> The year closes. He checks the bank balance explains itself: opening balance, plus income, minus expenses, minus drawings, equals closing balance.`,
])}
${h3('The computation')}
${table(
  ['Line', '£'],
  [
    ['Turnover (box 9)', gbp(X.turnover)],
    ['Allowable expenses (boxes 11–19 before mileage)', gbp(X.actualExpenses)],
    [`Mileage, ${X.carMiles.toLocaleString('en-GB')} miles × ${pence(R.mileageCarFirst)} (box 12)`, gbp(s.mileage)],
    ['Total expenses (box 20)', gbp(s.deductions)],
    [`Trading allowance instead? ${gbp(R.tradingAllowance, false)} is less than ${gbp(s.deductions)}`, 'no'],
    ['<strong>Taxable profit (boxes 21 and 31)</strong>', `<strong>${gbp(s.profit)}</strong>`],
    ['Personal Allowance', gbp(y.personalAllowance)],
    ['Taxable income', gbp(s.taxable)],
    [`Income Tax at ${pct(R.basicRate)}`, gbp(y.incomeTax)],
    [`Class 4 NI: (${gbp(s.profit)} − ${gbp(R.class4Lower, false)}) × ${pct(R.class4MainRate)}`, gbp(y.class4)],
    [`Class 2: profit above ${gbp(R.class2SmallProfitsThreshold, false)}, credited free`, gbp(0)],
    ['<strong>Total for 2026/27</strong>', `<strong>${gbp(y.totalDue)}</strong>`],
    [`Payments on account for 2027/28, each (bill over ${gbp(R.paymentsOnAccountMin, false)}, nothing at source)`, gbp(y.paymentOnAccountEach)],
    ['<strong>Due 31 January 2028</strong>', `<strong>${gbp(y.totalDue + y.paymentOnAccountEach)}</strong>`],
    ['<strong>Due 31 July 2028</strong>', `<strong>${gbp(y.paymentOnAccountEach)}</strong>`],
  ],
  `Sam's ${R.taxYear} computation`,
)}
${h3('After the year end')}
${ol([
  `<strong>Spring 2027.</strong> Files the return as soon as the figures are final — there is no advantage in waiting for January, and an early return gives nine months' notice of the exact bill. HMRC's calculation agrees with the table, because the inputs are the same.`,
  `<strong>Through 2027.</strong> The ${gbp(y.totalDue + y.paymentOnAccountEach)} he needs in January is ${Math.round(((y.totalDue + y.paymentOnAccountEach) / X.turnover) * 100)} % of his turnover; the quarter he set aside each month more than covers it.`,
  `<strong>${DATES.payBalance}.</strong> Pays ${gbp(y.totalDue)} for ${R.taxYear} and ${gbp(y.paymentOnAccountEach)} on account for 2027/28.`,
  `<strong>${DATES.secondPoa}.</strong> Pays the second ${gbp(y.paymentOnAccountEach)}. From here on, each January is a balancing payment plus the first instalment of the next year — roughly one year's tax a year, as it should be.`,
])}
${p(
  `Priya's year runs the same way with the figures from chapters 8 and 9: Income Tax ${gbp(PRIYA.year.incomeTax)} plus Class 4 ${gbp(PRIYA.year.class4)} = <strong>${gbp(PRIYA.year.totalDue)}</strong>, payments on account of ${gbp(PRIYA.year.paymentOnAccountEach)} each, and — because her 2024/25 turnover was over ${gbp(R.mtdThreshold, false)} — four quarterly updates through the year and a final declaration instead of a return. Leo's is a single line on the return alongside his employment pages, ${gbp(LEO.profit)} of profit and ${gbp(LEO.profit * R.basicRate)} of tax, collected through his PAYE code if he files by 30 December. Amy owes only her voluntary Class 2 of ${gbp(AMY.voluntary)} and a qualifying year is hers.`,
)}`,
  };
}

function ch14(): Chapter {
  return {
    id: 'ch14',
    title: '14. Deadlines, penalties and the January checklist',
    body: `${h2('14. Deadlines, penalties and the January checklist')}
${h3('Late filing (annual return)')}
${ul([
  '£100 the day after the deadline, even if you owe nothing or are due a refund.',
  'After three months, £10 a day for up to 90 days (£900).',
  'After six months, a further 5 % of the tax due or £300, whichever is more; the same again at twelve months.',
])}
${h3('Late payment (annual return, outside MTD)')}
${ul([
  'Interest from the due date at the Bank of England base rate plus four percentage points.',
  '5 % of the unpaid tax at 30 days, a further 5 % at six months and again at twelve months.',
  'A Time to Pay arrangement agreed <em>before</em> the deadline stops the penalties (not the interest) while you keep to it.',
])}
${p(`Inside MTD the points-based and 3 %/3 %/10 % regime of chapter 11 applies instead. In both systems a <strong>reasonable excuse</strong> — serious illness, bereavement, an HMRC service failure — can cancel a penalty on appeal; "I did not know" and "my accountant was late" do not qualify.`)}
${h3('Common mistakes')}
${ul([
  'Reporting takings net of platform or card fees instead of gross with the fee as an expense.',
  `Claiming the trading allowance <em>and</em> expenses, or claiming the allowance when costs exceed ${gbp(R.tradingAllowance, false)}.`,
  'Claiming client entertaining, fines, ordinary clothes or the private share of a mixed cost.',
  'No mileage log; or mileage rate plus fuel receipts for the same vehicle.',
  'Forgetting that the January payment includes a payment on account, and budgeting for half of it.',
  'Not telling HMRC about a change of address, so the UTR letter and the statements go astray.',
  'Leaving the return to the last week of January, when HMRC’s helplines are at their busiest and the software is at its slowest.',
])}
${h3('The January checklist')}
${ol([
  'Income log totals agree to the bank statements and the invoices.',
  'Every expense has a category and a receipt; mixed costs show the business share.',
  'Mileage log complete; the claim worked out with the 10,000-mile step.',
  `Trading allowance or expenses: the lower profit chosen, and only one of them entered.`,
  'Equipment: expensed (cash basis) or in box 23 (traditional accounting), not both.',
  'Other income gathered: P60, pension statement, interest certificates.',
  'Class 2: credited automatically, or the voluntary tick box considered.',
  'Payments on account already made (from your HMRC statement) entered so the balancing payment is right.',
  'HMRC’s calculation read and compared with your own before you pay.',
  'Money for 31 January — balance plus first payment on account — in the account.',
])}`,
  };
}

function sources(): Chapter {
  return {
    id: 'sources',
    title: 'Sources and figures',
    backMatter: true,
    body: `${h2('Sources and figures')}
${p(`Every rate in this guide was read from the following HMRC pages on gov.uk in October 2026 and applies to the ${R.taxYear} tax year unless a chapter says otherwise. Search gov.uk for the page title.`)}
${ul([
  `<strong>Rates and allowances: National Insurance contributions</strong> — Class 4 lower profits limit ${gbp(R.class4Lower, false)}, upper profits limit ${gbp(R.class4Upper, false)}, ${pct(R.class4MainRate)} and ${pct(R.class4UpperRate)}; Class 2 small profits threshold ${gbp(R.class2SmallProfitsThreshold, false)}, voluntary rate ${gbp(R.class2WeeklyVoluntary)} a week.`,
  `<strong>Income Tax rates and Personal Allowances</strong> — Personal Allowance ${gbp(R.personalAllowance, false)}, basic-rate band ${gbp(R.basicRateBand, false)}, higher-rate limit ${gbp(R.higherRateLimit, false)}, rates ${pct(R.basicRate)} / ${pct(R.higherRate)} / ${pct(R.additionalRate)}, taper from ${gbp(R.paTaperStart, false)}; thresholds frozen to April 2031 (Autumn Budget 2025).`,
  `<strong>Expenses if you're self-employed</strong> and <strong>Simplified expenses if you're self-employed</strong> — allowable costs, the home-working flat rates, vehicle rates ${pence(R.mileageCarFirst)} / ${pence(R.mileageCarAfter)} after ${R.mileageCarThresholdMiles.toLocaleString('en-GB')} miles, ${pence(R.mileageMotorcycle)} motorcycle, ${pence(R.mileageBicycle)} bicycle.`,
  `<strong>Tax-free allowances on property and trading income</strong> — the ${gbp(R.tradingAllowance, false)} trading allowance.`,
  `<strong>Cash basis</strong> — the default from 6 April 2024; the removal of the turnover, interest and loss limits.`,
  `<strong>Understand your Self Assessment tax bill: payments on account</strong> — the ${gbp(R.paymentsOnAccountMin, false)} and ${pct(R.paymentsOnAccountSourceShare)} tests; the 31 January and 31 July dates.`,
  `<strong>Self Assessment tax returns: deadlines and penalties</strong> — ${DATES.register}, ${DATES.paperReturn}, ${DATES.onlineReturn}; the late-filing and late-payment penalties.`,
  `<strong>Use Making Tax Digital for Income Tax</strong> and <strong>Check if you need to use Making Tax Digital for Income Tax</strong> — the ${gbp(R.mtdThreshold, false)} / £30,000 / £20,000 timetable, quarterly periods and the 7 August / November / February / May deadlines, the calendar-quarter election, the final declaration, software and exemptions.`,
  `<strong>Penalties for late submission</strong> and <strong>Penalties for late payment</strong> — the points system and the 3 % / 3 % / 10 % late-payment rates for MTD.`,
  `<strong>Self-employment (short) notes, SA103S</strong> — the box numbers of chapter 12 (2025 form).`,
  `<strong>Register for Self Assessment</strong> — the UTR and the 5 October deadline.`,
])}
${p(`Scottish Income Tax rates are set by the Scottish Parliament and published at gov.scot; Welsh rates at gov.wales.`)}`,
  };
}

function backMatter(): Chapter {
  return {
    id: 'colophon',
    title: 'About the author and this edition',
    backMatter: true,
    body: `${h2('About the author and this edition')}
${p(
  `<em>${esc(BOOK.title)}</em> is published by ${esc(BOOK.publisher)}, a small independent publisher of practical UK tax and record-keeping material for the self-employed. This is the ${esc(BOOK.edition)}. A new edition follows each April once HMRC publishes the year's rates.`,
  `The text was drafted with the help of AI writing tools and edited against HMRC's published guidance; the arithmetic in every example was produced and checked by the code that typesets the book, from the same rates listed in the Sources chapter, so a figure in a table and the same figure in the prose cannot disagree. Nothing in it is advice about your own affairs: HMRC's calculation is the one you pay, and an accountant is the person to ask about anything this guide said it leaves out.`,
  `The spreadsheet that keeps the three logs of chapter 3 and works the figures of chapter 13 the way this book does is the publisher's <em>UK Sole Trader Tax Workbook 2026/27</em>, sold separately; this guide is complete without it.`,
  `If you found an error, or a rate has changed since October 2026, the publisher would be glad to hear of it through the store's contact form, and the correction will appear in the next edition. Thank you for reading.`,
)}`,
  };
}

export function chapters(): Chapter[] {
  return [frontMatter(), ch1(), ch2(), ch3(), ch4(), ch5(), ch6(), ch7(), ch8(), ch9(), ch10(), ch11(), ch12(), ch13(), ch14(), sources(), backMatter()];
}

/** Plain text of a chapter body, for word counts and phrase checks. */
export function plainText(body: string): string {
  return body
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

export function wordCount(): number {
  return chapters().reduce((n, c) => n + plainText(c.body).split(' ').filter(Boolean).length, 0);
}
