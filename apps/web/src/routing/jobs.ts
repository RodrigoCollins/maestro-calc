import { LOCALES } from './routes.ts';
import type { CalculatorPageId } from './templates.ts';

/*
 * The job pages (growth plan, lever 1): one page per common job, whose table the calculator works
 * out at build time: concrete for a slab or a tube, roof pitch for a pitch in 12, square footage for
 * a common room or area. A job id is also
 * its `ROUTES` id, under the hub of its calculator; the page copy is its `page.<id>.*` keys of the
 * `site` catalogs, and every figure comes from the engine. Adding a job is one row here, its route
 * and its keys.
 */

/** One case of a job: the raw inputs of the calculator, as a visitor would type them. */
export type JobCase = Readonly<Record<string, string>>;

export interface Job {
  /** The calculator that works the figures out; the page links to it, prefilled with each case. */
  readonly calculator: Extract<CalculatorPageId, 'concrete' | 'roof-pitch' | 'rectangle-area'>;
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
