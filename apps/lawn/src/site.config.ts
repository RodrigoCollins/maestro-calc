/** Site-wide constants of Lawn Figures. */
export const SITE = {
  name: 'Lawn Figures',
  origin: 'https://lawnfigures.com',
  locales: ['en'],
  /**
   * Launch switch: closed until the owner buys the domain and flips it (pages carry `noindex`, no
   * canonical). Months before the March to April fertilizer peak (plans/lawn/PLAN.md).
   */
  indexable: false,
  /** Google Analytics 4 measurement id; empty until the property exists (`public/analytics.js`). */
  gaId: '' as string,
  /** IndexNow key (public by design): `public/<key>.txt` holds it, and the deploy job sends it. */
  indexNowKey: '5d1c7e0b9a3f4c28b6e1a7d4f09c3b52',
} as const;
