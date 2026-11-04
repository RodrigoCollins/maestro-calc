import { pagePathOf } from '@maestro-calc/site-kit/embed';
import { linkPreviewOf } from '@maestro-calc/site-kit/link-preview';
import { SITE } from '../site.config.ts';

/**
 * What the layout writes about the page at `path`: its canonical while the site is indexable and
 * the page is `indexed` (never the 404), `noindex` otherwise, and its link preview.
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
    ? { canonical: new URL(path, site.origin).href }
    : { robots: 'noindex' }),
  preview: linkPreviewOf(site.origin, text),
});

/**
 * What the layout writes about the embed at `path` (`src/embed.ts`): the full page it embeds as its
 * canonical, always `noindex` (search sees the full page only), and its link preview.
 */
export const embedHeadOf = (
  path: string,
  text: { readonly title: string; readonly description: string },
  site: { readonly origin: string } = SITE,
): {
  readonly page: string;
  readonly canonical: string;
  readonly robots: string;
  readonly preview: ReturnType<typeof linkPreviewOf>;
} => {
  const page = pagePathOf(path);
  if (page === undefined) throw new Error(`not an embed: ${path}`);
  return {
    page,
    canonical: new URL(page, site.origin).href,
    robots: 'noindex',
    preview: linkPreviewOf(site.origin, text),
  };
};
