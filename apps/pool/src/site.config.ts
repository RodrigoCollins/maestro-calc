/** Site-wide constants of Pool Figures. */
export const SITE = {
  name: 'Pool Figures',
  origin: 'https://poolfigures.com',
  locales: ['en'],
  /** Launch switch: open to search engines on 2026-11-04, months before the May to August season. */
  indexable: true,
  /** IndexNow key (public by design): `public/<key>.txt` holds it, and the deploy job sends it. */
  indexNowKey: 'af8fd289898ace62cd0e8bd5094b3195',
} as const;
