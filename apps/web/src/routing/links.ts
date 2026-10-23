import type { Locale } from '@maestro-calc/i18n';
import { pathOf, ROUTES } from './routes.ts';
import type { RouteTable } from './routes.ts';

export interface PageLink<Id extends string = string> {
  readonly id: Id;
  readonly href: string;
}

/**
 * The candidates that exist in the table, with their path in `locale`, in candidate order. A page
 * that is not routable yet is dropped, so navigation never links to a missing page.
 */
export const linksFor = <Id extends string>(
  candidates: readonly Id[],
  locale: Locale,
  table: RouteTable = ROUTES,
): PageLink<Id>[] =>
  candidates
    .filter((id) => Object.hasOwn(table, id))
    .map((id) => ({ id, href: pathOf(id, locale, table) }));
