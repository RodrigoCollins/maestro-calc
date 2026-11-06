import { canonicalUrl } from '@maestro-calc/site-kit/canonical';
import { ABOUT } from './about.ts';
import { CHARTS_INDEX } from './charts.ts';
import { EMBED_PAGE } from './embed.ts';
import { GUIDES } from './guide.ts';
import { HOME_TOOLS } from './home.ts';
import { JOB_PAGES } from './jobs.ts';
import { PRIVACY } from './privacy.ts';
import { SITE } from './site.config.ts';

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
