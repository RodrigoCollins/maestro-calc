import { canonicalUrl } from '@maestro-calc/site-kit/canonical';
import { SITE } from '../site.config.ts';
import type { Lang } from '../time-card/receipt.ts';
import { shareMessage, whatsappHref } from './href.ts';

/** The words of the share link in each language; the message names the page. */
export const SHARE_TEXTS: Readonly<
  Record<Lang, { readonly label: string; readonly message: (name: string) => string }>
> = {
  en: { label: 'Share on WhatsApp', message: (name) => `${name}, on Cuenta Horas:` },
  es: { label: 'Compartir por WhatsApp', message: (name) => `${name}, en Cuenta Horas:` },
};

/** What a page's share link renders with no script: its canonical address in the message. */
export interface Share {
  readonly href: string;
  /** The words before the address; the page script keeps them and swaps the address. */
  readonly text: string;
  readonly label: string;
  /** The visible label first (WCAG 2.5.3), then the page it shares. */
  readonly ariaLabel: string;
}

/** The share link of the page titled `title` at `path`, in `lang`. */
export const shareOf = (lang: Lang, title: string, path: string): Share => {
  const words = SHARE_TEXTS[lang];
  const name = title.replace(/\s*\|\s*Cuenta Horas$/, '');
  const text = words.message(name);
  return {
    href: whatsappHref(shareMessage(text, canonicalUrl(path, SITE.origin))),
    text,
    label: words.label,
    ariaLabel: `${words.label}: ${name}`,
  };
};
