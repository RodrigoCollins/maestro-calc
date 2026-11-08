import { canonicalUrl } from '@maestro-calc/site-kit/canonical';
import { linkPreviewOf } from '@maestro-calc/site-kit/link-preview';
import { SITE } from '../site.config.ts';

/**
 * What the layout writes about the page at `path`: its canonical while the site is indexable and
 * the page is `indexed` (never the 404), `noindex` otherwise, and its link preview. The site ships
 * closed (`SITE.indexable`): the owner flips it at launch.
 */
export const headOf = (
  path: string,
  text: { readonly title: string; readonly description: string },
  indexed: boolean,
  site: { readonly origin: string; readonly indexable: boolean } = SITE,
): {
  readonly canonical?: string;
  readonly robots?: string;
  readonly preview: ReturnType<typeof linkPreviewOf>;
} => ({
  ...(site.indexable && indexed
    ? { canonical: canonicalUrl(path, site.origin) }
    : { robots: 'noindex' }),
  preview: linkPreviewOf(site.origin, text),
});
