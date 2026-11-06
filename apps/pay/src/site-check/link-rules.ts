import { nearestOf } from '../long-tail/nearest.ts';
import {
  DIFFERENTIALS,
  DOUBLES,
  JOBS,
  MINUTES,
  pathOf,
  PTOS,
  SHIFTS,
  TIPPED,
  type LongTailJob,
} from '../long-tail/routes.ts';
import { ROUTES, type Route } from '../routes.ts';
import type { GuideRule, LongTailRule } from './links.ts';

const LANGS = ['en', 'es'] as const;

const routeOf = (id: string): Route => {
  const route = ROUTES.find((candidate) => candidate.id === id);
  if (route === undefined) throw new Error(`no route ${id}`);
  return route;
};

/** Each family of long-tail pages and the calculator (a route id) its pages answer for. */
const FAMILIES: readonly { calculator: string; members: readonly LongTailJob[] }[] = [
  {
    calculator: 'hourly-to-salary',
    members: JOBS.filter((job) => job.kind === 'convert' && job.per === 'hour'),
  },
  {
    calculator: 'salary-to-hourly',
    members: JOBS.filter((job) => job.kind === 'convert' && job.per === 'year'),
  },
  { calculator: 'time-card', members: JOBS.filter((job) => job.kind === 'overtime') },
  { calculator: 'overtime', members: DOUBLES },
  { calculator: 'hours', members: SHIFTS },
  { calculator: 'pto-accrual', members: PTOS },
  { calculator: 'decimal-hours', members: MINUTES },
  { calculator: 'shift-differential', members: DIFFERENTIALS },
  { calculator: 'tipped-wage', members: TIPPED },
];

/**
 * Every long-tail page: its calculator links it, and it links its calculator and the
 * `NEIGHBORS` pages of its family nearest to it, in its own language.
 */
export const LONG_TAIL_RULES: readonly LongTailRule[] = FAMILIES.flatMap(
  ({ calculator, members }) =>
    members.flatMap((job) =>
      LANGS.map((lang) => ({
        path: pathOf(job, lang),
        calculator: routeOf(calculator)[lang],
        siblings: nearestOf(members, job).map((sibling) => pathOf(sibling, lang)),
      })),
    ),
);

/** The calculators (route ids) each guide (a route id) explains: they link it, and it links them. */
export const GUIDE_CALCULATORS: Readonly<Record<string, readonly string[]>> = {
  'tax-guide': ['no-tax-on-overtime', 'no-tax-on-tips'],
  'overtime-guide': ['overtime'],
  'california-overtime-guide': ['overtime'],
  'pay-stub-guide': ['time-card', 'overtime'],
  'unpaid-wages-guide': ['overtime', 'time-card'],
  'pto-guide': ['pto-accrual'],
  'shift-differential-guide': ['shift-differential'],
  'tip-credit-guide': ['tipped-wage'],
  'tipped-states-guide': ['tipped-wage'],
  'hours-worked-guide': ['hours', 'decimal-hours'],
  'overtime-states-guide': ['overtime'],
  'minimum-wage-states-guide': ['hourly-to-salary', 'salary-to-hourly'],
};

export const GUIDE_RULES: readonly GuideRule[] = Object.entries(GUIDE_CALCULATORS).flatMap(
  ([guide, calculators]) =>
    LANGS.map((lang) => ({
      path: routeOf(guide)[lang],
      calculators: calculators.map((calculator) => routeOf(calculator)[lang]),
    })),
);

/** The home of each language: one of them links every guide. */
export const HUBS: readonly string[] = LANGS.map((lang) => routeOf('home')[lang]);

/** Every page of the sitemap, which is built from the same route table. */
export const SITEMAP_PATHS: readonly string[] = ROUTES.flatMap(({ en, es }) => [en, es]);
