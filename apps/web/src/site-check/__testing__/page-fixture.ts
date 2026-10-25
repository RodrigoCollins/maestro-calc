import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
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
import type { BuildBytes, Dist, Site } from '../types.ts';

/** The `updated` date every fixture entry carries. */
export const UPDATED = '2026-10-23';

/** A table with several pages, so link, fragment and reciprocity rules have something to check. */
export const FIXTURE_ROUTES = {
  home: { en: '/', es: '/es' },
  methodology: { en: '/methodology', es: '/es/metodologia' },
  about: { en: '/about', es: '/es/sobre-nosotros' },
  privacy: { en: '/privacy', es: '/es/privacidad' },
} as const satisfies RouteTable;

/** The fixture table plus a calculator page, so the template rules have a page to check. */
export const CALC_ROUTES = {
  ...FIXTURE_ROUTES,
  concrete: { en: '/concrete-calculator', es: '/es/calculadora-de-concreto' },
} as const satisfies RouteTable;

/** The outbound links a calculator page may carry: the sources of its entry. */
export const QUIKRETE_URL = 'https://www.quikrete.com/PDFs/DATA_SHEET-Concrete%20Mix%201101.pdf';
export const NIST_URL = 'https://www.nist.gov/pml/special-publication-811';

/** The entry and the chunk that every valid calculator fixture loads (language-free, no network). */
export const ENTRY_FILE = '_astro/concrete.js';
export const CHUNK_FILE = '_astro/chunks/rational.js';

const titleOf = (id: string, locale: Locale): string =>
  id === 'home' ? `Maestro Calc: ${locale} home` : `${id} ${locale} | Maestro Calc`;

const descriptionOf = (id: string, locale: Locale): string =>
  `Description of the ${id} page in ${locale}, written long enough to sit between seventy and one hundred sixty characters.`;

/** A site whose catalogs hold a generated title and description per page id and locale. */
export const fixtureSite = (routes: RouteTable = FIXTURE_ROUTES): Site => {
  const catalogOf = (locale: Locale): Record<string, string> => ({
    'site.switch.label': locale === 'en' ? 'Español' : 'English',
    'errors.DECIMAL_COMMA':
      locale === 'en' ? 'Use a period for decimals' : 'Usa punto para los decimales',
    'site.calculator.copyLink': locale === 'en' ? 'Copy link' : 'Copiar enlace',
    ...Object.fromEntries(
      [...Object.keys(routes), NOT_FOUND_ID].flatMap((id) => [
        [`page.${id}.title`, titleOf(id, locale)],
        [`page.${id}.description`, descriptionOf(id, locale)],
      ]),
    ),
  });
  const updates = Object.fromEntries(
    Object.keys(routes)
      .filter((id) => id !== 'home')
      .flatMap((id) => LOCALES.map((locale) => [`${locale}/${id}`, UPDATED])),
  );
  return {
    routes,
    config: SITE,
    catalogs: { en: catalogOf('en'), es: catalogOf('es') },
    updates,
  };
};

/** A site whose table has a calculator page `concrete`, listed in `calculatorPages`. */
export const calculatorSite = (): Site => ({
  ...fixtureSite(CALC_ROUTES),
  calculatorPages: ['concrete'],
  externalLinks: { concrete: [QUIKRETE_URL, NIST_URL] },
});

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

/** The visible update date of a trust page (the home and not-found pages have none). */
const updatedLine = (id: string, locale: Locale, site: Site): string => {
  const updated = site.updates[`${locale}/${id}`];
  return updated === undefined ? '' : `<p><time datetime="${updated}">${updated}</time></p>`;
};

/** Four FAQ items, one per question, as the entry body would hold them. */
export const faqOf = (locale: Locale): { question: string; answer: string }[] =>
  [1, 2, 3, 4].map((n) => ({
    question: `Question ${String(n)} in ${locale}?`,
    answer: `Answer ${String(n)} in ${locale}.`,
  }));

const FAQ_ID = { en: 'faq', es: 'preguntas-frecuentes' } as const;

/** The body of a valid calculator page: breadcrumb, h1, result, five sections, sources and date. */
const calculatorMain = (id: string, locale: Locale, site: Site): string => {
  const home = pathOf('home', locale, site.routes);
  const faq = faqOf(locale)
    .map(({ question, answer }) => `<h3>${question}</h3><p>${answer}</p>`)
    .join('');
  const updated = site.updates[`${locale}/${id}`] ?? UPDATED;
  return [
    '<main id="main">',
    `<ol aria-label="Breadcrumb"><li><a href="${home}">Home</a></li><li>${headingOf(id)}</li></ol>`,
    `<h1>${headingOf(id)}</h1>`,
    '<h2>Result</h2>',
    '<h2 id="how-to-use">How to use</h2><p>Text.</p>',
    '<h2 id="formulas">Formulas</h2><p>Text.</p>',
    '<h2 id="tips">Tips</h2><p>Text.</p>',
    `<h2 id="${FAQ_ID[locale]}">FAQ</h2>${faq}`,
    '<h2 id="sources">Sources</h2>',
    `<ul><li><a href="${QUIKRETE_URL}">QUIKRETE</a></li><li><a href="${NIST_URL}">NIST</a></li></ul>`,
    `<p><time datetime="${updated}">${updated}</time></p>`,
    '</main>',
  ].join('');
};

/** The three JSON-LD nodes of a valid calculator page. */
export const calculatorJsonLd = (id: string, locale: Locale, site: Site) => {
  const canonical = urlOf(pathOf(id, locale, site.routes));
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: headingOf(id),
        url: canonical,
        inLanguage: LOCALE_TAGS[locale],
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any',
        isAccessibleForFree: true,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: locale === 'en' ? 'Home' : 'Inicio',
            item: urlOf(pathOf('home', locale, site.routes)),
          },
          { '@type': 'ListItem', position: 2, name: headingOf(id), item: canonical },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqOf(locale).map(({ question, answer }) => ({
          '@type': 'Question',
          name: question,
          acceptedAnswer: { '@type': 'Answer', text: answer },
        })),
      },
    ],
  };
};

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
  const calculator = site.calculatorPages?.includes(id) === true;
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
    calculator
      ? `<script type="application/ld+json">${serializeJsonLd(calculatorJsonLd(id, locale, site))}</script>` +
        `<script type="module" src="/${ENTRY_FILE}"></script>`
      : '',
    `<style>${VALID_CSS}</style>`,
    '</head><body>',
    '<a class="skip-link" href="#main">Skip to main content</a>',
    `<header><a href="${pathOf('home', locale, routes)}">Maestro Calc</a>`,
    `<nav aria-label="${NAV_LABEL}">${headerLinks === '' ? '' : `<ul>${headerLinks}</ul>`}`,
    `<a href="${language.href}" lang="${language.lang}" hreflang="${language.hreflang}">${catalog['site.switch.label'] ?? ''}</a></nav></header>`,
    calculator
      ? calculatorMain(id, locale, site)
      : `<main id="main"><h1>${headingOf(id)}</h1>${updatedLine(id, locale, site)}</main>`,
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
  if ((site.calculatorPages ?? []).length > 0) {
    dist.set(ENTRY_FILE, 'import"./chunks/rational.js";const a=1;export{a};');
    dist.set(CHUNK_FILE, 'export const r=1;');
  }
  dist.set('favicon.svg', FAVICON);
  dist.set('robots.txt', ROBOTS);
  dist.set('sitemap.xml', sitemapXml(site.routes));
  for (const name of ['a', 'b', 'c', 'd']) dist.set(`_astro/fonts/${name}.woff2`, '');
  return dist satisfies Dist;
};

/** The real latin subset of Barlow 400, a font that holds every Spanish code point. */
export const latinFont = (): Uint8Array =>
  readFileSync(
    // five levels up from this directory is the repository root
    resolve(
      import.meta.dirname,
      '../../../../../node_modules/@fontsource/barlow/files/barlow-latin-400-normal.woff2',
    ),
  );

/** The sizes and fonts of a valid dist: text files by length; each font holds the real latin glyphs but is sized as a stubbed 20,000 B. */
export const validBuildBytes = (dist: Dist = validDist()): BuildBytes => {
  const fonts = new Map(
    [...dist.keys()].filter((file) => file.endsWith('.woff2')).map((file) => [file, latinFont()]),
  );
  const sizes = new Map(
    [...dist].map(([file, text]) => [
      file,
      fonts.has(file) ? 20_000 : new TextEncoder().encode(text).length,
    ]),
  );
  return { sizes, fonts };
};
