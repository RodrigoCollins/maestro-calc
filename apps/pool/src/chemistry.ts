import { ALKALINITY, CALCIUM, CHLORINE, PH, SALT, STABILIZER } from './doses.ts';
import type { GuideSource } from './guide.ts';
import { VOLUME_TEXTS } from './volume/texts.ts';

/** A dose the chart works out, as the calculator of its row does (`chemistry.test.ts` runs it). */
export interface ChartExample {
  readonly text: string;
  readonly raw: Readonly<Record<string, string>>;
  readonly key: string;
  readonly result: string;
  readonly unit: string;
}

/** One line of the chart: the home-pool range, the public-pool limit, and what to do about it. */
export interface ChartRow {
  readonly id: string;
  readonly name: string;
  /** The range of Hayward's AquaRite manual, the levels APSP recommends for a home pool. */
  readonly home: string;
  /** The limit of the CDC's Model Aquatic Health Code for a public pool. */
  readonly publicPool: string;
  readonly text: string;
  readonly sources: readonly string[];
  readonly link?: { readonly href: string; readonly label: string };
  readonly example?: ChartExample;
}

const SOURCES = {
  hayward: {
    name: 'Hayward AquaRite owner’s manual, 092538 Rev D: Water Chemistry (the levels APSP recommends)',
    url: 'https://hayward.com/media/akeneo_connector/asset_files/0/9/092538_RevD_b778.pdf',
  },
  mahc: {
    name: 'CDC, 2024 Model Aquatic Health Code, 5th Edition: 5.7.3 and 5.7.4',
    url: 'https://www.cdc.gov/model-aquatic-health-code/media/pdfs/2024/11/5th-Ed-MAHC-Code-508.pdf',
  },
  cdc: {
    name: 'CDC: Home Pool and Hot Tub Water Treatment and Testing',
    url: 'https://www.cdc.gov/healthy-swimming/about/home-pool-and-hot-tub-water-treatment-and-testing.html',
  },
} as const satisfies Record<string, GuideSource>;

/** The rows, in the order a pool is usually balanced: sanitizer and pH, then the slower levels. */
const ROWS: readonly ChartRow[] = [
  {
    id: 'chlorine',
    name: 'Free chlorine',
    home: '1.0 to 3.0 ppm',
    publicPool: 'at least 1.0 ppm, 2.0 ppm with CYA',
    text: 'CDC sets the floor for a home pool: free chlorine at least 1 ppm, and at least 2 ppm if you use cyanuric acid or a stabilized chlorine such as dichlor or trichlor. The code sets no ceiling of its own: the most is what the label of your product allows.',
    sources: ['hayward', 'cdc', 'mahc'],
    link: { href: CHLORINE.path, label: 'Work out the chlorine' },
    example: {
      text: '20,000 gallons from 1 to 3 ppm with 12.5% liquid chlorine take',
      raw: { gallons: '20000', current: '1', target: '3', product: 'liquid-12-5' },
      key: 'liquid',
      result: '41.0',
      unit: 'fl oz',
    },
  },
  {
    id: 'ph',
    name: 'pH',
    home: '7.2 to 7.8',
    publicPool: '7.0 to 7.8',
    text: 'CDC gives pH 7.0 to 7.8 for a home pool too; the manual keeps it at 7.2 or more. Held in range with the alkalinity and the calcium, the water neither corrodes the pool nor leaves scale.',
    link: { href: PH.path, label: 'Work out the acid or the soda ash' },
    sources: ['hayward', 'cdc', 'mahc'],
  },
  {
    id: 'alkalinity',
    name: 'Total alkalinity',
    home: '80 to 120 ppm',
    publicPool: '60 to 180 ppm',
    text: 'Alkalinity holds the pH steady. Baking soda raises it; lowering it takes acid.',
    sources: ['hayward', 'mahc'],
    link: { href: ALKALINITY.path, label: 'Work out the baking soda' },
    example: {
      text: '10,000 gallons from 80 to 90 ppm take',
      raw: { gallons: '10000', current: '80', target: '90' },
      key: 'pounds',
      result: '1.4',
      unit: 'lb of baking soda',
    },
  },
  {
    id: 'stabilizer',
    name: 'Cyanuric acid (stabilizer)',
    home: '30 to 50 ppm outdoors, none indoors',
    publicPool: '90 ppm at most',
    text: 'Stabilizer keeps sunlight from burning the chlorine off, so an indoor pool needs none. Dichlor and trichlor add it every time you use them, and it does not wear off: only draining lowers it. A public pool reading 300 ppm or more stays closed until it is fixed.',
    sources: ['hayward', 'mahc'],
    link: { href: STABILIZER.path, label: 'Work out the stabilizer' },
    example: {
      text: '10,000 gallons from 20 to 30 ppm take',
      raw: { gallons: '10000', current: '20', target: '30' },
      key: 'ounces',
      result: '13.4',
      unit: 'oz of cyanuric acid',
    },
  },
  {
    id: 'calcium',
    name: 'Calcium hardness',
    home: '200 to 400 ppm',
    publicPool: '2,500 ppm at most',
    text: 'The code only caps calcium. Too little and the water dissolves plaster; too much and it leaves scale and stains. Calcium chloride raises it; only draining part of the water and refilling lowers it.',
    sources: ['hayward', 'mahc'],
    link: { href: CALCIUM.path, label: 'Work out the calcium chloride' },
    example: {
      text: '20,000 gallons from 180 to 200 ppm take',
      raw: { gallons: '20000', current: '180', target: '200' },
      key: 'pounds',
      result: '5.0',
      unit: 'lb of calcium chloride',
    },
  },
  {
    id: 'salt',
    name: 'Salt, for a salt chlorine generator',
    home: '2,700 to 3,400 ppm, 3,200 best',
    publicPool: 'the range the cell maker gives',
    text: 'The code defers to the maker of the generator, as you should: read the level your own cell asks for. Salt does not evaporate; rain, splashing and backwashing dilute it.',
    sources: ['hayward', 'mahc'],
    link: { href: SALT.path, label: 'Work out the salt' },
    example: {
      text: '20,000 gallons from 2,400 to 3,200 ppm take',
      raw: { gallons: '20000', current: '2400', target: '3200' },
      key: 'pounds',
      result: '133.4',
      unit: 'lb of salt',
    },
  },
];

/** The home-pool range of the row `id`, as the chart prints it. */
const homeOf = (id: string): string => {
  const found = ROWS.find((row) => row.id === id);
  if (found === undefined) throw new Error(`no chart row ${id}`);
  return found.home;
};

/**
 * The target ranges of pool water in one chart: the home-pool levels of Hayward's AquaRite manual
 * (the levels APSP recommends), CDC's home-pool minimums where they differ, and the public-pool
 * limits of the 2024 Model Aquatic Health Code. No figure here that a source does not give.
 */
export const CHEMISTRY_CHART = {
  path: '/pool-water-chemistry-chart',
  card: {
    title: 'Water chemistry chart',
    summary: 'The range of every level, for a home pool and a public one.',
  },
  title: 'Pool Water Chemistry Chart: Target Ranges | Pool Figures',
  description:
    'Free chlorine, pH, alkalinity, stabilizer, calcium and salt: the target range for a home pool and the public-pool limit, each from its source.',
  h1: 'Pool water chemistry chart',
  lead: `Keep a home pool at ${homeOf('chlorine')} free chlorine, pH ${homeOf('ph')} and ${homeOf('alkalinity')} total alkalinity, the levels of the manufacturer’s manual. Each level is below with the limit the CDC’s code sets for a public pool, and each dose links to the calculator that sizes it.`,
  gallons: {
    text: 'Every dose depends on how much water the pool holds.',
    href: VOLUME_TEXTS.path,
    label: 'Work out your gallons',
  },
  sources: SOURCES,
  rows: ROWS,
} as const satisfies {
  path: string;
  card: { title: string; summary: string };
  title: string;
  description: string;
  h1: string;
  lead: string;
  gallons: { text: string; href: string; label: string };
  sources: Record<string, GuideSource>;
  rows: readonly ChartRow[];
};
