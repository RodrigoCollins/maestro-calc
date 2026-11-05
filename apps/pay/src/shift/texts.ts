import type { Lang } from '../time-card/receipt.ts';

export const SHIFT_PATHS = {
  en: '/shift-differential-calculator',
  es: '/es/calculadora-de-diferencial-de-turno',
} as const satisfies Readonly<Record<Lang, string>>;

export interface Link {
  readonly label: string;
  readonly href: string;
}

/** The inputs of the shift differential calculator, in the order the engine declares them. */
export type ShiftInput = 'rate' | 'source' | 'percent' | 'amount' | 'baseHours' | 'shiftHours';

/** The secondary outputs of the shift differential calculator, in the engine's order. */
export type ShiftOutput =
  | 'shiftRate'
  | 'differentialPay'
  | 'straightPay'
  | 'totalHours'
  | 'regularRate'
  | 'overtimeHours'
  | 'overtimePremium';

export interface ShiftField {
  readonly key: ShiftInput;
  readonly label: string;
  /** The options of a select, by value. */
  readonly options?: Readonly<Record<'percent' | 'amount', string>>;
  /** The `source` this field belongs to; it shows only while that source is chosen. */
  readonly when?: 'percent' | 'amount';
}

export interface ShiftTexts {
  readonly title: string;
  readonly description: string;
  readonly kicker: string;
  readonly h1: string;
  readonly lead: string;
  readonly fields: readonly ShiftField[];
  readonly figureLabel: string;
  readonly figures: string;
  readonly outputs: Readonly<Record<ShiftOutput, string>>;
  readonly warnings: Readonly<Record<'moreThanAWeek', string>>;
  /** How the calculator counts and what the law says, one point each. */
  readonly notes: readonly string[];
  readonly links: readonly Link[];
  readonly otherLang: string;
}

export const SHIFT_TEXTS: Readonly<Record<Lang, ShiftTexts>> = {
  en: {
    title: 'Shift Differential Calculator: Night Shift Pay | Cuenta Horas',
    description:
      'Add a night or weekend shift differential, as a percent or dollars an hour, to your pay, with overtime on the right regular rate. Free.',
    kicker: 'Shift pay · free',
    h1: 'Shift differential calculator',
    lead: 'Enter your base rate, the shift differential and the hours of the week at each rate. You get the shift rate, the pay of the week and the overtime with the differential counted in.',
    fields: [
      { key: 'rate', label: 'Base hourly rate' },
      {
        key: 'source',
        label: 'The differential is',
        options: { percent: 'A percent of the base rate', amount: 'Dollars an hour' },
      },
      { key: 'percent', label: 'Differential (%)', when: 'percent' },
      { key: 'amount', label: 'Differential per hour ($)', when: 'amount' },
      { key: 'baseHours', label: 'Hours at the base rate this week' },
      { key: 'shiftHours', label: 'Hours on the differential shift this week' },
    ],
    figureLabel: 'Your pay this week',
    figures: 'Your week in detail',
    outputs: {
      shiftRate: 'Shift rate per hour',
      differentialPay: 'Earned from the differential',
      straightPay: 'Pay before overtime',
      totalHours: 'Hours worked',
      regularRate: 'Regular rate (for overtime)',
      overtimeHours: 'Hours over 40',
      overtimePremium: 'Overtime premium (the half)',
    },
    warnings: {
      moreThanAWeek: 'That is more than the 168 hours of a week. Check the hours.',
    },
    notes: [
      'At $20 an hour with a 10% differential, the shift pays $22 an hour. 24 hours at $20 and 16 at $22 are $480 + $352 = $832 for 40 hours, with no overtime.',
      'Over 40 hours the differential counts in the overtime: 24 + 24 hours pay $480 + $528 = $1,008, the regular rate is $1,008 / 48 = $21.00, and each of the 8 hours over 40 adds half of it, $84 in all, for $1,092.',
      'Federal law (the FLSA) does not require extra pay for nights or weekends: the differential is an agreement with your employer. When you get one, it counts in the regular rate (29 CFR 778.207), which is the weighted average of your rates (29 CFR 778.115).',
      'Pay is rounded to the cent and uses the federal 40-hour week; your payroll may round the rate first. For daily overtime in California, use the overtime calculator.',
    ],
    links: [
      { label: 'Work out your overtime by day', href: '/overtime-calculator' },
      { label: 'Add up a week on the time card', href: '/time-card-calculator' },
    ],
    otherLang: 'Español',
  },
  es: {
    title: 'Calculadora de Diferencial de Turno: Pago Nocturno | Cuenta Horas',
    description:
      'Suma el diferencial de turno de noche o de fin de semana, en porcentaje o en dólares por hora, a tu pago, con horas extra sobre la tarifa correcta. Gratis.',
    kicker: 'Pago por turno · gratis',
    h1: 'Calculadora de diferencial de turno',
    lead: 'Ingresa tu tarifa base, el diferencial del turno y las horas de la semana a cada tarifa. Te da la tarifa del turno, el pago de la semana y las horas extra con el diferencial incluido.',
    fields: [
      { key: 'rate', label: 'Tarifa base por hora' },
      {
        key: 'source',
        label: 'El diferencial es',
        options: { percent: 'Un porcentaje de la tarifa base', amount: 'Dólares por hora' },
      },
      { key: 'percent', label: 'Diferencial (%)', when: 'percent' },
      { key: 'amount', label: 'Diferencial por hora ($)', when: 'amount' },
      { key: 'baseHours', label: 'Horas a la tarifa base esta semana' },
      { key: 'shiftHours', label: 'Horas en el turno con diferencial esta semana' },
    ],
    figureLabel: 'Tu pago de esta semana',
    figures: 'Tu semana en detalle',
    outputs: {
      shiftRate: 'Tarifa del turno por hora',
      differentialPay: 'Lo que ganas por el diferencial',
      straightPay: 'Pago antes de horas extra',
      totalHours: 'Horas trabajadas',
      regularRate: 'Tarifa regular (para horas extra)',
      overtimeHours: 'Horas después de 40',
      overtimePremium: 'Prima de horas extra (la mitad)',
    },
    warnings: {
      moreThanAWeek: 'Eso es más que las 168 horas de una semana. Revisa las horas.',
    },
    notes: [
      'A $20 la hora con un diferencial del 10%, el turno paga $22 la hora. 24 horas a $20 y 16 a $22 son $480 + $352 = $832 por 40 horas, sin horas extra.',
      'Después de 40 horas el diferencial cuenta en las horas extra: 24 + 24 horas pagan $480 + $528 = $1,008, la tarifa regular es $1,008 / 48 = $21.00, y cada una de las 8 horas después de 40 suma la mitad, $84 en total, para $1,092.',
      'La ley federal (la FLSA) no exige pago extra por trabajar de noche o en fin de semana: el diferencial es un acuerdo con tu empleador. Si lo recibes, cuenta en la tarifa regular (29 CFR 778.207), que es el promedio ponderado de tus tarifas (29 CFR 778.115).',
      'El pago se redondea al centavo y usa la semana federal de 40 horas; tu nómina puede redondear antes la tarifa. Para las horas extra por día de California, usa la calculadora de horas extra.',
    ],
    links: [
      { label: 'Calcula tus horas extra por día', href: '/es/calculadora-de-horas-extra' },
      {
        label: 'Suma una semana en la tarjeta de horas',
        href: '/es/calculadora-de-horas-trabajadas',
      },
    ],
    otherLang: 'English',
  },
};
