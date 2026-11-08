import { Rational, toDecimalParts } from '@maestro-calc/core';

/** Thousands grouped with commas: `22023` is `22,023`. */
const grouped = (integer: bigint): string =>
  integer.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/** An exact amount to `places` decimals, grouped: `20.8`, `5,000`, `13,000`. */
export const amountText = (value: Rational, places = 0): string => {
  const { negative, integer, fraction } = toDecimalParts(value, places);
  return `${negative ? '-' : ''}${grouped(integer)}${places > 0 ? `.${fraction}` : ''}`;
};

/** An amount as a field holds it: two decimals at most, no trailing zeros, no grouping. */
export const fieldText = (value: Rational): string =>
  amountText(value, 2)
    .replace(/\.?0+$/, '')
    .replaceAll(',', '');

/** A low and a high figure as one: `10–15`, or a single `0` when both ends are the same. */
export const rangeText = (low: string, high: string): string =>
  low === high ? low : `${low}–${high}`;

/** The word for `count` of a thing: `bag` for one, `bags` for any other number. */
export const pluralOf = (count: bigint, one: string, many: string): string =>
  count === 1n ? one : many;
