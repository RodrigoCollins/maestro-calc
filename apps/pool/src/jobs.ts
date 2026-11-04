import {
  encode,
  gal,
  isQuantityOf,
  liter,
  Rational,
  type Calculator,
  type InputDescriptor,
  type OutputDescriptor,
} from '@maestro-calc/core';
import { poolSalt } from '@maestro-calc/pool-core/pool-salt';
import { poolVolume } from '@maestro-calc/pool-core/pool-volume';
import { SALT } from './doses.ts';
import { amountText, outputText, volumeText } from './format.ts';
import { VOLUME_TEXTS } from './volume/texts.ts';

type Raw = Readonly<Record<string, string>>;

/** One row of a job's table: the inputs the engine ran on, and the cells it gave. */
export interface JobRow {
  readonly raw: Raw;
  readonly cells: readonly string[];
}

/** A page for one common job ("how much salt for a 15,000 gallon pool"), worked out at build time. */
export interface JobPage {
  readonly path: string;
  readonly title: string;
  readonly description: string;
  readonly h1: string;
  readonly lead: string;
  /** The large figure: one cell of the table, the row the calculator link opens on. */
  readonly figure: { readonly value: string; readonly unit: string; readonly caption: string };
  readonly head: readonly string[];
  readonly rows: readonly JobRow[];
  readonly calculator: { readonly path: string; readonly href: string; readonly label: string };
  readonly method: string;
  readonly card: { readonly title: string; readonly summary: string };
}

/** The salt jobs: the pool sizes people search for, from a fresh fill and from common readings. */
const SALT_GALLONS = [10_000, 15_000, 20_000, 25_000, 30_000] as const;
const READINGS = [0, 1000, 2000, 2400, 2800] as const;
const TARGET = 3200;

/** The volume jobs: the common pool sizes people search for, at the depths they come in; `main` is the large figure. */
const VOLUME_JOBS = [
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
] as const;

/** The outputs of one engine run, by key; a run that fails is a build error. */
const outputsOf = (
  engine: typeof poolSalt | typeof poolVolume,
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
  return {
    path: `/how-much-salt-for-a-${String(gallons)}-gallon-pool`,
    title: `How Much Salt for a ${size} Gallon Pool? | Pool Figures`,
    description: `The pounds and 40 lb bags of salt a ${size} gallon pool needs to reach 3,200 ppm, from fresh water and from the readings you test.`,
    h1: `How much salt for a ${size} gallon pool`,
    lead: `A ${size} gallon pool filled with fresh water needs ${pounds} lb of salt to reach 3,200 ppm, the level Hayward’s AquaRite manual calls the best. Already salted? Find your reading below.`,
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
  const at = `${depth} deep`;
  return {
    path: `/${slug}`,
    title: `How Many Gallons in a ${title}? | Pool Figures`,
    description: `How many gallons a ${name} holds at the depths it comes in, worked out from its size.`,
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
    method: `${VOLUME_TEXTS.method} ${VOLUME_TEXTS.note}`,
    card: { title: `Gallons in a ${name}`, summary: `${gallons} gallons, ${at}.` },
  };
};

/** Every job page, volume first: the gallons the salt pages start from. */
export const JOB_PAGES: readonly JobPage[] = [
  ...VOLUME_JOBS.map(volumePage),
  ...SALT_GALLONS.map(saltPage),
];
