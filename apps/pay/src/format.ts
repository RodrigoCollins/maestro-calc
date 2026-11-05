import { Rational, toCents, toDecimalParts, type Money } from '@maestro-calc/core';

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
