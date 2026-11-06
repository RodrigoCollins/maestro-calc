import { add, encode, gal, isQuantityOf, Rational, scale, valueIn } from '@maestro-calc/core';
import { canonicalUrl } from '@maestro-calc/site-kit/canonical';
import { poolVolume } from '@maestro-calc/pool-core/pool-volume';
import { amountText, lengthFieldText } from '../format.ts';
import type { GuideSource } from '../guide.ts';
import { SITE } from '../site.config.ts';
import { VOLUME_TEXTS } from './texts.ts';

type Raw = Readonly<Record<string, string>>;

/** One depth of a table: the two ends as a tape reads them, and the average the gallons use. */
export interface VolumeColumn {
  readonly head: string;
  readonly shallow: string;
  readonly deep: string;
  readonly average: string;
}

export interface VolumeRow {
  readonly label: string;
  /** The shape, length and width the calculator runs on. */
  readonly size: Raw;
  /** The gallons at each depth of the table, as the calculator prints them. */
  readonly cells: readonly string[];
  /** The calculator, opened on this size at the middle depth. */
  readonly href: string;
}

export interface VolumeTable {
  readonly id: string;
  readonly caption: string;
  readonly note: string;
  readonly columns: readonly VolumeColumn[];
  readonly rows: readonly VolumeRow[];
}

/** The validated inputs of the volume calculator; a raw it rejects is a build error. */
const validated = (raw: Raw) => {
  const result = poolVolume.validate(raw);
  if (!result.ok) throw new Error(`pool-volume rejects ${JSON.stringify(raw)}`);
  return result.value;
};

/** The gallons of `raw` as an exact number; a run that fails is a build error. */
const gallonsOf = (raw: Raw): Rational => {
  const ran = poolVolume.run(raw);
  if (!ran.ok) throw new Error(`pool-volume did not run on ${JSON.stringify(raw)}`);
  const volume = ran.value.outputs.find(({ key }) => key === 'gallons')?.value;
  if (!isQuantityOf(volume, 'volume')) throw new Error('gallons must be a volume');
  return valueIn(volume, gal);
};

const HALF = Rational.of(1, 2);

const columnOf = (shallow: string, deep: string): VolumeColumn => {
  const ends = validated({ shallow, deep });
  return {
    head: shallow === deep ? `${shallow} deep` : `${shallow} to ${deep}`,
    shallow,
    deep,
    average: lengthFieldText(scale(add(ends.shallow, ends.deep), HALF)),
  };
};

/** An above-ground pool: the water depths it is filled to, the same at both ends. */
const LEVEL = [
  columnOf('3 ft 6 in', '3 ft 6 in'),
  columnOf('4 ft', '4 ft'),
  columnOf('4 ft 6 in', '4 ft 6 in'),
];

/** An in-ground pool: flat, and sloping to a deep end of 6 or 8 ft, the depths the job pages chart. */
const SLOPED = [columnOf('4 ft', '4 ft'), columnOf('3 ft', '6 ft'), columnOf('3 ft 6 in', '8 ft')];

/** The column each row's calculator link opens on, and the lead quotes. */
const MIDDLE = 1;

const rowOf = (label: string, size: Raw, columns: readonly VolumeColumn[]): VolumeRow => {
  const at = (column: VolumeColumn | undefined): Raw => {
    if (column === undefined) throw new Error('a table needs its middle depth');
    return { ...size, shallow: column.shallow, deep: column.deep };
  };
  return {
    label,
    size,
    cells: columns.map((column) => amountText(gallonsOf(at(column)))),
    href: `${VOLUME_TEXTS.path}?${encode(poolVolume, validated(at(columns[MIDDLE])))}`,
  };
};

const ROUND = [12, 15, 18, 21, 24, 27, 30, 33] as const;
const OVAL = [
  [12, 18],
  [12, 24],
  [15, 24],
  [15, 30],
  [16, 32],
  [18, 33],
  [18, 40],
] as const;
const RECTANGLE = [
  [12, 24],
  [14, 28],
  [15, 30],
  [16, 32],
  [16, 36],
  [16, 40],
  [18, 36],
  [20, 40],
] as const;

const ft = (feet: number): string => `${String(feet)} ft`;

const TABLES: readonly VolumeTable[] = [
  {
    id: 'round',
    caption: 'Round pools',
    note: 'Measured across the inside of the wall. The depth is the water’s, which sits below the top of the wall.',
    columns: LEVEL,
    rows: ROUND.map((across) =>
      rowOf(`${String(across)} ft round`, { shape: 'round', length: ft(across) }, LEVEL),
    ),
  },
  {
    id: 'oval',
    caption: 'Oval pools',
    note: 'Worked out as a true oval (an ellipse). An oval with straight sides, two half circles joined by straight walls, holds more: for one, use the calculator with its own measurements.',
    columns: LEVEL,
    rows: OVAL.map(([width, length]) =>
      rowOf(
        `${String(width)} x ${String(length)} ft oval`,
        { shape: 'oval', length: ft(length), width: ft(width) },
        LEVEL,
      ),
    ),
  },
  {
    id: 'rectangle',
    caption: 'Rectangle pools',
    note: 'A sloped pool is worked out with a straight slope from the shallow end to the deep end. For a bottom of another shape, use the calculator with your own depths.',
    columns: SLOPED,
    rows: RECTANGLE.map(([width, length]) =>
      rowOf(
        `${String(width)} x ${String(length)} ft`,
        { length: ft(length), width: ft(width) },
        SLOPED,
      ),
    ),
  },
];

/** The cell of the row `label` of the table `id` at the middle depth, for the lead. */
const at = (id: string, label: string): string => {
  const found = TABLES.find((table) => table.id === id)?.rows.find((row) => row.label === label)
    ?.cells[MIDDLE];
  if (found === undefined) throw new Error(`no ${label} in the ${id} table`);
  return found;
};

/** The gallons in a 1 ft by 1 ft by 1 ft pool of a shape: the factor of the rule of thumb. */
const ONE = { length: '1 ft', width: '1 ft', shallow: '1 ft', deep: '1 ft' } as const;
const FACTORS = {
  cubicFoot: amountText(gallonsOf(ONE), 2),
  round: amountText(gallonsOf({ ...ONE, shape: 'round' }), 1),
} as const;

/** The volume chart in one language: its tables, worked out once, and the copy around them. */
export interface VolumeChart {
  readonly path: string;
  readonly checked: string;
  readonly card: { readonly title: string; readonly summary: string };
  readonly title: string;
  readonly description: string;
  readonly h1: string;
  readonly lead: string;
  readonly tables: readonly VolumeTable[];
  readonly factors: { readonly cubicFoot: string; readonly round: string };
  readonly assumptions: readonly string[];
  readonly shortcuts: readonly string[];
  readonly calculator: { readonly href: string; readonly label: string };
  readonly method: string;
  readonly source: GuideSource;
  readonly cite: { readonly url: string; readonly text: string };
  /** The headings and lines of the page around the tables. */
  readonly page: {
    readonly kicker: string;
    readonly notHere: string;
    /** The line before and after the link to the dosing chart. */
    readonly doses: string;
    readonly dosesAfter: string;
    /** The name of the scrolling region of a table, by its caption. */
    readonly region: (caption: string) => string;
    readonly size: string;
    /** The average depth of a sloped column, as its head prints it. */
    readonly average: (average: string) => string;
    readonly calculator: string;
    readonly open: string;
    /** The accessible name of a row's calculator link, by its label. */
    readonly openLabel: (label: string) => string;
    readonly gallons: string;
    readonly assumptionsHeading: string;
    readonly shortcuts: string;
    readonly method: string;
    readonly methodAfter: string;
    readonly source: string;
    readonly citeHeading: string;
    readonly citeText: string;
    readonly note: string;
  };
}

const H1 = 'Pool volume chart: gallons by size and shape';
const PATH = '/pool-volume-chart';

/** NIST's gallon, as the methodology cites it (`chart.test.ts`). */
const SOURCE = {
  name: 'NIST Handbook 44, Appendix C: one US gallon is 231 cubic inches',
  url: 'https://www.nist.gov/pml/owm/nist-handbook-44-current-edition',
} as const satisfies GuideSource;

/**
 * The gallons of the common round, oval and rectangle pools at the depths they come in, in one
 * chart: each cell is the volume calculator run at build time, so no number here is typed by hand.
 */
export const VOLUME_CHART = {
  path: PATH,
  /** The day the factors were last checked against their source. */
  checked: '2026-11-05',
  card: {
    title: 'Pool volume chart',
    summary: 'Gallons of round, oval and rectangle pools, 12 to 33 ft, at common depths.',
  },
  title: 'Pool Volume Chart: Gallons by Size and Shape | Pool Figures',
  description:
    'How many gallons a round pool of 12 to 33 ft, an oval or a rectangle of 12 x 24 to 20 x 40 ft holds at its common depths, worked out by the volume calculator.',
  h1: H1,
  lead: `A 24 ft round pool 4 ft deep holds ${at('round', '24 ft round')} gallons, a 15 x 30 ft oval 4 ft deep holds ${at('oval', '15 x 30 ft oval')}, and a 16 x 32 ft rectangle from 3 ft to 6 ft deep holds ${at('rectangle', '16 x 32 ft')}. Each figure is the surface of the pool times its average depth, at ${FACTORS.cubicFoot} gallons a cubic foot.`,
  tables: TABLES,
  factors: FACTORS,
  assumptions: [
    'The average depth is half of the shallow end plus the deep end: a pool from 3 ft to 6 ft is worked out at 4 ft 6 in all over.',
    `A cubic foot is 1,728 cubic inches and a US gallon is 231, so a cubic foot holds ${FACTORS.cubicFoot} gallons.`,
    'A round pool’s surface is π × diameter² ÷ 4; an oval’s is π × length × width ÷ 4; a rectangle’s is length × width.',
    'Every figure is rounded to the gallon, and measured inside the walls.',
  ],
  shortcuts: [
    `Rectangle: length × width × average depth × ${FACTORS.cubicFoot}.`,
    `Round: diameter × diameter × average depth × ${FACTORS.round}.`,
    `Oval: length × width × average depth × ${FACTORS.round}.`,
  ],
  calculator: { href: VOLUME_TEXTS.path, label: 'Work out your own pool' },
  method: '/methodology#volume',
  source: SOURCE,
  cite: {
    url: canonicalUrl(PATH, SITE.origin),
    text: `Pool Figures, “${H1}”, updated November 2026.`,
  },
  page: {
    kicker: 'Chart · gallons by pool size',
    notHere: 'Your size is not here?',
    doses: 'Once you know the gallons, the',
    dosesAfter: 'gives the dose of each chemical.',
    region: (caption: string) => `${caption} table`,
    size: 'Size',
    average: (average: string) => `(average ${average})`,
    calculator: 'Calculator',
    open: 'Open',
    openLabel: (label: string) => `Open the ${label} pool in the calculator`,
    gallons: 'US gallons.',
    assumptionsHeading: 'How the gallons are worked out',
    shortcuts: 'The same figures in your head, close enough for a dose:',
    method: 'How it is worked out',
    methodAfter: ', with the cases worked by hand.',
    source: 'Source:',
    citeHeading: 'Cite this chart',
    citeText:
      'Every figure is worked out by this site’s volume calculator when the page is built. To cite it:',
    note: 'Every figure is an estimate for a pool of the shape and depths its table names. Measure your own pool inside the walls for the closest figure.',
  },
} as const satisfies VolumeChart;
