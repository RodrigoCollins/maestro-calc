import { canonicalUrl } from '@maestro-calc/site-kit/canonical';
import { SITE } from '../site.config.ts';
import { shareMessage, whatsappHref } from './href.ts';

/** The words of the share link; the message names the page. */
export const SHARE_TEXT = {
  label: 'Share on WhatsApp',
  message: (name: string): string => `${name}, on Lawn Figures:`,
} as const;

/** What a page's share link renders with no script: its canonical address in the message. */
export interface Share {
  readonly href: string;
  /** The words before the address; the page script keeps them and swaps the address. */
  readonly text: string;
  readonly label: string;
  /** The visible label first (WCAG 2.5.3), then the page it shares. */
  readonly ariaLabel: string;
}

/** The share link of the page titled `title` at `path`. */
export const shareOf = (title: string, path: string): Share => {
  const name = title.replace(/\s*\|\s*Lawn Figures$/, '');
  const text = SHARE_TEXT.message(name);
  return {
    href: whatsappHref(shareMessage(text, canonicalUrl(path, SITE.origin))),
    text,
    label: SHARE_TEXT.label,
    ariaLabel: `${SHARE_TEXT.label}: ${name}`,
  };
};
