import { TIP_CREDIT_GUIDE_PATHS, TIPPED_STATES_GUIDE_PATHS } from '../guide/paths.ts';
import type { Lang } from '../time-card/receipt.ts';

export const TIPPED_PATHS = {
  en: '/tipped-wage-calculator',
  es: '/es/calculadora-de-propinas-por-hora',
} as const satisfies Readonly<Record<Lang, string>>;

export interface Link {
  readonly label: string;
  readonly href: string;
}

/** The inputs of the tipped wage calculator, in the order the engine declares them. */
export type TippedInput = 'cashWage' | 'tips' | 'hours';

/** The secondary outputs of the tipped wage calculator, in the engine's order. */
export type TippedOutput =
  | 'totalPay'
  | 'wages'
  | 'tipsPerHour'
  | 'tipCredit'
  | 'topUp'
  | 'overtimeHours'
  | 'overtimePremium';

export interface TippedField {
  readonly key: TippedInput;
  readonly label: string;
}

export interface TippedTexts {
  readonly title: string;
  readonly description: string;
  readonly kicker: string;
  readonly h1: string;
  readonly lead: string;
  readonly fields: readonly TippedField[];
  readonly figureLabel: string;
  readonly figures: string;
  readonly outputs: Readonly<Record<TippedOutput, string>>;
  readonly warnings: Readonly<Record<'topUpOwed', string>>;
  /** How the calculator counts and what the law says, one point each. */
  readonly notes: readonly string[];
  /** The DOL table of the tipped minimum wage of each state. */
  readonly stateLink: Link;
  readonly links: readonly Link[];
  readonly otherLang: string;
}

const DOL_STATE_TABLE = 'https://www.dol.gov/agencies/whd/state/minimum-wage/tipped';

export const TIPPED_TEXTS: Readonly<Record<Lang, TippedTexts>> = {
  en: {
    title: 'Tipped Wage Calculator: Pay Per Hour With Tips | Cuenta Horas',
    description:
      'Add your cash wage and tips, divide by your hours and see if your employer owes you a top-up to the $7.25 federal minimum. Overtime included. Free.',
    kicker: 'Tipped pay · free',
    h1: 'Tipped wage calculator',
    lead: 'Enter your cash wage, the tips of the week and the hours you worked. You get your pay per hour with tips, the tip credit your employer takes and whether it owes you the difference to the $7.25 federal minimum.',
    fields: [
      { key: 'cashWage', label: 'Cash wage per hour (at least $2.13)' },
      { key: 'tips', label: 'Tips this week ($)' },
      { key: 'hours', label: 'Hours worked this week' },
    ],
    figureLabel: 'Your pay per hour, with tips',
    figures: 'Your week in detail',
    outputs: {
      totalPay: 'Total pay this week',
      wages: 'Cash wages from your employer',
      tipsPerHour: 'Tips per hour',
      tipCredit: 'Tip credit your employer takes',
      topUp: 'Top-up your employer owes',
      overtimeHours: 'Hours over 40',
      overtimePremium: 'Overtime premium (the half)',
    },
    warnings: {
      topUpOwed:
        'Your cash wage and tips come to less than $7.25 an hour this week: your employer owes you the difference, the top-up below.',
    },
    notes: [
      'At the federal cash wage of $2.13 an hour, 40 hours pay $85.20. With $250 in tips the week comes to $335.20, or $8.38 an hour, above the $7.25 minimum: the employer owes nothing more.',
      'With $150 in tips, $85.20 + $150 = $235.20 falls short of 40 × $7.25 = $290: the employer makes up the $54.80 difference, and you earn $7.25 an hour.',
      'The tip credit is the part of the minimum wage your tips cover: at most $5.12 an hour ($7.25 − $2.13), never more than the tips you got, and checked over each workweek. Your employer must tell you about it before taking it (DOL Fact Sheet #15).',
      'Overtime is figured on the full $7.25, not on $2.13: each hour over 40 adds half of $7.25, which the employer pays. 44 hours with $300 in tips pay $93.72 + $14.50 + $300 = $408.22.',
      'Many states set a higher minimum wage or cash wage, and some allow no tip credit at all, such as California, Washington and Alaska: check your state. The calculator uses the federal rules and rounds to the cent.',
    ],
    stateLink: {
      label: 'Tipped minimum wage by state (U.S. Department of Labor)',
      href: DOL_STATE_TABLE,
    },
    links: [
      { label: 'When must your employer top up your tips?', href: TIP_CREDIT_GUIDE_PATHS.en },
      { label: 'Tipped minimum wage by state, 2026', href: TIPPED_STATES_GUIDE_PATHS.en },
      { label: 'Work out your overtime by day', href: '/overtime-calculator' },
      { label: 'Add up a week on the time card', href: '/time-card-calculator' },
    ],
    otherLang: 'Español',
  },
  es: {
    title: 'Calculadora de Propinas por Hora: Salario con Propinas | Cuenta Horas',
    description:
      'Suma tu salario en efectivo y tus propinas, divide por tus horas y mira si tu empleador te debe completar el mínimo federal de $7.25. Con horas extra. Gratis.',
    kicker: 'Pago con propinas · gratis',
    h1: 'Calculadora de propinas por hora',
    lead: 'Ingresa tu salario en efectivo, las propinas de la semana y las horas que trabajaste. Te da tu pago por hora con propinas, el crédito por propinas que toma tu empleador y si te debe la diferencia hasta el mínimo federal de $7.25.',
    fields: [
      { key: 'cashWage', label: 'Salario en efectivo por hora (mínimo $2.13)' },
      { key: 'tips', label: 'Propinas de esta semana ($)' },
      { key: 'hours', label: 'Horas trabajadas esta semana' },
    ],
    figureLabel: 'Tu pago por hora, con propinas',
    figures: 'Tu semana en detalle',
    outputs: {
      totalPay: 'Pago total de la semana',
      wages: 'Salario en efectivo de tu empleador',
      tipsPerHour: 'Propinas por hora',
      tipCredit: 'Crédito por propinas que toma tu empleador',
      topUp: 'Lo que tu empleador debe completar',
      overtimeHours: 'Horas después de 40',
      overtimePremium: 'Prima de horas extra (la mitad)',
    },
    warnings: {
      topUpOwed:
        'Tu salario en efectivo y tus propinas suman menos de $7.25 la hora esta semana: tu empleador te debe la diferencia, que ves abajo.',
    },
    notes: [
      'Con el salario federal en efectivo de $2.13 la hora, 40 horas pagan $85.20. Con $250 de propinas la semana suma $335.20, o $8.38 la hora, más que el mínimo de $7.25: el empleador no debe nada más.',
      'Con $150 de propinas, $85.20 + $150 = $235.20 no llega a 40 × $7.25 = $290: el empleador completa la diferencia de $54.80, y ganas $7.25 la hora.',
      'El crédito por propinas es la parte del salario mínimo que cubren tus propinas: como máximo $5.12 la hora ($7.25 − $2.13), nunca más que las propinas que recibiste, y se revisa en cada semana laboral. Tu empleador debe avisarte antes de tomarlo (DOL Fact Sheet #15).',
      'Las horas extra se calculan sobre los $7.25 completos, no sobre $2.13: cada hora después de 40 suma la mitad de $7.25, que paga el empleador. 44 horas con $300 de propinas pagan $93.72 + $14.50 + $300 = $408.22.',
      'Muchos estados fijan un salario mínimo o en efectivo más alto, y algunos no permiten el crédito por propinas, como California, Washington y Alaska: revisa tu estado. La calculadora usa las reglas federales y redondea al centavo.',
    ],
    stateLink: {
      label:
        'Salario mínimo con propinas por estado (Departamento de Trabajo de EE. UU., en inglés)',
      href: DOL_STATE_TABLE,
    },
    links: [
      {
        label: '¿Cuándo debe tu empleador completar tus propinas?',
        href: TIP_CREDIT_GUIDE_PATHS.es,
      },
      {
        label: 'Salario mínimo con propinas por estado, 2026',
        href: TIPPED_STATES_GUIDE_PATHS.es,
      },
      { label: 'Calcula tus horas extra por día', href: '/es/calculadora-de-horas-extra' },
      {
        label: 'Suma una semana en la tarjeta de horas',
        href: '/es/calculadora-de-horas-trabajadas',
      },
    ],
    otherLang: 'English',
  },
};
