import { LOCALES } from './routes.ts';
import type { CalculatorPageId } from './templates.ts';

/*
 * The job pages (growth plan, lever 1): one page per common job, whose table the calculator works
 * out at build time. A job id is also its `ROUTES` id; the page copy is its `page.<id>.*` keys of the
 * `site` catalogs, and every figure comes from the engine. Adding a job is one row here, its route
 * and its keys.
 */

/** One case of a job: the raw inputs of the calculator, as a visitor would type them. */
export type JobCase = Readonly<Record<string, string>>;

export interface Job {
  /** The calculator that works the figures out; the page links to it, prefilled with each case. */
  readonly calculator: Extract<CalculatorPageId, 'concrete'>;
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
