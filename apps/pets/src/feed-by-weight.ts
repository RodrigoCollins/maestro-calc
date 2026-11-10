import { encode, Rational } from '@maestro-calc/core';
import { dogFood } from '@maestro-calc/pets-core/dog-food';
import { DOG_STATUSES, type DogStatus, KG_PER_LB } from '@maestro-calc/pets-core/energy';
import { amountText, cupsText, kcalText, quarterCups } from './format.ts';
import type { GuideQuestion, GuideSection, PageSource } from './guides.ts';
import { hrefOf } from './routes.ts';

/** The day the feeding figures and their sources were last read. */
export const FEED_CHECKED = '2026-11-09';

/** The dry food the pages assume when they turn calories into cups: 360 kcal a cup, as the charts. */
const FOOD_KCAL = 360;

/** The sources of the feed-by-weight pages, each read on `FEED_CHECKED`. */
export const FEED_SOURCES = {
  merck: {
    name: 'Merck Veterinary Manual, Nutritional Requirements of Small Animals (Sanderson, reviewed November 2023)',
    url: 'https://www.merckvetmanual.com/management-and-nutrition/nutrition-small-animals/nutritional-requirements-and-related-diseases-of-small-animals',
  },
  merckTable: {
    name: 'Merck Veterinary Manual, Daily maintenance energy requirements for dogs and cats',
    url: 'https://www.merckvetmanual.com/multimedia/table/daily-maintenance-energy-requirements-for-dogs-and-cats',
  },
  aaha: {
    name: '2021 AAHA Nutrition and Weight Management Guidelines, Box 1: Energy Requirement Calculations',
    url: 'https://www.aaha.org/wp-content/uploads/globalassets/02-guidelines/2021-nutrition-and-weight-management/resourcepdfs/nutritiongl_box1.pdf',
  },
  wsava: {
    name: 'WSAVA Global Nutrition Committee, Calorie Ranges for an Average Healthy Adult Dog in Ideal Body Condition (updated July 2020)',
    url: 'https://wsava.org/wp-content/uploads/2020/07/Calorie-Needs-for-Healthy-Adult-Dogs-updated-July-2020.pdf',
  },
  wsavaBcs: {
    name: 'WSAVA Global Nutrition Committee, Body Condition Score chart for dogs',
    url: 'https://wsava.org/wp-content/uploads/2025/06/WSAVA_BCSCat_BCSDog_Nutrition_250612.pdf',
  },
  akc: {
    name: 'American Kennel Club, Breed Weight Chart (AKC Staff, updated April 26, 2023)',
    url: 'https://www.akc.org/expert-advice/nutrition/breed-weight-chart/',
  },
  kealy: {
    name: 'Kealy RD, et al. Effects of diet restriction on life span and age-related changes in dogs. JAVMA 2002;220(9):1315–1320',
    url: 'https://pubmed.ncbi.nlm.nih.gov/11991408/',
  },
} as const satisfies Record<string, PageSource>;

const BASE_SOURCES: readonly PageSource[] = [
  FEED_SOURCES.merck,
  FEED_SOURCES.merckTable,
  FEED_SOURCES.aaha,
  FEED_SOURCES.wsava,
  FEED_SOURCES.wsavaBcs,
  FEED_SOURCES.akc,
];

/** The weights of the pages, in pounds. */
export const FEED_WEIGHTS = [10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 100] as const;

/** A dog of `weight` lb with its article: `a 50 lb`, `an 80 lb`, `an 11 lb`. */
export const dogOf = (weight: number): string =>
  `${/^(8|11|18)/.test(String(weight)) ? 'an' : 'a'} ${String(weight)} lb`;

/** The address of the page of `weight`: `/how-much-to-feed-a-50-lb-dog`, `/how-much-to-feed-an-80-lb-dog`. */
export const feedPathOf = (weight: number): string =>
  `/how-much-to-feed-${dogOf(weight).replace(/ /g, '-')}-dog`;

/** The figures of the dog food calculator for `weight` lb, `status`, at `kcal` a cup, by output key. */
const figuresOf = (
  weight: number,
  status: DogStatus,
  kcal: number = FOOD_KCAL,
): ReadonlyMap<string, Rational> => {
  const ran = dogFood.run({
    weight: String(weight),
    unit: 'lb',
    status,
    basis: 'cup',
    kcal: String(kcal),
  });
  if (!ran.ok) throw new Error(`the dog food ${String(weight)} lb did not run`);
  return new Map(
    ran.value.outputs.flatMap(({ key, value }) =>
      value instanceof Rational ? [[key, value] as const] : [],
    ),
  );
};

const figureAt = (weight: number, status: DogStatus, key: string, kcal?: number): Rational => {
  const value = figuresOf(weight, status, kcal).get(key);
  if (value === undefined) throw new Error(`no output ${key}`);
  return value;
};

/** The resting energy requirement of a dog of `weight` lb, kcal a day. */
const rerAt = (weight: number): Rational => figureAt(weight, 'neutered', 'rer');

/** The maintenance calories of a dog of `weight` lb and `status` (Merck's factor), kcal a day. */
export const merAt = (weight: number, status: DogStatus = 'neutered'): Rational =>
  figureAt(weight, status, 'mer');

/** Cups a day of a food of `kcal` a cup for a dog of `weight` lb and `status`. */
const cupsAt = (weight: number, status: DogStatus = 'neutered', kcal = FOOD_KCAL): Rational =>
  figureAt(weight, status, 'portion', kcal);

/** Cups to the quarter, as a measuring set gives them: `3 ¼`. */
const quarterText = (cups: Rational): string => cupsText(quarterCups(cups.toNumber()));

/** `3 ¼ cups`, `1 cup`. */
const cupsWords = (cups: Rational): string => {
  const text = quarterText(cups);
  return `${text} ${text === '1' ? 'cup' : 'cups'}`;
};

/** `text` with its first letter in capitals. */
const capitalized = (text: string): string => text.replace(/^./, (first) => first.toUpperCase());

/** The calculator's address with `weight` lb filled in, as the calculator encodes it. */
export const feedCalculatorHrefOf = (weight: number): string => {
  const validated = dogFood.validate({ weight: String(weight), unit: 'lb' });
  if (!validated.ok) throw new Error(`the dog food ${String(weight)} lb does not validate`);
  const query = encode(dogFood, validated.value);
  return query === 'v=1' ? hrefOf('dog') : `${hrefOf('dog')}?${query}`;
};

/** One row of the WSAVA table: kilograms, the pounds as printed, and the kcal range of a day. */
export interface WsavaRow {
  readonly kg: number;
  readonly lb: string;
  readonly low: number;
  readonly high: number;
}

/**
 * The rows of WSAVA's calorie table (updated July 2020) nearest each weight of the pages, as
 * printed: the table goes by whole kilograms from 2 to 49, so a page reads the row whose pound
 * figure is closest to its own weight.
 */
export const WSAVA_ROWS: readonly WsavaRow[] = [
  { kg: 5, lb: '11', low: 280, high: 351 },
  { kg: 7, lb: '15.4', low: 360, high: 452 },
  { kg: 9, lb: '19.8', low: 440, high: 546 },
  { kg: 11, lb: '24.2', low: 510, high: 634 },
  { kg: 14, lb: '30.8', low: 610, high: 760 },
  { kg: 18, lb: '39.6', low: 730, high: 918 },
  { kg: 23, lb: '50.6', low: 880, high: 1103 },
  { kg: 27, lb: '59.4', low: 1000, high: 1244 },
  { kg: 32, lb: '70.4', low: 1130, high: 1413 },
  { kg: 36, lb: '79.2', low: 1240, high: 1543 },
  { kg: 45, lb: '99', low: 1460, high: 1824 },
];

/** The WSAVA row nearest `weight` lb. */
export const wsavaRowOf = (weight: number): WsavaRow => {
  const row = WSAVA_ROWS[FEED_WEIGHTS.indexOf(weight as (typeof FEED_WEIGHTS)[number])];
  if (row === undefined) throw new Error(`no WSAVA row for ${String(weight)} lb`);
  return row;
};

/** A section written for one weight only: breeds of that size and what is true of it alone. */
interface WeightNote {
  readonly heading: string;
  readonly paragraphs: readonly string[];
  readonly sources?: readonly PageSource[];
}

/**
 * What each weight has that the others do not: the breeds the AKC chart lists around it, and one
 * fact of the formula or the sources at that weight. Every figure is held to the engine by a test.
 */
const NOTES: Readonly<Record<number, WeightNote>> = {
  10: {
    heading: 'The weight of AAHA’s own example',
    paragraphs: [
      'The 2021 AAHA guidelines work their formula through on a 10 lb neutered dog: 4.5 kg, a resting need of 216 kcal a day, and 302 kcal at their factor of 1.4. This page converts the pound exactly, 4.536 kg, which gives 218 and 305: the same answer once rounded to what a bowl can show.',
      'Breeds the AKC weight chart lists around 10 lb include the Havanese (7 to 13 lb), the Miniature Poodle (10 to 15 lb) and the Shih Tzu (9 to 16 lb). At this size small errors are big ones: a quarter cup of a 360 kcal food is 90 kcal, 26% of the day. Use a real measuring cup, or weigh the food with the grams option of the calculator.',
    ],
  },
  15: {
    heading: 'Half again the weight is not half again the food',
    paragraphs: [
      'The Pug (14 to 18 lb), the Cavalier King Charles Spaniel (13 to 18 lb), the Bichon Frise (12 to 18 lb) and the West Highland White Terrier (15 to 20 lb) all weigh about 15 lb on the AKC chart.',
      'The formula raises the weight in kilograms to the power 0.75, so food does not grow in step with weight. A 15 lb dog has 50% more weight than a 10 lb one but needs 472 kcal against 348, 36% more.',
    ],
  },
  20: {
    heading: 'Where small meets medium',
    paragraphs: [
      'The Miniature Schnauzer (11 to 20 lb), the Boston Terrier (12 to 25 lb), the Shetland Sheepdog (15 to 25 lb) and the Cocker Spaniel (20 to 30 lb) meet at about 20 lb on the AKC chart, the top of what this site’s dog age pages call a small dog.',
      'Twice the weight of a 10 lb dog does not mean twice the bowl: 585 kcal against 348, 1.68 times, because 2 raised to the power 0.75 is 1.68. Per pound, a 20 lb dog needs 29.3 kcal a day and a 10 lb dog 34.8.',
    ],
  },
  25: {
    heading: 'The size where rounding starts to matter less',
    paragraphs: [
      'Around 25 lb the AKC chart lists the Shetland Sheepdog (15 to 25 lb), the Cocker Spaniel (20 to 30 lb), the Basenji (22 to 24 lb) and the lightest Whippets (25 to 40 lb).',
      'Rounding to the nearest quarter cup moves the day by at most an eighth of a cup. At 360 kcal a cup that is 45 kcal, 6.5% of what a neutered 25 lb dog needs: inside Merck’s 30% band, but worth weighing the dog for a few weeks before you settle on the scoop.',
    ],
  },
  30: {
    heading: 'Corgis, Frenchies and Brittanys',
    paragraphs: [
      'The Pembroke Welsh Corgi (28 to 30 lb) and the French Bulldog (28 lb) sit just under 30 lb on the AKC chart; the Brittany and the Soft Coated Wheaten Terrier (both 30 to 40 lb) start there.',
      'Three times the weight of a 10 lb dog, 2.28 times the food: 794 kcal against 348. A rule of thumb that feeds by the pound overfeeds a dog this size if it was set on a small dog.',
    ],
  },
  40: {
    heading: 'The weight the calculator opens at',
    paragraphs: [
      'The dog food calculator of this site starts at a neutered 40 lb dog on a food of 360 kcal a cup, so this page is its first answer worked out: 985 kcal and 2 ¾ cups a day.',
      'On the AKC chart the Brittany (30 to 40 lb), the Keeshond (35 to 45 lb), the Australian Cattle Dog (35 to 50 lb) and the heavier Whippets (25 to 40 lb) are about 40 lb.',
    ],
  },
  50: {
    heading: 'Bulldogs, Springers and working collies',
    paragraphs: [
      'The Bulldog and the English Springer Spaniel (both 40 to 50 lb), the Standard Schnauzer (30 to 50 lb) and the Border Collie (30 to 55 lb) weigh about 50 lb on the AKC chart.',
      'A Border Collie that herds or runs every day may count as a working dog. AAHA’s factors for light work are 1.6 to 2.0, which is 1,164 to 1,455 kcal at 50 lb, and moderate work runs from 2.0 to 5.0. A dog in real work needs its amount set with a veterinarian, not read off a page.',
    ],
  },
  60: {
    heading: 'Neutering changes more than ten pounds do',
    paragraphs: [
      'The Siberian Husky and the Portuguese Water Dog (both 35 to 60 lb), the Vizsla (44 to 60 lb) and the Chinese Shar-Pei (45 to 60 lb) reach about 60 lb on the AKC chart.',
      'An intact 60 lb dog, at Merck’s factor of 1.8, needs 1,501 kcal a day: more than a neutered dog of 70 lb, at 1,498. Whether the dog is neutered moves the figure further than ten pounds of weight.',
    ],
  },
  70: {
    heading: 'Labradors, Goldens and a study of lean feeding',
    paragraphs: [
      'The Labrador Retriever (55 to 80 lb), the Golden Retriever (55 to 75 lb), the Irish Setter (60 to 70 lb) and the Dalmatian (45 to 70 lb) all reach about 70 lb on the AKC chart.',
      'In a study of 48 Labrador Retrievers fed in pairs from 8 weeks of age until death, the dog fed 25% less than its pair-mate weighed less, had less body fat, a longer median life span, and showed signs of chronic disease later (Kealy et al., JAVMA 2002). A quarter of this page’s 1,498 kcal is 375 kcal, about a cup a day: that shows the size of the difference, not a plan. Any cut belongs to a weight plan made with your veterinarian.',
    ],
    sources: [FEED_SOURCES.kealy],
  },
  80: {
    heading: 'Feeding for the ideal weight, not the scale',
    paragraphs: [
      'The German Shepherd Dog (50 to 90 lb), the Alaskan Malamute (75 to 85 lb), the Rhodesian Ridgeback (70 to 85 lb) and the heaviest Labradors (55 to 80 lb) weigh about 80 lb on the AKC chart.',
      'For a dog on a weight-loss plan, AAHA’s factor of 1.0 applies to the ideal weight, not the weight on the scale. If a veterinarian sets 70 lb as the goal for an 80 lb dog, the plan starts at 936 kcal a day, about 2 ½ cups of a 360 kcal food, against 1,656 kcal for keeping a neutered dog at 80 lb.',
    ],
  },
  100: {
    heading: 'Past the end of WSAVA’s table',
    paragraphs: [
      'The Great Pyrenees (85 to 100 lb), the Old English Sheepdog (60 to 100 lb), the Bloodhound (80 to 110 lb) and the Bernese Mountain Dog (70 to 115 lb) reach 100 lb on the AKC chart.',
      'WSAVA’s table stops at 49 kg (107.8 lb); above it, only the formula is left. A 100 lb dog weighs ten times a 10 lb dog but needs 5.62 times the food, 1,958 kcal against 348, so a giant dog eats far less per pound than a toy one.',
    ],
  },
};

/** The rows of the life stage table: the status, its words, and its Merck factor in tenths. */
const STAGES: readonly { status: DogStatus; words: (weight: number) => string; factor: string }[] =
  [
    { status: 'neutered', words: () => 'Neutered adult', factor: '1.6' },
    { status: 'intact', words: () => 'Intact adult', factor: '1.8' },
    { status: 'inactive', words: () => 'Inactive or prone to weight gain', factor: '1.4' },
    {
      status: 'weight-loss',
      words: (weight) => `On a weight-loss plan, if ${String(weight)} lb is the ideal weight`,
      factor: '1.0',
    },
    {
      status: 'puppy-young',
      words: (weight) => `Puppy under 4 months that weighs ${String(weight)} lb now`,
      factor: '3.0',
    },
    {
      status: 'puppy-older',
      words: (weight) => `Puppy 4 months or older that weighs ${String(weight)} lb now`,
      factor: '2.0',
    },
  ];

const LABEL_KCALS = [300, 360, 420, 480] as const;

/** A table of a feeding page. */
export interface FeedTable {
  readonly columns: readonly string[];
  readonly rows: readonly (readonly string[])[];
}

/** A feed-by-weight page: "how much to feed a 50 lb dog", answered first and worked by the engine. */
export interface FeedPage {
  readonly weight: number;
  readonly path: string;
  readonly title: string;
  readonly description: string;
  readonly h1: string;
  readonly lead: string;
  readonly checked: string;
  readonly stages: FeedTable;
  readonly labels: FeedTable;
  readonly sections: readonly GuideSection[];
  readonly questions: readonly GuideQuestion[];
  readonly calculator: { readonly href: string; readonly label: string };
  readonly sources: readonly PageSource[];
}

const workedSection = (weight: number): GuideSection => {
  const kg = Rational.of(weight).mul(KG_PER_LB);
  const rer = rerAt(weight);
  const power = rer.div(Rational.of(70));
  const cups = cupsAt(weight);
  return {
    id: 'worked',
    heading: 'How the figures are worked out',
    paragraphs: [
      `${String(weight)} lb × 0.45359237 = ${amountText(kg, 3)} kg. Raised to the power 0.75 that is ${amountText(power, 3)}, and 70 × ${amountText(power, 3)} = ${amountText(rer, 1)} kcal a day: the resting energy requirement (RER). A neutered adult needs 1.6 times it, Merck’s factor: ${amountText(rer, 1)} × 1.6 = ${kcalText(merAt(weight))} kcal a day. Divided by ${String(FOOD_KCAL)} kcal a cup, that is ${amountText(cups, 2)} cups, or ${quarterText(cups)} to the nearest quarter cup.`,
    ],
  };
};

const wsavaSection = (weight: number): GuideSection => {
  const { kg, lb, low, high } = wsavaRowOf(weight);
  const mer = merAt(weight);
  const place =
    mer.compare(Rational.of(high)) === 1
      ? 'above the top of that range'
      : mer.compare(Rational.of(low)) === -1
        ? 'below the bottom of that range'
        : 'inside that range';
  const cups = (kcal: number): string => amountText(Rational.of(kcal, FOOD_KCAL), 2);
  return {
    id: 'wsava',
    heading: 'A second source: WSAVA’s calorie range',
    paragraphs: [
      `WSAVA’s calorie table for an average healthy adult dog in ideal body condition gives ${kcalText(Rational.of(low))} to ${kcalText(Rational.of(high))} kcal a day at ${String(kg)} kg (${lb} lb), ${cups(low)} to ${cups(high)} cups of a ${String(FOOD_KCAL)} kcal food. Merck’s ${kcalText(mer)} kcal for a neutered ${String(weight)} lb dog is ${place}.`,
      'WSAVA’s footnote names the 2006 NRC maintenance equations as its basis, while Merck and AAHA multiply the resting need by a factor, so the two rarely agree to the calorie.',
    ],
  };
};

const lifeSection = (weight: number): GuideSection => {
  const rer = rerAt(weight);
  return {
    id: 'life',
    heading: 'Puppies, seniors and quieter dogs',
    paragraphs: [
      `A puppy that weighs ${String(weight)} lb today is fed on its current weight at 3 times its resting need under 4 months, ${kcalText(merAt(weight, 'puppy-young'))} kcal, and 2 times from 4 months, ${kcalText(merAt(weight, 'puppy-older'))} kcal (Merck and AAHA). Its weight changes every week, so weigh it often and use the puppy calculator rather than this table.`,
      `Neither Merck nor AAHA gives a separate factor for a senior dog. AAHA notes that sedentary pets may need less than its factors, and its range for an inactive or obesity-prone dog, 1.0 to 1.2, is ${kcalText(rer)} to ${kcalText(rer.mul(Rational.of(12, 10)))} kcal a day at ${String(weight)} lb. Ask your veterinarian before you change an older dog’s food.`,
    ],
  };
};

const treatsSection = (weight: number): GuideSection => {
  const treats = figureAt(weight, 'neutered', 'treats');
  const withTreats = figureAt(weight, 'neutered', 'portionWithTreats');
  return {
    id: 'treats',
    heading: 'Treats come out of the same day',
    paragraphs: [
      `AAHA’s 2021 guidelines keep treats and everything else under 10% of the day, so a neutered ${String(weight)} lb dog has about ${kcalText(treats)} kcal for them. On a day with treats, feed 90% of the food: ${amountText(withTreats, 2)} cups of a ${String(FOOD_KCAL)} kcal food instead of ${amountText(cupsAt(weight), 2)}.`,
    ],
  };
};

const checkSection = (weight: number): GuideSection => {
  const mer = merAt(weight);
  return {
    id: 'check',
    heading: 'Is it the right amount for your dog?',
    paragraphs: [
      `Merck says any dog may need as much as 30% more or less than the formula: ${kcalText(mer.mul(Rational.of(7, 10)))} to ${kcalText(mer.mul(Rational.of(13, 10)))} kcal a day for a neutered ${String(weight)} lb dog. The dog tells you where it sits in that band.`,
      'On WSAVA’s 9-point body condition chart, the ideal is 4 to 5: ribs palpable without excess fat covering, a waist seen behind the ribs from above, and the abdomen tucked up from the side. AAHA asks for the amount to be adjusted by watching the weight and that score, so weigh your dog every few weeks and settle the amount with your veterinarian.',
    ],
  };
};

const pageOf = (weight: number): FeedPage => {
  const note = NOTES[weight];
  if (note === undefined) throw new Error(`no note for ${String(weight)} lb`);
  const mer = merAt(weight);
  const cups = cupsAt(weight);
  const dog = dogOf(weight);
  const rer = rerAt(weight);
  const wsava = wsavaRowOf(weight);
  return {
    weight,
    path: feedPathOf(weight),
    title: `How Much to Feed ${dog} Dog: ${cupsWords(cups).replace(/cup/, 'Cup')} a Day | Bowl Figures`,
    description: `${capitalized(dog)} neutered adult dog needs about ${kcalText(mer)} kcal a day, ${cupsWords(cups)} of a 360 kcal a cup food (Merck). Intact, puppy and senior figures, by the label.`,
    h1: `How much should I feed ${dog} dog? About ${cupsWords(cups)} a day`,
    lead: `A neutered adult dog of ${String(weight)} lb needs about ${kcalText(mer)} kcal a day (Merck Veterinary Manual), which is about ${cupsWords(cups)} a day of a dry food of ${String(FOOD_KCAL)} kcal a cup. That cup figure is an assumption: read the calorie line on your own bag and divide by it, or use the calculator below.`,
    checked: FEED_CHECKED,
    stages: {
      columns: [
        `${capitalized(dogOf(weight))} dog`,
        'Times RER (Merck)',
        'Calories a day',
        `Cups a day at ${String(FOOD_KCAL)} kcal`,
      ],
      rows: STAGES.map(({ status, words, factor }) => {
        const each = cupsAt(weight, status);
        return [
          words(weight),
          factor,
          kcalText(merAt(weight, status)),
          `${quarterText(each)} (${amountText(each, 2)})`,
        ];
      }),
    },
    labels: {
      columns: ['Label: kcal per cup', 'Cups a day (to ¼)', 'Cups, exactly'],
      rows: LABEL_KCALS.map((kcal) => {
        const each = cupsAt(weight, 'neutered', kcal);
        return [String(kcal), quarterText(each), amountText(each, 2)];
      }),
    },
    sections: [
      { id: 'note', heading: note.heading, paragraphs: note.paragraphs },
      workedSection(weight),
      wsavaSection(weight),
      lifeSection(weight),
      treatsSection(weight),
      checkSection(weight),
    ],
    questions: [
      {
        question: `How much should ${dog} dog eat?`,
        answer: `About ${cupsWords(cups)} a day of a 360 kcal a cup dry food if it is a neutered adult: ${kcalText(mer)} kcal. An intact adult needs about ${kcalText(merAt(weight, 'intact'))} kcal and an inactive one ${kcalText(merAt(weight, 'inactive'))}. Divide by the calorie line of your own food to get your scoop.`,
      },
      {
        question: `How many calories does ${dog} dog need?`,
        answer: `Its resting need is ${amountText(rer, 1)} kcal a day. A neutered adult needs ${kcalText(mer)} on Merck’s factor, ${kcalText(merAt(weight, 'inactive'))} to ${kcalText(mer)} on AAHA’s range of 1.4 to 1.6, and WSAVA’s table gives ${String(wsava.low)} to ${String(wsava.high)} at ${wsava.lb} lb.`,
      },
      {
        question: `How much wet food should ${dog} dog eat?`,
        answer: `Divide the ${kcalText(mer)} kcal by the calories per can on the label; the calculator does it with its per-can option. Mixing wet and dry splits the same calories between them. If your dog has a health condition, ask your veterinarian before you change its food.`,
      },
    ],
    calculator: {
      href: feedCalculatorHrefOf(weight),
      label: `Dog food calculator, with ${String(weight)} lb filled in`,
    },
    sources: [...BASE_SOURCES, ...(note.sources ?? [])],
  };
};

/** The feed-by-weight pages, 10 to 100 lb. */
export const FEED_PAGES: readonly FeedPage[] = FEED_WEIGHTS.map(pageOf);

/** The page of the weight at `path`. */
export const feedPageOf = (path: string): FeedPage => {
  const page = FEED_PAGES.find((candidate) => candidate.path === path);
  if (page === undefined) throw new Error(`no feeding page ${path}`);
  return page;
};

/** Every status of a dog, so a new one cannot be left out of the table silently. */
if (STAGES.length !== DOG_STATUSES.length) throw new Error('a dog status has no row');

/** The "how much should I feed my dog" hub: a short sourced guide and every weight. */
export const FEED_HUB = {
  path: '/how-much-should-i-feed-my-dog',
  title: 'How Much Should I Feed My Dog? Cups by Weight | Bowl Figures',
  description:
    'How much food to feed your dog a day: calories from its weight and life stage (Merck, AAHA), cups from the label, and a table from 10 to 100 lb.',
  h1: 'How much should I feed my dog?',
  lead: `Feed the calories your dog needs, then turn them into cups with the calorie line of your own food. A neutered adult dog of 40 lb needs about ${kcalText(merAt(40))} kcal a day on the Merck Veterinary Manual’s formula, about ${cupsWords(cupsAt(40))} of a dry food of ${String(FOOD_KCAL)} kcal a cup. Find your dog’s weight below, then check the amount on the dog.`,
  checked: FEED_CHECKED,
  columns: ['Weight', 'Calories a day (neutered adult)', `Cups a day at ${String(FOOD_KCAL)} kcal`],
  rows: FEED_PAGES.map(({ weight, path }) => ({
    href: path,
    cells: [`${String(weight)} lb`, kcalText(merAt(weight)), quarterText(cupsAt(weight))],
  })),
  sections: [
    {
      id: 'steps',
      heading: 'Work it out in five steps',
      paragraphs: [
        '1. Weigh your dog, and note its body condition. For a dog that needs to lose weight, your veterinarian sets an ideal weight and you use that one.',
        '2. Find the resting energy requirement: 70 × (weight in kg)^0.75 kcal a day, the formula of both the Merck Veterinary Manual and the 2021 AAHA guidelines. A pound is 0.45359237 kg.',
        '3. Multiply it by the factor of your dog’s life stage and activity (below) to get the calories a day.',
        '4. Divide by the calories per cup, can or kilogram printed on your food’s label. The pages and the table here assume 360 kcal a cup; your food may differ a lot.',
        '5. Keep treats under 10% of the day (AAHA), then weigh the dog every few weeks and adjust.',
      ],
    },
    {
      id: 'factors',
      heading: 'The life stage and activity factors',
      paragraphs: [
        'Merck’s table multiplies the resting need by 1.6 for a neutered adult, 1.8 for an intact one, 1.4 for an obesity-prone dog, 3 for a puppy under 4 months and 2 for an older puppy. AAHA gives ranges: 1.4 to 1.6 neutered, 1.6 to 1.8 intact, 1.0 to 1.2 inactive or obese-prone, and 1.0 on the ideal weight for weight loss.',
        'AAHA adds factors this site’s pages do not use for an everyday dog: light work 1.6 to 2.0, moderate 2.0 to 5.0 and heavy 5.0 to 11.0. Its factors are general guidelines, and it notes that sedentary or indoor pets may need less.',
      ],
    },
    {
      id: 'bag',
      heading: 'Why the label matters more than the breed',
      paragraphs: [
        'Calories per cup differ from food to food, so the same scoop can be a different meal on a different food: the table below shows how far the cups move between 300 and 480 kcal a cup. The calorie line of the label (kcal per cup, per can or per kilogram) is the one number the arithmetic needs from the bag.',
        'Breed is not a term in the Merck or AAHA formula: two dogs of the same weight and life stage start from the same figure, whatever the breed. Each weight page lists breeds of its size from the AKC weight chart only so you can find your dog.',
      ],
    },
    {
      id: 'check',
      heading: 'Check the amount on the dog',
      paragraphs: [
        'Merck says a dog may need as much as 30% more or less than any formula, and WSAVA says its own calorie table is for guidance only because dogs are individuals. The dog’s body is the final check.',
        'WSAVA’s 9-point body condition chart puts the ideal at 4 to 5: ribs palpable without excess fat covering, a waist behind the ribs seen from above, the abdomen tucked up from the side. In a study of 48 Labrador Retrievers, the dogs fed 25% less than their pair-mates had a longer median life span (Kealy et al., 2002): lean is worth keeping.',
      ],
    },
    {
      id: 'vet',
      heading: 'When to ask your veterinarian first',
      paragraphs: [
        'A pregnant or nursing dog needs far more than a pet at rest: AAHA’s factor is 3.0 for the last 21 days of gestation and 3.0 to 6.0 or more in lactation, depending on the litter. A weight-loss plan, a puppy of a large breed, a senior that is losing weight and a dog with any illness or special diet all need an amount set by a veterinarian.',
        'Every figure on these pages is a starting point from published veterinary formulas, not veterinary advice for your dog.',
      ],
    },
  ],
  questions: [
    {
      question: 'How much food should I feed my dog?',
      answer: `Enough calories for its weight and life stage, measured with your food’s label: about ${kcalText(merAt(20))} kcal a day for a neutered 20 lb dog, ${kcalText(merAt(50))} for 50 lb and ${kcalText(merAt(80))} for 80 lb (Merck). At 360 kcal a cup that is about ${cupsWords(cupsAt(20))}, ${cupsWords(cupsAt(50))} and ${cupsWords(cupsAt(80))} a day.`,
    },
    {
      question: 'Is the feeding guide on the bag right?',
      answer:
        'It is the maker’s starting point for its own food. Merck and AAHA treat every figure the same way: start from the formula, then adjust by watching the dog’s weight and body condition.',
    },
    {
      question: 'How many cups of dry food should a dog eat a day?',
      answer:
        'It depends on the calories per cup of the food. Divide your dog’s calories a day by the kcal per cup on the label: the same 1,000 kcal is 3 ⅓ cups of a 300 kcal food and 2 ½ of a 400 kcal food.',
    },
  ],
  sources: [...BASE_SOURCES, FEED_SOURCES.kealy],
} as const;
