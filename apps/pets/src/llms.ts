import { canonicalUrl } from '@maestro-calc/site-kit/canonical';
import { ABOUT } from './about.ts';
import { CAT_YEARS_PAGES } from './cat-years.ts';
import { CHARTS, CHARTS_INDEX } from './charts.ts';
import { CAT_AGE_PAGE } from './calc/cat-age.ts';
import { CAT_PAGE, KITTEN_PAGE } from './calc/cat.ts';
import { CHOCOLATE_PAGE } from './calc/chocolate.ts';
import { DOG_AGE_PAGE } from './calc/dog-age.ts';
import { DOG_PAGE, PUPPY_PAGE } from './calc/dog.ts';
import { DUE_DATE_PAGE } from './calc/due-date.ts';
import { FOOD_HUB, FOOD_PAGES } from './can-dogs-eat.ts';
import { CATS_HUB, DOGS_HUB, PLANT_PAGES, SAFE_HUB } from './toxic-plants.ts';
import { AGE_PAGES } from './dog-years.ts';
import { EDITORIAL } from './editorial.ts';
import { GUIDES } from './guides.ts';
import { SITE } from './site.config.ts';

/** One line of a section: a page by its canonical address and what it holds. */
interface Entry {
  readonly name: string;
  readonly path: string;
  readonly note: string;
}

const SUMMARY =
  'Free dog and cat feeding calculators in US units: calories and cups, grams or cans a day from the pet’s weight and the calorie line on its food label, dog chocolate toxicity in mg/kg, a dog pregnancy due date window, and a dog’s age in human years by size or a cat’s with its life stage. Every figure shows its formula and its source: the Merck Veterinary Manual, AVMA, the AAHA and AAFP guidelines or AAFCO.';

const DETAILS =
  'Each figure is a starting point to check with the pet’s veterinarian. The methodology page gives the formulas, the sources with the day they were read, and hand-worked cases for every calculator. Every chocolate result tells the reader to call a veterinarian or a poison line.';

const CALCULATORS: readonly Entry[] = [
  DOG_PAGE,
  CAT_PAGE,
  PUPPY_PAGE,
  KITTEN_PAGE,
  CHOCOLATE_PAGE,
  DUE_DATE_PAGE,
  DOG_AGE_PAGE,
  CAT_AGE_PAGE,
].map(({ path, h1, description }) => ({ name: h1, path, note: description }));

const READING: readonly Entry[] = [
  ...GUIDES.map(({ path, h1, description }) => ({ name: h1, path, note: description })),
  ...CHARTS.map(({ path, h1, description }) => ({ name: h1, path, note: description })),
  { name: CHARTS_INDEX.h1, path: CHARTS_INDEX.path, note: CHARTS_INDEX.description },
  ...AGE_PAGES.map(({ path, h1, description }) => ({ name: h1, path, note: description })),
  ...CAT_YEARS_PAGES.map(({ path, h1, description }) => ({ name: h1, path, note: description })),
  { name: FOOD_HUB.h1, path: FOOD_HUB.path, note: FOOD_HUB.description },
  ...FOOD_PAGES.map(({ path, h1, description }) => ({ name: h1, path, note: description })),
  ...[CATS_HUB, DOGS_HUB, SAFE_HUB].map(({ path, h1, description }) => ({
    name: h1,
    path,
    note: description,
  })),
  ...PLANT_PAGES.map(({ path, h1, description }) => ({ name: h1, path, note: description })),
];

const ABOUT_PAGES: readonly Entry[] = [
  {
    name: 'How we work it out',
    path: '/methodology',
    note: 'The formulas, sources and worked examples behind every calculator.',
  },
  { name: 'About', path: '/about', note: ABOUT.description },
  { name: 'Editorial policy', path: '/editorial-policy', note: EDITORIAL.description },
];

const section = (heading: string, entries: readonly Entry[]): string =>
  [
    `## ${heading}`,
    '',
    ...entries.map(
      ({ name, path, note }) => `- [${name}](${canonicalUrl(path, SITE.origin)}): ${note}`,
    ),
  ].join('\n');

/** The `/llms.txt` of the site (llmstxt.org): a title, a summary, and the pages by section. */
export const llmsTxt = (): string =>
  [
    `# ${SITE.name}`,
    '',
    `> ${SUMMARY}`,
    '',
    DETAILS,
    '',
    section('Calculators', CALCULATORS),
    '',
    section('Guides and data', READING),
    '',
    section('About', ABOUT_PAGES),
    '',
  ].join('\n');
