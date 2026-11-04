import { embedPathOf } from '@maestro-calc/site-kit/embed';
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
  canonical: new URL(paths[lang], site.origin).href,
  robots: 'noindex',
  preview: linkPreviewOf(site.origin, text),
  other: embedPathOf(paths[lang === 'en' ? 'es' : 'en']),
});
