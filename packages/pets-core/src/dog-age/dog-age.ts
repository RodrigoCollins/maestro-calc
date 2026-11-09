import { decimalInput, defineCalculator, Rational, selectInput } from '@maestro-calc/core';

/** The sizes of the chart: small up to 20 lb, medium 21 to 50 lb (AVMA), large 51 to 100, giant over 100. */
export const SIZES = ['small', 'medium', 'large', 'giant'] as const;

export type Size = (typeof SIZES)[number];

/** A corner of a chart: a dog age and the human age it reads as, both in years. */
type Point = readonly [Rational, Rational];

/** The corners of a chart, never empty, dog ages rising. */
type Line = readonly [Point, ...Point[]];

const point = (dog: number, human: number): Point => [Rational.of(dog * 2, 2), Rational.of(human)];

/**
 * The first two years, for every size: the dog owners' table of the Merck Veterinary Manual
 * ("Description of Dogs", reviewed October 2026), the low end of each row: 6 to 12 months is 10 to 15
 * human years, 12 to 18 months 15 to 20, 18 to 24 months 20 to 24. AVMA's chart agrees at 1 and 2.
 */
const FIRST_TWO_YEARS: Line = [
  [Rational.ZERO, Rational.ZERO],
  [Rational.of(1, 2), Rational.of(10)],
  point(1, 15),
  [Rational.of(3, 2), Rational.of(20)],
  point(2, 24),
];

/**
 * The AVMA chart "Pets age faster than people", for a medium-sized dog of 21 to 50 lb: the human
 * age at 1 to 16 years.
 */
const AVMA_MEDIUM = [15, 24, 28, 32, 36, 42, 47, 51, 56, 60, 65, 69, 74, 78, 83, 87] as const;

/**
 * Each size: its corners, and the human years each dog year adds after the last one. After 2 years,
 * PetMD (Coates, 2024) gives four human years a year for small dogs, five to six for large dogs and
 * seven to eight for giant dogs: the middle of each range is used. A medium dog follows the AVMA
 * chart to 16 years, then its own average from 2 to 16, (87 - 24) / 14 = 4.5 a year.
 */
const CHARTS: Readonly<Record<Size, { readonly points: Line; readonly after: Rational }>> = {
  small: { points: FIRST_TWO_YEARS, after: Rational.of(4) },
  medium: {
    points: [
      ...FIRST_TWO_YEARS,
      ...AVMA_MEDIUM.slice(2).map((human, index) => point(index + 3, human)),
    ],
    after: Rational.of(9, 2),
  },
  large: { points: FIRST_TWO_YEARS, after: Rational.of(11, 2) },
  giant: { points: FIRST_TWO_YEARS, after: Rational.of(15, 2) },
};

/** The value at `x` of the broken line through `points` (x rising), carried on at `slope` past the last. */
const along = ([first, ...rest]: Line, slope: Rational, x: Rational): Rational => {
  let [x0, y0] = first;
  for (const [x1, y1] of rest) {
    if (x.compare(x1) !== 1) return y0.add(y1.sub(y0).mul(x.sub(x0)).div(x1.sub(x0)));
    [x0, y0] = [x1, y1];
  }
  return y0.add(slope.mul(x.sub(x0)));
};

const swapped = ([dog, human]: Point): Point => [human, dog];

/** The human age of a dog of `dog` years and `size`, on the size chart. */
export const humanYearsOf = (dog: Rational, size: Size): Rational =>
  along(CHARTS[size].points, CHARTS[size].after, dog);

/** The dog age that reads as `human` years for `size`, the same chart worked back. */
export const dogYearsOf = (human: Rational, size: Size): Rational =>
  along(
    [swapped(CHARTS[size].points[0]), ...CHARTS[size].points.slice(1).map(swapped)],
    CHARTS[size].after.inv(),
    human,
  );

const MILLION = 1_000_000;

/** A real number to the millionth, as an exact fraction. */
const millionths = (value: number): Rational =>
  Rational.of(BigInt(Math.round(value * MILLION)), MILLION);

/**
 * The DNA clock of Wang et al., "Quantitative Translation of Dog-to-Human Aging by Conserved
 * Remodeling of the DNA Methylome", Cell Systems 11(2):176-185 (2020): human age = 16 ln(dog age)
 * + 31, fitted on 104 Labrador retrievers. A logarithm has no exact rational value, so the figure is
 * rounded to the millionth of a year.
 */
export const wangHumanYearsOf = (dog: Rational): Rational =>
  millionths(16 * Math.log(dog.toNumber()) + 31);

/** The same clock worked back: dog age = e^((human age - 31) / 16). */
export const wangDogYearsOf = (human: Rational): Rational =>
  millionths(Math.exp((human.toNumber() - 31) / 16));

/**
 * The age each size is a senior from, VCA Animal Hospitals, "How Old is Old? Comparing Dog Age to
 * Human Age": small dogs 11 to 12 (the start is used), medium 10, large 8, giant 7.
 */
export const SENIOR_AT: Readonly<Record<Size, number>> = {
  small: 11,
  medium: 10,
  large: 8,
  giant: 7,
};

/**
 * The life stage of the 2019 AAHA Canine Life Stage Guidelines, as a number: 0 a puppy (to the end of
 * rapid growth, about 6 to 9 months: under 9 months here), 1 a young adult (to the end of physical
 * and social maturation, 3 to 4 years in most dogs: under 4 here), 2 a mature adult, 3 a senior
 * (AAHA: the last 25% of the expected life span, which `SENIOR_AT` puts in years by size).
 */
export const stageOf = (dog: Rational, size: Size): number => {
  if (dog.compare(Rational.of(3, 4)) === -1) return 0;
  if (dog.compare(Rational.of(4)) === -1) return 1;
  return dog.compare(Rational.of(SENIOR_AT[size])) === -1 ? 2 : 3;
};

/** The dog ages the sources cover: Merck's table runs from 6 months to 20 years. */
const COVERED = [Rational.of(1, 2), Rational.of(20)] as const;

/** The dog ages of the study of Wang et al.: 104 Labradors of up to 16 years. */
const WANG_OLDEST = Rational.of(16);

/**
 * Dog age: a dog's age in human years by its size, or the dog age of a human age, from the charts of
 * AVMA, Merck and PetMD; the DNA clock of Wang et al. and the seven-year rule for comparison; the AAHA
 * life stage and the senior age of the size (VCA).
 */
export const dogAge = defineCalculator({
  id: 'dog-age',
  inputs: [
    selectInput({ key: 'from', urlKey: 'f', options: ['dog', 'human'], default: 'dog' }),
    decimalInput({
      key: 'age',
      urlKey: 'a',
      default: Rational.of(3),
      min: Rational.of(1, 2),
      max: Rational.of(120),
    }),
    selectInput({ key: 'size', urlKey: 's', options: SIZES, default: 'medium' }),
  ],
  outputs: [
    { key: 'answer', measure: 'number', role: 'primary' },
    { key: 'dogAge', measure: 'number', role: 'secondary' },
    { key: 'humanAge', measure: 'number', role: 'secondary' },
    { key: 'wang', measure: 'number', role: 'secondary' },
    { key: 'seven', measure: 'number', role: 'secondary' },
    { key: 'stage', measure: 'number', role: 'secondary' },
    { key: 'seniorAt', measure: 'number', role: 'secondary' },
  ],
  warnings: ['outside', 'wangOutside'],
  compute: ({ from, age, size }) => {
    const fromDog = from === 'dog';
    const dog = fromDog ? age : dogYearsOf(age, size);
    const human = fromDog ? humanYearsOf(age, size) : age;
    const wang = fromDog ? wangHumanYearsOf(age) : wangDogYearsOf(age);
    const wangDog = fromDog ? age : wang;
    const outside = dog.compare(COVERED[0]) === -1 || dog.compare(COVERED[1]) === 1;
    return {
      outputs: {
        answer: fromDog ? human : dog,
        dogAge: dog,
        humanAge: human,
        wang,
        seven: fromDog ? age.mul(Rational.of(7)) : age.div(Rational.of(7)),
        stage: Rational.of(stageOf(dog, size)),
        seniorAt: Rational.of(SENIOR_AT[size]),
      },
      shopping: [],
      warnings: [
        ...(outside ? [{ code: 'outside' as const, params: {} }] : []),
        ...(wangDog.compare(WANG_OLDEST) === 1
          ? [{ code: 'wangOutside' as const, params: {} }]
          : []),
      ],
    };
  },
});
