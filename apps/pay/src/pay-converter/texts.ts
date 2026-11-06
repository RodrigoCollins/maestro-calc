import { MINIMUM_WAGE_2027_GUIDE_PATHS, MINIMUM_WAGE_STATES_GUIDE_PATHS } from '../guide/paths.ts';
import type { Lang } from '../time-card/receipt.ts';

/** The two pages of the pay converter: same engine, opposite starting point. */
export type Variant = 'hourly' | 'salary';

export interface VariantTexts {
  readonly title: string;
  readonly description: string;
  readonly h1: string;
  readonly lead: string;
  /** The output the page leads with: the annual pay, or the hourly rate. */
  readonly figure: 'annual' | 'hourly';
  readonly figureLabel: string;
  /** The starting amount and period, as typed into the form. */
  readonly amount: string;
  readonly per: 'hour' | 'year';
}

export interface PayConverterTexts {
  readonly kicker: string;
  readonly amount: string;
  readonly per: string;
  readonly periods: Readonly<
    Record<'hour' | 'week' | 'biweekly' | 'semimonthly' | 'month' | 'year', string>
  >;
  readonly hoursPerWeek: string;
  readonly weeksPerYear: string;
  readonly weeksHint: string;
  readonly breakdown: string;
  readonly outputs: Readonly<
    Record<'annual' | 'hourly' | 'weekly' | 'biweekly' | 'semimonthly' | 'monthly', string>
  >;
  readonly note: string;
  readonly timeCard: { readonly label: string; readonly href: string };
  /** The minimum wage table, linked from both pages. */
  readonly minimumWage: { readonly label: string; readonly href: string };
  /** The minimum wage increases of January 1, 2027, linked from both pages. */
  readonly minimumWage2027: { readonly label: string; readonly href: string };
  readonly otherLang: string;
  readonly variants: Readonly<Record<Variant, VariantTexts>>;
}

export const PATHS: Readonly<Record<Variant, Readonly<Record<Lang, string>>>> = {
  hourly: { en: '/hourly-to-salary-calculator', es: '/es/de-pago-por-hora-a-sueldo-anual' },
  salary: { en: '/salary-to-hourly-calculator', es: '/es/de-sueldo-anual-a-pago-por-hora' },
};

export const PAY_CONVERTER_TEXTS: Readonly<Record<Lang, PayConverterTexts>> = {
  en: {
    kicker: 'Pay converter · free',
    amount: 'Pay',
    per: 'Per',
    periods: {
      hour: 'Hour',
      week: 'Week',
      biweekly: 'Two weeks',
      semimonthly: 'Half month',
      month: 'Month',
      year: 'Year',
    },
    hoursPerWeek: 'Hours a week',
    weeksPerYear: 'Paid weeks a year',
    weeksHint: '52 if every week is paid; less for unpaid time off.',
    breakdown: 'In every pay period',
    outputs: {
      annual: 'A year',
      hourly: 'An hour',
      weekly: 'A week',
      biweekly: 'Every two weeks',
      semimonthly: 'Twice a month',
      monthly: 'A month',
    },
    note: 'Gross pay, before taxes and deductions. Overtime is not included: for weeks over 40 hours, use the time card.',
    timeCard: { label: 'Open the time card', href: '/time-card-calculator' },
    minimumWage: {
      label: 'Minimum wage by state, 2026',
      href: MINIMUM_WAGE_STATES_GUIDE_PATHS.en,
    },
    minimumWage2027: {
      label: 'Minimum wage increases on January 1, 2027',
      href: MINIMUM_WAGE_2027_GUIDE_PATHS.en,
    },
    otherLang: 'Español',
    variants: {
      hourly: {
        title: 'Hourly to Salary Calculator: Yearly, Monthly, Weekly | Cuenta Horas',
        description:
          'Turn your hourly rate into a yearly salary and monthly, biweekly and weekly pay, with your real hours and paid weeks. Free, in English and Spanish.',
        h1: 'Hourly to salary calculator',
        lead: 'Enter your hourly rate and your hours. You get what it comes to a year, a month and every paycheck.',
        figure: 'annual',
        figureLabel: 'Your yearly pay',
        amount: '22.00',
        per: 'hour',
      },
      salary: {
        title: 'Salary to Hourly Calculator: What Your Pay Is an Hour | Cuenta Horas',
        description:
          'Turn a yearly salary into an hourly rate, and see the weekly, biweekly and monthly pay. Compare a salaried offer with hourly work. Free, in two languages.',
        h1: 'Salary to hourly calculator',
        lead: 'Enter a yearly salary and the hours the job asks for. You get what it pays an hour.',
        figure: 'hourly',
        figureLabel: 'It pays an hour',
        amount: '60000.00',
        per: 'year',
      },
    },
  },
  es: {
    kicker: 'Conversor de pago · gratis',
    amount: 'Pago',
    per: 'Por',
    periods: {
      hour: 'Hora',
      week: 'Semana',
      biweekly: 'Cada 2 semanas',
      semimonthly: 'Medio mes',
      month: 'Mes',
      year: 'Año',
    },
    hoursPerWeek: 'Horas por semana',
    weeksPerYear: 'Semanas pagadas al año',
    weeksHint: '52 si te pagan todas las semanas; menos si tienes días libres sin pago.',
    breakdown: 'En cada período de pago',
    outputs: {
      annual: 'Al año',
      hourly: 'Por hora',
      weekly: 'Por semana',
      biweekly: 'Cada dos semanas',
      semimonthly: 'Dos veces al mes',
      monthly: 'Al mes',
    },
    note: 'Es el pago bruto, antes de impuestos y descuentos. No incluye horas extra: para semanas de más de 40 horas, usa la tarjeta de horas.',
    timeCard: { label: 'Abrir la tarjeta de horas', href: '/es/calculadora-de-horas-trabajadas' },
    minimumWage: {
      label: 'Salario mínimo por estado, 2026',
      href: MINIMUM_WAGE_STATES_GUIDE_PATHS.es,
    },
    minimumWage2027: {
      label: 'Aumentos del salario mínimo el 1 de enero de 2027',
      href: MINIMUM_WAGE_2027_GUIDE_PATHS.es,
    },
    otherLang: 'English',
    variants: {
      hourly: {
        title: 'De Pago por Hora a Sueldo Anual: Calculadora | Cuenta Horas',
        description:
          'Convierte tu pago por hora en sueldo anual y en pago mensual, cada dos semanas y semanal, con tus horas y semanas reales. Gratis, en español e inglés.',
        h1: 'De pago por hora a sueldo anual',
        lead: 'Anota cuánto te pagan por hora y cuántas horas trabajas. Te da cuánto es al año, al mes y en cada cheque.',
        figure: 'annual',
        figureLabel: 'Tu pago al año',
        amount: '22.00',
        per: 'hour',
      },
      salary: {
        title: 'De Sueldo Anual a Pago por Hora: Calculadora | Cuenta Horas',
        description:
          'Convierte un sueldo anual en pago por hora y mira el pago semanal, cada dos semanas y mensual. Compara una oferta de sueldo fijo con el trabajo por hora.',
        h1: 'De sueldo anual a pago por hora',
        lead: 'Anota el sueldo anual y las horas que pide el trabajo. Te da cuánto paga por hora.',
        figure: 'hourly',
        figureLabel: 'Paga por hora',
        amount: '60000.00',
        per: 'year',
      },
    },
  },
};
