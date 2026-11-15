/*
 * The military time pages and their paths, with no import at all, as `../long-tail/routes.ts`: the
 * browser suites of `tooling/site-browser/e2e-pay` read the page list from here without the
 * workspace install. The converter and the chart are pairs. Each time of day has its English page
 * (a search of the US four-digit clock, "1900 military time"); midnight and every time from noon on
 * also have a Spanish twin, the way Spanish speakers search the 24-hour clock: "qué hora son las 19
 * horas" (Ahrefs Mexico, plans/growth/ahrefs-2026-11-15-spanish.md). A morning hour reads the same
 * on both clocks, so it has no Spanish page.
 */

/** The converter: any time either way, 12-hour to military and back. */
export const MILITARY_CONVERTER_PATHS = {
  en: '/military-time-converter',
  es: '/es/convertidor-de-hora-militar',
} as const;

/** The chart: every hour of the day on both clocks, said aloud, and how minutes are read. */
export const MILITARY_CHART_PATHS = {
  en: '/military-time-chart',
  es: '/es/tabla-de-hora-militar',
} as const;

/** One time of day people ask the 12-hour time of, "1500 military time": minutes from midnight. */
export interface MilitaryTimeJob {
  readonly kind: 'military';
  readonly minutes: number;
  /** Its four digits: `1500`. */
  readonly slug: string;
}

const two = (value: number): string => String(value).padStart(2, '0');

/** Every hour and half hour of the day, 0000 to 2330, in the order of the day: a page links its nearest. */
export const MILITARY_TIMES: readonly MilitaryTimeJob[] = Array.from({ length: 48 }, (_, i) => {
  const minutes = i * 30;
  return {
    kind: 'military',
    minutes,
    slug: `${two(Math.floor(minutes / 60))}${two(minutes % 60)}`,
  };
});

export const militaryPathOf = (job: MilitaryTimeJob): string => `/military-time/${job.slug}`;

const NOON = 720;

/** The times with a Spanish page: midnight and its half hour, then noon to 2330. */
export const SPANISH_TIMES: readonly MilitaryTimeJob[] = MILITARY_TIMES.filter(
  ({ minutes }) => minutes < 60 || minutes >= NOON,
);

/** The Spanish slug of a time: `las-19-horas`, `las-18-30-horas`, `las-00-horas`. */
export const spanishSlugOf = (job: MilitaryTimeJob): string => {
  const hour = job.slug.slice(0, 2);
  const minute = job.slug.slice(2);
  return `las-${hour}${minute === '00' ? '' : `-${minute}`}-horas`;
};

export const spanishPathOf = (job: MilitaryTimeJob): string => `/es/hora/${spanishSlugOf(job)}`;

/** The Spanish twin of a time, when it has one. */
export const spanishPathOfTime = (job: MilitaryTimeJob): string | undefined =>
  SPANISH_TIMES.includes(job) ? spanishPathOf(job) : undefined;

/** The routes of the times, in the order of the day, with the Spanish twin when there is one. */
export const MILITARY_TIME_ROUTES: readonly {
  readonly id: string;
  readonly kind: 'article';
  readonly en: string;
  readonly es?: string;
}[] = MILITARY_TIMES.map((job) => {
  const es = spanishPathOfTime(job);
  return {
    id: `military-time-${job.slug}`,
    kind: 'article',
    en: militaryPathOf(job),
    ...(es === undefined ? {} : { es }),
  };
});
