import { Rational } from '@maestro-calc/core';
import { amountText } from '../format.ts';

/** An English figure (`1,234.56`) with the German marks (`1.234,56`). */
const german = (english: string): string =>
  english.replace(/[.,]/g, (mark) => (mark === '.' ? ',' : '.'));

/** An exact amount to `places` decimals, German style: `2,7`, `985`, `1.235`. */
export const amountDe = (value: Rational, places = 0): string => german(amountText(value, places));

/** A count as a page writes it: to the tenth below 10 (without a trailing `,0`), whole above. */
export const countDe = (count: Rational): string =>
  count.compare(Rational.of(10)) === -1
    ? amountDe(count, 1).replace(/,0$/, '')
    : amountDe(count, 0);

/** Grams as a page writes them: `4,9 g`, `9 g`, `109 g`. */
export const gramsDe = (grams: Rational): string => `${countDe(grams)} g`;

/** A dog's weight in kilograms: `35 kg`. */
export const kgDe = (kg: number): string => `${String(kg)} kg`;

/** A share in percent, German style with a space: `64 %`, and to the tenth below 10: `2,2 %`. */
export const percentDe = (share: Rational): string => `${countDe(share.mul(Rational.of(100)))} %`;

/** What a German visitor types (`3,5`) as the decimal the engine reads (`3.5`). */
export const rawDecimal = (typed: string): string => typed.trim().replace(',', '.');
