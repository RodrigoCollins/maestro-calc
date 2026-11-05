import {
  encode,
  Rational,
  type Calculator,
  type InputDescriptor,
  type OutputDescriptor,
} from '@maestro-calc/core';
import { canonicalUrl } from '@maestro-calc/site-kit/canonical';
import { poolAlkalinity } from '@maestro-calc/pool-core/pool-alkalinity';
import { poolCalcium } from '@maestro-calc/pool-core/pool-calcium';
import { poolChlorine } from '@maestro-calc/pool-core/pool-chlorine';
import { poolPh } from '@maestro-calc/pool-core/pool-ph';
import { poolSalt } from '@maestro-calc/pool-core/pool-salt';
import { poolStabilizer } from '@maestro-calc/pool-core/pool-stabilizer';
import { CHEMISTRY_CHART } from './chemistry.ts';
import { ALKALINITY, CALCIUM, CHLORINE, PH, SALT, STABILIZER } from './doses.ts';
import { amountText, outputText } from './format.ts';
import type { GuideSource } from './guide.ts';
import { SITE } from './site.config.ts';
import { VOLUME_TEXTS } from './volume/texts.ts';

type Raw = Readonly<Record<string, string>>;

/** One column of the chart: a dose the calculator at `calculator` works out for every pool size. */
export interface DoseColumn {
  readonly id: string;
  readonly head: string;
  readonly unit: string;
  readonly calculator: string;
  /** The output of the calculator the cells print. */
  readonly key: string;
  /** The inputs the calculator runs on, for a pool of `gallons`. */
  readonly raw: (gallons: number) => Raw;
  /** The strength and the reading the dose takes for granted. */
  readonly assumption: string;
  readonly sources: readonly string[];
  /** The calculator, opened on the 10,000 gallon row. */
  readonly link: { readonly href: string; readonly label: string };
  /** The methodology section that shows the formula and its hand-worked cases. */
  readonly method: string;
}

export interface DoseRow {
  readonly gallons: number;
  readonly size: string;
  readonly cells: readonly string[];
}

export interface DoseTable {
  readonly id: string;
  readonly caption: string;
  readonly columns: readonly DoseColumn[];
  readonly rows: readonly DoseRow[];
}

/** The sources as the chart, the shock, pH and calcium guides already cite them (`dosing.test.ts`). */
const SOURCES = {
  hayward: CHEMISTRY_CHART.sources.hayward,
  cdc: CHEMISTRY_CHART.sources.cdc,
  mahc: CHEMISTRY_CHART.sources.mahc,
  calHypo: {
    name: 'Clor Mor Calcium Hypochlorite Granules label, EPA Reg. No. 69681-6 (accepted September 18, 2014)',
    url: 'https://www3.epa.gov/pesticides/chem_search/ppls/069681-00006-20140918.pdf',
  },
  taylor: {
    name: 'Taylor Technologies, K-1003 test kit instructions (Instr. #5816): pH, acid demand and base demand tests, and the pH dosage charts',
    url: 'https://www.novatech-usa.com/pdf/Taylor%20K-1003%20Instruction%20Manual.pdf',
  },
  hasa: {
    name: 'HASA Muriatic Acid (31.45% hydrochloric acid), product page: directions for use',
    url: 'https://hasa.com/hubfs/Product%20Assets/Muriatic%20Acid/Muriatic%20Acid%20-%20Product%20Page.pdf',
  },
  clearView: {
    name: 'ClearView Calcium Increaser, Critical Usage Information (Oreq Corporation): directions',
    url: 'https://cdn.shopify.com/s/files/1/0100/9998/2432/files/Calcium_Increaser.pdf',
  },
} as const satisfies Record<string, GuideSource>;

/** The pool sizes of every table: each 5,000 gallons from 5,000 to 40,000. */
const GALLONS = [5000, 10_000, 15_000, 20_000, 25_000, 30_000, 35_000, 40_000] as const;

/** The row the lead quotes and each calculator link opens on. */
const MAIN = 10_000;

/** What the chart asks of a calculator: a dose as its page prints it, and the page opened on it. */
interface Runner {
  readonly dose: (raw: Raw, key: string) => string;
  readonly href: (raw: Raw) => string;
}

/** The runner of `engine`, the calculator at `path`; a run that fails is a build error. */
const runnerOf = <const I extends readonly InputDescriptor[]>(
  engine: Calculator<string, I, readonly OutputDescriptor[], readonly string[]>,
  path: string,
): Runner => ({
  dose: (raw, key) => {
    const ran = engine.run(raw);
    if (!ran.ok) throw new Error(`${engine.id} did not run on ${JSON.stringify(raw)}`);
    return outputText(key, ran.value.outputs.find((output) => output.key === key)?.value);
  },
  href: (raw) => {
    const validated = engine.validate(raw);
    if (!validated.ok) throw new Error(`${engine.id} rejects ${JSON.stringify(raw)}`);
    return `${path}?${encode(engine, validated.value)}`;
  },
});

/** The calculator of each column, by its page. */
const RUNNERS: ReadonlyMap<string, Runner> = new Map([
  [SALT.path, runnerOf(poolSalt, SALT.path)],
  [CHLORINE.path, runnerOf(poolChlorine, CHLORINE.path)],
  [PH.path, runnerOf(poolPh, PH.path)],
  [ALKALINITY.path, runnerOf(poolAlkalinity, ALKALINITY.path)],
  [STABILIZER.path, runnerOf(poolStabilizer, STABILIZER.path)],
  [CALCIUM.path, runnerOf(poolCalcium, CALCIUM.path)],
]);

/** The runner of the calculator page at `path`; a column of another page is a build error. */
const runner = (path: string): Runner => {
  const found = RUNNERS.get(path);
  if (found === undefined) throw new Error(`no calculator for ${path}`);
  return found;
};

type ColumnSpec = Omit<DoseColumn, 'link'> & { readonly label: string };

const columnOf = ({ label, ...spec }: ColumnSpec): DoseColumn => ({
  ...spec,
  link: { href: runner(spec.calculator).href(spec.raw(MAIN)), label },
});

const of = (gallons: number): string => String(gallons);

const SANITIZER: readonly ColumnSpec[] = [
  {
    id: 'liquid',
    head: 'Liquid chlorine, +1 ppm',
    unit: 'fl oz',
    calculator: CHLORINE.path,
    key: 'liquid',
    raw: (gallons) => ({ gallons: of(gallons), current: '0', target: '1', product: 'liquid-12-5' }),
    assumption:
      'Liquid chlorine (sodium hypochlorite) of 12.5% available chlorine, raising free chlorine by 1 ppm. 1 ppm is 1 mg per liter: 10.24 fl oz per 10,000 gallons. CDC keeps a home pool at 1 ppm or more, 2 ppm or more with stabilizer.',
    sources: ['cdc'],
    label: 'Work out the chlorine from your reading',
    method: '/methodology#chlorine',
  },
  {
    id: 'calHypo',
    head: 'Cal-hypo shock, 0 to 10 ppm',
    unit: 'oz',
    calculator: CHLORINE.path,
    key: 'dry',
    raw: (gallons) => ({
      gallons: of(gallons),
      current: '0',
      target: '10',
      product: 'cal-hypo-65',
    }),
    assumption:
      'Calcium hypochlorite granules of 65% available chlorine, by weight, from 0 ppm to 10 ppm: the top of the 5 to 10 ppm the label shocks to with 10 to 20 oz per 10,000 gallons. Swim again only at 4 ppm or less, the label’s reentry level.',
    sources: ['calHypo'],
    label: 'Work out the shock from your reading',
    method: '/methodology#chlorine',
  },
  {
    id: 'salt',
    head: 'Salt, 0 to 3,200 ppm',
    unit: 'lb',
    calculator: SALT.path,
    key: 'pounds',
    raw: (gallons) => ({ gallons: of(gallons), current: '0', target: '3200' }),
    assumption:
      'Pool salt over 99% sodium chloride, from fresh water (0 ppm) to 3,200 ppm, the level Hayward’s AquaRite manual calls the best. A gallon of water weighs about 8.34 lb. Follow the level your own cell asks for.',
    sources: ['hayward'],
    label: 'Work out the salt from your reading',
    method: '/methodology#salt',
  },
];

const BALANCE: readonly ColumnSpec[] = [
  {
    id: 'bakingSoda',
    head: 'Baking soda, +10 ppm alkalinity',
    unit: 'lb',
    calculator: ALKALINITY.path,
    key: 'pounds',
    raw: (gallons) => ({ gallons: of(gallons), current: '80', target: '90' }),
    assumption:
      'Pure sodium bicarbonate (baking soda), raising total alkalinity by 10 ppm. Alkalinity is read as calcium carbonate, so 1 ppm takes 1.6788 mg of baking soda per liter. Hayward’s manual keeps a home pool at 80 to 120 ppm; the CDC’s code keeps a public pool at 60 to 180.',
    sources: ['hayward', 'mahc'],
    label: 'Work out the baking soda from your reading',
    method: '/methodology#alkalinity',
  },
  {
    id: 'stabilizer',
    head: 'Stabilizer, +10 ppm CYA',
    unit: 'oz',
    calculator: STABILIZER.path,
    key: 'ounces',
    raw: (gallons) => ({ gallons: of(gallons), current: '20', target: '30' }),
    assumption:
      'A product of 100% cyanuric acid, raising CYA by 10 ppm: 1 ppm is 1 mg per liter. For a liquid or blended stabilizer, divide by its percent and multiply by 100. Hayward’s manual keeps an outdoor pool at 30 to 50 ppm; the CDC’s code caps a public pool at 90.',
    sources: ['hayward', 'mahc'],
    label: 'Work out the stabilizer from your reading',
    method: '/methodology#stabilizer',
  },
  {
    id: 'calcium',
    head: 'Calcium chloride, +10 ppm hardness',
    unit: 'lb',
    calculator: CALCIUM.path,
    key: 'pounds',
    raw: (gallons) => ({ gallons: of(gallons), current: '200', target: '210' }),
    assumption:
      'Calcium chloride flake at the dose of the ClearView label: 2 oz per 1,000 gallons raises calcium hardness 10 ppm. Over 3 lb per 10,000 gallons, the label splits the dose into additions at least 12 hours apart.',
    sources: ['clearView'],
    label: 'Work out the calcium chloride from your reading',
    method: '/methodology#calcium',
  },
];

const ACID: readonly ColumnSpec[] = [
  {
    id: 'acid',
    head: 'Muriatic acid, per drop of acid demand',
    unit: 'fl oz',
    calculator: PH.path,
    key: 'liquid',
    raw: (gallons) => ({ gallons: of(gallons), product: 'muriatic-31-45', drops: '1' }),
    assumption:
      'Muriatic acid of 31.45% (20° Baumé), from Taylor’s pH dosage chart: 9.16 fl oz for each drop of acid demand reagent the test of a Taylor kit takes, per 10,000 gallons. The test runs on your own water, so its alkalinity is already in the count.',
    sources: ['taylor'],
    label: 'Work out the acid from your drops',
    method: '/methodology#ph',
  },
  {
    id: 'acidPerDay',
    head: 'Muriatic acid, most in 24 hours',
    unit: 'fl oz',
    calculator: PH.path,
    key: 'liquidPerDay',
    raw: (gallons) => ({ gallons: of(gallons), product: 'muriatic-31-45', drops: '1' }),
    assumption:
      'HASA’s muriatic acid label adds at most one quart per 20,000 gallons in 24 hours, repeated 24 hours apart: a larger dose goes in over several days, with a pH test before each part.',
    sources: ['hasa'],
    label: 'Work out the days a dose takes',
    method: '/methodology#ph',
  },
];

const tableOf = (id: string, caption: string, columns: readonly ColumnSpec[]): DoseTable => ({
  id,
  caption,
  columns: columns.map(columnOf),
  rows: GALLONS.map((gallons) => ({
    gallons,
    size: amountText(Rational.of(gallons)),
    cells: columns.map(({ calculator, raw, key }) => runner(calculator).dose(raw(gallons), key)),
  })),
});

const TABLES: readonly DoseTable[] = [
  tableOf('sanitizer', 'Chlorine, shock and salt', SANITIZER),
  tableOf('balance', 'Alkalinity, stabilizer and calcium', BALANCE),
  tableOf('ph', 'Lowering pH', ACID),
];

const at = (id: string): string => {
  for (const { columns, rows } of TABLES) {
    const index = columns.findIndex((column) => column.id === id);
    const found = rows.find(({ gallons }) => gallons === MAIN)?.cells[index];
    if (index >= 0 && found !== undefined) return found;
  }
  throw new Error(`no ${id} dose at ${String(MAIN)} gallons`);
};

const H1 = 'Pool chemical dosing chart by pool size';
const PATH = '/pool-chemical-dosing-chart';

/**
 * The dose of every common pool chemical for pools of 5,000 to 40,000 gallons, in one chart: each
 * cell is the site's own calculator run at build time, each column names the strength it assumes
 * and the source of its figure. No number here is typed by hand.
 */
export const DOSING_CHART = {
  path: PATH,
  card: {
    title: 'Chemical dosing chart',
    summary:
      'Chlorine, shock, salt, baking soda, stabilizer, calcium and acid, 5,000 to 40,000 gallons.',
  },
  title: 'Pool Chemical Dosing Chart by Pool Size | Pool Figures',
  description:
    'How much chlorine, shock, salt, baking soda, stabilizer, calcium chloride and muriatic acid a pool of 5,000 to 40,000 gallons takes, each from its source.',
  h1: H1,
  lead: `A 10,000 gallon pool takes ${at('liquid')} fl oz of 12.5% liquid chlorine to raise free chlorine 1 ppm, ${at('bakingSoda')} lb of baking soda to raise alkalinity 10 ppm, ${at('acid')} fl oz of muriatic acid for each drop of the acid demand test, and ${at('salt')} lb of salt to reach 3,200 ppm from fresh water. Every dose scales in a straight line: twice the gallons or twice the rise takes twice as much.`,
  gallons: { text: 'Not sure of your gallons?', href: VOLUME_TEXTS.path, label: 'Work them out' },
  ranges: {
    text: 'The level to aim for is in the',
    href: CHEMISTRY_CHART.path,
    label: 'water chemistry chart',
  },
  tables: TABLES,
  sources: SOURCES,
  cite: {
    url: canonicalUrl(PATH, SITE.origin),
    text: `Pool Figures, “${H1}”, updated November 2026.`,
  },
} as const;
