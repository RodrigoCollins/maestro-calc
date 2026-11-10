import { CHEMISTRY_CHART } from './chemistry.ts';
import { gal, isQuantityOf, valueIn } from '@maestro-calc/core';
import { poolPump } from '@maestro-calc/pool-core/pool-pump';
import { CHLORINE, FILL_TIME, HEATER, PUMP, SALT } from './doses.ts';
import { gallonsOf } from './gallons.ts';
import type { GuideSource, GuideStep, GuideTable, StepGuide } from './guide.ts';
import {
  cents,
  chlorinePerPpm,
  heatingCostsOf,
  heatOf,
  hoursToHeat,
  PRICES,
  saltStartOf,
  type HeatingCost,
} from './running-costs.ts';
import { VOLUME_TEXTS } from './volume/texts.ts';
import { run } from './worked-math.ts';

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
/** The day the prices of the second round were read: build, 12 x 24, above ground and on. */
const CHECKED_2 = '2026-11-10';
const READ_2 = 'read November 10, 2026';

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
    name: `Bob Vila: How Much Does It Cost to Build a Pool? (updated May 29, 2024; ${READ_2})`,
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
  vilaMaintenance: {
    name: `Bob Vila: How Much Does Pool Maintenance Cost? (updated May 29, 2024; ${READ_2})`,
    url: 'https://www.bobvila.com/articles/pool-maintenance-cost/',
  },
  riverMaintenance: {
    name: `River Pools: Inground Swimming Pool Maintenance Costs: Chemicals, Electricity, and More (July 25, 2019; ${READ_2})`,
    url: 'https://www.riverpoolsandspas.com/blog/inground-swimming-pool-maintenance-costs',
  },
  energyStarPumps: {
    name: `ENERGY STAR: Pool Pumps (undated page, ${READ_2})`,
    url: 'https://www.energystar.gov/products/pool_pumps',
  },
  riverHeaters: {
    name: `River Pools: Swimming Pool Heaters: Types, Costs, Pros & Cons (updated February 12, 2026; ${READ_2})`,
    url: 'https://www.riverpoolsandspas.com/blog/swimming-pool-heater-cost-types',
  },
  fixrHeater: {
    name: `Fixr: Pool Heater Installation Cost (updated January 31, 2025; ${READ_2})`,
    url: 'https://www.fixr.com/costs/swimming-pool-heater',
  },
  fixrAboveGround: {
    name: `Fixr: Above-Ground Pool Installation Cost (updated August 19, 2022; ${READ_2})`,
    url: 'https://www.fixr.com/costs/above-ground-swimming-pool',
  },
  tohAboveGround: {
    name: `This Old House: Our 6 Best Above-Ground Pool Picks (updated June 19, 2025; ${READ_2})`,
    url: 'https://www.thisoldhouse.com/pools/best-above-ground-pool',
  },
  tohDeck: {
    name: `This Old House: Tips for Building a Deck Around Your Above-Ground Pool (updated June 8, 2026; ${READ_2})`,
    url: 'https://www.thisoldhouse.com/pools/tips-for-building-a-deck-around-your-above-ground-pool',
  },
  eiaElectricity: {
    name: `U.S. Energy Information Administration: Electric Power Monthly, Table 5.6.A, August 2026 data (released October 23, 2026; ${READ_2})`,
    url: 'https://www.eia.gov/electricity/monthly/epm_table_grapher.php?t=epmt_5_6_a',
  },
  eiaGas: {
    name: `U.S. Energy Information Administration: Natural Gas Prices, residential, August 2026 (released October 30, 2026; ${READ_2})`,
    url: 'https://www.eia.gov/dnav/ng/ng_pri_sum_dcu_nus_m.htm',
  },
  eiaPropane: {
    name: `U.S. Energy Information Administration: Heating Oil and Propane Update, week of November 2, 2026 (${READ_2})`,
    url: 'https://www.eia.gov/petroleum/heatingoilpropane/',
  },
  eiaUnits: {
    name: `U.S. Energy Information Administration: Units and calculators explained (undated page, ${READ_2})`,
    url: 'https://www.eia.gov/energyexplained/units-and-calculators/',
  },
  haywardHeatPro: {
    name: `Hayward: HeatPro Series sell sheet, LITHTPRO23 (2023; ${READ_2})`,
    url: 'https://hayward.com/media/akeneo_connector/asset_files/L/I/LITHTPRO23_HeatPro_Series_Sell_Sheet_DIGITAL_5b7e.pdf',
  },
  raypakAvia: {
    name: `Raypak: AVIA pool heaters (undated page, ${READ_2})`,
    url: 'https://www.raypak.com/?p=4239',
  },
  containur: {
    name: `ContainUR Pools: ContainUR Pool Specs (undated page, ${READ_2})`,
    url: 'https://containurpools.com/containur-pool-specs/',
  },
  containerPoolUsa: {
    name: `Container Pool USA: How Much Are Container Ship Pools? Cost Breakdown (November 23, 2025; ${READ_2})`,
    url: 'https://www.containerpoolusa.com/how-much-are-container-ship-pools-cost-breakdown',
  },
  hasaChlor: {
    name: `HASA: HASA CHLOR, 12.5% sodium hypochlorite (undated page, ${READ_2})`,
    url: 'https://hasa.com/product/hasachlor',
  },
  simplifiedChlorine: {
    name: `Simplified Pools: HASA 4 Gallon Liquid Chlorine Case, $35.99 (price as listed, ${READ_2})`,
    url: 'https://simplifiedpools.com/collections/vendors/products/hasa-hasachlor-4-gallon-chlorine-case',
  },
  simplifiedSalt: {
    name: `Simplified Pools: AQUASALT pool salt, 40 lb, $10.99 (price as listed, ${READ_2})`,
    url: 'https://simplifiedpools.com/shop/aqua-salt/',
  },
  dohenyShock: {
    name: `Doheny’s: Super Pool Shock, 24 x 1 lb, $99.99 on sale (price as listed, ${READ_2})`,
    url: 'https://www.doheny.com/doheny-super-shock-24-lb',
  },
  dohenyTabs: {
    name: `Doheny’s: 3 in Chlorine Tabs, 50 lb (label directions, ${READ_2})`,
    url: 'https://www.doheny.com/doheny-3-in-chlorine-tabs-50-lb',
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

// --- The second round: what the prices of the first leave to work out ---

const BUILD_PATH = '/cost-to-build-a-pool';
const TWELVE_PATH = '/12x24-pool-cost';
const ABOVE_GROUND_PATH = '/above-ground-pool-cost';
const CONTAINER_PATH = '/shipping-container-pool-cost';
const HEATER_COST_PATH = '/pool-heater-cost';
const MAINTENANCE_PATH = '/pool-maintenance-cost';

/** A figure to one decimal, grouped: `16.697` is `16.7`, `1836718.2` is `1,836,718.2`. */
const tenth = (value: number): string =>
  value.toLocaleString('en-US', { maximumFractionDigits: 1, minimumFractionDigits: 1 });
/** A whole figure, grouped: `1836718.2` is `1,836,718`. */
const whole = (value: number): string => Math.round(value).toLocaleString('en-US');
/** The number a grouped gallon figure stands for: `22,023` is `22023`. */
const numeric = (grouped: string): number => Number(grouped.replaceAll(',', ''));

const TWELVE_BY_24 = {
  length: '24 ft',
  width: '12 ft',
  shallow: '3 ft 6 in',
  deep: '6 ft',
} as const;
const twelveGallons = gallonsOf(TWELVE_BY_24);
const backyardCount = numeric(backyardGallons);
const twelveCount = numeric(twelveGallons);

/** The flow the pump calculator asks of `gallons`, in gallons a minute. */
const pumpFlowOf = (gallons: number): number => {
  const flow = run(poolPump, { gallons: String(gallons) }).get('flow');
  if (!isQuantityOf(flow, 'volume')) throw new Error('the pump flow must be a volume');
  return valueIn(flow, gal).toNumber();
};

const costOf = (costs: readonly HeatingCost[], key: HeatingCost['key']): HeatingCost => {
  const found = costs.find((cost) => cost.key === key);
  if (found === undefined) throw new Error(`no heating cost ${key}`);
  return found;
};

/** One warm-up of `gallons` by 10 °F: the heat, then what each heater burns or draws for it. */
const warmUpOf = (gallons: number) => {
  const btu = heatOf(gallons, 10);
  const costs = heatingCostsOf(btu);
  return {
    btu,
    warm: costOf(costs, 'heat-pump-80'),
    cool: costOf(costs, 'heat-pump-50'),
    resistance: costOf(costs, 'resistance'),
    gas: costOf(costs, 'natural-gas'),
    propane: costOf(costs, 'propane'),
  };
};

const backyardHeat = warmUpOf(backyardCount);
const twelveHeat = warmUpOf(twelveCount);
const twelveChlorine = chlorinePerPpm(twelveCount);
const twelveSalt = saltStartOf(twelveCount);
const backyardChlorine = chlorinePerPpm(backyardCount);
const backyardSalt = saltStartOf(backyardCount);

const PRICE_LINE = `at EIA’s average US residential prices: electricity 18.16 cents a kWh and natural gas $27.05 per thousand cubic feet in August 2026, propane $2.82 a gallon in the week of November 2, 2026`;

// --- How much does it cost to build a pool ---

const BUILD_STEPS: readonly GuideStep[] = [
  {
    title: 'Price the pool, then the work around it',
    text: 'Bob Vila’s guide splits a pool into the shell and the jobs that go with it, and puts the national average to build one at $36,730. Its inground prices are vinyl $20,000 to $40,000, fiberglass $20,000 to $60,000 and concrete $35,000 to $65,000, or $50 to $125 per square foot.',
    sources: ['vilaBuild'],
  },
  {
    title: 'The digging',
    text: 'Excavation averages about $3,400, Bob Vila says, and can reach $20,000 where the access is hard or the soil is rock. A yard a digger cannot reach, or a slope that needs a retaining wall, is where a quote climbs.',
    sources: ['vilaBuild'],
  },
  {
    title: 'The crew',
    text: 'Labor runs $5,000 to $30,000 by Bob Vila’s figures. Ask each builder what the labor line covers: the shell, the plumbing and the electrical are often separate trades.',
    sources: ['vilaBuild'],
  },
  {
    title: 'The permit and the inspection',
    text: 'Bob Vila puts a permit at $200 to $2,000 and an inspection at $125 to $250; This Old House gives permits of $450 to $1,800 depending on the location and the scope.',
    sources: ['vilaBuild', 'tohInground'],
  },
  {
    title: 'The fence the code asks for',
    text: 'A fence is $1,500 to $10,000 by Bob Vila, $3,000 to $10,000 by This Old House. The Consumer Product Safety Commission’s guidelines want the barrier at least 48 inches high, with self-closing and self-latching gates.',
    sources: ['vilaBuild', 'tohInground', 'cpsc'],
  },
  {
    title: 'The deck and the yard',
    text: 'A deck costs $500 to $20,000 and landscaping $3,000 to $5,000, or $4 to $12 per square foot, Bob Vila says. A concrete patio is often left out of a basic pool package, so check whether a quote includes it.',
    link: { href: FIBERGLASS_PATH, label: 'What a fiberglass package includes' },
    sources: ['vilaBuild'],
  },
  {
    title: 'The extras',
    text: 'Bob Vila prices a heater at $1,800 to $4,000, a cover at $800 to $2,600, lighting at $1,000 to $2,000 and water features at $450 to $1,900.',
    link: { href: HEATER_COST_PATH, label: 'What a heater costs to buy and run' },
    sources: ['vilaBuild'],
  },
  {
    title: 'Add the lines up',
    text: 'The low ends of Bob Vila’s lines (a $20,000 vinyl pool, $3,400 of digging, $5,000 of labor, a $200 permit, a $125 inspection and a $1,500 fence) come to $30,225 before a deck, a heater or any landscaping. Write your own quotes into the same lines to compare them.',
    sources: ['vilaBuild'],
  },
  {
    title: 'Or buy it turn-key',
    text: 'River Pools, a fiberglass maker, prices turn-key fiberglass pools at $85,000 to $200,000 and up and concrete at $95,000 to $225,000 and up, with the work around the pool counted in.',
    link: { href: INGROUND_PATH, label: 'Inground pool cost by size' },
    sources: ['riverTypes'],
  },
  {
    title: 'Every pool cost, side by side',
    text: 'Plunge, above-ground and container pools, and what each costs to keep, are on one table.',
    link: hubLink,
  },
];

/** How much it costs to build a pool: Bob Vila's line items, This Old House and River Pools. */
export const BUILD_COST = {
  path: BUILD_PATH,
  checked: CHECKED_2,
  kicker: 'Cost guide · building a pool',
  card: {
    title: 'Cost to build a pool',
    summary: 'Line by line: the shell, the digging, the crew, the permit and the fence.',
  },
  title: 'How Much Does It Cost to Build a Pool? By Line | Pool Figures',
  description:
    'Building a pool costs $36,730 on average, $1,800 to $58,540: the shell, excavation, labor, permit, inspection, fence and deck, each priced, then added up.',
  h1: 'How much does it cost to build a pool?',
  lead: 'Building a pool costs $1,800 to $58,540, and $36,730 on average, Bob Vila’s guide says (May 2024), above-ground pools included. An inground pool alone is $20,000 to $65,000 by material, and the jobs around it add their own lines: excavation about $3,400, labor $5,000 to $30,000, a permit $200 to $2,000 and a fence $1,500 to $10,000. Turn-key pools with the patio and the work around them run $85,000 to $225,000 and up, River Pools says.',
  note: NOTE,
  table: {
    caption: 'What building a pool costs, line by line (Bob Vila, May 2024)',
    region: 'Pool construction cost by line',
    head: ['Line', 'Price'],
    rows: [
      ['Vinyl inground pool', '$20,000 to $40,000'],
      ['Fiberglass inground pool', '$20,000 to $60,000'],
      ['Concrete inground pool', '$35,000 to $65,000'],
      ['Above-ground pool', '$700 to $5,000'],
      ['Excavation', 'about $3,400 on average, up to $20,000'],
      ['Labor', '$5,000 to $30,000'],
      ['Permit', '$200 to $2,000'],
      ['Inspection', '$125 to $250'],
      ['Fence', '$1,500 to $10,000'],
      ['Deck', '$500 to $20,000'],
      ['Landscaping', '$3,000 to $5,000, or $4 to $12 per square foot'],
      ['Heater', '$1,800 to $4,000'],
      ['Cover', '$800 to $2,600'],
      ['Lighting', '$1,000 to $2,000'],
      ['Water features', '$450 to $1,900'],
    ],
    sources: ['vilaBuild'],
  },
  moreTables: [
    {
      caption: 'The same lines by other sources',
      region: 'Pool construction cost, other sources',
      head: ['Line', 'Price', 'Source'],
      rows: [
        ['Inground pool, per square foot', '$130 to $350 by material', 'This Old House, June 2025'],
        ['Permit', '$450 to $1,800', 'This Old House, June 2025'],
        ['Fence', '$3,000 to $10,000', 'This Old House, June 2025'],
        ['Decking', '$5,000 to $20,000', 'This Old House, June 2025'],
        ['Turn-key fiberglass', '$85,000 to $200,000 and up', 'River Pools, December 2025'],
        ['Turn-key concrete', '$95,000 to $225,000 and up', 'River Pools, December 2025'],
      ],
      sources: ['tohInground', 'riverTypes'],
    },
  ],
  sources: pick('vilaBuild', 'tohInground', 'cpsc', 'riverTypes'),
  steps: BUILD_STEPS,
} as const satisfies CostGuide;

// --- How much does a 12 x 24 pool cost ---

const TWELVE_STEPS: readonly GuideStep[] = [
  {
    title: 'The price by material',
    text: `This Old House prices a 12 x 24 ft inground pool at ${span(twelve[2], twelve[3])} in vinyl, ${span(twelve[4], twelve[5])} in fiberglass and ${span(twelve[6], twelve[7])} in concrete. Its rate per square foot on the 288 square feet of water gives ${perSqftOf(288, PER_SQFT.vinyl)} in vinyl, close to its table.`,
    sources: ['tohInground'],
  },
  {
    title: 'A lower figure, and why',
    text: 'Bob Vila’s 2024 guide puts a 12 x 24 ft inground pool at $26,000 to $37,500, depending on the material. It counts the pool installation, while This Old House’s range sits higher; read what each quote includes before you compare.',
    sources: ['vilaBuild', 'tohInground'],
  },
  {
    title: 'Or above ground',
    text: 'A 12 x 24 ft oval above-ground pool 52 inches deep costs $2,000 to $5,000 for the materials, Fixr’s 2022 guide says, with installation labor of $2,000 to $5,000 on top.',
    link: { href: ABOVE_GROUND_PATH, label: 'What an above-ground pool costs' },
    sources: ['fixrAboveGround'],
  },
  {
    title: 'The water it holds',
    text: `At 3 ft 6 in to 6 ft deep, a 12 x 24 ft pool holds ${twelveGallons} gallons by the volume calculator. The filter pump has to turn that over, ${whole(pumpFlowOf(twelveCount))} gallons a minute by the pump calculator, the 36 gpm floor of the standard being more than the six-hour turnover.`,
    link: { href: PUMP.path, label: 'Size the pump' },
  },
  {
    title: 'The surface it has to keep',
    text: `The floor and the walls come to ${sqft(standardArea)}. A new vinyl liner at This Old House’s $1 to $5 per square foot is ${span(standardArea, standardArea * 5)}, and plain plaster at about $5 is ${usd(standardArea * 5)}.`,
    link: { href: RESURFACING_PATH, label: 'What resurfacing costs' },
    sources: ['tohResurfacing'],
  },
  {
    title: 'Warming it by 10 °F',
    text: `The heater calculator gives ${whole(twelveHeat.btu)} Btu to warm ${twelveGallons} gallons by 10 °F. A heat pump at COP 5.7 draws ${tenth(twelveHeat.warm.amount)} kWh for it, ${cents(twelveHeat.warm.dollars)}, and a gas heater at 84% burns ${cents(twelveHeat.gas.dollars)} of natural gas, ${PRICE_LINE}. Heat lost while it warms is extra.`,
    link: { href: HEATER_COST_PATH, label: 'What a heater costs to run' },
    sources: ['haywardHeatPro', 'raypakAvia', 'eiaElectricity', 'eiaGas', 'eiaPropane', 'eiaUnits'],
  },
  {
    title: 'The chlorine it burns',
    text: `Raising its free chlorine 1 ppm takes ${tenth(twelveChlorine.gallons * 128)} fl oz of 12.5% liquid chlorine by the chlorine calculator, ${cents(twelveChlorine.dollars)} at $35.99 for a 4-gallon case. Every ppm the sun and swimmers take costs that again.`,
    link: { href: CHLORINE.path, label: 'Work out the chlorine dose' },
    sources: ['simplifiedChlorine'],
  },
  {
    title: 'Salt for a salt system',
    text: `Bringing new water to 3,200 ppm takes ${whole(twelveSalt.pounds)} lb of salt by the salt calculator, ${String(twelveSalt.bags)} bags of 40 lb, ${cents(twelveSalt.bags * 10.99)} at $10.99 a bag.`,
    link: { href: SALT.path, label: 'Work out the salt' },
    sources: ['simplifiedSalt'],
  },
  {
    title: 'Every pool cost, side by side',
    text: 'Other sizes and kinds, and what a pool costs a month, are on one table.',
    link: hubLink,
  },
];

/** How much a 12 x 24 pool costs: its price by material, then its own water and surface priced. */
export const TWELVE_BY_24_COST = {
  path: TWELVE_PATH,
  checked: CHECKED_2,
  kicker: 'Cost guide · 12 x 24 pool',
  card: {
    title: '12 x 24 pool cost',
    summary: 'Inground and above ground, then its gallons, surface, heat and chlorine priced.',
  },
  title: 'How Much Does a 12 x 24 Pool Cost? Built and Run | Pool Figures',
  description:
    'A 12 x 24 ft inground pool costs $38,000 to $100,000; above ground, $2,000 to $5,000. Its 10,233 gallons, liner, heating and chlorine, each priced.',
  h1: 'How much does a 12 x 24 pool cost?',
  lead: `A 12 x 24 ft inground pool costs $38,000 to $100,000 installed by This Old House (June 2025): ${span(twelve[2], twelve[3])} in vinyl, ${span(twelve[4], twelve[5])} in fiberglass, ${span(twelve[6], twelve[7])} in concrete. Bob Vila’s 2024 guide gives $26,000 to $37,500, and a 12 x 24 ft oval above-ground pool is $2,000 to $5,000 for the materials, Fixr says. At 3 ft 6 in to 6 ft deep it holds ${twelveGallons} gallons, which sets what it costs to heat, treat and reline.`,
  note: NOTE,
  table: {
    caption: 'What a 12 x 24 ft pool costs to install',
    region: '12 x 24 pool cost',
    head: ['Pool', 'Price', 'Source'],
    rows: [
      ['Vinyl inground', span(twelve[2], twelve[3]), 'This Old House, June 2025'],
      ['Fiberglass inground', span(twelve[4], twelve[5]), 'This Old House, June 2025'],
      ['Concrete inground', span(twelve[6], twelve[7]), 'This Old House, June 2025'],
      ['Inground, by material', '$26,000 to $37,500', 'Bob Vila, May 2024'],
      ['Oval above-ground, 52 in, materials', '$2,000 to $5,000', 'Fixr, August 2022'],
    ],
    sources: ['tohInground', 'vilaBuild', 'fixrAboveGround'],
  },
  moreTables: [
    {
      caption: `A 12 x 24 ft pool, 3 ft 6 in to 6 ft deep, worked out by the calculators and priced (our arithmetic)`,
      region: '12 x 24 pool running costs, worked out',
      head: ['What', 'Amount', 'Cost'],
      rows: [
        ['Water', `${twelveGallons} gallons`, '—'],
        ['Liner, $1 to $5 per sq ft', sqft(standardArea), span(standardArea, standardArea * 5)],
        ['Plain plaster, about $5 per sq ft', sqft(standardArea), usd(standardArea * 5)],
        [
          'Warm it 10 °F, heat pump at COP 5.7',
          `${whole(twelveHeat.btu)} Btu, ${tenth(twelveHeat.warm.amount)} kWh`,
          cents(twelveHeat.warm.dollars),
        ],
        [
          'Warm it 10 °F, natural gas at 84%',
          `${tenth(twelveHeat.gas.amount * 1000)} cubic feet`,
          cents(twelveHeat.gas.dollars),
        ],
        [
          'Raise free chlorine 1 ppm, 12.5% liquid',
          `${tenth(twelveChlorine.gallons * 128)} fl oz`,
          cents(twelveChlorine.dollars),
        ],
        [
          'Salt to 3,200 ppm, 40 lb bags',
          `${String(twelveSalt.bags)} bags`,
          cents(twelveSalt.bags * 10.99),
        ],
      ],
      sources: [
        'tohResurfacing',
        'haywardHeatPro',
        'raypakAvia',
        'eiaElectricity',
        'eiaGas',
        'eiaUnits',
        'simplifiedChlorine',
        'simplifiedSalt',
      ],
    },
  ],
  sources: pick(
    'tohInground',
    'vilaBuild',
    'fixrAboveGround',
    'tohResurfacing',
    'haywardHeatPro',
    'raypakAvia',
    'eiaElectricity',
    'eiaGas',
    'eiaPropane',
    'eiaUnits',
    'simplifiedChlorine',
    'simplifiedSalt',
  ),
  steps: TWELVE_STEPS,
} as const satisfies CostGuide;

// --- How much does an above ground pool cost ---

const round15 = gallonsOf({ shape: 'round', length: '15 ft', shallow: '4 ft', deep: '4 ft' });
const round18 = gallonsOf({ shape: 'round', length: '18 ft', shallow: '4 ft', deep: '4 ft' });
const round24 = gallonsOf({ shape: 'round', length: '24 ft', shallow: '4 ft', deep: '4 ft' });
// a 12 x 12 ft deck: This Old House's material plus labor per square foot
const DECK = 144;

const ABOVE_GROUND_STEPS: readonly GuideStep[] = [
  {
    title: 'The kit',
    text: 'River Pools puts above-ground pool kits at $1,500 to $7,500, and budget pools at as little as $100 to $800, lasting 1 to 3 summers. This Old House’s 2025 picks run from $161.89 for a 12 ft x 30 in metal-frame pool to $2,113.89 for a 32 x 16 ft x 52 in one, prices taken when it published.',
    sources: ['riverTypes', 'tohAboveGround'],
  },
  {
    title: 'The size',
    text: 'Fixr’s 2022 guide prices a 15 ft round pool at $800 to $1,500, an 18 ft round at $1,000 to $2,500, a 24 ft round 52 inches deep at $2,000 to $3,500 and a 16 x 32 ft rectangle at $3,500 to $6,000.',
    link: { href: TWELVE_PATH, label: 'What a 12 x 24 pool costs' },
    sources: ['fixrAboveGround'],
  },
  {
    title: 'The water each size holds',
    text: `With 4 ft of water, a 15 ft round pool holds ${round15} gallons, an 18 ft ${round18} and a 24 ft ${round24} by the volume calculator. The gallons set the chlorine, the salt and the pump.`,
    link: { href: VOLUME_TEXTS.path, label: 'Work out your gallons' },
  },
  {
    title: 'Putting it up',
    text: 'Installation usually runs $1,000 to $3,000, River Pools says; Fixr gives $2,000 to $5,000 of labor depending on the type, the size and the scope, and $1,500 to $3,000 to clear the land.',
    sources: ['riverTypes', 'fixrAboveGround'],
  },
  {
    title: 'Power for the pump',
    text: 'An electrician charges $65 to $85 an hour to run the pool’s power, Fixr says. The pump has to turn the water over, so size it by your gallons.',
    link: { href: PUMP.path, label: 'Size the pump' },
    sources: ['fixrAboveGround'],
  },
  {
    title: 'A deck around it',
    text: `This Old House prices pressure-treated wood at $2 to $5 per square foot and composite at $12 to $22, with labor of $15 to $35. A ${String(DECK)} square foot deck, 12 x 12 ft, comes to ${span(DECK * 17, DECK * 40)} in pressure-treated wood and ${span(DECK * 27, DECK * 57)} in composite, built.`,
    sources: ['tohDeck'],
  },
  {
    title: 'Partly in the ground',
    text: 'A semi above-ground pool costs $7,000 to $10,000, Fixr says, and a rectangular pool with a deck typically more than $20,000 installed, by River Pools.',
    sources: ['fixrAboveGround', 'riverTypes'],
  },
  {
    title: 'Against an inground pool',
    text: 'A 12 x 24 ft inground pool starts at $38,000 in vinyl by This Old House, far above any kit.',
    link: { href: INGROUND_PATH, label: 'What an inground pool costs' },
    sources: ['tohInground'],
  },
  {
    title: 'Every pool cost, side by side',
    text: 'Plunge, container and inground pools, and the cost of keeping each, are on one table.',
    link: hubLink,
  },
];

/** How much an above-ground pool costs: River Pools, Fixr and This Old House, by size. */
export const ABOVE_GROUND_COST = {
  path: ABOVE_GROUND_PATH,
  checked: CHECKED_2,
  kicker: 'Cost guide · above-ground pool',
  card: {
    title: 'Above-ground pool cost',
    summary: 'Kits by size, putting it up, the power and a deck, with the gallons of each.',
  },
  title: 'How Much Does an Above Ground Pool Cost? By Size | Pool Figures',
  description:
    'An above-ground pool kit costs $1,500 to $7,500, installed $3,000 to $7,500: prices by size, putting it up, a deck priced per square foot, and the gallons.',
  h1: 'How much does an above ground pool cost?',
  lead: 'An above-ground pool kit costs $1,500 to $7,500, River Pools says (December 2025), and putting it up usually $1,000 to $3,000 more. Fixr’s 2022 guide puts the job at $3,000 to $7,500 installed, $5,000 on average, from $800 to $1,500 for a 15 ft round pool to $3,500 to $6,000 for a 16 x 32 ft rectangle. A rectangular pool with a deck typically runs over $20,000.',
  note: NOTE,
  table: {
    caption: 'Above-ground pool prices by size, and the water each holds',
    region: 'Above-ground pool cost by size',
    head: ['Pool', 'Price', 'Source', 'Water at 4 ft deep'],
    rows: [
      ['15 ft round', '$800 to $1,500', 'Fixr, August 2022', `${round15} gallons`],
      ['18 ft round', '$1,000 to $2,500', 'Fixr, August 2022', `${round18} gallons`],
      [
        '18 ft x 52 in round, Intex Ultra XTR',
        '$1,049.99',
        'This Old House, June 2025',
        `${round18} gallons`,
      ],
      ['24 ft x 52 in round', '$2,000 to $3,500', 'Fixr, August 2022', `${round24} gallons`],
      ['12 x 24 ft x 52 in oval', '$2,000 to $5,000', 'Fixr, August 2022', '—'],
      ['16 x 32 ft x 54 in rectangle', '$3,500 to $6,000', 'Fixr, August 2022', '—'],
    ],
    sources: ['fixrAboveGround', 'tohAboveGround'],
  },
  moreTables: [
    {
      caption: 'What goes with the kit',
      region: 'Above-ground pool extras',
      head: ['Cost', 'Price', 'Source'],
      rows: [
        ['Kit', '$1,500 to $7,500', 'River Pools, December 2025'],
        ['Installation', '$1,000 to $3,000', 'River Pools, December 2025'],
        ['Installation labor', '$2,000 to $5,000', 'Fixr, August 2022'],
        ['Clearing the land', '$1,500 to $3,000', 'Fixr, August 2022'],
        ['Electrician', '$65 to $85 an hour', 'Fixr, August 2022'],
        ['Deck, materials and labor', '$17 to $57 per square foot', 'This Old House, June 2026'],
        ['Semi above-ground pool', '$7,000 to $10,000', 'Fixr, August 2022'],
      ],
      sources: ['riverTypes', 'fixrAboveGround', 'tohDeck'],
    },
  ],
  sources: pick('riverTypes', 'tohAboveGround', 'fixrAboveGround', 'tohDeck', 'tohInground'),
  steps: ABOVE_GROUND_STEPS,
} as const satisfies CostGuide;

// --- How much does a shipping container pool cost ---

const containerHeat = heatOf(3800, 10);
const containerKwh = containerHeat / 3412;
const CONTAINER_KW = 11;

const CONTAINER_STEPS: readonly GuideStep[] = [
  {
    title: 'What you are buying',
    text: 'A container pool is a steel shipping container made into a pool, or a fiberglass shell set inside one, built in a shop and delivered whole. This Old House lists steel container pools from $42,000 for 20 x 8 ft to $56,000 for 20 x 12 ft with a coated interior, and a 20 x 8 ft one with a fiberglass liner at $44,900.',
    sources: ['tohPrefab'],
  },
  {
    title: 'Read what the price leaves out',
    text: 'ContainUR’s 8 x 20 ft pool is $45,000 with the pump, filter, sanitizer, lights and a heater, but not the freight, the site preparation, the electrical hookup, the permits or the crane or forklift to unload it.',
    sources: ['containur'],
  },
  {
    title: 'The ground under it',
    text: 'Filled, ContainUR’s pool weighs 37,000 lb, so the ground must carry it. Container Pool USA, a seller, prices a concrete slab at $2,400 to $4,800 for a 20 x 20 ft pad and excavation for an inground set at $500 to $3,000.',
    sources: ['containur', 'containerPoolUsa'],
  },
  {
    title: 'Delivery and the crane',
    text: 'Shipping starts at around $3,000, This Old House says, and a crane to fly a pool over the house can be $10,000 or more. Container Pool USA puts delivery and the crane at $1,000 to $3,000 and up.',
    sources: ['tohPrefab', 'containerPoolUsa'],
  },
  {
    title: 'The power it draws',
    text: 'ContainUR’s pool needs a 220 to 240 volt supply of 30 to 80 amps, depending on the heater. Container Pool USA puts the electrical hookup at $1,000 to $2,000 of labor.',
    sources: ['containur', 'containerPoolUsa'],
  },
  {
    title: 'Small water heats fast',
    text: `ContainUR’s pool holds 3,800 gallons. Warming it 10 °F takes ${whole(containerHeat)} Btu by the heater calculator: ${tenth(containerKwh)} kWh, about ${tenth(hoursToHeat(containerKwh, CONTAINER_KW))} hours of its 11 kW electric heater and ${cents(containerKwh * PRICES.electricity)} at EIA’s August 2026 average of 18.16 cents a kWh, before the heat it loses.`,
    link: { href: HEATER.path, label: 'Size the heater' },
    sources: ['containur', 'eiaUnits', 'eiaElectricity'],
  },
  {
    title: 'Small doses',
    text: `At 3,800 gallons, raising free chlorine 1 ppm takes ${tenth(chlorinePerPpm(3800).gallons * 128)} fl oz of 12.5% liquid by the chlorine calculator. Size every dose by the maker’s gallons.`,
    link: { href: CHLORINE.path, label: 'Work out the chlorine dose' },
  },
  {
    title: 'Against a plunge pool built in place',
    text: 'Concrete and fiberglass prefab plunge pools, and the ones dug on site, are priced side by side.',
    link: { href: PLUNGE_PATH, label: 'What a plunge pool costs' },
  },
  {
    title: 'Every pool cost, side by side',
    text: 'Above-ground, inground and container pools, with the cost of keeping each, are on one table.',
    link: hubLink,
  },
];

/** How much a shipping container pool costs: This Old House, ContainUR and Container Pool USA. */
export const CONTAINER_COST = {
  path: CONTAINER_PATH,
  checked: CHECKED_2,
  kicker: 'Cost guide · container pool',
  card: {
    title: 'Container pool cost',
    summary: 'By size, what the price leaves out, the slab, the crane, and heating it.',
  },
  title: 'How Much Does a Shipping Container Pool Cost? | Pool Figures',
  description:
    'A shipping container pool costs $42,000 to $56,000 as a 20 ft steel pool: sizes, what the price leaves out, the slab, delivery, the crane and heating it.',
  h1: 'How much does a shipping container pool cost?',
  lead: 'A shipping container pool costs $42,000 for a 20 x 8 ft steel pool to $56,000 for 20 x 12 ft, This Old House says (June 2026), and $44,900 for a 20 x 8 ft one lined with fiberglass. ContainUR, a maker, lists its 8 x 20 ft fiberglass pool at $45,000 before freight, site preparation and permits, and Container Pool USA, a seller, puts a delivered and installed pool at $35,000 to $65,000. The crane and the slab under it are where the totals part.',
  note: NOTE,
  table: {
    caption: 'Shipping container pool prices by size',
    region: 'Container pool cost by size',
    head: ['Pool', 'Price', 'Source'],
    rows: [
      ['Steel, 20 x 8 ft, coated interior', 'from $42,000', 'This Old House, June 2026'],
      ['Steel, 20 x 12 ft, coated interior', '$56,000', 'This Old House, June 2026'],
      ['20 x 8 ft, fiberglass liner, 57 in deep', '$44,900', 'This Old House, June 2026'],
      ['8 x 20 ft, fiberglass shell, equipment and heater', '$45,000', 'ContainUR, undated'],
      ['8 x 12 ft, shell', '$26,000 to $41,000', 'Container Pool USA, November 2025'],
      ['8 x 20 ft, shell', '$28,000 to $50,000', 'Container Pool USA, November 2025'],
      ['8 x 40 ft, shell', '$45,000 to $80,000', 'Container Pool USA, November 2025'],
      ['12 x 40 ft, shell', '$50,000 to $85,000', 'Container Pool USA, November 2025'],
    ],
    sources: ['tohPrefab', 'containur', 'containerPoolUsa'],
  },
  moreTables: [
    {
      caption: 'What goes with the pool',
      region: 'Container pool extras',
      head: ['Cost', 'Price', 'Source'],
      rows: [
        ['Shipping', 'from around $3,000', 'This Old House, June 2026'],
        ['A crane over the house', '$10,000 or more', 'This Old House, June 2026'],
        ['Delivery and crane', '$1,000 to $3,000 and up', 'Container Pool USA, November 2025'],
        ['Concrete slab, 20 x 20 ft', '$2,400 to $4,800', 'Container Pool USA, November 2025'],
        ['Excavation, inground', '$500 to $3,000', 'Container Pool USA, November 2025'],
        ['Electrical hookup, labor', '$1,000 to $2,000', 'Container Pool USA, November 2025'],
        ['Automatic cover', 'about $10,000', 'This Old House, June 2026'],
      ],
      sources: ['tohPrefab', 'containerPoolUsa'],
    },
  ],
  sources: pick('tohPrefab', 'containur', 'containerPoolUsa', 'eiaUnits', 'eiaElectricity'),
  steps: CONTAINER_STEPS,
} as const satisfies CostGuide;

// --- How much does a pool heater cost ---

const HEATER_STEPS: readonly GuideStep[] = [
  {
    title: 'Buy it installed',
    text: 'River Pools prices a gas heater at $2,000 to $6,000 installed, a heat pump at $3,000 to $7,000 and up, and solar at $2,500 to $6,500 and up (February 2026). Fixr gives $2,500 to $5,000, $3,500 on average, of which $500 to $1,000 is the labor.',
    sources: ['riverHeaters', 'fixrHeater'],
  },
  {
    title: 'Size it by the water',
    text: `Warming water takes 8.34 Btu per gallon per °F, so a 16 x 32 ft pool of ${backyardGallons} gallons needs ${whole(backyardHeat.btu)} Btu for a 10 °F rise. A Hayward HeatPro rated at 110,000 Btu an hour puts that in in about ${tenth(hoursToHeat(backyardHeat.btu, 110_000))} hours, before the heat the pool loses.`,
    link: { href: HEATER.path, label: 'Size the heater for your pool' },
    sources: ['haywardHeatPro'],
  },
  {
    title: 'A heat pump',
    text: `Hayward rates its HeatPro at a COP of 5.7 in 80 °F air and 4.0 in 50 °F air: 5.7 units of heat for each unit of electricity. The 10 °F warm-up takes ${tenth(backyardHeat.warm.amount)} kWh in warm air, ${cents(backyardHeat.warm.dollars)} at EIA’s 18.16 cents, and ${tenth(backyardHeat.cool.amount)} kWh in cool air, ${cents(backyardHeat.cool.dollars)}. River Pools says heat pumps work best above 55 °F.`,
    sources: ['haywardHeatPro', 'eiaElectricity', 'eiaUnits', 'riverHeaters'],
  },
  {
    title: 'A gas heater',
    text: `Raypak lists 84% thermal efficiency for its AVIA heaters, so the same warm-up burns ${tenth(backyardHeat.gas.amount * 1000)} cubic feet of natural gas, ${cents(backyardHeat.gas.dollars)} at $27.05 per thousand cubic feet, or ${tenth(backyardHeat.propane.amount)} gallons of propane, ${cents(backyardHeat.propane.dollars)} at $2.82.`,
    sources: ['raypakAvia', 'eiaGas', 'eiaPropane', 'eiaUnits'],
  },
  {
    title: 'An electric resistance heater',
    text: `A resistance heater turns each kWh into 3,412 Btu and no more, so the warm-up draws ${whole(backyardHeat.resistance.amount)} kWh, ${cents(backyardHeat.resistance.dollars)}: about ${String(Math.round(backyardHeat.resistance.dollars / backyardHeat.warm.dollars))} times the heat pump in warm air.`,
    sources: ['eiaUnits', 'eiaElectricity'],
  },
  {
    title: 'Keeping it warm costs more than one warm-up',
    text: 'A pool loses heat every night and every windy day, and the heater makes it up. River Pools puts a heat pump’s running cost at $120 to $200 and up a month and gas at $200 to $850 and up, especially used daily or with propane; Fixr gives $50 to $150 for a heat pump and $200 to $500 for natural gas.',
    sources: ['riverHeaters', 'fixrHeater'],
  },
  {
    title: 'Solar',
    text: 'River Pools puts a solar heater’s running cost at about $80 to $200 a year, Fixr at $0 to $10 a month: the pump moves the water through the collectors, and the sun does the heating.',
    sources: ['riverHeaters', 'fixrHeater'],
  },
  {
    title: 'A cover keeps the heat you paid for',
    text: 'Evaporation carries heat off the surface, so a covered pool needs less heater time. The heater calculator counts only the water’s own heat; size larger for an open pool.',
    link: { href: MAINTENANCE_PATH, label: 'What a pool costs every month' },
  },
  {
    title: 'Every pool cost, side by side',
    text: 'The pool itself, the heater and the upkeep are on one table.',
    link: hubLink,
  },
];

/** How much a pool heater costs: to buy, by River Pools and Fixr, and to run, at EIA prices. */
export const HEATER_COST = {
  path: HEATER_COST_PATH,
  checked: CHECKED_2,
  kicker: 'Cost guide · pool heater',
  card: {
    title: 'Pool heater cost',
    summary: 'Gas, heat pump, electric and solar: to buy, and one warm-up at EIA prices.',
  },
  title: 'How Much Does a Pool Heater Cost? To Buy and Run | Pool Figures',
  description:
    'A pool heater costs $2,500 to $5,000 installed. Warming 22,023 gallons by 10 °F costs $17.15 with a heat pump and $57.09 with gas, at EIA’s prices.',
  h1: 'How much does a pool heater cost?',
  lead: `A pool heater costs $2,500 to $5,000 installed, $3,500 on average, Fixr says (January 2025); River Pools gives $2,000 to $6,000 for gas and $3,000 to $7,000 and up for a heat pump (February 2026). To run, warming a ${backyardGallons}-gallon pool by 10 °F takes ${whole(backyardHeat.btu)} Btu: ${cents(backyardHeat.warm.dollars)} of electricity in a heat pump, ${cents(backyardHeat.gas.dollars)} of natural gas and ${cents(backyardHeat.propane.dollars)} of propane, ${PRICE_LINE}.`,
  note: 'The purchase prices are the published ranges of each source on the day shown, not a quote. The running costs are our arithmetic on the heat the water takes, with nothing lost to the air: a pool open to wind and night air takes more, and your own energy price may differ from the national average.',
  table: {
    caption: 'What a pool heater costs to buy, installed',
    region: 'Pool heater cost by type',
    head: ['Heater', 'River Pools, February 2026', 'Fixr, January 2025'],
    rows: [
      ['Gas', '$2,000 to $6,000', '$1,500 to $5,500, natural gas or propane'],
      ['Heat pump', '$3,000 to $7,000 and up', '$2,500 to $6,500'],
      ['Solar', '$2,500 to $6,500 and up', '$2,500 to $7,000'],
      ['Electric resistance', '—', '$1,000 to $6,000'],
    ],
    sources: ['riverHeaters', 'fixrHeater'],
  },
  moreTables: [
    {
      caption: `One 10 °F warm-up of a 16 x 32 ft pool, ${backyardGallons} gallons, ${whole(backyardHeat.btu)} Btu by the heater calculator, priced at EIA’s average US residential prices (our arithmetic)`,
      region: 'Pool heater running cost, worked out',
      head: ['Heater', 'Energy', 'Cost'],
      rows: [
        [
          'Heat pump, COP 5.7, 80 °F air',
          `${tenth(backyardHeat.warm.amount)} kWh`,
          cents(backyardHeat.warm.dollars),
        ],
        [
          'Heat pump, COP 4.0, 50 °F air',
          `${tenth(backyardHeat.cool.amount)} kWh`,
          cents(backyardHeat.cool.dollars),
        ],
        [
          'Electric resistance',
          `${tenth(backyardHeat.resistance.amount)} kWh`,
          cents(backyardHeat.resistance.dollars),
        ],
        [
          'Natural gas, 84% efficient',
          `${tenth(backyardHeat.gas.amount * 1000)} cubic feet`,
          cents(backyardHeat.gas.dollars),
        ],
        [
          'Propane, 84% efficient',
          `${tenth(backyardHeat.propane.amount)} gallons`,
          cents(backyardHeat.propane.dollars),
        ],
      ],
      sources: [
        'haywardHeatPro',
        'raypakAvia',
        'eiaElectricity',
        'eiaGas',
        'eiaPropane',
        'eiaUnits',
      ],
    },
    {
      caption: 'What a pool heater costs a month to run, as published',
      region: 'Pool heater monthly running cost',
      head: ['Heater', 'River Pools, February 2026', 'Fixr, January 2025'],
      rows: [
        ['Heat pump', '$120 to $200 and up', '$50 to $150'],
        ['Natural gas', '$200 to $850 and up, gas', '$200 to $500'],
        ['Propane', '—', '$250 to $1,000'],
        ['Electric resistance', '—', '$175 to $600'],
        ['Solar', 'about $80 to $200 a year', '$0 to $10'],
      ],
      sources: ['riverHeaters', 'fixrHeater'],
    },
  ],
  sources: pick(
    'riverHeaters',
    'fixrHeater',
    'haywardHeatPro',
    'raypakAvia',
    'eiaElectricity',
    'eiaGas',
    'eiaPropane',
    'eiaUnits',
  ),
  steps: HEATER_STEPS,
} as const satisfies CostGuide;

// --- How much does pool maintenance cost ---

const WEEKS_PER_MONTH = 52 / 12;
const shockPounds = backyardCount / 10_000;
const shockWeek = shockPounds * PRICES.shock;
const chlorineMonth = (ppm: number): number => backyardChlorine.dollars * ppm * 30;

const MAINTENANCE_STEPS: readonly GuideStep[] = [
  {
    title: 'A service, or your own time',
    text: 'Bob Vila puts a pool service at $20 to $50 a visit weekly, $30 to $260 a month and $960 to $1,800 a year, or about $75 to $100 an hour. Cleaning runs $80 to $1,050, $270 on average.',
    sources: ['vilaMaintenance'],
  },
  {
    title: 'The chlorine is the steady bill',
    text: `Every ppm of free chlorine a ${backyardGallons}-gallon pool loses takes ${tenth(backyardChlorine.gallons * 128)} fl oz of 12.5% liquid to put back, by the chlorine calculator: ${cents(backyardChlorine.dollars)} at $35.99 for a 4-gallon case. HASA’s label gives 10 fl oz per ppm for 10,000 gallons, the same rate. Test at the same hour two days running to learn how many ppm a day yours loses.`,
    link: { href: CHLORINE.path, label: 'Work out the chlorine dose' },
    sources: ['simplifiedChlorine', 'hasaChlor'],
  },
  {
    title: 'Or tablets',
    text: `Doheny’s label puts one 3-inch trichlor tablet in per 10,000 gallons every week to hold 1 to 3 ppm: ${tenth(backyardCount / 10_000)} tablets a week for ${backyardGallons} gallons. Tablets carry stabilizer, so the level climbs as they dissolve.`,
    link: { href: CHEMISTRY_CHART.path, label: 'See the stabilizer range' },
    sources: ['dohenyTabs'],
  },
  {
    title: 'Shock once a week',
    text: `Doheny’s shock label gives one 1 lb bag per 10,000 gallons every 7 days, or as needed: ${tenth(shockPounds)} lb a week for ${backyardGallons} gallons, ${cents(shockWeek)} at $99.99 for 24 bags, about ${cents(shockWeek * WEEKS_PER_MONTH)} a month.`,
    link: { href: '/how-often-to-shock-a-pool', label: 'How often to shock' },
    sources: ['dohenyShock'],
  },
  {
    title: 'Salt, once and then a little',
    text: `A salt pool starts at 3,200 ppm: ${whole(backyardSalt.pounds)} lb for ${backyardGallons} gallons by the salt calculator, ${String(backyardSalt.bags)} bags of 40 lb, ${cents(backyardSalt.bags * PRICES.saltBag)} at $10.99 a bag. After that, salt leaves only with the water that splashes or drains out.`,
    link: { href: SALT.path, label: 'Work out the salt' },
    sources: ['simplifiedSalt'],
  },
  {
    title: 'The pump’s electricity',
    text: 'A conventional pool pump can cost as much as $310 a year in energy, ENERGY STAR says, and running the filter 6 hours a day instead of 24 cuts its energy use by 75%. River Pools’ 2019 figures were $30 to $50 a month with a variable-speed pump against $75 to $150 with a single-speed one on a vinyl or fiberglass pool.',
    link: { href: PUMP_GUIDE_PATH, label: 'How long to run the pump' },
    sources: ['energyStarPumps', 'riverMaintenance'],
  },
  {
    title: 'Opening and closing',
    text: 'Opening the pool in spring costs $375 to $500 and winterizing it $350 to $650 with a service, Bob Vila says.',
    link: { href: OPENING_PATH, label: 'Open it yourself, step by step' },
    sources: ['vilaMaintenance'],
  },
  {
    title: 'The material changes the bill',
    text: 'River Pools’ 2019 estimate of a year’s chemicals was about $175 for fiberglass, $400 for vinyl and $750 for concrete. A vinyl pool also needs a new liner every 5 to 9 years, and a concrete one new plaster every ten to twenty.',
    link: { href: LINER_PATH, label: 'What a new liner costs' },
    sources: ['riverMaintenance', 'riverLiner', 'tohResurfacing'],
  },
  {
    title: 'Heat is extra',
    text: 'A heater can cost more a month than everything above together.',
    link: { href: HEATER_COST_PATH, label: 'What a heater costs to run' },
  },
  {
    title: 'Every pool cost, side by side',
    text: 'What a pool costs to build, and the bills after, are on one table.',
    link: hubLink,
  },
];

/** How much pool maintenance costs: the published bills, then the chemicals worked out. */
export const MAINTENANCE_COST = {
  path: MAINTENANCE_PATH,
  checked: CHECKED_2,
  kicker: 'Cost guide · upkeep',
  card: {
    title: 'Pool maintenance cost',
    summary: 'A service, the chlorine, the shock, the salt and the pump, by the month.',
  },
  title: 'How Much Does Pool Maintenance Cost? Per Month | Pool Figures',
  description:
    'Pool maintenance costs $90 to $270 a month: the service, opening and closing, and the chlorine, shock and salt of a 22,023 gallon pool worked out and priced.',
  h1: 'How much does pool maintenance cost?',
  lead: `Pools tend to cost $90 to $270 a month to maintain, This Old House says (June 2025), and Bob Vila puts a monthly pool service at $30 to $260 (May 2024). For the chemicals you buy yourself, a ${backyardGallons}-gallon pool takes ${cents(backyardChlorine.dollars)} of 12.5% liquid chlorine for every ppm it loses, ${cents(chlorineMonth(1))} over 30 days at 1 ppm a day, and a weekly 1 lb per 10,000 gallons of shock comes to about ${cents(shockWeek * WEEKS_PER_MONTH)} a month.`,
  note: 'The ranges are the published figures of each source on the day shown, not a quote. The chemical costs are our arithmetic on the calculators of this site and the product prices as listed on the day we read them; a sale price ends, and your store’s price may differ.',
  table: {
    caption: 'What keeping a pool costs, as published',
    region: 'Pool maintenance cost',
    head: ['Cost', 'Price', 'Source'],
    rows: [
      ['Upkeep', '$90 to $270 per month', 'This Old House, June 2025'],
      ['Pool service, weekly visit', '$20 to $50', 'Bob Vila, May 2024'],
      ['Pool service, monthly', '$30 to $260', 'Bob Vila, May 2024'],
      ['Pool service, yearly', '$960 to $1,800', 'Bob Vila, May 2024'],
      ['Opening in spring', '$375 to $500', 'Bob Vila, May 2024'],
      ['Winterizing', '$350 to $650', 'Bob Vila, May 2024'],
      ['Pump energy, conventional pump', 'up to $310 a year', 'ENERGY STAR'],
      [
        'Chemicals a year',
        'about $175 fiberglass, $400 vinyl, $750 concrete',
        'River Pools, July 2019',
      ],
    ],
    sources: ['tohInground', 'vilaMaintenance', 'energyStarPumps', 'riverMaintenance'],
  },
  moreTables: [
    {
      caption: `The chemicals of a 16 x 32 ft pool, ${backyardGallons} gallons, worked out by the calculators and priced as listed (our arithmetic)`,
      region: 'Pool chemical cost, worked out',
      head: ['Chemical', 'Amount', 'Cost'],
      rows: [
        [
          'Liquid chlorine 12.5%, 1 ppm',
          `${tenth(backyardChlorine.gallons * 128)} fl oz`,
          cents(backyardChlorine.dollars),
        ],
        ...[1, 2, 3].map((ppm) => [
          `Liquid chlorine, ${String(ppm)} ppm a day for 30 days`,
          `${tenth(backyardChlorine.gallons * ppm * 30)} gallons`,
          cents(chlorineMonth(ppm)),
        ]),
        ['Shock, 1 lb per 10,000 gallons, one week', `${tenth(shockPounds)} lb`, cents(shockWeek)],
        [
          'Shock, weekly, one month',
          `${tenth(shockPounds * WEEKS_PER_MONTH)} lb`,
          cents(shockWeek * WEEKS_PER_MONTH),
        ],
        [
          'Salt to 3,200 ppm, new water',
          `${String(backyardSalt.bags)} bags of 40 lb`,
          cents(backyardSalt.bags * PRICES.saltBag),
        ],
      ],
      sources: ['simplifiedChlorine', 'dohenyShock', 'simplifiedSalt'],
    },
  ],
  sources: pick(
    'tohInground',
    'vilaMaintenance',
    'simplifiedChlorine',
    'hasaChlor',
    'dohenyTabs',
    'dohenyShock',
    'simplifiedSalt',
    'energyStarPumps',
    'riverMaintenance',
    'riverLiner',
    'tohResurfacing',
  ),
  steps: MAINTENANCE_STEPS,
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
    title: 'Line by line',
    text: 'Bob Vila’s guide prices each job of a build: excavation about $3,400 on average, labor $5,000 to $30,000, a permit $200 to $2,000 and an inspection $125 to $250.',
    link: { href: BUILD_PATH, label: 'Cost to build a pool, line by line' },
    sources: ['vilaBuild'],
  },
  {
    title: 'The standard size',
    text: `A 12 x 24 ft inground pool, 3 ft 6 in to 6 ft deep, holds ${twelveGallons} gallons by the volume calculator and costs $38,000 to $100,000 installed by This Old House.`,
    link: { href: TWELVE_PATH, label: '12 x 24 pool cost' },
    sources: ['tohInground'],
  },
  {
    title: 'Above ground',
    text: 'Fixr’s 2022 guide puts an above-ground pool at $3,000 to $7,500 installed, $5,000 on average.',
    link: { href: ABOVE_GROUND_PATH, label: 'Above-ground pool cost' },
    sources: ['fixrAboveGround'],
  },
  {
    title: 'A pool built in a container',
    text: 'This Old House lists steel container pools from $42,000 for 20 x 8 ft to $56,000 for 20 x 12 ft, before the crane.',
    link: { href: CONTAINER_PATH, label: 'Shipping container pool cost' },
    sources: ['tohPrefab'],
  },
  {
    title: 'What the heat costs',
    text: `Warming ${backyardGallons} gallons by 10 °F costs ${cents(backyardHeat.warm.dollars)} of electricity in a heat pump and ${cents(backyardHeat.gas.dollars)} of natural gas at EIA’s August 2026 average prices, before the heat lost to the air.`,
    link: { href: HEATER_COST_PATH, label: 'Pool heater cost' },
    sources: ['eiaElectricity', 'eiaGas'],
  },
  {
    title: 'The chemicals, priced',
    text: `Each ppm of free chlorine that pool loses takes ${cents(backyardChlorine.dollars)} of 12.5% liquid chlorine to put back at $35.99 a 4-gallon case.`,
    link: { href: MAINTENANCE_PATH, label: 'Pool maintenance cost' },
    sources: ['simplifiedChlorine'],
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
  checked: CHECKED_2,
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
    'fixrAboveGround',
    'tohPrefab',
    'eiaElectricity',
    'eiaGas',
    'simplifiedChlorine',
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
  BUILD_COST,
  TWELVE_BY_24_COST,
  ABOVE_GROUND_COST,
  CONTAINER_COST,
  HEATER_COST,
  MAINTENANCE_COST,
];
