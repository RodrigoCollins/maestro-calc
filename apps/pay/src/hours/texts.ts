import {
  FULL_TIME_GUIDE_PATHS,
  HOURS_WORKED_GUIDE_PATHS,
  PART_TIME_GUIDE_PATHS,
} from '../guide/paths.ts';
import type { Lang } from '../time-card/receipt.ts';

export const HOURS_PATHS = {
  en: '/hours-calculator',
  es: '/es/calculadora-de-horas',
} as const satisfies Readonly<Record<Lang, string>>;

export const DECIMAL_HOURS_PATHS = {
  en: '/minutes-to-decimal-hours',
  es: '/es/minutos-a-horas-decimales',
} as const satisfies Readonly<Record<Lang, string>>;

export interface Link {
  readonly label: string;
  readonly href: string;
}

/** The warnings of the hours calculator, in the order the engine declares them. */
export type HoursWarning = 'overnight' | 'missingTime' | 'sameTime' | 'breakTooLong';

export interface HoursTexts {
  readonly title: string;
  readonly description: string;
  readonly kicker: string;
  readonly h1: string;
  readonly lead: string;
  readonly start: string;
  readonly end: string;
  readonly unpaidBreak: string;
  readonly timeHint: string;
  readonly figureLabel: string;
  readonly decimalLabel: string;
  readonly shiftLabel: string;
  readonly figures: string;
  readonly warnings: Readonly<Record<HoursWarning, string>>;
  /** How the calculator counts, one point each. */
  readonly notes: readonly string[];
  /** The time tools next to this one. */
  readonly links: readonly Link[];
  /** The pay and labour-law pages, all under US rules: last on the page, under their heading. */
  readonly usHeading: string;
  readonly usLinks: readonly Link[];
  readonly otherLang: string;
}

export interface DecimalHoursTexts {
  readonly title: string;
  readonly description: string;
  readonly kicker: string;
  readonly h1: string;
  readonly lead: string;
  readonly hours: string;
  readonly minutes: string;
  readonly figureLabel: string;
  readonly reverseHeading: string;
  readonly decimal: string;
  readonly fromDecimalLabel: string;
  readonly chartHeading: string;
  readonly chartLead: string;
  readonly chartMinutes: string;
  readonly chartDecimal: string;
  readonly notes: readonly string[];
  readonly links: readonly Link[];
  readonly otherLang: string;
}

export const HOURS_TEXTS: Readonly<Record<Lang, HoursTexts>> = {
  en: {
    title: 'Hours Calculator: Time Between Two Times | Cuenta Horas',
    description:
      'Count the hours between a start and an end time, less your unpaid break, in hours and minutes and in decimal hours. Works across midnight. Free.',
    kicker: 'Hours · free',
    h1: 'Hours calculator',
    lead: 'Enter when you started, when you finished and your unpaid break. You get the hours you worked, in hours and minutes and in decimal hours.',
    start: 'Start time',
    end: 'End time',
    unpaidBreak: 'Unpaid break (minutes)',
    timeHint: 'Type 9:00, 5:30 pm or 17:30.',
    figureLabel: 'Hours worked',
    decimalLabel: 'In decimal hours',
    shiftLabel: 'Start to end, before the break',
    figures: 'The hours in detail',
    warnings: {
      overnight:
        'The end is before the start, so the shift crosses midnight: it is counted into the next day.',
      missingTime: 'Enter both a start and an end time.',
      sameTime: 'The start and the end are the same time, so there are no hours to count.',
      breakTooLong: 'The break is as long as the shift, or longer, so the hours count zero.',
    },
    notes: [
      'An end time before the start time means the shift crosses midnight: 10:00 pm to 6:15 am is 8 hours 15 minutes, or 8.25 hours.',
      'Decimal hours are rounded to two places, to the nearest: 8 hours 20 minutes is 8.33. Your employer’s payroll system may round differently.',
      'The hours are the time from start to end less the unpaid break. A paid break stays in: enter 0.',
    ],
    links: [
      { label: 'Convert minutes to decimal hours', href: '/minutes-to-decimal-hours' },
      { label: 'Convert military time to 12-hour time and back', href: '/military-time-converter' },
      { label: 'Military time chart: every hour of the day', href: '/military-time-chart' },
    ],
    usHeading: 'Hours worked, overtime and full time under US law',
    usLinks: [
      { label: 'A whole week with overtime and pay: the time card', href: '/time-card-calculator' },
      { label: 'Which breaks count as hours worked?', href: HOURS_WORKED_GUIDE_PATHS.en },
      { label: 'How many hours is full time?', href: FULL_TIME_GUIDE_PATHS.en },
      { label: 'How many hours is part time?', href: PART_TIME_GUIDE_PATHS.en },
    ],
    otherLang: 'Español',
  },
  es: {
    title: 'Calculadora de Horas y Minutos, con Suma y Resta | Cuenta Horas',
    description:
      'Calcula el tiempo entre dos horas, menos un descanso, y suma o resta horas y minutos. En horas y minutos y en decimales, con reloj de 24 o de 12 horas.',
    kicker: 'Horas · gratis',
    h1: 'Calculadora de horas y minutos',
    lead: 'Ingresa la hora de inicio, la de fin y el descanso que no cuenta. Te da el tiempo entre las dos, en horas y minutos y en horas decimales. Más abajo, suma y resta horas y minutos.',
    start: 'Hora de inicio',
    end: 'Hora de fin',
    unpaidBreak: 'Descanso que no cuenta (minutos)',
    timeHint: 'Escribe 17:30 o 5:30 p. m.; también 9:00 o 9 a. m.',
    figureLabel: 'Horas entre las dos',
    decimalLabel: 'En horas decimales',
    shiftLabel: 'Del inicio al fin, antes del descanso',
    figures: 'Las horas en detalle',
    warnings: {
      overnight:
        'La hora de fin es antes que la de inicio, así que la cuenta cruza la medianoche: sigue hasta el día siguiente.',
      missingTime: 'Ingresa la hora de inicio y la de fin.',
      sameTime: 'El inicio y el fin son a la misma hora, así que no hay horas que contar.',
      breakTooLong:
        'El descanso dura lo mismo que el tiempo entre las dos horas, o más, así que las horas cuentan cero.',
    },
    notes: [
      'Si la hora de fin es antes que la de inicio, la cuenta cruza la medianoche: de 22:00 (10:00 p. m.) a 6:15 a. m. son 8 horas y 15 minutos, o 8.25 horas.',
      'Las horas decimales se redondean a dos decimales, al más cercano: 8 horas y 20 minutos son 8.33. Un sistema de nómina puede redondear de otra forma.',
      'Las horas son el tiempo del inicio al fin menos el descanso que no cuenta. Si el descanso cuenta como trabajo, pon 0.',
    ],
    links: [
      { label: 'Convierte minutos a horas decimales', href: '/es/minutos-a-horas-decimales' },
      {
        label: 'Convierte la hora militar al formato de 12 horas y al revés',
        href: '/es/convertidor-de-hora-militar',
      },
      { label: 'Tabla de hora militar: cada hora del día', href: '/es/tabla-de-hora-militar' },
      {
        label: 'Calculadora de días entre fechas y cuántos días faltan',
        href: '/es/calculadora-de-dias-entre-fechas',
      },
    ],
    usHeading: 'En EE. UU.: horas trabajadas, horas extra y tiempo completo',
    usLinks: [
      {
        label: 'Una semana con horas extra y pago según la ley de EE. UU.: la tarjeta de horas',
        href: '/es/calculadora-de-horas-trabajadas',
      },
      {
        label: '¿Qué descansos cuentan como horas trabajadas en EE. UU.?',
        href: HOURS_WORKED_GUIDE_PATHS.es,
      },
      { label: '¿Cuántas horas son tiempo completo en EE. UU.?', href: FULL_TIME_GUIDE_PATHS.es },
      { label: '¿Cuántas horas son medio tiempo en EE. UU.?', href: PART_TIME_GUIDE_PATHS.es },
    ],
    otherLang: 'English',
  },
};

export const DECIMAL_HOURS_TEXTS: Readonly<Record<Lang, DecimalHoursTexts>> = {
  en: {
    title: 'Minutes to Decimal Hours Converter and Chart | Cuenta Horas',
    description:
      'Convert hours and minutes to decimal hours for your time card, and decimal hours back to minutes, with a chart of every minute from 0 to 59. Free.',
    kicker: 'Decimal hours · free',
    h1: 'Minutes to decimal hours',
    lead: 'Enter hours and minutes to get decimal hours, the way payroll writes them. Or enter decimal hours to read them as hours and minutes.',
    hours: 'Hours',
    minutes: 'Minutes',
    figureLabel: 'Decimal hours',
    reverseHeading: 'Decimal hours to hours and minutes',
    decimal: 'Decimal hours',
    fromDecimalLabel: 'Hours and minutes',
    chartHeading: 'Minutes to decimal hours chart',
    chartLead: 'Each minute divided by 60, rounded to two places.',
    chartMinutes: 'Min',
    chartDecimal: 'Hours',
    notes: [
      'Decimal hours are the minutes divided by 60: 45 minutes is 0.75 hours, and 8 hours 20 minutes is 8.33 hours.',
      'Decimals are rounded to two places, to the nearest. Your employer’s payroll system may round differently, so a time card can be off by a minute or a cent.',
      'Decimal hours read back to the nearest whole minute: 7.75 hours is 7 hours 45 minutes.',
    ],
    links: [
      { label: 'Count the hours between two times', href: '/hours-calculator' },
      { label: 'Add up a whole week on the time card', href: '/time-card-calculator' },
      {
        label: 'How to calculate hours worked, with lunch breaks',
        href: HOURS_WORKED_GUIDE_PATHS.en,
      },
    ],
    otherLang: 'Español',
  },
  es: {
    title: 'Minutos a Horas Decimales: Convertidor y Tabla | Cuenta Horas',
    description:
      'Convierte horas y minutos a horas decimales para tu tarjeta de horas, y horas decimales a minutos, con una tabla de cada minuto de 0 a 59. Gratis.',
    kicker: 'Horas decimales · gratis',
    h1: 'Minutos a horas decimales',
    lead: 'Ingresa horas y minutos para tener las horas decimales, como las escribe la nómina. O ingresa horas decimales para leerlas en horas y minutos.',
    hours: 'Horas',
    minutes: 'Minutos',
    figureLabel: 'Horas decimales',
    reverseHeading: 'De horas decimales a horas y minutos',
    decimal: 'Horas decimales',
    fromDecimalLabel: 'Horas y minutos',
    chartHeading: 'Tabla de minutos a horas decimales',
    chartLead: 'Cada minuto dividido por 60, redondeado a dos decimales.',
    chartMinutes: 'Min',
    chartDecimal: 'Horas',
    notes: [
      'Las horas decimales son los minutos divididos por 60: 45 minutos son 0.75 horas, y 8 horas y 20 minutos son 8.33 horas.',
      'Los decimales se redondean a dos lugares, al más cercano. El sistema de nómina de tu empleador puede redondear de otra forma, así que una tarjeta de horas puede variar por un minuto o un centavo.',
      'Las horas decimales se leen al minuto entero más cercano: 7.75 horas son 7 horas y 45 minutos.',
      'Aquí los decimales se escriben con punto, como en México y en la nómina de EE. UU.: 0.75. En España se escriben con coma, 0,75: es el mismo número.',
    ],
    links: [
      { label: 'Calcula las horas entre dos horas', href: '/es/calculadora-de-horas' },
      {
        label: 'Suma una semana entera en la tarjeta de horas',
        href: '/es/calculadora-de-horas-trabajadas',
      },
      {
        label: 'Cómo calcular las horas trabajadas, con descanso',
        href: HOURS_WORKED_GUIDE_PATHS.es,
      },
    ],
    otherLang: 'English',
  },
};
