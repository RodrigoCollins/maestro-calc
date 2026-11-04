/** An hreflang alternate of a page: `en-US`, `es` or `x-default` and its absolute URL. */
export interface Alternate {
  readonly hreflang: string;
  readonly href: string;
}

/** One `<url>` of a sitemap: its absolute `<loc>` and, on a site with locales, its alternates. */
export interface SitemapUrl {
  readonly loc: string;
  readonly alternates?: readonly Alternate[];
}

/**
 * How the XML is laid out. `lines`: one line per plain `<url>`, one per element of a `<url>` with
 * alternates. `compact`: everything on the `<urlset>` line. Both say the same to a crawler; the
 * layout only keeps each site's published bytes.
 */
export type SitemapLayout = 'lines' | 'compact';

/** The URLs of one page in every language: one per alternate but `x-default`, each with all of them. */
export const localizedUrls = (alternates: readonly Alternate[]): SitemapUrl[] =>
  alternates
    .filter(({ hreflang }) => hreflang !== 'x-default')
    .map(({ href }) => ({ loc: href, alternates }));

// `&` first, or the entities written by the later replacements would be escaped again.
const escapeXml = (text: string): string =>
  text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

const SITEMAP_NS = 'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"';
const XHTML_NS = 'xmlns:xhtml="http://www.w3.org/1999/xhtml"';

const childrenOf = ({ loc, alternates = [] }: SitemapUrl): string[] => [
  `<loc>${escapeXml(loc)}</loc>`,
  ...alternates.map(
    ({ hreflang, href }) =>
      `<xhtml:link rel="alternate" hreflang="${hreflang}" href="${escapeXml(href)}"/>`,
  ),
];

const lineOf = (url: SitemapUrl): string => {
  const children = childrenOf(url);
  return children.length === 1
    ? `  <url>${children.join('')}</url>`
    : ['  <url>', ...children.map((child) => `    ${child}`), '  </url>'].join('\n');
};

/** `sitemap.xml` of `urls`, in order; the xhtml namespace is declared only when a URL has alternates. */
export const sitemapXml = (urls: readonly SitemapUrl[], layout: SitemapLayout = 'lines'): string => {
  const localized = urls.some(({ alternates = [] }) => alternates.length > 0);
  const head = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<urlset ${localized ? `${SITEMAP_NS} ${XHTML_NS}` : SITEMAP_NS}>`,
  ];
  if (layout === 'compact')
    return `${head.join('\n')}${urls.map((url) => `<url>${childrenOf(url).join('')}</url>`).join('')}</urlset>\n`;
  return [...head, ...urls.map(lineOf), '</urlset>', ''].join('\n');
};
