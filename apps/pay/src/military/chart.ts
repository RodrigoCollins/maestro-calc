import {
  militaryTimeOf,
  readTime,
  US_ZONES,
  type MilitaryTime,
  type UsZone,
} from '@maestro-calc/pay-core/military-time';
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

const DAY = 1440;

/** A 12-hour time the chart reads, through the converter's own parser. */
const timeOf = (text: string): MilitaryTime => {
  const time = readTime(text);
  if (time === null) throw new Error(`the chart cannot read ${text}`);
  return time;
};

const at = (minutes: number): MilitaryTime => militaryTimeOf(((minutes % DAY) + DAY) % DAY);

/** One row an hour, the four quarter hours across: `1 PM | 1300 | 1315 | 1330 | 1345`. */
const quarterRows = (): string[][] =>
  HOURS.map((start) => {
    const { twelve } = militaryTimeOf(start);
    return [
      `${String(twelve.hour)} ${twelve.meridiem.toUpperCase()}`,
      ...[0, 15, 30, 45].map((quarter) => militaryTimeOf(start + quarter).military),
    ];
  });

/**
 * The military letters of the time zones: Z for UTC, A to M (J left out) for the hours east of
 * it, N to Y for the hours west, each said in the NATO alphabet.
 */
const WEST = ['N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y'] as const;
const NATO: Readonly<Record<string, string>> = {
  N: 'November',
  O: 'Oscar',
  P: 'Papa',
  Q: 'Quebec',
  R: 'Romeo',
  S: 'Sierra',
  T: 'Tango',
  U: 'Uniform',
  V: 'Victor',
  W: 'Whiskey',
  X: 'X-ray',
  Y: 'Yankee',
};

/** The letter of a zone `offset` hours west of UTC (−1 to −12). */
const letterOf = (offset: number): string => {
  const letter = WEST[-offset - 1];
  if (letter === undefined) throw new Error(`no military letter for UTC${String(offset)}`);
  return letter;
};

/** `UTC−5 · R (Romeo)`. */
const zoneCell = (offset: number): string => {
  const letter = letterOf(offset);
  return `UTC−${String(-offset)} · ${letter} (${NATO[letter] ?? letter})`;
};

const ZONE_NAMES: Readonly<Record<UsZone['id'], string>> = {
  ET: 'Eastern Time (ET)',
  CT: 'Central Time (CT)',
  MT: 'Mountain Time (MT)',
  PT: 'Pacific Time (PT)',
  AKT: 'Alaska Time (AKT)',
  HT: 'Hawaii Time (HT)',
};

const zoneRows = (): string[][] =>
  US_ZONES.map((zone) => [
    ZONE_NAMES[zone.id],
    zoneCell(zone.standard),
    zone.daylight ? zoneCell(zone.standard + 1) : 'No daylight time',
  ]);

/** One moment, 3:45 PM Eastern Standard Time, in every form the chart compares. */
const ZULU_EXAMPLE = timeOf('3:45 pm');
const EASTERN = US_ZONES[0];

/** The moment `time` Eastern in Zulu time: UTC, 5 hours ahead in winter, 4 in summer. */
const zuluOf = (time: MilitaryTime, season: 'standard' | 'daylight'): string => {
  const offset = (EASTERN?.standard ?? -5) + (season === 'daylight' ? 1 : 0);
  return `${at(time.minutes - offset * 60).military}Z`;
};

const zuluRows = (): string[][] => {
  const time = ZULU_EXAMPLE;
  const letter = letterOf(EASTERN?.standard ?? -5);
  return [
    ['12-hour clock', time.twelveText, 'three forty-five PM', 'Everyday US use'],
    ['24-hour clock', time.colon, 'fifteen forty-five', 'Most of the world, phones, software'],
    ['Military time', time.military, `${time.spoken} (hours)`, 'Armed forces, hospitals, police'],
    [
      'Military, with the zone',
      `${time.military}${letter}`,
      `${time.spoken} ${NATO[letter] ?? letter}`,
      'Orders that name the local zone',
    ],
    [
      'Zulu time (UTC)',
      zuluOf(time, 'standard'),
      `${at(time.minutes + 300).spoken} Zulu`,
      'Aviation, the military across zones',
    ],
  ];
};

/** The answer to "what is `text` in military time", from the engine. */
const toMilitary = (text: string): string => {
  const time = timeOf(text);
  return `${time.twelveText} is ${time.military}, said "${time.spoken}".`;
};

/** The answer to "what time is `digits`", from the engine. */
const fromMilitary = (digits: string): string => {
  const time = timeOf(digits);
  return `${time.military} is ${time.twelveText}, said "${time.spoken}".`;
};

const MISTAKES = (): string[] => {
  const half = timeOf('12:30 am');
  const noon = timeOf('12:45 pm');
  const early = timeOf('7:30 am');
  return [
    `Writing the half hour after midnight as 1230. The hour after midnight is hour 00, so ${half.twelveText} is ${half.military}; 1230 is 12:30 PM, half past noon.`,
    `Adding 12 to the noon hour. Only 1 PM to 11 PM take 12 more: ${noon.twelveText} is ${noon.military}, not 2445, which does not exist.`,
    `Dropping the leading zero. Military time always has four digits: ${early.twelveText} is ${early.military}, not 730.`,
    'Adding a colon or PM. 1500 needs neither: 15:00 is the civilian 24-hour form, and "1500 PM" says the afternoon twice.',
    'Starting a day at 2400. 2400 only ends a day; the minute after midnight is 0001, and there is no 2401 or 2430.',
    'Saying "one thousand five hundred". The first two digits are the hour, said as one number: 1500 is "fifteen hundred".',
    'Taking 12 off a morning hour. Only hours 13 to 23 lose 12: 1100 is 11:00 AM and 0900 is 9:00 AM.',
  ];
};

const FAQ = (): { question: string; answer: string }[] => [
  {
    question: 'What is 7 PM in military time?',
    answer: `${toMilitary('7:00 pm')} Add 12 to any hour from 1 PM to 11 PM: 7 + 12 = 19.`,
  },
  {
    question: 'What time is 1800 in military time?',
    answer: `${fromMilitary('1800')} Take 12 off any hour from 13 to 23: 18 − 12 = 6.`,
  },
  {
    question: 'What is 12 AM in military time?',
    answer: `${toMilitary('12:00 am')} 12 AM is midnight, the start of the day, so its hour is 00.`,
  },
  {
    question: 'What is 12 PM in military time?',
    answer: `${toMilitary('12:00 pm')} 12 PM is noon and keeps its 12; nothing is added.`,
  },
  {
    question: 'Is midnight 0000 or 2400?',
    answer:
      'Both name the same instant: 0000 is the midnight that starts a day and 2400 the one that ends it, so a shift from 1600 to 2400 ends at midnight and the next starts at 0000.',
  },
  {
    question: 'Is military time the same as 24-hour time?',
    answer:
      'It is the same clock written another way: military time drops the colon (1545, not 15:45), says the full hours with "hundred", and may add a time zone letter, as 1545R for Eastern Standard Time.',
  },
  {
    question: 'What does Zulu time mean?',
    answer: `Zulu is the military name of UTC, the letter Z said in the NATO alphabet. 3:45 PM Eastern Standard Time is ${zuluOf(ZULU_EXAMPLE, 'standard')}, and ${zuluOf(ZULU_EXAMPLE, 'daylight')} when Eastern Daylight Time is in force.`,
  },
  {
    question: 'How do I count the hours between two military times?',
    answer:
      'Subtract the start from the end in hours and minutes: 1730 − 0900 is 8 hours 30 minutes. If the end is smaller, the span crosses midnight, so add 2400 to the end first: 0600 − 2200 becomes 3000 − 2200, 8 hours.',
  },
];

const WORDS = {
  en: {
    title: 'Military Time Chart: 24-Hour Clock Conversion Table',
    description:
      'Military time chart: every hour and every 15 minutes from 0000 to 2345 next to 12-hour time, how to say each, Zulu time, US zone letters and common mistakes.',
    kicker: 'Time chart · free',
    h1: 'Military time chart',
    lead: 'Every hour of the day on the 24-hour military clock beside the 12-hour clock, with the way each one is said, then a printable grid of every quarter hour. Only the hour changes between the two clocks: the minutes stay as they are, so 1345 is 1:45 PM.',
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
        id: 'quarter-hours',
        heading: 'Every 15 minutes, a chart to print',
        paragraphs: [
          'Each row is one hour of the 12-hour clock and each column a quarter of it, so the 96 times of a schedule fit on one page. Find the hour on the left and read across: 3 PM and 45 minutes is 1545.',
        ],
        table: {
          caption: 'Military time every 15 minutes, 0000 to 2345',
          head: ['Hour', ':00', ':15', ':30', ':45'],
          rows: quarterRows(),
        },
        after: [
          'Print it from your browser: the page prints as the tables and their text, without the menus.',
        ],
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
        id: 'said',
        heading: 'How to say military time aloud',
        paragraphs: ['Five rules cover every time of the day:'],
        steps: [
          'Say the four digits as two numbers, the hour and then the minutes: 1545 is "fifteen forty-five".',
          'On the hour, say "hundred" for the minutes: 1500 is "fifteen hundred", and "fifteen hundred hours" in full.',
          'Say every leading zero, as "zero" or as "oh": 0730 is "zero seven thirty" or "oh seven thirty", and 0005 is "zero zero zero five".',
          '"Hours" is optional in speech: "fifteen forty-five" and "fifteen forty-five hours" are both heard, and a written schedule may add it too, as "1545 hours".',
          'Never read the digits as one large number: 1500 is not "one thousand five hundred", and 2000 is "twenty hundred", not "two thousand".',
        ],
      },
      {
        id: 'zulu',
        heading: 'Military time vs 24-hour time vs Zulu time',
        paragraphs: [
          'The three share one 24-hour clock and differ in how it is written and which zone it names. Military time is the 24-hour clock with no colon; Zulu time is that clock set to UTC, the time of the prime meridian, so a unit spread across zones reads one time.',
        ],
        table: {
          caption: 'One moment, 3:45 PM Eastern Standard Time, in each form',
          head: ['Form', 'Written', 'Said', 'Where it is used'],
          rows: zuluRows(),
        },
        after: [
          `In summer, when Eastern Daylight Time is 4 hours behind UTC, the same 3:45 PM is ${zuluOf(ZULU_EXAMPLE, 'daylight')}. Juliet, the letter J, means the local time wherever you are.`,
        ],
      },
      {
        id: 'zone-letters',
        heading: 'Military time zone letters for the US',
        paragraphs: [
          'Each hour west of UTC has a letter, from N (UTC−1) to Y (UTC−12), said in the NATO alphabet. The US zones take the letters of their offsets, which move one letter in daylight time.',
        ],
        table: {
          caption: 'The US time zones with their military letters',
          head: [
            'Time zone',
            'Standard time, November to March',
            'Daylight time, March to November',
          ],
          rows: zoneRows(),
        },
        after: [
          'Arizona, outside the Navajo Nation, keeps Mountain Standard Time all year, T (Tango).',
        ],
      },
      {
        id: 'midnight',
        heading: 'Midnight and noon: 0000, 2400 and 1200',
        paragraphs: [
          'Midnight is written 0000 at the start of a day and 2400 at the end of one: the same instant, two names. A day runs from 0000 to 2359, so 2400 appears only as an end time, as in a shift from 1600 to 2400. Noon is 1200, said "twelve hundred hours", and it is 12:00 PM, not AM.',
        ],
      },
      {
        id: 'mistakes',
        heading: 'Common military time mistakes',
        paragraphs: [
          'The errors that put a shift or a dose at the wrong hour, and the right form:',
        ],
        steps: MISTAKES(),
      },
      {
        id: 'faq',
        heading: 'Military time questions',
        paragraphs: [],
        questions: FAQ(),
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
          'For a time not on the chart, such as 1847 or 6:12 AM, type it into the converter; it reads either clock. For a shift written in military time, such as 0700 to 1530, the hours calculator and the time card read the 24-hour clock too.',
        ],
        links: [
          { href: MILITARY_CONVERTER_PATHS.en, label: 'Military time converter' },
          { href: HOURS_PATHS.en, label: 'Hours calculator: the time between two times' },
          { href: TIME_CARD_PATHS.en, label: 'Time card calculator for a whole week' },
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
