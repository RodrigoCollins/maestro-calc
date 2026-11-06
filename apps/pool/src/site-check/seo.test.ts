import { describe, expect, it } from 'vitest';
import { langOf, type Route } from '../routes.ts';
import { alternatesOf } from '../seo/head.ts';
import { sitemapXml } from '../seo/sitemap.ts';
import { headTextOf, pairProblems, seoAuditProblems, type SeoAuditRules } from './seo.ts';

const ORIGIN = 'https://poolfigures.com';

const crumbs = (...paths: string[]) => ({
  '@type': 'BreadcrumbList',
  itemListElement: paths.map((path, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: `step ${String(index + 1)}`,
    item: `${ORIGIN}${path}`,
  })),
});

const page = (
  path: string,
  title: string,
  description: string,
  extra: { readonly robots?: string; readonly canonical?: string; readonly ld?: unknown } = {},
): string =>
  [
    '<html><head>',
    extra.robots === undefined ? '' : `<meta name="robots" content="${extra.robots}">`,
    `<link rel="canonical" href="${extra.canonical ?? `${ORIGIN}${path}`}">`,
    `<title>${title}</title>`,
    `<meta name="description" content="${description}">`,
    `<script type="application/ld+json">${JSON.stringify(extra.ld ?? { '@type': 'Article' })}</script>`,
    '</head><body></body></html>',
  ].join('');

const LONG = 'A description long enough to tell a reader and a search engine what this page holds.';

const SITE: ReadonlyMap<string, string> = new Map([
  ['/', page('/', 'Pool Figures: Pool Calculators', LONG)],
  ['/calc', page('/calc', 'Pool Salt Calculator | Pool Figures', `${LONG} Salt.`)],
  [
    '/salt-5000',
    page(
      '/salt-5000',
      'How Much Salt for a 5,000 Gallon Pool? | Pool Figures',
      `The pounds of salt a 5,000 gallon pool needs, ${LONG.toLowerCase()}`,
      { ld: { '@graph': [{ '@type': 'Article' }, crumbs('/', '/calc', '/salt-5000')] } },
    ),
  ],
  ['/404', page('/404', 'Not found | Pool Figures', 'Nothing here.', { robots: 'noindex' })],
]);

const RULES: SeoAuditRules = {
  origin: ORIGIN,
  sitemap: ['/', '/calc', '/salt-5000'],
  jobs: [{ path: '/salt-5000', calculator: '/calc' }],
  robots: `User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap.xml\n`,
};

const audit = (
  changes: Readonly<Record<string, string>> = {},
  rules: Partial<SeoAuditRules> = {},
): string[] =>
  seoAuditProblems(new Map([...SITE, ...Object.entries(changes)]), { ...RULES, ...rules });

describe('headTextOf', () => {
  it('reads the title, description, canonical, robots and JSON-LD, with the entities decoded', () => {
    const html = page('/x', 'Pool &amp; Spa &#39;Figures&#39;', 'A &quot;b&quot; &lt;c&gt;', {
      robots: 'noindex',
    });
    expect(headTextOf(html)).toEqual({
      title: "Pool & Spa 'Figures'",
      description: 'A "b" <c>',
      canonical: `${ORIGIN}/x`,
      robots: 'noindex',
      jsonLd: [{ '@type': 'Article' }],
    });
  });

  it('gives an empty text for a missing tag and no document for a block that is not JSON', () => {
    expect(headTextOf('<script type="application/ld+json">{</script><title></title>')).toEqual({
      title: '',
      description: '',
      jsonLd: [],
    });
  });
});

describe('seoAuditProblems', () => {
  it('finds nothing on a site whose pages are unique, measured, listed and placed', () => {
    expect(audit()).toEqual([]);
  });

  it('needs every title and every description of an indexable page to be its own', () => {
    expect(audit({ '/calc': page('/calc', 'Pool Figures: Pool Calculators', LONG) })).toEqual([
      '/calc: the title "Pool Figures: Pool Calculators" is also the title of /',
      `/calc: the description is also the description of /`,
    ]);
  });

  it('ignores a page that is never indexed, which may share its text', () => {
    expect(
      audit({
        '/embed/calc': page('/embed/calc', 'Pool Salt Calculator | Pool Figures', `${LONG} Salt.`, {
          robots: 'noindex',
          canonical: `${ORIGIN}/calc`,
        }),
      }),
    ).toEqual([]);
  });

  it('holds a title to 65 characters and a description to 50 through 160', () => {
    const title = `${'T'.repeat(51)} | Pool Figures`;
    expect(audit({ '/calc': page('/calc', title, 'Too short.') })).toEqual([
      `/calc: the title has 66 characters, more than 65`,
      `/calc: the description has 10 characters, outside 50 to 160`,
    ]);
    expect(audit({ '/calc': page('/calc', 'Calc', 'd'.repeat(161)) })).toEqual([
      '/calc: the description has 161 characters, outside 50 to 160',
    ]);
  });

  it('needs an indexable page canonical at its own address', () => {
    expect(
      audit({ '/calc': page('/calc', 'Calc', `${LONG} Salt.`, { canonical: `${ORIGIN}/` }) }),
    ).toEqual([`/calc: the canonical must be "${ORIGIN}/calc", found "${ORIGIN}/"`]);
  });

  it('needs the sitemap to list every indexable page and nothing else', () => {
    expect(audit({}, { sitemap: ['/', '/calc', '/404'] })).toEqual([
      '/salt-5000: an indexable page the sitemap does not list',
      '/404: in the sitemap, but the page is not indexable',
    ]);
    expect(audit({}, { sitemap: [...RULES.sitemap, '/gone'] })).toEqual([
      '/gone: in the sitemap, but the build does not hold it',
    ]);
  });

  it('needs the number of a job page in its title, and every number of its title in its description', () => {
    const ld = { '@graph': [{ '@type': 'Article' }, crumbs('/', '/calc', '/salt-5000')] };
    expect(
      audit({
        '/salt-5000': page('/salt-5000', 'How Much Salt for a 5,000 Gallon Pool?', `${LONG} 50.`, {
          ld,
        }),
      }),
    ).toEqual(['/salt-5000: the description must hold "5,000" of its title']);
    expect(
      audit({
        '/salt-5000': page('/salt-5000', 'How Much Salt for a Pool?', `${LONG} Salt 2.`, { ld }),
      }),
    ).toEqual(['/salt-5000: the title of a job page must hold its size or number']);
    // "12x24" in a title and "12 x 24" in its description are the same size
    expect(
      audit({
        '/salt-5000': page('/salt-5000', 'Gallons in a 12x24 Pool?', `${LONG} A 12 x 24 pool.`, {
          ld,
        }),
      }),
    ).toEqual([]);
  });

  it('needs a job page to carry the BreadcrumbList home, its calculator, itself', () => {
    const title = 'How Much Salt for a 5,000 Gallon Pool? | Pool Figures';
    const description = `The pounds of salt a 5,000 gallon pool needs, ${LONG.toLowerCase()}`;
    const job = (ld: unknown) => ({ '/salt-5000': page('/salt-5000', title, description, { ld }) });
    expect(audit(job({ '@type': 'Article' }))).toEqual([
      `/salt-5000: the BreadcrumbList must lead to ${ORIGIN}/ > ${ORIGIN}/calc > ${ORIGIN}/salt-5000, found none`,
    ]);
    expect(audit(job({ '@graph': [crumbs('/', '/salt-5000')] }))).toEqual([
      `/salt-5000: the BreadcrumbList must lead to ${ORIGIN}/ > ${ORIGIN}/calc > ${ORIGIN}/salt-5000, found ${ORIGIN}/ > ${ORIGIN}/salt-5000`,
    ]);
  });

  it('names a job page the build does not hold', () => {
    expect(audit({}, { jobs: [{ path: '/gone', calculator: '/calc' }] })).toEqual([
      '/gone: a job page the build does not hold',
    ]);
  });

  it('needs robots.txt to allow the site and name the sitemap', () => {
    expect(audit({}, { robots: undefined })).toEqual(['robots.txt: not in the build']);
    expect(audit({}, { robots: 'User-agent: *\nDisallow: /\n' })).toEqual([
      'robots.txt: "Disallow: /" keeps search engines out',
      `robots.txt: must name the sitemap ${ORIGIN}/sitemap.xml`,
    ]);
  });
});

describe('pairProblems', () => {
  const routes: readonly Route[] = [
    { id: 'home', kind: 'home', en: '/', es: '/es' },
    { id: 'charts', kind: 'article', en: '/charts' },
  ];
  /** A built page as the layout writes it: its language, its canonical and its alternates. */
  const built = (path: string, title: string): string =>
    [
      `<html lang="${langOf(path)}"><head><title>${title}</title>`,
      `<meta name="description" content="${title}, a description long enough for a result.">`,
      `<link rel="canonical" href="${ORIGIN}${path}">`,
      ...alternatesOf(path, ORIGIN, routes).map(
        ({ hreflang, href }) => `<link rel="alternate" hreflang="${hreflang}" href="${href}">`,
      ),
      '</head></html>',
    ].join('');
  const home = built('/', 'Pool Figures home');
  const spanish = built('/es', 'Pool Figures en español');
  const charts = built('/charts', 'Pool data and charts');
  const sitemap = sitemapXml(routes, ORIGIN);
  const check = (pages: Record<string, string>): string[] =>
    pairProblems(new Map(Object.entries(pages)), sitemap);

  // the rollout: a page with a twin carries the full pair, one without carries none
  it('accepts the pairs that exist beside the pages that have no twin yet', () => {
    expect(check({ 'index.html': home, 'es.html': spanish, 'charts.html': charts })).toEqual([]);
  });

  it('refuses an alternate to a Spanish page the build does not hold', () => {
    expect(check({ 'index.html': home, 'charts.html': charts })).toEqual(
      expect.arrayContaining([
        `index.html: its es-US alternate "${ORIGIN}/es" is not an indexable page of the build`,
      ]),
    );
  });

  it('refuses a page in a language the site does not publish', () => {
    const french = charts.replace('lang="en"', 'lang="fr"');
    expect(check({ 'index.html': home, 'es.html': spanish, 'charts.html': french })).toEqual([
      'charts.html: <html lang> is "fr", none of en-US, es-US',
    ]);
  });
});
