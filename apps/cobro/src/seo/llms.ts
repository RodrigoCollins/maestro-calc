import { canonicalUrl } from '@maestro-calc/site-kit/canonical';
import { hrefOf, TRADE_PATHS, type Lang } from '../routes.ts';
import { ARTICLES } from '../texts/articles.ts';
import { HOME_TEXTS } from '../texts/home.ts';
import { TRADE_TEXTS } from '../texts/trades.ts';
import { WAGE_TEXTS } from '../texts/wages.ts';
import { OCCUPATIONS } from '../wages/occupations.ts';

interface Entry {
  readonly title: string;
  readonly path: string;
  readonly description: string;
}

const SUMMARY =
  'Quote calculators for Spanish-speaking tradespeople in the United States (cleaning, painting, drywall, concrete, landscaping). Spanish first, English under /en. Quotes are built from the user’s own hours, rates and material prices; material quantities come from the Maestro Calc calculators, and wages from the U.S. Bureau of Labor Statistics (OEWS, May 2025). No market prices are published.';

const entriesOf = (lang: Lang): { readonly heading: string; readonly entries: Entry[] }[] => [
  {
    heading: lang === 'es' ? 'Calculadoras de presupuesto' : 'Quote calculators',
    entries: OCCUPATIONS.map(({ id }) => ({
      title: TRADE_TEXTS[lang][id].h1,
      path: TRADE_PATHS[id][lang],
      description: TRADE_TEXTS[lang][id].description,
    })),
  },
  {
    heading: lang === 'es' ? 'Guías y datos' : 'Guides and data',
    entries: [
      ...(['quote-guide', 'markup-guide', 'rate-guide', 'methodology'] as const).map((id) => ({
        title: ARTICLES[lang][id].h1,
        path: hrefOf(id, lang),
        description: ARTICLES[lang][id].description,
      })),
      {
        title: WAGE_TEXTS[lang].hubH1,
        path: hrefOf('wages', lang),
        description: WAGE_TEXTS[lang].hubDescription,
      },
    ],
  },
];

/** The guide of the site for AI answer engines (llmstxt.org): the home, then the pages worth reading, in both languages. */
export const llmsTxt = (origin: string): string => {
  const line = ({ title, path, description }: Entry): string =>
    `- [${title}](${canonicalUrl(path, origin)}): ${description}`;
  const section = (lang: Lang): string[] => [
    `## ${lang === 'es' ? 'Español' : 'English'}`,
    '',
    `- [${HOME_TEXTS[lang].h1}](${canonicalUrl(hrefOf('home', lang), origin)}): ${HOME_TEXTS[lang].description}`,
    ...entriesOf(lang).flatMap(({ heading, entries }) => [
      '',
      `### ${heading}`,
      '',
      ...entries.map(line),
    ]),
  ];
  return [
    '# Cuánto Le Cobro',
    '',
    `> ${SUMMARY}`,
    '',
    ...section('es'),
    '',
    ...section('en'),
    '',
  ].join('\n');
};
