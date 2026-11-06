import { PATHS } from './pay-converter/texts.ts';
import { DEDUCTION_PATHS } from './deductions/texts.ts';
import { OVERTIME_GUIDE_PATHS } from './guide/overtime.ts';
import {
  HOURS_WORKED_GUIDE_PATHS,
  MINIMUM_WAGE_2027_GUIDE_PATHS,
  MINIMUM_WAGE_STATES_GUIDE_PATHS,
  OVERTIME_STATES_GUIDE_PATHS,
  PAY_STUB_GUIDE_PATHS,
  PTO_GUIDE_PATHS,
  SHIFT_GUIDE_PATHS,
  TIP_CREDIT_GUIDE_PATHS,
  TIPPED_STATES_GUIDE_PATHS,
  UNPAID_WAGES_GUIDE_PATHS,
  W2_BOX_12_GUIDE_PATHS,
} from './guide/paths.ts';
import { GUIDE_PATHS } from './guide/texts.ts';
import { ABOUT_PATHS } from './about/texts.ts';
import { EMBED_PATHS } from './embed/texts.ts';
import { DATA_PATHS } from './data/texts.ts';
import { DECIMAL_HOURS_PATHS, HOURS_PATHS } from './hours/texts.ts';
import { LONG_TAIL_ROUTES } from './long-tail/routes.ts';
import { STATE_ROUTES, STATES_ROUTE } from './states/routes.ts';
import { OVERTIME_PATHS } from './overtime/texts.ts';
import { PTO_PATHS } from './pto/texts.ts';
import { SHIFT_PATHS } from './shift/texts.ts';
import { TIPPED_PATHS } from './tipped/texts.ts';

/** Every page of Cuenta Horas as an English and Spanish pair; the sitemap is built from it. */
export interface Route {
  readonly id: string;
  /** What the page is, for its structured data. */
  readonly kind: 'home' | 'calculator' | 'article' | 'collection';
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
  { id: 'hours', kind: 'calculator', ...HOURS_PATHS },
  { id: 'decimal-hours', kind: 'calculator', ...DECIMAL_HOURS_PATHS },
  { id: 'hourly-to-salary', kind: 'calculator', ...PATHS.hourly },
  { id: 'salary-to-hourly', kind: 'calculator', ...PATHS.salary },
  { id: 'pto-accrual', kind: 'calculator', ...PTO_PATHS },
  { id: 'shift-differential', kind: 'calculator', ...SHIFT_PATHS },
  { id: 'tipped-wage', kind: 'calculator', ...TIPPED_PATHS },
  { id: 'no-tax-on-overtime', kind: 'calculator', ...DEDUCTION_PATHS.overtime },
  { id: 'no-tax-on-tips', kind: 'calculator', ...DEDUCTION_PATHS.tips },
  { id: 'tax-guide', kind: 'article', ...GUIDE_PATHS },
  { id: 'w2-box-12-guide', kind: 'article', ...W2_BOX_12_GUIDE_PATHS },
  { id: 'overtime-guide', kind: 'article', ...OVERTIME_GUIDE_PATHS.federal },
  { id: 'california-overtime-guide', kind: 'article', ...OVERTIME_GUIDE_PATHS.california },
  { id: 'pay-stub-guide', kind: 'article', ...PAY_STUB_GUIDE_PATHS },
  { id: 'unpaid-wages-guide', kind: 'article', ...UNPAID_WAGES_GUIDE_PATHS },
  { id: 'pto-guide', kind: 'article', ...PTO_GUIDE_PATHS },
  { id: 'shift-differential-guide', kind: 'article', ...SHIFT_GUIDE_PATHS },
  { id: 'tip-credit-guide', kind: 'article', ...TIP_CREDIT_GUIDE_PATHS },
  { id: 'tipped-states-guide', kind: 'article', ...TIPPED_STATES_GUIDE_PATHS },
  { id: 'hours-worked-guide', kind: 'article', ...HOURS_WORKED_GUIDE_PATHS },
  { id: 'overtime-states-guide', kind: 'article', ...OVERTIME_STATES_GUIDE_PATHS },
  { id: 'minimum-wage-states-guide', kind: 'article', ...MINIMUM_WAGE_STATES_GUIDE_PATHS },
  { id: 'minimum-wage-2027-states-guide', kind: 'article', ...MINIMUM_WAGE_2027_GUIDE_PATHS },
  { id: 'data', kind: 'collection', ...DATA_PATHS },
  STATES_ROUTE,
  { id: 'methodology', kind: 'article', en: '/methodology', es: '/es/metodologia' },
  { id: 'privacy', kind: 'article', en: '/privacy', es: '/es/privacidad' },
  { id: 'about', kind: 'article', ...ABOUT_PATHS },
  { id: 'embed', kind: 'article', ...EMBED_PATHS },
  ...LONG_TAIL_ROUTES,
  ...STATE_ROUTES,
];
