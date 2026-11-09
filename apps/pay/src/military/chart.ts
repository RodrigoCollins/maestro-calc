import { militaryTimeOf } from '@maestro-calc/pay-core/military-time';
import { HOURS_PATHS } from '../hours/texts.ts';
import type { LongTailSection } from '../long-tail/sections.ts';
import { titleOf } from '../seo/meta.ts';
import type { Lang } from '../time-card/receipt.ts';
import {
  MILITARY_CHART_PATHS,
  MILITARY_CONVERTER_PATHS,
  MILITARY_TIMES,
  militaryPathOf,
} from './routes.ts';
import { resultOf } from './words.ts';

/** The times whose minutes the chart reads aloud, from the engine. */
const MINUTE_EXAMPLES = [5, 570, 721, 735, 825, 1005, 1439];

/** One row of a time: its digits, then each form in `lang`. */
const rowOf = (minutes: number, lang: Lang, colon: boolean): string[] => {
  const time = militaryTimeOf(minutes);
  const { values } = resultOf(time, lang);
  return colon
    ? [time.military, values.twelve, values.colon, values.spoken]
    : [time.military, values.twelve, values.spoken];
};

const HOURS = Array.from({ length: 24 }, (_, hour) => hour * 60);

const WORDS = {
  en: {
    title: 'Military Time Chart: 24-Hour Clock to 12-Hour Time',
    description:
      'Military time chart for every hour of the day: 0000 is 12:00 AM, 1300 is 1:00 PM, 2300 is 11:00 PM, with how each is said and how minutes are read.',
    kicker: 'Time chart · free',
    h1: 'Military time chart',
    lead: 'Every hour of the day on the 24-hour military clock beside the 12-hour clock, with the way each one is said. Only the hour changes between the two clocks: the minutes stay as they are, so 1345 is 1:45 PM.',
    sections: (hours: string[][], minutes: string[][]): LongTailSection[] => [
      {
        id: 'chart',
        heading: 'Every hour of the day',
        paragraphs: [
          'From 0000 to 1159 the military hour is the morning hour with a leading zero, and midnight is hour 00. From 1200 on, the hours keep counting past 12: subtract 12 from 13 to 23 to get the afternoon and evening hour.',
        ],
        table: {
          caption: 'Military time chart, 0000 to 2300',
          head: ['Military time', '12-hour time', '24-hour with a colon', 'How it is said'],
          rows: hours,
        },
      },
      {
        id: 'minutes',
        heading: 'How the minutes are read',
        paragraphs: [
          'The minutes are the last two digits and are said as one number after the hour: 1345 is "thirteen forty-five". Minutes below 10 keep their zero, said "zero" or "oh": 0005 is "zero zero zero five", or "zero zero oh five" in the "oh" style. A time on the hour takes "hundred": 1300 is "thirteen hundred hours".',
          'Minutes never change between the clocks, so 1:07 PM is 1307 and 0930 is 9:30 AM.',
        ],
        table: {
          caption: 'Times with minutes, read aloud',
          head: ['Military time', '12-hour time', 'How it is said'],
          rows: minutes,
        },
      },
      {
        id: 'midnight',
        heading: 'Midnight and noon: 0000, 2400 and 1200',
        paragraphs: [
          'Midnight is written 0000 at the start of a day and 2400 at the end of one: the same instant, two names. A day runs from 0000 to 2359, so 2400 appears only as an end time, as in a shift from 1600 to 2400. Noon is 1200, said "twelve hundred hours", and it is 12:00 PM, not AM.',
        ],
      },
      {
        id: 'times',
        heading: 'Each hour and half hour on its own page',
        paragraphs: [
          'Each page gives the time in every US time zone, the hours to midnight and to noon, and the pay of a shift that starts or ends then.',
        ],
        links: MILITARY_TIMES.map((job) => {
          const time = militaryTimeOf(job.minutes);
          return { href: militaryPathOf(job), label: `${time.military} · ${time.twelveText}` };
        }),
      },
      {
        id: 'related',
        heading: 'Convert any other time',
        paragraphs: [
          'For a time not on the chart, such as 1847 or 6:12 AM, type it into the converter; it reads either clock.',
        ],
        links: [
          { href: MILITARY_CONVERTER_PATHS.en, label: 'Military time converter' },
          { href: HOURS_PATHS.en, label: 'Hours calculator: the time between two times' },
        ],
      },
    ],
  },
  es: {
    title: 'Tabla de Hora Militar: Formato de 24 Horas a 12 Horas',
    description:
      'Tabla de hora militar con cada hora del día: 0000 son las 12:00 a. m., 1300 la 1:00 p. m., 2300 las 11:00 p. m., cómo se lee cada una y los minutos.',
    kicker: 'Tabla de horas · gratis',
    h1: 'Tabla de hora militar',
    lead: 'Cada hora del día en formato de 24 horas, la hora militar, junto al formato de 12 horas y a cómo se lee. Entre los dos formatos solo cambia la hora: los minutos quedan igual, así que 1345 es la 1:45 p. m.',
    sections: (hours: string[][], minutes: string[][]): LongTailSection[] => [
      {
        id: 'chart',
        heading: 'Cada hora del día',
        paragraphs: [
          'De 0000 a 1159 la hora militar es la hora de la mañana con un cero delante, y la medianoche es la hora 00. Desde 1200 las horas siguen contando después de 12: a las horas de 13 a 23 réstales 12 para tener la hora de la tarde o de la noche.',
        ],
        table: {
          caption: 'Tabla de hora militar, de 0000 a 2300',
          head: ['Hora militar', 'Formato de 12 horas', 'Con dos puntos', 'Cómo se lee'],
          rows: hours,
        },
      },
      {
        id: 'minutes',
        heading: 'Cómo se leen los minutos',
        paragraphs: [
          'Los minutos son las dos últimas cifras y se leen después de la hora: 1345 son «las trece horas y cuarenta y cinco minutos», o «trece cuarenta y cinco» en estilo militar. Los minutos menores que 10 conservan su cero: 0005 son las cero horas y cinco minutos, «cero cero cero cinco» en estilo militar.',
          'Los minutos no cambian entre los dos formatos: la 1:07 p. m. es 1307 y 0930 son las 9:30 a. m.',
        ],
        table: {
          caption: 'Horas con minutos, leídas',
          head: ['Hora militar', 'Formato de 12 horas', 'Cómo se lee'],
          rows: minutes,
        },
      },
      {
        id: 'midnight',
        heading: 'Medianoche y mediodía: 0000, 2400 y 1200',
        paragraphs: [
          'La medianoche se escribe 0000 al empezar un día y 2400 al terminarlo: el mismo instante con dos nombres. Un día va de 0000 a 2359, así que 2400 solo aparece como hora de fin, como en un turno de 1600 a 2400. El mediodía es 1200, las doce horas, y es 12:00 p. m., no a. m.',
        ],
      },
      {
        id: 'related',
        heading: 'Convierte cualquier otra hora',
        paragraphs: [
          'Para una hora que no está en la tabla, como 1847 o 6:12 a. m., escríbela en el convertidor; lee los dos formatos.',
        ],
        links: [
          { href: MILITARY_CONVERTER_PATHS.es, label: 'Convertidor de hora militar' },
          { href: HOURS_PATHS.es, label: 'Calculadora de horas y minutos' },
        ],
      },
    ],
  },
} as const;

/** The chart page in `lang`, every row from the engine. */
export const chartOf = (lang: Lang) => {
  const w = WORDS[lang];
  return {
    title: titleOf(w.title),
    description: w.description,
    kicker: w.kicker,
    h1: w.h1,
    lead: w.lead,
    paths: MILITARY_CHART_PATHS,
    sections: w.sections(
      HOURS.map((minutes) => rowOf(minutes, lang, true)),
      MINUTE_EXAMPLES.map((minutes) => rowOf(minutes, lang, false)),
    ),
  };
};
