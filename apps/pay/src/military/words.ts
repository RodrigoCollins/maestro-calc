import type { MilitaryTime } from '@maestro-calc/pay-core/military-time';
import type { Lang } from '../time-card/receipt.ts';

/*
 * The words of a time around the engine's figures, per language: the Spanish reading of the
 * 24-hour clock and the 12-hour time as each language writes it (`3:00 PM`, `3:00 p. m.`, the
 * RAE style the Spanish pages use). The converter's script imports this module, so it stays small.
 */

const UNITS = [
  'cero',
  'uno',
  'dos',
  'tres',
  'cuatro',
  'cinco',
  'seis',
  'siete',
  'ocho',
  'nueve',
  'diez',
  'once',
  'doce',
  'trece',
  'catorce',
  'quince',
  'dieciséis',
  'diecisiete',
  'dieciocho',
  'diecinueve',
  'veinte',
  'veintiuno',
  'veintidós',
  'veintitrés',
  'veinticuatro',
  'veinticinco',
  'veintiséis',
  'veintisiete',
  'veintiocho',
  'veintinueve',
] as const;
const TENS = ['', '', '', 'treinta', 'cuarenta', 'cincuenta'] as const;

/** A number from 0 to 59 in Spanish; `una` makes its one feminine, as before `hora`. */
export const spanishNumber = (value: number, one: 'uno' | 'una' = 'uno'): string => {
  const words =
    value < 30
      ? (UNITS[value] ?? '')
      : value % 10 === 0
        ? (TENS[Math.floor(value / 10)] ?? '')
        : `${TENS[Math.floor(value / 10)] ?? ''} y ${UNITS[value % 10] ?? ''}`;
  return one === 'una' ? words.replace(/uno$/, 'una') : words;
};

/**
 * How a time of the 24-hour clock is read in Spanish: `las quince horas`, `la una`, `las trece horas
 * y cuarenta y cinco minutos`.
 */
export const spokenEs = ({ hour, minute }: MilitaryTime): string => {
  const head = hour === 1 ? 'la una' : `las ${spanishNumber(hour, 'una')} horas`;
  return minute === 0 ? head : `${head} y ${spanishNumber(minute)} minutos`;
};

/** The 12-hour time as `lang` writes it: `3:00 PM`, `3:00 p. m.`. */
export const twelveOf = ({ twelve }: MilitaryTime, lang: Lang): string => {
  const clock = `${String(twelve.hour)}:${String(twelve.minute).padStart(2, '0')}`;
  if (lang === 'en') return `${clock} ${twelve.meridiem.toUpperCase()}`;
  return `${clock} ${twelve.meridiem === 'am' ? 'a. m.' : 'p. m.'}`;
};

/** The forms of a time the result lists, by the `data-mil` key the script fills. */
export type ResultKey = 'twelve' | 'colon' | 'spoken';

/** The figure and the rows of a time in `lang`: `1500 = 3:00 PM`, then each other form. */
export const resultOf = (time: MilitaryTime, lang: Lang) => ({
  figure: `${time.military} = ${twelveOf(time, lang)}`,
  values: {
    twelve: twelveOf(time, lang),
    colon: time.colon,
    spoken: lang === 'en' ? time.spoken : spokenEs(time),
  } satisfies Record<ResultKey, string>,
});
