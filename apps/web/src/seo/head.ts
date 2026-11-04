import type { Locale } from '@maestro-calc/i18n';
import type { SiteText } from '../lib/site-text.ts';
import { alternatesOf, pathOf, urlOf } from '../routing/routes.ts';
import type { Alternate, PageId } from '../routing/routes.ts';
import { SITE } from '../site.config.ts';

export interface PageHead {
  readonly title: string;
  readonly description: string;
  readonly canonical: string;
  readonly alternates: readonly Alternate[];
  /** Serialized structured data; only a view that has some (the home pages) adds it. */
  readonly jsonLd?: string;
  /** The Open Graph type; only a guide sets it (`article`), every other page is a `website`. */
  readonly ogType?: 'article';
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
export const notFoundHead = (text: SiteText): NotFoundHead => ({
  title: text('page.notFound.title'),
  description: text('page.notFound.description'),
  robots: 'noindex',
});

/**
 * open-graph (plans/growth/PLAN.md › G7): an indexable page is shared with its title, its
 * description, the one language-free 1200 by 630 image and a large card.
 */
export const linkPreviewOf = ({ title, description }: { title: string; description: string }) =>
  ({
    'og:title': title,
    'og:description': description,
    'og:image': `${SITE.url}/og.png`,
    'og:image:width': '1200',
    'og:image:height': '630',
    'twitter:card': 'summary_large_image',
  }) as const;
