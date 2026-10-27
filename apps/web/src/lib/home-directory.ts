import type { Locale } from '@maestro-calc/i18n';
import { pathOf, ROUTES } from '../routing/routes.ts';
import type { RouteTable } from '../routing/routes.ts';
import { CALCULATOR_PAGES, isCalculatorPage } from '../routing/templates.ts';
import type { CalculatorPageId } from '../routing/templates.ts';
import { PAGES } from './pages.ts';
import type { Messages } from './pages.ts';
import { siteText } from './site-text.ts';

/** One calculator card of the home directory; `Id` is a calculator page id outside the tests. */
export interface HomeCard<Id extends string = CalculatorPageId> {
  readonly id: Id;
  readonly href: string;
  readonly title: string;
  readonly summary: string;
  readonly example: string;
}

/** The copy of a card; the real one reads the site and calculator catalogs. */
export type CardCopy<Id extends string = string> = (
  locale: Locale,
  id: Id,
) => Pick<HomeCard<Id>, 'title' | 'summary' | 'example'>;

/** The ids of `routes` that are in `pages`, in `routes` order, typed as the ids of `pages`. */
export const directoryOrder = <Id extends string>(routes: RouteTable, pages: readonly Id[]): Id[] =>
  Object.keys(routes).flatMap((key) => pages.filter((page) => page === key));

/** `calc.<id>.page.example` of a catalog; throws naming the key and the locale when it is missing. */
export const exampleOf = (catalog: Messages, id: string, locale: Locale): string => {
  const key = `calc.${id}.page.example`;
  const example = catalog[key];
  if (example === undefined) throw new Error(`${key} is missing in the ${locale} catalog`);
  return example;
};

/** The catalog copy of a routed calculator: a missing card key is a compile error naming the key. */
const catalogCopy: CardCopy = (locale, id) => {
  if (!isCalculatorPage(id)) throw new Error(`${id} is not a calculator page`);
  const text = siteText(locale);
  return {
    title: text(`page.home.cards.${id}.title`),
    summary: text(`page.home.cards.${id}.summary`),
    example: exampleOf(PAGES[id].catalogs[locale], id, locale),
  };
};

/**
 * The cards of the home directory in route table order. The tables default to the real ones, whose
 * cards carry a `CalculatorPageId`; they and `copy` are parameters so the order can be proved with a
 * fixture, whose cards carry the fixture ids.
 */
export function homeCards(locale: Locale): readonly HomeCard[];
export function homeCards<Id extends string>(
  locale: Locale,
  routes: RouteTable,
  pages: readonly Id[],
  copy?: CardCopy<Id>,
): readonly HomeCard<Id>[];
export function homeCards(
  locale: Locale,
  routes: RouteTable = ROUTES,
  pages: readonly string[] = CALCULATOR_PAGES,
  copy: CardCopy = catalogCopy,
): readonly HomeCard<string>[] {
  return directoryOrder(routes, pages).map((id) => ({
    id,
    href: pathOf(id, locale, routes),
    ...copy(locale, id),
  }));
}
