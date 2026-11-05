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
  'hourly-to-salary-calculator.html',
  'salary-to-hourly-calculator.html',
  'es/de-pago-por-hora-a-sueldo-anual.html',
  'es/de-sueldo-anual-a-pago-por-hora.html',
  'pto-accrual-calculator.html',
  'es/calculadora-de-vacaciones-pagadas.html',
  'no-tax-on-overtime-calculator.html',
  'no-tax-on-tips-calculator.html',
  'es/calculadora-horas-extra-sin-impuestos.html',
  'es/calculadora-propinas-sin-impuestos.html',
] as const;

/** The embed of each (`src/embed/embeds.ts`): `/embed` + its path, the same one calculator script. */
export const EMBED_PAGES = ROUTED.map((page) => `embed/${page}`);

/** The built pages that hold a calculator, each allowed one module script (`budgets.ts`). */
export const CALCULATOR_PAGES = [...ROUTED, ...EMBED_PAGES] as const;
