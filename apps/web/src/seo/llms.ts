import type { Locale } from '@maestro-calc/i18n';
import { siteText } from '../lib/site-text.ts';
import { GUIDE_IDS } from '../routing/guides.ts';
import { HUB_IDS } from '../routing/hubs.ts';
import { isChartJob, JOB_IDS } from '../routing/jobs.ts';
import { pathOf, urlOf, type PageId } from '../routing/routes.ts';
import { CALCULATOR_PAGES } from '../routing/templates.ts';
import { SITE } from '../site.config.ts';

/*
 * `/llms.txt` (llmstxt.org): what an answer engine reads to find the right page. The name, the
 * summary of the home, then one section of links per kind of page, each a title and the page's
 * description, all from the route table and the site catalogs: a new page is listed without an edit.
 */

/** What the site is, for a reader that never saw it (English: the file has one language). */
const ABOUT =
  'Every page is in English and in Spanish (the Spanish pages are under /es). Each calculator works its figures out with exact arithmetic and tested formulas, and the methodology page gives every formula, every source and the hand-checked cases.';

/** The pages of the About section, in that order. */
const ABOUT_PAGES = ['methodology', 'about', 'glossary', 'guides', 'embed-calculators'] as const;

/** The list item of a page: its title without the site suffix, its canonical URL and its description. */
const itemOf = (id: PageId, locale: Locale): string => {
  const text = siteText(locale);
  const title = text(`page.${id}.title`).replace(` | ${SITE.name}`, '');
  return `- [${title}](${urlOf(pathOf(id, locale))}): ${text(`page.${id}.description`)}`;
};

const sectionOf = (heading: string, ids: readonly PageId[], locale: Locale): string =>
  [`## ${heading}`, '', ...ids.map((id) => itemOf(id, locale))].join('\n');

/** The body of `/llms.txt`. */
export const llmsTxt = (): string => {
  const charts = JOB_IDS.filter(isChartJob);
  const jobs = JOB_IDS.filter((id) => !isChartJob(id));
  return `${[
    `# ${SITE.name}`,
    `> ${siteText('en')('page.home.description')}`,
    ABOUT,
    sectionOf('Calculators', CALCULATOR_PAGES, 'en'),
    sectionOf('Reference charts', charts, 'en'),
    sectionOf('Guides', GUIDE_IDS, 'en'),
    sectionOf('Trades', HUB_IDS, 'en'),
    sectionOf('About', ABOUT_PAGES, 'en'),
    sectionOf('Español', [...CALCULATOR_PAGES, ...charts, ...GUIDE_IDS], 'es'),
    sectionOf('Optional', jobs, 'en'),
  ].join('\n\n')}\n`;
};
