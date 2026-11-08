/** Site-wide constants of Bowl Figures. */
export const SITE = {
  name: 'Bowl Figures',
  origin: 'https://bowlfigures.com',
  locales: ['en'],
  /** Launch switch: open to search engines on 2026-11-08; false would keep every page `noindex` (the 404 always is). */
  indexable: true as boolean,
  /** Google Analytics 4 measurement id; the loader runs on `origin` only (`public/analytics.js`). */
  gaId: 'G-3NTFC4MK3R' as string,
  /** IndexNow key (public by design): `public/<key>.txt` holds it, and the deploy job sends it. */
  indexNowKey: 'e479169234dd94a0442e50568c49b81b',
} as const;
