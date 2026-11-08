/** Site-wide constants of Bowl Figures. */
export const SITE = {
  name: 'Bowl Figures',
  origin: 'https://bowlfigures.com',
  locales: ['en'],
  /**
   * Launch switch: closed to search engines until the owner buys the domain and flips it (every
   * page is `noindex`, with no canonical, and robots.txt stays open so the switch is one edit).
   */
  indexable: false as boolean,
  /** Google Analytics 4 measurement id; the loader runs on `origin` only (`public/analytics.js`). */
  gaId: 'G-3NTFC4MK3R' as string,
  /** IndexNow key (public by design): `public/<key>.txt` holds it, and the deploy job sends it. */
  indexNowKey: 'e479169234dd94a0442e50568c49b81b',
} as const;
