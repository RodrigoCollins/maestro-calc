import { decimalInput, defineCalculator, Rational, selectInput } from '@maestro-calc/core';

/** A corner of a chart: a cat age and the human age it reads as, both in years. */
type Point = readonly [Rational, Rational];

/** The corners of a chart, never empty, cat ages rising. */
type Line = readonly [Point, ...Point[]];

const months = (count: number, human: number): Point => [
  Rational.of(count, 12),
  Rational.of(human),
];

/**
 * The human-age table of the 2010 AAFP-AAHA Feline Life Stage Guidelines (Vogt et al., JAAHA
 * 2010;46:70-85), the table that International Cat Care and the AAHA cat age chart still print:
 * 0 to 1 month is 0 to 1 year (1 at one month), 2 to 3 months 2 to 4 (2 at two months, 4 at three),
 * 4 months 6 to 8 (the middle, 7, is used), 6 months 10, 7 months 12, 12 months 15, 18 months 21,
 * 2 years 24, and 4 human years for every year after, to 116 at 25. The 2021 AAHA/AAFP guidelines
 * kept the life stages but print no human ages.
 */
const CHART: Line = [
  [Rational.ZERO, Rational.ZERO],
  months(1, 1),
  months(2, 2),
  months(3, 4),
  months(4, 7),
  months(6, 10),
  months(7, 12),
  months(12, 15),
  months(18, 21),
  months(24, 24),
];

/**
 * The Cornell Feline Health Center, "The Special Needs of the Senior Cat" (updated December 2016):
 * a 1-year-old cat is like a person of 16, a 2-year-old like a person of 21, and each year after is
 * about 4 human years. Cornell gives no figure under 1 year; the line runs straight from birth.
 */
const CORNELL: Line = [
  [Rational.ZERO, Rational.ZERO],
  [Rational.ONE, Rational.of(16)],
  [Rational.of(2), Rational.of(21)],
];

/** The human years both lines add a year after the second birthday. */
const AFTER = Rational.of(4);

/** The value at `x` of the broken line through `points` (x rising), carried on at `slope` past the last. */
const along = ([first, ...rest]: Line, slope: Rational, x: Rational): Rational => {
  let [x0, y0] = first;
  for (const [x1, y1] of rest) {
    if (x.compare(x1) !== 1) return y0.add(y1.sub(y0).mul(x.sub(x0)).div(x1.sub(x0)));
    [x0, y0] = [x1, y1];
  }
  return y0.add(slope.mul(x.sub(x0)));
};

const swapped = ([cat, human]: Point): Point => [human, cat];

const inverse = ([first, ...rest]: Line): Line => [swapped(first), ...rest.map(swapped)];

/** The human age of a cat of `cat` years, on the table of the 2010 guidelines. */
export const humanYearsOf = (cat: Rational): Rational => along(CHART, AFTER, cat);

/** The cat age that reads as `human` years, the same table worked back. */
export const catYearsOf = (human: Rational): Rational => along(inverse(CHART), AFTER.inv(), human);

/** The human age of a cat of `cat` years by Cornell's figures. */
export const cornellHumanYearsOf = (cat: Rational): Rational => along(CORNELL, AFTER, cat);

/** The cat age that reads as `human` years by Cornell's figures. */
export const cornellCatYearsOf = (human: Rational): Rational =>
  along(inverse(CORNELL), AFTER.inv(), human);

/**
 * The life stage of the 2021 AAHA/AAFP Feline Life Stage Guidelines (Quimby et al., JFMS
 * 2021;23:211-233), as a number: 0 a kitten (birth up to 1 year), 1 a young adult (1 to 6 years:
 * under 7 here), 2 a mature adult (7 to 10 years), 3 a senior (over 10 years). The fifth stage, end
 * of life, can come at any age and is not read from the age.
 */
export const stageOf = (cat: Rational): number => {
  if (cat.compare(Rational.ONE) === -1) return 0;
  if (cat.compare(Rational.of(7)) === -1) return 1;
  return cat.compare(Rational.of(10)) === 1 ? 3 : 2;
};

/**
 * The six stages of International Cat Care, "How to tell your cat's age in human years" (the six of
 * the 2010 guidelines, which named the adult stage prime and the last geriatric), as a number:
 * 0 kitten (0 to 6 months), 1 junior (7 months to 2 years), 2 adult (3 to 6), 3 mature (7 to 10),
 * 4 senior (11 to 14), 5 super senior (15 and over).
 */
export const careStageOf = (cat: Rational): number =>
  [Rational.of(7, 12), Rational.of(3), Rational.of(7), Rational.of(11), Rational.of(15)].filter(
    (start) => cat.compare(start) !== -1,
  ).length;

/** The last cat age of the table: 25 years, 116 human years. */
const TABLE_END = Rational.of(25);

/**
 * Cat age: a cat's age in human years, or the cat age of a human age, on the table of the 2010
 * AAFP-AAHA guidelines; Cornell's figures and the seven-year rule for comparison; the life stage of
 * the 2021 AAHA/AAFP guidelines and of International Cat Care, and the visits a year the 2021
 * guidelines ask for (at least one, at least two for a senior).
 */
export const catAge = defineCalculator({
  id: 'cat-age',
  inputs: [
    selectInput({ key: 'from', urlKey: 'f', options: ['cat', 'human'], default: 'cat' }),
    decimalInput({
      key: 'age',
      urlKey: 'a',
      default: Rational.of(5),
      min: Rational.ZERO,
      max: Rational.of(120),
    }),
  ],
  outputs: [
    { key: 'answer', measure: 'number', role: 'primary' },
    { key: 'catAge', measure: 'number', role: 'secondary' },
    { key: 'humanAge', measure: 'number', role: 'secondary' },
    { key: 'cornell', measure: 'number', role: 'secondary' },
    { key: 'seven', measure: 'number', role: 'secondary' },
    { key: 'stage', measure: 'number', role: 'secondary' },
    { key: 'careStage', measure: 'number', role: 'secondary' },
    { key: 'visits', measure: 'number', role: 'secondary' },
  ],
  warnings: ['outside', 'cornellOutside'],
  compute: ({ from, age }) => {
    const fromCat = from === 'cat';
    const cat = fromCat ? age : catYearsOf(age);
    const human = fromCat ? humanYearsOf(age) : age;
    const cornell = fromCat ? cornellHumanYearsOf(age) : cornellCatYearsOf(age);
    const cornellCat = fromCat ? age : cornell;
    const stage = stageOf(cat);
    return {
      outputs: {
        answer: fromCat ? human : cat,
        catAge: cat,
        humanAge: human,
        cornell,
        seven: fromCat ? age.mul(Rational.of(7)) : age.div(Rational.of(7)),
        stage: Rational.of(stage),
        careStage: Rational.of(careStageOf(cat)),
        visits: Rational.of(stage === 3 ? 2 : 1),
      },
      shopping: [],
      warnings: [
        ...(cat.compare(TABLE_END) === 1 ? [{ code: 'outside' as const, params: {} }] : []),
        ...(cornellCat.compare(Rational.ONE) === -1
          ? [{ code: 'cornellOutside' as const, params: {} }]
          : []),
      ],
    };
  },
});
