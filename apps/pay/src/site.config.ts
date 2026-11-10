/** Site-wide constants of Cuenta Horas. */
export const SITE = {
  name: 'Cuenta Horas',
  origin: 'https://cuentahoras.com',
  locales: ['en', 'es'],
  /** Launch switch: true since 2026-11-03; false would keep every page `noindex` (the 404 always is). */
  indexable: true,
  /** Google Analytics 4 measurement id; the loader runs on `origin` only (`public/analytics.js`). */
  gaId: 'G-NNB8KG2TXZ' as string,
  /** Pinterest domain claim of the profile (public: it ships in every page). '' renders no meta tag. */
  pinterestVerify: '8ed159206fe46e99ba11ac3ac0b8bff3' as string,
  /** impact.com site ownership claim of the partner account (public: it ships in every page). */
  impactVerify: '3b9912e5-fe40-49d8-84ba-b6d47b3a9465',
  /** IndexNow key (public by design): `public/<key>.txt` holds it, and the deploy job sends it. */
  indexNowKey: 'dd860e1e00fb82df0feac833e84e8677',
} as const;
