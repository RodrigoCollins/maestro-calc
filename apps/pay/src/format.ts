import { toCents, toDecimalParts, type Money, type Rational } from '@maestro-calc/core';

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

/** A time of day as the field shows it, `7:00 am`; no time is an empty field. */
export const clockFieldText = (minutes: number | null): string => {
  if (minutes === null) return '';
  const hour = Math.floor(minutes / 60);
  const clock = hour % 12 === 0 ? 12 : hour % 12;
  return `${String(clock)}:${String(minutes % 60).padStart(2, '0')} ${hour < 12 ? 'am' : 'pm'}`;
};
