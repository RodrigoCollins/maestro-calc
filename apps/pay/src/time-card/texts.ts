import type { Lang } from './receipt.ts';

export interface DayText {
  readonly key: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
  readonly short: string;
  readonly long: string;
}

export interface TimeCardTexts {
  readonly title: string;
  readonly description: string;
  readonly kicker: string;
  readonly h1: string;
  readonly lead: string;
  readonly rate: string;
  readonly rule: string;
  readonly federal: string;
  readonly california: string;
  readonly week: string;
  readonly day: string;
  readonly in: string;
  readonly out: string;
  readonly break: string;
  readonly hours: string;
  readonly total: string;
  readonly owed: string;
  readonly gross: string;
  readonly overtimeBadge: string;
  readonly doubleBadge: string;
  readonly whatsapp: string;
  readonly print: string;
  readonly shareNote: string;
  readonly breakTooLong: string;
  readonly note: string;
  readonly workweek: string;
  readonly otherLang: string;
  readonly otherHref: string;
  readonly days: readonly DayText[];
}

const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

const days = (short: readonly string[], long: readonly string[]): readonly DayText[] =>
  DAY_KEYS.map((key, index) => ({ key, short: short[index] ?? key, long: long[index] ?? key }));

export const TIME_CARD_TEXTS: Readonly<Record<Lang, TimeCardTexts>> = {
  en: {
    title: 'Time Card Calculator with Overtime | Cuenta Horas',
    description:
      'Add up your hours for the week from clock-in and clock-out times, with breaks and overtime, and see your gross pay. Free, in English and Spanish.',
    kicker: 'Time card · free',
    h1: 'Time card calculator',
    lead: 'Enter when you clocked in and out each day. You get your hours, your overtime and what you are owed.',
    rate: 'Hourly rate',
    rule: 'Overtime rule',
    federal: 'Federal (40 h a week)',
    california: 'California (by the day)',
    week: 'The week',
    day: 'Day',
    in: 'In',
    out: 'Out',
    break: 'Break (min)',
    hours: 'Hours',
    total: 'Week total',
    owed: 'You are owed',
    gross: 'gross pay for the week',
    overtimeBadge: 'OVERTIME ×1.5',
    doubleBadge: 'DOUBLE ×2',
    whatsapp: 'Send the receipt on WhatsApp',
    print: 'Print the time card',
    shareNote: 'The link carries your hours and rate; nothing is saved on a server.',
    breakTooLong: 'The break is as long as the shift on a day; that day counts 0 hours.',
    note: 'This is pay before taxes and deductions. Federal law (FLSA) pays 1.5 times your rate after 40 hours in a workweek. California also counts by the day: 1.5 times after 8 hours, double after 12, and its own rule for the seventh day in a row.',
    workweek: 'The card treats Monday to Sunday as the workweek.',
    otherLang: 'Español',
    otherHref: '/es/calculadora-de-horas-trabajadas',
    days: days(
      ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    ),
  },
  es: {
    title: 'Calculadora de Horas Trabajadas y Horas Extra | Cuenta Horas',
    description:
      'Suma tus horas de la semana con la hora de entrada y salida, los descansos y las horas extra, y mira cuánto te tienen que pagar. Gratis, en español e inglés.',
    kicker: 'Tarjeta de horas · gratis',
    h1: 'Calculadora de horas trabajadas',
    lead: 'Anota la entrada y la salida de cada día. Te da las horas, las extra y lo que te tienen que pagar.',
    rate: 'Pago por hora',
    rule: 'Regla de horas extra',
    federal: 'Federal (40 h semana)',
    california: 'California (por día)',
    week: 'La semana',
    day: 'Día',
    in: 'Entrada',
    out: 'Salida',
    break: 'Descanso (min)',
    hours: 'Horas',
    total: 'Total semana',
    owed: 'Te tienen que pagar',
    gross: 'pago bruto de la semana',
    overtimeBadge: 'EXTRA ×1.5',
    doubleBadge: 'DOBLE ×2',
    whatsapp: 'Mandar el recibo por WhatsApp',
    print: 'Imprimir la tarjeta',
    shareNote: 'El link lleva tus horas y tu tarifa; no se guarda nada en un servidor.',
    breakTooLong: 'Un día tiene un descanso tan largo como el turno; ese día cuenta 0 horas.',
    note: 'Es el pago antes de impuestos y descuentos. La ley federal (FLSA) paga 1.5 veces tu tarifa después de 40 horas en la semana. California también cuenta por día: 1.5 veces después de 8 horas, doble después de 12, y tiene su propia regla para el séptimo día seguido.',
    workweek: 'La tarjeta toma la semana de lunes a domingo.',
    otherLang: 'English',
    otherHref: '/time-card-calculator',
    days: days(
      ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
      ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
    ),
  },
};
