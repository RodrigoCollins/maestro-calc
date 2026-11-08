import { CALCULATORS } from './calculators.ts';
import { GUIDES } from './guide.ts';

/** One calculator card of the home: its page, a short title and what it works out. */
export interface HomeTool {
  readonly href: string;
  readonly title: string;
  readonly summary: string;
}

const SUMMARIES: Readonly<Record<string, string>> = {
  'lawn-fertilizer': 'The N-P-K numbers on the bag to pounds for the spreader.',
  'grass-seed': 'Pounds of seed for a new lawn, half sown each way.',
  sod: 'Square feet, pallets and slabs, with the waste you set.',
  'lawn-lime': 'Your soil test recommendation to pounds of lime.',
};

/** The calculators the home lists, fertilizer first: the highest-volume search. */
export const HOME_TOOLS: readonly HomeTool[] = CALCULATORS.map(({ id, path, name }) => ({
  href: path,
  title: name,
  summary: SUMMARIES[id] ?? '',
}));

/** What the home says. */
export const HOME = {
  title: 'Lawn Figures: Fertilizer, Seed, Sod and Lime Calculators',
  description:
    'Free lawn calculators that turn extension rates into pounds and bags, and NOAA frost dates for every state with a ZIP lookup. Every formula and source shown.',
  kicker: 'Lawn calculators with the sources shown',
  h1: 'Lawn Figures',
  lead: 'Extension services publish lawn rates per 1,000 square feet and leave the conversion to you. Type what is on your bag and the size of your lawn, and get pounds for the spreader.',
  toolsHeading: 'Calculators',
  frostHeading: 'Frost dates',
  frostText:
    'Last spring and first fall 32°F freeze at the 10, 50 and 90 percent levels, from the NOAA 1991-2020 normals, for every state. Type your ZIP and find the nearest weather station.',
  frostLink: 'Find your frost dates',
  guidesHeading: 'Guides',
  mathHeading: 'The math is on the page',
  mathText:
    'Every page shows its formula and names its source with an address, and the limit a source sets is shown, never exceeded.',
  mathLink: 'How we work it out',
  moreHeading: 'The other half of the yard',
  moreText: 'Mulch, gravel, topsoil and area are on Maestro Calc, made by the same team.',
} as const;

/** The guides as the home lists them: a title and its summary. */
export const HOME_GUIDES = GUIDES.map(({ path, card }) => ({
  href: path,
  title: card.title,
  summary: card.summary,
}));

/** The header navigation: the calculators and the frost dates. */
export const navOf = (): readonly { readonly href: string; readonly title: string }[] => [
  ...HOME_TOOLS.map(({ href, title }) => ({ href, title })),
  { href: '/frost-dates', title: 'Frost dates' },
];
