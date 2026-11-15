import { Rational } from '@maestro-calc/core';
import { amountText } from '../format.ts';

/**
 * The narrow no-break space the Spanish pages write between thousands from five digits up, as the
 * Ortografía de la RAE (2010) recommends for every Spanish-speaking country: `12 345`, but `1235`.
 */
export const THOUSANDS_ES = '\u202f';

/** An English figure (`1,234.56`) with the Spanish marks: a decimal comma, `1234,56`. */
const spanish = (english: string): string => {
  const [integer = '', fraction] = english.split('.');
  const digits = integer.replaceAll(',', '');
  const whole =
    digits.replace('-', '').length < 5
      ? digits
      : digits.replace(/\B(?=(\d{3})+(?!\d))/g, THOUSANDS_ES);
  return fraction === undefined ? whole : `${whole},${fraction}`;
};

/** An exact amount to `places` decimals, Spanish style: `2,7`, `985`, `1235`, `12 345`. */
export const amountEs = (value: Rational, places = 0): string => spanish(amountText(value, places));

/** A count as a page writes it: to the tenth below 10 (without a trailing `,0`), whole above. */
export const countEs = (count: Rational): string =>
  count.compare(Rational.of(10)) === -1
    ? amountEs(count, 1).replace(/,0$/, '')
    : amountEs(count, 0);

/** Grams as a page writes them: `4,9 g`, `9 g`, `109 g`. */
export const gramsEs = (grams: Rational): string => `${countEs(grams)} g`;

/** A dog's weight in kilograms: `35 kg`. */
export const kgEs = (kg: number): string => `${String(kg)} kg`;

/** A share in percent with a space before the sign: `64 %`, and to the tenth below 10: `2,2 %`. */
export const percentEs = (share: Rational): string => `${countEs(share.mul(Rational.of(100)))} %`;
