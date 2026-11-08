import { clockFieldText as t } from '../format.ts';
import { HOURS_PATHS, HOURS_TEXTS } from '../hours/texts.ts';
import { descriptionOf, titleOf } from '../seo/meta.ts';
import type { Lang } from '../time-card/receipt.ts';
import { fieldOf } from './clock.ts';
import type { CommonLinks, LongTailPage } from './jobs.ts';
import { shiftLink, WORKED } from './live-links.ts';
import { nearestOf } from './nearest.ts';
import { pathOf, UNTILS, type Until } from './routes.ts';
import { SOURCES, type LongTailSection, type LongTailSource } from './sections.ts';
import { durationOf, untilOf } from './time-math.ts';

/*
 * The "how long until 3:00 pm" pages. The count depends on the visitor's clock, so the page as
 * built gives the subtraction, the count from each hour of the day and the shifts the time starts
 * or ends; `../client/time-now.ts` fills the live count. Times are minutes from midnight.
 */

const DAY = 1440;
const n = (value: number): string => value.toLocaleString('en-US');
const dec = (minutes: number): string => (minutes / 60).toFixed(2);
/** The example of the worked steps: 5 h 20 min before the time, and 8:00 pm, once it has passed. */
const LEAD = 320;
const NINE = 540;
const EVENING = 1200;
/** `la 1:00 pm`, `las 3:00 pm`: the article of a time in Spanish. */
const las = (time: string): string => (time.startsWith('1:') ? `la ${time}` : `las ${time}`);
/** 24:00 for midnight, the end of the day it counts to. */
const target24 = (minutes: number): string => (minutes === 0 ? '24:00' : fieldOf(minutes));

/** The working day of each time, in its own words, the shifts it links and the sources it cites. */
const WORK: Readonly<
  Record<number, { en: string; es: string; shifts: [string, string][]; sources: LongTailSource[] }>
> = {
  0: {
    en: '12:00 am is midnight, the end of one date and the start of the next, which is why a time card writes it as 0:00 or 24:00. An evening shift from 4 pm to 12 am ends at it, 8 hours after it began, and a night shift from 10 pm to 6 am crosses it, with 2 hours before it and 6 after. A shift that crosses midnight is counted from its start to its end, never by subtracting the clock times as they read.',
    es: 'Las 12:00 am son la medianoche, el final de una fecha y el inicio de la siguiente, por eso una tarjeta de horas la escribe como 0:00 o 24:00. Un turno de tarde de 4 pm a 12 am termina en ella, 8 horas después de empezar, y un turno de noche de 10 pm a 6 am la cruza, con 2 horas antes y 6 después. Un turno que cruza la medianoche se cuenta de su inicio a su final, nunca restando las horas tal como se leen.',
    shifts: [
      ['16:00', '0:00'],
      ['22:00', '6:00'],
    ],
    sources: [],
  },
  720: {
    en: '12:00 pm is noon, the middle of the day and the usual start of a lunch break. From the start of an 8-to-4 shift, 8:00 am, it is 4 h 0 min to noon, half the shift. A meal period, ordinarily 30 minutes or more fully off duty, is not work time under federal law (29 CFR 785.19), so a lunch from 12:00 pm to 12:30 pm comes off the hours of the day.',
    es: 'Las 12:00 pm son el mediodía, la mitad del día y la hora habitual del almuerzo. Desde el inicio de un turno de 8 a 4, a las 8:00 am, faltan 4 h 0 min para el mediodía, la mitad del turno. Un descanso para comer, por lo general de 30 minutos o más y libre de tareas, no es tiempo de trabajo con la ley federal (29 CFR 785.19), así que un almuerzo de 12:00 pm a 12:30 pm se resta de las horas del día.',
    shifts: [['8:00', '16:00']],
    sources: [SOURCES.ecfr19],
  },
  855: {
    en: '2:15 pm is a quarter past two, 14.25 in decimal hours, and 15 minutes after the end of a 6 am to 2 pm shift. A short break of about 5 to 20 minutes, such as one from 2:00 to 2:15 pm, is paid work time when the employer gives it (29 CFR 785.18). From 6:00 am it is 8 h 15 min to 2:15 pm.',
    es: 'Las 2:15 pm son las dos y cuarto, 14.25 en horas decimales, y 15 minutos después del final de un turno de 6 am a 2 pm. Un descanso corto, de unos 5 a 20 minutos, como uno de 2:00 a 2:15 pm, es tiempo de trabajo pagado cuando el empleador lo da (29 CFR 785.18). Desde las 6:00 am faltan 8 h 15 min para las 2:15 pm.',
    shifts: [['6:00', '14:00']],
    sources: [SOURCES.ecfr18],
  },
  870: {
    en: '2:30 pm is 14.5 in decimal hours and 30 minutes before the end of a 7 am to 3 pm shift: from its start, 7:00 am, it is 7 h 30 min away. It is also a quarter-hour mark, so a time clock that rounds to the nearest quarter hour records a punch from 2:23 to 2:37 pm as 2:30 pm, which is allowed only if, over time, you are paid for all the time you worked (29 CFR 785.48).',
    es: 'Las 2:30 pm son 14.5 en horas decimales y 30 minutos antes del final de un turno de 7 am a 3 pm: desde su inicio, a las 7:00 am, faltan 7 h 30 min. Es también una marca de cuarto de hora, así que un reloj checador que redondea al cuarto de hora más cercano anota una marca de 2:23 a 2:37 pm como 2:30 pm, algo permitido solo si, con el tiempo, te pagan todo el tiempo que trabajaste (29 CFR 785.48).',
    shifts: [['7:00', '15:00']],
    sources: [SOURCES.ecfr48],
  },
  885: {
    en: '2:45 pm is a quarter to three, 14.75 in decimal hours. In an 8 am to 3 pm shift it leaves 15 minutes, the length of a short paid break (29 CFR 785.18). From 6:00 am it is 8 h 45 min, so a 6:00 am to 2:45 pm day with a 45-minute unpaid lunch is 8 hours worked, since a real meal period is not work time (29 CFR 785.19).',
    es: 'Las 2:45 pm son las tres menos cuarto, 14.75 en horas decimales. En un turno de 8 am a 3 pm quedan 15 minutos, lo que dura un descanso corto pagado (29 CFR 785.18). Desde las 6:00 am faltan 8 h 45 min, así que un día de 6:00 am a 2:45 pm con 45 minutos de almuerzo sin pago son 8 horas trabajadas, porque un descanso para comer de verdad no es tiempo de trabajo (29 CFR 785.19).',
    shifts: [['8:00', '15:00']],
    sources: [SOURCES.ecfr18, SOURCES.ecfr19],
  },
  900: {
    en: '3:00 pm is when a 7 am to 3 pm first shift ends and a 3 pm to 11 pm second shift starts. From 7:00 am it is 8 h 0 min, a full 8-hour shift; from 11:00 pm, the end of the second shift, it is 16 h 0 min to the next 3:00 pm, the time off before that shift comes round again.',
    es: 'A las 3:00 pm termina un primer turno de 7 am a 3 pm y empieza un segundo turno de 3 pm a 11 pm. Desde las 7:00 am faltan 8 h 0 min, un turno completo de 8 horas; desde las 11:00 pm, el final del segundo turno, faltan 16 h 0 min para las siguientes 3:00 pm, el descanso antes de que ese turno vuelva a empezar.',
    shifts: [
      ['7:00', '15:00'],
      ['15:00', '23:00'],
    ],
    sources: [],
  },
  930: {
    en: '3:30 pm is 15.5 in decimal hours and one hour before the end of an 8:30 am to 4:30 pm day. From its start, 8:30 am, it is 7 h 0 min to 3:30 pm, and from 6:00 am, 9 h 30 min. Half past the hour is where a time clock that rounds to the nearest quarter hour still records 3:30 pm for a punch made at 3:37 pm.',
    es: 'Las 3:30 pm son 15.5 en horas decimales y una hora antes del final de una jornada de 8:30 am a 4:30 pm. Desde su inicio, a las 8:30 am, faltan 7 h 0 min para las 3:30 pm, y desde las 6:00 am, 9 h 30 min. Un reloj checador que redondea al cuarto de hora más cercano todavía anota las 3:30 pm para una marca hecha a las 3:37 pm.',
    shifts: [['8:30', '16:30']],
    sources: [SOURCES.ecfr48],
  },
  960: {
    en: '4:00 pm ends an 8 am to 4 pm shift and starts a 4 pm to 12 am evening shift. From 8:00 am it is 8 h 0 min; from 12:00 am, the end of the evening shift, it is 16 h 0 min to the next 4:00 pm. An evening shift paid more than the day shift for the same work is a shift differential, which counts in the regular rate for overtime (29 CFR 778.207).',
    es: 'A las 4:00 pm termina un turno de 8 am a 4 pm y empieza un turno de tarde de 4 pm a 12 am. Desde las 8:00 am faltan 8 h 0 min; desde las 12:00 am, el final del turno de tarde, faltan 16 h 0 min para las siguientes 4:00 pm. Un turno de tarde pagado por encima del turno de día por el mismo trabajo es un diferencial de turno, que cuenta en la tarifa regular para las horas extra (29 CFR 778.207).',
    shifts: [
      ['8:00', '16:00'],
      ['16:00', '0:00'],
    ],
    sources: [SOURCES.ecfr778207],
  },
  1020: {
    en: '5:00 pm is the end of a 9-to-5: from 9:00 am it is 8 h 0 min on the clock, 7.5 hours worked with an unpaid 30-minute lunch. Five such days are 40 hours on the clock, the most a workweek holds before federal law pays time and a half (DOL Fact Sheet #23); with the lunch unpaid they are 37.5 hours worked.',
    es: 'Las 5:00 pm son el final de una jornada de 9 a 5: desde las 9:00 am faltan 8 h 0 min de reloj, 7.5 horas trabajadas con 30 minutos de almuerzo sin pago. Cinco días así son 40 horas de reloj, lo máximo que cabe en una semana laboral antes de que la ley federal pague tiempo y medio (DOL Fact Sheet #23); con el almuerzo sin pago son 37.5 horas trabajadas.',
    shifts: [['9:00', '17:00']],
    sources: [SOURCES.factSheet23],
  },
};

const WORDS = {
  en: {
    h1: (label: string): string => `How long until ${label}?`,
    headline: (label: string, f: string): string =>
      `How long until ${label}: ${f} minus the time on your clock`,
    figure: (f: string): string => `${f} − now`,
    figureLabel: 'Count down from your clock',
    lead: (label: string, f: string, nine: number, evening: number): string =>
      `To count down to ${label}, subtract the time on your clock from ${f}, the 24-hour form of ${label}. From 9:00 am that is ${durationOf(nine)}, or ${dec(nine)} hours; once ${label} has passed, the next one is tomorrow, so add 24 hours first: from 8:00 pm it is ${durationOf(evening)}.`,
    midnightLead: (nine: number, evening: number): string =>
      `To count down to 12:00 am, midnight, subtract the time on your clock from 24:00, the end of the day. From 9:00 am that is ${durationOf(nine)}, or ${dec(nine)} hours, and from 8:00 pm it is ${durationOf(evening)}.`,
    today: (label: string): string => `It is {now}: ${label} is {duration} away, today.`,
    tomorrow: (label: string): string =>
      `It is {now}: ${label} has passed today, so the next one is {duration} away, tomorrow.`,
    midnight: 'It is {now}: midnight tonight is {duration} away.',
    fallback: (label: string, f: string): string =>
      `Subtract the time on your clock from ${f} (${label}). After ${label}, add 24 hours first: the next ${label} is tomorrow.`,
    midnightFallback:
      'Subtract the time on your clock from 24:00: what is left of today is the time until 12:00 am, midnight.',
    from: (time: string): string => `From ${time}`,
    after: (label: string): string => `After ${label}, to tomorrow's`,
    mark: { today: 'today', tomorrow: 'tomorrow', now: 'now', tonight: 'tonight' },
    breakdown: 'The count from common times',
    steps: (label: string, target: number, now: number, evening: number): string[] => [
      `Write ${label} on a 24-hour clock: ${fieldOf(target)}, which is ${n(target)} minutes after midnight.`,
      `Write the time now the same way: ${t(now)} is ${fieldOf(now)}, ${n(now)} minutes.`,
      `Subtract: ${n(target)} − ${n(now)} = ${String(LEAD)} minutes, ${durationOf(LEAD)}.`,
      `In decimal hours, ${String(LEAD)} ÷ 60 = ${dec(LEAD)} hours.`,
      `If the subtraction comes out negative, ${label} has passed today: add 1,440 minutes, 24 hours. From 8:00 pm (1,200), ${n(target)} + 1,440 − 1,200 = ${n(evening)} minutes, ${durationOf(evening)} until tomorrow's ${label}.`,
    ],
    midnightSteps: [
      'Midnight, 12:00 am, is the end of the day: 24:00 on a 24-hour clock, 1,440 minutes after the midnight before.',
      'Write the time now in minutes: 8:00 pm is 20:00, 1,200 minutes.',
      'Subtract: 1,440 − 1,200 = 240 minutes, 4 h 0 min, or 4.00 hours.',
      'The count is never negative, since every time of the day comes before the next midnight. At 12:00 am exactly it is 0, and a minute later it starts again from 1,439 minutes, 23 h 59 min.',
    ],
    hoursHeading: (label: string): string => `How long until ${label} from each hour`,
    hours: (label: string): string =>
      `From each hour on the hour, the time left until ${label}, in hours and minutes and in the decimal hours a time card uses. The rows after ${label} count to tomorrow's.`,
    midnightHours:
      'From each hour on the hour, the time left until midnight tonight, in hours and minutes and in the decimal hours a time card uses.',
    caption: (label: string): string => `Time left until ${label}`,
    head: (label: string): string[] => ['Time now', `Until ${label}`, 'Decimal hours', 'Day'],
    sinceHeading: (label: string): string => `Time since ${label}`,
    since: (label: string, f: string, night: number, morning: number): string =>
      `The other way, the time since ${label} is the clock minus ${f}: at 9:00 pm it is ${durationOf(night)}. Before ${label} it is the time since yesterday's: at 9:00 am, ${durationOf(morning)}.`,
    midnightSince:
      'The time since midnight is the clock itself on a 24-hour clock: at 9:00 am, 9 h 0 min have passed today, and at 8:00 pm, 20 h 0 min.',
    workHeading: (label: string): string => `${label} in a working day`,
    edit: 'Count the hours between two times',
    others: 'Other times to count down to',
    common: 'How long until a time',
    note: 'The live count follows the clock of your device, to the minute; it does not count the seconds.',
  },
  es: {
    h1: (label: string): string => `¿Cuánto falta para ${las(label)}?`,
    headline: (label: string, f: string): string =>
      `Cuánto falta para ${las(label)}: ${f} menos la hora de tu reloj`,
    figure: (f: string): string => `${f} − ahora`,
    figureLabel: 'Cuenta desde tu reloj',
    lead: (label: string, f: string, nine: number, evening: number): string =>
      `Para saber cuánto falta para ${las(label)}, resta la hora de tu reloj a ${f}, la forma de 24 horas de ${las(label)}. Desde las 9:00 am son ${durationOf(nine)}, o ${dec(nine)} horas; cuando ${las(label)} ya pasaron, las siguientes son mañana, así que suma 24 horas primero: desde las 8:00 pm son ${durationOf(evening)}.`,
    midnightLead: (nine: number, evening: number): string =>
      `Para saber cuánto falta para las 12:00 am, la medianoche, resta la hora de tu reloj a 24:00, el final del día. Desde las 9:00 am son ${durationOf(nine)}, o ${dec(nine)} horas, y desde las 8:00 pm son ${durationOf(evening)}.`,
    today: (label: string): string => `Ahora: {now}. Para ${las(label)} faltan {duration}, hoy.`,
    tomorrow: (label: string): string =>
      `Ahora: {now}. Ya pasaron ${las(label)} de hoy: para las de mañana faltan {duration}.`,
    midnight: 'Ahora: {now}. Para la medianoche de hoy faltan {duration}.',
    fallback: (label: string, f: string): string =>
      `Resta la hora de tu reloj a ${f} (${label}). Después de ${las(label)}, suma 24 horas primero: las siguientes ${label} son mañana.`,
    midnightFallback:
      'Resta la hora de tu reloj a 24:00: lo que queda de hoy es lo que falta para las 12:00 am, la medianoche.',
    from: (time: string): string => `Desde ${las(time)}`,
    after: (label: string): string => `Después de ${las(label)}, hasta mañana`,
    mark: { today: 'hoy', tomorrow: 'mañana', now: 'ahora', tonight: 'esta noche' },
    breakdown: 'La cuenta desde horas comunes',
    steps: (label: string, target: number, now: number, evening: number): string[] => [
      `Escribe ${las(label)} en reloj de 24 horas: ${fieldOf(target)}, que son ${n(target)} minutos después de la medianoche.`,
      `Escribe la hora actual igual: ${las(t(now))} son las ${fieldOf(now)}, ${n(now)} minutos.`,
      `Resta: ${n(target)} − ${n(now)} = ${String(LEAD)} minutos, ${durationOf(LEAD)}.`,
      `En horas decimales, ${String(LEAD)} ÷ 60 = ${dec(LEAD)} horas.`,
      `Si la resta da negativa, ${las(label)} ya pasaron hoy: suma 1,440 minutos, 24 horas. Desde las 8:00 pm (1,200), ${n(target)} + 1,440 − 1,200 = ${n(evening)} minutos, ${durationOf(evening)} hasta ${las(label)} de mañana.`,
    ],
    midnightSteps: [
      'La medianoche, las 12:00 am, es el final del día: 24:00 en reloj de 24 horas, 1,440 minutos después de la medianoche anterior.',
      'Escribe la hora actual en minutos: las 8:00 pm son las 20:00, 1,200 minutos.',
      'Resta: 1,440 − 1,200 = 240 minutos, 4 h 0 min, o 4.00 horas.',
      'La cuenta nunca da negativa, porque toda hora del día está antes de la siguiente medianoche. A las 12:00 am en punto es 0, y un minuto después vuelve a empezar desde 1,439 minutos, 23 h 59 min.',
    ],
    hoursHeading: (label: string): string => `Cuánto falta para ${las(label)} desde cada hora`,
    hours: (label: string): string =>
      `Desde cada hora en punto, lo que falta para ${las(label)}, en horas y minutos y en las horas decimales que usa una tarjeta de horas. Las filas después de ${las(label)} cuentan hasta las de mañana.`,
    midnightHours:
      'Desde cada hora en punto, lo que falta para la medianoche de hoy, en horas y minutos y en las horas decimales que usa una tarjeta de horas.',
    caption: (label: string): string => `Lo que falta para ${las(label)}`,
    head: (label: string): string[] => [
      'Hora actual',
      `Hasta ${las(label)}`,
      'Horas decimales',
      'Día',
    ],
    sinceHeading: (label: string): string => `Tiempo desde ${las(label)}`,
    since: (label: string, f: string, night: number, morning: number): string =>
      `Al revés, el tiempo desde ${las(label)} es tu hora menos ${f}: a las 9:00 pm son ${durationOf(night)}. Antes de ${las(label)} es el tiempo desde las de ayer: a las 9:00 am, ${durationOf(morning)}.`,
    midnightSince:
      'El tiempo desde la medianoche es la hora misma en reloj de 24 horas: a las 9:00 am han pasado 9 h 0 min de hoy, y a las 8:00 pm, 20 h 0 min.',
    workHeading: (label: string): string =>
      `${las(label).replace(/^l/, 'L')} en una jornada de trabajo`,
    edit: 'Cuenta las horas entre dos horas del día',
    others: 'Otras horas para contar',
    common: 'Cuánto falta para una hora',
    note: 'La cuenta en vivo sigue el reloj de tu dispositivo, al minuto; no cuenta los segundos.',
  },
} as const;

const questionOf = (job: Until, lang: Lang): string => WORDS[lang].h1(t(job.minutes));

export const untilLinksOf = (lang: Lang, except?: Until): CommonLinks => {
  const w = WORDS[lang];
  const listed = except === undefined ? UNTILS : nearestOf(UNTILS, except);
  return {
    heading: except === undefined ? w.common : w.others,
    links: listed.map((job) => ({ href: pathOf(job, lang), label: questionOf(job, lang) })),
  };
};

/** The page of one time to count down to in one language, and the live count's slot. */
export const untilPageOf = (job: Until, lang: Lang): LongTailPage => {
  const w = WORDS[lang];
  const target = job.minutes;
  const label = t(target);
  const f = target24(target);
  const midnight = target === 0;
  const count = (now: number) => untilOf(now, target);
  const markOf = (now: number): string => {
    const { minutes, tomorrow } = count(now);
    if (minutes === 0) return w.mark.now;
    if (midnight) return w.mark.tonight;
    return tomorrow ? w.mark.tomorrow : w.mark.today;
  };
  const nine = count(NINE).minutes;
  const evening = count(EVENING).minutes;
  const lead = midnight ? w.midnightLead(nine, evening) : w.lead(label, f, nine, evening);
  const work = WORK[target];
  if (work === undefined) throw new Error(`no working day for ${label}`);
  const sections: LongTailSection[] = [
    {
      id: 'worked',
      heading: WORKED[lang],
      paragraphs: [],
      steps: midnight ? w.midnightSteps : w.steps(label, target, target - LEAD, evening),
    },
    {
      id: 'hours',
      heading: w.hoursHeading(label),
      paragraphs: [midnight ? w.midnightHours : w.hours(label)],
      table: {
        caption: w.caption(label),
        head: w.head(label),
        rows: Array.from({ length: 24 }, (_, hour) => {
          const { minutes } = count(hour * 60);
          return [t(hour * 60), durationOf(minutes), dec(minutes), markOf(hour * 60)];
        }),
      },
    },
    {
      id: 'since',
      heading: w.sinceHeading(label),
      paragraphs: [
        midnight ? w.midnightSince : w.since(label, f, 1260 - target, NINE - target + DAY),
      ],
    },
    {
      id: 'work',
      heading: w.workHeading(label),
      paragraphs: [work[lang]],
      links: work.shifts.map(([from, to]) => shiftLink(from, to, lang)),
    },
  ];
  const rows = [360, NINE, 720, 1080].map((from) => {
    const { minutes, tomorrow } = count(from);
    return {
      key: String(from),
      label: w.from(t(from)),
      value: `${durationOf(minutes)}${tomorrow && !midnight ? ` (${w.mark.tomorrow})` : ''}`,
    };
  });
  return {
    kicker: HOURS_TEXTS[lang].kicker,
    title: titleOf(w.headline(label, f)),
    description: descriptionOf(lead),
    h1: questionOf(job, lang),
    lead,
    figure: w.figure(f),
    figureLabel: w.figureLabel,
    breakdown: w.breakdown,
    rows: midnight
      ? rows
      : [...rows, { key: 'after', label: w.after(label), value: w.figure(fieldOf(target + DAY)) }],
    calculator: { href: HOURS_PATHS[lang], label: w.edit, title: HOURS_TEXTS[lang].title },
    note: w.note,
    paths: { en: pathOf(job, 'en'), es: pathOf(job, 'es') },
    others: untilLinksOf(lang, job),
    sections,
    ...(work.sources.length > 0 ? { sources: work.sources } : {}),
    live: {
      kind: 'until',
      data: {
        amount: String(target),
        today: midnight ? w.midnight : w.today(label),
        tomorrow: midnight ? w.midnight : w.tomorrow(label),
      },
      fallback: midnight ? w.midnightFallback : w.fallback(label, f),
    },
  };
};
