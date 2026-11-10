/** Site-wide constants of Bowl Figures. */
export const SITE = {
  name: 'Bowl Figures',
  origin: 'https://bowlfigures.com',
  locales: ['en', 'de'],
  /** Launch switch: open to search engines on 2026-11-08; false would keep every page `noindex` (the 404 always is). */
  indexable: true as boolean,
  /**
   * The German switch: while false, every page under `/de` says `noindex`, names no canonical and no
   * hreflang pair, and stays out of the sitemap and llms.txt. A German-targeted commercial site
   * needs an Impressum (§ 5 DDG) with the owner's name and address, which the owner has not given
   * yet: flip it in the same merge that publishes `src/de/impressum.ts` as a page.
   */
  deIndexable: false as boolean,
  /** Google Analytics 4 measurement id; the loader runs on `origin` only (`public/analytics.js`). */
  gaId: 'G-3NTFC4MK3R' as string,
  /** IndexNow key (public by design): `public/<key>.txt` holds it, and the deploy job sends it. */
  indexNowKey: 'e479169234dd94a0442e50568c49b81b',
} as const;
