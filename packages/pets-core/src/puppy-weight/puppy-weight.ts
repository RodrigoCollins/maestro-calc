import { decimalInput, defineCalculator, Rational, selectInput } from '@maestro-calc/core';
import { KG_PER_LB } from '../energy/energy.ts';

/**
 * The size classes of the table, by adult weight: small and medium breeds under 25 kg (the table
 * counts 25 kg in), large breeds over 25 kg up to 45 kg, giant breeds over 45 kg.
 */
export const PUPPY_SIZES = ['small', 'large', 'giant'] as const;

export type PuppySize = (typeof PUPPY_SIZES)[number];

/**
 * Table 1 of the WALTHAM pocket book of puppy nutrition and care, "Recommendations for growth rates
 * of various sizes of dogs. Adapted from NRC (2006)": the percentage of adult weight a puppy has
 * reached at each age in months. The table writes "Adult" where it stops (small and medium breeds
 * at 15 months, every size at 21); that is 100% here.
 */
export const SHARES = {
  months: [1, 2, 3, 4, 5, 6, 9, 12, 15, 18],
  small: [9, 22, 37, 52, 61, 70, 83, 95, 100, 100],
  large: [7, 20, 35, 48, 57, 65, 77, 88, 94, 100],
  giant: [6, 14, 26, 38, 49, 60, 70, 80, 90, 100],
} as const;

/** The first age of the table at which each size class is at its adult weight, in months. */
const GROWN_BY: Readonly<Record<PuppySize, number>> = { small: 15, large: 18, giant: 18 };

/** The adult weights of each class in kg: above the first, up to the second (`null`: no bound). */
const BANDS: Readonly<Record<PuppySize, readonly [Rational | null, Rational | null]>> = {
  small: [null, Rational.of(25)],
  large: [Rational.of(25), Rational.of(45)],
  giant: [Rational.of(45), null],
};

/** The classes either side of each, smallest first, the class itself included. */
const NEIGHBOURS: Readonly<Record<PuppySize, readonly [PuppySize, PuppySize]>> = {
  small: ['small', 'large'],
  large: ['small', 'giant'],
  giant: ['large', 'giant'],
};

const HUNDRED = Rational.of(100);

/** Weeks to months: a year is 52 weeks and 12 months. */
const MONTHS_PER_WEEK = Rational.of(12, 52);

/** Under this age, in weeks, the estimate leans hardest on the scale. */
const EARLY_WEEKS = Rational.of(12);

/** A row of the table: an age in months and the share of adult weight, as a fraction. */
interface Row {
  readonly month: Rational;
  readonly share: Rational;
}

const rowsOf = (size: PuppySize): readonly [Row, ...Row[]] => {
  const [month, ...months] = SHARES.months;
  const [share, ...shares] = SHARES[size];
  return [
    { month: Rational.of(month), share: Rational.of(share).div(HUNDRED) },
    ...months.map((each, row) => ({
      month: Rational.of(each),
      share: Rational.of(shares[row] ?? 100).div(HUNDRED),
    })),
  ];
};

const ROWS: Readonly<Record<PuppySize, readonly [Row, ...Row[]]>> = {
  small: rowsOf('small'),
  large: rowsOf('large'),
  giant: rowsOf('giant'),
};

/**
 * The share of its adult weight a puppy of `size` has reached at `months`: the row of the table,
 * a straight line between two rows, the first row under 1 month and 100% past the last.
 */
export const shareAt = (months: Rational, size: PuppySize): Rational => {
  const [first, ...rest] = ROWS[size];
  if (months.compare(first.month) !== 1) return first.share;
  let previous = first;
  for (const row of rest) {
    if (months.compare(row.month) !== 1)
      return previous.share.add(
        row.share
          .sub(previous.share)
          .mul(months.sub(previous.month))
          .div(row.month.sub(previous.month)),
      );
    previous = row;
  }
  return previous.share;
};

const inBand = (kg: Rational, [above, upTo]: readonly [Rational | null, Rational | null]) =>
  (above === null || kg.compare(above) === 1) && (upTo === null || kg.compare(upTo) !== 1);

/**
 * Puppy weight: the adult weight a puppy is on course for, from its weight and age now and its size
 * class, as the weight now divided by the share of adult weight the WALTHAM table (adapted from NRC
 * 2006) gives its class at that age. The range is the same weight read on the classes either side,
 * for a dog that grows like a smaller or a bigger one.
 */
export const puppyWeight = defineCalculator({
  id: 'puppy-weight',
  inputs: [
    decimalInput({
      key: 'weight',
      urlKey: 'w',
      default: Rational.of(21),
      min: Rational.of(1, 2),
      max: Rational.of(250),
    }),
    selectInput({ key: 'unit', urlKey: 'wu', options: ['lb', 'kg'], default: 'lb' }),
    decimalInput({
      key: 'age',
      urlKey: 'a',
      default: Rational.of(13),
      min: Rational.of(6),
      max: Rational.of(104),
    }),
    selectInput({ key: 'size', urlKey: 's', options: PUPPY_SIZES, default: 'large' }),
  ],
  outputs: [
    { key: 'adult', measure: 'number', role: 'primary' },
    { key: 'low', measure: 'number', role: 'secondary' },
    { key: 'high', measure: 'number', role: 'secondary' },
    { key: 'share', measure: 'number', role: 'secondary' },
    { key: 'months', measure: 'number', role: 'secondary' },
    { key: 'adultOther', measure: 'number', role: 'secondary' },
    { key: 'grownBy', measure: 'number', role: 'secondary' },
  ],
  warnings: ['early', 'grown', 'outsideClass'],
  compute: ({ weight, unit, age, size }) => {
    const months = age.mul(MONTHS_PER_WEEK);
    const adultOf = (each: PuppySize) => weight.div(shareAt(months, each));
    const share = shareAt(months, size);
    const adult = weight.div(share);
    const [smaller, bigger] = NEIGHBOURS[size];
    const kg = unit === 'lb' ? adult.mul(KG_PER_LB) : adult;
    return {
      outputs: {
        adult,
        low: adultOf(smaller),
        high: adultOf(bigger),
        share: share.mul(HUNDRED),
        months,
        adultOther: unit === 'lb' ? kg : adult.div(KG_PER_LB),
        grownBy: Rational.of(GROWN_BY[size]),
      },
      shopping: [],
      warnings: [
        ...(age.compare(EARLY_WEEKS) === -1 ? [{ code: 'early' as const, params: {} }] : []),
        ...(share.equals(Rational.ONE) ? [{ code: 'grown' as const, params: {} }] : []),
        ...(inBand(kg, BANDS[size]) ? [] : [{ code: 'outsideClass' as const, params: {} }]),
      ],
    };
  },
});
