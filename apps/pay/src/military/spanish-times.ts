import { Rational } from '@maestro-calc/core';
import { militaryTimeOf, type MilitaryTime } from '@maestro-calc/pay-core/military-time';
import { hoursMinutesText } from '../format.ts';
import { nearestOf } from '../long-tail/nearest.ts';
import type { LongTailSection, LongTailSource } from '../long-tail/sections.ts';
import { titleOf } from '../seo/meta.ts';
import { converterOf } from './converter.ts';
import {
  MILITARY_CHART_PATHS,
  MILITARY_CONVERTER_PATHS,
  militaryPathOf,
  SPANISH_TIMES,
  spanishPathOf,
  type MilitaryTimeJob,
} from './routes.ts';
import { spanishNumber, spokenEs, twelveOf } from './words.ts';

/*
 * The Spanish page of one time of the 24-hour clock, "qué hora son las 19 horas", the twin of its
 * English military time page: the 12-hour time and how it is said, the words Mexico, Spain and
 * Argentina use for it, the minutes of that hour read aloud, the hours before and after, and the
 * change from the 12-hour clock worked out. Every time is the engine's; `MilitaryTimePage.astro`
 * renders it.
 */

const DAY = 1440;
const NOON = 720;

const at = (minutes: number): MilitaryTime => militaryTimeOf(((minutes % DAY) + DAY) % DAY);

/** Where the afternoon ends: the first hour each country calls night (approximately). */
type Country = 'general' | 'mexico' | 'spain' | 'argentina';
const NIGHT_FROM: Readonly<Record<Country, number>> = {
  general: 20,
  mexico: 19,
  spain: 21,
  argentina: 20,
};

/** The part of the day a time is said in: `de la tarde`, `de la noche`, `del mediodía`. */
const partOf = (hour: number, country: Country = 'general'): string => {
  if (hour === 0) return 'de la noche';
  if (hour < 6) return 'de la madrugada';
  if (hour < 12) return 'de la mañana';
  if (hour === 12) return 'del mediodía';
  return hour < NIGHT_FROM[country] ? 'de la tarde' : 'de la noche';
};

/** The hour of the 12-hour clock with its article: `la 1`, `las 7`. */
const hourOf = (twelveHour: number): string =>
  `${twelveHour === 1 ? 'la' : 'las'} ${String(twelveHour)}`;

/** How a time on the hour or the half hour is said: `las 7 de la tarde`, `las 6 y media de la tarde`. */
const saidOf = (time: MilitaryTime, country: Country = 'general'): string =>
  `${hourOf(time.twelve.hour)}${time.minute === 30 ? ' y media' : ''} ${partOf(time.hour, country)}`;

/** The name of the time as it is searched: `las 19 horas`, `las 18:30 horas`, `las 00 horas`. */
const nameOf = (time: MilitaryTime): string =>
  `las ${time.minute === 0 ? time.military.slice(0, 2) : time.colon} horas`;

const capital = (text: string): string => `${text.charAt(0).toUpperCase()}${text.slice(1)}`;

/** The minutes of a time said in Spain and Argentina, then in Mexico: `las 8 menos cuarto`. */
const minuteWordsOf = (time: MilitaryTime): [string, string] => {
  const { minute } = time;
  const hour = hourOf(time.twelve.hour);
  if (minute === 0) return [`${hour} en punto`, `${hour} en punto`];
  if (minute <= 30) {
    const words = minute === 15 ? 'cuarto' : minute === 30 ? 'media' : spanishNumber(minute);
    return [`${hour} y ${words}`, `${hour} y ${words}`];
  }
  const left = 60 - minute;
  const next = hourOf(at(time.minutes + left).twelve.hour);
  const words = left === 15 ? 'cuarto' : spanishNumber(left);
  return [`${next} menos ${words}`, `${left === 15 ? 'un cuarto' : words} para ${next}`];
};

/** The time in the military reading, the digits in pairs: `diecinueve cero cero`. */
const pairsOf = ({ military }: MilitaryTime): string =>
  [military.slice(0, 2), military.slice(2)]
    .map((pair) => (pair === '00' ? 'cero cero' : spanishNumber(Number(pair))))
    .join(' ');

/** How the time is written in each country. */
const writtenOf = (time: MilitaryTime, country: Exclude<Country, 'general'>): string => {
  const { colon, minute } = time;
  if (country === 'mexico') return `${colon} h · ${twelveOf(time, 'es')}`;
  if (country === 'spain') return `${colon} h o ${colon.replace(':', '.')} h`;
  return `${minute === 0 ? `${time.military.slice(0, 2)} h` : `${colon} h`} o ${colon} hs`;
};

const COUNTRIES = [
  ['México', 'mexico'],
  ['España', 'spain'],
  ['Argentina', 'argentina'],
] as const;

/** The words of each country for the time, and how it is read in a schedule and on the radio. */
const countriesOf = (time: MilitaryTime): LongTailSection => {
  const name = nameOf(time);
  const { hour } = time;
  const same = hour === 0 || hour === 12 || hour < 19 || hour > 20;
  const paragraph = same
    ? hour === 0 || hour === 12
      ? `A ${name} se les dice igual en los tres países, ${saidOf(time)}; lo que cambia es cómo se escribe.`
      : `A ${name} se les dice igual en los tres países, ${saidOf(time, 'mexico')}: ${hour < 19 ? 'en todos todavía es de tarde' : 'en todos ya es de noche'}. Cambia cómo se escribe.`
    : `Las tres formas dan la misma hora; cambia hasta cuándo se llama «tarde». En México la noche suele empezar hacia las 19 horas, en Argentina hacia las 20 y en España hacia las 21, así que ${name} son ${saidOf(time, 'mexico')} en México y ${saidOf(time, 'spain')} en España.`;
  return {
    id: 'countries',
    heading: `Cómo se dice ${name} en México, España y Argentina`,
    paragraphs: [paragraph],
    table: {
      caption: `${capital(name)} en tres países`,
      head: ['País', 'Cómo se dice', 'Cómo se escribe'],
      rows: COUNTRIES.map(([label, country]) => [
        label,
        saidOf(time, country),
        writtenOf(time, country),
      ]),
    },
    after: [
      `En un horario, un aviso o la radio se lee con el número de la hora: «${spokenEs(time)}». En estilo militar se dicen las cifras de dos en dos: «${pairsOf(time)}». La «h» va sin punto y separada por un espacio: ${time.colon} h.`,
    ],
  };
};

/** The minutes of the hour, every five, or the odd minutes of the second half hour. */
const minutesOf = (time: MilitaryTime): LongTailSection => {
  const { hour, minute } = time;
  const name = nameOf(time);
  const meridiem = twelveOf(time, 'es').replace(/^[\d:]+ /, '');
  const offsets =
    minute === 0 ? Array.from({ length: 12 }, (_, i) => i * 5) : [0, 3, 8, 12, 17, 22, 28];
  const rows = offsets.map((offset) => {
    const each = at(time.minutes + offset);
    return [each.colon, twelveOf(each, 'es'), ...minuteWordsOf(each)];
  });
  const example = minute === 0 ? at(time.minutes + 45) : at(time.minutes + 12);
  const [spain, mexico] = minuteWordsOf(example);
  const next = at(time.minutes + 60 - minute);
  const twelveHour = hourOf(time.twelve.hour);
  return {
    id: 'minutes',
    heading: minute === 0 ? `Los minutos de ${name}` : `Los minutos de ${name} a ${nameOf(next)}`,
    paragraphs: [
      minute === 0
        ? `De las ${time.colon} a las ${time.military.slice(0, 2)}:59 la hora de 12 es siempre ${twelveHour} y algo ${meridiem}: los minutos no cambian entre los dos formatos. Pasada la media hora, en España y Argentina se cuenta lo que falta para la hora siguiente, «${spain}», y en México se dice «${mexico}».`
        : `En la segunda media hora de las ${String(hour)} se cuenta hacia ${nameOf(next)}, que son ${saidOf(next)}. Con un minuto suelto, como las ${example.colon}, en España y Argentina se dice «${spain}» y en México «${mexico}»; en un horario basta con ${example.colon} h.`,
    ],
    table: {
      caption:
        minute === 0
          ? `${capital(name)}, de cinco en cinco minutos`
          : `Minutos sueltos de las ${time.colon} a las ${next.colon}`,
      head: ['24 horas', '12 horas', 'En España y Argentina', 'En México'],
      rows,
    },
  };
};

const OFFSETS = [-3, -2, -1, 1, 2, 3];

/** The hours before and after the time, across midnight, and its distance from midnight. */
const aroundOf = (time: MilitaryTime): LongTailSection => {
  const name = nameOf(time);
  const rows = OFFSETS.map((offset) => {
    const moved = time.minutes + offset * 60;
    const each = at(moved);
    const day = moved < 0 ? ', del día anterior' : moved >= DAY ? ', del día siguiente' : '';
    const count = Math.abs(offset);
    return [
      `${String(count)} ${count === 1 ? 'hora' : 'horas'} ${offset < 0 ? 'antes' : 'después'}`,
      `${each.colon}${day}`,
      twelveOf(each, 'es'),
      saidOf(each),
    ];
  });
  const since = hoursMinutesText(Rational.of(time.minutes, 60));
  const until = hoursMinutesText(Rational.of(DAY - time.minutes, 60));
  return {
    id: 'around',
    heading: `Las horas antes y después de ${name}`,
    paragraphs: [
      `Sumar o restar horas en formato de 24 horas no necesita a. m. ni p. m.: se cuenta de 00 a 23 y, al pasar de 23, se vuelve a 00 en el día siguiente.`,
    ],
    table: {
      caption: `Tres horas antes y tres después de ${name}`,
      head: ['Cuándo', '24 horas', '12 horas', 'Cómo se dice'],
      rows,
    },
    after: [
      time.minutes === 0
        ? `${capital(name)} empiezan el día: faltan ${until} para la medianoche siguiente, que como final de este día se escribe 24:00.`
        : `De ${name} a la medianoche faltan ${until}, y desde la medianoche que empezó el día han pasado ${since}${time.minutes <= NOON ? '' : `, ${hoursMinutesText(Rational.of(time.minutes - NOON, 60))} de ellas después del mediodía`}.`,
    ],
  };
};

/** The change from the 12-hour clock to the 24-hour one and back, for the hour the time is in. */
const fromTwelveOf = (time: MilitaryTime): LongTailSection => {
  const { hour, colon, military } = time;
  const twelve = twelveOf(time, 'es');
  const name = nameOf(time);
  const minutes = `Deja los minutos, ${military.slice(2)}, como están: ${colon}, o ${military} en hora militar.`;
  const steps =
    hour === 0
      ? [
          `Toma la hora de ${twelve}: 12.`,
          'Es a. m. y es la hora 12, la de la medianoche: el 12 se vuelve 00.',
          minutes,
          `Al revés: la hora 00 se escribe 12 y lleva a. m., así que ${name} son las ${twelve}`,
        ]
      : hour === 12
        ? [
            `Toma la hora de ${twelve}: 12.`,
            'Es la hora del mediodía: el 12 se queda igual, sin sumar nada, aunque lleve p. m.',
            minutes,
            `Al revés: la hora 12 sigue siendo 12 y lleva p. m., así que ${name} son las ${twelve}`,
          ]
        : [
            `Toma la hora de ${twelve}: ${String(hour - 12)}.`,
            `Es p. m. y no es la hora 12, así que súmale 12: ${String(hour - 12)} + 12 = ${String(hour)}.`,
            minutes,
            `Al revés, de ${name} al formato de 12 horas: ${String(hour)} − 12 = ${String(hour - 12)} y se escribe p. m.: ${hourOf(hour - 12)}:${military.slice(2)} p. m.`,
          ];
  return {
    id: 'from-twelve',
    heading: `Cómo pasar de ${twelve} a ${name}`,
    paragraphs: [
      'Entre los dos formatos solo cambia la hora: la mañana conserva sus cifras, la medianoche es la hora 00 y la tarde y la noche suman 12.',
    ],
    steps,
  };
};

/** The lead: the answer, then why, then how it is written and read. */
const leadOf = (time: MilitaryTime, answer: string): string => {
  const { hour, minute, colon } = time;
  const name = capital(nameOf(time));
  const head = `${name} son ${answer} (${twelveOf(time, 'es')}).`;
  const read = `Se escribe ${colon} h y, en un horario o un aviso, se lee «${spokenEs(time)}».`;
  if (hour === 0)
    return minute === 0
      ? `${head} La hora 00 es la primera del día, la que el formato de 12 horas llama 12 a. m.; el mismo instante, como final del día anterior, se escribe 24:00. ${read}`
      : `${head} La hora 00 es la primera del día, la que el formato de 12 horas llama 12 a. m., y los minutos, ${String(minute)}, quedan igual. ${read}`;
  if (hour === 12)
    return `${head} La hora 12 es la misma en los dos formatos: no se suma ni se resta nada, y desde el mediodía se escribe p. m. ${read}`;
  return `${head} En el formato de 24 horas las horas siguen contando después del mediodía: ${String(hour)} − 12 = ${String(hour - 12)}, y los minutos quedan igual. ${read}`;
};

const SOURCES: readonly LongTailSource[] = [
  {
    label: 'Real Academia Española, Diccionario panhispánico de dudas: «hora»',
    href: 'https://www.rae.es/dpd/hora',
  },
];

export interface SpanishTimePage {
  readonly title: string;
  readonly description: string;
  readonly kicker: string;
  readonly h1: string;
  readonly lead: string;
  readonly figure: string;
  readonly figureLabel: string;
  readonly breakdown: string;
  readonly rows: readonly { readonly label: string; readonly value: string }[];
  readonly calculator: { readonly href: string; readonly label: string; readonly title: string };
  readonly note: string;
  readonly paths: { readonly en: string; readonly es: string };
  readonly sections: readonly LongTailSection[];
  readonly sources: readonly LongTailSource[];
  readonly others: {
    readonly heading: string;
    readonly links: readonly { readonly href: string; readonly label: string }[];
  };
}

/** The link to the page of a time: `Las 18 horas son las 6:00 p. m.`. */
const linkOf = (job: MilitaryTimeJob) => {
  const time = militaryTimeOf(job.minutes);
  const twelve = twelveOf(time, 'es');
  return {
    href: spanishPathOf(job),
    label: `${capital(nameOf(time))} son ${time.twelve.hour === 1 ? 'la' : 'las'} ${twelve}`,
  };
};

/** The Spanish page of one time, every figure from the engine at build time. */
export const spanishTimePageOf = (job: MilitaryTimeJob): SpanishTimePage => {
  const time = militaryTimeOf(job.minutes);
  const twelve = twelveOf(time, 'es');
  const name = nameOf(time);
  const said = saidOf(time);
  const answer = time.minutes === 0 ? `${said}, la medianoche` : said;
  const h1 = `${capital(name)} son ${answer}`;
  const full = `¿Qué hora son ${name}? ${capital(said)} (${twelve})`;
  return {
    title: titleOf(full.length <= 70 ? full : `¿Qué hora son ${name}? ${capital(said)}`),
    description: `${h1} (${twelve}). Cómo se dice en México, España y Argentina, sus minutos y cómo pasar de 12 a 24 horas.`,
    kicker: 'Formato de 24 horas',
    h1,
    lead: leadOf(time, answer),
    figure: twelve,
    figureLabel: `${capital(name)} en formato de 12 horas`,
    breakdown: `${capital(name)} en otros formatos`,
    rows: [
      { label: 'Cómo se dice', value: said },
      { label: 'Se escribe', value: `${time.colon} h` },
      { label: 'Hora militar', value: time.military },
    ],
    calculator: {
      href: MILITARY_CONVERTER_PATHS.es,
      label: 'Convierte otra hora',
      title: converterOf('es').title,
    },
    note: `En el convertidor, ${time.colon}, ${time.military} y ${twelve} dan el mismo resultado.`,
    paths: { en: militaryPathOf(job), es: spanishPathOf(job) },
    sections: [countriesOf(time), minutesOf(time), aroundOf(time), fromTwelveOf(time)],
    sources: SOURCES,
    others: {
      heading: 'Otras horas en formato de 24 horas',
      links: [
        ...nearestOf(SPANISH_TIMES, job).map(linkOf),
        { href: MILITARY_CHART_PATHS.es, label: 'Tabla de hora militar: cada hora del día' },
      ],
    },
  };
};

/** The list of every Spanish time page, which the Spanish chart and converter show. */
export const spanishTimesSectionOf = (): LongTailSection => ({
  id: 'spanish-times',
  heading: 'Cada hora de la tarde y de la noche, en su página',
  paragraphs: [
    'Cada página dice qué hora es en formato de 12 horas, cómo se dice en México, España y Argentina, sus minutos y las horas de antes y después.',
  ],
  links: SPANISH_TIMES.map((job) => {
    const time = militaryTimeOf(job.minutes);
    return { href: spanishPathOf(job), label: `${time.colon} · ${twelveOf(time, 'es')}` };
  }),
});

/** The sections of the Spanish chart or converter with that list before their last section. */
export const withSpanishTimes = (
  sections: readonly LongTailSection[],
): readonly LongTailSection[] => [
  ...sections.slice(0, -1),
  spanishTimesSectionOf(),
  ...sections.slice(-1),
];
