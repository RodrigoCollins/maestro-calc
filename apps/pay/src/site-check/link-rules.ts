import { NEIGHBORS, nearestOf } from '../long-tail/nearest.ts';
import {
  DAYS,
  DIFFERENTIALS,
  DOUBLES,
  JOBS,
  LIVE_GROUPS,
  MINUTES,
  pathOf,
  PTOS,
  SCHOOL_YEAR_PATH,
  SHIFTS,
  TIPPED,
  WEEKS,
  type LongTailJob,
} from '../long-tail/routes.ts';
import { DATA_PAGES } from '../data/pages.ts';
import {
  MILITARY_CHART_PATHS,
  MILITARY_CONVERTER_PATHS,
  MILITARY_TIMES,
  militaryPathOf,
  SPANISH_TIMES,
  spanishPathOf,
} from '../military/routes.ts';
import { isPaired, pathsOfRoute, ROUTES, type PairedRoute } from '../routes.ts';
import { STATE_ROUTES } from '../states/routes.ts';
import { COUNTDOWNS, countdownPathOf, DAYS_BETWEEN_PATH } from '../dates/routes.ts';
import {
  AGUINALDO_PATH,
  ANTIGUEDAD_PATH,
  FINIQUITO_PATH,
  ISR_PATH,
  MEXICO_SLUGS,
  mexicoPathOf,
  SDI_PATH,
  SUELDO_NETO_PATH,
  VACACIONES_PATH,
  type MexicoSlug,
} from '../mexico/routes.ts';
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
  { calculator: 'hours', members: WEEKS },
  ...LIVE_GROUPS.map((members) => ({ calculator: 'hours', members })),
];

/**
 * Every long-tail page: its calculator links it, and it links its calculator and the
 * `NEIGHBORS` pages of its family nearest to it, in its own language. The English-only school
 * year page links the first `NEIGHBORS` weeks pages.
 */
export const LONG_TAIL_RULES: readonly LongTailRule[] = [
  ...FAMILIES.flatMap(({ calculator, members }) =>
    members.flatMap((job) =>
      LANGS.map((lang) => ({
        path: pathOf(job, lang),
        calculator: routeOf(calculator)[lang],
        siblings: nearestOf(members, job).map((sibling) => pathOf(sibling, lang)),
      })),
    ),
  ),
  {
    path: SCHOOL_YEAR_PATH,
    calculator: routeOf('hours').en,
    siblings: WEEKS.slice(0, NEIGHBORS).map((sibling) => pathOf(sibling, 'en')),
  },
];

/**
 * Every countdown page (Spanish only): the days-between calculator links it, and it links the
 * calculator and the `NEIGHBORS` countdowns nearest to it in the year.
 */
export const COUNTDOWN_RULES: readonly LongTailRule[] = COUNTDOWNS.map((job) => ({
  path: countdownPathOf(job),
  calculator: DAYS_BETWEEN_PATH,
  siblings: nearestOf(COUNTDOWNS, job).map(countdownPathOf),
}));

const MEXICO_CALCULATOR: Readonly<Record<MexicoSlug, string>> = {
  'cuantos-dias-de-aguinaldo-son-por-ley': AGUINALDO_PATH,
  'aguinaldo-2026': AGUINALDO_PATH,
  'cuantos-dias-de-vacaciones-son-por-ano': VACACIONES_PATH,
  'prima-vacacional': VACACIONES_PATH,
  'prima-dominical': SDI_PATH,
  'como-se-pagan-las-horas-extras': SDI_PATH,
};

/**
 * The Mexico labor pages (Spanish only), each linked from the Spanish home: every answer page and
 * the calculator it explains link each other, the two calculators link each other, and the
 * aguinaldo calculator and the dates calculator, which counts the days worked, link each other;
 * the prima de antigüedad links the aguinaldo and the SDI, and the SDI the vacation calculator.
 */
export const MEXICO_RULES: readonly GuideRule[] = [
  ...MEXICO_SLUGS.map((slug) => ({
    path: mexicoPathOf(slug),
    calculators: [MEXICO_CALCULATOR[slug]],
  })),
  { path: AGUINALDO_PATH, calculators: [VACACIONES_PATH, DAYS_BETWEEN_PATH] },
  { path: VACACIONES_PATH, calculators: [AGUINALDO_PATH] },
  { path: ANTIGUEDAD_PATH, calculators: [SDI_PATH, AGUINALDO_PATH] },
  { path: SDI_PATH, calculators: [VACACIONES_PATH] },
  // the ISR and take-home pay calculators link each other
  { path: ISR_PATH, calculators: [SUELDO_NETO_PATH] },
  { path: SUELDO_NETO_PATH, calculators: [ISR_PATH] },
  // the finiquito and the four calculators of its lines link each other
  {
    path: FINIQUITO_PATH,
    calculators: [AGUINALDO_PATH, VACACIONES_PATH, ANTIGUEDAD_PATH, SDI_PATH],
  },
];

/**
 * Every military time page: the converter of its language links it, and it links the converter and
 * the `NEIGHBORS` times nearest to it in its language (the Spanish ones are midnight and noon on).
 */
export const MILITARY_RULES: readonly LongTailRule[] = [
  ...MILITARY_TIMES.map((job) => ({
    path: militaryPathOf(job),
    calculator: MILITARY_CONVERTER_PATHS.en,
    siblings: nearestOf(MILITARY_TIMES, job).map(militaryPathOf),
  })),
  ...SPANISH_TIMES.map((job) => ({
    path: spanishPathOf(job),
    calculator: MILITARY_CONVERTER_PATHS.es,
    siblings: nearestOf(SPANISH_TIMES, job).map(spanishPathOf),
  })),
];

/**
 * The chart of each language and its converter link each other, and a hub links the chart; the
 * Spanish chart and every Spanish time page link each other too.
 */
export const MILITARY_CHART_RULES: readonly GuideRule[] = LANGS.map((lang) => ({
  path: MILITARY_CHART_PATHS[lang],
  calculators: [
    MILITARY_CONVERTER_PATHS[lang],
    ...(lang === 'es' ? SPANISH_TIMES.map(spanishPathOf) : []),
  ],
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
  'employer-hours-guide': ['time-card', 'overtime'],
  'timesheet-guide': ['time-card'],
  'time-apps-guide': ['time-card'],
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
