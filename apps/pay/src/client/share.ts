import { shareMessage, sharedUrlOf, whatsappHref } from '../share/href.ts';

/**
 * Puts the current address, with the calculator's state in its query, into every share link of
 * the page (`ShareLink.astro`), keeping the words the page rendered. An embed shares its full page.
 */
export const refreshShare = (): void => {
  const canonical = document.querySelector('link[rel=canonical]')?.getAttribute('href') ?? null;
  const url = sharedUrlOf(canonical, location.href);
  for (const link of document.querySelectorAll<HTMLAnchorElement>('a[data-share]')) {
    link.href = whatsappHref(shareMessage(link.dataset['share'] ?? '', url));
  }
};
