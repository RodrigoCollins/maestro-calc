import { LOCALES, pathOf, ROUTES, urlOf } from '../routing/routes.ts';
import type { RouteTable } from '../routing/routes.ts';
import { SITE } from '../site.config.ts';

/** The JSON body of an IndexNow submission (indexnow.org/documentation). */
export interface IndexNowRequest {
  readonly host: string;
  readonly key: string;
  readonly keyLocation: string;
  readonly urlList: readonly string[];
}

/** Every canonical URL of the table in both locales, in sitemap order, under the site's key. */
export const indexNowRequest = (table: RouteTable = ROUTES): IndexNowRequest => ({
  host: new URL(SITE.url).host,
  key: SITE.indexNowKey,
  keyLocation: urlOf(`/${SITE.indexNowKey}.txt`),
  urlList: Object.keys(table).flatMap((id) =>
    LOCALES.map((locale) => urlOf(pathOf(id, locale, table))),
  ),
});
