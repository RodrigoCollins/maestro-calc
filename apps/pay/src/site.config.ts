/** Site-wide constants of Cuenta Horas. */
export const SITE = {
  name: 'Cuenta Horas',
  origin: 'https://cuentahoras.com',
  locales: ['en', 'es'],
  /** Launch switch: false keeps every page `noindex` (the 404 always is). */
  indexable: false,
} as const;
