import { describe, expect, it } from 'vitest';
import { auditSite, mainTextOf, reportText, urlOfFile } from './content-audit.ts';

/** A page of the fixture site: chrome around a main whose body is `body`. */
const page = (body: string, { lang = 'en', head = '' } = {}) => `<!DOCTYPE html>
<html lang="${lang}"><head><title>T</title>${head}</head><body>
<header><nav><a href="/guides">Guides</a> Main navigation words here</nav></header>
<main id="main">
<ol class="calc-breadcrumb" aria-label="Breadcrumb"><li><a href="/">Home</a></li></ol>
${body}
<form><label>Length of the slab in feet</label><input></form>
</main>
<footer><p>Footer words that every page carries and nobody counts</p><a href="/about">About</a></footer>
</body></html>`;

const SHARED = '<p>Every figure adds ten percent extra for waste and rounds up to whole bags.</p>';

const SITE = [
  {
    path: 'index.html',
    html: page(
      '<h1>Home</h1><p>Welcome to the calculators.</p><a href="/a">A</a><a href="/b">B</a>',
    ),
  },
  {
    path: 'a.html',
    html: page(
      `<h1>Slab ten by ten</h1>${SHARED}<p>A ten by ten slab is a shed base.</p><a href="/b">B</a>`,
    ),
  },
  {
    path: 'b.html',
    html: page(
      `<h1>Slab ten by twelve</h1>${SHARED}<p>A ten by twelve slab is a patio.</p><h2>Frequently asked questions</h2><h3>One?</h3><p>Yes.</p><h3>Two?</h3><p>No.</p><h2>Sources</h2><a href="https://www.nist.gov/sp811">NIST</a>`,
    ),
  },
  {
    path: 'c.html',
    html: page(`<h1>Slab twelve</h1>${SHARED}<h2>Worked example</h2><p>12 × 12 = 144.</p>`),
  },
  {
    path: 'embed/a.html',
    html: page(`<h1>Embed</h1>${SHARED}`, { head: '<meta name="robots" content="noindex">' }),
  },
  { path: 'es/index.html', html: page('<h1>Inicio</h1><p>Bienvenido.</p>', { lang: 'es-US' }) },
];

const SITEMAP = `<urlset><url><loc>https://example.com/</loc></url><url><loc>https://example.com/a</loc></url><url><loc>https://example.com/b</loc></url><url><loc>https://example.com/c</loc></url></urlset>`;

describe('urlOfFile', () => {
  it('maps a built file to the path it is served at', () => {
    expect(urlOfFile('index.html')).toBe('/');
    expect(urlOfFile('es/index.html')).toBe('/es');
    expect(urlOfFile('concrete/10x10-slab.html')).toBe('/concrete/10x10-slab');
    expect(urlOfFile('es.html')).toBe('/es');
  });
});

describe('mainTextOf', () => {
  it('reads the main content only: no navigation, breadcrumb, form or footer', () => {
    const text = mainTextOf(page('<h1>Slab</h1><p>Pour it in one go.</p>'));
    expect(text.words).toEqual(['slab', 'pour', 'it', 'in', 'one', 'go']);
    expect(text.lang).toBe('en');
    expect(text.noindex).toBe(false);
    expect(text.linksOut).toEqual([]);
  });

  it('reads the language, the robots meta and the internal links of the main content', () => {
    const text = mainTextOf(
      page('<p>Ver <a href="/es/a?x=1#y">a</a> y <a href="https://x.org">x</a>.</p>', {
        lang: 'es-US',
        head: '<meta name="robots" content="noindex, follow">',
      }),
    );
    expect(text.lang).toBe('es');
    expect(text.noindex).toBe(true);
    expect(text.linksOut).toEqual(['/es/a']);
    expect(text.externalLinks).toBe(1);
  });

  it('counts a byline that points at the sources, though it leaves its words out', () => {
    const text = mainTextOf(
      page('<p class="byline">By the team · <a href="/x#sources">Sources</a></p><p>Hi.</p>'),
    );
    expect(text.words).toEqual(['hi']);
    expect(text.linksSources).toBe(true);
    expect(text.linksOut).toEqual([]);
  });
});

describe('auditSite', () => {
  const report = auditSite(SITE, { sitemap: SITEMAP, thinBelow: 10, shingle: 4, duplicateAt: 0.2 });
  const row = (url: string) => report.pages.find((each) => each.url === url);

  it('counts the words, and the words no other page of the language shares', () => {
    expect(row('/a')?.words).toBe(28);
    // 4 + 14 + 9 + 1: the 14 words of the shared sentence are on three pages, template, not unique
    expect(row('/a')?.uniqueWords).toBeLessThan(row('/a')?.words ?? 0);
    expect(row('/a')?.templatePercent).toBeGreaterThan(30);
    expect(row('/')?.templatePercent).toBe(0);
  });

  it('flags the sitemap, the noindex pages, the FAQ, the sources and a worked example', () => {
    expect(row('/b')?.inSitemap).toBe(true);
    expect(row('/es')?.inSitemap).toBe(false);
    expect(row('/embed/a')?.noindex).toBe(true);
    expect(row('/b')?.faq).toBe(2);
    expect(row('/b')?.sources).toBe(true);
    expect(row('/a')?.sources).toBe(false);
    expect(row('/c')?.worked).toBe(true);
    expect(row('/a')?.worked).toBe(false);
  });

  it('counts the links into a page from the main content of the others', () => {
    expect(row('/b')?.linksIn).toBe(2);
    expect(row('/a')?.linksIn).toBe(1);
    expect(row('/a')?.linksOut).toBe(1);
  });

  it('ranks the indexable pages from thinnest to richest and leaves noindex pages out', () => {
    const indexable = report.pages.filter(({ noindex }) => !noindex);
    const unique = indexable.map(({ uniqueWords }) => uniqueWords);
    expect(unique).toEqual(unique.toSorted((x, y) => x - y));
    expect(report.indexable).toBe(5);
    expect(report.thin).toBe(indexable.filter(({ uniqueWords }) => uniqueWords < 10).length);
  });

  it('pairs near-duplicates within one language only, never a noindex page', () => {
    const urls = report.nearDuplicates.map(({ a, b }) => [a, b].toSorted().join(' '));
    expect(urls.length).toBeGreaterThan(0);
    for (const pair of urls) expect(pair).not.toContain('/embed');
    for (const { similarity } of report.nearDuplicates)
      expect(similarity).toBeGreaterThanOrEqual(0.2);
    const strict = auditSite(SITE, { sitemap: SITEMAP, shingle: 4, duplicateAt: 0.99 });
    expect(strict.nearDuplicates).toEqual([]);
  });

  it('prints a report with the totals, the thinnest pages and the pairs', () => {
    const text = reportText(report, 10);
    expect(text).toContain('indexable pages: 5');
    expect(text).toContain('/a');
    expect(text.split('\n').filter((line) => line.startsWith('  ')).length).toBeGreaterThan(3);
  });
});

describe('auditSite edge cases', () => {
  const raw = (main: string) => `<html><head></head><body>${main}</body></html>`;
  const files = [
    {
      path: 'index.html',
      html: raw(
        '<main><a name="top"></a><h2>Notes</h2><h3>One note</h3><p>See <a href="/">home</a> and <a href="/x?v=1">x</a>.</p></main>',
      ),
    },
    { path: 'x.html', html: raw('<main><p>Back <a href="/#top">home</a>.</p></main>') },
    { path: 'y.html', html: raw('<p>No main element at all.</p>') },
    { path: 'z.html', html: raw('<main></main>') },
  ];
  const sitemap =
    '<urlset><url><loc>https://e.com</loc></url><url><loc>https://e.com/x/</loc></url><url><loc>https://e.com/y</loc></url><url><loc>https://e.com/z</loc></url></urlset>';
  const report = auditSite(files, { sitemap });
  const row = (url: string) => report.pages.find((each) => each.url === url);

  it('reads a page with no language, no main element or an empty main', () => {
    expect(row('/')?.lang).toBe('');
    expect(row('/')?.faq).toBe(0);
    expect(row('/y')?.words).toBe(0);
    expect(row('/z')?.words).toBe(0);
    // too short for a shingle, three pages tie at 0 unique words and rank by path
    expect(report.pages.map(({ url }) => url).slice(0, 3)).toEqual(['/x', '/y', '/z']);
    expect(report.nearDuplicates).toEqual([]);
  });

  it('counts no link a page makes to itself, and reads the sitemap root without a slash', () => {
    expect(row('/')?.linksIn).toBe(1);
    expect(row('/x')?.linksIn).toBe(1);
    expect(report.pages.every(({ inSitemap }) => inSitemap)).toBe(true);
  });

  it('says none when every page is in the sitemap and linked, and audits with no sitemap', () => {
    const text = reportText(auditSite(files.slice(0, 2), { sitemap }));
    expect(text).toContain('missing from the sitemap: none');
    expect(text).toContain('no main content links to: none');
    expect(auditSite(files).pages.some(({ inSitemap }) => inSitemap)).toBe(false);
  });
});

describe('auditSite as the site will read once open', () => {
  // a closed site: every page carries noindex, and the sitemap lists the pages it will open
  const closed = '<meta name="robots" content="noindex, nofollow">';
  const files = [
    {
      path: 'index.html',
      html: page('<h1>Home</h1><p>See <a href="/a">a</a>.</p>', { head: closed }),
    },
    { path: 'a.html', html: page(`<h1>A</h1>${SHARED}<p>The a page.</p>`, { head: closed }) },
    { path: 'embed/a.html', html: page(`<h1>Embed</h1>${SHARED}`, { head: closed }) },
  ];
  const sitemap =
    '<urlset><url><loc>https://e.com/</loc></url><url><loc>https://e.com/a</loc></url></urlset>';

  it('keeps the robots meta by default, so a closed site has no indexable page', () => {
    expect(auditSite(files, { sitemap }).indexable).toBe(0);
  });

  it('reads every page of the sitemap as indexable and keeps the flag of the rest', () => {
    const report = auditSite(files, { sitemap, asOpen: true });
    expect(report.indexable).toBe(2);
    const row = (url: string) => report.pages.find((each) => each.url === url);
    expect(row('/a')?.noindex).toBe(false);
    expect(row('/a')?.uniqueWords).toBeGreaterThan(0);
    expect(row('/embed/a')?.noindex).toBe(true);
  });

  it('opens nothing without a sitemap', () => {
    expect(auditSite(files, { asOpen: true }).indexable).toBe(0);
  });
});
