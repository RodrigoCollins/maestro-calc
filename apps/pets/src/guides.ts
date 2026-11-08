import { CHOCOLATE_GUIDE } from './chocolate-guide.ts';
import { hrefOf } from './routes.ts';

/** A source a guide or chart cites: its name and its address. */
export interface PageSource {
  readonly name: string;
  readonly url: string;
}

/** One section of a guide. */
export interface GuideSection {
  readonly id: string;
  readonly heading: string;
  readonly paragraphs: readonly string[];
}

/** A table a guide shows after one of its sections: rows computed from an engine at build time. */
export interface GuideTable {
  /** The id of the section it follows. */
  readonly after: string;
  readonly id: string;
  readonly heading: string;
  readonly paragraphs: readonly string[];
  readonly columns: readonly string[];
  readonly rows: readonly (readonly string[])[];
  readonly linksHeading: string;
  readonly links: readonly { readonly href: string; readonly label: string }[];
}

/** One question of a guide's FAQ, with its answer. */
export interface GuideQuestion {
  readonly question: string;
  readonly answer: string;
}

/** A guide: its head, sections, the calculators it explains and its sources. */
export interface Guide {
  readonly path: string;
  readonly title: string;
  readonly description: string;
  readonly h1: string;
  readonly lead: string;
  /** The day the figures were last checked against the sources. */
  readonly checked: string;
  readonly sections: readonly GuideSection[];
  /** True for the chocolate guide: the page tells the reader to call a veterinarian or a poison line. */
  readonly callNow?: true;
  readonly table?: GuideTable;
  readonly questions?: readonly GuideQuestion[];
  readonly calculators: readonly string[];
  readonly sources: readonly PageSource[];
  /** The card the home lists it by. */
  readonly card: { readonly title: string; readonly summary: string };
}

const AAFCO_CALORIES: PageSource = {
  name: 'AAFCO, Understanding Pet Food: Calories',
  url: 'https://www.aafco.org/consumers/understanding-pet-food/calories/',
};
const AAFCO_STARTUPS: PageSource = {
  name: 'AAFCO, Calorie Content (start-up resources)',
  url: 'https://www.aafco.org/resources/startups/calorie-content/',
};
const MERCK: PageSource = {
  name: 'Merck Veterinary Manual, Nutritional Requirements of Small Animals',
  url: 'https://www.merckvetmanual.com/management-and-nutrition/nutrition-small-animals/nutritional-requirements-and-related-diseases-of-small-animals',
};
const AAHA: PageSource = {
  name: '2021 AAHA Nutrition and Weight Management Guidelines, Box 1',
  url: 'https://www.aaha.org/globalassets/02-guidelines/2021-nutrition-and-weight-management/resourcepdfs/nutritiongl_box1.pdf',
};

/**
 * The modified Atwater estimate of AAFCO, in kcal of metabolizable energy per kg: (3.5 × crude
 * protein % + 8.5 × crude fat % + 3.5 × NFE %) × 10, with NFE = 100 − protein − fat − fiber −
 * moisture − ash. The guaranteed analysis gives minimums and maximums, not averages, so it is an
 * estimate; use the calorie line of the label whenever it has one.
 */
export const atwaterKcalPerKg = (percent: {
  readonly protein: number;
  readonly fat: number;
  readonly fiber: number;
  readonly moisture: number;
  readonly ash: number;
}): number => {
  const nfe = 100 - percent.protein - percent.fat - percent.fiber - percent.moisture - percent.ash;
  return (3.5 * percent.protein + 8.5 * percent.fat + 3.5 * nfe) * 10;
};

/** The made-up analysis the guide works through: arithmetic, not a product. */
export const ATWATER_EXAMPLE = { protein: 26, fat: 15, fiber: 4, moisture: 10, ash: 7 } as const;

export const GUIDES: readonly Guide[] = [
  {
    path: '/how-to-read-pet-food-label',
    title: 'How to Read the Calorie Line on a Pet Food Label | Bowl Figures',
    description:
      'Where to find kcal per cup, can and kilogram on a dog or cat food label, what AAFCO requires, and the Atwater estimate when a label has no calorie line.',
    h1: 'How to read the calorie line on a pet food label',
    lead: 'The one number the calculators need from your bag or can is its calories. This is where to find it and what it means.',
    checked: '2026-11-07',
    sections: [
      {
        id: 'statement',
        heading: 'The calorie content statement',
        paragraphs: [
          'AAFCO asks a pet food label to state its “Calorie Content” in kilocalories of metabolizable energy (kcal ME) per kilogram as fed, and also per familiar unit: a cup, a can or a piece. Look for a line such as “3,600 kcal/kg (360 kcal/cup)”.',
          'In the calculators, pick the unit your label gives (per cup, per kilogram or per can) and type the number. The calculator divides your pet’s daily calories by it.',
        ],
      },
      {
        id: 'as-fed',
        heading: 'As fed, not dry matter',
        paragraphs: [
          'The calorie line is as fed: it counts the food as it comes out of the bag or can, water included. Use it as printed rather than converting percentages from the guaranteed analysis.',
        ],
      },
      {
        id: 'no-line',
        heading: 'When a label has no calorie line',
        paragraphs: [
          'AAFCO’s modified Atwater estimate gives kcal per kg as (3.5 × crude protein % + 8.5 × crude fat % + 3.5 × NFE %) × 10, where NFE (nitrogen-free extract) is 100 minus protein, fat, fiber, moisture and ash.',
          'For example, with 26% protein, 15% fat, 4% fiber, 10% moisture and 7% ash (made-up numbers, not a product), NFE is 38% and the estimate is (91 + 127.5 + 133) × 10 = 3,515 kcal per kg.',
          'This is an estimate. The guaranteed analysis gives minimums and maximums, not averages, so the real figure can differ. Ask the maker for the calorie content, which AAFCO says the label should state.',
        ],
      },
      {
        id: 'treats',
        heading: 'Treats count',
        paragraphs: [
          'Complete and balanced food should be at least 90% of what a pet eats, and treats and everything else at most 10% (AAHA, 2021). The calculators show the 10% as a number of calories.',
        ],
      },
    ],
    calculators: [hrefOf('dog'), hrefOf('cat'), hrefOf('puppy'), hrefOf('kitten')],
    sources: [AAFCO_CALORIES, AAFCO_STARTUPS, AAHA],
    card: {
      title: 'How to read a pet food label',
      summary: 'Find the calories per cup, can and kilogram, and what to do without them.',
    },
  },
  {
    path: '/dog-food-by-breed',
    title: 'Dog Food by Breed: Why Weight Matters, Not Breed | Bowl Figures',
    description:
      'Why a dog food calculator by breed gives the same answer as one by weight: the Merck and AAHA formulas use weight and status, not breed.',
    h1: 'Dog food by breed: what the formula uses',
    lead: 'Searches for “dog food calculator by breed” expect a table per breed. The veterinary formulas do not have one.',
    checked: '2026-11-07',
    sections: [
      {
        id: 'formula',
        heading: 'What goes into the formula',
        paragraphs: [
          'Both the Merck Veterinary Manual and the 2021 AAHA guidelines start from the resting energy requirement, 70 × (weight in kg)^0.75 kcal a day, and multiply it by a factor for the dog’s status: neutered, intact, inactive, on a weight-loss plan, or a puppy.',
          'Breed is not a term in either. Two breeds of the same weight and status get the same starting figure.',
        ],
      },
      {
        id: 'no-factors',
        heading: 'Why there are no breed factors here',
        paragraphs: [
          'The team found no primary veterinary source that gives breed factors, so none is used. A page that lists a different number per breed is either rounding a weight table or inventing one.',
        ],
      },
      {
        id: 'adjust',
        heading: 'What to do with your breed',
        paragraphs: [
          'Merck says any figure is a starting point and a dog may need 30% more or less. Enter your dog’s real weight, then weigh it every few weeks and adjust with your veterinarian. For a dog on a weight-loss plan, enter its ideal weight.',
        ],
      },
    ],
    calculators: [hrefOf('dog'), hrefOf('puppy')],
    sources: [MERCK, AAHA],
    card: {
      title: 'Dog food by breed',
      summary: 'Why the formula uses weight and status, not breed.',
    },
  },
  CHOCOLATE_GUIDE,
];

/** The guide at `path`. */
export const guideOf = (path: string): Guide => {
  const guide = GUIDES.find((candidate) => candidate.path === path);
  if (guide === undefined) throw new Error(`no guide ${path}`);
  return guide;
};
