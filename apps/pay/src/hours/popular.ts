import { longTailPageOf, type LongTailJob } from '../long-tail/jobs.ts';
import { DAYS, HOURS_AGO, pathOf, SHIFTS } from '../long-tail/routes.ts';
import { SITE } from '../site.config.ts';
import type { Lang } from '../time-card/receipt.ts';
import type { Link } from './texts.ts';

/*
 * The most searched pages of the Spanish hours calculator (Search Console, 7-13 Nov 2026: the
 * Spanish days, shift and hours ago pages draw most of the impressions of the site), linked right
 * under the tool, each labelled with its answer: the title of its page without the site name.
 */

const pick = <T extends LongTailJob>(jobs: readonly T[], match: (job: T) => boolean): T => {
  const job = jobs.find(match);
  if (job === undefined) throw new Error('a popular page must be a long-tail page');
  return job;
};

const days = (hours: number) => pick(DAYS, (job) => job.hours === hours);
const shift = (start: number, end: number) =>
  pick(SHIFTS, (job) => job.start === start * 60 && job.end === end * 60);
const ago = (hours: number) => pick(HOURS_AGO, (job) => job.amount === hours);

/** In the order of their impressions within each family: days, shifts, hours ago. */
const POPULAR_ES: readonly LongTailJob[] = [
  days(48),
  days(72),
  days(96),
  days(100),
  days(200),
  days(2000),
  shift(8, 17),
  shift(9, 17),
  ago(1),
  ago(5),
  ago(24),
];

export interface Popular {
  readonly heading: string;
  readonly intro: string;
  readonly links: readonly Link[];
}

/** The most searched pages of the hours calculator of `lang`, or none (English has none). */
export const popularOf = (lang: Lang): Popular | undefined => {
  if (lang !== 'es') return undefined;
  const suffix = ` | ${SITE.name}`;
  return {
    heading: 'Lo más buscado',
    intro:
      'Las respuestas que más se buscan, cada una con su tabla, sus equivalencias y el cálculo paso a paso:',
    links: POPULAR_ES.map((job) => ({
      href: pathOf(job, lang),
      label: longTailPageOf(job, lang).title.replace(suffix, ''),
    })),
  };
};
