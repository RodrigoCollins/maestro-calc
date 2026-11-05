import type { Lang } from '../time-card/receipt.ts';

/**
 * The paths of the pay stub and unpaid wages guides (MVP guides 3 and 6 of
 * plans/pago-del-trabajador/PLAN.md). They live apart from the texts so the guides can link one
 * another without importing each other's modules.
 */
export const PAY_STUB_GUIDE_PATHS: Readonly<Record<Lang, string>> = {
  en: '/guides/how-to-read-a-pay-stub',
  es: '/es/guias/como-leer-tu-talon-de-pago',
};

export const UNPAID_WAGES_GUIDE_PATHS: Readonly<Record<Lang, string>> = {
  en: '/guides/unpaid-overtime-and-wages',
  es: '/es/guias/si-no-te-pagan-las-horas-extra',
};

/** The paid time off guide: how PTO accrues and what federal and state law say about it. */
export const PTO_GUIDE_PATHS: Readonly<Record<Lang, string>> = {
  en: '/guides/paid-time-off-pto',
  es: '/es/guias/vacaciones-pagadas',
};

/** The night shift differential guide: whether the differential is in the overtime rate. */
export const SHIFT_GUIDE_PATHS: Readonly<Record<Lang, string>> = {
  en: '/guides/night-shift-differential-and-overtime',
  es: '/es/guias/diferencial-nocturno-y-horas-extra',
};

/** The tip credit guide: the tipped minimum wage and when the employer must top up. */
export const TIP_CREDIT_GUIDE_PATHS: Readonly<Record<Lang, string>> = {
  en: '/guides/tipped-minimum-wage-and-tip-credit',
  es: '/es/guias/salario-minimo-con-propinas-y-credito-por-propinas',
};
