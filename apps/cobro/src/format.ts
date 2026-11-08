import { Rational, toCents, toDecimalParts, type Money } from '@maestro-calc/core';

/** Thousands grouped with commas: `1234567` is `1,234,567`. */
const grouped = (integer: bigint): string =>
  integer.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/** Dollars and cents, US style in both languages: `$1,193.50`. */
export const moneyText = (money: Money): string => {
  const { negative, integer, fraction } = toCents(money);
  return `${negative ? '-' : ''}$${grouped(integer)}.${fraction}`;
};

/** A number to `places` places at most, trailing zeros dropped: `8`, `3.5`, `1,500`. */
export const numberText = (value: Rational, places = 2): string => {
  const { integer, fraction } = toDecimalParts(value, places);
  const trimmed = fraction.replace(/0+$/, '');
  return trimmed === '' ? grouped(integer) : `${grouped(integer)}.${trimmed}`;
};

/** A number the way a field holds it: no grouping, so it reads back whole. */
export const fieldText = (value: Rational, places = 4): string =>
  numberText(value, places).replaceAll(',', '');

/** Dollars for a field: `25`, `38.5`, no sign and no grouping. */
export const dollarsFieldText = (money: Money): string => fieldText(money.amount, 2);

const MONTHS = {
  es: [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
  ],
  en: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
} as const;

/** A day (`2026-11-08`) as people write it: `8 de noviembre de 2026`, `November 8, 2026`. */
export const dateText = (iso: string, lang: 'es' | 'en'): string => {
  const [year = '', month = '', day = ''] = iso.split('-');
  const name = MONTHS[lang][Number(month) - 1];
  if (name === undefined) throw new Error(`not a day: ${iso}`);
  return lang === 'es'
    ? `${String(Number(day))} de ${name} de ${year}`
    : `${name} ${String(Number(day))}, ${year}`;
};
