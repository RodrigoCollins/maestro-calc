import { Rational } from '@maestro-calc/core';
import { dogChocolate } from '@maestro-calc/pets-core/dog-chocolate';
import { dogFood } from '@maestro-calc/pets-core/dog-food';
import { AGE_PAGES, DOG_AGE_CHART_ROWS, DOG_AGE_SOURCES, DOG_YEARS_CHECKED } from './dog-years.ts';
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
  /** More pages the chart leads to, each one row of it worked out (the dog age chart). */
  readonly pages?: {
    readonly heading: string;
    readonly links: readonly { readonly href: string; readonly label: string }[];
  };
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
    columns: [
      'Dog weight (lb)',
      'Milk chocolate (g)',
      'Dark chocolate (g)',
      'Baking chocolate (g)',
    ],
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
    calculators: [
      { href: hrefOf('chocolate'), label: 'Dog chocolate toxicity calculator' },
      { href: hrefOf('chocolate-guide'), label: 'My dog ate chocolate: what to do now' },
    ],
    sources: [MERCK_CHOCOLATE, ASPCA],
    card: {
      title: 'Chocolate toxicity chart',
      summary: 'Grams that reach 20 mg/kg, by dog weight and chocolate.',
    },
  },
  {
    path: '/dog-age-chart',
    title: 'Dog Age Chart: Dog Years to Human Years by Size | Bowl Figures',
    description:
      'Human years for dogs of 1 to 16 by size, from AVMA’s chart, Merck’s table and PetMD’s rates, beside the 2020 DNA clock of Wang et al. and the 7× rule.',
    h1: 'Dog age chart: dog years to human years by size',
    lead: 'The human age of a dog of 1 to 16 years in each of four sizes, worked out by the same engine as the dog age calculator, with the DNA clock and the seven-year rule beside them.',
    checked: DOG_YEARS_CHECKED,
    columns: [
      'Dog age (years)',
      'Small (20 lb or less)',
      'Medium (21 to 50 lb)',
      'Large (51 to 100 lb)',
      'Giant (over 100 lb)',
      'DNA clock (Wang et al.)',
      '7× rule',
    ],
    rows: DOG_AGE_CHART_ROWS,
    notes: [
      'Every size is 15 at 1 and 24 at 2, the figures AVMA’s chart and Merck’s table share. The medium column is AVMA’s chart itself. After 2, the small column adds 4 human years a year (Merck’s table and PetMD), the large 5.5 and the giant 7.5, the middle of PetMD’s 5 to 6 and 7 to 8.',
      'The DNA clock is 16 × ln(dog age) + 31, fitted by Wang et al. on 104 Labrador retrievers: it makes a young dog much older than the charts and an old dog younger. The seven-year rule is in no veterinary source used here.',
      'AAHA’s 2019 guidelines do not convert ages: they place a dog in a life stage. Every figure is an estimate; your veterinarian can tell you where your own dog is.',
    ],
    calculators: [{ href: hrefOf('dog-age'), label: 'Dog age calculator' }],
    pages: {
      heading: 'Each age, worked out',
      links: AGE_PAGES.map(({ path, age }) => ({
        href: path,
        label: `${String(age)} ${age === 1 ? 'year' : 'years'} in dog years`,
      })),
    },
    sources: Object.values(DOG_AGE_SOURCES),
    card: {
      title: 'Dog age chart',
      summary: 'Human years by size for dogs of 1 to 16, with the DNA clock.',
    },
  },
];

/** The chart at `path`. */
export const chartOf = (path: string): Chart => {
  const chart = CHARTS.find((candidate) => candidate.path === path);
  if (chart === undefined) throw new Error(`no chart ${path}`);
  return chart;
};

/** The cells of the row of `weight` in a chart: build-time data, so a missing row throws. */
const cellsAt = (path: string, weight: number): readonly string[] => {
  const row = chartOf(path).rows.find(([each]) => each === String(weight));
  if (row === undefined) throw new Error(`no row ${String(weight)} in ${path}`);
  return row;
};

const numberOfCell = (cell: string | undefined): number => Number((cell ?? '').replaceAll(',', ''));

const [, bigDog = ''] = cellsAt('/dog-feeding-chart', 100);
const [, smallDog = ''] = cellsAt('/dog-feeding-chart', 25);
const [, youngPuppy = '', , , olderPuppy = ''] = cellsAt('/puppy-feeding-chart', 10);
const [, milk = '', dark = '', baking = ''] = cellsAt('/dog-chocolate-toxicity-chart', 20);
const [, smallTen = '', , , giantTen = '', clockTen = ''] = cellsAt('/dog-age-chart', 10);
const [, , , , , clockAtOne = ''] = cellsAt('/dog-age-chart', 1);
const ratio = Math.round((10 * numberOfCell(bigDog)) / numberOfCell(smallDog)) / 10;

/** What the index says about its charts, each figure read off the charts themselves. */
export const CHARTS_GUIDE = {
  h2: 'What the charts show',
  paragraphs: [
    `A dog four times heavier does not need four times the food. The dog feeding chart gives a 100 lb dog ${bigDog} calories a day against ${smallDog} for a 25 lb dog, ${ratio.toLocaleString('en-US', { minimumFractionDigits: 1 })} times, because the energy a dog needs follows its weight in kilograms to the 0.75 power (Merck).`,
    `A puppy needs the most for its weight while it is young. At 10 lb, the puppy chart gives ${youngPuppy} calories a day under 4 months and ${olderPuppy} from 4 months, as the factor drops from 3.0 to 2.0 times the resting energy (Merck and AAHA 2021).`,
    `The darker the chocolate, the less it takes. For a 20 lb dog, ${milk} g of milk chocolate, ${dark} g of dark or ${baking} g of baking chocolate reach 20 mg/kg, the dose where Merck lists the first signs. Less is not safe: if your dog ate any, call your veterinarian or a poison line now.`,
    `Size changes how fast a dog ages. On the dog age chart a 10-year-old is ${smallTen} human years if it is small and ${giantTen} if it is giant; the DNA clock of a 2020 study, fitted on Labradors, gives ${clockTen} at 10 but ${clockAtOne} at 1, far older than the 15 of the charts.`,
    'The feeding charts assume a food of 360 kcal a cup; the calories per cup on your own bag set the real amount, so use the calculator with that figure. Every chart is worked out by the same engine as the calculators and shows the day it was checked.',
  ],
  sources: [MERCK, MERCK_TABLE, AAHA, MERCK_CHOCOLATE, DOG_AGE_SOURCES.avma, DOG_AGE_SOURCES.wang],
} as const;

/** The index of the data pages, `/charts`. */
export const CHARTS_INDEX = {
  path: '/charts',
  title: 'Pet Feeding Data and Charts | Bowl Figures',
  description:
    'Tables from the Bowl Figures calculators: dog and puppy feeding and chocolate toxicity by weight, and dog age by size, each with its sources and review day.',
  h1: 'Data and charts',
  lead: 'Every table here is computed by the same engine as the calculators, from the Merck Veterinary Manual, AVMA and AAHA figures, and dated.',
  checked: CHECKED,
} as const;
