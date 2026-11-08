import { dateText } from './format.ts';
import { hrefOf, ROUTES, type Lang, type TradeId } from './routes.ts';
import { COMMON } from './texts/common.ts';
import { ARTICLES, type ArticleId, type Source } from './texts/articles.ts';
import { OEWS_RELEASE } from './wages/oews-2025.ts';
import { BLS_OEWS_URL, stateWageViewOf } from './wages/view.ts';

/** The day the wage pages' figures were last read (BLS): the review date of every wage page. */
export const WAGES_CHECKED = OEWS_RELEASE.accessed;

/** The ids of the articles that carry the byline of the editorial team (the legal pages do too). */
export const ARTICLE_IDS: readonly ArticleId[] = [
  'quote-guide',
  'markup-guide',
  'rate-guide',
  'methodology',
  'about',
  'editorial',
  'privacy',
];

/** The route id of each article. */
export const ARTICLE_ROUTE: Readonly<Record<ArticleId, string>> = {
  'quote-guide': 'quote-guide',
  'markup-guide': 'markup-guide',
  'rate-guide': 'rate-guide',
  methodology: 'methodology',
  about: 'about',
  editorial: 'editorial',
  privacy: 'privacy',
};

const BLS_SOURCE: Source = {
  name: 'U.S. Bureau of Labor Statistics, OEWS, May 2025',
  url: BLS_OEWS_URL,
  accessed: WAGES_CHECKED,
};

/** The sources of a wage page: every source a state page reads, the BLS alone for an index or the hub. */
const wageSourcesOf = (id: string, lang: Lang): readonly Source[] => {
  const [, trade, fips] = /^wage-([a-z]+)-(\d{2})$/.exec(id) ?? [];
  if (trade === undefined || fips === undefined) return [BLS_SOURCE];
  return stateWageViewOf(trade as TradeId, fips, lang).sources.map(({ label, href }) => ({
    name: label,
    url: href,
    accessed: WAGES_CHECKED,
  }));
};

/**
 * A page that carries the byline of the editorial team: its address, the day its figures were last
 * checked, and the sources its sources section lists.
 */
export interface BylinePage {
  readonly path: string;
  readonly checked: string;
  readonly sources: readonly Source[];
}

/** Every page with a byline: the articles and every wage page, in both languages. */
export const BYLINE_PAGES: readonly BylinePage[] = [
  ...(['es', 'en'] as const).flatMap((lang) =>
    ARTICLE_IDS.map((id) => ({
      path: hrefOf(ARTICLE_ROUTE[id], lang),
      checked: ARTICLES[lang][id].checked,
      sources: ARTICLES[lang][id].sources,
    })),
  ),
  ...ROUTES.filter(({ id }) => id.startsWith('wage')).flatMap(({ id, es, en }) =>
    (['es', 'en'] as const).map((lang) => ({
      path: lang === 'es' ? es : en,
      checked: WAGES_CHECKED,
      sources: wageSourcesOf(id, lang),
    })),
  ),
];

/** What a byline under the h1 says, in `lang`. */
export const bylineOf = (
  lang: Lang,
  checked: string,
  hasSources: boolean,
): {
  readonly by: string;
  readonly team: string;
  readonly reviewed: { readonly label: string; readonly datetime: string; readonly text: string };
  readonly sources: string | undefined;
} => {
  const words = COMMON[lang].byline;
  return {
    by: words.by,
    team: words.team,
    reviewed: { label: words.reviewed, datetime: checked, text: dateText(checked, lang) },
    sources: hasSources ? words.sources : undefined,
  };
};
