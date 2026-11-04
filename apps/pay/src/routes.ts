import { PATHS } from './pay-converter/texts.ts';
import { DEDUCTION_PATHS } from './deductions/texts.ts';
import { OVERTIME_GUIDE_PATHS } from './guide/overtime.ts';
import { GUIDE_PATHS } from './guide/texts.ts';
import { ABOUT_PATHS } from './about/texts.ts';
import { LONG_TAIL_ROUTES } from './long-tail/routes.ts';
import { OVERTIME_PATHS } from './overtime/texts.ts';

/** Every page of Cuenta Horas as an English and Spanish pair; the sitemap is built from it. */
export interface Route {
  readonly id: string;
  /** What the page is, for its structured data. */
  readonly kind: 'home' | 'calculator' | 'article';
  readonly en: string;
  readonly es: string;
}

export const ROUTES: readonly Route[] = [
  { id: 'home', kind: 'home', en: '/', es: '/es' },
  {
    id: 'time-card',
    kind: 'calculator',
    en: '/time-card-calculator',
    es: '/es/calculadora-de-horas-trabajadas',
  },
  { id: 'overtime', kind: 'calculator', ...OVERTIME_PATHS },
  { id: 'hourly-to-salary', kind: 'calculator', ...PATHS.hourly },
  { id: 'salary-to-hourly', kind: 'calculator', ...PATHS.salary },
  { id: 'no-tax-on-overtime', kind: 'calculator', ...DEDUCTION_PATHS.overtime },
  { id: 'no-tax-on-tips', kind: 'calculator', ...DEDUCTION_PATHS.tips },
  { id: 'tax-guide', kind: 'article', ...GUIDE_PATHS },
  { id: 'overtime-guide', kind: 'article', ...OVERTIME_GUIDE_PATHS.federal },
  { id: 'california-overtime-guide', kind: 'article', ...OVERTIME_GUIDE_PATHS.california },
  { id: 'methodology', kind: 'article', en: '/methodology', es: '/es/metodologia' },
  { id: 'privacy', kind: 'article', en: '/privacy', es: '/es/privacidad' },
  { id: 'about', kind: 'article', ...ABOUT_PATHS },
  ...LONG_TAIL_ROUTES,
];
