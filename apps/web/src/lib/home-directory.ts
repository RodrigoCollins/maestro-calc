import type { Locale } from '@maestro-calc/i18n';
import type { Messages } from '../calculator/controller.ts';
import { pathOf, ROUTES } from '../routing/routes.ts';
import type { RouteTable } from '../routing/routes.ts';
import { CALCULATOR_PAGES, isCalculatorPage } from '../routing/templates.ts';
import { PAGES } from './pages.ts';
import { siteText } from './site-text.ts';

/** One calculator card of the home directory. */
export interface HomeCard {
  readonly id: string;
  readonly href: string;
  readonly title: string;
  readonly summary: string;
  readonly example: string;
}

/** The copy of a card; the real one reads the site and calculator catalogs. */
export type CardCopy = (
  locale: Locale,
  id: string,
) => Pick<HomeCard, 'title' | 'summary' | 'example'>;

/** The ids of `routes` that are calculator pages, in `routes` order. */
export const directoryOrder = (routes: RouteTable, pages: readonly string[]): string[] =>
  Object.keys(routes).filter((id) => pages.includes(id));

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
 * The cards of the home directory in route table order. The tables default to the real ones; they
 * and `copy` are parameters so the order can be proved with a fixture.
 */
export const homeCards = (
  locale: Locale,
  routes: RouteTable = ROUTES,
  pages: readonly string[] = CALCULATOR_PAGES,
  copy: CardCopy = catalogCopy,
): readonly HomeCard[] =>
  directoryOrder(routes, pages).map((id) => ({
    id,
    href: pathOf(id, locale, routes),
    ...copy(locale, id),
  }));
