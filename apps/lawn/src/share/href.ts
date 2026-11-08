/*
 * The WhatsApp share link: plain words and an address, no script of WhatsApp's and no tracker.
 * The page scripts import this module only (never `./texts.ts`), so a calculator bundle carries
 * three small functions and no text.
 */

/** A WhatsApp link that opens the chat picker with the message filled in. */
export const whatsappHref = (message: string): string =>
  `https://wa.me/?text=${encodeURIComponent(message)}`;

/** The message a share link sends: its words, then the address on a line of its own. */
export const shareMessage = (text: string, url: string): string => `${text}\n${url}`;

/**
 * The address a page shares: the current one with the path of the page's canonical. A page's
 * canonical is its own path; an embed's is the full page, so a link sent from another site's
 * frame opens the real page, on the origin that served the frame, with the state in its query.
 */
export const sharedUrlOf = (canonical: string | null, href: string): string => {
  if (canonical === null || !URL.canParse(canonical)) return href;
  const url = new URL(href);
  url.pathname = new URL(canonical).pathname;
  return url.href;
};
