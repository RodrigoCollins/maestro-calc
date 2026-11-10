import { COUNTDOWNS, countdownPathOf, DAYS_BETWEEN_PATH } from '../dates/routes.ts';
import { LIVE_JOBS, pathOf, SHIFTS } from '../long-tail/routes.ts';

/** The built calculator pages of the route table. */
const ROUTED = [
  'time-card-calculator.html',
  'es/calculadora-de-horas-trabajadas.html',
  'overtime-calculator.html',
  'es/calculadora-de-horas-extra.html',
  'hours-calculator.html',
  'es/calculadora-de-horas.html',
  'minutes-to-decimal-hours.html',
  'es/minutos-a-horas-decimales.html',
  'military-time-converter.html',
  'es/convertidor-de-hora-militar.html',
  'hourly-to-salary-calculator.html',
  'salary-to-hourly-calculator.html',
  'es/de-pago-por-hora-a-sueldo-anual.html',
  'es/de-sueldo-anual-a-pago-por-hora.html',
  'pto-accrual-calculator.html',
  'es/calculadora-de-vacaciones-pagadas.html',
  'shift-differential-calculator.html',
  'es/calculadora-de-diferencial-de-turno.html',
  'tipped-wage-calculator.html',
  'es/calculadora-de-propinas-por-hora.html',
  'no-tax-on-overtime-calculator.html',
  'no-tax-on-tips-calculator.html',
  'es/calculadora-horas-extra-sin-impuestos.html',
  'es/calculadora-propinas-sin-impuestos.html',
] as const;

/** The embed of each (`src/embed/embeds.ts`): `/embed` + its path, the same one calculator script. */
export const EMBED_PAGES = ROUTED.map((page) => `embed/${page}`);

/**
 * The live time pages (`LIVE_JOBS`), in both languages: their one script, `src/client/time-now.ts`,
 * fills the answer from the visitor's clock, so each is held to a calculator page's script budget.
 */
export const LIVE_PAGES: readonly string[] = LIVE_JOBS.flatMap((job) =>
  (['en', 'es'] as const).map((lang) => `${pathOf(job, lang).slice(1)}.html`),
);

/**
 * The shift pages (`SHIFTS`), in both languages: their tool, the shift pay calculator under the
 * answer, runs on the hours calculator's script, `src/client/hours.ts`.
 */
export const SHIFT_PAGES: readonly string[] = SHIFTS.flatMap((shift) =>
  (['en', 'es'] as const).map((lang) => `${pathOf(shift, lang).slice(1)}.html`),
);

/**
 * The Spanish-only date pages: the days-between calculator, and each countdown, whose one script,
 * `src/client/countdown.ts`, counts from the visitor's own date. They have no embed.
 */
export const DATE_PAGES: readonly string[] = [
  `${DAYS_BETWEEN_PATH.slice(1)}.html`,
  ...COUNTDOWNS.map((job) => `${countdownPathOf(job).slice(1)}.html`),
];

/** The built pages that hold a calculator, each allowed one module script (`budgets.ts`). */
export const CALCULATOR_PAGES: readonly string[] = [
  ...ROUTED,
  ...EMBED_PAGES,
  ...LIVE_PAGES,
  ...SHIFT_PAGES,
  ...DATE_PAGES,
];
