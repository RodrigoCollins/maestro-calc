import { Rational } from '@maestro-calc/core';
import { dogChocolate } from '@maestro-calc/pets-core/dog-chocolate';
import { dogFood } from '@maestro-calc/pets-core/dog-food';
import { amountText, cupsText, kcalText, quarterCups } from './format.ts';
import type { PageSource } from './guides.ts';
import { hrefOf } from './routes.ts';

/** A data page: a table computed from an engine at build time, with its sources and review day. */
export interface Chart {
  readonly path: string;
  readonly title: string;
  readonly description: string;
  readonly h1: string;
  readonly lead: string;
  readonly checked: string;
  readonly columns: readonly string[];
  readonly rows: readonly (readonly string[])[];
  readonly notes: readonly string[];
  /** True for the chocolate chart: the page tells the reader to call a veterinarian or a poison line. */
  readonly callNow?: true;
  readonly calculators: readonly { readonly href: string; readonly label: string }[];
  readonly sources: readonly PageSource[];
  readonly card: { readonly title: string; readonly summary: string };
}

const CHECKED = '2026-11-07';
const FOOD_KCAL = '360';

const MERCK: PageSource = {
  name: 'Merck Veterinary Manual, Nutritional Requirements of Small Animals',
  url: 'https://www.merckvetmanual.com/management-and-nutrition/nutrition-small-animals/nutritional-requirements-and-related-diseases-of-small-animals',
};
const MERCK_TABLE: PageSource = {
  name: 'Merck Veterinary Manual, Daily maintenance energy requirements for dogs and cats',
  url: 'https://www.merckvetmanual.com/multimedia/table/daily-maintenance-energy-requirements-for-dogs-and-cats',
};
const AAHA: PageSource = {
  name: '2021 AAHA Nutrition and Weight Management Guidelines, Box 1',
  url: 'https://www.aaha.org/globalassets/02-guidelines/2021-nutrition-and-weight-management/resourcepdfs/nutritiongl_box1.pdf',
};
const MERCK_CHOCOLATE: PageSource = {
  name: 'Merck Veterinary Manual, Chocolate Toxicosis in Animals',
  url: 'https://www.merckvetmanual.com/toxicology/food-hazards/chocolate-toxicosis-in-animals',
};
const ASPCA: PageSource = {
  name: 'ASPCA Animal Poison Control Center',
  url: 'https://www.aspca.org/pet-care/animal-poison-control',
};

const figure = (
  engine: typeof dogFood | typeof dogChocolate,
  raw: Readonly<Record<string, string>>,
  key: string,
): Rational => {
  const ran = engine.run(raw);
  if (!ran.ok) throw new Error('a chart row did not run');
  const value = ran.value.outputs.find((output) => output.key === key)?.value;
  if (!(value instanceof Rational)) throw new Error(`no output ${key}`);
  return value;
};

const range = (from: number, to: number, step: number): number[] =>
  Array.from({ length: Math.floor((to - from) / step) + 1 }, (_, index) => from + index * step);

/** The weights of the dog chart: 5 to 100 lb in steps of 5. */
const DOG_WEIGHTS = range(5, 100, 5);
/** The weights of the puppy chart, in pounds. */
const PUPPY_WEIGHTS = [2, 4, 6, 8, 10, 15, 20, 25, 30, 40];

const dogRow = (weight: number, status: string): string[] => {
  const raw = { weight: String(weight), unit: 'lb', status, kcal: FOOD_KCAL };
  const mer = figure(dogFood, raw, 'mer');
  const cups = figure(dogFood, raw, 'portion');
  return [
    String(weight),
    kcalText(mer),
    cupsText(quarterCups(cups.toNumber())),
    amountText(cups, 2),
  ];
};

const reach = (weight: number, type: string): string =>
  amountText(
    figure(dogChocolate, { weight: String(weight), weightUnit: 'lb', type }, 'reach20'),
    0,
  );

export const CHARTS: readonly Chart[] = [
  {
    path: '/dog-feeding-chart',
    title: 'Dog Feeding Chart: Calories and Cups by Weight | Bowl Figures',
    description:
      'Calories and cups a day for a neutered adult dog from 5 to 100 lb, on food of 360 kcal a cup, from the Merck energy factor. Check the amount with your vet.',
    h1: 'Dog feeding chart by weight',
    lead: 'A neutered adult dog at each weight, fed a food of 360 kcal a cup. Your food’s label sets the real amount: use the calculator.',
    checked: CHECKED,
    columns: ['Weight (lb)', 'Calories a day', 'Cups a day (to ¼)', 'Cups, exactly'],
    rows: DOG_WEIGHTS.map((weight) => dogRow(weight, 'neutered')),
    notes: [
      'Calories a day are 70 × (weight in kg)^0.75 × 1.6, the Merck factor for a neutered adult dog; AAHA gives 1.4 to 1.6. Merck says a dog may need 30% more or less.',
      'An intact adult needs more (Merck 1.8), an inactive dog less (Merck 1.4), and a dog on a weight-loss plan is fed for its ideal weight.',
    ],
    calculators: [
      { href: hrefOf('dog'), label: 'Dog food calculator' },
      { href: hrefOf('puppy'), label: 'Puppy feeding calculator' },
    ],
    sources: [MERCK, MERCK_TABLE, AAHA],
    card: {
      title: 'Dog feeding chart',
      summary: 'Calories and cups a day for 5 to 100 lb.',
    },
  },
  {
    path: '/puppy-feeding-chart',
    title: 'Puppy Feeding Chart: Calories and Cups by Weight | Bowl Figures',
    description:
      'Calories and cups a day for a puppy from 2 to 40 lb, under 4 months (3.0 times resting energy) and from 4 months (2.0), on food of 360 kcal a cup.',
    h1: 'Puppy feeding chart by weight',
    lead: 'A puppy at each weight, fed a food of 360 kcal a cup. Weigh your puppy often: the amount changes as it grows.',
    checked: CHECKED,
    columns: [
      'Weight (lb)',
      'Under 4 months: calories',
      'Under 4 months: cups to ¼',
      'Under 4 months: cups',
      '4 months or older: calories',
      '4 months or older: cups to ¼',
      '4 months or older: cups',
    ],
    rows: PUPPY_WEIGHTS.map((weight) => {
      const [, youngKcal = '', youngQuarter = '', youngCups = ''] = dogRow(weight, 'puppy-young');
      const [, olderKcal = '', olderQuarter = '', olderCups = ''] = dogRow(weight, 'puppy-older');
      return [
        String(weight),
        youngKcal,
        youngQuarter,
        youngCups,
        olderKcal,
        olderQuarter,
        olderCups,
      ];
    }),
    notes: [
      'A puppy needs 3.0 times its resting energy (70 × kg^0.75) under 4 months and 2.0 times from 4 months, in both Merck and AAHA 2021.',
      'The chart assumes a puppy at the weight shown for its age. Your veterinarian can tell you whether your puppy is growing as it should.',
    ],
    calculators: [
      { href: hrefOf('puppy'), label: 'Puppy feeding calculator' },
      { href: hrefOf('dog'), label: 'Dog food calculator' },
    ],
    sources: [MERCK, MERCK_TABLE, AAHA],
    card: {
      title: 'Puppy feeding chart',
      summary: 'Calories and cups a day for 2 to 40 lb, in two age bands.',
    },
  },
  {
    path: '/dog-chocolate-toxicity-chart',
    title: 'Dog Chocolate Toxicity Chart by Weight | Bowl Figures',
    description:
      'Grams of milk, dark and baking chocolate that reach 20 mg/kg, where Merck lists the first signs, for dogs of 5 to 100 lb. Always call a vet or poison line.',
    h1: 'Dog chocolate toxicity chart by weight',
    lead: 'The grams of each chocolate at which a dog reaches 20 mg/kg of theobromine and caffeine, the dose where Merck lists mild signs.',
    checked: CHECKED,
    columns: ['Dog weight (lb)', 'Milk chocolate (g)', 'Dark chocolate (g)', 'Baking chocolate (g)'],
    rows: DOG_WEIGHTS.map((weight) => [
      String(weight),
      reach(weight, 'milk'),
      reach(weight, 'dark'),
      reach(weight, 'baking'),
    ]),
    notes: [
      'Less than the amount shown is not safe: any chocolate is a reason to call. Heart effects are listed from 40 mg/kg, which is twice these grams, and seizures from 60 mg/kg, three times.',
      'Milk chocolate has 2.3 mg of methylxanthines per gram, dark or semisweet 5.6 (the top of Merck’s range) and unsweetened baking chocolate 15.5.',
    ],
    callNow: true,
    calculators: [{ href: hrefOf('chocolate'), label: 'Dog chocolate toxicity calculator' }],
    sources: [MERCK_CHOCOLATE, ASPCA],
    card: {
      title: 'Chocolate toxicity chart',
      summary: 'Grams that reach 20 mg/kg, by dog weight and chocolate.',
    },
  },
];

/** The chart at `path`. */
export const chartOf = (path: string): Chart => {
  const chart = CHARTS.find((candidate) => candidate.path === path);
  if (chart === undefined) throw new Error(`no chart ${path}`);
  return chart;
};

/** The index of the data pages, `/charts`. */
export const CHARTS_INDEX = {
  path: '/charts',
  title: 'Pet Feeding Data and Charts | Bowl Figures',
  description:
    'Tables computed from the calculators of Bowl Figures: dog and puppy feeding by weight and chocolate toxicity by weight, each with its sources and review day.',
  h1: 'Data and charts',
  lead: 'Every table here is computed by the same engine as the calculators, from the Merck Veterinary Manual and AAHA figures, and dated.',
  checked: CHECKED,
} as const;
