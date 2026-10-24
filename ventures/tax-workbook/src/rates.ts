// 2026/27 rates and thresholds for a UK sole trader (England / Wales / Northern Ireland income tax
// bands). Every figure below is a named cell on the workbook's Setup tab, with its source, so a
// buyer can check and change it; the formulas never hard-code a number.
//
// Sources read 2026-10-24: gov.uk "Rates and allowances: National Insurance contributions"
// (2026 to 2027 table: Class 4 LPL £12,570, UPL £50,270, 6 % / 2 %; Class 2 small profits
// threshold £7,105, voluntary rate £3.65 a week); gov.uk "Income Tax rates and Personal Allowances"
// (personal allowance £12,570, basic-rate band £37,700, higher-rate limit £125,140, 20 / 40 / 45 %,
// taper £1 per £2 over £100,000 — frozen to 2030/31 by the Autumn Budget 2025); gov.uk "Expenses if
// you're self-employed: simplified expenses — vehicles" (45p / 25p after 10,000 miles, 24p
// motorcycle, 20p bicycle); gov.uk "Tax-free allowances on property and trading income" (£1,000);
// gov.uk "Understand your Self Assessment tax bill: payments on account" (two payments when the
// bill is over £1,000 and under 80 % was deducted at source); gov.uk "Making Tax Digital for Income
// Tax" (qualifying income over £50,000 from 6 April 2026, over £30,000 from 6 April 2027).

export interface TaxYearRates {
  taxYear: string;
  start: string;
  end: string;
  personalAllowance: number;
  paTaperStart: number;
  basicRateBand: number;
  higherRateLimit: number;
  basicRate: number;
  higherRate: number;
  additionalRate: number;
  class4Lower: number;
  class4Upper: number;
  class4MainRate: number;
  class4UpperRate: number;
  class2SmallProfitsThreshold: number;
  class2WeeklyVoluntary: number;
  tradingAllowance: number;
  mileageCarFirst: number;
  mileageCarThresholdMiles: number;
  mileageCarAfter: number;
  mileageMotorcycle: number;
  mileageBicycle: number;
  paymentsOnAccountMin: number;
  paymentsOnAccountSourceShare: number;
  mtdThreshold: number;
}

export const RATES_2026_27: TaxYearRates = {
  taxYear: '2026/27',
  start: '2026-04-06',
  end: '2027-04-05',
  personalAllowance: 12_570,
  paTaperStart: 100_000,
  basicRateBand: 37_700,
  higherRateLimit: 125_140,
  basicRate: 0.2,
  higherRate: 0.4,
  additionalRate: 0.45,
  class4Lower: 12_570,
  class4Upper: 50_270,
  class4MainRate: 0.06,
  class4UpperRate: 0.02,
  class2SmallProfitsThreshold: 7_105,
  class2WeeklyVoluntary: 3.65,
  tradingAllowance: 1_000,
  mileageCarFirst: 0.45,
  mileageCarThresholdMiles: 10_000,
  mileageCarAfter: 0.25,
  mileageMotorcycle: 0.24,
  mileageBicycle: 0.2,
  paymentsOnAccountMin: 1_000,
  paymentsOnAccountSourceShare: 0.8,
  mtdThreshold: 50_000,
};

/** SA103S (short self-employment pages, 2025 form) expense boxes the Expenses log maps to. */
export interface ExpenseCategory {
  /** Drop-down label in the Expenses log. */
  label: string;
  /** SA103S box, or null when the category is not an allowable expense. */
  box: number | null;
  note: string;
}

export const EXPENSE_CATEGORIES: readonly ExpenseCategory[] = [
  { label: 'Cost of goods bought for resale or goods used', box: 11, note: 'stock, materials, direct costs' },
  { label: 'Car, van and travel expenses', box: 12, note: 'fuel, parking, train, taxi, hotel; NOT if you claim mileage for the same vehicle' },
  { label: 'Wages, salaries and other staff costs', box: 13, note: 'employees and subcontractors, not your own drawings' },
  { label: 'Rent, rates, power and insurance costs', box: 14, note: 'business premises, or the business share of home costs' },
  { label: 'Repairs and maintenance of property and equipment', box: 15, note: 'repairs, not improvements' },
  { label: 'Phone, fax, stationery and other office costs', box: 16, note: 'phone, internet, software, postage, printing' },
  { label: 'Advertising and business entertainment costs', box: 17, note: 'ads, website, samples; entertaining clients is NOT allowable' },
  { label: 'Interest and bank and credit card financial charges', box: 18, note: 'business loan interest, bank and card fees' },
  { label: 'Other allowable business expenses', box: 19, note: 'accountancy, legal and professional fees, subscriptions, bad debts written off' },
  { label: 'Capital item (annual investment allowance, box 23)', box: 23, note: 'equipment, computers, vans bought for the business; claimed as a capital allowance, not an expense' },
  { label: 'Not allowable (private use, drawings, fines, depreciation)', box: null, note: 'kept for your records; never reaches the SA103 pack' },
];

export const INCOME_TYPES = ['Sales turnover (box 9)', 'Other business income (box 10)'] as const;
export const VEHICLE_TYPES = ['Car or van', 'Motorcycle', 'Bicycle'] as const;
export const QUARTER_BASES = ['Standard (6 April quarters)', 'Calendar (1 April quarters)'] as const;
export const PROFIT_METHODS = ['Auto (lower profit)', 'Actual expenses', 'Trading allowance'] as const;
