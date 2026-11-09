import { militaryTimeOf, readTime, type MilitaryTime } from '@maestro-calc/pay-core/military-time';
import { HOURS_PATHS } from '../hours/texts.ts';
import { TIME_CARD_PATHS } from '../long-tail/jobs.ts';
import type { LongTailSection } from '../long-tail/sections.ts';
import { titleOf } from '../seo/meta.ts';
import type { Lang } from '../time-card/receipt.ts';
import {
  MILITARY_CHART_PATHS,
  MILITARY_CONVERTER_PATHS,
  MILITARY_TIMES,
  militaryPathOf,
} from './routes.ts';
import { resultOf, type ResultKey } from './words.ts';

/** The time the converter opens on, and works out without a script. */
export const CONVERTER_DEFAULT = '1500';

/** The common times the conversion table works, in the order of the day. */
const EXAMPLES = ['12:00 am', '12:45 am', '6:00 am', '9:30 am', '12:00 pm', '12:30 pm', '1:00 pm'];
const MORE = ['3:00 pm', '5:00 pm', '6:45 pm', '7:45 pm', '11:00 pm', '11:59 pm'];

const timeOf = (text: string): MilitaryTime => {
  const time = readTime(text);
  if (time === null) throw new Error(`the converter cannot read ${text}`);
  return time;
};

const WORDS = {
  en: {
    title: 'Military Time Converter: 12-Hour to 24-Hour',
    description:
      'Convert any time to military time and back: 1500 is 3:00 PM, said fifteen hundred hours. Type 3:00 PM or 1500 to get both clocks and the spoken form.',
    kicker: 'Time converter · free',
    h1: 'Military time converter',
    lead: 'Type a time either way, 3:00 PM or 1500, and get it on both clocks with the way it is said. Military time is the 24-hour clock written with four digits and no colon: after noon the hours keep counting, 13 to 23, so there is no AM or PM to mix up on a schedule or a time card.',
    input: 'Time, 12-hour or military',
    hint: 'Examples: 1500, 0730, 7:30 pm, 12 am. Type 2400 for the midnight that ends a day.',
    invalid: 'Type a time such as 1500, 0730 or 7:30 PM.',
    figureLabel: 'Military time and 12-hour time',
    labels: {
      twelve: '12-hour clock',
      colon: '24-hour clock with a colon',
      spoken: 'How it is said',
    } satisfies Record<ResultKey, string>,
    breakdown: 'The time in each form',
    timePage: (time: MilitaryTime): string => `${time.military} in military time`,
    sections: (table: string[][]): LongTailSection[] => [
      {
        id: 'how-to-convert',
        heading: 'How to convert 12-hour time to military time',
        paragraphs: [
          'Military time counts the hours of the day from 00 to 23 and writes them with the minutes as four digits. The morning keeps its digits; the afternoon and the evening add 12 to the hour, so the clock never starts over at noon.',
        ],
        steps: [
          'From 1:00 AM to 11:59 AM, keep the digits and add a leading zero below 10: 7:30 AM is 0730.',
          'From 12:00 AM to 12:59 AM, the hour after midnight is hour 00: 12:45 AM is 0045.',
          'From 12:00 PM to 12:59 PM, noon keeps its 12: 12:30 PM is 1230.',
          'From 1:00 PM to 11:59 PM, add 12 to the hour: 7:45 PM is 7 + 12 = 1945.',
        ],
        table: {
          caption: 'Common times converted by the engine of this page',
          head: ['12-hour time', 'Military time', 'How it is said'],
          rows: table,
        },
      },
      {
        id: 'how-to-convert-back',
        heading: 'How to convert military time to 12-hour time',
        paragraphs: [
          'Read the first two digits as the hour and the last two as the minutes, then bring the hour back onto a 12-hour dial.',
        ],
        steps: [
          'Hour 00: write 12 and AM: 0015 is 12:15 AM.',
          'Hours 01 to 11: drop the leading zero and write AM: 0930 is 9:30 AM.',
          'Hour 12: keep it and write PM: 1215 is 12:15 PM.',
          'Hours 13 to 23: subtract 12 and write PM: 1845 is 18 − 12 = 6:45 PM.',
        ],
      },
      {
        id: 'how-it-is-said',
        heading: 'How military time is said',
        paragraphs: [
          'On the hour, the hour is said with "hundred hours": 0800 is "zero eight hundred hours" and 1500 is "fifteen hundred hours". Between hours, the two pairs of digits are said as two numbers, 1345 "thirteen forty-five", often followed by "hours".',
          'A leading zero is said, either as "zero" or as "oh": 0730 is "zero seven thirty" or "oh seven thirty". Minutes below 10 keep their zero too, so 1005 is "ten zero five" and 0005 is "zero zero zero five".',
        ],
      },
      {
        id: 'midnight',
        heading: 'Midnight: 0000 or 2400',
        paragraphs: [
          'Midnight has two names. 0000 (zero hundred hours) is the midnight that starts a day, and 2400 (twenty-four hundred hours) is the same instant written as the end of the day before. A shift from 1600 to 2400 ends at midnight; the next one starts at 0000. There is no 2401: one minute after midnight is 0001.',
          'Noon is 1200, twelve hundred hours, and 12:00 PM on the 12-hour clock.',
        ],
        links: [
          { href: MILITARY_CHART_PATHS.en, label: 'Military time chart: every hour of the day' },
        ],
      },
      {
        id: 'times',
        heading: 'Every hour and half hour, worked out',
        paragraphs: [
          'Each time below has its own page: the 12-hour time, how it is said, the time then in every US time zone, the hours until midnight and noon, and the pay of a shift that starts or ends then.',
        ],
        links: MILITARY_TIMES.map((job) => ({
          href: militaryPathOf(job),
          label: `${militaryTimeOf(job.minutes).military} in military time`,
        })),
      },
      {
        id: 'related',
        heading: 'Hours between two military times',
        paragraphs: [
          'A time card often uses the 24-hour clock. To count the hours of a shift written that way, such as 0700 to 1530, type the two times into the hours calculator; it reads 15:30 and 1530 alike.',
        ],
        links: [
          { href: HOURS_PATHS.en, label: 'Hours calculator: the time between two times' },
          { href: TIME_CARD_PATHS.en, label: 'Time card calculator for a whole week' },
        ],
      },
    ],
  },
  es: {
    title: 'Convertidor de Hora Militar: de 12 a 24 Horas',
    description:
      'Convierte cualquier hora a hora militar y al revés: 1500 son las 3:00 p. m., las quince horas. Escribe 3:00 p. m. o 1500 y ve los dos formatos.',
    kicker: 'Convertidor de hora · gratis',
    h1: 'Convertidor de hora militar',
    lead: 'Escribe una hora como quieras, 3:00 p. m. o 1500, y obtén los dos formatos y cómo se lee. La hora militar es el formato de 24 horas escrito con cuatro cifras y sin dos puntos: después del mediodía las horas siguen contando, de 13 a 23, así que no hay a. m. ni p. m. que confundir en un horario.',
    input: 'Hora, en formato de 12 o de 24 horas',
    hint: 'Ejemplos: 1500, 0730, 7:30 p. m., 12 a. m. Escribe 2400 para la medianoche que cierra un día.',
    invalid: 'Escribe una hora como 1500, 0730 o 7:30 p. m.',
    figureLabel: 'Hora militar y hora de 12 horas',
    labels: {
      twelve: 'Formato de 12 horas',
      colon: 'Formato de 24 horas con dos puntos',
      spoken: 'Cómo se lee',
    } satisfies Record<ResultKey, string>,
    breakdown: 'La hora en cada formato',
    timePage: (time: MilitaryTime): string => time.military,
    sections: (table: string[][]): LongTailSection[] => [
      {
        id: 'how-to-convert',
        heading: 'Cómo pasar del formato de 12 horas a la hora militar',
        paragraphs: [
          'La hora militar cuenta las horas del día de 00 a 23 y las escribe con los minutos en cuatro cifras. La mañana conserva sus cifras; la tarde y la noche suman 12 a la hora, así que el reloj no vuelve a empezar al mediodía.',
        ],
        steps: [
          'De 1:00 a. m. a 11:59 a. m., deja las cifras y agrega un cero delante si la hora es menor que 10: 7:30 a. m. es 0730.',
          'De 12:00 a. m. a 12:59 a. m., la hora después de la medianoche es la hora 00: 12:45 a. m. es 0045.',
          'De 12:00 p. m. a 12:59 p. m., el mediodía conserva su 12: 12:30 p. m. es 1230.',
          'De 1:00 p. m. a 11:59 p. m., suma 12 a la hora: 7:45 p. m. es 7 + 12 = 1945.',
        ],
        table: {
          caption: 'Horas comunes convertidas con el motor de esta página',
          head: ['Formato de 12 horas', 'Hora militar', 'Cómo se lee'],
          rows: table,
        },
      },
      {
        id: 'how-to-convert-back',
        heading: 'Cómo pasar de la hora militar al formato de 12 horas',
        paragraphs: [
          'Lee las dos primeras cifras como la hora y las dos últimas como los minutos, y lleva la hora a una esfera de 12 horas.',
        ],
        steps: [
          'Hora 00: escribe 12 y a. m.: 0015 es 12:15 a. m.',
          'Horas 01 a 11: quita el cero inicial y escribe a. m.: 0930 es 9:30 a. m.',
          'Hora 12: déjala igual y escribe p. m.: 1215 es 12:15 p. m.',
          'Horas 13 a 23: resta 12 y escribe p. m.: 1845 es 18 − 12 = 6:45 p. m.',
        ],
      },
      {
        id: 'how-it-is-said',
        heading: 'Cómo se lee la hora militar',
        paragraphs: [
          'En español la hora de 24 horas se lee con el número de la hora: 1500 son «las quince horas» y 1345, «las trece horas y cuarenta y cinco minutos». En estilo militar o de radio se dicen las cifras de dos en dos, «quince cero cero» o «trece cuarenta y cinco».',
          'En inglés, el idioma del que viene el nombre, 1500 se dice «fifteen hundred hours» y 0800 «zero eight hundred hours»: el cero inicial también se pronuncia.',
        ],
      },
      {
        id: 'midnight',
        heading: 'La medianoche: 0000 o 2400',
        paragraphs: [
          'La medianoche tiene dos nombres. 0000 es la medianoche que empieza un día y 2400 es el mismo instante escrito como el final del día anterior. Un turno de 1600 a 2400 termina a la medianoche; el siguiente empieza a las 0000. No existe 2401: un minuto después de la medianoche es 0001.',
          'El mediodía es 1200, las doce horas, y 12:00 p. m. en el formato de 12 horas.',
        ],
        links: [
          {
            href: MILITARY_CHART_PATHS.es,
            label: 'Tabla de hora militar: cada hora del día',
          },
        ],
      },
      {
        id: 'related',
        heading: 'Horas entre dos horas militares',
        paragraphs: [
          'Para contar las horas de un turno escrito en formato de 24 horas, como 0700 a 1530, escribe las dos horas en la calculadora de horas; lee 15:30 y 1530 igual.',
        ],
        links: [{ href: HOURS_PATHS.es, label: 'Calculadora de horas y minutos' }],
      },
    ],
  },
} as const;

/** The converter page in `lang`: its head, its no-script result for the default, its sections. */
export const converterOf = (lang: Lang) => {
  const w = WORDS[lang];
  const time = timeOf(CONVERTER_DEFAULT);
  const result = resultOf(time, lang);
  const table = [...EXAMPLES, ...MORE].map((text) => {
    const each = timeOf(text);
    const values = resultOf(each, lang).values;
    return [values.twelve, each.military, values.spoken];
  });
  return {
    title: titleOf(w.title),
    description: w.description,
    kicker: w.kicker,
    h1: w.h1,
    lead: w.lead,
    input: w.input,
    hint: w.hint,
    invalid: w.invalid,
    figureLabel: w.figureLabel,
    breakdown: w.breakdown,
    paths: MILITARY_CONVERTER_PATHS,
    result: {
      figure: result.figure,
      rows: (Object.keys(w.labels) as ResultKey[]).map((key) => ({
        key,
        label: w.labels[key],
        value: result.values[key],
      })),
    },
    sections: w.sections(table),
  };
};
