import { additionOf, subtractionOf, sumOf, type Duration } from '@maestro-calc/pay-core/hours';
import { clock12Text, clock24Text, durationDecimalText, durationText } from '../format.ts';
import type { LongTailSection } from '../long-tail/sections.ts';
import type { Lang } from '../time-card/receipt.ts';

/*
 * The time arithmetic of the hours calculator, below its result: adding and subtracting hours and
 * minutes (the second form of the page), a week added up day by day, and the same times on the
 * 24-hour and the 12-hour clock. Every figure comes from the engine at build time.
 */

const d = (hours: number, minutes: number): Duration => ({ hours, minutes });

/** The pair worked step by step: one sum with a carry, one difference with a borrow. */
const ADDED = [d(7, 45), d(3, 30)] as const;
const TAKEN = [d(10, 15), d(2, 50)] as const;

/** The sums, then the differences, of the examples table; the last one comes out negative. */
const EXAMPLES: readonly (readonly [Duration, '+' | '−', Duration])[] = [
  [d(7, 45), '+', d(3, 30)],
  [d(8, 50), '+', d(1, 25)],
  [d(2, 40), '+', d(2, 40)],
  [d(0, 45), '+', d(0, 45)],
  [d(7, 45), '−', d(3, 30)],
  [d(10, 15), '−', d(2, 50)],
  [d(8, 0), '−', d(0, 45)],
  [d(1, 20), '−', d(2, 45)],
];

/** Monday to Friday of the week table. */
const WEEK: readonly Duration[] = [d(8, 15), d(7, 50), d(8, 5), d(9, 30), d(6, 45)];

/** The times of the clock table, in minutes after midnight. */
const TIMES = [0, 360, 570, 720, 780, 870, 1050, 1200, 1335, 1439] as const;

const n = (value: number): string => value.toLocaleString('en-US');
const of = ({ hours, minutes }: Duration): string => `${String(hours)} h ${String(minutes)} min`;

export interface HoursSumTexts {
  readonly heading: string;
  readonly lead: string;
  readonly first: string;
  readonly second: string;
  readonly hours: string;
  readonly minutes: string;
  readonly sumLabel: string;
  readonly differenceLabel: string;
  readonly decimalLabel: string;
  readonly figures: string;
  /** How the page writes decimal hours, and how the other Spanish style writes them. */
  readonly decimalNote: string;
}

export const HOURS_SUM_TEXTS: Readonly<Record<Lang, HoursSumTexts>> = {
  en: {
    heading: 'Add and subtract hours and minutes',
    lead: 'Enter two lengths of time, such as 7 h 45 min and 3 h 30 min, to get their sum and their difference. Minutes can go past 59: 90 minutes count as 1 h 30 min.',
    first: 'First time',
    second: 'Second time',
    hours: 'Hours',
    minutes: 'Minutes',
    sumLabel: 'Sum',
    differenceLabel: 'Difference (first minus second)',
    decimalLabel: 'Sum in decimal hours',
    figures: 'The sum and the difference',
    decimalNote:
      'Decimal hours are written with a point, as payroll writes them: 8.25 hours is 8 hours and 15 minutes.',
  },
  es: {
    heading: 'Sumar y restar horas y minutos',
    lead: 'Escribe dos tiempos, como 7 h 45 min y 3 h 30 min, para tener su suma y su resta. Los minutos pueden pasar de 59: 90 minutos cuentan como 1 h 30 min.',
    first: 'Primer tiempo',
    second: 'Segundo tiempo',
    hours: 'Horas',
    minutes: 'Minutos',
    sumLabel: 'Suma',
    differenceLabel: 'Resta (el primero menos el segundo)',
    decimalLabel: 'Suma en horas decimales',
    figures: 'La suma y la resta',
    decimalNote:
      'Aquí las horas decimales se escriben con punto, como en México y en la nómina de EE. UU.: 8.25 horas son 8 horas y 15 minutos. En España se escribe con coma, 8,25: es el mismo número.',
  },
};

const WORDS = {
  en: {
    workedHeading: 'How to add and subtract hours and minutes',
    workedIntro:
      'Work the minutes first and the hours after, as with any column sum, with 60 minutes to the hour instead of 10:',
    addMinutes: (a: number, b: number, total: number, carried: string): string =>
      `Add the minutes: ${String(a)} + ${String(b)} = ${String(total)} minutes, which is ${carried}.`,
    addHours: (sum: string, total: string, decimal: string): string =>
      `Add the hours, with the hour carried: ${sum} hours. So ${total}, or ${decimal} decimal hours.`,
    borrow: (a: string, b: string, has: number, away: number, borrowed: string): string =>
      `To subtract ${b} from ${a}, there are fewer minutes (${String(has)}) than to take away (${String(away)}), so borrow 1 hour: ${a} is ${borrowed}.`,
    takeAway: (minutes: string, hours: string, total: string, decimal: string): string =>
      `Then ${minutes} minutes and ${hours} hours: ${total}, or ${decimal} decimal hours.`,
    carried: (hours: number, minutes: number): string =>
      `${String(hours)} hour${hours === 1 ? '' : 's'} and ${String(minutes)} minutes`,
    examplesHeading: 'Sums and differences of hours and minutes',
    examplesIntro:
      'Each line is worked out the same way. When the second time is longer, the difference is negative: the time that is missing.',
    examplesCaption: 'Hours and minutes added and subtracted',
    examplesHead: ['Operation', 'Result', 'In decimal hours'],
    weekHeading: 'Adding up the hours of a week',
    weekIntro:
      'The same sum, five times: the hours of each day added to the total so far. This is what the time card does with a start and an end for every day.',
    weekCaption: 'A week added up day by day',
    weekHead: ['Day', 'Hours that day', 'Total so far'],
    weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    weekAfter: (total: string, decimal: string): string =>
      `The week comes to ${total}, or ${decimal} decimal hours. Each time the minutes of the total reach 60, they become one more hour.`,
    clockHeading: 'The 24-hour clock and the 12-hour clock',
    clockIntro:
      'The calculator reads both: 14:30, 2:30 pm and 2:30 p.m. are the same time. On the 24-hour clock the hours run from 0 to 23; on the 12-hour clock they run from 12 to 11 twice, am before noon and pm after.',
    clockCaption: 'The same times on both clocks',
    clockHead: ['24-hour clock', '12-hour clock', 'Minutes after midnight'],
    clockAfter:
      'To go from the 12-hour clock to the 24-hour one, add 12 to the pm hours (2:30 pm is 14:30), except 12 pm, which is 12:00, noon; 12 am is 0:00, midnight.',
  },
  es: {
    workedHeading: 'Cómo se suman y se restan horas y minutos',
    workedIntro:
      'Primero los minutos y después las horas, como en cualquier suma en columna, pero con 60 minutos por hora en lugar de 10:',
    addMinutes: (a: number, b: number, total: number, carried: string): string =>
      `Suma los minutos: ${String(a)} + ${String(b)} = ${String(total)} minutos, que son ${carried}.`,
    addHours: (sum: string, total: string, decimal: string): string =>
      `Suma las horas, con la hora que se lleva: ${sum} horas. Así, ${total}, o ${decimal} horas decimales.`,
    borrow: (a: string, b: string, has: number, away: number, borrowed: string): string =>
      `Para restar ${b} de ${a}, hay menos minutos (${String(has)}) de los que hay que quitar (${String(away)}), así que pide prestada 1 hora: ${a} son ${borrowed}.`,
    takeAway: (minutes: string, hours: string, total: string, decimal: string): string =>
      `Luego ${minutes} minutos y ${hours} horas: ${total}, o ${decimal} horas decimales.`,
    carried: (hours: number, minutes: number): string =>
      `${String(hours)} hora${hours === 1 ? '' : 's'} y ${String(minutes)} minutos`,
    examplesHeading: 'Sumas y restas de horas y minutos',
    examplesIntro:
      'Cada línea se calcula igual. Cuando el segundo tiempo es más largo, la resta da negativa: es el tiempo que falta.',
    examplesCaption: 'Horas y minutos sumados y restados',
    examplesHead: ['Operación', 'Resultado', 'En horas decimales'],
    weekHeading: 'Sumar las horas de una semana',
    weekIntro:
      'La misma suma, cinco veces: las horas de cada día se suman al total que llevas. Es lo que hace la tarjeta de horas con la entrada y la salida de cada día.',
    weekCaption: 'Una semana sumada día por día',
    weekHead: ['Día', 'Horas del día', 'Total acumulado'],
    weekdays: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'],
    weekAfter: (total: string, decimal: string): string =>
      `La semana suma ${total}, o ${decimal} horas decimales. Cada vez que los minutos del total llegan a 60, pasan a ser una hora más.`,
    clockHeading: 'Reloj de 24 horas y de 12 horas (a. m. y p. m.)',
    clockIntro:
      'En España se escribe sobre todo el reloj de 24 horas (14:30); en México es común el de 12 horas, con a. m. antes del mediodía y p. m. después (2:30 p. m.). La calculadora lee los dos: 14:30, 2:30 p. m. y 2:30 pm son la misma hora.',
    clockCaption: 'Las mismas horas en los dos relojes',
    clockHead: ['Reloj de 24 horas', 'Reloj de 12 horas', 'Minutos desde la medianoche'],
    clockAfter:
      'Para pasar del reloj de 12 horas al de 24, suma 12 a las horas p. m. (2:30 p. m. son las 14:30), salvo las 12 p. m., que son las 12:00, el mediodía; las 12 a. m. son las 0:00, la medianoche.',
  },
} as const;

/** The worked steps: the sum with its carry, then the difference with its borrow. */
const stepsOf = (lang: Lang): string[] => {
  const w = WORDS[lang];
  const [a, b] = ADDED;
  const added = additionOf(a, b);
  const [from, away] = TAKEN;
  const taken = subtractionOf(from, away);
  const borrowed = `${String(from.hours - 1)} h ${String(from.minutes + 60)} min`;
  return [
    w.addMinutes(a.minutes, b.minutes, added.minutes, w.carried(added.carry, added.restMinutes)),
    w.addHours(
      `${String(a.hours)} + ${String(b.hours)} + ${String(added.carry)} = ${String(added.hours)}`,
      `${of(a)} + ${of(b)} = ${durationText(added.total)}`,
      durationDecimalText(added.total),
    ),
    w.borrow(of(from), of(away), from.minutes, away.minutes, borrowed),
    w.takeAway(
      `${String(from.minutes + 60)} − ${String(away.minutes)} = ${String(taken.minutes)}`,
      `${String(from.hours - 1)} − ${String(away.hours)} = ${String(taken.hours)}`,
      `${of(from)} − ${of(away)} = ${durationText(taken.total)}`,
      durationDecimalText(taken.total),
    ),
  ];
};

/** The sections of the hours calculator in one language, after its two forms. */
export const hoursSectionsOf = (lang: Lang): readonly LongTailSection[] => {
  const w = WORDS[lang];
  let running = 0;
  const weekRows = WEEK.map((day, index) => {
    running += sumOf([day]);
    return [w.weekdays[index] ?? '', of(day), durationText(running)];
  });
  const week = sumOf(WEEK);
  return [
    {
      id: 'sum-worked',
      heading: w.workedHeading,
      paragraphs: [w.workedIntro],
      steps: stepsOf(lang),
    },
    {
      id: 'sum-examples',
      heading: w.examplesHeading,
      paragraphs: [w.examplesIntro],
      table: {
        caption: w.examplesCaption,
        head: w.examplesHead,
        rows: EXAMPLES.map(([a, op, b]) => {
          const total = op === '+' ? additionOf(a, b).total : subtractionOf(a, b).total;
          return [`${of(a)} ${op} ${of(b)}`, durationText(total), durationDecimalText(total)];
        }),
      },
    },
    {
      id: 'sum-week',
      heading: w.weekHeading,
      paragraphs: [w.weekIntro],
      table: { caption: w.weekCaption, head: w.weekHead, rows: weekRows },
      after: [w.weekAfter(durationText(week), durationDecimalText(week))],
    },
    {
      id: 'clock',
      heading: w.clockHeading,
      paragraphs: [w.clockIntro],
      table: {
        caption: w.clockCaption,
        head: w.clockHead,
        rows: TIMES.map((time) => [clock24Text(time), clock12Text(time, lang), n(time)]),
      },
      after: [w.clockAfter],
    },
  ];
};
