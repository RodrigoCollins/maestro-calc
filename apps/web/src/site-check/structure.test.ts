import { describe, expect, it } from 'vitest';
import { pagesOf } from './files.ts';
import { structureProblems } from './structure.ts';
import { FIXTURE_ROUTES, fixtureSite, validDist } from './__testing__/page-fixture.ts';

type Edits = Readonly<Record<string, (html: string) => string>>;

/** Structure problems of a valid dist after `edits` changed pages, favicon or other files. */
const problemsAfter = (edits: Edits = {}) => {
  const site = fixtureSite();
  const dist = validDist(site);
  for (const [file, edit] of Object.entries(edits)) dist.set(file, edit(dist.get(file) ?? ''));
  return structureProblems(pagesOf(dist, FIXTURE_ROUTES), site, dist);
};

const rulesOf = (edits: Edits, file: string): string[] =>
  problemsAfter(edits)
    .filter((entry) => entry.file === file)
    .map((entry) => entry.rule);

describe('structure rules over a valid dist', () => {
  it('finds nothing wrong with ten valid pages', () => {
    expect(problemsAfter()).toEqual([]);
  });
});

describe('landmarks (site-shell › [SS1])', () => {
  it.each([
    ['header', (h: string) => h.replace(/<header>.*<\/header>/, '')],
    ['a second header', (h: string) => h.replace('<main', '<header></header><main')],
    ['footer', (h: string) => h.replace(/<footer>.*<\/footer>/, '')],
    ['a second footer', (h: string) => h.replace('</body>', '<footer></footer></body>')],
    ['main#main', (h: string) => h.replace('<main id="main">', '<main>')],
    ['a nav label', (h: string) => h.replace(' aria-label="Main navigation"', '')],
    ['a nav label text', (h: string) => h.replace('aria-label="Main navigation"', 'aria-label=""')],
    ['a second nav', (h: string) => h.replace('<main', '<nav aria-label="More"></nav><main')],
    ['a second nav without a label', (h: string) => h.replace('<main', '<nav></nav><main')],
    [
      'a second labelled nav of the same label',
      (h: string) => h.replace('<main', '<nav aria-label="Main navigation"></nav><main'),
    ],
    ['a second main#main', (h: string) => h.replace('</main>', '</main><main id="main"></main>')],
  ])('fails a page without %s', (_name, edit) => {
    expect(rulesOf({ 'about.html': edit }, 'about.html')).toContain('landmarks');
  });
});

describe('headings (site-shell › [SS1], site-seo › [SE4], [SE5])', () => {
  it('fails a second h1 and names the page', () => {
    expect(
      problemsAfter({ 'about.html': (h) => h.replace('</main>', '<h1>Again</h1></main>') }),
    ).toEqual([{ file: 'about.html', rule: 'h1', message: 'expected exactly one h1, found 2' }]);
  });

  it('fails an empty h1 and an h1 outside main', () => {
    expect(
      rulesOf({ 'about.html': (h) => h.replace(/<h1>.*<\/h1>/, '<h1> </h1>') }, 'about.html'),
    ).toEqual(['h1']);
    expect(
      rulesOf(
        {
          'about.html': (h) =>
            h.replace(/<main id="main"><h1>(.*)<\/h1>/, '<h1>$1</h1><main id="main">'),
        },
        'about.html',
      ),
    ).toEqual(['h1']);
  });

  it('fails a heading level that jumps by more than one', () => {
    expect(
      rulesOf({ 'about.html': (h) => h.replace('</h1>', '</h1><h3>Skipped</h3>') }, 'about.html'),
    ).toEqual(['heading-order']);
    expect(
      rulesOf(
        { 'about.html': (h) => h.replace('</h1>', '</h1><h2>A</h2><h4>Skipped</h4>') },
        'about.html',
      ),
    ).toEqual(['heading-order']);
  });

  it('accepts steps of one and any step back up', () => {
    expect(
      problemsAfter({
        'about.html': (h) => h.replace('</h1>', '</h1><h2>A</h2><h3>B</h3><h2>C</h2><h3>D</h3>'),
      }),
    ).toEqual([]);
  });
});

describe('skip link (site-shell › [SS3])', () => {
  it('requires the first focusable element to be the link to #main', () => {
    expect(
      rulesOf(
        {
          'about.html': (h) =>
            h.replace('<a class="skip-link"', '<a href="/">Home</a><a class="skip-link"'),
        },
        'about.html',
      ),
    ).toEqual(['skip-link']);
  });

  it.each([
    ['a button', '<button>x</button>'],
    ['an input', '<input>'],
    ['a select', '<select></select>'],
    ['a textarea', '<textarea></textarea>'],
    ['an element with a tabindex', '<div tabindex="0">x</div>'],
  ])('fails a page with %s before the skip link', (_name, markup) => {
    expect(
      rulesOf(
        { 'about.html': (h) => h.replace('<a class="skip-link"', `${markup}<a class="skip-link"`) },
        'about.html',
      ),
    ).toEqual(['skip-link']);
  });

  it('fails a page with nothing focusable at all', () => {
    expect(
      rulesOf({ 'about.html': (h) => h.replaceAll(/<a [^>]*>.*?<\/a>/g, '') }, 'about.html'),
    ).toContain('skip-link');
  });
});

describe('internal links (site-routing-i18n › [SR2])', () => {
  const withLink = (href: string) => (h: string) =>
    h.replace('</h1>', `</h1><a href="${href}">x</a>`);

  it.each([
    '/nope',
    'https://example.com/',
    '/privacy?x=1',
    '/about/',
    '',
    'mailto:other@maestrocalc.com',
  ])('fails the href "%s"', (href) => {
    expect(rulesOf({ 'about.html': withLink(href) }, 'about.html')).toEqual(['link']);
  });

  it.each([
    '/privacy',
    '/es/sobre-nosotros',
    '#main',
    '/favicon.svg',
    'mailto:contacto@maestrocalc.com',
  ])('accepts the href "%s"', (href) => {
    expect(problemsAfter({ 'about.html': withLink(href) })).toEqual([]);
  });

  it('resolves a fragment against the ids of the target page', () => {
    const edits = {
      'about.html': withLink('/privacy#terms'),
      'privacy.html': (h: string) => h.replace('</h1>', '</h1><h2 id="terms">T</h2>'),
    };
    expect(problemsAfter(edits)).toEqual([]);
    expect(rulesOf({ 'about.html': withLink('/privacy#nothing') }, 'about.html')).toEqual([
      'fragment',
    ]);
    expect(rulesOf({ 'about.html': withLink('#nothing') }, 'about.html')).toEqual(['fragment']);
  });
});

describe('language switch (site-routing-i18n › [SR5], [SR6])', () => {
  it('points each page at its counterpart in the other locale', () => {
    expect(
      rulesOf(
        { 'about.html': (h) => h.replace('href="/es/sobre-nosotros" lang', 'href="/es" lang') },
        'about.html',
      ),
    ).toEqual(['switch']);
  });

  it('points a not-found page at the other home page', () => {
    expect(
      rulesOf(
        { '404.html': (h) => h.replace('href="/es" lang', 'href="/es/metodologia" lang') },
        '404.html',
      ),
    ).toEqual(['switch']);
  });

  it('fails a page without a language switch', () => {
    expect(
      rulesOf(
        { 'es.html': (h) => h.replace(/<a href="[^"]*" lang="en"[^>]*>Switch<\/a>/, '') },
        'es.html',
      ),
    ).toEqual(['switch']);
  });
});

describe('header and footer links (site-shell › [SS12], [SS13])', () => {
  it('requires the header links to equal those of the route table', () => {
    expect(
      rulesOf(
        { 'index.html': (h) => h.replace('<li><a href="/about">about</a></li>', '') },
        'index.html',
      ),
    ).toEqual(['nav-links']);
  });

  it('requires the footer links to equal those of the route table', () => {
    expect(
      rulesOf(
        { 'es.html': (h) => h.replace('<li><a href="/es/privacidad">privacy</a></li>', '') },
        'es.html',
      ),
    ).toEqual(['footer-links']);
    expect(
      rulesOf(
        {
          'es.html': (h) =>
            h.replace(
              '<li><a href="/es/privacidad">privacy</a></li>',
              '<li><a href="/privacy">p</a></li>',
            ),
        },
        'es.html',
      ),
    ).toEqual(['footer-links']);
  });
});

describe('favicon (site-shell › [SS17])', () => {
  it('requires the icon link in the head', () => {
    expect(
      rulesOf(
        {
          'about.html': (h) =>
            h.replace('<link rel="icon" type="image/svg+xml" href="/favicon.svg">', ''),
        },
        'about.html',
      ),
    ).toEqual(['icon']);
  });

  it.each([
    ['missing', undefined],
    ['not an SVG', 'PNG #0E2240'],
    ['without the palette', '<svg xmlns="http://www.w3.org/2000/svg"></svg>'],
    ['with a gradient', '<svg><linearGradient/><rect fill="#0E2240"/></svg>'],
  ])('fails a favicon that is %s', (_name, content) => {
    const site = fixtureSite();
    const dist = validDist(site);
    if (content === undefined) dist.delete('favicon.svg');
    else dist.set('favicon.svg', content);
    expect(
      structureProblems(pagesOf(dist, FIXTURE_ROUTES), site, dist).map((entry) => [
        entry.file,
        entry.rule,
      ]),
    ).toEqual([['favicon.svg', 'favicon']]);
  });

  it('accepts the orange mark alone, in lower case', () => {
    expect(problemsAfter({ 'favicon.svg': () => '<svg><rect fill="#f06a1d"/></svg>' })).toEqual([]);
  });
});
