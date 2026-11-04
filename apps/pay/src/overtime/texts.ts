import type { Rule } from '@maestro-calc/pay-core/overtime';
import type { DayText } from '../time-card/texts.ts';
import { TIME_CARD_TEXTS } from '../time-card/texts.ts';
import type { Lang } from '../time-card/receipt.ts';

export const OVERTIME_PATHS = {
  en: '/overtime-calculator',
  es: '/es/calculadora-de-horas-extra',
} as const satisfies Readonly<Record<Lang, string>>;

export interface OvertimeTexts {
  readonly title: string;
  readonly description: string;
  readonly kicker: string;
  readonly h1: string;
  readonly lead: string;
  readonly rate: string;
  readonly rule: string;
  /** The label of each option of the rule select. */
  readonly rules: Readonly<Record<Rule, string>>;
  readonly week: string;
  readonly days: readonly DayText[];
  readonly figureLabel: string;
  readonly gross: string;
  readonly regularBadge: string;
  readonly overtimeBadge: string;
  readonly doubleBadge: string;
  readonly figures: string;
  readonly totalHours: string;
  readonly overtimeRate: string;
  readonly doubleRate: string;
  /** How the rules work, one point each. */
  readonly notes: readonly string[];
  readonly disclaimer: string;
  readonly timeCard: { readonly label: string; readonly href: string };
  readonly otherLang: string;
}

export const OVERTIME_TEXTS: Readonly<Record<Lang, OvertimeTexts>> = {
  en: {
    title: 'Overtime Calculator: Time and a Half Pay | Cuenta Horas',
    description:
      'Work out your overtime pay: time and a half after 40 hours a week, or California daily overtime and double time. Enter your hours by day. Free.',
    kicker: 'Overtime · free',
    h1: 'Overtime calculator',
    lead: 'Enter your hourly rate and the hours you worked each day. You get your overtime hours, your overtime rate and your pay for the week.',
    rate: 'Hourly rate',
    rule: 'Overtime rule',
    rules: { federal: 'Federal (40 h a week)', california: 'California (by the day)' },
    week: 'Hours worked each day',
    days: TIME_CARD_TEXTS.en.days,
    figureLabel: 'Your pay for the week',
    gross: 'gross, before taxes',
    regularBadge: 'REGULAR',
    overtimeBadge: 'OVERTIME ×1.5',
    doubleBadge: 'DOUBLE ×2',
    figures: 'Hours and rates',
    totalHours: 'Hours worked',
    overtimeRate: 'Your overtime rate (1.5×)',
    doubleRate: 'Your double-time rate (2×)',
    notes: [
      'Federal law (FLSA): every hour over 40 in the workweek is paid at least 1.5 times your regular rate. A long day is not overtime by itself.',
      'California: over 8 hours in a day pays 1.5 times, over 12 pays double, and the seventh day in a row has its own rule. Hours already paid as daily overtime do not count again toward the 40.',
      'Enter 0 for a day off. The week runs Monday to Sunday, and decimals work: 8 hours 15 minutes is 8.25.',
    ],
    disclaimer:
      'This is pay before taxes and deductions, with your hourly rate as the regular rate.',
    timeCard: {
      label: 'Have your clock-in and clock-out times? Use the time card',
      href: '/time-card-calculator',
    },
    otherLang: 'Español',
  },
  es: {
    title: 'Calculadora de Horas Extra: Pago de Tiempo y Medio | Cuenta Horas',
    description:
      'Calcula tu pago de horas extra: tiempo y medio después de 40 horas en la semana, o las extra y dobles por día de California. Anota tus horas. Gratis.',
    kicker: 'Horas extra · gratis',
    h1: 'Calculadora de horas extra',
    lead: 'Ingresa tu pago por hora y las horas que trabajaste cada día. Te da tus horas extra, tu tarifa de hora extra y tu pago de la semana.',
    rate: 'Pago por hora',
    rule: 'Regla de horas extra',
    rules: { federal: 'Federal (40 h semana)', california: 'California (por día)' },
    week: 'Horas trabajadas cada día',
    days: TIME_CARD_TEXTS.es.days,
    figureLabel: 'Tu pago de la semana',
    gross: 'bruto, antes de impuestos',
    regularBadge: 'REGULAR',
    overtimeBadge: 'EXTRA ×1.5',
    doubleBadge: 'DOBLE ×2',
    figures: 'Horas y tarifas',
    totalHours: 'Horas trabajadas',
    overtimeRate: 'Tu tarifa de hora extra (1.5×)',
    doubleRate: 'Tu tarifa de hora doble (2×)',
    notes: [
      'Ley federal (FLSA): cada hora después de 40 en la semana laboral se paga al menos a 1.5 veces tu tarifa regular. Un día largo no es hora extra por sí solo.',
      'California: después de 8 horas en un día se paga 1.5 veces, después de 12 el doble, y el séptimo día seguido tiene su propia regla. Las horas ya pagadas como extra del día no se vuelven a contar para las 40.',
      'Pon 0 en un día libre. La semana va de lunes a domingo, y puedes usar decimales: 8 horas y 15 minutos son 8.25.',
    ],
    disclaimer:
      'Es el pago antes de impuestos y descuentos, con tu pago por hora como tarifa regular.',
    timeCard: {
      label: '¿Tienes tu hora de entrada y de salida? Usa la tarjeta de horas',
      href: '/es/calculadora-de-horas-trabajadas',
    },
    otherLang: 'English',
  },
};
