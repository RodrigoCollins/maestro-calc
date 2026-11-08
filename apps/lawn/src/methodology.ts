import { FROST_SOURCE } from '@maestro-calc/lawn-data/frost/source';
import { CALCULATORS } from './calculators.ts';
import type { CalculatorId } from './view.ts';

/** The day every source below was read for this page (`YYYY-MM-DD`). */
export const SOURCES_CHECKED = '2026-11-07';

/** A source of a section: its name as it is cited, and its address. */
export interface MethodSource {
  readonly name: string;
  readonly url?: string;
}

/** A hand-verified case: the inputs, the working, and the figure the page must give. */
export interface MethodCase {
  readonly text: string;
  readonly raw: Readonly<Record<string, string>>;
  /** The `data-v` hook of the figure (`src/view.ts`). */
  readonly v: string;
  readonly result: string;
  readonly unit: string;
}

export interface MethodSection {
  readonly id: string;
  readonly title: string;
  readonly href: string;
  /** The calculator the cases run through, or `undefined` for the frost data section. */
  readonly calculator?: CalculatorId;
  readonly method: string;
  readonly note: string;
  readonly sources: readonly MethodSource[];
  readonly cases: readonly MethodCase[];
}

const PURDUE_CALC = {
  name: 'Purdue University turf program, “Calculating the pounds of fertilizer to apply” (Zac Reicher, 2004)',
  url: 'https://turf.purdue.edu/calculating-the-pounds-of-fertilizer-to-apply/',
};
const PSU_CALC = {
  name: 'Penn State Extension, “Calculations used to determine the amount of fertilizer needed to treat turf” (Peter Landschoot, updated October 2025)',
  url: 'https://extension.psu.edu/calculations-used-to-determine-the-amount-of-fertilizer-needed-to-treat-turf',
};
const PURDUE_AY22 = {
  name: 'Purdue Extension AY-22-W, “Fertilizing Established Cool-season Lawns” (Bigelow, Camberato and Patton, 2013)',
  url: 'https://www.extension.purdue.edu/extmedia/ay/ay-22-w.pdf',
};
const VIRGINIA = {
  name: 'Virginia Cooperative Extension 426-718, “Establishing Lawns” (2009)',
  url: 'https://vtechworks.lib.vt.edu/bitstreams/b0fdf313-cafa-4f60-a85b-68637d6bbd3c/download',
};
const TENNESSEE = {
  name: 'University of Tennessee Extension W160-B, “Turfgrass Establishment: Seeding” (Samples and Sorochan, 2007)',
  url: 'https://uthort.tennessee.edu/wp-content/uploads/sites/228/2023/11/W160-B.pdf',
};
const ARKANSAS = {
  name: 'University of Arkansas MP476, “Establishing Seeded Zoysiagrass on Lawns and Golf Courses” (Aaron Patton)',
  url: 'https://www.uaex.uada.edu/publications/PDF/MP476.pdf',
};
const PSU_LIME = {
  name: 'Penn State Agricultural Analytical Services Lab, “Lime recommendations, turf”',
  url: 'https://agsci.psu.edu/aasl/soil-testing/fertility/handbooks/turf/tables/lime-recommendations-turf',
};

export const NORMALS_SOURCES: readonly MethodSource[] = [
  { name: FROST_SOURCE.normals.name, url: FROST_SOURCE.normals.dataUrl },
  {
    name: 'NOAA NCEI, U.S. Climate Normals annual/seasonal product documentation',
    url: FROST_SOURCE.normals.documentationUrl,
  },
  {
    name: 'NOAA NCEI, normals calculation methodology (the meaning of the 10, 50 and 90 percent probabilities)',
    url: FROST_SOURCE.normals.methodologyUrl,
  },
  {
    name: 'NC State Extension, “Interpreting freeze/frost probabilities from the National Centers for Environmental Information”',
    url: FROST_SOURCE.normals.interpretationUrl,
  },
  {
    name: 'U.S. Census Bureau, 2020 ZCTA gazetteer (the point of each ZIP Code Tabulation Area)',
    url: FROST_SOURCE.census.gazetteerUrl,
  },
  {
    name: 'U.S. Census Bureau, 2020 ZCTA to county relationship file (the state of each ZCTA)',
    url: FROST_SOURCE.census.relationshipUrl,
  },
];

const pageOf = (id: CalculatorId) => {
  const page = CALCULATORS.find((candidate) => candidate.id === id);
  if (page === undefined) throw new Error(`no calculator ${id}`);
  return page;
};

/** How each calculator works it out: the page's own formula and note, its sources and its cases. */
export const METHOD_SECTIONS: readonly MethodSection[] = [
  {
    id: 'fertilizer',
    title: 'Lawn fertilizer',
    href: pageOf('lawn-fertilizer').path,
    calculator: 'lawn-fertilizer',
    method: pageOf('lawn-fertilizer').method,
    note: 'Purdue limits one application of water-soluble nitrogen to 1.0 lb of N per 1,000 sq ft, and mature cool-season lawns need 1 to 5 lb of N a year; the page warns above 1.0 and never suggests more. The sources round before they divide, so their coverage figures differ slightly from the exact ones here, as each case says.',
    sources: [PURDUE_CALC, PSU_CALC, PURDUE_AY22],
    cases: [
      {
        text: 'Purdue, 0.75 lb of N from a 16-8-8 bag on 8,000 sq ft: 0.75 ÷ 0.16 = 4.6875 lb per 1,000 sq ft (the source rounds it to 4.69), and × 8 = 37.5 lb (the source gives 37 after rounding). Total product:',
        raw: {
          area: '8000',
          nitrogen: '16',
          phosphate: '8',
          potash: '8',
          target: '0.75',
          bag: '50',
        },
        v: 'pounds',
        result: '37.5',
        unit: 'lb',
      },
      {
        text: 'Penn State, 1.0 lb of N from a 26-5-10 bag: 1 ÷ 0.26 = 3.846 lb per 1,000 sq ft (the source gives 3.8). Product per 1,000 sq ft:',
        raw: { area: '1000', nitrogen: '26', phosphate: '5', potash: '10', bag: '50' },
        v: 'perThousand',
        result: '3.8',
        unit: 'lb',
      },
      {
        text: 'The same bag in 50 lb: 50 ÷ 3.846 × 1,000 = 13,000 sq ft (the source divides by the rounded 3.8 and gives 13,200). One bag covers:',
        raw: { area: '1000', nitrogen: '26', phosphate: '5', potash: '10', bag: '50' },
        v: 'coverage',
        result: '13,000',
        unit: 'sq ft',
      },
      {
        text: 'The page default, 1.0 lb of N from a 24-0-6 bag on 5,000 sq ft: 1 ÷ 0.24 × 5 =',
        raw: {},
        v: 'pounds',
        result: '20.8',
        unit: 'lb',
      },
    ],
  },
  {
    id: 'seed',
    title: 'Grass seed',
    href: pageOf('grass-seed').path,
    calculator: 'grass-seed',
    method: pageOf('grass-seed').method,
    note: 'The two publications disagree by up to 50% for Kentucky bluegrass and bermudagrass, so the page shows the range of the one you pick. Tennessee gives fine fescues (chewings, red and sheep) 3 to 5 lb and says to double the rate for unhulled seed, so its hulled bermudagrass rate of ½ to 1 lb is 1 to 2 lb unhulled. Zoysiagrass is from Arkansas alone (1.0 to 2.0 lb of pure live seed for rapid establishment; the source gives 0.5 lb to reduce cost). Virginia says to sow half the seed north-south and half east-west. Left out: centipedegrass, St. Augustinegrass, bahiagrass and overseeding, for want of a table read.',
    sources: [VIRGINIA, TENNESSEE, ARKANSAS],
    cases: [
      {
        text: 'Kentucky bluegrass, Virginia, 2 to 3 lb per 1,000 sq ft on 5,000 sq ft: 2 × 5 to 3 × 5 =',
        raw: {},
        v: 'pounds',
        result: '10.0–15.0',
        unit: 'lb',
      },
      {
        text: 'Tall fescue, Tennessee, 5 to 8 lb per 1,000 sq ft on 1,000 sq ft:',
        raw: { area: '1000', species: 'tall-fescue', source: 'tennessee' },
        v: 'pounds',
        result: '5.0–8.0',
        unit: 'lb',
      },
      {
        text: 'Zoysiagrass, 1.0 to 2.0 lb of pure live seed per 1,000 sq ft on 1,000 sq ft:',
        raw: { area: '1000', species: 'zoysiagrass' },
        v: 'pounds',
        result: '1.0–2.0',
        unit: 'lb',
      },
    ],
  },
  {
    id: 'sod',
    title: 'Sod',
    href: pageOf('sod').path,
    calculator: 'sod',
    method: pageOf('sod').method,
    note: 'Plain geometry, no source needed for the arithmetic. Pallet sizes (400, 450 and 500 sq ft) and the 16 × 24 in slab are what supplier pages list (thegrassoutlet.com, angi.com), not a primary source, so the page labels them “ask your sod farm”. No waste figure is assumed.',
    sources: [],
    cases: [
      {
        text: '1,000 sq ft with 10% waste: 1,000 × 1.10 =',
        raw: { waste: '10' },
        v: 'order',
        result: '1,100',
        unit: 'sq ft',
      },
      {
        text: 'Pallets of 450 sq ft: 1,100 ÷ 450 = 2.44, rounded up to',
        raw: { waste: '10' },
        v: 'pallets',
        result: '3',
        unit: 'pallets',
      },
      {
        text: 'Slabs of 16 × 24 in (384 ÷ 144 = 2.67 sq ft): 1,100 ÷ 2.67 = 412.5, rounded up to',
        raw: { waste: '10' },
        v: 'slabs',
        result: '413',
        unit: 'slabs',
      },
    ],
  },
  {
    id: 'lime',
    title: 'Lawn lime',
    href: pageOf('lawn-lime').path,
    calculator: 'lawn-lime',
    method: pageOf('lawn-lime').method,
    note: 'Penn State’s soil lab gives turf lime recommendations as pounds of calcium carbonate equivalent (CCE) per 1,000 sq ft and says to adjust them when the limestone is significantly different from 100% CCE. Dividing by the label CCE is the plain form of that adjustment; the lab page does not write the formula out. The page never guesses a rate from pH: it asks for the soil test number. Left out: a per-application maximum, for want of a primary page.',
    sources: [PSU_LIME],
    cases: [
      {
        text: '30 lb CCE per 1,000 sq ft on 5,000 sq ft with a 90% CCE lime: 30 × 100 ÷ 90 = 33.3 lb per 1,000 sq ft, × 5 =',
        raw: { cce: '90' },
        v: 'pounds',
        result: '166.7',
        unit: 'lb',
      },
      {
        text: 'The same recommendation with 100% CCE lime: 30 × 100 ÷ 100 × 5 =',
        raw: {},
        v: 'pounds',
        result: '150.0',
        unit: 'lb',
      },
    ],
  },
  {
    id: 'frost',
    title: 'Frost dates',
    href: '/frost-dates',
    method:
      'Each station’s dates are copied from the NOAA 1991-2020 U.S. Climate Normals, annual/seasonal product: the last spring and the first fall 32°F freeze at the 10, 50 and 90 percent probability levels. The 50 percent date is the middle case: in half of the years the last spring freeze comes after it, and in half before. The 90 percent date for spring is the early one (a 90 percent chance the last freeze falls on or after it) and the 10 percent date is the late one; in fall it is the other way round. The normals use a 365-day calendar with no February 29.',
    note: 'The ZIP lookup finds the station nearest to the point of the ZIP Code Tabulation Area (a ZCTA is not exactly a ZIP code) and shows its name and its distance in miles. A station is a weather station, not your yard: hills, water and city heat move frost dates. Stations flagged by NOAA with year-round freeze risk have no dates. The dataset is built by packages/lawn-data/scripts/build-frost.ts from the files named below, pulled 2026-11-07.',
    sources: NORMALS_SOURCES,
    cases: [],
  },
];

/** The page's own copy. */
export const METHOD_PAGE = {
  title: 'How We Work It Out: Formulas and Sources | Lawn Figures',
  description:
    'The formulas, sources and hand-worked cases behind every Lawn Figures calculator, and where the NOAA frost dates come from.',
  h1: 'How we work it out',
  lead: 'Every figure comes from a university extension publication or NOAA data, named below with its address. Each calculator does exact arithmetic and rounds only the figure you read. The cases are worked by hand and checked against the calculators on every change.',
  checked: `Sources read ${SOURCES_CHECKED}.`,
} as const;
