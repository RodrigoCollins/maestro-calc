import { canonicalUrl } from '@maestro-calc/site-kit/canonical';
import { ABOUT, ABOUT_TEXTS } from './about.ts';
import { CHARTS_INDEX, CHARTS_INDEX_ES } from './charts.ts';
import { CHEMISTRY_CHART_ES } from './chemistry-es.ts';
import {
  ALKALINITY_ES,
  CALCIUM_ES,
  CHLORINE_ES,
  FILL_TIME_ES,
  HEATER_ES,
  PH_ES,
  PUMP_ES,
  SALT_ES,
  STABILIZER_ES,
} from './doses-es.ts';
import { DOSING_CHART_ES } from './dosing-es.ts';
import { EMBED_PAGE, EMBED_PAGE_TEXTS } from './embed.ts';
import { GUIDES } from './guide.ts';
import { HOME_TEXTS, HOME_TOOLS } from './home.ts';
import { JOB_PAGES } from './jobs.ts';
import { METHOD_PAGE } from './methodology.ts';
import { PRIVACY, PRIVACY_TEXTS } from './privacy.ts';
import { ROUTES } from './routes.ts';
import { SITE } from './site.config.ts';
import { SWIM_GUIDE_ES } from './swim-es.ts';
import { VOLUME_CHART_ES } from './volume/chart-es.ts';
import { VOLUME_TEXTS_ES } from './volume/texts.ts';

/** One line of a section: a page by its canonical address and what it holds. */
interface Entry {
  readonly name: string;
  readonly path: string;
  readonly note: string;
}

const SUMMARY =
  'Free pool calculators and guides for home pool owners in US units: gallons, salt, chlorine and shock, pH, alkalinity, stabilizer, calcium hardness, pump size, heater size and fill time. Every dose is worked out from the product label or the published source it cites, and every page shows its formula.';

const DETAILS =
  'Each figure is an estimate for the product strength its page names; the label of the product comes first. The methodology page gives the formulas, the sources and hand-worked cases of every calculator.';

/** The pages that are neither a calculator, a guide nor a pool size. */
const ABOUT_PAGES: readonly Entry[] = [
  {
    name: 'How we work it out',
    path: '/methodology',
    note: 'The formulas, sources and worked examples behind every calculator.',
  },
  { name: 'About', path: '/about', note: ABOUT.description },
  { name: 'Embed our calculators', path: EMBED_PAGE.path, note: EMBED_PAGE.description },
  { name: 'Privacy', path: '/privacy', note: PRIVACY.description },
];

/** The Spanish page of each route that has one, by route id: its Spanish name and description. */
const SPANISH: Readonly<Record<string, Omit<Entry, 'path'>>> = {
  home: { name: 'Pool Figures en español', note: HOME_TEXTS.es.description },
  volume: { name: VOLUME_TEXTS_ES.h1, note: VOLUME_TEXTS_ES.description },
  salt: { name: SALT_ES.h1, note: SALT_ES.description },
  chlorine: { name: CHLORINE_ES.h1, note: CHLORINE_ES.description },
  pump: { name: PUMP_ES.h1, note: PUMP_ES.description },
  ph: { name: PH_ES.h1, note: PH_ES.description },
  alkalinity: { name: ALKALINITY_ES.h1, note: ALKALINITY_ES.description },
  stabilizer: { name: STABILIZER_ES.h1, note: STABILIZER_ES.description },
  calcium: { name: CALCIUM_ES.h1, note: CALCIUM_ES.description },
  heater: { name: HEATER_ES.h1, note: HEATER_ES.description },
  'fill-time': { name: FILL_TIME_ES.h1, note: FILL_TIME_ES.description },
  methodology: { name: METHOD_PAGE.es.h1, note: METHOD_PAGE.es.description },
  'chemistry-chart': { name: CHEMISTRY_CHART_ES.h1, note: CHEMISTRY_CHART_ES.description },
  'dosing-chart': { name: DOSING_CHART_ES.h1, note: DOSING_CHART_ES.description },
  'volume-chart': { name: VOLUME_CHART_ES.h1, note: VOLUME_CHART_ES.description },
  charts: { name: CHARTS_INDEX_ES.h1, note: CHARTS_INDEX_ES.description },
  'swim-guide': { name: SWIM_GUIDE_ES.h1, note: SWIM_GUIDE_ES.description },
  about: { name: ABOUT_TEXTS.es.h1, note: ABOUT_TEXTS.es.description },
  privacy: { name: PRIVACY_TEXTS.es.h1, note: PRIVACY_TEXTS.es.description },
  embed: { name: EMBED_PAGE_TEXTS.es.h1, note: EMBED_PAGE_TEXTS.es.description },
};

/** Every Spanish page, in the order of the route table (as `apps/pay/src/seo/llms.ts`). */
const SPANISH_PAGES: readonly Entry[] = ROUTES.flatMap(({ id, es }) => {
  if (es === undefined) return [];
  const entry = SPANISH[id];
  if (entry === undefined) throw new Error(`no llms.txt entry for the Spanish page ${es}`);
  return [{ ...entry, path: es }];
});

const SECTIONS: readonly (readonly [string, readonly Entry[]])[] = [
  [
    'Calculators',
    HOME_TOOLS.map(({ href, title, summary }) => ({
      name: `${title} calculator`,
      path: href,
      note: summary,
    })),
  ],
  [
    'Guides and charts',
    [
      ...GUIDES.map(({ path, card }) => ({ name: card.title, path, note: card.summary })),
      { name: CHARTS_INDEX.name, path: CHARTS_INDEX.path, note: CHARTS_INDEX.description },
    ],
  ],
  ['About', ABOUT_PAGES],
  ['En español', SPANISH_PAGES],
  // llmstxt.org: the links of an `Optional` section can be skipped when a shorter context is needed
  ['Optional', JOB_PAGES.map(({ path, h1, card }) => ({ name: h1, path, note: card.summary }))],
];

const lineOf = ({ name, path, note }: Entry): string =>
  `- [${name}](${canonicalUrl(path, SITE.origin)}): ${note}`;

/**
 * The `/llms.txt` of the site (llmstxt.org): the name, a summary, then every page of the sitemap
 * but the home, by section, each with its one-line description. Built from the lists the home and
 * the sitemap read, so a new calculator, guide or pool size is in it without an edit.
 */
export const llmsTxt = (): string =>
  [
    `# ${SITE.name}`,
    '',
    `> ${SUMMARY}`,
    '',
    DETAILS,
    ...SECTIONS.flatMap(([heading, entries]) => ['', `## ${heading}`, '', ...entries.map(lineOf)]),
    '',
  ].join('\n');
