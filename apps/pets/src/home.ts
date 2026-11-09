import { CHARTS, CHARTS_INDEX } from './charts.ts';
import { AGE_PAGES } from './dog-years.ts';
import { GUIDES } from './guides.ts';
import { hrefOf } from './routes.ts';

/** One calculator card of the home: its page, a short title and what it works out. */
export interface HomeTool {
  readonly href: string;
  readonly title: string;
  readonly summary: string;
}

/** The calculators the home lists, the dog first: the keyword people come for. */
export const HOME_TOOLS: readonly HomeTool[] = [
  {
    href: hrefOf('dog'),
    title: 'Dog food',
    summary: 'Calories and cups a day from your dog’s weight and the label.',
  },
  {
    href: hrefOf('cat'),
    title: 'Cat food',
    summary: 'Calories, cups of dry and cans of wet food a day.',
  },
  {
    href: hrefOf('puppy'),
    title: 'Puppy feeding',
    summary: 'The 3.0 and 2.0 puppy factors, worked into cups.',
  },
  {
    href: hrefOf('kitten'),
    title: 'Kitten feeding',
    summary: 'A kitten’s calories at 2.5 times its resting need.',
  },
  {
    href: hrefOf('chocolate'),
    title: 'Dog chocolate toxicity',
    summary: 'The dose in mg/kg against the bands of 20, 40 and 60.',
  },
  {
    href: hrefOf('due-date'),
    title: 'Dog pregnancy due date',
    summary: 'The window of dates the litter is due.',
  },
  {
    href: hrefOf('dog-age'),
    title: 'Dog age in human years',
    summary: 'Dog years to human years by size, and back.',
  },
];

/** The words of the home. */
export const HOME_TEXTS = {
  title: 'Bowl Figures: Dog and Cat Feeding Calculators',
  description:
    'Free dog and cat feeding calculators: calories and cups a day from the label, chocolate toxicity, a due date window and dog years to human years.',
  h1: 'How much should I feed my pet?',
  lead: 'Enter the weight and the calorie line on the bag. Every figure shows its formula and its veterinary source.',
  heroNote: 'Today’s bowl: a neutered 40 lb dog on food of 360 kcal a cup.',
  teasers: {
    chocolate:
      'Your dog ate chocolate? Find the dose against Merck’s bands, then call your veterinarian or the ASPCA poison line.',
    dueDate: 'A window of dates from the breeding day, the LH surge or the first day of diestrus.',
    cat: 'Dry by the cup, wet by the can, or a mix, from your labels.',
    dogAge:
      'Not seven to one: a dog is about 15 in human years at 1 and 24 at 2, then ages faster the bigger it is. Pick an age:',
  },
} as const;

/** The dog years pages, one link per age: the home leads to every one of them. */
export const HOME_AGES: readonly {
  readonly href: string;
  readonly age: number;
  readonly label: string;
}[] = AGE_PAGES.map(({ path, age }) => ({
  href: path,
  age,
  label: `${String(age)} ${age === 1 ? 'year' : 'years'} in dog years`,
}));

/** One link of the Guides and data list. */
export interface HomeGuide {
  readonly href: string;
  readonly title: string;
  readonly summary: string;
}

/** The guides and data pages the home lists, every one of them. */
export const HOME_GUIDES: readonly HomeGuide[] = [
  ...GUIDES.map(({ path, card }) => ({ href: path, ...card })),
  ...CHARTS.map(({ path, card }) => ({ href: path, ...card })),
  {
    href: CHARTS_INDEX.path,
    title: 'Data and charts',
    summary: 'All the tables in one place.',
  },
];
