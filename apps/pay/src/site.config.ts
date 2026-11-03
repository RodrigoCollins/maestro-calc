/** Site-wide constants of Cuenta Horas. */
export const SITE = {
  name: 'Cuenta Horas',
  origin: 'https://cuentahoras.com',
  locales: ['en', 'es'],
  /** Launch switch: true since 2026-11-03; false would keep every page `noindex` (the 404 always is). */
  indexable: true,
} as const;
