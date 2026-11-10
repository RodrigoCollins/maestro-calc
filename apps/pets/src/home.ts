import { FOOD_HUB, FOOD_PAGES } from './can-dogs-eat.ts';
import { CAT_YEARS_PAGES } from './cat-years.ts';
import { CHARTS, CHARTS_INDEX } from './charts.ts';
import { FEED_HUB, FEED_PAGES } from './feed-by-weight.ts';
import { CATS_HUB, DOGS_HUB, PLANT_PAGES, SAFE_HUB } from './toxic-plants.ts';
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
  {
    href: hrefOf('cat-age'),
    title: 'Cat age in human years',
    summary: 'Cat years to human years, the life stage and the vet visits.',
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
    catAge:
      'A cat is about 15 in human years at 1 and 24 at 2, then adds about 4 a year, on the veterinary table. Pick an age:',
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

/** The cat years pages, one link per age: the home leads to every one of them. */
export const HOME_CAT_AGES: readonly {
  readonly href: string;
  readonly age: number;
  readonly label: string;
}[] = CAT_YEARS_PAGES.map(({ path, age }) => ({
  href: path,
  age,
  label: `${String(age)} ${age === 1 ? 'year' : 'years'} in cat years`,
}));

/** The closing line of the home that links who makes the site and what it collects. */
export const HOME_TRUST = {
  text: 'Who writes and checks these pages, and what the site collects when you use it:',
  links: [
    { href: hrefOf('about'), label: 'about Bowl Figures' },
    { href: hrefOf('privacy'), label: 'privacy' },
  ],
} as const;

/** One link of the Guides and data list. */
export interface HomeGuide {
  readonly href: string;
  readonly title: string;
  readonly summary: string;
}

/** The guides and data pages the home lists, every one of them. */
export const HOME_GUIDES: readonly HomeGuide[] = [
  {
    href: FEED_HUB.path,
    title: 'How much should I feed my dog?',
    summary: `The steps, the factors and ${String(FEED_PAGES.length)} weights from 10 to 100 lb, worked out.`,
  },
  ...GUIDES.map(({ path, card }) => ({ href: path, ...card })),
  ...CHARTS.map(({ path, card }) => ({ href: path, ...card })),
  {
    href: CHARTS_INDEX.path,
    title: 'Data and charts',
    summary: 'All the tables in one place.',
  },
  {
    href: FOOD_HUB.path,
    title: 'Can dogs eat it?',
    summary: `${String(FOOD_PAGES.length)} human foods, from grapes to rice, each with a sourced verdict.`,
  },
  {
    href: CATS_HUB.path,
    title: 'Plants toxic to cats',
    summary: `Lilies first, then ${String(PLANT_PAGES.length - 1)} more plants checked against the ASPCA list.`,
  },
  {
    href: DOGS_HUB.path,
    title: 'Plants toxic to dogs',
    summary: 'Sago palms, bulbs and oleander, and the plants only cats react to.',
  },
  {
    href: SAFE_HUB.path,
    title: 'Pet-safe houseplants',
    summary: `${String(SAFE_HUB.rows.length)} plants the ASPCA lists as non-toxic to cats and dogs.`,
  },
];
