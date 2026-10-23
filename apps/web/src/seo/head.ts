import type { Locale } from '@maestro-calc/i18n';
import type { SiteText } from '../lib/site-text.ts';
import { alternatesOf, pathOf, urlOf } from '../routing/routes.ts';
import type { Alternate, PageId } from '../routing/routes.ts';

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
