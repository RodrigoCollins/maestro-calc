/*
 * The military time pages and their paths, with no import at all, as `../long-tail/routes.ts`: the
 * browser suites of `tooling/site-browser/e2e-pay` read the page list from here without the
 * workspace install. The converter and the chart are pairs; each time of day is English only (a
 * search of the US four-digit clock), so its route has no `es`.
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

/** The English-only routes of the times, in the order of the day. */
export const MILITARY_TIME_ROUTES: readonly {
  readonly id: string;
  readonly kind: 'article';
  readonly en: string;
}[] = MILITARY_TIMES.map((job) => ({
  id: `military-time-${job.slug}`,
  kind: 'article',
  en: militaryPathOf(job),
}));
