import {
  Rational,
  toCents,
  toDecimalParts,
  valueIn,
  type Money,
  type Quantity,
  type Unit,
} from '@maestro-calc/core';

/*
 * The text of every number the calculator page shows. Pure and language-free: `,` groups thousands
 * and `.` marks decimals in both locales (no `Intl`), so the build-time render and the script write
 * the same strings. Words arrive as arguments (templates), never from a catalog.
 */

/** `1234567` as `1,234,567`. */
export const groupedInteger = (value: bigint): string =>
  String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/** `value` rounded to `places` decimals (ties away from zero), with the integer part grouped on request. */
const decimalText = (value: Rational, places: number, grouped: boolean): string => {
  const { negative, integer, fraction } = toDecimalParts(value, places);
  const whole = grouped ? groupedInteger(integer) : String(integer);
  return `${negative ? '-' : ''}${whole}${places === 0 ? '' : `.${fraction}`}`;
};

/** A volume in `unit` with two decimal places, for display only: `370,370.37`. */
export const volumeText = (volume: Quantity<'volume'>, unit: Unit<'volume'>): string =>
  decimalText(valueIn(volume, unit), 2, true);

/** Dollars rounded to the cent for display only: `$481.00`, `-$5.00`. */
export const moneyText = (money: Money): string => {
  const { negative, integer, fraction } = toCents(money);
  return `${negative ? '-' : ''}$${groupedInteger(integer)}.${fraction}`;
};

/** A percent as its canonical decimal: `10`, `12.5` (two places at most, no trailing zeros). */
export const percentText = (percent: Rational): string =>
  decimalText(percent, 2, false).replace(/\.?0+$/, '');

/** Replaces each `{name}` of `template` that `values` holds; other placeholders stay. */
export const fillMessage = (template: string, values: Readonly<Record<string, string>>): string =>
  template.replace(/\{(\w+)\}/g, (placeholder, name: string) => values[name] ?? placeholder);
