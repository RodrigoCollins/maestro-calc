import {
  encode,
  gal,
  isQuantityOf,
  lb,
  liter,
  quantity,
  Rational,
  type Calculator,
  type InputDescriptor,
  type OutputDescriptor,
  valueIn,
} from '@maestro-calc/core';
import { poolAlkalinity } from '@maestro-calc/pool-core/pool-alkalinity';
import { poolCalcium } from '@maestro-calc/pool-core/pool-calcium';
import { poolChlorine } from '@maestro-calc/pool-core/pool-chlorine';
import { poolFillTime } from '@maestro-calc/pool-core/pool-fill-time';
import { poolHeater } from '@maestro-calc/pool-core/pool-heater';
import { poolPh } from '@maestro-calc/pool-core/pool-ph';
import { poolSalt } from '@maestro-calc/pool-core/pool-salt';
import { poolStabilizer } from '@maestro-calc/pool-core/pool-stabilizer';
import { poolVolume } from '@maestro-calc/pool-core/pool-volume';
import { ALKALINITY, CALCIUM, CHLORINE, FILL_TIME, HEATER, PH, SALT, STABILIZER } from './doses.ts';
import { amountText, outputText, volumeText } from './format.ts';
import { GALLONS_GUIDE } from './gallons.ts';
import { CALCIUM_GUIDE, PH_GUIDE, SHOCK_GUIDE } from './guide.ts';
import { VOLUME_TEXTS } from './volume/texts.ts';

type Raw = Readonly<Record<string, string>>;

/** One row of a job's table: the inputs the engine ran on, and the cells it gave. */
export interface JobRow {
  readonly raw: Raw;
  readonly cells: readonly string[];
}

/** A page for one common job ("how much salt for a 15,000 gallon pool"), worked out at build time. */
/** The calculator, or for a shock the label level, a job page works out. */
export type JobKind =
  | 'volume'
  | 'salt'
  | 'chlorine'
  | 'shock'
  | 'alkalinity'
  | 'stabilizer'
  | 'heater'
  | 'fill'
  | 'ph'
  | 'calcium';

export interface JobPage {
  readonly path: string;
  readonly kind: JobKind;
  /** The index of the row of the large figure, the one the page works out step by step. */
  readonly main: number;
  /** The day its figures and sources were last checked (`YYYY-MM-DD`), its calculator's `CHECKED`. */
  readonly checked: string;
  readonly title: string;
  readonly description: string;
  readonly h1: string;
  readonly lead: string;
  /** The large figure: one cell of the table, the row the calculator link opens on. */
  readonly figure: { readonly value: string; readonly unit: string; readonly caption: string };
  readonly head: readonly string[];
  readonly rows: readonly JobRow[];
  readonly calculator: { readonly path: string; readonly href: string; readonly label: string };
  /** The guide whose dose the page works out, linked from the page and linking it back. */
  readonly guide?: { readonly href: string; readonly label: string };
  readonly method: string;
  readonly card: { readonly title: string; readonly summary: string };
  /** The gallons the page is about (the large figure of a volume page): the order of its neighbors. */
  readonly gallons: number;
}

/**
 * The day the job pages of each calculator were last checked (`YYYY-MM-DD`): the last change to
 * the code and the sizes that work them out in this module. Every page of a calculator shares it.
 */
const CHECKED = {
  volume: '2026-11-08',
  salt: '2026-11-10',
  chlorine: '2026-11-10',
  alkalinity: '2026-11-10',
  stabilizer: '2026-11-10',
  heater: '2026-11-10',
  fill: '2026-11-08',
  ph: '2026-11-10',
  calcium: '2026-11-10',
  shock: '2026-11-10',
} as const;

/** The salt jobs: the pool sizes people search for, from a fresh fill and from common readings. */
const SALT_GALLONS = [5000, 10_000, 15_000, 20_000, 25_000, 30_000, 35_000] as const;
const READINGS = [0, 1000, 2000, 2400, 2800] as const;
const TARGET = 3200;
/** The salt Pentair's IntelliChlor guide recommends (P/N 520589 Rev. R): the lead's second answer. */
const PENTAIR_TARGET = 3600;

/**
 * The chlorine jobs: the same pool sizes, with 12.5% liquid chlorine (the jug pool stores sell)
 * raising free chlorine from a low 1 ppm by 1, 2 or 3 ppm; the 1 to 3 ppm row, the calculator's
 * own defaults, is the large figure.
 */
const CHLORINE_GALLONS = [5000, 10_000, 15_000, 20_000, 25_000, 30_000] as const;
const CHLORINE_FROM = 1;
const CHLORINE_TARGETS = [2, 3, 4] as const;
const CHLORINE_MAIN = 1;
const LIQUID = 'liquid-12-5';

/**
 * The baking soda jobs: the salt sizes and a 40,000 gallon pool, raising total alkalinity by 10,
 * 20 or 30 ppm up to 100 ppm, the calculator's own target; the 10 ppm raise is the large figure.
 */
const ALKALINITY_GALLONS = [5000, 10_000, 15_000, 20_000, 25_000, 30_000, 35_000, 40_000] as const;
const ALKALINITY_READINGS = [90, 80, 70] as const;
const ALKALINITY_TARGET = 100;

/**
 * The stabilizer jobs: the same sizes as baking soda, from fresh water (0 ppm, the large figure)
 * and from 10 or 20 ppm up to 30 ppm, the calculator's own target.
 */
const STABILIZER_GALLONS = ALKALINITY_GALLONS;

/**
 * The calcium chloride jobs: 10,000 to 30,000 gallons raised by 10, 50 or 100 ppm up to 250 ppm,
 * inside the 200 to 400 ppm of Hayward's manual; the 100 ppm raise, the methodology's own case,
 * is the large figure. Over 3 lb per 10,000 gallons the label splits the dose 12 hours apart, so
 * every row gives the first addition the calculator gives.
 */
const CALCIUM_GALLONS = [10_000, 15_000, 20_000, 25_000, 30_000] as const;
const CALCIUM_READINGS = [240, 200, 150] as const;
const CALCIUM_TARGET = 250;
const CALCIUM_MAIN = 2;
/**
 * The sentence of `CALCIUM.note` a calcium job page says nowhere else: its own notes give Hayward's
 * range, the CDC's cap and the dissolving, each with the page's pounds.
 */
const CALCIUM_JOB_NOTE =
  'The dose is for calcium chloride flake, the usual calcium hardness increaser; an anhydrous product (94% or more) is stronger, so follow the label of yours.';
const STABILIZER_READINGS = [0, 10, 20] as const;
/** ClearView Primo Powder is 99% isocyanuric acid (its directions, read 10 November 2026). */
export const PRIMO = Rational.of(100, 99);
const STABILIZER_TARGET = 30;

/**
 * The heater jobs: the same pool sizes, warmed by 10 °F (the calculator's own default, the large
 * figure), 15 or 20 °F over 24 hours, its default time.
 */
const HEATER_GALLONS = [10_000, 15_000, 20_000, 25_000, 30_000] as const;
const HEATER_RISES = [10, 15, 20] as const;
const HEATER_HOURS = 24;

/**
 * The fill time jobs: the same pool sizes, at 10 gallons a minute (the starting figure the
 * calculator fills in for a hose, the large figure), and at a slower 5 and a faster 20.
 */
const FILL_GALLONS = [10_000, 15_000, 20_000, 25_000, 30_000] as const;
const FILL_FLOWS = [5, 10, 20] as const;
const FILL_MAIN = 1;

/**
 * The pH jobs: muriatic acid (31.45%) to lower pH in 10,000 to 30,000 gallons, for the 1, 2 and 3
 * drops of acid demand reagent Taylor's chart lists (never past it); 2 drops, the calculator's own
 * default, is the large figure.
 */
const PH_GALLONS = [10_000, 15_000, 20_000, 25_000, 30_000] as const;
const PH_DROPS = [1, 2, 3] as const;
const PH_MAIN = 1;
const MURIATIC = 'muriatic-31-45';

/**
 * The shock jobs: 5,000 to 40,000 gallons, from 0 ppm to the shock level on the labels the shock
 * guide reads: 65% cal-hypo to 5 and to 10 ppm (its 10 to 20 oz per 10,000 gallons) and 56%
 * dichlor to 8.7 ppm (its 2 oz per 1,000 gallons). Cal-hypo to 10 ppm is the large figure.
 */
const SHOCK_GALLONS = [
  5000, 10_000, 12_000, 15_000, 18_000, 20_000, 25_000, 30_000, 35_000, 40_000,
] as const;
const SHOCK_DOSES = [
  { product: 'cal-hypo-65', target: '5', label: 'Cal-hypo 65%, 0 to 5 ppm' },
  { product: 'cal-hypo-65', target: '10', label: 'Cal-hypo 65%, 0 to 10 ppm' },
  { product: 'dichlor-56', target: '8.7', label: 'Dichlor 56%, 0 to 8.7 ppm' },
] as const;
const SHOCK_MAIN = 1;

/** The volume jobs: the common pool sizes people search for, at the depths they come in; `main` is the large figure. */
const VOLUME_JOBS = [
  {
    slug: '12x24-pool-gallons',
    name: '12 x 24 pool',
    title: '12x24 Pool',
    pool: 'A 12 ft by 24 ft rectangle',
    size: { length: '24 ft', width: '12 ft' },
    depths: [
      ['4 ft', '4 ft'],
      ['3 ft', '5 ft'],
      ['3 ft 6 in', '6 ft'],
    ],
    main: 0,
  },
  {
    slug: '14x28-pool-gallons',
    name: '14 x 28 pool',
    title: '14x28 Pool',
    pool: 'A 14 ft by 28 ft rectangle',
    size: { length: '28 ft', width: '14 ft' },
    depths: [
      ['4 ft', '4 ft'],
      ['3 ft', '6 ft'],
      ['3 ft 6 in', '8 ft'],
    ],
    main: 2,
  },
  {
    slug: '15x30-pool-gallons',
    name: '15 x 30 pool',
    title: '15x30 Pool',
    pool: 'A 15 ft by 30 ft rectangle',
    size: { length: '30 ft', width: '15 ft' },
    depths: [
      ['4 ft', '4 ft'],
      ['3 ft', '6 ft'],
      ['3 ft 6 in', '8 ft'],
    ],
    main: 2,
  },
  {
    slug: '16x32-pool-gallons',
    name: '16 x 32 pool',
    title: '16x32 Pool',
    pool: 'A 16 ft by 32 ft rectangle',
    size: { length: '32 ft', width: '16 ft' },
    depths: [
      ['4 ft', '4 ft'],
      ['3 ft', '6 ft'],
      ['3 ft 6 in', '8 ft'],
    ],
    main: 2,
  },
  {
    slug: '18x36-pool-gallons',
    name: '18 x 36 pool',
    title: '18x36 Pool',
    pool: 'A 18 ft by 36 ft rectangle',
    size: { length: '36 ft', width: '18 ft' },
    depths: [
      ['4 ft', '4 ft'],
      ['3 ft', '6 ft'],
      ['3 ft 6 in', '8 ft'],
    ],
    main: 2,
  },
  {
    slug: '20x40-pool-gallons',
    name: '20 x 40 pool',
    title: '20x40 Pool',
    pool: 'A 20 ft by 40 ft rectangle',
    size: { length: '40 ft', width: '20 ft' },
    depths: [
      ['4 ft', '4 ft'],
      ['3 ft', '6 ft'],
      ['3 ft 6 in', '8 ft'],
    ],
    main: 2,
  },
  {
    slug: '12-ft-round-pool-gallons',
    name: '12 ft round pool',
    title: '12 Ft Round Pool',
    pool: 'A round pool 12 ft across',
    size: { shape: 'round', length: '12 ft' },
    depths: [
      ['3 ft 6 in', '3 ft 6 in'],
      ['4 ft', '4 ft'],
      ['4 ft 6 in', '4 ft 6 in'],
    ],
    main: 1,
  },
  {
    slug: '15-ft-round-pool-gallons',
    name: '15 ft round pool',
    title: '15 Ft Round Pool',
    pool: 'A round pool 15 ft across',
    size: { shape: 'round', length: '15 ft' },
    depths: [
      ['3 ft 6 in', '3 ft 6 in'],
      ['4 ft', '4 ft'],
      ['4 ft 6 in', '4 ft 6 in'],
    ],
    main: 1,
  },
  {
    slug: '18-ft-round-pool-gallons',
    name: '18 ft round pool',
    title: '18 Ft Round Pool',
    pool: 'A round pool 18 ft across',
    size: { shape: 'round', length: '18 ft' },
    depths: [
      ['3 ft 6 in', '3 ft 6 in'],
      ['4 ft', '4 ft'],
      ['4 ft 6 in', '4 ft 6 in'],
    ],
    main: 1,
  },
  {
    slug: '21-ft-round-pool-gallons',
    name: '21 ft round pool',
    title: '21 Ft Round Pool',
    pool: 'A round pool 21 ft across',
    size: { shape: 'round', length: '21 ft' },
    depths: [
      ['3 ft 6 in', '3 ft 6 in'],
      ['4 ft', '4 ft'],
      ['4 ft 6 in', '4 ft 6 in'],
    ],
    main: 1,
  },
  {
    slug: '24-ft-round-pool-gallons',
    name: '24 ft round pool',
    title: '24 Ft Round Pool',
    pool: 'A round pool 24 ft across',
    size: { shape: 'round', length: '24 ft' },
    depths: [
      ['3 ft 6 in', '3 ft 6 in'],
      ['4 ft', '4 ft'],
      ['4 ft 6 in', '4 ft 6 in'],
    ],
    main: 1,
  },
  {
    slug: '27-ft-round-pool-gallons',
    name: '27 ft round pool',
    title: '27 Ft Round Pool',
    pool: 'A round pool 27 ft across',
    size: { shape: 'round', length: '27 ft' },
    depths: [
      ['3 ft 6 in', '3 ft 6 in'],
      ['4 ft', '4 ft'],
      ['4 ft 6 in', '4 ft 6 in'],
    ],
    main: 1,
  },
  {
    slug: '30-ft-round-pool-gallons',
    name: '30 ft round pool',
    title: '30 Ft Round Pool',
    pool: 'A round pool 30 ft across',
    size: { shape: 'round', length: '30 ft' },
    depths: [
      ['3 ft 6 in', '3 ft 6 in'],
      ['4 ft', '4 ft'],
      ['4 ft 6 in', '4 ft 6 in'],
    ],
    main: 1,
  },
  {
    slug: '15x30-oval-pool-gallons',
    name: '15 x 30 oval pool',
    title: '15x30 Oval Pool',
    pool: 'A 15 ft by 30 ft oval',
    size: { shape: 'oval', length: '30 ft', width: '15 ft' },
    depths: [
      ['3 ft 6 in', '3 ft 6 in'],
      ['4 ft', '4 ft'],
      ['4 ft 6 in', '4 ft 6 in'],
    ],
    main: 1,
  },
  {
    slug: '10x20-pool-gallons',
    name: '10 x 20 pool',
    title: '10x20 Pool',
    pool: 'A 10 ft by 20 ft rectangle',
    size: { length: '20 ft', width: '10 ft' },
    depths: [
      ['4 ft', '4 ft'],
      ['3 ft', '5 ft'],
      ['3 ft 6 in', '6 ft'],
    ],
    main: 0,
  },
  {
    slug: '16x36-pool-gallons',
    name: '16 x 36 pool',
    title: '16x36 Pool',
    pool: 'A 16 ft by 36 ft rectangle',
    size: { length: '36 ft', width: '16 ft' },
    depths: [
      ['4 ft', '4 ft'],
      ['3 ft', '6 ft'],
      ['3 ft 6 in', '8 ft'],
    ],
    main: 2,
  },
  {
    slug: '16x40-pool-gallons',
    name: '16 x 40 pool',
    title: '16x40 Pool',
    pool: 'A 16 ft by 40 ft rectangle',
    size: { length: '40 ft', width: '16 ft' },
    depths: [
      ['4 ft', '4 ft'],
      ['3 ft', '6 ft'],
      ['3 ft 6 in', '8 ft'],
    ],
    main: 2,
  },
  {
    slug: '33-ft-round-pool-gallons',
    name: '33 ft round pool',
    title: '33 Ft Round Pool',
    pool: 'A round pool 33 ft across',
    size: { shape: 'round', length: '33 ft' },
    depths: [
      ['3 ft 6 in', '3 ft 6 in'],
      ['4 ft', '4 ft'],
      ['4 ft 6 in', '4 ft 6 in'],
    ],
    main: 1,
  },
  {
    slug: '12x24-oval-pool-gallons',
    name: '12 x 24 oval pool',
    title: '12x24 Oval Pool',
    pool: 'A 12 ft by 24 ft oval',
    size: { shape: 'oval', length: '24 ft', width: '12 ft' },
    depths: [
      ['3 ft 6 in', '3 ft 6 in'],
      ['4 ft', '4 ft'],
      ['4 ft 6 in', '4 ft 6 in'],
    ],
    main: 1,
  },
  {
    slug: '16x32-oval-pool-gallons',
    name: '16 x 32 oval pool',
    title: '16x32 Oval Pool',
    pool: 'A 16 ft by 32 ft oval',
    size: { shape: 'oval', length: '32 ft', width: '16 ft' },
    depths: [
      ['3 ft 6 in', '3 ft 6 in'],
      ['4 ft', '4 ft'],
      ['4 ft 6 in', '4 ft 6 in'],
    ],
    main: 1,
  },
  {
    slug: '18x33-oval-pool-gallons',
    name: '18 x 33 oval pool',
    title: '18x33 Oval Pool',
    pool: 'A 18 ft by 33 ft oval',
    size: { shape: 'oval', length: '33 ft', width: '18 ft' },
    depths: [
      ['3 ft 6 in', '3 ft 6 in'],
      ['4 ft', '4 ft'],
      ['4 ft 6 in', '4 ft 6 in'],
    ],
    main: 1,
  },
] as const;

/** A size as the volume calculator reads it: a raw with no shape is a rectangle, a round has no width. */
const sizeKey = ({ shape = 'rectangle', length = '', width = '' }: Raw): string =>
  `${shape} ${length} ${shape === 'round' ? '' : width}`;

/** The volume job page of a pool size (`shape`, `length`, `width`), when the site has one. */
export const volumeJobPathOf = (size: Raw): string | undefined => {
  const found = VOLUME_JOBS.find((job) => sizeKey(job.size) === sizeKey(size));
  return found === undefined ? undefined : `/${found.slug}`;
};

/** The outputs of one engine run, by key; a run that fails is a build error. */
const outputsOf = (
  engine:
    | typeof poolSalt
    | typeof poolChlorine
    | typeof poolAlkalinity
    | typeof poolStabilizer
    | typeof poolHeater
    | typeof poolFillTime
    | typeof poolPh
    | typeof poolCalcium
    | typeof poolVolume,
  raw: Raw,
): { readonly values: ReadonlyMap<string, unknown>; readonly bags: bigint } => {
  const ran = engine.run(raw);
  if (!ran.ok) throw new Error(`${engine.id} did not run on ${JSON.stringify(raw)}`);
  return {
    values: new Map(ran.value.outputs.map(({ key, value }) => [key, value])),
    bags: ran.value.shopping[0]?.qty ?? 0n,
  };
};

/** The calculator link that opens on `raw`, through the calculator's own URL state. */
const linkTo = <const I extends readonly InputDescriptor[]>(
  engine: Calculator<string, I, readonly OutputDescriptor[], readonly string[]>,
  path: string,
  raw: Raw,
): string => {
  const validated = engine.validate(raw);
  if (!validated.ok) throw new Error(`${engine.id} rejects ${JSON.stringify(raw)}`);
  return `${path}?${encode(engine, validated.value)}`;
};

const saltPage = (gallons: number): JobPage => {
  const size = amountText(Rational.of(gallons));
  const rows = READINGS.map((current) => {
    const raw = { gallons: String(gallons), current: String(current), target: String(TARGET) };
    const { values, bags } = outputsOf(poolSalt, raw);
    const pounds = outputText('pounds', values.get('pounds'));
    return { raw, cells: [`${amountText(Rational.of(current))} ppm`, pounds, String(bags)] };
  });
  const [fresh] = rows;
  if (fresh === undefined) throw new Error('a salt job needs a fresh-fill row');
  const [, pounds = '', bags = ''] = fresh.cells;
  // the level Pentair's IntelliChlor guide recommends, for the lead's second answer
  const pentair = outputText(
    'pounds',
    outputsOf(poolSalt, { ...fresh.raw, target: String(PENTAIR_TARGET) }).values.get('pounds'),
  );
  return {
    path: `/how-much-salt-for-a-${String(gallons)}-gallon-pool`,
    kind: 'salt',
    main: 0,
    checked: CHECKED.salt,
    title: `How Much Salt for a ${size} Gallon Pool? | Pool Figures`,
    description: `The pounds and 40 lb bags of salt a ${size} gallon pool needs to reach 3,200 ppm, from fresh water and from the readings you test.`,
    h1: `How much salt for a ${size} gallon pool`,
    lead: `A ${size} gallon pool filled with fresh water needs ${pounds} lb of salt, ${bags} bags of 40 lb, to reach 3,200 ppm, the level Hayward’s AquaRite manual calls the best, or ${pentair} lb for a Pentair IntelliChlor at 3,600 ppm. Already salted? Find your reading below.`,
    figure: {
      value: pounds,
      unit: 'LB',
      caption: `${bags} bags of 40 lb, from fresh water to 3,200 ppm.`,
    },
    head: ['Salt now', 'Salt to add (lb)', 'Bags of 40 lb'],
    rows,
    calculator: {
      path: SALT.path,
      href: linkTo(poolSalt, SALT.path, fresh.raw),
      label: 'Work it out for your reading',
    },
    method: `${SALT.method} ${SALT.note}`,
    card: { title: `Salt for ${size} gallons`, summary: `${pounds} lb from fresh water.` },
    gallons,
  };
};

const chlorinePage = (gallons: number): JobPage => {
  const size = amountText(Rational.of(gallons));
  const rows = CHLORINE_TARGETS.map((target) => {
    const raw = {
      gallons: String(gallons),
      current: String(CHLORINE_FROM),
      target: String(target),
      product: LIQUID,
    };
    const { values } = outputsOf(poolChlorine, raw);
    const liquid = values.get('liquid');
    if (!isQuantityOf(liquid, 'volume')) throw new Error('liquid must be a volume');
    return {
      raw,
      cells: [
        `${String(CHLORINE_FROM)} to ${String(target)} ppm`,
        outputText('liquid', liquid),
        volumeText(liquid, liter, 2),
      ],
    };
  });
  const main = rows[CHLORINE_MAIN];
  if (main === undefined) throw new Error('a chlorine job needs its main row');
  const [range = '', ounces = '', liters = ''] = main.cells;
  // the main dose as a share of a 1 gallon jug, and the same raise in 65% cal-hypo
  const liquid = outputsOf(poolChlorine, main.raw).values.get('liquid');
  if (!isQuantityOf(liquid, 'volume')) throw new Error('liquid must be a volume');
  const jug = volumeText(liquid, gal, 2);
  const calHypo = outputText(
    'dry',
    outputsOf(poolChlorine, { ...main.raw, product: 'cal-hypo-65' }).values.get('dry'),
  );
  return {
    path: `/how-much-chlorine-for-a-${String(gallons)}-gallon-pool`,
    kind: 'chlorine',
    main: CHLORINE_MAIN,
    checked: CHECKED.chlorine,
    title: `How Much Chlorine for a ${size} Gallon Pool? | Pool Figures`,
    description: `The fluid ounces of 12.5% liquid chlorine a ${size} gallon pool needs to raise free chlorine by 1, 2 or 3 ppm.`,
    h1: `How much chlorine for a ${size} gallon pool`,
    lead: `A ${size} gallon pool needs ${ounces} fl oz of 12.5% liquid chlorine, ${jug} of a 1 gallon jug, to raise free chlorine from ${range}. The same raise takes ${calHypo} oz of 65% cal-hypo, by weight.`,
    figure: {
      value: ounces,
      unit: 'FL OZ',
      caption: `${liters} L of 12.5% liquid chlorine, from ${range}.`,
    },
    head: ['Free chlorine', '12.5% liquid (fl oz)', 'Liters'],
    rows,
    calculator: {
      path: CHLORINE.path,
      href: linkTo(poolChlorine, CHLORINE.path, main.raw),
      label: 'Work it out for your reading and product',
    },
    method: `${CHLORINE.method} ${CHLORINE.note}`,
    card: {
      title: `Chlorine for ${size} gallons`,
      summary: `${ounces} fl oz of 12.5% liquid, ${range}.`,
    },
    gallons,
  };
};

const shockPage = (gallons: number): JobPage => {
  const size = amountText(Rational.of(gallons));
  const rows = SHOCK_DOSES.map(({ product, target, label }) => {
    const raw = { gallons: String(gallons), current: '0', target, product };
    const { values } = outputsOf(poolChlorine, raw);
    const dry = values.get('dry');
    if (!isQuantityOf(dry, 'mass')) throw new Error('dry must be a mass');
    return { raw, cells: [label, outputText('dry', dry), amountText(valueIn(dry, lb), 2)] };
  });
  const main = rows[SHOCK_MAIN];
  if (main === undefined) throw new Error('a shock job needs its 10 ppm row');
  const [, ounces = '', pounds = ''] = main.cells;
  return {
    path: `/how-much-shock-for-a-${String(gallons)}-gallon-pool`,
    kind: 'shock',
    main: SHOCK_MAIN,
    checked: CHECKED.shock,
    title: `How Much Shock for a ${size} Gallon Pool? | Pool Figures`,
    description: `The ounces of 65% cal-hypo or 56% dichlor that shock a ${size} gallon pool to the level on the label, from 0 ppm free chlorine.`,
    h1: `How much shock for a ${size} gallon pool`,
    lead: `A 65% cal-hypo label shocks to 5 to 10 ppm available chlorine. From 0 ppm, reaching 10 ppm in a ${size} gallon pool takes ${ounces} oz of cal-hypo; 5 ppm and the 8.7 ppm of a 56% dichlor label are in the table, and the calculator starts from your own reading.`,
    figure: {
      value: ounces,
      unit: 'OZ BY WEIGHT',
      caption: `${pounds} lb of 65% cal-hypo, from 0 to 10 ppm.`,
    },
    head: ['Shock', 'Ounces by weight', 'Pounds'],
    rows,
    calculator: {
      path: CHLORINE.path,
      href: linkTo(poolChlorine, CHLORINE.path, main.raw),
      label: 'Work it out for your reading and product',
    },
    guide: { href: SHOCK_GUIDE.path, label: SHOCK_GUIDE.card.title },
    method: `${CHLORINE.method} Swim again only when free chlorine is back down: the cal-hypo label prohibits reentry above 4 ppm, the dichlor label above 3 ppm. ${CHLORINE.note}`,
    card: {
      title: `Shock for ${size} gallons`,
      summary: `${ounces} oz of 65% cal-hypo, 0 to 10 ppm.`,
    },
    gallons,
  };
};

/** The rows of a dose in pounds and ounces (baking soda, stabilizer): one per reading, up to `target`. */
const massRows = (
  engine: typeof poolAlkalinity | typeof poolStabilizer,
  gallons: number,
  readings: readonly number[],
  target: number,
): readonly JobRow[] =>
  readings.map((current) => {
    const raw = { gallons: String(gallons), current: String(current), target: String(target) };
    const { values } = outputsOf(engine, raw);
    return {
      raw,
      cells: [
        `${amountText(Rational.of(current))} ppm`,
        outputText('pounds', values.get('pounds')),
        outputText('ounces', values.get('ounces')),
      ],
    };
  });

/**
 * The baking soda the ClearView Total Alkalinity label gives for a raise (read 10 November 2026):
 * "One pound ... will increase the total alkalinity of 5,000 gallons of pool water by 12 ppm".
 */
export const clearViewPounds = (gallons: number, raise: number): Rational =>
  Rational.of(gallons * raise, 5000 * 12);

const alkalinityPage = (gallons: number): JobPage => {
  const size = amountText(Rational.of(gallons));
  const rows = massRows(poolAlkalinity, gallons, ALKALINITY_READINGS, ALKALINITY_TARGET);
  const [main] = rows;
  if (main === undefined) throw new Error('a baking soda job needs its 10 ppm row');
  const [from = '', pounds = '', ounces = ''] = main.cells;
  const raise = `from ${from.replace(' ppm', '')} to ${String(ALKALINITY_TARGET)} ppm`;
  return {
    path: `/how-much-baking-soda-for-a-${String(gallons)}-gallon-pool`,
    kind: 'alkalinity',
    main: 0,
    checked: CHECKED.alkalinity,
    title: `How Much Baking Soda for a ${size} Gallon Pool? | Pool Figures`,
    description: `The pounds of baking soda (sodium bicarbonate) that raise total alkalinity in a ${size} gallon pool by 10, 20 or 30 ppm.`,
    h1: `How much baking soda for a ${size} gallon pool`,
    lead: `A ${size} gallon pool needs ${pounds} lb of baking soda to raise total alkalinity by 10 ppm, ${raise}; the ClearView label, at 12 ppm a pound in 5,000 gallons, would add ${amountText(clearViewPounds(gallons, 10), 1)} lb. Bigger raises are in the table; the calculator takes your own reading and target.`,
    figure: {
      value: pounds,
      unit: 'LB',
      caption: `${ounces} oz of sodium bicarbonate, ${raise}.`,
    },
    head: ['Alkalinity now', 'Baking soda (lb)', 'Ounces'],
    rows,
    calculator: {
      path: ALKALINITY.path,
      href: linkTo(poolAlkalinity, ALKALINITY.path, main.raw),
      label: 'Work it out for your reading',
    },
    method: ALKALINITY.note,
    card: { title: `Baking soda for ${size} gallons`, summary: `${pounds} lb for 10 ppm more.` },
    gallons,
  };
};

const stabilizerPage = (gallons: number): JobPage => {
  const size = amountText(Rational.of(gallons));
  const rows = massRows(poolStabilizer, gallons, STABILIZER_READINGS, STABILIZER_TARGET);
  const [fresh] = rows;
  if (fresh === undefined) throw new Error('a stabilizer job needs a fresh-fill row');
  const [, pounds = '', ounces = ''] = fresh.cells;
  const acid = outputsOf(poolStabilizer, fresh.raw).values.get('pounds');
  if (!isQuantityOf(acid, 'mass')) throw new Error('stabilizer must be a mass');
  const primo = amountText(valueIn(acid, lb).mul(PRIMO), 1);
  const fifty = outputText(
    'pounds',
    outputsOf(poolStabilizer, { ...fresh.raw, target: '50' }).values.get('pounds'),
  );
  return {
    path: `/how-much-stabilizer-for-a-${String(gallons)}-gallon-pool`,
    kind: 'stabilizer',
    main: 0,
    checked: CHECKED.stabilizer,
    title: `How Much Stabilizer for a ${size} Gallon Pool? | Pool Figures`,
    description: `The pounds of stabilizer (cyanuric acid) a ${size} gallon pool needs to reach 30 ppm CYA, from fresh water and from 10 or 20 ppm.`,
    h1: `How much stabilizer for a ${size} gallon pool`,
    lead: `A ${size} gallon pool filled with fresh water needs ${pounds} lb of cyanuric acid to reach 30 ppm CYA, ${primo} lb of 99% Primo Powder, or ${fifty} lb for 50 ppm, the top of Primo’s range. Already stabilized? Find your reading below; the dose is for a 100% product.`,
    figure: {
      value: pounds,
      unit: 'LB',
      caption: `${ounces} oz of cyanuric acid, from 0 to 30 ppm.`,
    },
    head: ['CYA now', 'Stabilizer (lb)', 'Ounces'],
    rows,
    calculator: {
      path: STABILIZER.path,
      href: linkTo(poolStabilizer, STABILIZER.path, fresh.raw),
      label: 'Work it out for your reading',
    },
    method: STABILIZER.note,
    card: { title: `Stabilizer for ${size} gallons`, summary: `${pounds} lb from 0 to 30 ppm.` },
    gallons,
  };
};

const heaterPage = (gallons: number): JobPage => {
  const size = amountText(Rational.of(gallons));
  const rows = HEATER_RISES.map((rise) => {
    const raw = { gallons: String(gallons), rise: String(rise), hours: String(HEATER_HOURS) };
    const { values } = outputsOf(poolHeater, raw);
    return {
      raw,
      cells: [
        `${String(rise)} °F in ${String(HEATER_HOURS)} hours`,
        outputText('btuPerHour', values.get('btuPerHour')),
        outputText('btu', values.get('btu')),
      ],
    };
  });
  const [main] = rows;
  if (main === undefined) throw new Error('a heater job needs its 10 °F row');
  const [warm = '', perHour = '', heat = ''] = main.cells;
  const halfDay = outputText(
    'btuPerHour',
    outputsOf(poolHeater, { ...main.raw, hours: '12' }).values.get('btuPerHour'),
  );
  return {
    path: `/what-size-pool-heater-for-a-${String(gallons)}-gallon-pool`,
    kind: 'heater',
    main: 0,
    checked: CHECKED.heater,
    title: `What Size Pool Heater for a ${size} Gallon Pool? | Pool Figures`,
    description: `The BTU per hour a heater must put out to warm a ${size} gallon pool by 10, 15 or 20 °F in 24 hours, from the weight of the water.`,
    h1: `What size pool heater for a ${size} gallon pool`,
    lead: `A ${size} gallon pool needs a heater that puts ${perHour} BTU an hour into the water to warm by ${warm}, or ${halfDay} in 12 hours. A pool loses heat while it warms, so a real heater is sized larger; the calculator takes your own rise and hours.`,
    figure: {
      value: perHour,
      unit: 'BTU/H',
      caption: `${heat} BTU warm ${size} gallons by ${warm}, before any heat lost.`,
    },
    head: ['Warm by', 'Heater output (BTU/h)', 'Heat (BTU)'],
    rows,
    calculator: {
      path: HEATER.path,
      href: linkTo(poolHeater, HEATER.path, main.raw),
      label: 'Work it out for your rise and hours',
    },
    method: HEATER.note,
    card: { title: `Heater for ${size} gallons`, summary: `${perHour} BTU/h, 10 °F in 24 hours.` },
    gallons,
  };
};

const fillPage = (gallons: number): JobPage => {
  const size = amountText(Rational.of(gallons));
  const rows = FILL_FLOWS.map((flow) => {
    const raw = { gallons: String(gallons), flow: String(flow) };
    const { values } = outputsOf(poolFillTime, raw);
    return {
      raw,
      cells: [
        `${String(flow)} gallons a minute`,
        outputText('time', values.get('time')),
        outputText('minutes', values.get('minutes')),
      ],
    };
  });
  const main = rows[FILL_MAIN];
  if (main === undefined) throw new Error('a fill time job needs its 10 gallons a minute row');
  const [flow = '', time = '', minutes = ''] = main.cells;
  return {
    path: `/how-long-to-fill-a-${String(gallons)}-gallon-pool`,
    kind: 'fill',
    main: FILL_MAIN,
    checked: CHECKED.fill,
    title: `How Long to Fill a ${size} Gallon Pool? | Pool Figures`,
    description: `How many hours and minutes a hose takes to fill a ${size} gallon pool at 5, 10 or 20 gallons a minute.`,
    h1: `How long to fill a ${size} gallon pool`,
    lead: `At ${flow}, the starting figure the calculator gives a hose, a ${size} gallon pool takes ${time} to fill. Hoses vary: time a 5-gallon bucket to measure yours, and find a slower or faster flow below.`,
    figure: { value: time, unit: 'HOURS AND MINUTES', caption: `${minutes} minutes at ${flow}.` },
    head: ['Hose flow', 'Time to fill', 'Minutes'],
    rows,
    calculator: {
      path: FILL_TIME.path,
      href: linkTo(poolFillTime, FILL_TIME.path, main.raw),
      label: 'Work it out for your hose',
    },
    method: `${FILL_TIME.method} ${FILL_TIME.note}`,
    card: { title: `Filling ${size} gallons`, summary: `${time} at ${flow}.` },
    gallons,
  };
};

const phPage = (gallons: number): JobPage => {
  const size = amountText(Rational.of(gallons));
  const rows = PH_DROPS.map((drops) => {
    const raw = { gallons: String(gallons), product: MURIATIC, drops: String(drops) };
    const { values } = outputsOf(poolPh, raw);
    const liquid = values.get('liquid');
    if (!isQuantityOf(liquid, 'volume')) throw new Error('liquid must be a volume');
    return {
      raw,
      cells: [
        `${String(drops)} ${drops === 1 ? 'drop' : 'drops'}`,
        outputText('liquid', liquid),
        volumeText(liquid, liter, 2),
        outputText('days', values.get('days')),
      ],
    };
  });
  const main = rows[PH_MAIN];
  if (main === undefined) throw new Error('a pH job needs its 2 drops row');
  const [drops = '', ounces = '', liters = '', days = ''] = main.cells;
  const mainValues = outputsOf(poolPh, main.raw).values;
  const perDay = outputText('liquidPerDay', mainValues.get('liquidPerDay'));
  // the lead says HASA's label splits the large figure's dose over 2 days: a build error if not
  if (days !== '2') throw new Error('a pH job needs a dose split over 2 days as its large figure');
  const [dose, most] = [mainValues.get('liquid'), mainValues.get('liquidPerDay')];
  if (!isQuantityOf(dose, 'volume') || !isQuantityOf(most, 'volume'))
    throw new Error('liquid must be a volume');
  const rest = outputText('liquid', quantity(valueIn(dose, gal).sub(valueIn(most, gal)), gal));
  return {
    path: `/how-much-muriatic-acid-for-a-${String(gallons)}-gallon-pool`,
    kind: 'ph',
    main: PH_MAIN,
    checked: CHECKED.ph,
    title: `How Much Muriatic Acid for a ${size} Gallon Pool? | Pool Figures`,
    description: `The fluid ounces of 31.45% muriatic acid that lower pH in a ${size} gallon pool, for 1, 2 or 3 drops of the acid demand test of a Taylor kit.`,
    h1: `How much muriatic acid for a ${size} gallon pool`,
    lead: `A ${size} gallon pool needs ${ounces} fl oz of 31.45% muriatic acid to lower its pH when the acid demand test of a Taylor kit takes ${drops}. HASA’s label adds at most ${perDay} fl oz a day to that pool, so it goes in over ${days} days: ${perDay} fl oz, a test, then ${rest} fl oz. The table stops at 3 drops, where Taylor’s chart does; the calculator also raises pH with soda ash.`,
    figure: {
      value: ounces,
      unit: 'FL OZ',
      caption: `${liters} L of 31.45% muriatic acid, for ${drops} of acid demand reagent, over ${days} days.`,
    },
    head: [
      'Acid demand test',
      'Muriatic acid (fl oz)',
      'Liters',
      `Days, at most ${perDay} fl oz a day`,
    ],
    rows,
    calculator: {
      path: PH.path,
      href: linkTo(poolPh, PH.path, main.raw),
      label: 'Work it out for your test',
    },
    guide: { href: PH_GUIDE.path, label: PH_GUIDE.card.title },
    method: PH.note,
    card: { title: `Muriatic acid for ${size} gallons`, summary: `${ounces} fl oz for ${drops}.` },
    gallons,
  };
};

const calciumPage = (gallons: number): JobPage => {
  const size = amountText(Rational.of(gallons));
  const rows = CALCIUM_READINGS.map((current) => {
    const raw = {
      gallons: String(gallons),
      current: String(current),
      target: String(CALCIUM_TARGET),
    };
    const { values } = outputsOf(poolCalcium, raw);
    return {
      raw,
      cells: [
        `${String(current)} ppm`,
        outputText('pounds', values.get('pounds')),
        outputText('firstAddition', values.get('firstAddition')),
      ],
    };
  });
  const main = rows[CALCIUM_MAIN];
  if (main === undefined) throw new Error('a calcium job needs its 100 ppm row');
  const [from = '', pounds = '', first = ''] = main.cells;
  // the lead says the label splits the large figure's dose: a build error if it does not
  if (first === pounds) throw new Error('a calcium job needs a split dose as its large figure');
  const mainValues = outputsOf(poolCalcium, main.raw).values;
  const [whole, most] = [mainValues.get('pounds'), mainValues.get('firstAddition')];
  if (!isQuantityOf(whole, 'mass') || !isQuantityOf(most, 'mass'))
    throw new Error('calcium must be a mass');
  const additions = String(valueIn(whole, lb).div(valueIn(most, lb)).ceil());
  const raise = `from ${from.replace(' ppm', '')} to ${String(CALCIUM_TARGET)} ppm`;
  return {
    path: `/how-much-calcium-chloride-for-a-${String(gallons)}-gallon-pool`,
    kind: 'calcium',
    main: CALCIUM_MAIN,
    checked: CHECKED.calcium,
    title: `How Much Calcium Chloride for ${size} Gallons? | Pool Figures`,
    description: `The pounds of calcium chloride (calcium hardness increaser) that raise calcium hardness in a ${size} gallon pool by 10, 50 or 100 ppm, and how much to add first.`,
    h1: `How much calcium chloride for a ${size} gallon pool`,
    lead: `A ${size} gallon pool needs ${pounds} lb of calcium chloride flake to raise calcium hardness ${raise}. That is over 3 lb per 10,000 gallons, so the label splits it into ${additions} additions of at most ${first} lb, 12 hours apart: add ${first} lb, run the pump 12 hours, test, then add the next.`,
    figure: {
      value: pounds,
      unit: 'LB',
      caption: `${first} lb first, the rest at least 12 hours later, ${raise}.`,
    },
    head: ['Calcium hardness now', 'Calcium chloride (lb)', 'Add first (lb)'],
    rows,
    calculator: {
      path: CALCIUM.path,
      href: linkTo(poolCalcium, CALCIUM.path, main.raw),
      label: 'Work it out for your reading',
    },
    guide: { href: CALCIUM_GUIDE.path, label: CALCIUM_GUIDE.card.title },
    method: CALCIUM_JOB_NOTE,
    card: {
      title: `Calcium chloride for ${size} gallons`,
      summary: `${pounds} lb for 100 ppm more.`,
    },
    gallons,
  };
};

const volumePage = ({
  slug,
  name,
  title,
  pool,
  size,
  depths,
  main: index,
}: (typeof VOLUME_JOBS)[number]): JobPage => {
  const rows = depths.map(([shallow, deep]) => {
    const raw = { ...size, shallow, deep };
    const { values } = outputsOf(poolVolume, raw);
    const volume = values.get('gallons');
    if (!isQuantityOf(volume, 'volume')) throw new Error('gallons must be a volume');
    const depth = shallow === deep ? shallow : `${shallow} to ${deep}`;
    return { raw, cells: [depth, volumeText(volume, gal), volumeText(volume, liter)] };
  });
  const main = rows[index];
  if (main === undefined) throw new Error('a volume job needs a row');
  const [depth = '', gallons = ''] = main.cells;
  const volume = outputsOf(poolVolume, main.raw).values.get('gallons');
  if (!isQuantityOf(volume, 'volume')) throw new Error('gallons must be a volume');
  const at = `${depth} deep`;
  return {
    path: `/${slug}`,
    kind: 'volume',
    main: index,
    checked: CHECKED.volume,
    title: `How Many Gallons in a ${title}? | Pool Figures`,
    description: `How many gallons a ${name} holds: ${gallons} at ${at}, and the gallons and liters at the other depths it comes in.`,
    h1: `How many gallons in a ${name}`,
    lead: `${pool}, ${at}, holds ${gallons} gallons. Other depths are in the table, and the calculator takes your own tape readings.`,
    figure: { value: gallons, unit: 'GALLONS', caption: `${pool}, ${at}.` },
    head: ['Depth', 'Gallons', 'Liters'],
    rows,
    calculator: {
      path: VOLUME_TEXTS.path,
      href: linkTo(poolVolume, VOLUME_TEXTS.path, main.raw),
      label: 'Work it out for your pool',
    },
    guide: { href: GALLONS_GUIDE.path, label: GALLONS_GUIDE.card.title },
    method: `${VOLUME_TEXTS.method} ${VOLUME_TEXTS.note}`,
    card: { title: `Gallons in a ${name}`, summary: `${gallons} gallons, ${at}.` },
    gallons: valueIn(volume, gal).toNumber(),
  };
};

/** Every job page, volume first: the gallons the dose pages start from. */
export const JOB_PAGES: readonly JobPage[] = [
  ...VOLUME_JOBS.map(volumePage),
  ...SALT_GALLONS.map(saltPage),
  ...CHLORINE_GALLONS.map(chlorinePage),
  ...ALKALINITY_GALLONS.map(alkalinityPage),
  ...STABILIZER_GALLONS.map(stabilizerPage),
  ...HEATER_GALLONS.map(heaterPage),
  ...FILL_GALLONS.map(fillPage),
  ...PH_GALLONS.map(phPage),
  ...CALCIUM_GALLONS.map(calciumPage),
  ...SHOCK_GALLONS.map(shockPage),
];

/** How many job pages of its calculator a job page links: its nearest sizes, so pages stay distinct. */
export const NEIGHBORS = 4;

/** A job page's family: the pages of the same calculator that work out the same guide's dose, or none. */
const sameFamily = (a: JobPage, b: JobPage): boolean =>
  a.calculator.path === b.calculator.path && a.guide?.href === b.guide?.href;

/** The `NEIGHBORS` job pages of the same family nearest to `page` in gallons, smallest first. */
export const neighborsOf = (
  page: JobPage,
): readonly { readonly href: string; readonly label: string }[] => {
  const family = JOB_PAGES.filter((member) => sameFamily(member, page))
    .slice()
    .sort((a, b) => a.gallons - b.gallons);
  const index = family.indexOf(page);
  const start = Math.max(0, Math.min(index - NEIGHBORS / 2, family.length - NEIGHBORS - 1));
  return family
    .slice(start, start + NEIGHBORS + 1)
    .filter((member) => member !== page)
    .map(({ path, h1 }) => ({ href: path, label: h1 }));
};

/** The job pages a calculator works out, as links from its page: the common sizes, in table order. */
export const jobLinksOf = (
  calculatorPath: string,
): readonly { readonly href: string; readonly label: string }[] =>
  JOB_PAGES.filter(({ calculator }) => calculator.path === calculatorPath).map(({ path, h1 }) => ({
    href: path,
    label: h1,
  }));

/** The job pages that work out the dose of the guide at `guidePath`, as links from it. */
export const guideJobLinksOf = (
  guidePath: string,
): readonly { readonly href: string; readonly label: string }[] =>
  JOB_PAGES.filter(({ guide }) => guide?.href === guidePath).map(({ path, h1 }) => ({
    href: path,
    label: h1,
  }));
