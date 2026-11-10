import { CHEMISTRY_CHART } from './chemistry.ts';
import { CHLORINE, FILL_TIME, HEATER, SALT } from './doses.ts';
import { gallonsOf } from './gallons.ts';
import type { GuideSource, GuideStep, GuideTable, StepGuide } from './guide.ts';
import { VOLUME_TEXTS } from './volume/texts.ts';

/*
 * The pool cost guides: what a pool costs (the hub), then an inground pool, a plunge pool, a
 * fiberglass pool, resurfacing and a new vinyl liner. Every price is a published range of a named
 * source, with the date the source carries and the day it was read; the figures worked out here
 * (a price per square foot times an area, the area of a pool's surface, the gallons of the volume
 * calculator) say so where they appear. United States prices, so the guides are English only.
 */

/** The day every price below was read at its source, as the byline gives it. */
const CHECKED = '2026-11-09';
const READ = 'read November 9, 2026';

/** A sum of dollars, rounded to the dollar and grouped: `5320` is `$5,320`. */
export const usd = (dollars: number): string => `$${Math.round(dollars).toLocaleString('en-US')}`;

const span = (low: number, high: number): string => `${usd(low)} to ${usd(high)}`;

/** A rectangular pool in feet: its length, its width and the depth at each end. */
export interface PoolShape {
  readonly length: number;
  readonly width: number;
  readonly shallow: number;
  readonly deep: number;
}

/**
 * The surface a finish or a liner covers, in square feet: the floor plus the four walls at the
 * mean of the two depths. The floor is taken flat, so a sloped floor holds a little more.
 */
export const interiorArea = ({ length, width, shallow, deep }: PoolShape): number =>
  length * width + 2 * (length + width) * ((shallow + deep) / 2);

/** The two pools the guides price: the backyard pool of the volume calculator, and a 12 x 24. */
const BACKYARD: PoolShape = { length: 32, width: 16, shallow: 3.5, deep: 8 };
const STANDARD: PoolShape = { length: 24, width: 12, shallow: 3.5, deep: 6 };
const backyardArea = interiorArea(BACKYARD);
const standardArea = interiorArea(STANDARD);
const sqft = (area: number): string => `${area.toLocaleString('en-US')} square feet`;

// the gallons of the volume calculator, run at build time
const backyardGallons = gallonsOf({
  length: '32 ft',
  width: '16 ft',
  shallow: '3 ft 6 in',
  deep: '8 ft',
});
const plungeGallons = gallonsOf({
  length: '16 ft',
  width: '8 ft',
  shallow: '5 ft 6 in',
  deep: '5 ft 6 in',
});

/** Every source the cost guides cite, its own date and the day it was read in its name. */
const SOURCES = {
  tohInground: {
    name: `This Old House: How Much Does an Inground Pool Cost? (updated June 6, 2025; ${READ})`,
    url: 'https://www.thisoldhouse.com/home-finances/inground-pool-cost',
  },
  tohPlunge: {
    name: `This Old House: All About Plunge Pools: Types, Costs, and Benefits (updated June 5, 2026; ${READ})`,
    url: 'https://www.thisoldhouse.com/pools/all-about-plunge-pools',
  },
  tohPrefab: {
    name: `This Old House: A Buyer’s Guide to Prefab Plunge Pools (June 15, 2026; ${READ})`,
    url: 'https://www.thisoldhouse.com/pools/prefab-plunge-pools',
  },
  tohResurfacing: {
    name: `This Old House: What to Know About Pool Resurfacing (updated June 6, 2026; ${READ})`,
    url: 'https://www.thisoldhouse.com/pools/tips-for-pool-resurfacing',
  },
  riverFiberglass: {
    name: `River Pools: How Much Is My Fiberglass Pool Really Going to Cost? (updated December 8, 2025; ${READ})`,
    url: 'https://www.riverpoolsandspas.com/blog/how-much-will-my-fiberglass-pool-really-cost',
  },
  riverTypes: {
    name: `River Pools: How Much Do Above Ground and Inground Swimming Pools Cost? (updated December 8, 2025; ${READ})`,
    url: 'https://www.riverpoolsandspas.com/blog/how-much-do-above-ground-and-inground-pools-cost',
  },
  riverLiner: {
    name: `River Pools: Vinyl Pool Liner Replacement: Cost, Steps, Tips (September 11, 2024; ${READ})`,
    url: 'https://www.riverpoolsandspas.com/blog/vinyl-pool-liner-replacement-cost-steps-tips',
  },
  lathamPlunge: {
    name: `Latham Pool: Plunge Pools: Inground Options & Cost (undated page, ${READ})`,
    url: 'https://www.lathampool.com/plunge-pools/',
  },
  lathamFiberglass: {
    name: `Latham Pool: How Much Does an Inground Fiberglass Pool Cost? (undated page, ${READ})`,
    url: 'https://www.lathampool.com/plan-your-pool/inground-pool/fiberglass-price-guide/',
  },
  lathamVinyl: {
    name: `Latham Pool: How Much Does an Inground Vinyl Liner Pool Cost? (undated page, ${READ})`,
    url: 'https://www.lathampool.com/plan-your-pool/inground-pool/vinyl-liner-price-guide/',
  },
  vilaBuild: {
    name: `Bob Vila: How Much Does It Cost to Build a Pool? (updated May 29, 2024; ${READ})`,
    url: 'https://www.bobvila.com/articles/how-much-does-it-cost-to-build-a-pool/',
  },
  vilaPlunge: {
    name: `Bob Vila: Plunge Pool Cost (updated June 30, 2022; ${READ})`,
    url: 'https://www.bobvila.com/articles/plunge-pool-cost/',
  },
  vilaResurfacing: {
    name: `Bob Vila: Pool Resurfacing Cost (July 26, 2022; ${READ})`,
    url: 'https://www.bobvila.com/articles/pool-resurfacing-cost/',
  },
  vilaLiner: {
    name: `Bob Vila: Pool Liner Replacement Cost (updated June 10, 2024; ${READ})`,
    url: 'https://www.bobvila.com/articles/pool-liner-replacement-cost/',
  },
  cpsc: {
    name: 'U.S. Consumer Product Safety Commission: Safety Barrier Guidelines for Residential Pools, Publication 362 (August 2012)',
    url: 'https://www.cpsc.gov/s3fs-public/362%20Safety%20Barrier%20Guidelines%20for%20Pools.pdf',
  },
} as const satisfies Record<string, GuideSource>;

type SourceKey = keyof typeof SOURCES;

const pick = <const K extends SourceKey>(...keys: K[]): Pick<typeof SOURCES, K> =>
  Object.fromEntries(keys.map((key) => [key, SOURCES[key]])) as Pick<typeof SOURCES, K>;

/**
 * This Old House's inground prices by size and material (updated June 6, 2025): length, width,
 * then the low and high price of vinyl, fiberglass and concrete.
 */
const TOH_SIZES = [
  [10, 20, 26_000, 48_000, 35_000, 66_000, 40_000, 70_000],
  [12, 20, 31_000, 58_000, 42_000, 79_000, 48_000, 84_000],
  [12, 24, 38_000, 70_000, 50_000, 95_000, 58_000, 100_000],
  [10, 30, 39_000, 72_000, 53_000, 99_000, 60_000, 105_000],
  [12, 30, 47_000, 87_000, 63_000, 119_000, 72_000, 126_000],
  [14, 28, 51_000, 94_000, 69_000, 129_000, 78_000, 137_000],
  [15, 30, 59_000, 108_000, 79_000, 149_000, 90_000, 158_000],
  [16, 32, 67_000, 123_000, 90_000, 169_000, 102_000, 180_000],
] as const;

/** This Old House's installed price per square foot of pool, by material. */
const PER_SQFT = {
  vinyl: [130, 240],
  fiberglass: [175, 330],
  concrete: [200, 350],
} as const;

const sizeOf = (width: number, length: number): string => `${String(width)} x ${String(length)} ft`;

const perSqftOf = (area: number, [low, high]: readonly [number, number]): string =>
  span(area * low, area * high);

// the paths of the cost guides, written out: each guide links the others
const HUB_PATH = '/how-much-does-a-pool-cost';
const INGROUND_PATH = '/inground-pool-cost';
const PLUNGE_PATH = '/plunge-pool-cost';
const FIBERGLASS_PATH = '/fiberglass-pool-cost';
const RESURFACING_PATH = '/pool-resurfacing-cost';
const LINER_PATH = '/pool-liner-replacement-cost';
const PUMP_GUIDE_PATH = '/how-long-to-run-pool-pump';
const OPENING_PATH = '/opening-your-pool';

const hubLink = { href: HUB_PATH, label: 'Every pool cost, side by side' } as const;

/** A cost guide: a step guide that always opens with a price table and works a case out. */
export interface CostGuide extends StepGuide {
  readonly table: GuideTable;
  readonly moreTables: readonly GuideTable[];
}

const NOTE =
  'These are the published ranges of each source on the day shown, not a quote: prices vary by region, by season and by builder. Get written quotes that list the same work before you compare them.';

// --- How much does an inground pool cost ---

const twelve = TOH_SIZES[2];
const sixteen = TOH_SIZES[7];

const INGROUND_STEPS: readonly GuideStep[] = [
  {
    title: 'Pick the material first',
    text: `This Old House prices an installed inground pool at $130 to $240 per square foot in vinyl, $175 to $330 in fiberglass and $200 to $350 in concrete. Vinyl is the lowest price at every size, concrete the highest, and fiberglass sits between them.`,
    link: { href: FIBERGLASS_PATH, label: 'What a fiberglass pool costs' },
    sources: ['tohInground'],
  },
  {
    title: 'Then the size',
    text: `Every foot adds to the shell, the digging and the water. This Old House’s table runs from $26,000 to $70,000 for a 10 x 20 ft pool to $67,000 to $180,000 for a 16 x 32 ft one, which holds ${backyardGallons} gallons at 3 ft 6 in to 8 ft deep by the volume calculator.`,
    link: { href: VOLUME_TEXTS.path, label: 'Work out your gallons' },
    sources: ['tohInground'],
  },
  {
    title: 'Where you live',
    text: 'This Old House expects 15 to 25% higher costs in northeastern states and urban areas, and permits of $450 to $1,800 depending on the location and the scope of the project.',
    sources: ['tohInground'],
  },
  {
    title: 'The yard itself',
    text: 'Site preparation can mean moving landscaping, grading and building a retaining wall, This Old House says. Latham, a pool maker, names sloped terrain, soil conditions and tight access points as reasons for more excavation, and River Pools prices a retaining wall at $7,500 to $20,000, up to $35,000 or more.',
    sources: ['tohInground', 'lathamFiberglass', 'riverFiberglass'],
  },
  {
    title: 'What goes around the pool',
    text: 'This Old House prices the extras one by one: decking $5,000 to $20,000, a fence $3,000 to $10,000, a heater $3,450 to $5,450, a cover $2,700 to $3,700, lights $450 to $1,200 and a saltwater system $1,100 to $2,200. A heater is sized by the water it warms.',
    link: { href: HEATER.path, label: 'Size the heater' },
    sources: ['tohInground'],
  },
  {
    title: 'The fence the code may ask for',
    text: 'The Consumer Product Safety Commission’s barrier guidelines put the top of a pool barrier at least 48 inches above grade, note that some states, counties or municipalities require 60 inches, and want gates that are self-closing and self-latching. Ask your building department which rule applies before you price the fence.',
    sources: ['cpsc'],
  },
  {
    title: 'The cost of running it',
    text: 'Pools tend to cost $90 to $270 per month to maintain, This Old House says, and over 10 years $11,000 to $17,000 for vinyl against $27,000 to $40,000 for concrete. The pump’s hours and the chemicals are the part you control.',
    link: { href: PUMP_GUIDE_PATH, label: 'How long to run the pump' },
    sources: ['tohInground'],
  },
  {
    title: 'The surface’s next bill',
    text: 'A vinyl liner needs replacing every 5 to 9 years, River Pools says, and a concrete pool’s plaster every ten to twenty years by This Old House. Count that bill in the price of the material you choose.',
    link: { href: LINER_PATH, label: 'What a new liner costs' },
    sources: ['riverTypes', 'tohResurfacing'],
  },
  {
    title: 'Or a smaller pool',
    text: 'A plunge pool is a short, deep pool for cooling off rather than swimming laps, and its price starts far below a family pool’s.',
    link: { href: PLUNGE_PATH, label: 'What a plunge pool costs' },
  },
  {
    title: 'Compare it with every option',
    text: 'Above-ground kits, plunge pools and turn-key inground pools sit on one table, with what each costs to keep up after it is built.',
    link: hubLink,
  },
];

/** How much an inground pool costs: This Old House's prices by size and material, worked out. */
export const INGROUND_COST = {
  path: INGROUND_PATH,
  checked: CHECKED,
  kicker: 'Cost guide · inground pool',
  card: {
    title: 'Inground pool cost',
    summary: 'By size and material, 10 x 20 to 16 x 32 ft, and what adds to it.',
  },
  title: 'How Much Does an Inground Pool Cost? By Size | Pool Figures',
  description:
    'A 12 x 24 ft inground pool costs $38,000 to $100,000: vinyl, fiberglass and concrete prices by size, per square foot, and the extras that add to the bill.',
  h1: 'How much does an inground pool cost?',
  lead: `A standard 12 x 24 ft inground pool costs $38,000 to $100,000 to install, This Old House’s guide says: ${span(twelve[2], twelve[3])} in vinyl, ${span(twelve[4], twelve[5])} in fiberglass and ${span(twelve[6], twelve[7])} in concrete. River Pools, a fiberglass maker, puts turn-key pools higher, $85,000 to $200,000 and up for fiberglass and $95,000 to $225,000 and up for concrete. The material, the size, your region and the work around the pool decide where yours lands.`,
  note: NOTE,
  table: {
    caption: 'Inground pool cost by size and material, installed (This Old House, June 2025)',
    region: 'Inground pool cost by size',
    head: ['Pool', 'Vinyl', 'Fiberglass', 'Concrete'],
    rows: TOH_SIZES.map(([width, length, ...prices]) => [
      sizeOf(width, length),
      span(prices[0], prices[1]),
      span(prices[2], prices[3]),
      span(prices[4], prices[5]),
    ]),
    sources: ['tohInground'],
  },
  moreTables: [
    {
      caption: `The price per square foot times the pool’s area: 288 square feet for 12 x 24 ft, 512 for 16 x 32 ft (our arithmetic on This Old House’s rates)`,
      region: 'Inground pool cost per square foot, worked out',
      head: ['Pool', 'Vinyl, $130 to $240', 'Fiberglass, $175 to $330', 'Concrete, $200 to $350'],
      rows: [twelve, sixteen].map(([width, length]) => {
        const area = width * length;
        return [
          sizeOf(width, length),
          perSqftOf(area, PER_SQFT.vinyl),
          perSqftOf(area, PER_SQFT.fiberglass),
          perSqftOf(area, PER_SQFT.concrete),
        ];
      }),
      sources: ['tohInground'],
    },
  ],
  sources: pick(
    'tohInground',
    'riverTypes',
    'lathamFiberglass',
    'riverFiberglass',
    'cpsc',
    'tohResurfacing',
  ),
  steps: INGROUND_STEPS,
} as const satisfies CostGuide;

// --- How much does a plunge pool cost ---

const PLUNGE_STEPS: readonly GuideStep[] = [
  {
    title: 'Know what you are pricing',
    text: 'A plunge pool typically runs 6.5 to 10 feet wide and 10 to 22 feet long, 5.5 to 7 feet deep with a flat bottom, This Old House says; Latham, a pool maker, lists 8 x 16, 9 x 17 and 10 x 16 ft as common sizes, 4 to 9 feet deep.',
    link: { href: VOLUME_TEXTS.path, label: 'Work out its gallons' },
    sources: ['tohPlunge', 'lathamPlunge'],
  },
  {
    title: 'Count the water it holds',
    text: `An 8 x 16 ft plunge pool 5 ft 6 in deep holds ${plungeGallons} gallons by the volume calculator, against ${backyardGallons} gallons for a 16 x 32 ft pool 3 ft 6 in to 8 ft deep: about a quarter of the water to fill, heat and treat.`,
    link: { href: FILL_TIME.path, label: 'How long it takes to fill' },
  },
  {
    title: 'Prefab or built in place',
    text: 'A prefab shell arrives finished. A plunge pool maker This Old House quotes puts its pool with a heater at around $40,000 all in, “right around half in many cases” of a pool built on site. Concrete prefab shells start at $28,500 for 7 x 7 ft, and fiberglass ones are $53,200 to $59,200 installed.',
    sources: ['tohPlunge', 'tohPrefab'],
  },
  {
    title: 'Getting it into the yard',
    text: 'Shipping a prefab plunge pool starts around $3,000 and a crane can cost $10,000 or more, This Old House says. A yard a truck can reach costs less to set a shell in than one behind the house that only a crane can reach over.',
    sources: ['tohPrefab'],
  },
  {
    title: 'The digging and the permits',
    text: 'Bob Vila’s 2022 guide put site preparation and excavation at $1,500 to $5,000, permits at $400 to $1,800, and the contractor’s labor at $1,000 to $6,000 depending on the material.',
    sources: ['vilaPlunge'],
  },
  {
    title: 'Heat it for year-round use',
    text: 'This Old House adds roughly $3,500 for a heater; Bob Vila’s 2022 guide put one at $1,600 to $3,600. A small pool needs a small heater: size it by the gallons and the rise you want.',
    link: { href: HEATER.path, label: 'Size the heater' },
    sources: ['tohPrefab', 'vilaPlunge'],
  },
  {
    title: 'Cover and jets',
    text: 'An automatic cover costs about $10,000 for a 13 x 7 ft pool, and resistance current jets for swimming in place begin at about $2,500, This Old House says.',
    sources: ['tohPrefab'],
  },
  {
    title: 'Less water, smaller doses',
    text: 'Every chemical dose scales with the gallons, so a plunge pool takes a fraction of the shock, salt and acid a full-size pool does. Work each one out from your own gallons.',
    link: { href: CHLORINE.path, label: 'Work out the chlorine dose' },
  },
  {
    title: 'Compare it with a full-size pool',
    text: 'A 12 x 24 ft inground pool, the size This Old House calls standard, costs $38,000 to $100,000 installed.',
    link: { href: INGROUND_PATH, label: 'What an inground pool costs' },
    sources: ['tohInground'],
  },
  {
    title: 'Every option on one table',
    text: 'The hub sets plunge pools beside above-ground kits and turn-key pools, with the running costs.',
    link: hubLink,
  },
];

/** How much a plunge pool costs: This Old House, Latham and Bob Vila, prefab prices by type. */
export const PLUNGE_COST = {
  path: PLUNGE_PATH,
  checked: CHECKED,
  kicker: 'Cost guide · plunge pool',
  card: {
    title: 'Plunge pool cost',
    summary: 'About $20,000 in the ground; prefab shells by type, delivery and crane.',
  },
  title: 'How Much Does a Plunge Pool Cost? Prefab vs Built | Pool Figures',
  description:
    'An inground plunge pool costs about $20,000, a small one $10,000 to $35,000 or more: prefab concrete, fiberglass and container prices, delivery and the crane.',
  h1: 'How much does a plunge pool cost?',
  lead: 'An inground plunge pool costs about $20,000 as a ballpark, and a small one $10,000 to $35,000 or more, This Old House says (June 2026). Prefab plunge pools run from $28,500 for a 7 x 7 ft concrete shell to $59,200 for a 20 x 8 ft fiberglass one installed, and Latham, a pool maker, puts installing a plunge pool at around $35,000 to start. Above-ground models can cost as little as $1,500.',
  note: NOTE,
  table: {
    caption: 'Prefab plunge pool prices by type (This Old House, June 2026)',
    region: 'Prefab plunge pool prices',
    head: ['Type', 'Sizes', 'Price'],
    rows: [
      [
        'Concrete',
        '7 x 7 ft to 20 x 10 ft, 52 to 66 in deep',
        'From $28,500 to about $32,000, with basic equipment',
      ],
      [
        'Fiberglass',
        '9 ft 6 in x 6 ft 11 in to 20 x 8 ft, 54 to 60 in deep',
        '$53,200 to $59,200, installed with pool equipment',
      ],
      [
        'Steel container',
        '20 x 8 ft to 20 x 12 ft',
        '$42,000 to $56,000, coated interior and basic equipment',
      ],
      ['Fiberglass-lined container', '20 x 8 ft', '$44,900'],
      ['Kit you install', '7 x 7 ft', '$12,999 with equipment, a heater and a cover'],
    ],
    sources: ['tohPrefab'],
  },
  moreTables: [
    {
      caption: 'Plunge pool cost by kind and material (Bob Vila, June 2022)',
      region: 'Plunge pool cost by material',
      head: ['Plunge pool', 'Price'],
      rows: [
        ['Above-ground', '$3,000 to $30,000'],
        ['Inground', '$10,000 to $35,000'],
        ['Vinyl', '$10,000 to $18,000'],
        ['Fiberglass', '$10,000 to $22,000'],
        ['Concrete', '$20,000 to $35,000 or more'],
      ],
      sources: ['vilaPlunge'],
    },
  ],
  sources: pick('tohPlunge', 'tohPrefab', 'lathamPlunge', 'vilaPlunge', 'tohInground'),
  steps: PLUNGE_STEPS,
} as const satisfies CostGuide;

// --- How much does a fiberglass pool cost ---

const FIBERGLASS_STEPS: readonly GuideStep[] = [
  {
    title: 'Price the shell by its size',
    text: `A fiberglass pool is a shell made in a factory, so you choose among the maker’s sizes. This Old House’s rate of $175 to $330 per square foot gives ${perSqftOf(288, PER_SQFT.fiberglass)} for a 12 x 24 ft pool and ${perSqftOf(512, PER_SQFT.fiberglass)} for 16 x 32 ft, close to its own table.`,
    link: { href: VOLUME_TEXTS.path, label: 'Work out its gallons' },
    sources: ['tohInground'],
  },
  {
    title: 'Read what the package includes',
    text: 'River Pools’ basic package covers the shell, shipping, the pump and filter, permits, excavation, backfill, the water fill, maintenance equipment and rough grading, and usually leaves out the electrical work and the patio. Compare quotes line by line.',
    sources: ['riverFiberglass'],
  },
  {
    title: 'Add the patio',
    text: 'With a modest concrete patio of 400 to 800 square feet, River Pools puts the basic install at $85,000 to $135,000, against $60,000 to $100,000 without it.',
    sources: ['riverFiberglass'],
  },
  {
    title: 'Access, slope and soil',
    text: 'Latham names sloped terrain, soil conditions and tight access points as reasons for extra excavation, and unique shapes or deeper profiles as added engineering. River Pools prices a retaining wall at $7,500 to $20,000, up to $35,000 or more.',
    sources: ['lathamFiberglass', 'riverFiberglass'],
  },
  {
    title: 'The extras, one by one',
    text: 'River Pools lists an automatic cover at $14,000 to $21,000, a salt chlorine generator at $1,800 to $3,000, a heat pump at $2,000 to $4,500, waterline tile at $1,500 to $5,000 and LED lights at $600 to $1,500 each.',
    link: { href: SALT.path, label: 'Work out the salt for a salt system' },
    sources: ['riverFiberglass'],
  },
  {
    title: 'Fiberglass against vinyl',
    text: 'At 12 x 24 ft, This Old House’s fiberglass range sits $12,000 to $25,000 more than vinyl at each end. A vinyl pool also needs new liners: River Pools puts them at $9,000 to $18,000 over 20 years, a bill a fiberglass shell does not have.',
    link: { href: LINER_PATH, label: 'What a new liner costs' },
    sources: ['tohInground', 'riverLiner'],
  },
  {
    title: 'Heat and run it',
    text: 'River Pools lists a heat pump among the extras. Whatever heater you choose, size it by the gallons and the rise in temperature you want.',
    link: { href: HEATER.path, label: 'Size the heater' },
  },
  {
    title: 'Compare every type',
    text: 'The inground guide sets fiberglass beside vinyl and concrete at ten sizes.',
    link: { href: INGROUND_PATH, label: 'What an inground pool costs' },
  },
  {
    title: 'And every option',
    text: 'Plunge pools, above-ground kits and turn-key pools, with what they cost to keep, are on one table.',
    link: hubLink,
  },
];

/** How much a fiberglass pool costs: River Pools' packages, Latham and This Old House by size. */
export const FIBERGLASS_COST = {
  path: FIBERGLASS_PATH,
  checked: CHECKED,
  kicker: 'Cost guide · fiberglass pool',
  card: {
    title: 'Fiberglass pool cost',
    summary: 'By size and by package, the patio and the extras, against vinyl.',
  },
  title: 'How Much Does a Fiberglass Pool Cost? By Size | Pool Figures',
  description:
    'A fiberglass pool costs $50,000 to $95,000 at 12 x 24 ft: prices by size, what a basic or turn-key package includes, the patio, the extras and vinyl compared.',
  h1: 'How much does a fiberglass pool cost?',
  lead: 'A 12 x 24 ft fiberglass inground pool costs $50,000 to $95,000 installed, This Old House says, or $175 to $330 per square foot. River Pools, which makes fiberglass shells, puts a basic install at $60,000 to $100,000 and a turn-key pool at $85,000 to $200,000 (December 2025); Latham, another maker, at $50,000 to $150,000. The shell size, the patio, the access for the delivery and the extras decide the total.',
  note: NOTE,
  table: {
    caption:
      'Fiberglass pool cost by size, installed, and how far above vinyl it sits (This Old House, June 2025; the difference is our arithmetic)',
    region: 'Fiberglass pool cost by size',
    head: ['Pool', 'Fiberglass', 'Above vinyl, at each end of the range'],
    rows: TOH_SIZES.map(([width, length, vinylLow, vinylHigh, low, high]) => [
      sizeOf(width, length),
      span(low, high),
      `${span(low - vinylLow, high - vinylHigh)} more`,
    ]),
    sources: ['tohInground'],
  },
  moreTables: [
    {
      caption: 'What a fiberglass pool costs by package (River Pools, December 2025)',
      region: 'Fiberglass pool packages',
      head: ['Package', 'What it covers', 'Price'],
      rows: [
        [
          'Basic install',
          'Shell, shipping, pump and filter, permits, excavation, backfill, water, rough grading',
          '$60,000 to $100,000',
        ],
        [
          'Basic install and patio',
          'The same, with a 400 to 800 sq ft concrete patio',
          '$85,000 to $135,000',
        ],
        ['Turn-key, on average', 'The pool and the work around it', '$85,000 to $200,000'],
      ],
      sources: ['riverFiberglass'],
    },
  ],
  sources: pick('tohInground', 'riverFiberglass', 'lathamFiberglass', 'riverLiner'),
  steps: FIBERGLASS_STEPS,
} as const satisfies CostGuide;

// --- How much does it cost to resurface a pool ---

/** A resurfacing price per square foot, worked out on the surface of the two pools. */
const finishRow = (finish: string, perFoot: number, label: string): readonly string[] => [
  finish,
  label,
  usd(standardArea * perFoot),
  usd(backyardArea * perFoot),
];

const RESURFACING_STEPS: readonly GuideStep[] = [
  {
    title: 'Measure the surface, not the water',
    text: `A finish is priced by the area it covers: the floor plus the four walls. A 16 x 32 ft pool 3 ft 6 in to 8 ft deep has 512 square feet of floor and 552 of walls at the mean depth, ${sqft(backyardArea)} in all; a 12 x 24 ft pool 3 ft 6 in to 6 ft deep has ${sqft(standardArea)}. A sloped floor adds a little.`,
    link: { href: VOLUME_TEXTS.path, label: 'The same measurements give your gallons' },
  },
  {
    title: 'Know when it is due',
    text: 'Chalking, cracking, discoloration and blistering mean the plaster is wearing, This Old House says, and depending on the region a concrete pool needs it every ten to twenty years. Bob Vila’s 2022 guide gave about every 10 to 12 years, depending on the finish.',
    sources: ['tohResurfacing', 'vilaResurfacing'],
  },
  {
    title: 'Choose the finish by how long it lasts',
    text: 'Pool paint has the shortest life, This Old House says: 2 to 3 years for acrylic and 7 to 10 for epoxy. Plaster lasts ten to twenty years by region, and a tiled pool won’t need resurfacing for at least twenty years.',
    sources: ['tohResurfacing'],
  },
  {
    title: 'Paint by the gallon',
    text: `Pool paint starts at about $50 a gallon for acrylic and about $100 or more for epoxy, and a gallon covers one coat of 100 square feet, This Old House says. The 16 x 32 ft pool takes about ${String(Math.ceil(backyardArea / 100))} gallons a coat, ${usd(Math.ceil(backyardArea / 100) * 50)} of acrylic before the labor.`,
    sources: ['tohResurfacing'],
  },
  {
    title: 'Drain it, then refill it',
    text: 'Bob Vila’s 2022 guide put draining a pool at $175 to $225. Refilling is the whole volume again, so know your gallons and how long the hose will run.',
    link: { href: FILL_TIME.path, label: 'How long it takes to fill' },
    sources: ['vilaResurfacing'],
  },
  {
    title: 'Balance the new water',
    text: 'A pool of new water needs its chemistry brought into range before anyone swims: test it and dose each level to its target.',
    link: { href: CHEMISTRY_CHART.path, label: 'See every target range' },
  },
  {
    title: 'A fiberglass or vinyl pool is different',
    text: 'A fiberglass pool gets a new gelcoat or coating, This Old House says, from $1,500 for epoxy to $15,000 or more for polymers, after a full drain and surface preparation. Fiberglass laid over old plaster costs $5 to $7 per square foot. A vinyl pool gets a new liner instead.',
    link: { href: LINER_PATH, label: 'What a new liner costs' },
    sources: ['tohResurfacing'],
  },
  {
    title: 'Kits you apply yourself',
    text: `This Old House mentions kits sold for DIY replastering, one covering 60 square feet for $130: the 16 x 32 ft pool would take ${String(Math.ceil(backyardArea / 60))} of them, ${usd(Math.ceil(backyardArea / 60) * 130)} of material.`,
    sources: ['tohResurfacing'],
  },
  {
    title: 'Every pool cost, side by side',
    text: 'Building, relining and resurfacing, with the monthly cost of keeping a pool, are on one table.',
    link: hubLink,
  },
];

/** How much it costs to resurface a pool: This Old House and Bob Vila, worked out on two pools. */
export const RESURFACING_COST = {
  path: RESURFACING_PATH,
  checked: CHECKED,
  kicker: 'Cost guide · resurfacing',
  card: {
    title: 'Pool resurfacing cost',
    summary: 'Plaster, aggregate, fiberglass, tile and paint, worked out by area.',
  },
  title: 'How Much Does It Cost to Resurface a Pool? | Pool Figures',
  description:
    'Resurfacing a pool in plaster costs about $5 per square foot, about $5,320 for a 16 x 32 ft pool: plaster, aggregate, fiberglass, tile and paint compared.',
  h1: 'How much does it cost to resurface a pool?',
  lead: `Resurfacing a concrete pool in plain plaster costs about $5 per square foot, This Old House says (June 2026, from a HomeAdvisor national average), and nearly double for a polished exposed aggregate; fiberglass over plaster is $5 to $7 per square foot. Bob Vila’s 2022 guide put the whole job at $1,000 to $30,000, about $6,500 on average. A 16 x 32 ft pool, 3 ft 6 in to 8 ft deep, has about ${sqft(backyardArea)} to cover: about ${usd(backyardArea * 5)} in plaster.`,
  note: NOTE,
  table: {
    caption: 'Pool resurfacing prices by finish',
    region: 'Pool resurfacing prices',
    head: ['Finish', 'This Old House, June 2026', 'Bob Vila, July 2022'],
    rows: [
      ['Plain plaster', 'about $5 per square foot', '$5,500 per 1,000 square feet'],
      ['Exposed aggregate', 'nearly double plain plaster', 'about $6,500 per 1,000 square feet'],
      ['Fiberglass over plaster', '$5 to $7 per square foot', '—'],
      [
        'Tile',
        'tile alone from about $4 per square foot for ceramic to $7 to $50 and up for stone or glass',
        'up to $30,000 per 1,000 square feet',
      ],
      [
        'Paint',
        'about $50 a gallon acrylic, $100 or more epoxy; a gallon covers 100 square feet',
        'about $1,500 per 1,000 square feet',
      ],
    ],
    sources: ['tohResurfacing', 'vilaResurfacing'],
  },
  moreTables: [
    {
      caption: `The rates worked out on two pools: 12 x 24 ft (${sqft(standardArea)}) and 16 x 32 ft (${sqft(backyardArea)}), before draining and refilling (our arithmetic)`,
      region: 'Pool resurfacing cost, worked out',
      head: ['Finish', 'Rate', '12 x 24 ft', '16 x 32 ft'],
      rows: [
        finishRow('Paint', 1.5, '$1,500 per 1,000 sq ft'),
        finishRow('Plain plaster', 5, '$5 per sq ft'),
        finishRow('Plain plaster', 5.5, '$5,500 per 1,000 sq ft'),
        finishRow('Exposed aggregate', 6.5, '$6,500 per 1,000 sq ft'),
        [
          'Fiberglass over plaster',
          '$5 to $7 per sq ft',
          span(standardArea * 5, standardArea * 7),
          span(backyardArea * 5, backyardArea * 7),
        ],
      ],
      sources: ['tohResurfacing', 'vilaResurfacing'],
    },
  ],
  sources: pick('tohResurfacing', 'vilaResurfacing'),
  steps: RESURFACING_STEPS,
} as const satisfies CostGuide;

// --- How much does it cost to replace a pool liner ---

const LINER_STEPS: readonly GuideStep[] = [
  {
    title: 'Measure the surface the liner covers',
    text: `A liner covers the floor and the walls. A 12 x 24 ft pool 3 ft 6 in to 6 ft deep has about ${sqft(standardArea)}, a 16 x 32 ft pool 3 ft 6 in to 8 ft deep about ${sqft(backyardArea)}: at This Old House’s $1 to $5 per square foot, ${span(standardArea, standardArea * 5)} and ${span(backyardArea, backyardArea * 5)}.`,
    link: { href: VOLUME_TEXTS.path, label: 'The same measurements give your gallons' },
    sources: ['tohResurfacing'],
  },
  {
    title: 'Know when it is time',
    text: 'Inground vinyl liners need replacing around every 5 to 9 years, River Pools says, and This Old House gives five to nine years. Bob Vila gives 5 to 10 years, and Latham about 10 years for a high-quality liner.',
    sources: ['riverLiner', 'tohResurfacing', 'vilaLiner', 'lathamVinyl'],
  },
  {
    title: 'Keep the water from shortening it',
    text: 'Harsh chemicals and water chemistry that is not kept in range weaken a liner and shorten its life, River Pools says. Keep each level inside its range.',
    link: { href: CHEMISTRY_CHART.path, label: 'See every target range' },
    sources: ['riverLiner'],
  },
  {
    title: 'Thickness and pattern',
    text: 'A standard liner is 20 mil thick, Bob Vila says, and may cost around $600, while a thicker liner averages $1,700. Thicker liners are more durable, River Pools says, and a non-embossed liner keeps the same thickness all over.',
    sources: ['vilaLiner', 'riverLiner'],
  },
  {
    title: 'Labor is most of the bill',
    text: 'Bob Vila puts an inground liner at $700 to $1,500 for materials and $1,000 to $2,500 for the labor to install it, so the two together come to $1,700 to $4,000. An above-ground liner is $100 to $600, and $250 to $800 to install.',
    sources: ['vilaLiner'],
  },
  {
    title: 'Drain and refill',
    text: 'Refilling with city water runs $60 to $120 on average, Bob Vila says. A well or a delivery truck changes that figure, and so does the size of the pool.',
    link: { href: FILL_TIME.path, label: 'How long it takes to fill' },
    sources: ['vilaLiner'],
  },
  {
    title: 'Treat the new water',
    text: 'A pool of new water needs its chemistry balanced and its chlorine brought up, as when you open the pool in spring.',
    link: { href: OPENING_PATH, label: 'The opening steps, in order' },
  },
  {
    title: 'Count twenty years of liners',
    text: 'River Pools puts the liners of a vinyl pool at $9,000 to $18,000 over 20 years. A fiberglass shell has no liner to replace, which is part of the difference in their price.',
    link: { href: FIBERGLASS_PATH, label: 'What a fiberglass pool costs' },
    sources: ['riverLiner'],
  },
  {
    title: 'Every pool cost, side by side',
    text: 'Building, resurfacing and relining, with what a pool costs a month, are on one table.',
    link: hubLink,
  },
];

/** How much it costs to replace a pool liner: River Pools, Bob Vila and This Old House. */
export const LINER_COST = {
  path: LINER_PATH,
  checked: CHECKED,
  kicker: 'Cost guide · vinyl liner',
  card: {
    title: 'Liner replacement cost',
    summary: 'The liner, the labor and the water, and how often a liner needs it.',
  },
  title: 'How Much Does It Cost to Replace a Pool Liner? | Pool Figures',
  description:
    'Replacing an inground vinyl pool liner costs about $4,500 or more with the labor and the water: the liner, the labor, thickness, and how often to replace it.',
  h1: 'How much does it cost to replace a pool liner?',
  lead: 'Replacing an inground vinyl pool liner costs around $4,500 or more for the liner, the labor, the chemicals and the water to refill, River Pools says (2024). Bob Vila puts liner jobs at $1,125 to $3,688, $2,393 on average (2024), and This Old House at $1 to $5 per square foot (2026). Plan on a new one every 5 to 9 years.',
  note: NOTE,
  table: {
    caption: 'Vinyl pool liner replacement prices',
    region: 'Pool liner replacement prices',
    head: ['What', 'Price', 'Source'],
    rows: [
      [
        'Inground liner, labor, chemicals and water',
        '$4,500 or more',
        'River Pools, September 2024',
      ],
      ['A liner replacement, range', '$1,125 to $3,688, $2,393 on average', 'Bob Vila, June 2024'],
      ['Inground liner, materials', '$700 to $1,500', 'Bob Vila, June 2024'],
      ['Inground liner, labor', '$1,000 to $2,500', 'Bob Vila, June 2024'],
      [
        'Above-ground liner, materials and labor',
        '$100 to $600, plus $250 to $800',
        'Bob Vila, June 2024',
      ],
      ['Refill with city water', '$60 to $120', 'Bob Vila, June 2024'],
      ['Per square foot of surface', '$1 to $5', 'This Old House, June 2026'],
    ],
    sources: ['riverLiner', 'vilaLiner', 'tohResurfacing'],
  },
  moreTables: [
    {
      caption: `This Old House’s $1 to $5 per square foot on two pools, and Bob Vila’s inground materials and labor added up (our arithmetic)`,
      region: 'Pool liner cost, worked out',
      head: ['Pool', 'Surface', 'At $1 to $5 per sq ft'],
      rows: [
        ['12 x 24 ft, 3 ft 6 in to 6 ft', sqft(standardArea), span(standardArea, standardArea * 5)],
        ['16 x 32 ft, 3 ft 6 in to 8 ft', sqft(backyardArea), span(backyardArea, backyardArea * 5)],
        ['Any inground, materials and labor', '—', span(700 + 1000, 1500 + 2500)],
      ],
      sources: ['tohResurfacing', 'vilaLiner'],
    },
  ],
  sources: pick('riverLiner', 'vilaLiner', 'tohResurfacing', 'lathamVinyl'),
  steps: LINER_STEPS,
} as const satisfies CostGuide;

// --- How much does a pool cost (the hub) ---

const HUB_STEPS: readonly GuideStep[] = [
  {
    title: 'Start with the kind of pool',
    text: 'Vinyl is the lowest price of the three inground materials at every size This Old House lists, fiberglass sits in the middle, and concrete is the highest. Its table runs from a 10 x 20 ft pool to 16 x 32 ft.',
    link: { href: INGROUND_PATH, label: 'Inground pool cost by size' },
    sources: ['tohInground'],
  },
  {
    title: 'The smallest pool that still cools you off',
    text: 'An inground plunge pool is about $20,000 as a ballpark, This Old House says, and a small one $10,000 to $35,000 or more.',
    link: { href: PLUNGE_PATH, label: 'Plunge pool cost' },
    sources: ['tohPlunge'],
  },
  {
    title: 'A shell from the factory',
    text: 'A fiberglass pool comes in the maker’s sizes; River Pools’ basic install is $60,000 to $100,000, and $85,000 to $135,000 with a concrete patio.',
    link: { href: FIBERGLASS_PATH, label: 'Fiberglass pool cost' },
    sources: ['riverFiberglass'],
  },
  {
    title: 'The fence',
    text: 'The Consumer Product Safety Commission’s guidelines want a barrier at least 48 inches high, with self-closing and self-latching gates; some places require 60 inches. This Old House prices a fence at $3,000 to $10,000.',
    sources: ['cpsc', 'tohInground'],
  },
  {
    title: 'The deck, the heater and the cover',
    text: 'This Old House puts decking at $5,000 to $20,000, a heater at $3,450 to $5,450 and a cover at $2,700 to $3,700.',
    link: { href: HEATER.path, label: 'Size the heater' },
    sources: ['tohInground'],
  },
  {
    title: 'What it costs every month',
    text: 'Pools tend to cost $90 to $270 per month to maintain, This Old House says. The pump’s running hours and the chemicals are the parts you control.',
    link: { href: PUMP_GUIDE_PATH, label: 'How long to run the pump' },
    sources: ['tohInground'],
  },
  {
    title: 'A new liner every few years',
    text: 'A vinyl pool needs a new liner every 5 to 9 years, around $4,500 or more with the labor and the water, River Pools says.',
    link: { href: LINER_PATH, label: 'Liner replacement cost' },
    sources: ['riverLiner'],
  },
  {
    title: 'A new surface every decade or two',
    text: 'A concrete pool is replastered every ten to twenty years by region, at about $5 per square foot of plain plaster, This Old House says.',
    link: { href: RESURFACING_PATH, label: 'Pool resurfacing cost' },
    sources: ['tohResurfacing'],
  },
  {
    title: 'Why the sources disagree',
    text: 'Each counts a different job. Bob Vila’s 2024 guide gave a national average of $36,730 to build a pool, from $1,800 to $58,540, with above-ground pools in the mix, while River Pools’ turn-key prices include the patio and the work around the pool. Read what a figure includes before you compare it.',
    sources: ['vilaBuild', 'riverTypes'],
  },
];

/** How much a pool costs: every kind on one table, then the costs after it is built. */
export const COST_HUB = {
  path: HUB_PATH,
  checked: CHECKED,
  kicker: 'Cost guide · every pool',
  card: {
    title: 'How much a pool costs',
    summary: 'Above-ground kits to turn-key concrete, and what it costs to keep.',
  },
  title: 'How Much Does a Pool Cost? Every Type Compared | Pool Figures',
  description:
    'A pool costs $1,500 for an above-ground kit to $225,000 and more for turn-key concrete: every type on one table, and the fence, liner and upkeep after.',
  h1: 'How much does a pool cost?',
  lead: 'A pool costs from $1,500 for an above-ground kit to $225,000 and more for a turn-key concrete inground pool, River Pools’ December 2025 figures say. A standard 12 x 24 ft inground pool is $38,000 to $100,000 by This Old House: vinyl lowest, fiberglass in the middle, concrete highest. An inground plunge pool is about $20,000. Then count the fence, the deck, the upkeep, and the liner or the new surface ahead.',
  note: NOTE,
  table: {
    caption: 'What a pool costs, by kind',
    region: 'Pool cost by kind',
    head: ['Pool', 'Price', 'Source'],
    rows: [
      ['Above-ground kit', '$1,500 to $7,500', 'River Pools, December 2025'],
      ['Rectangular above-ground pool with a deck', '$20,000 and up', 'River Pools, December 2025'],
      [
        'Inground plunge pool',
        'about $20,000; a small one $10,000 to $35,000 or more',
        'This Old House, June 2026',
      ],
      ['12 x 24 ft vinyl inground', '$38,000 to $70,000', 'This Old House, June 2025'],
      ['12 x 24 ft fiberglass inground', '$50,000 to $95,000', 'This Old House, June 2025'],
      ['12 x 24 ft concrete inground', '$58,000 to $100,000', 'This Old House, June 2025'],
      ['Turn-key fiberglass inground', '$85,000 to $200,000 and up', 'River Pools, December 2025'],
      ['Turn-key concrete inground', '$95,000 to $225,000 and up', 'River Pools, December 2025'],
    ],
    sources: ['riverTypes', 'tohPlunge', 'tohInground'],
  },
  moreTables: [
    {
      caption: 'What a pool costs after it is built',
      region: 'Pool costs after it is built',
      head: ['Cost', 'Price', 'Source'],
      rows: [
        ['Upkeep', '$90 to $270 per month', 'This Old House, June 2025'],
        [
          'Upkeep over 10 years',
          '$11,000 to $17,000 vinyl; $27,000 to $40,000 concrete',
          'This Old House, June 2025',
        ],
        ['New vinyl liner, every 5 to 9 years', '$4,500 or more', 'River Pools, September 2024'],
        [
          'Replastering, every ten to twenty years',
          'about $5 per square foot',
          'This Old House, June 2026',
        ],
      ],
      sources: ['tohInground', 'riverLiner', 'tohResurfacing'],
    },
  ],
  sources: pick(
    'riverTypes',
    'tohPlunge',
    'tohInground',
    'riverFiberglass',
    'cpsc',
    'riverLiner',
    'tohResurfacing',
    'vilaBuild',
  ),
  steps: HUB_STEPS,
} as const satisfies CostGuide;

/** The cost guides, the hub first, in the order the home and llms.txt list them. */
export const COST_GUIDES: readonly CostGuide[] = [
  COST_HUB,
  INGROUND_COST,
  PLUNGE_COST,
  FIBERGLASS_COST,
  RESURFACING_COST,
  LINER_COST,
];
