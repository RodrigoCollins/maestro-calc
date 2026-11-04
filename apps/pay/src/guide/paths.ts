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
