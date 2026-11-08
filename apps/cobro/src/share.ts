import { canonicalUrl } from '@maestro-calc/site-kit/canonical';
import { whatsappHref } from './receipt/message.ts';
import type { Lang } from './routes.ts';
import { SITE } from './site.config.ts';

/** The words of the plain share link of a data page, in each language; the message names the page. */
export const SHARE_TEXTS: Readonly<
  Record<Lang, { readonly label: string; readonly message: (name: string) => string }>
> = {
  es: { label: 'Compartir por WhatsApp', message: (name) => `${name}, en Cuánto Le Cobro:` },
  en: { label: 'Share on WhatsApp', message: (name) => `${name}, on Cuánto Le Cobro:` },
};

/** What a page's share link renders with no script: its canonical address in the message. */
export interface Share {
  readonly href: string;
  readonly label: string;
  /** The visible label first (WCAG 2.5.3), then the page it shares. */
  readonly ariaLabel: string;
}

/** The share link of the page named `name` at `path`, in `lang`. */
export const shareOf = (lang: Lang, name: string, path: string): Share => {
  const words = SHARE_TEXTS[lang];
  return {
    href: whatsappHref(`${words.message(name)}\n${canonicalUrl(path, SITE.origin)}`),
    label: words.label,
    ariaLabel: `${words.label}: ${name}`,
  };
};
