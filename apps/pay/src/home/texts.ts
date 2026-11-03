import type { Lang } from '../time-card/receipt.ts';

export interface ToolText {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  /** The tool's page in this language; `null` until that page is built. */
  readonly href: string | null;
}

export interface HomeTexts {
  readonly title: string;
  readonly description: string;
  readonly kicker: string;
  readonly h1: string;
  readonly lead: string;
  readonly cta: { readonly label: string; readonly href: string };
  readonly cardTitle: string;
  readonly cardTotal: string;
  readonly toolsHeading: string;
  readonly soon: string;
  readonly sources: string;
  readonly otherLang: string;
  readonly tools: readonly ToolText[];
}

export const HOME_TEXTS: Readonly<Record<Lang, HomeTexts>> = {
  en: {
    title: 'Cuenta Horas: Free Time Card and Hourly Pay Calculators',
    description:
      'Add up your hours, work out your overtime and check that your paycheck is complete. Free calculators for hourly workers, in English and Spanish.',
    kicker: 'For hourly workers',
    h1: 'What you work, counted right.',
    lead: 'Add up your hours, work out your overtime and check that your paycheck is complete. Free, in English and Spanish, and you can send it on WhatsApp.',
    cta: { label: 'Add up my hours', href: '/time-card-calculator' },
    cardTitle: 'Time card',
    cardTotal: 'Gross total',
    toolsHeading: 'Calculators',
    soon: 'SOON',
    sources: 'Rules from the US Department of Labor (FLSA) and the California Labor Commissioner.',
    otherLang: 'Español',
    tools: [
      {
        id: 'time-card',
        title: 'Time card',
        summary: 'Clock-in and clock-out for each day, with breaks. You get the total and the pay.',
        href: '/time-card-calculator',
      },
      {
        id: 'overtime',
        title: 'Overtime',
        summary: 'What you are paid after 40 hours, at time and a half, from your week.',
        href: '/time-card-calculator',
      },
      {
        id: 'hourly-to-salary',
        title: 'Hourly to salary',
        summary: 'What your hourly pay comes to a year, a month and a week.',
        href: '/hourly-to-salary-calculator',
      },
      {
        id: 'salary-to-hourly',
        title: 'Salary to hourly',
        summary: 'Compare a salaried offer with what you make by the hour.',
        href: '/salary-to-hourly-calculator',
      },
      {
        id: 'no-tax-on-tips',
        title: 'No tax on tips',
        summary: 'How much the new tips deduction saves you.',
        href: '/no-tax-on-tips-calculator',
      },
      {
        id: 'no-tax-on-overtime',
        title: 'No tax on overtime',
        summary: 'The extra half of your overtime that you take off your income.',
        href: '/no-tax-on-overtime-calculator',
      },
    ],
  },
  es: {
    title: 'Cuenta Horas: Calculadoras de Horas Trabajadas y Pago por Hora',
    description:
      'Suma tus horas, calcula las extra y revisa que tu cheque esté completo. Calculadoras gratis para quien cobra por hora, en español e inglés.',
    kicker: 'Para quien cobra por hora',
    h1: 'Lo que trabajas, bien contado.',
    lead: 'Suma tus horas, calcula las extra y revisa que tu cheque esté completo. Gratis, en español y en inglés, y lo mandas por WhatsApp.',
    cta: { label: 'Sumar mis horas', href: '/es/calculadora-de-horas-trabajadas' },
    cardTitle: 'Tarjeta de horas',
    cardTotal: 'Total bruto',
    toolsHeading: 'Calculadoras',
    soon: 'PRONTO',
    sources:
      'Reglas del Departamento de Trabajo de EE. UU. (FLSA) y del Comisionado Laboral de California.',
    otherLang: 'English',
    tools: [
      {
        id: 'time-card',
        title: 'Horas trabajadas',
        summary: 'Entrada y salida de cada día, con los descansos. Te da el total y el pago.',
        href: '/es/calculadora-de-horas-trabajadas',
      },
      {
        id: 'overtime',
        title: 'Horas extra',
        summary: 'Cuánto te pagan después de 40 horas, a tiempo y medio, con tu semana.',
        href: '/es/calculadora-de-horas-trabajadas',
      },
      {
        id: 'hourly-to-salary',
        title: 'Por hora a sueldo anual',
        summary: 'Cuánto es tu pago por hora al año, al mes y por semana.',
        href: '/es/de-pago-por-hora-a-sueldo-anual',
      },
      {
        id: 'salary-to-hourly',
        title: 'Sueldo anual a por hora',
        summary: 'Compara una oferta de sueldo fijo con lo que ganas por hora.',
        href: '/es/de-sueldo-anual-a-pago-por-hora',
      },
      {
        id: 'no-tax-on-tips',
        title: 'Propinas sin impuesto',
        summary: 'Cuánto te ahorras con la nueva deducción de propinas.',
        href: '/es/calculadora-propinas-sin-impuestos',
      },
      {
        id: 'no-tax-on-overtime',
        title: 'Horas extra sin impuesto',
        summary: 'La parte extra de tus horas extra que restas de tus ingresos.',
        href: '/es/calculadora-horas-extra-sin-impuestos',
      },
    ],
  },
};
