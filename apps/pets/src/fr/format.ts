import { Rational } from '@maestro-calc/core';
import { amountText } from '../format.ts';

/** The narrow no-break space French writes between thousands: `1 235`. */
export const THOUSANDS_FR = '\u202f';

/** An English figure (`1,234.56`) with the French marks (`1 234,56`). */
const french = (english: string): string =>
  english.replace(/[.,]/g, (mark) => (mark === '.' ? ',' : THOUSANDS_FR));

/** An exact amount to `places` decimals, French style: `2,7`, `985`, `1 235`. */
export const amountFr = (value: Rational, places = 0): string => french(amountText(value, places));

/** A count as a page writes it: to the tenth below 10 (without a trailing `,0`), whole above. */
export const countFr = (count: Rational): string =>
  count.compare(Rational.of(10)) === -1
    ? amountFr(count, 1).replace(/,0$/, '')
    : amountFr(count, 0);

/** Grams as a page writes them: `4,9 g`, `9 g`, `109 g`. */
export const gramsFr = (grams: Rational): string => `${countFr(grams)} g`;

/** A dog's weight in kilograms: `35 kg`. */
export const kgFr = (kg: number): string => `${String(kg)} kg`;

/** A share in percent, French style with a space: `64 %`, and to the tenth below 10: `2,2 %`. */
export const percentFr = (share: Rational): string => `${countFr(share.mul(Rational.of(100)))} %`;
