/** Site-wide constants of Lawn Figures. */
export const SITE = {
  name: 'Lawn Figures',
  origin: 'https://lawnfigures.com',
  locales: ['en'],
  /** Launch switch: open to search engines on 2026-11-08, months before the March to April fertilizer peak. */
  indexable: true,
  /** Google Analytics 4 measurement id; the loader runs on `origin` only (`public/analytics.js`). */
  gaId: 'G-L7CC69GZMG' as string,
  /** IndexNow key (public by design): `public/<key>.txt` holds it, and the deploy job sends it. */
  indexNowKey: '5d1c7e0b9a3f4c28b6e1a7d4f09c3b52',
} as const;
