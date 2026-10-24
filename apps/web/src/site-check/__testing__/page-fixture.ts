import type { Locale } from '@maestro-calc/i18n';
import { FOOTER_PAGES, HEADER_PAGES, linksFor } from '../../routing/links.ts';
import {
  alternatesOf,
  LOCALE_TAGS,
  LOCALES,
  NOT_FOUND_ID,
  notFoundPathOf,
  pathOf,
  urlOf,
} from '../../routing/routes.ts';
import type { RouteTable } from '../../routing/routes.ts';
import { sitemapXml } from '../../seo/sitemap.ts';
import { homeJsonLd, serializeJsonLd } from '../../seo/json-ld.ts';
import { switchFor } from '../../routing/switch.ts';
import { SITE } from '../../site.config.ts';
import { fileOf } from '../files.ts';
import type { Dist, Site } from '../types.ts';

/** A table with several pages, so link, fragment and reciprocity rules have something to check. */
export const FIXTURE_ROUTES = {
  home: { en: '/', es: '/es' },
  methodology: { en: '/methodology', es: '/es/metodologia' },
  about: { en: '/about', es: '/es/sobre-nosotros' },
  privacy: { en: '/privacy', es: '/es/privacidad' },
} as const satisfies RouteTable;

const titleOf = (id: string, locale: Locale): string =>
  id === 'home' ? `Maestro Calc: ${locale} home` : `${id} ${locale} | Maestro Calc`;

const descriptionOf = (id: string, locale: Locale): string =>
  `Description of the ${id} page in ${locale}, written long enough to sit between seventy and one hundred sixty characters.`;

/** A site whose catalogs hold a generated title and description per page id and locale. */
export const fixtureSite = (routes: RouteTable = FIXTURE_ROUTES): Site => {
  const catalogOf = (locale: Locale): Record<string, string> =>
    Object.fromEntries(
      [...Object.keys(routes), NOT_FOUND_ID].flatMap((id) => [
        [`page.${id}.title`, titleOf(id, locale)],
        [`page.${id}.description`, descriptionOf(id, locale)],
      ]),
    );
  return { routes, config: SITE, catalogs: { en: catalogOf('en'), es: catalogOf('es') } };
};

/** The CSS of a valid page: the palette, a light scheme and four swapped same-origin fonts. */
export const VALID_CSS =
  ':root{color-scheme:light;--a:#0e2240;--b:#1d4ed8;--c:#f06a1d;--d:#56616b;--e:#eef1ef;--f:#fff;--g:#1faf5a}' +
  ['a', 'b', 'c', 'd']
    .map(
      (name) =>
        `@font-face{font-family:F${name};src:url("/_astro/fonts/${name}.woff2") format("woff2");font-display:swap}`,
    )
    .join('');

const NAV_LABEL = 'Main navigation';

/** The text each page shows as its h1; the check only needs it to be non-empty. */
const headingOf = (id: string): string => `Heading of ${id}`;

/** One valid built page for `id` in `locale`, shaped like the Astro output. */
export const validPage = (id: string, locale: Locale, site: Site = fixtureSite()): string => {
  const { routes } = site;
  const routable = id !== NOT_FOUND_ID;
  const alternates = routable ? alternatesOf(id, routes) : [];
  const language = switchFor(id, locale, routes);
  const links = (candidates: readonly string[]): string =>
    linksFor(candidates, locale, routes)
      .map(({ id: target, href }) => `<li><a href="${href}">${target}</a></li>`)
      .join('');
  const headerLinks = links(HEADER_PAGES);
  const footerLinks = links(FOOTER_PAGES);
  const catalog = site.catalogs[locale];
  return [
    `<!DOCTYPE html><html lang="${LOCALE_TAGS[locale]}"><head>`,
    '<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${catalog[`page.${id}.title`] ?? ''}</title>`,
    `<meta name="description" content="${catalog[`page.${id}.description`] ?? ''}">`,
    routable ? `<link rel="canonical" href="${urlOf(pathOf(id, locale, routes))}">` : '',
    ...alternates.map(
      ({ hreflang, href }) => `<link rel="alternate" hreflang="${hreflang}" href="${href}">`,
    ),
    routable ? '' : '<meta name="robots" content="noindex">',
    '<link rel="icon" type="image/svg+xml" href="/favicon.svg">',
    id === 'home'
      ? `<script type="application/ld+json">${serializeJsonLd(homeJsonLd(locale))}</script>`
      : '',
    `<style>${VALID_CSS}</style>`,
    '</head><body>',
    '<a class="skip-link" href="#main">Skip to main content</a>',
    `<header><a href="${pathOf('home', locale, routes)}">Maestro Calc</a>`,
    `<nav aria-label="${NAV_LABEL}">${headerLinks === '' ? '' : `<ul>${headerLinks}</ul>`}`,
    `<a href="${language.href}" lang="${language.lang}" hreflang="${language.hreflang}">Switch</a></nav></header>`,
    `<main id="main"><h1>${headingOf(id)}</h1></main>`,
    `<footer><p>Contact us at <a href="mailto:${SITE.contactEmail}">${SITE.contactEmail}</a></p>`,
    footerLinks === '' ? '' : `<ul>${footerLinks}</ul>`,
    '</footer></body></html>',
  ].join('');
};

const FAVICON =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#0E2240"/></svg>';

const ROBOTS = 'User-agent: *\nAllow: /\nSitemap: https://maestrocalc.com/sitemap.xml\n';

/** A complete valid `dist` for the site: every page, the favicon, robots, sitemap and four fonts. */
export const validDist = (site: Site = fixtureSite()): Map<string, string> => {
  const dist = new Map<string, string>();
  for (const id of Object.keys(site.routes)) {
    for (const locale of LOCALES) {
      dist.set(fileOf(pathOf(id, locale, site.routes)), validPage(id, locale, site));
    }
  }
  for (const locale of LOCALES) {
    dist.set(fileOf(notFoundPathOf(locale)), validPage(NOT_FOUND_ID, locale, site));
  }
  dist.set('favicon.svg', FAVICON);
  dist.set('robots.txt', ROBOTS);
  dist.set('sitemap.xml', sitemapXml(site.routes));
  for (const name of ['a', 'b', 'c', 'd']) dist.set(`_astro/fonts/${name}.woff2`, '');
  return dist satisfies Dist;
};
