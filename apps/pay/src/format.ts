import { Rational, toCents, toDecimalParts, type Money } from '@maestro-calc/core';
import type { Lang } from './time-card/receipt.ts';

const SIXTY = Rational.of(60);

/** Thousands grouped with commas: `1234567` is `1,234,567`. */
const grouped = (integer: bigint): string =>
  integer.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/** Dollars and cents, US style in both languages: `$1,193.50`. */
export const moneyText = (money: Money): string => {
  const { negative, integer, fraction } = toCents(money);
  return `${negative ? '-' : ''}$${grouped(integer)}.${fraction}`;
};

/** Hours to two places at most, trailing zeros dropped: `49.5`, `40`, `8.25`. */
export const hoursText = (hours: Rational): string => {
  const { integer, fraction } = toDecimalParts(hours, 2);
  const trimmed = fraction.replace(/0+$/, '');
  return trimmed === '' ? grouped(integer) : `${grouped(integer)}.${trimmed}`;
};

/** A rate of hours per hour to four places at most, trailing zeros dropped: `0.0385`, `1`. */
export const rateText = (rate: Rational): string => {
  const { integer, fraction } = toDecimalParts(rate, 4);
  const trimmed = fraction.replace(/0+$/, '');
  return trimmed === '' ? grouped(integer) : `${grouped(integer)}.${trimmed}`;
};

/** Decimal hours as a time card writes them, always two places, to the nearest: `8.33`, `8.00`. */
export const decimalHoursText = (hours: Rational): string => {
  const { integer, fraction } = toDecimalParts(hours, 2);
  return `${grouped(integer)}.${fraction}`;
};

/** Hours as hours and whole minutes, to the nearest minute, in both languages: `8 h 15 min`. */
export const hoursMinutesText = (hours: Rational): string => {
  const minutes = toDecimalParts(hours.mul(SIXTY), 0).integer;
  return `${grouped(minutes / 60n)} h ${String(minutes % 60n)} min`;
};

/** A time of day as the field shows it, `7:00 am`; no time is an empty field. */
export const clockFieldText = (minutes: number | null): string => {
  if (minutes === null) return '';
  const hour = Math.floor(minutes / 60);
  const clock = hour % 12 === 0 ? 12 : hour % 12;
  return `${String(clock)}:${String(minutes % 60).padStart(2, '0')} ${hour < 12 ? 'am' : 'pm'}`;
};

/** A short time of day for a printed card: `7:00a`, `4:30p`. */
const shortClock = (minutes: number): string => {
  const hour = Math.floor(minutes / 60);
  const clock = hour % 12 === 0 ? 12 : hour % 12;
  return `${String(clock)}:${String(minutes % 60).padStart(2, '0')}${hour < 12 ? 'a' : 'p'}`;
};

/** A shift as a printed card shows it, `7:00a–4:30p`; a day without both times is empty. */
export const shiftText = (start: number | null, end: number | null): string =>
  start === null || end === null ? '' : `${shortClock(start)}–${shortClock(end)}`;

/** The minus sign of a negative length of time: U+2212, not a hyphen. */
const MINUS = '\u2212';

/** A signed length of time in whole minutes as hours and minutes: `11 h 15 min`, `−1 h 25 min`. */
export const durationText = (minutes: number): string =>
  `${minutes < 0 ? MINUS : ''}${hoursMinutesText(Rational.of(Math.abs(minutes), 60))}`;

/** A signed length of time in whole minutes as decimal hours, to two places: `11.25`, `−1.42`. */
export const durationDecimalText = (minutes: number): string =>
  `${minutes < 0 ? MINUS : ''}${hoursText(Rational.of(Math.abs(minutes), 60))}`;

/** A time of day on the 24-hour clock, the way Spain writes it: `14:30`, `9:05`, `0:00`. */
export const clock24Text = (minutes: number): string => {
  const inDay = minutes % 1440;
  return `${String(Math.floor(inDay / 60))}:${String(inDay % 60).padStart(2, '0')}`;
};

/** A time of day on the 12-hour clock: `2:30 pm` in English, `2:30 p. m.` in Spanish (RAE). */
export const clock12Text = (minutes: number, lang: Lang): string => {
  const inDay = minutes % 1440;
  const hour = Math.floor(inDay / 60);
  const clock = `${String(hour % 12 === 0 ? 12 : hour % 12)}:${String(inDay % 60).padStart(2, '0')}`;
  const morning = hour < 12;
  if (lang === 'en') return `${clock} ${morning ? 'am' : 'pm'}`;
  return `${clock} ${morning ? 'a. m.' : 'p. m.'}`;
};

/**
 * A time of day for readers in Spain and in Mexico at once: the 24-hour clock with the 12-hour
 * one beside it, `14:30 (2:30 p. m.)`; when both read the same figures, the 12-hour one alone,
 * `9:05 a. m.`.
 */
export const clockBothText = (minutes: number): string => {
  const h24 = clock24Text(minutes);
  const h12 = clock12Text(minutes, 'es');
  return h12.startsWith(`${h24} `) ? h12 : `${h24} (${h12})`;
};
