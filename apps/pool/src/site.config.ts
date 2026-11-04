/** Site-wide constants of Pool Figures. */
export const SITE = {
  name: 'Pool Figures',
  origin: 'https://poolfigures.com',
  locales: ['en'],
  /** Launch switch: false keeps every page `noindex` until the calculators are live (target March 2027). */
  indexable: false,
  /** IndexNow key (public by design): `public/<key>.txt` holds it, and the deploy job sends it. */
  indexNowKey: 'af8fd289898ace62cd0e8bd5094b3195',
} as const;
