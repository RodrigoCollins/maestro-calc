import { PTO_GUIDE_PATHS } from '../guide/paths.ts';
import type { Lang } from '../time-card/receipt.ts';

export const PTO_PATHS = {
  en: '/pto-accrual-calculator',
  es: '/es/calculadora-de-vacaciones-pagadas',
} as const satisfies Readonly<Record<Lang, string>>;

export interface Link {
  readonly label: string;
  readonly href: string;
}

/** The secondary outputs of the PTO accrual calculator, in the order the engine declares them. */
export type PtoOutput =
  'weekly' | 'semimonthly' | 'monthly' | 'perHourWorked' | 'hoursPerPtoHour' | 'annualHours';

export interface PtoTexts {
  readonly title: string;
  readonly description: string;
  readonly kicker: string;
  readonly h1: string;
  readonly lead: string;
  readonly ptoDays: string;
  readonly hoursPerDay: string;
  readonly hoursPerWeek: string;
  readonly figureLabel: string;
  readonly figures: string;
  readonly outputs: Readonly<Record<PtoOutput, string>>;
  readonly warnings: Readonly<Record<'moreThanWorked', string>>;
  /** How the calculator counts and what the law says, one point each. */
  readonly notes: readonly string[];
  readonly links: readonly Link[];
  readonly otherLang: string;
}

export const PTO_TEXTS: Readonly<Record<Lang, PtoTexts>> = {
  en: {
    title: 'PTO Accrual Calculator: PTO Hours per Paycheck | Cuenta Horas',
    description:
      'Turn your paid days off a year into PTO hours earned per paycheck, per month and per hour worked. Weekly, biweekly, semimonthly and monthly. Free.',
    kicker: 'Paid time off · free',
    h1: 'PTO accrual calculator',
    lead: 'Enter your paid days off a year, the hours of a day off and the hours you work a week. You get the PTO hours you earn each paycheck and for every hour you work.',
    ptoDays: 'Paid days off a year',
    hoursPerDay: 'Hours in a day off',
    hoursPerWeek: 'Hours you work a week',
    figureLabel: 'PTO hours every two weeks',
    figures: 'Your PTO in detail',
    outputs: {
      weekly: 'Every week',
      semimonthly: 'Twice a month',
      monthly: 'Every month',
      perHourWorked: 'Per hour worked',
      hoursPerPtoHour: 'Hours worked for 1 hour off',
      annualHours: 'PTO hours a year',
    },
    warnings: {
      moreThanWorked:
        'That is more time off than the hours you work in a year. Check the days and the hours.',
    },
    notes: [
      '10 days of 8 hours are 80 PTO hours a year. Over 26 paychecks that is 3.08 hours every two weeks; over 2,080 hours worked (40 a week, 52 weeks), 0.0385 hours per hour worked, or 1 hour off for every 26 hours worked.',
      'Figures are rounded to two places (the rate to four). Your employer’s policy decides the rate, the cap and when PTO starts to accrue, and its payroll may round differently.',
      'Federal law (the FLSA) does not require paid vacation: it is an agreement between you and your employer. In California, earned vacation is wages: it cannot be lost by a deadline, and what you have not used is paid when the job ends.',
    ],
    links: [
      { label: 'How PTO accrues and what the law says', href: PTO_GUIDE_PATHS.en },
      { label: 'Turn your hourly pay into a salary', href: '/hourly-to-salary-calculator' },
      { label: 'Add up a week on the time card', href: '/time-card-calculator' },
    ],
    otherLang: 'Español',
  },
  es: {
    title: 'Calculadora de Vacaciones Pagadas (PTO) por Cheque | Cuenta Horas',
    description:
      'Convierte tus días libres pagados del año en horas de PTO que ganas por cheque, por mes y por hora trabajada. Semanal, quincenal y mensual. Gratis.',
    kicker: 'Vacaciones pagadas · gratis',
    h1: 'Calculadora de vacaciones pagadas (PTO)',
    lead: 'Ingresa tus días libres pagados al año, las horas de un día libre y las horas que trabajas a la semana. Te da las horas de PTO que ganas en cada cheque y por cada hora que trabajas.',
    ptoDays: 'Días libres pagados al año',
    hoursPerDay: 'Horas de un día libre',
    hoursPerWeek: 'Horas que trabajas a la semana',
    figureLabel: 'Horas de PTO cada dos semanas',
    figures: 'Tu PTO en detalle',
    outputs: {
      weekly: 'Cada semana',
      semimonthly: 'Dos veces al mes',
      monthly: 'Cada mes',
      perHourWorked: 'Por hora trabajada',
      hoursPerPtoHour: 'Horas trabajadas por 1 hora libre',
      annualHours: 'Horas de PTO al año',
    },
    warnings: {
      moreThanWorked:
        'Eso es más tiempo libre que las horas que trabajas en un año. Revisa los días y las horas.',
    },
    notes: [
      '10 días de 8 horas son 80 horas de PTO al año. En 26 cheques son 3.08 horas cada dos semanas; en 2,080 horas trabajadas (40 a la semana, 52 semanas), 0.0385 horas por hora trabajada, o 1 hora libre por cada 26 horas de trabajo.',
      'Las cifras se redondean a dos decimales (la tasa a cuatro). La política de tu empleador decide la tasa, el tope y desde cuándo se acumula el PTO, y su nómina puede redondear de otra forma.',
      'La ley federal (la FLSA) no exige vacaciones pagadas: es un acuerdo entre tú y tu empleador. En California, las vacaciones ganadas son salario: no se pierden por una fecha límite, y lo que no usaste se paga cuando termina el trabajo.',
    ],
    links: [
      {
        label: 'Cómo se acumulan las vacaciones pagadas y qué dice la ley',
        href: PTO_GUIDE_PATHS.es,
      },
      {
        label: 'Convierte tu pago por hora en sueldo anual',
        href: '/es/de-pago-por-hora-a-sueldo-anual',
      },
      {
        label: 'Suma una semana en la tarjeta de horas',
        href: '/es/calculadora-de-horas-trabajadas',
      },
    ],
    otherLang: 'English',
  },
};
