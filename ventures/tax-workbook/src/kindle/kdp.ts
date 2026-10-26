// The KDP listing the owner pastes into the Bookshelf form (KINDLE.md mirrors it): title and
// subtitle (≤ 200 characters each), description (≤ 4,000 characters, plain text — KDP allows a
// little HTML but the plain version renders the same everywhere), seven keywords (≤ 50 characters
// each) and two categories, the pricing decision and the disclosures KDP asks for.
import { RATES_2026_27 as R } from '../rates.ts';
import { BOOK } from './content.ts';

export const KDP = {
  title: BOOK.title,
  subtitle: BOOK.subtitle,
  author: BOOK.author,
  language: 'English',
  description: `Know what you will owe before January — and what to send HMRC every quarter.

This is a plain-language guide to the tax a UK sole trader pays for the 2026/27 tax year (6 April 2026 to 5 April 2027), written for freelancers, tradespeople, consultants, drivers, makers and side-hustlers who are not VAT-registered and do their own books. Every rate is the 2026/27 figure published by HMRC, and every calculation is worked in full so you can follow it with your own numbers.

What it covers
• Registering as self-employed, the UTR, the 5 October deadline and the cash basis
• Records: the three logs to keep and how long to keep them
• Income: what counts, gross not net, grants and other business income
• Expenses: the nine SA103S categories, the costs people miss, the costs you cannot claim, working from home, equipment under the cash basis
• Mileage: the ${Math.round(R.mileageCarFirst * 100)}p/${Math.round(R.mileageCarAfter * 100)}p rates and the ${R.mileageCarThresholdMiles.toLocaleString('en-GB')}-mile step, with a worked year
• The £${R.tradingAllowance.toLocaleString('en-GB')} trading allowance: when it beats your real costs
• Income Tax: the Personal Allowance, the bands, the taper above £100,000, Scotland and Wales
• National Insurance: Class 4 at ${Math.round(R.class4MainRate * 100)}% and ${Math.round(R.class4UpperRate * 100)}%, and what the 2024 abolition of compulsory Class 2 means for your State Pension
• Paying: the 31 January bill, payments on account, reducing them, budget payment plans
• Making Tax Digital for Income Tax: who is in from April 2026, 2027 and 2028, the quarterly deadlines, the calendar-quarter election, the final declaration, software, penalty points
• The self-employment pages box by box
• A complete year start to finish, and a January checklist

Four worked examples run through the book: Sam, a plumber with a van; Priya, a consultant in the higher-rate band; Leo, who sells prints alongside a job; and Amy, whose first year made a small profit and who buys a State Pension year for £${(R.class2WeeklyVoluntary * 52).toFixed(2)}.

What it is not: tax advice, or a substitute for HMRC's own calculation. It uses the Income Tax bands for England, Wales and Northern Ireland and leaves out student loans, savings and dividend income, pension relief, the Child Benefit charge and losses, saying where each would come in.

2026/27 edition. Rates read from gov.uk in October 2026.`,
  keywords: [
    'self assessment tax return 2026 27',
    'sole trader tax guide uk',
    'making tax digital income tax',
    'self employed expenses allowable hmrc',
    'class 4 national insurance',
    'payments on account self assessment',
    'side hustle tax uk trading allowance',
  ],
  categories: [
    'Business, Finance & Law > Accounting > Taxation > Personal Taxation',
    'Business, Finance & Law > Small Business & Entrepreneurship > Self-Employment',
  ],
  /** KDP's AI-content question: the text is AI-generated under KDP's definition; images are not AI-generated. */
  aiDisclosure: {
    text: 'AI-generated (drafted with AI tools, then edited)',
    images: 'None — the cover is drawn from a hand-written SVG template',
    translations: 'None',
  },
  pricing: {
    royaltyOption: '70%',
    listPriceGbp: 4.99,
    territories: 'Worldwide rights; primary marketplace amazon.co.uk',
    launch: 'Kindle Countdown Deal at £2.99 for 7 days from the day the book goes live (a true launch price with a stated end date)',
    drm: 'Off',
    kdpSelect: 'Enrol (Countdown Deals require it; the book is not sold as an ebook anywhere else)',
  },
  marketplaces: ['amazon.co.uk (primary)', 'amazon.com', 'amazon.de', 'amazon.fr', 'amazon.es', 'amazon.it', 'amazon.ca', 'amazon.com.au'],
} as const;
