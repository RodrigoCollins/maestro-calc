/** Site-wide constants of Pool Figures. */
export const SITE = {
  name: 'Pool Figures',
  origin: 'https://poolfigures.com',
  locales: ['en', 'es'],
  /** Launch switch: open to search engines on 2026-11-04, months before the May to August season. */
  indexable: true,
  /** Google Analytics 4 measurement id; the loader runs on `origin` only (`public/analytics.js`). */
  gaId: 'G-VE973PXMS4' as string,
  /** IndexNow key (public by design): `public/<key>.txt` holds it, and the deploy job sends it. */
  indexNowKey: 'af8fd289898ace62cd0e8bd5094b3195',
} as const;
