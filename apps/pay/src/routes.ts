import { PATHS } from './pay-converter/texts.ts';
import { DEDUCTION_PATHS } from './deductions/texts.ts';

/** Every page of Cuenta Horas as an English and Spanish pair; the sitemap is built from it. */
export interface Route {
  readonly id: string;
  readonly en: string;
  readonly es: string;
}

export const ROUTES: readonly Route[] = [
  { id: 'home', en: '/', es: '/es' },
  { id: 'time-card', en: '/time-card-calculator', es: '/es/calculadora-de-horas-trabajadas' },
  { id: 'hourly-to-salary', ...PATHS.hourly },
  { id: 'salary-to-hourly', ...PATHS.salary },
  { id: 'no-tax-on-overtime', ...DEDUCTION_PATHS.overtime },
  { id: 'no-tax-on-tips', ...DEDUCTION_PATHS.tips },
  { id: 'methodology', en: '/methodology', es: '/es/metodologia' },
];
