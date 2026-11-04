/** Every page of Pool Figures (English only); the e2e suites run over all of them. */
export const PAGES = [
  '/',
  '/methodology',
  '/opening-your-pool',
  '/pool-volume-calculator',
  '/pool-salt-calculator',
  '/pool-chlorine-calculator',
  '/pool-pump-size-calculator',
] as const;

/**
 * Each calculator: the figure it shows at its defaults (worked out at build time, so it reads with no
 * script), and one edit worked out by hand with the figure it must show after it.
 */
export const CALCULATORS = [
  {
    path: '/pool-volume-calculator',
    out: 'gallons',
    initial: '22,023',
    // 40 x 16 ft x 5.75 ft = 3,680 ft³, x 1,728 / 231
    edit: { field: 'length', value: '40 ft' },
    edited: '27,528',
  },
  {
    path: '/pool-salt-calculator',
    out: 'pounds',
    initial: '133.4',
    // 20,000 gal x (3,200 - 3,000) ppm x 8.34 / 1,000,000
    edit: { field: 'current', value: '3000' },
    edited: '33.4',
  },
  {
    path: '/pool-chlorine-calculator',
    out: 'liquid',
    initial: '41.0',
    // 10.24 fl oz x (5 - 1) ppm x 2 (20,000 gal)
    edit: { field: 'target', value: '5' },
    edited: '81.9',
  },
  {
    path: '/pool-pump-size-calculator',
    out: 'flow',
    initial: '55.6',
    // 36,000 gal / 360 min
    edit: { field: 'gallons', value: '36000' },
    edited: '100.0',
  },
] as const;
