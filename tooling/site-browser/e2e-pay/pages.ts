/** Every page of Cuenta Horas, by language; the e2e suites run over all of them. */
export const PAGES = [
  { path: '/', lang: 'en' },
  { path: '/es', lang: 'es' },
  { path: '/time-card-calculator', lang: 'en' },
  { path: '/es/calculadora-de-horas-trabajadas', lang: 'es' },
  { path: '/methodology', lang: 'en' },
  { path: '/es/metodologia', lang: 'es' },
] as const;

export const TIME_CARD = PAGES.filter(({ path }) =>
  ['/time-card-calculator', '/es/calculadora-de-horas-trabajadas'].includes(path),
);

/** The default week of the time card: six days, 49.5 hours, $1,193.50 at $22 an hour. */
export const DEFAULT_PAY = '$1,193.50';
