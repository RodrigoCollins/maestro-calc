/** Site-wide constants of Cuánto Le Cobro. */
export const SITE = {
  name: 'Cuánto Le Cobro',
  origin: 'https://cuantolecobro.com',
  /** Spanish first: the root is Spanish and English lives under `/en`. */
  locales: ['es', 'en'],
  /** Launch switch: false keeps every page `noindex` until the owner buys the domain and flips it. */
  indexable: false,
  /** Google Analytics 4 measurement id; the loader runs on `origin` only (`public/analytics.js`). '' loads nothing. */
  gaId: '' as string,
  /** IndexNow key (public by design): `public/<key>.txt` holds it, and the deploy job sends it. */
  indexNowKey: 'c2f2efa5e91639c7b2ff3d985576590b',
} as const;
