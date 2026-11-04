import { LONG_TAIL_ROUTES } from '../../../apps/pay/src/long-tail/routes.ts';

/** The long-tail pages, read from their table (a module with no run-time import), in both languages. */
const LONG_TAIL = LONG_TAIL_ROUTES.flatMap(({ en, es }) => [
  { path: en, lang: 'en' as const },
  { path: es, lang: 'es' as const },
]);

/** Every page of Cuenta Horas, by language; the e2e suites run over all of them. */
export const PAGES = [
  { path: '/', lang: 'en' },
  { path: '/es', lang: 'es' },
  { path: '/time-card-calculator', lang: 'en' },
  { path: '/es/calculadora-de-horas-trabajadas', lang: 'es' },
  { path: '/overtime-calculator', lang: 'en' },
  { path: '/es/calculadora-de-horas-extra', lang: 'es' },
  { path: '/methodology', lang: 'en' },
  { path: '/es/metodologia', lang: 'es' },
  { path: '/about', lang: 'en' },
  { path: '/es/acerca', lang: 'es' },
  { path: '/hourly-to-salary-calculator', lang: 'en' },
  { path: '/salary-to-hourly-calculator', lang: 'en' },
  { path: '/es/de-pago-por-hora-a-sueldo-anual', lang: 'es' },
  { path: '/es/de-sueldo-anual-a-pago-por-hora', lang: 'es' },
  { path: '/no-tax-on-overtime-calculator', lang: 'en' },
  { path: '/no-tax-on-tips-calculator', lang: 'en' },
  { path: '/es/calculadora-horas-extra-sin-impuestos', lang: 'es' },
  { path: '/es/calculadora-propinas-sin-impuestos', lang: 'es' },
  { path: '/guides/how-to-calculate-overtime', lang: 'en' },
  { path: '/guides/california-overtime', lang: 'en' },
  { path: '/guides/how-to-read-a-pay-stub', lang: 'en' },
  { path: '/guides/unpaid-overtime-and-wages', lang: 'en' },
  { path: '/es/guias/como-leer-tu-talon-de-pago', lang: 'es' },
  { path: '/es/guias/si-no-te-pagan-las-horas-extra', lang: 'es' },
  { path: '/es/guias/como-calcular-horas-extra', lang: 'es' },
  { path: '/es/guias/horas-extra-en-california', lang: 'es' },
  ...LONG_TAIL,
] as const;

export const TIME_CARD = PAGES.filter(({ path }) =>
  ['/time-card-calculator', '/es/calculadora-de-horas-trabajadas'].includes(path),
);

/** The default week of the time card: six days, 49.5 hours, $1,193.50 at $22 an hour. */
export const DEFAULT_PAY = '$1,193.50';

export const OVERTIME = PAGES.filter(({ path }) =>
  ['/overtime-calculator', '/es/calculadora-de-horas-extra'].includes(path),
);
