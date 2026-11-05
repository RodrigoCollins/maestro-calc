import { LOCALES } from './routes.ts';
import type { CalculatorPageId } from './templates.ts';

/*
 * The job pages (growth plan, lever 1): one page per common job, whose table the calculator works
 * out at build time: concrete for a slab (by its sides or by its area) or a tube, roof pitch for a
 * pitch in 12, square footage for a common room or area, the bags of mulch in a cubic yard, the
 * gravel for a driveway, the paint and the drywall for a room, the topsoil for a raised bed or an
 * area, and the shingles for a roof. A job id is also its `ROUTES` id, under the hub of its calculator; the page copy is its `page.<id>.*` keys of the
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
  >;
  /** The day the row was last checked: the page shows it. */
  readonly updated: string;
  /** The cases of the table, the one the page answers first; every case has the same keys. */
  readonly cases: readonly [JobCase, ...JobCase[]];
}

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
  'concrete-slab-12x12': {
    calculator: 'concrete',
    updated: '2026-11-03',
    cases: [slab(12, 12, 4), slab(12, 12, 5), slab(12, 12, 6)],
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
  'roof-pitch-3-12': { calculator: 'roof-pitch', updated: '2026-11-04', cases: pitch(3) },
  'roof-pitch-4-12': { calculator: 'roof-pitch', updated: '2026-11-04', cases: pitch(4) },
  'roof-pitch-5-12': { calculator: 'roof-pitch', updated: '2026-11-04', cases: pitch(5) },
  'roof-pitch-6-12': { calculator: 'roof-pitch', updated: '2026-11-04', cases: pitch(6) },
  'roof-pitch-7-12': { calculator: 'roof-pitch', updated: '2026-11-04', cases: pitch(7) },
  'roof-pitch-8-12': { calculator: 'roof-pitch', updated: '2026-11-04', cases: pitch(8) },
  'roof-pitch-9-12': { calculator: 'roof-pitch', updated: '2026-11-04', cases: pitch(9) },
  'roof-pitch-10-12': { calculator: 'roof-pitch', updated: '2026-11-04', cases: pitch(10) },
  'roof-pitch-12-12': { calculator: 'roof-pitch', updated: '2026-11-04', cases: pitch(12) },
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
  'paint-room-10x10': { calculator: 'paint', updated: '2026-11-04', cases: room(10, 10) },
  'paint-room-10x12': { calculator: 'paint', updated: '2026-11-04', cases: room(10, 12) },
  'paint-room-12x12': { calculator: 'paint', updated: '2026-11-04', cases: room(12, 12) },
  'drywall-room-10x10': { calculator: 'drywall', updated: '2026-11-04', cases: room(10, 10) },
  'drywall-room-10x12': { calculator: 'drywall', updated: '2026-11-04', cases: room(10, 12) },
  'drywall-room-12x12': { calculator: 'drywall', updated: '2026-11-04', cases: room(12, 12) },
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
  'roofing-12x16': { calculator: 'roofing', updated: '2026-11-05', cases: roof(12, 16) },
  'roofing-24x24': { calculator: 'roofing', updated: '2026-11-05', cases: roof(24, 24) },
  'roofing-30x40': { calculator: 'roofing', updated: '2026-11-05', cases: roof(30, 40) },
  'roofing-30x50': { calculator: 'roofing', updated: '2026-11-05', cases: roof(30, 50) },
} as const satisfies Record<string, Job>;

export type JobId = keyof typeof JOBS;

/** Whether `id` is a job page id. */
export const isJobPage = (id: string): id is JobId => Object.hasOwn(JOBS, id);

/** The job ids, in table order. */
export const JOB_IDS: readonly JobId[] = Object.keys(JOBS).filter(isJobPage);

/** The jobs a calculator page works out, in table order: its hub lists them. */
export const jobsOf = (calculator: CalculatorPageId): JobId[] =>
  JOB_IDS.filter((id) => JOBS[id].calculator === calculator);

/** The day of every job page, keyed `<locale>/<id>` like the content entries: `check:site` reads it. */
export const JOB_UPDATES: Readonly<Record<string, string>> = Object.fromEntries(
  JOB_IDS.flatMap((id) => LOCALES.map((locale) => [`${locale}/${id}`, JOBS[id].updated])),
);
