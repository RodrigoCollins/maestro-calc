import { canonicalUrl } from '@maestro-calc/site-kit/canonical';
import { describe, expect, it } from 'vitest';
import type { PairedRoute, Route } from '../routes.ts';
import { jsonLdOf } from '../seo/json-ld.ts';
import { sitemapXml } from '../seo/sitemap.ts';
import { longTailTextProblems, numbersOf, siteSeoProblems } from './seo.ts';

describe('numbersOf', () => {
  it('reads the whole numbers of a text, a thousands comma kept inside its number', () => {
    expect(numbersOf('$100,000 a year is $48.08 an hour, 8:30 am')).toEqual(
      new Set(['100000', '48', '08', '8', '30']),
    );
  });
});

const ORIGIN = 'https://x.test';
const HOME = { id: 'home', kind: 'home', en: '/', es: '/es' } as const;
const TAIL = {
  id: 'pay-15',
  kind: 'article',
  en: '/pay/15-an-hour-is-how-much-a-year',
  es: '/es/pago/15-la-hora-cuanto-es-al-ano',
} as const;

/** A built page the way the layout writes its head. */
const built = (
  route: PairedRoute,
  lang: 'en' | 'es',
  title: string,
  description: string,
): string => {
  const url = (path: string): string => canonicalUrl(path, ORIGIN);
  const text = { title, description };
  const parent = route.kind === 'home' ? undefined : { title: 'Calc | Cuenta Horas', path: '/c' };
  return [
    `<!doctype html><html lang="${lang}"><head><title>${title}</title>`,
    `<meta name="description" content="${description}">`,
    '<meta property="og:type" content="website">',
    `<meta property="og:title" content="${title}">`,
    `<meta property="og:description" content="${description}">`,
    `<meta property="og:url" content="${url(route[lang])}">`,
    `<meta property="og:image" content="${ORIGIN}/og.png">`,
    '<meta name="twitter:card" content="summary_large_image">',
    `<script type="application/ld+json">${jsonLdOf(route, lang, text, ORIGIN, parent)}</script>`,
    `<link rel="canonical" href="${url(route[lang])}">`,
    `<link rel="alternate" hreflang="en-US" href="${url(route.en)}">`,
    `<link rel="alternate" hreflang="es-US" href="${url(route.es)}">`,
    `<link rel="alternate" hreflang="x-default" href="${url(route.en)}">`,
    '</head><body></body></html>',
  ].join('');
};

const LEAD = 'At 40 hours a week and 52 paid weeks, the rate comes to a yearly pay before taxes.';
const PAGES = new Map([
  ['index.html', built(HOME, 'en', 'Cuenta Horas: pay calculators', `Home. ${LEAD}`)],
  ['es.html', built(HOME, 'es', 'Cuenta Horas: calculadoras', `Inicio. ${LEAD}`)],
  ['pay/15.html', built(TAIL, 'en', '$15 an hour is how much a year? $31,200', `$15: ${LEAD}`)],
  ['es/pago/15.html', built(TAIL, 'es', '¿$15 la hora cuánto es al año? $31,200', `$15 ${LEAD}`)],
]);

describe('siteSeoProblems', () => {
  const rules = {
    origin: ORIGIN,
    routes: [HOME, TAIL],
    sitemap: sitemapXml([HOME, TAIL], ORIGIN),
    longTail: [TAIL.en, TAIL.es],
  };

  it('finds nothing in a site whose pages say what they are, once each', () => {
    expect(siteSeoProblems({ ...rules, pages: PAGES })).toEqual([]);
  });

  it('names what a page gets wrong: its preview, its alternates, its numbers', () => {
    const broken = new Map(PAGES);
    broken.set(
      'pay/15.html',
      (PAGES.get('pay/15.html') ?? '')
        .replace('content="$15: ', 'content="')
        .replace(/<meta property="og:image"[^>]*>/, ''),
    );
    const problems = siteSeoProblems({ ...rules, pages: broken });
    expect(problems).toContain('pay/15.html: og:image must be "https://x.test/og.png", found none');
    expect(problems).toContain(
      '/pay/15-an-hour-is-how-much-a-year: the description does not say 15',
    );
  });

  it('reads an English-only page, with no alternates and a plain sitemap line, as whole', () => {
    const single: Route = { id: 'military-time-1500', kind: 'article', en: '/military-time/1500' };
    const title = '1500 in military time is 3:00 PM | Cuenta Horas';
    const description = `1500 in military time is 3:00 PM. ${LEAD}`;
    const html = built({ ...single, es: '/es' }, 'en', title, description).replace(
      /<link rel="alternate"[^>]*>/g,
      '',
    );
    const pages = new Map([...PAGES, ['military-time/1500.html', html]]);
    expect(
      siteSeoProblems({
        ...rules,
        routes: [HOME, TAIL, single],
        pages,
        sitemap: sitemapXml([HOME, TAIL, single], ORIGIN),
        longTail: [...rules.longTail, single.en],
      }),
    ).toEqual([]);
  });

  it('needs the breadcrumb on every page but a home', () => {
    const bare = new Map(PAGES);
    bare.set(
      'es/pago/15.html',
      (PAGES.get('es/pago/15.html') ?? '').replace(
        /<script type="application\/ld\+json">.*?<\/script>/,
        `<script type="application/ld+json">{"@type":"Article","url":"${ORIGIN}${TAIL.es}"}</script>`,
      ),
    );
    expect(siteSeoProblems({ ...rules, pages: bare })).toEqual([
      'es/pago/15.html: the JSON-LD needs a BreadcrumbList',
    ]);
  });
});

describe('longTailTextProblems', () => {
  const page = {
    path: '/pay/15-an-hour-with-a-2-dollar-shift-differential',
    title: 'What is $15 an hour with a $2 shift differential? $17 | Cuenta Horas',
    description: '$15 an hour with a $2 shift differential pays $17 an hour on the shift.',
  };

  it('finds nothing when the title and the description carry every number of the address', () => {
    expect(longTailTextProblems([page])).toEqual([]);
  });

  it('names the numbers of the address a title or a description leaves out', () => {
    expect(
      longTailTextProblems([
        { ...page, title: 'Shift differential pay | Cuenta Horas', description: '$15 an hour.' },
      ]),
    ).toEqual([
      '/pay/15-an-hour-with-a-2-dollar-shift-differential: the title does not say 15, 2',
      '/pay/15-an-hour-with-a-2-dollar-shift-differential: the description does not say 2',
    ]);
  });
});
