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
  { path: '/hours-calculator', lang: 'en' },
  { path: '/es/calculadora-de-horas', lang: 'es' },
  { path: '/minutes-to-decimal-hours', lang: 'en' },
  { path: '/es/minutos-a-horas-decimales', lang: 'es' },
  { path: '/methodology', lang: 'en' },
  { path: '/es/metodologia', lang: 'es' },
  { path: '/about', lang: 'en' },
  { path: '/es/acerca', lang: 'es' },
  { path: '/embed-calculators', lang: 'en' },
  { path: '/es/calculadoras-para-tu-sitio', lang: 'es' },
  { path: '/hourly-to-salary-calculator', lang: 'en' },
  { path: '/salary-to-hourly-calculator', lang: 'en' },
  { path: '/es/de-pago-por-hora-a-sueldo-anual', lang: 'es' },
  { path: '/es/de-sueldo-anual-a-pago-por-hora', lang: 'es' },
  { path: '/pto-accrual-calculator', lang: 'en' },
  { path: '/es/calculadora-de-vacaciones-pagadas', lang: 'es' },
  { path: '/shift-differential-calculator', lang: 'en' },
  { path: '/es/calculadora-de-diferencial-de-turno', lang: 'es' },
  { path: '/tipped-wage-calculator', lang: 'en' },
  { path: '/es/calculadora-de-propinas-por-hora', lang: 'es' },
  { path: '/no-tax-on-overtime-calculator', lang: 'en' },
  { path: '/no-tax-on-tips-calculator', lang: 'en' },
  { path: '/es/calculadora-horas-extra-sin-impuestos', lang: 'es' },
  { path: '/es/calculadora-propinas-sin-impuestos', lang: 'es' },
  { path: '/guides/how-to-calculate-overtime', lang: 'en' },
  { path: '/guides/california-overtime', lang: 'en' },
  { path: '/guides/how-to-read-a-pay-stub', lang: 'en' },
  { path: '/guides/unpaid-overtime-and-wages', lang: 'en' },
  { path: '/guides/paid-time-off-pto', lang: 'en' },
  { path: '/es/guias/vacaciones-pagadas', lang: 'es' },
  { path: '/guides/night-shift-differential-and-overtime', lang: 'en' },
  { path: '/es/guias/diferencial-nocturno-y-horas-extra', lang: 'es' },
  { path: '/guides/tipped-minimum-wage-and-tip-credit', lang: 'en' },
  { path: '/es/guias/salario-minimo-con-propinas-y-credito-por-propinas', lang: 'es' },
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

export const HOURS = PAGES.filter(({ path }) =>
  ['/hours-calculator', '/es/calculadora-de-horas'].includes(path),
);

export const DECIMAL_HOURS = PAGES.filter(({ path }) =>
  ['/minutes-to-decimal-hours', '/es/minutos-a-horas-decimales'].includes(path),
);

export const PTO = PAGES.filter(({ path }) =>
  ['/pto-accrual-calculator', '/es/calculadora-de-vacaciones-pagadas'].includes(path),
);

export const SHIFT = PAGES.filter(({ path }) =>
  ['/shift-differential-calculator', '/es/calculadora-de-diferencial-de-turno'].includes(path),
);

export const TIPPED = PAGES.filter(({ path }) =>
  ['/tipped-wage-calculator', '/es/calculadora-de-propinas-por-hora'].includes(path),
);

/** The calculator pages: each one is embedded at `/embed` + its path (`apps/pay/src/embed/embeds.ts`). */
const CALCULATOR_PATHS: readonly string[] = [
  '/time-card-calculator',
  '/es/calculadora-de-horas-trabajadas',
  '/overtime-calculator',
  '/es/calculadora-de-horas-extra',
  '/hours-calculator',
  '/es/calculadora-de-horas',
  '/minutes-to-decimal-hours',
  '/es/minutos-a-horas-decimales',
  '/hourly-to-salary-calculator',
  '/salary-to-hourly-calculator',
  '/es/de-pago-por-hora-a-sueldo-anual',
  '/es/de-sueldo-anual-a-pago-por-hora',
  '/pto-accrual-calculator',
  '/es/calculadora-de-vacaciones-pagadas',
  '/shift-differential-calculator',
  '/es/calculadora-de-diferencial-de-turno',
  '/tipped-wage-calculator',
  '/es/calculadora-de-propinas-por-hora',
  '/no-tax-on-overtime-calculator',
  '/no-tax-on-tips-calculator',
  '/es/calculadora-horas-extra-sin-impuestos',
  '/es/calculadora-propinas-sin-impuestos',
];

/** Every embed with the page it embeds and its language. */
export const EMBEDS = PAGES.filter(({ path }) => CALCULATOR_PATHS.includes(path)).map(
  ({ path, lang }) => ({ embed: `/embed${path}`, page: path, lang }),
);
