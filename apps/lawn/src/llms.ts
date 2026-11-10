import { canonicalUrl } from '@maestro-calc/site-kit/canonical';
import { ABOUT } from './about.ts';
import { CALCULATORS } from './calculators.ts';
import { CITY_GUIDES } from './city-guides.ts';
import { COST_GUIDES } from './costs.ts';
import { EDITORIAL } from './editorial.ts';
import { FROST_PAGES } from './frost.ts';
import { frostCopyOf, FROST_TEXT } from './frost-copy.ts';
import { GUIDES } from './guide.ts';
import { FEED_STATE_GUIDES, SEED_STATE_GUIDES } from './state-guides.ts';
import { ZONE_GUIDES } from './zone-guides.ts';
import { METHOD_PAGE } from './methodology.ts';
import { PRIVACY } from './privacy.ts';
import { SITE } from './site.config.ts';

/** One line of a section: a page by its canonical address and what it holds. */
interface Entry {
  readonly name: string;
  readonly path: string;
  readonly note: string;
}

const SUMMARY =
  'Free lawn calculators and frost date tables for US home owners in US units: lawn fertilizer pounds from the N-P-K numbers on the bag, grass seed, sod and lawn lime, plus the last spring and first fall 32°F freeze dates of every state from the NOAA 1991-2020 normals. Every figure is worked out from a university extension publication or NOAA data, and every page shows its formula and its source.';

const DETAILS =
  'Each figure is an estimate; the label of the product and the soil test come first. The methodology page gives the formulas, the sources and hand-worked cases of every calculator.';

const SECTIONS: readonly (readonly [string, readonly Entry[]])[] = [
  [
    'Calculators',
    CALCULATORS.map(({ h1, path, description }) => ({ name: h1, path, note: description })),
  ],
  ['Guides', GUIDES.map(({ h1, path, description }) => ({ name: h1, path, note: description }))],
  [
    'Lawn costs',
    COST_GUIDES.map(({ h1, path, description }) => ({ name: h1, path, note: description })),
  ],
  [
    'Frost dates',
    [
      {
        name: FROST_TEXT.index.h1,
        path: '/frost-dates',
        note: FROST_TEXT.index.description,
      },
      ...CITY_GUIDES.map(({ h1, path, description }) => ({ name: h1, path, note: description })),
    ],
  ],
  [
    'Planting zones',
    ZONE_GUIDES.map(({ h1, path, description }) => ({ name: h1, path, note: description })),
  ],
  [
    'Lawn calendars by state',
    [...SEED_STATE_GUIDES, ...FEED_STATE_GUIDES].map(({ h1, path, description }) => ({
      name: h1,
      path,
      note: description,
    })),
  ],
  [
    'About',
    [
      { name: METHOD_PAGE.h1, path: '/methodology', note: METHOD_PAGE.description },
      { name: ABOUT.h1, path: '/about', note: ABOUT.description },
      { name: EDITORIAL.h1, path: '/editorial-policy', note: EDITORIAL.description },
      { name: PRIVACY.h1, path: '/privacy', note: PRIVACY.description },
    ],
  ],
  // llmstxt.org: the links of an `Optional` section can be skipped when a shorter context is needed
  [
    'Optional',
    FROST_PAGES.map((page) => {
      const { h1, description } = frostCopyOf(page);
      return { name: h1, path: page.path, note: description };
    }),
  ],
];

const lineOf = ({ name, path, note }: Entry): string =>
  `- [${name}](${canonicalUrl(path, SITE.origin)}): ${note}`;

/**
 * The `/llms.txt` of the site (llmstxt.org): the name, a summary, then every page of the sitemap
 * but the home, by section, each with its one-line description. Built from the lists the home and
 * the sitemap read, so a new calculator, guide or state is in it without an edit.
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
