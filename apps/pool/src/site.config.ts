/** Site-wide constants of Pool Figures. */
export const SITE = {
  name: 'Pool Figures',
  origin: 'https://poolfigures.com',
  locales: ['en'],
  /** Launch switch: open to search engines on 2026-11-04, months before the May to August season. */
  indexable: true,
  /** Google Analytics 4 measurement id; the loader runs on `origin` only (`public/analytics.js`). */
  gaId: 'G-VE973PXMS4',
} as const;
