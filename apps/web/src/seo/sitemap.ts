import { localizedUrls, sitemapXml as sitemapOf } from '@maestro-calc/site-kit/sitemap';
import { alternatesOf, ROUTES } from '../routing/routes.ts';
import type { RouteTable } from '../routing/routes.ts';

/** `sitemap.xml`: every routable page in both locales, each with its alternates (never a 404). */
export const sitemapXml = (table: RouteTable = ROUTES): string =>
  sitemapOf(
    Object.keys(table).flatMap((id) => localizedUrls(alternatesOf(id, table))),
    'compact',
  );
