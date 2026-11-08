/** Every page of Bowl Figures (English only); the e2e suites run over all of them. */
export const PAGES: readonly string[] = [
  '/',
  '/dog-food-calculator',
  '/cat-food-calculator',
  '/puppy-feeding-calculator',
  '/kitten-feeding-calculator',
  '/dog-chocolate-toxicity-calculator',
  '/dog-pregnancy-calculator',
  '/charts',
  '/dog-feeding-chart',
  '/puppy-feeding-chart',
  '/dog-chocolate-toxicity-chart',
  '/how-to-read-pet-food-label',
  '/dog-food-by-breed',
  '/my-dog-ate-chocolate',
  '/methodology',
  '/about',
  '/editorial-policy',
  '/privacy',
];

/**
 * Each calculator: the text of one figure at its starting values (worked out at build time, so it
 * reads with no script), and one edit worked out by hand with the figure it must show after it.
 */
export const CALCULATORS = [
  {
    path: '/dog-food-calculator',
    out: 'figure',
    initial: '2 ¾',
    // 80 lb = 36.287 kg, 70 x 36.287^0.75 x 1.6 = 1,655.9 kcal, / 360 = 4.60 cups, to the quarter
    edit: { field: 'weight', value: '80' },
    edited: '4 ½',
  },
  {
    path: '/puppy-feeding-calculator',
    out: 'figure',
    initial: '1 ½',
    // 8 lb puppy under 4 months: 70 x 3.629^0.75 x 3 = 552 kcal, 1.53 cups; 16 lb: 928.6 kcal, 2.58 cups
    edit: { field: 'weight', value: '16' },
    edited: '2 ½',
  },
  {
    path: '/cat-food-calculator',
    out: 'figure',
    initial: '¾',
    // 15 lb neutered cat: 70 x 6.804^0.75 x 1.2 = 353.9 kcal, / 350 = 1.01 cups
    edit: { field: 'weight', value: '15' },
    edited: '1',
  },
  {
    path: '/kitten-feeding-calculator',
    out: 'figure',
    initial: '½',
    // 2 lb kitten: 70 x 0.907^0.75 x 2.5 = 162.7 kcal; half from dry food at 350 kcal a cup is 0.23 cup
    edit: { field: 'wetShare', value: '50' },
    edited: '¼',
  },
  {
    path: '/dog-chocolate-toxicity-calculator',
    out: 'figure',
    initial: '7.2',
    // 2 oz = 56.699 g x 2.3 mg/g = 130.4 mg, over 9.072 kg = 14.4 mg/kg
    edit: { field: 'amount', value: '2' },
    edited: '14.4',
  },
  {
    path: '/dog-pregnancy-calculator',
    out: 'earliest',
    initial: 'Apr 28, 2026',
    // 1 April 2026 + 58 days = 29 May 2026
    edit: { field: 'month', value: '4' },
    edited: 'May 29, 2026',
  },
] as const;
