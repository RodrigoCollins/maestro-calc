import type { Lang } from '../time-card/receipt.ts';

/**
 * The editorial policy: who writes Cuenta Horas and how its figures are sourced, checked and
 * reviewed. Apart from its texts, so the route table and the layout import no guide.
 */
export const EDITORIAL_PATHS: Readonly<Record<Lang, string>> = {
  en: '/editorial-policy',
  es: '/es/politica-editorial',
};
