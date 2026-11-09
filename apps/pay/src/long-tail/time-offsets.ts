import { Rational } from '@maestro-calc/core';
import { clockFieldText as t, hoursText } from '../format.ts';
import { HOURS_PATHS, HOURS_TEXTS } from '../hours/texts.ts';
import { descriptionOf, titleOf } from '../seo/meta.ts';
import type { Lang } from '../time-card/receipt.ts';
import { clockOf, fieldOf as f } from './clock.ts';
import { monthDayOf, weekdayNameOf } from './days-from.ts';
import type { CommonLinks, LongTailPage } from './jobs.ts';
import { minutesLink, shiftLink, WORKED } from './live-links.ts';
import { nearestOf } from './nearest.ts';
import {
  liveGroupOf,
  MINUTES,
  pathOf,
  SHIFTS,
  TIME_OFFSETS,
  type Shift,
  type TimeOffset,
} from './routes.ts';
import { SOURCES, type LongTailSection, type LongTailSource } from './sections.ts';
import { addDays, clockShift } from './time-math.ts';

/*
 * The hours ago, hours from now and minutes from now pages. The time they answer is the visitor's,
 * so the page as built gives what holds at any hour: the addition or the subtraction, the hour
 * from which the date changes, and the time from each hour of the day (from each weekday, for a
 * whole number of days); `../client/time-now.ts` fills the live answer. Times of day are minutes
 * from midnight.
 */

const DAY = 1440;
/** `la 1:00 pm`, `las 3:00 pm`: the article of a time in Spanish. */
const las = (time: string): string => (time.startsWith('1:') ? `la ${time}` : `las ${time}`);
const n = (value: number): string => value.toLocaleString('en-US');
const decimalOf = (minutes: number): string => hoursText(Rational.of(minutes, 60));
/** `3:75`: a time written with its minutes past 59, before the carry. */
const uncarried = (minutes: number, add: number): string =>
  `${String(Math.floor((minutes + Math.floor(add / 60) * 60) / 60) % 12 || 12)}:${String((minutes % 60) + (add % 60))}`;

/** The time before midnight a minutes page starts its next-day example from: 11:45 pm for 30. */
const lateOf = (m: number): number => DAY - Math.ceil(m / 10) * 5;
/** The time before 3:00 pm its carry example starts from: 2:45 pm for 30 and for 90. */
const carryOf = (m: number): number => 900 - Math.ceil((m % 60 || 60) / 10) * 5;
/** The first time of the minutes table: the 11 pm hour, or early enough to show the crossing. */
const tableStartOf = (m: number): number => Math.min(DAY - 60, DAY - m - 30);
/** The time after midnight the back example starts from: 12:10 am, or 12:00 am for 5 minutes. */
const backOf = (m: number): number => Math.min(10, m - 5);

/** `1 hour`, `5 hours`; `1 hora`, `5 horas`. */
const hoursOf = (h: number, lang: Lang): string =>
  lang === 'en'
    ? `${String(h)} ${h === 1 ? 'hour' : 'hours'}`
    : `${String(h)} ${h === 1 ? 'hora' : 'horas'}`;
/** `1 day`, `2 days`; `1 día`, `2 días`. */
const daysOf = (d: number, lang: Lang): string =>
  lang === 'en'
    ? `${String(d)} ${d === 1 ? 'day' : 'days'}`
    : `${String(d)} ${d === 1 ? 'día' : 'días'}`;
const capital = (text: string): string => `${text.charAt(0).toUpperCase()}${text.slice(1)}`;

/** The cell of the day a time lands on, `days` from the day of the time now. */
const dayCellOf = (days: number, lang: Lang): string => {
  if (lang === 'en') {
    if (days === 0) return 'same day';
    if (days === -1) return 'previous day';
    if (days === 1) return 'next day';
    return days < 0 ? `${String(-days)} days before` : `${String(days)} days later`;
  }
  if (days === 0) return 'mismo día';
  if (days === -1) return 'día anterior';
  if (days === 1) return 'día siguiente';
  return days < 0 ? `${String(-days)} días antes` : `${String(days)} días después`;
};

/** A time and the day it falls on, in a sentence: `2:00 am the same day`, `las 9:00 pm de ayer`. */
const onDayOf = (minutes: number, days: number, lang: Lang): string => {
  const time = t(minutes);
  if (lang === 'en') {
    if (days === 0) return `${time} the same day`;
    if (days === -1) return `${time} yesterday`;
    if (days === 1) return `${time} tomorrow`;
    return days < 0 ? `${time}, ${String(-days)} days ago` : `${time}, in ${String(days)} days`;
  }
  if (days === 0) return `${las(time)} del mismo día`;
  if (days === -1) return `${las(time)} de ayer`;
  if (days === 1) return `${las(time)} de mañana`;
  return days < 0
    ? `${las(time)} de hace ${String(-days)} días`
    : `${las(time)} de dentro de ${String(days)} días`;
};

/** The shifts of the site that last `minutes` on the clock, at most three. */
const shiftsLasting = (minutes: number): readonly Shift[] =>
  SHIFTS.filter(({ start, end }) => (end - start + DAY) % DAY === minutes).slice(0, 3);
const shiftLinkOf = ({ start, end }: Shift, lang: Lang) => shiftLink(f(start), f(end % DAY), lang);
const spanOfShift = ({ start, end }: Shift, lang: Lang): string =>
  lang === 'en' ? `${clockOf(start)} to ${clockOf(end)}` : `de ${clockOf(start)} a ${clockOf(end)}`;
const listOf = (items: readonly string[], lang: Lang): string =>
  items.length < 2
    ? items.join('')
    : `${items.slice(0, -1).join(', ')} ${lang === 'en' ? 'and' : 'y'} ${items.at(-1) ?? ''}`;

/** The moments of the examples of an hours page, chosen so each one reads as it is named. */
interface Moments {
  /** Ago: the time from which the date is the nearer one; from now: up to which it is. */
  readonly cut: number;
  /** A time whose count stays on the nearer date. */
  readonly near: number;
  /** A time whose count crosses one more midnight. */
  readonly far: number;
}

const momentsOf = (job: TimeOffset): Moments => {
  const r = job.amount % 24;
  if (job.direction === 'ago') {
    return { cut: r * 60, near: r <= 17 ? 1020 : 1380, far: r > 6 ? 360 : r * 60 - 30 };
  }
  const cut = DAY - r * 60;
  return { cut, near: r < 15 ? 540 : r < 18 ? 360 : 30, far: r >= 3 ? 1260 : cut + 30 };
};

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

/** The hand-written working day of a job (`WORK`), when it has one. */
const handKeyOf = (job: TimeOffset): 8 | 9 | 13 | 15 | 15.1 | 30.1 | undefined => {
  if (job.unit === 'minute') return job.amount === 15 ? 15.1 : job.amount === 30 ? 30.1 : undefined;
  if (job.direction !== 'ago') return undefined;
  return ([8, 9, 13, 15] as const).find((each) => each === job.amount);
};

const WORDS = {
  en: {
    hours: {
      h1: (job: TimeOffset): string =>
        job.direction === 'ago'
          ? `What time was it ${hoursOf(job.amount, 'en')} ago?`
          : `What time will it be ${hoursOf(job.amount, 'en')} from now?`,
      label: (job: TimeOffset): string =>
        `${hoursOf(job.amount, 'en')} ${job.direction === 'ago' ? 'ago' : 'from now'}`,
      headline: (job: TimeOffset): string => {
        const h = job.amount;
        const q = Math.floor(h / 24);
        const r = h % 24;
        const ago = job.direction === 'ago';
        const name = `${hoursOf(h, 'en')} ${ago ? 'ago' : 'from now'}`;
        if (q === 0)
          return ago
            ? `${name}: the clock minus ${String(h)} h, or plus ${String(24 - h)} h the day before`
            : `${name}: the clock plus ${String(h)} h, or minus ${String(24 - h)} h the next day`;
        if (r === 0) return `${name}: the same time, ${daysOf(q, 'en')} ${ago ? 'back' : 'on'}`;
        return `${name}: ${daysOf(q, 'en')} and ${String(r)} h ${ago ? 'back' : 'on'}`;
      },
      lead: (job: TimeOffset): string => {
        const h = job.amount;
        const H = hoursOf(h, 'en');
        const q = Math.floor(h / 24);
        const r = h % 24;
        const { cut, near, far } = momentsOf(job);
        const rd = r * 60;
        if (job.direction === 'ago') {
          if (q === 0)
            return `${H} ago is the time on your clock minus ${H}. From ${t(cut)} on, it is the same day; before ${t(cut)}, the count crosses midnight, so add ${hoursOf(24 - h, 'en')} and go back one day: at ${t(far)}, ${H} ago was ${t(far + DAY - rd)} yesterday.`;
          if (r === 0)
            return `${H} ago is exactly ${daysOf(q, 'en')} ago at the same time on the clock: the time stays and the date moves ${String(q)} back, and the weekday with it. At 5:00 pm on a Wednesday, ${H} ago was 5:00 pm on ${weekdayNameOf(2 - q, 'en')}.`;
          return `${H} ago is ${daysOf(q, 'en')} and ${hoursOf(r, 'en')} back: the clock minus ${hoursOf(r, 'en')}, ${daysOf(q, 'en')} earlier from ${t(cut)} on and ${daysOf(q + 1, 'en')} earlier before it. At ${t(near)}, ${H} ago was ${onDayOf(near - rd, -q, 'en')}; at ${t(far)}, it was ${onDayOf(far + DAY - rd, -q - 1, 'en')}.`;
        }
        if (q === 0)
          return `${H} from now is the time on your clock plus ${H}. Before ${t(cut)}, it is the same day; from ${t(cut)} on, the count crosses midnight, so subtract ${hoursOf(24 - h, 'en')} instead and go forward one day: at ${t(far)}, ${H} from now is ${t(far + rd - DAY)} tomorrow.`;
        if (r === 0)
          return `${H} from now is exactly ${daysOf(q, 'en')} from now at the same time on the clock: the time stays and the date moves ${String(q)} on, and the weekday with it. At 5:00 pm on a Wednesday, ${H} from now is 5:00 pm on ${weekdayNameOf(2 + q, 'en')}.`;
        return `${H} from now is ${daysOf(q, 'en')} and ${hoursOf(r, 'en')} on: the clock plus ${hoursOf(r, 'en')}, ${daysOf(q, 'en')} later before ${t(cut)} and ${daysOf(q + 1, 'en')} later from ${t(cut)} on. At ${t(near)}, ${H} from now is ${onDayOf(near + rd, q, 'en')}; at ${t(far)}, it is ${onDayOf(far + rd - DAY, q + 1, 'en')}.`;
      },
      fallback: (job: TimeOffset): string => {
        const h = job.amount;
        const q = Math.floor(h / 24);
        const r = h % 24;
        const { cut } = momentsOf(job);
        const ago = job.direction === 'ago';
        if (q === 0)
          return ago
            ? `Subtract ${hoursOf(h, 'en')} from the time on your clock. Before ${t(cut)}, add ${hoursOf(24 - h, 'en')} instead and read the date as yesterday.`
            : `Add ${hoursOf(h, 'en')} to the time on your clock. From ${t(cut)} on, subtract ${hoursOf(24 - h, 'en')} instead and read the date as tomorrow.`;
        if (r === 0)
          return `Keep the time on your clock and move the date ${daysOf(q, 'en')} ${ago ? 'back' : 'on'}.`;
        return ago
          ? `Subtract ${hoursOf(r, 'en')} from the time on your clock and go back ${daysOf(q, 'en')}; before ${t(cut)}, add ${hoursOf(24 - r, 'en')} instead and go back ${daysOf(q + 1, 'en')}.`
          : `Add ${hoursOf(r, 'en')} to the time on your clock and go forward ${daysOf(q, 'en')}; from ${t(cut)} on, subtract ${hoursOf(24 - r, 'en')} instead and go forward ${daysOf(q + 1, 'en')}.`;
      },
      live: (job: TimeOffset): { before: string; same: string; after: string } => {
        const H = hoursOf(job.amount, 'en');
        if (job.amount >= 24) {
          const text =
            job.direction === 'ago'
              ? `It is {now} now, so ${H} ago it was {time} on {weekday}.`
              : `It is {now} now, so ${H} from now it will be {time} on {weekday}.`;
          return { before: text, same: text, after: text };
        }
        if (job.direction === 'ago')
          return {
            before: `It is {now} now, so ${H} ago it was {time} yesterday, {weekday}.`,
            same: `It is {now} now, so ${H} ago it was {time} today.`,
            after: `${H} ago it was {time}, {weekday}.`,
          };
        const same = `It is {now} now, so ${H} from now it will be {time} today.`;
        return {
          before: same,
          same,
          after: `It is {now} now, so ${H} from now it will be {time} tomorrow, {weekday}.`,
        };
      },
      rows: {
        clock: 'Time on the clock',
        unchanged: 'the same as now',
        daysBack: 'Days back',
        daysOn: 'Days on',
        previous: (r: number): string => `Previous day, clock + ${String(24 - r)} h`,
        next: (r: number): string => `Next day, clock − ${String(24 - r)} h`,
        same: 'Same day',
        minutes: 'Minutes',
        workdays: '8-hour workdays',
      },
      range: (from: string, to: string): string => `${from} to ${to}`,
      steps: (job: TimeOffset): string[] => {
        const h = job.amount;
        const H = hoursOf(h, 'en');
        const d = h * 60;
        const q = Math.floor(h / 24);
        const r = h % 24;
        const rd = r * 60;
        const { cut, near, far } = momentsOf(job);
        const ago = job.direction === 'ago';
        const inMinutes = `In minutes, ${H} ${h === 1 ? 'is' : 'are'} ${String(h)} × 60 = ${n(d)} minutes${q > 0 ? `, and in seconds ${n(d * 60)}` : ''}.`;
        if (q > 0) {
          const split = `${String(h)} = ${String(q)} × 24${r > 0 ? ` + ${String(r)}` : ''}: ${daysOf(q, 'en')}${r > 0 ? ` and ${hoursOf(r, 'en')}` : ''}.`;
          if (r === 0)
            return [
              split,
              `Whole days keep the time on the clock: only the date moves, ${daysOf(q, 'en')} ${ago ? 'back' : 'on'}, and with it the weekday, ${String(q)} places: from a Wednesday, ${weekdayNameOf(ago ? 2 - q : 2 + q, 'en')}.`,
              inMinutes,
            ];
          return [
            split,
            ago
              ? `Move the date ${daysOf(q, 'en')} back, then the clock ${hoursOf(r, 'en')} back: from ${t(near)}, ${f(near)} − ${f(rd)} = ${f(near - rd)}, ${onDayOf(near - rd, -q, 'en')}.`
              : `Move the date ${daysOf(q, 'en')} on, then the clock ${hoursOf(r, 'en')} on: from ${t(near)}, ${f(near)} + ${f(rd)} = ${f(near + rd)}, ${onDayOf(near + rd, q, 'en')}.`,
            ago
              ? `Before ${t(cut)} the clock part crosses midnight too, one more day back: from ${t(far)}, ${f(far)} + 24:00 − ${f(rd)} = ${f(far + DAY - rd)}, ${onDayOf(far + DAY - rd, -q - 1, 'en')}.`
              : `From ${t(cut)} on the clock part crosses midnight too, one more day on: from ${t(far)}, ${f(far)} + ${f(rd)} = ${f(far + rd)}, and ${f(far + rd)} − 24:00 = ${f(far + rd - DAY)}, ${onDayOf(far + rd - DAY, q + 1, 'en')}.`,
            inMinutes,
          ];
        }
        if (ago)
          return [
            `Write the time now on a 24-hour clock: ${t(near)} is ${f(near)}, and ${t(far)} is ${f(far)}.`,
            `From ${t(near)}, subtract ${H}: ${f(near)} − ${f(d)} = ${f(near - d)}, ${t(near - d)} of the same day.`,
            `From ${t(far)} the subtraction goes below zero, so borrow a day of 24 hours: ${f(far)} + 24:00 − ${f(d)} = ${f(far + DAY - d)}, ${t(far + DAY - d)} of the day before.`,
            `The shortcut for the borrowed day: 24 − ${String(h)} = ${String(24 - h)}, so before ${t(d)} add ${hoursOf(24 - h, 'en')} to the time now and step back one date.`,
            `The minutes stay as they are: ${t(near + 20)} minus ${H} is ${t(near + 20 - d)} of the same day.`,
            inMinutes,
          ];
        return [
          `Write the time now on a 24-hour clock: ${t(near)} is ${f(near)}, and ${t(far)} is ${f(far)}.`,
          `From ${t(near)}, add ${H}: ${f(near)} + ${f(d)} = ${f(near + d)}, ${t(near + d)} of the same day.`,
          `From ${t(far)} the sum passes 24:00, so take a day of 24 hours off: ${f(far)} + ${f(d)} = ${f(far + d)}, and ${f(far + d)} − 24:00 = ${f(far + d - DAY)}, ${t(far + d - DAY)} of the next day.`,
          `The shortcut for the next day: 24 − ${String(h)} = ${String(24 - h)}, so from ${t(cut)} on subtract ${hoursOf(24 - h, 'en')} from the time now and step forward one date.`,
          `The minutes stay as they are: ${t(near + 20)} plus ${H} is ${t(near + 20 + d)} of the same day.`,
          inMinutes,
        ];
      },
      tableHeading: (job: TimeOffset): string =>
        job.amount % 24 === 0
          ? `${WORDS.en.hours.label(job)} from each day of the week`
          : `${WORDS.en.hours.label(job)} from each hour of the day`,
      table: (job: TimeOffset): string => {
        const h = job.amount;
        const q = Math.floor(h / 24);
        const { cut } = momentsOf(job);
        const ago = job.direction === 'ago';
        const which = `${hoursOf(h, 'en')} ${ago ? 'earlier' : 'later'}`;
        if (h % 24 === 0)
          return `A whole number of days keeps the time on the clock: only the weekday moves, ${String(q)} places ${ago ? 'back' : 'on'}. At 5:00 pm on each day of the week:`;
        if (q === 0)
          return ago
            ? `Find the time now in the first column: the second is ${which}, and the third says whether that falls on the same date. Every row from ${t(cut)} on is the same day, and every row before it the day before.`
            : `Find the time now in the first column: the second is ${which}, and the third says whether that falls on the same date. Every row before ${t(cut)} is the same day, and every row from it on the next day.`;
        const [first, second] = ago ? [-q, -q - 1] : [q, q + 1];
        return ago
          ? `Find the time now in the first column: the second is ${which}, and the third says on which day. Every row from ${t(cut)} on reads “${dayCellOf(first, 'en')}”, and every row before it “${dayCellOf(second, 'en')}”.`
          : `Find the time now in the first column: the second is ${which}, and the third says on which day. Every row before ${t(cut)} reads “${dayCellOf(first, 'en')}”, and every row from it on “${dayCellOf(second, 'en')}”.`;
      },
      caption: (job: TimeOffset): string =>
        job.amount % 24 === 0
          ? `${hoursOf(job.amount, 'en')} ${job.direction === 'ago' ? 'before' : 'after'} 5:00 pm on each weekday`
          : `${hoursOf(job.amount, 'en')} ${job.direction === 'ago' ? 'before' : 'after'} each hour`,
      head: (job: TimeOffset): string[] =>
        job.amount % 24 === 0
          ? ['Now', WORDS.en.hours.label(job)]
          : ['Time now', WORDS.en.hours.label(job), 'Day'],
      other: (job: TimeOffset, first: string, second: string): string => {
        const h = job.amount;
        const H = hoursOf(h, 'en');
        const q = Math.floor(h / 24);
        const r = h % 24;
        const cut = t(momentsOf(job).cut);
        if (job.direction === 'from-now') {
          const when =
            q === 0
              ? `on the next day from ${cut} on`
              : r === 0
                ? `always ${daysOf(q, 'en')} later at the same time`
                : `${daysOf(q, 'en')} later before ${cut} and ${daysOf(q + 1, 'en')} later from it on`;
          return `The other way, ${H} from now is the clock plus ${H}, ${when}: from 12:00 pm it is ${first}, and from 10:00 pm, ${second}.`;
        }
        const when =
          q === 0
            ? `on the previous day before ${cut}`
            : r === 0
              ? `always ${daysOf(q, 'en')} earlier at the same time`
              : `${daysOf(q, 'en')} earlier from ${cut} on and ${daysOf(q + 1, 'en')} earlier before it`;
        return `The other way, ${H} ago is the clock minus ${H}, ${when}: from 12:00 pm it was ${first}, and from 2:00 am, ${second}.`;
      },
      monthsHeading: (job: TimeOffset): string =>
        job.direction === 'ago'
          ? `${hoursOf(job.amount, 'en')} ago from the 1st of each month`
          : `${hoursOf(job.amount, 'en')} from now from the 28th of each month`,
      months: (q: number): string =>
        `${daysOf(q, 'en')} on the calendar: across the end of a month the day number starts again, and across the end of February the year matters, since February has 28 days, and 29 in a leap year. In a year that is not a leap year, and in one that is:`,
      monthsCaption: (job: TimeOffset): string =>
        job.direction === 'ago'
          ? `${hoursOf(job.amount, 'en')} before the 1st of each month`
          : `${hoursOf(job.amount, 'en')} after the 28th of each month`,
      monthsHead: ['Start', 'Date', 'In a leap year'],
      apart: (h: number, span: string): string =>
        `${hoursOf(h, 'en')} ago and ${hoursOf(h, 'en')} from now are ${span} apart${2 * h >= 24 ? `, ${String(2 * h)} hours in all` : ''}.`,
      workHeading: (h: number): string =>
        h < 24 ? `${hoursOf(h, 'en')} in a working day` : `${String(h)} hours of work`,
      overtime: (h: number): string =>
        h < 24
          ? `However long the day, federal law counts overtime by the workweek: time and a half for the hours past 40 in it (DOL Fact Sheet #23), so ${hoursOf(h, 'en')} in one day ${h === 1 ? 'is' : 'are'} not overtime by ${h === 1 ? 'itself' : 'themselves'}.`
          : `${String(h)} hours of work are ${hoursText(Rational.of(h, 8))} workdays of 8 hours. Federal law counts overtime by the workweek, time and a half for the hours past 40 in it (DOL Fact Sheet #23): ${h > 40 ? `${String(h)} hours worked in one workweek would be ${hoursOf(h - 40, 'en')} of overtime` : `${String(h)} hours worked in one workweek are not overtime, since they do not pass 40`}.`,
      endOfDay: (h: number, five: string, seven: string): string =>
        `From 5:00 pm, the end of a 9-to-5 shift, ${hoursOf(h, 'en')} ago was ${five}. From 7:00 am, the end of a 7 pm to 7 am night shift, ${hoursOf(h, 'en')} ago was ${seven}.`,
      startOfDay: (h: number, nine: string, gap: string, five: string): string =>
        `From 9:00 am, the start of a 9-to-5 shift, ${hoursOf(h, 'en')} from now is ${nine}${gap}. If you clock out at 5:00 pm, ${hoursOf(h, 'en')} later is ${five}.`,
      gap: (h: number): string =>
        h < 8
          ? `${hoursOf(8 - h, 'en')} before the shift ends`
          : h === 8
            ? 'the moment the shift ends'
            : `${hoursOf(h - 8, 'en')} after the shift ends`,
      shiftsAgo: (h: number, spans: string, many: boolean): string =>
        `${capital(hoursOf(h, 'en'))} is the length on the clock of the ${spans} shift${many ? 's' : ''}: from the end of ${many ? 'each' : 'it'}, ${hoursOf(h, 'en')} ago was its start.`,
      shiftsFromNow: (h: number, spans: string, many: boolean): string =>
        `${capital(hoursOf(h, 'en'))} is the length on the clock of the ${spans} shift${many ? 's' : ''}: from the start of ${many ? 'each' : 'it'}, ${hoursOf(h, 'en')} from now is its end.`,
    },
    minutes: {
      h1: (m: number): string => `What time will it be ${String(m)} minutes from now?`,
      headline: (m: number, dec: string): string =>
        `${String(m)} minutes from now: the clock plus ${String(m)} min, ${dec} hours`,
      name: (m: number): string =>
        ({
          15: 'a quarter of an hour',
          30: 'half an hour',
          45: 'three quarters of an hour',
          90: 'an hour and a half',
        })[m] ?? `${fractionOf(m)} of an hour`,
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
          ...(m >= 60
            ? [
                `${String(m)} minutes are ${String(Math.floor(m / 60))} hour and ${String(m % 60)} minutes: add the hour to the hours and ${String(m % 60)} to the minutes.`,
              ]
            : []),
          `Add ${String(m)} ${m >= 60 ? 'minutes' : 'to the minutes of the time now'}: 2:10 pm + ${String(m)} min = ${t(850 + m)}.`,
          `When the minutes pass 59, carry an hour: ${t(carry)} + ${String(m)} min = ${uncarried(carry, m)}, which is ${t(carry + m)}.`,
          `Past 11:59 pm the carry also changes the date: ${t(late)} + ${String(m)} min = ${t(late + m - DAY)} of the next day.`,
          `As a fraction of an hour, ${String(m)} minutes are ${String(m)} ÷ 60 = ${decimalOf(m)} hours, the figure a time card writes for them.`,
        ];
      },
      tableHeading: (m: number): string => `${String(m)} minutes from now around midnight`,
      table: (m: number, cut: string, start: string): string =>
        `The only times that move the date are the last ${String(m)} minutes before midnight, from ${cut} on. Every 5 minutes from ${start}, ${String(m)} minutes on:`,
      caption: (m: number, start: string): string =>
        `${String(m)} minutes after each time from ${start}`,
      head: (m: number): string[] => ['Time now', `${String(m)} minutes later`, 'Day'],
      opposite: (m: number): string => `${String(m)} minutes ago`,
      back: (m: number, from: string, early: string, start: string, to: string): string =>
        `Back, ${String(m)} minutes ago is the clock minus ${String(m)} minutes; borrow an hour when the minutes run below zero: 3:05 pm − ${String(m)} min = ${from}. Only before ${early} does it fall on the previous day: ${start} − ${String(m)} min = ${to} yesterday.`,
      workHeading: (m: number): string => `${String(m)} minutes at work`,
      rounding: (m: number, dec: string, quarter: number): string =>
        `On a time card, ${String(m)} minutes are ${dec} hours. A time clock that rounds to the nearest quarter hour records them as ${String(quarter)} minutes, ${decimalOf(quarter)} hours${quarter === m ? ', exactly, since they are a whole number of quarter hours' : quarter < m ? ', rounded down' : ', rounded up'}; such rounding is allowed only if, over time, you are paid for all the time you worked (29 CFR 785.48).`,
      week: (m: number): string =>
        `Taken every workday of a 5-day week, ${String(m)} minutes add up to ${n(5 * m)} minutes, ${decimalOf(5 * m)} hours; over 52 weeks, ${n(260 * m)} minutes, ${decimalOf(260 * m)} hours.`,
      short: (m: number): string =>
        `A break of ${String(m)} minutes is a short break: federal law does not require one, but when the employer gives it, it is paid work time (29 CFR 785.18).`,
      meal: (m: number): string =>
        `A meal period of ${String(m)} minutes, fully off duty, is not work time under federal law (29 CFR 785.19), so it comes off the hours of the day; federal law does not require one, but some states do.`,
      between: (m: number): string =>
        `${String(m)} minutes sit between the two federal rules for breaks: a short break of about 5 to 20 minutes is paid work time (29 CFR 785.18), and a meal period, ordinarily 30 minutes or more fully off duty, is not (29 CFR 785.19).`,
    },
    figure: 'From the time on your clock',
    breakdown: 'The rule at any time of day',
    edit: 'Count the hours between two times',
    others: 'Other times from now and ago',
    common: 'Hours ago, hours from now and minutes from now',
    note: 'The live answer follows the clock and the time zone of your device. On the night clocks change for daylight saving time, one hour of the count is skipped or repeated.',
  },
  es: {
    hours: {
      h1: (job: TimeOffset): string =>
        job.direction === 'ago'
          ? `¿Qué hora era hace ${hoursOf(job.amount, 'es')}?`
          : `¿Qué hora será dentro de ${hoursOf(job.amount, 'es')}?`,
      label: (job: TimeOffset): string =>
        `${job.direction === 'ago' ? 'Hace' : 'Dentro de'} ${hoursOf(job.amount, 'es')}`,
      headline: (job: TimeOffset): string => {
        const h = job.amount;
        const q = Math.floor(h / 24);
        const r = h % 24;
        const ago = job.direction === 'ago';
        const name = WORDS.es.hours.label(job);
        if (q === 0)
          return ago
            ? `${name}: tu hora menos ${String(h)} h, o más ${String(24 - h)} h el día anterior`
            : `${name}: tu hora más ${String(h)} h, o menos ${String(24 - h)} h el día siguiente`;
        if (r === 0)
          return `${name}: la misma hora, ${daysOf(q, 'es')} ${ago ? 'atrás' : 'después'}`;
        return `${name}: ${daysOf(q, 'es')} y ${String(r)} h ${ago ? 'atrás' : 'después'}`;
      },
      lead: (job: TimeOffset): string => {
        const h = job.amount;
        const H = hoursOf(h, 'es');
        const q = Math.floor(h / 24);
        const r = h % 24;
        const { cut, near, far } = momentsOf(job);
        const rd = r * 60;
        if (job.direction === 'ago') {
          if (q === 0)
            return `Hace ${H} es la hora de tu reloj menos ${H}. Desde ${las(t(cut))}, es el mismo día; antes de ${las(t(cut))}, la cuenta cruza la medianoche, así que suma ${hoursOf(24 - h, 'es')} y retrocede un día: a ${las(t(far))}, hace ${H} eran ${las(t(far + DAY - rd))} de ayer.`;
          if (r === 0)
            return `Hace ${H} es exactamente hace ${daysOf(q, 'es')}, a la misma hora del reloj: la hora queda y la fecha retrocede ${String(q)}, y con ella el día de la semana. A las 5:00 pm de un miércoles, hace ${H} eran las 5:00 pm del ${weekdayNameOf(2 - q, 'es')}.`;
          return `Hace ${H} son ${daysOf(q, 'es')} y ${hoursOf(r, 'es')} atrás: tu hora menos ${hoursOf(r, 'es')}, ${daysOf(q, 'es')} antes desde ${las(t(cut))} y ${daysOf(q + 1, 'es')} antes si es más temprano. A ${las(t(near))}, hace ${H} eran ${onDayOf(near - rd, -q, 'es')}; a ${las(t(far))}, eran ${onDayOf(far + DAY - rd, -q - 1, 'es')}.`;
        }
        if (q === 0)
          return `Dentro de ${H} es la hora de tu reloj más ${H}. Antes de ${las(t(cut))}, es el mismo día; desde ${las(t(cut))}, la cuenta cruza la medianoche, así que resta ${hoursOf(24 - h, 'es')} y avanza un día: a ${las(t(far))}, dentro de ${H} serán ${las(t(far + rd - DAY))} de mañana.`;
        if (r === 0)
          return `Dentro de ${H} es exactamente dentro de ${daysOf(q, 'es')}, a la misma hora del reloj: la hora queda y la fecha avanza ${String(q)}, y con ella el día de la semana. A las 5:00 pm de un miércoles, dentro de ${H} serán las 5:00 pm del ${weekdayNameOf(2 + q, 'es')}.`;
        return `Dentro de ${H} son ${daysOf(q, 'es')} y ${hoursOf(r, 'es')} después: tu hora más ${hoursOf(r, 'es')}, ${daysOf(q, 'es')} después antes de ${las(t(cut))} y ${daysOf(q + 1, 'es')} después desde ${las(t(cut))}. A ${las(t(near))}, dentro de ${H} serán ${onDayOf(near + rd, q, 'es')}; a ${las(t(far))}, serán ${onDayOf(far + rd - DAY, q + 1, 'es')}.`;
      },
      fallback: (job: TimeOffset): string => {
        const h = job.amount;
        const q = Math.floor(h / 24);
        const r = h % 24;
        const { cut } = momentsOf(job);
        const ago = job.direction === 'ago';
        if (q === 0)
          return ago
            ? `Resta ${hoursOf(h, 'es')} a la hora de tu reloj. Antes de ${las(t(cut))}, suma ${hoursOf(24 - h, 'es')} y lee la fecha como ayer.`
            : `Suma ${hoursOf(h, 'es')} a la hora de tu reloj. Desde ${las(t(cut))}, resta ${hoursOf(24 - h, 'es')} y lee la fecha como mañana.`;
        if (r === 0)
          return `Mantén la hora de tu reloj y mueve la fecha ${daysOf(q, 'es')} ${ago ? 'atrás' : 'adelante'}.`;
        return ago
          ? `Resta ${hoursOf(r, 'es')} a la hora de tu reloj y retrocede ${daysOf(q, 'es')}; antes de ${las(t(cut))}, suma ${hoursOf(24 - r, 'es')} y retrocede ${daysOf(q + 1, 'es')}.`
          : `Suma ${hoursOf(r, 'es')} a la hora de tu reloj y avanza ${daysOf(q, 'es')}; desde ${las(t(cut))}, resta ${hoursOf(24 - r, 'es')} y avanza ${daysOf(q + 1, 'es')}.`;
      },
      live: (job: TimeOffset): { before: string; same: string; after: string } => {
        const H = hoursOf(job.amount, 'es');
        if (job.amount >= 24) {
          const text =
            job.direction === 'ago'
              ? `Ahora: {now}. Hace ${H}: {time} del {weekday}.`
              : `Ahora: {now}. Dentro de ${H}: {time} del {weekday}.`;
          return { before: text, same: text, after: text };
        }
        if (job.direction === 'ago')
          return {
            before: `Ahora: {now}. Hace ${H}: {time} de ayer, {weekday}.`,
            same: `Ahora: {now}. Hace ${H}: {time} de hoy.`,
            after: `Hace ${H}: {time}, {weekday}.`,
          };
        const same = `Ahora: {now}. Dentro de ${H}: {time} de hoy.`;
        return {
          before: same,
          same,
          after: `Ahora: {now}. Dentro de ${H}: {time} de mañana, {weekday}.`,
        };
      },
      rows: {
        clock: 'Hora del reloj',
        unchanged: 'la misma de ahora',
        daysBack: 'Días atrás',
        daysOn: 'Días después',
        previous: (r: number): string => `Día anterior, hora + ${String(24 - r)} h`,
        next: (r: number): string => `Día siguiente, hora − ${String(24 - r)} h`,
        same: 'Mismo día',
        minutes: 'Minutos',
        workdays: 'Jornadas de 8 horas',
      },
      range: (from: string, to: string): string => `de ${from} a ${to}`,
      steps: (job: TimeOffset): string[] => {
        const h = job.amount;
        const H = hoursOf(h, 'es');
        const d = h * 60;
        const q = Math.floor(h / 24);
        const r = h % 24;
        const rd = r * 60;
        const { cut, near, far } = momentsOf(job);
        const ago = job.direction === 'ago';
        const inMinutes = `En minutos, ${H} ${h === 1 ? 'es' : 'son'} ${String(h)} × 60 = ${n(d)} minutos${q > 0 ? `, y en segundos ${n(d * 60)}` : ''}.`;
        if (q > 0) {
          const split = `${String(h)} = ${String(q)} × 24${r > 0 ? ` + ${String(r)}` : ''}: ${daysOf(q, 'es')}${r > 0 ? ` y ${hoursOf(r, 'es')}` : ''}.`;
          if (r === 0)
            return [
              split,
              `Los días enteros mantienen la hora del reloj: solo se mueve la fecha, ${daysOf(q, 'es')} ${ago ? 'atrás' : 'adelante'}, y con ella el día de la semana, ${String(q)} lugares: desde un miércoles, el ${weekdayNameOf(ago ? 2 - q : 2 + q, 'es')}.`,
              inMinutes,
            ];
          return [
            split,
            ago
              ? `Retrocede la fecha ${daysOf(q, 'es')} y luego el reloj ${hoursOf(r, 'es')}: desde ${las(t(near))}, ${f(near)} − ${f(rd)} = ${f(near - rd)}, ${onDayOf(near - rd, -q, 'es')}.`
              : `Avanza la fecha ${daysOf(q, 'es')} y luego el reloj ${hoursOf(r, 'es')}: desde ${las(t(near))}, ${f(near)} + ${f(rd)} = ${f(near + rd)}, ${onDayOf(near + rd, q, 'es')}.`,
            ago
              ? `Antes de ${las(t(cut))} la parte del reloj también cruza la medianoche, un día más atrás: desde ${las(t(far))}, ${f(far)} + 24:00 − ${f(rd)} = ${f(far + DAY - rd)}, ${onDayOf(far + DAY - rd, -q - 1, 'es')}.`
              : `Desde ${las(t(cut))} la parte del reloj también cruza la medianoche, un día más adelante: desde ${las(t(far))}, ${f(far)} + ${f(rd)} = ${f(far + rd)}, y ${f(far + rd)} − 24:00 = ${f(far + rd - DAY)}, ${onDayOf(far + rd - DAY, q + 1, 'es')}.`,
            inMinutes,
          ];
        }
        if (ago)
          return [
            `Escribe la hora actual en reloj de 24 horas: ${t(near)} se escribe ${f(near)}, y ${t(far)}, ${f(far)}.`,
            `Desde ${las(t(near))}, resta ${H}: ${f(near)} − ${f(d)} = ${f(near - d)}, ${las(t(near - d))} del mismo día.`,
            `Desde ${las(t(far))} la resta queda bajo cero, así que pide prestado un día de 24 horas: ${f(far)} + 24:00 − ${f(d)} = ${f(far + DAY - d)}, ${las(t(far + DAY - d))} del día anterior.`,
            `El atajo del día prestado: 24 − ${String(h)} = ${String(24 - h)}, así que antes de ${las(t(d))} suma ${hoursOf(24 - h, 'es')} a la hora actual y retrocede una fecha.`,
            `Los minutos quedan igual: ${las(t(near + 20))} menos ${H} son ${las(t(near + 20 - d))} del mismo día.`,
            inMinutes,
          ];
        return [
          `Escribe la hora actual en reloj de 24 horas: ${t(near)} se escribe ${f(near)}, y ${t(far)}, ${f(far)}.`,
          `Desde ${las(t(near))}, suma ${H}: ${f(near)} + ${f(d)} = ${f(near + d)}, ${las(t(near + d))} del mismo día.`,
          `Desde ${las(t(far))} la suma pasa de 24:00, así que quita un día de 24 horas: ${f(far)} + ${f(d)} = ${f(far + d)}, y ${f(far + d)} − 24:00 = ${f(far + d - DAY)}, ${las(t(far + d - DAY))} del día siguiente.`,
          `El atajo del día siguiente: 24 − ${String(h)} = ${String(24 - h)}, así que desde ${las(t(cut))} resta ${hoursOf(24 - h, 'es')} a la hora actual y avanza una fecha.`,
          `Los minutos quedan igual: ${las(t(near + 20))} más ${H} son ${las(t(near + 20 + d))} del mismo día.`,
          inMinutes,
        ];
      },
      tableHeading: (job: TimeOffset): string =>
        job.amount % 24 === 0
          ? `${WORDS.es.hours.label(job)} desde cada día de la semana`
          : `${WORDS.es.hours.label(job)} desde cada hora del día`,
      table: (job: TimeOffset): string => {
        const h = job.amount;
        const q = Math.floor(h / 24);
        const { cut } = momentsOf(job);
        const ago = job.direction === 'ago';
        const which = `${hoursOf(h, 'es')} ${ago ? 'antes' : 'después'}`;
        if (h % 24 === 0)
          return `Un número entero de días mantiene la hora del reloj: solo se mueve el día de la semana, ${String(q)} lugares ${ago ? 'atrás' : 'adelante'}. A las 5:00 pm de cada día de la semana:`;
        if (q === 0)
          return ago
            ? `Busca la hora actual en la primera columna: la segunda es ${which}, y la tercera dice si cae en la misma fecha. Cada fila desde ${las(t(cut))} es el mismo día, y cada fila anterior, el día anterior.`
            : `Busca la hora actual en la primera columna: la segunda es ${which}, y la tercera dice si cae en la misma fecha. Cada fila antes de ${las(t(cut))} es el mismo día, y cada fila desde esa hora, el día siguiente.`;
        const [first, second] = ago ? [-q, -q - 1] : [q, q + 1];
        return ago
          ? `Busca la hora actual en la primera columna: la segunda es ${which}, y la tercera dice en qué día. Cada fila desde ${las(t(cut))} dice “${dayCellOf(first, 'es')}”, y cada fila anterior, “${dayCellOf(second, 'es')}”.`
          : `Busca la hora actual en la primera columna: la segunda es ${which}, y la tercera dice en qué día. Cada fila antes de ${las(t(cut))} dice “${dayCellOf(first, 'es')}”, y cada fila desde esa hora, “${dayCellOf(second, 'es')}”.`;
      },
      caption: (job: TimeOffset): string =>
        job.amount % 24 === 0
          ? `${hoursOf(job.amount, 'es')} ${job.direction === 'ago' ? 'antes de' : 'después de'} las 5:00 pm de cada día`
          : `${hoursOf(job.amount, 'es')} ${job.direction === 'ago' ? 'antes de' : 'después de'} cada hora`,
      head: (job: TimeOffset): string[] =>
        job.amount % 24 === 0
          ? ['Ahora', WORDS.es.hours.label(job)]
          : ['Hora actual', WORDS.es.hours.label(job), 'Día'],
      other: (job: TimeOffset, first: string, second: string): string => {
        const h = job.amount;
        const H = hoursOf(h, 'es');
        const q = Math.floor(h / 24);
        const r = h % 24;
        const cut = las(t(momentsOf(job).cut));
        if (job.direction === 'from-now') {
          const when =
            q === 0
              ? `en el día siguiente desde ${cut}`
              : r === 0
                ? `siempre ${daysOf(q, 'es')} después a la misma hora`
                : `${daysOf(q, 'es')} después antes de ${cut} y ${daysOf(q + 1, 'es')} después desde esa hora`;
          return `Al revés, dentro de ${H} es tu hora más ${H}, ${when}: desde las 12:00 pm serán ${first}, y desde las 10:00 pm, ${second}.`;
        }
        const when =
          q === 0
            ? `en el día anterior antes de ${cut}`
            : r === 0
              ? `siempre ${daysOf(q, 'es')} antes a la misma hora`
              : `${daysOf(q, 'es')} antes desde ${cut} y ${daysOf(q + 1, 'es')} antes si es más temprano`;
        return `Al revés, hace ${H} es tu hora menos ${H}, ${when}: desde las 12:00 pm eran ${first}, y desde las 2:00 am, ${second}.`;
      },
      monthsHeading: (job: TimeOffset): string =>
        job.direction === 'ago'
          ? `Hace ${hoursOf(job.amount, 'es')} desde el 1 de cada mes`
          : `Dentro de ${hoursOf(job.amount, 'es')} desde el 28 de cada mes`,
      months: (q: number): string =>
        `${capital(daysOf(q, 'es'))} en el calendario: al cruzar el final de un mes el número del día vuelve a empezar, y al cruzar el final de febrero el año importa, porque febrero tiene 28 días, y 29 en un año bisiesto. En un año que no es bisiesto, y en uno que sí:`,
      monthsCaption: (job: TimeOffset): string =>
        job.direction === 'ago'
          ? `${hoursOf(job.amount, 'es')} antes del 1 de cada mes`
          : `${hoursOf(job.amount, 'es')} después del 28 de cada mes`,
      monthsHead: ['Inicio', 'Fecha', 'En año bisiesto'],
      apart: (h: number, span: string): string =>
        `Hace ${hoursOf(h, 'es')} y dentro de ${hoursOf(h, 'es')} están a ${span} de distancia${2 * h >= 24 ? `, ${String(2 * h)} horas en total` : ''}.`,
      workHeading: (h: number): string =>
        h < 24
          ? `${capital(hoursOf(h, 'es'))} en una jornada de trabajo`
          : `${String(h)} horas de trabajo`,
      overtime: (h: number): string =>
        h < 24
          ? `Por largo que sea el día, la ley federal cuenta las horas extra por semana laboral: tiempo y medio por las horas después de 40 en ella (DOL Fact Sheet #23), así que ${hoursOf(h, 'es')} en un día no ${h === 1 ? 'es hora extra' : 'son horas extra'} por sí ${h === 1 ? 'sola' : 'solas'}.`
          : `${String(h)} horas de trabajo son ${hoursText(Rational.of(h, 8))} jornadas de 8 horas. La ley federal cuenta las horas extra por semana laboral, tiempo y medio por las horas después de 40 en ella (DOL Fact Sheet #23): ${h > 40 ? `${String(h)} horas trabajadas en una semana laboral serían ${hoursOf(h - 40, 'es')} extra` : `${String(h)} horas trabajadas en una semana laboral no son horas extra, porque no pasan de 40`}.`,
      endOfDay: (h: number, five: string, seven: string): string =>
        `Desde las 5:00 pm, el final de un turno de 9 a 5, hace ${hoursOf(h, 'es')} eran ${five}. Desde las 7:00 am, el final de un turno de noche de 7 pm a 7 am, hace ${hoursOf(h, 'es')} eran ${seven}.`,
      startOfDay: (h: number, nine: string, gap: string, five: string): string =>
        `Desde las 9:00 am, el inicio de un turno de 9 a 5, dentro de ${hoursOf(h, 'es')} serán ${nine}${gap}. Si sales a las 5:00 pm, ${hoursOf(h, 'es')} después serán ${five}.`,
      gap: (h: number): string =>
        h < 8
          ? `${hoursOf(8 - h, 'es')} antes de que termine el turno`
          : h === 8
            ? 'justo cuando termina el turno'
            : `${hoursOf(h - 8, 'es')} después de que termina el turno`,
      shiftsAgo: (h: number, spans: string, many: boolean): string =>
        `${capital(hoursOf(h, 'es'))} es lo que ${many ? 'duran' : 'dura'} en el reloj ${many ? 'los turnos' : 'el turno'} ${spans}: desde el final de cada uno, hace ${hoursOf(h, 'es')} era su inicio.`,
      shiftsFromNow: (h: number, spans: string, many: boolean): string =>
        `${capital(hoursOf(h, 'es'))} es lo que ${many ? 'duran' : 'dura'} en el reloj ${many ? 'los turnos' : 'el turno'} ${spans}: desde el inicio de cada uno, dentro de ${hoursOf(h, 'es')} es su final.`,
    },
    minutes: {
      h1: (m: number): string => `¿Qué hora será dentro de ${String(m)} minutos?`,
      headline: (m: number, dec: string): string =>
        `Dentro de ${String(m)} minutos: tu hora más ${String(m)} min, ${dec} horas`,
      name: (m: number): string =>
        ({
          15: 'un cuarto de hora',
          30: 'media hora',
          45: 'tres cuartos de hora',
          90: 'una hora y media',
        })[m] ?? `${fractionOf(m)} de hora`,
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
          ...(m >= 60
            ? [
                `${String(m)} minutos son ${String(Math.floor(m / 60))} hora y ${String(m % 60)} minutos: suma la hora a las horas y ${String(m % 60)} a los minutos.`,
              ]
            : []),
          `Suma ${String(m)} ${m >= 60 ? 'minutos' : 'a los minutos de la hora actual'}: 2:10 pm + ${String(m)} min = ${t(850 + m)}.`,
          `Cuando los minutos pasan de 59, lleva una hora: ${t(carry)} + ${String(m)} min = ${uncarried(carry, m)}, que son las ${t(carry + m)}.`,
          `Después de las 11:59 pm, llevar la hora también cambia la fecha: ${t(late)} + ${String(m)} min = ${t(late + m - DAY)} del día siguiente.`,
          `Como fracción de hora, ${String(m)} minutos son ${String(m)} ÷ 60 = ${decimalOf(m)} horas, la cifra que anota una tarjeta de horas.`,
        ];
      },
      tableHeading: (m: number): string => `Dentro de ${String(m)} minutos cerca de la medianoche`,
      table: (m: number, cut: string, start: string): string =>
        `Las únicas horas que cambian la fecha son los últimos ${String(m)} minutos antes de la medianoche, desde ${las(cut)}. Cada 5 minutos desde ${las(start)}, ${String(m)} minutos después:`,
      caption: (m: number, start: string): string =>
        `${String(m)} minutos después de cada hora desde ${las(start)}`,
      head: (m: number): string[] => ['Hora actual', `${String(m)} minutos después`, 'Día'],
      opposite: (m: number): string => `Hace ${String(m)} minutos`,
      back: (m: number, from: string, early: string, start: string, to: string): string =>
        `Hacia atrás, hace ${String(m)} minutos es tu hora menos ${String(m)} minutos; pide prestada una hora cuando los minutos quedan bajo cero: 3:05 pm − ${String(m)} min = ${from}. Solo antes de ${las(early)} cae en el día anterior: ${start} − ${String(m)} min = ${to} de ayer.`,
      workHeading: (m: number): string => `${String(m)} minutos en el trabajo`,
      rounding: (m: number, dec: string, quarter: number): string =>
        `En una tarjeta de horas, ${String(m)} minutos son ${dec} horas. Un reloj checador que redondea al cuarto de hora más cercano los anota como ${String(quarter)} minutos, ${decimalOf(quarter)} horas${quarter === m ? ', exactos, porque son un número entero de cuartos de hora' : quarter < m ? ', redondeados hacia abajo' : ', redondeados hacia arriba'}; ese redondeo se permite solo si, con el tiempo, te pagan todo el tiempo que trabajaste (29 CFR 785.48).`,
      week: (m: number): string =>
        `Cada día de una semana de 5 días, ${String(m)} minutos suman ${n(5 * m)} minutos, ${decimalOf(5 * m)} horas; en 52 semanas, ${n(260 * m)} minutos, ${decimalOf(260 * m)} horas.`,
      short: (m: number): string =>
        `Un descanso de ${String(m)} minutos es un descanso corto: la ley federal no lo exige, pero cuando el empleador lo da, es tiempo de trabajo pagado (29 CFR 785.18).`,
      meal: (m: number): string =>
        `Un descanso para comer de ${String(m)} minutos, libre de tareas, no es tiempo de trabajo con la ley federal (29 CFR 785.19), así que se resta de las horas del día; la ley federal no lo exige, pero algunos estados sí.`,
      between: (m: number): string =>
        `${String(m)} minutos quedan entre las dos reglas federales de descansos: un descanso corto, de unos 5 a 20 minutos, es tiempo de trabajo pagado (29 CFR 785.18), y un descanso para comer, por lo general de 30 minutos o más y libre de tareas, no lo es (29 CFR 785.19).`,
    },
    figure: 'Desde la hora de tu reloj',
    breakdown: 'La regla a cualquier hora del día',
    edit: 'Cuenta las horas entre dos horas del día',
    others: 'Otras horas antes y después',
    common: 'Hace horas, dentro de horas y dentro de minutos',
    note: 'La respuesta en vivo sigue el reloj y la zona horaria de tu dispositivo. La noche del cambio de horario de verano, una hora de la cuenta se salta o se repite.',
  },
} as const;

/** `1/12`, `1/3`: minutes as a reduced fraction of an hour. */
function fractionOf(m: number): string {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const g = gcd(m, 60);
  return `${String(m / g)}/${String(60 / g)}`;
}

const questionOf = (job: TimeOffset, lang: Lang): string =>
  job.unit === 'hour' ? WORDS[lang].hours.h1(job) : WORDS[lang].minutes.h1(job.amount);

export const offsetLinksOf = (lang: Lang, except?: TimeOffset): CommonLinks => {
  const w = WORDS[lang];
  const listed = except === undefined ? TIME_OFFSETS : nearestOf(liveGroupOf(except), except);
  return {
    heading: except === undefined ? w.common : w.others,
    links: listed.map((job) => ({ href: pathOf(job, lang), label: questionOf(job, lang) })),
  };
};

/** `9 hours`, `1 day and 6 hours`, `3 days`: a span of hours in days and hours. */
const spanOf = (hours: number, lang: Lang): string => {
  const days = Math.floor(hours / 24);
  const rest = hours % 24;
  if (days === 0) return hoursOf(rest, lang);
  if (rest === 0) return daysOf(days, lang);
  return `${daysOf(days, lang)} ${lang === 'en' ? 'and' : 'y'} ${hoursOf(rest, lang)}`;
};

const oppositeOf = (job: TimeOffset): TimeOffset => {
  const other = TIME_OFFSETS.find(
    (each) =>
      each.unit === job.unit && each.amount === job.amount && each.direction !== job.direction,
  );
  if (other === undefined) throw new Error(`no opposite of ${job.slug.en}`);
  return other;
};

/** The working day of an hours page with no text of its own (`WORK`): figures of its own. */
const hoursWorkOf = (
  job: TimeOffset,
  lang: Lang,
): { paragraphs: string[]; shifts: readonly Shift[] } => {
  const v = WORDS[lang].hours;
  const h = job.amount;
  const d = h * 60;
  const at = (from: number, delta: number): string => {
    const shifted = clockShift(from, delta);
    return onDayOf(shifted.minutes, shifted.days, lang);
  };
  const shifts = h < 24 ? shiftsLasting(d) : [];
  const spans = listOf(
    shifts.map((shift) => spanOfShift(shift, lang)),
    lang,
  );
  const paragraphs =
    job.direction === 'ago'
      ? [v.endOfDay(h, at(1020, -d), at(420, -d))]
      : [v.startOfDay(h, at(540, d), h < 15 ? `, ${v.gap(h)}` : '', at(1020, d))];
  if (shifts.length > 0)
    paragraphs.push(
      job.direction === 'ago'
        ? v.shiftsAgo(h, spans, shifts.length > 1)
        : v.shiftsFromNow(h, spans, shifts.length > 1),
    );
  paragraphs.push(v.overtime(h));
  return { paragraphs, shifts };
};

const hoursPageOf = (job: TimeOffset, lang: Lang) => {
  const w = WORDS[lang];
  const v = w.hours;
  const h = job.amount;
  const d = h * 60;
  const q = Math.floor(h / 24);
  const r = h % 24;
  const ago = job.direction === 'ago';
  const { cut } = momentsOf(job);
  const signed = ago ? -d : d;
  const table =
    r === 0
      ? Array.from({ length: 7 }, (_, day) => [
          `${weekdayNameOf(day, lang)} 5:00 pm`,
          `${weekdayNameOf(ago ? day - q : day + q, lang)} 5:00 pm`,
        ])
      : Array.from({ length: 24 }, (_, hour) => {
          const shifted = clockShift(hour * 60, signed);
          return [t(hour * 60), t(shifted.minutes), dayCellOf(shifted.days, lang)];
        });
  const hand = handKeyOf(job);
  const opposite = oppositeOf(job);
  const at = (from: number, delta: number): string => {
    const shifted = clockShift(from, delta);
    return onDayOf(shifted.minutes, shifted.days, lang);
  };
  const turns =
    r === 0
      ? [
          {
            id: 'months',
            heading: v.monthsHeading(job),
            paragraphs: [v.months(q)],
            table: {
              caption: v.monthsCaption(job),
              head: [...v.monthsHead],
              rows: Array.from({ length: 12 }, (_, i) => {
                const d0 = ago ? 1 : 28;
                const by = ago ? -q : q;
                return [
                  monthDayOf({ y: 2027, m: i + 1, d: d0 }, lang),
                  monthDayOf(addDays({ y: 2027, m: i + 1, d: d0 }, by), lang),
                  monthDayOf(addDays({ y: 2028, m: i + 1, d: d0 }, by), lang),
                ];
              }),
            },
          },
        ]
      : [];
  const work =
    hand === undefined
      ? hoursWorkOf(job, lang)
      : { paragraphs: [...WORK[lang][hand], v.overtime(h)], shifts: [] };
  const sections: LongTailSection[] = [
    { id: 'worked', heading: WORKED[lang], paragraphs: [], steps: v.steps(job) },
    {
      id: 'clock',
      heading: v.tableHeading(job),
      paragraphs: [v.table(job)],
      table: { caption: v.caption(job), head: v.head(job), rows: table },
    },
    ...turns,
    {
      id: 'opposite',
      heading: v.label(opposite),
      paragraphs: [
        v.other(opposite, at(720, -signed), at(ago ? 1320 : 120, -signed)),
        v.apart(h, spanOf(2 * h, lang)),
      ],
      links: [{ href: pathOf(opposite, lang), label: questionOf(opposite, lang) }],
    },
    {
      id: 'work',
      heading: v.workHeading(h),
      paragraphs: work.paragraphs,
      ...(hand !== undefined
        ? { links: workLinksOf(hand, lang) }
        : work.shifts.length > 0
          ? { links: work.shifts.map((shift) => shiftLinkOf(shift, lang)) }
          : {}),
    },
  ];
  const range = (from: number, to: number): string => v.range(t(from), t(to));
  const dayRows =
    r === 0
      ? [
          { key: 'clock', label: v.rows.clock, value: v.rows.unchanged },
          { key: 'days', label: ago ? v.rows.daysBack : v.rows.daysOn, value: String(q) },
        ]
      : q === 0
        ? ago
          ? [
              { key: 'same', label: v.rows.same, value: range(cut, DAY - 1) },
              { key: 'previous', label: v.rows.previous(r), value: range(0, cut - 1) },
            ]
          : [
              { key: 'same', label: v.rows.same, value: range(0, cut - 1) },
              { key: 'next', label: v.rows.next(r), value: range(cut, DAY - 1) },
            ]
        : ago
          ? [
              { key: 'later', label: capital(dayCellOf(-q, lang)), value: range(cut, DAY - 1) },
              { key: 'earlier', label: capital(dayCellOf(-q - 1, lang)), value: range(0, cut - 1) },
            ]
          : [
              { key: 'earlier', label: capital(dayCellOf(q, lang)), value: range(0, cut - 1) },
              { key: 'later', label: capital(dayCellOf(q + 1, lang)), value: range(cut, DAY - 1) },
            ];
  const live = v.live(job);
  return {
    headline: v.headline(job),
    lead: v.lead(job),
    figure: `${ago ? '−' : '+'}${String(h)} h`,
    rows: [
      ...dayRows,
      { key: 'minutes', label: v.rows.minutes, value: n(d) },
      { key: 'workdays', label: v.rows.workdays, value: hoursText(Rational.of(h, 8)) },
    ],
    live: {
      kind: 'offset' as const,
      data: { amount: String(signed), ...live },
      fallback: v.fallback(job),
    },
    sections,
    sources: [SOURCES.factSheet23],
  };
};

const minutesSourcesOf = (m: number): readonly LongTailSource[] => [
  SOURCES.ecfr48,
  ...(m <= 25 ? [SOURCES.ecfr18] : []),
  ...(m >= 25 ? [SOURCES.ecfr19] : []),
];

const minutesPageOf = (job: TimeOffset, lang: Lang) => {
  const w = WORDS[lang];
  const v = w.minutes;
  const m = job.amount;
  const cut = t(DAY - m);
  const late = lateOf(m);
  const start = tableStartOf(m);
  const rowOf = (minutes: number): string[] => {
    const shifted = clockShift(minutes, m);
    return [t(minutes), t(shifted.minutes), dayCellOf(shifted.days, lang)];
  };
  const hand = handKeyOf(job);
  const quarter = Math.round(m / 15) * 15;
  const work =
    hand === undefined
      ? [
          v.rounding(m, decimalOf(m), quarter),
          v.week(m),
          m <= 20 ? v.short(m) : m >= 30 ? v.meal(m) : v.between(m),
        ]
      : [...WORK[lang][hand]];
  const minutesPage = MINUTES.some(({ minutes }) => minutes === m);
  const links =
    hand === undefined ? (minutesPage ? [minutesLink(m, lang)] : []) : workLinksOf(hand, lang);
  const sections: LongTailSection[] = [
    { id: 'worked', heading: WORKED[lang], paragraphs: [], steps: v.steps(m) },
    {
      id: 'clock',
      heading: v.tableHeading(m),
      paragraphs: [v.table(m, cut, t(start))],
      table: {
        caption: v.caption(m, t(start)),
        head: v.head(m),
        rows: Array.from({ length: 12 }, (_, step) => rowOf(start + step * 5)),
      },
    },
    {
      id: 'opposite',
      heading: v.opposite(m),
      paragraphs: [v.back(m, t(905 - m), t(m), t(backOf(m)), t(backOf(m) - m + DAY))],
    },
    {
      id: 'work',
      heading: v.workHeading(m),
      paragraphs: work,
      ...(links.length > 0 ? { links } : {}),
    },
  ];
  return {
    headline: v.headline(m, decimalOf(m)),
    lead: v.lead(m, v.name(m), cut, t(late), t(late + m - DAY)),
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
    sources: hand === undefined ? minutesSourcesOf(m) : (SOURCES_OF[hand] ?? []),
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
