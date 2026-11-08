import { canonicalUrl } from '@maestro-calc/site-kit/canonical';
import { ABOUT } from './about.ts';
import { CHARTS, CHARTS_INDEX } from './charts.ts';
import { CAT_PAGE, KITTEN_PAGE } from './calc/cat.ts';
import { CHOCOLATE_PAGE } from './calc/chocolate.ts';
import { DOG_PAGE, PUPPY_PAGE } from './calc/dog.ts';
import { DUE_DATE_PAGE } from './calc/due-date.ts';
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
  'Free dog and cat feeding calculators in US units: calories and cups, grams or cans a day from the pet’s weight and the calorie line on its food label, dog chocolate toxicity in mg/kg, and a dog pregnancy due date window. Every figure shows its formula and its source: the Merck Veterinary Manual, the AAHA guidelines or AAFCO.';

const DETAILS =
  'Each figure is a starting point to check with the pet’s veterinarian. The methodology page gives the formulas, the sources with the day they were read, and hand-worked cases for every calculator. Every chocolate result tells the reader to call a veterinarian or a poison line.';

const CALCULATORS: readonly Entry[] = [
  DOG_PAGE,
  CAT_PAGE,
  PUPPY_PAGE,
  KITTEN_PAGE,
  CHOCOLATE_PAGE,
  DUE_DATE_PAGE,
].map(({ path, h1, description }) => ({ name: h1, path, note: description }));

const READING: readonly Entry[] = [
  ...GUIDES.map(({ path, h1, description }) => ({ name: h1, path, note: description })),
  ...CHARTS.map(({ path, h1, description }) => ({ name: h1, path, note: description })),
  { name: CHARTS_INDEX.h1, path: CHARTS_INDEX.path, note: CHARTS_INDEX.description },
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
