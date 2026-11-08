import { CALCULATORS } from './calculators.ts';
import { PLANTING_GUIDE, SPECIES_GUIDES } from './seed-guides.ts';

export { PLANTING_GUIDE, seedRateText, SPECIES_GUIDES, type SpeciesGuide } from './seed-guides.ts';

/** A source a guide cites: its name as cited and its address. */
export interface GuideSource {
  readonly name: string;
  readonly url: string;
}

/** One block of a guide: a heading, paragraphs, and optionally a list of short items. */
export interface GuideSection {
  readonly id: string;
  readonly heading: string;
  readonly paragraphs: readonly string[];
  readonly items?: readonly string[];
  /** Pages of the site the section points to, listed under it. */
  readonly links?: readonly { readonly href: string; readonly label: string }[];
}

/** A question the guide answers in full. */
export interface GuideQuestion {
  readonly question: string;
  readonly answer: string;
}

export interface Guide {
  readonly id: string;
  readonly path: string;
  readonly title: string;
  readonly description: string;
  readonly h1: string;
  readonly lead: string;
  /** The day its figures were last checked against its sources (`YYYY-MM-DD`). */
  readonly checked: string;
  readonly sections: readonly GuideSection[];
  readonly questions: readonly GuideQuestion[];
  readonly sources: Readonly<Record<string, GuideSource>>;
  /** The calculators it explains, by path: each links it back. */
  readonly calculators: readonly string[];
  /** The home card. */
  readonly card: { readonly title: string; readonly summary: string };
}

const PURDUE = {
  name: 'Purdue Extension AY-22-W, “Fertilizing Established Cool-season Lawns” (2013)',
  url: 'https://www.extension.purdue.edu/extmedia/ay/ay-22-w.pdf',
};
const VIRGINIA = {
  name: 'Virginia Cooperative Extension 426-718, “Establishing Lawns” (2009)',
  url: 'https://vtechworks.lib.vt.edu/bitstreams/b0fdf313-cafa-4f60-a85b-68637d6bbd3c/download',
};
const NOAA = {
  name: 'NOAA NCEI U.S. Climate Normals 1991-2020, annual/seasonal product',
  url: 'https://www.ncei.noaa.gov/data/normals-annualseasonal/1991-2020/access/',
};

/** When to fertilize and seed: what the extension sources say, and how to find your frost dates. */
export const TIMING_GUIDE: Guide = {
  id: 'timing-guide',
  path: '/when-to-fertilize-and-seed-your-lawn',
  title: 'When to Fertilize and Seed Your Lawn | Lawn Figures',
  description:
    'When cool-season lawns are fed and seeded, from Purdue and Virginia Cooperative Extension, and how to find the frost dates of your own station.',
  h1: 'When to fertilize and seed your lawn',
  lead: 'Two extension publications answer this for cool-season lawns: Purdue for fertilizer and Virginia Cooperative Extension for seed. This page gives what they say, in their words and numbers, and points to the frost dates of the station nearest to you.',
  checked: '2026-11-07',
  sections: [
    {
      id: 'fertilize',
      heading: 'When to fertilize a cool-season lawn',
      paragraphs: [
        'Purdue Extension says cool-season grasses (bluegrasses, fescues and ryegrasses) benefit most when most of the nitrogen goes on from late summer through autumn. That promotes summer recovery, shoot density and color, and prepares the turf for winter, without a growth surge.',
        'It advises applying less nitrogen during the spring growth flush, using slow-release fertilizer when you do, and little to none in summer except where you water often or remove clippings.',
      ],
      items: [
        'Late August through early November: up to 1 lb of N per 1,000 sq ft each month, to build density.',
        'Early October until early December: mostly water-soluble N at 0.5 to 0.75 lb per 1,000 sq ft about every three weeks.',
        'Any single application: no more than 1.0 lb of actual N per 1,000 sq ft, unless more than half of the N is slow-release.',
      ],
    },
    {
      id: 'seed',
      heading: 'When to seed a new cool-season lawn',
      paragraphs: [
        'Virginia Cooperative Extension says cool-season turfgrasses are best seeded in late summer, because early spring seedings are prone to crabgrass and summer drought. For Virginia it gives two windows by region.',
      ],
      items: [
        'Northern Piedmont and areas in and west of the Blue Ridge: August 15 to September 15, or March to early April.',
        'Southern Piedmont and Eastern Virginia: September 1 to October 15, or February and March.',
        'Warm-season grasses (bermudagrass, zoysiagrass) are best established from May to July.',
      ],
    },
    {
      id: 'frost',
      heading: 'Your frost dates',
      paragraphs: [
        'These sources give windows for their own region, so use them as a pattern rather than a calendar. To place the windows on your own, look up the last spring and first fall freeze of the weather station nearest to you in the NOAA 1991-2020 normals.',
        'Each state page lists every station with the dates at the 10, 50 and 90 percent levels, and a ZIP lookup finds the nearest one. The 50 percent date is the middle case; the sources above do not tie their windows to a frost date, so this page does not either.',
      ],
    },
    {
      id: 'amounts',
      heading: 'How much to put down',
      paragraphs: [
        'The fertilizer calculator turns the numbers on the bag into pounds for your lawn, and the grass seed calculator gives the pounds of seed at the rates of two extension sources, half sown in each direction.',
      ],
    },
  ],
  questions: [
    {
      question: 'When is the best time to fertilize a cool-season lawn?',
      answer:
        'Purdue Extension says cool-season grasses benefit most when most of the nitrogen is applied from late summer through autumn, with less in the spring growth flush and little to none in summer.',
    },
    {
      question: 'When should I seed a new cool-season lawn?',
      answer:
        'Virginia Cooperative Extension says cool-season turfgrasses are best seeded in late summer, because early spring seedings are prone to crabgrass and summer drought. Its Virginia windows are August 15 to September 15 in the Northern Piedmont and west, and September 1 to October 15 in the Southern Piedmont and Eastern Virginia.',
    },
    {
      question: 'How much nitrogen can I put on at once?',
      answer:
        'Purdue Extension says not to apply more than 1.0 pound of actual water-soluble nitrogen per 1,000 square feet in any single application.',
    },
  ],
  sources: { purdue: PURDUE, virginia: VIRGINIA, noaa: NOAA },
  calculators: ['/lawn-fertilizer-calculator', '/grass-seed-calculator'],
  card: {
    title: 'When to fertilize and seed your lawn',
    summary:
      'What Purdue and Virginia Cooperative Extension say, and where to find your frost dates.',
  },
};

/** Every guide of the site, in the order of the footer. */
export const GUIDES: readonly Guide[] = [TIMING_GUIDE, PLANTING_GUIDE, ...SPECIES_GUIDES];

/** The guide at `path`; any other path throws at build time. */
export const guideAt = (path: string): Guide => {
  const guide = GUIDES.find((candidate) => candidate.path === path);
  if (guide === undefined) throw new Error(`no guide at ${path}`);
  return guide;
};

/** The guides that explain the calculator at `path`. */
export const guidesOf = (path: string): readonly Guide[] =>
  GUIDES.filter(({ calculators }) => calculators.includes(path));

/** The calculators a guide explains, as their pages. */
export const calculatorsOf = (guide: Guide) =>
  CALCULATORS.filter(({ path }) => guide.calculators.includes(path));
