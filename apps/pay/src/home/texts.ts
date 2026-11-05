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
  readonly guidesHeading: string;
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
    guidesHeading: 'Guides',
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
        summary: 'Your overtime rate and pay after 40 hours, or by the day in California.',
        href: '/overtime-calculator',
      },
      {
        id: 'hours',
        title: 'Hours between two times',
        summary: 'From start to end, less the break, in hours and minutes and decimals.',
        href: '/hours-calculator',
      },
      {
        id: 'decimal-hours',
        title: 'Minutes to decimal hours',
        summary: '8 h 20 min is 8.33: convert both ways, with a chart of every minute.',
        href: '/minutes-to-decimal-hours',
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
        id: 'pto-accrual',
        title: 'PTO accrual',
        summary: 'The paid time off you earn each paycheck and per hour worked.',
        href: '/pto-accrual-calculator',
      },
      {
        id: 'shift-differential',
        title: 'Shift differential',
        summary: 'Night or weekend pay on top of your rate, with the overtime counted right.',
        href: '/shift-differential-calculator',
      },
      {
        id: 'tipped-wage',
        title: 'Tipped wage',
        summary: 'Your pay per hour with tips, and whether your employer owes you up to $7.25.',
        href: '/tipped-wage-calculator',
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
    guidesHeading: 'Guías',
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
        summary: 'Tu tarifa y tu pago de horas extra después de 40 horas, o por día en California.',
        href: '/es/calculadora-de-horas-extra',
      },
      {
        id: 'hours',
        title: 'Horas entre dos horas',
        summary: 'De la entrada a la salida, menos el descanso, en horas y minutos y en decimales.',
        href: '/es/calculadora-de-horas',
      },
      {
        id: 'decimal-hours',
        title: 'Minutos a horas decimales',
        summary:
          '8 h 20 min son 8.33: convierte en los dos sentidos, con una tabla de cada minuto.',
        href: '/es/minutos-a-horas-decimales',
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
        id: 'pto-accrual',
        title: 'Vacaciones pagadas (PTO)',
        summary: 'El tiempo libre pagado que ganas en cada cheque y por hora trabajada.',
        href: '/es/calculadora-de-vacaciones-pagadas',
      },
      {
        id: 'shift-differential',
        title: 'Diferencial de turno',
        summary: 'El pago extra de noche o de fin de semana, con las horas extra bien contadas.',
        href: '/es/calculadora-de-diferencial-de-turno',
      },
      {
        id: 'tipped-wage',
        title: 'Propinas por hora',
        summary: 'Tu pago por hora con propinas, y si tu empleador te debe completar $7.25.',
        href: '/es/calculadora-de-propinas-por-hora',
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
