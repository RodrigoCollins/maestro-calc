import { nearestOf } from '../long-tail/nearest.ts';
import {
  DAYS,
  DIFFERENTIALS,
  DOUBLES,
  JOBS,
  LIVE_GROUPS,
  MINUTES,
  pathOf,
  PTOS,
  SHIFTS,
  TIPPED,
  type LongTailJob,
} from '../long-tail/routes.ts';
import { DATA_PAGES } from '../data/pages.ts';
import {
  MILITARY_CHART_PATHS,
  MILITARY_CONVERTER_PATHS,
  MILITARY_TIMES,
  militaryPathOf,
} from '../military/routes.ts';
import { isPaired, pathsOfRoute, ROUTES, type PairedRoute } from '../routes.ts';
import { STATE_ROUTES } from '../states/routes.ts';
import { COUNTDOWNS, countdownPathOf, DAYS_BETWEEN_PATH } from '../dates/routes.ts';
import type { GuideRule, LongTailRule } from './links.ts';

const LANGS = ['en', 'es'] as const;

const routeOf = (id: string): PairedRoute => {
  const route = ROUTES.find((candidate) => candidate.id === id);
  if (route === undefined || !isPaired(route)) throw new Error(`no route pair ${id}`);
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
  { calculator: 'hours', members: DAYS },
  ...LIVE_GROUPS.map((members) => ({ calculator: 'hours', members })),
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

/**
 * Every countdown page (Spanish only): the days-between calculator links it, and it links the
 * calculator and the `NEIGHBORS` countdowns nearest to it in the year.
 */
export const COUNTDOWN_RULES: readonly LongTailRule[] = COUNTDOWNS.map((job) => ({
  path: countdownPathOf(job),
  calculator: DAYS_BETWEEN_PATH,
  siblings: nearestOf(COUNTDOWNS, job).map(countdownPathOf),
}));

/**
 * Every military time page (English only): the converter links it, and it links the converter and
 * the `NEIGHBORS` times nearest to it.
 */
export const MILITARY_RULES: readonly LongTailRule[] = MILITARY_TIMES.map((job) => ({
  path: militaryPathOf(job),
  calculator: MILITARY_CONVERTER_PATHS.en,
  siblings: nearestOf(MILITARY_TIMES, job).map(militaryPathOf),
}));

/** The chart of each language and its converter link each other, and a hub links the chart. */
export const MILITARY_CHART_RULES: readonly GuideRule[] = LANGS.map((lang) => ({
  path: MILITARY_CHART_PATHS[lang],
  calculators: [MILITARY_CONVERTER_PATHS[lang]],
}));

/** The calculators (route ids) each guide (a route id) explains: they link it, and it links them. */
export const GUIDE_CALCULATORS: Readonly<Record<string, readonly string[]>> = {
  'tax-guide': ['no-tax-on-overtime', 'no-tax-on-tips'],
  'w2-box-12-guide': ['no-tax-on-tips', 'no-tax-on-overtime'],
  'overtime-guide': ['overtime'],
  'california-overtime-guide': ['overtime'],
  'pay-stub-guide': ['time-card', 'overtime'],
  'unpaid-wages-guide': ['overtime', 'time-card'],
  'pto-guide': ['pto-accrual'],
  'shift-differential-guide': ['shift-differential'],
  'tip-credit-guide': ['tipped-wage'],
  'tipped-states-guide': ['tipped-wage'],
  'hours-worked-guide': ['hours', 'decimal-hours'],
  'full-time-guide': ['hours'],
  'part-time-guide': ['hours'],
  'overtime-states-guide': ['overtime'],
  'minimum-wage-states-guide': ['hourly-to-salary', 'salary-to-hourly'],
  'minimum-wage-2027-states-guide': ['hourly-to-salary'],
};

export const GUIDE_RULES: readonly GuideRule[] = Object.entries(GUIDE_CALCULATORS).flatMap(
  ([guide, calculators]) =>
    LANGS.map((lang) => ({
      path: routeOf(guide)[lang],
      calculators: calculators.map((calculator) => routeOf(calculator)[lang]),
    })),
);

/** The home of each language: one of them links every guide. */
/**
 * The data index of each language and the citable tables it lists (`DATA_PAGES`): it links each
 * one, and each one links it back (a guide rule, the tables in the place of calculators).
 */
export const DATA_RULES: readonly GuideRule[] = LANGS.map((lang) => ({
  path: routeOf('data')[lang],
  calculators: DATA_PAGES.map(({ paths }) => paths[lang]),
}));

/**
 * The state index of each language and the state pages: it links each one, and each one links it
 * back (a guide rule, the state pages in the place of calculators).
 */
export const STATE_RULES: readonly GuideRule[] = LANGS.map((lang) => ({
  path: routeOf('states')[lang],
  calculators: STATE_ROUTES.map((route) => route[lang]),
}));

/** Each state table links the page of every state on its row, and every state page links it. */
export const STATE_RULES_OF_TABLES: readonly GuideRule[] = [
  'minimum-wage-states-guide',
  'tipped-states-guide',
  'overtime-states-guide',
].flatMap((table) =>
  LANGS.map((lang) => ({
    path: routeOf(table)[lang],
    calculators: STATE_ROUTES.map((route) => route[lang]),
  })),
);

export const HUBS: readonly string[] = LANGS.map((lang) => routeOf('home')[lang]);

/** Every page of the sitemap, which is built from the same route table. */
export const SITEMAP_PATHS: readonly string[] = ROUTES.flatMap(pathsOfRoute);
