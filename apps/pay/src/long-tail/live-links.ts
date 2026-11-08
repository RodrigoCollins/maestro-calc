import type { Lang } from '../time-card/receipt.ts';
import { daysLinksOf } from './days.ts';
import { minutesLinksOf } from './minutes.ts';
import { DAYS, MINUTES, pathOf, SHIFTS, type LongTailJob } from './routes.ts';
import { shiftLinksOf } from './shifts.ts';

/*
 * The site's pages a live time page points to inside its sections: a shift it starts or ends, the
 * minutes it counts in decimal hours, the hours it counts in days. Each link reads as the page's
 * own question, as the hours calculator lists it.
 */

interface Link {
  readonly href: string;
  readonly label: string;
}

const linkOf = (job: LongTailJob | undefined, lang: Lang, links: readonly Link[]): Link => {
  if (job === undefined) throw new Error('a live page links a page that does not exist');
  const href = pathOf(job, lang);
  const link = links.find((each) => each.href === href);
  if (link === undefined) throw new Error(`no link to ${href}`);
  return link;
};

/** The shift page from `start` to `end`, times as `'9:00'` on a 24-hour clock. */
export const shiftLink = (from: string, to: string, lang: Lang): Link => {
  const minutes = (time: string): number => {
    const [hour = '', minute = ''] = time.split(':');
    return Number(hour) * 60 + Number(minute);
  };
  const job = SHIFTS.find((each) => each.start === minutes(from) && each.end === minutes(to));
  return linkOf(job, lang, shiftLinksOf(lang).links);
};

export const minutesLink = (count: number, lang: Lang): Link =>
  linkOf(
    MINUTES.find((each) => each.minutes === count),
    lang,
    minutesLinksOf(lang).links,
  );

export const daysLink = (hours: number, lang: Lang): Link =>
  linkOf(
    DAYS.find((each) => each.hours === hours),
    lang,
    daysLinksOf(lang).links,
  );

/** The heading of the first section of every live page, as on the other long-tail pages. */
export const WORKED = { en: 'How the figures are worked out', es: 'Cómo se calcula' } as const;
