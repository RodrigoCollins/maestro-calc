import type { enSite } from '@maestro-calc/i18n/catalogs/en/site';
import type { Locale } from '@maestro-calc/i18n';
import { alternatesOf, pathOf, urlOf } from '../routing/routes.ts';
import type { Alternate, PageId } from '../routing/routes.ts';

/** Looks a `site` catalog message up for one locale; the key is checked against the catalog. */
export type SiteText = (key: keyof typeof enSite) => string;

export interface PageHead {
  readonly title: string;
  readonly description: string;
  readonly canonical: string;
  readonly alternates: readonly Alternate[];
}

export interface NotFoundHead {
  readonly title: string;
  readonly description: string;
  readonly robots: 'noindex';
}

/** Title, description, self canonical and hreflang set of an indexable page. */
export const headFor = (id: PageId, locale: Locale, text: SiteText): PageHead => ({
  title: text(`page.${id}.title`),
  description: text(`page.${id}.description`),
  canonical: urlOf(pathOf(id, locale)),
  alternates: alternatesOf(id),
});

/** The not-found head: no canonical and no alternates, so nothing points search engines at it. */
export const notFoundHead = (_locale: Locale, text: SiteText): NotFoundHead => ({
  title: text('page.notFound.title'),
  description: text('page.notFound.description'),
  robots: 'noindex',
});
