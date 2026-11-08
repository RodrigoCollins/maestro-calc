import { Rational } from '@maestro-calc/core';
import { clockFieldText as t, hoursText } from '../format.ts';
import { HOURS_PATHS, HOURS_TEXTS } from '../hours/texts.ts';
import { descriptionOf, titleOf } from '../seo/meta.ts';
import type { Lang } from '../time-card/receipt.ts';
import { fieldOf as f } from './clock.ts';
import type { CommonLinks, LongTailPage } from './jobs.ts';
import { minutesLink, shiftLink, WORKED } from './live-links.ts';
import { pathOf, TIME_OFFSETS, type TimeOffset } from './routes.ts';
import { SOURCES, type LongTailSection, type LongTailSource } from './sections.ts';
import { clockShift } from './time-math.ts';

/*
 * The hours ago and minutes from now pages. The time they answer is the visitor's, so the page as
 * built gives what holds at any hour: the subtraction, the hour from which the date changes, and
 * the time from each hour of the day; `../client/time-now.ts` fills the live answer. Times of day
 * are minutes from midnight.
 */

const DAY = 1440;
/** `la 1:00 pm`, `las 3:00 pm`: the article of a time in Spanish. */
const las = (time: string): string => (time.startsWith('1:') ? `la ${time}` : `las ${time}`);
const n = (value: number): string => value.toLocaleString('en-US');
const decimalOf = (minutes: number): string => hoursText(Rational.of(minutes, 60));
/** `2:75`: a time written with its minutes past 59, before the carry. */
const uncarried = (minutes: number, add: number): string =>
  `${String(Math.floor(minutes / 60) % 12 || 12)}:${String((minutes % 60) + add)}`;

/** The moment of each example, so the arithmetic of every page reads on the same clocks. */
const EVENING = 17 * 60;
const MORNING = 6 * 60;
const MORNING_MINUTES = 6 * 60 + 40;
/** The time before midnight a minutes page starts its next-day example from: 11:45 pm for 30. */
const lateOf = (m: number): number => DAY - Math.ceil(m / 10) * 5;
/** The time before 3:00 pm its carry example starts from: 2:45 pm for 30. */
const carryOf = (m: number): number => 900 - Math.ceil(m / 10) * 5;

/** The working day each amount is set in, in its own words, and the pages it points to. */
const WORK = {
  en: {
    8: [
      'At the end of a 9-to-5 shift, 5:00 pm, 8 hours ago was 9:00 am: the start of the same shift, which with an unpaid 30-minute lunch holds 7.5 hours of work. At 6:00 am, when a 10 pm to 6 am night shift ends, 8 hours ago was 10:00 pm yesterday, the start of that shift on the date before.',
    ],
    9: [
      'From 5:00 pm, 9 hours ago was 8:00 am: the 8-to-5 day, 9 hours on the clock and 8 worked once an unpaid hour of lunch comes off. From 7:00 am, 9 hours ago was 10:00 pm yesterday, the end of a 2 pm to 10 pm evening shift, so 9 hours is the rest between that shift and a 7 am start.',
    ],
    13: [
      'From 7:00 pm, the end of a 7 am to 7 pm shift, 13 hours ago was 6:00 am, an hour before that shift began. From 7:00 am, the end of a 7 pm to 7 am night shift, 13 hours ago was 6:00 pm yesterday: again one hour before the start, so a 12-hour shift with an hour to get there is 13 hours away from home.',
    ],
    15: [
      'From 5:00 pm, the end of a 9-to-5 shift, 15 hours ago was 2:00 am of the same day. Counted forward, 15 hours is the rest between that shift and the next morning: 5:00 pm + 15 h = 8:00 am, so a worker who leaves at 5 and starts again at 8 has 15 hours off.',
    ],
    15.1: [
      'A 15-minute break that starts now ends at the time in the answer above. Federal law does not require breaks, but a short one of about 5 to 20 minutes, when the employer gives it, is paid work time (29 CFR 785.18). 15 minutes is also the step of a time clock that rounds to the nearest quarter hour: 1 to 7 minutes past a quarter round down and 8 to 14 round up, which is allowed only if, over time, you are paid for all the time you worked (29 CFR 785.48).',
    ],
    30.1: [
      'A 30-minute lunch that starts now ends at the time in the answer above. Under federal law a meal period, ordinarily 30 minutes or more with you fully off duty, is not work time (29 CFR 785.19), so it comes off the hours of the day: an 8:00 am to 4:30 pm shift with a 30-minute lunch is 8 hours worked. Shorter breaks of about 5 to 20 minutes are paid (29 CFR 785.18). Federal law does not require a meal break, but some states do, each with its own length.',
    ],
  },
  es: {
    8: [
      'Al final de un turno de 9 a 5, a las 5:00 pm, hace 8 horas eran las 9:00 am: el inicio de ese mismo turno, que con 30 minutos de almuerzo sin pago tiene 7.5 horas de trabajo. A las 6:00 am, cuando termina un turno de noche de 10 pm a 6 am, hace 8 horas eran las 10:00 pm de ayer, el inicio de ese turno en la fecha anterior.',
    ],
    9: [
      'Desde las 5:00 pm, hace 9 horas eran las 8:00 am: la jornada de 8 a 5, 9 horas de reloj y 8 trabajadas cuando se resta una hora de almuerzo sin pago. Desde las 7:00 am, hace 9 horas eran las 10:00 pm de ayer, el final de un turno de tarde de 2 pm a 10 pm, así que 9 horas es el descanso entre ese turno y una entrada a las 7 am.',
    ],
    13: [
      'Desde las 7:00 pm, el final de un turno de 7 am a 7 pm, hace 13 horas eran las 6:00 am, una hora antes de que empezara. Desde las 7:00 am, el final de un turno de noche de 7 pm a 7 am, hace 13 horas eran las 6:00 pm de ayer: otra vez una hora antes del inicio, así que un turno de 12 horas con una hora de viaje te tiene 13 horas fuera de casa.',
    ],
    15: [
      'Desde las 5:00 pm, el final de un turno de 9 a 5, hace 15 horas eran las 2:00 am del mismo día. Hacia adelante, 15 horas es el descanso entre ese turno y la mañana siguiente: 5:00 pm + 15 h = 8:00 am, así que si sales a las 5 y vuelves a entrar a las 8 tienes 15 horas libres.',
    ],
    15.1: [
      'Un descanso de 15 minutos que empieza ahora termina a la hora de la respuesta de arriba. La ley federal no exige descansos, pero uno corto, de unos 5 a 20 minutos, cuando el empleador lo da, es tiempo de trabajo pagado (29 CFR 785.18). 15 minutos es también el paso de un reloj checador que redondea al cuarto de hora más cercano: de 1 a 7 minutos después de un cuarto se redondea hacia abajo y de 8 a 14 hacia arriba, algo permitido solo si, con el tiempo, te pagan todo el tiempo que trabajaste (29 CFR 785.48).',
    ],
    30.1: [
      'Un almuerzo de 30 minutos que empieza ahora termina a la hora de la respuesta de arriba. Con la ley federal, un descanso para comer, por lo general de 30 minutos o más y libre de tareas, no es tiempo de trabajo (29 CFR 785.19), así que se resta de las horas del día: un turno de 8:00 am a 4:30 pm con 30 minutos de almuerzo son 8 horas trabajadas. Los descansos más cortos, de unos 5 a 20 minutos, se pagan (29 CFR 785.18). La ley federal no exige un descanso para comer, pero algunos estados sí, cada uno con su duración.',
    ],
  },
} as const;

const workLinksOf = (key: number, lang: Lang) => {
  if (key === 8) return [shiftLink('9:00', '17:00', lang), shiftLink('22:00', '6:00', lang)];
  if (key === 9) return [shiftLink('8:00', '17:00', lang), shiftLink('14:00', '22:00', lang)];
  if (key === 13) return [shiftLink('7:00', '19:00', lang), shiftLink('19:00', '7:00', lang)];
  if (key === 15) return [shiftLink('9:00', '17:00', lang)];
  if (key === 15.1) return [minutesLink(15, lang)];
  return [minutesLink(30, lang), shiftLink('8:00', '16:30', lang)];
};

const SOURCES_OF: Readonly<Record<number, readonly LongTailSource[]>> = {
  15.1: [SOURCES.ecfr18, SOURCES.ecfr48, SOURCES.breaks],
  30.1: [SOURCES.ecfr19, SOURCES.ecfr18, SOURCES.mealTable],
};

const WORDS = {
  en: {
    day: { '-1': 'previous day', '0': 'same day', '1': 'next day' },
    hoursAgo: {
      h1: (h: number): string => `What time was it ${String(h)} hours ago?`,
      headline: (h: number): string =>
        `${String(h)} hours ago: the clock minus ${String(h)} h, or plus ${String(24 - h)} h the day before`,
      lead: (h: number, cut: string, back: string): string =>
        `${String(h)} hours ago is the time on your clock minus ${String(h)} hours. From ${cut} on, it is the same day; before ${cut}, the count crosses midnight, so add ${String(24 - h)} hours and go back one day: at 6:00 am, ${String(h)} hours ago was ${back} yesterday.`,
      fallback: (h: number, cut: string): string =>
        `Subtract ${String(h)} hours from the time on your clock. Before ${cut}, add ${String(24 - h)} hours instead and read the date as yesterday.`,
      before: (h: number): string =>
        `It is {now} now, so ${String(h)} hours ago it was {time} yesterday, {weekday}.`,
      same: (h: number): string =>
        `It is {now} now, so ${String(h)} hours ago it was {time} today.`,
      after: (h: number): string => `${String(h)} hours ago it was {time}, {weekday}.`,
      rows: {
        same: 'Same day',
        previous: (h: number): string => `Previous day, clock + ${String(24 - h)} h`,
        minutes: 'Minutes',
        workdays: '8-hour workdays',
      },
      range: (from: string, to: string): string => `${from} to ${to}`,
      steps: (h: number): string[] => {
        const d = h * 60;
        return [
          'Write the time now on a 24-hour clock: 5:00 pm is 17:00, and 6:00 am is 6:00.',
          `From 5:00 pm, subtract ${String(h)} hours: 17:00 − ${f(d)} = ${f(EVENING - d)}, ${t(EVENING - d)} of the same day.`,
          `From 6:00 am the subtraction goes below zero, so borrow a day of 24 hours: 6:00 + 24:00 − ${f(d)} = ${f(MORNING + DAY - d)}, ${t(MORNING + DAY - d)} of the day before.`,
          `The shortcut for the borrowed day: 24 − ${String(h)} = ${String(24 - h)}, so before ${t(d)} add ${String(24 - h)} hours to the time now and step back one date.`,
          `The minutes stay as they are: 6:40 am minus ${String(h)} hours is ${t(MORNING_MINUTES + DAY - d)} the day before.`,
          `In minutes, ${String(h)} hours are ${String(h)} × 60 = ${n(d)} minutes.`,
        ];
      },
      tableHeading: (h: number): string => `${String(h)} hours ago from each hour of the day`,
      table: (h: number, cut: string): string =>
        `Find the time now in the first column: the second is ${String(h)} hours earlier, and the third says whether that falls on the same date. Every row from ${cut} on is the same day, and the ${String(h)} rows before it are the day before.`,
      caption: (h: number): string => `${String(h)} hours before each hour`,
      head: (h: number): string[] => ['Time now', `${String(h)} hours ago`, 'Day'],
      opposite: (h: number): string => `${String(h)} hours from now`,
      forward: (h: number, cut: string, morning: string): string =>
        `Forward, ${String(h)} hours from now is the clock plus ${String(h)} hours. It lands on the next day from ${cut} on (${cut} + ${String(h)} h = 12:00 am), and stays on the same day before ${cut}: 6:00 am + ${String(h)} h = ${morning}.`,
      apart: (h: number, span: string): string =>
        `${String(h)} hours ago and ${String(h)} hours from now are ${span} apart, ${String(2 * h)} hours in all.`,
      workHeading: (h: number): string => `${String(h)} hours in a working day`,
      overtime: (h: number): string =>
        `However long the day, federal law counts overtime by the workweek: time and a half for the hours past 40 in it (DOL Fact Sheet #23), so ${String(h)} hours in one day are not overtime by themselves.`,
    },
    minutesFromNow: {
      h1: (m: number): string => `What time will it be ${String(m)} minutes from now?`,
      headline: (m: number, dec: string): string =>
        `${String(m)} minutes from now: the clock plus ${String(m)} min, ${dec} hours`,
      name: { 15: 'a quarter of an hour', 30: 'half an hour' } as Readonly<Record<number, string>>,
      lead: (m: number, name: string, cut: string, late: string, next: string): string =>
        `${String(m)} minutes from now is the time on your clock plus ${String(m)} minutes, ${name}. Only from ${cut} on does it reach the next day: at ${late}, ${String(m)} minutes from now is ${next} tomorrow.`,
      fallback: (m: number): string =>
        `Add ${String(m)} minutes to the time on your clock; when the minutes pass 59, carry one hour.`,
      same: (m: number): string =>
        `It is {now} now, so ${String(m)} minutes from now it will be {time}.`,
      after: (m: number): string =>
        `It is {now} now, so ${String(m)} minutes from now it will be {time} tomorrow, {weekday}.`,
      rows: {
        next: 'Next day',
        decimal: 'In decimal hours',
        seconds: 'Seconds',
        share: 'Share of an 8-hour shift',
      },
      from: (time: string): string => `from ${time}`,
      steps: (m: number): string[] => {
        const carry = carryOf(m);
        const late = lateOf(m);
        return [
          `Add ${String(m)} to the minutes of the time now: 2:10 pm + ${String(m)} min = ${t(850 + m)}.`,
          `When the minutes pass 59, carry an hour: ${t(carry)} + ${String(m)} min = ${uncarried(carry, m)}, which is ${t(carry + m)}.`,
          `Past 11:59 pm the carry also changes the date: ${t(late)} + ${String(m)} min = ${t(late + m - DAY)} of the next day.`,
          `As a fraction of an hour, ${String(m)} minutes are ${String(m)} ÷ 60 = ${decimalOf(m)} hours, the figure a time card writes for them.`,
        ];
      },
      tableHeading: (m: number): string =>
        `${String(m)} minutes from now in the last hour of the day`,
      table: (m: number): string =>
        `The only times that move the date are the last ${String(m)} minutes before midnight. Every 5 minutes of the 11 pm hour, ${String(m)} minutes on:`,
      caption: (m: number): string => `${String(m)} minutes after each time from 11:00 pm`,
      head: (m: number): string[] => ['Time now', `${String(m)} minutes later`, 'Day'],
      opposite: (m: number): string => `${String(m)} minutes ago`,
      back: (m: number, from: string, to: string, early: string): string =>
        `Back, ${String(m)} minutes ago is the clock minus ${String(m)} minutes; borrow an hour when the minutes run below zero: 3:05 pm − ${String(m)} min = ${from}. Only before ${early} does it fall on the previous day: 12:10 am − ${String(m)} min = ${to} yesterday.`,
      workHeading: (m: number): string => `${String(m)} minutes at work`,
    },
    figure: 'From the time on your clock',
    breakdown: 'The rule at any time of day',
    edit: 'Count the hours between two times',
    others: 'Other times from now and ago',
    common: 'Hours ago and minutes from now',
    note: 'The live answer follows the clock and the time zone of your device. On the night clocks change for daylight saving time, one hour of the count is skipped or repeated.',
  },
  es: {
    day: { '-1': 'día anterior', '0': 'mismo día', '1': 'día siguiente' },
    hoursAgo: {
      h1: (h: number): string => `¿Qué hora era hace ${String(h)} horas?`,
      headline: (h: number): string =>
        `Hace ${String(h)} horas: tu hora menos ${String(h)} h, o más ${String(24 - h)} h el día anterior`,
      lead: (h: number, cut: string, back: string): string =>
        `Hace ${String(h)} horas es la hora de tu reloj menos ${String(h)} horas. Desde ${las(cut)}, es el mismo día; antes de ${las(cut)}, la cuenta cruza la medianoche, así que suma ${String(24 - h)} horas y retrocede un día: a las 6:00 am, hace ${String(h)} horas eran las ${back} de ayer.`,
      fallback: (h: number, cut: string): string =>
        `Resta ${String(h)} horas a la hora de tu reloj. Antes de ${las(cut)}, suma ${String(24 - h)} horas y lee la fecha como ayer.`,
      before: (h: number): string =>
        `Ahora: {now}. Hace ${String(h)} horas: {time} de ayer, {weekday}.`,
      same: (h: number): string => `Ahora: {now}. Hace ${String(h)} horas: {time} de hoy.`,
      after: (h: number): string => `Hace ${String(h)} horas: {time}, {weekday}.`,
      rows: {
        same: 'Mismo día',
        previous: (h: number): string => `Día anterior, hora + ${String(24 - h)} h`,
        minutes: 'Minutos',
        workdays: 'Jornadas de 8 horas',
      },
      range: (from: string, to: string): string => `de ${from} a ${to}`,
      steps: (h: number): string[] => {
        const d = h * 60;
        return [
          'Escribe la hora actual en reloj de 24 horas: las 5:00 pm son las 17:00, y las 6:00 am son las 6:00.',
          `Desde las 5:00 pm, resta ${String(h)} horas: 17:00 − ${f(d)} = ${f(EVENING - d)}, las ${t(EVENING - d)} del mismo día.`,
          `Desde las 6:00 am la resta queda bajo cero, así que pide prestado un día de 24 horas: 6:00 + 24:00 − ${f(d)} = ${f(MORNING + DAY - d)}, las ${t(MORNING + DAY - d)} del día anterior.`,
          `El atajo del día prestado: 24 − ${String(h)} = ${String(24 - h)}, así que antes de ${las(t(d))} suma ${String(24 - h)} horas a la hora actual y retrocede una fecha.`,
          `Los minutos quedan igual: las 6:40 am menos ${String(h)} horas son las ${t(MORNING_MINUTES + DAY - d)} del día anterior.`,
          `En minutos, ${String(h)} horas son ${String(h)} × 60 = ${n(d)} minutos.`,
        ];
      },
      tableHeading: (h: number): string => `Hace ${String(h)} horas desde cada hora del día`,
      table: (h: number, cut: string): string =>
        `Busca la hora actual en la primera columna: la segunda es ${String(h)} horas antes, y la tercera dice si cae en la misma fecha. Cada fila desde ${las(cut)} es el mismo día, y las ${String(h)} filas anteriores son el día anterior.`,
      caption: (h: number): string => `${String(h)} horas antes de cada hora`,
      head: (h: number): string[] => ['Hora actual', `Hace ${String(h)} horas`, 'Día'],
      opposite: (h: number): string => `Dentro de ${String(h)} horas`,
      forward: (h: number, cut: string, morning: string): string =>
        `Hacia adelante, dentro de ${String(h)} horas es tu hora más ${String(h)} horas. Cae en el día siguiente desde ${las(cut)} (${cut} + ${String(h)} h = 12:00 am), y queda en el mismo día antes de ${las(cut)}: 6:00 am + ${String(h)} h = ${morning}.`,
      apart: (h: number, span: string): string =>
        `Hace ${String(h)} horas y dentro de ${String(h)} horas están a ${span} de distancia, ${String(2 * h)} horas en total.`,
      workHeading: (h: number): string => `${String(h)} horas en una jornada de trabajo`,
      overtime: (h: number): string =>
        `Por largo que sea el día, la ley federal cuenta las horas extra por semana laboral: tiempo y medio por las horas después de 40 en ella (DOL Fact Sheet #23), así que ${String(h)} horas en un día no son horas extra por sí solas.`,
    },
    minutesFromNow: {
      h1: (m: number): string => `¿Qué hora será dentro de ${String(m)} minutos?`,
      headline: (m: number, dec: string): string =>
        `Dentro de ${String(m)} minutos: tu hora más ${String(m)} min, ${dec} horas`,
      name: { 15: 'un cuarto de hora', 30: 'media hora' } as Readonly<Record<number, string>>,
      lead: (m: number, name: string, cut: string, late: string, next: string): string =>
        `Dentro de ${String(m)} minutos es la hora de tu reloj más ${String(m)} minutos, ${name}. Solo desde ${las(cut)} llega al día siguiente: a las ${late}, dentro de ${String(m)} minutos son las ${next} de mañana.`,
      fallback: (m: number): string =>
        `Suma ${String(m)} minutos a la hora de tu reloj; cuando los minutos pasan de 59, suma una hora.`,
      same: (m: number): string => `Ahora: {now}. Dentro de ${String(m)} minutos: {time} de hoy.`,
      after: (m: number): string =>
        `Ahora: {now}. Dentro de ${String(m)} minutos: {time} de mañana, {weekday}.`,
      rows: {
        next: 'Día siguiente',
        decimal: 'En horas decimales',
        seconds: 'Segundos',
        share: 'Parte de un turno de 8 horas',
      },
      from: (time: string): string => `desde las ${time}`,
      steps: (m: number): string[] => {
        const carry = carryOf(m);
        const late = lateOf(m);
        return [
          `Suma ${String(m)} a los minutos de la hora actual: 2:10 pm + ${String(m)} min = ${t(850 + m)}.`,
          `Cuando los minutos pasan de 59, lleva una hora: ${t(carry)} + ${String(m)} min = ${uncarried(carry, m)}, que son las ${t(carry + m)}.`,
          `Después de las 11:59 pm, llevar la hora también cambia la fecha: ${t(late)} + ${String(m)} min = ${t(late + m - DAY)} del día siguiente.`,
          `Como fracción de hora, ${String(m)} minutos son ${String(m)} ÷ 60 = ${decimalOf(m)} horas, la cifra que anota una tarjeta de horas.`,
        ];
      },
      tableHeading: (m: number): string =>
        `Dentro de ${String(m)} minutos en la última hora del día`,
      table: (m: number): string =>
        `Las únicas horas que cambian la fecha son los últimos ${String(m)} minutos antes de la medianoche. Cada 5 minutos de la hora de las 11 pm, ${String(m)} minutos después:`,
      caption: (m: number): string =>
        `${String(m)} minutos después de cada hora desde las 11:00 pm`,
      head: (m: number): string[] => ['Hora actual', `${String(m)} minutos después`, 'Día'],
      opposite: (m: number): string => `Hace ${String(m)} minutos`,
      back: (m: number, from: string, to: string, early: string): string =>
        `Hacia atrás, hace ${String(m)} minutos es tu hora menos ${String(m)} minutos; pide prestada una hora cuando los minutos quedan bajo cero: 3:05 pm − ${String(m)} min = ${from}. Solo antes de las ${early} cae en el día anterior: 12:10 am − ${String(m)} min = ${to} de ayer.`,
      workHeading: (m: number): string => `${String(m)} minutos en el trabajo`,
    },
    figure: 'Desde la hora de tu reloj',
    breakdown: 'La regla a cualquier hora del día',
    edit: 'Cuenta las horas entre dos horas del día',
    others: 'Otras horas antes y después',
    common: 'Hace horas y dentro de minutos',
    note: 'La respuesta en vivo sigue el reloj y la zona horaria de tu dispositivo. La noche del cambio de horario de verano, una hora de la cuenta se salta o se repite.',
  },
} as const;

const questionOf = (job: TimeOffset, lang: Lang): string =>
  job.unit === 'hour'
    ? WORDS[lang].hoursAgo.h1(job.amount)
    : WORDS[lang].minutesFromNow.h1(job.amount);

export const offsetLinksOf = (lang: Lang, except?: TimeOffset): CommonLinks => {
  const w = WORDS[lang];
  const listed = TIME_OFFSETS.filter((job) => job !== except);
  return {
    heading: except === undefined ? w.common : w.others,
    links: listed.map((job) => ({ href: pathOf(job, lang), label: questionOf(job, lang) })),
  };
};

/** The working-day key of a job: its hours, or its minutes plus a tenth. */
const keyOf = (job: TimeOffset): number => (job.unit === 'hour' ? job.amount : job.amount + 0.1);

const spanOf = (hours: number, lang: Lang): string => {
  const days = Math.floor(hours / 24);
  const rest = hours % 24;
  if (lang === 'en')
    return days === 0 ? `${String(rest)} hours` : `1 day and ${String(rest)} hours`;
  return days === 0 ? `${String(rest)} horas` : `1 día y ${String(rest)} horas`;
};

const hoursPageOf = (job: TimeOffset, lang: Lang) => {
  const w = WORDS[lang];
  const v = w.hoursAgo;
  const h = job.amount;
  const d = h * 60;
  const cut = t(d);
  const rowOf = (minutes: number): string[] => {
    const shifted = clockShift(minutes, -d);
    return [t(minutes), t(shifted.minutes), w.day[String(shifted.days) as '-1' | '0']];
  };
  const work = WORK[lang][h as 8 | 9 | 13 | 15];
  const sections: LongTailSection[] = [
    { id: 'worked', heading: WORKED[lang], paragraphs: [], steps: v.steps(h) },
    {
      id: 'clock',
      heading: v.tableHeading(h),
      paragraphs: [v.table(h, cut)],
      table: {
        caption: v.caption(h),
        head: v.head(h),
        rows: Array.from({ length: 24 }, (_, hour) => rowOf(hour * 60)),
      },
    },
    {
      id: 'opposite',
      heading: v.opposite(h),
      paragraphs: [v.forward(h, t(DAY - d), t(MORNING + d)), v.apart(h, spanOf(2 * h, lang))],
    },
    {
      id: 'work',
      heading: v.workHeading(h),
      paragraphs: [...work, v.overtime(h)],
      links: workLinksOf(h, lang),
    },
  ];
  return {
    headline: v.headline(h),
    lead: v.lead(h, cut, t(MORNING + DAY - d)),
    figure: `−${String(h)} h`,
    rows: [
      { key: 'same', label: v.rows.same, value: v.range(cut, '11:59 pm') },
      { key: 'previous', label: v.rows.previous(h), value: v.range('12:00 am', t(d - 1)) },
      { key: 'minutes', label: v.rows.minutes, value: n(d) },
      { key: 'workdays', label: v.rows.workdays, value: hoursText(Rational.of(h, 8)) },
    ],
    live: {
      kind: 'offset' as const,
      data: { amount: String(-d), before: v.before(h), same: v.same(h), after: v.after(h) },
      fallback: v.fallback(h, cut),
    },
    sections,
    sources: [SOURCES.factSheet23],
  };
};

const minutesPageOf = (job: TimeOffset, lang: Lang) => {
  const w = WORDS[lang];
  const v = w.minutesFromNow;
  const m = job.amount;
  const cut = t(DAY - m);
  const late = lateOf(m);
  const rowOf = (minutes: number): string[] => {
    const shifted = clockShift(minutes, m);
    return [t(minutes), t(shifted.minutes), w.day[String(shifted.days) as '0' | '1']];
  };
  const sections: LongTailSection[] = [
    { id: 'worked', heading: WORKED[lang], paragraphs: [], steps: v.steps(m) },
    {
      id: 'clock',
      heading: v.tableHeading(m),
      paragraphs: [v.table(m)],
      table: {
        caption: v.caption(m),
        head: v.head(m),
        rows: Array.from({ length: 12 }, (_, step) => rowOf(23 * 60 + step * 5)),
      },
    },
    {
      id: 'opposite',
      heading: v.opposite(m),
      paragraphs: [v.back(m, t(905 - m), t(10 - m + DAY), t(m))],
    },
    {
      id: 'work',
      heading: v.workHeading(m),
      paragraphs: [...WORK[lang][keyOf(job) as 15.1 | 30.1]],
      links: workLinksOf(keyOf(job), lang),
    },
  ];
  return {
    headline: v.headline(m, decimalOf(m)),
    lead: v.lead(m, v.name[m] ?? '', cut, t(late), t(late + m - DAY)),
    figure: `+${String(m)} min`,
    rows: [
      { key: 'next', label: v.rows.next, value: v.from(cut) },
      { key: 'decimal', label: v.rows.decimal, value: decimalOf(m) },
      { key: 'seconds', label: v.rows.seconds, value: n(m * 60) },
      { key: 'share', label: v.rows.share, value: `${hoursText(Rational.of(m * 100, 480))}%` },
    ],
    live: {
      kind: 'offset' as const,
      data: { amount: String(m), before: v.same(m), same: v.same(m), after: v.after(m) },
      fallback: v.fallback(m),
    },
    sections,
    sources: SOURCES_OF[keyOf(job)] ?? [],
  };
};

/** The page of one offset in one language: the rule at any time, and the live answer's slot. */
export const offsetPageOf = (job: TimeOffset, lang: Lang): LongTailPage => {
  const w = WORDS[lang];
  const { headline, lead, figure, rows, live, sections, sources } =
    job.unit === 'hour' ? hoursPageOf(job, lang) : minutesPageOf(job, lang);
  return {
    kicker: HOURS_TEXTS[lang].kicker,
    title: titleOf(headline),
    description: descriptionOf(
      `${headline}.`,
      rows.map(({ label, value }) => `${label}: ${value}`),
    ),
    h1: questionOf(job, lang),
    lead,
    figure,
    figureLabel: w.figure,
    breakdown: w.breakdown,
    rows,
    calculator: { href: HOURS_PATHS[lang], label: w.edit, title: HOURS_TEXTS[lang].title },
    note: w.note,
    paths: { en: pathOf(job, 'en'), es: pathOf(job, 'es') },
    others: offsetLinksOf(lang, job),
    sections,
    sources,
    live,
  };
};
