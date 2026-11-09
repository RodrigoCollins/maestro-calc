import { Rational } from '@maestro-calc/core';
import { catFood } from '@maestro-calc/pets-core/cat-food';
import { dogAge } from '@maestro-calc/pets-core/dog-age';
import { dogChocolate } from '@maestro-calc/pets-core/dog-chocolate';
import { civilFromDays, dogDueDate } from '@maestro-calc/pets-core/dog-due-date';
import { dogFood } from '@maestro-calc/pets-core/dog-food';
import { DOG_AGE_SOURCES } from './dog-years.ts';
import { amountText, dateText, kcalText } from './format.ts';
import { hrefOf } from './routes.ts';

/** The day every source below was read. */
export const ACCESSED = '2026-11-07';

/** A source of a section: its name as it is cited and its address. */
export interface MethodSource {
  readonly name: string;
  readonly url: string;
}

const MERCK_ENERGY: MethodSource = {
  name: 'Merck Veterinary Manual, Nutritional Requirements of Small Animals (Sanderson, last updated September 2024)',
  url: 'https://www.merckvetmanual.com/management-and-nutrition/nutrition-small-animals/nutritional-requirements-and-related-diseases-of-small-animals',
};
const MERCK_TABLE: MethodSource = {
  name: 'Merck Veterinary Manual, Daily maintenance energy requirements for dogs and cats',
  url: 'https://www.merckvetmanual.com/multimedia/table/daily-maintenance-energy-requirements-for-dogs-and-cats',
};
const AAHA_BOX: MethodSource = {
  name: '2021 AAHA Nutrition and Weight Management Guidelines, Box 1',
  url: 'https://www.aaha.org/globalassets/02-guidelines/2021-nutrition-and-weight-management/resourcepdfs/nutritiongl_box1.pdf',
};
const AAHA_TREATS: MethodSource = {
  name: '2021 AAHA Nutrition and Weight Management Guidelines for Dogs and Cats (JAAHA 2021, PDF copy)',
  url: 'https://www.canadianveterinarians.net/media/iuqg3rfp/cline-2021-aaha-nutrition-and-weight-management-guidelines-for-dogs-and-cats-jaaha-2021.pdf',
};
const AAFCO_CALORIES: MethodSource = {
  name: 'AAFCO, Understanding Pet Food: Calories',
  url: 'https://www.aafco.org/consumers/understanding-pet-food/calories/',
};
const MERCK_CHOCOLATE: MethodSource = {
  name: 'Merck Veterinary Manual, Chocolate Toxicosis in Animals (Hayes, full review September 2024, updated February 2026)',
  url: 'https://www.merckvetmanual.com/toxicology/food-hazards/chocolate-toxicosis-in-animals',
};
const MERCK_WHELPING: MethodSource = {
  name: 'Merck Veterinary Manual, Whelping and Queening in Dogs and Cats (Davidson, last updated July 2026)',
  url: 'https://www.merckvetmanual.com/management-and-nutrition/management-of-reproduction-dogs-and-cats/whelping-and-queening-in-dogs-and-cats',
};
const ASPCA: MethodSource = {
  name: 'ASPCA Animal Poison Control Center',
  url: 'https://www.aspca.org/pet-care/animal-poison-control',
};

/** The engines the cases run through, by the calculator id of the section. */
const ENGINES = {
  'dog-food': dogFood,
  'cat-food': catFood,
  'dog-chocolate': dogChocolate,
  'dog-due-date': dogDueDate,
  'dog-age': dogAge,
} as const;

export type EngineId = keyof typeof ENGINES;

/** A hand-verified case: the inputs, the working, and the figure the engine must give. */
export interface MethodCase {
  readonly engine: EngineId;
  readonly text: string;
  readonly raw: Readonly<Record<string, string>>;
  readonly key: string;
  readonly result: string;
  readonly unit: string;
}

export interface MethodSection {
  readonly id: string;
  readonly title: string;
  readonly href: string;
  readonly method: string;
  readonly note: string;
  readonly sources: readonly MethodSource[];
  readonly cases: readonly MethodCase[];
}

/** How each calculator works it out: its formula and note, its sources and its cases. */
export const METHOD_SECTIONS: readonly MethodSection[] = [
  {
    id: 'dog-food',
    title: 'Dog food and puppy feeding',
    href: hrefOf('dog'),
    method:
      'Resting energy requirement RER = 70 × (weight in kg)^0.75 kcal a day, at any weight. Maintenance energy MER = RER × the factor of the status. Cups a day = MER ÷ kcal per cup; grams a day = MER ÷ (kcal per kg) × 1,000; cans a day = MER ÷ kcal per can. Treats are at most 10% of MER, so on a day with treats the food is 90% of the amount. The puppy page is the same engine started at a puppy’s weight.',
    note: 'Merck says any figure is a starting point and a dog may need 30% more or less. The exponent has no exact rational value, so RER is rounded to a millionth of a kilocalorie.',
    sources: [MERCK_ENERGY, MERCK_TABLE, AAHA_BOX, AAHA_TREATS, AAFCO_CALORIES],
    cases: [
      {
        engine: 'dog-food',
        text: 'AAHA Box 1, a 10 lb dog taken as 4.5 kg: RER = 4.5^0.75 × 70 = 216 kcal a day.',
        raw: { weight: '4.5', unit: 'kg' },
        key: 'rer',
        result: '216',
        unit: 'kcal',
      },
      {
        engine: 'dog-food',
        text: 'The same dog at AAHA’s low factor 1.4 for a neutered adult (AAHA rounds RER first and prints 302): 216.28 × 1.4.',
        raw: { weight: '4.5', unit: 'kg' },
        key: 'low',
        result: '303',
        unit: 'kcal',
      },
      {
        engine: 'dog-food',
        text: 'A neutered 10 kg dog: 10^0.75 = 5.6234, RER = 393.64, × 1.6 (Merck) = 629.82.',
        raw: { weight: '10', unit: 'kg' },
        key: 'mer',
        result: '630',
        unit: 'kcal',
      },
      {
        engine: 'dog-food',
        text: 'The same dog on food of 360 kcal a cup: 629.82 ÷ 360.',
        raw: { weight: '10', unit: 'kg' },
        key: 'portion',
        result: '1.75',
        unit: 'cups',
      },
      {
        engine: 'dog-food',
        text: 'The same dog on food of 3,600 kcal per kg: 629.82 ÷ 3,600 × 1,000.',
        raw: { weight: '10', unit: 'kg', basis: 'kg', kcal: '3600' },
        key: 'portion',
        result: '174.95',
        unit: 'g',
      },
      {
        engine: 'dog-food',
        text: 'A puppy under 4 months of 10 kg, factor 3.0: 393.64 × 3.',
        raw: { weight: '10', unit: 'kg', status: 'puppy-young' },
        key: 'mer',
        result: '1,181',
        unit: 'kcal',
      },
    ],
  },
  {
    id: 'cat-food',
    title: 'Cat food and kitten feeding',
    href: hrefOf('cat'),
    method:
      'The same RER and treat rule as for dogs, with the cat factors. Cups of dry food = MER × (1 − wet share) ÷ kcal per cup; cans of wet food = MER × wet share ÷ kcal per can, the share being the part of the calories that comes from wet food. The kitten page is the same engine started at a kitten’s weight, factor 2.5.',
    note: 'Merck notes that kittens can alternatively be fed free choice.',
    sources: [MERCK_ENERGY, MERCK_TABLE, AAHA_BOX, AAFCO_CALORIES],
    cases: [
      {
        engine: 'cat-food',
        text: 'A neutered 4 kg cat: 4^0.75 = 2.8284, RER = 197.99 kcal.',
        raw: { weight: '4', unit: 'kg' },
        key: 'rer',
        result: '198',
        unit: 'kcal',
      },
      {
        engine: 'cat-food',
        text: 'The same cat, factor 1.2 (Merck): 197.99 × 1.2.',
        raw: { weight: '4', unit: 'kg' },
        key: 'mer',
        result: '238',
        unit: 'kcal',
      },
      {
        engine: 'cat-food',
        text: 'Half the calories from wet food of 80 kcal a can: 237.59 × 0.5 ÷ 80.',
        raw: { weight: '4', unit: 'kg', wetShare: '50' },
        key: 'cans',
        result: '1.48',
        unit: 'cans',
      },
      {
        engine: 'cat-food',
        text: 'The other half from dry food of 350 kcal a cup: 237.59 × 0.5 ÷ 350.',
        raw: { weight: '4', unit: 'kg', wetShare: '50' },
        key: 'cups',
        result: '0.34',
        unit: 'cups',
      },
    ],
  },
  {
    id: 'dog-chocolate',
    title: 'Dog chocolate toxicity',
    href: hrefOf('chocolate'),
    method:
      'Dose in mg/kg = grams eaten × milligrams of theobromine and caffeine per gram of that chocolate ÷ the dog’s weight in kg. Per gram: cocoa powder 28.5, unsweetened baking chocolate 15.5, cocoa bean hulls 9, semisweet and sweet dark chocolate 5.3 to 5.6 (the top is used), milk chocolate 2.3, white chocolate 0.04. Bands: mild signs from 20 mg/kg, heart effects from 40 to 50, seizures from 60. An ounce is 28.349523125 g.',
    note: 'Every result tells you to call a veterinarian or the ASPCA Animal Poison Control Center, however low the figure. Merck gives no figure between 50 and 60 mg/kg, so the heart-effects band runs from 40 to 60.',
    sources: [MERCK_CHOCOLATE, ASPCA],
    cases: [
      {
        engine: 'dog-chocolate',
        text: 'A 10 kg dog and 50 g of milk chocolate: 50 × 2.3 mg.',
        raw: { weight: '10', weightUnit: 'kg', amount: '50', amountUnit: 'g' },
        key: 'totalMg',
        result: '115',
        unit: 'mg',
      },
      {
        engine: 'dog-chocolate',
        text: 'The same dog: 115 mg ÷ 10 kg, below the 20 mg/kg line and still a reason to call.',
        raw: { weight: '10', weightUnit: 'kg', amount: '50', amountUnit: 'g' },
        key: 'dose',
        result: '11.5',
        unit: 'mg/kg',
      },
      {
        engine: 'dog-chocolate',
        text: 'Milk chocolate that reaches 20 mg/kg in a 10 kg dog: 200 mg ÷ 2.3 mg per gram.',
        raw: { weight: '10', weightUnit: 'kg' },
        key: 'reach20',
        result: '87',
        unit: 'g',
      },
    ],
  },
  {
    id: 'dog-due-date',
    title: 'Dog pregnancy due date',
    href: hrefOf('due-date'),
    method:
      'The window is the date you know plus 58 to 72 days from the first day the female allowed breeding, 64 to 66 days from the LH surge or the first rise of progesterone above 2 ng/mL, or 56 to 58 days from the first day of diestrus. The page gives the whole window, never one day.',
    note: 'A veterinarian can narrow the window with ovulation timing.',
    sources: [MERCK_WHELPING],
    cases: [
      {
        engine: 'dog-due-date',
        text: 'Breeding from 1 March 2026: 30 days to 31 March, 28 more, is day 58.',
        raw: { year: '2026', month: '3', day: '1' },
        key: 'earliest',
        result: 'Apr 28, 2026',
        unit: '',
      },
      {
        engine: 'dog-due-date',
        text: 'The same date, day 72: 30 days to 31 March, 30 to 30 April, 12 more.',
        raw: { year: '2026', month: '3', day: '1' },
        key: 'latest',
        result: 'May 12, 2026',
        unit: '',
      },
      {
        engine: 'dog-due-date',
        text: 'An LH surge on 1 March 2026, day 64.',
        raw: { year: '2026', month: '3', day: '1', method: 'lh' },
        key: 'earliest',
        result: 'May 4, 2026',
        unit: '',
      },
    ],
  },
  {
    id: 'dog-age',
    title: 'Dog age in human years',
    href: hrefOf('dog-age'),
    method:
      'Every size: 15 human years at 1 and 24 at 2, a straight line between the rows of Merck’s table (10 at 6 months, 20 at 18 months). A medium dog (21 to 50 lb) then follows AVMA’s chart year by year (28, 32, 36, 42, 47, 51, 56, 60, 65, 69, 74, 78, 83, 87 at 3 to 16) and 4.5 a year past it. After 2, a small dog (20 lb or less) adds 4 human years a year, a large dog (51 to 100 lb) 5.5 and a giant dog (over 100 lb) 7.5, the middle of PetMD’s 5 to 6 and 7 to 8. A human age is worked back on the same line. The DNA clock is 16 × ln(dog age) + 31 (Wang et al., 2020), and its inverse e^((human age − 31) ÷ 16). Life stage: AAHA 2019 (puppy under 9 months, young adult under 4 years, then mature adult), senior from VCA’s ages (small 11, medium 10, large 8, giant 7).',
    note: 'The sources disagree. VCA counts each of the first two years as about 10.5 human years (21 at 2, not 24); the DNA clock makes a 1-year-old 31; AAHA does not convert ages at all. The clock was fitted on Labrador retrievers only, up to 16 years, and the charts cover 6 months to 20 years: the calculator says so outside them.',
    sources: [
      DOG_AGE_SOURCES.avma,
      DOG_AGE_SOURCES.merck,
      DOG_AGE_SOURCES.petmd,
      DOG_AGE_SOURCES.wang,
      DOG_AGE_SOURCES.aaha,
      DOG_AGE_SOURCES.vca,
    ],
    cases: [
      {
        engine: 'dog-age',
        text: 'A medium dog of 3 years, the AVMA chart.',
        raw: { age: '3' },
        key: 'answer',
        result: '28',
        unit: 'human years',
      },
      {
        engine: 'dog-age',
        text: 'A large dog of 10 years: 24 + 8 × 5.5.',
        raw: { age: '10', size: 'large' },
        key: 'answer',
        result: '68',
        unit: 'human years',
      },
      {
        engine: 'dog-age',
        text: '50 human years for a large dog, worked back: 2 + (50 − 24) ÷ 5.5.',
        raw: { from: 'human', age: '50', size: 'large' },
        key: 'answer',
        result: '6.7',
        unit: 'dog years',
      },
      {
        engine: 'dog-age',
        text: 'The DNA clock at 12 years, the expected life span of a Labrador: 16 × ln 12 + 31.',
        raw: { age: '12' },
        key: 'wang',
        result: '70.8',
        unit: 'human years',
      },
    ],
  },
];

/** The Merck point value and the AAHA range of each status, from Merck’s table and AAHA Box 1. */
export const FACTOR_TABLE: readonly {
  readonly status: string;
  readonly merck: string;
  readonly aaha: string;
}[] = [
  { status: 'Neutered adult (dog / cat)', merck: '1.6 / 1.2', aaha: '1.4 to 1.6 / 1.2 to 1.4' },
  { status: 'Intact adult (dog / cat)', merck: '1.8 / 1.4', aaha: '1.6 to 1.8 / 1.4 to 1.6' },
  { status: 'Inactive or obesity prone (dog / cat)', merck: '1.4 / 1.0', aaha: '1.0 to 1.2 / 1.0' },
  { status: 'Weight loss, on ideal weight (dog / cat)', merck: 'not given', aaha: '1.0 / 0.8' },
  { status: 'Puppy under 4 months', merck: '3.0', aaha: '3.0' },
  { status: 'Puppy 4 months or older', merck: '2.0', aaha: '2.0' },
  { status: 'Kitten', merck: '2.5', aaha: '2.5' },
];

/** What the site leaves out, and why. */
export const LEFT_OUT: readonly { readonly what: string; readonly why: string }[] = [
  {
    what: 'NRC 2006 (Nutrient Requirements of Dogs and Cats)',
    why: 'A paid book that the team has not read, so it is not cited until someone reads the actual table.',
  },
  {
    what: 'Dog age in human years',
    why: 'The only formula verified (Wang et al., Cell Systems 2020) was fitted on 104 Labrador retrievers, and the AVMA size chart could not be read. A size-blind formula from one breed is not enough.',
  },
  {
    what: 'Cat age in human years',
    why: 'The chart credited to AAHA and AAFP is not in the primary source that was found, which gives life stages only.',
  },
  {
    what: 'Raw and homemade portions as a percentage of body weight',
    why: 'No veterinary primary source. The AVMA discourages raw or undercooked animal-source protein, and WSAVA says a homemade diet should be formulated by a board-certified veterinary nutritionist.',
  },
  {
    what: 'Puppy adult-weight estimates',
    why: 'Every rule found online is unsourced; no published growth curve was found.',
  },
  {
    what: 'Breed factors',
    why: 'Breed does not enter the Merck or AAHA formula; weight and status do. See the guide on dog food by breed.',
  },
  {
    what: 'Pregnancy and lactation feeding',
    why: 'AAHA’s ranges (3.0 for the last 21 days of gestation, 3.0 to 6.0 or more in lactation) are too wide to give one number, so the pages send you to the veterinarian.',
  },
  {
    what: 'Water intake, xylitol and grape thresholds',
    why: 'No primary threshold was verified.',
  },
];

const texts: Readonly<Record<string, (value: Rational) => string>> = {
  rer: kcalText,
  mer: kcalText,
  low: kcalText,
  high: kcalText,
  treats: kcalText,
  portion: (value) =>
    amountText(value, 2)
      .replace(/\.00$/, '')
      .replace(/(\.\d)0$/, '$1'),
  cups: (value) => amountText(value, 2),
  cans: (value) => amountText(value, 2),
  dose: (value) => amountText(value, 1),
  totalMg: (value) => amountText(value, 0),
  reach20: (value) => amountText(value, 0),
  earliest: (value) => dateText(civilFromDays(value.toNumber())),
  latest: (value) => dateText(civilFromDays(value.toNumber())),
  answer: (value) => amountText(value, value.isInteger() ? 0 : 1),
  wang: (value) => amountText(value, 1),
};

/** The text of one output of a case, as a page would write it. */
export const caseText = ({ engine, raw, key }: MethodCase): string => {
  const ran = ENGINES[engine].run(raw);
  if (!ran.ok) throw new Error(`${engine} did not run`);
  const value = ran.value.outputs.find((output) => output.key === key)?.value;
  const format = texts[key];
  if (!(value instanceof Rational) || format === undefined) throw new Error(`no text for ${key}`);
  return format(value);
};
