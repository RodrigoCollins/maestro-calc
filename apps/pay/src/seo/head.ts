import { linkPreviewOf } from '@maestro-calc/site-kit/link-preview';
import { SITE } from '../site.config.ts';
import type { Lang } from '../time-card/receipt.ts';

/**
 * What the layout writes about a page in `lang`: its canonical when it has `paths` (the 404 has
 * none), `noindex` unless the site is indexable and the page has paths, and its link preview.
 */
export const headOf = (
  paths: Readonly<Record<Lang, string>> | undefined,
  lang: Lang,
  text: { readonly title: string; readonly description: string },
  site: { readonly origin: string; readonly indexable: boolean } = SITE,
) => ({
  ...(paths === undefined ? {} : { canonical: new URL(paths[lang], site.origin).href }),
  ...(site.indexable && paths !== undefined ? {} : { robots: 'noindex' }),
  preview: linkPreviewOf(site.origin, text),
});
