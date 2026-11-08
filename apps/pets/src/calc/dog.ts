import { Rational } from '@maestro-calc/core';
import { bowlSvg, kibbleCount } from '../bowl.ts';
import { amountText, cupsText, kcalText, quarterCups } from '../format.ts';
import { figureOf, type Patch, type Raw, type View } from './view.ts';

/** The words around one field of a form: its label and, for a choice, the text of each option. */
export interface FieldCopy {
  readonly label: string;
  readonly options?: Readonly<Record<string, string>>;
}

/** The copy of a feeding page: its head, its form and the notes under the result. */
export interface FeedingPage {
  readonly path: string;
  readonly title: string;
  readonly description: string;
  readonly kicker: string;
  readonly h1: string;
  readonly lead: string;
  readonly fields: Readonly<Record<string, FieldCopy>>;
  /** The starting values of the form: the engine's own defaults unless a preset page overrides them. */
  readonly initial: Readonly<Record<string, string>>;
  readonly notes: readonly string[];
}

const STATUS_COPY = {
  neutered: 'Neutered adult',
  intact: 'Intact adult',
  inactive: 'Inactive or prone to weight gain',
  'weight-loss': 'On a weight-loss plan (use the ideal weight)',
  'puppy-young': 'Puppy under 4 months',
  'puppy-older': 'Puppy 4 months or older',
} as const;

const FIELDS = {
  weight: { label: 'Your dog’s weight' },
  unit: { label: 'Unit', options: { lb: 'pounds', kg: 'kilograms' } },
  status: { label: 'Life stage and status', options: STATUS_COPY },
  basis: {
    label: 'The label gives calories per',
    options: { cup: 'cup', kg: 'kilogram', can: 'can' },
  },
  kcal: { label: 'Calories on the label' },
} as const satisfies Record<string, FieldCopy>;

const VET =
  'A starting point, not a prescription: Merck says a dog may need 30% more or less. Check the amount with your veterinarian and weigh your dog every few weeks.';
const TREATS =
  'Complete and balanced food should be at least 90% of the day and treats at most 10% (AAHA, 2021). On a day with treats, feed 90% of the amount.';

/** The dog food calculator, "how much should I feed my dog". */
export const DOG_PAGE: FeedingPage = {
  path: '/dog-food-calculator',
  title: 'Dog Food Calculator: Cups and Calories a Day | Bowl Figures',
  description:
    'How many cups of your dog’s food, and how many calories, to feed a day. Worked from the Merck and AAHA energy factors and the calorie line on your bag.',
  kicker: 'Dogs · free',
  h1: 'Dog food calculator',
  lead: 'Enter your dog’s weight and the calorie line from the bag. You get the calories a day and the cups, grams or cans that give them.',
  fields: FIELDS,
  initial: { weight: '40', unit: 'lb', status: 'neutered', basis: 'cup', kcal: '360' },
  notes: [VET, TREATS],
};

/** The puppy feeding calculator: the dog engine at a puppy's weight and factor of 3.0. */
export const PUPPY_PAGE: FeedingPage = {
  path: '/puppy-feeding-calculator',
  title: 'Puppy Feeding Calculator: How Much to Feed a Puppy | Bowl Figures',
  description:
    'How much to feed a puppy a day: calories and cups from its weight and your puppy food’s label. Factor 3.0 under 4 months, 2.0 from 4 months (Merck, AAHA).',
  kicker: 'Puppies · free',
  h1: 'Puppy feeding calculator',
  lead: 'Enter your puppy’s weight and the calorie line from the puppy food. A puppy under 4 months needs 3 times its resting calories, and from 4 months 2 times.',
  fields: { ...FIELDS, weight: { label: 'Your puppy’s weight' } },
  initial: { weight: '8', unit: 'lb', status: 'puppy-young', basis: 'cup', kcal: '360' },
  notes: [
    'A puppy grows fast, so weigh it every week or two and ask your veterinarian to check the amount as it grows.',
    VET,
  ],
};

/** The words of the amount per label basis: the unit, and the unit of the exact figure. */
const BASIS = {
  cup: { unit: 'cups a day', exact: 'cups' },
  kg: { unit: 'grams a day', exact: 'g' },
  can: { unit: 'cans a day', exact: 'cans' },
} as const;

type Basis = keyof typeof BASIS;

const basisOf = (raw: Raw): Basis => {
  const basis = raw['basis'];
  return basis === 'kg' || basis === 'can' ? basis : 'cup';
};

/** The amount of food as a page writes it: the figure to the nearest quarter, or gram, and the exact one. */
const amountOf = (basis: Basis, portion: Rational): { figure: string; exact: string } => {
  const words = BASIS[basis];
  if (basis === 'kg') {
    return {
      figure: amountText(portion, 0),
      exact: `${amountText(portion, 1)} ${words.exact}`,
    };
  }
  return {
    figure: cupsText(quarterCups(portion.toNumber())),
    exact: `${amountText(portion, 2)} ${words.exact}`,
  };
};

/** The result of the dog food calculator: the bowl, the figure and its chips. */
export const dogView: View = (figures, raw): Patch => {
  const basis = basisOf(raw);
  const { figure, exact } = amountOf(basis, figureOf(figures, 'portion'));
  const withTreats = amountOf(basis, figureOf(figures, 'portionWithTreats'));
  const mer = figureOf(figures, 'mer');
  return {
    text: {
      figure,
      unit: BASIS[basis].unit,
      exact: `${exact} exactly`,
      kcal: kcalText(mer),
      treats: kcalText(figureOf(figures, 'treats')),
      withTreats: `${withTreats.figure} ${BASIS[basis].exact}`,
      range: `${kcalText(figureOf(figures, 'low'))} to ${kcalText(figureOf(figures, 'high'))}`,
    },
    html: { bowl: bowlSvg(kibbleCount(mer.toNumber())) },
    show: {},
    vars: {},
    flags: {},
  };
};
