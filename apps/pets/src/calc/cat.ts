import { bowlSvg, kibbleCount } from '../bowl.ts';
import { amountText, cupsText, kcalText, quarterCups } from '../format.ts';
import type { FeedingPage } from './dog.ts';
import { figureOf, type Patch, type View } from './view.ts';

const STATUS_COPY = {
  neutered: 'Neutered adult',
  intact: 'Intact adult',
  inactive: 'Inactive or prone to weight gain',
  'weight-loss': 'On a weight-loss plan (use the ideal weight)',
  kitten: 'Kitten',
} as const;

const FIELDS = {
  weight: { label: 'Your cat’s weight' },
  unit: { label: 'Unit', options: { lb: 'pounds', kg: 'kilograms' } },
  status: { label: 'Life stage and status', options: STATUS_COPY },
  dryKcal: { label: 'Dry food: calories per cup' },
  wetKcal: { label: 'Wet food: calories per can' },
  wetShare: { label: 'Share of the calories from wet food (%)' },
} as const;

const VET =
  'A starting point, not a prescription: Merck says a cat may need 30% more or less. Check the amount with your veterinarian and weigh your cat every few weeks.';
const TREATS =
  'Complete and balanced food should be at least 90% of the day and treats at most 10% (AAHA, 2021). On a day with treats, feed 90% of each amount.';

/** The cat food calculator, dry by the cup and wet by the can. */
export const CAT_PAGE: FeedingPage = {
  path: '/cat-food-calculator',
  title: 'Cat Food Calculator: Calories, Cups and Cans | Bowl Figures',
  description:
    'How many calories a day a cat needs, and how many cups of dry food or cans of wet food give them, from the Merck and AAHA energy factors and your labels.',
  kicker: 'Cats · free',
  h1: 'Cat food calculator',
  lead: 'Enter your cat’s weight and the calorie lines from the bags and cans. Feed dry, wet, or a mix: you get the cups and the cans.',
  fields: FIELDS,
  initial: {
    weight: '10',
    unit: 'lb',
    status: 'neutered',
    dryKcal: '350',
    wetKcal: '80',
    wetShare: '0',
  },
  notes: [VET, TREATS],
};

/** The kitten feeding calculator: the cat engine at a kitten's weight and factor of 2.5. */
export const KITTEN_PAGE: FeedingPage = {
  path: '/kitten-feeding-calculator',
  title: 'Kitten Feeding Calculator: How Much to Feed | Bowl Figures',
  description:
    'How much to feed a kitten a day: calories, cups of dry food and cans of wet food from its weight and your labels. Factor 2.5 from Merck and AAHA.',
  kicker: 'Kittens · free',
  h1: 'Kitten feeding calculator',
  lead: 'Enter your kitten’s weight and the calorie lines of its food. A kitten needs 2.5 times its resting calories.',
  fields: { ...FIELDS, weight: { label: 'Your kitten’s weight' } },
  initial: {
    weight: '2',
    unit: 'lb',
    status: 'kitten',
    dryKcal: '350',
    wetKcal: '80',
    wetShare: '0',
  },
  notes: [
    'The Merck Veterinary Manual notes that kittens can alternatively be fed free choice. Ask your veterinarian which suits your kitten, and weigh it every week or two.',
    VET,
  ],
};

/** The result of the cat food calculator: the bowl for the cups, the can for the wet share. */
export const catView: View = (figures): Patch => {
  const mer = figureOf(figures, 'mer');
  const cups = figureOf(figures, 'cups');
  const cans = figureOf(figures, 'cans');
  return {
    text: {
      figure: cupsText(quarterCups(cups.toNumber())),
      unit: 'cups of dry food a day',
      exact: `${amountText(cups, 2)} cups exactly`,
      canFigure: cupsText(quarterCups(cans.toNumber())),
      canUnit: 'cans of wet food a day',
      canExact: `${amountText(cans, 2)} cans exactly`,
      kcal: kcalText(mer),
      treats: kcalText(figureOf(figures, 'treats')),
      range: `${kcalText(figureOf(figures, 'low'))} to ${kcalText(figureOf(figures, 'high'))}`,
    },
    html: { bowl: bowlSvg(kibbleCount(mer.toNumber())) },
    // the dry figure shows while any calories come from dry food, the wet one while any come from cans
    show: { dry: cups.sign() === 1, wet: cans.sign() === 1 },
    vars: {},
    flags: {},
  };
};
