import type { CalculatorId } from './view.ts';

/** One field of a calculator form: its label, and its options when it is a choice. */
export interface FieldCopy {
  /** Plain text, or pieces with the `data-v` hooks of a unit that follows the units field. */
  readonly label: string | readonly Seg[];
  /** One short line under the field. */
  readonly hint?: string;
  readonly options?: Readonly<Record<string, string>>;
}

/** A piece of the seed-bag tag: plain text, or a `data-v` hook the view fills. */
export type Seg = string | { readonly v: string };

/** One calculator page: its copy, and what its tag and detail rows show. */
export interface CalculatorPage {
  readonly id: CalculatorId;
  readonly path: string;
  /** Short name for the home card, the breadcrumb and the footer. */
  readonly name: string;
  readonly title: string;
  readonly description: string;
  readonly kicker: string;
  readonly h1: string;
  readonly lead: string;
  readonly fields: Readonly<Record<string, FieldCopy>>;
  /**
   * The units field, shown first, for a calculator that reads metric (`METRIC` of `units.ts`): its
   * options are the unit systems, and the URL carries the metric one as the `u=m` of the codec.
   */
  readonly units?: FieldCopy;
  /** The seed-bag tag: the headline and the line under it. */
  readonly tag: { readonly head: readonly Seg[]; readonly sub: readonly Seg[] };
  /** The rows under the tag: a label, the `data-v` hook and its unit. */
  readonly rows: readonly { readonly label: string; readonly v: string; readonly unit: Seg }[];
  /** The warning text of each engine warning code. */
  readonly warnings: Readonly<Record<string, string>>;
  /** The formula in words, and the note on the limits of the figure. */
  readonly method: string;
  readonly note: string;
  /** The Lawn Figures guides the page links. */
  readonly guides: readonly string[];
  /** The Maestro Calc pages for the other half of the job (see `MAESTRO`), besides the area one. */
  readonly maestro: readonly MaestroId[];
}

const SEED_SPECIES_LABELS = {
  'kentucky-bluegrass': 'Kentucky bluegrass',
  'tall-fescue': 'Tall fescue',
  'fine-fescue': 'Fine fescue',
  'perennial-ryegrass': 'Perennial ryegrass',
  'bermudagrass-hulled': 'Bermudagrass (hulled seed)',
  'bermudagrass-unhulled': 'Bermudagrass (unhulled seed)',
  zoysiagrass: 'Zoysiagrass (seed)',
} as const;

/** The seed sources, by the option id of the calculator. */
export const SEED_SOURCE_LABELS = {
  'virginia-tech': 'Virginia Cooperative Extension',
  tennessee: 'University of Tennessee Extension',
} as const;

export const FERTILIZER: CalculatorPage = {
  id: 'lawn-fertilizer',
  path: '/lawn-fertilizer-calculator',
  name: 'Lawn fertilizer',
  title: 'Lawn Fertilizer Calculator | Lawn Figures',
  description:
    'Turn the N-P-K numbers on the bag into pounds of fertilizer for your lawn, the bags to buy, and the P and K that come with it. Rates from extension sources.',
  kicker: 'Fertilizer calculator',
  h1: 'Lawn fertilizer calculator',
  lead: 'Type the three numbers printed on the bag and the size of your lawn. You get pounds of product for the spreader, not pounds of nitrogen.',
  fields: {
    area: { label: 'Lawn area (sq ft)', hint: 'Not sure? Measure it below.' },
    nitrogen: { label: 'N (nitrogen) %' },
    phosphate: { label: 'P (P₂O₅) %' },
    potash: { label: 'K (K₂O) %' },
    target: {
      label: 'Pounds of N per 1,000 sq ft',
      hint: 'Purdue: usually 0.5 to 1.0 lb of N a time.',
    },
    bag: { label: 'Bag weight (lb)' },
  },
  tag: {
    head: [{ v: 'pounds' }, ' lb'],
    sub: ['= ', { v: 'bags' }, ' ', { v: 'bagsUnit' }, ' of ', { v: 'bagPounds' }, ' lb'],
  },
  rows: [
    { label: 'Product per 1,000 sq ft', v: 'perThousand', unit: 'lb' },
    { label: 'One bag covers', v: 'coverage', unit: 'sq ft' },
    { label: 'Nitrogen (N) in it', v: 'nitrogenPounds', unit: 'lb' },
    { label: 'Phosphate (P₂O₅) in it', v: 'phosphatePounds', unit: 'lb' },
    { label: 'Potash (K₂O) in it', v: 'potashPounds', unit: 'lb' },
  ],
  warnings: {
    overLimit:
      'Over the limit of one application. Purdue Extension says not to apply more than 1.0 lb of actual water-soluble N per 1,000 sq ft in any single application (up to 2 lb when more than half of the N is slow-release). The figures above work out your number; they do not recommend it.',
  },
  method:
    'Pounds of product per 1,000 sq ft = the pounds of N you want ÷ the N share of the bag (24% is 0.24). Multiply by the area ÷ 1,000 for the total. P and K are the same weight times the P₂O₅ and K₂O shares on the label.',
  note: 'Granular fertilizer only. The label of your bag and your state and local rules come first.',
  guides: ['timing-guide', 'lawn-care-cost'],
  maestro: [],
};

export const GRASS_SEED: CalculatorPage = {
  id: 'grass-seed',
  path: '/grass-seed-calculator',
  name: 'Grass seed',
  title: 'Grass Seed Calculator | Lawn Figures',
  description:
    'Pounds of grass seed and bags for a new lawn, at the low and high rate of two university extension sources, with half sown each way across the lawn.',
  kicker: 'Seed calculator',
  h1: 'Grass seed calculator',
  lead: 'Pick your grass and the size of your lawn, in square feet or square metres. You get a range in pounds or kilograms, because the extension sources give one, and the bags that hold it.',
  fields: {
    area: { label: ['Lawn area (', { v: 'areaUnit' }, ')'], hint: 'Not sure? Measure it below.' },
    species: { label: 'Grass', options: SEED_SPECIES_LABELS },
    source: {
      label: 'Rate from',
      hint: 'The two sources differ by up to 50%.',
      options: SEED_SOURCE_LABELS,
    },
    bag: { label: ['Seed bag weight (', { v: 'bagUnit' }, ')'] },
  },
  units: {
    label: 'Units',
    hint: 'Metric for bags sold in kilograms, as in the UK and Canada.',
    options: { imperial: 'US: square feet and pounds', metric: 'Metric: m² and kilograms' },
  },
  tag: {
    head: [{ v: 'pounds' }, ' ', { v: 'massUnit' }],
    sub: [
      '= ',
      { v: 'bags' },
      ' ',
      { v: 'bagsUnit' },
      ' of ',
      { v: 'bagPounds' },
      ' ',
      { v: 'bagUnit' },
    ],
  },
  rows: [
    { label: 'Seeding rate', v: 'rate', unit: { v: 'rateUnit' } },
    { label: 'Each way (half north-south, half east-west)', v: 'perPass', unit: { v: 'passUnit' } },
  ],
  warnings: {
    zoysiaSource:
      'Zoysiagrass has one source here, University of Arkansas MP476: 1.0 to 2.0 lb of pure live seed per 1,000 sq ft. The choice of source does not change it.',
  },
  method:
    'Pounds of seed = the extension rate for your grass (pounds per 1,000 sq ft, a low and a high end) × the area ÷ 1,000. Sow half the seed in one direction and half crosswise. In metric the area is turned into square feet (1 m² = 1 ÷ 0.09290304 sq ft) and the pounds into kilograms (1 lb = 0.45359237 kg), both exact, so 1 lb per 1,000 sq ft is 4.88 g/m².',
  note: 'For a new lawn. Rates for overseeding an existing lawn are not included: no extension table for them is cited yet. Bags are counted at each end of the range.',
  guides: [
    'planting-guide',
    'uk-sowing-guide',
    'growing-guide',
    'aeration-guide',
    'timing-guide',
    'bermuda-seed',
    'zoysia-seed',
    'tall-fescue-seed',
    'ryegrass-seed',
    'bluegrass-seed',
    'fescue-seed',
    'best-seed',
    'lawn-care-cost',
  ],
  maestro: ['topsoil'],
};

export const SOD: CalculatorPage = {
  id: 'sod',
  path: '/sod-calculator',
  name: 'Sod',
  title: 'Sod Calculator: Square Feet, Pallets and Slabs | Lawn Figures',
  description:
    'How much sod to order for your lawn: square feet with the waste you set, pallets at your supplier’s pallet size, and 16 × 24 in slabs. Plain geometry.',
  kicker: 'Sod calculator',
  h1: 'Sod calculator',
  lead: 'Enter your lawn area and the waste your sod farm advises. You get the square feet to order, the pallets and the slabs.',
  fields: {
    area: { label: 'Lawn area (sq ft)', hint: 'Not sure? Measure it below.' },
    waste: { label: 'Waste (%)', hint: 'Ask your sod farm. It starts at 0.' },
    pallet: {
      label: 'Pallet size',
      hint: 'Ask your sod farm for its pallet size.',
      options: {
        '400': '400 sq ft a pallet',
        '450': '450 sq ft a pallet',
        '500': '500 sq ft a pallet',
      },
    },
  },
  tag: {
    head: [{ v: 'order' }, ' sq ft'],
    sub: [
      '= ',
      { v: 'pallets' },
      ' ',
      { v: 'palletsUnit' },
      ' of ',
      { v: 'palletSize' },
      ' sq ft, or ',
      { v: 'slabs' },
      ' ',
      { v: 'slabsUnit' },
    ],
  },
  rows: [{ label: 'Waste included', v: 'extra', unit: 'sq ft' }],
  warnings: {},
  method:
    'Square feet to order = the lawn area × (1 + waste ÷ 100). Pallets = that ÷ the pallet size, rounded up. Slabs = that ÷ 2.67 sq ft (a 16 × 24 in slab), rounded up.',
  note: 'Pallet and slab sizes are the supplier’s choice. The 400, 450 and 500 sq ft options are sizes suppliers list, not a standard, and no waste figure is assumed: you set it.',
  guides: ['st-augustine-seed', 'sod-cost', 'lawn-care-cost'],
  maestro: ['topsoil'],
};

export const LIME: CalculatorPage = {
  id: 'lawn-lime',
  path: '/lawn-lime-calculator',
  name: 'Lawn lime',
  title: 'Lawn Lime Calculator | Lawn Figures',
  description:
    'Turn your soil test lime recommendation and the CCE on the bag into pounds of lime for your lawn and the bags to buy. The adjustment is the extension one.',
  kicker: 'Lime calculator',
  h1: 'Lawn lime calculator',
  lead: 'Enter what your soil test recommends and the CCE printed on the bag. You get pounds of lime for your lawn and the bags to buy.',
  fields: {
    area: { label: 'Lawn area (sq ft)', hint: 'Not sure? Measure it below.' },
    rate: {
      label: 'Soil test: lb of lime per 1,000 sq ft',
      hint: 'In pounds of calcium carbonate equivalent, from your lab report.',
    },
    cce: { label: 'CCE on the bag (%)', hint: '100 if the label gives none.' },
    bag: { label: 'Bag weight (lb)' },
  },
  tag: {
    head: [{ v: 'pounds' }, ' lb'],
    sub: ['= ', { v: 'bags' }, ' ', { v: 'bagsUnit' }, ' of ', { v: 'bagPounds' }, ' lb'],
  },
  rows: [{ label: 'Product per 1,000 sq ft', v: 'perThousand', unit: 'lb' }],
  warnings: {},
  method:
    'Pounds of product per 1,000 sq ft = the soil test recommendation × 100 ÷ the CCE % on the label. Multiply by the area ÷ 1,000 for the total.',
  note: 'Lime follows a soil test, never a guess: with no soil test there is no number to enter here. Follow your lab report where it differs.',
  guides: [],
  maestro: [],
};

/** Every calculator page, in the order of the site. */
export const CALCULATORS: readonly CalculatorPage[] = [FERTILIZER, GRASS_SEED, SOD, LIME];

/** The calculator page at `path`; any other path throws at build time. */
export const calculatorAt = (path: string): CalculatorPage => {
  const page = CALCULATORS.find((candidate) => candidate.path === path);
  if (page === undefined) throw new Error(`no calculator at ${path}`);
  return page;
};

/**
 * The Maestro Calc pages for the half of the lawn job these calculators do not do (plans/lawn/
 * PLAN.md section 3): linked, never rebuilt.
 */
export const MAESTRO = {
  origin: 'https://maestrocalc.com',
  pages: {
    mulch: { label: 'Mulch calculator', path: '/mulch-calculator' },
    gravel: { label: 'Gravel calculator', path: '/gravel-calculator' },
    topsoil: { label: 'Topsoil calculator', path: '/topsoil-calculator' },
    area: { label: 'Square footage calculator', path: '/square-footage-calculator' },
    hub: { label: 'All landscaping calculators', path: '/landscaping' },
  },
} as const;

export type MaestroId = keyof typeof MAESTRO.pages;
