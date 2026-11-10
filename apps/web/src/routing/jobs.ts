import { LOCALES } from './routes.ts';
import type { CalculatorPageId } from './templates.ts';

/*
 * The job pages (growth plan, lever 1): one page per common job, whose table the calculator works
 * out at build time: concrete for a slab (by its sides or by its area), a tube or a footing, roof pitch for a
 * pitch in 12, square footage for a common room or area or a lot of land in acres, the bags of mulch in a cubic yard, the
 * gravel for a driveway, the paint and the drywall for a room, the topsoil for a raised bed or an
 * area, the shingles for a roof, a tape measurement divided into equal parts, decimal feet in feet and inches, and square feet in square meters. A job id is also its `ROUTES` id, under the hub of its calculator; the page copy is its `page.<id>.*` keys of the
 * `site` catalogs, and every figure comes from the engine. Adding a job is one row here, its route
 * and its keys.
 */

/** One case of a job: the raw inputs of the calculator, as a visitor would type them. */
export type JobCase = Readonly<Record<string, string>>;

export interface Job {
  /** The calculator that works the figures out; the page links to it, prefilled with each case. */
  readonly calculator: Extract<
    CalculatorPageId,
    | 'concrete'
    | 'roof-pitch'
    | 'rectangle-area'
    | 'mulch'
    | 'gravel'
    | 'paint'
    | 'drywall'
    | 'topsoil'
    | 'roofing'
    | 'feet-inches'
    | 'board-feet'
    | 'fence'
  >;
  /** The day the row was last checked: the page shows it. */
  readonly updated: string;
  /** The cases of the table, the one the page answers first; every case has the same keys. */
  readonly cases: readonly [JobCase, ...JobCase[]];
}

/** A run of fence `length` feet long, at the fence calculator's other defaults. */
const run = (length: number): JobCase => ({ length: `${String(length)}ft` });

const slab = (length: number, width: number, thickness: number): JobCase => ({
  length: `${String(length)}ft`,
  width: `${String(width)}ft`,
  thickness: `${String(thickness)}in`,
});

const tube = (diameter: number, depth: number): JobCase => ({
  shape: 'column',
  diameter: `${String(diameter)}in`,
  height: `${String(depth)}in`,
});

/**
 * A continuous footing `footingWidth` by `footingDepth` inches, 20, 50 and 100 ft long: one wall, a
 * shed and a garage perimeter, one piece each.
 */
const footing = (footingWidth: number, footingDepth: number) => {
  const long = (length: number): JobCase => ({
    shape: 'footing',
    length: `${String(length)}ft`,
    footingWidth: `${String(footingWidth)}in`,
    footingDepth: `${String(footingDepth)}in`,
  });
  return [long(20), long(50), long(100)] as const;
};

/**
 * A slab of so many square feet, as the calculator takes it: a rectangle of `length` by `width` feet
 * whose product is the area (the jobs test holds it to the id), 4, 5 and 6 in thick. Any rectangle
 * of that area takes the same concrete.
 */
const slabOfArea = (length: number, width: number) =>
  [slab(length, width, 4), slab(length, width, 5), slab(length, width, 6)] as const;

/**
 * One cubic yard of mulch in a bag of `bag` cubic feet (the select's option id): a bed of 9 by 9 ft,
 * 4 in deep, is 27 cubic feet, and no extra is added, so the bag count is the yard's alone.
 */
const yardOfMulch = (bag: string): JobCase => ({
  length: '9ft',
  width: '9ft',
  depth: '4in',
  waste: '0',
  bag,
});

/**
 * A driveway of `length` by `width` feet, 4, 6 and 8 in deep: compacted with 5% extra, the gravel
 * calculator's defaults, so the case names only the sizes.
 */
const driveway = (length: number, width: number) => {
  const deep = (depth: number): JobCase => ({
    length: `${String(length)}ft`,
    width: `${String(width)}ft`,
    depth: `${String(depth)}in`,
  });
  return [deep(4), deep(6), deep(8)] as const;
};

/**
 * One cubic yard of gravel, 9 ft by 9 ft and 4 in deep (27 cubic feet), with no extra, placed as
 * `placement`: the cubic yard weight chart opens the gravel calculator on it.
 */
const yardOfGravel = (placement: 'compacted' | 'loose'): JobCase => ({
  length: '9ft',
  width: '9ft',
  depth: '4in',
  placement,
  waste: '0',
});

/**
 * A room of `length` by `width` feet with walls 8, 9 and 10 ft high: one door and two windows, as
 * the paint and the drywall calculators default to, so the case names only the sizes.
 */
const room = (length: number, width: number) => {
  const high = (height: number): JobCase => ({
    length: `${String(length)}ft`,
    width: `${String(width)}ft`,
    height: `${String(height)}ft`,
  });
  return [high(8), high(9), high(10)] as const;
};

/**
 * A bed or an area of `length` by `width` feet at each of `depths` inches: 10% extra for settling
 * and bags of 0.75 cu ft, the topsoil calculator's defaults, so the case names only the sizes.
 */
const soil = (length: number, width: number, depths: readonly [number, number, number]) => {
  const deep = (depth: number): JobCase => ({
    length: `${String(length)}ft`,
    width: `${String(width)}ft`,
    depth: `${String(depth)}in`,
  });
  return [deep(depths[0]), deep(depths[1]), deep(depths[2])] as const;
};

/** A raised bed filled 12, 18 and 24 in deep. */
const raisedBed = (length: number, width: number) => soil(length, width, [12, 18, 24]);

/** A lawn or garden area spread 4 in deep (the calculator's default), then 6 and 8 in. */
const area = (length: number, width: number) => soil(length, width, [4, 6, 8]);

/**
 * A roof over a footprint of `length` by `width` feet, overhangs included, at 6 in 12 (the roofing
 * calculator's default), then 8 and 10 in 12; 10% extra, its default, so the case names only the
 * sizes and the pitch.
 */
const roof = (length: number, width: number) => {
  const pitched = (pitch: number): JobCase => ({
    length: `${String(length)}ft`,
    width: `${String(width)}ft`,
    pitch: String(pitch),
  });
  return [pitched(6), pitched(8), pitched(10)] as const;
};

/** The rafter runs (half the span) of a roof pitch table, in feet. */
const RAFTER_RUNS = [8, 10, 12, 14, 16] as const;

/**
 * A roof pitch of `rise` in 12: one case per rafter run, with no overhang, so each rafter length is
 * the run times the multiplier of the pitch.
 */
const pitch = (rise: number) => {
  const run = (rafterRun: number): JobCase => ({
    rise: `${String(rise)}in`,
    run: '12in',
    rafterRun: `${String(rafterRun)}ft`,
    overhang: '0in',
  });
  const [first, ...rest] = RAFTER_RUNS;
  return [run(first), ...rest.map(run)] as const;
};

/** The rises of the roof pitch chart: every whole pitch from 1 to 24 in 12, and 7 1/2 (a job page). */
const CHART_RISES = [...Array.from({ length: 24 }, (_, index) => index + 1), 7.5].toSorted(
  (a, b) => a - b,
);

/** Every pitch of the chart as a rise over a 12 in run, smallest first. */
const pitchChart = () => {
  const pitched = (rise: number): JobCase => ({ rise: `${String(rise)}in`, run: '12in' });
  const [, ...rest] = CHART_RISES;
  return [pitched(1), ...rest.map(pitched)] as const;
};

/**
 * A tape measurement `first` (as a visitor types it: `29 1/4 in`, `9 ft 6 in`) divided by `factor`,
 * the number of the query, then by the others of 2, 3 and 4: halves, thirds and quarters.
 */
const divide = (first: string, factor: number) => {
  const by = (each: number): JobCase => ({ first, operation: 'divide', factor: String(each) });
  return [by(factor), ...[2, 3, 4].filter((each) => each !== factor).map(by)] as const;
};

/**
 * The lengths of the decimal feet chart: every hundredth of a foot from 0.10 to 0.99, then common
 * decimal lengths (11.65 ft is a query), smallest first.
 */
const DECIMAL_FEET = [
  ...Array.from({ length: 90 }, (_, index) => (10 + index) / 100),
  1.25,
  1.5,
  1.75,
  2.5,
  3.33,
  4.75,
  5.5,
  6.25,
  7.5,
  8.33,
  10.5,
  11.65,
];

/**
 * Each length of the chart times 1, typed in decimal feet (`0.10`, a plain number is read in feet):
 * the feet and inches calculator writes it back in feet, inches and sixteenths.
 */
const decimalFeetChart = () => {
  const once = (feet: number): JobCase => ({
    first: feet.toFixed(2),
    operation: 'multiply',
    factor: '1',
  });
  const [first = 0.1, ...rest] = DECIMAL_FEET;
  return [once(first), ...rest.map(once)] as const;
};

/**
 * The areas of the square feet to square meters chart, smallest first: small rooms and closets,
 * bedrooms and rugs (188 ft² is a query), then floors and houses up to 2,000 ft².
 */
const SQUARE_FEET = [
  10, 20, 25, 30, 40, 50, 60, 64, 70, 75, 80, 90, 100, 120, 144, 150, 160, 168, 180, 188, 200, 225,
  250, 300, 350, 400, 450, 500, 600, 700, 750, 800, 900, 1000, 1200, 1250, 1500, 1750, 2000,
];

/**
 * Each area of the chart as a strip that many feet long and 1 ft wide: the square footage engine
 * works its square meters out (any rectangle of that area has the same).
 */
const squareMetersChart = () => {
  const strip = (area: number): JobCase => ({ length: `${String(area)}ft`, width: '1ft' });
  const [first = 10, ...rest] = SQUARE_FEET;
  return [strip(first), ...rest.map(strip)] as const;
};

/**
 * A rectangle of `length` by `width` feet, then the same length a foot and two feet wider: the
 * sizes a tape reads when the room is a little larger than its plan.
 */
const rectangle = (length: number, width: number) => {
  const side = (extra: number): JobCase => ({
    length: `${String(length)}ft`,
    width: `${String(width + extra)}ft`,
  });
  return [side(0), side(1), side(2)] as const;
};

/**
 * A box of `length` by `width` feet and `depth` inches with no extra, as the topsoil calculator
 * takes it: the question pages measure the volume itself, not an order.
 */
const box = (length: number, width: number, depth: number): JobCase => ({
  length: `${String(length)}ft`,
  width: `${String(width)}ft`,
  depth: `${String(depth)}in`,
  waste: '0',
});

/** The same box of loose gravel, the way the yard measures what it sells, with no extra. */
const loosePile = (length: number, width: number, depth: number): JobCase => ({
  ...box(length, width, depth),
  placement: 'loose',
});

/** A pad, a bed or a floor of `length` by `width` feet at `depth` inches, at the calculator's defaults. */
const pad = (length: number, width: number, depth: number): JobCase => ({
  length: `${String(length)}ft`,
  width: `${String(width)}ft`,
  depth: `${String(depth)}in`,
});

/** A floor of `length` by `width` feet, for the square footage calculator. */
const floor = (length: number, width: number): JobCase => ({
  length: `${String(length)}ft`,
  width: `${String(width)}ft`,
});

/** The stock lengths of lumber the board feet pages tabulate, in feet. */
const LUMBER_LENGTHS = [8, 10, 12, 14, 16] as const;

/**
 * A piece of lumber of nominal `thickness` by `width` inches, `first` feet long (the length of the
 * query), then the other stock lengths: the board feet engine takes the nominal size, as the
 * American Softwood Lumber Standard counts board measure.
 */
const lumber = (thickness: number, width: number, first: (typeof LUMBER_LENGTHS)[number]) => {
  const piece = (length: number): JobCase => ({
    thickness: `${String(thickness)}in`,
    width: `${String(width)}in`,
    length: `${String(length)}ft`,
  });
  return [piece(first), ...LUMBER_LENGTHS.filter((each) => each !== first).map(piece)] as const;
};

/** Square feet in one acre: NIST Handbook 44, Appendix C (1 acre = 43,560 ft² = 160 rods²). */
export const ACRE_FT2 = 43_560;

/**
 * A lot of land as rectangles of `length` by `width` feet, each exactly its acres: the first one
 * chain (66 ft) deep, the surveyor's unit the acre is built on (1 acre = 1 chain × 1 furlong).
 */
const lots = (first: readonly [66, number], ...others: (readonly [number, number])[]) => {
  const lot = ([length, width]: readonly [number, number]): JobCase => ({
    length: `${String(length)}ft`,
    width: `${String(width)}ft`,
  });
  return [lot(first), ...others.map(lot)] as const;
};

/**
 * The slab sizes of the concrete chart, smallest area first: every size of a slab job, the 4 ft pad,
 * and the common sizes between and beyond them (a walk, a shed, a two-car garage).
 */
const CHART_SLABS = [
  [4, 4],
  [6, 6],
  [8, 8],
  [10, 10],
  [10, 12],
  [12, 12],
  [10, 20],
  [12, 20],
  [16, 16],
  [12, 24],
  [20, 20],
  [24, 24],
  [30, 30],
] as const;

/** Every slab of the chart at 4, 5 and 6 in thick, in that order. */
const slabChart = () => {
  const [[length, width], ...rest] = CHART_SLABS;
  return [
    slab(length, width, 4),
    slab(length, width, 5),
    slab(length, width, 6),
    ...rest.flatMap(([others, wide]) =>
      [4, 5, 6].map((thickness) => slab(others, wide, thickness)),
    ),
  ] as const;
};

export const JOBS = {
  'concrete-slab-10x10': {
    calculator: 'concrete',
    updated: '2026-11-03',
    cases: [slab(10, 10, 4), slab(10, 10, 5), slab(10, 10, 6)],
  },
  'concrete-slab-10x12': {
    calculator: 'concrete',
    updated: '2026-11-04',
    cases: [slab(10, 12, 4), slab(10, 12, 5), slab(10, 12, 6)],
  },
  'concrete-slab-10x20': {
    calculator: 'concrete',
    updated: '2026-11-05',
    cases: [slab(10, 20, 4), slab(10, 20, 5), slab(10, 20, 6)],
  },
  'concrete-slab-12x12': {
    calculator: 'concrete',
    updated: '2026-11-03',
    cases: [slab(12, 12, 4), slab(12, 12, 5), slab(12, 12, 6)],
  },
  'concrete-slab-12x20': {
    calculator: 'concrete',
    updated: '2026-11-05',
    cases: [slab(12, 20, 4), slab(12, 20, 5), slab(12, 20, 6)],
  },
  'concrete-slab-12x24': {
    calculator: 'concrete',
    updated: '2026-11-05',
    cases: [slab(12, 24, 4), slab(12, 24, 5), slab(12, 24, 6)],
  },
  'concrete-slab-20x20': {
    calculator: 'concrete',
    updated: '2026-11-04',
    cases: [slab(20, 20, 4), slab(20, 20, 5), slab(20, 20, 6)],
  },
  'concrete-slab-24x24': {
    calculator: 'concrete',
    updated: '2026-11-04',
    cases: [slab(24, 24, 4), slab(24, 24, 5), slab(24, 24, 6)],
  },
  'concrete-slab-500-sq-ft': {
    calculator: 'concrete',
    updated: '2026-11-04',
    cases: slabOfArea(25, 20),
  },
  'concrete-slab-650-sq-ft': {
    calculator: 'concrete',
    updated: '2026-11-04',
    cases: slabOfArea(26, 25),
  },
  'concrete-slab-1000-sq-ft': {
    calculator: 'concrete',
    updated: '2026-11-04',
    cases: slabOfArea(40, 25),
  },
  'concrete-slab-chart': {
    calculator: 'concrete',
    updated: '2026-11-05',
    cases: slabChart(),
  },
  'concrete-pad-4x4': {
    calculator: 'concrete',
    updated: '2026-11-04',
    cases: [slab(4, 4, 4), slab(4, 4, 5), slab(4, 4, 6)],
  },
  'concrete-tube-8': {
    calculator: 'concrete',
    updated: '2026-11-04',
    cases: [tube(8, 24), tube(8, 36), tube(8, 48)],
  },
  'concrete-tube-10': {
    calculator: 'concrete',
    updated: '2026-11-04',
    cases: [tube(10, 24), tube(10, 36), tube(10, 48)],
  },
  'concrete-tube-12': {
    calculator: 'concrete',
    updated: '2026-11-03',
    cases: [tube(12, 24), tube(12, 36), tube(12, 48)],
  },
  'concrete-footing-16x8': {
    calculator: 'concrete',
    updated: '2026-11-05',
    cases: footing(16, 8),
  },
  'concrete-footing-20x10': {
    calculator: 'concrete',
    updated: '2026-11-05',
    cases: footing(20, 10),
  },
  'concrete-cubic-yard-weight': {
    calculator: 'concrete',
    updated: '2026-11-08',
    cases: [slab(10, 16, 4), slab(8, 8, 4), slab(14, 14, 4), slab(16, 24, 4), slab(24, 36, 6)],
  },
  // the sizes people price (Ahrefs US, 2026-11-08: 30x30, 20x20, 30x40, 40x60 slab cost), 4 in
  'concrete-slab-cost': {
    calculator: 'concrete',
    updated: '2026-11-09',
    cases: [
      slab(10, 10, 4),
      slab(12, 12, 4),
      slab(20, 20, 4),
      slab(24, 24, 4),
      slab(30, 30, 4),
      slab(30, 40, 4),
      slab(40, 60, 4),
    ],
  },
  'roof-pitch-2-12': { calculator: 'roof-pitch', updated: '2026-11-08', cases: pitch(2) },
  'roof-pitch-3-12': { calculator: 'roof-pitch', updated: '2026-11-04', cases: pitch(3) },
  'roof-pitch-4-12': { calculator: 'roof-pitch', updated: '2026-11-04', cases: pitch(4) },
  'roof-pitch-5-12': { calculator: 'roof-pitch', updated: '2026-11-04', cases: pitch(5) },
  'roof-pitch-6-12': { calculator: 'roof-pitch', updated: '2026-11-04', cases: pitch(6) },
  'roof-pitch-7-12': { calculator: 'roof-pitch', updated: '2026-11-04', cases: pitch(7) },
  'roof-pitch-7-5-12': { calculator: 'roof-pitch', updated: '2026-11-05', cases: pitch(7.5) },
  'roof-pitch-8-12': { calculator: 'roof-pitch', updated: '2026-11-04', cases: pitch(8) },
  'roof-pitch-9-12': { calculator: 'roof-pitch', updated: '2026-11-04', cases: pitch(9) },
  'roof-pitch-10-12': { calculator: 'roof-pitch', updated: '2026-11-04', cases: pitch(10) },
  'roof-pitch-11-12': { calculator: 'roof-pitch', updated: '2026-11-08', cases: pitch(11) },
  'roof-pitch-12-12': { calculator: 'roof-pitch', updated: '2026-11-04', cases: pitch(12) },
  'roof-pitch-chart': { calculator: 'roof-pitch', updated: '2026-11-05', cases: pitchChart() },
  'square-feet-5x5': {
    calculator: 'rectangle-area',
    updated: '2026-11-04',
    cases: rectangle(5, 5),
  },
  'square-feet-5x10': {
    calculator: 'rectangle-area',
    updated: '2026-11-04',
    cases: rectangle(5, 10),
  },
  'square-feet-7x12': {
    calculator: 'rectangle-area',
    updated: '2026-11-04',
    cases: rectangle(7, 12),
  },
  'square-feet-10x10': {
    calculator: 'rectangle-area',
    updated: '2026-11-04',
    cases: rectangle(10, 10),
  },
  'square-feet-10x12': {
    calculator: 'rectangle-area',
    updated: '2026-11-04',
    cases: rectangle(10, 12),
  },
  'square-feet-11x14': {
    calculator: 'rectangle-area',
    updated: '2026-11-04',
    cases: rectangle(11, 14),
  },
  'square-feet-11x16': {
    calculator: 'rectangle-area',
    updated: '2026-11-04',
    cases: rectangle(11, 16),
  },
  'square-feet-12x12': {
    calculator: 'rectangle-area',
    updated: '2026-11-04',
    cases: rectangle(12, 12),
  },
  'square-feet-12x14': {
    calculator: 'rectangle-area',
    updated: '2026-11-04',
    cases: rectangle(12, 14),
  },
  'square-feet-12x30': {
    calculator: 'rectangle-area',
    updated: '2026-11-04',
    cases: rectangle(12, 30),
  },
  'square-feet-20x20': {
    calculator: 'rectangle-area',
    updated: '2026-11-04',
    cases: rectangle(20, 20),
  },
  'square-feet-in-an-acre': {
    calculator: 'rectangle-area',
    updated: '2026-11-08',
    cases: lots([66, 660], [100, 435.6], [132, 330], [165, 264], [198, 220]),
  },
  'square-feet-in-a-half-acre': {
    calculator: 'rectangle-area',
    updated: '2026-11-08',
    cases: lots([66, 330], [99, 220], [110, 198], [121, 180], [132, 165]),
  },
  'square-feet-in-a-quarter-acre': {
    calculator: 'rectangle-area',
    updated: '2026-11-08',
    cases: lots([66, 165], [75, 145.2], [90, 121], [99, 110]),
  },
  'square-feet-1-car-garage': {
    calculator: 'rectangle-area',
    updated: '2026-11-08',
    cases: [floor(12, 20), floor(12, 24), floor(14, 22), floor(14, 24), floor(16, 24)],
  },
  'square-feet-2-car-garage': {
    calculator: 'rectangle-area',
    updated: '2026-11-08',
    cases: [floor(24, 24), floor(20, 20), floor(20, 24), floor(22, 22), floor(22, 24)],
  },
  'square-feet-to-square-meters-chart': {
    calculator: 'rectangle-area',
    updated: '2026-11-06',
    cases: squareMetersChart(),
  },
  'mulch-bags-per-yard': {
    calculator: 'mulch',
    updated: '2026-11-04',
    cases: [yardOfMulch('1-5'), yardOfMulch('2'), yardOfMulch('3')],
  },
  'gravel-driveway-10x20': {
    calculator: 'gravel',
    updated: '2026-11-04',
    cases: driveway(10, 20),
  },
  'gravel-driveway-12x50': {
    calculator: 'gravel',
    updated: '2026-11-04',
    cases: driveway(12, 50),
  },
  'gravel-driveway-12x100': {
    calculator: 'gravel',
    updated: '2026-11-05',
    cases: driveway(12, 100),
  },
  'cubic-yards-to-tons': {
    calculator: 'gravel',
    updated: '2026-11-08',
    cases: [
      loosePile(9, 9, 4),
      loosePile(9, 9, 8),
      loosePile(9, 9, 12),
      loosePile(15, 9, 12),
      loosePile(18, 15, 12),
    ],
  },
  'cubic-yards-in-a-ton-of-gravel': {
    calculator: 'gravel',
    updated: '2026-11-08',
    cases: [pad(8, 10, 4), pad(10, 10, 4), pad(12, 12, 4), pad(12, 16, 4), pad(16, 20, 4)],
  },
  'cubic-yard-weight-chart': {
    calculator: 'gravel',
    updated: '2026-11-05',
    cases: [yardOfGravel('compacted'), yardOfGravel('loose')],
  },
  'paint-room-10x10': { calculator: 'paint', updated: '2026-11-04', cases: room(10, 10) },
  'paint-room-10x12': { calculator: 'paint', updated: '2026-11-04', cases: room(10, 12) },
  'paint-room-12x12': { calculator: 'paint', updated: '2026-11-04', cases: room(12, 12) },
  'paint-room-12x14': { calculator: 'paint', updated: '2026-11-05', cases: room(12, 14) },
  'paint-room-12x16': { calculator: 'paint', updated: '2026-11-05', cases: room(12, 16) },
  'drywall-room-10x10': { calculator: 'drywall', updated: '2026-11-04', cases: room(10, 10) },
  'drywall-room-10x12': { calculator: 'drywall', updated: '2026-11-04', cases: room(10, 12) },
  'drywall-room-12x12': { calculator: 'drywall', updated: '2026-11-04', cases: room(12, 12) },
  'drywall-room-12x14': { calculator: 'drywall', updated: '2026-11-05', cases: room(12, 14) },
  'drywall-room-12x16': { calculator: 'drywall', updated: '2026-11-05', cases: room(12, 16) },
  'topsoil-raised-bed-4x4': {
    calculator: 'topsoil',
    updated: '2026-11-05',
    cases: raisedBed(4, 4),
  },
  'topsoil-raised-bed-4x8': {
    calculator: 'topsoil',
    updated: '2026-11-05',
    cases: raisedBed(4, 8),
  },
  'topsoil-10x10': { calculator: 'topsoil', updated: '2026-11-05', cases: area(10, 10) },
  'topsoil-20x20': { calculator: 'topsoil', updated: '2026-11-05', cases: area(20, 20) },
  'cubic-feet-in-a-cubic-yard': {
    calculator: 'topsoil',
    updated: '2026-11-08',
    cases: [box(9, 9, 4), box(12, 13.5, 2), box(6, 6, 9), box(4.5, 4.5, 16), box(3, 4.5, 24)],
  },
  'cubic-feet-to-gallons': {
    calculator: 'topsoil',
    updated: '2026-11-08',
    cases: [box(2, 2, 12), box(2, 6, 12), box(3, 6, 12), box(4, 10, 12), box(4, 12, 18)],
  },
  'cubic-yards-in-a-ton-of-dirt': {
    calculator: 'topsoil',
    updated: '2026-11-08',
    cases: [pad(4, 6, 12), pad(10, 12, 4), pad(12, 20, 4), pad(20, 30, 4), pad(25, 40, 2)],
  },
  'roofing-12x16': { calculator: 'roofing', updated: '2026-11-05', cases: roof(12, 16) },
  'roofing-24x24': { calculator: 'roofing', updated: '2026-11-05', cases: roof(24, 24) },
  'roofing-30x40': { calculator: 'roofing', updated: '2026-11-05', cases: roof(30, 40) },
  'roofing-30x50': { calculator: 'roofing', updated: '2026-11-05', cases: roof(30, 50) },
  'divide-29-1-4-in-by-2': {
    calculator: 'feet-inches',
    updated: '2026-11-05',
    cases: divide('29 1/4 in', 2),
  },
  'divide-23-5-8-in-by-2': {
    calculator: 'feet-inches',
    updated: '2026-11-05',
    cases: divide('23 5/8 in', 2),
  },
  'divide-35-5-in-by-2': {
    calculator: 'feet-inches',
    updated: '2026-11-05',
    cases: divide('35.5 in', 2),
  },
  'divide-22-in-by-10': {
    calculator: 'feet-inches',
    updated: '2026-11-05',
    cases: divide('22 in', 10),
  },
  'divide-9-ft-6-in-by-2': {
    calculator: 'feet-inches',
    updated: '2026-11-05',
    cases: divide('9 ft 6 in', 2),
  },
  'divide-3-ft-9-in-by-2': {
    calculator: 'feet-inches',
    updated: '2026-11-05',
    cases: divide('3 ft 9 in', 2),
  },
  'decimal-feet-chart': {
    calculator: 'feet-inches',
    updated: '2026-11-06',
    cases: decimalFeetChart(),
  },
  // Ahrefs US, 2026-11-08: "how many board feet in a 2x4x8" and the other common sizes
  'board-feet-2x4x8': { calculator: 'board-feet', updated: '2026-11-10', cases: lumber(2, 4, 8) },
  'board-feet-2x6x10': { calculator: 'board-feet', updated: '2026-11-10', cases: lumber(2, 6, 10) },
  'board-feet-4x4x8': { calculator: 'board-feet', updated: '2026-11-10', cases: lumber(4, 4, 8) },
  'board-feet-1x6x8': { calculator: 'board-feet', updated: '2026-11-10', cases: lumber(1, 6, 8) },
  'board-feet-2x12x12': {
    calculator: 'board-feet',
    updated: '2026-11-10',
    cases: lumber(2, 12, 12),
  },
  // the lengths a fence is priced at (backlog #46: "fence" is a calculator gap; a cost question
  // answers itself per linear foot): a 6 ft privacy fence, the fence calculator's defaults
  'fence-cost': {
    calculator: 'fence',
    updated: '2026-11-10',
    cases: [run(50), run(100), run(150), run(200)],
  },
} as const satisfies Record<string, Job>;

export type JobId = keyof typeof JOBS;

/** Whether `id` is a job page id. */
export const isJobPage = (id: string): id is JobId => Object.hasOwn(JOBS, id);

/** Whether a job id names a reference chart: it ends in `-chart` (`check:site` reads the rule). */
export const isChartId = (id: string): boolean => id.endsWith('-chart');

/**
 * Whether job `id` is a reference chart: one table of many sizes, made to be linked and cited. Its
 * page shows the table first, its sources and how to cite it; its id ends in `-chart`.
 */
export const isChartJob = (id: string): boolean => isJobPage(id) && isChartId(id);

/** The job ids, in table order. */
export const JOB_IDS: readonly JobId[] = Object.keys(JOBS).filter(isJobPage);

/**
 * The lots of land (the acre pages): each a square footage job of so many acres, whose page adds
 * what an acre is by law, the side of a square that size, what fits on it and what covers it.
 */
export const LAND_ACRES = {
  'square-feet-in-an-acre': 1,
  'square-feet-in-a-half-acre': 0.5,
  'square-feet-in-a-quarter-acre': 0.25,
} as const satisfies Partial<Record<JobId, number>>;

export type LandId = keyof typeof LAND_ACRES;

/** Whether job `id` is a lot of land (an acre page). */
export const isLandJob = (id: string): id is LandId => Object.hasOwn(LAND_ACRES, id);

/**
 * The exact pitch pages: each a roof pitch job of `rise` in 12, whose page adds the OSHA class of
 * the pitch, the ridge height of a gable and the roof surface over a footprint.
 */
export const PITCH_RISES = {
  'roof-pitch-2-12': 2,
  'roof-pitch-3-12': 3,
  'roof-pitch-4-12': 4,
  'roof-pitch-5-12': 5,
  'roof-pitch-6-12': 6,
  'roof-pitch-7-12': 7,
  'roof-pitch-7-5-12': 7.5,
  'roof-pitch-8-12': 8,
  'roof-pitch-9-12': 9,
  'roof-pitch-10-12': 10,
  'roof-pitch-11-12': 11,
  'roof-pitch-12-12': 12,
} as const satisfies Partial<Record<JobId, number>>;

export type PitchId = keyof typeof PITCH_RISES;

/** Whether job `id` is an exact pitch page. */
export const isPitchJob = (id: string): id is PitchId => Object.hasOwn(PITCH_RISES, id);

/**
 * The question pages (Ahrefs US, 2026-11-08: "how many cubic feet in a cubic yard", "cubic yards to
 * tons", "cubic feet to gallons", "how many square feet is a 2 car garage"): each answers one exact
 * question in its h1, works its table out with its calculator's engine, and adds tables of its own
 * (`lib/job-question.ts`) from cited unit definitions and material densities.
 */
export const QUESTION_IDS = [
  'concrete-cubic-yard-weight',
  'concrete-slab-cost',
  'square-feet-1-car-garage',
  'square-feet-2-car-garage',
  'cubic-yards-to-tons',
  'cubic-yards-in-a-ton-of-gravel',
  'cubic-feet-in-a-cubic-yard',
  'cubic-feet-to-gallons',
  'cubic-yards-in-a-ton-of-dirt',
  'fence-cost',
] as const satisfies readonly JobId[];

export type QuestionId = (typeof QUESTION_IDS)[number];

/** Whether job `id` is a question page. */
export const isQuestionJob = (id: string): id is QuestionId =>
  (QUESTION_IDS as readonly string[]).includes(id);

/** A reference chart: a job whose id ends in `-chart`. */
export type ChartId = Extract<JobId, `${string}-chart`>;

const isChart = (id: JobId): id is ChartId => isChartId(id);

/** The reference charts, in table order: the data and charts index lists them. */
export const CHART_IDS: readonly ChartId[] = JOB_IDS.filter(isChart);

/** The jobs a calculator page works out, in table order: its hub lists them. */
export const jobsOf = (calculator: CalculatorPageId): JobId[] =>
  JOB_IDS.filter((id) => JOBS[id].calculator === calculator);

/** The day of every job page, keyed `<locale>/<id>` like the content entries: `check:site` reads it. */
export const JOB_UPDATES: Readonly<Record<string, string>> = Object.fromEntries(
  JOB_IDS.flatMap((id) => LOCALES.map((locale) => [`${locale}/${id}`, JOBS[id].updated])),
);
