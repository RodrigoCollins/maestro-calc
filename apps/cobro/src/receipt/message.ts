/*
 * The WhatsApp share link: plain words and an address, no script of WhatsApp's and no tracker.
 * The page scripts import this module only, so a calculator bundle carries these small functions
 * and no text of the site.
 */

/** A WhatsApp link that opens the chat picker with the message filled in. */
export const whatsappHref = (message: string): string =>
  `https://wa.me/?text=${encodeURIComponent(message)}`;

/** One line of a receipt as it is sent: what it is, its detail when it has one, and its amount. */
export interface MessageLine {
  readonly label: string;
  readonly detail: string;
  readonly amount: string;
}

/**
 * The itemized text of a quote: its title, one line per item (`Labor (8 h × $25.00/h): $200.00`),
 * the total, then the address of the page on a line of its own.
 */
export const quoteMessage = (
  title: string,
  lines: readonly MessageLine[],
  total: MessageLine,
  url: string,
): string => {
  const row = ({ label, detail, amount }: MessageLine): string =>
    `${label}${detail === '' ? '' : ` (${detail})`}: ${amount}`;
  return [title, ...lines.map(row), row(total), url].join('\n');
};

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
