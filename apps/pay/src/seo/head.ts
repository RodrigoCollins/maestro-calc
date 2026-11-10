import { canonicalUrl } from '@maestro-calc/site-kit/canonical';
import { embedPathOf } from '@maestro-calc/site-kit/embed';
import { linkPreviewOf } from '@maestro-calc/site-kit/link-preview';
import { SITE } from '../site.config.ts';
import type { Lang } from '../time-card/receipt.ts';

/** The paths of a page: English and Spanish, or only one of them on a one-language page. */
export type PagePaths =
  { readonly en: string; readonly es?: string } | { readonly en?: undefined; readonly es: string };

/**
 * What the layout writes about a page in `lang`: its canonical when it has `paths` (the 404 has
 * none), `noindex` unless the site is indexable and the page has paths, and its link preview.
 */
export const headOf = (
  paths: PagePaths | undefined,
  lang: Lang,
  text: { readonly title: string; readonly description: string },
  site: { readonly origin: string; readonly indexable: boolean } = SITE,
) => ({
  ...(paths?.[lang] === undefined ? {} : { canonical: canonicalUrl(paths[lang], site.origin) }),
  ...(site.indexable && paths?.[lang] !== undefined ? {} : { robots: 'noindex' }),
  preview: linkPreviewOf(site.origin, text),
});

/**
 * What the layout writes about the embed of a page in `lang` (`src/embed/embeds.ts`): the full
 * page as its canonical, always `noindex` (search sees the full page only), its link preview, and
 * the embed of the other language, where its language switch leads inside the frame.
 */
export const embedHeadOf = (
  paths: Readonly<Record<Lang, string>>,
  lang: Lang,
  text: { readonly title: string; readonly description: string },
  site: { readonly origin: string; readonly indexable: boolean } = SITE,
) => ({
  canonical: canonicalUrl(paths[lang], site.origin),
  robots: 'noindex',
  preview: linkPreviewOf(site.origin, text),
  other: embedPathOf(paths[lang === 'en' ? 'es' : 'en']),
});
