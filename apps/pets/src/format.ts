import { Rational, toDecimalParts } from '@maestro-calc/core';
import type { Civil } from '@maestro-calc/pets-core/dog-due-date';

/** Thousands grouped with commas: `22023` is `22,023`. */
const grouped = (integer: bigint): string =>
  integer.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/** An exact amount to `places` decimals, grouped: `2.74`, `985`, `1,235`. */
export const amountText = (value: Rational, places = 0): string => {
  const { negative, integer, fraction } = toDecimalParts(value, places);
  return `${negative ? '-' : ''}${grouped(integer)}${places > 0 ? `.${fraction}` : ''}`;
};

/** Kilocalories to the whole number, grouped. */
export const kcalText = (value: Rational): string => amountText(value, 0);

/**
 * Cups to the nearest quarter, the unit of a measuring set; an amount that rounds to nothing is a
 * quarter cup at least (the exact figure sits beside it on the page).
 */
export const quarterCups = (cups: number): number =>
  cups === 0 ? 0 : Math.max(0.25, Math.round(cups * 4) / 4);

const FRACTIONS: Readonly<Record<number, string>> = { 0.25: '¼', 0.5: '½', 0.75: '¾' };

/** Cups written as whole cups and a quarter, half or three quarters: `2 ¾`, `½`, `1`. */
export const cupsText = (cups: number): string => {
  const whole = Math.floor(cups);
  const fraction = FRACTIONS[cups - whole];
  return [whole === 0 && fraction !== undefined ? '' : String(whole), fraction]
    .filter((part) => part !== undefined && part !== '')
    .join(' ');
};

/** A weight as the page states it: `40 lb`, `4.5 kg`, the zeros after the point left out. */
export const weightText = (weight: Rational, unit: 'lb' | 'kg'): string =>
  `${amountText(weight, 2).replace(/\.?0+$/, '')} ${unit}`;

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

/** A date in English, month first: `Apr 28, 2026`. */
export const dateText = ({ year, month, day }: Civil): string =>
  `${MONTHS[month - 1] ?? ''} ${String(day)}, ${String(year)}`;
