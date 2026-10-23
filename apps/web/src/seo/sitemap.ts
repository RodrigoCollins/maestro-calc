import type { Locale } from '@maestro-calc/i18n';
import { alternatesOf, LOCALES, pathOf, ROUTES, urlOf } from '../routing/routes.ts';
import type { RouteTable } from '../routing/routes.ts';

// `&` first, or the entities written by the later replacements would be escaped again.
const escapeXml = (text: string): string =>
  text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

const blockOf = (id: string, locale: Locale, table: RouteTable): string =>
  `<url><loc>${escapeXml(urlOf(pathOf(id, locale, table)))}</loc>` +
  alternatesOf(id, table)
    .map(
      ({ hreflang, href }) =>
        `<xhtml:link rel="alternate" hreflang="${hreflang}" href="${escapeXml(href)}"/>`,
    )
    .join('') +
  '</url>';

/** `sitemap.xml`: every routable page in both locales, each with its alternates (never a 404). */
export const sitemapXml = (table: RouteTable = ROUTES): string =>
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ' +
  'xmlns:xhtml="http://www.w3.org/1999/xhtml">' +
  Object.keys(table)
    .flatMap((id) => LOCALES.map((locale) => blockOf(id, locale, table)))
    .join('') +
  '</urlset>\n';
